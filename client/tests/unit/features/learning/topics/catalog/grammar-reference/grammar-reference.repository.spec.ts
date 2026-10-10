import { TestBed } from '@angular/core/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { GrammarReferenceRepository } from '@/features/learning/topics/catalog/grammar-reference/grammar-reference.repository';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';
import { JSON_RESOURCE_LOADER } from '@/shared/browser/json-resource.loader';
import {
  MemoryJsonResourceLoader,
  resourcesFor,
} from '@testing/helpers/unit/pack-content.resources';
import { loadContentSource } from '../../../../../../../tools/content-source-loader.mjs';

describe('GrammarReferenceRepository', () => {
  let packs: TopicPack[];

  beforeAll(async () => {
    packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
  });

  function setup(selectedPacks = packs) {
    const resources = resourcesFor(selectedPacks);
    const loader = new MemoryJsonResourceLoader(resources);
    TestBed.configureTestingModule({
      providers: [{ provide: JSON_RESOURCE_LOADER, useValue: loader }],
    });
    return { repository: TestBed.inject(GrammarReferenceRepository), loader, resources };
  }

  it('projects every pack’s existing Focused headings and all examples without scored-test requests', async () => {
    const { repository, loader } = setup();
    for (const pack of packs) {
      const reference = await repository.load(topicPackToSummary(pack));
      expect(reference).toEqual({
        id: pack.id,
        title: pack.title,
        lessons: pack.lessons.map((lesson) => ({
          id: lesson.id,
          title: pack.tests.find(
            (test) => test.stage === 'focused' && test.lessonIds.includes(lesson.id),
          )!.title,
          summary: lesson.summary,
          examples: lesson.examples.map(({ finnish, english }) => ({ finnish, english })),
        })),
      });
    }
    expect(loader.requestedPaths).toHaveLength(
      packs.reduce((sum, pack) => sum + 1 + pack.lessons.length, 0),
    );
    expect(loader.requestedPaths.some((path) => path.includes('/tests/'))).toBe(false);
  });

  it('rejects lessons without an associated Focused heading instead of inventing a title', async () => {
    const pack = structuredClone(packs[0]);
    pack.tests.forEach((test) => (test.stage = 'review'));
    const { repository } = setup([pack]);
    await expect(repository.load(topicPackToSummary(pack))).rejects.toThrow('Focused-test heading');
  });

  it('shares concurrent loads and caches successful projections', async () => {
    const { repository, loader } = setup();
    const summary = topicPackToSummary(packs[0]);
    const [first, second] = await Promise.all([repository.load(summary), repository.load(summary)]);
    expect(second).toBe(first);
    expect(await repository.load(summary)).toBe(first);
    expect(loader.requestedPaths).toHaveLength(1 + summary.lessons.length);
  });

  it('evicts the least recently used projection beyond two packs', async () => {
    const { repository, loader } = setup();
    const summaries = packs.slice(0, 3).map(topicPackToSummary);
    for (const index of [0, 1, 0, 2, 0, 1]) await repository.load(summaries[index]);
    const pathFor = (index: number) =>
      'content/' + packs[index].id + '/lessons/' + packs[index].lessons[0].id + '.json';
    expect(loader.requestedPaths.filter((path) => path === pathFor(0))).toHaveLength(1);
    expect(loader.requestedPaths.filter((path) => path === pathFor(1))).toHaveLength(2);
  });

  it.each(['id', 'version', 'examples'] as const)(
    'rejects invalid lesson %s and permits retry',
    async (field) => {
      const { repository, resources } = setup();
      const pack = packs[0],
        lesson = pack.lessons[0];
      const path = 'content/' + pack.id + '/lessons/' + lesson.id + '.json';
      resources.set(path, { ...lesson, [field]: field === 'examples' ? [] : 'wrong' });
      await expect(repository.load(topicPackToSummary(pack))).rejects.toThrow();
      resources.set(path, lesson);
      await expect(repository.load(topicPackToSummary(pack))).resolves.toBeDefined();
    },
  );

  it('rejects a stale manifest before requesting lessons', async () => {
    const { repository, loader, resources } = setup();
    const pack = packs[0],
      path = 'content/' + pack.id + '/pack.json';
    resources.set(path, { ...(resources.get(path) as object), version: 'stale' });
    await expect(repository.load(topicPackToSummary(pack))).rejects.toThrow('startup index');
    expect(loader.requestedPaths).toEqual([path]);
  });

  it('does not cache a failed resource load', async () => {
    const { repository, loader } = setup();
    const pack = packs[0],
      path = 'content/' + pack.id + '/lessons/' + pack.lessons[0].id + '.json';
    loader.failNext(path);
    await expect(repository.load(topicPackToSummary(pack))).rejects.toThrow();
    await expect(repository.load(topicPackToSummary(pack))).resolves.toBeDefined();
    expect(loader.requestedPaths.filter((requested) => requested === path)).toHaveLength(2);
  });
});

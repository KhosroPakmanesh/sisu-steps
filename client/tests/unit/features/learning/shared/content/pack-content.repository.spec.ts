import { TestBed } from '@angular/core/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/content.models';
import { PackContentRepository } from '@/features/learning/shared/content/pack-content.repository';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';
import { JSON_RESOURCE_LOADER } from '@/shared/browser/json-resource.loader';
import {
  MemoryJsonResourceLoader,
  resourcesFor,
} from '@testing/helpers/unit/pack-content.resources';
import { loadContentSource } from '../../../../../../tools/content-source-loader.mjs';

function createRepository(packs: TopicPack[]): {
  repository: PackContentRepository;
  loader: MemoryJsonResourceLoader;
  resources: Map<string, unknown>;
} {
  const resources = resourcesFor(packs);
  const loader = new MemoryJsonResourceLoader(resources);
  TestBed.configureTestingModule({
    providers: [{ provide: JSON_RESOURCE_LOADER, useValue: loader }],
  });
  return { repository: TestBed.inject(PackContentRepository), loader, resources };
}

describe('PackContentRepository', () => {
  let installedPacks: TopicPack[];

  beforeAll(async () => {
    const source = await loadContentSource('content');
    installedPacks = source.packs as unknown as TopicPack[];
  });

  it('loads, validates, and indexes one pack on demand', async () => {
    const pack = installedPacks[0];
    const { repository, loader } = createRepository([pack]);

    const loaded = await repository.load(topicPackToSummary(pack));

    expect(loaded.pack).toEqual(pack);
    expect(loaded.lessonById.get(pack.lessons[0].id)).toBe(loaded.pack.lessons[0]);
    expect(loaded.testById.get(pack.tests[0].id)).toBe(loaded.pack.tests[0]);
    expect(loaded.exerciseById.get(pack.tests[0].exercises[0].id)).toBe(
      loaded.pack.tests[0].exercises[0],
    );
    expect(loader.requestedPaths).toHaveLength(pack.lessons.length + pack.tests.length);
  });

  it('deduplicates concurrent loads', async () => {
    const pack = installedPacks[0];
    const summary = topicPackToSummary(pack);
    const lessonPath = `content/${pack.id}/lessons/${pack.lessons[0].id}.json`;
    const { repository, loader } = createRepository([pack]);

    const [first, second] = await Promise.all([repository.load(summary), repository.load(summary)]);
    expect(second).toBe(first);
    expect(loader.requestedPaths.filter((path) => path === lessonPath)).toHaveLength(1);
  });

  it('allows a failed load to be retried', async () => {
    const pack = installedPacks[0];
    const summary = topicPackToSummary(pack);
    const lessonPath = `content/${pack.id}/lessons/${pack.lessons[0].id}.json`;
    const { repository, loader } = createRepository([pack]);
    loader.failNext(lessonPath);

    await expect(repository.load(summary)).rejects.toThrow('Temporary failure');
    await expect(repository.load(summary)).resolves.toBeDefined();
    expect(loader.requestedPaths.filter((path) => path === lessonPath)).toHaveLength(2);
  });

  it('retains the two most recently used packs', async () => {
    const [firstPack, secondPack, thirdPack] = installedPacks;
    const { repository, loader } = createRepository([firstPack, secondPack, thirdPack]);
    const summaries = [firstPack, secondPack, thirdPack].map(topicPackToSummary);

    await repository.load(summaries[0]);
    await repository.load(summaries[1]);
    await repository.load(summaries[0]);
    await repository.load(summaries[2]);
    await repository.load(summaries[0]);
    await repository.load(summaries[1]);

    const firstLesson = `content/${firstPack.id}/lessons/${firstPack.lessons[0].id}.json`;
    const secondLesson = `content/${secondPack.id}/lessons/${secondPack.lessons[0].id}.json`;
    expect(loader.requestedPaths.filter((path) => path === firstLesson)).toHaveLength(1);
    expect(loader.requestedPaths.filter((path) => path === secondLesson)).toHaveLength(2);
  });

  it('rejects a fragment whose stable ID differs from its manifest reference', async () => {
    const pack = installedPacks[0];
    const { repository, resources } = createRepository([pack]);
    const lesson = pack.lessons[0];
    resources.set(`content/${pack.id}/lessons/${lesson.id}.json`, {
      ...lesson,
      id: 'another-lesson',
    });

    await expect(repository.load(topicPackToSummary(pack))).rejects.toThrow(
      `The lesson file ${lesson.id}.json has a mismatched stable ID.`,
    );
  });
});

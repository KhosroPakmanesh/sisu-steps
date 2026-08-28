import { TestBed } from '@angular/core/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { ContentCatalogService } from '@/features/learning/shared/content/content-catalog.service';
import { ContentPackManifest, TopicPack } from '@/features/learning/shared/content/content.models';
import { JsonResourceLoader, JSON_RESOURCE_LOADER } from '@/shared/browser/json-resource.loader';
import { loadContentSource } from '../../../../../../tools/content-source-loader.mjs';

const CONTENT_DIRECTORY = 'content';

class MemoryJsonResourceLoader implements JsonResourceLoader {
  readonly requestedPaths: string[] = [];

  constructor(private readonly resources: Map<string, unknown>) {}

  async load(path: string): Promise<unknown> {
    this.requestedPaths.push(path);
    if (!this.resources.has(path)) throw new Error(`Missing test resource: ${path}`);
    return structuredClone(this.resources.get(path));
  }
}

function manifestFor(pack: TopicPack): ContentPackManifest {
  return {
    schemaVersion: pack.schemaVersion,
    id: pack.id,
    version: pack.version,
    title: pack.title,
    level: pack.level,
    summary: pack.summary,
    objectives: pack.objectives,
    importantSkills: pack.importantSkills,
    sources: pack.sources,
    lessonIds: pack.lessons.map((lesson) => lesson.id),
    testIds: pack.tests.map((test) => test.id),
  };
}

function resourcesFor(pack: TopicPack): Map<string, unknown> {
  const packDirectory = `${CONTENT_DIRECTORY}/${pack.id}`;
  return new Map<string, unknown>([
    [`${CONTENT_DIRECTORY}/index.json`, { schemaVersion: 1, packs: [pack.id] }],
    [`${packDirectory}/pack.json`, manifestFor(pack)],
    ...pack.lessons.map(
      (lesson) => [`${packDirectory}/lessons/${lesson.id}.json`, lesson] as const,
    ),
    ...pack.tests.map((test) => [`${packDirectory}/tests/${test.id}.json`, test] as const),
  ]);
}

function createService(resources: Map<string, unknown>): {
  service: ContentCatalogService;
  loader: MemoryJsonResourceLoader;
} {
  const loader = new MemoryJsonResourceLoader(resources);
  TestBed.configureTestingModule({
    providers: [{ provide: JSON_RESOURCE_LOADER, useValue: loader }],
  });
  return { service: TestBed.inject(ContentCatalogService), loader };
}

describe('ContentCatalogService direct source loading', () => {
  let installedPack: TopicPack;

  beforeAll(async () => {
    const source = await loadContentSource('content');
    installedPack = source.packs[0] as unknown as TopicPack;
  });

  it('loads the deployed source fragments and assembles the unchanged runtime pack', async () => {
    const resources = resourcesFor(installedPack);
    const { service, loader } = createService(resources);

    await expect(service.loadPacks()).resolves.toEqual([installedPack]);
    expect(loader.requestedPaths[0]).toBe('content/index.json');
    expect(loader.requestedPaths).toContain(
      `content/${installedPack.id}/lessons/${installedPack.lessons[0].id}.json`,
    );
    expect(loader.requestedPaths).toContain(
      `content/${installedPack.id}/tests/${installedPack.tests[0].id}.json`,
    );
    expect(loader.requestedPaths).toHaveLength(
      2 + installedPack.lessons.length + installedPack.tests.length,
    );
  });

  it('rejects a fragment whose stable ID does not match its manifest reference', async () => {
    const resources = resourcesFor(installedPack);
    const lesson = installedPack.lessons[0];
    resources.set(`content/${installedPack.id}/lessons/${lesson.id}.json`, {
      ...lesson,
      id: 'another-lesson',
    });
    const { service } = createService(resources);

    await expect(service.loadPacks()).rejects.toThrow(
      `The lesson file ${lesson.id}.json has a mismatched stable ID.`,
    );
  });

  it('rejects unsafe manifest references before constructing a resource URL', async () => {
    const resources = resourcesFor(installedPack);
    const manifestPath = `content/${installedPack.id}/pack.json`;
    resources.set(manifestPath, {
      ...(resources.get(manifestPath) as ContentPackManifest),
      lessonIds: ['../outside'],
    });
    const { service, loader } = createService(resources);

    await expect(service.loadPacks()).rejects.toThrow(
      `Topic pack ${installedPack.id} has an incomplete manifest.`,
    );
    expect(loader.requestedPaths).toEqual(['content/index.json', manifestPath]);
  });
});

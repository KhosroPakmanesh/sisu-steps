import { TestBed } from '@angular/core/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { ContentCatalogService } from '@/features/learning/shared/content/content-catalog.service';
import {
  ContentCatalog,
  ContentPackManifest,
} from '@/features/learning/shared/content/catalog.models';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';
import { JSON_RESOURCE_LOADER } from '@/shared/browser/json-resource.loader';
import {
  MemoryJsonResourceLoader,
  resourcesFor,
} from '@testing/helpers/unit/pack-content.resources';
import { loadContentSource } from '../../../../../../tools/content-source-loader.mjs';

function createService(resources: Map<string, unknown>) {
  const loader = new MemoryJsonResourceLoader(resources);
  TestBed.configureTestingModule({
    providers: [{ provide: JSON_RESOURCE_LOADER, useValue: loader }],
  });
  return { service: TestBed.inject(ContentCatalogService), loader };
}

describe('ContentCatalogService summary loading', () => {
  let installedPacks: TopicPack[];
  beforeAll(async () => {
    const source = await loadContentSource('content');
    installedPacks = source.packs as unknown as TopicPack[];
  });

  it('loads only the startup index with exact grouped summaries', async () => {
    const { service, loader } = createService(resourcesFor(installedPacks));
    const summaries = installedPacks.map(topicPackToSummary);
    await expect(service.loadCatalog()).resolves.toEqual({
      packs: summaries,
      groups: [{ id: 'test-group', title: 'Test group', packs: summaries }],
    });
    expect(loader.requestedPaths).toEqual(['content/index.json']);
  });

  it('rejects unsafe manifest references when metadata is first requested', async () => {
    const pack = installedPacks[0];
    const resources = resourcesFor([pack]);
    const path = 'content/' + pack.id + '/pack.json';
    resources.set(path, {
      ...(resources.get(path) as ContentPackManifest),
      lessonIds: ['../outside'],
    });
    const { service, loader } = createService(resources);
    const catalog = await service.loadCatalog();
    await expect(service.loadManifest(catalog.packs[0])).rejects.toThrow(
      'Topic pack ' + pack.id + ' has an incomplete manifest.',
    );
    expect(loader.requestedPaths).toEqual(['content/index.json', path]);
  });

  it('rejects invalid group metadata before loading manifests', async () => {
    const resources = resourcesFor(installedPacks.slice(0, 1));
    const index = resources.get('content/index.json') as ContentCatalog;
    index.groups[0].id = 'Bad ID';
    const { service, loader } = createService(resources);
    await expect(service.loadCatalog()).rejects.toThrow(
      'The content catalog contains an invalid or duplicate group declaration.',
    );
    expect(loader.requestedPaths).toEqual(['content/index.json']);
  });

  it('rejects malformed startup inventories before loading manifests', async () => {
    const resources = resourcesFor(installedPacks.slice(0, 1));
    const index = resources.get('content/index.json') as ContentCatalog;
    index.packs[0].tests[0].exerciseIds = [];
    const { service, loader } = createService(resources);
    await expect(service.loadCatalog()).rejects.toThrow('invalid test summary');
    expect(loader.requestedPaths).toEqual(['content/index.json']);
  });

  it('shares concurrent metadata requests and caches successful manifests', async () => {
    const pack = installedPacks[0];
    const summary = topicPackToSummary(pack);
    const { service, loader } = createService(resourcesFor([pack]));
    const [first, second] = await Promise.all([
      service.loadManifest(summary),
      service.loadManifest(summary),
    ]);
    expect(second).toBe(first);
    expect(await service.loadManifest(summary)).toBe(first);
    expect(loader.requestedPaths).toEqual(['content/' + pack.id + '/pack.json']);
  });

  it('retries failed metadata without refetching successful cached metadata', async () => {
    const pack = installedPacks[0];
    const path = 'content/' + pack.id + '/pack.json';
    const summary = topicPackToSummary(pack);
    const { service, loader } = createService(resourcesFor([pack]));
    loader.failNext(path);
    await expect(service.loadManifest(summary)).rejects.toThrow('Temporary failure');
    const loaded = await service.loadManifest(summary);
    expect(await service.loadManifest(summary)).toBe(loaded);
    expect(loader.requestedPaths).toEqual([path, path]);
  });

  it('rejects stale index and manifest pairs before content can load', async () => {
    const pack = installedPacks[0];
    const resources = resourcesFor([pack]);
    const path = 'content/' + pack.id + '/pack.json';
    const manifest = resources.get(path) as ContentPackManifest;
    manifest.testSummaries[0].title = 'Stale title';
    const { service, loader } = createService(resources);
    await expect(service.loadManifest(topicPackToSummary(pack))).rejects.toThrow(
      'does not match the startup index',
    );
    expect(loader.requestedPaths).toEqual([path]);
  });
});

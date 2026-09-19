import { TestBed } from '@angular/core/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { ContentCatalogService } from '@/features/learning/shared/content/content-catalog.service';
import { ContentPackManifest, TopicPack } from '@/features/learning/shared/content/content.models';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';
import { JSON_RESOURCE_LOADER } from '@/shared/browser/json-resource.loader';
import {
  MemoryJsonResourceLoader,
  resourcesFor,
} from '@testing/helpers/unit/pack-content.resources';
import { loadContentSource } from '../../../../../../tools/content-source-loader.mjs';

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

describe('ContentCatalogService summary loading', () => {
  let installedPacks: TopicPack[];

  beforeAll(async () => {
    const source = await loadContentSource('content');
    installedPacks = source.packs as unknown as TopicPack[];
  });

  it('loads only the catalog and registered manifests during startup', async () => {
    const { service, loader } = createService(resourcesFor(installedPacks));

    const summaries = installedPacks.map(topicPackToSummary);
    await expect(service.loadCatalog()).resolves.toEqual({
      packs: summaries,
      groups: [{ id: 'test-group', title: 'Test group', packs: summaries }],
    });
    expect(loader.requestedPaths).toEqual([
      'content/index.json',
      ...installedPacks.map((pack) => `content/${pack.id}/pack.json`),
    ]);
  });

  it('rejects unsafe manifest references before constructing a resource URL', async () => {
    const pack = installedPacks[0];
    const resources = resourcesFor([pack]);
    const manifestPath = `content/${pack.id}/pack.json`;
    resources.set(manifestPath, {
      ...(resources.get(manifestPath) as ContentPackManifest),
      lessonIds: ['../outside'],
    });
    const { service, loader } = createService(resources);

    await expect(service.loadCatalog()).rejects.toThrow(
      `Topic pack ${pack.id} has an incomplete manifest.`,
    );
    expect(loader.requestedPaths).toEqual(['content/index.json', manifestPath]);
  });

  it('rejects invalid catalog-owned group metadata before loading manifests', async () => {
    const resources = resourcesFor(installedPacks.slice(0, 1));
    resources.set('content/index.json', {
      schemaVersion: 2,
      groups: [{ id: 'Bad ID', title: '', packs: [installedPacks[0].id] }],
    });
    const { service, loader } = createService(resources);

    await expect(service.loadCatalog()).rejects.toThrow(
      'The content catalog contains an invalid or duplicate group declaration.',
    );
    expect(loader.requestedPaths).toEqual(['content/index.json']);
  });
});

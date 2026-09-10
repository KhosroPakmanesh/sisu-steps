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

    await expect(service.loadPackSummaries()).resolves.toEqual(
      installedPacks.map(topicPackToSummary),
    );
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

    await expect(service.loadPackSummaries()).rejects.toThrow(
      `Topic pack ${pack.id} has an incomplete manifest.`,
    );
    expect(loader.requestedPaths).toEqual(['content/index.json', manifestPath]);
  });
});

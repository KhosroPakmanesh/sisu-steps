import { inject, Injectable } from '@angular/core';
import { JSON_RESOURCE_LOADER } from '@/shared/browser/json-resource.loader';
import { ContentPackManifest, LoadedContentCatalog, TopicPackSummary } from './catalog.models';
import { manifestToPackSummary } from './pack-summary.mapper';
import { validateContentCatalog } from './validation/content-catalog.validator';
import { validateContentManifest } from './validation/content-manifest.validator';
import { validatePackSummaryCollection } from './validation/pack-summary-collection.validator';

const CONTENT_DIRECTORY = 'content';
const CATALOG_URL = `${CONTENT_DIRECTORY}/index.json`;

@Injectable({ providedIn: 'root' })
export class ContentCatalogService {
  private readonly loader = inject(JSON_RESOURCE_LOADER);
  private readonly manifests = new Map<string, ContentPackManifest>();
  private readonly inFlight = new Map<string, Promise<ContentPackManifest>>();

  async loadCatalog(): Promise<LoadedContentCatalog> {
    const catalog = validateContentCatalog(
      await this.loader.load(CATALOG_URL, 'the content catalog'),
    );
    return validatePackSummaryCollection(catalog, catalog.packs);
  }

  async loadManifest(summary: TopicPackSummary): Promise<ContentPackManifest> {
    const key = `${summary.id}@${summary.version}`;
    const cached = this.manifests.get(key);
    if (cached) return this.matchSummary(cached, summary);
    const pending = this.inFlight.get(key);
    if (pending) return this.matchSummary(await pending, summary);
    const request = this.readManifest(summary)
      .then((manifest) => {
        this.manifests.set(key, manifest);
        return manifest;
      })
      .finally(() => this.inFlight.delete(key));
    this.inFlight.set(key, request);
    return request;
  }

  private async readManifest(summary: TopicPackSummary): Promise<ContentPackManifest> {
    const manifest = validateContentManifest(
      await this.loader.load(
        `${CONTENT_DIRECTORY}/${summary.id}/pack.json`,
        `topic pack ${summary.id} manifest`,
      ),
      summary.id,
    );
    return this.matchSummary(manifest, summary);
  }

  private matchSummary(
    manifest: ContentPackManifest,
    summary: TopicPackSummary,
  ): ContentPackManifest {
    if (JSON.stringify(manifestToPackSummary(manifest)) !== JSON.stringify(summary)) {
      throw new Error(`Topic pack ${summary.id} does not match the startup index.`);
    }
    return manifest;
  }
}

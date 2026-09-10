import { inject, Injectable } from '@angular/core';
import { JSON_RESOURCE_LOADER } from '@/shared/browser/json-resource.loader';
import { TopicPackSummary } from './content.models';
import { manifestToPackSummary } from './pack-summary.mapper';
import { validateContentCatalog } from './validation/content-catalog.validator';
import { validateContentManifest } from './validation/content-manifest.validator';
import { validatePackSummaryCollection } from './validation/pack-summary-collection.validator';

const CONTENT_DIRECTORY = 'content';
const CATALOG_URL = `${CONTENT_DIRECTORY}/index.json`;

@Injectable({ providedIn: 'root' })
export class ContentCatalogService {
  private readonly loader = inject(JSON_RESOURCE_LOADER);

  async loadPackSummaries(): Promise<TopicPackSummary[]> {
    const catalog = validateContentCatalog(
      await this.loader.load(CATALOG_URL, 'the content catalog'),
    );
    const packs = await Promise.all(catalog.packs.map((packId) => this.loadSummary(packId)));
    return validatePackSummaryCollection(catalog, packs);
  }

  private async loadSummary(packId: string): Promise<TopicPackSummary> {
    const packDirectory = `${CONTENT_DIRECTORY}/${packId}`;
    const manifest = validateContentManifest(
      await this.loader.load(`${packDirectory}/pack.json`, `topic pack ${packId} manifest`),
      packId,
    );
    return manifestToPackSummary(manifest);
  }
}

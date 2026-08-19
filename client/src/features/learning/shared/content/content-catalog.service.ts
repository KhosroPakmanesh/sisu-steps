import { inject, Injectable } from '@angular/core';
import { JSON_RESOURCE_LOADER } from '@/shared/browser/json-resource.loader';
import { TopicPack } from './content.models';
import { validateContentCatalog } from './validation/content-catalog.validator';
import { validatePackCollection } from './validation/pack-collection.validator';
import { validateTopicPack } from './validation/topic-pack.validator';

const CONTENT_DIRECTORY = 'content';
const CATALOG_URL = `${CONTENT_DIRECTORY}/index.json`;

@Injectable({ providedIn: 'root' })
export class ContentCatalogService {
  private readonly loader = inject(JSON_RESOURCE_LOADER);

  async loadPacks(): Promise<TopicPack[]> {
    const catalog = validateContentCatalog(
      await this.loader.load(CATALOG_URL, 'the content catalog'),
    );
    const packs = await Promise.all(
      catalog.packs.map(async (entry) =>
        validateTopicPack(
          await this.loader.load(`${CONTENT_DIRECTORY}/${entry.file}`, `topic pack ${entry.id}`),
        ),
      ),
    );
    return validatePackCollection(catalog, packs);
  }
}

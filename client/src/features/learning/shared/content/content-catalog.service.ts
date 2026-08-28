import { inject, Injectable } from '@angular/core';
import { JSON_RESOURCE_LOADER } from '@/shared/browser/json-resource.loader';
import { ContentPackManifest, TopicPack } from './content.models';
import { validateContentCatalog } from './validation/content-catalog.validator';
import { validateContentManifest } from './validation/content-manifest.validator';
import { validatePackCollection } from './validation/pack-collection.validator';
import { validateTopicPack } from './validation/topic-pack.validator';
import { isRecord } from './validation/validation-primitives';

const CONTENT_DIRECTORY = 'content';
const CATALOG_URL = `${CONTENT_DIRECTORY}/index.json`;

@Injectable({ providedIn: 'root' })
export class ContentCatalogService {
  private readonly loader = inject(JSON_RESOURCE_LOADER);

  async loadPacks(): Promise<TopicPack[]> {
    const catalog = validateContentCatalog(
      await this.loader.load(CATALOG_URL, 'the content catalog'),
    );
    const packs = await Promise.all(catalog.packs.map((packId) => this.loadPack(packId)));
    return validatePackCollection(catalog, packs);
  }

  private async loadPack(packId: string): Promise<TopicPack> {
    const packDirectory = `${CONTENT_DIRECTORY}/${packId}`;
    const manifest = validateContentManifest(
      await this.loader.load(`${packDirectory}/pack.json`, `topic pack ${packId} manifest`),
      packId,
    );
    const [lessons, tests] = await Promise.all([
      this.loadOwnedItems(packDirectory, 'lessons', manifest.lessonIds, 'lesson'),
      this.loadOwnedItems(packDirectory, 'tests', manifest.testIds, 'learning test'),
    ]);
    return validateTopicPack(this.assemblePack(manifest, lessons, tests));
  }

  private async loadOwnedItems(
    packDirectory: string,
    collection: 'lessons' | 'tests',
    ids: string[],
    description: string,
  ): Promise<unknown[]> {
    return Promise.all(
      ids.map(async (id) => {
        const item = await this.loader.load(
          `${packDirectory}/${collection}/${id}.json`,
          `${description} ${id}`,
        );
        if (!isRecord(item) || item['id'] !== id) {
          throw new Error(`The ${description} file ${id}.json has a mismatched stable ID.`);
        }
        return item;
      }),
    );
  }

  private assemblePack(
    manifest: ContentPackManifest,
    lessons: unknown[],
    tests: unknown[],
  ): unknown {
    return {
      schemaVersion: manifest.schemaVersion,
      id: manifest.id,
      version: manifest.version,
      title: manifest.title,
      level: manifest.level,
      summary: manifest.summary,
      objectives: manifest.objectives,
      importantSkills: manifest.importantSkills,
      sources: manifest.sources,
      lessons,
      tests,
    };
  }
}

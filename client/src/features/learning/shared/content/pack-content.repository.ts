import { inject, Injectable } from '@angular/core';
import { JSON_RESOURCE_LOADER } from '@/shared/browser/json-resource.loader';
import { TopicPackSummary } from './catalog.models';
import { LoadedTopicPack, TopicPack } from './topic-pack.models';
import { validatePackMatchesSummary } from './validation/pack-summary-match.validator';
import { validateTopicPack } from './validation/topic-pack.validator';
import { isRecord } from './validation/validation-primitives';

const CONTENT_DIRECTORY = 'content';
const CACHE_LIMIT = 2;

@Injectable({ providedIn: 'root' })
export class PackContentRepository {
  private readonly loader = inject(JSON_RESOURCE_LOADER);
  private readonly cache = new Map<string, LoadedTopicPack>();
  private readonly inFlight = new Map<string, Promise<LoadedTopicPack>>();

  async load(summary: TopicPackSummary): Promise<LoadedTopicPack> {
    const cached = this.cache.get(summary.id);
    if (cached) {
      this.cache.delete(summary.id);
      this.cache.set(summary.id, cached);
      return cached;
    }
    const activeRequest = this.inFlight.get(summary.id);
    if (activeRequest) return activeRequest;

    const request = this.loadUncached(summary)
      .then((loaded) => {
        this.remember(summary.id, loaded);
        return loaded;
      })
      .finally(() => this.inFlight.delete(summary.id));
    this.inFlight.set(summary.id, request);
    return request;
  }

  private async loadUncached(summary: TopicPackSummary): Promise<LoadedTopicPack> {
    const packDirectory = `${CONTENT_DIRECTORY}/${summary.id}`;
    const [lessons, tests] = await Promise.all([
      this.loadOwnedItems(
        packDirectory,
        'lessons',
        summary.lessons.map(({ id }) => id),
        'lesson',
      ),
      this.loadOwnedItems(
        packDirectory,
        'tests',
        summary.tests.map(({ id }) => id),
        'learning test',
      ),
    ]);
    const pack = validatePackMatchesSummary(
      summary,
      validateTopicPack(this.assemblePack(summary, lessons, tests)),
    );
    return this.index(pack);
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

  private assemblePack(summary: TopicPackSummary, lessons: unknown[], tests: unknown[]): unknown {
    return {
      schemaVersion: summary.schemaVersion,
      id: summary.id,
      version: summary.version,
      title: summary.title,
      level: summary.level,
      summary: summary.summary,
      objectives: summary.objectives,
      importantSkills: summary.importantSkills,
      sources: summary.sources,
      lessons,
      tests,
    };
  }

  private index(pack: TopicPack): LoadedTopicPack {
    return {
      pack,
      lessonById: new Map(pack.lessons.map((lesson) => [lesson.id, lesson])),
      testById: new Map(pack.tests.map((test) => [test.id, test])),
      exerciseById: new Map(
        pack.tests.flatMap((test) => test.exercises.map((exercise) => [exercise.id, exercise])),
      ),
    };
  }

  private remember(id: string, pack: LoadedTopicPack): void {
    this.cache.set(id, pack);
    if (this.cache.size <= CACHE_LIMIT) return;
    const oldestId = this.cache.keys().next().value as string;
    this.cache.delete(oldestId);
  }
}

import { inject, Injectable } from '@angular/core';
import { JSON_RESOURCE_LOADER } from '@/shared/browser/json-resource.loader';
import { ContentCatalogService } from '../../../shared/content/content-catalog.service';
import { TopicPackSummary } from '../../../shared/content/catalog.models';
import { validateLessons } from '../../../shared/content/validation/lesson.validator';
import { GrammarReferencePack } from './grammar-reference.models';

const CACHE_LIMIT = 2;

@Injectable({ providedIn: 'root' })
export class GrammarReferenceRepository {
  private readonly loader = inject(JSON_RESOURCE_LOADER);
  private readonly catalog = inject(ContentCatalogService);
  private readonly cache = new Map<string, GrammarReferencePack>();
  private readonly inFlight = new Map<string, Promise<GrammarReferencePack>>();

  async load(summary: TopicPackSummary): Promise<GrammarReferencePack> {
    const key = summary.id + '@' + summary.version;
    const cached = this.cache.get(key);
    if (cached) {
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached;
    }
    const pending = this.inFlight.get(key);
    if (pending) return pending;
    const request = this.readLessons(summary)
      .then((reference) => {
        this.cache.set(key, reference);
        if (this.cache.size > CACHE_LIMIT) this.cache.delete(this.cache.keys().next().value!);
        return reference;
      })
      .finally(() => this.inFlight.delete(key));
    this.inFlight.set(key, request);
    return request;
  }

  private async readLessons(summary: TopicPackSummary): Promise<GrammarReferencePack> {
    await this.catalog.loadManifest(summary);
    const items = await Promise.all(
      summary.lessons.map(({ id }) =>
        this.loader.load('content/' + summary.id + '/lessons/' + id + '.json', 'lesson ' + id),
      ),
    );
    const lessons = validateLessons(items, new Set());
    if (
      lessons.some(
        (lesson, index) =>
          lesson.id !== summary.lessons[index].id ||
          lesson.version !== summary.lessons[index].version,
      )
    ) {
      throw new Error('The grammar reference does not match the installed lessons.');
    }
    return {
      id: summary.id,
      title: summary.title,
      lessons: lessons.map((lesson) => {
        const test = summary.tests.find(
          (test) => test.stage === 'focused' && test.lessonIds.includes(lesson.id),
        );
        if (!test) throw new Error('The lesson has no associated Focused-test heading.');
        return {
          id: lesson.id,
          title: test.title,
          summary: lesson.summary,
          examples: lesson.examples.map(({ finnish, english }) => ({ finnish, english })),
        };
      }),
    };
  }
}

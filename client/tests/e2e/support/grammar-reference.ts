import { expect, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const catalog = JSON.parse(readFileSync(resolve('content/index.json'), 'utf8')) as {
  groups: { id: string; title: string; packs: string[] }[];
};
export const loadPack = (id: string) => {
  const manifest = JSON.parse(readFileSync(resolve('content', id, 'pack.json'), 'utf8')) as {
    title: string;
    lessonIds: string[];
    testSummaries: { title: string; stage: string; lessonIds: string[] }[];
  };
  return {
    ...manifest,
    lessons: manifest.lessonIds.map((lessonId) => {
      const lesson = JSON.parse(
        readFileSync(resolve('content', id, 'lessons', lessonId + '.json'), 'utf8'),
      ) as {
        title: string;
        summary: string;
        examples: { finnish: string; english: string; steps: string[] }[];
      };
      return {
        ...lesson,
        preparationTitle: lesson.title,
        title: manifest.testSummaries.find(
          (test) => test.stage === 'focused' && test.lessonIds.includes(lessonId),
        )!.title,
      };
    }),
  };
};

export async function learnerState(page: Page) {
  return page.evaluate(
    () =>
      new Promise<unknown>((accept, reject) => {
        const request = indexedDB.open('sisu-steps', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const read = database
            .transaction('learner-state')
            .objectStore('learner-state')
            .get('current');
          read.onsuccess = () => {
            database.close();
            accept(read.result);
          };
          read.onerror = () => {
            database.close();
            reject(read.error);
          };
        };
      }),
  );
}

export async function expectLessonExamples(
  article: Locator,
  lesson: ReturnType<typeof loadPack>['lessons'][number],
) {
  await expect(article.locator('details')).toHaveJSProperty('open', false);
  await expect(article.locator('.reference-example')).toHaveCount(0);
  await article.locator('.topic-group-toggle').click();
  await expect(article.locator('details')).toHaveJSProperty('open', true);
  const examples = article.locator('.reference-example');
  await expect(examples.locator('strong[lang="fi"]')).toHaveText(
    lesson.examples.map((example) => example.finnish),
  );
  await expect(examples.locator('p > span')).toHaveText(
    lesson.examples.map((example) => example.english),
  );
  await expect(examples.locator('ol, li')).toHaveCount(0);
}

import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';
import { collectGrammarForms } from '../../../tools/content-validation/shared/grammar-vocabulary.mjs';

const index = JSON.parse(readFileSync('content/index.json', 'utf8')) as {
  groups: Array<{ packs: string[] }>;
};
const packIds = index.groups.flatMap((group) => group.packs);
let packs: TopicPack[];
test.beforeAll(async () => {
  packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
  expect(packs.map((pack) => pack.id)).toEqual(packIds);
  expect(packs.flatMap((pack) => pack.lessons)).toHaveLength(103);
});
for (const packId of packIds) {
  test(
    'keeps section responsibilities and vocabulary consistent in ' + packId,
    async ({ page }, testInfo) => {
      test.setTimeout(180_000);
      const pack = packs.find((item) => item.id === packId)!;
      const audit: Array<{ pack: string; lesson: string; rendered: string }> = [];
      const grammarForms = collectGrammarForms(
        [
          ...pack.tests.flatMap((item) => item.exercises),
          ...pack.lessons.flatMap((item) => item.practiceExercises),
        ],
        pack.grammarBaseForms,
      );
      for (const lesson of pack.lessons) {
        const focused = pack.tests.find((item) => item.lessonIds.includes(lesson.id))!;
        await page.goto(`/learn/${pack.id}/${focused.id}`);
        const reader = page.locator('.lesson-reader');
        await expect(reader).toBeVisible();
        const vocabulary = reader.locator('.lesson-vocabulary');
        await expect(vocabulary).toHaveCount(1);
        const renderedWords = await vocabulary.locator('dt').allTextContents();
        expect(
          renderedWords.filter((word) => grammarForms.has(word.toLocaleLowerCase('fi-FI'))),
        ).toEqual([]);
        await expect(reader.locator('.teaching-section')).toHaveCount(lesson.sections.length);
        await expect(
          reader.getByRole('heading', { name: 'Words and forms used here', exact: true }),
        ).toHaveCount(0);

        for (const [heading, entries] of [
          ['New words', lesson.introducedVocabulary],
          ['Used again', lesson.reusedVocabulary],
          ['Supplied in examples', lesson.suppliedVocabulary],
        ] as const) {
          const group = vocabulary.locator('.vocabulary-group').filter({
            has: page.getByRole('heading', { name: heading, exact: true }),
          });
          await expect(group).toHaveCount(1);
          await expect(group.locator('dt')).toHaveText(entries.map((entry) => entry.finnish));
          await expect(group.locator('dd')).toHaveText(entries.map((entry) => entry.english));
        }
        for (const section of lesson.sections) {
          for (const point of section.keyPoints) {
            await expect(reader.locator('.teaching-section')).toContainText([point]);
          }
        }
        for (const example of lesson.examples) {
          await expect(reader.locator('.worked-examples')).toContainText(example.finnish);
          await expect(reader.locator('.worked-examples')).toContainText(example.english);
          for (const step of example.steps) {
            await expect(reader.locator('.worked-examples')).toContainText(step);
          }
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        audit.push({ pack: pack.id, lesson: lesson.id, rendered: await reader.innerText() });
        if (lesson.id === 'aps-possessors-singular') {
          await page.screenshot({
            path: testInfo.outputPath('corrected-possession.png'),
            fullPage: true,
          });
        }
        if (lesson.id.startsWith('nps-fixed-negative-')) {
          const owners =
            lesson.numberScope?.number === 'singular'
              ? ['minulla', 'sinulla', 'hänellä']
              : ['meillä', 'teillä', 'heillä'];
          for (const owner of owners) {
            await expect(
              vocabulary.locator('dt').filter({ hasText: new RegExp(`^${owner}$`, 'u') }),
            ).toHaveCount(0);
            await expect(reader.locator('.worked-examples')).toContainText(owner);
          }
          await page.screenshot({
            path: testInfo.outputPath('corrected-grammar-vocabulary.png'),
            fullPage: true,
          });
        }
      }

      expect(audit.map((item) => item.lesson)).toEqual(pack.lessons.map((lesson) => lesson.id));
      await writeFile(
        testInfo.outputPath('rendered-lesson-audit.json'),
        JSON.stringify(audit, null, 2),
      );
    },
  );
}

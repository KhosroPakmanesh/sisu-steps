import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';
import { collectGrammarForms } from '../../../tools/content-validation/shared/grammar-vocabulary.mjs';

test('keeps section responsibilities and vocabulary consistent in every installed lesson', async ({
  page,
}, testInfo) => {
  test.setTimeout(240_000);
  const source = await loadContentSource('content');
  const packs = source.packs as unknown as TopicPack[];
  const audit: Array<{ pack: string; lesson: string; rendered: string }> = [];

  for (const pack of packs) {
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
      if (lesson.id === 'aps-possessors') {
        await page.screenshot({
          path: testInfo.outputPath('corrected-possession.png'),
          fullPage: true,
        });
      }
      if (lesson.id === 'nps-fixed-negative') {
        for (const owner of ['minulla', 'sinulla', 'hänellä', 'meillä', 'teillä', 'heillä']) {
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
  }

  expect(audit).toHaveLength(81);
  await writeFile(
    testInfo.outputPath('rendered-lesson-audit.json'),
    JSON.stringify(audit, null, 2),
  );
});

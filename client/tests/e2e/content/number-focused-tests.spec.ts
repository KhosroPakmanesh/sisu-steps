import { writeFile } from 'node:fs/promises';
import { expect, Locator, Page, test } from '@playwright/test';
import { Exercise } from '../../../src/features/learning/shared/content/exercise.models';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';

let packs: TopicPack[];
test.beforeAll(async () => {
  packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
});

test('opens all 44 number-specific tests with their unchanged shared lessons at every viewport', async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  const routes: string[] = [];
  for (const pack of packs.filter((item) => item.tests.some((authored) => authored.numberScope))) {
    await page.goto('/topics/' + pack.id);
    await expect(page.locator('.test-card')).toHaveCount(pack.tests.length);
    for (const authored of pack.tests.filter((item) => item.numberScope)) {
      const lesson = pack.lessons.find((item) => item.id === authored.lessonIds[0])!;
      await page.goto('/learn/' + pack.id + '/' + authored.id);
      const reader = page.locator('.lesson-reader');
      await expect(reader).toHaveCount(1);
      await expect(reader.locator('h2').first()).toHaveText(lesson.title);
      for (const section of lesson.sections)
        for (const paragraph of section.paragraphs) await expect(reader).toContainText(paragraph);
      for (const example of lesson.examples) {
        await expect(reader).toContainText(example.finnish);
        await expect(reader).toContainText(example.english);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.goto('/study/' + pack.id + '/' + authored.id);
      await expect(page.locator('.exercise-card h2')).toHaveText(authored.exercises[0].prompt);
      await page.getByRole('button', { name: 'Show answer', exact: true }).click();
      await expect(page.locator('.feedback')).toContainText(authored.exercises[0].explanation);
      routes.push(authored.id);
    }
  }
  expect(routes).toHaveLength(44);
  await page.goto('/topics/affirmative-possession');
  await page.locator('.test-card').first().scrollIntoViewIfNeeded();
  await page.screenshot({
    path: testInfo.outputPath('number-separated-tests.png'),
    fullPage: true,
  });
  await writeFile(testInfo.outputPath('number-test-routes.json'), JSON.stringify(routes));
});

test('grades all 508 unchanged questions in the 44 separated tests', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  test.setTimeout(900_000);
  const records: string[] = [];
  for (const pack of packs)
    for (const authored of pack.tests.filter((item) => item.numberScope)) {
      await page.goto('/study/' + pack.id + '/' + authored.id);
      for (const [index, exercise] of authored.exercises.entries()) {
        const card = page.locator('.exercise-card');
        await expect(card.locator('h2')).toHaveText(exercise.prompt);
        await submit(page, card, exercise);
        await expect(card.locator('.feedback')).toHaveClass(/correct/u);
        await expect(card.locator('.feedback')).toContainText(exercise.explanation);
        records.push(exercise.id);
        await page
          .getByRole('button', {
            name: index === authored.exercises.length - 1 ? 'See result' : 'Continue',
            exact: true,
          })
          .click();
      }
      await expect(page.locator('.result-card')).toContainText('100%');
      await writeFile(
        testInfo.outputPath('grading-progress.json'),
        JSON.stringify({ completedQuestions: records.length, testId: authored.id }),
      );
    }
  expect(records).toHaveLength(508);
  expect(new Set(records).size).toBe(508);
  await writeFile(testInfo.outputPath('number-separated-questions.json'), JSON.stringify(records));
});

async function submit(page: Page, card: Locator, exercise: Exercise) {
  if (exercise.type === 'multiple-choice')
    await card.getByRole('radio', { name: exercise.acceptedAnswers[0], exact: true }).check();
  else if (exercise.type === 'word-order') {
    let remaining = exercise.acceptedAnswers[0];
    const tokens = [...exercise.tokens!];
    while (tokens.length) {
      const index = tokens.findIndex(
        (token) => remaining === token || remaining.startsWith(token + ' '),
      );
      expect(
        index,
        exercise.id + ': use the authored whole word-order tiles',
      ).toBeGreaterThanOrEqual(0);
      const token = tokens.splice(index, 1)[0];
      await card
        .locator('.token-bank')
        .getByRole('button', { name: token, exact: true })
        .first()
        .click();
      remaining = remaining.slice(token.length).trimStart();
    }
    expect(remaining).toBe('');
  } else await card.getByRole('textbox', { name: 'Your answer' }).fill(exercise.acceptedAnswers[0]);
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
}

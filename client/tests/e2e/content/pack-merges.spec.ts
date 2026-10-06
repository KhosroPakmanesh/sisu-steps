import { writeFile } from 'node:fs/promises';
import { expect, Locator, Page, test } from '@playwright/test';
import { Exercise } from '../../../src/features/learning/shared/content/exercise.models';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';

for (const id of ['demonstrative-pronouns', 'possessive-pronouns-endings']) {
  test(`opens every retained lesson and test in merged ${id}`, async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    const source = await loadContentSource('content');
    const pack = source.packs.find((item) => item['id'] === id) as unknown as TopicPack;
    await page.goto(`/topics/${id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(pack.title);
    await expect(page.locator('.test-card')).toHaveCount(pack.tests.length);
    await expect(page.locator('.review-test')).toHaveCount(2);
    await expect(page.locator('.test-card h3')).toHaveText(pack.tests.map((item) => item.title));
    const testRoutes = await page
      .locator('.test-card .test-actions a.primary')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(testRoutes).toEqual(pack.tests.map((item) => `/study/${id}/${item.id}`));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const records: string[] = [];
    for (const lesson of pack.lessons) {
      const focused = pack.tests.find(
        (item) => item.stage === 'focused' && item.lessonIds.includes(lesson.id),
      )!;
      await page.goto(`/learn/${id}/${focused.id}`);
      const reader = page.locator('.lesson-reader');
      await expect(reader.locator('h2').first()).toHaveText(lesson.title);
      for (const section of lesson.sections)
        for (const paragraph of section.paragraphs) await expect(reader).toContainText(paragraph);
      for (const example of lesson.examples) {
        await expect(reader).toContainText(example.finnish);
        await expect(reader).toContainText(example.english);
        for (const step of example.steps) await expect(reader).toContainText(step);
      }
      for (const warning of lesson.commonMistakes) await expect(reader).toContainText(warning);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      records.push(lesson.id);
    }
    for (const authored of pack.tests) {
      await page.goto(`/study/${id}/${authored.id}`);
      const question = authored.exercises[0];
      await expect(page.locator('.exercise-card h2')).toHaveText(question.prompt);
      await page.getByRole('button', { name: 'Show answer', exact: true }).click();
      await expect(page.locator('.feedback')).toContainText(question.explanation);
      records.push(authored.id);
    }
    await page.goto(`/topics/${id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(pack.title);
    await expect(page.locator('.test-card h3')).toHaveText(pack.tests.map((item) => item.title));
    await page.screenshot({ path: testInfo.outputPath(`${id}-merged-map.png`), fullPage: true });
    await writeFile(testInfo.outputPath(`${id}-routes.json`), JSON.stringify(records, null, 2));
  });
}

test('grades every retained demonstrative question and optional item in its merged pack', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  test.setTimeout(720_000);
  const source = await loadContentSource('content');
  const pack = source.packs.find(
    (item) => item['id'] === 'demonstrative-pronouns',
  ) as unknown as TopicPack;
  const records: string[] = [];
  for (const lesson of pack.lessons) {
    const focused = pack.tests.find(
      (item) => item.stage === 'focused' && item.lessonIds.includes(lesson.id),
    )!;
    await page.goto(`/learn/${pack.id}/${focused.id}`);
    await page.getByRole('button', { name: 'Start optional practice', exact: true }).click();
    for (const [index, exercise] of lesson.practiceExercises.entries()) {
      const card = page.locator('.practice-card');
      await expect(card.locator('h4')).toHaveText(exercise.prompt);
      await submit(page, card, exercise, true);
      await expect(card.locator('.feedback')).toHaveClass(/correct/u);
      await expect(card.locator('.feedback')).toContainText(exercise.explanation);
      records.push(exercise.id);
      await page
        .getByRole('button', {
          name: index === lesson.practiceExercises.length - 1 ? 'Finish practice' : 'Continue',
          exact: true,
        })
        .click();
    }
  }
  for (const authored of pack.tests) {
    await page.goto(`/study/${pack.id}/${authored.id}`);
    for (const [index, exercise] of authored.exercises.entries()) {
      const card = page.locator('.exercise-card');
      await expect(card.locator('h2')).toHaveText(exercise.prompt);
      await submit(page, card, exercise, false);
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
  }
  expect(records).toHaveLength(324);
  expect(new Set(records).size).toBe(324);
  await writeFile(
    testInfo.outputPath('merged-demonstrative-questions.json'),
    JSON.stringify(records),
  );
});

async function submit(page: Page, card: Locator, exercise: Exercise, practice: boolean) {
  if (exercise.type === 'multiple-choice') {
    await card.getByRole('radio', { name: exercise.acceptedAnswers[0], exact: true }).check();
  } else if (exercise.type === 'word-order') {
    const bank = card.locator(practice ? '.practice-token-bank' : '.token-bank');
    for (const token of exercise.acceptedAnswers[0].split(' '))
      await bank.getByRole('button', { name: token, exact: true }).first().click();
  } else await card.getByRole('textbox', { name: 'Your answer' }).fill(exercise.acceptedAnswers[0]);
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
}

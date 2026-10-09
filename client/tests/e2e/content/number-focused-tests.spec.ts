import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';
import { FOCUSED_EXPANSION_INVENTORY, submit } from '../support/focused-content-grading';

let packs: TopicPack[];
test.beforeAll(async () => {
  packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
});

test('opens all 44 number-specific tests with independent matching preparation at every viewport', async ({
  page,
}, testInfo) => {
  test.setTimeout(600_000);
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
      expect(lesson.id).toBe(authored.id.replace(/-test$/u, ''));
      expect(lesson.numberScope).toEqual(authored.numberScope);
      await expect(page.locator('.lesson-hero')).toContainText(lesson.summary);
      const exampleTexts = await reader
        .locator('.worked-examples .example-grid > article > p > strong')
        .allTextContents();
      expect(exampleTexts).toEqual(lesson.examples.map((example) => example.finnish));
      if (
        /^(pqs-onko|ppo-pronoun-presence|ppe-pronoun-omission)-(singular|plural)-test$/u.test(
          authored.id,
        )
      ) {
        await page.screenshot({
          path: testInfo.outputPath(authored.id + '-preparation.png'),
        });
        await reader.locator('.worked-examples').scrollIntoViewIfNeeded();
        await page.screenshot({
          path: testInfo.outputPath(authored.id + '-examples.png'),
        });
      }
      for (const section of lesson.sections)
        for (const paragraph of section.paragraphs) await expect(reader).toContainText(paragraph);
      for (const mistake of lesson.commonMistakes) await expect(reader).toContainText(mistake);
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

test('grades all 95 scoped optional questions and shows only their own preparation at every viewport', async ({
  page,
}, testInfo) => {
  test.setTimeout(600_000);
  const records: string[] = [];
  for (const pack of packs)
    for (const lesson of pack.lessons.filter((item) => item.numberScope)) {
      const authored = pack.tests.find(
        (item) => item.lessonIds.length === 1 && item.lessonIds[0] === lesson.id,
      )!;
      await page.goto('/learn/' + pack.id + '/' + authored.id);
      const practice = page.locator('.lesson-practice');
      await practice.getByRole('button', { name: 'Start optional practice', exact: true }).click();
      for (const [index, exercise] of lesson.practiceExercises.entries()) {
        await expect(practice.locator('h4')).toHaveText(exercise.prompt);
        if (exercise.type === 'multiple-choice')
          await practice
            .getByRole('radio', {
              name: exercise.acceptedAnswers[0],
              exact: true,
            })
            .check();
        else if (exercise.type === 'word-order') {
          let remaining = exercise.acceptedAnswers[0];
          const tokens = [...exercise.tokens!];
          while (tokens.length) {
            const i = tokens.findIndex(
              (token) => remaining === token || remaining.startsWith(token + ' '),
            );
            expect(i, exercise.id).toBeGreaterThanOrEqual(0);
            const token = tokens.splice(i, 1)[0];
            await practice
              .locator('.practice-token-bank')
              .getByRole('button', { name: token, exact: true })
              .first()
              .click();
            remaining = remaining.slice(token.length).trimStart();
          }
          expect(remaining).toBe('');
        } else
          await practice
            .getByRole('textbox', { name: 'Your answer' })
            .fill(exercise.acceptedAnswers[0]);
        await practice.getByRole('button', { name: 'Check answer', exact: true }).click();
        await expect(practice.locator('.feedback')).toHaveClass(/correct/u);
        await expect(practice.locator('.feedback')).toContainText(exercise.explanation);
        for (const part of exercise.sentenceExplanation?.parts ?? []) {
          await expect(practice.locator('.sentence-lesson')).toContainText(part.finnish);
          await expect(practice.locator('.sentence-lesson')).toContainText(part.formation);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        if (
          exercise.id.includes('-singular-practice-04') &&
          ['pqs-onko', 'ppe-pronoun-omission'].some((base) => lesson.id.startsWith(base))
        ) {
          await practice.locator('.feedback').scrollIntoViewIfNeeded();
          await page.screenshot({
            path: testInfo.outputPath(exercise.id + '-feedback.png'),
          });
        }
        records.push(exercise.id);
        await practice
          .getByRole('button', {
            name: index === lesson.practiceExercises.length - 1 ? 'Finish practice' : 'Continue',
            exact: true,
          })
          .click();
      }
      await expect(practice).toContainText('Practice complete');
    }
  expect(records).toHaveLength(95);
  expect(new Set(records).size).toBe(95);
  await writeFile(testInfo.outputPath('number-specific-practice.json'), JSON.stringify(records));
});

for (const inventory of FOCUSED_EXPANSION_INVENTORY) {
  test(`grades every separated Focused test in ${inventory.id}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-wide');
    test.setTimeout(600_000);
    const records: string[] = [];
    const pack = packs.find((item) => item.id === inventory.id)!;
    for (const authored of pack.tests.filter((item) => item.numberScope)) {
      await page.goto('/study/' + pack.id + '/' + authored.id);
      for (const [index, exercise] of authored.exercises.entries()) {
        const card = page.locator('.exercise-card');
        await expect(card.locator('h2')).toHaveText(exercise.prompt);
        await submit(page, exercise, exercise.acceptedAnswers[0]);
        await expect(card.locator('.feedback')).toHaveClass(/correct/u);
        await expect(card.locator('.feedback')).toContainText(exercise.explanation);
        if (
          exercise.id.startsWith(authored.id + '-e1') ||
          ['affirmative-possession', 'negative-possession'].includes(pack.id)
        ) {
          for (const part of exercise.sentenceExplanation?.parts ?? []) {
            await expect(page.locator('.sentence-lesson')).toContainText(part.finnish);
            await expect(page.locator('.sentence-lesson')).toContainText(part.formation);
          }
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
        }
        if (authored.id === 'aps-possessors-singular-test' && index === 0) {
          await page.locator('.sentence-lesson').scrollIntoViewIfNeeded();
          await page.screenshot({
            path: testInfo.outputPath('singular-owner-formation-feedback.png'),
          });
        }
        records.push(exercise.id);
        await page.mouse.move(0, 0);
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
        JSON.stringify({
          completedQuestions: records.length,
          testId: authored.id,
        }),
      );
    }
    expect(records).toHaveLength(inventory.scored);
    expect(new Set(records).size).toBe(inventory.scored);
    await writeFile(
      testInfo.outputPath('number-separated-questions.json'),
      JSON.stringify(records),
    );
  });
}

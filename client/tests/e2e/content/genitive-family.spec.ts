import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { learnerState } from '../support/grammar-reference';
import { positionSession, submit } from '../support/focused-content-grading';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { LearnerState } from '../../../src/features/learning/shared/state/learner-state.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';

const ids = [
  'genitive-forms',
  'genitive-forms-singular-families',
  'genitive-forms-plural-jen-ien',
  'genitive-forms-plural-iden',
  'genitive-forms-plural-ten',
  'genitive-ownership',
  'genitive-adjectives-pronouns-questions',
  'genitive-constructions',
];
let packs: TopicPack[];
test.beforeAll(async () => {
  packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
});
const loadPack = (id: string) => packs.find((p) => p.id === id)!;

for (const id of ids) {
  test('renders and grades every scored genitive item in ' + id, async ({ page }, testInfo) => {
    const pack = loadPack(id);
    const count = pack.tests.flatMap((t) => t.exercises).length;
    test.setTimeout(Math.max(600_000, count * 2_000));
    const records: Array<{ id: string; prompt: string; feedback: string }> = [];
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const authored of pack.tests) {
      await page.goto(`/study/${id}/${authored.id}`);
      await expect(page.locator('.exercise-card')).toBeVisible({ timeout: 20_000 });
      for (const [index, exercise] of authored.exercises.entries()) {
        await expect(page.locator('.exercise-card h2')).toHaveText(exercise.prompt);
        await submit(page, exercise, exercise.acceptedAnswers[0]);
        const feedback = page.locator('.feedback');
        await expect(feedback).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
        await expect(feedback).toContainText(exercise.explanation);
        if (exercise.sentenceExplanation) {
          await expect(page.locator('.sentence-lesson')).toContainText(
            exercise.sentenceExplanation.translation,
          );
          for (const part of exercise.sentenceExplanation.parts) {
            await expect(page.locator('.sentence-lesson')).toContainText(part.formation);
            await expect(page.locator('.sentence-lesson')).toContainText(part.role);
          }
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        records.push({
          id: exercise.id,
          prompt: exercise.prompt,
          feedback: await feedback.innerText(),
        });
        if (records.length === 1)
          await page.screenshot({
            path: testInfo.outputPath('scored-feedback.png'),
            fullPage: true,
          });
        if (index === 1) {
          await page.reload();
          await expect(page.locator('.exercise-card h2')).toHaveText(exercise.prompt, {
            timeout: 20_000,
          });
          await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
        }
        await page
          .getByRole('button', {
            name: index === authored.exercises.length - 1 ? 'See result' : 'Continue',
            exact: true,
          })
          .click();
      }
      await expect(page.locator('.result-card')).toContainText('100%');
    }
    const state = (await learnerState(page)) as LearnerState;
    expect(state.attempts.filter((a) => a.topicId === id)).toHaveLength(pack.tests.length);
    expect(state.attempts.every((a) => a.percentage === 100)).toBe(true);
    expect(records).toHaveLength(pack.tests.flatMap((t) => t.exercises).length);
    expect(errors).toEqual([]);
    await writeFile(
      testInfo.outputPath('scored-render-audit.json'),
      JSON.stringify({ records, errors }, null, 2),
    );
  });

  test('renders and grades every optional genitive item in ' + id, async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    const pack = loadPack(id);
    const records: Array<{ id: string; prompt: string; feedback: string }> = [];
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const lesson of pack.lessons) {
      await page.goto(`/learn/${id}/${lesson.id}-test`);
      await expect(page.locator('.lesson-reader')).toBeVisible();
      if (lesson === pack.lessons[0])
        await page.screenshot({ path: testInfo.outputPath('lesson.png'), fullPage: true });
      await page.getByRole('button', { name: 'Start optional practice', exact: true }).click();
      const practice = page.locator('.lesson-practice');
      for (const [index, exercise] of lesson.practiceExercises.entries()) {
        await expect(practice.locator('h4')).toHaveText(exercise.prompt);
        const answer = exercise.acceptedAnswers[0];
        if (exercise.type === 'multiple-choice')
          await practice.getByRole('radio', { name: answer, exact: true }).check();
        else await practice.getByRole('textbox', { name: 'Your answer' }).fill(answer);
        await practice.getByRole('button', { name: 'Check answer', exact: true }).click();
        await expect(practice.locator('.feedback')).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
        await expect(practice.locator('.feedback')).toContainText(exercise.explanation);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        records.push({
          id: exercise.id,
          prompt: exercise.prompt,
          feedback: await practice.locator('.feedback').innerText(),
        });
        if (records.length === 1)
          await page.screenshot({
            path: testInfo.outputPath('optional-feedback.png'),
            fullPage: true,
          });
        await practice
          .getByRole('button', {
            name: index === lesson.practiceExercises.length - 1 ? 'Finish practice' : 'Continue',
            exact: true,
          })
          .click();
      }
    }
    const state = (await learnerState(page)) as LearnerState;
    expect(state.attempts).toEqual([]);
    expect(state.sessions).toEqual([]);
    expect(state.unresolvedMistakeIds).toEqual([]);
    expect(records).toHaveLength(pack.lessons.length * 3);
    await writeFile(
      testInfo.outputPath('optional-render-audit.json'),
      JSON.stringify(records, null, 2),
    );
  });
}

test('shows genitive diagnostics and fallback and accepts plural alternatives', async ({
  page,
}) => {
  const pack = loadPack('genitive-forms-plural-ten');
  const authored = pack.tests[0];
  const index = authored.exercises.findIndex((exercise) => exercise.id.includes('-produce-01'));
  const exercise = authored.exercises[index];
  await page.goto(`/study/${pack.id}/${authored.id}`);
  for (const answer of ['naisten', 'naisien', exercise.answerDiagnostics![0].answers[0], 'xyz']) {
    await positionSession(page, pack.id, authored.id, index);
    await submit(page, exercise, answer);
    const correct = exercise.acceptedAnswers.includes(answer);
    await expect(page.locator('.feedback')).toHaveClass(
      correct ? /(?:^|\s)correct(?:\s|$)/u : /(?:^|\s)incorrect(?:\s|$)/u,
    );
    await expect(page.locator('.feedback .explanation')).toHaveCount(1);
    expect((await page.locator('.feedback').innerText()).split(exercise.explanation)).toHaveLength(
      2,
    );
    if (answer === 'xyz') await expect(page.locator('.feedback .diagnostic')).toHaveCount(0);
    if (!correct && answer !== 'xyz')
      await expect(page.locator('.feedback')).toContainText(
        exercise.answerDiagnostics![0].explanation,
      );
  }
});

test('keeps all Genitive maps and reference lessons in authored order', async ({
  page,
}, testInfo) => {
  for (const id of ids) {
    const pack = loadPack(id);
    await page.goto(`/topics/${id}`);
    await expect(page.locator('.test-card .test-title-row h3')).toHaveText(
      pack.tests.map((test) => test.title),
    );
    await expect(page.locator('.test-card').last()).toHaveClass(/review-test/u);
    await expect(page.locator('.test-card.review-test')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath(id + '-ordered-map.png') });
  }
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Grammar reference for Genitive', exact: true });
  await expect(button).toBeVisible();
  const before = await learnerState(page);
  await button.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.reference-lesson-title')).toHaveText(
    ids.flatMap((id) => loadPack(id).lessons.map((lesson) => lesson.title)),
  );
  await page.screenshot({ path: testInfo.outputPath('genitive-reference.png') });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(button).toBeFocused();
  expect(await learnerState(page)).toEqual(before);
});

test('renders genitive error feedback once across formations and constructions', async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  for (const id of [
    'genitive-forms',
    'genitive-ownership',
    'genitive-adjectives-pronouns-questions',
    'genitive-constructions',
  ]) {
    const pack = loadPack(id);
    const authored = pack.tests[0];
    await page.goto(`/study/${id}/${authored.id}`);
    await expect(page.locator('.exercise-card')).toBeVisible({ timeout: 20_000 });
    for (const type of ['multiple-choice', 'fill-blank']) {
      const index = authored.exercises.findIndex((exercise) => exercise.type === type);
      const exercise = authored.exercises[index];
      const wrong =
        type === 'multiple-choice'
          ? exercise.options!.find((option) => !exercise.acceptedAnswers.includes(option))!
          : exercise.answerDiagnostics![0].answers[0];
      await positionSession(page, id, authored.id, index);
      await submit(page, exercise, wrong);
      const feedback = page.locator('.feedback');
      await expect(feedback).toHaveClass(/(?:^|\s)incorrect(?:\s|$)/u);
      await expect(feedback.locator('.explanation')).toHaveCount(1);
      expect((await feedback.innerText()).split(exercise.explanation)).toHaveLength(2);
      if (type === 'multiple-choice')
        await expect(feedback).toContainText(exercise.optionFeedback![wrong]);
      else await expect(feedback).toContainText(exercise.answerDiagnostics![0].explanation);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.screenshot({
      path: testInfo.outputPath(id + '-error-feedback.png'),
      fullPage: true,
    });
  }
});

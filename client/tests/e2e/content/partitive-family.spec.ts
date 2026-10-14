import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { learnerState } from '../support/grammar-reference';
import { positionSession, submit } from '../support/focused-content-grading';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { LearnerState } from '../../../src/features/learning/shared/state/learner-state.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';

const ids = [
  'partitive-forms',
  'partitive-forms-singular-families',
  'partitive-forms-plural-ia-ja',
  'partitive-forms-plural-ita',
  'partitive-quantities',
  'partitive-sentences',
  'partitive-adjectives',
  'partitive-pronouns-questions',
];
let packs: TopicPack[];
test.beforeAll(async () => {
  packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
});
const loadPack = (id: string) => packs.find((p) => p.id === id)!;

for (const id of ids) {
  test('renders and grades every scored partitive item in ' + id, async ({ page }, testInfo) => {
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

  test('renders and grades every optional partitive item in ' + id, async ({ page }, testInfo) => {
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

test('shows partitive diagnostics and fallback and accepts object-pronoun alternatives', async ({
  page,
}) => {
  const forms = loadPack(ids[0]);
  const authored = forms.tests[0];
  const index = authored.exercises.findIndex((e) => e.type === 'fill-blank');
  const exercise = authored.exercises[index];
  await page.goto(`/study/${forms.id}/${authored.id}`);
  for (const answer of [exercise.answerDiagnostics![0].answers[0], 'xyz']) {
    await positionSession(page, forms.id, authored.id, index);
    await submit(page, exercise, answer);
    await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)incorrect(?:\s|$)/u);
    await expect(page.locator('.feedback .explanation')).toHaveCount(1);
    if (answer === 'xyz') await expect(page.locator('.feedback .diagnostic')).toHaveCount(0);
    else
      await expect(page.locator('.feedback')).toContainText(
        exercise.answerDiagnostics![0].explanation,
      );
  }
  const pack = loadPack('partitive-pronouns-questions');
  const pronouns = pack.tests[0];
  const position = pronouns.exercises.findIndex((e) => e.id === 'ptp-personal-singular-en-03');
  await page.goto(`/study/${pack.id}/${pronouns.id}`);
  for (const pronoun of ['him', 'her', 'him or her']) {
    await positionSession(page, pack.id, pronouns.id, position);
    await submit(page, pronouns.exercises[position], `I am waiting for ${pronoun}.`);
    await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
  }
});

test('grades expanded form alternatives and specific stem feedback', async ({ page }) => {
  test.setTimeout(120_000);
  const pack = loadPack('partitive-forms-plural-ita');
  const authored = pack.tests.find((t) => t.id === 'ptf-long-a-plural-test')!;
  for (const [index, exercise] of authored.exercises.entries()) {
    if (exercise.type !== 'fill-blank' || !exercise.id.includes('-produce-')) continue;
    await page.goto(`/study/${pack.id}/${authored.id}`);
    await expect(page.locator('.exercise-card')).toBeVisible({ timeout: 20_000 });
    for (const answer of exercise.acceptedAnswers) {
      await positionSession(page, pack.id, authored.id, index);
      await submit(page, exercise, answer);
      await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
    }
    const wrong = exercise.answerDiagnostics![0].answers[0];
    await positionSession(page, pack.id, authored.id, index);
    await submit(page, exercise, wrong);
    await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)incorrect(?:\s|$)/u);
    await expect(page.locator('.feedback')).toContainText(
      exercise.answerDiagnostics![0].explanation,
    );
    await positionSession(page, pack.id, authored.id, index);
    await submit(page, exercise, 'xyz');
    await expect(page.locator('.feedback .diagnostic')).toHaveCount(0);
    await expect(page.locator('.feedback .explanation')).toHaveCount(1);
  }
});

test('keeps expanded Partitive maps and reference preparations in authored order', async ({
  page,
}, testInfo) => {
  for (const id of [
    ...ids.filter((id) => id.startsWith('partitive-forms')),
    'partitive-adjectives',
  ]) {
    const pack = loadPack(id);
    await page.goto(`/topics/${id}`);
    await expect(page.locator('.test-card .test-title-row h3')).toHaveText(
      pack.tests.map((t) => t.title),
    );
    await expect(page.locator('.test-card').last()).toHaveClass(/review-test/u);
    await expect(page.locator('.test-card.review-test')).toHaveCount(1);
    await page.locator('.test-card').nth(2).scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath(id + '-ordered-map.png') });
  }
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Grammar reference for Partitive', exact: true });
  await expect(button).toBeVisible();
  const before = await learnerState(page);
  await button.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.reference-lesson-title')).toHaveText(
    ids.flatMap((id) => loadPack(id).lessons.map((l) => l.title)),
  );
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(button).toBeFocused();
  expect(await learnerState(page)).toEqual(before);
});

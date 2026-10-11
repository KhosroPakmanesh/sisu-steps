import { readFile, writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { Exercise } from '../../../src/features/learning/shared/content/exercise.models';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';
import { canAssemble, positionSession, submit } from '../support/focused-content-grading';

interface Revision {
  id: string;
  fields: string[];
  test?: string;
  lesson?: string;
}
interface Inventory {
  packs: Array<{
    id: string;
    changedExercises: Revision[];
    changedPractice: Revision[];
  }>;
}
const visibleFields = new Set([
  'type',
  'prompt',
  'acceptedAnswers',
  'explanation',
  'options',
  'optionFeedback',
  'sentenceExplanation',
]);
const visibleRevision = (revision: Revision) =>
  revision.fields.some((field) => visibleFields.has(field));

let packs: TopicPack[];
let inventory: Inventory;
test.beforeAll(async () => {
  packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
  inventory = JSON.parse(
    await readFile('../specs/content-assessments/lesson-consolidation-inventory.json', 'utf8'),
  ) as Inventory;
});

test('renders and grades every revised retained scored question', async ({ page }, testInfo) => {
  test.setTimeout(600_000);
  const records: string[] = [];
  const captured = new Set<string>();
  let checkedFallback = false;
  for (const changed of inventory.packs) {
    const pack = packs.find((pack) => pack.id === changed.id)!;
    for (const revision of changed.changedExercises.filter(visibleRevision)) {
      const authored = pack.tests.find((test) => test.id === revision.test)!;
      const index = authored.exercises.findIndex((exercise) => exercise.id === revision.id);
      const exercise = authored.exercises[index];
      await page.goto(`/study/${pack.id}/${authored.id}`);
      await expect(page.locator('.exercise-card')).toBeVisible();
      for (const answer of reachableAnswers(exercise)) {
        await positionSession(page, pack.id, authored.id, index);
        await expect(page.locator('.exercise-card h2')).toHaveText(exercise.prompt);
        await submit(page, exercise, answer);
        await expect(page.locator('.feedback')).toHaveClass(/\bcorrect\b/u);
        await expect(page.locator('.feedback')).toContainText(exercise.explanation);
        if (exercise.sentenceExplanation)
          await expect(page.locator('.sentence-lesson')).toContainText(
            exercise.sentenceExplanation.translation,
          );
      }
      for (const diagnostic of exercise.answerDiagnostics ?? [])
        for (const answer of diagnostic.answers) {
          if (!reachable(exercise, answer)) continue;
          await positionSession(page, pack.id, authored.id, index);
          await submit(page, exercise, answer);
          await expect(page.locator('.feedback')).toHaveClass(/\bincorrect\b/u);
          await expect(page.locator('.feedback')).toContainText(diagnostic.explanation);
        }
      if (!checkedFallback && !['multiple-choice', 'word-order'].includes(exercise.type)) {
        await positionSession(page, pack.id, authored.id, index);
        await submit(page, exercise, 'zzzz');
        const feedback = page.locator('.feedback');
        await expect(feedback).toHaveClass(/\bincorrect\b/u);
        await expect(feedback.locator('.diagnostic')).toHaveCount(0);
        await expect(feedback.locator('.explanation')).toHaveCount(1);
        await expect(feedback.locator('.explanation')).toContainText(exercise.explanation);
        checkedFallback = true;
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (!captured.has(exercise.type)) {
        await page.screenshot({ path: testInfo.outputPath(exercise.type + '-feedback.png') });
        captured.add(exercise.type);
      }
      records.push(exercise.id);
    }
  }
  expect(records).toHaveLength(
    inventory.packs.flatMap((pack) => pack.changedExercises.filter(visibleRevision)).length,
  );
  expect(checkedFallback).toBe(true);
  await writeFile(testInfo.outputPath('consolidation-grading.json'), JSON.stringify(records));
});

test('renders and grades the revised retained optional practice', async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const records: string[] = [];
  for (const changed of inventory.packs) {
    const pack = packs.find((pack) => pack.id === changed.id)!;
    for (const revision of changed.changedPractice.filter(visibleRevision)) {
      const lesson = pack.lessons.find((lesson) => lesson.id === revision.lesson)!;
      const authored = pack.tests.find((test) => test.lessonIds[0] === lesson.id)!;
      const index = lesson.practiceExercises.findIndex((exercise) => exercise.id === revision.id);
      const exercise = lesson.practiceExercises[index];
      await page.goto(`/learn/${pack.id}/${authored.id}`);
      const practice = page.locator('.lesson-practice');
      await practice.getByRole('button', { name: 'Start optional practice', exact: true }).click();
      for (let prior = 0; prior < index; prior++) {
        await practice.getByRole('button', { name: 'Show answer', exact: true }).click();
        await practice.getByRole('button', { name: 'Continue', exact: true }).click();
      }
      await expect(practice.locator('h4')).toHaveText(exercise.prompt);
      const answer = exercise.acceptedAnswers[0];
      if (exercise.type === 'multiple-choice')
        await practice.getByRole('radio', { name: answer, exact: true }).check();
      else if (exercise.type === 'word-order') {
        let remaining = answer;
        const tokens = [...exercise.tokens!];
        while (tokens.length) {
          const next = tokens.findIndex(
            (token) => remaining === token || remaining.startsWith(token + ' '),
          );
          expect(next, exercise.id).toBeGreaterThanOrEqual(0);
          const token = tokens.splice(next, 1)[0];
          await practice
            .locator('.practice-token-bank')
            .getByRole('button', { name: token, exact: true })
            .first()
            .click();
          remaining = remaining.slice(token.length).trimStart();
        }
      } else await practice.getByRole('textbox', { name: 'Your answer' }).fill(answer);
      await practice.getByRole('button', { name: 'Check answer', exact: true }).click();
      await expect(practice.locator('.feedback')).toHaveClass(/\bcorrect\b/u);
      await expect(practice.locator('.feedback')).toContainText(exercise.acceptedAnswers[0]);
      await expect(practice.locator('.feedback')).toContainText(exercise.explanation);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: testInfo.outputPath(exercise.id + '-optional.png') });
      records.push(exercise.id);
    }
  }
  expect(records).toHaveLength(
    inventory.packs.flatMap((pack) => pack.changedPractice.filter(visibleRevision)).length,
  );
  await writeFile(testInfo.outputPath('consolidation-practice.json'), JSON.stringify(records));
});

function reachable(exercise: Exercise, answer: string): boolean {
  if (exercise.type === 'multiple-choice') return exercise.options!.includes(answer);
  if (exercise.type === 'word-order') return canAssemble(exercise.tokens!, answer);
  return true;
}

function reachableAnswers(exercise: Exercise): string[] {
  return exercise.acceptedAnswers.filter((answer) => reachable(exercise, answer));
}

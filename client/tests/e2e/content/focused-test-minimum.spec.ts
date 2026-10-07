import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { Exercise } from '../../../src/features/learning/shared/content/exercise.models';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';
import {
  canAssemble,
  FOCUSED_EXPANSION_INVENTORY,
  positionSession,
  submit,
} from '../support/focused-content-grading';

let packs: TopicPack[];
test.beforeAll(async () => {
  packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
});
const isAdded = (testId: string, exercise: Exercise) => exercise.id.startsWith(testId + '-e1');

for (const inventory of FOCUSED_EXPANSION_INVENTORY) {
  test(`grades added models and complete feedback in ${inventory.id} at phone and tablet widths`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-wide');
    test.setTimeout(600_000);
    const records: string[] = [];
    const captured = new Set<string>();
    const pack = packs.find((item) => item.id === inventory.id)!;
    for (const authored of pack.tests.filter((t) => t.numberScope)) {
      await page.goto('/study/' + pack.id + '/' + authored.id);
      for (const [index, exercise] of authored.exercises.entries()) {
        await expect(page.locator('.exercise-card h2')).toHaveText(exercise.prompt);
        if (isAdded(authored.id, exercise)) {
          if (!captured.has(exercise.type))
            await page.screenshot({
              path: testInfo.outputPath(exercise.type + '-before.png'),
              fullPage: true,
            });
          await submit(page, exercise, exercise.acceptedAnswers[0]);
          await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
          await expect(page.locator('.feedback .explanation')).toContainText(exercise.explanation);
          for (const part of exercise.sentenceExplanation?.parts ?? []) {
            await expect(page.locator('.sentence-lesson')).toContainText(part.finnish);
            await expect(page.locator('.sentence-lesson')).toContainText(part.formation);
          }
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
          if (!captured.has(exercise.type)) {
            await page.screenshot({
              path: testInfo.outputPath(exercise.type + '-feedback.png'),
              fullPage: true,
            });
            captured.add(exercise.type);
          }
          records.push(exercise.id);
        } else {
          await page.getByRole('button', { name: 'Show answer', exact: true }).click();
        }
        await page.mouse.move(0, 0);
        await page
          .getByRole('button', {
            name: index === authored.exercises.length - 1 ? 'See result' : 'Continue',
            exact: true,
          })
          .click();
      }
    }
    expect(new Set(records).size).toBe(inventory.added);
    expect(captured.size).toBe(inventory.formats);
    await writeFile(testInfo.outputPath('new-question-models.json'), JSON.stringify(records));
  });

  test(`grades every reachable new alternative, wrong choice and typed diagnostic in ${inventory.id}`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-wide');
    test.setTimeout(600_000);
    const records: Array<{ id: string; answer: string; correct: boolean }> = [];
    const fallback = new Set<string>();
    const pack = packs.find((item) => item.id === inventory.id)!;
    for (const authored of pack.tests.filter((t) => t.numberScope)) {
      await page.goto('/study/' + pack.id + '/' + authored.id);
      await expect(page.locator('.exercise-card')).toBeVisible();
      for (const [index, exercise] of authored.exercises.entries()) {
        if (!isAdded(authored.id, exercise)) continue;
        const reachable = (answer: string) =>
          exercise.type === 'multiple-choice'
            ? exercise.options!.includes(answer)
            : exercise.type === 'word-order'
              ? canAssemble(exercise.tokens!, answer)
              : true;
        const wrong =
          exercise.type === 'multiple-choice'
            ? exercise.options!.filter((a) => !exercise.acceptedAnswers.includes(a))
            : (exercise.answerDiagnostics ?? []).flatMap((d) => d.answers).filter(reachable);
        for (const [correct, answers] of [
          [true, exercise.acceptedAnswers.slice(1).filter(reachable)],
          [false, wrong],
        ] as Array<[boolean, string[]]>)
          for (const answer of answers) {
            await positionSession(page, pack.id, authored.id, index);
            await expect(page.locator('.exercise-card h2')).toHaveText(exercise.prompt);
            await submit(page, exercise, answer);
            await expect(page.locator('.feedback')).toHaveClass(
              correct ? /(?:^|\s)correct(?:\s|$)/u : /(?:^|\s)incorrect(?:\s|$)/u,
            );
            if (!correct) {
              const diagnostic = exercise.answerDiagnostics?.find((d) =>
                d.answers.includes(answer),
              );
              await expect(page.locator('.feedback')).toContainText(
                diagnostic?.explanation ?? exercise.optionFeedback![answer],
              );
            }
            records.push({ id: exercise.id, answer, correct });
          }
        if (
          ['translation-fi', 'translation-en', 'fill-blank'].includes(exercise.type) &&
          !fallback.has(exercise.type)
        ) {
          await positionSession(page, pack.id, authored.id, index);
          await submit(page, exercise, 'xyz');
          await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)incorrect(?:\s|$)/u);
          await expect(page.locator('.feedback .diagnostic')).toHaveCount(0);
          await expect(page.locator('.feedback .explanation')).toHaveCount(1);
          await expect(page.locator('.feedback .explanation')).toContainText(exercise.explanation);
          fallback.add(exercise.type);
        }
      }
    }
    expect(records.filter((r) => r.correct)).toHaveLength(inventory.alternatives);
    expect(records.filter((r) => !r.correct)).toHaveLength(inventory.wrong);
    expect(fallback.size).toBe(inventory.formats === 4 ? 2 : 3);
    await writeFile(
      testInfo.outputPath('new-alternatives-diagnostics.json'),
      JSON.stringify(records),
    );
  });
}

test('checks all eight final editorial corrections and alternatives at every viewport', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const ids = new Set([
    'ppo-written-reference-singular-test-e107',
    'ppo-written-reference-singular-test-e108',
    'ppo-written-reference-singular-test-e109',
    'ppo-written-reference-singular-test-e110',
    'aps-possessors-plural-test-e105',
    'aps-possessors-plural-test-e106',
    'aps-possessors-singular-test-e103',
    'nds-negative-transformation-singular-test-e105',
  ]);
  const oldModels: Record<string, string> = {
    'aps-possessors-plural-test-e105': 'They have a pillow.',
    'aps-possessors-plural-test-e106': 'You have a dog.',
    'aps-possessors-singular-test-e103': 'I have a dog.',
    'nds-negative-transformation-singular-test-e105': 'That car is not at home.',
  };
  const records: Array<{ id: string; answer: string; correct: boolean }> = [];
  const captured = new Set<string>();
  for (const pack of packs)
    for (const authored of pack.tests.filter((t) => t.exercises.some((e) => ids.has(e.id)))) {
      await page.goto('/study/' + pack.id + '/' + authored.id);
      await expect(page.locator('.exercise-card')).toBeVisible();
      for (const [index, exercise] of authored.exercises.entries()) {
        if (!ids.has(exercise.id)) continue;
        for (const answer of exercise.acceptedAnswers) {
          await positionSession(page, pack.id, authored.id, index);
          await expect(page.locator('.exercise-card')).toContainText(exercise.instruction);
          await expect(page.locator('.exercise-card h2')).toHaveText(exercise.prompt);
          if (exercise.type === 'translation-fi')
            expect(exercise.instruction).toBe('Write in Finnish.');
          await submit(page, exercise, answer);
          await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
          await expect(page.locator('.feedback')).toContainText(exercise.explanation);
          for (const part of exercise.sentenceExplanation?.parts ?? [])
            await expect(page.locator('.sentence-lesson')).toContainText(part.formation);
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
          if (!captured.has(exercise.type)) {
            await page.screenshot({
              path: testInfo.outputPath(exercise.type + '-final-feedback.png'),
              fullPage: true,
            });
            captured.add(exercise.type);
          }
          records.push({ id: exercise.id, answer, correct: true });
        }
        if (oldModels[exercise.id]) {
          await positionSession(page, pack.id, authored.id, index);
          await submit(page, exercise, oldModels[exercise.id]);
          await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)incorrect(?:\s|$)/u);
          records.push({
            id: exercise.id,
            answer: oldModels[exercise.id],
            correct: false,
          });
        }
      }
    }
  expect(new Set(records.map((r) => r.id)).size).toBe(8);
  expect(records.filter((r) => r.correct)).toHaveLength(15);
  expect(records.filter((r) => !r.correct)).toHaveLength(4);
  await writeFile(testInfo.outputPath('final-editorial-grading.json'), JSON.stringify(records));
});

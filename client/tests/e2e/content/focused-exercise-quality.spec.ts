import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';
import { canAssemble, positionSession, submit } from '../support/focused-content-grading';

import {
  FOCUSED_QUALITY_PACK_IDS,
  FOCUSED_QUALITY_REVISION_IDS as ids,
} from '../support/focused-quality-revision-ids';

let packs: TopicPack[];
test.beforeAll(async () => {
  packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
});

for (const packId of FOCUSED_QUALITY_PACK_IDS)
  test('renders and grades revised tasks in ' + packId, async ({ page }, testInfo) => {
    test.setTimeout(600_000);
    const records: Array<{ id: string; answer: string; correct: boolean }> = [];
    const unreachable: Array<{ id: string; answer: string }> = [];
    const fallback = new Set<string>();
    const captured = new Set<string>();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    for (const pack of packs.filter((item) => item.id === packId))
      for (const authored of pack.tests.filter((item) =>
        item.exercises.some((e) => ids.has(e.id)),
      )) {
        await page.goto('/study/' + pack.id + '/' + authored.id);
        await expect(page.locator('.exercise-card')).toBeVisible();
        for (const [index, exercise] of authored.exercises.entries()) {
          if (!ids.has(exercise.id)) continue;
          const reachable = (answer: string) =>
            exercise.type === 'multiple-choice'
              ? exercise.options!.includes(answer)
              : exercise.type === 'word-order'
                ? canAssemble(exercise.tokens!, answer)
                : true;
          const wrong =
            exercise.type === 'multiple-choice'
              ? exercise.options!.filter((answer) => !exercise.acceptedAnswers.includes(answer))
              : (exercise.answerDiagnostics ?? []).flatMap((diagnostic) => diagnostic.answers);
          if (exercise.instruction === 'Write the question word and noun.')
            wrong.push(exercise.acceptedAnswers[0].split(' ').slice(1).join(' '));

          for (const [correct, answers] of [
            [true, exercise.acceptedAnswers],
            [false, wrong],
          ] as Array<[boolean, string[]]>)
            for (const answer of answers) {
              if (!reachable(answer)) {
                unreachable.push({ id: exercise.id, answer });
                continue;
              }
              await positionSession(page, pack.id, authored.id, index);
              await expect(page.locator('.exercise-card h2')).toHaveText(exercise.prompt);
              await expect(page.locator('.exercise-card')).toContainText(exercise.instruction);
              const capture = `${exercise.id === 'ppo-written-reference-singular-test-e102' ? exercise.id : exercise.type}-${correct ? 'correct' : 'incorrect'}`;
              if (!captured.has(capture))
                await page.screenshot({
                  path: testInfo.outputPath(capture + '-before.png'),
                  fullPage: true,
                });
              await submit(page, exercise, answer);
              await expect(page.locator('.feedback')).toHaveClass(
                correct ? /(?:^|\s)correct(?:\s|$)/u : /(?:^|\s)incorrect(?:\s|$)/u,
              );
              await expect(page.locator('.feedback .explanation')).toContainText(
                exercise.explanation,
              );
              if (!correct) {
                const diagnostic = exercise.answerDiagnostics?.find((item) =>
                  item.answers.includes(answer),
                );
                await expect(page.locator('.feedback')).toContainText(
                  diagnostic?.explanation ??
                    exercise.optionFeedback?.[answer] ??
                    exercise.explanation,
                );
              }
              for (const part of exercise.sentenceExplanation?.parts ?? []) {
                await expect(page.locator('.sentence-lesson')).toContainText(part.finnish);
                await expect(page.locator('.sentence-lesson')).toContainText(part.formation);
              }
              expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
              ).toBe(true);
              if (!captured.has(capture)) {
                await page.screenshot({
                  path: testInfo.outputPath(capture + '-feedback.png'),
                  fullPage: true,
                });
                captured.add(capture);
              }
              records.push({ id: exercise.id, answer, correct });
            }
          if (exercise.type !== 'multiple-choice' && !fallback.has(exercise.type)) {
            await positionSession(page, pack.id, authored.id, index);
            await submit(
              page,
              exercise,
              exercise.type === 'word-order' ? [...exercise.tokens!].reverse().join(' ') : 'xyz',
            );
            await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)incorrect(?:\s|$)/u);
            await expect(page.locator('.feedback .diagnostic')).toHaveCount(0);
            await expect(page.locator('.feedback .explanation')).toHaveCount(1);
            fallback.add(exercise.type);
          }
        }
      }
    expect(new Set(records.map((record) => record.id)).size).toBe(
      packs
        .find((p) => p.id === packId)!
        .tests.flatMap((t) => t.exercises)
        .filter((e) => ids.has(e.id)).length,
    );
    expect(errors).toEqual([]);
    await writeFile(
      testInfo.outputPath('quality-revisions.json'),
      JSON.stringify({ records, unreachable, errors, fallback: [...fallback] }),
    );
  });

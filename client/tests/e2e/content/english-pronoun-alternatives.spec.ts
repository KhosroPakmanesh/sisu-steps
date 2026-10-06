import { writeFile } from 'node:fs/promises';
import { expect, Page, test } from '@playwright/test';
import { Exercise } from '../../../src/features/learning/shared/content/exercise.models';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { LearnerState } from '../../../src/features/learning/shared/state/learner-state.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';

let packs: TopicPack[];

test.beforeAll(async () => {
  packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
});

test('rejects got constructions in scored and optional possession answers', async ({ page }) => {
  const cases = [
    ['affirmative-possession', 'aps-possessors-test-e015', 'He has got a pillow.'],
    ['negative-possession', 'nps-fixed-negative-test-e015', "He hasn't got a pillow."],
    ['possession-questions', 'pqs-onko-test-e009', 'Has he got a pen?'],
  ];
  for (const [packId, id, answer] of cases) {
    const pack = packs.find((item) => item.id === packId)!;
    const authoredTest = pack.tests.find((item) =>
      item.exercises.some((exercise) => exercise.id === id),
    )!;
    const exercise = authoredTest.exercises.find((item) => item.id === id)!;
    await positionSession(page, packId, authoredTest.id, authoredTest.exercises.indexOf(exercise));
    await page.getByRole('textbox', { name: 'Your answer' }).fill(answer);
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await expect(page.locator('.feedback')).toHaveClass(/incorrect/u);
    await expect(page.locator('.feedback')).toContainText(exercise.acceptedAnswers[0]);
  }
  const pack = packs.find((item) => item.id === 'affirmative-possession')!;
  const lesson = pack.lessons.find((item) => item.id === 'aps-sentences')!;
  const index = lesson.practiceExercises.findIndex((item) => item.type === 'translation-en');
  await page.goto('/learn/affirmative-possession/aps-sentences-singular-test');
  await page.getByRole('button', { name: 'Start optional practice' }).click();
  for (let prior = 0; prior < index; prior += 1) {
    await page.getByRole('button', { name: 'Show answer', exact: true }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
  const answer = lesson.practiceExercises[index].acceptedAnswers[0].replace(
    /\b(have|has)\b/u,
    '$1 got',
  );
  await page.getByRole('textbox', { name: 'Your answer' }).fill(answer);
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.locator('.feedback')).toHaveClass(/incorrect/u);
});

test('accepts he, she, and the combined answer for the reported pillow question', async ({
  page,
}, testInfo) => {
  const pack = packs.find((item) => item.id === 'affirmative-possession')!;
  const authoredTest = pack.tests.find((item) => item.id === 'aps-possessors-singular-test')!;
  const index = authoredTest.exercises.findIndex((item) => item.id === 'aps-possessors-test-e015');
  for (const answer of ['He has a pillow.', 'She has a pillow.', 'He or she has a pillow.']) {
    await positionSession(page, pack.id, authoredTest.id, index);
    await expect(page.locator('.exercise-card h2')).toContainText('You may use “he” or “she”.');
    await submit(page, answer);
  }
  await page.screenshot({
    path: testInfo.outputPath('pillow-combined-answer.png'),
    fullPage: true,
  });
});

test('audits every applicable scored and optional English pronoun and possession translation', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  test.setTimeout(480_000);
  const audit: Array<{ id: string; answer: string; rendered: string }> = [];
  for (const pack of packs) {
    for (const authoredTest of pack.tests) {
      for (const [index, exercise] of authoredTest.exercises.entries()) {
        if (!shouldAudit(pack, exercise)) continue;
        for (const answer of pronounAlternatives(exercise)) {
          await positionSession(page, pack.id, authoredTest.id, index);
          await expect(page.locator('.exercise-card h2')).toHaveText(exercise.prompt);
          await submit(page, answer);
          audit.push({
            id: exercise.id,
            answer,
            rendered: await page.locator('.feedback').innerText(),
          });
        }
      }
    }
    for (const lesson of pack.lessons) {
      for (const [index, exercise] of lesson.practiceExercises.entries()) {
        if (!shouldAudit(pack, exercise)) continue;
        const authoredTest = pack.tests.find((item) => item.lessonIds.includes(lesson.id))!;
        for (const answer of pronounAlternatives(exercise)) {
          await page.goto(`/learn/${pack.id}/${authoredTest.id}`);
          await page.reload();
          await page.getByRole('button', { name: 'Start optional practice' }).click();
          for (let prior = 0; prior < index; prior += 1) {
            await page.getByRole('button', { name: 'Show answer', exact: true }).click();
            await page.getByRole('button', { name: 'Continue', exact: true }).click();
          }
          await expect(page.locator('.practice-card h4')).toHaveText(exercise.prompt);
          await submit(page, answer);
          audit.push({
            id: exercise.id,
            answer,
            rendered: await page.locator('.feedback').innerText(),
          });
        }
      }
    }
  }
  expect(new Set(audit.map((item) => item.id)).size).toBe(82);
  expect(audit).toHaveLength(162);
  await writeFile(
    testInfo.outputPath('pronoun-rendered-audit.json'),
    JSON.stringify(audit, null, 2),
  );
});

function hasEnglishPronoun(exercise: Exercise): boolean {
  return (
    exercise.type === 'translation-en' &&
    exercise.acceptedAnswers.some((answer) => /\b(?:he|she|his|her)\b/iu.test(answer))
  );
}

function shouldAudit(pack: TopicPack, exercise: Exercise): boolean {
  return (
    hasEnglishPronoun(exercise) ||
    (exercise.type === 'translation-en' &&
      ['affirmative-possession', 'negative-possession', 'possession-questions'].includes(pack.id))
  );
}

function pronounAlternatives(exercise: Exercise): string[] {
  const model = exercise.acceptedAnswers[0];
  if (!hasEnglishPronoun(exercise)) return [model];
  const subject = /\b(?:he or she|he|she)\b/iu;
  const possessive = /\b(?:his or her|his|her)\b/iu;
  const alternatives = subject.test(model)
    ? ['he', 'she', 'he or she']
    : ['his', 'her', 'his or her'];
  return alternatives.map((pronoun) =>
    model.replace(subject.test(model) ? subject : possessive, pronoun),
  );
}

async function submit(page: Page, answer: string): Promise<void> {
  await page.getByRole('textbox', { name: 'Your answer' }).fill(answer);
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.locator('.feedback')).toHaveClass(/correct/u);
}

async function positionSession(
  page: Page,
  topicId: string,
  testId: string,
  index: number,
): Promise<void> {
  await page.goto(`/study/${topicId}/${testId}`);
  await expect(page.locator('.exercise-card')).toBeVisible();
  await page.evaluate(
    ({ topicId, testId, index }) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('sisu-steps', 1);
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const transaction = db.transaction('learner-state', 'readwrite');
          const store = transaction.objectStore('learner-state');
          const request = store.get('current');
          request.onsuccess = () => {
            const state = request.result as LearnerState;
            const session = state.sessions.find(
              (item) => item.topicId === topicId && item.testId === testId,
            )!;
            session.currentIndex = index;
            session.answers = session.exerciseIds.slice(0, index).map((exerciseId) => ({
              exerciseId,
              submittedAnswer: '',
              correct: false,
              skipped: true,
              answeredAt: session.startedAt,
            }));
            store.put(state, 'current');
          };
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          transaction.onerror = () => {
            db.close();
            reject(transaction.error);
          };
        };
      }),
    { topicId, testId, index },
  );
  await page.reload();
}

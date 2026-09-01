import { expect, type Page, test } from '@playwright/test';
import reviewContent from '../../content/vowel-harmony-kpt-tplural/tests/foundations-review.json';
import type { ExerciseTest } from '../../src/features/learning/shared/content/content.models';
import type { LearnerState } from '../../src/shared/domain/learner-state.models';

const topic = 'vowel-harmony-kpt-tplural';
const review = reviewContent as ExerciseTest;

for (const appearance of ['Day', 'Night']) {
  test(`completes and resumes the single cumulative review in ${appearance}`, async ({
    page,
  }, info) => {
    test.setTimeout(120_000);
    await page.goto(`/topics/${topic}`);
    await page.getByRole('radio', { name: appearance, exact: true }).focus();
    await page.keyboard.press('Space');
    const card = page.locator('.review-test');
    await expect(card).toHaveCount(1);
    await expect(card.getByRole('heading')).toHaveText('Foundations review');
    await expect(card).toContainText('33 exercises');
    await expect(page.locator('body')).not.toContainText('Foundations checkpoint review');
    await card.getByRole('link', { name: 'Learn first' }).click();
    await expect(page.locator('.lesson-list button')).toHaveCount(13);
    await expect(page.locator('.lesson-hero h1')).toHaveText('Foundations review');
    await page.goto(`/study/${topic}/foundations-review`);

    for (const [index, exercise] of review.exercises.entries()) {
      await expect(page.locator('.question-count')).toHaveText(`${index + 1} / 33`);
      await expect(page.locator('.exercise-card h2')).toHaveText(exercise.prompt);
      const answer = exercise.acceptedAnswers[0];
      if (exercise.type === 'multiple-choice') {
        await page.getByRole('radio', { name: answer, exact: true }).check();
      } else if (exercise.type === 'word-order') {
        for (const word of answer.split(' '))
          await page
            .getByLabel('Available words')
            .getByRole('button', { name: word, exact: true })
            .click();
      } else {
        await page.getByRole('textbox', { name: 'Your answer', exact: true }).fill(answer);
      }
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      await expect(page.locator('.feedback')).toHaveClass(/\bcorrect\b/);
      await expect(page.locator('.feedback .explanation')).toContainText(exercise.explanation);
      if (exercise.sentenceExplanation)
        await expect(page.locator('.sentence-lesson')).toContainText(
          exercise.sentenceExplanation.translation,
        );
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (index === 5 || index === 18)
        await page
          .locator('.exercise-card')
          .screenshot({ path: info.outputPath(`special-k-${index}.png`) });
      await page
        .getByRole('button', { name: index === 32 ? 'See result' : 'Continue', exact: true })
        .click();
      if (index === 5) {
        await page.getByRole('link', { name: 'Leave test and save progress' }).click();
        await expect(page).toHaveURL(`/topics/${topic}`);
        await page.reload();
        await expect(card).toContainText('Place saved: 7/33');
        await card.getByRole('link', { name: 'Resume', exact: true }).click();
      }
    }
    await expect(page.locator('.result-card')).toContainText('You answered 33 of 33 correctly.');
    await expect(page.locator('.result-ring')).toContainText('100%');
    await page
      .locator('.result-card')
      .screenshot({ path: info.outputPath('completed-review.png') });
    await page.getByRole('link', { name: 'Open reports' }).click();
    const row = page.locator('.report-row').filter({ hasText: 'Foundations review' });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText('1 attempt');
    await expect(row.locator('td')).toHaveText(['100%', '100%', '100%', '100%']);
    await page.reload();
    await expect(row).toContainText('1 attempt');
    const stored = await learnerState(page);
    expect(stored.sessions).toEqual([]);
    expect(stored.attempts).toEqual([
      expect.objectContaining({ testId: 'foundations-review', total: 33, correctCount: 33 }),
    ]);
  });
}

test('resets version 5.1 progress, including the retired review, on the version 6 update', async ({
  page,
}) => {
  await page.goto(`/topics/${topic}`);
  await expect(page.locator('.review-test')).toHaveCount(1);
  const when = '2026-08-30T12:00:00.000Z';
  const old: LearnerState = {
    schemaVersion: 1,
    contentPackVersions: { [topic]: '5.1.0' },
    attempts: ['guided-review', 'foundations-review', 'vowel-families'].map((testId) => ({
      id: `old-attempt-${testId}`,
      mode: 'test',
      topicId: topic,
      testId,
      title: testId,
      startedAt: when,
      completedAt: when,
      answers: [],
      correctCount: 0,
      total: 0,
      percentage: 0,
    })),
    sessions: ['guided-review', 'foundations-review'].map((testId) => ({
      id: `old-session-${testId}`,
      mode: 'test',
      topicId: topic,
      testId,
      title: testId,
      startedAt: when,
      updatedAt: when,
      answers: [],
      exerciseIds: ['ff-a1-t13-e12', 'ff-a1-t13-e04'],
      currentIndex: 0,
    })),
    unresolvedMistakeIds: ['ff-a1-t13-e12', 'ff-a1-t13-e04'],
    lessonCompletions: [
      { lessonId: 'vowel-harmony-basics', lessonVersion: '5.1.0', completedAt: when },
    ],
    correctionRecords: [
      {
        exerciseId: 'ff-a1-t13-e12',
        parallelExerciseId: 'ff-a1-t13-e13',
        targetSkill: 'KPT recognition',
        correctedAt: when,
        nextReviewAt: when,
        reviewStage: 1,
        reviewAttempts: 1,
      },
      {
        exerciseId: 'ff-a1-t13-e04',
        parallelExerciseId: 'ff-a1-t13-e05',
        targetSkill: 'KPT double consonants',
        correctedAt: when,
        nextReviewAt: when,
        reviewStage: 1,
        reviewAttempts: 1,
      },
    ],
    learnerNotes: [{ topicId: topic, text: 'My private topic note', updatedAt: when }],
  };
  await learnerState(page, old);
  await page.reload();
  await expect(page.locator('.topic-overview')).toContainText('0/14');
  await expect(page.locator('.topic-overview')).toContainText('0/13');
  expect(await learnerState(page)).toEqual({
    schemaVersion: 1,
    contentPackVersions: { [topic]: '6.0.0' },
    attempts: [],
    sessions: [],
    unresolvedMistakeIds: [],
    lessonCompletions: [],
    correctionRecords: [],
    learnerNotes: old.learnerNotes,
  });
  await expect(page.getByRole('link', { name: 'Resume', exact: true })).toHaveCount(0);
  await page.locator('.review-test').getByRole('link', { name: 'Start test' }).click();
  await expect(page.locator('.question-count')).toHaveText('1 / 33');
});

async function learnerState(page: Page, replacement?: LearnerState): Promise<LearnerState> {
  return page.evaluate(
    (state) =>
      new Promise<LearnerState>((resolve, reject) => {
        const open = indexedDB.open('sisu-steps', 1);
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const transaction = db.transaction('learner-state', state ? 'readwrite' : 'readonly');
          const store = transaction.objectStore('learner-state');
          const request = state ? store.put(state, 'current') : store.get('current');
          transaction.oncomplete = () => {
            db.close();
            resolve(state ?? request.result);
          };
          transaction.onerror = () => {
            db.close();
            reject(transaction.error);
          };
        };
      }),
    replacement,
  );
}

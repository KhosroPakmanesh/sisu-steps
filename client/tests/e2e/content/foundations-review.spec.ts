import { expect, type Page, test } from '@playwright/test';
import reviewContent from '../../../content/vowel-harmony-location-endings/tests/location-transfer-review.json';
import type { ExerciseTest } from '../../../src/features/learning/shared/content/content.models';
import type { LearnerState } from '../../../src/features/learning/shared/state/learner-state.models';

const topic = 'vowel-harmony-location-endings';
const review = reviewContent as ExerciseTest;

for (const appearance of ['Day', 'Night']) {
  test(`completes and resumes a successor-pack review in ${appearance}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`/topics/${topic}`);
    await page.getByRole('radio', { name: appearance, exact: true }).focus();
    await page.keyboard.press('Space');
    const card = page.locator('.review-test').filter({ hasText: review.title });
    await expect(page.locator('.review-test')).toHaveCount(2);
    await expect(card).toHaveCount(1);
    await expect(card).toContainText(`${review.exercises.length} exercises`);
    await card.getByRole('link', { name: 'Learn first' }).click();
    await expect(page.locator('.lesson-list button')).toHaveCount(4);
    await expect(page.locator('.lesson-hero h1')).toHaveText(review.title);
    await page.goto(`/study/${topic}/${review.id}`);

    for (const [index, exercise] of review.exercises.entries()) {
      await expect(page.locator('.question-count')).toHaveText(
        `${index + 1} / ${review.exercises.length}`,
      );
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
      await page
        .getByRole('button', {
          name: index === review.exercises.length - 1 ? 'See result' : 'Continue',
          exact: true,
        })
        .click();
      if (index === 5) {
        await page.getByRole('link', { name: 'Leave test and save progress' }).click();
        await expect(page).toHaveURL(`/topics/${topic}`);
        await page.reload();
        await expect(card).toContainText(`Place saved: 7/${review.exercises.length}`);
        await card.getByRole('link', { name: 'Resume', exact: true }).click();
      }
    }
    await expect(page.locator('.result-card')).toContainText(
      `You answered ${review.exercises.length} of ${review.exercises.length} correctly.`,
    );
    await expect(page.locator('.result-ring')).toContainText('100%');
    await page.getByRole('link', { name: 'Open stats' }).click();
    await expect(page).toHaveURL(`/stats/${topic}`);
    const row = page.locator('.stats-row').filter({ hasText: review.title });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText('1 attempt');
    await expect(row.locator('td:not(.stats-clear-cell)')).toHaveText([
      '100%',
      '100%',
      '100%',
      '100%',
    ]);
    const stored = await learnerState(page);
    expect(stored.sessions).toEqual([]);
    expect(stored.attempts).toEqual([
      expect.objectContaining({
        topicId: topic,
        testId: review.id,
        total: review.exercises.length,
        correctCount: review.exercises.length,
      }),
    ]);
  });
}

test('resets stored learner data that references an unsupported pack', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(`/topics/${topic}`);
  await expect(page.locator('.topic-overview')).toBeVisible();
  const when = '2026-09-05T12:00:00.000Z';
  const unsupported: LearnerState = {
    schemaVersion: 1,
    contentPackVersions: { 'vowel-harmony-kpt-tplural': '6.1.0' },
    attempts: [
      {
        id: 'unsupported-attempt',
        mode: 'test',
        topicId: 'vowel-harmony-kpt-tplural',
        testId: 'kpt-verbs',
        title: 'KPT in verbs',
        startedAt: when,
        completedAt: when,
        answers: [],
        correctCount: 0,
        incorrectCount: 0,
        skippedCount: 0,
        total: 0,
        percentage: 0,
      },
    ],
    sessions: [],
    unresolvedMistakeIds: [],
    lessonCompletions: [
      { lessonId: 'vowel-harmony-basics', lessonVersion: '5.1.0', completedAt: when },
    ],
    correctionRecords: [],
    learnerNotes: [
      {
        topicId: 'vowel-harmony-kpt-tplural',
        lessonId: 'vowel-harmony-basics',
        text: 'Discard this note',
        updatedAt: when,
      },
    ],
  };
  await learnerState(page, unsupported);
  await page.reload();
  await expect(page.locator('.topic-overview')).toBeVisible();
  await expect
    .poll(async () => (await learnerState(page)).contentPackVersions)
    .not.toHaveProperty('vowel-harmony-kpt-tplural');

  const reset = await learnerState(page);
  expect(reset.contentPackVersions).toMatchObject({
    'vowel-harmony-location-endings': '1.0.0',
    'kpt-singular-forms': '1.0.0',
    't-plural-agreement': '1.0.0',
  });
  expect(reset.contentPackVersions).not.toHaveProperty('vowel-harmony-kpt-tplural');
  expect(reset.attempts).toEqual([]);
  expect(reset.sessions).toEqual([]);
  expect(reset.unresolvedMistakeIds).toEqual([]);
  expect(reset.lessonCompletions).toEqual([]);
  expect(reset.correctionRecords).toEqual([]);
  expect(reset.learnerNotes).toEqual([]);
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

import { expect, Page } from '@playwright/test';
import { Exercise } from '../../../src/features/learning/shared/content/exercise.models';
import { LearnerState } from '../../../src/features/learning/shared/state/learner-state.models';

export const FOCUSED_EXPANSION_INVENTORY = [
  {
    id: 'affirmative-possession',
    added: 48,
    scored: 120,
    alternatives: 20,
    wrong: 52,
    formats: 5,
  },
  {
    id: 'negative-demonstrative-statements',
    added: 20,
    scored: 40,
    alternatives: 14,
    wrong: 20,
    formats: 5,
  },
  {
    id: 'negative-olla-statements',
    added: 16,
    scored: 40,
    alternatives: 0,
    wrong: 8,
    formats: 4,
  },
  {
    id: 'negative-possession',
    added: 48,
    scored: 120,
    alternatives: 64,
    wrong: 44,
    formats: 5,
  },
  {
    id: 'negative-possession-questions',
    added: 48,
    scored: 120,
    alternatives: 34,
    wrong: 44,
    formats: 5,
  },
  {
    id: 'olla-questions-short-answers',
    added: 16,
    scored: 40,
    alternatives: 8,
    wrong: 14,
    formats: 4,
  },
  {
    id: 'personal-pronouns-affirmative-olla',
    added: 48,
    scored: 120,
    alternatives: 15,
    wrong: 40,
    formats: 4,
  },
  {
    id: 'possession-questions',
    added: 48,
    scored: 120,
    alternatives: 18,
    wrong: 40,
    formats: 5,
  },
  {
    id: 'possessive-pronouns-endings',
    added: 80,
    scored: 160,
    alternatives: 40,
    wrong: 128,
    formats: 5,
  },
] as const;

export function canAssemble(tokens: string[], answer: string): boolean {
  let rest = answer;
  const remaining = [...tokens];
  while (remaining.length) {
    const index = remaining.findIndex((t) => rest === t || rest.startsWith(t + ' '));
    if (index < 0) return false;
    const [token] = remaining.splice(index, 1);
    rest = rest.slice(token.length).trimStart();
  }
  return rest.length === 0;
}

export async function submit(page: Page, exercise: Exercise, answer: string): Promise<void> {
  await page.mouse.move(0, 0);
  const card = page.locator('.exercise-card');
  if (exercise.type === 'multiple-choice')
    await card.getByRole('radio', { name: answer, exact: true }).check();
  else if (exercise.type === 'word-order') {
    let remaining = answer;
    const tokens = [...exercise.tokens!];
    while (tokens.length) {
      const index = tokens.findIndex(
        (token) => remaining === token || remaining.startsWith(token + ' '),
      );
      expect(index, exercise.id + ': use the authored whole tiles').toBeGreaterThanOrEqual(0);
      const token = tokens.splice(index, 1)[0];
      await card
        .locator('.token-bank')
        .getByRole('button', { name: token, exact: true })
        .first()
        .click();
      remaining = remaining.slice(token.length).trimStart();
    }
    expect(remaining).toBe('');
  } else await card.getByRole('textbox', { name: 'Your answer' }).fill(answer);
  await page.mouse.move(0, 0);
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
}

export async function positionSession(
  page: Page,
  packId: string,
  testId: string,
  index: number,
): Promise<void> {
  await expect(page.locator('.exercise-card')).toBeVisible();
  await page.evaluate(
    ({ packId, testId, index }) =>
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
              (item) => item.topicId === packId && item.testId === testId,
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
    { packId, testId, index },
  );
  await page.reload();
}

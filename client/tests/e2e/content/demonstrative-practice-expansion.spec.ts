import { writeFile } from 'node:fs/promises';
import { expect, Page, test } from '@playwright/test';
import { Exercise } from '../../../src/features/learning/shared/content/exercise.models';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { LearnerState } from '../../../src/features/learning/shared/state/learner-state.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';

const IDS = [
  'sdp-independent-use-test',
  'pdp-independent-use-test',
  'sdp-se-han-test',
  'pdp-ne-he-test',
];
let pack: TopicPack;
test.beforeAll(async () => {
  pack = (await loadContentSource('content')).packs.find(
    (item) => item['id'] === 'demonstrative-pronouns',
  ) as unknown as TopicPack;
});
const isAdded = (exercise: Exercise) => /-e0(?:17|18|19|20)$/u.test(exercise.id);

test('renders unchanged preparation and grades all 80 questions in the four expanded tests', async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  const records: string[] = [];
  const added: string[] = [];
  const captured = new Set<string>();
  await page.goto('/topics/' + pack.id);
  await expect(page.locator('.test-card h3')).toHaveText(pack.tests.map((item) => item.title));
  await expect(page.locator('.topic-overview')).toContainText('280');
  for (const authored of pack.tests.filter((item) => IDS.includes(item.id))) {
    const lesson = pack.lessons.find((item) => item.id === authored.lessonIds[0])!;
    await page.goto('/learn/' + pack.id + '/' + authored.id);
    const reader = page.locator('.lesson-reader');
    await expect(reader.locator('h2').first()).toHaveText(lesson.title);
    for (const section of lesson.sections)
      for (const paragraph of section.paragraphs) await expect(reader).toContainText(paragraph);
    for (const example of lesson.examples) {
      await expect(reader).toContainText(example.finnish);
      await expect(reader).toContainText(example.english);
      for (const step of example.steps) await expect(reader).toContainText(step);
    }
    await page.goto('/study/' + pack.id + '/' + authored.id);
    for (const [index, exercise] of authored.exercises.entries()) {
      await expect(page.locator('.exercise-card h2')).toHaveText(exercise.prompt);
      await expect(page.locator('.question-count')).toHaveText(index + 1 + ' / 20');
      if (isAdded(exercise) && !captured.has(exercise.type)) {
        await page.screenshot({
          path: testInfo.outputPath(exercise.type + '-before.png'),
          fullPage: true,
        });
        captured.add(exercise.type);
      }
      if (exercise.id === 'pdp-independent-use-test-e020')
        await page.screenshot({
          path: testInfo.outputPath('supplied-location-before.png'),
          fullPage: true,
        });
      await submit(page, exercise, exercise.acceptedAnswers[0]);
      await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
      await expect(page.locator('.feedback')).toContainText(exercise.explanation);
      if (isAdded(exercise)) {
        added.push(exercise.id);
        for (const part of exercise.sentenceExplanation!.parts)
          await expect(page.locator('.sentence-lesson')).toContainText(part.finnish);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
      if (exercise.id === 'pdp-independent-use-test-e020')
        await page.screenshot({
          path: testInfo.outputPath('supplied-location-feedback.png'),
          fullPage: true,
        });
      records.push(exercise.id);
      await page
        .getByRole('button', {
          name: index === authored.exercises.length - 1 ? 'See result' : 'Continue',
          exact: true,
        })
        .click();
    }
    await expect(page.locator('.result-card')).toContainText('100%');
  }
  expect(records).toHaveLength(80);
  expect(new Set(added).size).toBe(16);
  expect(captured.size).toBe(5);
  await writeFile(
    testInfo.outputPath('expanded-tests-grading.json'),
    JSON.stringify({ records, added }, null, 2),
  );
});

test('grades every new alternate answer and reachable diagnostic and choice feedback', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  test.setTimeout(240_000);
  const records: Array<{ id: string; answer: string; correct: boolean }> = [];
  for (const authored of pack.tests.filter((item) => IDS.includes(item.id)))
    for (const [index, exercise] of authored.exercises.entries()) {
      if (!isAdded(exercise)) continue;
      const wrongAnswers =
        exercise.type === 'multiple-choice'
          ? exercise.options!.filter((answer) => !exercise.acceptedAnswers.includes(answer))
          : exercise.answerDiagnostics!.flatMap((item) => item.answers);
      for (const [correct, answers] of [
        [true, exercise.acceptedAnswers.slice(1)],
        [false, wrongAnswers],
      ] as Array<[boolean, string[]]>)
        for (const answer of answers) {
          await positionSession(page, authored.id, index);
          await expect(page.locator('.exercise-card h2')).toHaveText(exercise.prompt);
          await submit(page, exercise, answer);
          await expect(page.locator('.feedback')).toHaveClass(
            correct ? /(?:^|\s)correct(?:\s|$)/u : /(?:^|\s)incorrect(?:\s|$)/u,
          );
          if (!correct) {
            const diagnostic = exercise.answerDiagnostics?.find((item) =>
              item.answers.includes(answer),
            );
            await expect(page.locator('.feedback')).toContainText(
              diagnostic?.explanation ?? exercise.optionFeedback![answer],
            );
          }
          if (!correct && exercise.id === 'sdp-se-han-test-e019')
            await page.screenshot({
              path: testInfo.outputPath('han-diagnostic-feedback.png'),
              fullPage: true,
            });
          records.push({ id: exercise.id, answer, correct });
        }
    }
  expect(records.filter((item) => item.correct)).toHaveLength(13);
  expect(records.filter((item) => !item.correct)).toHaveLength(20);
  await writeFile(
    testInfo.outputPath('new-alternatives-diagnostics.json'),
    JSON.stringify(records, null, 2),
  );
});

async function submit(page: Page, exercise: Exercise, answer: string): Promise<void> {
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
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
}

async function positionSession(page: Page, testId: string, index: number): Promise<void> {
  await page.goto('/study/' + pack.id + '/' + testId);
  await expect(page.locator('.exercise-card')).toBeVisible();
  await page.evaluate(
    ({ testId, index }) =>
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
              (item) => item.topicId === 'demonstrative-pronouns' && item.testId === testId,
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
    { testId, index },
  );
  await page.reload();
}

import { writeFile } from 'node:fs/promises';
import { expect, test, Locator } from '@playwright/test';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { Exercise } from '../../../src/features/learning/shared/content/exercise.models';
import { LearnerState } from '../../../src/features/learning/shared/state/learner-state.models';
import { QUESTION_TARGETS } from '../../../src/features/learning/shared/content/validation/question-family-targets';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';
import { learnerState } from '../support/grammar-reference';
import { positionSession, submit } from '../support/focused-content-grading';

let packs: TopicPack[];
test.use({ actionTimeout: 15_000, navigationTimeout: 60_000 });
test.beforeAll(async () => {
  test.setTimeout(120_000);
  packs = ((await loadContentSource('content')).packs as unknown as TopicPack[]).filter(
    (pack) => QUESTION_TARGETS[pack.id],
  );
});

async function activate(control: Locator): Promise<void> {
  await expect(control).toBeEnabled();
  await control.evaluate((element: HTMLElement) => element.click());
}

// Audit the complete content inventory through the real DOM. Representative
// exercises of every format also use pointer/keyboard actions below.
async function auditAnswer(card: Locator, exercise: Exercise, bank: string): Promise<void> {
  const answer = exercise.acceptedAnswers[0];
  if (exercise.type === 'multiple-choice')
    await activate(card.getByRole('radio', { name: answer, exact: true }));
  else if (exercise.type === 'word-order') {
    let remaining = answer;
    const tokens = [...exercise.tokens!];
    while (tokens.length) {
      const index = tokens.findIndex(
        (token) => remaining === token || remaining.startsWith(token + ' '),
      );
      expect(index).toBeGreaterThanOrEqual(0);
      const token = tokens.splice(index, 1)[0];
      await activate(card.locator(bank).getByRole('button', { name: token, exact: true }).first());
      remaining = remaining.slice(token.length).trimStart();
    }
  } else await card.getByRole('textbox', { name: 'Your answer' }).fill(answer);
  await activate(card.getByRole('button', { name: 'Check answer', exact: true }));
}

for (const id of Object.keys(QUESTION_TARGETS)) {
  test('reads every lesson and grades every optional reply in ' + id, async ({ page }, info) => {
    test.setTimeout(300_000);
    const pack = packs.find((item) => item.id === id)!;
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const records: Array<{ id: string; text: string }> = [];
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const lesson of pack.lessons) {
      await page.goto(`/learn/${id}/${lesson.id}-test`);
      const reader = page.locator('.lesson-reader');
      await expect(reader).toBeVisible({ timeout: 20_000 });
      await expect(reader.locator('.reader-heading h2')).toHaveText(lesson.title);
      await expect(reader.locator('.teaching-section')).toHaveCount(lesson.sections.length);
      await expect(reader.locator('.example-grid > article')).toHaveCount(lesson.examples.length);
      const expectedText = [
        ...lesson.sections.flatMap((section) => section.paragraphs),
        ...lesson.examples.flatMap((example) => [
          example.finnish,
          example.english,
          ...example.steps,
        ]),
      ];
      let text = '';
      await expect
        .poll(
          async () => {
            text = await reader.innerText();
            return expectedText.filter((part) => !text.includes(part));
          },
          {
            timeout: 30_000,
            message: 'every authored lesson paragraph and worked step is rendered',
          },
        )
        .toEqual([]);
      await expect(reader.locator('.lesson-vocabulary')).toHaveCount(1);
      records.push({ id: lesson.id, text });
      if (lesson === pack.lessons[0])
        await page.screenshot({ path: info.outputPath('lesson.png'), fullPage: false });
      await page.getByRole('button', { name: 'Start optional practice', exact: true }).click();
      const card = page.locator('.lesson-practice');
      for (const [index, exercise] of lesson.practiceExercises.entries()) {
        await expect(card.locator('h4')).toHaveText(exercise.prompt);
        await auditAnswer(card, exercise, '.practice-token-bank');
        await expect(card.locator('.feedback')).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
        await expect(card.locator('.feedback')).toContainText(exercise.explanation);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        records.push({ id: exercise.id, text: await card.innerText() });
        await activate(
          card.getByRole('button', {
            name: index === lesson.practiceExercises.length - 1 ? 'Finish practice' : 'Continue',
            exact: true,
          }),
        );
      }
    }
    const state = (await learnerState(page)) as LearnerState;
    expect(state?.attempts).toEqual([]);
    expect(state?.sessions).toEqual([]);
    expect(state?.unresolvedMistakeIds).toEqual([]);
    expect(errors).toEqual([]);
    await writeFile(
      info.outputPath('lesson-optional-audit.json'),
      JSON.stringify({ records, errors }, null, 2),
    );
  });

  test('renders and grades every scored question and answer in ' + id, async ({ page }, info) => {
    test.setTimeout(600_000);
    const pack = packs.find((item) => item.id === id)!;
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const records: Array<{ id: string; text: string }> = [];
    const errors: string[] = [];
    const interactedFormats = new Set<string>();
    page.on('pageerror', (error) => errors.push(error.message));
    for (const authored of pack.tests) {
      await page.goto(`/study/${id}/${authored.id}`);
      await expect(page.locator('.exercise-card')).toBeVisible({ timeout: 20_000 });
      for (const [index, exercise] of authored.exercises.entries()) {
        await expect(page.locator('.exercise-card h2')).toHaveText(exercise.prompt);
        if (!interactedFormats.has(exercise.type)) {
          await submit(page, exercise, exercise.acceptedAnswers[0]);
          interactedFormats.add(exercise.type);
        } else await auditAnswer(page.locator('.exercise-card'), exercise, '.token-bank');
        const feedback = page.locator('.feedback');
        await expect(feedback).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
        const expectedText = [
          exercise.explanation,
          exercise.sentenceExplanation!.translation,
          ...exercise.sentenceExplanation!.parts.map((part) => part.formation),
        ];
        let text = '';
        await expect
          .poll(
            async () => {
              text = await page.locator('.exercise-card').innerText();
              return expectedText.filter((part) => !text.includes(part));
            },
            { timeout: 30_000 },
          )
          .toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        records.push({ id: exercise.id, text });
        if (records.length === 1) {
          await page.screenshot({ path: info.outputPath('scored-feedback.png'), fullPage: true });
          await page.reload();
          await expect(page.locator('.exercise-card h2')).toHaveText(exercise.prompt);
          await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
        }
        await activate(
          page.getByRole('button', {
            name: index === authored.exercises.length - 1 ? 'See result' : 'Continue',
            exact: true,
          }),
        );
      }
      await expect(page.locator('.result-card')).toContainText('100%');
    }
    expect(records).toHaveLength(pack.tests.flatMap((test) => test.exercises).length);
    expect(errors).toEqual([]);
    await writeFile(
      info.outputPath('scored-audit.json'),
      JSON.stringify({ records, errors }, null, 2),
    );
  });
}

test('accepts natural replies and teaches the separate plural category pattern', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto('/learn/who-and-what-questions/qw-mita-plural-classification-test');
  await expect(page.locator('.lesson-reader')).toContainText('Mitä nämä ovat?');
  await expect(page.locator('.lesson-reader')).toContainText('Nämä ovat kirjoja.');
  await expect(page.locator('.lesson-reader')).toContainText('Nämä eivät ole autoja.');
  await page.goto('/learn/who-and-what-questions/qw-mitka-plural-test');
  await expect(page.locator('.lesson-vocabulary')).toContainText('avaimet');
  await expect(page.locator('.lesson-vocabulary')).toContainText('pallot');
  for (const [id, answer] of [
    ['qw-reasons-e07', 'Koska minä olen sairas.'],
    ['qw-kuka-singular-e18', "You're a student."],
    ['qw-nobody-e17', 'No one is coming.'],
    ['qw-degree-e08', 'Matka on kaksi kilometriä pitkä.'],
  ]) {
    const pack = packs.find((pack) =>
      pack.tests.some((test) => test.exercises.some((exercise) => exercise.id === id)),
    )!;
    const learningTest = pack.tests.find((test) =>
      test.exercises.some((exercise) => exercise.id === id),
    )!;
    const index = learningTest.exercises.findIndex((exercise) => exercise.id === id);
    await page.goto(`/study/${pack.id}/${learningTest.id}`);
    await positionSession(page, pack.id, learningTest.id, index);
    await submit(page, learningTest.exercises[index], answer);
    await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
  }
});

test('renders a specific typed diagnostic and unmatched-error feedback once', async ({ page }) => {
  const pack = packs.find((item) => item.id === 'negative-information-questions')!;
  const authored = pack.tests.find((item) => item.id === 'qw-correct-assumption-test')!;
  const index = authored.exercises.findIndex(
    (exercise) => exercise.id === 'qw-correct-assumption-e07',
  );
  const exercise = authored.exercises[index];
  await page.goto(`/study/${pack.id}/${authored.id}`);
  for (const answer of ['Tulen kyllä.', exercise.answerDiagnostics![0].answers[0], 'xyz']) {
    await positionSession(page, pack.id, authored.id, index);
    await submit(page, exercise, answer);
    const feedback = page.locator('.feedback');
    await expect(feedback).toHaveClass(
      answer === 'Tulen kyllä.' ? /(?:^|\s)correct(?:\s|$)/u : /(?:^|\s)incorrect(?:\s|$)/u,
    );
    await expect(feedback.locator('.explanation')).toHaveCount(1);
    expect((await feedback.innerText()).split(exercise.explanation)).toHaveLength(2);
    if (answer === 'xyz') await expect(feedback.locator('.diagnostic')).toHaveCount(0);
    else if (answer !== 'Tulen kyllä.')
      await expect(feedback).toContainText(exercise.answerDiagnostics![0].explanation);
  }
});

test('shows ordered maps and the complete question-family grammar reference', async ({ page }) => {
  for (const pack of packs) {
    await page.goto(`/topics/${pack.id}`);
    await expect(page.locator('.test-card .test-title-row h3')).toHaveText(
      pack.tests.map((test) => test.title),
    );
    await expect(page.locator('.review-test')).toHaveCount(1);
  }
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Grammar reference for Question words and answers', exact: true })
    .click();
  await expect(page.getByRole('dialog').locator('.reference-lesson-title')).toHaveText(
    packs.flatMap((pack) => pack.lessons.map((lesson) => lesson.title)),
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

import { writeFile } from 'node:fs/promises';
import { expect, Locator, Page, test } from '@playwright/test';
import { Exercise } from '../../../src/features/learning/shared/content/exercise.models';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';

const packIds = [
  'affirmative-possession',
  'negative-possession',
  'possession-questions',
  'negative-possession-questions',
  'possessive-pronouns-endings',
];
let packs: TopicPack[];

test.beforeAll(async () => {
  const source = await loadContentSource('content');
  packs = packIds.map(
    (id) => source.packs.find((pack) => pack['id'] === id) as unknown as TopicPack,
  );
});

test('shows all ownership packs and target-specific preparation at every viewport', async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await page.goto('/');
  const group = page.locator('.pack-group').filter({ hasText: 'Ownership and possession' });
  await expect(group.locator('.topic-card')).toHaveCount(5);
  await expect(page.locator('.catalog-stats')).toContainText('2758');
  for (const pack of packs) {
    await page.goto(`/topics/${pack.id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(pack.title);
    await expect(page.locator('.test-card')).toHaveCount(pack.tests.length);
    await expect(page.locator('.review-test')).toHaveCount(
      pack.tests.filter((item) => item.stage === 'review').length,
    );
    await expect(page.locator('.topic-hero .eyebrow')).toContainText('Level: 0 - A1.3');
    for (const focused of pack.tests.filter((item) => item.stage === 'focused')) {
      await page.goto(`/learn/${pack.id}/${focused.id}`);
      await expect(page.locator('.lesson-reader')).toHaveCount(1);
      await expect(page.locator('.lesson-reader')).toContainText(/focused lesson/iu);
      await expect(page.locator('.lesson-reader h2').first()).toHaveText(
        pack.lessons.find((lesson) => lesson.id === focused.lessonIds[0])!.title,
      );
      await expect(page.getByRole('heading', { name: 'New words', exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Used again', exact: true })).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Supplied in examples', exact: true }),
      ).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.screenshot({ path: testInfo.outputPath(`${pack.id}-lesson.png`), fullPage: true });
    const review = pack.tests.at(-1)!;
    await page.goto(`/learn/${pack.id}/${review.id}`);
    await expect(page.locator('.lesson-list .subject-tab')).toHaveCount(
      review.lessonIds.length > 1 ? review.lessonIds.length : 0,
    );
    await expect(page.locator('.lesson-reader h2').first()).toHaveText(
      pack.lessons.find((lesson) => lesson.id === review.lessonIds[0])!.title,
    );
  }
});

for (const packId of packIds) {
  test(`audits every rendered lesson, practice item, and scored answer in ${packId}`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-wide');
    const pack = packs.find((candidate) => candidate.id === packId)!;
    const itemCount =
      pack.tests.reduce((total, item) => total + item.exercises.length, 0) +
      pack.lessons.reduce((total, item) => total + item.practiceExercises.length, 0);
    test.setTimeout(60_000 + itemCount * 3_000);
    const audit: Array<{ id: string; rendered: string }> = [];
    for (const lesson of pack.lessons) {
      const focused = pack.tests.find((item) => item.lessonIds.includes(lesson.id))!;
      await page.goto(`/learn/${pack.id}/${focused.id}`);
      const reader = page.locator('.lesson-reader');
      await expect(reader).toBeVisible();
      for (const section of lesson.sections) {
        for (const paragraph of section.paragraphs) await expect(reader).toContainText(paragraph);
      }
      for (const example of lesson.examples) {
        await expect(reader).toContainText(example.finnish);
        await expect(reader).toContainText(example.english);
      }
      audit.push({ id: lesson.id, rendered: await reader.innerText() });
      await page.screenshot({ path: testInfo.outputPath(`${lesson.id}.png`), fullPage: true });
      await reader.getByRole('button', { name: 'Start optional practice' }).click();
      for (const [index, exercise] of lesson.practiceExercises.entries()) {
        const card = page.locator('.practice-card');
        await expect(card.locator('h4')).toHaveText(exercise.prompt);
        await submitAnswer(page, card, exercise, true);
        await expect(card.locator('.feedback')).toHaveClass(/correct/u);
        await verifyExplanation(card, exercise);
        audit.push({ id: exercise.id, rendered: await card.innerText() });
        await card
          .getByRole('button', {
            name: index === lesson.practiceExercises.length - 1 ? 'Finish practice' : 'Continue',
            exact: true,
          })
          .click();
      }
      await expect(page.locator('.practice-complete')).toBeVisible();
    }

    for (const authoredTest of pack.tests) {
      await page.goto(`/study/${pack.id}/${authoredTest.id}`);
      for (const [index, exercise] of authoredTest.exercises.entries()) {
        const card = page.locator('.exercise-card');
        await expect(card.locator('h2')).toHaveText(exercise.prompt);
        await submitAnswer(page, card, exercise, false);
        await expect(card.locator('.feedback')).toHaveClass(/correct/u);
        await verifyExplanation(card, exercise);
        audit.push({ id: exercise.id, rendered: await card.innerText() });
        await card
          .getByRole('button', {
            name: index === authoredTest.exercises.length - 1 ? 'See result' : 'Continue',
            exact: true,
          })
          .click();
      }
      await expect(page.locator('.result-card')).toContainText('100%');
    }
    await writeFile(
      testInfo.outputPath('rendered-content-audit.json'),
      JSON.stringify(audit, null, 2),
    );
    await page.goto(`/stats/${pack.id}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
}

test('accepts natural short replies and renders a distinct Finnish mistake diagnostic', async ({
  page,
}) => {
  const authored = packs
    .find((pack) => pack.id === 'possession-questions')!
    .tests.find((item) => item.id === 'pqs-short-answers-plural-test')!;
  await page.goto('/study/possession-questions/pqs-short-answers-plural-test');
  const ids = ['pqs-short-answers-test-e007', 'pqs-short-answers-test-e008'];
  expect(ids.every((id) => authored.exercises.some((exercise) => exercise.id === id))).toBe(true);
  const last = Math.max(
    ...ids.map((id) => authored.exercises.findIndex((exercise) => exercise.id === id)),
  );
  for (const [index, exercise] of authored.exercises.slice(0, last + 1).entries()) {
    if (ids.includes(exercise.id)) {
      await page
        .getByRole('textbox', { name: 'Your answer' })
        .fill(exercise.id.endsWith('007') ? 'On.' : 'Ei, ei ole.');
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    } else await submitAnswer(page, page.locator('.exercise-card'), exercise, false);
    await expect(page.locator('.feedback')).toHaveClass(/correct/u);
    if (index < last) await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
  const negative = packs
    .find((pack) => pack.id === 'negative-possession')!
    .tests.find((item) => item.id === 'nps-fixed-negative-singular-test')!;
  await page.goto('/study/negative-possession/nps-fixed-negative-singular-test');
  await advanceTo(page, negative.exercises, 'nps-fixed-negative-test-e001');
  await page.locator('.choice-list input').nth(1).check();
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.locator('.feedback')).toHaveClass(/incorrect/u);
  await expect(page.locator('.diagnostic')).toContainText('possessor');
  await expect(page.locator('.sentence-parts')).toContainText('ei');
  await expect(page.locator('.sentence-parts')).toContainText('palloa');
});

test('keeps a typed possession diagnostic distinct from unmatched-error feedback', async ({
  page,
}) => {
  const authored = packs
    .find((pack) => pack.id === 'possession-questions')!
    .tests.find((item) => item.id === 'pqs-short-answers-plural-test')!;
  const typed = authored.exercises.filter((exercise) => exercise.type === 'translation-fi');
  expect(typed.length).toBeGreaterThanOrEqual(2);
  await page.goto('/study/possession-questions/pqs-short-answers-plural-test');
  const index = await advanceTo(page, authored.exercises, typed[0].id);
  await page
    .getByRole('textbox', { name: 'Your answer' })
    .fill(typed[0].answerDiagnostics![0].answers[0]);
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.locator('.diagnostic')).toContainText(
    typed[0].answerDiagnostics![0].explanation,
  );
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await advanceTo(page, authored.exercises, typed[1].id, index + 1);
  await page.getByRole('textbox', { name: 'Your answer' }).fill('unmatched response');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.locator('.feedback')).toHaveClass(/incorrect/u);
  await expect(page.locator('.diagnostic')).toHaveCount(0);
  await expect(page.locator('.feedback .explanation')).toHaveCount(1);
  await expect(page.locator('.feedback .explanation')).toContainText(typed[1].explanation);
});

for (const id of ['possession-questions', 'negative-possession-questions']) {
  test(`completes a genuine short-reply gap by keyboard in ${id}`, async ({ page }, testInfo) => {
    const pack = packs.find((candidate) => candidate.id === id)!;
    const authored = pack.tests.find((item) => item.id.includes('short-answers'))!;
    const gap = authored.exercises.find(
      (exercise) => exercise.type === 'fill-blank' && exercise.acceptedAnswers[0] === 'ei ole',
    )!;
    await page.goto(`/study/${id}/${authored.id}`);
    await advanceTo(page, authored.exercises, gap.id);
    await expect(page.locator('.exercise-card')).toContainText('Ei, ___.');
    await page.getByRole('textbox', { name: 'Your answer' }).fill('ei ole');
    await page.getByRole('textbox', { name: 'Your answer' }).press('Enter');
    await expect(page.locator('.feedback')).toHaveClass(/correct/u);
    await expect(page.locator('.sentence-parts li')).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath(`${id}-reply-gap.png`), fullPage: true });
  });
}

test('explains the missing noun ending in a typed partitive answer', async ({ page }) => {
  const authored = packs
    .find((pack) => pack.id === 'negative-possession')!
    .tests.find((item) => item.id === 'nps-partitive-singular-test')!;
  await page.goto('/study/negative-possession/nps-partitive-singular-test');
  await advanceTo(page, authored.exercises, 'nps-partitive-test-e013');
  await page.getByRole('textbox', { name: 'Your answer' }).fill('Minulla ei ole kissa.');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.locator('.feedback')).toHaveClass(/incorrect/u);
  await expect(page.locator('.diagnostic')).toContainText('kissa becomes kissaa');
  await expect(page.locator('.sentence-parts')).toContainText('kissaa');
});

async function submitAnswer(page: Page, card: Locator, exercise: Exercise, practice: boolean) {
  if (exercise.type === 'multiple-choice') {
    await card.getByRole('radio', { name: exercise.acceptedAnswers[0], exact: true }).check();
  } else if (exercise.type === 'word-order') {
    const bank = card.locator(practice ? '.practice-token-bank' : '.token-bank');
    for (const token of exercise.acceptedAnswers[0].split(' ')) {
      await bank.getByRole('button', { name: token, exact: true }).first().click();
    }
  } else {
    const answer =
      exercise.type === 'translation-en' && exercise.tags.includes('owner-hänen')
        ? (exercise.acceptedAnswers.find((candidate) => candidate.includes(' her ')) ??
          exercise.acceptedAnswers[0])
        : exercise.acceptedAnswers[0];
    await card.getByRole('textbox', { name: 'Your answer' }).fill(answer);
  }
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
}

for (const id of ['affirmative-possession', 'negative-possession']) {
  test(`explains token placement in the revised word-order Review of ${id}`, async ({ page }) => {
    test.setTimeout(90_000);
    const pack = packs.find((candidate) => candidate.id === id)!;
    const review = pack.tests.at(-1)!;
    await page.goto(`/study/${id}/${review.id}`);
    for (const [index, exercise] of review.exercises.entries()) {
      const card = page.locator('.exercise-card');
      await submitAnswer(page, card, exercise, false);
      await expect(page.locator('.feedback')).toHaveClass(/correct/u);
      if (/-e02[12]$/u.test(exercise.id)) {
        await expect(card.locator('.feedback .explanation')).toContainText(exercise.explanation);
        await expect(card.locator('.feedback .explanation')).toContainText('supplied owner first');
      }
      await card
        .getByRole('button', {
          name: index === review.exercises.length - 1 ? 'See result' : 'Continue',
          exact: true,
        })
        .click();
    }
    await expect(page.locator('.result-card')).toContainText('100%');
  });
}

for (const id of ['possession-questions', 'negative-possession-questions']) {
  test(`explains the optional negative-reply gap in ${id}`, async ({ page }, testInfo) => {
    const pack = packs.find((candidate) => candidate.id === id)!;
    const focused = pack.tests.find((item) => item.id.includes('short-answers-plural'))!;
    await page.goto(`/learn/${id}/${focused.id}`);
    await page.getByRole('button', { name: 'Start optional practice' }).click();
    await page.getByRole('textbox', { name: 'Your answer' }).fill('ei ole');
    await page.getByRole('textbox', { name: 'Your answer' }).press('Enter');
    const card = page.locator('.practice-card');
    await expect(card.locator('.feedback')).toHaveClass(/correct/u);
    await expect(card.locator('.sentence-parts li')).toHaveCount(3);
    await expect(card.locator('.sentence-parts li').nth(1)).toContainText('ei');
    await page.screenshot({ path: testInfo.outputPath(`${id}-optional-gap.png`), fullPage: true });
  });
}

async function verifyExplanation(card: Locator, exercise: Exercise) {
  await expect(card.locator('.feedback')).toContainText(exercise.explanation);
  if (exercise.sentenceExplanation) {
    await expect(card.locator('.sentence-parts li')).toHaveCount(
      exercise.sentenceExplanation.parts.length,
    );
    for (const [index, part] of exercise.sentenceExplanation.parts.entries()) {
      await expect(card.locator('.sentence-parts li').nth(index)).toContainText(part.finnish);
    }
    await expect(card.locator('.sentence-lesson')).toContainText(
      exercise.sentenceExplanation.translation,
    );
  }
}

async function advanceTo(
  page: Page,
  exercises: Exercise[],
  id: string,
  start = 0,
): Promise<number> {
  const index = exercises.findIndex((exercise) => exercise.id === id);
  expect(index).toBeGreaterThanOrEqual(start);
  for (const exercise of exercises.slice(start, index)) {
    await submitAnswer(page, page.locator('.exercise-card'), exercise, false);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
  return index;
}

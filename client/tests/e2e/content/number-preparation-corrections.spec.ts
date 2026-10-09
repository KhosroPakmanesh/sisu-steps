import { writeFile } from 'node:fs/promises';
import { expect, test, Page } from '@playwright/test';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';
import { positionSession, submit } from '../support/focused-content-grading';
let packs: TopicPack[];
test.beforeAll(async () => {
  packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
});
const alternatives = [
  {
    pack: 'personal-pronouns-affirmative-olla',
    test: 'ppo-affirmative-agreement-plural-test',
    lesson: 'ppo-affirmative-agreement-plural',
    kind: 'scored',
    id: 'ppo-t06-e03',
    answer: 'Te olette aamulla siellä.',
  },
  {
    pack: 'personal-pronouns-affirmative-olla',
    test: 'ppo-affirmative-agreement-plural-test',
    lesson: 'ppo-affirmative-agreement-plural',
    kind: 'scored',
    id: 'ppo-t06-e15',
    answer: 'He ovat aamulla siellä.',
  },
  {
    pack: 'personal-pronouns-affirmative-olla',
    test: 'ppo-pronoun-presence-singular-test',
    lesson: 'ppo-pronoun-presence-singular',
    kind: 'scored',
    id: 'ppo-t07-e02',
    answer: 'Hän on huomenna Suomessa.',
  },
  {
    pack: 'personal-pronouns-affirmative-olla',
    test: 'ppo-pronoun-presence-singular-test',
    lesson: 'ppo-pronoun-presence-singular',
    kind: 'scored',
    id: 'ppo-t07-e07',
    answer: 'Olen illalla täällä.',
  },
  {
    pack: 'personal-pronouns-affirmative-olla',
    test: 'ppo-pronoun-presence-singular-test',
    lesson: 'ppo-pronoun-presence-singular',
    kind: 'scored',
    id: 'ppo-t07-e08',
    answer: 'Hän on illalla täällä.',
  },
  {
    pack: 'personal-pronouns-affirmative-olla',
    test: 'ppo-pronoun-presence-singular-test',
    lesson: 'ppo-pronoun-presence-singular',
    kind: 'scored',
    id: 'ppo-t07-e19',
    answer: 'Olet illalla täällä.',
  },
  {
    pack: 'personal-pronouns-affirmative-olla',
    test: 'ppo-pronoun-presence-plural-test',
    lesson: 'ppo-pronoun-presence-plural',
    kind: 'scored',
    id: 'ppo-pronoun-presence-plural-test-e107',
    answer: 'Olette illalla siellä.',
  },
  {
    pack: 'negative-demonstrative-statements',
    test: 'nds-negative-transformation-singular-test',
    lesson: 'nds-negative-transformation-singular',
    kind: 'scored',
    id: 'nds-negative-transformation-test-e003',
    answer: "That car isn't here.",
  },
  {
    pack: 'negative-demonstrative-statements',
    test: 'nds-negative-transformation-singular-test',
    lesson: 'nds-negative-transformation-singular',
    kind: 'scored',
    id: 'nds-negative-transformation-singular-test-e105',
    answer: "That book isn't at home.",
  },
  {
    pack: 'negative-demonstrative-statements',
    test: 'nds-negative-transformation-singular-test',
    lesson: 'nds-negative-transformation-singular',
    kind: 'scored',
    id: 'nds-negative-transformation-singular-test-e106',
    answer: "The car isn't here.",
  },
  {
    pack: 'negative-demonstrative-statements',
    test: 'nds-negative-transformation-singular-test',
    lesson: 'nds-negative-transformation-singular',
    kind: 'scored',
    id: 'nds-negative-transformation-singular-test-e106',
    answer: "That car isn't here.",
  },
  {
    pack: 'negative-demonstrative-statements',
    test: 'nds-negative-transformation-singular-test',
    lesson: 'nds-negative-transformation-singular',
    kind: 'scored',
    id: 'nds-negative-transformation-test-e013',
    answer: "The car isn't at home.",
  },
  {
    pack: 'negative-demonstrative-statements',
    test: 'nds-negative-transformation-singular-test',
    lesson: 'nds-negative-transformation-singular',
    kind: 'scored',
    id: 'nds-negative-transformation-test-e013',
    answer: "That car isn't at home.",
  },
  {
    pack: 'negative-demonstrative-statements',
    test: 'nds-negative-transformation-singular-test',
    lesson: 'nds-negative-transformation-singular',
    kind: 'practice',
    id: 'nds-negative-transformation-p01',
    answer: "That car isn't at home.",
  },
  {
    pack: 'negative-demonstrative-statements',
    test: 'nds-negative-transformation-plural-test',
    lesson: 'nds-negative-transformation-plural',
    kind: 'scored',
    id: 'nds-negative-transformation-test-e004',
    answer: "The cars aren't here.",
  },
  {
    pack: 'negative-demonstrative-statements',
    test: 'nds-negative-transformation-plural-test',
    lesson: 'nds-negative-transformation-plural',
    kind: 'scored',
    id: 'nds-negative-transformation-test-e004',
    answer: "Those cars aren't here.",
  },
  {
    pack: 'negative-demonstrative-statements',
    test: 'nds-negative-transformation-plural-test',
    lesson: 'nds-negative-transformation-plural',
    kind: 'scored',
    id: 'nds-negative-transformation-plural-test-e105',
    answer: "The cars aren't at home.",
  },
  {
    pack: 'negative-demonstrative-statements',
    test: 'nds-negative-transformation-plural-test',
    lesson: 'nds-negative-transformation-plural',
    kind: 'scored',
    id: 'nds-negative-transformation-plural-test-e105',
    answer: "Those cars aren't at home.",
  },
  {
    pack: 'negative-demonstrative-statements',
    test: 'nds-negative-transformation-plural-test',
    lesson: 'nds-negative-transformation-plural',
    kind: 'scored',
    id: 'nds-negative-transformation-plural-test-e106',
    answer: "These cars aren't here.",
  },
  {
    pack: 'negative-demonstrative-statements',
    test: 'nds-negative-transformation-plural-test',
    lesson: 'nds-negative-transformation-plural',
    kind: 'scored',
    id: 'nds-negative-transformation-test-e014',
    answer: "These cars aren't at home.",
  },
  {
    pack: 'negative-possession',
    test: 'nps-sentences-singular-test',
    lesson: 'nps-sentences-singular',
    kind: 'practice',
    id: 'nps-sentences-singular-practice-04',
    answer: "You don't have a cat.",
  },
  {
    pack: 'negative-possession',
    test: 'nps-sentences-singular-test',
    lesson: 'nps-sentences-singular',
    kind: 'practice',
    id: 'nps-sentences-singular-practice-04',
    answer: "You don't have the cat.",
  },
  {
    pack: 'negative-possession-questions',
    test: 'npq-word-order-singular-test',
    lesson: 'npq-word-order-singular',
    kind: 'practice',
    id: 'npq-word-order-singular-practice-04',
    answer: "Don't you have a game?",
  },
  {
    pack: 'negative-possession-questions',
    test: 'npq-word-order-singular-test',
    lesson: 'npq-word-order-singular',
    kind: 'practice',
    id: 'npq-word-order-singular-practice-04',
    answer: "Don't you have the game?",
  },
];
for (const packId of [...new Set(alternatives.map((item) => item.pack))]) {
  test('accepts audited natural alternatives in ' + packId, async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    const records: string[] = [];
    const pack = packs.find((item) => item.id === packId)!;
    for (const entry of alternatives.filter((item) => item.pack === packId)) {
      if (entry.kind === 'scored') {
        const authored = pack.tests.find((item) => item.id === entry.test)!;
        const index = authored.exercises.findIndex((item) => item.id === entry.id);
        await page.goto('/study/' + pack.id + '/' + authored.id);
        await expect(page.locator('.exercise-card')).toBeVisible();
        await positionSession(page, pack.id, authored.id, index);
        await expect(page.locator('.exercise-card h2')).toHaveText(
          authored.exercises[index].prompt,
        );
        await submit(page, authored.exercises[index], entry.answer);
      } else {
        const lesson = pack.lessons.find((item) => item.id === entry.lesson)!;
        await optionalAt(
          page,
          pack.id,
          entry.test,
          lesson.practiceExercises.findIndex((item) => item.id === entry.id),
        );
        await page.getByRole('textbox', { name: 'Your answer' }).fill(entry.answer);
        await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      }
      await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      records.push(entry.id + ': ' + entry.answer);
    }
    await writeFile(testInfo.outputPath('corrected-alternatives.json'), JSON.stringify(records));
  });
}

test('keeps fixed-on diagnostics scoped and explains second-person owner contrasts', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const pack = packs.find((item) => item.id === 'affirmative-possession')!;
  const authored = pack.tests.find((item) => item.id === 'aps-fixed-on-singular-test')!;
  for (const id of [
    'aps-fixed-on-test-e009',
    'aps-fixed-on-singular-test-e107',
    'aps-fixed-on-test-e008',
    'aps-fixed-on-singular-test-e108',
    'aps-fixed-on-test-e007',
  ]) {
    const index = authored.exercises.findIndex((item) => item.id === id),
      exercise = authored.exercises[index];
    await page.goto('/study/' + pack.id + '/' + authored.id);
    await expect(page.locator('.exercise-card')).toBeVisible();
    await positionSession(page, pack.id, authored.id, index);
    await submit(page, exercise, exercise.answerDiagnostics![0].answers[0]);
    await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)incorrect(?:\s|$)/u);
    await expect(page.locator('.feedback')).toContainText('minulla, sinulla and hänellä');
    await expect(page.locator('.feedback')).not.toContainText('Plural owners');
  }
  for (const [branch, id, word] of [
    ['singular', 'aps-possessors-test-e002', 'teillä'],
    ['plural', 'aps-possessors-test-e005', 'sinulla'],
  ]) {
    const authored = pack.tests.find((item) => item.id === 'aps-possessors-' + branch + '-test')!;
    const index = authored.exercises.findIndex((item) => item.id === id),
      exercise = authored.exercises[index];
    await page.goto('/study/' + pack.id + '/' + authored.id);
    await expect(page.locator('.exercise-card')).toBeVisible();
    await positionSession(page, pack.id, authored.id, index);
    const wrong = exercise.options!.find((answer) => answer.toLowerCase().includes(word))!;
    await submit(page, exercise, wrong);
    await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)incorrect(?:\s|$)/u);
    await expect(page.locator('.feedback')).toContainText('one person informally');
    await expect(page.locator('.feedback')).toContainText('group');
  }
});

test('grades all five replacement optional tasks and their taught corrections', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const cases = [
    ['affirmative-possession', 'aps-fixed-on-singular', 'on', 'olen'],
    ['affirmative-possession', 'aps-sentences-singular', 'You have a game.', 'You are a game.'],
    [
      'negative-possession',
      'nps-partitive-singular',
      'Sinulla ei ole kynää.',
      'Sinulla ei ole kynä.',
    ],
    ['possession-questions', 'pqs-short-answers-singular', 'Ei, ei ole.', 'En ole.'],
    ['possessive-pronouns-endings', 'ppe-whose-singular', 'talo', 'talosi'],
  ];
  for (const [packId, lessonId, correct, wrong] of cases) {
    const lesson = packs
      .find((item) => item.id === packId)!
      .lessons.find((item) => item.id === lessonId)!;
    const index = lesson.practiceExercises.findIndex(
      (item) => item.id === lessonId + '-practice-04',
    );
    for (const [answer, isCorrect] of [
      [wrong, false],
      [correct, true],
    ] as const) {
      await optionalAt(page, packId, lessonId + '-test', index);
      await page.getByRole('textbox', { name: 'Your answer' }).fill(answer);
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      await expect(page.locator('.feedback')).toHaveClass(
        isCorrect ? /(?:^|\s)correct(?:\s|$)/u : /(?:^|\s)incorrect(?:\s|$)/u,
      );
      if (isCorrect) {
        for (const part of lesson.practiceExercises[index].sentenceExplanation!.parts)
          await expect(page.locator('.sentence-lesson')).toContainText(part.formation);
        await expectFinalFormationVisible(page);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
  await page.screenshot({
    path: testInfo.outputPath('corrected-optional-feedback.png'),
    fullPage: true,
  });
  await page.screenshot({ path: testInfo.outputPath('corrected-optional-last-formation.png') });
});

test('keeps the optional formation readable in both appearances through enlarged text', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const appearance of ['Day', 'Night']) {
    for (const size of [16, 24, 32]) {
      await optionalAt(page, 'possessive-pronouns-endings', 'ppe-whose-singular-test', 1);
      await page.getByRole('radio', { name: appearance, exact: true }).check();
      await page.evaluate((fontSize) => {
        document.documentElement.style.fontSize = fontSize + 'px';
      }, size);
      await page.getByRole('textbox', { name: 'Your answer' }).fill('talo');
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      await expect(page.locator('.feedback')).toHaveClass(/(?:^|\s)correct(?:\s|$)/u);
      await expectFinalFormationVisible(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
});

async function expectFinalFormationVisible(page: Page): Promise<void> {
  const formation = page.locator('.sentence-parts li').last().locator('dd').last();
  await page.mouse.move(0, 0);
  await formation.scrollIntoViewIfNeeded();
  expect(
    await formation.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const rects = [...range.getClientRects()];
      return (
        rects.length > 0 &&
        rects.every((rect) =>
          element.contains(
            document.elementFromPoint(
              rect.left + Math.min(4, rect.width / 2),
              rect.top + rect.height / 2,
            ),
          ),
        )
      );
    }),
  ).toBe(true);
}

async function optionalAt(page: Page, pack: string, testId: string, index: number): Promise<void> {
  await page.goto('/learn/' + pack + '/' + testId);
  await expect(page.locator('.lesson-reader')).toBeVisible();
  await page.getByRole('button', { name: 'Start optional practice', exact: true }).click();
  for (let prior = 0; prior < index; prior++) {
    await page.getByRole('button', { name: 'Show answer', exact: true }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
}

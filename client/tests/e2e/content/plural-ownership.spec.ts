import { expect, test } from '@playwright/test';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';

test('retains both owner lesson groups in the merged pack at every viewport', async ({
  page,
}, testInfo) => {
  for (const [id, title, prefix, allowed, opposite, omitted] of [
    [
      'possessive-pronouns-endings',
      'Possessive pronouns and endings',
      'ppe',
      ['minun', 'sinun', 'hänen'],
      ['meidän', 'teidän', 'heidän'],
      ['autoni', 'kynäsi'],
    ],
    [
      'possessive-pronouns-endings',
      'Possessive pronouns and endings',
      'pop',
      ['meidän', 'teidän', 'heidän'],
      ['minun', 'sinun', 'hänen'],
      ['automme', 'kynänne'],
    ],
  ] as const) {
    await page.goto(`/topics/${id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.locator('.test-card:not(.review-test)')).toHaveCount(20);
    await expect(page.locator('.review-test')).toHaveCount(2);
    await page.goto(`/learn/${id}/${prefix}-owner-forms-test`);
    for (const owner of allowed) await expect(page.locator('.lesson-reader')).toContainText(owner);
    await page.goto(`/learn/${id}/${prefix}-plural-objects-test`);
    await expect(page.locator('.lesson-reader')).toContainText('Nämä ovat');
    await expect(page.locator('.lesson-reader')).toContainText('plural -t');
    await page.goto(`/learn/${id}/${prefix}-pronoun-omission-singular-test`);
    const reader = page.locator('.lesson-reader');
    for (const form of omitted) await expect(reader).toContainText(`Nämä ovat ${form}.`);
    const rendered = await reader.innerText();
    for (const owner of opposite) expect(rendered).not.toMatch(new RegExp(`\\b${owner}\\b`, 'u'));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: testInfo.outputPath(`${prefix}-owner-omission.png`),
      fullPage: true,
    });
    await page.goto(`/learn/${id}/${prefix}-whose-singular-test`);
    await expect(page.locator('.lesson-reader')).toContainText('Whose ball is this?');
    await expect(page.locator('.lesson-reader')).toContainText('Whose balls are these?');
  }
});

test('distinguishes a retained plural ending from unmatched-error feedback', async ({ page }) => {
  const source = await loadContentSource('content');
  const pack = source.packs.find(
    (item) => item['id'] === 'possessive-pronouns-endings',
  ) as unknown as TopicPack;
  const authored = pack.tests.find((item) => item.id === 'pop-plural-objects-test')!;
  await page.goto(`/study/${pack.id}/${authored.id}`);
  const typed = authored.exercises.filter((exercise) => exercise.type === 'translation-fi');
  const exercise = typed[0];
  const first = authored.exercises.indexOf(exercise);
  const second = authored.exercises.indexOf(typed[1]);
  async function advance(start: number, end: number) {
    for (const item of authored.exercises.slice(start, end)) {
      if (item.type === 'multiple-choice')
        await page.getByRole('radio', { name: item.acceptedAnswers[0], exact: true }).check();
      else await page.getByRole('textbox', { name: 'Your answer' }).fill(item.acceptedAnswers[0]);
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    }
  }
  await advance(0, first);
  const noun = exercise.tags.find((tag) => tag.startsWith('possessive-noun-'))!.slice(16);
  const wrong = exercise.acceptedAnswers[0].replace(noun, noun + 't');
  await page.getByRole('textbox', { name: 'Your answer' }).fill(wrong);
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.locator('.feedback')).toHaveClass(/incorrect/u);
  await expect(page.locator('.diagnostic')).toContainText('Drop the noun’s plural -t');
  await expect(page.locator('.sentence-parts')).toContainText(noun);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await advance(first + 1, second);
  await page.getByRole('textbox', { name: 'Your answer' }).fill('unmatched response');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.locator('.feedback')).toHaveClass(/incorrect/u);
  await expect(page.locator('.diagnostic')).toHaveCount(0);
  await expect(page.locator('.feedback .explanation')).toHaveCount(1);
});

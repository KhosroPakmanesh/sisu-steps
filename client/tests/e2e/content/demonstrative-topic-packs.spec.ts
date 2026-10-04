import { expect, test } from '@playwright/test';

const packs = [
  {
    id: 'singular-demonstrative-pronouns',
    title: 'Singular demonstrative pronouns',
    tests: 6,
    focused: 5,
    exercises: 120,
  },
  {
    id: 'plural-demonstrative-pronouns',
    title: 'Plural demonstrative pronouns',
    tests: 7,
    focused: 6,
    exercises: 144,
  },
  {
    id: 'negative-demonstrative-statements',
    title: 'Negative demonstrative statements',
    tests: 4,
    focused: 3,
    exercises: 88,
  },
  {
    id: 'demonstrative-questions',
    title: 'Demonstrative questions',
    tests: 7,
    focused: 6,
    exercises: 160,
  },
];

test('opens every demonstrative pack with its approved Focused and Review topology', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.topic-card')).toHaveCount(15);
  await expect(page.locator('.catalog-stats')).toContainText('2154');

  for (const pack of packs) {
    await page.goto(`/topics/${pack.id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(pack.title);
    await expect(page.locator('.topic-hero .eyebrow')).toContainText('Level: 0 - A1.3');
    await expect(page.locator('.topic-hero .eyebrow')).toContainText(`${pack.tests} tests`);
    await expect(page.locator('.topic-overview')).toContainText(String(pack.exercises));
    await expect(page.locator('.test-card')).toHaveCount(pack.tests);
    await expect(page.locator('.test-card:not(.review-test)')).toHaveCount(pack.focused);
    await expect(page.locator('.review-test')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Focused tests' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();
    await expect(
      page.locator('.test-card').first().getByRole('link', { name: 'Learn first' }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('keeps the demonstrative catalog cards and longest learning map responsive', async ({
  page,
}) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    for (const pack of packs) {
      await expect(page.locator(`a[href="/topics/${pack.id}"]`).first()).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );

    await page.goto('/topics/demonstrative-questions');
    await expect(page.locator('.test-card')).toHaveCount(7);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('shows concise prompts in scored study and optional practice', async ({ page }) => {
  await page.goto('/study/singular-demonstrative-pronouns/sdp-singular-forms-test');
  for (let index = 0; index < 2; index += 1) {
    await page.getByRole('button', { name: 'Show answer' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
  }

  await expect(page.locator('.question-count')).toHaveText('3 / 20');
  await expect(page.locator('.exercise-card h2')).toHaveText(
    'Write “That is a book.” in Finnish. Use kirja (“a book”) and on (“is”). The listener already knows which one. Frame: “___ on kirja.”',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.goto('/learn/singular-demonstrative-pronouns/sdp-singular-forms-test');
  await page.getByRole('button', { name: 'Start optional practice' }).click();
  await expect(page.locator('.practice-card h4')).toHaveText(
    'Optional practice: Choose the sentence that means “That is a car.” Use auto (“a car”) and on (“is”). The listener already knows which one. Frame: “___ on auto.”',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('corrects the book question with natural English and a specific It versus Is hint', async ({
  page,
}) => {
  await page.goto('/study/demonstrative-questions/dqs-yesno-singular-test');
  for (let index = 0; index < 3; index += 1) {
    await page.getByRole('button', { name: 'Show answer' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
  }

  await expect(page.locator('.exercise-card h2')).toHaveText(
    'Translate “Onko se kirja kotona?” into English.',
  );
  await page.locator('.text-answer input').fill('It that book at home?');
  await page.getByRole('button', { name: 'Check answer' }).click();

  const feedback = page.locator('.feedback');
  await expect(feedback.locator('.diagnostic')).toContainText(
    '“It” names a thing and cannot replace “Is.”',
  );
  await expect(feedback.locator('strong[lang="en"]')).toHaveText('Is the book at home?');
  await expect(feedback.locator('.explanation')).toContainText(
    'begin the question with “Is” before the subject',
  );
});

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
  {
    id: 'inessive-demonstrative-forms',
    title: 'Inessive demonstrative forms',
    tests: 5,
    focused: 4,
    exercises: 120,
  },
];

test('opens every demonstrative pack with its approved Focused and Review topology', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.topic-card')).toHaveCount(11);
  await expect(page.locator('.catalog-stats')).toContainText('1722');

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

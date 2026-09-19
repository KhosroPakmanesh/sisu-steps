import { expect, test } from '@playwright/test';

interface ExpectedGroup {
  id: string;
  title: string;
  packs: string[];
}

const expectedGroups: ExpectedGroup[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    packs: ['vowel-harmony-location-endings', 'kpt-singular-forms', 't-plural-agreement'],
  },
  {
    id: 'pronouns-and-olla',
    title: 'Pronouns and olla',
    packs: [
      'personal-pronouns-affirmative-olla',
      'negative-olla-statements',
      'olla-questions-short-answers',
    ],
  },
  {
    id: 'demonstratives',
    title: 'Demonstratives',
    packs: [
      'singular-demonstrative-pronouns',
      'plural-demonstrative-pronouns',
      'negative-demonstrative-statements',
      'demonstrative-questions',
      'inessive-demonstrative-forms',
    ],
  },
];

test('groups catalog topic cards into labeled sections in pack order', async ({ page }) => {
  await page.goto('/');
  await page.locator('.topic-card').first().waitFor();

  const groups = page.locator('.pack-group');
  await expect(groups).toHaveCount(expectedGroups.length);

  for (const [index, expected] of expectedGroups.entries()) {
    const group = groups.nth(index);
    await expect(group.getByRole('heading', { name: expected.title, level: 3 })).toBeVisible();

    const cards = group.locator('.group-cards > .topic-card');
    await expect(cards).toHaveCount(expected.packs.length);
    for (const [packIndex, packId] of expected.packs.entries()) {
      await expect(cards.nth(packIndex).locator(`a[href="/topics/${packId}"]`)).toBeVisible();
    }
  }

  await expect(page.locator('.topic-card')).toHaveCount(11);
});

test('mirrors the same grouping on the stats catalog', async ({ page }) => {
  await page.goto('/stats');
  await page.locator('.stats-topic-card').first().waitFor();

  const groups = page.locator('.pack-group');
  await expect(groups).toHaveCount(expectedGroups.length);

  for (const [index, expected] of expectedGroups.entries()) {
    const group = groups.nth(index);
    await expect(group.getByRole('heading', { name: expected.title, level: 3 })).toBeVisible();

    const cards = group.locator('.group-cards > .stats-topic-card');
    await expect(cards).toHaveCount(expected.packs.length);
    for (const [packIndex, packId] of expected.packs.entries()) {
      await expect(cards.nth(packIndex).locator(`a[href="/stats/${packId}"]`)).toBeVisible();
    }
  }
});

test('keeps each pack-group section inside the bound topic-grid sheet', async ({ page }) => {
  await page.goto('/');
  await page.locator('.topic-card').first().waitFor();

  const sheet = page.locator('.topic-grid');
  for (const group of await page.locator('.pack-group').all()) {
    const groupBox = await group.boundingBox();
    const sheetBox = await sheet.boundingBox();
    expect(groupBox, 'group stays inside the sheet horizontally').toBeTruthy();
    expect(sheetBox).toBeTruthy();
    expect(groupBox!.x).toBeGreaterThanOrEqual(sheetBox!.x);
    expect(groupBox!.x + groupBox!.width).toBeLessThanOrEqual(sheetBox!.x + sheetBox!.width + 1);
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

import { expect, test } from '@playwright/test';

const packs = [
  {
    id: 'personal-pronouns-affirmative-olla',
    title: 'Personal pronouns and affirmative olla',
    tests: 9,
    focused: 7,
    reviews: 2,
    exercises: 242,
  },
  {
    id: 'negative-olla-statements',
    title: 'Negative olla statements',
    tests: 4,
    focused: 3,
    reviews: 1,
    exercises: 100,
  },
  {
    id: 'olla-questions-short-answers',
    title: 'Olla questions and short answers',
    tests: 7,
    focused: 5,
    reviews: 2,
    exercises: 178,
  },
];

test('opens each smaller pronoun and olla topic pack without reducing the content', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('.topic-card')).toHaveCount(6);
  await expect(page.locator('.catalog-stats')).toContainText('1090');

  for (const pack of packs) {
    const topicCard = page.locator('.topic-card').filter({ hasText: pack.title });
    await expect(topicCard.locator('.card-kicker')).toHaveCount(0);
    await topicCard.getByRole('link', { name: 'Open topic' }).click();

    await expect(page).toHaveURL(`/topics/${pack.id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(pack.title);
    await expect(page.locator('.topic-hero .eyebrow')).toContainText(`${pack.tests} tests`);
    await expect(page.locator('.topic-overview')).toContainText(String(pack.exercises));
    await expect(page.locator('.test-card')).toHaveCount(pack.tests);
    await expect(page.locator('.test-card:not(.review-test)')).toHaveCount(pack.focused);
    await expect(page.locator('.review-test')).toHaveCount(pack.reviews);
    await expect(page.getByRole('heading', { name: 'Focused tests' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.goto('/');
  }
});

test('labels the shared level range everywhere pack metadata appears', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.topic-grid > .card-kicker')).toHaveText('Level: 0 - A1.3');
  await expect(page.locator('.topic-card .card-kicker')).toHaveCount(0);

  for (const pack of packs) {
    await page.goto(`/topics/${pack.id}`);
    await expect(page.locator('.topic-hero .eyebrow')).toContainText('Level: 0 - A1.3');
  }

  await page.goto('/stats');
  await expect(page.locator('.topic-grid > .card-kicker')).toHaveText('Level: 0 - A1.3');
  await expect(page.locator('.stats-topic-card .card-kicker')).toHaveCount(0);

  for (const pack of packs) {
    await page.goto(`/stats/${pack.id}`);
    await expect(page.locator('.reports-hero .eyebrow')).toContainText('Level: 0 - A1.3');
  }
});

test('opens an affirmative Focused lesson and its fixed 24-question test', async ({ page }) => {
  const topic = packs[0].id;
  await page.goto(`/topics/${topic}`);
  const firstTest = page.locator('.test-card').first();
  await expect(firstTest.getByRole('heading')).toHaveText('Singular personal pronouns');
  await firstTest.getByRole('link', { name: 'Learn first' }).click();

  await expect(page.locator('.lesson-hero h1')).toHaveText('Singular personal pronouns');
  await expect(page.locator('.lesson-reader')).toContainText('minä = I');
  await expect(page.locator('.lesson-practice')).toContainText('4 practice questions');
  await expect(page.locator('.lesson-list')).toHaveCount(0);

  await page.goto(`/study/${topic}/ppo-singular-pronouns-test`);
  await expect(page.locator('.question-count')).toHaveText('1 / 24');
  await expect(page.locator('.exercise-card h2')).toContainText('Finnish subject pronoun');
  await page.getByRole('button', { name: 'Show answer' }).click();
  await expect(page.locator('.feedback')).toContainText('minä');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('opens the question transfer Review with only its five relevant lessons', async ({ page }) => {
  const topic = packs[2].id;
  await page.goto(`/topics/${topic}`);
  const finalReview = page.locator('.review-test').last();
  await expect(finalReview.getByRole('heading')).toHaveText(
    'Olla questions and short answers transfer review',
  );
  await expect(finalReview).toContainText('18 exercises');
  await finalReview.getByRole('link', { name: 'Learn first' }).click();

  await expect(page.locator('.lesson-hero h1')).toHaveText(
    'Olla questions and short answers transfer review',
  );
  if ((page.viewportSize()?.width ?? 0) <= 800) {
    await expect(page.locator('.lesson-picker option')).toHaveCount(5);
  } else {
    await expect(page.locator('.lesson-list button')).toHaveCount(5);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

import { expect, test } from '@playwright/test';

test('opens the catalog and exposes stable learning routes', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Take one clear step');
  await expect(page.locator('.topic-card')).toHaveCount(1);
  await expect(page.locator('.test-card')).toHaveCount(0);
  await page.getByRole('link', { name: 'Open topic' }).click();

  await expect(page).toHaveURL(/\/topics\/finnish-foundations-a1$/);
  await expect(page.locator('.test-card')).toHaveCount(15);
  await expect(page.locator('.test-group-heading h3')).toHaveText(['Focused tests', 'Reviews']);
  await expect(page.locator('.set-badge, .stage-badge')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('Core set');
  await expect(page.locator('body')).not.toContainText('Extended set');
  await expect(
    page.locator('.test-card').first().getByRole('link', { name: 'Learn first' }),
  ).toHaveAttribute('href', /\/learn\/finnish-foundations-a1\//);
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toContainText(
    'Topics',
  );

  await page.goto('/learn/finnish-foundations-a1/kpt-nouns');
  await expect(page.locator('.lesson-hero h1')).toHaveText('KPT in nouns');
  await expect(page.locator('.lesson-layout')).toHaveClass(/single-lesson/);
  await expect(page.locator('.lesson-list')).toHaveCount(0);
  await expect(page.locator('.lesson-picker')).toHaveCount(0);
  await expect(page.locator('.lesson-progress')).toHaveCount(0);
  await expect(page.locator('.reader-heading h2')).toHaveText('Building noun forms with -n');
  await expect(page.locator('body')).not.toContainText('Guided combination');

  if ((page.viewportSize()?.width ?? 0) > 800) {
    const readerBox = await page.locator('.lesson-reader').boundingBox();
    const viewportCenter = (page.viewportSize()?.width ?? 0) / 2;
    expect(readerBox).not.toBeNull();
    expect(
      Math.abs((readerBox?.x ?? 0) + (readerBox?.width ?? 0) / 2 - viewportCenter),
    ).toBeLessThan(2);
  }

  await page.goto('/learn/finnish-foundations-a1/guided-review');
  await expect(page.locator('.lesson-list button')).toHaveCount(13);
  await expect(page.locator('.lesson-hero .eyebrow')).toContainText('Review');
  await expect(page.locator('.lesson-hero h1')).toHaveText('Foundations checkpoint review');

  if ((page.viewportSize()?.width ?? 0) <= 800) {
    await expect(page.locator('.lesson-list')).toBeHidden();
    await expect(page.locator('.lesson-picker')).toBeVisible();
    await expect(page.locator('.lesson-picker option')).toHaveCount(13);
    await page.locator('.lesson-picker select').selectOption('1');
    await expect(page.locator('.reader-heading h2')).toContainText('Saying “in”');

    const pickerBox = await page.locator('.lesson-picker').boundingBox();
    const readerBox = await page.locator('.lesson-reader').boundingBox();
    expect(pickerBox).not.toBeNull();
    expect(readerBox).not.toBeNull();
    expect((readerBox?.y ?? 0) - ((pickerBox?.y ?? 0) + (pickerBox?.height ?? 0))).toBeLessThan(40);
  } else {
    await expect(page.locator('.lesson-list')).toBeVisible();
    await expect(page.locator('.lesson-picker')).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, 560));
    const positions = await page.evaluate(() => ({
      headerBottom: document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0,
      listTop: document.querySelector('.lesson-list')?.getBoundingClientRect().top ?? 0,
    }));
    expect(positions.listTop).toBeGreaterThanOrEqual(positions.headerBottom);
  }
});

test('keeps optional lesson practice separate from scored progress', async ({ page }) => {
  await page.goto('/topics/finnish-foundations-a1');
  await page.locator('.test-card').first().getByRole('link', { name: 'Learn first' }).click();

  await expect(page.getByRole('heading', { name: 'Vowel families' })).toBeVisible();
  await page.getByRole('button', { name: 'Start optional practice' }).click();
  await page.getByRole('button', { name: /Show answer/ }).click();

  await expect(page.locator('.lesson-practice .feedback')).toContainText('Answer revealed');
  await expect(page.locator('.lesson-practice .feedback')).toContainText(
    'Nothing was added to your test history or mistakes',
  );
});

test('keeps stationery exercise controls native and keyboard usable', async ({ page }) => {
  await page.goto('/study/finnish-foundations-a1/vowel-families');

  const firstChoice = page.getByRole('radio', { name: 'back vowels' });
  await firstChoice.check();
  await expect(firstChoice).toBeChecked();
  await expect(
    page.getByRole('progressbar', { name: 'Exercises completed in this session' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Check answer' })).toBeEnabled();

  await page.goto('/study/finnish-foundations-a1/harmony-in-forms');
  const answer = page.getByRole('textbox', { name: 'Your answer' });
  await answer.fill('talossa');
  await expect(answer).toHaveValue('talossa');

  await page.goto('/study/finnish-foundations-a1/plural-in-sentences');
  await page.getByRole('button', { name: /Show answer/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  const availableWords = page.getByLabel('Available words');
  const firstWord = availableWords.locator('button:not(:disabled)').first();
  const word = (await firstWord.textContent())?.trim();
  await firstWord.click();
  await expect(page.getByLabel('Your sentence').getByRole('button')).toContainText(
    word ?? 'missing word token',
  );
});

test('restores an unfinished scored session from browser storage', async ({ page }) => {
  await page.goto('/topics/finnish-foundations-a1');
  await page.locator('.test-card').first().getByRole('link', { name: 'Start test' }).click();
  await expect(page.getByRole('button', { name: /Show answer/ })).toBeEnabled();
  await page.keyboard.press('Alt+a');
  await expect(page.locator('.exercise-card .feedback')).toContainText('Answer revealed');

  await page.reload();

  await expect(page.locator('.exercise-card .feedback')).toContainText('Answer revealed');
  await expect(page.getByRole('button', { name: /Continue/ })).toBeVisible();
});

test('keeps the topic catalog and learning map usable at the 320-pixel minimum width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');

  await expect(page.locator('.topic-card')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toContainText('Data');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  await page.getByRole('link', { name: 'Open topic' }).click();
  await expect(page.locator('.test-card').first()).toBeVisible();
  await expect(
    page.locator('.test-card').first().getByRole('link', { name: 'Learn first' }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('keeps reports usable at the 320-pixel minimum width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/reports');

  await expect(page.getByRole('heading', { name: 'Reports', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: /results by test/i })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('shows deliberate backup and clearing controls without performing them', async ({ page }) => {
  await page.goto('/data');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Data & backup');
  await expect(page.getByRole('button', { name: 'Download backup' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear all history' })).toBeVisible();
});

test('remembers an appearance override and can return to automatic', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');

  const automatic = page.getByRole('radio', { name: 'Automatic' });
  const light = page.getByRole('radio', { name: 'Light' });
  await expect(automatic).toBeChecked();
  await expect(page.locator('html')).not.toHaveAttribute('data-appearance');

  await light.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'light');
  await page.reload();
  await expect(light).toBeChecked();

  await automatic.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).not.toHaveAttribute('data-appearance');
});

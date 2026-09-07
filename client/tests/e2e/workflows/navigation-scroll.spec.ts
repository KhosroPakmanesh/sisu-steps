import { expect, type Page, test } from '@playwright/test';

async function scrollAwayFromTop(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
}

async function expectPageAtTop(page: Page) {
  await expect(page.locator('main')).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
}

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`resets navigation scroll and preserves focus with motion ${reducedMotion}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Take one clear step');
    await expect(page.locator('main')).not.toBeFocused();

    for (const [name, path] of [
      ['Stats', '/stats'],
      ['Notebook', '/'],
    ]) {
      await scrollAwayFromTop(page);
      await page
        .getByRole('navigation', { name: 'Primary navigation' })
        .getByRole('link', { name, exact: true })
        .click();
      await expect(page).toHaveURL(path);
      await expectPageAtTop(page);
    }

    await scrollAwayFromTop(page);
    await page.locator('.topic-card a[href="/topics/vowel-harmony-location-endings"]').click();
    await expect(page).toHaveURL(/\/topics\/vowel-harmony-location-endings$/);
    await expectPageAtTop(page);

    await scrollAwayFromTop(page);
    await page.goBack();
    await expect(page).toHaveURL('/');
    await expectPageAtTop(page);

    await scrollAwayFromTop(page);
    await page.goForward();
    await expect(page).toHaveURL(/\/topics\/vowel-harmony-location-endings$/);
    await expectPageAtTop(page);
  });
}

test('does not preserve the retired legacy routes', async ({ page }) => {
  for (const legacyPath of ['/reports', '/data']) {
    await page.goto(legacyPath);
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Take one clear step');
  }
});

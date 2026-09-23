import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

test('loads both policy routes directly in the regular app shell', async ({ page }) => {
  for (const [route, heading] of [
    ['privacy', 'Privacy Policy'],
    ['terms', 'Terms of Service'],
  ] as const) {
    const entry = await readFile(resolve('dist/sisu-steps/browser', route, 'index.html'), 'utf8');
    expect(entry).toContain('<app-root');

    const response = await page.goto(`/${route}/`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.locator('.site-header')).toBeVisible();
    await expect(page.locator('.workbook-folder')).toBeVisible();
    await expect(page.locator('.site-footer')).toBeVisible();
    await expect(page.getByRole('link', { name: 'khosro.pakmanesh@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:khosro.pakmanesh@gmail.com',
    );
    await expect(page.getByRole('link', { name: 'open a GitHub issue' })).toHaveAttribute(
      'href',
      'https://github.com/KhosroPakmanesh/sisu-steps/issues',
    );
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true);

    const contentWidths = await page.evaluate(() => {
      const main = document.querySelector<HTMLElement>('main.legal-page');
      const introduction = main?.querySelector<HTMLElement>('.legal-page-header > p:last-child');
      const section = main?.querySelector<HTMLElement>('section');
      if (!main || !introduction || !section) return null;

      const style = getComputedStyle(main);
      const availableWidth =
        main.getBoundingClientRect().width -
        Number.parseFloat(style.paddingLeft) -
        Number.parseFloat(style.paddingRight) -
        Number.parseFloat(style.borderLeftWidth) -
        Number.parseFloat(style.borderRightWidth);
      return {
        introduction: introduction.getBoundingClientRect().width / availableWidth,
        section: section.getBoundingClientRect().width / availableWidth,
      };
    });
    expect(contentWidths?.introduction).toBeGreaterThan(0.95);
    expect(contentWidths?.section).toBeGreaterThan(0.95);
  }
});

test('links to both policies from the app footer', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('.site-footer-links');
  await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
    'href',
    '/privacy',
  );
  await expect(footer.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute(
    'href',
    '/terms',
  );

  await footer.getByRole('link', { name: 'Privacy Policy' }).click();
  await expect(page).toHaveURL(/\/privacy$/u);
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeVisible();
  await expect(
    page.getByText('Google Drive is contacted only when you choose a Drive action.'),
  ).toBeVisible();
  await expect(page.getByText('Disconnect Google Drive')).toBeVisible();

  await footer.getByRole('link', { name: 'Terms of Service' }).click();
  await expect(page).toHaveURL(/\/terms$/u);
  await expect(page.getByRole('heading', { level: 1, name: 'Terms of Service' })).toBeVisible();
});

import { expect, test } from '@playwright/test';

const SELECTED_PACK = 'vowel-harmony-location-endings';

test('shows a complete loading presentation before Angular bootstraps', async ({ page }) => {
  await page.route(/\.js(?:\?|$)/, (route) => route.abort());

  await page.goto('/');

  const bootLoader = page.locator('.app-boot');
  const loadingCard = bootLoader.locator('.app-boot__card');
  await expect(bootLoader).toBeVisible();
  await expect(bootLoader).toContainText('Opening your exercise book…');
  expect((await bootLoader.boundingBox())?.height).toBeGreaterThanOrEqual(
    page.viewportSize()?.height ?? 0,
  );
  await expect(loadingCard).toHaveCSS('background-image', /repeating-linear-gradient/);
  await expect(loadingCard).toHaveCSS('clip-path', /polygon/);
  expect(
    await loadingCard.evaluate((element) => getComputedStyle(element, '::before').content),
  ).not.toBe('none');
});

test('keeps one initial loader above Angular until the catalog is ready', async ({ page }) => {
  await page.route('**/content/**/pack.json', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });

  await page.goto('/');

  const appRoot = page.locator('app-root');
  const initialLoader = page.locator('#app-boot');
  await expect(page.locator('.site-header')).toBeAttached();
  await expect(initialLoader).toBeVisible();
  await expect(appRoot).toHaveAttribute('inert', '');
  await expect(appRoot).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.shell-route-loading')).toHaveCount(0);
  await expect(page.locator('app-root .spinner')).toHaveCount(0);

  await expect(page.locator(`a[href="/topics/${SELECTED_PACK}"]`).first()).toBeVisible();
  await expect(initialLoader).toBeHidden();
  await expect(appRoot).not.toHaveAttribute('inert', '');
  await expect(appRoot).not.toHaveAttribute('aria-hidden', 'true');
});

test('retains the same initial loader while a direct topic link loads its pack', async ({
  page,
}) => {
  await page.route(new RegExp(`/content/${SELECTED_PACK}/(?:lessons|tests)/`), async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });

  await page.goto(`/topics/${SELECTED_PACK}`);

  await expect(page.locator('.site-header')).toBeAttached();
  await expect(page.locator('#app-boot')).toBeVisible();
  await expect(page.locator('app-root')).toHaveAttribute('inert', '');
  await expect(page.locator('main.topic-page h1')).toBeVisible();
  await expect(page.locator('#app-boot')).toBeHidden();
});

test('reuses the one full-screen loader when an uncached pack opens', async ({ page }) => {
  await page.goto('/');
  const topicLink = page.locator(`a[href="/topics/${SELECTED_PACK}"]`).first();
  await expect(topicLink).toBeVisible();
  await expect(page.locator('#app-boot')).toBeHidden();

  await page.route(new RegExp(`/content/${SELECTED_PACK}/(?:lessons|tests)/`), async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });
  await topicLink.click();

  const appRoot = page.locator('app-root');
  await expect(page.locator('#app-boot')).toBeVisible();
  await expect(appRoot).toHaveAttribute('inert', '');
  await expect(page.locator('app-root .spinner')).toHaveCount(0);
  await expect(page.locator('main.topic-page h1')).toBeVisible();
  await expect(page.locator('#app-boot')).toBeHidden();
  await expect(appRoot).not.toHaveAttribute('inert', '');
});

test('reuses the one full-screen loader when catalog loading is retried', async ({ page }) => {
  let failManifestRequests = true;
  await page.route('**/content/**/pack.json', async (route) => {
    if (failManifestRequests) {
      await route.abort();
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });

  await page.goto('/');
  const loader = page.locator('#app-boot');
  await expect(
    page.getByRole('heading', { name: 'Your exercise book could not open' }),
  ).toBeVisible();
  await expect(loader).toBeHidden();
  expect(await loader.count()).toBe(1);

  failManifestRequests = false;
  await page.getByRole('button', { name: 'Try again' }).click();

  await expect(loader).toBeVisible();
  await expect(page.locator('app-root')).toHaveAttribute('inert', '');
  await expect(page.locator('app-root .spinner')).toHaveCount(0);
  await expect(page.locator(`a[href="/topics/${SELECTED_PACK}"]`).first()).toBeVisible();
  await expect(loader).toBeHidden();
  expect(await loader.count()).toBe(1);
});

test('loads manifests at startup and full content only after a topic opens', async ({ page }) => {
  const contentRequests: string[] = [];
  await page.addInitScript(() => {
    const metrics = globalThis as typeof globalThis & { startupLayoutShift: number };
    metrics.startupLayoutShift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!shift.hadRecentInput) metrics.startupLayoutShift += shift.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith('/content/')) contentRequests.push(path);
  });

  await page.goto('/');
  await expect(page.locator(`a[href="/topics/${SELECTED_PACK}"]`).first()).toBeVisible();
  await page.waitForTimeout(100);

  const startupRequests = [...contentRequests];
  expect(startupRequests.filter(isPackFragment)).toEqual([]);
  expect(startupRequests.filter((path) => path.endsWith('/pack.json'))).toHaveLength(11);
  expect(
    await page.evaluate(
      () => (globalThis as typeof globalThis & { startupLayoutShift: number }).startupLayoutShift,
    ),
  ).toBeLessThanOrEqual(0.02);

  await page.locator(`a[href="/topics/${SELECTED_PACK}"]`).first().click();
  await expect(page.locator('main.topic-page h1')).toBeVisible();

  const fragmentRequests = contentRequests.filter(isPackFragment);
  expect(fragmentRequests.some((path) => path.includes(`/${SELECTED_PACK}/lessons/`))).toBe(true);
  expect(fragmentRequests.some((path) => path.includes(`/${SELECTED_PACK}/tests/`))).toBe(true);
  expect(fragmentRequests.every((path) => path.includes(`/${SELECTED_PACK}/`))).toBe(true);
});

function isPackFragment(path: string): boolean {
  return path.includes('/lessons/') || path.includes('/tests/');
}

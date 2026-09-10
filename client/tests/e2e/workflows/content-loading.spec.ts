import { expect, test } from '@playwright/test';

const SELECTED_PACK = 'vowel-harmony-location-endings';

test('shows a complete loading presentation before Angular bootstraps', async ({ page }) => {
  await page.route(/\.js(?:\?|$)/, (route) => route.abort());

  await page.goto('/');

  const bootLoader = page.locator('.app-boot');
  await expect(bootLoader).toBeVisible();
  await expect(bootLoader).toContainText('Opening your exercise book…');
  expect((await bootLoader.boundingBox())?.height).toBeGreaterThanOrEqual(
    page.viewportSize()?.height ?? 0,
  );
});

test('keeps the loading paper aligned with visible folder hardware', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'chromium-mobile', 'Phone layout hides folder hardware.');
  await page.route('**/content/**/pack.json', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });

  await page.goto('/');

  const loadingPage = page.locator('main.loading-page');
  const pageClip = page.locator('.workbook-page-clip');
  await expect(loadingPage).toBeVisible();
  await expect(pageClip).toBeVisible();

  const [loadingBox, clipBox] = await Promise.all([
    loadingPage.boundingBox(),
    pageClip.boundingBox(),
  ]);
  expect(loadingBox).not.toBeNull();
  expect(clipBox).not.toBeNull();
  expect(
    Math.abs(loadingBox!.y + loadingBox!.height - (clipBox!.y + clipBox!.height)),
  ).toBeLessThanOrEqual(8);
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
  expect(startupRequests.filter((path) => path.endsWith('/pack.json'))).toHaveLength(6);
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

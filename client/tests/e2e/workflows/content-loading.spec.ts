import { expect, test } from '@playwright/test';
import { expandTopicGroup } from '../support/topic-groups';

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
  await page.route('**/content/index.json', async (route) => {
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

  await expect(page.locator('.topic-group-toggle').first()).toBeVisible();
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
  await expandTopicGroup(page, 'foundations');
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
  let failIndexRequests = true;
  await page.route('**/content/index.json', async (route) => {
    if (failIndexRequests) {
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

  failIndexRequests = false;
  await page.getByRole('button', { name: 'Try again' }).click();

  await expect(loader).toBeVisible();
  await expect(page.locator('app-root')).toHaveAttribute('inert', '');
  await expect(page.locator('app-root .spinner')).toHaveCount(0);
  await expect(page.locator('.topic-group-toggle').first()).toBeVisible();
  await expect(loader).toBeHidden();
  expect(await loader.count()).toBe(1);
});

test('loads only the startup index, then group metadata, then selected topic content', async ({
  page,
}) => {
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
  await expect(page.locator('.topic-group-toggle').first()).toBeVisible();
  await page.waitForTimeout(100);

  const startupRequests = [...contentRequests];
  expect(startupRequests).toEqual(['/content/index.json']);
  await expect(page.locator('.catalog-stats')).toContainText('2758');
  await expect(page.locator('.continue-card a').first()).toBeVisible();
  expect(startupRequests.filter(isPackFragment)).toEqual([]);
  expect(startupRequests.filter((path) => path.endsWith('/pack.json'))).toHaveLength(0);
  expect(
    await page.evaluate(
      () => (globalThis as typeof globalThis & { startupLayoutShift: number }).startupLayoutShift,
    ),
  ).toBeLessThanOrEqual(0.02);

  await expandTopicGroup(page, 'foundations');
  expect(contentRequests.filter((path) => path.endsWith('/pack.json'))).toEqual(
    expect.arrayContaining([
      '/content/vowel-harmony-location-endings/pack.json',
      '/content/kpt-singular-forms/pack.json',
      '/content/t-plural-agreement/pack.json',
    ]),
  );
  expect(contentRequests.filter((path) => path.endsWith('/pack.json'))).toHaveLength(3);
  expect(contentRequests.filter(isPackFragment)).toEqual([]);
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

test('reuses group metadata when reopened, when navigating to a topic, and when returning home', async ({
  page,
}) => {
  const manifests: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/pack.json')) manifests.push(request.url());
  });
  await page.goto('/');
  await expandTopicGroup(page, 'foundations');
  expect(manifests).toHaveLength(3);
  const group = page
    .locator('app-topic-group')
    .filter({ has: page.locator('#group-heading-foundations') });
  await group.locator('summary').click();
  await expect(group.locator('details')).toHaveJSProperty('open', false);
  await expect(group).not.toHaveClass(/animating/);
  await expandTopicGroup(page, 'foundations');
  expect(manifests).toHaveLength(3);
  await group.locator('a[href="/topics/' + SELECTED_PACK + '"]').click();
  await expect(page.locator('main.topic-page h1')).toBeVisible();
  expect(manifests).toHaveLength(3);
  await page
    .getByRole('navigation', { name: 'Primary navigation' })
    .getByRole('link', { name: 'Notebook', exact: true })
    .click();
  await expect(page.locator('.topic-group-disclosure[open]')).toHaveCount(0);
  await expect(page.locator('.topic-card')).toHaveCount(0);
  await expandTopicGroup(page, 'foundations');
  expect(manifests).toHaveLength(3);
});

test('keeps other groups operable and ignores canceled metadata activation', async ({ page }) => {
  const foundationIds = [
    'vowel-harmony-location-endings',
    'kpt-singular-forms',
    't-plural-agreement',
  ];
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requested = 0;
  let completed = 0;
  await page.route('**/content/**/pack.json', async (route) => {
    if (
      foundationIds.some((id) =>
        route
          .request()
          .url()
          .includes('/' + id + '/'),
      )
    ) {
      requested++;
      await gate;
      await route.continue();
      completed++;
    } else {
      await route.continue();
    }
  });
  await page.goto('/');
  const group = page
    .locator('app-topic-group')
    .filter({ has: page.locator('#group-heading-foundations') });
  try {
    await group.locator('summary').click();
    await expect(group.getByRole('status')).toHaveText('Loading topics…');
    await expect(group.locator('summary')).toHaveAttribute('aria-busy', 'true');
    await expect.poll(() => requested).toBe(3);
    await group.locator('summary').click();
    await expect(group.getByRole('status')).toHaveCount(0);
    await expandTopicGroup(page, 'demonstratives');
    release();
    await expect.poll(() => completed).toBe(3);
    await expect(group.locator('details')).toHaveJSProperty('open', false);
    await expect(group.locator('.topic-card')).toHaveCount(0);
    await expandTopicGroup(page, 'foundations');
    expect(requested).toBe(3);
  } finally {
    release();
  }
});

test('announces metadata failure and retries only the failed manifest', async ({ page }) => {
  let requests = 0;
  let failed = false;
  await page.route('**/content/**/pack.json', async (route) => {
    requests++;
    if (
      !failed &&
      route
        .request()
        .url()
        .includes('/' + SELECTED_PACK + '/')
    ) {
      failed = true;
      await route.abort();
    } else {
      await route.continue();
    }
  });
  await page.goto('/');
  const group = page
    .locator('app-topic-group')
    .filter({ has: page.locator('#group-heading-foundations') });
  await group.locator('summary').click();
  await expect(group.getByRole('alert')).toContainText('This topic group could not load.');
  await expect(group.locator('details')).toHaveJSProperty('open', false);
  await expect(group.locator('.topic-card')).toHaveCount(0);
  await expect(page.locator('#app-boot')).toBeHidden();
  await group.getByRole('button', { name: 'Try again' }).click();
  await expect(group.locator('summary')).toBeFocused();
  await expect(group.locator('details')).toHaveJSProperty('open', true);
  await expect(group.locator('.topic-card')).toHaveCount(3);
  await expect(group.getByRole('alert')).toHaveCount(0);
  expect(requests).toBe(4);
});

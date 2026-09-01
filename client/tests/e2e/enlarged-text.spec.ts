import { expect, type Page, test } from '@playwright/test';

const TOPIC = 'vowel-harmony-kpt-tplural';
const LESSON = `/learn/${TOPIC}/vowel-families`;
const STUDY = `/study/${TOPIC}/vowel-families`;

async function resizeText(page: Page, pixels: number) {
  // Apply the root size before initial layout, as with a browser font preference.
  await page.unroute('**/styles.css');
  await page.route('**/styles.css', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: `html { font-size: ${pixels}px !important; }\n${await response.text()}`,
    });
  });
  await page.reload();
  await page.locator('main h1').first().waitFor();
  const path = new URL(page.url()).pathname;
  if (path === '/') await page.locator('.topic-card').first().waitFor();
  if (path === '/reports') await page.locator('.report-ledger tbody tr').first().waitFor();
  if (path === '/data') await page.locator('.topic-archive').first().waitFor();
  await expect(page.locator('html')).toHaveCSS('font-size', `${pixels}px`);
  expect(
    await page.locator('.brand-mark').evaluate((element) => element.getBoundingClientRect().width),
  ).toBeGreaterThan(pixels * 2.5);
}

async function expectReadablePage(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  const overflow = await page.locator('body').evaluate((body) =>
    [
      ...body.querySelectorAll<HTMLElement>(
        'header,footer,main,h1,h2,h3,h4,p,li,dt,dd,a,button,label',
      ),
    ]
      .filter(
        (element) =>
          element.clientWidth > 1 &&
          !!element.textContent?.trim() &&
          !element.closest('[aria-hidden="true"],.visually-hidden,.semantic-ledger-head') &&
          element.scrollWidth > element.clientWidth + 2,
      )
      .map((element) => ({
        class: element.className,
        text: element.textContent?.trim().slice(0, 70),
      })),
  );
  expect(overflow).toEqual([]);
  const covered = await page
    .locator('.exercise-context p,.reveal-note,.text-answer')
    .evaluateAll((elements) => {
      const failures: string[] = [];
      for (const element of elements) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const text = node.textContent ?? '';
          if (!text.trim()) continue;
          for (const offset of new Set([text.search(/\S/), text.search(/\s*$/) - 1])) {
            const range = document.createRange();
            range.setStart(node, offset);
            range.setEnd(node, offset + 1);
            let rect = range.getBoundingClientRect();
            scrollBy(0, rect.y + rect.height / 2 - innerHeight / 2);
            rect = range.getBoundingClientRect();
            const hit = document.elementFromPoint(
              rect.x + rect.width / 2,
              rect.y + rect.height / 2,
            );
            if (!hit || !node.parentElement!.contains(hit)) failures.push(text.trim());
          }
        }
      }
      return failures;
    });
  expect(covered).toEqual([]);
}

for (const appearance of ['Day', 'Night']) {
  test.describe(`${appearance} enlarged text`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await page.locator('main h1').waitFor();
      await page.locator('.topic-card').first().waitFor();
      const radio = page.getByRole('radio', { name: appearance, exact: true });
      await page.locator('.appearance-options label').filter({ has: radio }).click();
      await expect(radio).toBeChecked();
    });

    test('reflows routed content at 150% and 200% without reducing text', async ({ page }) => {
      test.setTimeout(120_000);
      for (const pixels of [24, 32]) {
        for (const route of [
          '/',
          `/topics/${TOPIC}`,
          LESSON,
          `/learn/${TOPIC}/foundations-review`,
          STUDY,
          '/reports',
          '/data',
          `/mistakes/${TOPIC}`,
          `/review/${TOPIC}`,
        ]) {
          await page.goto(route);
          await page.locator('main h1').first().waitFor();
          await resizeText(page, pixels);
          await expectReadablePage(page);
          const picker = page.locator('.lesson-picker select');
          if (route.endsWith('/foundations-review') && (await picker.isVisible())) {
            await picker.focus();
            await page.keyboard.press('Home');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
            await expect(picker).toHaveValue('1');
            await expect(page.locator('.reader-heading h2')).toHaveText(
              'Saying “in” with -ssa and -ssä',
            );
          }
          if (route === LESSON) {
            await expect(page.locator('.teaching-section p').first()).toHaveCSS(
              'font-size',
              `${pixels}px`,
            );
          }
        }
      }
    });

    test('keeps navigation and Appearance operable and restores normal geometry', async ({
      page,
    }) => {
      const geometry = () =>
        page.evaluate(() =>
          [
            '.site-header',
            '.brand',
            '.header-tools',
            '.workbook-folder',
            '.workbook-cover',
            'main',
            '.workbook-page-clip',
          ].map((selector) => {
            const rect = document.querySelector(selector)!.getBoundingClientRect();
            return { selector, x: rect.x, y: rect.y, width: rect.width };
          }),
        );
      const normal = await geometry();
      await resizeText(page, 32);
      const brand = await page.locator('.brand').boundingBox();
      const tools = await page.locator('.header-tools').boundingBox();
      if (page.viewportSize()!.width === 320) {
        expect(tools!.y).toBeGreaterThanOrEqual(brand!.y + brand!.height);
      }
      const automatic = page.getByRole('radio', { name: 'Automatic', exact: true });
      await automatic.focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.getByRole('radio', { name: 'Night', exact: true })).toBeChecked();
      for (const name of ['Topics', 'Reports', 'Data & backup']) {
        const link = page.getByRole('link', { name, exact: true });
        await link.scrollIntoViewIfNeeded();
        const bounds = await link.locator('span').boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
        const visible = await link.locator('span').evaluate((span) => {
          const rect = span.getBoundingClientRect();
          return span
            .closest('a')!
            .contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
        });
        expect(visible).toBe(true);
      }
      await page.evaluate(() => scrollTo(0, 0));
      await resizeText(page, 16);
      expect(await geometry()).toEqual(normal);
    });

    test('keeps enlarged practice, feedback, sentence explanations and results readable', async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await page.goto(LESSON);
      await page.locator('main h1').waitFor();
      await resizeText(page, 32);
      await page.getByRole('button', { name: 'Start optional practice', exact: true }).click();
      await expectReadablePage(page);
      await page.getByRole('radio', { name: 'front vowels', exact: true }).check();
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      await expectReadablePage(page);

      await page.goto(`/study/${TOPIC}/plural-in-sentences`);
      await page.locator('main h1').waitFor();
      await resizeText(page, 32);
      await page.getByRole('button', { name: 'Show answer', exact: true }).click();
      await expect(page.locator('.feedback')).toBeVisible();
      await expectReadablePage(page);
      await page.locator('.continue-button').click();
      await expect(page.locator('.feedback')).toHaveCount(0);
      await expectReadablePage(page);

      await page.goto(STUDY);
      await page.locator('main h1').waitFor();
      await resizeText(page, 32);
      const count = Number(await page.locator('.runner-progress').getAttribute('max'));
      for (let index = 0; index < count; index++) {
        await page.getByRole('button', { name: 'Show answer', exact: true }).click();
        await expect(page.locator('.feedback')).toBeVisible();
        await expectReadablePage(page);
        await page.locator('.continue-button').click();
        await expect(page.locator('.feedback')).toHaveCount(0);
      }
      await expect(page.locator('.result-card')).toBeVisible();
      await expectReadablePage(page);
    });
  });
}

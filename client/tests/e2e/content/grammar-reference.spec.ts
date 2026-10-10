import { expect, test } from '@playwright/test';
import {
  catalog,
  loadPack,
  learnerState,
  expectLessonExamples,
} from '../support/grammar-reference';
import { expandTopicGroup } from '../support/topic-groups';

test('shows every group’s exact authored grammar in order without loading scored tests or changing data', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith('/content/')) requests.push(path);
  });
  await page.goto('/');
  await expect(page.locator('.topic-group-toggle')).toHaveCount(catalog.groups.length);
  expect(requests).toEqual(['/content/index.json']);
  const before = await learnerState(page);

  for (const group of catalog.groups) {
    const section = page
      .locator('.pack-group')
      .filter({ has: page.locator('#group-heading-' + group.id) });
    const trigger = section.getByRole('button', {
      name: 'Grammar reference for ' + group.title,
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: group.title, exact: true });
    const packs = group.packs.map(loadPack);
    await expect(dialog.locator('.reference-pack')).toHaveCount(packs.length);
    await expect(section.locator(':scope > details')).toHaveJSProperty('open', false);
    await expect(dialog.locator('.reference-pack > h3')).toHaveText(
      packs.map((pack) => pack.title),
    );
    for (const [index, pack] of packs.entries()) {
      const articles = dialog.locator('.reference-pack').nth(index).locator('.reference-lesson');
      await expect(articles.locator('h4')).toHaveText(pack.lessons.map((lesson) => lesson.title));
      await expect(articles.locator('.lesson-summary')).toHaveText(
        pack.lessons.map((lesson) => lesson.summary),
      );
      for (const [lessonIndex, lesson] of pack.lessons.entries()) {
        await expectLessonExamples(articles.nth(lessonIndex), lesson);
      }
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(section.locator('.reference-lesson')).toHaveCount(0);
  }
  expect(requests.filter((path) => path.includes('/tests/'))).toEqual([]);
  expect(await learnerState(page)).toEqual(before);
});

test('keeps disclosure state independent and uses existing close, backdrop, and focus behavior', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const section = page.locator('.pack-group').first();
  const header = section.locator('summary');
  const trigger = section.getByRole('button', {
    name: 'Grammar reference for Foundations',
    exact: true,
  });
  await header.click();
  await expect(section.locator(':scope > details')).toHaveJSProperty('open', true);
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Foundations', exact: true });
  const close = dialog.getByRole('button', { name: 'Close grammar reference for Foundations' });
  await expect(dialog.locator('.reference-lesson').first()).toBeVisible();
  await expect(close).toBeFocused();
  await page.keyboard.press('Tab');
  expect(
    await dialog.evaluate(
      (element) =>
        document.activeElement === document.body || element.contains(document.activeElement),
    ),
  ).toBe(true);
  await page.keyboard.press('Shift+Tab');
  await expect(close).toBeFocused();
  await dialog.locator('h2').click();
  await expect(dialog).toBeVisible();
  await close.click();
  await expect(trigger).toBeFocused();
  await expect(section.locator(':scope > details')).toHaveJSProperty('open', true);
  await trigger.click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(section.locator(':scope > details')).toHaveJSProperty('open', true);
});

test('offers modal loading and retry after failure while leaving the catalog usable', async ({
  page,
}) => {
  let fail = true;
  await page.route('**/content/vowel-harmony-location-endings/lessons/*.json', async (route) => {
    if (fail) await route.abort();
    else await route.continue();
  });
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Grammar reference for Foundations', exact: true })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Foundations', exact: true });
  await expect(dialog.getByRole('alert')).toContainText('could not load');
  await expect(page.locator('#app-boot')).toBeHidden();
  const actions = dialog.locator('.modal-sheet__actions');
  await expect(actions).toHaveCSS('justify-content', 'end');
  expect(
    await actions.evaluate((element) => {
      const button = element.querySelector('button')!;
      return (
        element.clientWidth -
        (button.offsetLeft - (element as HTMLElement).offsetLeft) -
        button.offsetWidth
      );
    }),
  ).toBeLessThanOrEqual(1);
  fail = false;
  await dialog.getByRole('button', { name: 'Try again' }).click();
  await expect(dialog.locator('.reference-pack')).toHaveCount(3);
  await expect(
    dialog.getByRole('button', { name: 'Close grammar reference for Foundations' }),
  ).toBeFocused();
});

test('dismisses an unfinished load without reopening or requesting subsequent packs', async ({
  page,
}) => {
  let release!: () => void;
  const pending = new Promise<void>((accept) => {
    release = accept;
  });
  const requests: string[] = [];
  await page.route('**/content/vowel-harmony-location-endings/lessons/*.json', async (route) => {
    await pending;
    await route.continue();
  });
  page.on('request', (request) => requests.push(new URL(request.url()).pathname));
  await page.goto('/');
  const trigger = page.getByRole('button', {
    name: 'Grammar reference for Foundations',
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Foundations', exact: true });
  await expect(dialog.getByRole('status')).toContainText('Loading');
  await expect.poll(() => requests.some((path) => path.includes('/lessons/'))).toBe(true);
  await page.keyboard.press('Escape');
  release();
  await expect(trigger).toBeFocused();
  await expect(dialog).toBeHidden();
  await page.waitForTimeout(150);
  expect(requests.some((path) => path.includes('/kpt-singular-forms/'))).toBe(false);
  await expect(page.locator('.reference-lesson')).toHaveCount(0);
  await trigger.click();
  await expect(dialog.locator('.reference-pack')).toHaveCount(3);
});

test('keeps both icons inside the paper at collapsed and expanded sizes', async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const initialSize = page.viewportSize()!;
  const sizes =
    testInfo.project.name === 'chromium-wide'
      ? [initialSize, { width: 2560, height: 1440 }]
      : [initialSize];
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.goto('/');
    await expect(page.locator('app-topic-group')).toHaveCount(catalog.groups.length);
    for (const scale of [1, 2]) {
      await page.evaluate((value) => {
        document.documentElement.style.fontSize = value * 16 + 'px';
      }, scale);
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      for (const groupId of ['foundations', 'ownership-and-possession']) {
        const section = page
          .locator('app-topic-group')
          .filter({ has: page.locator('#group-heading-' + groupId) });
        for (const expanded of [false, true]) {
          if (expanded) await expandTopicGroup(page, groupId);
          await section
            .locator('.pack-group > app-grammar-reference > button')
            .scrollIntoViewIfNeeded();
          const painted = await section.evaluate((element) => {
            const paper = element.querySelector('.pack-group');
            return [
              ...element.querySelectorAll<SVGSVGElement>(
                '.pack-group > app-grammar-reference .grammar-reference-trigger svg, .topic-group-toggle > .topic-group-chevron',
              ),
            ].flatMap((svg) =>
              [
                [0, 0],
                [24, 0],
                [24, 24],
                [0, 24],
              ].map(([x, y]) => {
                const point = new DOMPoint(x, y).matrixTransform(svg.getScreenCTM()!);
                return (
                  document.elementFromPoint(point.x, point.y)?.closest('.pack-group') === paper
                );
              }),
            );
          });
          expect(
            painted,
            groupId + ' at ' + size.width + 'px / ' + scale * 100 + '% text',
          ).toHaveLength(8);
          expect(painted).not.toContain(false);
        }
        await section.locator('summary h3').click();
        await expect(section.locator('.pack-group > details')).toHaveJSProperty('open', false);
      }
    }
  }
});

for (const appearance of ['Day', 'Night']) {
  for (const scale of [1, 1.5, 2]) {
    test(
      'keeps the reference readable at ' + scale * 100 + '% text in ' + appearance,
      async ({ page }, testInfo) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');
        await page.getByRole('radio', { name: appearance, exact: true }).check();
        await page.evaluate((value) => {
          document.documentElement.style.fontSize = value * 16 + 'px';
        }, scale);
        const group = catalog.groups.find(
          (candidate) => candidate.id === 'ownership-and-possession',
        )!;
        const trigger = page.getByRole('button', {
          name: 'Grammar reference for ' + group.title,
          exact: true,
        });
        for (const header of await page.locator('.topic-group-toggle').all()) {
          const heading = await header.locator('h3').boundingBox();
          const button = await header
            .locator('../..')
            .locator(':scope > app-grammar-reference > button')
            .boundingBox();
          expect(heading).toBeTruthy();
          expect(button).toBeTruthy();
          const textBounds = await header.locator('h3').evaluate((element) => {
            const range = document.createRange();
            range.selectNodeContents(element);
            return [...range.getClientRects()].map((rect) => ({ right: rect.right }));
          });
          if (button!.y < heading!.y + heading!.height - 1) {
            expect(Math.max(...textBounds.map((rect) => rect.right))).toBeLessThanOrEqual(
              button!.x + 1,
            );
          } else {
            expect(button!.y).toBeGreaterThanOrEqual(heading!.y + heading!.height - 1);
          }
        }
        await trigger.click();
        const dialog = page.getByRole('dialog', { name: group.title, exact: true });
        await expect(dialog.locator('.reference-lesson')).toHaveCount(44);
        const paperColor = await page
          .locator('.pack-group')
          .first()
          .evaluate((element) => getComputedStyle(element).backgroundColor);
        await expect(dialog.locator('.reference-lesson').first()).toHaveCSS(
          'background-color',
          paperColor,
        );
        await expect(dialog).toHaveCSS('animation-name', 'none');
        await expect(dialog.locator('.reference-lesson h4').first()).toBeInViewport();
        expect(
          await dialog
            .locator('.modal-sheet__header')
            .evaluate((element) => element.getBoundingClientRect().height),
        ).toBeLessThan((await dialog.evaluate((element) => element.clientHeight)) * 0.75);
        expect(
          await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
        ).toBe(true);
        expect(
          await dialog
            .locator('.reference-lesson')
            .first()
            .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
        ).toBe(true);
        await expect(dialog.locator('.reference-lesson').first()).toHaveCSS(
          'border-top-style',
          'dashed',
        );
        await expect(dialog.locator('.reference-lesson').first()).toHaveCSS('clip-path', /polygon/);
        await page.screenshot({ path: testInfo.outputPath('grammar-reference.png') });
        await dialog.locator('.reference-lesson').last().scrollIntoViewIfNeeded();
        await expect(dialog.locator('.reference-lesson').last()).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
      },
    );
  }
}

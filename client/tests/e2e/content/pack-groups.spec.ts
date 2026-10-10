import { expect, test } from '@playwright/test';
import { expandTopicGroup, expandTopicGroups } from '../support/topic-groups';

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
      'demonstrative-pronouns',
      'negative-demonstrative-statements',
      'demonstrative-questions',
    ],
  },
  {
    id: 'ownership-and-possession',
    title: 'Ownership and possession',
    packs: [
      'affirmative-possession',
      'negative-possession',
      'possession-questions',
      'negative-possession-questions',
      'possessive-pronouns-endings',
    ],
  },
];

test('groups catalog topic cards into labeled sections in pack order', async ({ page }) => {
  await page.goto('/');
  await page.locator('.topic-group-toggle').first().waitFor();

  const groups = page.locator('.pack-group');
  await expect(groups).toHaveCount(expectedGroups.length);

  for (const [index, expected] of expectedGroups.entries()) {
    const group = groups.nth(index);
    await expect(group.getByRole('heading', { name: expected.title, level: 3 })).toBeVisible();

    await expect(group.locator('details')).toHaveJSProperty('open', false);
    await expect(group.locator('.group-cards')).toBeHidden();
    await expandTopicGroup(page, expected.id);
    const cards = group.locator('.group-cards > .topic-card');
    await expect(cards).toHaveCount(expected.packs.length);
    for (const [packIndex, packId] of expected.packs.entries()) {
      await expect(cards.nth(packIndex).locator(`a[href="/topics/${packId}"]`)).toBeVisible();
    }
  }

  await expect(page.locator('.topic-card')).toHaveCount(14);
});

test('mirrors the same grouping on the stats catalog', async ({ page }) => {
  const packContent: string[] = [];
  page.on('request', (request) => {
    if (/\/content\/[^/]+\/.+\.json$/.test(new URL(request.url()).pathname)) {
      packContent.push(request.url());
    }
  });
  await page.goto('/stats');
  await page.locator('.topic-group-toggle').first().waitFor();
  await expect(page.locator('.stats-topic-card')).toHaveCount(0);
  await expect(page.locator('.topic-group-disclosure[open]')).toHaveCount(0);

  const groups = page.locator('.pack-group');
  await expect(groups).toHaveCount(expectedGroups.length);

  for (const [index, expected] of expectedGroups.entries()) {
    const group = groups.nth(index);
    await expect(group.getByRole('heading', { name: expected.title, level: 3 })).toBeVisible();

    await expandTopicGroup(page, expected.id);
    const cards = group.locator('.group-cards > .stats-topic-card');
    await expect(cards).toHaveCount(expected.packs.length);
    for (const [packIndex, packId] of expected.packs.entries()) {
      await expect(cards.nth(packIndex).locator(`a[href="/stats/${packId}"]`)).toBeVisible();
    }
  }
  expect(packContent).toEqual([]);
});

test('keeps each pack-group section inside the bound topic-grid sheet', async ({ page }) => {
  await page.goto('/');
  await page.locator('.topic-group-toggle').first().waitFor();

  await expandTopicGroups(page);
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

for (const catalogPath of ['/', '/stats']) {
  test.describe(catalogPath === '/' ? 'Notebook disclosures' : 'Stats disclosures', () => {
    test('toggles groups independently by mouse and keyboard and skips hidden topic actions', async ({
      page,
    }, testInfo) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(catalogPath);
      const disclosures = page.locator('.topic-group-disclosure');
      const headers = page.locator('.topic-group-toggle');
      await expect(headers).toHaveCount(expectedGroups.length);
      await expect(page.locator('.topic-catalog .topic-card:visible')).toHaveCount(0);
      await expect(page.locator('.topic-group-disclosure[open]')).toHaveCount(0);
      await page.screenshot({ path: testInfo.outputPath('catalog-collapsed.png'), fullPage: true });

      await headers.first().focus();
      await page.keyboard.press('Tab');
      if (catalogPath === '/') {
        await expect(
          page.getByRole('button', { name: 'Grammar reference for Foundations', exact: true }),
        ).toBeFocused();
        await page.keyboard.press('Tab');
      }
      await expect(headers.nth(1)).toBeFocused();
      await headers.first().focus();
      await expect(headers.first()).toHaveCSS('outline-style', 'solid');
      const chevron = headers.first().locator('svg');
      await expect(chevron).toHaveCSS('transform', 'none');

      await page.keyboard.press('Enter');
      await expect(disclosures.first()).toHaveJSProperty('open', true);
      await expect(disclosures.first().locator('.topic-card').first()).toBeVisible();
      await expect(chevron).not.toHaveCSS('transform', 'none');
      await expect(disclosures.nth(1)).toHaveJSProperty('open', false);

      await headers.nth(1).focus();
      await page.keyboard.press('Space');
      await expect(disclosures.nth(1)).toHaveJSProperty('open', true);
      await expect(disclosures.first()).toHaveJSProperty('open', true);
      await chevron.click();
      await expect(disclosures.first()).toHaveJSProperty('open', false);
      await expect(disclosures.nth(1)).toHaveJSProperty('open', true);
      await expect(disclosures.first().locator('.topic-card').first()).toBeHidden();
      await expect(chevron).toHaveCSS('transform', 'none');

      await headers.nth(1).press('Enter');
      await expect(disclosures.nth(1)).toHaveJSProperty('open', false);
    });

    test('starts every group collapsed after reload and returning from a topic', async ({
      page,
    }) => {
      await page.goto(catalogPath);
      await expandTopicGroup(page, 'foundations');
      await page.reload();
      await expect(page.locator('.topic-group-toggle')).toHaveCount(expectedGroups.length);
      await expect(page.locator('.topic-group-disclosure[open]')).toHaveCount(0);
      await expect(page.locator('.topic-catalog .topic-card:visible')).toHaveCount(0);

      await expandTopicGroup(page, 'foundations');
      const topicPath = catalogPath === '/' ? '/topics' : '/stats';
      await page
        .locator('.topic-card a[href="' + topicPath + '/vowel-harmony-location-endings"]')
        .click();
      await expect(page).toHaveURL(new RegExp(topicPath + '/vowel-harmony-location-endings$'));
      await expect(page.locator('main h1')).toBeVisible();
      await page
        .getByRole('navigation', { name: 'Primary navigation' })
        .getByRole('link', { name: 'Notebook', exact: true })
        .click();
      await expect(page.locator('.topic-group-toggle')).toHaveCount(expectedGroups.length);
      await expect(page.locator('.topic-group-disclosure[open]')).toHaveCount(0);
      await expect(page.locator('.topic-catalog .topic-card:visible')).toHaveCount(0);
    });

    test('keeps right-aligned chevrons and headers readable with enlarged text in both appearances', async ({
      page,
    }, testInfo) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(catalogPath);
      await expect(page.locator('.topic-group-toggle')).toHaveCount(expectedGroups.length);
      for (const appearance of ['Day', 'Night']) {
        const radio = page.getByRole('radio', { name: appearance, exact: true });
        await page.locator('.appearance-options label').filter({ has: radio }).click();
        for (const pixels of [16, 24, 32]) {
          await page.locator('html').evaluate((element, size) => {
            element.style.fontSize = size + 'px';
          }, pixels);
          await expect(page.locator('html')).toHaveCSS('font-size', pixels + 'px');
          // Container-query tracks settle on the next rendered frame after a text-scale change.
          await page.evaluate(
            () =>
              new Promise<void>((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
              ),
          );
          for (const header of await page.locator('.topic-group-toggle').all()) {
            const geometry = await header.evaluate((element) => {
              const header = element.getBoundingClientRect();
              const title = element.querySelector('h3')!.getBoundingClientRect();
              const icon = element.querySelector('svg')!.getBoundingClientRect();
              return {
                header: header.toJSON(),
                title: title.toJSON(),
                icon: icon.toJSON(),
                overflow: element.scrollWidth - element.clientWidth,
              };
            });
            expect(geometry.header.height).toBeGreaterThanOrEqual(pixels * 3);
            expect(geometry.icon.left).toBeGreaterThanOrEqual(geometry.title.right);
            expect(geometry.icon.right).toBeLessThanOrEqual(geometry.header.right);
            expect(geometry.icon.bottom).toBeLessThanOrEqual(geometry.header.bottom);
            expect(geometry.overflow).toBeLessThanOrEqual(1);
          }
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
          ).toBeLessThanOrEqual(page.viewportSize()!.width);
        }
      }
      await page.locator('html').evaluate((element) => {
        element.style.fontSize = '16px';
      });
      await expandTopicGroups(page);
      await expect(page.locator('.topic-catalog .topic-card:visible')).toHaveCount(14);
      await page.screenshot({ path: testInfo.outputPath('catalog-expanded.png'), fullPage: true });
    });

    test('uses four, two, and one collapsed-group columns and gives every expanded group the full row', async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-wide');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const [width, columns] of [
        [1440, 4],
        [900, 2],
        [650, 1],
        [320, 1],
      ]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(catalogPath);
        await expect(page.locator('.topic-group-toggle')).toHaveCount(expectedGroups.length);
        const stack = page.locator('.pack-group-stack');
        expect(
          await stack.evaluate(
            (element) => getComputedStyle(element).gridTemplateColumns.split(' ').length,
          ),
        ).toBe(columns);
        for (const group of expectedGroups) {
          await expandTopicGroup(page, group.id);
          const component = page.locator('.topic-group').filter({
            has: page.locator('[id$="group-heading-' + group.id + '"]'),
          });
          const geometry = await component.evaluate((element) => ({
            width: (element as HTMLElement).offsetWidth,
            rowWidth: element.parentElement!.clientWidth,
            animations: element
              .getAnimations()
              .filter((animation) =>
                (animation.effect as KeyframeEffect)
                  .getKeyframes()
                  .some((frame) => frame.width !== undefined),
              ).length,
          }));
          expect(Math.abs(geometry.width - geometry.rowWidth)).toBeLessThanOrEqual(1);
          expect(geometry.animations).toBe(0);
          await expect(component.locator('.topic-card').first()).toBeVisible();
          await component.locator('summary').click();
          await expect(component.locator('details')).toHaveJSProperty('open', false);
          await expect(page.locator('.topic-group-disclosure[open]')).toHaveCount(0);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
      }
    });

    test('widens before revealing cards and cancels obsolete animation on rapid toggles', async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-wide');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto(catalogPath);
      const component = page.locator('.topic-group').nth(2);
      const summary = component.locator('summary');
      await expect(summary).toBeVisible();
      await summary.click();
      await expect(component).toHaveClass(/animating/);
      const frames = await component.evaluate((element) => {
        const resize = element
          .getAnimations()
          .find((animation) =>
            (animation.effect as KeyframeEffect)
              .getKeyframes()
              .some((frame) => frame.width !== undefined),
          )!;
        const reveal = element.querySelector('.group-cards')!.getAnimations()[0];
        resize.pause();
        reveal.pause();
        const duration = Number(resize.effect!.getTiming().duration);
        resize.currentTime = duration / 4;
        reveal.currentTime = duration / 4;
        return {
          resize: (resize.effect as KeyframeEffect).getKeyframes(),
          revealDelay: reveal.effect!.getTiming().delay,
          duration,
        };
      });
      expect(frames.resize).toHaveLength(3);
      expect(parseFloat(String(frames.resize[1].width))).toBeGreaterThan(
        parseFloat(String(frames.resize[0].width)),
      );
      expect(frames.resize[1].height).toBe(frames.resize[0].height);
      expect(parseFloat(String(frames.resize[2].height))).toBeGreaterThan(
        parseFloat(String(frames.resize[1].height)),
      );
      expect(frames.revealDelay).toBe(frames.duration / 2);
      await expect(component.locator('.group-cards')).toHaveCSS('opacity', '0');
      await component.evaluate((element) => {
        const resize = element
          .getAnimations()
          .find((animation) =>
            (animation.effect as KeyframeEffect)
              .getKeyframes()
              .some((frame) => frame.width !== undefined),
          )!;
        const reveal = element.querySelector('.group-cards')!.getAnimations()[0];
        const duration = Number(resize.effect!.getTiming().duration);
        resize.currentTime = duration * 0.75;
        reveal.currentTime = duration * 0.75;
        resize.play();
        reveal.play();
      });
      await expect(component.locator('.group-cards')).not.toHaveCSS('opacity', '0');
      await expect(component).not.toHaveClass(/animating/);
      await summary.click();
      await summary.click();
      await expect(component.locator('details')).toHaveJSProperty('open', true);
      await expect(component).not.toHaveClass(/animating/);
      expect(await component.evaluate((element) => element.getAnimations().length)).toBe(0);
      await summary.click();
      await expect(component.locator('details')).toHaveJSProperty('open', false);
      await expect(component).not.toHaveClass(/animating/);
    });

    for (const motion of ['no-preference', 'reduce'] as const) {
      test(
        'brings expanded groups into view without covering their header with motion ' + motion,
        async ({ page }, testInfo) => {
          await page.emulateMedia({ reducedMotion: motion });
          await page.goto(catalogPath);
          const group = page.locator('.topic-group').filter({
            has: page.locator('[id$="group-heading-demonstratives"]'),
          });
          const summary = group.locator('summary');
          await expect(summary).toBeVisible();
          await summary.evaluate((element) => {
            const bounds = element.getBoundingClientRect();
            scrollTo({ top: scrollY + bounds.top - innerHeight * 0.65, behavior: 'instant' });
          });
          await summary.click();
          await expect(group.locator('details')).toHaveJSProperty('open', true);
          await expect(group).not.toHaveClass(/animating/);
          await expect
            .poll(() =>
              group.evaluate((element) => {
                const header = document.querySelector('.site-header')!;
                const position = getComputedStyle(header).position;
                const headerBottom =
                  position === 'sticky' || position === 'fixed'
                    ? Math.max(0, header.getBoundingClientRect().bottom)
                    : 0;
                const gap = parseFloat(getComputedStyle(element).scrollMarginTop);
                const bounds = element.getBoundingClientRect();
                const top = headerBottom + gap;
                const bottom = innerHeight - gap;
                return bounds.height <= bottom - top
                  ? bounds.top >= top - 2 && bounds.bottom <= bottom + 2
                  : Math.abs(bounds.top - top) <= 2;
              }),
            )
            .toBe(true);
          await expect(summary).toBeFocused();
          await expect(group.locator('.topic-card').first()).toBeInViewport();
          await page.screenshot({ path: testInfo.outputPath('expanded-group-visible.png') });
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
        },
      );
    }

    test('keeps an already visible expanded group at the current scroll position', async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-wide');
      await page.setViewportSize({ width: 1440, height: catalogPath === '/' ? 1800 : 3000 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(catalogPath);
      await expect(page.locator('.topic-group-toggle')).toHaveCount(expectedGroups.length);
      const before = await page.evaluate(() => scrollY);
      await expandTopicGroup(page, 'foundations');
      expect(await page.evaluate(() => scrollY)).toBe(before);
    });
  });
}

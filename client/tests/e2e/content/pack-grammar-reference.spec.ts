import { expect, test } from '@playwright/test';
import {
  catalog,
  loadPack,
  learnerState,
  expectLessonExamples,
} from '../support/grammar-reference';
import { expandTopicGroup } from '../support/topic-groups';

test('opens every pack’s authored lessons only, with unchanged navigation and learner data', async ({
  page,
}) => {
  test.setTimeout(90000);
  const requests: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith('/content/')) requests.push(path);
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.topic-group-toggle')).toHaveCount(catalog.groups.length);
  expect(requests).toEqual(['/content/index.json']);
  const before = await learnerState(page);

  for (const group of catalog.groups) {
    await expandTopicGroup(page, group.id);
    const section = page.locator('.pack-group').filter({
      has: page.locator('#group-heading-' + group.id),
    });
    for (const id of group.packs) {
      const pack = loadPack(id);
      const card = section.locator('.topic-card').filter({
        has: page.getByRole('heading', { name: pack.title, level: 4, exact: true }),
      });
      const trigger = card.getByRole('button', {
        name: 'Grammar reference for ' + pack.title,
        exact: true,
      });
      await expect(trigger).toHaveAttribute('title', 'Grammar reference for ' + pack.title);
      const requestStart = requests.length;
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: pack.title, exact: true });
      await expect(dialog.locator('.reference-lesson h3')).toHaveText(
        pack.lessons.map((lesson) => lesson.title),
      );
      await expect(dialog.locator('h2')).toHaveText(pack.title);
      await expect(dialog.locator('.reference-pack > h3')).toHaveCount(0);
      await expect(dialog.locator('.reference-lesson > h4')).toHaveCount(0);
      await expect(dialog.locator('.lesson-summary')).toHaveText(
        pack.lessons.map((lesson) => lesson.summary),
      );
      for (const [lessonIndex, lesson] of pack.lessons.entries()) {
        await expectLessonExamples(dialog.locator('.reference-lesson').nth(lessonIndex), lesson);
      }
      expect(requests.slice(requestStart).sort()).toEqual(
        pack.lessonIds
          .map((lessonId) => '/content/' + id + '/lessons/' + lessonId + '.json')
          .sort(),
      );
      const ids = await page
        .locator('[id]')
        .evaluateAll((elements) => elements.map((element) => element.id));
      expect(new Set(ids).size).toBe(ids.length);
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(section.locator(':scope > details')).toHaveJSProperty('open', true);
      await expect(page).toHaveURL('/');
    }
    await section.locator('summary h3').click();
  }
  expect(requests.filter((path) => path.includes('/tests/'))).toEqual([]);
  expect(await learnerState(page)).toEqual(before);
});

test('supports pack keyboard activation, close, backdrop, and right-aligned retry', async ({
  page,
}) => {
  let fail = true;
  await page.route('**/content/possession-questions/lessons/*.json', async (route) => {
    if (fail) await route.abort();
    else await route.continue();
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expandTopicGroup(page, 'ownership-and-possession');
  const card = page.locator('.topic-card').filter({
    has: page.getByRole('heading', { name: 'Possession questions', level: 4, exact: true }),
  });
  const trigger = card.getByRole('button', { name: 'Grammar reference for Possession questions' });
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Possession questions', exact: true });
  const close = dialog.getByRole('button', {
    name: 'Close grammar reference for Possession questions',
  });
  await expect(dialog.getByRole('alert')).toContainText('could not load');
  await expect(close).toBeFocused();
  const actions = dialog.locator('.modal-sheet__actions');
  await expect(actions).toHaveCSS('justify-content', 'end');
  const offset = await actions.evaluate((element) => {
    const button = element.querySelector('button')!;
    return (
      element.clientWidth -
      (button.offsetLeft - (element as HTMLElement).offsetLeft) -
      button.offsetWidth
    );
  });
  expect(Math.abs(offset)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: test.info().outputPath('pack-reference-retry.png') });
  fail = false;
  await dialog.getByRole('button', { name: 'Try again' }).click();
  await expect(dialog.locator('.reference-lesson')).toHaveCount(
    loadPack('possession-questions').lessons.length,
  );
  await expect(close).toBeFocused();
  await close.click();
  await expect(trigger).toBeFocused();
  await trigger.press('Space');
  await expect(dialog.locator('.reference-lesson').first()).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(card.locator('a', { hasText: 'Open topic' })).toBeVisible();
  await expect(page).toHaveURL('/');
});

for (const appearance of ['Day', 'Night']) {
  for (const scale of [1, 1.5, 2]) {
    test(
      'contains pack icons and readable references at ' + scale * 100 + '% in ' + appearance,
      async ({ page }, testInfo) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');
        await page.getByRole('radio', { name: appearance, exact: true }).check();
        await page.evaluate((value) => {
          document.documentElement.style.fontSize = value * 16 + 'px';
        }, scale);
        await expandTopicGroup(page, 'ownership-and-possession');
        const cards = page.locator('.topic-card');
        await expect(cards).toHaveCount(5);
        for (const card of await cards.all()) {
          const trigger = card.locator('.grammar-reference-trigger');
          await trigger.evaluate((element) => element.scrollIntoView({ block: 'center' }));
          const bounds = await card.evaluate((element) => {
            const heading = element.querySelector('.topic-card-header > h4')!;
            const range = document.createRange();
            range.selectNodeContents(heading);
            const svg = element.querySelector<SVGSVGElement>('.grammar-reference-trigger svg')!;
            const icon = svg.getBoundingClientRect();
            const painted = [
              [0, 0],
              [24, 0],
              [24, 24],
              [0, 24],
            ].map(([x, y]) => {
              const point = new DOMPoint(x, y).matrixTransform(svg.getScreenCTM()!);
              return (
                document.elementFromPoint(point.x, point.y)?.closest('.topic-card') === element
              );
            });
            return {
              painted,
              overlap: [...range.getClientRects()].some(
                (rect) =>
                  rect.right > icon.left + 1 &&
                  rect.left < icon.right - 1 &&
                  rect.bottom > icon.top + 1 &&
                  rect.top < icon.bottom - 1,
              ),
              overflow: heading.parentElement!.scrollWidth > heading.parentElement!.clientWidth + 1,
            };
          });
          expect(bounds.painted).not.toContain(false);
          expect(bounds.overlap).toBe(false);
          expect(bounds.overflow).toBe(false);
        }
        const trigger = page.getByRole('button', {
          name: 'Grammar reference for Possessive pronouns and endings',
          exact: true,
        });
        await trigger.click();
        const dialog = page.getByRole('dialog', {
          name: 'Possessive pronouns and endings',
          exact: true,
        });
        await expect(dialog.locator('.reference-lesson')).toHaveCount(20);
        const paperColor = await page
          .locator('.pack-group')
          .first()
          .evaluate((element) => getComputedStyle(element).backgroundColor);
        await expect(dialog.locator('.reference-lesson').first()).toHaveCSS(
          'background-color',
          paperColor,
        );
        await expect(dialog.locator('.reference-lesson h3').first()).toBeInViewport();
        expect(
          await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
        ).toBe(true);
        await expect(dialog.locator('.reference-example')).toHaveCount(0);
        const scrollBefore = await page.evaluate(() => scrollY);
        await expectLessonExamples(
          dialog.locator('.reference-lesson').first(),
          loadPack('possessive-pronouns-endings').lessons[0],
        );
        await expect(dialog.locator('.reference-example').first()).toBeVisible();
        expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
        expect(
          await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
        ).toBe(true);
        await page.screenshot({ path: testInfo.outputPath('pack-grammar-reference.png') });
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

for (const motion of ['reduce', 'no-preference'] as const) {
  test(
    'shares disclosure controls, cancellation, modal scrolling and reset with ' + motion,
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: motion });
      await page.goto('/');
      await expect(page.locator('#app-boot')).toBeHidden();
      const sourceHeader = page.locator('.topic-group-toggle').first();
      // Wait for the rendered header to accept input after the startup overlay.
      await sourceHeader.click({ trial: true });
      await sourceHeader.focus();
      // Use the native tab order so Chromium applies keyboard focus styling.
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(sourceHeader).toBeFocused();
      await expect(sourceHeader).toHaveCSS('outline-style', 'solid');
      const sourceFocus = await sourceHeader.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          style: style.outlineStyle,
          offset: style.outlineOffset,
          color: style.outlineColor,
        };
      });
      expect(sourceFocus.style).toBe('solid');
      const sourceChevron = await sourceHeader.locator('svg').evaluate((element) => {
        const style = getComputedStyle(element);
        return { color: style.color, width: style.width, strokeWidth: style.strokeWidth };
      });
      const trigger = page.getByRole('button', {
        name: 'Grammar reference for Ownership and possession',
        exact: true,
      });
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: 'Ownership and possession', exact: true });
      const lessons = dialog.locator('.reference-lesson');
      await expect(lessons).toHaveCount(44);
      const first = lessons.first();
      const second = lessons.nth(1);
      const summary = first.locator('summary');
      const host = first.locator('app-grammar-reference-examples');
      await expect(
        first.getByRole('heading', {
          name: 'Singular possessors: minulla, sinulla, hänellä',
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        first.getByRole('heading', { name: 'Possessor forms with singular owners', exact: true }),
      ).toHaveCount(0);
      await expect(dialog.locator('.reference-example')).toHaveCount(0);
      await page.keyboard.press('Tab');
      await expect(summary).toBeFocused();
      await expect(summary).toHaveCSS('outline-style', sourceFocus.style);
      await expect(summary).toHaveCSS('outline-offset', sourceFocus.offset);
      await expect(summary).toHaveCSS('outline-color', sourceFocus.color);
      const chevron = summary.locator('svg');
      await expect(chevron).toHaveCSS('color', sourceChevron.color);
      await expect(chevron).toHaveCSS('width', sourceChevron.width);
      await expect(chevron).toHaveCSS('stroke-width', sourceChevron.strokeWidth);
      await expect(chevron).toHaveCSS('transform', 'none');
      const backgroundScroll = await page.evaluate(() => scrollY);
      const animation = await host.evaluateHandle((element) => {
        const observed = { started: false, count: 0 };
        const observer = new MutationObserver(() => {
          if (element.classList.contains('animating')) {
            observed.started = true;
            observed.count = element.getAnimations({ subtree: true }).length;
          }
        });
        observer.observe(element, { attributes: true, attributeFilter: ['class'] });
        return { observed, observer };
      });
      await summary.press('Enter');
      await expect(first.locator('details')).toHaveJSProperty('open', true);
      await expect(second.locator('details')).toHaveJSProperty('open', false);
      await expect(chevron).not.toHaveCSS('transform', 'none');
      await expect(host).not.toHaveClass(/animating/);
      const observed = await animation.evaluate(({ observed }) => observed);
      expect(observed.started).toBe(motion === 'no-preference');
      if (motion === 'reduce') expect(observed.count).toBe(0);
      else expect(observed.count).toBeGreaterThan(0);
      await animation.evaluate(({ observer }) => observer.disconnect());
      await animation.dispose();
      await expect(summary).toBeFocused();
      await summary.press('Space');
      await expect(first.locator('details')).toHaveJSProperty('open', false);
      await expect(first.locator('.reference-example').first()).toBeHidden();
      await summary.press('Space');
      await summary.press('Space');
      await summary.press('Space');
      await expect(first.locator('details')).toHaveJSProperty('open', true);
      await expect(host).not.toHaveClass(/animating/);
      await expect(second.locator('details')).toHaveJSProperty('open', false);
      expect(await page.evaluate(() => scrollY)).toBe(backgroundScroll);
      await dialog.locator('.reference-lesson').last().locator('summary').click();
      await expect(
        dialog.locator('.reference-lesson').last().locator('.reference-example').last(),
      ).toBeVisible();
      expect(await page.evaluate(() => scrollY)).toBe(backgroundScroll);
      await summary.press('Space');
      await summary.press('Space');
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await trigger.click();
      await expect(dialog.locator('.reference-lesson')).toHaveCount(44);
      await expect(dialog.locator('.topic-group-disclosure[open]')).toHaveCount(0);
      await expect(dialog.locator('.reference-example')).toHaveCount(0);
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    },
  );
}

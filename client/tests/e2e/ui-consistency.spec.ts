import { expect, type Locator, type Page, test } from '@playwright/test';

const TOPIC = 'vowel-harmony-kpt-tplural';
const TOPIC_PAGE = `/topics/${TOPIC}`;
const LESSON = `/learn/${TOPIC}/vowel-families`;
const REVIEW_LESSON = `/learn/${TOPIC}/foundations-review`;
const STUDY = `/study/${TOPIC}/vowel-families`;

async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator('main h1').first()).toBeVisible();
}

async function expectNoInternalOverflow(surface: Locator) {
  await expect(surface).toBeVisible();
  const overflow = await surface.evaluate((element) =>
    [element, ...element.querySelectorAll<HTMLElement>('h1,h2,h3,h4,p,li,dt,dd,label,button,a')]
      .filter((item) => item.clientWidth > 0 && !item.closest('[aria-hidden="true"]'))
      .filter((item) => item.scrollWidth > item.clientWidth + 2)
      .map((item) => ({ text: item.textContent?.trim().slice(0, 60), class: item.className })),
  );
  expect(overflow).toEqual([]);
}

async function expectEssentialTextMinimum(page: Page) {
  const undersized = await page.locator('body').evaluate((body) =>
    [...body.querySelectorAll<HTMLElement>('*')]
      .filter(
        (element) =>
          element instanceof HTMLElement &&
          element.getClientRects().length > 0 &&
          !element.closest('[aria-hidden="true"]') &&
          [...element.childNodes].some(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
          ),
      )
      .filter((element) => parseFloat(getComputedStyle(element).fontSize) < 12)
      .map((element) => ({
        text: element.textContent?.trim().slice(0, 60),
        class: element.className,
      })),
  );
  expect(undersized).toEqual([]);
}

async function choiceGeometry(choice: Locator) {
  return choice.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      padding: style.padding,
      gap: style.columnGap,
      font: style.fontSize,
      color: style.color,
      background: style.backgroundColor,
      border: style.borderColor,
    };
  });
}

async function focusPixels(page: Page, surface: Locator) {
  const screenshot = (await surface.screenshot()).toString('base64');
  const color = await surface.evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--focus-ring'),
  );
  return page.evaluate(
    async ({ base64, color }) => {
      const picture = new Image();
      picture.src = `data:image/png;base64,${base64}`;
      await picture.decode();
      const canvas = document.createElement('canvas');
      canvas.width = picture.width;
      canvas.height = picture.height;
      const context = canvas.getContext('2d')!;
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const target = context.getImageData(0, 0, 1, 1).data;
      context.drawImage(picture, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let matching = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (
          [0, 1, 2].every((channel) => Math.abs(pixels[index + channel] - target[channel]) < 12)
        ) {
          matching++;
        }
      }
      return matching;
    },
    { base64: screenshot, color },
  );
}

async function expectVisibleInsetFocus(page: Page, surface: Locator, target = surface) {
  await page.mouse.move(0, 0);
  await target.evaluate((element) => (element as HTMLElement).blur());
  const before = await focusPixels(page, surface);
  await page.keyboard.press('Tab');
  await target.focus();
  await expect(target).toBeFocused();
  expect(await target.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  // The screenshot contains only the control: outward outlines clipped by paper do not pass.
  expect(await focusPixels(page, surface)).toBeGreaterThan(before + 80);
}

for (const theme of ['Day', 'Night']) {
  test.describe(`${theme} UI consistency`, () => {
    test.beforeEach(async ({ page }) => {
      await open(page, '/');
      const appearance = page.getByRole('radio', { name: theme, exact: true });
      // Activate the visible native label, not the clipped one-pixel input box.
      await page.locator('.appearance-options label').filter({ has: appearance }).click();
      await expect(appearance).toBeChecked();
    });

    test('keeps semantic state surfaces distinct with readable role-specific ink', async ({
      page,
    }) => {
      const palette = await page.evaluate(() => {
        const probe = document.createElement('span');
        document.body.append(probe);
        const resolve = (token: string) => {
          probe.style.color = `var(${token})`;
          return getComputedStyle(probe).color;
        };
        const channels = (color: string) => {
          const values = color
            .match(/[\d.]+/g)!
            .slice(0, 3)
            .map(Number);
          return color.startsWith('color(srgb') ? values.map((value) => value * 255) : values;
        };
        const luminance = (color: string) =>
          channels(color)
            .map((value) => {
              const channel = value / 255;
              return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
            })
            .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
        const contrast = (foreground: string, background: string) => {
          const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
          return (values[0] + 0.05) / (values[1] + 0.05);
        };
        const roles = [
          ['--text-brand', '--surface-brand-subtle'],
          ['--text-success', '--surface-success'],
          ['--text-warning', '--surface-warning'],
          ['--text-danger', '--surface-danger'],
          ['--text-on-ink', '--surface-header'],
        ].map(([ink, surface]) => ({ ink: resolve(ink), surface: resolve(surface) }));
        const stationerySurface = resolve('--surface-stationery');
        const warningSurface = resolve('--surface-warning');
        probe.remove();
        return {
          contrasts: roles.map(({ ink, surface }) => contrast(ink, surface)),
          stateSurfaces: roles.slice(0, 4).map(({ surface }) => surface),
          stationerySurface,
          warningSurface,
        };
      });

      expect(new Set(palette.stateSurfaces).size).toBe(4);
      expect(palette.warningSurface).not.toBe(palette.stationerySurface);
      expect(Math.min(...palette.contrasts)).toBeGreaterThanOrEqual(4.5);
    });

    test('keeps shared component colours under one semantic owner', async ({ page }) => {
      const neutralCardColours = await Promise.all(
        ['.continue-card', '.topic-card'].map((selector) =>
          page
            .locator(selector)
            .first()
            .evaluate((element) => getComputedStyle(element).backgroundColor),
        ),
      );

      const mistakeNoteColours: string[] = [];
      for (const route of [LESSON, REVIEW_LESSON]) {
        await open(page, route);
        mistakeNoteColours.push(
          await page
            .locator('.mistake-notes')
            .evaluate((element) => getComputedStyle(element).backgroundColor),
        );
      }

      for (const route of [TOPIC_PAGE, LESSON, STUDY, '/reports', '/data']) {
        await open(page, route);
      }

      const owners = await page.evaluate(() => {
        const rules: CSSStyleRule[] = [];
        const collect = (ruleList: CSSRuleList) => {
          for (const rule of ruleList) {
            if (rule instanceof CSSStyleRule) rules.push(rule);
            else if ('cssRules' in rule) collect((rule as CSSGroupingRule).cssRules);
          }
        };
        for (const sheet of document.styleSheets) collect(sheet.cssRules);

        const selectorsWith = (selectorPart: string, properties: string[]) =>
          rules
            .filter(
              (rule) =>
                rule.selectorText.includes(selectorPart) &&
                properties.some((property) => rule.style.getPropertyValue(property)),
            )
            .map((rule) => rule.selectorText);
        const sharedFeatureSelectors = [
          '.button',
          '.feedback',
          '.back-link',
          '.notebook-progress',
          '.spinner',
          '.word-token',
          '.notebook-input',
          '.notebook-select',
          '.subject-tab',
          '.choice-list',
          '.practice-choices',
        ];

        return {
          progress: selectorsWith('notebook-progress::', ['background']),
          reviewDirectColour: selectorsWith('review-action', [
            'background',
            'background-color',
            'border-color',
            'color',
          ]),
          featureBackLinkText: selectorsWith('back-link', ['color']).filter((selector) =>
            selector.includes('[_ngcontent'),
          ),
          spinnerBody: selectorsWith('.spinner', ['background']).filter(
            (selector) => !selector.includes('::'),
          ),
          featureSharedColour: rules
            .filter(
              (rule) =>
                rule.selectorText.includes('[_ngcontent') &&
                sharedFeatureSelectors.some((selector) => rule.selectorText.includes(selector)) &&
                [
                  '--action-paper',
                  '--action-ink',
                  '--action-edge',
                  'background',
                  'background-color',
                  'border-color',
                  'color',
                ].some((property) => rule.style.getPropertyValue(property)),
            )
            .map((rule) => rule.selectorText),
        };
      });

      expect(owners.progress).toEqual(['.notebook-progress::-webkit-progress-value']);
      expect(owners.reviewDirectColour).toEqual([]);
      expect(owners.featureBackLinkText).toEqual([]);
      expect(owners.spinnerBody).toEqual(['.spinner']);
      expect(owners.featureSharedColour).toEqual([]);
      expect(new Set(neutralCardColours).size).toBe(1);
      expect(new Set(mistakeNoteColours).size).toBe(1);
    });

    test('keeps repeated semantic colour roles consistent on every feature page', async ({
      page,
    }) => {
      const samples = {
        stationery: [] as { route: string; element: string; value: string }[],
        primaryAction: [] as string[],
        secondaryAction: [] as string[],
        reviewAction: [] as string[],
        dangerAction: [] as string[],
        backLink: [] as string[],
        sectionLabel: [] as { route: string; element: string; value: string }[],
      };
      const collect = async (selector: string, kind: 'action' | 'background' | 'text') =>
        page.locator(selector).evaluateAll(
          (elements, signatureKind) =>
            elements
              .filter((element) => element.getClientRects().length > 0)
              .map((element) => {
                const style = getComputedStyle(element);
                if (signatureKind === 'background') return style.backgroundColor;
                if (signatureKind === 'text') return style.color;
                return [
                  style.color,
                  style.backgroundColor,
                  style.borderTopColor,
                  style.borderRightColor,
                  style.borderBottomColor,
                  style.borderLeftColor,
                ].join('|');
              }),
          kind,
        );
      const routes: [string, string][] = [
        ['/', '.continue-card, .topic-card'],
        [TOPIC_PAGE, '.topic-overview, .objective-panel, .test-card:not(.review-test)'],
        [
          LESSON,
          '.reader-heading, .teaching-section, .worked-examples, .lesson-vocabulary, .mistake-notes, .lesson-practice, .key-points li',
        ],
        [
          REVIEW_LESSON,
          '.reader-heading, .teaching-section, .worked-examples, .lesson-vocabulary, .mistake-notes, .lesson-practice, .key-points li',
        ],
        [STUDY, '.exercise-card'],
        ['/reports', '.report-overview, .report-topic-sheet, .ledger-sheet'],
        [
          '/data',
          '.data-overview, .backup-archive, .topic-file-label, .clear-ledger, .archive-number:not(.danger-number)',
        ],
      ];

      for (const [route, stationerySelector] of routes) {
        await open(page, route);
        samples.stationery.push(
          ...(await page.locator(stationerySelector).evaluateAll(
            (elements, currentRoute) =>
              elements
                .filter((element) => element.getClientRects().length > 0)
                .map((element) => ({
                  route: currentRoute,
                  element: `${element.tagName.toLowerCase()}.${element.className}`,
                  value: getComputedStyle(element).backgroundColor,
                })),
            route,
          )),
        );
        samples.primaryAction.push(...(await collect('.button.primary:not(:disabled)', 'action')));
        samples.secondaryAction.push(
          ...(await collect('.button.secondary:not(:disabled)', 'action')),
        );
        samples.reviewAction.push(
          ...(await collect('.button.review-action:not(:disabled)', 'action')),
        );
        samples.dangerAction.push(...(await collect('.button.danger:not(:disabled)', 'action')));
        samples.backLink.push(...(await collect('.back-link', 'text')));
        samples.sectionLabel.push(
          ...(await page.locator('.eyebrow, .card-kicker').evaluateAll(
            (elements, currentRoute) =>
              elements
                .filter((element) => element.getClientRects().length > 0)
                .map((element) => ({
                  route: currentRoute,
                  element: `${element.tagName.toLowerCase()}.${element.className}`,
                  value: getComputedStyle(element).color,
                })),
            route,
          )),
        );
      }

      const stationeryToken = await page.evaluate(() => {
        const probe = document.createElement('span');
        probe.style.backgroundColor = 'var(--surface-stationery)';
        document.body.append(probe);
        const value = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return value;
      });
      const sectionLabelToken = await page.evaluate(() => {
        const probe = document.createElement('span');
        probe.style.color = 'var(--text-brand)';
        document.body.append(probe);
        const value = getComputedStyle(probe).color;
        probe.remove();
        return value;
      });
      if (samples.reviewAction.length === 0) {
        samples.reviewAction.push(
          await page.evaluate(() => {
            const probe = document.createElement('button');
            probe.className = 'button review-action';
            document.body.append(probe);
            const style = getComputedStyle(probe);
            const value = [
              style.color,
              style.backgroundColor,
              style.borderTopColor,
              style.borderRightColor,
              style.borderBottomColor,
              style.borderLeftColor,
            ].join('|');
            probe.remove();
            return value;
          }),
        );
      }
      expect(samples.stationery.length).toBeGreaterThan(20);
      expect(samples.stationery.filter(({ value }) => value !== stationeryToken)).toEqual([]);
      expect(samples.sectionLabel.length).toBeGreaterThan(20);
      expect(samples.sectionLabel.filter(({ value }) => value !== sectionLabelToken)).toEqual([]);
      for (const [name, role] of Object.entries(samples).filter(
        ([name]) => !['stationery', 'sectionLabel'].includes(name),
      )) {
        expect(role, `${name} should be rendered`).not.toEqual([]);
        expect(new Set(role).size, `${name} should have one computed colour recipe`).toBe(1);
      }
    });

    test('shares instructional typography and responsive answer slips', async ({ page }) => {
      await expectEssentialTextMinimum(page);
      await open(page, LESSON);
      const prose = await page
        .locator('.teaching-section p')
        .first()
        .evaluate((element) => {
          const style = getComputedStyle(element);
          return { size: style.fontSize, line: style.lineHeight };
        });
      const explanation = await page
        .locator('.example-grid li')
        .first()
        .evaluate((element) => {
          const style = getComputedStyle(element);
          return { size: style.fontSize, line: style.lineHeight };
        });
      expect(prose).toEqual({ size: '16px', line: '26.4px' });
      expect(explanation).toEqual(prose);
      if ((page.viewportSize()?.width ?? 0) >= 1400) {
        expect(
          await page
            .locator('.teaching-section p')
            .first()
            .evaluate((e) => e.clientWidth),
        ).toBeGreaterThan(800);
      }
      await expectEssentialTextMinimum(page);
      await page.getByRole('button', { name: 'Start optional practice', exact: true }).click();
      const practiceChoice = page.locator('.practice-choices label').first();
      const practice = await choiceGeometry(practiceChoice);
      await practiceChoice.click();
      const selectedPractice = await choiceGeometry(practiceChoice);
      await open(page, STUDY);
      const scoredChoice = page.locator('.choice-list label').first();
      const scored = await choiceGeometry(scoredChoice);
      expect(scored).toEqual(practice);
      expect(scored.padding).toBe((page.viewportSize()?.width ?? 0) <= 560 ? '12px' : '16px');
      expect(scored.gap).toBe('8px');
      await scoredChoice.click();
      expect(await choiceGeometry(scoredChoice)).toEqual(selectedPractice);
      await expect(page.getByRole('radio', { name: 'back vowels', exact: true })).toBeChecked();
      await expectEssentialTextMinimum(page);
    });

    test('keeps danger semantic across sizes and correction actions in the shared family', async ({
      page,
    }) => {
      await open(page, '/data');
      const standard = page.getByRole('button', { name: 'Clear all history', exact: true });
      const compact = page.locator('.clear-action').first();
      const danger = await standard.evaluate((element) => getComputedStyle(element).color);
      expect(await compact.evaluate((element) => getComputedStyle(element).color)).toBe(danger);
      await compact.hover();
      expect(await compact.evaluate((element) => getComputedStyle(element).color)).toBe(danger);
      await expectEssentialTextMinimum(page);

      await open(page, `/study/${TOPIC}/harmony-in-forms`);
      const input = page.getByRole('textbox', { name: 'Your answer', exact: true });
      await input.fill('talo');
      const construction = (element: Element) => {
        const style = getComputedStyle(element);
        return { clip: style.clipPath, font: style.fontSize, line: style.lineHeight };
      };
      expect(await page.locator('.answer-tool').evaluate(construction)).toEqual(
        await page.locator('.reveal-button').evaluate(construction),
      );
      await page.getByRole('button', { name: 'Erase answer', exact: true }).click();
      await expect(input).toHaveValue('');
      await expect(page.locator('.answer-tool')).toBeDisabled();
    });

    test('keeps answer feedback and sentence explanations inside their paper', async ({ page }) => {
      await open(page, STUDY);
      await page.getByRole('radio', { name: 'front vowels', exact: true }).check();
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      await expectNoInternalOverflow(page.locator('.feedback'));
      await page.locator('.continue-button').click();
      await page.getByRole('button', { name: 'Show answer', exact: true }).click();
      await expectNoInternalOverflow(page.locator('.feedback'));
      await open(page, `/study/${TOPIC}/plural-in-sentences`);
      await page.getByRole('button', { name: 'Show answer', exact: true }).click();
      await expectNoInternalOverflow(page.locator('.sentence-lesson'));
    });

    test('keeps the word-order instruction readable on its answer paper', async ({ page }) => {
      await open(page, `/study/${TOPIC}/plural-in-sentences`);
      await page.getByRole('button', { name: 'Show answer', exact: true }).click();
      await page.locator('.continue-button').click();
      const instruction = page.locator('.placeholder');
      await expect(instruction).toBeVisible();
      const contrast = await instruction.evaluate((element) => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const context = canvas.getContext('2d')!;
        const luminance = (color: string) => {
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          const channels = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map((value) => {
            const channel = value / 255;
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          });
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        };
        const values = [
          luminance(getComputedStyle(element).color),
          luminance(getComputedStyle(element.parentElement!).backgroundColor),
        ].sort((a, b) => b - a);
        return (values[0] + 0.05) / (values[1] + 0.05);
      });
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    test('contrasts folder labels against their painted active shade', async ({ page }) => {
      await page.mouse.move(0, 0);
      for (const tab of await page.locator('.workbook-folder-tab').all()) {
        const color = await tab.evaluate((element) => getComputedStyle(element).color);
        const screenshot = (await tab.screenshot()).toString('base64');
        const contrast = await page.evaluate(
          async ({ color, screenshot }) => {
            const picture = new Image();
            picture.src = `data:image/png;base64,${screenshot}`;
            await picture.decode();
            const canvas = document.createElement('canvas');
            canvas.width = picture.width;
            canvas.height = picture.height;
            const context = canvas.getContext('2d')!;
            context.fillStyle = color;
            context.fillRect(0, 0, 1, 1);
            const ink = context.getImageData(0, 0, 1, 1).data;
            context.drawImage(picture, 0, 0);
            // Sample clear paper above the vertical label, including the active gradient.
            const paper = context.getImageData(Math.floor(canvas.width * 0.4), 10, 1, 1).data;
            const luminance = (rgb: Uint8ClampedArray) =>
              [...rgb]
                .slice(0, 3)
                .map((value) => {
                  const channel = value / 255;
                  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
                })
                .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
            const values = [luminance(ink), luminance(paper)].sort((a, b) => b - a);
            return (values[0] + 0.05) / (values[1] + 0.05);
          },
          { color, screenshot },
        );
        expect(contrast).toBeGreaterThanOrEqual(4.5);
      }
    });

    test('draws visible focus pixels inside clipped controls', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page, `/learn/${TOPIC}/foundations-review`);
      await expectVisibleInsetFocus(page, page.locator('.back-link'));
      const lessonControl =
        (page.viewportSize()?.width ?? 0) <= 800
          ? page.locator('.lesson-picker select')
          : page.locator('.lesson-list button').first();
      await expectVisibleInsetFocus(page, lessonControl);
      await open(page, '/data');
      await expectVisibleInsetFocus(
        page,
        page.locator('.file-button'),
        page.locator('.file-button input'),
      );
      await expectVisibleInsetFocus(
        page,
        page.getByRole('link', { name: 'Data & backup', exact: true }),
      );
    });

    test('keeps paper and selected controls stationary under reduced motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const selector of ['.continue-card', '.topic-card', '.workbook-folder-tab.active']) {
        const element = page.locator(selector).first();
        await page.mouse.move(0, 0);
        const before = await element.evaluate((e) => getComputedStyle(e).transform);
        await element.hover();
        expect(await element.evaluate((e) => getComputedStyle(e).transform)).toBe(before);
      }
      await open(page, STUDY);
      const answer = page.locator('.choice-list label').first();
      await page.getByRole('radio', { name: 'back vowels', exact: true }).check();
      await answer.hover();
      expect(await answer.evaluate((e) => getComputedStyle(e).transform)).toBe('none');
    });

    test('keeps nested mobile content readable with text-spacing overrides', async ({
      page,
    }, testInfo) => {
      test.skip(!testInfo.project.name.endsWith('-mobile'));
      for (const [path, selector] of [
        ['/', '.catalog-stats'],
        ['/', '.continue-card'],
        ['/', '.topic-card header'],
        [LESSON, '.reader-heading'],
        [LESSON, '.lesson-vocabulary'],
        [LESSON, '.worked-examples'],
        ['/reports', '.report-topic-heading'],
      ]) {
        await open(page, path);
        await expectNoInternalOverflow(page.locator(selector).first());
        await page.addStyleTag({
          content:
            '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }',
        });
        await expectNoInternalOverflow(page.locator(selector).first());
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          320,
        );
      }
    });

    test('fits the completed score and required result text on narrow paper', async ({
      page,
    }, testInfo) => {
      test.skip(!testInfo.project.name.endsWith('-mobile'));
      test.setTimeout(90_000);
      await open(page, STUDY);
      const count = Number(await page.locator('.runner-progress').getAttribute('max'));
      for (let index = 0; index < count; index++) {
        await page.getByRole('button', { name: 'Show answer', exact: true }).click();
        await page.locator('.continue-button').click();
        await expect(page.locator('.feedback')).toHaveCount(0);
      }
      await expectNoInternalOverflow(page.locator('.result-card'));
      const card = await page.locator('.result-card').boundingBox();
      const ring = await page.locator('.result-ring').boundingBox();
      expect(ring!.x).toBeGreaterThanOrEqual(card!.x);
      expect(ring!.x + ring!.width).toBeLessThanOrEqual(card!.x + card!.width);
      await expect(page.getByRole('link', { name: 'Return to topic', exact: true })).toBeVisible();
    });
  });
}

test('presents empty review work as information instead of an error', async ({ page }) => {
  for (const [path, title] of [
    [`/mistakes/${TOPIC}`, 'No mistakes to practise'],
    [`/review/${TOPIC}`, 'No review is due yet'],
  ]) {
    await open(page, path);
    await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expectNoInternalOverflow(page.locator('.empty-card'));
    await page.getByRole('link', { name: 'Back to topics', exact: true }).click();
    await expect(page).toHaveURL('/');
  }
});

test('preserves native selection and visible keyboard focus in forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await open(page, STUDY);
  const radio = page.getByRole('radio', { name: 'back vowels', exact: true });
  await radio.check();
  await expect(radio).toBeChecked();
  expect(await radio.evaluate((e) => getComputedStyle(e).appearance)).toBe('auto');
  await expectVisibleInsetFocus(page, page.locator('.choice-list label').first(), radio);
});

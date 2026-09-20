import { expect, type Locator, type Page, test } from '@playwright/test';

const TOPIC_SEGMENT = 'vowel-harmony-location-endings';
const KPT_TOPIC_SEGMENT = 'kpt-singular-forms';
const PLURAL_TOPIC_SEGMENT = 't-plural-agreement';

function vowelHarmonyTopicLink(page: Page) {
  return page.locator(`.topic-card a[href="/topics/${TOPIC_SEGMENT}"]`);
}

function vowelHarmonyProgress(page: Page) {
  return page.locator('main.topic-stats-page');
}

async function expectClippedPaper(locator: Locator) {
  await expect(locator).toBeVisible();
  expect(await locator.evaluate((element) => getComputedStyle(element).clipPath)).not.toBe('none');
}

async function expectLabelSizedAction(locator: Locator) {
  await expect(locator).toBeVisible();
  const sizes = await locator.evaluate((element) => {
    const action = element as HTMLElement;
    return {
      actualWidth: action.offsetWidth,
      height: action.offsetHeight,
      viewportWidth: window.innerWidth,
    };
  });
  expect(sizes.actualWidth).toBeLessThan(Math.min(300, sizes.viewportWidth * 0.8));
  expect(sizes.height).toBeGreaterThanOrEqual(40);
}

async function expectNoInternalHorizontalOverflow(locator: Locator) {
  await expect(locator).toBeVisible();
  const widths = await locator.evaluate((element) => ({
    client: element.clientWidth,
    scroll: element.scrollWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
}

async function expectHorizontallyInside(surface: Locator, content: Locator) {
  const [surfaceBox, contentBox] = await Promise.all([
    surface.boundingBox(),
    content.boundingBox(),
  ]);
  expect(surfaceBox).not.toBeNull();
  expect(contentBox).not.toBeNull();
  expect(contentBox?.x ?? Number.NEGATIVE_INFINITY).toBeGreaterThanOrEqual(
    (surfaceBox?.x ?? 0) - 2,
  );
  expect((contentBox?.x ?? 0) + (contentBox?.width ?? 0)).toBeLessThanOrEqual(
    (surfaceBox?.x ?? 0) + (surfaceBox?.width ?? 0) + 2,
  );
}

async function modalSurface(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderRadius: style.borderRadius,
      borderTopColor: style.borderTopColor,
      borderTopStyle: style.borderTopStyle,
      boxShadow: style.boxShadow,
    };
  });
}

async function vocabularyCardMaterial(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const term = getComputedStyle(element.querySelector('dt')!);
    const definition = getComputedStyle(element.querySelector('dd')!);
    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderRadius: style.borderRadius,
      borderTopColor: style.borderTopColor,
      boxShadow: style.boxShadow,
      clipPath: style.clipPath,
      definitionColor: definition.color,
      definitionFontSize: definition.fontSize,
      padding: style.padding,
      termWeight: term.fontWeight,
    };
  });
}

async function expectModalCloseControl(dialog: Locator) {
  const geometry = await dialog.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const closeElement = element.querySelector<HTMLElement>('.modal-sheet__close')!;
    const close = closeElement.getBoundingClientRect();
    const closeStyle = getComputedStyle(closeElement);
    const mark = closeElement.querySelector<HTMLElement>('span')!;
    const before = getComputedStyle(mark, '::before');
    const after = getComputedStyle(mark, '::after');
    return {
      bounds: bounds.toJSON(),
      close: close.toJSON(),
      closeHeight: closeStyle.height,
      closeWidth: closeStyle.width,
      clips: element.querySelectorAll('.modal-sheet__clip').length,
      mark: {
        afterLeft: after.left,
        afterTop: after.top,
        beforeLeft: before.left,
        beforeTop: before.top,
      },
    };
  });
  expect(geometry.clips).toBe(0);
  expect(geometry.close.x).toBeGreaterThanOrEqual(geometry.bounds.x - 1);
  expect(geometry.close.y).toBeGreaterThanOrEqual(geometry.bounds.y - 1);
  expect(geometry.close.right).toBeLessThanOrEqual(geometry.bounds.right + 1);
  expect(geometry.close.bottom).toBeLessThanOrEqual(geometry.bounds.bottom + 1);
  expect(geometry.closeWidth).toBe('40px');
  expect(geometry.closeHeight).toBe('40px');
  expect(geometry.mark.beforeLeft).toBe(geometry.mark.afterLeft);
  expect(geometry.mark.beforeTop).toBe(geometry.mark.afterTop);
}

async function expectActionGroupPlacement(group: Locator, placement: 'center' | 'end') {
  await expect(group).toBeVisible();
  const geometry = await group.evaluate((element) => {
    const groupRect = element.getBoundingClientRect();
    const actionRects = [...element.querySelectorAll<HTMLElement>('.button')]
      .filter((action) => action.getClientRects().length > 0)
      .map((action) => action.getBoundingClientRect());
    return {
      groupLeft: groupRect.left,
      groupRight: groupRect.right,
      actionsLeft: Math.min(...actionRects.map((rect) => rect.left)),
      actionsRight: Math.max(...actionRects.map((rect) => rect.right)),
    };
  });
  if (placement === 'center') {
    expect(
      Math.abs(
        (geometry.actionsLeft + geometry.actionsRight) / 2 -
          (geometry.groupLeft + geometry.groupRight) / 2,
      ),
    ).toBeLessThan(8);
  } else {
    expect(Math.abs(geometry.actionsRight - geometry.groupRight)).toBeLessThan(8);
  }
}

test('wraps the unchanged paper in a compact clipped folder', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'chromium-mobile');
  await page.goto('/');

  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
    'href',
    'favicon.svg',
  );
  await expect(page.locator('link[rel="icon"]:not([type])')).toHaveAttribute('href', 'favicon.ico');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    'apple-touch-icon.png',
  );
  for (const asset of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png']) {
    const response = await page.request.get(new URL(asset, page.url()).toString());
    expect(response.ok(), `${asset} is served`).toBe(true);
  }

  const cover = page.locator('.workbook-cover');
  const paper = page.locator('.page-shell');
  const navigation = page.locator('.workbook-folder-tabs');
  const tabs = page.locator('.workbook-folder-tab');
  const clip = page.locator('.workbook-page-clip');

  await expect(cover).toBeVisible();
  await expect(paper).toBeVisible();
  await expect(page.locator('.site-header nav')).toHaveCount(0);
  await expect(navigation).toBeVisible();
  await expect(tabs).toHaveCount(2);
  await expect(tabs).toHaveText(['Notebook', 'Stats']);
  await expect(clip).toBeVisible();

  const [brandBox, appearanceBox] = await Promise.all([
    page.locator('.brand').boundingBox(),
    page.locator('.appearance-control').boundingBox(),
  ]);
  expect(brandBox).not.toBeNull();
  expect(appearanceBox).not.toBeNull();
  expect(appearanceBox?.x ?? 0).toBeGreaterThan((brandBox?.x ?? 0) + (brandBox?.width ?? 0));
  expect(
    Math.abs(
      (brandBox?.y ?? 0) +
        (brandBox?.height ?? 0) / 2 -
        ((appearanceBox?.y ?? 0) + (appearanceBox?.height ?? 0) / 2),
    ),
  ).toBeLessThan(2);

  const brand = page.locator('.brand');
  const brandMark = brand.locator('.brand-mark');
  const brandMarkRestingTransform = await brandMark.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await brand.hover();
  await expect
    .poll(() => brandMark.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(brandMarkRestingTransform);
  await page.mouse.move(0, 300);
  await expect
    .poll(() => brandMark.evaluate((element) => getComputedStyle(element).transform))
    .toBe(brandMarkRestingTransform);
  await brand.focus();
  await expect
    .poll(() => brandMark.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(brandMarkRestingTransform);

  const [coverBox, paperBox, clipBox, tabBoxes, tabColors] = await Promise.all([
    cover.boundingBox(),
    paper.boundingBox(),
    clip.boundingBox(),
    tabs.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().toJSON()),
    ),
    tabs.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).backgroundColor),
    ),
  ]);

  expect(coverBox).not.toBeNull();
  expect(paperBox).not.toBeNull();
  expect(clipBox).not.toBeNull();
  expect(coverBox?.x ?? 0).toBeLessThanOrEqual(paperBox?.x ?? 0);
  expect((coverBox?.x ?? 0) + (coverBox?.width ?? 0)).toBeGreaterThanOrEqual(
    (paperBox?.x ?? 0) + (paperBox?.width ?? 0),
  );
  expect(coverBox?.y ?? 0).toBeLessThanOrEqual(paperBox?.y ?? 0);
  expect((coverBox?.y ?? 0) + (coverBox?.height ?? 0)).toBeGreaterThanOrEqual(
    (paperBox?.y ?? 0) + (paperBox?.height ?? 0),
  );
  const viewportWidth = page.viewportSize()?.width ?? 0;
  const folderLeftInset = (paperBox?.x ?? 0) - (coverBox?.x ?? 0);
  const folderRightInset =
    (coverBox?.x ?? 0) + (coverBox?.width ?? 0) - ((paperBox?.x ?? 0) + (paperBox?.width ?? 0));
  expect(folderLeftInset).toBeGreaterThanOrEqual(38);
  expect(folderLeftInset).toBeLessThanOrEqual(40);
  expect(folderRightInset).toBeGreaterThanOrEqual(38);
  expect(folderRightInset).toBeLessThanOrEqual(40);
  expect(Math.abs(folderLeftInset - folderRightInset)).toBeLessThan(2);
  const folderTopInset = (paperBox?.y ?? 0) - (coverBox?.y ?? 0);
  expect(folderTopInset).toBeGreaterThanOrEqual(24);
  expect(folderTopInset).toBeLessThanOrEqual(30);
  expect(tabBoxes.every((tab) => tab.x < (paperBox?.x ?? 0))).toBe(true);
  expect(tabBoxes.every((tab) => tab.x + tab.width > (paperBox?.x ?? 0))).toBe(true);
  expect(tabBoxes.every((tab) => tab.height >= 90)).toBe(true);
  expect(tabBoxes[0]?.y ?? 0).toBeGreaterThanOrEqual((paperBox?.y ?? 0) + 12);
  expect(tabBoxes.map((tab) => tab.y)).toEqual(
    [...tabBoxes.map((tab) => tab.y)].sort((a, b) => a - b),
  );
  expect(tabColors).toEqual(['rgb(90, 155, 213)', 'rgb(224, 185, 41)']);
  expect(clipBox?.x ?? 0).toBeGreaterThan((paperBox?.x ?? 0) + (paperBox?.width ?? 0) - 40);
  expect(clipBox?.width ?? 0).toBeGreaterThanOrEqual(viewportWidth <= 560 ? 22 : 34);
  const clipGripInsets = await clip.evaluate((element) => {
    const gripStyle = getComputedStyle(element, '::before');
    return {
      top: gripStyle.top,
      bottom: gripStyle.bottom,
    };
  });
  expect(clipGripInsets.top).toBe(clipGripInsets.bottom);
  const notebookNoteBox = await page.locator('.hero .notebook-note').boundingBox();
  expect(notebookNoteBox).not.toBeNull();
  expect((notebookNoteBox?.x ?? 0) + (notebookNoteBox?.width ?? 0)).toBeLessThanOrEqual(
    (clipBox?.x ?? 0) - 2,
  );
  expect(
    await paper.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element, '::after').right),
    ),
  ).toBeGreaterThan(clipBox?.width ?? 0);
  expect(await paper.evaluate((element) => getComputedStyle(element, '::before').content)).toBe(
    'none',
  );
  expect(
    await tabs.first().evaluate((element) => getComputedStyle(element).backgroundImage),
  ).toContain('linear-gradient');

  const tabBeforeHover = await tabs.nth(1).boundingBox();
  await tabs.nth(1).hover();
  await expect
    .poll(async () => (await tabs.nth(1).boundingBox())?.x ?? 0)
    .toBeGreaterThan(tabBeforeHover?.x ?? 0);

  await page.mouse.move(300, 300);
  const stickyTop = await navigation.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).top),
  );
  const paperTop = await paper.evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  );
  await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), paperTop + 400);
  await expect
    .poll(async () => (await navigation.boundingBox())?.y ?? Number.POSITIVE_INFINITY)
    .toBeCloseTo(stickyTop, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

test('keeps the page clip aligned with short paper at tall tablet sizes', async ({ page }) => {
  await page.setViewportSize({ width: 1032, height: 1376 });
  await page.goto('/study/olla-questions-short-answers/ppo-singular-positive-questions-test');

  const [paperBox, hardwareBox, clipBox] = await Promise.all([
    page.locator('.runner-shell').boundingBox(),
    page.locator('.workbook-page-hardware').boundingBox(),
    page.locator('.workbook-page-clip').boundingBox(),
  ]);
  expect(paperBox).not.toBeNull();
  expect(hardwareBox).not.toBeNull();
  expect(clipBox).not.toBeNull();

  const topInset = (hardwareBox?.y ?? 0) - (paperBox?.y ?? 0);
  const bottomInset =
    (paperBox?.y ?? 0) +
    (paperBox?.height ?? 0) -
    ((hardwareBox?.y ?? 0) + (hardwareBox?.height ?? 0));
  expect(topInset).toBeGreaterThan(0);
  expect(bottomInset).toBeGreaterThan(0);
  expect(Math.abs(topInset - bottomInset)).toBeLessThan(1);
  expect(clipBox?.height).toBeCloseTo(hardwareBox?.height ?? 0, 0);
});

test('gives phones a full-width paper-only shell', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  await page.goto('/');

  for (const width of [320, 360, 390, 430, 767]) {
    await page.setViewportSize({ width, height: 900 });

    const cover = page.locator('.workbook-cover');
    const hardware = page.locator('.workbook-page-hardware');
    const navigation = page.locator('.workbook-folder-tabs');
    const tabs = page.locator('.workbook-folder-tab');
    const paper = page.locator('.page-shell');
    const deskObjects = page.locator(
      '.desk-light, .desk-lamp, .desk-pencil, .desk-ruler, .desk-paperclip',
    );

    await expect(cover, `folder cover at ${width}px`).toBeHidden();
    await expect(hardware, `folder hardware at ${width}px`).toBeHidden();
    await expect(deskObjects, `desk objects at ${width}px`).toHaveCount(5);
    for (const deskObject of await deskObjects.all()) {
      await expect(deskObject, `hidden desk object at ${width}px`).toBeHidden();
    }
    await expect(navigation, `navigation at ${width}px`).toBeVisible();
    await expect(tabs, `navigation links at ${width}px`).toHaveCount(2);

    const [paperBox, navigationBox, tabBoxes, paperSpacing] = await Promise.all([
      paper.boundingBox(),
      navigation.boundingBox(),
      tabs.evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().toJSON()),
      ),
      paper.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          paddingLeft: Number.parseFloat(style.paddingLeft),
          paddingRight: Number.parseFloat(style.paddingRight),
        };
      }),
    ]);

    expect(paperBox, `paper at ${width}px`).not.toBeNull();
    expect(navigationBox, `navigation bounds at ${width}px`).not.toBeNull();
    expect(paperBox!.width, `paper width at ${width}px`).toBeGreaterThanOrEqual(width - 16);
    expect(
      paperSpacing.paddingLeft,
      `paper clears the left ledger at ${width}px`,
    ).toBeGreaterThanOrEqual(20);
    expect(
      paperBox!.width - paperSpacing.paddingLeft - paperSpacing.paddingRight,
      `usable paper width at ${width}px`,
    ).toBeGreaterThanOrEqual(width - 44);
    expect(
      tabBoxes.every((tab) => tab.height >= 44),
      `touch targets at ${width}px`,
    ).toBe(true);
    expect(
      Math.max(...tabBoxes.map((tab) => tab.y)) - Math.min(...tabBoxes.map((tab) => tab.y)),
      `horizontal navigation at ${width}px`,
    ).toBeLessThan(2);
    expect(navigationBox!.width, `navigation width at ${width}px`).toBeCloseTo(paperBox!.width, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }

  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator('.workbook-cover')).toBeVisible();
  await expect(page.locator('.workbook-page-clip')).toBeVisible();
  await expect(page.locator('.desk-lamp')).toBeVisible();
  await expect(page.locator('.workbook-folder-tab').first().locator('span')).toHaveCSS(
    'writing-mode',
    'vertical-rl',
  );
});

test('keeps the typed answer line inside its phone exercise sheet', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');

  for (const width of [320, 375, 390, 430, 767]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/study/${TOPIC_SEGMENT}/harmony-in-forms`);

    const answerLabel = page.locator('.text-answer');
    const answerInput = answerLabel.locator('.notebook-input');
    const exerciseSheet = page.locator('.exercise-card');
    const [labelBox, inputBox, sheetBox] = await Promise.all([
      answerLabel.boundingBox(),
      answerInput.boundingBox(),
      exerciseSheet.boundingBox(),
    ]);

    expect(labelBox, `answer label at ${width}px`).not.toBeNull();
    expect(inputBox, `answer input at ${width}px`).not.toBeNull();
    expect(sheetBox, `exercise sheet at ${width}px`).not.toBeNull();
    expect(inputBox!.x, `input start at ${width}px`).toBeGreaterThanOrEqual(labelBox!.x);
    expect(inputBox!.x + inputBox!.width, `input end at ${width}px`).toBeLessThanOrEqual(
      labelBox!.x + labelBox!.width,
    );
    expect(
      labelBox!.x + labelBox!.width - (inputBox!.x + inputBox!.width),
      `input right inset at ${width}px`,
    ).toBeGreaterThanOrEqual(7);
    expect(inputBox!.x + inputBox!.width, `sheet containment at ${width}px`).toBeLessThan(
      sheetBox!.x + sheetBox!.width,
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
});

test('keeps phone navigation in flow and study actions within reach without changing tablet geometry', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  await page.setViewportSize({ width: 390, height: 720 });
  await page.goto('/');

  const navigation = page.locator('.workbook-folder-tabs');
  const homeHero = page.locator('.hero');
  await expect(navigation).toHaveCSS('position', 'static');
  await expect(navigation).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(navigation).toHaveCSS('box-shadow', 'none');
  await expect(homeHero).toHaveCSS('padding-top', '20px');
  await expect(page.locator('.site-header')).toHaveCSS('position', 'relative');
  expect(
    await page
      .locator('.catalog-stats')
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ')),
  ).toHaveLength(2);

  await page.evaluate(() => window.scrollTo(0, 1_000));
  await expect
    .poll(async () => {
      const box = await navigation.boundingBox();
      return (box?.y ?? 0) + (box?.height ?? 0);
    })
    .toBeLessThanOrEqual(0);
  await expect(navigation.getByRole('link')).toHaveCount(2);

  await page.goto(`/topics/${TOPIC_SEGMENT}`);
  const topicOverview = page.locator('.topic-overview');
  expect(
    await topicOverview.evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(' '),
    ),
  ).toHaveLength(2);
  const firstTitleRow = page.locator('.test-title-row').first();
  const firstScoreBadge = firstTitleRow.locator('.score-badge');
  await expect(firstTitleRow).toHaveCSS('display', 'flex');
  const [titleRowBox, scoreBadgeBox] = await Promise.all([
    firstTitleRow.boundingBox(),
    firstScoreBadge.boundingBox(),
  ]);
  expect(titleRowBox).not.toBeNull();
  expect(scoreBadgeBox).not.toBeNull();
  expect(
    Math.abs(
      (titleRowBox?.x ?? 0) +
        (titleRowBox?.width ?? 0) -
        ((scoreBadgeBox?.x ?? 0) + (scoreBadgeBox?.width ?? 0)),
    ),
  ).toBeLessThanOrEqual(1);

  await page.goto('/stats');
  expect(
    await page
      .locator('.cumulative-overview')
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ')),
  ).toHaveLength(2);
  await page.goto(`/stats/${TOPIC_SEGMENT}`);
  expect(
    await page
      .locator('.stats-overview')
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ')),
  ).toHaveLength(2);

  await page.goto(`/study/${TOPIC_SEGMENT}/vowel-families`);
  const actionDock = page.locator('.study-action-dock');
  await expect(actionDock).toHaveCount(1);
  await expect(actionDock).toHaveCSS('display', 'block');
  await expect(actionDock).toHaveCSS('position', 'sticky');
  await expect(actionDock.getByRole('button')).toHaveCount(2);
  await expect(actionDock.locator('.reveal-note')).toBeVisible();
  await expect(page.locator('.runner-shell')).toHaveCSS('padding-top', '16px');

  await actionDock.scrollIntoViewIfNeeded();
  const dockBox = await actionDock.boundingBox();
  expect(dockBox).not.toBeNull();
  expect((dockBox?.y ?? 0) + (dockBox?.height ?? 0)).toBeLessThanOrEqual(713);

  await page.getByRole('radio', { name: 'back vowels' }).check();
  await actionDock.getByRole('button', { name: 'Check answer' }).click();
  await expect(actionDock.getByRole('button', { name: 'Continue' })).toBeVisible();
  await expect(actionDock.getByRole('button')).toHaveCount(1);

  const enlargedTextStyle = await page.addStyleTag({
    content: ':root { font-size: 200% !important; }',
  });
  await expect(actionDock).toHaveCSS('position', 'static');
  await enlargedTextStyle.evaluate((element) => element.remove());

  await page.setViewportSize({ width: 768, height: 1_024 });
  await expect(page.locator('.site-header')).toHaveCSS('position', 'sticky');
  await expect(page.locator('.runner-shell')).toHaveCSS('padding-top', '32px');
  await expect(actionDock).toHaveCSS('display', 'contents');
  await expect(actionDock).toHaveCSS('position', 'static');
  await expect(page.locator('.workbook-folder-tab').first().locator('span')).toHaveCSS(
    'writing-mode',
    'vertical-rl',
  );

  await page.goto('/');
  await expect(page.locator('.hero')).toHaveCSS('padding-top', '48px');
  expect(
    await page
      .locator('.catalog-stats')
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ')),
  ).toHaveLength(4);

  await page.goto(`/stats/${TOPIC_SEGMENT}`);
  await expect(page.locator('.stats-overview-primary')).toHaveCSS('grid-column-start', '1');
  await expect(page.locator('.stats-overview-primary')).toHaveCSS('grid-column-end', '-1');
});

test('keeps the folder margin fixed between responsive breakpoints', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  await page.goto('/');

  for (const width of [768, 901, 1000, 1100, 1248, 1440, 1754]) {
    await page.setViewportSize({ width, height: 900 });
    const [headerBox, folderBox, coverBox, paperBox, tabBoxes, contentInset] = await Promise.all([
      page.locator('.site-header').boundingBox(),
      page.locator('.workbook-folder').boundingBox(),
      page.locator('.workbook-cover').boundingBox(),
      page.locator('.page-shell').boundingBox(),
      page
        .locator('.workbook-folder-tab')
        .evaluateAll((elements) =>
          elements.map((element) => element.getBoundingClientRect().toJSON()),
        ),
      page.locator('.page-shell').evaluate((element) => {
        const probe = document.createElement('div');
        probe.style.position = 'absolute';
        probe.style.paddingLeft = 'var(--sheet-gutter)';
        element.append(probe);
        const sheetGutter = Number.parseFloat(getComputedStyle(probe).paddingLeft);
        probe.remove();
        return {
          paddingLeft: Number.parseFloat(getComputedStyle(element).paddingLeft),
          sheetGutter,
        };
      }),
    ]);
    expect(headerBox, `header at ${width}px`).not.toBeNull();
    expect(folderBox, `folder wrapper at ${width}px`).not.toBeNull();
    expect(coverBox, `folder cover at ${width}px`).not.toBeNull();
    expect(paperBox, `paper at ${width}px`).not.toBeNull();

    const leftInset = (paperBox?.x ?? 0) - (coverBox?.x ?? 0);
    const rightInset =
      (coverBox?.x ?? 0) + (coverBox?.width ?? 0) - ((paperBox?.x ?? 0) + (paperBox?.width ?? 0));
    const topInset = (paperBox?.y ?? 0) - (coverBox?.y ?? 0);
    expect(leftInset, `left folder margin at ${width}px`).toBeGreaterThanOrEqual(38);
    expect(leftInset, `left folder margin at ${width}px`).toBeLessThanOrEqual(40);
    expect(rightInset, `right folder margin at ${width}px`).toBeGreaterThanOrEqual(38);
    expect(rightInset, `right folder margin at ${width}px`).toBeLessThanOrEqual(40);
    expect(Math.abs(leftInset - rightInset), `balanced margins at ${width}px`).toBeLessThan(2);
    expect(topInset, `top folder margin at ${width}px`).toBeGreaterThanOrEqual(24);
    expect(topInset, `top folder margin at ${width}px`).toBeLessThanOrEqual(30);
    expect(coverBox?.x ?? 0, `left screen breathing room at ${width}px`).toBeGreaterThanOrEqual(16);
    expect(
      width - ((coverBox?.x ?? 0) + (coverBox?.width ?? 0)),
      `right screen breathing room at ${width}px`,
    ).toBeGreaterThanOrEqual(16);
    expect(
      tabBoxes.every((tab) => tab.x >= (coverBox?.x ?? 0) - 1),
      `unclipped folder tabs at ${width}px`,
    ).toBe(true);
    expect(
      (coverBox?.y ?? 0) - ((headerBox?.y ?? 0) + (headerBox?.height ?? 0)),
      `top desk breathing room at ${width}px`,
    ).toBeGreaterThanOrEqual(24);
    expect(
      contentInset.paddingLeft - contentInset.sheetGutter,
      `additional left content inset at ${width}px`,
    ).toBeCloseTo(8, 0);
  }

  const coverBox = await page.locator('.workbook-cover').boundingBox();
  const decorationBoxes = await Promise.all(
    ['.desk-lamp', '.desk-pencil', '.desk-ruler', '.desk-paperclip'].map((selector) =>
      page.locator(selector).boundingBox(),
    ),
  );
  expect(coverBox).not.toBeNull();
  for (const decorationBox of decorationBoxes) {
    expect(decorationBox).not.toBeNull();
    const horizontalOverlap = Math.max(
      0,
      Math.min(
        (decorationBox?.x ?? 0) + (decorationBox?.width ?? 0),
        (coverBox?.x ?? 0) + (coverBox?.width ?? 0),
      ) - Math.max(decorationBox?.x ?? 0, coverBox?.x ?? 0),
    );
    expect(horizontalOverlap).toBeLessThanOrEqual((decorationBox?.width ?? 0) / 2);
  }
});

test('opens the catalog and exposes stable learning routes', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Take one clear step');
  await expect(page.locator('.topic-card')).toHaveCount(11);
  await expect(page.locator('.test-card')).toHaveCount(0);
  await vowelHarmonyTopicLink(page).click();

  await expect(page).toHaveURL(new RegExp(`/topics/${TOPIC_SEGMENT}$`));
  await expect(page.locator('.test-card')).toHaveCount(6);
  await expect(page.locator('.test-group-heading h3')).toHaveText(['Focused tests', 'Reviews']);
  await expect(page.locator('.set-badge, .stage-badge')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('Core set');
  await expect(page.locator('body')).not.toContainText('Extended set');
  await expect(
    page.locator('.test-card').first().getByRole('link', { name: 'Learn first' }),
  ).toHaveAttribute('href', new RegExp(`/learn/${TOPIC_SEGMENT}/`));
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toContainText(
    'Notebook',
  );
  await expect(page.locator('.tab-number')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Appearance' })).toBeVisible();
  await expect(page.getByText('Desk light', { exact: true })).toHaveCount(0);
  await expect(page.locator('.appearance-options label')).toHaveText([/Day/, /Automatic/, /Night/]);
  await expect(page.locator('.appearance-toggle-hardware')).toBeVisible();
  await expect(page.locator('.appearance-choice-icon')).toHaveCount(3);

  await page.goto(`/learn/${KPT_TOPIC_SEGMENT}/kpt-nouns`);
  await expect(page.locator('.lesson-hero h1')).toHaveText('KPT in nouns');
  await expect(page.locator('.lesson-layout')).toHaveClass(/single-lesson/);
  await expect(page.locator('.lesson-list')).toHaveCount(0);
  await expect(page.locator('.lesson-picker')).toHaveCount(0);
  await expect(page.locator('.lesson-progress')).toHaveCount(0);
  await expect(page.locator('.reader-heading h2')).toHaveText('Building noun forms with -n');
  await expect(page.locator('body')).not.toContainText('Guided combination');

  if ((page.viewportSize()?.width ?? 0) > 800) {
    const readerBox = await page.locator('.lesson-reader').boundingBox();
    const viewportCenter = (page.viewportSize()?.width ?? 0) / 2;
    expect(readerBox).not.toBeNull();
    expect(
      Math.abs((readerBox?.x ?? 0) + (readerBox?.width ?? 0) / 2 - viewportCenter),
    ).toBeLessThan(4);
  }

  await page.goto(`/learn/${TOPIC_SEGMENT}/location-transfer-review`);
  await expect(page.locator('.lesson-list button')).toHaveCount(4);
  await expect(page.locator('.lesson-hero .eyebrow')).toContainText('Review');
  await expect(page.locator('.lesson-hero h1')).toHaveText('Location transfer review');

  if ((page.viewportSize()?.width ?? 0) <= 800) {
    await expect(page.locator('.lesson-list')).toBeHidden();
    await expect(page.locator('.lesson-picker')).toBeVisible();
    await expect(page.locator('.lesson-picker option')).toHaveCount(4);
    await page.locator('.lesson-picker select').selectOption('1');
    await expect(page.locator('.reader-heading h2')).toContainText(
      'Neutral vowels in ending choice',
    );

    const pickerBox = await page.locator('.lesson-picker').boundingBox();
    const readerBox = await page.locator('.lesson-reader').boundingBox();
    expect(pickerBox).not.toBeNull();
    expect(readerBox).not.toBeNull();
    expect((readerBox?.y ?? 0) - ((pickerBox?.y ?? 0) + (pickerBox?.height ?? 0))).toBeLessThan(40);
  } else {
    await expect(page.locator('.lesson-list')).toBeVisible();
    await expect(page.locator('.lesson-picker')).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, 560));
    const positions = await page.evaluate(() => ({
      headerBottom: document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0,
      listTop: document.querySelector('.lesson-list')?.getBoundingClientRect().top ?? 0,
    }));
    expect(positions.listTop).toBeGreaterThanOrEqual(positions.headerBottom);
  }
});

test('places focus on routed content after in-app navigation', async ({ page }) => {
  await page.goto('/');

  const initialMain = page.locator('main');
  await expect(initialMain).not.toBeFocused();
  await vowelHarmonyTopicLink(page).click();

  const routedMain = page.locator('main');
  await expect(routedMain).toBeFocused();
  await expect(routedMain).toHaveAttribute('tabindex', '-1');
  await expect(routedMain.getByRole('heading', { level: 1 })).toBeVisible();
});

test('uses a responsive three, two, and one-column topic-card grid', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  await page.goto('/');

  for (const [width, expectedColumns] of [
    [1440, 3],
    [768, 2],
    [560, 1],
    [320, 1],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    const columnCount = await page
      .locator('.pack-group .group-cards')
      .first()
      .evaluate(
        (element) =>
          getComputedStyle(element)
            .gridTemplateColumns.split(' ')
            .filter((column) => column.length > 0).length,
      );
    expect(columnCount, `topic-card columns at ${width}px`).toBe(expectedColumns);
    const firstCard = page.locator('.topic-card').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator('.topic-progress-item')).toHaveCount(2);
    await expect(firstCard.locator('.topic-meta, .topic-objectives')).toHaveCount(0);
    if (width === 1440) {
      expect((await firstCard.boundingBox())?.height ?? Number.POSITIVE_INFINITY).toBeLessThan(400);
      const cardSurface = await firstCard.evaluate((element) => {
        const styles = getComputedStyle(element);
        return {
          backgroundImage: styles.backgroundImage,
          borderTopWidth: Number.parseFloat(styles.borderTopWidth),
        };
      });
      expect(cardSurface.backgroundImage).toContain('linear-gradient');
      expect(cardSurface.borderTopWidth).toBeGreaterThan(0);
      expect(
        await firstCard.evaluate(
          (element) => (getComputedStyle(element).boxShadow.match(/inset/g) ?? []).length,
        ),
      ).toBe(0);
      await firstCard.hover();
      await expect
        .poll(() =>
          firstCard.evaluate(
            (element) => (getComputedStyle(element).boxShadow.match(/inset/g) ?? []).length,
          ),
        )
        .toBe(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
});

test('reuses the worked-example treatment with notebook-paper topic cards', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  await page.goto('/');
  const material = (element: Element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.backgroundColor,
      image: styles.backgroundImage,
      borderTop: styles.borderTop,
      clipPath: styles.clipPath,
      paddingBottom: styles.paddingBottom,
    };
  };
  const catalogSection = await page.locator('.topic-catalog').evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      paddingTop: Number.parseFloat(styles.paddingTop),
      paddingBottom: Number.parseFloat(styles.paddingBottom),
      headingInsideGrid: element
        .querySelector('.topic-grid')
        ?.contains(element.querySelector('.section-heading') ?? null),
    };
  });
  const topicGridMaterial = await page.locator('.topic-grid').evaluate(material);
  const topicCardMaterial = await page.locator('.topic-card').first().evaluate(material);
  const stationeryPaperColor = await page
    .locator('.topic-grid')
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(page.locator('.topic-grid > .card-kicker')).toHaveText('Level: 0 - A1.3');
  await expect(page.locator('.topic-card .card-kicker')).toHaveCount(0);

  await page.goto(`/learn/${TOPIC_SEGMENT}/vowel-families`);
  const workedExamplesMaterial = await page.locator('.worked-examples').evaluate(material);
  const exampleCardMaterial = await page
    .locator('.example-grid article')
    .first()
    .evaluate(material);

  expect(topicGridMaterial).toEqual(workedExamplesMaterial);
  expect(topicCardMaterial).toMatchObject({
    color: stationeryPaperColor,
    borderTop: exampleCardMaterial.borderTop,
    paddingBottom: exampleCardMaterial.paddingBottom,
  });
  expect(topicCardMaterial.image).not.toBe('none');
  expect(topicCardMaterial.clipPath).not.toBe('none');
  expect(catalogSection).toEqual({
    paddingTop: 64,
    paddingBottom: 40,
    headingInsideGrid: false,
  });
});

test('sizes cut-paper actions to their labels across app routes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');

  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });

    await page.goto('/');
    await expectLabelSizedAction(vowelHarmonyTopicLink(page));

    await page.goto(`/learn/${TOPIC_SEGMENT}/vowel-families`);
    await expectLabelSizedAction(page.getByRole('link', { name: 'Start test now' }));

    await page.goto(`/study/${TOPIC_SEGMENT}/vowel-families`);
    await expectLabelSizedAction(page.getByRole('button', { name: 'Check answer' }));
    await expectLabelSizedAction(page.getByRole('button', { name: /Show answer/ }));

    await page.goto('/stats');
    await expectLabelSizedAction(page.getByRole('button', { name: 'Download backup' }));
    await expectLabelSizedAction(page.locator('.file-button'));
    const clearAll = page.getByRole('button', { name: 'Clear all history' });
    await expectLabelSizedAction(clearAll);
    await clearAll.click();
    const cancelClear = page.getByRole('button', { name: 'Cancel clearing history' });
    await expect(cancelClear).toBeVisible();
    await cancelClear.click();

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
});

test('keeps focus visible on clipped actions and note fields', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  await page.setViewportSize({ width: 320, height: 900 });

  await page.goto(`/study/${TOPIC_SEGMENT}/vowel-families`);
  const showAnswer = page.getByRole('button', { name: 'Show answer' });
  await showAnswer.focus();
  const actionFocus = await showAnswer.evaluate((element) => {
    const colorProbe = document.createElement('span');
    colorProbe.style.color = 'var(--focus-ring)';
    document.body.append(colorProbe);
    const focusRing = getComputedStyle(colorProbe).color;
    colorProbe.remove();
    const indicator = getComputedStyle(element, '::before');
    return {
      color: indicator.borderTopColor,
      focusRing,
      style: indicator.borderTopStyle,
      width: Number.parseFloat(indicator.borderTopWidth),
    };
  });
  expect(actionFocus.style).toBe('solid');
  expect(actionFocus.width).toBeGreaterThanOrEqual(3);
  expect(actionFocus.color).toBe(actionFocus.focusRing);

  await expect(showAnswer).not.toHaveAttribute('aria-keyshortcuts');
  await expect(page.locator('.answer-actions')).not.toContainText('Alt+A');
  await page.keyboard.press('Alt+a');
  await expect(page.locator('.exercise-card .feedback')).toHaveCount(0);
  await showAnswer.press('Enter');
  await expect(page.locator('.exercise-card .feedback')).toContainText('Answer revealed');

  await page.goto(`/topics/${TOPIC_SEGMENT}`);
  const note = page.getByRole('textbox', { name: 'Topic note' });
  await note.focus();
  const fieldFocus = await note.evaluate((element) => {
    const colorProbe = document.createElement('span');
    colorProbe.style.color = 'var(--focus-ring)';
    document.body.append(colorProbe);
    const focusRing = getComputedStyle(colorProbe).color;
    colorProbe.remove();
    const styles = getComputedStyle(element);
    return {
      color: styles.outlineColor,
      focusRing,
      style: styles.outlineStyle,
      width: Number.parseFloat(styles.outlineWidth),
    };
  });
  expect(fieldFocus.style).toBe('solid');
  expect(fieldFocus.width).toBeGreaterThanOrEqual(3);
  expect(fieldFocus.color).toBe(fieldFocus.focusRing);
});

test('shares responsive modal and vocabulary-card styling with safe dismissal', async ({
  page,
}) => {
  await page.goto(`/study/${TOPIC_SEGMENT}/vowel-families`);

  const trigger = page.getByRole('button', { name: 'Cheat mode', exact: true });
  const dialog = page.getByRole('dialog', { name: 'Words for this question' });
  await expect(trigger).toBeVisible();
  await expect(dialog).toBeHidden();

  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('talo', { exact: true })).toBeVisible();
  await expect(dialog.getByText('house', { exact: true })).toBeVisible();
  await expect(dialog.getByText('koulu', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Close Cheat mode' })).toBeFocused();
  await expect(dialog).not.toContainText('Close Cheat mode');
  await expectModalCloseControl(dialog);
  const cheatSurface = await modalSurface(dialog);
  const cheatVocabularyCard = await vocabularyCardMaterial(
    dialog.locator('.question-vocabulary > div'),
  );

  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds?.x ?? -1).toBeGreaterThanOrEqual(0);
  expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(
    page.viewportSize()?.width ?? 0,
  );

  await page.mouse.click(1, 1);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator('.question-count')).toContainText('1 /');

  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  await page.goto(`/learn/${TOPIC_SEGMENT}/vowel-families`);
  expect(
    await page
      .locator('.teaching-section')
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe(cheatSurface.backgroundColor);
  expect(await vocabularyCardMaterial(page.locator('.lesson-vocabulary dl div').first())).toEqual(
    cheatVocabularyCard,
  );

  await page.goto('/stats');
  const clearHistory = page.getByRole('button', { name: 'Clear all history' });
  await clearHistory.click();
  const confirmation = page.getByRole('dialog', { name: 'Clear all learner history?' });
  await expect(confirmation.getByRole('button', { name: 'Cancel clearing history' })).toBeFocused();
  await expect(confirmation).not.toContainText('Keep my history');
  expect(await modalSurface(confirmation)).toEqual(cheatSurface);
  await expectModalCloseControl(confirmation);

  await confirmation.getByRole('heading', { name: 'Clear all learner history?' }).click();
  await expect(confirmation).toBeVisible();
  await page.mouse.click(1, 1);
  await expect(confirmation).toBeHidden();
  await expect(clearHistory).toBeFocused();
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('places compact action groups according to their page role', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');

  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });

    await page.goto('/');
    await expectActionGroupPlacement(page.locator('.topic-card-actions').first(), 'center');

    await page.goto(`/topics/${TOPIC_SEGMENT}`);
    await expectActionGroupPlacement(page.locator('.test-actions').first(), 'end');

    await page.goto(`/learn/${TOPIC_SEGMENT}/vowel-families`);
    await expectActionGroupPlacement(page.locator('.lesson-actions'), 'end');

    await page.goto(`/study/${TOPIC_SEGMENT}/vowel-families`);
    await expectActionGroupPlacement(page.locator('.answer-actions'), 'end');

    await page.goto('/stats');
    await expectActionGroupPlacement(page.locator('.archive-action-row').first(), 'end');
    await page.getByRole('button', { name: 'Clear all history' }).click();
    await expectActionGroupPlacement(page.locator('.confirmation-actions'), 'end');
    await page.getByRole('button', { name: 'Cancel clearing history' }).click();

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
});

test('keeps optional lesson practice separate from scored progress', async ({ page }) => {
  await page.goto(`/topics/${TOPIC_SEGMENT}`);
  await page.locator('.test-card').first().getByRole('link', { name: 'Learn first' }).click();

  await expect(page.getByRole('heading', { name: 'Vowel families' })).toBeVisible();
  await page.getByRole('button', { name: 'Start optional practice' }).click();
  await expect(page.locator('.practice-actions')).not.toContainText('Alt+A');
  const showAnswer = page.getByRole('button', { name: 'Show answer' });
  await expect(showAnswer).not.toHaveAttribute('aria-keyshortcuts');
  await page.keyboard.press('Alt+a');
  await expect(page.locator('.lesson-practice .feedback')).toHaveCount(0);
  await showAnswer.click();

  await expect(page.locator('.lesson-practice .feedback')).toContainText('Answer revealed');
  await expect(page.locator('.lesson-practice .feedback')).toContainText(
    'Nothing was added to your test history or mistakes',
  );
});

test('keeps stationery exercise controls native and keyboard usable', async ({ page }) => {
  await page.goto(`/study/${TOPIC_SEGMENT}/vowel-families`);

  const firstChoice = page.getByRole('radio', { name: 'back vowels' });
  await firstChoice.check();
  await expect(firstChoice).toBeChecked();
  await expect(
    page.getByRole('progressbar', { name: 'Exercises completed in this session' }),
  ).toBeVisible();
  await expect(page.locator('.progress-ruler')).toBeVisible();
  await expect(page.locator('.progress-pencil')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Check answer' })).toBeEnabled();
  await page.getByRole('button', { name: 'Check answer' }).click();
  const disabledChoice = page.locator('.choice-list label').nth(1);
  const disabledRestingTransform = await disabledChoice.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await disabledChoice.hover();
  await expect
    .poll(() => disabledChoice.evaluate((element) => getComputedStyle(element).transform))
    .toBe(disabledRestingTransform);

  await page.goto(`/study/${TOPIC_SEGMENT}/harmony-in-forms`);
  const answer = page.getByRole('textbox', { name: 'Your answer' });
  await answer.fill('talossa');
  await expect(answer).toHaveValue('talossa');
  await page.getByRole('button', { name: 'Erase answer' }).click();
  await expect(answer).toHaveValue('');

  await page.goto(`/study/${PLURAL_TOPIC_SEGMENT}/plural-in-sentences`);
  await page.getByRole('button', { name: /Show answer/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  const availableWords = page.getByLabel('Available words');
  const firstWord = availableWords.locator('button:not(:disabled)').first();
  const word = (await firstWord.textContent())?.trim();
  await firstWord.click();
  await expect(page.getByLabel('Your sentence').getByRole('button')).toContainText(
    word ?? 'missing word token',
  );
  await page.getByRole('button', { name: 'Undo last word' }).click();
  await expect(page.getByLabel('Your sentence').getByRole('button')).toHaveCount(0);
  await expect(page.locator('details, [aria-expanded]')).toHaveCount(0);
});

test('completes each study response type with contextual Enter behavior', async ({ page }) => {
  await page.goto(`/study/${TOPIC_SEGMENT}/vowel-families`);
  const firstChoice = page.getByRole('radio', { name: 'back vowels' });
  await expect(firstChoice).toBeFocused();
  await page.keyboard.press('Space');
  await page.keyboard.press('Enter');
  await expect(page.locator('.exercise-card .feedback')).toContainText('Correct');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('radio', { name: 'back vowels' })).toBeFocused();

  await page.goto(`/study/${TOPIC_SEGMENT}/harmony-in-forms`);
  const textAnswer = page.getByRole('textbox', { name: 'Your answer' });
  await expect(textAnswer).toBeFocused();
  await page.keyboard.insertText('talossa');
  await page.keyboard.press('Enter');
  await expect(page.locator('.exercise-card .feedback')).toContainText('Correct');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeFocused();

  await page.goto(`/study/${PLURAL_TOPIC_SEGMENT}/plural-in-sentences`);
  await expect(page.getByRole('textbox', { name: 'Your answer' })).toBeFocused();
  await page.keyboard.insertText('Kirjat');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeFocused();
  await page.keyboard.press('Enter');

  const availableWords = page.getByLabel('Available words');
  await expect(availableWords.getByRole('button', { name: 'ovat' })).toBeFocused();
  for (const [index, word] of ['Koirat', 'ovat', 'ulkona.'].entries()) {
    await availableWords.getByRole('button', { name: word }).press('Enter');
    await expect(page.getByLabel('Your sentence').getByRole('button')).toHaveCount(index + 1);
  }
  await expect(page.locator('.exercise-card .feedback')).toHaveCount(0);
  const checkAnswer = page.getByRole('button', { name: 'Check answer' });
  await checkAnswer.press('Enter');
  await expect(page.locator('.exercise-card .feedback')).toContainText('Correct');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeFocused();
});

test('keeps study targets truthful and readable at every supported width', async ({ page }) => {
  await page.goto(`/study/${TOPIC_SEGMENT}/vowel-families`);

  const focusedTarget = page.getByRole('complementary', { name: 'Test learning focus' });
  await expect(
    focusedTarget.getByRole('heading', { level: 2, name: 'Your target: Vowel harmony' }),
  ).toBeVisible();
  await expect(focusedTarget).toContainText(
    'Learn and practise this important grammar point separately.',
  );
  await expect
    .poll(() => focusedTarget.evaluate((element) => getComputedStyle(element).display))
    .toBe((page.viewportSize()?.width ?? 0) <= 800 ? 'block' : 'flex');
  await expect(page.locator('html')).toHaveJSProperty('scrollWidth', page.viewportSize()?.width);

  await page.goto(`/study/${TOPIC_SEGMENT}/location-transfer-review`);

  const reviewTarget = page.getByRole('complementary', { name: 'Test learning focus' });
  await expect(reviewTarget.getByRole('heading', { level: 2 })).toContainText('Skills reviewed:');
  await expect(reviewTarget).toContainText('Practise these earlier skills together.');
  await expect(reviewTarget).not.toContainText('this important grammar point separately');
});

test('saves a private sticky note without leaving the workbook', async ({ page }) => {
  await page.goto(`/topics/${TOPIC_SEGMENT}`);

  const note = page.getByRole('textbox', { name: 'Topic note' });
  await note.fill('Practise front-vowel endings tomorrow.');
  await page.getByRole('button', { name: 'Save note' }).click();
  await expect(page.getByRole('status')).toContainText('Note saved locally');

  await page.getByRole('link', { name: 'All topics' }).click();
  await vowelHarmonyTopicLink(page).click();
  await expect(page.getByRole('textbox', { name: 'Topic note' })).toHaveValue(
    'Practise front-vowel endings tomorrow.',
  );
});

test('uses dedicated notebook objects for repeated surfaces and return links', async ({ page }) => {
  await page.goto('/');
  const compactHeroGap = (page.viewportSize()?.width ?? 1_440) < 768 ? '12px' : '20px';
  const continueCard = page.locator('.continue-card');
  const topicCard = page.locator('.topic-card').first();
  await expectClippedPaper(continueCard);
  await expectClippedPaper(topicCard);
  await expect(continueCard).toHaveClass(/assignment-sheet/);

  const continueColor = await continueCard.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  const continueTopicColor = await continueCard
    .locator('.continue-topic')
    .evaluate((element) => getComputedStyle(element).color);
  const assignmentPattern = await continueCard.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderLeftColor: style.borderLeftColor,
      borderLeftWidth: style.borderLeftWidth,
      clipPath: style.clipPath,
      foldColor: getComputedStyle(element, '::after').borderTopColor,
      tapeColor: getComputedStyle(element, '::before').backgroundColor,
    };
  });

  const restingTransform = await continueCard.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  const rootFontSize = await page.evaluate(() =>
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
  );
  const expectedLift = rootFontSize * -0.45;
  const expectedTapedLift = rootFontSize * -0.3;
  const expectedCardLift = rootFontSize * -0.3;
  const expectedNoteLift = rootFontSize * -0.22;
  const expectedInformationShift = rootFontSize * 0.12;
  await continueCard.hover();
  await expect
    .poll(() =>
      continueCard.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedTapedLift, 2);

  await page.mouse.move(0, 0);
  await expect
    .poll(() => continueCard.evaluate((element) => getComputedStyle(element).transform))
    .toBe(restingTransform);
  await continueCard.getByRole('link').first().focus();
  await expect
    .poll(() =>
      continueCard.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedTapedLift, 2);

  await topicCard.hover();
  await expect
    .poll(() =>
      topicCard.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedCardLift, 2);

  const catalogStats = page.locator('.catalog-stats');
  await catalogStats.hover();
  await expect
    .poll(() =>
      catalogStats.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41,
      ),
    )
    .toBeCloseTo(expectedInformationShift, 2);

  await page.goto(`/topics/${TOPIC_SEGMENT}`);
  const topicPageWidth = await page
    .locator('main.topic-page')
    .evaluate((element) => element.getBoundingClientRect().width);
  await expect(page.locator('.topic-hero .back-link + .eyebrow')).toHaveCSS(
    'margin-top',
    compactHeroGap,
  );
  const topicOverview = page.locator('.topic-overview');
  await expect(topicOverview).toHaveClass(/assignment-sheet/);
  expect(
    await topicOverview.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        borderLeftColor: style.borderLeftColor,
        borderLeftWidth: style.borderLeftWidth,
        clipPath: style.clipPath,
        foldColor: getComputedStyle(element, '::after').borderTopColor,
        tapeColor: getComputedStyle(element, '::before').backgroundColor,
      };
    }),
  ).toEqual(assignmentPattern);
  await expect(topicOverview.locator('div')).toHaveCount(4);
  await expect(topicOverview).toContainText('Tests tried');
  await expect(topicOverview).toContainText('Lessons read');
  await expect(topicOverview).toContainText('Average');
  await expect(topicOverview).toContainText('Exercises');
  expect([
    ...new Set(
      await topicOverview
        .locator('dd')
        .evaluateAll((values) => values.map((value) => getComputedStyle(value).color)),
    ),
  ]).toEqual([continueTopicColor]);
  const labelPresentation = await topicOverview
    .locator('dt')
    .first()
    .evaluate((element) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--text-primary)';
      document.body.append(probe);
      const presentation = {
        color: getComputedStyle(element).color,
        expectedColor: getComputedStyle(probe).color,
        weight: Number.parseInt(getComputedStyle(element).fontWeight, 10),
      };
      probe.remove();
      return presentation;
    });
  expect(labelPresentation.color).toBe(labelPresentation.expectedColor);
  expect(labelPresentation.weight).toBeGreaterThanOrEqual(700);

  const overviewRestingTransform = await topicOverview.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await topicOverview.hover();
  await expect
    .poll(() =>
      topicOverview.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41,
      ),
    )
    .toBeCloseTo(expectedInformationShift, 2);
  await page.mouse.move(0, 0);
  await expect
    .poll(() => topicOverview.evaluate((element) => getComputedStyle(element).transform))
    .toBe(overviewRestingTransform);

  const objectivePanel = page.locator('.objective-panel');
  expect(
    await objectivePanel.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        gridLayers: style.backgroundImage.match(/linear-gradient/g)?.length ?? 0,
        backgroundSize: style.backgroundSize,
      };
    }),
  ).toEqual({
    backgroundColor: continueColor,
    gridLayers: 2,
    backgroundSize: '24px 24px, 24px 24px, 24px 24px',
  });
  await objectivePanel.hover();
  await expect
    .poll(() =>
      objectivePanel.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedTapedLift, 2);

  const topicNote = page.locator('.sticky-note');
  await expect(page.locator('.learning-map + app-sticky-note .sticky-note')).toBeVisible();
  await expect(page.locator('.learning-map')).toHaveCSS('padding-bottom', '0px');
  const noteEditorLabel = topicNote.locator('label > span');
  const noteEditorRestingTransform = await noteEditorLabel.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await topicNote.locator('textarea').hover();
  await expect
    .poll(() =>
      topicNote.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedNoteLift, 2);
  await expect
    .poll(() => noteEditorLabel.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(noteEditorRestingTransform);
  await topicNote.locator('textarea').focus();
  await expect
    .poll(() => noteEditorLabel.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(noteEditorRestingTransform);
  const groupHeadings = page.locator('.test-group-heading');
  await expect(groupHeadings).toHaveCount(2);
  for (const heading of await groupHeadings.all()) {
    await heading.hover();
    await expect
      .poll(() =>
        heading.evaluate(
          (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
        ),
      )
      .toBeCloseTo(expectedLift, 2);
  }
  await expectClippedPaper(page.locator('.test-card').first());
  expect(
    await page
      .locator('.objective-grid span')
      .first()
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).borderRadius)),
  ).toBeLessThan(4);

  await page.goto(`/study/${TOPIC_SEGMENT}/vowel-families`);
  await expectClippedPaper(page.locator('.choice-list label').first());
  await page.getByRole('radio', { name: 'front vowels' }).check();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.goto(`/stats/${TOPIC_SEGMENT}`);
  await expect(page.locator('main.stats-detail-page')).not.toHaveClass(/narrow-page/);
  expect(
    await page
      .locator('main.stats-detail-page')
      .evaluate((element) => element.getBoundingClientRect().width),
  ).toBeCloseTo(topicPageWidth, 1);
  const statsBackLink = page.getByRole('link', { name: 'All stats' });
  await expect(statsBackLink).toHaveClass(/back-link/);
  await expect(page.locator('.stats-hero .back-link + .eyebrow')).toHaveCSS(
    'margin-top',
    compactHeroGap,
  );
  const statsOverview = page.locator('.stats-overview');
  const heroLayout = await page.locator('.stats-hero').evaluate((hero) => {
    const content = hero.firstElementChild as HTMLElement | null;
    const overview = hero.querySelector('.at-a-glance') as HTMLElement | null;
    return {
      columns: getComputedStyle(hero).gridTemplateColumns.split(' ').length,
      topDelta: Math.abs(
        (content?.getBoundingClientRect().top ?? 0) - (overview?.getBoundingClientRect().top ?? 0),
      ),
    };
  });
  if (heroLayout.columns > 1) {
    expect(heroLayout.topDelta).toBeLessThanOrEqual(2);
  } else {
    expect(heroLayout.topDelta).toBeGreaterThan(0);
  }
  await expect(statsOverview).toHaveClass(/assignment-sheet/);
  await expect(statsOverview.locator(':scope > div')).toHaveCount(5);
  expect(
    await statsOverview.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        borderLeftColor: style.borderLeftColor,
        borderLeftWidth: style.borderLeftWidth,
        clipPath: style.clipPath,
        foldColor: getComputedStyle(element, '::after').borderTopColor,
        tapeColor: getComputedStyle(element, '::before').backgroundColor,
      };
    }),
  ).toEqual(assignmentPattern);
  await statsOverview.hover();
  await expect
    .poll(() =>
      statsOverview.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedLift, 2);
  const statsTopic = vowelHarmonyProgress(page);
  await expect(statsTopic.locator('.stats-table > .stats-section-heading .eyebrow')).toHaveText(
    'Test history',
  );
  await expect(statsTopic.locator('.stats-table > .stats-section-heading h2')).toHaveText(
    'Test results',
  );
  await expect(statsTopic.locator('.stats-table > .stats-section-heading > p')).toHaveCount(1);
  await expect(statsTopic.locator('.table-heading')).toHaveCount(0);
  await expect(statsTopic.locator('.ledger-sheet table')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Learning by skill' })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: /Show studied tests only/ })).toHaveCount(0);
  await expectClippedPaper(statsTopic.locator('.stats-ledger'));
  const firstStatsRow = statsTopic.locator('.stats-row').first();
  const restingRowSurface = await firstStatsRow.locator('th').evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    shadow: getComputedStyle(element).boxShadow,
  }));
  const expectedTextShift = await page.evaluate(
    () => Number.parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.25,
  );
  await firstStatsRow.hover();
  await expect
    .poll(() =>
      firstStatsRow
        .locator('.stats-name > div')
        .evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41),
    )
    .toBeCloseTo(expectedTextShift, 2);
  expect(
    await firstStatsRow.locator('th').evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      shadow: getComputedStyle(element).boxShadow,
    })),
  ).toEqual(restingRowSurface);
  if (await statsTopic.locator('.stats-column-heading').isVisible()) {
    await expect(statsTopic.locator('.stats-column-heading span')).toHaveText([
      'Test',
      'First',
      'Latest',
      'Best',
      'Average',
      'History',
    ]);
    await expectClippedPaper(statsTopic.locator('.stats-column-heading'));
    const ledgerAlignment = await page.evaluate(() => {
      const centers = (selector: string) =>
        [...document.querySelectorAll(selector)].map((element) => {
          const box = element.getBoundingClientRect();
          return (box.left + box.right) / 2;
        });
      const heading = document.querySelector('.stats-column-heading')?.getBoundingClientRect();
      const ledger = document.querySelector('.stats-ledger')?.getBoundingClientRect();
      const headings = centers('.stats-column-heading span:not(:first-child)');
      const values = centers('.stats-row:first-child > td');
      return {
        leftEdgeDelta: Math.abs((heading?.left ?? 0) - (ledger?.left ?? 0)),
        valueDeltas: headings.map((center, index) => Math.abs(center - values[index])),
      };
    });
    expect(ledgerAlignment.leftEdgeDelta).toBeLessThanOrEqual(1);
    expect(Math.max(...ledgerAlignment.valueDeltas)).toBeLessThanOrEqual(3);
  } else {
    await expect(statsTopic.locator('.stats-column-heading')).toBeHidden();
  }
  const mistakeCta = page.locator('.mistake-cta');
  const topicHistory = page.locator('.topic-history');
  await expect(page.locator('.stats-ledger .topic-history')).toHaveCount(1);
  const [testRowColour, topicRowColour] = await Promise.all([
    firstStatsRow.locator('th').evaluate((element) => getComputedStyle(element).backgroundColor),
    topicHistory.evaluate((element) => getComputedStyle(element).backgroundColor),
  ]);
  expect(topicRowColour).not.toBe(testRowColour);
  expect(
    await topicHistory.evaluate(
      (history, mistakeElement) => {
        const following = Node.DOCUMENT_POSITION_FOLLOWING;
        return Boolean(history.compareDocumentPosition(mistakeElement as Node) & following);
      },
      await mistakeCta.elementHandle(),
    ),
  ).toBe(true);
  await expect(mistakeCta).toContainText('Turn errors into patterns');
  await mistakeCta.hover();
  await expect
    .poll(() =>
      mistakeCta.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedLift, 2);

  await page.goto('/stats');
  await expect(page.getByRole('link', { name: 'Back to Notebook' })).toHaveClass(/back-link/);
  const backupArchive = page.locator('.backup-archive');
  await expectClippedPaper(backupArchive);
  const backupPattern = await backupArchive.evaluate((element) => ({
    backgroundImage: getComputedStyle(element).backgroundImage,
    punchedEdge: getComputedStyle(element, '::before').content,
    pageEdge: getComputedStyle(element, '::after').content,
  }));
  expect(backupPattern.backgroundImage).toContain('repeating-linear-gradient');
  expect(backupPattern.punchedEdge).not.toBe('none');
  expect(backupPattern.pageEdge).not.toBe('none');
});

test('restores an unfinished scored session from browser storage', async ({ page }) => {
  await page.goto(`/topics/${TOPIC_SEGMENT}`);
  await page.locator('.test-card').first().getByRole('link', { name: 'Start test' }).click();
  await expect(page.getByRole('button', { name: /Show answer/ })).toBeEnabled();
  await page.keyboard.press('Alt+a');
  await expect(page.locator('.exercise-card .feedback')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show answer' }).click();
  await expect(page.locator('.exercise-card .feedback')).toContainText('Answer revealed');

  await page.reload();

  await expect(page.locator('.exercise-card .feedback')).toContainText('Answer revealed');
  await expect(page.getByRole('button', { name: /Continue/ })).toBeVisible();
});

test('keeps the topic catalog and learning map usable at the 320-pixel minimum width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');

  await expect(page.locator('.topic-card')).toHaveCount(11);
  const primaryNavigation = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(primaryNavigation).toContainText('Notebook');
  await expect(primaryNavigation).toContainText('Stats');
  await expect(primaryNavigation.getByRole('link')).toHaveCount(2);
  await expect(page.locator('.site-header nav')).toHaveCount(0);
  const headerLayout = await page.locator('.header-tools').evaluate((header) => {
    const controls = [...header.querySelectorAll('.appearance-options label')];
    const appearance = header.querySelector('.appearance-switch')?.getBoundingClientRect();
    return {
      controlCount: controls.length,
      flexWrap: getComputedStyle(header).flexWrap,
      switchHeight: appearance?.height ?? 0,
    };
  });
  expect(headerLayout.controlCount).toBe(3);
  expect(headerLayout.flexWrap).toBe('nowrap');
  expect(headerLayout.switchHeight).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  await vowelHarmonyTopicLink(page).click();
  await expect(page.locator('.test-card').first()).toBeVisible();
  await expect(
    page.locator('.test-card').first().getByRole('link', { name: 'Learn first' }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('keeps required content inside clipped surfaces at 320 pixels', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  await page.setViewportSize({ width: 320, height: 900 });

  await page.goto(`/topics/${TOPIC_SEGMENT}`);
  const topicPaper = page.locator('main.topic-page');
  await expectNoInternalHorizontalOverflow(topicPaper);
  await expectHorizontallyInside(topicPaper, page.locator('.topic-hero h1'));
  expect(
    await page
      .locator('.topic-overview')
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ')),
  ).toHaveLength(1);
  const firstTest = page.locator('.test-card').first();
  await expectNoInternalHorizontalOverflow(firstTest);
  const [testNumberBox, testBodyBox] = await Promise.all([
    firstTest.locator('.test-number').boundingBox(),
    firstTest.locator('.test-body').boundingBox(),
  ]);
  expect(testNumberBox).not.toBeNull();
  expect(testBodyBox).not.toBeNull();
  expect(Math.abs(testNumberBox!.y - testBodyBox!.y)).toBeLessThanOrEqual(2);
  for (const content of [
    firstTest.locator('.test-number'),
    firstTest.locator('.test-body'),
    firstTest.locator('.test-actions'),
  ]) {
    await expectHorizontallyInside(firstTest, content);
  }

  await page.goto(`/study/${TOPIC_SEGMENT}/vowel-families`);
  const exercise = page.locator('.exercise-card');
  await expectNoInternalHorizontalOverflow(exercise);
  for (const content of [
    exercise.getByRole('heading', { level: 2 }),
    exercise.locator('.choice-list label').first(),
    exercise.locator('.answer-actions'),
    exercise.locator('.reveal-note'),
  ]) {
    await expectHorizontallyInside(exercise, content);
  }

  await page.goto(`/stats/${TOPIC_SEGMENT}`);
  const overview = page.locator('.stats-overview');
  await expectNoInternalHorizontalOverflow(overview);
  expect(
    await overview.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ')),
  ).toHaveLength(1);
  for (const summary of await overview.locator(':scope > div').all()) {
    await expectHorizontallyInside(overview, summary);
  }

  await page.goto('/stats');
  await expect(page.getByRole('link', { name: 'Back to Notebook' })).toBeVisible();
  const archive = page.locator('.backup-archive');
  await expectNoInternalHorizontalOverflow(archive);
  const firstArchiveRow = archive.locator('.archive-action-row').first();
  await expectNoInternalHorizontalOverflow(firstArchiveRow);
  const [archiveNumberBox, archiveCopyBox] = await Promise.all([
    firstArchiveRow.locator('.archive-number').boundingBox(),
    firstArchiveRow.locator('div').boundingBox(),
  ]);
  expect(archiveNumberBox).not.toBeNull();
  expect(archiveCopyBox).not.toBeNull();
  expect(Math.abs(archiveNumberBox!.y - archiveCopyBox!.y)).toBeLessThanOrEqual(2);
  for (const content of [
    firstArchiveRow.locator('.archive-number'),
    firstArchiveRow.locator('div'),
    firstArchiveRow.locator('.button'),
  ]) {
    await expectHorizontallyInside(firstArchiveRow, content);
  }
});

test('keeps topic stats usable at the 320-pixel minimum width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(`/stats/${TOPIC_SEGMENT}`);

  await expect(
    page.getByRole('heading', { name: 'Vowel harmony and location endings', exact: true }),
  ).toBeVisible();
  const statsTopic = vowelHarmonyProgress(page);
  await expect(statsTopic.getByRole('region', { name: /test results/i })).toBeVisible();
  await expect(page.locator('.stats-hero .back-link + .eyebrow')).toBeVisible();
  await expect(page.locator('.stats-overview')).toBeVisible();
  await expect(statsTopic.locator('.stats-ledger .semantic-ledger-head')).toHaveCSS(
    'clip-path',
    'inset(50%)',
  );
  const firstStatsRow = statsTopic.locator('.stats-row').first();
  await expect(firstStatsRow).toBeVisible();
  await expect(firstStatsRow.locator('td')).toHaveCount(5);
  expect(
    await firstStatsRow.evaluate((element) => getComputedStyle(element).gridTemplateColumns),
  ).toMatch(/\S+\s+\S+/);
  await expect(page.getByRole('checkbox', { name: /Show studied tests only/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Learning by skill' })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('uses a deliberate confirmation sheet for destructive clearing', async ({ page }) => {
  await page.goto('/stats');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Statistics');
  await expect(page.locator('.stats-hero .back-link + .eyebrow')).toBeVisible();
  await expect(page.locator('.cumulative-overview.assignment-sheet')).toBeVisible();
  await expect(page.locator('.stats-hero .notebook-note')).toHaveText('progress, not perfection');
  const heroGeometry = await page.locator('.stats-hero').evaluate((hero) => {
    const copy = hero.querySelector('.stats-hero-copy')!.getBoundingClientRect();
    const summary = hero.querySelector('.cumulative-summary')!.getBoundingClientRect();
    const note = hero.querySelector('.notebook-note')!.getBoundingClientRect();
    const heroBox = hero.getBoundingClientRect();
    return {
      columns: getComputedStyle(hero).gridTemplateColumns.split(' ').length,
      centerDelta: Math.abs(note.left + note.width / 2 - (heroBox.left + heroBox.width / 2)),
      noteTop: note.top,
      contentBottom: Math.max(copy.bottom, summary.bottom),
      summaryLeft: summary.left,
      copyRight: copy.right,
    };
  });
  expect(heroGeometry.centerDelta).toBeLessThanOrEqual(2);
  expect(heroGeometry.noteTop).toBeGreaterThanOrEqual(heroGeometry.contentBottom);
  if (heroGeometry.columns > 1) {
    expect(heroGeometry.summaryLeft).toBeGreaterThan(heroGeometry.copyRight);
  }
  await expect(page.getByRole('region', { name: 'Backup & restore' })).toBeVisible();
  const backupHeading = page.getByRole('heading', { name: 'Backup & restore' });
  const backupArchive = page.locator('.backup-archive');
  await expect(backupArchive.locator('#backup-heading')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Download backup' })).toBeVisible();
  await expect(page.getByLabel('Restore backup')).toHaveAttribute(
    'accept',
    'application/json,.json',
  );
  await expect(page.getByRole('heading', { name: 'Progress by topic' })).toBeVisible();
  await expect(page.locator('.stats-topic-card')).toHaveCount(11);
  await expect(page.locator('.backup-archive .clear-all-action-row')).toBeVisible();
  await expect(page.locator('.clear-all-slip')).toHaveCount(0);
  await expect(page.locator('.settings-card')).toHaveCount(0);
  await expect(page.locator('.danger-zone')).toHaveCount(0);
  const backupPattern = await page.locator('.backup-archive').evaluate((element) => {
    const surface = getComputedStyle(element);
    const punchedEdge = getComputedStyle(element, '::before');
    const pageEdge = getComputedStyle(element, '::after');
    return {
      backgroundImage: surface.backgroundImage,
      clipPath: surface.clipPath,
      filter: surface.filter,
      punchedEdge: punchedEdge.content,
      pageEdge: pageEdge.content,
      pageEdgePosition: pageEdge.position,
      pageEdgeWidth: pageEdge.width,
    };
  });
  expect(backupPattern.backgroundImage).toContain('repeating-linear-gradient');
  expect(backupPattern.clipPath).not.toBe('none');
  expect(backupPattern.filter).not.toBe('none');
  expect(backupPattern.punchedEdge).not.toBe('none');
  expect(backupPattern.pageEdge).not.toBe('none');
  expect(backupPattern.pageEdgePosition).toBe('absolute');
  expect(Number.parseFloat(backupPattern.pageEdgeWidth)).toBeGreaterThan(0);
  const sectionSpacing = await Promise.all([
    backupHeading.boundingBox(),
    backupArchive.boundingBox(),
    page.getByRole('heading', { name: 'Progress by topic' }).boundingBox(),
  ]);
  expect(sectionSpacing.every(Boolean)).toBe(true);
  expect(sectionSpacing[1]!.y).toBeGreaterThan(sectionSpacing[0]!.y + sectionSpacing[0]!.height);
  const archiveToProgressGap =
    sectionSpacing[2]!.y - (sectionSpacing[1]!.y + sectionSpacing[1]!.height);
  expect(archiveToProgressGap).toBeGreaterThanOrEqual(24);
  expect(archiveToProgressGap).toBeLessThanOrEqual(96);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  const clearHistory = backupArchive.getByRole('button', { name: 'Clear all history' });
  await clearHistory.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Every attempt, unfinished session, mistake');
  await expect(dialog.getByRole('button', { name: 'Cancel clearing history' })).toBeFocused();
  await page.mouse.click(1, 1);
  await expect(dialog).toBeHidden();
  await expect(clearHistory).toBeFocused();
  await expect(page.getByRole('status')).toHaveCount(0);

  await clearHistory.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cancel clearing history' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(clearHistory).toBeFocused();
  await expect(page.getByRole('status')).toHaveCount(0);

  await clearHistory.click();
  await dialog.getByRole('button', { name: 'Clear all history' }).click();
  await expect(page.getByRole('status')).toContainText('All learner history was cleared');

  await page.goto(`/stats/${TOPIC_SEGMENT}`);
  await expect(page.getByRole('heading', { name: 'This topic only' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Manage topic history' })).toHaveCount(0);
  const clearTest = page.getByRole('button', { name: 'Clear test history' }).first();
  await clearTest.click();
  await expect(page.getByRole('dialog')).toContainText(
    'All saved attempts and mistakes for this test will be removed.',
  );
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel clearing history' }).click();

  const clearTopic = page.getByRole('button', { name: 'Clear topic history' });
  await clearTopic.click();
  await expect(page.getByRole('dialog')).toContainText(
    'All saved progress and private notes for this topic will be removed.',
  );
  await page.keyboard.press('Escape');
  await expect(clearTopic).toBeFocused();
});

test('remembers an appearance override and can return to automatic', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');

  const automatic = page.getByRole('radio', { name: 'Automatic' });
  const day = page.getByRole('radio', { name: 'Day' });
  const switchBody = page.locator('.appearance-switch');
  await expect(automatic).toBeChecked();
  await expect(switchBody).toHaveClass(/automatic-selected/);
  await expect(page.locator('html')).not.toHaveAttribute('data-appearance');

  await day.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'light');
  await expect(switchBody).toHaveClass(/day-selected/);
  await page.reload();
  await expect(day).toBeChecked();

  await automatic.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).not.toHaveAttribute('data-appearance');
  await expect(switchBody).toHaveClass(/automatic-selected/);
});

test('turns the interactive desk lamp off in Day and makes it radiate in Night', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');

  const lamp = page.getByRole('button', { name: 'Toggle desk lamp between Day and Night' });
  const light = page.locator('.desk-light');
  const bulb = page.locator('.desk-lamp span');
  await expect(lamp).toBeVisible();
  await expect
    .poll(() => light.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)))
    .toBeGreaterThanOrEqual(0.6);
  expect(await bulb.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');

  const lampBox = await lamp.boundingBox();
  expect(lampBox).not.toBeNull();
  const armPoint = {
    x: (lampBox?.x ?? 0) + (lampBox?.width ?? 0) * 0.78,
    y: (lampBox?.y ?? 0) - 24,
  };
  await page.mouse.move(armPoint.x, armPoint.y);
  await expect.poll(() => lamp.evaluate((element) => element.matches(':hover'))).toBe(true);
  await page.mouse.click(armPoint.x, armPoint.y);
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'light');
  await expect
    .poll(() => light.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)))
    .toBe(0);
  await expect
    .poll(() => bulb.evaluate((element) => getComputedStyle(element).boxShadow))
    .toBe('none');

  await expect(lamp).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');
  await expect
    .poll(() => light.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)))
    .toBeGreaterThanOrEqual(0.6);
  expect(await bulb.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');
});

test('layers the faded desk lamp behind the workbook folder at compact widths', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  await page.goto('/');

  await page.setViewportSize({ width: 1754, height: 900 });
  expect(
    await page.locator('.desk-lamp').evaluate((element) => getComputedStyle(element).zIndex),
  ).toBe('4');

  for (const width of [1600, 1440, 1248, 1100, 900, 768, 621]) {
    await page.setViewportSize({ width, height: 900 });
    const layers = await page.evaluate(() => {
      const folder = document.querySelector<HTMLElement>('.workbook-folder')!;
      const lamp = document.querySelector<HTMLElement>('.desk-lamp')!;
      const folderRect = folder.getBoundingClientRect();
      const lampRect = lamp.getBoundingClientRect();
      const overlapLeft = Math.max(folderRect.left, lampRect.left);
      const overlapRight = Math.min(folderRect.right, lampRect.right);
      const overlapTop = Math.max(folderRect.top, lampRect.top);
      const overlapBottom = Math.min(folderRect.bottom, lampRect.bottom);
      const overlaps = overlapRight > overlapLeft && overlapBottom > overlapTop;
      const overlapTarget = overlaps
        ? document.elementFromPoint(
            overlapLeft + (overlapRight - overlapLeft) / 2,
            overlapTop + (overlapBottom - overlapTop) / 2,
          )
        : null;

      return {
        folderCoverDisplay: getComputedStyle(
          document.querySelector<HTMLElement>('.workbook-cover')!,
        ).display,
        lampDisplay: getComputedStyle(lamp).display,
        lampOwnsOverlap: overlapTarget === lamp || lamp.contains(overlapTarget),
        lampOpacity: Number.parseFloat(getComputedStyle(lamp).opacity),
        lampZIndex: getComputedStyle(lamp).zIndex,
        overlaps,
      };
    });

    expect(layers.lampOpacity, `lamp opacity at ${width}px`).toBeLessThanOrEqual(0.22);
    expect(layers.lampZIndex, `lamp layer at ${width}px`).toBe('0');
    if (width < 768) {
      expect(layers.lampDisplay, `lamp visibility at ${width}px`).toBe('none');
      expect(layers.folderCoverDisplay, `folder cover visibility at ${width}px`).toBe('none');
      expect(layers.overlaps, `lamp/folder overlap at ${width}px`).toBe(false);
      continue;
    }
    if (width <= 1440) {
      expect(layers.overlaps, `lamp/folder overlap at ${width}px`).toBe(true);
      expect(layers.lampOwnsOverlap, `top element at lamp/folder overlap at ${width}px`).toBe(
        false,
      );
    }
  }
});

test('keeps the workbook world immediate when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const animationDurationMs = await page.locator('.desk-light').evaluate((element) => {
    const style = getComputedStyle(element);
    const duration = Number.parseFloat(style.animationDuration);
    return style.animationDuration.endsWith('ms') ? duration : duration * 1000;
  });
  expect(animationDurationMs).toBeLessThanOrEqual(1);
  const brand = page.locator('.brand');
  const brandMark = brand.locator('.brand-mark');
  const brandMarkRestingTransform = await brandMark.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await brand.hover();
  await expect
    .poll(() => brandMark.evaluate((element) => getComputedStyle(element).transform))
    .toBe(brandMarkRestingTransform);
  await page.locator('.catalog-stats').hover();
  await expect
    .poll(() =>
      page.locator('.catalog-stats').evaluate((element) => getComputedStyle(element).transform),
    )
    .toBe('none');

  await vowelHarmonyTopicLink(page).click();
  await expect(page.getByRole('heading', { name: 'Lessons and tests' })).toBeVisible();
  for (const surface of [
    page.locator('.objective-panel'),
    page.locator('.sticky-note'),
    page.locator('.test-group-heading').first(),
  ]) {
    await surface.hover();
    await expect
      .poll(() => surface.evaluate((element) => getComputedStyle(element).transform))
      .toBe('none');
  }
  const noteEditorLabel = page.locator('.sticky-note label > span');
  await page.locator('.sticky-note textarea').hover();
  await expect
    .poll(() => noteEditorLabel.evaluate((element) => getComputedStyle(element).transform))
    .toBe('none');

  await page.goto('/stats');
  for (const surface of [
    page.locator('.backup-archive'),
    page.locator('.stats-topic-card').first(),
  ]) {
    await surface.hover();
    await expect
      .poll(() => surface.evaluate((element) => getComputedStyle(element).transform))
      .toBe('none');
  }

  await page.goto(`/stats/${TOPIC_SEGMENT}`);
  const statsName = page.locator('.stats-row').first().locator('.stats-name > div');
  await page.locator('.stats-row').first().hover();
  await expect
    .poll(() => statsName.evaluate((element) => getComputedStyle(element).transform))
    .toBe('none');
});

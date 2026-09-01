import { expect, type Locator, test } from '@playwright/test';

const TOPIC_SEGMENT = 'vowel-harmony-kpt-tplural';

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

test('wraps the unchanged paper in a compact clipped folder', async ({ page }) => {
  await page.goto('/');

  const cover = page.locator('.workbook-cover');
  const paper = page.locator('.page-shell');
  const navigation = page.locator('.workbook-folder-tabs');
  const tabs = page.locator('.workbook-folder-tab');
  const clip = page.locator('.workbook-page-clip');

  await expect(cover).toBeVisible();
  await expect(paper).toBeVisible();
  await expect(page.locator('.site-header nav')).toHaveCount(0);
  await expect(navigation).toBeVisible();
  await expect(tabs).toHaveCount(3);
  await expect(tabs).toHaveText(['Topics', 'Reports', 'Data & backup']);
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
  expect(tabColors).toEqual(['rgb(90, 155, 213)', 'rgb(244, 239, 229)', 'rgb(224, 185, 41)']);
  expect(clipBox?.x ?? 0).toBeGreaterThan((paperBox?.x ?? 0) + (paperBox?.width ?? 0) - 40);
  expect(clipBox?.width ?? 0).toBeGreaterThanOrEqual(viewportWidth <= 560 ? 22 : 34);
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

test('keeps the folder margin fixed between responsive breakpoints', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  await page.goto('/');

  for (const width of [320, 560, 768, 901, 1000, 1100, 1248, 1440, 1754]) {
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
  await expect(page.locator('.topic-card')).toHaveCount(1);
  await expect(page.locator('.test-card')).toHaveCount(0);
  await page.getByRole('link', { name: 'Open topic' }).click();

  await expect(page).toHaveURL(new RegExp(`/topics/${TOPIC_SEGMENT}$`));
  await expect(page.locator('.test-card')).toHaveCount(14);
  await expect(page.locator('.test-group-heading h3')).toHaveText(['Focused tests', 'Reviews']);
  await expect(page.locator('.set-badge, .stage-badge')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('Core set');
  await expect(page.locator('body')).not.toContainText('Extended set');
  await expect(
    page.locator('.test-card').first().getByRole('link', { name: 'Learn first' }),
  ).toHaveAttribute('href', new RegExp(`/learn/${TOPIC_SEGMENT}/`));
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toContainText(
    'Topics',
  );
  await expect(page.locator('.tab-number')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Appearance' })).toBeVisible();
  await expect(page.getByText('Desk light', { exact: true })).toHaveCount(0);
  await expect(page.locator('.appearance-options label')).toHaveText([/Day/, /Automatic/, /Night/]);
  await expect(page.locator('.appearance-toggle-hardware')).toBeVisible();
  await expect(page.locator('.appearance-choice-icon')).toHaveCount(3);

  await page.goto(`/learn/${TOPIC_SEGMENT}/kpt-nouns`);
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

  await page.goto(`/learn/${TOPIC_SEGMENT}/foundations-review`);
  await expect(page.locator('.lesson-list button')).toHaveCount(13);
  await expect(page.locator('.lesson-hero .eyebrow')).toContainText('Review');
  await expect(page.locator('.lesson-hero h1')).toHaveText('Foundations review');

  if ((page.viewportSize()?.width ?? 0) <= 800) {
    await expect(page.locator('.lesson-list')).toBeHidden();
    await expect(page.locator('.lesson-picker')).toBeVisible();
    await expect(page.locator('.lesson-picker option')).toHaveCount(13);
    await page.locator('.lesson-picker select').selectOption('1');
    await expect(page.locator('.reader-heading h2')).toContainText('Saying “in”');

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
  await page.getByRole('link', { name: 'Open topic' }).click();

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
    const columnCount = await page.locator('.topic-grid').evaluate(
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
      expect(cardSurface.backgroundImage).toContain('repeating-linear-gradient');
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

test('matches the topic-card background to the worked-examples surface', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');
  await page.goto('/');
  const topicBackground = await page
    .locator('.topic-card')
    .first()
    .evaluate((element) => {
      const styles = getComputedStyle(element);
      return { color: styles.backgroundColor, image: styles.backgroundImage };
    });

  await page.goto(`/learn/${TOPIC_SEGMENT}/vowel-families`);
  const examplesBackground = await page.locator('.worked-examples').evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.backgroundColor, image: styles.backgroundImage };
  });

  expect(topicBackground).toEqual(examplesBackground);
});

test('sizes cut-paper actions to their labels across app routes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-wide');

  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });

    await page.goto('/');
    await expectLabelSizedAction(page.getByRole('link', { name: 'Open topic' }));

    await page.goto(`/learn/${TOPIC_SEGMENT}/vowel-families`);
    await expectLabelSizedAction(page.getByRole('link', { name: 'Start test now' }));

    await page.goto(`/study/${TOPIC_SEGMENT}/vowel-families`);
    await expectLabelSizedAction(page.getByRole('button', { name: 'Check answer' }));
    await expectLabelSizedAction(page.getByRole('button', { name: /Show answer/ }));

    await page.goto('/data');
    await expectLabelSizedAction(page.getByRole('button', { name: 'Download backup' }));
    await expectLabelSizedAction(page.locator('.file-button'));
    const clearAll = page.getByRole('button', { name: 'Clear all history' });
    await expectLabelSizedAction(clearAll);
    await clearAll.click();
    await expectLabelSizedAction(page.getByRole('button', { name: 'Keep my history' }));
    await page.getByRole('button', { name: 'Keep my history' }).click();

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

    await page.goto('/data');
    await expectActionGroupPlacement(page.locator('.archive-action-row').first(), 'end');
    await page.getByRole('button', { name: 'Clear all history' }).click();
    await expectActionGroupPlacement(page.locator('.confirmation-actions'), 'end');
    await page.getByRole('button', { name: 'Keep my history' }).click();

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

  await page.goto(`/study/${TOPIC_SEGMENT}/plural-in-sentences`);
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

  await page.goto(`/study/${TOPIC_SEGMENT}/foundations-review`);

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
  await page.getByRole('link', { name: 'Open topic' }).click();
  await expect(page.getByRole('textbox', { name: 'Topic note' })).toHaveValue(
    'Practise front-vowel endings tomorrow.',
  );
});

test('uses dedicated notebook objects for repeated surfaces and return links', async ({ page }) => {
  await page.goto('/');
  const continueCard = page.locator('.continue-card');
  const topicCard = page.locator('.topic-card').first();
  await expectClippedPaper(continueCard);
  await expectClippedPaper(topicCard);
  await expect(continueCard).toHaveClass(/assignment-sheet/);

  const [continueColor, topicColor] = await Promise.all([
    continueCard.evaluate((element) => getComputedStyle(element).backgroundColor),
    topicCard.evaluate((element) => getComputedStyle(element).backgroundColor),
  ]);
  expect(topicColor).toBe(continueColor);
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
  const expectedCoverLift = rootFontSize * -0.35;
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
    .toBeCloseTo(expectedCoverLift, 2);

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
  await expect(page.locator('.topic-hero .back-link + .eyebrow')).toHaveCSS('margin-top', '20px');
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

  await page.goto('/reports');
  await expect(page.locator('main.reports-page')).not.toHaveClass(/narrow-page/);
  expect(
    await page
      .locator('main.reports-page')
      .evaluate((element) => element.getBoundingClientRect().width),
  ).toBeCloseTo(topicPageWidth, 1);
  const reportBackLink = page.getByRole('link', { name: /Back to topics/ });
  await expect(reportBackLink).toHaveClass(/back-link/);
  await expect(page.locator('.reports-hero .back-link + .eyebrow')).toHaveCSS('margin-top', '20px');
  const reportOverview = page.locator('.report-overview');
  const heroTopDelta = await page.locator('.reports-hero').evaluate((hero) => {
    const content = hero.firstElementChild as HTMLElement | null;
    const overview = hero.querySelector('.report-overview') as HTMLElement | null;
    return Math.abs((content?.offsetTop ?? 0) - (overview?.offsetTop ?? 0));
  });
  if ((page.viewportSize()?.width ?? 0) > 800) {
    expect(heroTopDelta).toBeLessThanOrEqual(1);
  } else {
    expect(heroTopDelta).toBeGreaterThan(0);
  }
  await expect(reportOverview).toHaveClass(/assignment-sheet/);
  await expect(reportOverview.locator(':scope > div')).toHaveCount(5);
  expect(
    await reportOverview.evaluate((element) => {
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
  await reportOverview.hover();
  await expect
    .poll(() =>
      reportOverview.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedLift, 2);
  const reportTopicSheet = page.locator('.report-topic-sheet');
  await expectClippedPaper(reportTopicSheet);
  expect(
    await reportTopicSheet.evaluate(
      (element) => getComputedStyle(element).backgroundImage.match(/linear-gradient/g)?.length ?? 0,
    ),
  ).toBe(2);
  await reportTopicSheet.hover();
  await expect
    .poll(() =>
      reportTopicSheet.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedLift, 2);
  await expect(page.locator('.report-table > .report-section-heading .eyebrow')).toHaveText(
    'Test history',
  );
  await expect(page.locator('.report-table > .report-section-heading h3')).toHaveText(
    'Results by test',
  );
  await expect(page.locator('.report-table > .report-section-heading > p')).toHaveCount(0);
  await expect(page.locator('.table-heading')).toHaveCount(0);
  await expect(page.locator('.ledger-sheet table')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Learning by skill' })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: /Show studied tests only/ })).toHaveCount(0);
  await expectClippedPaper(page.locator('.report-ledger'));
  const firstReportRow = page.locator('.report-row').first();
  const restingRowSurface = await firstReportRow.locator('th').evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    shadow: getComputedStyle(element).boxShadow,
  }));
  const expectedTextShift = await page.evaluate(
    () => Number.parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.25,
  );
  await firstReportRow.hover();
  await expect
    .poll(() =>
      firstReportRow
        .locator('.report-name > div')
        .evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41),
    )
    .toBeCloseTo(expectedTextShift, 2);
  expect(
    await firstReportRow.locator('th').evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      shadow: getComputedStyle(element).boxShadow,
    })),
  ).toEqual(restingRowSurface);
  if ((page.viewportSize()?.width ?? 0) > 650) {
    await expect(page.locator('.report-column-heading span')).toHaveText([
      'Test',
      'First',
      'Latest',
      'Best',
      'Average',
    ]);
    await expectClippedPaper(page.locator('.report-column-heading'));
    const ledgerAlignment = await page.evaluate(() => {
      const centers = (selector: string) =>
        [...document.querySelectorAll(selector)].map((element) => {
          const box = element.getBoundingClientRect();
          return (box.left + box.right) / 2;
        });
      const heading = document.querySelector('.report-column-heading')?.getBoundingClientRect();
      const ledger = document.querySelector('.report-ledger')?.getBoundingClientRect();
      const headings = centers('.report-column-heading span:not(:first-child)');
      const values = centers('.report-row:first-child > td');
      return {
        leftEdgeDelta: Math.abs((heading?.left ?? 0) - (ledger?.left ?? 0)),
        valueDeltas: headings.map((center, index) => Math.abs(center - values[index])),
      };
    });
    expect(ledgerAlignment.leftEdgeDelta).toBeLessThanOrEqual(1);
    expect(Math.max(...ledgerAlignment.valueDeltas)).toBeLessThanOrEqual(2);
  } else {
    await expect(page.locator('.report-column-heading')).toBeHidden();
  }
  const mistakeCta = page.locator('.mistake-cta');
  await expect(mistakeCta).toContainText('Turn errors into patterns');
  await mistakeCta.hover();
  await expect
    .poll(() =>
      mistakeCta.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedLift, 2);

  await page.goto('/data');
  await expect(page.getByRole('link', { name: /Back to topics/ })).toHaveClass(/back-link/);
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

  await expect(page.locator('.topic-card')).toHaveCount(1);
  const primaryNavigation = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(primaryNavigation).toContainText('Data');
  await expect(primaryNavigation.getByRole('link')).toHaveCount(3);
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

  await page.getByRole('link', { name: 'Open topic' }).click();
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

  await page.goto('/reports');
  const overview = page.locator('.report-overview');
  await expectNoInternalHorizontalOverflow(overview);
  expect(
    await overview.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ')),
  ).toHaveLength(1);
  for (const summary of await overview.locator(':scope > div').all()) {
    await expectHorizontallyInside(overview, summary);
  }

  await page.goto('/data');
  await expect(page.getByRole('link', { name: 'Back to topics' })).toBeVisible();
  const dataOverview = page.locator('.data-overview');
  expect(
    await dataOverview.evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(' '),
    ),
  ).toHaveLength(1);
  await expectNoInternalHorizontalOverflow(dataOverview);
  const archive = page.locator('.backup-archive');
  await expectNoInternalHorizontalOverflow(archive);
  const firstArchiveRow = archive.locator('.archive-action-row').first();
  await expectNoInternalHorizontalOverflow(firstArchiveRow);
  for (const content of [
    firstArchiveRow.locator('.archive-number'),
    firstArchiveRow.locator('div'),
    firstArchiveRow.locator('.button'),
  ]) {
    await expectHorizontallyInside(firstArchiveRow, content);
  }
});

test('keeps reports usable at the 320-pixel minimum width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/reports');

  await expect(page.getByRole('heading', { name: 'Reports', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: /results by test/i })).toBeVisible();
  await expect(page.locator('.reports-hero .back-link + .eyebrow')).toBeVisible();
  await expect(page.locator('.report-overview')).toBeVisible();
  await expect(page.locator('.report-ledger .semantic-ledger-head')).toHaveCSS(
    'clip-path',
    'inset(50%)',
  );
  const firstReportRow = page.locator('.report-row').first();
  await expect(firstReportRow).toBeVisible();
  await expect(firstReportRow.locator('td')).toHaveCount(4);
  expect(
    await firstReportRow.evaluate((element) => getComputedStyle(element).gridTemplateColumns),
  ).toMatch(/\S+\s+\S+/);
  await expect(page.getByRole('checkbox', { name: /Show studied tests only/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Learning by skill' })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('uses a deliberate confirmation sheet for destructive clearing', async ({ page }) => {
  await page.goto('/data');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Data & backup');
  await expect(page.locator('.data-hero .back-link + .eyebrow')).toBeVisible();
  await expect(page.locator('.data-overview.assignment-sheet')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Backup and restore' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download backup' })).toBeVisible();
  await expect(page.getByLabel('Restore backup')).toHaveAttribute(
    'accept',
    'application/json,.json',
  );
  await expect(page.getByRole('heading', { name: 'Choose what to clear' })).toBeVisible();
  await expect(page.locator('.topic-file-label').first()).toBeVisible();
  await expect(page.locator('.clear-ledger').first()).toBeVisible();
  await expect(page.locator('.backup-archive .clear-all-action-row')).toBeVisible();
  await expect(page.locator('.clear-all-slip')).toHaveCount(0);
  await expect(page.locator('.settings-card')).toHaveCount(0);
  await expect(page.locator('.danger-zone')).toHaveCount(0);

  const viewportWidth = page.viewportSize()?.width ?? 0;
  if (viewportWidth > 800) {
    const heroAlignment = await page.locator('.data-hero').evaluate((element) => {
      const copy = element.querySelector('.data-hero-copy')?.getBoundingClientRect();
      const overview = element.querySelector('.data-overview')?.getBoundingClientRect();
      return Math.abs((copy?.top ?? 0) - (overview?.top ?? 0));
    });
    expect(heroAlignment).toBeLessThanOrEqual(2);
  }

  if (viewportWidth > 650) {
    const archiveGrid = await page
      .locator('.topic-archive')
      .first()
      .evaluate((element) => {
        const heading = element.querySelector('.clear-ledger-heading');
        const row = element.querySelector('.clear-row');
        return {
          heading: heading ? getComputedStyle(heading).gridTemplateColumns : '',
          row: row ? getComputedStyle(row).gridTemplateColumns : '',
        };
      });
    expect(archiveGrid.heading).toBe(archiveGrid.row);
  }

  const firstRow = page.locator('.clear-row').first();
  const rowBefore = await firstRow.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      shadow: style.boxShadow,
      copyTransform: getComputedStyle(element.querySelector('.clear-row-copy')!).transform,
    };
  });
  await firstRow.hover();
  await expect
    .poll(() =>
      firstRow.evaluate(
        (element) => getComputedStyle(element.querySelector('.clear-row-copy')!).transform,
      ),
    )
    .not.toBe(rowBefore.copyTransform);
  const rowAfter = await firstRow.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, shadow: style.boxShadow };
  });
  expect(rowAfter).toEqual({
    background: rowBefore.background,
    shadow: rowBefore.shadow,
  });

  const topicClearStrip = page.locator('.topic-clear-strip').first();
  const topicClearCopy = topicClearStrip.locator(':scope > div');
  const topicClearRestingTransform = await topicClearCopy.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await topicClearStrip.getByRole('button', { name: 'Clear this topic' }).hover();
  await expect
    .poll(() => topicClearCopy.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(topicClearRestingTransform);
  await topicClearStrip.getByRole('button', { name: 'Clear this topic' }).focus();
  await expect
    .poll(() => topicClearCopy.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(topicClearRestingTransform);

  const dataHeaderStyle = await page
    .locator('.clear-ledger-heading')
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element);
      const spine = getComputedStyle(element, '::before');
      return {
        background: style.backgroundColor,
        clipPath: style.clipPath,
        height: element.getBoundingClientRect().height,
        paddingTop: style.paddingTop,
        spineBackground: spine.backgroundColor,
        spineWidth: spine.width,
      };
    });
  const backupEdge = await page.locator('.backup-archive').evaluate((element) => {
    const edge = getComputedStyle(element, '::after');
    return {
      content: edge.content,
      position: edge.position,
      width: edge.width,
    };
  });
  expect(backupEdge.content).not.toBe('none');
  expect(backupEdge.position).toBe('absolute');
  expect(Number.parseFloat(backupEdge.width)).toBeGreaterThan(0);

  const pageWidth = (await page.locator('main.data-page').boundingBox())?.width ?? 0;
  await page.goto('/reports');
  const reportsWidth = (await page.locator('main.reports-page').boundingBox())?.width ?? 0;
  expect(Math.abs(pageWidth - reportsWidth)).toBeLessThanOrEqual(1);
  const reportHeaderStyle = await page
    .locator('.ledger-column-heading')
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element);
      const spine = getComputedStyle(element, '::before');
      return {
        background: style.backgroundColor,
        clipPath: style.clipPath,
        height: element.getBoundingClientRect().height,
        paddingTop: style.paddingTop,
        spineBackground: spine.backgroundColor,
        spineWidth: spine.width,
      };
    });
  expect(dataHeaderStyle).toEqual(reportHeaderStyle);
  await page.goto('/data');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  const clearHistory = page.getByRole('button', { name: 'Clear all history' });
  await clearHistory.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Every attempt, unfinished session, mistake');
  await expect(dialog.getByRole('button', { name: 'Keep my history' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(clearHistory).toBeFocused();
  await expect(page.getByRole('status')).toHaveCount(0);

  await clearHistory.click();
  await dialog.getByRole('button', { name: 'Clear all history' }).click();
  await expect(page.getByRole('status')).toContainText('All learner history was cleared');
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
        lampOwnsOverlap: overlapTarget === lamp || lamp.contains(overlapTarget),
        lampOpacity: Number.parseFloat(getComputedStyle(lamp).opacity),
        lampZIndex: getComputedStyle(lamp).zIndex,
        overlaps,
      };
    });

    expect(layers.lampOpacity, `lamp opacity at ${width}px`).toBeLessThanOrEqual(0.22);
    expect(layers.lampZIndex, `lamp layer at ${width}px`).toBe('0');
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

  await page.getByRole('link', { name: 'Open topic' }).click();
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

  await page.goto('/data');
  for (const surface of [
    page.locator('.data-overview'),
    page.locator('.backup-archive'),
    page.locator('.topic-file-label').first(),
  ]) {
    await surface.hover();
    await expect
      .poll(() => surface.evaluate((element) => getComputedStyle(element).transform))
      .toBe('none');
  }
  const topicClearStrip = page.locator('.topic-clear-strip').first();
  const topicClearCopy = topicClearStrip.locator(':scope > div');
  await topicClearStrip.getByRole('button', { name: 'Clear this topic' }).hover();
  await expect
    .poll(() => topicClearCopy.evaluate((element) => getComputedStyle(element).transform))
    .toBe('none');
});

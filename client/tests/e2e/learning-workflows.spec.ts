import { expect, type Locator, test } from '@playwright/test';

async function expectClippedPaper(locator: Locator) {
  await expect(locator).toBeVisible();
  expect(await locator.evaluate((element) => getComputedStyle(element).clipPath)).not.toBe('none');
}

test('opens the catalog and exposes stable learning routes', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Take one clear step');
  await expect(page.locator('.topic-card')).toHaveCount(1);
  await expect(page.locator('.test-card')).toHaveCount(0);
  await page.getByRole('link', { name: 'Open topic' }).click();

  await expect(page).toHaveURL(/\/topics\/finnish-foundations-a1$/);
  await expect(page.locator('.test-card')).toHaveCount(15);
  await expect(page.locator('.test-group-heading h3')).toHaveText(['Focused tests', 'Reviews']);
  await expect(page.locator('.set-badge, .stage-badge')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('Core set');
  await expect(page.locator('body')).not.toContainText('Extended set');
  await expect(
    page.locator('.test-card').first().getByRole('link', { name: 'Learn first' }),
  ).toHaveAttribute('href', /\/learn\/finnish-foundations-a1\//);
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toContainText(
    'Topics',
  );
  await expect(page.locator('.tab-number')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Appearance' })).toBeVisible();
  await expect(page.getByText('Desk light', { exact: true })).toHaveCount(0);
  await expect(page.locator('.appearance-options label')).toHaveText([/Day/, /Automatic/, /Night/]);
  await expect(page.locator('.appearance-toggle-hardware')).toBeVisible();
  await expect(page.locator('.appearance-choice-icon')).toHaveCount(3);

  await page.goto('/learn/finnish-foundations-a1/kpt-nouns');
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
    ).toBeLessThan(2);
  }

  await page.goto('/learn/finnish-foundations-a1/guided-review');
  await expect(page.locator('.lesson-list button')).toHaveCount(13);
  await expect(page.locator('.lesson-hero .eyebrow')).toContainText('Review');
  await expect(page.locator('.lesson-hero h1')).toHaveText('Foundations checkpoint review');

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

test('keeps optional lesson practice separate from scored progress', async ({ page }) => {
  await page.goto('/topics/finnish-foundations-a1');
  await page.locator('.test-card').first().getByRole('link', { name: 'Learn first' }).click();

  await expect(page.getByRole('heading', { name: 'Vowel families' })).toBeVisible();
  await page.getByRole('button', { name: 'Start optional practice' }).click();
  await page.getByRole('button', { name: /Show answer/ }).click();

  await expect(page.locator('.lesson-practice .feedback')).toContainText('Answer revealed');
  await expect(page.locator('.lesson-practice .feedback')).toContainText(
    'Nothing was added to your test history or mistakes',
  );
});

test('keeps stationery exercise controls native and keyboard usable', async ({ page }) => {
  await page.goto('/study/finnish-foundations-a1/vowel-families');

  const firstChoice = page.getByRole('radio', { name: 'back vowels' });
  await firstChoice.check();
  await expect(firstChoice).toBeChecked();
  await expect(
    page.getByRole('progressbar', { name: 'Exercises completed in this session' }),
  ).toBeVisible();
  await expect(page.locator('.progress-ruler')).toBeVisible();
  await expect(page.locator('.progress-pencil')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Check answer' })).toBeEnabled();

  await page.goto('/study/finnish-foundations-a1/harmony-in-forms');
  const answer = page.getByRole('textbox', { name: 'Your answer' });
  await answer.fill('talossa');
  await expect(answer).toHaveValue('talossa');
  await page.getByRole('button', { name: 'Erase answer' }).click();
  await expect(answer).toHaveValue('');

  await page.goto('/study/finnish-foundations-a1/plural-in-sentences');
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
  await page.goto('/study/finnish-foundations-a1/vowel-families');

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

  await page.goto('/study/finnish-foundations-a1/guided-review');

  const reviewTarget = page.getByRole('complementary', { name: 'Test learning focus' });
  await expect(reviewTarget.getByRole('heading', { level: 2 })).toContainText('Skills reviewed:');
  await expect(reviewTarget).toContainText('Practise these earlier skills together.');
  await expect(reviewTarget).not.toContainText('this important grammar point separately');
});

test('saves a private sticky note without leaving the workbook', async ({ page }) => {
  await page.goto('/topics/finnish-foundations-a1');

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
  const expectedLift = await page.evaluate(
    () => Number.parseFloat(getComputedStyle(document.documentElement).fontSize) * -0.45,
  );
  await continueCard.hover();
  await expect
    .poll(() =>
      continueCard.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedLift, 2);

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
    .toBeCloseTo(expectedLift, 2);

  await topicCard.hover();
  await expect
    .poll(() =>
      topicCard.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedLift, 2);

  const catalogStats = page.locator('.catalog-stats');
  const expectedStatsLift = await page.evaluate(
    () => Number.parseFloat(getComputedStyle(document.documentElement).fontSize) * -0.35,
  );
  await catalogStats.hover();
  await expect
    .poll(() =>
      catalogStats.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedStatsLift, 2);

  await page.goto('/topics/finnish-foundations-a1');
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
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedLift, 2);
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
    .toBeCloseTo(expectedLift, 2);

  const topicNote = page.locator('.sticky-note');
  await expect(page.locator('.learning-map + app-sticky-note .sticky-note')).toBeVisible();
  await expect(page.locator('.learning-map')).toHaveCSS('padding-bottom', '0px');
  await topicNote.hover();
  await expect
    .poll(() =>
      topicNote.evaluate(
        (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeCloseTo(expectedLift, 2);
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

  await page.goto('/study/finnish-foundations-a1/vowel-families');
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
  await page.goto('/topics/finnish-foundations-a1');
  await page.locator('.test-card').first().getByRole('link', { name: 'Start test' }).click();
  await expect(page.getByRole('button', { name: /Show answer/ })).toBeEnabled();
  await page.keyboard.press('Alt+a');
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
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toContainText('Data');
  const headerLayout = await page.locator('.header-tools').evaluate((header) => {
    const controls = [...header.querySelectorAll('nav a, .appearance-options label')];
    const navigation = header.querySelector('nav')?.getBoundingClientRect();
    const appearance = header.querySelector('.appearance-switch')?.getBoundingClientRect();
    return {
      controlCount: controls.length,
      groupCenterSpread: Math.abs(
        ((appearance?.top ?? 0) + (appearance?.bottom ?? 0)) / 2 -
          ((navigation?.top ?? 0) + (navigation?.bottom ?? 0)) / 2,
      ),
      flexWrap: getComputedStyle(header).flexWrap,
      groupGap: (appearance?.left ?? 0) - (navigation?.right ?? 0),
      navigationHeight: navigation?.height ?? 0,
      switchHeight: appearance?.height ?? 0,
    };
  });
  expect(headerLayout.controlCount).toBe(6);
  expect(headerLayout.groupCenterSpread).toBeLessThan(2);
  expect(headerLayout.flexWrap).toBe('nowrap');
  expect(headerLayout.groupGap).toBeGreaterThanOrEqual(8);
  expect(headerLayout.switchHeight).toBeLessThanOrEqual(headerLayout.navigationHeight);
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

test('keeps the workbook world immediate when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const animationDurationMs = await page.locator('.desk-light').evaluate((element) => {
    const style = getComputedStyle(element);
    const duration = Number.parseFloat(style.animationDuration);
    return style.animationDuration.endsWith('ms') ? duration : duration * 1000;
  });
  expect(animationDurationMs).toBeLessThanOrEqual(1);
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
});

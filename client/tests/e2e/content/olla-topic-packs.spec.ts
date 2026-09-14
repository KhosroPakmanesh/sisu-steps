import { expect, test } from '@playwright/test';

const packs = [
  {
    id: 'personal-pronouns-affirmative-olla',
    title: 'Personal pronouns and affirmative olla',
    tests: 9,
    focused: 7,
    reviews: 2,
    exercises: 242,
  },
  {
    id: 'negative-olla-statements',
    title: 'Negative olla statements',
    tests: 4,
    focused: 3,
    reviews: 1,
    exercises: 100,
  },
  {
    id: 'olla-questions-short-answers',
    title: 'Olla questions and short answers',
    tests: 7,
    focused: 5,
    reviews: 2,
    exercises: 178,
  },
];

test('opens each smaller pronoun and olla topic pack without reducing the content', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('.topic-card')).toHaveCount(11);
  await expect(page.locator('.catalog-stats')).toContainText('1722');

  for (const pack of packs) {
    const topicCard = page.locator('.topic-card').filter({
      has: page.locator(`a[href="/topics/${pack.id}"]`),
    });
    await expect(topicCard.locator('.card-kicker')).toHaveCount(0);
    await topicCard.getByRole('link', { name: 'Open topic' }).click();

    await expect(page).toHaveURL(`/topics/${pack.id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(pack.title);
    await expect(page.locator('.topic-hero .eyebrow')).toContainText(`${pack.tests} tests`);
    await expect(page.locator('.topic-overview')).toContainText(String(pack.exercises));
    await expect(page.locator('.test-card')).toHaveCount(pack.tests);
    await expect(page.locator('.test-card:not(.review-test)')).toHaveCount(pack.focused);
    await expect(page.locator('.review-test')).toHaveCount(pack.reviews);
    await expect(page.getByRole('heading', { name: 'Focused tests' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.goto('/');
  }
});

test('labels the shared level range everywhere pack metadata appears', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.topic-grid > .card-kicker')).toHaveText('Level: 0 - A1.3');
  await expect(page.locator('.topic-card .card-kicker')).toHaveCount(0);

  for (const pack of packs) {
    await page.goto(`/topics/${pack.id}`);
    await expect(page.locator('.topic-hero .eyebrow')).toContainText('Level: 0 - A1.3');
  }

  await page.goto('/stats');
  await expect(page.locator('.topic-grid > .card-kicker')).toHaveText('Level: 0 - A1.3');
  await expect(page.locator('.stats-topic-card .card-kicker')).toHaveCount(0);

  for (const pack of packs) {
    await page.goto(`/stats/${pack.id}`);
    await expect(page.locator('.stats-hero .eyebrow')).toContainText('Level: 0 - A1.3');
  }
});

test('opens an affirmative Focused lesson and its fixed 24-question test', async ({ page }) => {
  const topic = packs[0].id;
  await page.goto(`/topics/${topic}`);
  const firstTest = page.locator('.test-card').first();
  await expect(firstTest.getByRole('heading')).toHaveText('Singular personal pronouns');
  await firstTest.getByRole('link', { name: 'Learn first' }).click();

  await expect(page.locator('.lesson-hero h1')).toHaveText('Singular personal pronouns');
  await expect(page.locator('.lesson-reader')).toContainText('minä = I');
  await expect(page.locator('.lesson-practice')).toContainText('4 practice questions');
  await expect(page.locator('.lesson-list')).toHaveCount(0);
  const vocabulary = page.locator('.lesson-vocabulary');
  await expect(vocabulary.locator('.vocabulary-group')).toHaveCount(3);
  await expect(vocabulary.getByRole('heading', { name: 'New words' })).toBeVisible();
  await expect(vocabulary.getByRole('heading', { name: 'Used again' })).toBeVisible();
  await expect(vocabulary.getByRole('heading', { name: 'Supplied in examples' })).toBeVisible();

  await page.goto(`/study/${topic}/ppo-singular-pronouns-test`);
  await expect(page.locator('.question-count')).toHaveText('1 / 24');
  await expect(page.locator('.exercise-card h2')).toContainText('Finnish subject pronoun');
  await page.getByRole('button', { name: 'Show answer' }).click();
  await expect(page.locator('.feedback')).toContainText('minä');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('shows new, reused, and supplied lesson vocabulary separately', async ({ page }) => {
  await page.goto(`/topics/${packs[0].id}`);
  const pluralAffirmative = page.locator('.test-card').filter({
    has: page.getByRole('heading', { name: 'Plural affirmative olla', exact: true }),
  });
  await pluralAffirmative.getByRole('link', { name: 'Learn first' }).click();

  const affirmativeVocabulary = page.locator('.lesson-vocabulary');
  await expect(affirmativeVocabulary.getByRole('heading', { name: 'New words' })).toBeVisible();
  await expect(affirmativeVocabulary.getByRole('heading', { name: 'Used again' })).toBeVisible();
  await expect(affirmativeVocabulary).toContainText('Suomessa');
  await expect(affirmativeVocabulary).toContainText('in Finland');
  await expect(affirmativeVocabulary).toContainText('koulussa');
  await expect(affirmativeVocabulary).toContainText('at school');
  await expect(affirmativeVocabulary).toContainText('myöhässä');
  await expect(affirmativeVocabulary).toContainText('late');

  await page.goto(`/topics/${packs[2].id}`);
  const pluralQuestion = page.locator('.test-card').filter({
    has: page.getByRole('heading', { name: 'Plural affirmative yes/no questions', exact: true }),
  });
  await pluralQuestion.getByRole('link', { name: 'Learn first' }).click();

  const questionVocabulary = page.locator('.lesson-vocabulary');
  const questionNewWords = questionVocabulary
    .locator('.vocabulary-group')
    .filter({ hasText: 'New words' });
  const questionReusedWords = questionVocabulary
    .locator('.vocabulary-group')
    .filter({ hasText: 'Used again' });
  const questionSuppliedWords = questionVocabulary
    .locator('.vocabulary-group')
    .filter({ hasText: 'Supplied in examples' });
  await expect(questionSuppliedWords).toBeVisible();
  await expect(questionVocabulary).toContainText('ajoissa');
  await expect(questionVocabulary).toContainText('on time');
  await expect(questionNewWords.getByText('Suomessa', { exact: true })).toBeVisible();
  await expect(questionReusedWords.getByText('huomenna', { exact: true })).toBeVisible();
  await expect(questionSuppliedWords.getByText('kotona', { exact: true })).toBeVisible();
  await expect(questionSuppliedWords.getByText('aamulla', { exact: true })).toBeVisible();
  await expect(questionVocabulary.getByText('Suomessa huomenna', { exact: true })).toHaveCount(0);

  const vocabularyGroups = questionVocabulary.locator('.vocabulary-group');
  await expect(vocabularyGroups).toHaveCount(3);
  const referenceAppearance = await page
    .locator('.example-grid article')
    .first()
    .evaluate((card) => {
      const style = getComputedStyle(card);
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        border: style.border,
        borderLeft: style.borderLeft,
        borderRadius: style.borderRadius,
        borderTop: style.borderTop,
        boxShadow: style.boxShadow,
        clipPath: style.clipPath,
        filter: style.filter,
        padding: style.padding,
        position: style.position,
        transform: style.transform,
        transition: style.transition,
      };
    });
  const vocabularyAppearances = await vocabularyGroups.evaluateAll((groups) =>
    groups.map((group) => {
      const style = getComputedStyle(group);
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        border: style.border,
        borderLeft: style.borderLeft,
        borderRadius: style.borderRadius,
        borderTop: style.borderTop,
        boxShadow: style.boxShadow,
        clipPath: style.clipPath,
        filter: style.filter,
        padding: style.padding,
        position: style.position,
        transform: style.transform,
        transition: style.transition,
      };
    }),
  );
  expect(vocabularyAppearances).toEqual([
    referenceAppearance,
    referenceAppearance,
    referenceAppearance,
  ]);
  const referenceBinding = await page
    .locator('.example-grid article')
    .first()
    .evaluate((card) => {
      const style = getComputedStyle(card, '::before');
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        bottom: style.bottom,
        content: style.content,
        display: style.display,
        left: style.left,
        opacity: style.opacity,
        position: style.position,
        top: style.top,
        width: style.width,
      };
    });
  const vocabularyBindings = await vocabularyGroups.evaluateAll((groups) =>
    groups.map((group) => {
      const style = getComputedStyle(group, '::before');
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        bottom: style.bottom,
        content: style.content,
        display: style.display,
        left: style.left,
        opacity: style.opacity,
        position: style.position,
        top: style.top,
        width: style.width,
      };
    }),
  );
  expect(vocabularyBindings).toEqual([referenceBinding, referenceBinding, referenceBinding]);

  const workedExample = page.locator('.example-grid article').first();
  await workedExample.evaluate((card) =>
    card.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  await workedExample.hover();
  await workedExample.evaluate((card) => {
    void getComputedStyle(card).transform;
    card.getAnimations().forEach((animation) => animation.finish());
  });
  const referenceHover = await workedExample.evaluate((card) => {
    const style = getComputedStyle(card);
    return { filter: style.filter, transform: style.transform };
  });
  for (const group of await vocabularyGroups.all()) {
    await group.evaluate((card) => card.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await group.hover();
    await group.evaluate((card) => {
      void getComputedStyle(card).transform;
      card.getAnimations().forEach((animation) => animation.finish());
    });
    expect(await group.evaluate((card) => card.matches(':hover'))).toBe(true);
    expect(
      await group.evaluate((card) => {
        const style = getComputedStyle(card);
        return { filter: style.filter, transform: style.transform };
      }),
    ).toEqual(referenceHover);
  }

  const firstCardWidths = await questionVocabulary
    .locator('dl')
    .evaluateAll((lists) =>
      lists.map((list) => list.firstElementChild?.getBoundingClientRect().width ?? 0),
    );
  expect(firstCardWidths).toHaveLength(3);
  expect(Math.max(...firstCardWidths) - Math.min(...firstCardWidths)).toBeLessThan(1);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedReference = await workedExample.evaluate((card) => {
    const style = getComputedStyle(card);
    return {
      animationName: style.animationName,
      transform: style.transform,
      transitionDuration: style.transitionDuration,
    };
  });
  const reducedVocabulary = await vocabularyGroups.evaluateAll((groups) =>
    groups.map((group) => {
      const style = getComputedStyle(group);
      return {
        animationName: style.animationName,
        transform: style.transform,
        transitionDuration: style.transitionDuration,
      };
    }),
  );
  expect(reducedVocabulary).toEqual([reducedReference, reducedReference, reducedReference]);
  expect(reducedReference.transform).toBe('none');
  expect(reducedReference.transitionDuration).toBe('0s');
});

test('opens the question transfer Review with only its five relevant lessons', async ({ page }) => {
  const topic = packs[2].id;
  await page.goto(`/topics/${topic}`);
  const finalReview = page.locator('.review-test').last();
  await expect(finalReview.getByRole('heading')).toHaveText(
    'Olla questions and short answers transfer review',
  );
  await expect(finalReview).toContainText('18 exercises');
  await finalReview.getByRole('link', { name: 'Learn first' }).click();

  await expect(page.locator('.lesson-hero h1')).toHaveText(
    'Olla questions and short answers transfer review',
  );
  if ((page.viewportSize()?.width ?? 0) <= 800) {
    await expect(page.locator('.lesson-picker option')).toHaveCount(5);
  } else {
    await expect(page.locator('.lesson-list button')).toHaveCount(5);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

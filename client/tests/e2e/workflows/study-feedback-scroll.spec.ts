import { expect, type Locator, type Page, test } from '@playwright/test';

async function observeScrolling(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const requests: Array<{ target: string; behavior?: ScrollBehavior }> = [];
    Object.defineProperty(window, 'studyScrollRequests', { value: requests });
    const scrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (options) {
      if (this.matches('.feedback, .exercise-card, .practice-card')) {
        requests.push({
          target: this.classList.contains('feedback') ? 'feedback' : 'question',
          behavior: typeof options === 'object' ? options.behavior : undefined,
        });
      }
      scrollIntoView.call(this, options);
    };
  });
}

async function expectScroll(page: Page, target: string, behavior: ScrollBehavior): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const requests = Reflect.get(window, 'studyScrollRequests') as unknown[];
        return requests.at(-1);
      }),
    )
    .toEqual({ target, behavior });
}

async function expectUnobscured(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        const header = document.querySelector<HTMLElement>('.site-header')!;
        const position = getComputedStyle(header).position;
        const headerBottom =
          position === 'sticky' || position === 'fixed' ? header.getBoundingClientRect().bottom : 0;
        const bounds = element.getBoundingClientRect();
        // Rotated paper can produce fractional intersection ratios even when fully visible.
        return {
          top: bounds.top >= Math.max(0, headerBottom) - 1,
          bottom: bounds.bottom <= window.innerHeight + 1,
          left: bounds.left >= -1,
          right: bounds.right <= window.innerWidth + 1,
        };
      }),
    )
    .toEqual({ top: true, bottom: true, left: true, right: true });
}

async function expectFeedback(card: Locator, forward: Locator): Promise<void> {
  await expect(forward).toBeFocused();
  await expectUnobscured(forward);
  await expectUnobscured(card.locator('.feedback-title'));
  await expectUnobscured(card.locator('.feedback p').filter({ hasText: 'Correct answer:' }));
}

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  const behavior = reducedMotion === 'reduce' ? 'instant' : 'smooth';

  test(`scrolls scored study between feedback and question with motion ${reducedMotion}`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion });
    await observeScrolling(page);
    await page.goto('/study/vowel-harmony-location-endings/harmony-in-forms');
    const card = page.locator('.exercise-card');
    const forward = card.getByRole('button', { name: 'Continue', exact: true });
    await card.getByRole('textbox', { name: 'Your answer' }).fill('talossa');
    await card.getByRole('button', { name: 'Check answer', exact: true }).click();
    await expectScroll(page, 'feedback', behavior);
    await expectFeedback(card, forward);

    await forward.click();
    await expectScroll(page, 'question', behavior);
    await expect(card.getByRole('radio').first()).toBeFocused();
    await expectUnobscured(card.locator('h2'));

    await card.getByRole('button', { name: 'Show answer', exact: true }).click();
    await expectScroll(page, 'feedback', behavior);
    await expectFeedback(card, forward);
    if (reducedMotion === 'no-preference') {
      await page.screenshot({
        path: `tmp/study-feedback-scroll/study-${testInfo.project.name}.png`,
      });
    }
    await page.keyboard.press('Enter');
    await expectScroll(page, 'question', behavior);
    await expect(card.getByRole('textbox', { name: 'Your answer' })).toBeFocused();
    await expectUnobscured(card.locator('h2'));
  });

  test(`scrolls optional practice between feedback and question with motion ${reducedMotion}`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion });
    await observeScrolling(page);
    await page.goto('/learn/demonstrative-pronouns/sdp-singular-forms-test');
    await page.getByRole('button', { name: 'Start optional practice' }).click();
    const card = page.locator('.practice-card');
    const forward = card.getByRole('button', { name: 'Continue', exact: true });
    await expectUnobscured(card.locator('h4'));
    await card.getByRole('radio', { name: 'Se on auto.', exact: true }).check();
    await card.getByRole('button', { name: 'Check answer', exact: true }).click();
    await expectScroll(page, 'feedback', behavior);
    await expectFeedback(card, forward);

    await forward.click();
    await expectScroll(page, 'question', behavior);
    await expect(card.getByRole('textbox', { name: 'Your answer' })).toBeFocused();
    await expectUnobscured(card.locator('h4'));

    await card.getByRole('button', { name: 'Show answer', exact: true }).click();
    await expectScroll(page, 'feedback', behavior);
    await expectFeedback(card, forward);
    if (reducedMotion === 'no-preference') {
      await page.screenshot({
        path: `tmp/study-feedback-scroll/practice-${testInfo.project.name}.png`,
      });
    }
    await page.keyboard.press('Enter');
    await expectScroll(page, 'question', behavior);
    await expect(card.getByRole('textbox', { name: 'Your answer' })).toBeFocused();
    await expectUnobscured(card.locator('h4'));
  });
}

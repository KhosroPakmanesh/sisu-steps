import { expect, test } from '@playwright/test';

test('focuses the first answer control after every question change', async ({ page }) => {
  await page.goto('/study/demonstrative-pronouns/sdp-independent-use-test');

  const questionCount = page.locator('.question-count');
  await expect(questionCount).toContainText('1 / 16');
  const seenTypes = new Set<string>();

  for (let index = 1; index <= 16; index += 1) {
    const type = (await page.locator('.exercise-card .type-label').textContent())?.trim();
    if (type) seenTypes.add(type);
    const answerControl =
      type === 'multiple choice'
        ? page.locator('.choice-list input[type="radio"]').first()
        : type === 'word order'
          ? page.locator('.token-bank button:not(:disabled)').first()
          : page.getByRole('textbox', { name: 'Your answer' });

    await expect(answerControl, `Question ${index} (${type})`).toBeFocused();
    await expect(answerControl, `Question ${index} (${type})`).toBeInViewport();
    await page.getByRole('button', { name: 'Show answer' }).click();
    await expect(
      page.getByRole('button', { name: index === 16 ? 'See result' : 'Continue' }),
    ).toBeFocused();
    if (index % 2 === 0) {
      await page.getByRole('button', { name: index === 16 ? 'See result' : 'Continue' }).click();
    } else {
      await page.keyboard.press('Enter');
    }
    if (index < 16) {
      await expect(questionCount).toContainText(`${index + 1} / 16`);
      await expect(page.locator('.exercise-card h2')).toBeInViewport({ ratio: 0.8 });
    }
  }

  expect(seenTypes).toEqual(
    new Set(['fill blank', 'multiple choice', 'translation en', 'translation fi', 'word order']),
  );
  await expect(page.locator('.result-actions a').first()).toBeFocused();
});

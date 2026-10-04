import { expect, test } from '@playwright/test';

test('keeps T-plural Cheat mode lexical while grammar feedback and scoring remain intact', async ({
  page,
}) => {
  await page.goto('/study/t-plural-agreement/plural-in-sentences');
  const exercise = page.locator('.exercise-card');
  await expect(exercise).toContainText('The books are at home.');
  const originalQuestion = await exercise.innerText();

  await page.getByRole('button', { name: 'Cheat mode' }).click();
  const dialog = page.getByRole('dialog', { name: 'Words for this question' });
  await expect(dialog.locator('dt')).toHaveText(['kirja', 'kotona']);
  await expect(dialog.locator('dd')).toHaveText(['book', 'at home']);
  await page.getByRole('button', { name: 'Close Cheat mode' }).click();
  await expect(exercise).toHaveText(originalQuestion, { useInnerText: true });

  await page.getByRole('textbox', { name: 'Your answer' }).fill('Kirjat');
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.locator('.feedback')).toContainText('Correct');
  await expect(page.locator('.sentence-lesson')).toContainText('ovat');
  await expect(page.locator('.sentence-lesson')).toContainText('olla');
});

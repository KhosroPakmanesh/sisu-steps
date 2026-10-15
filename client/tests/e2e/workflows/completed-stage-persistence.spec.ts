import { expect, test } from '@playwright/test';
import { ExerciseTest } from '../../../src/features/learning/shared/content/test.models';
import { LearnerBackup } from '../../../src/features/learning/learner-data/backup/backup.models';
import { submit } from '../support/focused-content-grading';

const topicId = 'vowel-harmony-location-endings';
const testId = 'harmony-in-forms';

test('retains a fractional completed-stage score after refresh and backup restore', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const response = await page.request.get(`/content/${topicId}/tests/${testId}.json`);
  expect(response.ok()).toBe(true);
  const stage = (await response.json()) as ExerciseTest;
  expect(stage.exercises).toHaveLength(21);
  await page.goto('/study/demonstrative-pronouns/sdp-independent-use-test');
  await page.getByRole('button', { name: 'Show answer', exact: true }).click();
  await expect(page.locator('.exercise-card .feedback')).toContainText('Answer revealed');
  await page.goto(`/study/${topicId}/${testId}`);

  for (const [index, exercise] of stage.exercises.entries()) {
    await expect(page.locator('.question-count')).toHaveText(`${index + 1} / 21`);
    if (index === 0) {
      await submit(page, exercise, exercise.acceptedAnswers[0]);
    } else if (index === 1) {
      const wrong = exercise.options!.find((option) => !exercise.acceptedAnswers.includes(option));
      expect(wrong).toBeDefined();
      await submit(page, exercise, wrong!);
    } else {
      await page.getByRole('button', { name: 'Show answer', exact: true }).click();
    }
    await page.getByRole('button', { name: index === 20 ? 'See result' : 'Continue' }).click();
  }

  await expect(page.locator('.result-ring')).toContainText('4.8%');
  await expect(page.locator('.result-breakdown')).toHaveText(
    /1 correct\s*1 incorrect\s*19 skipped/,
  );
  await page.getByRole('link', { name: 'Open stats', exact: true }).click();
  await expect(page).toHaveURL(`/stats/${topicId}`);
  const row = page
    .locator('.stats-row')
    .filter({ has: page.getByRole('heading', { name: stage.title }) });
  await expect(row.locator('.stats-state-summary')).toContainText('1 attempt');

  for (let refresh = 0; refresh < 2; refresh += 1) {
    await page.reload();
    await expect(row.locator('.stats-state-summary')).toContainText('1 attempt');
    await expect(row.locator('.stats-state-summary')).toContainText('1 to practise');
    await expect(row.locator('.stats-independent')).toContainText('1/21 · skipped: 19');
    for (const label of ['First', 'Latest', 'Best', 'Average']) {
      await expect(row.locator(`td[data-label="${label}"]`)).toHaveText('4.8%');
    }
  }

  await page.goto('/stats');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download backup', exact: true }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const backup = JSON.parse(Buffer.concat(chunks).toString('utf8')) as LearnerBackup;
  expect(backup.state.attempts).toHaveLength(1);
  expect(backup.state.attempts[0]).toMatchObject({ percentage: 4.8, total: 21 });
  expect(backup.state.sessions).toHaveLength(1);
  expect(backup.state.sessions[0]).toMatchObject({
    topicId: 'demonstrative-pronouns',
    answers: [expect.objectContaining({ skipped: true })],
  });

  await page.getByRole('button', { name: 'Clear all history', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Clear all history' }).click();
  await expect(page.getByRole('status')).toHaveText(
    'All learner history was cleared from this device.',
  );
  await page.locator('input[type="file"]').setInputFiles({
    name: 'fractional-score-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(page.getByRole('status')).toHaveText('Backup restored successfully.');
  await page.goto(`/stats/${topicId}`);
  await page.reload();
  await expect(row.locator('.stats-state-summary')).toContainText('1 attempt');
  await expect(row.locator('td[data-label="Latest"]')).toHaveText('4.8%');
  await expect(row.locator('.stats-independent')).toContainText('1/21 · skipped: 19');
  await page.goto('/study/demonstrative-pronouns/sdp-independent-use-test');
  await expect(page.locator('.exercise-card .feedback')).toContainText('Answer revealed');
});

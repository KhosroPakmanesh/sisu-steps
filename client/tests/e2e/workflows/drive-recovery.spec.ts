import { expect, test } from '@playwright/test';

test('keeps Google Drive recovery explicit, optional, and focused from the header', async ({
  page,
}) => {
  const googleRequests: string[] = [];
  page.on('request', (request) => {
    const hostname = new URL(request.url()).hostname;
    if (hostname.endsWith('google.com') || hostname.endsWith('googleapis.com')) {
      googleRequests.push(request.url());
    }
  });

  await page.goto('/stats');
  await expect(page.locator('.stats-topic-card').first()).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (
          window as Window & {
            __SISU_STEPS_CONFIG__?: { googleOAuthClientId?: string };
          }
        ).__SISU_STEPS_CONFIG__,
    ),
  ).toEqual({ googleOAuthClientId: '' });
  await expect(page.locator('meta[name="sisu-steps-google-client-id"]')).toHaveCount(0);
  const archive = page.locator('.backup-archive');
  const driveArchive = page.locator('.drive-checkpoint-archive');
  const driveHeading = page.locator('#google-drive-checkpoint');
  await expect(archive.locator('.archive-action-row')).toHaveCount(3);
  await expect(archive).not.toContainText('Google Drive checkpoint');
  await expect(driveHeading).toHaveJSProperty('tagName', 'H2');
  await expect(driveArchive.locator('#google-drive-checkpoint')).toHaveCount(0);
  await expect(driveArchive).toBeVisible();
  await expect(driveArchive.getByRole('button', { name: 'Back up to Google Drive' })).toBeVisible();
  await expect(
    driveArchive.getByRole('button', { name: 'Restore from Google Drive' }),
  ).toBeVisible();
  await expect(driveArchive.getByRole('button', { name: 'Delete Drive backup' })).toBeVisible();
  expect(
    await page.evaluate(() => {
      const local = document.querySelector('.backup-archive');
      const drive = document.querySelector('.drive-checkpoint-archive');
      return Boolean(
        local && drive && local.compareDocumentPosition(drive) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
    }),
  ).toBe(true);
  expect(googleRequests).toEqual([]);

  await page.getByRole('button', { name: 'Open Google Drive backup controls under Stats' }).click();
  await expect(page).toHaveURL(/\/stats#google-drive-checkpoint$/u);
  await expect(page.locator('#google-drive-checkpoint')).toBeFocused();
  expect(googleRequests).toEqual([]);

  await driveArchive.getByRole('button', { name: 'Back up to Google Drive' }).click();
  await expect(driveArchive.getByRole('alert')).toContainText(
    'Google Drive backup is not configured for this deployment.',
  );
  expect(googleRequests).toEqual([]);
});

test('keeps the Drive shortcut and appearance controls usable at 320 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 720 });
  await page.goto('/stats');
  await expect(page.locator('.stats-topic-card').first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const mobileHeaderAlignment = await page.evaluate(() => {
    const brand = document.querySelector('.brand')?.getBoundingClientRect();
    const tools = document.querySelector('.header-tools')?.getBoundingClientRect();
    return brand && tools ? Math.abs(brand.top - tools.top) : null;
  });
  expect(mobileHeaderAlignment).not.toBeNull();
  const appearanceWidth = await page
    .locator('.appearance-control')
    .evaluate((element) => element.getBoundingClientRect().width);
  expect(appearanceWidth).toBeLessThanOrEqual(123);
  expect(mobileHeaderAlignment).toBeLessThanOrEqual(2);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);

  await page.setViewportSize({ width: 320, height: 720 });
  await expect(page.locator('.drive-backup-control')).toHaveText('Not set');
  await expect(page.locator('.drive-backup-control')).toHaveAttribute('aria-label', /Not set up/u);
  await expect(page.locator('.appearance-control')).toBeVisible();
  await expect(page.locator('.drive-backup-control')).toBeVisible();
  const controlAlignment = await page.evaluate(() => {
    const cloud = document.querySelector('.drive-checkpoint-icon')?.getBoundingClientRect();
    const switchHardware = document
      .querySelector('.appearance-toggle-hardware')
      ?.getBoundingClientRect();
    const status = document.querySelector('.drive-backup-control small')?.getBoundingClientRect();
    const appearanceIcon = document
      .querySelector('.appearance-choice-icon')
      ?.getBoundingClientRect();
    if (!cloud || !switchHardware || !status || !appearanceIcon) return null;
    return {
      bottomDifference: Math.abs(cloud.bottom - switchHardware.bottom),
      widthDifference: Math.abs(cloud.width - switchHardware.width),
      statusRowDifference: Math.abs(status.top - appearanceIcon.top),
    };
  });
  expect(controlAlignment).not.toBeNull();
  expect(controlAlignment?.bottomDifference).toBeLessThanOrEqual(1);
  expect(controlAlignment?.widthDifference).toBeLessThanOrEqual(3);
  expect(controlAlignment?.statusRowDifference).toBeLessThanOrEqual(1);

  const restingControl = await page.evaluate(() => {
    const status = document.querySelector('.drive-backup-control small')?.getBoundingClientRect();
    const cloud = document.querySelector('.drive-checkpoint-icon')?.getBoundingClientRect();
    return status && cloud ? { statusTop: status.top, cloudTop: cloud.top } : null;
  });
  expect(restingControl).not.toBeNull();
  await page.locator('.drive-backup-control').hover();
  await expect
    .poll(async () => (await page.locator('.drive-backup-control small').boundingBox())?.y ?? 0)
    .toBeLessThan((restingControl?.statusTop ?? 0) - 1);
  const cloudOnHover = await page.locator('.drive-checkpoint-icon').boundingBox();
  expect(Math.abs((cloudOnHover?.y ?? 0) - (restingControl?.cloudTop ?? 0))).toBeLessThanOrEqual(1);

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

import { expect, type Page } from '@playwright/test';

export async function expandTopicGroup(page: Page, groupId: string): Promise<void> {
  const group = page.locator('.topic-group').filter({
    has: page.locator('[id$="group-heading-' + groupId + '"]'),
  });
  const disclosure = group.locator('details');
  await disclosure.waitFor();
  await expect(disclosure.locator('summary')).not.toHaveAttribute('aria-busy', 'true', {
    timeout: 15_000,
  });
  if (!(await disclosure.evaluate((element) => (element as HTMLDetailsElement).open))) {
    await disclosure.locator('summary h3').click();
  }
  // First expansion waits for bundled group metadata before opening.
  await expect(disclosure.locator('summary')).not.toHaveAttribute('aria-busy', 'true', {
    timeout: 15_000,
  });
  await expect(disclosure).toHaveJSProperty('open', true);
  await expect(group).not.toHaveClass(/animating/);
}

export async function expandTopicGroups(page: Page): Promise<void> {
  await page.locator('.topic-group-toggle').first().waitFor();
  for (const group of await page.locator('.topic-group').all()) {
    const disclosure = group.locator('details');
    await expect(disclosure.locator('summary')).not.toHaveAttribute('aria-busy', 'true', {
      timeout: 15_000,
    });
    if (!(await disclosure.evaluate((element) => (element as HTMLDetailsElement).open))) {
      await disclosure.locator('summary h3').click();
    }
    await expect(disclosure.locator('summary')).not.toHaveAttribute('aria-busy', 'true', {
      timeout: 15_000,
    });
    await expect(disclosure).toHaveJSProperty('open', true);
    await expect(group).not.toHaveClass(/animating/);
  }
}

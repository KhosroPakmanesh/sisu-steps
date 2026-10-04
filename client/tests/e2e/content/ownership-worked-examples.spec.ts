import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { TopicPack } from '../../../src/features/learning/shared/content/topic-pack.models';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';

test('renders every ownership worked example and construction step at each viewport', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const source = await loadContentSource('content');
  const group = source.catalog.groups.find(
    (candidate) => candidate.id === 'ownership-and-possession',
  )!;
  const packs = group.packs.map(
    (id) => source.packs.find((pack) => pack['id'] === id) as unknown as TopicPack,
  );
  const audit: Array<{ lessonId: string; rendered: string }> = [];
  for (const pack of packs) {
    for (const lesson of pack.lessons) {
      const focused = pack.tests.find((candidate) => candidate.lessonIds.includes(lesson.id))!;
      await page.goto(`/learn/${pack.id}/${focused.id}`);
      const reader = page.locator('.lesson-reader');
      const cards = reader.locator('.worked-examples article');
      await expect(cards).toHaveCount(lesson.examples.length);
      for (const [index, example] of lesson.examples.entries()) {
        const card = cards.nth(index);
        await expect(card.locator('strong')).toHaveText(example.finnish);
        await expect(card.locator('p > span')).toHaveText(example.english);
        await expect(card.locator('li')).toHaveText(example.steps);
        expect(await card.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
          true,
        );
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      audit.push({ lessonId: lesson.id, rendered: await reader.innerText() });
      await reader
        .locator('.worked-examples')
        .screenshot({ path: testInfo.outputPath(`${lesson.id}-examples.png`) });
    }
  }
  expect(audit).toHaveLength(19);
  await writeFile(testInfo.outputPath('worked-example-audit.json'), JSON.stringify(audit, null, 2));
});

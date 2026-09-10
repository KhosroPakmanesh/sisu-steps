import { ContentCatalog, TopicPackSummary } from '../content.models';

export function validatePackSummaryCollection(
  catalog: ContentCatalog,
  packs: TopicPackSummary[],
): TopicPackSummary[] {
  if (catalog.packs.length !== packs.length) {
    throw new Error('The content catalog did not load every listed topic pack.');
  }
  const globalIds = new Set<string>();
  for (const [index, pack] of packs.entries()) {
    if (catalog.packs[index] !== pack.id) {
      throw new Error(
        `Catalog pack ${catalog.packs[index]} does not match loaded pack ${pack.id}.`,
      );
    }
    const ids = [
      ...pack.lessons.map((lesson) => lesson.id),
      ...pack.tests.map((test) => test.id),
      ...pack.tests.flatMap((test) => test.exerciseIds),
    ];
    for (const id of ids) {
      if (globalIds.has(id)) {
        throw new Error(`Content id ${id} is duplicated across installed topic packs.`);
      }
      globalIds.add(id);
    }
  }
  return packs;
}

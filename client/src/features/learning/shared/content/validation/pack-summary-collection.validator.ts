import { ContentCatalog, LoadedContentCatalog, TopicPackSummary } from '../content.models';

export function validatePackSummaryCollection(
  catalog: ContentCatalog,
  packs: TopicPackSummary[],
): LoadedContentCatalog {
  const catalogPackIds = catalog.groups.flatMap((group) => group.packs);
  if (catalogPackIds.length !== packs.length) {
    throw new Error('The content catalog did not load every listed topic pack.');
  }
  const globalIds = new Set<string>();
  for (const [index, pack] of packs.entries()) {
    if (catalogPackIds[index] !== pack.id) {
      throw new Error(
        `Catalog pack ${catalogPackIds[index]} does not match loaded pack ${pack.id}.`,
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
  const packsById = new Map(packs.map((pack) => [pack.id, pack]));
  return {
    packs,
    groups: catalog.groups.map((group) => ({
      id: group.id,
      title: group.title,
      packs: group.packs.map((packId) => packsById.get(packId)!),
    })),
  };
}

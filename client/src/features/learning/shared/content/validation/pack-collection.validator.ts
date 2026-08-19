import { ContentCatalog, TopicPack } from '../content.models';

export function validatePackCollection(catalog: ContentCatalog, packs: TopicPack[]): TopicPack[] {
  if (catalog.packs.length !== packs.length) {
    throw new Error('The content catalog did not load every listed topic pack.');
  }
  const globalIds = new Set<string>();
  for (const [index, pack] of packs.entries()) {
    if (catalog.packs[index].id !== pack.id) {
      throw new Error(
        `Catalog pack ${catalog.packs[index].id} does not match loaded pack ${pack.id}.`,
      );
    }
    const contentIds = [
      ...pack.lessons.map((lesson) => lesson.id),
      ...pack.tests.map((test) => test.id),
      ...pack.lessons.flatMap((lesson) => lesson.practiceExercises.map((exercise) => exercise.id)),
      ...pack.tests.flatMap((test) => test.exercises.map((exercise) => exercise.id)),
    ];
    for (const id of contentIds) {
      if (globalIds.has(id))
        throw new Error(`Content id ${id} is duplicated across installed topic packs.`);
      globalIds.add(id);
    }
  }
  return packs;
}

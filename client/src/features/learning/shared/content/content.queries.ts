import { Exercise, ExerciseTest, Lesson, TopicPack } from './content.models';

export function findPack(packs: TopicPack[], topicId: string): TopicPack | undefined {
  return packs.find((pack) => pack.id === topicId);
}

export function findTest(
  packs: TopicPack[],
  topicId: string,
  testId: string,
): ExerciseTest | undefined {
  return findPack(packs, topicId)?.tests.find((test) => test.id === testId);
}

export function findExercise(packs: TopicPack[], exerciseId: string): Exercise | undefined {
  return packs
    .flatMap((pack) => pack.tests)
    .flatMap((test) => test.exercises)
    .find((exercise) => exercise.id === exerciseId);
}

export function findLesson(packs: TopicPack[], lessonId: string): Lesson | undefined {
  return packs.flatMap((pack) => pack.lessons).find((lesson) => lesson.id === lessonId);
}

export function lessonsForTest(packs: TopicPack[], topicId: string, testId: string): Lesson[] {
  const pack = findPack(packs, topicId);
  const test = pack?.tests.find((candidate) => candidate.id === testId);
  if (!pack || !test) return [];
  return [...new Set(test.lessonIds)]
    .map((lessonId) => pack.lessons.find((lesson) => lesson.id === lessonId))
    .filter((lesson): lesson is Lesson => lesson !== undefined);
}

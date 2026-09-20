import {
  Exercise,
  ExerciseTest,
  Lesson,
  TopicPack,
  TopicPackSummary,
  VocabularyItem,
} from './content.models';

export function findPack(packs: TopicPack[], topicId: string): TopicPack | undefined {
  return packs.find((pack) => pack.id === topicId);
}

export function findPackSummary(
  packs: TopicPackSummary[],
  topicId: string,
): TopicPackSummary | undefined {
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

export function getLearningLevelLabel(packs: ReadonlyArray<{ level: string }>): string {
  const levels = [...new Set(packs.map((pack) => pack.level))];
  return `${levels.length === 1 ? 'Level' : 'Levels'}: ${levels.join(' · ')}`;
}

export function lessonsForTest(pack: TopicPack, testId: string): Lesson[] {
  const test = pack.tests.find((candidate) => candidate.id === testId);
  if (!test) return [];
  return [...new Set(test.lessonIds)]
    .map((lessonId) => pack.lessons.find((lesson) => lesson.id === lessonId))
    .filter((lesson): lesson is Lesson => lesson !== undefined);
}

export function vocabularyForExercise(pack: TopicPack, exercise: Exercise): VocabularyItem[] {
  const requestedWords = new Set(exercise.vocabulary);
  const vocabularyByFinnish = new Map<string, VocabularyItem>();
  const owningTest = pack.tests.find((test) =>
    test.exercises.some((candidate) => candidate.id === exercise.id),
  );

  for (const lesson of owningTest ? lessonsForTest(pack, owningTest.id) : []) {
    const lessonVocabulary = [
      ...lesson.introducedVocabulary,
      ...lesson.reusedVocabulary,
      ...lesson.suppliedVocabulary,
    ];
    for (const item of lessonVocabulary) {
      if (requestedWords.has(item.finnish) && !vocabularyByFinnish.has(item.finnish)) {
        vocabularyByFinnish.set(item.finnish, item);
      }
    }
  }

  return [...requestedWords]
    .map((word) => vocabularyByFinnish.get(word))
    .filter((item): item is VocabularyItem => item !== undefined);
}

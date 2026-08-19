import { Exercise, ExerciseTest, Lesson, TestSet } from '../content.models';
import { validateExercise } from './exercise.validator';
import { hasText, isRecord, validateStage } from './validation-primitives';

const TEST_SETS = new Set<TestSet>(['core', 'extended']);

export function validateTests(
  tests: unknown[],
  lessons: Lesson[],
  importantSkills: string[],
  seenIds: Set<string>,
): ExerciseTest[] {
  const context = createContext(lessons);
  const validated: ExerciseTest[] = [];

  for (const candidate of tests) {
    const test = validateTestShape(candidate, context.lessonIds);
    if (test.set === 'extended') context.extendedTestsStarted = true;
    else if (context.extendedTestsStarted) {
      throw new Error('A core test cannot appear after the extended test set has started.');
    } else context.coreTestCount += 1;
    if (context.testIds.has(test.id)) throw new Error(`Duplicate test id: ${test.id}`);
    context.testIds.add(test.id);
    validateStage(candidate as Record<string, unknown>, `Test ${test.id}`);
    test.lessonIds.forEach((id) => context.referencedLessonIds.add(id));
    validateTestExercises(test, lessons, seenIds, context);
    validated.push(test);
  }

  validateCompleteSequence(importantSkills, context);
  validateParallelRelationships(context.scoredExercises);
  return validated;
}

function createContext(lessons: Lesson[]) {
  return {
    lessonIds: new Set(lessons.map((lesson) => lesson.id)),
    referencedLessonIds: new Set<string>(),
    testIds: new Set<string>(),
    coreCoveredSkills: new Set<string>(),
    scoredExercises: [] as Exercise[],
    coreTestCount: 0,
    extendedTestsStarted: false,
  };
}

function validateTestShape(value: unknown, lessonIds: Set<string>): ExerciseTest {
  if (
    !isRecord(value) ||
    !hasText(value['id']) ||
    !hasText(value['title']) ||
    !hasText(value['focus']) ||
    !hasText(value['set']) ||
    !TEST_SETS.has(value['set'] as TestSet) ||
    !Array.isArray(value['lessonIds']) ||
    value['lessonIds'].length === 0 ||
    !value['lessonIds'].every(hasText) ||
    new Set(value['lessonIds']).size !== value['lessonIds'].length ||
    value['lessonIds'].some((id) => !lessonIds.has(id)) ||
    !Array.isArray(value['exercises']) ||
    value['exercises'].length === 0
  ) {
    throw new Error('An exercise test is malformed.');
  }
  return value as unknown as ExerciseTest;
}

function validateTestExercises(
  test: ExerciseTest,
  lessons: Lesson[],
  seenIds: Set<string>,
  context: ReturnType<typeof createContext>,
): void {
  const referencedLessons = test.lessonIds.map((id) => lessons.find((lesson) => lesson.id === id)!);
  const lessonSkills = new Set(
    referencedLessons.flatMap((lesson) => [...lesson.targetSkills, ...lesson.prerequisiteSkills]),
  );
  const declaredSkills = new Set([...test.targetSkills, ...test.prerequisiteSkills]);
  if ([...declaredSkills].some((skill) => !lessonSkills.has(skill))) {
    throw new Error(`Test ${test.id} declares a skill not taught by its lessons.`);
  }
  if (
    test.set === 'extended' &&
    [...declaredSkills].some((skill) => !context.coreCoveredSkills.has(skill))
  ) {
    throw new Error(`Extended test ${test.id} introduces a skill not covered by core tests.`);
  }
  const vocabulary = new Set(
    referencedLessons.flatMap((lesson) => lesson.introducedVocabulary.map((item) => item.finnish)),
  );

  for (const candidate of test.exercises) {
    const exercise = validateExercise(candidate, seenIds);
    if (
      !hasText(exercise.targetSkill) ||
      !hasText(exercise.misconceptionCategory) ||
      !hasText(exercise.parallelExerciseId)
    ) {
      throw new Error('A scored exercise is missing diagnostic or parallel-review metadata.');
    }
    context.scoredExercises.push(exercise);
    if (exercise.requiredSkills.some((skill) => !declaredSkills.has(skill))) {
      throw new Error(`Exercise ${exercise.id} requires a skill outside test ${test.id}.`);
    }
    if (test.set === 'core')
      exercise.requiredSkills.forEach((skill) => context.coreCoveredSkills.add(skill));
    else if (exercise.requiredSkills.some((skill) => !context.coreCoveredSkills.has(skill))) {
      throw new Error(`Extended test ${test.id} introduces a skill not covered by core tests.`);
    }
    if (exercise.vocabulary.some((word) => !vocabulary.has(word))) {
      throw new Error(
        `Exercise ${exercise.id} uses vocabulary not introduced for test ${test.id}.`,
      );
    }
  }
}

function validateCompleteSequence(
  importantSkills: string[],
  context: ReturnType<typeof createContext>,
): void {
  if (context.coreTestCount === 0)
    throw new Error('The exercise pack must contain at least one core test.');
  for (const skill of importantSkills) {
    if (!context.coreCoveredSkills.has(skill)) {
      throw new Error(`Important skill ${skill} is not covered by a core test.`);
    }
  }
  if ([...context.lessonIds].some((id) => !context.referencedLessonIds.has(id))) {
    throw new Error('The exercise pack contains a lesson that no test uses.');
  }
}

function validateParallelRelationships(exercises: Exercise[]): void {
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  for (const exercise of exercises) {
    const parallel = byId.get(exercise.parallelExerciseId!);
    if (
      !parallel ||
      parallel.id === exercise.id ||
      parallel.targetSkill !== exercise.targetSkill ||
      parallel.parallelExerciseId !== exercise.id
    ) {
      throw new Error(`Exercise ${exercise.id} has an invalid parallel-review relationship.`);
    }
  }
}

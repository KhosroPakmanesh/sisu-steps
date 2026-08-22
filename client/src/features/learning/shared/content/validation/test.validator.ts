import { Exercise, ExerciseTest, Lesson } from '../content.models';
import { validateExercise } from './exercise.validator';
import { hasText, isRecord, validateStage } from './validation-primitives';

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
    validateStage(candidate as Record<string, unknown>, `Test ${test.id}`);
    if (test.stage === 'review') context.reviewsStarted = true;
    else if (context.reviewsStarted) {
      throw new Error('A focused test cannot appear after the review group has started.');
    } else context.focusedTestCount += 1;
    if (context.testIds.has(test.id)) throw new Error(`Duplicate test id: ${test.id}`);
    context.testIds.add(test.id);
    test.lessonIds.forEach((id) => context.referencedLessonIds.add(id));
    if (test.stage === 'focused')
      test.lessonIds.forEach((id) => context.focusedReferencedLessonIds.add(id));
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
    focusedLessonIds: new Set(
      lessons.filter((lesson) => lesson.stage === 'focused').map((lesson) => lesson.id),
    ),
    referencedLessonIds: new Set<string>(),
    focusedReferencedLessonIds: new Set<string>(),
    testIds: new Set<string>(),
    focusedCoveredSkills: new Set<string>(),
    scoredExercises: [] as Exercise[],
    focusedTestCount: 0,
    reviewsStarted: false,
  };
}

function validateTestShape(value: unknown, lessonIds: Set<string>): ExerciseTest {
  if (isRecord(value) && 'set' in value) {
    throw new Error('An exercise test must not declare Core/Extended set metadata.');
  }
  if (
    !isRecord(value) ||
    !hasText(value['id']) ||
    !hasText(value['title']) ||
    !hasText(value['focus']) ||
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
  if (
    test.stage === 'focused' &&
    referencedLessons.some(
      (lesson) => lesson.stage !== 'focused' || lesson.targetSkills[0] !== test.targetSkills[0],
    )
  ) {
    throw new Error(`Focused test ${test.id} references a lesson for another target skill.`);
  }
  const lessonSkills = new Set(
    referencedLessons.flatMap((lesson) => [...lesson.targetSkills, ...lesson.prerequisiteSkills]),
  );
  const declaredSkills = new Set([...test.targetSkills, ...test.prerequisiteSkills]);
  if ([...declaredSkills].some((skill) => !lessonSkills.has(skill))) {
    throw new Error(`Test ${test.id} declares a skill not taught by its lessons.`);
  }
  if (
    test.stage === 'review' &&
    [...declaredSkills].some((skill) => !context.focusedCoveredSkills.has(skill))
  ) {
    throw new Error(`Review test ${test.id} introduces a skill not covered by focused tests.`);
  }
  const vocabulary = new Set(
    lessonsAvailableForTest(test, lessons).flatMap((lesson) =>
      lesson.introducedVocabulary.map((item) => item.finnish),
    ),
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
    if (test.stage === 'focused')
      exercise.requiredSkills.forEach((skill) => context.focusedCoveredSkills.add(skill));
    else if (exercise.requiredSkills.some((skill) => !context.focusedCoveredSkills.has(skill))) {
      throw new Error(`Review test ${test.id} introduces a skill not covered by focused tests.`);
    }
    if (exercise.vocabulary.some((word) => !vocabulary.has(word))) {
      throw new Error(
        `Exercise ${exercise.id} uses vocabulary not introduced for test ${test.id}.`,
      );
    }
  }
}

function lessonsAvailableForTest(test: ExerciseTest, lessons: Lesson[]): Lesson[] {
  const availableIds = new Set(test.lessonIds);
  const visitedSkills = new Set<string>();
  const pendingSkills = [...test.prerequisiteSkills];

  while (pendingSkills.length > 0) {
    const skill = pendingSkills.pop()!;
    if (visitedSkills.has(skill)) continue;
    visitedSkills.add(skill);
    for (const lesson of lessons.filter((candidate) => candidate.targetSkills.includes(skill))) {
      availableIds.add(lesson.id);
      pendingSkills.push(...lesson.prerequisiteSkills);
    }
  }

  return lessons.filter((lesson) => availableIds.has(lesson.id));
}

function validateCompleteSequence(
  importantSkills: string[],
  context: ReturnType<typeof createContext>,
): void {
  if (context.focusedTestCount === 0)
    throw new Error('The exercise pack must contain at least one focused test.');
  for (const skill of importantSkills) {
    if (!context.focusedCoveredSkills.has(skill)) {
      throw new Error(`Important skill ${skill} is not covered by a focused test.`);
    }
  }
  if ([...context.lessonIds].some((id) => !context.referencedLessonIds.has(id))) {
    throw new Error('The exercise pack contains a lesson that no test uses.');
  }
  const unreferencedFocusedLessonId = [...context.focusedLessonIds].find(
    (id) => !context.focusedReferencedLessonIds.has(id),
  );
  if (unreferencedFocusedLessonId) {
    throw new Error(
      `Focused lesson ${unreferencedFocusedLessonId} is not referenced by a focused test.`,
    );
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

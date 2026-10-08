import { validateFocusedTaskQuality } from './focused-task-quality.validator';
import { validateDemonstrativePractice } from './demonstrative-practice-expansion.validator';
import { validateFocusedNumberScopes } from './focused-number-scopes.validator';
import { TopicPack } from '../topic-pack.models';
import { validateLessons } from './lesson.validator';
import { validateTests } from './test.validator';
import { hasText, hasTextArray, isRecord } from './validation-primitives';
import { validatePossessiveOwnerGroups } from './possessive-owner-groups.validator';
import { validateOwnershipQuestionVariety } from './ownership-question-variety.validator';
import {
  validateGrammarBaseForms,
  validateGrammarVocabulary,
} from './grammar-vocabulary.validator';

const MAXIMUM_SCORED_EXERCISES = 1000;

export function validateTopicPack(value: unknown): TopicPack {
  if (!isRecord(value) || value['schemaVersion'] !== 1) {
    throw new Error('The exercise pack has an unsupported schema version.');
  }
  const tests = value['tests'];
  const lessons = value['lessons'];
  const importantSkills = value['importantSkills'];
  if (
    !hasText(value['id']) ||
    !hasText(value['title']) ||
    !hasText(value['version']) ||
    !Array.isArray(tests) ||
    tests.length === 0 ||
    !Array.isArray(lessons)
  ) {
    throw new Error('The exercise pack is missing required topic information.');
  }
  if (
    !hasTextArray(importantSkills) ||
    importantSkills.length === 0 ||
    new Set(importantSkills).size !== importantSkills.length
  ) {
    throw new Error('The exercise pack must declare unique important skills.');
  }
  const scoredCount = tests.reduce(
    (total, candidate) =>
      total +
      (isRecord(candidate) && Array.isArray(candidate['exercises'])
        ? candidate['exercises'].length
        : 0),
    0,
  );
  if (scoredCount === 0 || scoredCount > MAXIMUM_SCORED_EXERCISES) {
    throw new Error('The exercise pack must contain scored exercises and no more than 1,000.');
  }

  const seenIds = new Set<string>();
  const grammarBaseForms = validateGrammarBaseForms(value['grammarBaseForms']);
  const validatedLessons = validateLessons(lessons, seenIds);
  const validatedTests = validateTests(tests, validatedLessons, importantSkills, seenIds);
  const exercises = [
    ...validatedTests.flatMap((test) => test.exercises),
    ...validatedLessons.flatMap((lesson) => lesson.practiceExercises),
  ];
  validateGrammarVocabulary(validatedLessons, exercises, grammarBaseForms);
  validateFocusedNumberScopes({
    ...(value as unknown as TopicPack),
    lessons: validatedLessons,
    tests: validatedTests,
  });
  validateOwnershipQuestionVariety({
    ...(value as unknown as TopicPack),
    lessons: validatedLessons,
    tests: validatedTests,
  });
  validateDemonstrativePractice({
    ...(value as unknown as TopicPack),
    lessons: validatedLessons,
    tests: validatedTests,
  });
  validatePossessiveOwnerGroups({
    ...(value as unknown as TopicPack),
    lessons: validatedLessons,
    tests: validatedTests,
  });
  const qualityErrors = validateFocusedTaskQuality({
    ...(value as unknown as TopicPack),
    tests: validatedTests,
    lessons: validatedLessons,
  });
  if (qualityErrors.length) throw new Error(qualityErrors.join('\n'));
  return {
    ...(value as unknown as TopicPack),
    grammarBaseForms,
    lessons: validatedLessons,
    tests: validatedTests,
  };
}

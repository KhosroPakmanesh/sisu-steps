import { TopicPack } from '../content.models';
import { validateLessons } from './lesson.validator';
import { validateTests } from './test.validator';
import { hasText, hasTextArray, isRecord } from './validation-primitives';

const MINIMUM_SCORED_EXERCISES = 200;
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
  if (scoredCount < MINIMUM_SCORED_EXERCISES || scoredCount > MAXIMUM_SCORED_EXERCISES) {
    throw new Error('The exercise pack must contain between 200 and 1,000 scored exercises.');
  }

  const seenIds = new Set<string>();
  const validatedLessons = validateLessons(lessons, seenIds);
  const validatedTests = validateTests(tests, validatedLessons, importantSkills, seenIds);
  return { ...(value as unknown as TopicPack), lessons: validatedLessons, tests: validatedTests };
}

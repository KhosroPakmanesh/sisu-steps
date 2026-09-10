import { ContentLessonSummary, ContentPackManifest, ContentTestSummary } from '../content.models';
import { hasText, hasTextArray, isRecord } from './validation-primitives';

const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/;

function hasUniqueSafeIds(value: unknown): value is string[] {
  return (
    hasTextArray(value) &&
    value.length > 0 &&
    value.every((id) => SAFE_ID.test(id)) &&
    new Set(value).size === value.length
  );
}

function hasLessonSummaries(value: unknown, lessonIds: string[]): value is ContentLessonSummary[] {
  return (
    Array.isArray(value) &&
    value.length === lessonIds.length &&
    value.every(
      (lesson, index) =>
        isRecord(lesson) && lesson['id'] === lessonIds[index] && hasText(lesson['version']),
    )
  );
}

function hasTestSummaries(value: unknown, testIds: string[]): value is ContentTestSummary[] {
  return (
    Array.isArray(value) &&
    value.length === testIds.length &&
    value.every(
      (test, index) =>
        isRecord(test) &&
        test['id'] === testIds[index] &&
        hasText(test['title']) &&
        (test['stage'] === 'focused' || test['stage'] === 'review') &&
        hasUniqueSafeIds(test['lessonIds']) &&
        hasUniqueSafeIds(test['exerciseIds']),
    )
  );
}

export function validateContentManifest(
  value: unknown,
  expectedPackId: string,
): ContentPackManifest {
  if (
    !isRecord(value) ||
    value['schemaVersion'] !== 1 ||
    value['id'] !== expectedPackId ||
    !SAFE_ID.test(expectedPackId)
  ) {
    throw new Error(`Topic pack ${expectedPackId} has a mismatched or unsupported manifest.`);
  }
  const lessonIds = value['lessonIds'];
  const testIds = value['testIds'];
  if (
    !hasText(value['version']) ||
    !hasText(value['title']) ||
    !hasText(value['level']) ||
    !hasText(value['summary']) ||
    !hasTextArray(value['objectives']) ||
    !hasTextArray(value['importantSkills']) ||
    value['importantSkills'].length === 0 ||
    new Set(value['importantSkills']).size !== value['importantSkills'].length ||
    !Array.isArray(value['sources']) ||
    !value['sources'].every(
      (source) => isRecord(source) && hasText(source['title']) && hasText(source['url']),
    ) ||
    !hasUniqueSafeIds(lessonIds) ||
    !hasUniqueSafeIds(testIds) ||
    !hasLessonSummaries(value['lessonSummaries'], lessonIds) ||
    !hasTestSummaries(value['testSummaries'], testIds)
  ) {
    throw new Error(`Topic pack ${expectedPackId} has an incomplete manifest.`);
  }
  return value as unknown as ContentPackManifest;
}

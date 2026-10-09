import { TopicPackSummary } from '../catalog.models';
import { hasText, hasTextArray, isRecord } from './validation-primitives';

const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/;
const SUMMARY_KEYS = new Set([
  'schemaVersion',
  'id',
  'version',
  'title',
  'level',
  'summary',
  'lessons',
  'tests',
]);
const safeIds = (value: unknown): value is string[] =>
  hasTextArray(value) &&
  value.length > 0 &&
  value.every((id) => SAFE_ID.test(id)) &&
  new Set(value).size === value.length;

export function validateCatalogPackSummary(value: unknown): TopicPackSummary {
  if (
    !isRecord(value) ||
    value['schemaVersion'] !== 1 ||
    Object.keys(value).length !== SUMMARY_KEYS.size ||
    Object.keys(value).some((key) => !SUMMARY_KEYS.has(key)) ||
    !hasText(value['id']) ||
    !SAFE_ID.test(value['id']) ||
    !hasText(value['version']) ||
    !hasText(value['title']) ||
    !hasText(value['level']) ||
    !hasText(value['summary']) ||
    !Array.isArray(value['lessons']) ||
    value['lessons'].length === 0 ||
    !Array.isArray(value['tests']) ||
    value['tests'].length === 0
  ) {
    throw new Error('The content catalog contains an incomplete pack summary.');
  }
  const lessons = value['lessons'];
  const tests = value['tests'];
  if (
    lessons.some(
      (lesson) =>
        !isRecord(lesson) ||
        !hasText(lesson['id']) ||
        !SAFE_ID.test(lesson['id']) ||
        !hasText(lesson['version']),
    )
  ) {
    throw new Error('The content catalog contains an invalid lesson summary.');
  }
  const lessonIds = lessons.map((lesson) => (lesson as Record<string, unknown>)['id']);
  if (
    tests.some(
      (test) =>
        !isRecord(test) ||
        !hasText(test['id']) ||
        !SAFE_ID.test(test['id']) ||
        !hasText(test['title']) ||
        (test['stage'] !== 'focused' && test['stage'] !== 'review') ||
        !safeIds(test['lessonIds']) ||
        test['lessonIds'].some((id) => !lessonIds.includes(id)) ||
        !safeIds(test['exerciseIds']),
    )
  ) {
    throw new Error('The content catalog contains an invalid test summary.');
  }
  return value as unknown as TopicPackSummary;
}

import { ContentPackManifest } from '../content.models';
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
    !hasUniqueSafeIds(value['lessonIds']) ||
    !hasUniqueSafeIds(value['testIds'])
  ) {
    throw new Error(`Topic pack ${expectedPackId} has an incomplete manifest.`);
  }
  return value as unknown as ContentPackManifest;
}

import { ContentCatalog } from '../content.models';
import { hasText, isRecord } from './validation-primitives';

const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/;

export function validateContentCatalog(value: unknown): ContentCatalog {
  if (
    !isRecord(value) ||
    value['schemaVersion'] !== 2 ||
    !Array.isArray(value['groups']) ||
    value['groups'].length === 0
  ) {
    throw new Error('The content catalog is missing or has an unsupported schema.');
  }
  const groups = value['groups'];
  if (
    groups.some(
      (group) =>
        !isRecord(group) ||
        !hasText(group['id']) ||
        !SAFE_ID.test(group['id']) ||
        !hasText(group['title']) ||
        !Array.isArray(group['packs']) ||
        group['packs'].length === 0,
    ) ||
    new Set(groups.map((group) => (group as Record<string, unknown>)['id'])).size !== groups.length
  ) {
    throw new Error('The content catalog contains an invalid or duplicate group declaration.');
  }
  const packIds = groups.flatMap(
    (group) => (group as Record<string, unknown>)['packs'] as unknown[],
  );
  if (
    packIds.some((packId) => typeof packId !== 'string' || !SAFE_ID.test(packId)) ||
    new Set(packIds).size !== packIds.length
  ) {
    throw new Error('The content catalog contains an invalid or duplicate pack ID.');
  }
  return value as unknown as ContentCatalog;
}

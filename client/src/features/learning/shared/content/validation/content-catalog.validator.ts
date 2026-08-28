import { ContentCatalog } from '../content.models';
import { isRecord } from './validation-primitives';

const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/;

export function validateContentCatalog(value: unknown): ContentCatalog {
  if (
    !isRecord(value) ||
    value['schemaVersion'] !== 1 ||
    !Array.isArray(value['packs']) ||
    value['packs'].length === 0
  ) {
    throw new Error('The content catalog is missing or has an unsupported schema.');
  }
  const packIds = value['packs'];
  if (
    packIds.some((packId) => typeof packId !== 'string' || !SAFE_ID.test(packId)) ||
    new Set(packIds).size !== packIds.length
  ) {
    throw new Error('The content catalog contains an invalid or duplicate pack ID.');
  }
  return value as unknown as ContentCatalog;
}

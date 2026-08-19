import { ContentCatalog } from '../content.models';
import { hasText, isRecord } from './validation-primitives';

export function validateContentCatalog(value: unknown): ContentCatalog {
  if (
    !isRecord(value) ||
    value['schemaVersion'] !== 1 ||
    !Array.isArray(value['packs']) ||
    value['packs'].length === 0
  ) {
    throw new Error('The content catalog is missing or has an unsupported schema.');
  }
  const seenIds = new Set<string>();
  const seenFiles = new Set<string>();
  for (const entry of value['packs']) {
    if (
      !isRecord(entry) ||
      !hasText(entry['id']) ||
      !/^[a-z0-9][a-z0-9-]*$/.test(entry['id']) ||
      !hasText(entry['file']) ||
      !/^[a-z0-9][a-z0-9-]*\.json$/.test(entry['file']) ||
      seenIds.has(entry['id']) ||
      seenFiles.has(entry['file'])
    ) {
      throw new Error('The content catalog contains an invalid or duplicate pack entry.');
    }
    seenIds.add(entry['id']);
    seenFiles.add(entry['file']);
  }
  return value as unknown as ContentCatalog;
}

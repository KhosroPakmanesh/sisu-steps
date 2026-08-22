import { LearningStage } from '../content.models';

const LEARNING_STAGES = new Set<LearningStage>(['focused', 'review']);

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function hasTextArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(hasText);
}

export function validateStage(record: Record<string, unknown>, label: string): void {
  if (
    !hasText(record['stage']) ||
    !LEARNING_STAGES.has(record['stage'] as LearningStage) ||
    !hasTextArray(record['targetSkills']) ||
    record['targetSkills'].length === 0 ||
    !hasTextArray(record['prerequisiteSkills'])
  ) {
    throw new Error(`${label} has incomplete focus information.`);
  }
  if (record['stage'] === 'focused' && record['targetSkills'].length !== 1) {
    throw new Error(`${label} must declare exactly one focused target skill.`);
  }
}

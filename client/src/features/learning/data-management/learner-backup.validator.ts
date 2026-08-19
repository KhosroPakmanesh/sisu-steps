import { LearnerBackup } from '@/shared/domain/learner-state.models';

export function parseLearnerBackup(value: unknown): LearnerBackup {
  if (!isBackupEnvelope(value) || !isLearnerState(value.state)) {
    throw new Error('This file is not a supported Finnish exercise-book backup.');
  }
  validateContentVersions(value.state);
  validateLessonCompletions(value.state.lessonCompletions ?? []);
  validateCorrectionRecords(value.state.correctionRecords ?? []);
  return { ...value, state: value.state };
}

interface BackupEnvelope {
  backupType: 'finnish-exercise-book';
  backupVersion: 1;
  exportedAt: string;
  state: unknown;
}

function isBackupEnvelope(value: unknown): value is BackupEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'backupType' in value &&
    value.backupType === 'finnish-exercise-book' &&
    'backupVersion' in value &&
    value.backupVersion === 1 &&
    'exportedAt' in value &&
    validDate(value.exportedAt) &&
    'state' in value
  );
}

function isLearnerState(value: unknown): value is LearnerBackup['state'] {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'schemaVersion' in value &&
    value.schemaVersion === 1 &&
    'attempts' in value &&
    Array.isArray(value.attempts) &&
    'sessions' in value &&
    Array.isArray(value.sessions) &&
    'unresolvedMistakeIds' in value &&
    Array.isArray(value.unresolvedMistakeIds)
  );
}

function validateContentVersions(state: LearnerBackup['state']): void {
  if (
    state.contentPackVersions !== undefined &&
    (typeof state.contentPackVersions !== 'object' ||
      state.contentPackVersions === null ||
      Array.isArray(state.contentPackVersions) ||
      Object.entries(state.contentPackVersions).some(
        ([topicId, version]) => !topicId.trim() || typeof version !== 'string' || !version.trim(),
      ))
  ) {
    throw new Error('The backup contains invalid content-pack versions.');
  }
  if (state.contentPackVersion !== undefined && typeof state.contentPackVersion !== 'string') {
    throw new Error('The backup contains an invalid content-pack version.');
  }
}

function validateLessonCompletions(completions: unknown[]): void {
  if (
    completions.some(
      (completion) =>
        typeof completion !== 'object' ||
        completion === null ||
        Array.isArray(completion) ||
        !('lessonId' in completion) ||
        typeof completion.lessonId !== 'string' ||
        !('lessonVersion' in completion) ||
        typeof completion.lessonVersion !== 'string' ||
        !('completedAt' in completion) ||
        typeof completion.completedAt !== 'string',
    )
  ) {
    throw new Error('The backup contains invalid lesson completion data.');
  }
}

function validateCorrectionRecords(records: unknown[]): void {
  if (records.some((record) => !isCorrectionRecord(record))) {
    throw new Error('The backup contains invalid correction and mastery data.');
  }
}

function isCorrectionRecord(record: unknown): boolean {
  return (
    typeof record === 'object' &&
    record !== null &&
    !Array.isArray(record) &&
    'exerciseId' in record &&
    typeof record.exerciseId === 'string' &&
    'parallelExerciseId' in record &&
    typeof record.parallelExerciseId === 'string' &&
    'targetSkill' in record &&
    typeof record.targetSkill === 'string' &&
    'correctedAt' in record &&
    validDate(record.correctedAt) &&
    'nextReviewAt' in record &&
    validDate(record.nextReviewAt) &&
    'reviewStage' in record &&
    [0, 1, 2].includes(record.reviewStage as number) &&
    'reviewAttempts' in record &&
    typeof record.reviewAttempts === 'number' &&
    Number.isInteger(record.reviewAttempts) &&
    record.reviewAttempts >= 0 &&
    (!('masteredAt' in record) || record.masteredAt === undefined || validDate(record.masteredAt))
  );
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

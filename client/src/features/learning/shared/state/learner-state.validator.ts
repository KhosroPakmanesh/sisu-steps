import { LearnerState } from './learner-state.models';

const STATE_KEYS = new Set([
  'schemaVersion',
  'contentPackVersions',
  'attempts',
  'sessions',
  'unresolvedMistakeIds',
  'lessonCompletions',
  'correctionRecords',
  'learnerNotes',
]);
const MODES = new Set(['test', 'mistakes', 'review']);

export function isCurrentLearnerState(value: unknown): value is LearnerState {
  if (!isRecord(value) || value['schemaVersion'] !== 1 || !hasOnlyKeys(value, STATE_KEYS)) {
    return false;
  }
  return (
    isVersionMap(value['contentPackVersions']) &&
    isArrayOf(value['attempts'], isCompletedAttempt) &&
    isArrayOf(value['sessions'], isStudySession) &&
    isArrayOf(value['unresolvedMistakeIds'], isText) &&
    isArrayOf(value['lessonCompletions'], isLessonCompletion) &&
    isArrayOf(value['correctionRecords'], isCorrectionRecord) &&
    isArrayOf(value['learnerNotes'], isLearnerNote) &&
    hasUniqueNoteScopes(value['learnerNotes'])
  );
}

function isVersionMap(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.entries(value).every(
      ([topicId, version]) =>
        topicId.trim().length > 0 && typeof version === 'string' && version.trim().length > 0,
    )
  );
}

function isCompletedAttempt(value: unknown): boolean {
  return (
    isRecord(value) &&
    isText(value['id']) &&
    isMode(value['mode']) &&
    isText(value['topicId']) &&
    isOptionalText(value['testId']) &&
    isText(value['title']) &&
    isDate(value['startedAt']) &&
    isDate(value['completedAt']) &&
    isArrayOf(value['answers'], isSubmittedAnswer) &&
    isOptionalTextArray(value['sourceExerciseIds']) &&
    isCount(value['correctCount']) &&
    isCount(value['incorrectCount']) &&
    isCount(value['skippedCount']) &&
    isCount(value['total']) &&
    isFiniteNumber(value['percentage']) &&
    hasConsistentAttemptCounts(value)
  );
}

function isStudySession(value: unknown): boolean {
  return (
    isRecord(value) &&
    isText(value['id']) &&
    isMode(value['mode']) &&
    isText(value['topicId']) &&
    isOptionalText(value['testId']) &&
    isText(value['title']) &&
    isArrayOf(value['exerciseIds'], isText) &&
    isOptionalTextArray(value['sourceExerciseIds']) &&
    isCount(value['currentIndex']) &&
    isArrayOf(value['answers'], isSubmittedAnswer) &&
    isDate(value['startedAt']) &&
    isDate(value['updatedAt']) &&
    (value['currentIndex'] as number) <= (value['exerciseIds'] as unknown[]).length &&
    (value['answers'] as unknown[]).length <= (value['exerciseIds'] as unknown[]).length
  );
}

function hasConsistentAttemptCounts(value: Record<string, unknown>): boolean {
  const answers = value['answers'] as Array<Record<string, unknown>>;
  const correct = answers.filter((answer) => answer['correct'] === true).length;
  const skipped = answers.filter((answer) => answer['skipped'] === true).length;
  const incorrect = answers.length - correct - skipped;
  return (
    value['correctCount'] === correct &&
    value['incorrectCount'] === incorrect &&
    value['skippedCount'] === skipped &&
    value['total'] === answers.length &&
    value['percentage'] === (answers.length ? Math.round((correct / answers.length) * 100) : 0)
  );
}

function isSubmittedAnswer(value: unknown): boolean {
  return (
    isRecord(value) &&
    isText(value['exerciseId']) &&
    typeof value['submittedAnswer'] === 'string' &&
    typeof value['correct'] === 'boolean' &&
    typeof value['skipped'] === 'boolean' &&
    isOptionalText(value['misconceptionCategory']) &&
    isOptionalText(value['diagnosticExplanation']) &&
    isDate(value['answeredAt'])
  );
}

function isLessonCompletion(value: unknown): boolean {
  return (
    isRecord(value) &&
    isText(value['lessonId']) &&
    isText(value['lessonVersion']) &&
    isDate(value['completedAt'])
  );
}

function isCorrectionRecord(value: unknown): boolean {
  return (
    isRecord(value) &&
    isText(value['exerciseId']) &&
    isText(value['parallelExerciseId']) &&
    isText(value['targetSkill']) &&
    isDate(value['correctedAt']) &&
    isDate(value['nextReviewAt']) &&
    [0, 1, 2].includes(value['reviewStage'] as number) &&
    isCount(value['reviewAttempts']) &&
    (value['masteredAt'] === undefined || isDate(value['masteredAt']))
  );
}

function isLearnerNote(value: unknown): boolean {
  return (
    isRecord(value) &&
    isText(value['topicId']) &&
    isOptionalText(value['lessonId']) &&
    isText(value['text']) &&
    value['text'].length <= 1000 &&
    isDate(value['updatedAt'])
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: Set<string>): boolean {
  return Object.keys(value).every((key) => keys.has(key));
}

function isArrayOf(value: unknown, predicate: (item: unknown) => boolean): boolean {
  return Array.isArray(value) && value.every(predicate);
}

function hasUniqueNoteScopes(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  const scopes = new Set<string>();
  for (const note of value) {
    if (!isRecord(note)) return false;
    const scope = `${String(note['topicId'])}\u0000${String(note['lessonId'] ?? '')}`;
    if (scopes.has(scope)) return false;
    scopes.add(scope);
  }
  return true;
}

function isMode(value: unknown): boolean {
  return typeof value === 'string' && MODES.has(value);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isOptionalText(value: unknown): boolean {
  return value === undefined || isText(value);
}

function isOptionalTextArray(value: unknown): boolean {
  return value === undefined || isArrayOf(value, isText);
}

function isCount(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isFiniteNumber(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value);
}

function isDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

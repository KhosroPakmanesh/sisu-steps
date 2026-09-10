import { CorrectionRecord, LearnerState, StudySession } from '../state/learner-state.models';
import {
  ContentLessonSummary,
  ContentTestSummary,
  ExerciseTest,
  TopicPack,
  TopicPackSummary,
} from '../content/content.models';
import { findPackSummary } from '../content/content.queries';

export interface LessonProgress {
  completed: number;
  total: number;
}

export function rounded(value: number): number {
  return Math.round(value * 10) / 10;
}

export function findSession(state: LearnerState, sessionId: string): StudySession | undefined {
  return state.sessions.find((session) => session.id === sessionId);
}

export function findTestSession(
  state: LearnerState,
  topicId: string,
  testId: string,
): StudySession | undefined {
  return state.sessions.find(
    (session) =>
      session.mode === 'test' && session.topicId === topicId && session.testId === testId,
  );
}

export function findModeSession(
  state: LearnerState,
  topicId: string,
  mode: 'review' | 'mistakes',
): StudySession | undefined {
  return state.sessions.find((session) => session.mode === mode && session.topicId === topicId);
}

export function dueCorrections(
  state: LearnerState,
  packs: TopicPackSummary[],
  topicId?: string,
  now = new Date(),
): CorrectionRecord[] {
  const exerciseIds = topicId ? packExerciseIds(findPackSummary(packs, topicId)) : null;
  return state.correctionRecords.filter(
    (record) =>
      !record.masteredAt &&
      (!exerciseIds || exerciseIds.has(record.exerciseId)) &&
      new Date(record.nextReviewAt).getTime() <= now.getTime(),
  );
}

export function lessonProgressForTest(
  state: LearnerState,
  packs: TopicPackSummary[],
  topicId: string,
  testId: string,
): LessonProgress {
  const pack = findPackSummary(packs, topicId);
  const test = pack?.tests.find((candidate) => candidate.id === testId);
  const lessonIds = new Set(test?.lessonIds ?? []);
  const lessons = pack?.lessons.filter((lesson) => lessonIds.has(lesson.id)) ?? [];
  return {
    completed: lessons.filter((lesson) => isLessonCompleted(state, lesson)).length,
    total: lessons.length,
  };
}

export function isLessonCompleted(state: LearnerState, lesson: ContentLessonSummary): boolean {
  return state.lessonCompletions.some(
    (completion) =>
      completion.lessonId === lesson.id && completion.lessonVersion === lesson.version,
  );
}

export function exerciseCount(packs: TopicPackSummary[]): number {
  return packs
    .flatMap((pack) => pack.tests)
    .reduce((total, test) => total + test.exerciseIds.length, 0);
}

export function completedAttemptCount(state: LearnerState, topicId?: string): number {
  return state.attempts.filter(
    (attempt) => attempt.mode === 'test' && (!topicId || attempt.topicId === topicId),
  ).length;
}

export function overallAverage(state: LearnerState, topicId?: string): number | null {
  const attempts = state.attempts.filter(
    (attempt) => attempt.mode === 'test' && (!topicId || attempt.topicId === topicId),
  );
  return attempts.length
    ? rounded(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length)
    : null;
}

export function mistakeCount(state: LearnerState, pack?: TopicPackSummary): number {
  if (!pack) return state.unresolvedMistakeIds.length;
  const exerciseIds = packExerciseIds(pack);
  return state.unresolvedMistakeIds.filter((id) => exerciseIds.has(id)).length;
}

export function correctionCount(
  state: LearnerState,
  mastered: boolean,
  pack?: TopicPackSummary,
): number {
  const exerciseIds = pack ? packExerciseIds(pack) : null;
  return state.correctionRecords.filter(
    (record) =>
      (!exerciseIds || exerciseIds.has(record.exerciseId)) &&
      Boolean(record.masteredAt) === mastered,
  ).length;
}

export function testExerciseIds(test?: ExerciseTest | ContentTestSummary): Set<string> {
  if (!test) return new Set();
  return new Set(
    'exerciseIds' in test ? test.exerciseIds : test.exercises.map((exercise) => exercise.id),
  );
}

export function packExerciseIds(pack?: TopicPackSummary | TopicPack): Set<string> {
  if (!pack) return new Set();
  return new Set(
    pack.tests.flatMap((test) =>
      'exerciseIds' in test ? test.exerciseIds : test.exercises.map((exercise) => exercise.id),
    ),
  );
}

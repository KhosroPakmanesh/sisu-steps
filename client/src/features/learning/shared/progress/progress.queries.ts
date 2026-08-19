import { CorrectionRecord, LearnerState, StudySession } from '@/shared/domain/learner-state.models';
import { ExerciseTest, Lesson, TopicPack } from '../content/content.models';
import { findPack, lessonsForTest } from '../content/content.queries';

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
  packs: TopicPack[],
  topicId?: string,
  now = new Date(),
): CorrectionRecord[] {
  const exerciseIds = topicId ? packExerciseIds(findPack(packs, topicId)) : null;
  return (state.correctionRecords ?? []).filter(
    (record) =>
      !record.masteredAt &&
      (!exerciseIds || exerciseIds.has(record.exerciseId)) &&
      new Date(record.nextReviewAt).getTime() <= now.getTime(),
  );
}

export function lessonProgressForTest(
  state: LearnerState,
  packs: TopicPack[],
  topicId: string,
  testId: string,
): LessonProgress {
  const lessons = lessonsForTest(packs, topicId, testId);
  return {
    completed: lessons.filter((lesson) => isLessonCompleted(state, lesson)).length,
    total: lessons.length,
  };
}

export function isLessonCompleted(state: LearnerState, lesson: Lesson): boolean {
  return (state.lessonCompletions ?? []).some(
    (completion) =>
      completion.lessonId === lesson.id && completion.lessonVersion === lesson.version,
  );
}

export function exerciseCount(packs: TopicPack[]): number {
  return packs
    .flatMap((pack) => pack.tests)
    .reduce((total, test) => total + test.exercises.length, 0);
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

export function mistakeCount(state: LearnerState, pack?: TopicPack): number {
  if (!pack) return state.unresolvedMistakeIds.length;
  const exerciseIds = packExerciseIds(pack);
  return state.unresolvedMistakeIds.filter((id) => exerciseIds.has(id)).length;
}

export function correctionCount(state: LearnerState, mastered: boolean, pack?: TopicPack): number {
  const exerciseIds = pack ? packExerciseIds(pack) : null;
  return (state.correctionRecords ?? []).filter(
    (record) =>
      (!exerciseIds || exerciseIds.has(record.exerciseId)) &&
      Boolean(record.masteredAt) === mastered,
  ).length;
}

export function testExerciseIds(test?: ExerciseTest): Set<string> {
  return new Set(test?.exercises.map((exercise) => exercise.id) ?? []);
}

export function packExerciseIds(pack?: TopicPack): Set<string> {
  return new Set(
    pack?.tests.flatMap((test) => test.exercises.map((exercise) => exercise.id)) ?? [],
  );
}

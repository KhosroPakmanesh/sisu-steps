import { LearnerState } from '@/shared/domain/learner-state.models';
import { TopicPack } from '../shared/content/content.models';
import { rounded, testExerciseIds } from '../shared/progress/progress.queries';
import { TestReport } from './report.models';

export function getTestReport(state: LearnerState, pack: TopicPack, testId: string): TestReport {
  const attempts = state.attempts.filter(
    (attempt) =>
      attempt.mode === 'test' && attempt.topicId === pack.id && attempt.testId === testId,
  );
  const exerciseIds = testExerciseIds(pack.tests.find((test) => test.id === testId));
  const percentages = attempts.map((attempt) => attempt.percentage);
  const latestAttempt = attempts.at(-1);
  const corrections = (state.correctionRecords ?? []).filter((record) =>
    exerciseIds.has(record.exerciseId),
  );
  return {
    testId,
    attempts: attempts.length,
    latest: percentages.at(-1) ?? null,
    best: percentages.length ? Math.max(...percentages) : null,
    average: percentages.length
      ? rounded(percentages.reduce((sum, value) => sum + value, 0) / percentages.length)
      : null,
    mistakes: state.unresolvedMistakeIds.filter((id) => exerciseIds.has(id)).length,
    firstAttempt: percentages[0] ?? null,
    independentCorrect: latestAttempt?.correctCount ?? 0,
    skipped: latestAttempt?.skippedCount ?? 0,
    corrected: corrections.filter((record) => !record.masteredAt).length,
    mastered: corrections.filter((record) => !!record.masteredAt).length,
  };
}

import { TopicPack } from '../content/topic-pack.models';
import { LearnerState } from '../state/learner-state.models';
import { testExerciseIds } from './exercise-reference.queries';
import { rounded } from './percentage';
import { TestProgressSummary } from './test-progress.models';

export function getTestProgress(
  state: LearnerState,
  pack: TopicPack,
  testId: string,
): TestProgressSummary {
  const attempts = state.attempts.filter(
    (attempt) =>
      attempt.mode === 'test' && attempt.topicId === pack.id && attempt.testId === testId,
  );
  const exerciseIds = testExerciseIds(pack.tests.find((test) => test.id === testId));
  const percentages = attempts.map((attempt) => attempt.percentage);
  const latestAttempt = attempts.at(-1);
  const corrections = state.correctionRecords.filter((record) =>
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

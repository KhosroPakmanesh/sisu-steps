import { TopicPackSummary } from '../content/catalog.models';
import { LearnerState } from '../state/learner-state.models';
import { packExerciseIds } from './exercise-reference.queries';
import { rounded } from './percentage';

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

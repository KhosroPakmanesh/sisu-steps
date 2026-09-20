import { TopicPackSummary } from '../content/catalog.models';
import { findPackSummary } from '../content/content.queries';
import { CorrectionRecord, LearnerState } from '../state/learner-state.models';
import { packExerciseIds } from './exercise-reference.queries';

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

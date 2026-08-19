import { LearnerState } from '@/shared/domain/learner-state.models';

export function createEmptyLearnerState(
  contentPackVersions: Record<string, string> = {},
): LearnerState {
  return {
    schemaVersion: 1,
    contentPackVersions,
    attempts: [],
    sessions: [],
    unresolvedMistakeIds: [],
    lessonCompletions: [],
    correctionRecords: [],
  };
}

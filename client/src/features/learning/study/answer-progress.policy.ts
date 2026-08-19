import {
  CorrectionRecord,
  LearnerState,
  StudySession,
  SubmittedAnswer,
} from '@/shared/domain/learner-state.models';
import { Exercise } from '../shared/content/content.models';
import { nextReviewAt } from './review-schedule.policy';

export function recordSubmittedAnswer(
  state: LearnerState,
  session: StudySession,
  exercise: Exercise,
  answer: SubmittedAnswer,
): LearnerState {
  const mistakes = new Set(state.unresolvedMistakeIds);
  let corrections = [...(state.correctionRecords ?? [])];

  if (session.mode === 'review') {
    corrections = updateReviewCorrection(corrections, session, answer);
  } else if (answer.correct) {
    const wasUnresolved = mistakes.delete(exercise.id);
    if (wasUnresolved && exercise.parallelExerciseId && exercise.targetSkill) {
      const correction: CorrectionRecord = {
        exerciseId: exercise.id,
        parallelExerciseId: exercise.parallelExerciseId,
        targetSkill: exercise.targetSkill,
        correctedAt: answer.answeredAt,
        nextReviewAt: nextReviewAt(answer.answeredAt, 0),
        reviewStage: 0,
        reviewAttempts: 0,
      };
      corrections = [
        ...corrections.filter((record) => record.exerciseId !== exercise.id),
        correction,
      ];
    }
  } else {
    mistakes.add(exercise.id);
    corrections = corrections.filter((record) => record.exerciseId !== exercise.id);
  }

  return {
    ...state,
    unresolvedMistakeIds: [...mistakes],
    correctionRecords: corrections,
    sessions: state.sessions.map((item) =>
      item.id === session.id
        ? { ...item, answers: [...item.answers, answer], updatedAt: answer.answeredAt }
        : item,
    ),
  };
}

function updateReviewCorrection(
  records: CorrectionRecord[],
  session: StudySession,
  answer: SubmittedAnswer,
): CorrectionRecord[] {
  const sourceExerciseId = session.sourceExerciseIds?.[session.currentIndex];
  if (!sourceExerciseId) return records;
  return records.map((record) => {
    if (record.exerciseId !== sourceExerciseId || record.masteredAt) return record;
    if (answer.correct) {
      return {
        ...record,
        reviewAttempts: record.reviewAttempts + 1,
        masteredAt: answer.answeredAt,
      };
    }
    const nextStage = Math.min(record.reviewStage + 1, 2) as 0 | 1 | 2;
    return {
      ...record,
      reviewAttempts: record.reviewAttempts + 1,
      reviewStage: nextStage,
      nextReviewAt: nextReviewAt(answer.answeredAt, nextStage),
    };
  });
}

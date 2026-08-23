import { describe, expect, it } from 'vitest';
import { parseLearnerBackup } from '@/features/learning/data-management/learner-backup.validator';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';

const exportedAt = '2026-08-18T00:00:00.000Z';

function backupWithState(state: unknown) {
  return {
    backupType: 'finnish-exercise-book',
    backupVersion: 1,
    exportedAt,
    state,
  };
}

describe('learner-backup validation', () => {
  it('accepts a versioned learner backup', () => {
    const backup = backupWithState(createEmptyLearnerState());
    expect(parseLearnerBackup(backup)).toEqual(backup);
  });

  it('rejects an invalid file', () => {
    expect(() => parseLearnerBackup({ backupType: 'something-else' })).toThrowError(
      'This file is not a supported Finnish exercise-book backup.',
    );
  });

  it('rejects malformed state arrays', () => {
    expect(() =>
      parseLearnerBackup(
        backupWithState({
          schemaVersion: 1,
          attempts: 'not-an-array',
          sessions: [],
          unresolvedMistakeIds: [],
        }),
      ),
    ).toThrowError('This file is not a supported Finnish exercise-book backup.');
  });

  it('accepts versioned lesson completion data', () => {
    const state = createEmptyLearnerState();
    state.lessonCompletions = [
      { lessonId: 'lesson-1', lessonVersion: '1.0.0', completedAt: exportedAt },
    ];
    expect(parseLearnerBackup(backupWithState(state)).state.lessonCompletions).toEqual(
      state.lessonCompletions,
    );
  });

  it('rejects malformed lesson completion data', () => {
    expect(() =>
      parseLearnerBackup(
        backupWithState({
          ...createEmptyLearnerState(),
          lessonCompletions: [{ lessonId: 3 }],
        }),
      ),
    ).toThrowError('The backup contains invalid lesson completion data.');
  });

  it('rejects a malformed content-pack version', () => {
    expect(() =>
      parseLearnerBackup(backupWithState({ ...createEmptyLearnerState(), contentPackVersion: 2 })),
    ).toThrowError('The backup contains an invalid content-pack version.');
  });

  it('accepts versioned correction and mastery data', () => {
    const state = createEmptyLearnerState({ topic: '3.0.0' });
    state.correctionRecords = [
      {
        exerciseId: 'one',
        parallelExerciseId: 'two',
        targetSkill: 'Rule',
        correctedAt: exportedAt,
        nextReviewAt: '2026-08-19T00:00:00.000Z',
        reviewStage: 0,
        reviewAttempts: 0,
      },
    ];
    expect(parseLearnerBackup(backupWithState(state)).state.correctionRecords).toEqual(
      state.correctionRecords,
    );
  });

  it('rejects malformed correction and mastery data', () => {
    expect(() =>
      parseLearnerBackup(
        backupWithState({
          ...createEmptyLearnerState(),
          correctionRecords: [{ exerciseId: 'one', reviewStage: 9 }],
        }),
      ),
    ).toThrowError('The backup contains invalid correction and mastery data.');
  });

  it('accepts valid topic and lesson notes', () => {
    const state = createEmptyLearnerState({ topic: '1.0.0' });
    state.learnerNotes = [
      { topicId: 'topic', text: 'Review vowel harmony.', updatedAt: exportedAt },
      {
        topicId: 'topic',
        lessonId: 'lesson-1',
        text: 'Remember the back vowels.',
        updatedAt: exportedAt,
      },
    ];

    expect(parseLearnerBackup(backupWithState(state)).state.learnerNotes).toEqual(
      state.learnerNotes,
    );
  });

  it('rejects malformed, over-limit, and duplicate learner notes', () => {
    const state = createEmptyLearnerState({ topic: '1.0.0' });
    state.learnerNotes = [
      { topicId: 'topic', text: 'First', updatedAt: exportedAt },
      { topicId: 'topic', text: 'Duplicate', updatedAt: exportedAt },
    ];
    expect(() => parseLearnerBackup(backupWithState(state))).toThrowError(
      'The backup contains duplicate learner notes.',
    );

    state.learnerNotes = [{ topicId: 'topic', text: 'x'.repeat(1001), updatedAt: exportedAt }];
    expect(() => parseLearnerBackup(backupWithState(state))).toThrowError(
      'The backup contains invalid learner notes.',
    );
  });
});

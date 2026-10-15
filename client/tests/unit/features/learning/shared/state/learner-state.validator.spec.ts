import { describe, expect, it } from 'vitest';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { isCurrentLearnerState } from '@/features/learning/shared/state/learner-state.validator';
import { SessionMode } from '@/features/learning/shared/state/learner-state.models';

describe('learner-state contract', () => {
  it('accepts the complete current state shape', () => {
    expect(isCurrentLearnerState(createEmptyLearnerState({ topic: '1.0.0' }))).toBe(true);
  });

  it.each<SessionMode>(['test', 'mistakes', 'review'])(
    'accepts a completed %s attempt with a fractional score and mixed outcomes',
    (mode) => {
      const state = stateWithFractionalAttempt(mode);
      expect(isCurrentLearnerState(state)).toBe(true);
    },
  );

  it.each([33, 33.33, 33.4, -1, 101, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects an inconsistent fractional-attempt percentage of %s',
    (percentage) => {
      const state = stateWithFractionalAttempt('test');
      state.attempts[0].percentage = percentage;
      expect(isCurrentLearnerState(state)).toBe(false);
    },
  );

  it('accepts a fractional percentage rounded upward', () => {
    const state = stateWithFractionalAttempt('test', 2);
    expect(isCurrentLearnerState(state)).toBe(true);
  });

  it('rejects inconsistent counts on an otherwise valid fractional attempt', () => {
    const state = stateWithFractionalAttempt('test');
    state.attempts[0].incorrectCount = 2;
    expect(isCurrentLearnerState(state)).toBe(false);
  });

  it('rejects obsolete and incomplete state shapes', () => {
    expect(
      isCurrentLearnerState({ ...createEmptyLearnerState(), contentPackVersion: '1.0.0' }),
    ).toBe(false);
    const incomplete = { ...createEmptyLearnerState() } as Record<string, unknown>;
    delete incomplete['learnerNotes'];
    expect(isCurrentLearnerState(incomplete)).toBe(false);
  });

  it('rejects attempts that omit current scoring fields', () => {
    const state = stateWithFractionalAttempt('test');
    const obsolete = structuredClone(state) as unknown as {
      attempts: Array<Record<string, unknown>>;
    };
    delete obsolete.attempts[0]['skippedCount'];

    expect(isCurrentLearnerState(obsolete)).toBe(false);
  });

  it('rejects internally inconsistent scoring totals', () => {
    const state = stateWithFractionalAttempt('test');
    state.attempts[0].total = 4;

    expect(isCurrentLearnerState(state)).toBe(false);
  });
});

function stateWithFractionalAttempt(mode: SessionMode, correctAnswers: 1 | 2 = 1) {
  const state = createEmptyLearnerState({ topic: '1.0.0' });
  const date = '2026-10-15T10:00:00.000Z';
  state.attempts = [
    {
      id: 'attempt',
      mode,
      topicId: 'topic',
      title: 'Mixed outcomes',
      answers: ['exercise-1', 'exercise-2', 'exercise-3'].map((exerciseId, index) => ({
        exerciseId,
        submittedAnswer: index === 2 ? '' : 'answer',
        correct: index < correctAnswers,
        skipped: index === 2,
        answeredAt: date,
      })),
      startedAt: date,
      completedAt: date,
      correctCount: correctAnswers,
      incorrectCount: 2 - correctAnswers,
      skippedCount: 1,
      total: 3,
      percentage: correctAnswers === 1 ? 33.3 : 66.7,
    },
  ];
  return state;
}

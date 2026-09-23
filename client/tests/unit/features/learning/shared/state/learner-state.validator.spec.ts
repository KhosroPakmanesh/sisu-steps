import { describe, expect, it } from 'vitest';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { isCurrentLearnerState } from '@/features/learning/shared/state/learner-state.validator';

describe('learner-state contract', () => {
  it('accepts the complete current state shape', () => {
    expect(isCurrentLearnerState(createEmptyLearnerState({ topic: '1.0.0' }))).toBe(true);
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
    const state = createEmptyLearnerState({ topic: '1.0.0' });
    state.attempts = [
      {
        id: 'attempt',
        mode: 'test',
        topicId: 'topic',
        testId: 'test',
        title: 'Test',
        startedAt: '2026-09-09T10:00:00.000Z',
        completedAt: '2026-09-09T10:01:00.000Z',
        answers: [],
        correctCount: 1,
        incorrectCount: 0,
        skippedCount: 0,
        total: 1,
        percentage: 100,
      },
    ];
    const obsolete = structuredClone(state) as unknown as {
      attempts: Array<Record<string, unknown>>;
    };
    delete obsolete.attempts[0]['skippedCount'];

    expect(isCurrentLearnerState(obsolete)).toBe(false);
  });

  it('rejects internally inconsistent scoring totals', () => {
    const state = createEmptyLearnerState({ topic: '1.0.0' });
    state.attempts = [
      {
        id: 'attempt',
        mode: 'test',
        topicId: 'topic',
        title: 'Test',
        startedAt: '2026-09-09T10:00:00.000Z',
        completedAt: '2026-09-09T10:01:00.000Z',
        answers: [],
        correctCount: 1,
        incorrectCount: 0,
        skippedCount: 0,
        total: 1,
        percentage: 100,
      },
    ];

    expect(isCurrentLearnerState(state)).toBe(false);
  });
});

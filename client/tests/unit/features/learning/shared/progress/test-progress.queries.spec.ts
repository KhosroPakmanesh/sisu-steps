import { describe, expect, it } from 'vitest';
import { getTestProgress } from '@/features/learning/shared/progress/test-progress.queries';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { learningPack } from '@testing/helpers/unit/learning-content.fixture';

describe('test progress queries', () => {
  it('derives progress from attempts, mistakes, and correction records without stored summaries', () => {
    const state = createEmptyLearnerState({ [learningPack.id]: learningPack.version });
    state.attempts = [
      {
        id: 'attempt-1',
        mode: 'test',
        topicId: learningPack.id,
        testId: 'test-1',
        title: 'Test 1',
        startedAt: '2026-09-07T08:00:00.000Z',
        completedAt: '2026-09-07T08:05:00.000Z',
        answers: [],
        correctCount: 0,
        incorrectCount: 1,
        skippedCount: 0,
        total: 1,
        percentage: 0,
      },
      {
        id: 'attempt-2',
        mode: 'test',
        topicId: learningPack.id,
        testId: 'test-1',
        title: 'Test 1',
        startedAt: '2026-09-07T09:00:00.000Z',
        completedAt: '2026-09-07T09:05:00.000Z',
        answers: [],
        correctCount: 1,
        incorrectCount: 0,
        skippedCount: 0,
        total: 1,
        percentage: 100,
      },
    ];
    state.unresolvedMistakeIds = ['exercise-1'];
    state.correctionRecords = [
      {
        exerciseId: 'exercise-1',
        parallelExerciseId: 'exercise-2',
        targetSkill: 'Vowel harmony',
        correctedAt: '2026-09-07T09:05:00.000Z',
        nextReviewAt: '2026-09-08T09:05:00.000Z',
        reviewStage: 0,
        reviewAttempts: 0,
      },
    ];

    expect(getTestProgress(state, learningPack, 'test-1')).toEqual({
      testId: 'test-1',
      attempts: 2,
      latest: 100,
      best: 100,
      average: 50,
      mistakes: 1,
      firstAttempt: 0,
      independentCorrect: 1,
      skipped: 0,
      corrected: 1,
      mastered: 0,
    });
    expect(Object.hasOwn(state, 'reports')).toBe(false);
  });
});

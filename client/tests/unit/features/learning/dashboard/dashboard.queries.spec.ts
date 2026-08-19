import { describe, expect, it } from 'vitest';
import {
  getContinueLearningTarget,
  getTopicSummary,
} from '@/features/learning/dashboard/dashboard.queries';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { CompletedAttempt, StudySession } from '@/shared/domain/learner-state.models';
import { learningPack } from '../../../fixtures/learning-content.fixture';

describe('dashboard queries', () => {
  it('summarizes distinct attempted tests and version-matched lessons', () => {
    const state = createEmptyLearnerState({ topic: learningPack.version });
    state.attempts = [
      completedAttempt('attempt-1', 'test-1'),
      completedAttempt('attempt-2', 'test-1'),
    ];
    state.lessonCompletions = [
      {
        lessonId: 'lesson-1',
        lessonVersion: '1.0.0',
        completedAt: '2026-08-18T00:00:00.000Z',
      },
    ];

    const summary = getTopicSummary(state, [learningPack], learningPack);
    expect(summary.attemptedTests).toBe(1);
    expect(summary.attempts).toBe(2);
    expect(summary.completedLessons).toBe(1);
    expect(summary.exercises).toBe(2);
  });

  it('resumes the most recently updated valid saved session', () => {
    const state = createEmptyLearnerState({ topic: learningPack.version });
    state.sessions = [
      savedSession('older-session', 'test-1', '2026-08-18T09:00:00.000Z'),
      savedSession('newer-session', 'test-2', '2026-08-18T10:00:00.000Z'),
    ];

    expect(getContinueLearningTarget(state, [learningPack])).toMatchObject({
      mode: 'test',
      topicId: 'topic',
      testId: 'test-2',
      actionLabel: 'Resume test',
    });
  });

  it('ignores invalid saved content and recommends the first untried test', () => {
    const state = createEmptyLearnerState({ topic: learningPack.version });
    state.sessions = [savedSession('invalid-session', 'removed-test', '2026-08-18T10:00:00.000Z')];

    expect(getContinueLearningTarget(state, [learningPack])).toMatchObject({
      testId: 'test-1',
      actionLabel: 'Start next test',
    });
  });

  it('advances the recommendation in authored order after an attempt', () => {
    const state = createEmptyLearnerState({ topic: learningPack.version });
    state.attempts = [completedAttempt('attempt-1', 'test-1')];

    expect(getContinueLearningTarget(state, [learningPack])?.testId).toBe('test-2');
  });
});

function completedAttempt(id: string, testId: string): CompletedAttempt {
  return {
    id,
    mode: 'test',
    topicId: 'topic',
    testId,
    title: testId,
    startedAt: '2026-08-18T00:00:00.000Z',
    completedAt: '2026-08-18T00:01:00.000Z',
    answers: [],
    correctCount: 1,
    incorrectCount: 0,
    skippedCount: 0,
    total: 1,
    percentage: 100,
  };
}

function savedSession(id: string, testId: string, updatedAt: string): StudySession {
  return {
    id,
    mode: 'test',
    topicId: 'topic',
    testId,
    title: testId,
    exerciseIds: [testId === 'test-2' ? 'exercise-2' : 'exercise-1'],
    currentIndex: 0,
    answers: [],
    startedAt: '2026-08-18T00:00:00.000Z',
    updatedAt,
  };
}

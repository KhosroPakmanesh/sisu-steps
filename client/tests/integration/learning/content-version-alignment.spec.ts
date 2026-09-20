import { describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { alignLearnerStateWithPacks } from '@/features/learning/shared/state/align-learner-state.policy';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { learningPack } from '@testing/helpers/unit/learning-content.fixture';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';

describe('content-pack version alignment', () => {
  it('resets all learner data when a stored pack is no longer supported', () => {
    const oldState = createEmptyLearnerState({ topic: '1.0.0', 'removed-topic': '1.0.0' });
    oldState.attempts = [completedAttempt('current-attempt', 'topic', 'test-1')];
    oldState.unresolvedMistakeIds = ['exercise-1'];
    oldState.learnerNotes = [
      {
        topicId: 'topic',
        text: 'This current-topic data is intentionally reset too.',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
    ];

    expect(alignLearnerStateWithPacks(oldState, [topicPackToSummary(learningPack)])).toEqual(
      createEmptyLearnerState({ topic: '1.0.0' }),
    );
  });

  it('preserves compatible data and records newly installed packs', () => {
    const state = createEmptyLearnerState({ topic: '1.0.0' });
    state.unresolvedMistakeIds = ['exercise-1'];
    const secondPack = renamedPack('topic-two', '2.0.0');

    const aligned = alignLearnerStateWithPacks(
      state,
      [learningPack, secondPack].map(topicPackToSummary),
    );
    expect(aligned.unresolvedMistakeIds).toEqual(['exercise-1']);
    expect(aligned.contentPackVersions).toEqual({ topic: '1.0.0', 'topic-two': '2.0.0' });
  });

  it('clears only the topic whose installed version changed', () => {
    const secondPack = renamedPack('topic-two', '2.0.0');
    const state = createEmptyLearnerState({ topic: '0.9.0', 'topic-two': '2.0.0' });
    state.unresolvedMistakeIds = ['exercise-1', 'topic-two-exercise-1'];
    state.attempts = [
      completedAttempt('old-topic-attempt', 'topic', 'test-1'),
      completedAttempt('other-topic-attempt', 'topic-two', 'topic-two-test-1'),
    ];
    state.learnerNotes = [
      {
        topicId: 'topic',
        text: 'Keep this topic note.',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
    ];

    const aligned = alignLearnerStateWithPacks(
      state,
      [learningPack, secondPack].map(topicPackToSummary),
    );
    expect(aligned.attempts.map((attempt) => attempt.id)).toEqual(['other-topic-attempt']);
    expect(aligned.unresolvedMistakeIds).toEqual(['topic-two-exercise-1']);
    expect(aligned.learnerNotes.map((note) => note.text)).toEqual(['Keep this topic note.']);
  });
});

function renamedPack(id: string, version: string): TopicPack {
  const pack = structuredClone(learningPack);
  pack.id = id;
  pack.version = version;
  pack.lessons[0].id = `${id}-lesson`;
  pack.lessons[0].practiceExercises = pack.lessons[0].practiceExercises.map((exercise, index) => ({
    ...exercise,
    id: `${id}-practice-${index + 1}`,
  }));
  pack.tests = pack.tests.map((test, testIndex) => ({
    ...test,
    id: `${id}-test-${testIndex + 1}`,
    lessonIds: [`${id}-lesson`],
    exercises: test.exercises.map((exercise, exerciseIndex) => ({
      ...exercise,
      id: `${id}-exercise-${testIndex + exerciseIndex + 1}`,
      parallelExerciseId: `${id}-exercise-${testIndex === 0 ? 2 : 1}`,
    })),
  }));
  return pack;
}

function completedAttempt(id: string, topicId: string, testId: string) {
  return {
    id,
    mode: 'test' as const,
    topicId,
    testId,
    title: 'Attempt',
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

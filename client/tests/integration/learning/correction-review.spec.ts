import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  correctionCount,
  dueCorrections,
} from '@/features/learning/shared/progress/correction.queries';
import { getTestProgress } from '@/features/learning/shared/progress/test-progress.queries';
import {
  completeTestAnswer,
  createLearningTestContext,
  LearningTestContext,
} from '@testing/helpers/integration/learning-testbed';

describe('correction and review workflow', () => {
  let context: LearningTestContext;

  beforeEach(async () => {
    context = await createLearningTestContext();
  });

  it('requires a different due exercise before granting mastery', async () => {
    vi.useFakeTimers();
    vi.setSystemTime('2026-08-18T08:00:00.000Z');
    try {
      await completeTestAnswer(context, 'talossä');
      const correction = await context.sessions.getOrCreateMistakeSession('topic');
      await context.answers.submitAnswer(correction!.id, 'talossa');
      await context.answers.advanceSession(correction!.id);

      expect(
        dueCorrections(
          context.store.learnerState(),
          context.store.packSummaries(),
          'topic',
          new Date('2026-08-19T07:59:59.000Z'),
        ),
      ).toHaveLength(0);
      vi.setSystemTime('2026-08-19T08:00:00.000Z');
      const review = await context.sessions.getOrCreateReviewSession('topic');
      expect(review?.exerciseIds).toEqual(['exercise-2']);
      expect(review?.sourceExerciseIds).toEqual(['exercise-1']);

      await context.answers.submitAnswer(review!.id, 'koulussa');
      expect((await context.answers.advanceSession(review!.id))?.mode).toBe('review');
      expect(correctionCount(context.store.learnerState(), false)).toBe(0);
      expect(correctionCount(context.store.learnerState(), true)).toBe(1);
      expect(
        getTestProgress(
          context.store.learnerState(),
          (await context.store.loadPack('topic')).pack,
          'test-1',
        ),
      ).toMatchObject({ firstAttempt: 0, corrected: 0, mastered: 1 });
    } finally {
      vi.useRealTimers();
    }
  });

  it('reschedules an unsuccessful review after three days', async () => {
    vi.useFakeTimers();
    vi.setSystemTime('2026-08-18T08:00:00.000Z');
    try {
      await completeTestAnswer(context, 'wrong');
      const correction = await context.sessions.getOrCreateMistakeSession('topic');
      await context.answers.submitAnswer(correction!.id, 'talossa');
      await context.answers.advanceSession(correction!.id);

      vi.setSystemTime('2026-08-19T08:00:00.000Z');
      const review = await context.sessions.getOrCreateReviewSession('topic');
      await context.answers.submitAnswer(review!.id, 'wrong');
      await context.answers.advanceSession(review!.id);

      expect(context.store.learnerState().correctionRecords[0]).toMatchObject({
        reviewStage: 1,
        reviewAttempts: 1,
        nextReviewAt: '2026-08-22T08:00:00.000Z',
      });
    } finally {
      vi.useRealTimers();
    }
  });
});

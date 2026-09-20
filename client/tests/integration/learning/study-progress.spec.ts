import { beforeEach, describe, expect, it } from 'vitest';
import { correctionCount } from '@/features/learning/shared/progress/correction.queries';
import { mistakeCount } from '@/features/learning/shared/progress/progress-statistics.queries';
import { getTestProgress } from '@/features/learning/shared/progress/test-progress.queries';
import {
  completeTestAnswer,
  createLearningTestContext,
  LearningTestContext,
} from '@testing/helpers/integration/learning-testbed';

describe('study progress workflow', () => {
  let context: LearningTestContext;

  beforeEach(async () => {
    context = await createLearningTestContext();
  });

  it('records installed pack versions once', async () => {
    expect(context.repository.saveCount).toBe(1);
    expect(context.repository.state.contentPackVersions).toEqual({ topic: '1.0.0' });

    await context.store.initialize();

    expect(context.repository.saveCount).toBe(1);
  });

  it('saves unfinished progress and completes an attempt', async () => {
    const session = await context.sessions.getOrCreateTestSession('topic', 'test-1');
    await context.answers.submitAnswer(session.id, 'talossa');
    expect(context.store.learnerState().sessions[0].answers).toHaveLength(1);

    const attempt = await context.answers.advanceSession(session.id);
    expect(attempt?.percentage).toBe(100);
    expect(
      getTestProgress(
        context.store.learnerState(),
        (await context.store.loadPack('topic')).pack,
        'test-1',
      ),
    ).toMatchObject({ attempts: 1, latest: 100, best: 100, average: 100 });
  });

  it('adds an incorrect exercise to mistakes and resolves it after a correct retry', async () => {
    await completeTestAnswer(context, 'talossä');
    expect(mistakeCount(context.store.learnerState())).toBe(1);

    await completeTestAnswer(context, 'talossa');

    expect(mistakeCount(context.store.learnerState())).toBe(0);
    expect(correctionCount(context.store.learnerState(), false)).toBe(1);
    expect(correctionCount(context.store.learnerState(), true)).toBe(0);
  });

  it('records a revealed answer as skipped without creating a mistake', async () => {
    const session = await context.sessions.getOrCreateTestSession('topic', 'test-1');
    expect(await context.answers.revealAnswer(session.id)).toMatchObject({
      exerciseId: 'exercise-1',
      correct: false,
      skipped: true,
    });
    expect(mistakeCount(context.store.learnerState())).toBe(0);
    expect(await context.answers.advanceSession(session.id)).toMatchObject({
      correctCount: 0,
      incorrectCount: 0,
      skippedCount: 1,
      total: 1,
      percentage: 0,
    });
  });

  it('does not resolve an existing mistake when its answer is revealed', async () => {
    await completeTestAnswer(context, 'talossä');
    const practice = await context.sessions.getOrCreateMistakeSession('topic');
    await context.answers.revealAnswer(practice!.id);
    await context.answers.advanceSession(practice!.id);

    expect(mistakeCount(context.store.learnerState())).toBe(1);
  });
});

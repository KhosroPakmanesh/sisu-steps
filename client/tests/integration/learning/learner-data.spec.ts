import { beforeEach, describe, expect, it } from 'vitest';
import { lessonProgressForTest } from '@/features/learning/shared/progress/lesson-progress.queries';
import {
  createLearningTestContext,
  LearningTestContext,
} from '@testing/helpers/integration/learning-testbed';

describe('learner-data workflow', () => {
  let context: LearningTestContext;

  beforeEach(async () => {
    context = await createLearningTestContext();
  });

  it('stores shared versioned lesson completion and clears it only with the topic', async () => {
    expect(
      lessonProgressForTest(
        context.store.learnerState(),
        context.store.packSummaries(),
        'topic',
        'test-1',
      ),
    ).toEqual({ completed: 0, total: 1 });
    await context.lessons.completeLesson('topic', 'lesson-1');
    await context.clearing.clearTest('topic', 'test-1');
    expect(
      lessonProgressForTest(
        context.store.learnerState(),
        context.store.packSummaries(),
        'topic',
        'test-2',
      ),
    ).toEqual({ completed: 1, total: 1 });

    await context.clearing.clearTopic('topic');
    expect(
      lessonProgressForTest(
        context.store.learnerState(),
        context.store.packSummaries(),
        'topic',
        'test-2',
      ).completed,
    ).toBe(0);
  });

  it('saves, backs up, restores, and deliberately clears learner notes', async () => {
    await context.notes.save('topic', undefined, 'Review vowel harmony.');
    await context.notes.save('topic', 'lesson-1', 'Remember the back vowels.');
    const backup = context.backups.create();

    await context.clearing.clearTest('topic', 'test-1');
    expect(context.store.learnerState().learnerNotes).toHaveLength(2);

    await context.clearing.clearTopic('topic');
    expect(context.store.learnerState().learnerNotes).toEqual([]);

    await context.backups.restore(backup);
    expect(context.store.learnerState().learnerNotes.map((note) => note.text)).toEqual([
      'Review vowel harmony.',
      'Remember the back vowels.',
    ]);

    await context.clearing.clearAll();
    expect(context.store.learnerState().learnerNotes).toEqual([]);
  });

  it('rejects note scopes that are not installed', async () => {
    const backup = context.backups.create();
    backup.state.learnerNotes = [
      {
        topicId: 'topic',
        lessonId: 'missing',
        text: 'Orphaned note',
        updatedAt: backup.exportedAt,
      },
    ];

    await expect(context.backups.restore(backup)).rejects.toThrowError(
      'This backup refers to note topics or lessons that are not installed.',
    );
  });

  it('rejects backup references to unavailable content or incompatible corrections', async () => {
    const missingLesson = context.backups.create();
    missingLesson.state.lessonCompletions = [
      { lessonId: 'missing', lessonVersion: '1.0.0', completedAt: missingLesson.exportedAt },
    ];
    await expect(context.backups.restore(missingLesson)).rejects.toThrowError(
      'This backup refers to lessons that are not installed in this app.',
    );

    const missingVersion = context.backups.create();
    missingVersion.state.contentPackVersions = {};
    missingVersion.state.unresolvedMistakeIds = ['exercise-1'];
    await expect(context.backups.restore(missingVersion)).rejects.toThrowError(
      'This backup contains progress for an exercise pack it does not record.',
    );

    const incompatible = context.backups.create();
    incompatible.state.correctionRecords = [
      {
        exerciseId: 'exercise-1',
        parallelExerciseId: 'exercise-2',
        targetSkill: 'Different skill',
        correctedAt: incompatible.exportedAt,
        nextReviewAt: '2026-08-19T00:00:00.000Z',
        reviewStage: 0,
        reviewAttempts: 0,
      },
    ];
    await expect(context.backups.restore(incompatible)).rejects.toThrowError(
      'This backup contains incompatible correction and mastery data.',
    );
  });
});

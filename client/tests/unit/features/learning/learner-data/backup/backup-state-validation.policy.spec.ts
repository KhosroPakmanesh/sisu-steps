import { describe, expect, it } from 'vitest';
import {
  prepareBackupState,
  validatedBackupState,
} from '@/features/learning/learner-data/backup/backup-state-validation.policy';
import { LearnerBackup } from '@/features/learning/learner-data/backup/backup.models';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { learningPack } from '@testing/helpers/unit/learning-content.fixture';

describe('backup state validation policy', () => {
  it('keeps compatible learner state without changing the serialized contract', () => {
    const backup = createBackup();
    expect(validatedBackupState(backup, [learningPack])).toEqual(backup.state);
  });

  it('accepts new installed packs and initializes their versions without progress', () => {
    const addedPack: TopicPack = {
      ...structuredClone(learningPack),
      id: 'new-topic',
      title: 'New topic',
      lessons: [],
      tests: [],
    };

    const prepared = prepareBackupState(createBackup(), [learningPack, addedPack]);

    expect(prepared.state.contentPackVersions).toEqual({
      [learningPack.id]: learningPack.version,
      [addedPack.id]: addedPack.version,
    });
    expect(prepared.compatibility.addedPacks).toEqual([{ id: 'new-topic', title: 'New topic' }]);
  });

  it('discards changed-pack progress while preserving valid topic and lesson notes', () => {
    const backup = createBackup();
    backup.state.attempts = [completedAttempt()];
    backup.state.sessions = [unfinishedSession()];
    backup.state.unresolvedMistakeIds = ['exercise-1'];
    backup.state.lessonCompletions = [
      { lessonId: 'lesson-1', lessonVersion: '1.0.0', completedAt: date },
    ];
    backup.state.correctionRecords = [
      {
        exerciseId: 'exercise-1',
        parallelExerciseId: 'exercise-2',
        targetSkill: 'Vowel harmony',
        correctedAt: date,
        nextReviewAt: date,
        reviewStage: 0,
        reviewAttempts: 1,
      },
    ];
    backup.state.learnerNotes = [
      { topicId: 'topic', text: 'Topic note', updatedAt: date },
      { topicId: 'topic', lessonId: 'lesson-1', text: 'Lesson note', updatedAt: date },
      { topicId: 'topic', lessonId: 'removed-lesson', text: 'Old note', updatedAt: date },
    ];
    const changedPack = { ...structuredClone(learningPack), version: '2.0.0' };

    const prepared = prepareBackupState(backup, [changedPack]);

    expect(prepared.compatibility.changedPacks).toEqual([
      { id: learningPack.id, title: learningPack.title },
    ]);
    expect(prepared.state.attempts).toEqual([]);
    expect(prepared.state.sessions).toEqual([]);
    expect(prepared.state.unresolvedMistakeIds).toEqual([]);
    expect(prepared.state.lessonCompletions).toEqual([]);
    expect(prepared.state.correctionRecords).toEqual([]);
    expect(prepared.state.learnerNotes.map((note) => note.text)).toEqual([
      'Topic note',
      'Lesson note',
    ]);
  });

  it('rejects a backup containing a removed pack', () => {
    const backup = createBackup();
    backup.state.contentPackVersions = { removed: '1.0.0' };

    expect(() => validatedBackupState(backup, [learningPack])).toThrowError(
      'This backup contains an exercise pack that is no longer installed.',
    );
  });

  it('rejects unknown references when pack versions are otherwise compatible', () => {
    const backup = createBackup();
    backup.state.unresolvedMistakeIds = ['unknown-exercise'];

    expect(() => validatedBackupState(backup, [learningPack])).toThrowError(
      'This backup refers to exercises that are not installed in this app.',
    );
  });
});

const date = '2026-09-07T10:00:00.000Z';

function createBackup(): LearnerBackup {
  return {
    backupType: 'finnish-exercise-book',
    backupVersion: 1,
    exportedAt: date,
    state: createEmptyLearnerState({ [learningPack.id]: learningPack.version }),
  };
}

function submittedAnswer() {
  return {
    exerciseId: 'exercise-1',
    submittedAnswer: 'talossa',
    correct: true,
    skipped: false,
    answeredAt: date,
  };
}

function completedAttempt() {
  return {
    id: 'attempt-1',
    mode: 'test' as const,
    topicId: 'topic',
    testId: 'test-1',
    title: 'Test 1',
    startedAt: date,
    completedAt: date,
    answers: [submittedAnswer()],
    correctCount: 1,
    incorrectCount: 0,
    skippedCount: 0,
    total: 1,
    percentage: 100,
  };
}

function unfinishedSession() {
  return {
    id: 'session-1',
    mode: 'test' as const,
    topicId: 'topic',
    testId: 'test-1',
    title: 'Test 1',
    exerciseIds: ['exercise-1'],
    currentIndex: 1,
    answers: [submittedAnswer()],
    startedAt: date,
    updatedAt: date,
  };
}

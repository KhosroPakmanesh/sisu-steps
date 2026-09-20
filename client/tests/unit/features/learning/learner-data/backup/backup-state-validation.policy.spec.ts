import { describe, expect, it } from 'vitest';
import { validatedBackupState } from '@/features/learning/learner-data/backup/backup-state-validation.policy';
import { LearnerBackup } from '@/features/learning/learner-data/backup/backup.models';
import { learningPack } from '@testing/helpers/unit/learning-content.fixture';

describe('backup state validation policy', () => {
  it('keeps compatible learner state without changing the serialized contract', () => {
    const backup: LearnerBackup = {
      backupType: 'finnish-exercise-book',
      backupVersion: 1,
      exportedAt: '2026-09-07T10:00:00.000Z',
      state: {
        schemaVersion: 1,
        contentPackVersions: { [learningPack.id]: learningPack.version },
        attempts: [],
        sessions: [],
        unresolvedMistakeIds: [],
        lessonCompletions: [],
        correctionRecords: [],
        learnerNotes: [],
      },
    };

    expect(validatedBackupState(backup, [learningPack])).toEqual(backup.state);
  });

  it('rejects a backup whose pack set is not the current installed set', () => {
    const backup: LearnerBackup = {
      backupType: 'finnish-exercise-book',
      backupVersion: 1,
      exportedAt: '2026-09-07T10:00:00.000Z',
      state: {
        schemaVersion: 1,
        contentPackVersions: {},
        attempts: [],
        sessions: [],
        unresolvedMistakeIds: [],
        lessonCompletions: [],
        correctionRecords: [],
        learnerNotes: [],
      },
    };

    expect(() => validatedBackupState(backup, [learningPack])).toThrowError(
      'This backup belongs to a different exercise-pack version.',
    );
  });
});

import { describe, expect, it } from 'vitest';
import { compatibleBackupState } from '@/features/learning/learner-data/backup-compatibility.policy';
import { LearnerBackup } from '@/features/learning/learner-data/backup.models';
import { learningPack } from '@testing/helpers/unit/learning-content.fixture';

describe('backup compatibility policy', () => {
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

    expect(compatibleBackupState(backup, [learningPack])).toEqual(backup.state);
  });
});

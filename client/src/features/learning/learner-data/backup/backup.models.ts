import { LearnerState } from '../../shared/state/learner-state.models';

export interface LearnerBackup {
  backupType: 'finnish-exercise-book';
  backupVersion: 1;
  exportedAt: string;
  state: LearnerState;
}

export interface BackupPackChange {
  id: string;
  title: string;
}

export interface BackupCompatibility {
  addedPacks: BackupPackChange[];
  changedPacks: BackupPackChange[];
}

export interface BackupDataSummary {
  attempts: number;
  unfinishedSessions: number;
  unresolvedMistakes: number;
  completedLessons: number;
  privateNotes: number;
}

export interface PreparedLearnerBackup {
  backup: LearnerBackup;
  state: LearnerState;
  compatibility: BackupCompatibility;
  summary: BackupDataSummary;
}

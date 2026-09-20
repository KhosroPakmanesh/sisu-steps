import { LearnerBackup } from './backup.models';
import { isCurrentLearnerState } from '../../shared/state/learner-state.validator';

export function parseLearnerBackup(value: unknown): LearnerBackup {
  if (!isBackupEnvelope(value)) {
    throw new Error('This file is not a supported Finnish exercise-book backup.');
  }
  if (!isCurrentLearnerState(value.state)) {
    throw new Error('This backup uses an unsupported learner-data format.');
  }
  return { ...value, state: value.state };
}

interface BackupEnvelope {
  backupType: 'finnish-exercise-book';
  backupVersion: 1;
  exportedAt: string;
  state: unknown;
}

function isBackupEnvelope(value: unknown): value is BackupEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'backupType' in value &&
    value.backupType === 'finnish-exercise-book' &&
    'backupVersion' in value &&
    value.backupVersion === 1 &&
    'exportedAt' in value &&
    validDate(value.exportedAt) &&
    'state' in value
  );
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

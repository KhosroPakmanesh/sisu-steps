import { LearnerState } from '../shared/state/learner-state.models';

export interface LearnerBackup {
  backupType: 'finnish-exercise-book';
  backupVersion: 1;
  exportedAt: string;
  state: LearnerState;
}

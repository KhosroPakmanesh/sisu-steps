import { inject, Injectable } from '@angular/core';
import { LearnerBackup } from './backup.models';
import { LearningStateStore } from '../shared/state/learning-state.store';
import { validatedBackupState } from './backup-state-validation.policy';
import { parseLearnerBackup } from './learner-backup.validator';

@Injectable({ providedIn: 'root' })
export class BackupService {
  private readonly store = inject(LearningStateStore);

  create(): LearnerBackup {
    return {
      backupType: 'finnish-exercise-book',
      backupVersion: 1,
      exportedAt: new Date().toISOString(),
      state: structuredClone(this.store.learnerState()),
    };
  }

  async restore(value: unknown): Promise<void> {
    const backup = parseLearnerBackup(value);
    await this.store.replace(validatedBackupState(backup, await this.store.loadAllPacks()));
  }
}

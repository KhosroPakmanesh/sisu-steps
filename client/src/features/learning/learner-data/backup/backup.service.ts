import { inject, Injectable } from '@angular/core';
import { LearnerBackup, PreparedLearnerBackup } from './backup.models';
import { LearningStateStore } from '../../shared/state/learning-state.store';
import { prepareBackupState } from './backup-state-validation.policy';
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

  async prepare(value: unknown): Promise<PreparedLearnerBackup> {
    const backup = parseLearnerBackup(value);
    const prepared = prepareBackupState(backup, await this.store.loadAllPacks());
    return {
      backup,
      ...prepared,
      summary: {
        attempts: prepared.state.attempts.length,
        unfinishedSessions: prepared.state.sessions.length,
        unresolvedMistakes: prepared.state.unresolvedMistakeIds.length,
        completedLessons: prepared.state.lessonCompletions.length,
        privateNotes: prepared.state.learnerNotes.length,
      },
    };
  }

  async restore(value: unknown): Promise<void> {
    await this.restorePrepared(await this.prepare(value));
  }

  async restorePrepared(prepared: PreparedLearnerBackup): Promise<void> {
    await this.store.replace(prepared.state);
  }
}

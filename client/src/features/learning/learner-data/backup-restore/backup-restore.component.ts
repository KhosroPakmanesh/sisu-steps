import { Component, inject, signal } from '@angular/core';
import { TextFileAdapter } from '@/shared/browser/text-file.adapter';
import { LearningStateStore } from '../../shared/state/learning-state.store';
import { BackupService } from '../backup/backup.service';
import { PreparedLearnerBackup } from '../backup/backup.models';
import { ClearHistoryService } from '../clear-history.service';
import {
  ConfirmationSheetComponent,
  ConfirmationSheetRequest,
} from '../confirmation/confirmation-sheet.component';

interface PendingLocalAction {
  request: ConfirmationSheetRequest;
  action: () => Promise<void>;
  successMessage: string;
}

@Component({
  selector: 'app-backup-restore',
  imports: [ConfirmationSheetComponent],
  templateUrl: './backup-restore.component.html',
  styleUrls: ['./backup-restore.component.css', './backup-restore.component-interactions.css'],
})
export class BackupRestoreComponent {
  protected readonly store = inject(LearningStateStore);
  protected readonly message = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly pendingAction = signal<PendingLocalAction | null>(null);
  private readonly backups = inject(BackupService);
  private readonly clearing = inject(ClearHistoryService);
  private readonly files = inject(TextFileAdapter);

  protected exportBackup(): void {
    this.resetNotices();
    const filename = `finnish-exercise-book-${new Date().toISOString().slice(0, 10)}.json`;
    this.files.downloadJson(filename, this.backups.create());
    this.message.set('Your backup was downloaded.');
  }

  protected async importBackup(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.resetNotices();
    try {
      const prepared = await this.backups.prepare(await this.files.readJson(file));
      if (prepared.compatibility.changedPacks.length) {
        this.pendingAction.set(this.restoreRequest(prepared));
      } else {
        await this.backups.restorePrepared(prepared);
        this.message.set('Backup restored successfully.');
      }
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The backup could not be imported.');
    } finally {
      input.value = '';
    }
  }

  protected clearAll(): void {
    this.resetNotices();
    this.pendingAction.set({
      request: {
        eyebrow: 'Every topic and test',
        title: 'Clear all learner history?',
        message:
          'Every attempt, unfinished session, mistake, lesson completion, and private note will be removed from this device. Any Drive checkpoint remains available.',
        confirmLabel: 'Clear all history',
        closeLabel: 'Cancel clearing history',
      },
      action: () => this.clearing.clearAll(),
      successMessage: 'All learner history was cleared from this device.',
    });
  }

  protected async resolveAction(confirmed: boolean): Promise<void> {
    const pending = this.pendingAction();
    this.pendingAction.set(null);
    if (!confirmed || !pending) return;
    this.resetNotices();
    try {
      await pending.action();
      this.message.set(pending.successMessage);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The data could not be cleared.');
    }
  }

  private resetNotices(): void {
    this.message.set(null);
    this.error.set(null);
  }

  private restoreRequest(prepared: PreparedLearnerBackup): PendingLocalAction {
    const changed = prepared.compatibility.changedPacks.map((pack) => pack.title).join(', ');
    return {
      request: {
        eyebrow: 'Exercise packs changed',
        title: 'Restore this backup file?',
        message: 'Current local progress will be replaced by the validated backup.',
        details: [
          `Incompatible progress will be discarded for: ${changed}.`,
          'Discarded categories: attempts, unfinished sessions, mistakes, correction and mastery records, and lesson completions.',
          'Topic notes remain; lesson notes remain only when their lesson still exists.',
        ],
        confirmLabel: 'Restore backup',
        closeLabel: 'Cancel restoring the backup file',
      },
      action: () => this.backups.restorePrepared(prepared),
      successMessage: 'Backup restored successfully.',
    };
  }
}

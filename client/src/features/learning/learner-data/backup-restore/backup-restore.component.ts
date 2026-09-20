import { Component, inject, signal } from '@angular/core';
import { TextFileAdapter } from '@/shared/browser/text-file.adapter';
import { LearningStateStore } from '../../shared/state/learning-state.store';
import { BackupService } from '../backup/backup.service';
import { ClearHistoryService } from '../clear-history.service';
import {
  ConfirmationSheetComponent,
  ConfirmationSheetRequest,
} from '../confirmation/confirmation-sheet.component';

interface PendingClear {
  request: ConfirmationSheetRequest;
  action: () => Promise<void>;
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
  protected readonly pendingClear = signal<PendingClear | null>(null);
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
      await this.backups.restore(await this.files.readJson(file));
      this.message.set('Backup restored successfully.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The backup could not be imported.');
    } finally {
      input.value = '';
    }
  }

  protected clearAll(): void {
    this.resetNotices();
    this.pendingClear.set({
      request: {
        eyebrow: 'Every topic and test',
        title: 'Clear all learner history?',
        message:
          'Every attempt, unfinished session, mistake, lesson completion, and private note will be removed. This cannot be undone without a backup.',
        confirmLabel: 'Clear all history',
      },
      action: () => this.clearing.clearAll(),
    });
  }

  protected async resolveClear(confirmed: boolean): Promise<void> {
    const pending = this.pendingClear();
    this.pendingClear.set(null);
    if (!confirmed || !pending) return;
    this.resetNotices();
    try {
      await pending.action();
      this.message.set('All learner history was cleared.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The data could not be cleared.');
    }
  }

  private resetNotices(): void {
    this.message.set(null);
    this.error.set(null);
  }
}

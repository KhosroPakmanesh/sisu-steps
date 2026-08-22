import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TextFileAdapter } from '@/shared/browser/text-file.adapter';
import { routePaths } from '@/shared/navigation/route-paths';
import { LearningStateStore } from '../shared/state/learning-state.store';
import { BackupService } from './backup.service';
import { ClearProgressService } from './clear-progress.service';
import {
  ConfirmationSheetComponent,
  ConfirmationSheetRequest,
} from './confirmation-sheet.component';

interface PendingClear {
  request: ConfirmationSheetRequest;
  action: () => Promise<void>;
  successMessage: string;
}

@Component({
  selector: 'app-data-settings',
  imports: [RouterLink, ConfirmationSheetComponent],
  templateUrl: './data-settings.page.html',
  styleUrl: './data-settings.page.css',
})
export class DataSettingsPage {
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = routePaths;
  protected readonly message = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly pendingClear = signal<PendingClear | null>(null);
  private readonly backups = inject(BackupService);
  private readonly clearing = inject(ClearProgressService);
  private readonly files = inject(TextFileAdapter);

  protected exportBackup(): void {
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

  protected clearTest(topicId: string, testId: string, title: string): void {
    this.requestClear(
      {
        eyebrow: 'One test only',
        title: `Clear “${title}”?`,
        message: 'All saved attempts and mistakes for this test will be removed.',
        confirmLabel: 'Clear this test',
      },
      () => this.clearing.clearTest(topicId, testId),
      `${title} history was cleared.`,
    );
  }

  protected clearTopic(topicId: string, title: string): void {
    this.requestClear(
      {
        eyebrow: 'This topic only',
        title: `Clear “${title}”?`,
        message:
          'All saved progress for this topic will be removed. Its exercises remain available.',
        confirmLabel: 'Clear this topic',
      },
      () => this.clearing.clearTopic(topicId),
      `${title} history was cleared.`,
    );
  }

  protected clearAll(): void {
    this.requestClear(
      {
        eyebrow: 'Every topic and test',
        title: 'Clear all learner history?',
        message:
          'Every attempt, unfinished session, mistake, and lesson completion will be removed. This cannot be undone without a backup.',
        confirmLabel: 'Clear all history',
      },
      () => this.clearing.clearAll(),
      'All learner history was cleared.',
    );
  }

  protected async resolveClear(confirmed: boolean): Promise<void> {
    const pending = this.pendingClear();
    this.pendingClear.set(null);
    if (!confirmed || !pending) return;
    await this.runClear(pending.action, pending.successMessage);
  }

  private async runClear(action: () => Promise<void>, successMessage: string): Promise<void> {
    this.resetNotices();
    try {
      await action();
      this.message.set(successMessage);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The data could not be cleared.');
    }
  }

  private resetNotices(): void {
    this.message.set(null);
    this.error.set(null);
  }

  private requestClear(
    request: ConfirmationSheetRequest,
    action: () => Promise<void>,
    successMessage: string,
  ): void {
    this.pendingClear.set({ request, action, successMessage });
  }
}

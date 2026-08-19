import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationAdapter } from '@/shared/browser/confirmation.adapter';
import { TextFileAdapter } from '@/shared/browser/text-file.adapter';
import { routePaths } from '@/shared/navigation/route-paths';
import { LearningStateStore } from '../shared/state/learning-state.store';
import { BackupService } from './backup.service';
import { ClearProgressService } from './clear-progress.service';

@Component({
  selector: 'app-data-settings',
  imports: [RouterLink],
  templateUrl: './data-settings.page.html',
  styleUrl: './data-settings.page.css',
})
export class DataSettingsPage {
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = routePaths;
  protected readonly message = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  private readonly backups = inject(BackupService);
  private readonly clearing = inject(ClearProgressService);
  private readonly files = inject(TextFileAdapter);
  private readonly confirmation = inject(ConfirmationAdapter);

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

  protected async clearTest(topicId: string, testId: string, title: string): Promise<void> {
    if (!this.confirmation.confirm(`Clear all saved attempts and mistakes for “${title}”?`)) return;
    await this.runClear(
      () => this.clearing.clearTest(topicId, testId),
      `${title} history was cleared.`,
    );
  }

  protected async clearTopic(topicId: string, title: string): Promise<void> {
    const confirmed = this.confirmation.confirm(
      `Clear all saved progress for “${title}”? The exercises will remain available.`,
    );
    if (!confirmed) return;
    await this.runClear(() => this.clearing.clearTopic(topicId), `${title} history was cleared.`);
  }

  protected async clearAll(): Promise<void> {
    const confirmed = this.confirmation.confirm(
      'Clear every attempt, unfinished session, mistake, and lesson completion? This cannot be undone without a backup.',
    );
    if (!confirmed) return;
    await this.runClear(() => this.clearing.clearAll(), 'All learner history was cleared.');
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
}

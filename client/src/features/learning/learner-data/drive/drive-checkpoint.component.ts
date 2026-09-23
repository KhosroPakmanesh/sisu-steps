import { Component, inject, signal } from '@angular/core';
import {
  ConfirmationSheetComponent,
  ConfirmationSheetRequest,
} from '../confirmation/confirmation-sheet.component';
import { DriveCheckpointInspection, DriveCheckpointRevision } from './drive-checkpoint.models';
import { DriveCheckpointService } from './drive-checkpoint.service';

interface PendingDriveAction {
  request: ConfirmationSheetRequest;
  action: () => Promise<void>;
}

@Component({
  selector: 'app-drive-checkpoint',
  imports: [ConfirmationSheetComponent],
  templateUrl: './drive-checkpoint.component.html',
  styleUrls: ['./drive-checkpoint.component.css', './drive-checkpoint.component-interactions.css'],
})
export class DriveCheckpointComponent {
  protected readonly inspection = signal<DriveCheckpointInspection | null>(null);
  protected readonly pending = signal<PendingDriveAction | null>(null);
  protected readonly busy = signal(false);
  protected readonly activity = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  private readonly checkpoints = inject(DriveCheckpointService);

  protected async backUp(): Promise<void> {
    await this.run('Checking Google Drive…', async () => {
      const current = await this.checkpoints.inspect();
      this.inspection.set(current);
      if (current.kind === 'empty') {
        await this.saveCheckpoint(null);
        return;
      }
      this.pending.set({
        request: {
          eyebrow: 'One recovery checkpoint',
          title: 'Replace the Drive backup?',
          message: `The checkpoint from ${this.dateLabel(current.createdAt)} will be permanently replaced.`,
          confirmLabel: 'Replace Drive backup',
          closeLabel: 'Cancel replacing the Drive backup',
        },
        action: () => this.saveCheckpoint(current.revision),
      });
    });
  }

  protected async restore(): Promise<void> {
    await this.run('Validating the Drive checkpoint…', async () => {
      const current = await this.checkpoints.inspect();
      this.inspection.set(current);
      if (current.kind === 'empty') {
        this.message.set('No Google Drive checkpoint was found.');
        return;
      }
      if (current.kind === 'incompatible') {
        this.error.set(`This checkpoint cannot be restored. ${current.issue}`);
        return;
      }
      this.pending.set({
        request: this.restoreRequest(current),
        action: async () => {
          await this.checkpoints.restore(current);
          this.message.set('The Google Drive checkpoint replaced local learner data.');
        },
      });
    });
  }

  protected async deleteBackup(): Promise<void> {
    await this.run('Checking Google Drive…', async () => {
      const current = await this.checkpoints.inspect();
      this.inspection.set(current);
      if (current.kind === 'empty') {
        this.message.set('There is no Google Drive checkpoint to delete.');
        return;
      }
      this.pending.set({
        request: {
          eyebrow: 'Google Drive only',
          title: 'Delete the Drive backup?',
          message: `The checkpoint from ${this.dateLabel(current.createdAt)} will be permanently deleted. Local progress will not change.`,
          confirmLabel: 'Delete Drive backup',
          closeLabel: 'Cancel deleting the Drive backup',
        },
        action: async () => {
          await this.checkpoints.delete(current.revision);
          this.inspection.set({ kind: 'empty' });
          this.message.set('The Google Drive checkpoint was deleted.');
        },
      });
    });
  }

  protected async disconnect(): Promise<void> {
    await this.run('Disconnecting Google Drive…', async () => {
      await this.checkpoints.disconnect();
      this.inspection.set(null);
      this.message.set('Google Drive authorization was disconnected. The checkpoint remains.');
    });
  }

  protected async resolvePending(confirmed: boolean): Promise<void> {
    const pending = this.pending();
    this.pending.set(null);
    if (!confirmed || !pending) return;
    await this.run('Completing the Google Drive operation…', pending.action);
  }

  protected dateLabel(value: string): string {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value),
    );
  }

  protected summary(inspection: DriveCheckpointInspection): string {
    if (inspection.kind !== 'valid') return '';
    const value = inspection.prepared.summary;
    return `${value.attempts} attempts · ${value.unfinishedSessions} unfinished · ${value.unresolvedMistakes} mistakes · ${value.completedLessons} lessons · ${value.privateNotes} notes`;
  }

  private async saveCheckpoint(expected: DriveCheckpointRevision | null): Promise<void> {
    const saved = await this.checkpoints.backUp(expected);
    this.inspection.set(saved);
    this.message.set(`Google Drive checkpoint saved ${this.dateLabel(saved.createdAt)}.`);
  }

  private restoreRequest(
    current: Extract<DriveCheckpointInspection, { kind: 'valid' }>,
  ): ConfirmationSheetRequest {
    const details = [this.summary(current), 'Current local learner data will be replaced.'];
    if (current.prepared.compatibility.changedPacks.length) {
      const names = current.prepared.compatibility.changedPacks
        .map((pack) => pack.title)
        .join(', ');
      details.push(`Incompatible progress will be discarded for: ${names}.`);
      details.push(
        'Discarded categories: attempts, unfinished sessions, mistakes, correction and mastery records, and lesson completions.',
      );
      details.push('Topic notes remain; lesson notes remain only when their lesson still exists.');
    }
    if (current.prepared.compatibility.addedPacks.length) {
      const names = current.prepared.compatibility.addedPacks.map((pack) => pack.title).join(', ');
      details.push(`New packs will start empty: ${names}.`);
    }
    return {
      eyebrow: 'Validated recovery checkpoint',
      title: 'Restore from Google Drive?',
      message: `Checkpoint saved ${this.dateLabel(current.createdAt)}.`,
      details,
      confirmLabel: 'Restore from Drive',
      closeLabel: 'Cancel restoring from Google Drive',
    };
  }

  private async run(activity: string, operation: () => Promise<void>): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.activity.set(activity);
    this.message.set(null);
    this.error.set(null);
    try {
      await operation();
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Google Drive could not complete the operation.',
      );
    } finally {
      this.busy.set(false);
      this.activity.set(null);
    }
  }
}

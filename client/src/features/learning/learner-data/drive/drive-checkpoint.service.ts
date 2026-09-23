import { inject, Injectable } from '@angular/core';
import { DriveBackupStatusAdapter } from './drive-backup-status.adapter';
import { GoogleIdentityAuthorizationAdapter } from './google-identity-authorization.adapter';
import { BackupService } from '../backup/backup.service';
import { DriveCheckpointInspection, DriveCheckpointRevision } from './drive-checkpoint.models';
import {
  DriveAuthorizationExpiredError,
  GoogleDriveCheckpointRepository,
} from './google-drive-checkpoint.repository';

@Injectable({ providedIn: 'root' })
export class DriveCheckpointService {
  private readonly authorization = inject(GoogleIdentityAuthorizationAdapter);
  private readonly repository = inject(GoogleDriveCheckpointRepository);
  private readonly backups = inject(BackupService);
  private readonly status = inject(DriveBackupStatusAdapter);

  async inspect(): Promise<DriveCheckpointInspection> {
    const stored = await this.withAuthorization((token) => this.repository.read(token));
    if (!stored) {
      this.status.clear();
      return { kind: 'empty' };
    }
    try {
      return {
        kind: 'valid',
        createdAt: stored.createdAt,
        prepared: await this.backups.prepare(stored.payload),
        revision: stored.revision,
      };
    } catch (error) {
      return {
        kind: 'incompatible',
        createdAt: stored.createdAt,
        issue: error instanceof Error ? error.message : 'This checkpoint cannot be restored.',
        revision: stored.revision,
      };
    }
  }

  async backUp(
    expected: DriveCheckpointRevision | null,
  ): Promise<Extract<DriveCheckpointInspection, { kind: 'valid' }>> {
    const backup = this.backups.create();
    const stored = await this.withAuthorization((token) =>
      this.repository.write(token, backup, expected),
    );
    this.status.observeSavedAt(stored.createdAt);
    return {
      kind: 'valid',
      createdAt: stored.createdAt,
      prepared: await this.backups.prepare(stored.payload),
      revision: stored.revision,
    };
  }

  async restore(inspection: DriveCheckpointInspection): Promise<void> {
    if (inspection.kind !== 'valid') throw new Error('No valid Drive checkpoint is ready.');
    await this.backups.restorePrepared(inspection.prepared);
  }

  async delete(revision: DriveCheckpointRevision): Promise<void> {
    await this.withAuthorization((token) => this.repository.delete(token, revision));
    this.status.clear();
  }

  async disconnect(): Promise<void> {
    await this.authorization.disconnect();
  }

  private async withAuthorization<T>(operation: (token: string) => Promise<T>): Promise<T> {
    const token = await this.authorization.authorize();
    try {
      return await operation(token);
    } catch (error) {
      if (error instanceof DriveAuthorizationExpiredError) this.authorization.forgetToken();
      throw error;
    }
  }
}

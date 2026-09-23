import { PreparedLearnerBackup } from '../backup/backup.models';

export interface DriveCheckpointRevision {
  manifestFileId: string;
  manifestVersion: string;
  checkpointFileId: string;
}

export interface StoredDriveCheckpoint {
  createdAt: string;
  payload: unknown;
  revision: DriveCheckpointRevision;
}

export type DriveCheckpointInspection =
  | { kind: 'empty' }
  | {
      kind: 'incompatible';
      createdAt: string;
      issue: string;
      revision: DriveCheckpointRevision;
    }
  | {
      kind: 'valid';
      createdAt: string;
      prepared: PreparedLearnerBackup;
      revision: DriveCheckpointRevision;
    };

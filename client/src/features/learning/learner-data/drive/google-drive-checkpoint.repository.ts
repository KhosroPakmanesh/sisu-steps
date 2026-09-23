import { Injectable } from '@angular/core';
import { LearnerBackup } from '../backup/backup.models';
import { DriveCheckpointRevision, StoredDriveCheckpoint } from './drive-checkpoint.models';

const API_ROOT = 'https://www.googleapis.com/drive/v3';
const UPLOAD_ROOT = 'https://www.googleapis.com/upload/drive/v3';
const MANIFEST_NAME = 'sisu-steps-recovery-manifest.json';
const SNAPSHOT_PREFIX = 'sisu-steps-recovery-checkpoint-';

interface DriveFile {
  id: string;
  name: string;
  version: string;
}

interface CheckpointManifest {
  manifestType: 'sisu-steps-recovery';
  manifestVersion: 1;
  checkpointFileId: string;
  checkpointCreatedAt: string;
}

export class DriveCheckpointChangedError extends Error {}
export class DriveAuthorizationExpiredError extends Error {}
export class DriveCheckpointMissingError extends Error {}

@Injectable({ providedIn: 'root' })
export class GoogleDriveCheckpointRepository {
  async read(token: string): Promise<StoredDriveCheckpoint | null> {
    const manifestFile = await this.findManifest(token);
    if (!manifestFile) return null;
    const manifest = parseManifest(await this.downloadJson(token, manifestFile.id));
    let payload: unknown;
    try {
      payload = await this.downloadJson(token, manifest.checkpointFileId);
    } catch (error) {
      if (!(error instanceof DriveCheckpointMissingError)) throw error;
      payload = null;
    }
    return {
      createdAt: manifest.checkpointCreatedAt,
      payload,
      revision: {
        manifestFileId: manifestFile.id,
        manifestVersion: manifestFile.version,
        checkpointFileId: manifest.checkpointFileId,
      },
    };
  }

  async write(
    token: string,
    backup: LearnerBackup,
    expected: DriveCheckpointRevision | null,
  ): Promise<StoredDriveCheckpoint> {
    const snapshot = await this.createJsonFile(
      token,
      `${SNAPSHOT_PREFIX}${backup.exportedAt.replaceAll(':', '-')}.json`,
      backup,
    );
    try {
      await this.assertCurrentRevision(token, expected);
      const manifest = createManifest(snapshot.id, backup.exportedAt);
      const manifestFile = expected
        ? await this.updateJsonFile(token, expected.manifestFileId, manifest)
        : await this.createJsonFile(token, MANIFEST_NAME, manifest);
      const revision = {
        manifestFileId: manifestFile.id,
        manifestVersion: manifestFile.version,
        checkpointFileId: snapshot.id,
      };
      if (expected) void this.deleteFile(token, expected.checkpointFileId).catch(() => undefined);
      return { createdAt: backup.exportedAt, payload: backup, revision };
    } catch (error) {
      await this.deleteFile(token, snapshot.id).catch(() => undefined);
      throw error;
    }
  }

  async delete(token: string, expected: DriveCheckpointRevision): Promise<void> {
    await this.assertCurrentRevision(token, expected);
    await this.deleteFile(token, expected.manifestFileId);
    await this.deleteFile(token, expected.checkpointFileId).catch(() => undefined);
  }

  private async assertCurrentRevision(
    token: string,
    expected: DriveCheckpointRevision | null,
  ): Promise<void> {
    const current = await this.findManifest(token);
    if (!expected && !current) return;
    if (
      !expected ||
      !current ||
      current.id !== expected.manifestFileId ||
      current.version !== expected.manifestVersion
    ) {
      throw new DriveCheckpointChangedError(
        'The Drive checkpoint changed. Check it again before continuing.',
      );
    }
  }

  private async findManifest(token: string): Promise<DriveFile | null> {
    const query = new URLSearchParams({
      spaces: 'appDataFolder',
      q: `name = '${MANIFEST_NAME}' and trashed = false`,
      fields: 'files(id,name,version)',
      pageSize: '10',
    });
    const value = await this.requestJson(token, `${API_ROOT}/files?${query.toString()}`);
    if (!isRecord(value) || !Array.isArray(value['files'])) throw invalidDriveData();
    const files = value['files'].map(parseDriveFile);
    if (files.length > 1) {
      throw new Error('More than one Drive checkpoint record was found. No data was changed.');
    }
    return files[0] ?? null;
  }

  private async downloadJson(token: string, fileId: string): Promise<unknown> {
    const response = await this.request(
      token,
      `${API_ROOT}/files/${encodeURIComponent(fileId)}?alt=media`,
    );
    try {
      return JSON.parse(await response.text()) as unknown;
    } catch {
      throw new Error('The Google Drive checkpoint is not valid JSON.');
    }
  }

  private async createJsonFile(token: string, name: string, value: unknown): Promise<DriveFile> {
    const metadata = { name, parents: ['appDataFolder'], mimeType: 'application/json' };
    const response = await this.multipartRequest(
      token,
      'POST',
      `${UPLOAD_ROOT}/files`,
      metadata,
      value,
    );
    return parseDriveFile(response);
  }

  private async updateJsonFile(token: string, fileId: string, value: unknown): Promise<DriveFile> {
    const url = `${UPLOAD_ROOT}/files/${encodeURIComponent(fileId)}`;
    const response = await this.multipartRequest(token, 'PATCH', url, {}, value);
    return parseDriveFile(response);
  }

  private async multipartRequest(
    token: string,
    method: 'POST' | 'PATCH',
    url: string,
    metadata: object,
    value: unknown,
  ): Promise<unknown> {
    const boundary = `sisu_steps_${crypto.randomUUID()}`;
    const body = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
      JSON.stringify(metadata),
      `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n`,
      JSON.stringify(value),
      `\r\n--${boundary}--`,
    ]);
    return this.requestJson(token, `${url}?uploadType=multipart&fields=id,name,version`, {
      method,
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    });
  }

  private async deleteFile(token: string, fileId: string): Promise<void> {
    await this.request(token, `${API_ROOT}/files/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
    });
  }

  private async requestJson(token: string, url: string, init?: RequestInit): Promise<unknown> {
    const response = await this.request(token, url, init);
    return (await response.json()) as unknown;
  }

  private async request(token: string, url: string, init: RequestInit = {}): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers: { Authorization: `Bearer ${token}`, ...init.headers },
      });
    } catch {
      throw new Error('Google Drive could not be reached. Check your connection and try again.');
    }
    if (response.ok) return response;
    if (response.status === 401) {
      throw new DriveAuthorizationExpiredError(
        'Google Drive authorization expired. Try the action again.',
      );
    }
    if (response.status === 403) throw new Error('Google Drive did not permit this operation.');
    if (response.status === 404) {
      throw new DriveCheckpointMissingError('The Google Drive checkpoint no longer exists.');
    }
    if (response.status === 429) throw new Error('Google Drive is busy. Wait a moment and retry.');
    if (response.status >= 500) throw new Error('Google Drive is temporarily unavailable.');
    throw new Error('The Google Drive operation could not be completed.');
  }
}

function createManifest(checkpointFileId: string, checkpointCreatedAt: string): CheckpointManifest {
  return {
    manifestType: 'sisu-steps-recovery',
    manifestVersion: 1,
    checkpointFileId,
    checkpointCreatedAt,
  };
}

function parseManifest(value: unknown): CheckpointManifest {
  if (
    !isRecord(value) ||
    value['manifestType'] !== 'sisu-steps-recovery' ||
    value['manifestVersion'] !== 1 ||
    !isText(value['checkpointFileId']) ||
    !isDate(value['checkpointCreatedAt'])
  ) {
    throw new Error('The Google Drive checkpoint record is malformed.');
  }
  return value as unknown as CheckpointManifest;
}

function parseDriveFile(value: unknown): DriveFile {
  if (
    !isRecord(value) ||
    !isText(value['id']) ||
    !isText(value['name']) ||
    !isText(value['version'])
  ) {
    throw invalidDriveData();
  }
  return { id: value['id'], name: value['name'], version: value['version'] };
}

function invalidDriveData(): Error {
  return new Error('Google Drive returned an invalid checkpoint response.');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isDate(value: unknown): value is string {
  return isText(value) && !Number.isNaN(Date.parse(value));
}

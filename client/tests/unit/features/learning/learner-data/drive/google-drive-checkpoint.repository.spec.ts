import { afterEach, describe, expect, it, vi } from 'vitest';
import { GoogleDriveCheckpointRepository } from '@/features/learning/learner-data/drive/google-drive-checkpoint.repository';
import { LearnerBackup } from '@/features/learning/learner-data/backup/backup.models';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';

describe('GoogleDriveCheckpointRepository', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('creates an immutable snapshot before publishing its manifest', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(file('snapshot', 'snapshot.json', '1')))
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockResolvedValueOnce(jsonResponse(file('manifest', 'manifest.json', '1')));
    vi.stubGlobal('fetch', fetchMock);
    const repository = new GoogleDriveCheckpointRepository();

    const stored = await repository.write('memory-token', backup, null);

    expect(stored.revision).toEqual({
      manifestFileId: 'manifest',
      manifestVersion: '1',
      checkpointFileId: 'snapshot',
    });
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      expect.stringContaining('/upload/drive/v3/files?uploadType=multipart'),
      expect.stringContaining('/drive/v3/files?spaces=appDataFolder'),
      expect.stringContaining('/upload/drive/v3/files?uploadType=multipart'),
    ]);
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: 'Bearer memory-token',
    });
  });

  it('removes only the new snapshot when manifest replacement fails', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(file('new-snapshot', 'snapshot.json', '1')))
      .mockResolvedValueOnce(
        jsonResponse({ files: [file('manifest', 'sisu-steps-recovery-manifest.json', '7')] }),
      )
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const repository = new GoogleDriveCheckpointRepository();

    await expect(
      repository.write('memory-token', backup, {
        manifestFileId: 'manifest',
        manifestVersion: '7',
        checkpointFileId: 'old-snapshot',
      }),
    ).rejects.toThrowError('Google Drive is temporarily unavailable.');

    const calls = fetchMock.mock.calls.map(
      ([url, init]) => `${init?.method ?? 'GET'} ${String(url)}`,
    );
    expect(calls).toContainEqual(expect.stringMatching(/^DELETE .*\/new-snapshot$/u));
    expect(calls).not.toContainEqual(expect.stringMatching(/^DELETE .*\/old-snapshot$/u));
  });
});

const backup: LearnerBackup = {
  backupType: 'finnish-exercise-book',
  backupVersion: 1,
  exportedAt: '2026-09-22T10:00:00.000Z',
  state: createEmptyLearnerState({ topic: '1.0.0' }),
};

function file(id: string, name: string, version: string) {
  return { id, name, version };
}

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

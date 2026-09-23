import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DriveCheckpointComponent } from '@/features/learning/learner-data/drive/drive-checkpoint.component';
import { DriveCheckpointService } from '@/features/learning/learner-data/drive/drive-checkpoint.service';
import { DriveCheckpointInspection } from '@/features/learning/learner-data/drive/drive-checkpoint.models';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';

describe('DriveCheckpointComponent', () => {
  let fixture: ComponentFixture<DriveCheckpointComponent>;
  const checkpoints = {
    inspect: vi.fn(),
    backUp: vi.fn(),
    restore: vi.fn(),
    delete: vi.fn(),
    disconnect: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    checkpoints.backUp.mockResolvedValue(validInspection);
    checkpoints.restore.mockResolvedValue(undefined);
    checkpoints.delete.mockResolvedValue(undefined);
    checkpoints.disconnect.mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [DriveCheckpointComponent],
      providers: [{ provide: DriveCheckpointService, useValue: checkpoints }],
    }).compileComponents();
    fixture = TestBed.createComponent(DriveCheckpointComponent);
    fixture.detectChanges();
  });

  it('creates the first checkpoint without an overwrite confirmation', async () => {
    checkpoints.inspect.mockResolvedValue({ kind: 'empty' });

    clickButton('Back up to Google Drive');
    await vi.waitFor(() => expect(checkpoints.backUp).toHaveBeenCalledExactlyOnceWith(null));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Google Drive checkpoint saved');
  });

  it('requires confirmation before replacing an existing checkpoint', async () => {
    checkpoints.inspect.mockResolvedValue(validInspection);

    clickButton('Back up to Google Drive');
    await vi.waitFor(() => expect(checkpoints.inspect).toHaveBeenCalledOnce());
    await waitForIdle();

    expect(checkpoints.backUp).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Replace the Drive backup?');

    clickButton('Replace Drive backup');
    await vi.waitFor(() =>
      expect(checkpoints.backUp).toHaveBeenCalledExactlyOnceWith(validInspection.revision),
    );
  });

  it('shows validated restore contents and changed-pack loss before replacement', async () => {
    checkpoints.inspect.mockResolvedValue(validInspection);

    clickButton('Restore from Google Drive');
    await vi.waitFor(() => expect(checkpoints.inspect).toHaveBeenCalledOnce());
    await waitForIdle();

    expect(checkpoints.restore).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('3 attempts');
    expect(fixture.nativeElement.textContent).toContain('Finnish foundations');

    clickButton('Restore from Drive');
    await vi.waitFor(() =>
      expect(checkpoints.restore).toHaveBeenCalledExactlyOnceWith(validInspection),
    );
  });

  function clickButton(label: string): void {
    const button = [...fixture.nativeElement.querySelectorAll('button')].find((candidate) =>
      candidate.textContent?.includes(label),
    ) as HTMLButtonElement | undefined;
    button?.click();
    fixture.detectChanges();
  }

  async function waitForIdle(): Promise<void> {
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.drive-actions button')?.disabled).toBe(false);
    });
  }
});

const state = createEmptyLearnerState({ topic: '1.0.0' });
const validInspection: Extract<DriveCheckpointInspection, { kind: 'valid' }> = {
  kind: 'valid',
  createdAt: '2026-09-22T10:00:00.000Z',
  revision: {
    manifestFileId: 'manifest',
    manifestVersion: '1',
    checkpointFileId: 'checkpoint',
  },
  prepared: {
    backup: {
      backupType: 'finnish-exercise-book',
      backupVersion: 1,
      exportedAt: '2026-09-22T10:00:00.000Z',
      state,
    },
    state,
    compatibility: {
      addedPacks: [],
      changedPacks: [{ id: 'topic', title: 'Finnish foundations' }],
    },
    summary: {
      attempts: 3,
      unfinishedSessions: 1,
      unresolvedMistakes: 2,
      completedLessons: 4,
      privateNotes: 1,
    },
  },
};

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TextFileAdapter } from '@/shared/browser/text-file.adapter';
import { BackupRestoreComponent } from '@/features/learning/learner-data/backup-restore/backup-restore.component';
import { BackupService } from '@/features/learning/learner-data/backup/backup.service';
import { ClearHistoryService } from '@/features/learning/learner-data/clear-history.service';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { FakeLearningStateStore } from '@testing/helpers/unit/fake-learning-state.store';

describe('BackupRestoreComponent', () => {
  let fixture: ComponentFixture<BackupRestoreComponent>;
  const files = {
    downloadJson: vi.fn(),
    readJson: vi.fn(),
  };
  const backups = {
    create: vi.fn(() => ({ backupType: 'finnish-exercise-book' })),
    prepare: vi.fn(),
    restorePrepared: vi.fn(),
  };
  const clearing = {
    clearAll: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [BackupRestoreComponent],
      providers: [
        { provide: LearningStateStore, useClass: FakeLearningStateStore },
        { provide: TextFileAdapter, useValue: files },
        { provide: BackupService, useValue: backups },
        { provide: ClearHistoryService, useValue: clearing },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BackupRestoreComponent);
    fixture.detectChanges();
  });

  it('keeps the global data operations in one standalone archive', () => {
    const element = fixture.nativeElement as HTMLElement;
    const archive = element.querySelector('.backup-archive');
    const heading = element.querySelector('#backup-heading');

    expect(element.querySelector('main')).toBeNull();
    expect(heading?.textContent).toContain('Backup & restore');
    expect(archive?.contains(heading)).toBe(false);
    expect(archive?.querySelectorAll('.archive-action-row')).toHaveLength(3);
    expect(archive?.textContent).not.toContain('Google Drive checkpoint');
    expect(element.querySelector('.drive-checkpoint-section')).toBeNull();
    expect(archive?.textContent).toContain('Download a copy');
    expect(archive?.textContent).toContain('Restore a copy');
    expect(archive?.textContent).toContain('Clear all history');
    expect(element.querySelector('.history-section')).toBeNull();
    expect(element.querySelector('.clear-row')).toBeNull();
  });

  it('requires explicit confirmation for file restore losses from changed packs', async () => {
    const prepared = {
      compatibility: {
        addedPacks: [],
        changedPacks: [{ id: 'topic', title: 'Finnish foundations' }],
      },
    };
    files.readJson.mockResolvedValue({ backupType: 'finnish-exercise-book' });
    backups.prepare.mockResolvedValue(prepared);
    backups.restorePrepared.mockResolvedValue(undefined);
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['{}'], 'backup.json', { type: 'application/json' })],
    });

    input.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(backups.prepare).toHaveBeenCalledOnce());
    fixture.detectChanges();

    expect(backups.restorePrepared).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Finnish foundations');
    const confirm = [...fixture.nativeElement.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Restore backup'),
    ) as HTMLButtonElement;
    confirm.click();
    await vi.waitFor(() =>
      expect(backups.restorePrepared).toHaveBeenCalledExactlyOnceWith(prepared),
    );
  });

  it('keeps backup feedback attached to the backup archive', () => {
    const element = fixture.nativeElement as HTMLElement;
    const download = Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Download backup'),
    );

    download?.click();
    fixture.detectChanges();

    expect(files.downloadJson).toHaveBeenCalledOnce();
    expect(element.querySelector('.backup-archive [role="status"]')?.textContent).toContain(
      'Your backup was downloaded.',
    );
  });
});

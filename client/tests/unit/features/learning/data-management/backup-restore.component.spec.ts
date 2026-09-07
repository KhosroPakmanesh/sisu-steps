import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TextFileAdapter } from '@/shared/browser/text-file.adapter';
import { BackupRestoreComponent } from '@/features/learning/data-management/backup-restore.component';
import { BackupService } from '@/features/learning/data-management/backup.service';
import { ClearProgressService } from '@/features/learning/data-management/clear-progress.service';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { FakeLearningStateStore } from '../../../fixtures/learning-content.fixture';

describe('BackupRestoreComponent', () => {
  let fixture: ComponentFixture<BackupRestoreComponent>;
  const files = {
    downloadJson: vi.fn(),
    readJson: vi.fn(),
  };
  const backups = {
    create: vi.fn(() => ({ backupType: 'finnish-exercise-book' })),
    restore: vi.fn(),
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
        { provide: ClearProgressService, useValue: clearing },
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
    expect(archive?.textContent).toContain('Download a copy');
    expect(archive?.textContent).toContain('Restore a copy');
    expect(archive?.textContent).toContain('Clear all history');
    expect(element.querySelector('.history-section')).toBeNull();
    expect(element.querySelector('.clear-row')).toBeNull();
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

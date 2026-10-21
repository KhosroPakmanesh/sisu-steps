import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { TextFileAdapter } from '@/shared/browser/text-file.adapter';
import { BackupService } from '@/features/learning/learner-data/backup/backup.service';
import { ClearHistoryService } from '@/features/learning/learner-data/clear-history.service';
import { DriveCheckpointService } from '@/features/learning/learner-data/drive/drive-checkpoint.service';
import { BackupPage } from '@/features/learning/learner-data/overview/backup.page';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { FakeLearningStateStore } from '@testing/helpers/unit/fake-learning-state.store';

describe('BackupPage', () => {
  it('composes the unchanged local archive followed by the separate Drive archive', async () => {
    await TestBed.configureTestingModule({
      imports: [BackupPage],
      providers: [
        provideRouter([]),
        { provide: LearningStateStore, useClass: FakeLearningStateStore },
        { provide: TextFileAdapter, useValue: { downloadJson: vi.fn(), readJson: vi.fn() } },
        { provide: BackupService, useValue: { create: vi.fn(), restore: vi.fn() } },
        { provide: ClearHistoryService, useValue: { clearAll: vi.fn() } },
        { provide: DriveCheckpointService, useValue: {} },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(BackupPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const localHost = element.querySelector('app-backup-restore') as HTMLElement;
    const driveHost = element.querySelector('app-drive-checkpoint') as HTMLElement;

    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Backup');
    expect(localHost.nextElementSibling).toBe(driveHost);
    expect(localHost.querySelectorAll('.archive-action-row')).toHaveLength(3);
    expect(driveHost.querySelectorAll('.drive-action-row')).toHaveLength(3);
    expect(localHost.querySelector('.backup-archive #backup-heading')).toBeNull();
    expect(driveHost.querySelector('#google-drive-checkpoint')?.tagName).toBe('H2');
    expect(
      driveHost.querySelector('.drive-checkpoint-archive #google-drive-checkpoint'),
    ).toBeNull();
    expect(localHost.closest('details')).toBeNull();
    expect(driveHost.closest('details')).toBeNull();
    expect(element.querySelector('.stats-catalog')).toBeNull();
  });
});

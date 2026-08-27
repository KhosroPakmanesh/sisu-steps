import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TextFileAdapter } from '@/shared/browser/text-file.adapter';
import { BackupService } from '@/features/learning/data-management/backup.service';
import { ClearProgressService } from '@/features/learning/data-management/clear-progress.service';
import { DataSettingsPage } from '@/features/learning/data-management/data-settings.page';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { FakeLearningStateStore } from '../../../fixtures/learning-content.fixture';

describe('DataSettingsPage', () => {
  let fixture: ComponentFixture<DataSettingsPage>;
  const files = {
    downloadJson: vi.fn(),
    readJson: vi.fn(),
  };
  const backups = {
    create: vi.fn(() => ({ backupType: 'finnish-exercise-book' })),
    restore: vi.fn(),
  };
  const clearing = {
    clearTest: vi.fn(),
    clearTopic: vi.fn(),
    clearAll: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DataSettingsPage],
      providers: [
        provideRouter([]),
        { provide: LearningStateStore, useClass: FakeLearningStateStore },
        { provide: TextFileAdapter, useValue: files },
        { provide: BackupService, useValue: backups },
        { provide: ClearProgressService, useValue: clearing },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DataSettingsPage);
    fixture.detectChanges();
  });

  it('uses the wide reference-page hierarchy and archive materials', () => {
    const element = fixture.nativeElement as HTMLElement;
    const hero = element.querySelector('.data-hero') as HTMLElement;

    expect(element.querySelector('main')?.classList.contains('narrow-page')).toBe(false);
    expect(
      hero.querySelector('.back-link')?.nextElementSibling?.classList.contains('eyebrow'),
    ).toBe(true);
    expect(hero.querySelector('.data-overview.assignment-sheet')).not.toBeNull();
    expect(
      element.querySelector('[aria-labelledby="backup-heading"].backup-archive.topic-card'),
    ).not.toBeNull();
    expect(
      element.querySelector('[aria-labelledby="history-heading"].history-section'),
    ).not.toBeNull();
    expect(element.querySelector('.topic-file-label')).not.toBeNull();
    expect(element.querySelectorAll('.clear-row')).toHaveLength(2);
    expect(element.querySelector('.backup-archive .clear-all-action-row')).not.toBeNull();
    expect(element.querySelector('.clear-all-slip')).toBeNull();
    expect(element.querySelector('.settings-card')).toBeNull();
    expect(element.querySelector('.danger-zone')).toBeNull();
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
    expect(element.querySelector('.clear-all-action-row [role="status"]')).toBeNull();
  });
});

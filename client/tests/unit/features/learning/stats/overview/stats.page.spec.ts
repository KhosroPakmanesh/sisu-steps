import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TextFileAdapter } from '@/shared/browser/text-file.adapter';
import { BackupService } from '@/features/learning/learner-data/backup/backup.service';
import { ClearHistoryService } from '@/features/learning/learner-data/clear-history.service';
import { StatsPage } from '@/features/learning/stats/overview/stats.page';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { FakeLearningStateStore } from '@testing/helpers/unit/fake-learning-state.store';
import { learningPack } from '@testing/helpers/unit/learning-content.fixture';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';

describe('StatsPage', () => {
  let fixture: ComponentFixture<StatsPage>;
  let store: FakeLearningStateStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsPage],
      providers: [
        provideRouter([]),
        { provide: LearningStateStore, useClass: FakeLearningStateStore },
        { provide: TextFileAdapter, useValue: { downloadJson: vi.fn(), readJson: vi.fn() } },
        { provide: BackupService, useValue: { create: vi.fn(), restore: vi.fn() } },
        { provide: ClearHistoryService, useValue: { clearAll: vi.fn() } },
      ],
    }).compileComponents();
    store = TestBed.inject(LearningStateStore) as unknown as FakeLearningStateStore;
    fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();
  });

  it('places Backup & restore before the Progress by topic catalog', () => {
    const element = fixture.nativeElement as HTMLElement;
    const archive = element.querySelector('.backup-archive') as HTMLElement;
    const catalog = element.querySelector('.stats-catalog') as HTMLElement;

    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Statistics');
    expect(element.querySelector('.cumulative-overview')?.textContent).toContain(
      'Cumulative statistics',
    );
    expect(element.querySelector('.cumulative-overview')?.textContent).toContain('All topics');
    expect(element.querySelectorAll('.cumulative-overview > div')).toHaveLength(4);
    expect(
      archive.compareDocumentPosition(catalog) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(catalog.querySelector('h2')?.textContent?.trim()).toBe('Progress by topic');
  });

  it('shows one linked card per pack with compact topic metrics', () => {
    const secondPack = structuredClone(learningPack);
    secondPack.id = 'second-topic';
    secondPack.title = 'A second topic';
    const summaries = [learningPack, secondPack].map(topicPackToSummary);
    store.packSummaries.set(summaries);
    store.packGroups.set([{ id: 'foundations', title: 'Foundations', packs: summaries }]);
    fixture.detectChanges();

    const cards = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.stats-topic-card'),
    ];
    expect(cards).toHaveLength(2);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.topic-grid > .card-kicker')
        ?.textContent,
    ).toContain('Level: A1');
    expect(cards.every((card) => card.querySelector('.card-kicker') === null)).toBe(true);
    expect(cards[0].textContent).toContain('Completed attempts');
    expect(cards[0].textContent).toContain('Average score');
    expect(cards[0].textContent).toContain('Unresolved mistakes');
    expect(cards.map((card) => card.querySelector('a')?.getAttribute('href'))).toEqual([
      '/stats/topic',
      '/stats/second-topic',
    ]);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
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
      ],
    }).compileComponents();
    store = TestBed.inject(LearningStateStore) as unknown as FakeLearningStateStore;
    fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();
  });

  it('keeps cumulative statistics and topic progress without backup controls', () => {
    const element = fixture.nativeElement as HTMLElement;
    const catalog = element.querySelector('.stats-catalog') as HTMLElement;

    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Statistics');
    expect(element.querySelector('#cumulative-stats-heading')?.textContent?.trim()).toBe(
      'Cumulative statistics',
    );
    expect(element.querySelector('.cumulative-overview')?.textContent).not.toContain('All topics');
    expect(element.querySelectorAll('.cumulative-overview > div')).toHaveLength(3);
    expect(element.querySelector('app-backup-restore')).toBeNull();
    expect(element.querySelector('app-drive-checkpoint')).toBeNull();
    expect(catalog.querySelector('h2')?.textContent?.trim()).toBe('Progress by topic');
  });

  it('starts groups collapsed while keeping cumulative statistics outside disclosures', () => {
    const element = fixture.nativeElement as HTMLElement;
    const groups = element.querySelectorAll('details');
    expect(groups.length).toBeGreaterThan(0);
    expect([...groups].every((group) => !group.open)).toBe(true);
    expect(element.querySelectorAll('.stats-topic-card')).toHaveLength(0);
    expect(element.querySelector('.topic-group-toggle h3')?.textContent?.trim()).toBe(
      'Foundations',
    );
    expect(element.querySelector('.cumulative-summary')?.closest('details')).toBeNull();
  });

  it('shows one linked card per pack with compact topic metrics after expansion', async () => {
    const secondPack = structuredClone(learningPack);
    secondPack.id = 'second-topic';
    secondPack.title = 'A second topic';
    const summaries = [learningPack, secondPack].map(topicPackToSummary);
    store.packSummaries.set(summaries);
    store.packGroups.set([{ id: 'foundations', title: 'Foundations', packs: summaries }]);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('summary')!.click();
    await fixture.whenStable();
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

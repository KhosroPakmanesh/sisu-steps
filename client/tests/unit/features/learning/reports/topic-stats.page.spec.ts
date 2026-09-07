import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClearProgressService } from '@/features/learning/data-management/clear-progress.service';
import { TopicStatsPage } from '@/features/learning/reports/topic-stats.page';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { FakeLearningStateStore } from '../../../fixtures/learning-content.fixture';

describe('TopicStatsPage', () => {
  let fixture: ComponentFixture<TopicStatsPage>;
  const route = { snapshot: { paramMap: convertToParamMap({ topicId: 'topic' }) } };
  const clearing = {
    clearTest: vi.fn(),
    clearTopic: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    route.snapshot.paramMap = convertToParamMap({ topicId: 'topic' });
    await TestBed.configureTestingModule({
      imports: [TopicStatsPage],
      providers: [
        provideRouter([]),
        { provide: LearningStateStore, useClass: FakeLearningStateStore },
        { provide: ClearProgressService, useValue: clearing },
        { provide: ActivatedRoute, useValue: route },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TopicStatsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders only the selected topic with its complete test ledger and clearing actions', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Finnish foundations');
    expect(element.querySelector('#at-a-glance-heading')?.textContent?.trim()).toBe('At a glance');
    expect(element.querySelectorAll('.report-row')).toHaveLength(2);
    expect(element.querySelectorAll('.report-clear-cell button')).toHaveLength(2);
    expect(element.querySelector('#manage-topic-heading')?.textContent?.trim()).toBe(
      'This topic only',
    );
    expect(element.querySelector('.topic-history .report-section-heading')).toBeNull();
    const ledger = element.querySelector('.report-ledger') as HTMLElement;
    const topicHistory = element.querySelector('.topic-history') as HTMLElement;
    expect(ledger.contains(topicHistory)).toBe(true);
    expect(element.querySelector('.topic-clear-strip button')?.textContent?.trim()).toBe(
      'Clear topic history',
    );
    expect(element.querySelector('a[href="/stats"]')?.textContent).toContain('All stats');
    expect(element.querySelector('.paperclip-filter')).toBeNull();
    expect(element.querySelector('.skill-report')).toBeNull();
  });

  it('uses semantic ledger headings and the established report hierarchy', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.reports-hero .back-link + .eyebrow')).not.toBeNull();
    expect(element.querySelector('.report-overview.assignment-sheet')).not.toBeNull();
    expect(element.querySelectorAll('.report-overview > div')).toHaveLength(5);
    expect(element.querySelector('#test-results-heading')?.textContent?.trim()).toBe(
      'Test results',
    );
    expect(element.querySelectorAll('.ledger-column-heading')).toHaveLength(1);
    expect(element.querySelectorAll('.semantic-ledger-head')).toHaveLength(1);
    expect(element.querySelectorAll('.ledger-sheet table')).toHaveLength(1);
  });

  it('recovers an unknown topic with an All stats link', async () => {
    fixture.destroy();
    route.snapshot.paramMap = convertToParamMap({ topicId: 'missing-topic' });
    fixture = TestBed.createComponent(TopicStatsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[role="alert"] h1')?.textContent).toContain(
      'We could not open these topic stats',
    );
    expect(element.querySelector('a[href="/stats"]')?.textContent?.trim()).toBe('All stats');
    expect(element.querySelector('.report-ledger')).toBeNull();
  });
});

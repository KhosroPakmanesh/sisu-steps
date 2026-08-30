import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReportsPage } from '@/features/learning/reports/reports.page';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { FakeLearningStateStore } from '../../../fixtures/learning-content.fixture';

describe('ReportsPage', () => {
  let fixture: ComponentFixture<ReportsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsPage],
      providers: [
        provideRouter([]),
        { provide: LearningStateStore, useClass: FakeLearningStateStore },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ReportsPage);
    fixture.detectChanges();
  });

  it('renders every test without a studied-only filter or skill ledger', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.report-row')).toHaveLength(2);
    expect(element.querySelector('.paperclip-filter')).toBeNull();
    expect(element.querySelector('.skill-report')).toBeNull();
    expect(TestBed.inject(LearningStateStore).learnerState().attempts).toHaveLength(0);
  });

  it('matches the reference-page hierarchy and uses semantic ledger tables', () => {
    const element = fixture.nativeElement as HTMLElement;
    const hero = element.querySelector('.reports-hero') as HTMLElement;
    const backLink = hero.querySelector('.back-link') as HTMLAnchorElement;
    const overview = hero.querySelector('.report-overview') as HTMLDListElement;

    expect(backLink.nextElementSibling?.classList.contains('eyebrow')).toBe(true);
    expect(overview.classList.contains('assignment-sheet')).toBe(true);
    expect(overview.querySelectorAll(':scope > div')).toHaveLength(5);
    expect(element.querySelector('.report-topic-heading h2')?.textContent?.trim()).toBe(
      'Finnish foundations',
    );
    expect(element.querySelector('.report-topic-sheet')).not.toBeNull();
    expect(
      element.querySelector('.report-table .report-section-heading h3')?.textContent?.trim(),
    ).toBe('Results by test');
    expect(element.querySelectorAll('.ledger-column-heading')).toHaveLength(1);
    expect(element.querySelectorAll('.semantic-ledger-head')).toHaveLength(1);
    expect(element.querySelectorAll('.ledger-sheet table')).toHaveLength(1);
  });
});

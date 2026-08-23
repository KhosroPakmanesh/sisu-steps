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

  it('uses a native paper-clipped checkbox to filter visible ledger rows only', () => {
    const element = fixture.nativeElement as HTMLElement;
    const filter = element.querySelector('.paperclip-filter input') as HTMLInputElement;
    expect(filter.type).toBe('checkbox');
    expect(element.querySelectorAll('.report-table article')).toHaveLength(2);

    filter.checked = true;
    filter.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(element.querySelectorAll('.report-table article')).toHaveLength(0);
    expect(element.querySelector('.filtered-empty')?.textContent).toContain(
      'No completed attempts yet.',
    );
    expect(TestBed.inject(LearningStateStore).learnerState().attempts).toHaveLength(0);
  });
});

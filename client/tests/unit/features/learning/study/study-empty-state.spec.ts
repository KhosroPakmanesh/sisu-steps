import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { SessionStartService } from '@/features/learning/study/session-start.service';
import { StudyPage } from '@/features/learning/study/study.page';
import { FakeLearningStateStore } from '../../../fixtures/learning-content.fixture';

describe('empty study sessions', () => {
  const route = {
    snapshot: {
      data: { mode: 'mistakes' },
      paramMap: { get: () => 'topic' },
    },
  };

  beforeEach(async () => {
    route.snapshot.data.mode = 'mistakes';
    await TestBed.configureTestingModule({
      imports: [StudyPage],
      providers: [
        provideRouter([]),
        { provide: LearningStateStore, useClass: FakeLearningStateStore },
        { provide: ActivatedRoute, useValue: route },
      ],
    }).compileComponents();
  });

  it.each([
    ['mistakes', 'No mistakes to practise'],
    ['review', 'No review is due yet'],
  ])('presents an empty %s session without an error or stored change', async (mode, title) => {
    route.snapshot.data.mode = mode;
    const store = TestBed.inject(LearningStateStore);
    const before = structuredClone(store.learnerState());
    const fixture = TestBed.createComponent(StudyPage);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(element.querySelector('h1')?.textContent).toBe(title);
    });
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelector('.empty-card')?.getAttribute('aria-live')).toBe('polite');
    expect(element.querySelector('.empty-card a')?.textContent).toContain('Back to topics');
    expect(store.learnerState()).toEqual(before);
  });

  it('still presents a real startup failure as an error', async () => {
    vi.spyOn(TestBed.inject(SessionStartService), 'getOrCreateMistakeSession').mockRejectedValue(
      new Error('The exercise pack could not load.'),
    );
    const fixture = TestBed.createComponent(StudyPage);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(element.querySelector('[role="alert"]')?.textContent).toContain(
        'The exercise pack could not load.',
      );
    });
    expect(element.querySelector('.empty-card')).toBeNull();
  });
});

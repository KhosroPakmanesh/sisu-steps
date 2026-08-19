import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { DashboardPage } from '@/features/learning/dashboard/dashboard.page';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { FakeLearningStateStore, learningPack } from '../../../fixtures/learning-content.fixture';

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let store: FakeLearningStateStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideRouter([]),
        { provide: LearningStateStore, useClass: FakeLearningStateStore },
      ],
    }).compileComponents();
    store = TestBed.inject(LearningStateStore) as unknown as FakeLearningStateStore;
    fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
  });

  it('shows a compact topic summary without expanding its tests or lesson content', () => {
    const element = fixture.nativeElement as HTMLElement;
    const card = element.querySelector('.topic-card');

    expect(element.querySelectorAll('.topic-card')).toHaveLength(1);
    expect(element.querySelector('.test-card')).toBeNull();
    expect(card?.textContent).toContain('Finnish foundations');
    expect(card?.textContent).toContain('Tests tried');
    expect(card?.textContent).toContain('0/2');
    expect(card?.querySelector('a[href="/topics/topic"]')).toBeTruthy();
    expect(card?.textContent).not.toContain('Extended review');
  });

  it('renders one independent summary for every installed topic pack', () => {
    const secondPack = structuredClone(learningPack);
    secondPack.id = 'second-topic';
    secondPack.title = 'A second topic';
    store.packs.set([learningPack, secondPack]);
    fixture.detectChanges();

    const cards = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.topic-card'),
    ];
    expect(cards).toHaveLength(2);
    expect(cards.map((card) => card.querySelector('a')?.getAttribute('href'))).toEqual([
      '/topics/topic',
      '/topics/second-topic',
    ]);
    expect(cards[1].textContent).toContain('A second topic');
  });

  it('offers the first untried test as the continue-learning action', () => {
    const element = fixture.nativeElement as HTMLElement;
    const continueCard = element.querySelector('.continue-card');

    expect(continueCard?.textContent).toContain('Test 1');
    expect(continueCard?.querySelector('a[href="/study/topic/test-1"]')?.textContent).toContain(
      'Start next test',
    );
    expect(continueCard?.querySelector('a[href="/topics/topic"]')).toBeTruthy();
  });

  it('reports lesson completion at topic level without exposing the lesson body', () => {
    store.learnerState.update((state) => ({
      ...state,
      lessonCompletions: [
        {
          lessonId: learningPack.lessons[0].id,
          lessonVersion: learningPack.lessons[0].version,
          completedAt: '2026-08-18T00:00:00.000Z',
        },
      ],
    }));
    fixture.detectChanges();

    const card = (fixture.nativeElement as HTMLElement).querySelector('.topic-card');
    expect(card?.textContent).toContain('Lessons read');
    expect(card?.textContent).toContain('1/1');
    expect(card?.textContent).not.toContain('Back vowels use -ssa');
  });

  it('keeps an optional due review prominent without expanding ordinary tests', () => {
    store.learnerState.update((state) => ({
      ...state,
      correctionRecords: [
        {
          exerciseId: 'exercise-1',
          parallelExerciseId: 'exercise-2',
          targetSkill: 'Vowel harmony',
          correctedAt: '2026-08-17T00:00:00.000Z',
          nextReviewAt: '2026-08-18T00:00:00.000Z',
          reviewStage: 0,
          reviewAttempts: 0,
        },
      ],
    }));
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.topic-card a[href="/review/topic"]')?.textContent).toContain(
      'Optional review due · 1',
    );
    expect(element.querySelector('.test-card')).toBeNull();
  });
});

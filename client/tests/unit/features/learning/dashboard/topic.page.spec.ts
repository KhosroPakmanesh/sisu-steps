import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TopicPage } from '@/features/learning/dashboard/topic.page';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { FakeLearningStateStore, learningPack } from '../../../fixtures/learning-content.fixture';

describe('TopicPage', () => {
  let fixture: ComponentFixture<TopicPage>;
  let store: FakeLearningStateStore;
  const route = { snapshot: { paramMap: convertToParamMap({ topicId: 'topic' }) } };

  beforeEach(async () => {
    route.snapshot.paramMap = convertToParamMap({ topicId: 'topic' });
    await TestBed.configureTestingModule({
      imports: [TopicPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: route },
        { provide: LearningStateStore, useClass: FakeLearningStateStore },
      ],
    }).compileComponents();
    store = TestBed.inject(LearningStateStore) as unknown as FakeLearningStateStore;
    fixture = TestBed.createComponent(TopicPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('offers separate preparation and direct-test actions in authored order', () => {
    const cards = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.test-card'),
    ];
    const links = [...cards[0].querySelectorAll('.test-actions a')];

    expect(cards.map((card) => card.querySelector('h3')?.textContent?.trim())).toEqual([
      'Test 1',
      'Review test',
    ]);
    expect(links.map((link) => link.textContent?.trim())).toEqual(['Learn first', 'Start test']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/learn/topic/test-1',
      '/study/topic/test-1',
    ]);
    expect(cards[0].textContent).toContain('Target: Vowel harmony');
    expect(cards[0].querySelector('.set-badge, .stage-badge')).toBeNull();
  });

  it('separates focused tests from reviews without repeating stage badges', () => {
    const element = fixture.nativeElement as HTMLElement;
    const headings = [...element.querySelectorAll('.test-group-heading h3')].map((heading) =>
      heading.textContent?.trim(),
    );
    const cards = [...element.querySelectorAll('.test-card')];

    expect(headings).toEqual(['Focused tests', 'Reviews']);
    expect(element.querySelector('.set-badge, .stage-badge')).toBeNull();
    expect(cards[1].classList).toContain('review-test');
    expect(cards[1].querySelector('a[href="/study/topic/test-2"]')).toBeTruthy();
    expect(element.textContent).toContain('Mixed practice');
  });

  it('places the topic note after the complete learning map', () => {
    const element = fixture.nativeElement as HTMLElement;
    const learningMap = element.querySelector('.learning-map');

    expect(learningMap?.nextElementSibling?.tagName).toBe('APP-STICKY-NOTE');
    expect(learningMap?.nextElementSibling?.textContent).toContain('Notes for this topic');
  });

  it('marks shared preparation as available to review after completion', () => {
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

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.test-actions')?.textContent,
    ).toContain('Review lessons');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('1/1 lessons read');
  });

  it('shows optional review without hiding ordinary tests', () => {
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

    expect(element.querySelector('a[href="/review/topic"]')?.textContent).toContain(
      'Optional review due · 1',
    );
    expect(element.querySelector('a[href="/study/topic/test-1"]')).toBeTruthy();
  });

  it('saves a private topic note locally', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const textarea = element.querySelector('.sticky-note textarea') as HTMLTextAreaElement;
    textarea.value = 'Review the back-vowel examples.';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const save = [...element.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Save note'),
    ) as HTMLButtonElement;
    save.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(store.learnerState().learnerNotes).toMatchObject([
      { topicId: 'topic', text: 'Review the back-vowel examples.' },
    ]);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Note saved locally.');

    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const remove = [...element.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Remove saved note'),
    ) as HTMLButtonElement;
    remove.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(store.learnerState().learnerNotes).toEqual([]);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Saved note removed.');
  });

  it('keeps the note draft visible when saving fails', async () => {
    vi.spyOn(store, 'commit').mockRejectedValueOnce(new Error('Local storage is unavailable.'));
    const element = fixture.nativeElement as HTMLElement;
    const textarea = element.querySelector('.sticky-note textarea') as HTMLTextAreaElement;
    textarea.value = 'Keep this unfinished thought.';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const save = [...element.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Save note'),
    ) as HTMLButtonElement;
    save.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(textarea.value).toBe('Keep this unfinished thought.');
    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Local storage is unavailable.',
    );
  });

  it('shows a recoverable error for an unknown topic', async () => {
    route.snapshot.paramMap = convertToParamMap({ topicId: 'missing' });
    const missingFixture = TestBed.createComponent(TopicPage);
    missingFixture.detectChanges();
    await missingFixture.whenStable();
    missingFixture.detectChanges();

    const element = missingFixture.nativeElement as HTMLElement;
    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'That topic pack could not be found.',
    );
    expect(element.querySelector('a[href="/"]')?.textContent).toContain('Back to topics');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LessonPage } from '@/features/learning/lessons/lesson.page';
import { LessonProgressService } from '@/features/learning/lessons/lesson-progress.service';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { FakeLearningStateStore } from '../../../fixtures/learning-content.fixture';

describe('LessonPage', () => {
  let fixture: ComponentFixture<LessonPage>;
  const completeLesson = vi.fn(async () => undefined);

  beforeEach(async () => {
    completeLesson.mockClear();
    await TestBed.configureTestingModule({
      imports: [LessonPage],
      providers: [
        provideRouter([]),
        { provide: LearningStateStore, useClass: FakeLearningStateStore },
        { provide: LessonProgressService, useValue: { completeLesson } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (name: string) => (name === 'topicId' ? 'topic' : 'test-1'),
              },
            },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LessonPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('shows first-principles teaching and keeps direct test entry available', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Test 1');
    expect(element.querySelector('.lesson-layout.single-lesson')).not.toBeNull();
    expect(element.querySelector('.lesson-list')).toBeNull();
    expect(element.querySelector('.lesson-picker')).toBeNull();
    expect(element.querySelector('.lesson-progress')).toBeNull();
    expect(element.textContent).toContain('Vowel harmony');
    expect(element.textContent).toContain('Worked examples');
    expect(element.textContent).toContain('Common mistakes');
    expect(element.textContent).toContain('Focused lesson');
    expect(element.textContent).toContain('Target: Vowel harmony');
    expect(element.textContent).toContain('talo');
    expect(element.textContent).toContain('house');
    const startTest = [...element.querySelectorAll('a')].find((link) =>
      link.textContent?.includes('Start test now'),
    );
    expect(startTest?.getAttribute('href')).toBe('/study/topic/test-1');
    expect(element.querySelector('.sticky-note textarea')).not.toBeNull();
    expect(element.querySelector('.sticky-note')?.textContent).toContain('Lesson note');
  });

  it('grades optional practice locally without touching scored state', () => {
    const element = fixture.nativeElement as HTMLElement;
    (element.querySelector('.lesson-practice > .button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const input = element.querySelector('.practice-text-answer input') as HTMLInputElement;
    input.value = 'talossa';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (element.querySelector('.practice-actions .primary') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(element.querySelector('.feedback')?.textContent).toContain('Correct');
    expect(element.querySelector('.feedback')?.textContent).toContain('Nothing was added');
    expect(completeLesson).not.toHaveBeenCalled();
  });

  it('reveals an optional practice answer without saving progress', () => {
    const element = fixture.nativeElement as HTMLElement;
    (element.querySelector('.lesson-practice > .button') as HTMLButtonElement).click();
    fixture.detectChanges();
    (element.querySelector('.practice-actions .secondary') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(element.querySelector('.feedback')?.textContent).toContain('Answer revealed');
    expect(element.querySelector('.feedback')?.textContent).toContain('talossa');
    expect(completeLesson).not.toHaveBeenCalled();
  });

  it('finishes a lesson even when optional practice was not started', async () => {
    const button = fixture.nativeElement.querySelector(
      '.lesson-footer button',
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(completeLesson).toHaveBeenCalledWith('lesson-1');
    expect(fixture.nativeElement.textContent).toContain('Preparation complete');
  });
});

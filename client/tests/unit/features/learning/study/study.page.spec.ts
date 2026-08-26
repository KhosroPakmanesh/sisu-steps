import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { SessionAnswerService } from '@/features/learning/study/session-answer.service';
import { StudyPage } from '@/features/learning/study/study.page';
import { FakeLearningStateStore } from '../../../fixtures/learning-content.fixture';

describe('StudyPage', () => {
  let fixture: ComponentFixture<StudyPage>;
  let answers: SessionAnswerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyPage],
      providers: [
        provideRouter([]),
        { provide: LearningStateStore, useClass: FakeLearningStateStore },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
              paramMap: {
                get: (name: string) => (name === 'topicId' ? 'topic' : 'test-1'),
              },
            },
          },
        },
      ],
    }).compileComponents();
    answers = TestBed.inject(SessionAnswerService);
    fixture = TestBed.createComponent(StudyPage);
    fixture.detectChanges();
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();
  });

  it('reveals the answer and explanation from the visible control', async () => {
    const reveal = vi.spyOn(answers, 'revealAnswer');
    const button = fixture.nativeElement.querySelector('.reveal-button') as HTMLButtonElement;
    expect(button.textContent).toContain('Show answer');
    button.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const feedback = fixture.nativeElement.querySelector('.feedback') as HTMLElement;
    expect(reveal).toHaveBeenCalledOnce();
    expect(feedback.textContent).toContain('Answer revealed');
    expect(feedback.textContent).toContain('talossa');
    expect(feedback.textContent).toContain('The word talo has back vowels');
  });

  it('presents focused guidance with a same-level section heading', () => {
    const focus = fixture.nativeElement.querySelector('.test-focus') as HTMLElement;

    expect(focus.querySelector('h2')?.textContent).toContain('Your target: Vowel harmony');
    expect(focus.querySelector('h3')).toBeNull();
    expect(focus.textContent).toContain(
      'Learn and practise this important grammar point separately.',
    );
  });

  it('reveals the answer with Alt+A', async () => {
    const reveal = vi.spyOn(answers, 'revealAnswer');
    const event = new KeyboardEvent('keydown', { key: 'a', altKey: true, cancelable: true });
    window.dispatchEvent(event);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(true);
    expect(reveal).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('.feedback')?.textContent).toContain(
      'Answer revealed',
    );
  });

  it('shows a diagnostic explanation for an incorrect answer', async () => {
    const input = fixture.nativeElement.querySelector('.text-answer input') as HTMLInputElement;
    input.value = 'talossä';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.submit-button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.feedback')?.textContent).toContain(
      'The word talo has back vowels, so the ending is -ssa.',
    );
    expect(fixture.nativeElement.querySelector('.feedback-stamp')?.textContent).toContain('CHECK');
  });

  it('clears a typed draft without storing it', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector('.text-answer input') as HTMLInputElement;
    input.value = 'talo';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('talo');
    expect(storeSnapshot()).toEqual({ attempts: 0, answers: 0 });

    (element.querySelector('.eraser-tool') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(input.value).toBe('');
    expect(storeSnapshot()).toEqual({ attempts: 0, answers: 0 });
  });

  function storeSnapshot() {
    const state = TestBed.inject(LearningStateStore).learnerState();
    return {
      attempts: state.attempts.length,
      answers: state.sessions.flatMap((session) => session.answers).length,
    };
  }
});

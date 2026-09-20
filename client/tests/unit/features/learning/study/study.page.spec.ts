import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { SessionAnswerService } from '@/features/learning/study/session-answer.service';
import { StudyPage } from '@/features/learning/study/study.page';
import { FakeLearningStateStore } from '@testing/helpers/unit/fake-learning-state.store';

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
    await fixture.componentInstance.routeRenderReady;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.focusRouteContent();
  });

  it('focuses the answer and uses Enter to check, continue, and open the result', async () => {
    const input = fixture.nativeElement.querySelector('.text-answer input') as HTMLInputElement;
    expect(document.activeElement).toBe(input);

    input.value = 'talossa';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();

    const continueButton = fixture.nativeElement.querySelector(
      '.continue-button',
    ) as HTMLButtonElement;
    expect(document.activeElement).toBe(continueButton);

    continueButton.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();

    const resultAction = fixture.nativeElement.querySelector(
      '.result-actions a',
    ) as HTMLAnchorElement;
    expect(document.activeElement).toBe(resultAction);
    expect(storeSnapshot()).toEqual({ attempts: 1, answers: 0 });
  });

  it('ignores a repeated Enter keydown', async () => {
    const input = fixture.nativeElement.querySelector('.text-answer input') as HTMLInputElement;
    input.value = 'talossa';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      repeat: true,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    await fixture.whenStable();

    expect(event.defaultPrevented).toBe(true);
    const modifiedEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(modifiedEvent);
    await fixture.whenStable();
    expect(modifiedEvent.defaultPrevented).toBe(false);
    expect(fixture.nativeElement.querySelector('.feedback')).toBeNull();
    expect(storeSnapshot()).toEqual({ attempts: 0, answers: 0 });
  });

  it('reveals the answer and explanation from the visible control', async () => {
    const reveal = vi.spyOn(answers, 'revealAnswer');
    const button = fixture.nativeElement.querySelector('.reveal-button') as HTMLButtonElement;
    expect(button.textContent).toContain('Show answer');
    expect(button.hasAttribute('aria-keyshortcuts')).toBe(false);
    expect(fixture.nativeElement.querySelector('.answer-actions')?.textContent).not.toContain(
      'Alt+A',
    );
    button.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const feedback = fixture.nativeElement.querySelector('.feedback') as HTMLElement;
    expect(reveal).toHaveBeenCalledOnce();
    expect(feedback.textContent).toContain('Answer revealed');
    expect(feedback.textContent).toContain('talossa');
    expect(feedback.textContent).toContain('The word talo has back vowels');
    const actions = fixture.nativeElement.querySelector('.answer-actions') as HTMLElement;
    expect(actions.textContent).toMatch(/Continue|See result/);
    expect(actions.textContent).not.toContain('Check answer');
    expect(actions.textContent).not.toContain('Show answer');
    expect(
      actions.compareDocumentPosition(feedback) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('presents focused guidance with a same-level section heading', () => {
    const focus = fixture.nativeElement.querySelector('.test-focus') as HTMLElement;

    expect(focus.querySelector('h2')?.textContent).toContain('Your target: Vowel harmony');
    expect(focus.querySelector('h3')).toBeNull();
    expect(focus.textContent).toContain(
      'Learn and practise this important grammar point separately.',
    );
  });

  it('keeps current-question vocabulary hidden until cheat mode opens without storing progress', () => {
    const element = fixture.nativeElement as HTMLElement;
    const dialog = element.querySelector('.cheat-mode-dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(false);

    (element.querySelector('.cheat-mode-access button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain('talo');
    expect(dialog.textContent).toContain('house');
    expect(dialog.textContent).not.toContain('koulu');
    expect(dialog.textContent).not.toContain('well');
    expect(storeSnapshot()).toEqual({ attempts: 0, answers: 0 });
  });

  it('does not reveal the answer or intercept Alt+A', async () => {
    const reveal = vi.spyOn(answers, 'revealAnswer');
    const event = new KeyboardEvent('keydown', { key: 'a', altKey: true, cancelable: true });
    window.dispatchEvent(event);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(false);
    expect(reveal).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.feedback')).toBeNull();
    expect(storeSnapshot()).toEqual({ attempts: 0, answers: 0 });
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

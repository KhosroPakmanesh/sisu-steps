import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  Input,
  OnChanges,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnswerDraft } from '../../shared/answer-entry/answer-draft';
import { answerEnterAction } from '../../shared/answer-entry/answer-enter-key.policy';
import {
  nextAvailableWordIndex,
  wordTokenArrowStep,
} from '../../shared/answer-entry/word-token-navigation';
import { Lesson } from '../../shared/content/lesson.models';
import { gradeAnswer } from '../../shared/progress/grading.policy';

interface PracticeFeedback {
  submittedAnswer: string;
  correct: boolean;
  skipped: boolean;
  diagnosticExplanation?: string;
}

@Component({
  selector: 'app-lesson-practice',
  imports: [FormsModule],
  templateUrl: './lesson-practice.component.html',
  styleUrl: './lesson-practice.component.css',
  host: { '(keydown.enter)': 'handleEnter($event)' },
})
export class LessonPracticeComponent implements OnChanges {
  @Input({ required: true }) lesson!: Lesson;

  private readonly injector = inject(Injector);
  private readonly practiceCard = viewChild<ElementRef<HTMLElement>>('practiceCard');
  private readonly wordTokenBank = viewChild<ElementRef<HTMLElement>>('wordTokenBank');
  private readonly checkAnswerButton =
    viewChild<ElementRef<HTMLButtonElement>>('checkAnswerButton');
  private readonly continueButton = viewChild<ElementRef<HTMLButtonElement>>('continueButton');
  private readonly completeAction = viewChild<ElementRef<HTMLButtonElement>>('completeAction');
  protected readonly started = signal(false);
  protected readonly finished = signal(false);
  protected readonly exerciseIndex = signal(0);
  protected readonly feedback = signal<PracticeFeedback | null>(null);
  protected readonly exercise = computed(() => this.lesson.practiceExercises[this.exerciseIndex()]);
  protected readonly answer = new AnswerDraft(
    () => this.exercise(),
    () => !!this.feedback(),
  );

  ngOnChanges(): void {
    this.resetPractice();
  }

  protected start(): void {
    this.started.set(true);
    this.finished.set(false);
    this.exerciseIndex.set(0);
    this.resetAnswer();
    this.scheduleFocus('question');
  }

  protected submit(): void {
    const exercise = this.exercise();
    if (!exercise || !this.answer.canSubmit()) return;
    const submittedAnswer = this.answer.submittedAnswer();
    const result = gradeAnswer(exercise, submittedAnswer);
    this.feedback.set({
      submittedAnswer,
      correct: result.correct,
      skipped: false,
      diagnosticExplanation: result.diagnosticExplanation,
    });
    this.scheduleFocus('continue');
  }

  protected showAnswer(): void {
    if (!this.canRevealAnswer()) return;
    this.answer.reset();
    this.feedback.set({ submittedAnswer: '', correct: false, skipped: true });
    this.scheduleFocus('continue');
  }

  protected continue(): void {
    if (!this.feedback()) return;
    if (this.exerciseIndex() >= this.lesson.practiceExercises.length - 1) {
      this.finished.set(true);
      this.scheduleFocus('complete');
      return;
    }
    this.exerciseIndex.update((index) => index + 1);
    this.resetAnswer();
    this.scheduleFocus('question');
  }

  protected handleEnter(event: Event): void {
    if (!(event instanceof KeyboardEvent) || !this.started() || this.finished()) return;
    const action = answerEnterAction(event, !!this.feedback(), this.answer.canSubmit());
    if (!action) return;
    event.preventDefault();
    if (action === 'continue') this.continue();
    if (action === 'submit') this.submit();
  }

  protected moveWordToken(event: KeyboardEvent, index: number): void {
    const step = wordTokenArrowStep(event);
    if (step === null) return;
    const next = nextAvailableWordIndex(
      this.exercise()?.tokens?.length ?? 0,
      this.answer.selectedTokenIndexes(),
      index,
      step,
    );
    if (next === null) return;
    event.preventDefault();
    this.focusWordToken(next);
  }

  protected chooseWordToken(index: number, event: MouseEvent): void {
    this.answer.chooseToken(index);
    if (event.detail !== 0) return;
    const next = nextAvailableWordIndex(
      this.exercise()?.tokens?.length ?? 0,
      this.answer.selectedTokenIndexes(),
      index,
    );
    if (next === null) this.scheduleWordTokenFocus(null);
    else this.focusWordToken(next);
  }

  protected removeWordToken(position: number, tokenIndex: number, event: MouseEvent): void {
    this.answer.removeToken(position);
    if (event.detail === 0) this.scheduleWordTokenFocus(tokenIndex);
  }

  private canRevealAnswer(): boolean {
    return this.started() && !!this.exercise() && !this.feedback();
  }

  private resetPractice(): void {
    this.started.set(false);
    this.finished.set(false);
    this.exerciseIndex.set(0);
    this.resetAnswer();
  }

  private resetAnswer(): void {
    this.answer.reset();
    this.feedback.set(null);
  }

  private scheduleFocus(target: 'question' | 'continue' | 'complete'): void {
    afterNextRender(
      () => {
        queueMicrotask(() => {
          if (target === 'continue') return this.continueButton()?.nativeElement.focus();
          if (target === 'complete') return this.completeAction()?.nativeElement.focus();
          this.practiceCard()
            ?.nativeElement.querySelector<HTMLElement>(
              'input:not(:disabled), .practice-token-bank button:not(:disabled)',
            )
            ?.focus();
          this.practiceCard()?.nativeElement.scrollIntoView({
            block: 'start',
            behavior: 'instant',
          });
        });
      },
      { injector: this.injector },
    );
  }

  private scheduleWordTokenFocus(index: number | null): void {
    afterNextRender(
      () => {
        queueMicrotask(() => {
          if (index === null) this.checkAnswerButton()?.nativeElement.focus();
          else this.focusWordToken(index);
        });
      },
      { injector: this.injector },
    );
  }

  private focusWordToken(index: number): void {
    const button = this.wordTokenBank()?.nativeElement.querySelectorAll('button')[index];
    if (button instanceof HTMLButtonElement && !button.disabled) button.focus();
  }
}

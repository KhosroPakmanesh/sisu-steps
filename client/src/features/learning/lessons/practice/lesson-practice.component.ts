import { Component, computed, Input, OnChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnswerDraft } from '../../shared/answer-entry/answer-draft';
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
})
export class LessonPracticeComponent implements OnChanges {
  @Input({ required: true }) lesson!: Lesson;

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
  }

  protected showAnswer(): void {
    if (!this.canRevealAnswer()) return;
    this.answer.reset();
    this.feedback.set({ submittedAnswer: '', correct: false, skipped: true });
  }

  protected continue(): void {
    if (!this.feedback()) return;
    if (this.exerciseIndex() >= this.lesson.practiceExercises.length - 1) {
      this.finished.set(true);
      return;
    }
    this.exerciseIndex.update((index) => index + 1);
    this.resetAnswer();
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
}

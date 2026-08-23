import { Component, computed, HostListener, Input, OnChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Exercise, Lesson } from '../shared/content/content.models';
import { gradeAnswer } from '../shared/progress/grading.policy';

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
  protected readonly response = signal('');
  protected readonly selectedTokenIndexes = signal<number[]>([]);
  protected readonly feedback = signal<PracticeFeedback | null>(null);
  protected readonly exercise = computed(() => this.lesson.practiceExercises[this.exerciseIndex()]);
  protected readonly assembledWordOrder = computed(() => {
    const tokens = this.exercise()?.tokens ?? [];
    return this.selectedTokenIndexes()
      .map((index) => tokens[index])
      .join(' ');
  });

  ngOnChanges(): void {
    this.resetPractice();
  }

  protected start(): void {
    this.started.set(true);
    this.finished.set(false);
    this.exerciseIndex.set(0);
    this.resetAnswer();
  }

  protected chooseToken(index: number): void {
    if (!this.feedback() && !this.selectedTokenIndexes().includes(index)) {
      this.selectedTokenIndexes.update((indexes) => [...indexes, index]);
    }
  }

  protected removeToken(position: number): void {
    if (!this.feedback()) {
      this.selectedTokenIndexes.update((indexes) =>
        indexes.filter((_, index) => index !== position),
      );
    }
  }

  protected eraseResponse(): void {
    if (!this.feedback()) this.response.set('');
  }

  protected undoLastWord(): void {
    if (!this.feedback()) {
      this.selectedTokenIndexes.update((indexes) => indexes.slice(0, -1));
    }
  }

  protected clearWordOrder(): void {
    if (!this.feedback()) this.selectedTokenIndexes.set([]);
  }

  protected canSubmit(exercise: Exercise): boolean {
    const answer = exercise.type === 'word-order' ? this.assembledWordOrder() : this.response();
    return answer.trim().length > 0 && !this.feedback();
  }

  protected submit(): void {
    const exercise = this.exercise();
    if (!exercise || !this.canSubmit(exercise)) return;
    const submittedAnswer =
      exercise.type === 'word-order' ? this.assembledWordOrder() : this.response();
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
    this.response.set('');
    this.selectedTokenIndexes.set([]);
    this.feedback.set({ submittedAnswer: '', correct: false, skipped: true });
  }

  @HostListener('window:keydown', ['$event'])
  protected useShowAnswerShortcut(event: KeyboardEvent): void {
    if (
      !event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.key.toLowerCase() !== 'a' ||
      !this.canRevealAnswer()
    ) {
      return;
    }
    event.preventDefault();
    this.showAnswer();
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
    this.response.set('');
    this.selectedTokenIndexes.set([]);
    this.feedback.set(null);
  }
}

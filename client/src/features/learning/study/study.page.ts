import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompletedAttempt } from '@/shared/domain/learner-state.models';
import { routePaths } from '@/shared/navigation/route-paths';
import { Exercise } from '../shared/content/content.models';
import { findExercise, findPack, findTest } from '../shared/content/content.queries';
import { findSession, mistakeCount } from '../shared/progress/progress.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';
import { SessionAnswerService } from './session-answer.service';
import { SessionStartService } from './session-start.service';

@Component({
  selector: 'app-runner',
  imports: [FormsModule, RouterLink],
  templateUrl: './study.page.html',
  styleUrl: './study.page.css',
})
export class StudyPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sessionStart = inject(SessionStartService);
  private readonly sessionAnswers = inject(SessionAnswerService);
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = routePaths;
  protected readonly sessionId = signal<string | null>(null);
  protected readonly response = signal('');
  protected readonly selectedTokenIndexes = signal<number[]>([]);
  protected readonly pageError = signal<string | null>(null);
  protected readonly completedAttempt = signal<CompletedAttempt | null>(null);
  protected readonly busy = signal(false);

  protected readonly session = computed(() => {
    const id = this.sessionId();
    return id ? findSession(this.store.learnerState(), id) : undefined;
  });
  protected readonly exercise = computed(() => {
    const session = this.session();
    return session
      ? findExercise(this.store.packs(), session.exerciseIds[session.currentIndex])
      : undefined;
  });
  protected readonly activeTest = computed(() => {
    const session = this.session();
    return session?.testId
      ? findTest(this.store.packs(), session.topicId, session.testId)
      : undefined;
  });
  protected readonly feedback = computed(() => {
    const session = this.session();
    const exercise = this.exercise();
    return session && exercise
      ? session.answers.find((answer) => answer.exerciseId === exercise.id)
      : undefined;
  });
  protected readonly assembledWordOrder = computed(() => {
    const tokens = this.exercise()?.tokens ?? [];
    return this.selectedTokenIndexes()
      .map((index) => tokens[index])
      .join(' ');
  });

  async ngOnInit(): Promise<void> {
    await this.store.ready;
    if (this.store.error()) return;
    try {
      const mode = this.route.snapshot.data['mode'];
      const topicId = this.route.snapshot.paramMap.get('topicId') ?? '';
      const session =
        mode === 'mistakes'
          ? await this.sessionStart.getOrCreateMistakeSession(topicId)
          : mode === 'review'
            ? await this.sessionStart.getOrCreateReviewSession(topicId)
            : await this.sessionStart.getOrCreateTestSession(
                topicId,
                this.route.snapshot.paramMap.get('testId') ?? '',
              );
      if (!session) {
        this.pageError.set(
          mode === 'review'
            ? 'No review is due yet. Continue with any lesson or test.'
            : 'You have no unresolved mistakes to practise.',
        );
        return;
      }
      this.sessionId.set(session.id);
      this.restoreResponse();
    } catch (error) {
      this.pageError.set(
        error instanceof Error ? error.message : 'The study session could not start.',
      );
    }
  }

  protected mistakeCountForTopic(topicId: string): number {
    return mistakeCount(this.store.learnerState(), findPack(this.store.packs(), topicId));
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
    return answer.trim().length > 0 && !this.feedback() && !this.busy();
  }

  protected async submit(): Promise<void> {
    const sessionId = this.sessionId();
    const exercise = this.exercise();
    if (!sessionId || !exercise || !this.canSubmit(exercise)) return;
    await this.runOperation(
      () =>
        this.sessionAnswers.submitAnswer(
          sessionId,
          exercise.type === 'word-order' ? this.assembledWordOrder() : this.response(),
        ),
      'Your answer could not be saved.',
    );
  }

  protected canRevealAnswer(): boolean {
    return !!this.sessionId() && !!this.exercise() && !this.feedback() && !this.busy();
  }

  protected async showAnswer(): Promise<void> {
    const sessionId = this.sessionId();
    if (!sessionId || !this.canRevealAnswer()) return;
    const revealed = await this.runOperation(
      () => this.sessionAnswers.revealAnswer(sessionId),
      'The answer could not be revealed.',
    );
    if (revealed) this.resetResponse();
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
    void this.showAnswer();
  }

  protected async continue(): Promise<void> {
    const sessionId = this.sessionId();
    if (!sessionId || this.busy()) return;
    const attempt = await this.runOperation(
      () => this.sessionAnswers.advanceSession(sessionId),
      'The next exercise could not open.',
    );
    if (attempt) {
      this.completedAttempt.set(attempt);
      this.sessionId.set(null);
    } else if (attempt === null) this.resetResponse();
  }

  private async runOperation<T>(
    operation: () => Promise<T>,
    fallback: string,
  ): Promise<T | undefined> {
    this.busy.set(true);
    this.pageError.set(null);
    try {
      return await operation();
    } catch (error) {
      this.pageError.set(error instanceof Error ? error.message : fallback);
      return undefined;
    } finally {
      this.busy.set(false);
    }
  }

  private restoreResponse(): void {
    const feedback = this.feedback();
    const exercise = this.exercise();
    if (!feedback || !exercise || feedback.skipped) return;
    if (exercise.type !== 'word-order') {
      this.response.set(feedback.submittedAnswer);
      return;
    }
    const available = [...(exercise.tokens ?? [])];
    const indexes = feedback.submittedAnswer.split(' ').map((token) => {
      const index = available.indexOf(token);
      if (index >= 0) available[index] = `__used-${index}`;
      return index;
    });
    this.selectedTokenIndexes.set(indexes.filter((index) => index >= 0));
  }

  private resetResponse(): void {
    this.response.set('');
    this.selectedTokenIndexes.set([]);
  }
}

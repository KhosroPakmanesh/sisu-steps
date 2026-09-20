import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { learningPaths } from '../shared/navigation/learning.paths';
import { RouteReadiness } from '../shared/navigation/route-readiness';
import { CompletedAttempt } from '../shared/state/learner-state.models';
import { Exercise, LoadedTopicPack } from '../shared/content/content.models';
import { findPackSummary } from '../shared/content/content.queries';
import { findSession, mistakeCount } from '../shared/progress/progress.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';
import { SessionAnswerService } from './session-answer.service';
import { SessionStartService } from './session-start.service';
import { QuestionVocabularyDialogComponent } from './question-vocabulary-dialog.component';
@Component({
  selector: 'app-runner',
  imports: [FormsModule, QuestionVocabularyDialogComponent, RouterLink],
  templateUrl: './study.page.html',
  styleUrl: './study.page.css',
  host: { '(keydown.enter)': 'handleEnter($event)' },
})
export class StudyPage implements RouteReadiness {
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly sessionStart = inject(SessionStartService);
  private readonly sessionAnswers = inject(SessionAnswerService);
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = learningPaths;
  protected readonly sessionId = signal<string | null>(null);
  protected readonly loadedPack = signal<LoadedTopicPack | null>(null);
  protected readonly response = signal('');
  protected readonly selectedTokenIndexes = signal<number[]>([]);
  protected readonly pageError = signal<string | null>(null);
  protected readonly emptySession = signal<{ title: string; message: string } | null>(null);
  protected readonly completedAttempt = signal<CompletedAttempt | null>(null);
  protected readonly busy = signal(false);
  private readonly textAnswer = viewChild<ElementRef<HTMLInputElement>>('textAnswer');
  private readonly answerChoice = viewChild<ElementRef<HTMLInputElement>>('answerChoice');
  private readonly availableWordToken = viewChild<ElementRef<HTMLButtonElement>>('wordToken');
  private readonly continueButton = viewChild<ElementRef<HTMLButtonElement>>('continueButton');
  private readonly resultAction = viewChild<ElementRef<HTMLAnchorElement>>('resultAction');
  protected readonly session = computed(() => {
    const id = this.sessionId();
    return id ? findSession(this.store.learnerState(), id) : undefined;
  });
  protected readonly exercise = computed(() => {
    const session = this.session();
    return session
      ? this.loadedPack()?.exerciseById.get(session.exerciseIds[session.currentIndex])
      : undefined;
  });
  protected readonly activeTest = computed(() => {
    const session = this.session();
    return session?.testId ? this.loadedPack()?.testById.get(session.testId) : undefined;
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
  readonly routeRenderReady = this.initialize();
  private async initialize(): Promise<void> {
    await this.store.ready;
    if (this.store.error()) {
      this.pageError.set(this.store.error());
      return;
    }
    try {
      const mode = this.route.snapshot.data['mode'];
      const topicId = this.route.snapshot.paramMap.get('topicId') ?? '';
      this.loadedPack.set(await this.store.loadPack(topicId));
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
        this.emptySession.set(
          mode === 'review'
            ? {
                title: 'No review is due yet',
                message: 'Continue with any lesson or test while your next review becomes due.',
              }
            : {
                title: 'No mistakes to practise',
                message: 'You have no unresolved mistakes. Continue with any lesson or test.',
              },
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
    return mistakeCount(
      this.store.learnerState(),
      findPackSummary(this.store.packSummaries(), topicId),
    );
  }
  public focusRouteContent(): void {
    this.focusState(this.completedAttempt() ? 'result' : this.feedback() ? 'continue' : 'question');
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
    const answer = await this.runOperation(
      () =>
        this.sessionAnswers.submitAnswer(
          sessionId,
          exercise.type === 'word-order' ? this.assembledWordOrder() : this.response(),
        ),
      'Your answer could not be saved.',
    );
    if (answer) this.scheduleFocus('continue');
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
    if (revealed) {
      this.resetResponse();
      this.scheduleFocus('continue');
    }
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
      this.scheduleFocus('result');
    } else if (attempt === null) {
      this.resetResponse();
      this.scheduleFocus('question');
    }
  }
  protected handleEnter(event: Event): void {
    if (!(event instanceof KeyboardEvent)) return;
    if (event.repeat) {
      event.preventDefault();
      return;
    }
    if (
      event.defaultPrevented ||
      event.isComposing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest('a, button:not(.submit-button):not(.continue-button)')) return;
    if (this.feedback()) {
      event.preventDefault();
      void this.continue();
      return;
    }
    const exercise = this.exercise();
    if (!exercise) return;
    const answerControl =
      target.matches('input[type="text"], input[type="radio"]') ||
      !!target.closest('.submit-button');
    if (answerControl && this.canSubmit(exercise)) {
      event.preventDefault();
      void this.submit();
    }
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

  private scheduleFocus(target: 'question' | 'continue' | 'result'): void {
    afterNextRender(() => this.focusState(target), { injector: this.injector });
  }

  private focusState(target: 'question' | 'continue' | 'result'): void {
    if (target === 'continue') return this.continueButton()?.nativeElement.focus();
    if (target === 'result') {
      this.resultAction()?.nativeElement.focus();
      return;
    }
    const control =
      this.textAnswer()?.nativeElement ??
      this.answerChoice()?.nativeElement ??
      this.availableWordToken()?.nativeElement;
    control?.focus();
  }
}

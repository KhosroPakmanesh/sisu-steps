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
import { learningPaths } from '../../shared/navigation/learning.paths';
import { RouteReadiness } from '../../shared/navigation/route-readiness';
import { CompletedAttempt } from '../../shared/state/learner-state.models';
import { AnswerDraft } from '../../shared/answer-entry/answer-draft';
import { LoadedTopicPack } from '../../shared/content/topic-pack.models';
import { findSession } from '../../shared/progress/session.queries';
import { LearningStateStore } from '../../shared/state/learning-state.store';
import { SessionAnswerService } from '../session/session-answer.service';
import { StudyResultComponent } from '../result/study-result.component';
import { QuestionVocabularyDialogComponent } from '../vocabulary/question-vocabulary-dialog.component';
import { studyEnterAction } from './study-enter-key.policy';
import { EmptyStudySession, StudyRouteLoaderService } from './study-route-loader.service';
@Component({
  selector: 'app-runner',
  imports: [FormsModule, QuestionVocabularyDialogComponent, RouterLink, StudyResultComponent],
  templateUrl: './study.page.html',
  styleUrl: './study.page.css',
  host: { '(keydown.enter)': 'handleEnter($event)' },
})
export class StudyPage implements RouteReadiness {
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly routeLoader = inject(StudyRouteLoaderService);
  private readonly sessionAnswers = inject(SessionAnswerService);
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = learningPaths;
  protected readonly sessionId = signal<string | null>(null);
  protected readonly loadedPack = signal<LoadedTopicPack | null>(null);
  protected readonly pageError = signal<string | null>(null);
  protected readonly emptySession = signal<EmptyStudySession | null>(null);
  protected readonly completedAttempt = signal<CompletedAttempt | null>(null);
  protected readonly busy = signal(false);
  private readonly textAnswer = viewChild<ElementRef<HTMLInputElement>>('textAnswer');
  private readonly answerChoice = viewChild<ElementRef<HTMLInputElement>>('answerChoice');
  private readonly availableWordToken = viewChild<ElementRef<HTMLButtonElement>>('wordToken');
  private readonly continueButton = viewChild<ElementRef<HTMLButtonElement>>('continueButton');
  private readonly result = viewChild(StudyResultComponent);
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
  protected readonly answer = new AnswerDraft(
    () => this.exercise(),
    () => !!this.feedback(),
  );
  readonly routeRenderReady = this.initialize();
  private async initialize(): Promise<void> {
    try {
      const loaded = await this.routeLoader.load(this.route.snapshot);
      this.loadedPack.set(loaded.pack);
      this.emptySession.set(loaded.empty);
      this.sessionId.set(loaded.session?.id ?? null);
      this.restoreResponse();
    } catch (error) {
      this.pageError.set(
        error instanceof Error ? error.message : 'The study session could not start.',
      );
    }
  }
  public focusRouteContent(): void {
    this.focusState(this.completedAttempt() ? 'result' : this.feedback() ? 'continue' : 'question');
  }

  protected async submit(): Promise<void> {
    const sessionId = this.sessionId();
    const exercise = this.exercise();
    if (!sessionId || !exercise || this.busy() || !this.answer.canSubmit()) return;
    const answer = await this.runOperation(
      () => this.sessionAnswers.submitAnswer(sessionId, this.answer.submittedAnswer()),
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
      this.answer.reset();
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
      this.answer.reset();
      this.scheduleFocus('question');
    }
  }

  protected async restartMistakePractice(): Promise<void> {
    if (this.busy()) return;
    const loaded = await this.runOperation(
      () => this.routeLoader.load(this.route.snapshot),
      'Mistake practice could not restart.',
    );
    if (!loaded) {
      this.completedAttempt.set(null);
      return;
    }
    this.loadedPack.set(loaded.pack);
    this.emptySession.set(loaded.empty);
    this.sessionId.set(loaded.session?.id ?? null);
    this.completedAttempt.set(null);
    this.answer.reset();
    this.restoreResponse();
    if (loaded.session) this.scheduleFocus('question');
  }

  protected handleEnter(event: Event): void {
    if (!(event instanceof KeyboardEvent)) return;
    const action = studyEnterAction(
      event,
      !!this.feedback(),
      this.answer.canSubmit() && !this.busy(),
    );
    if (!action) return;
    event.preventDefault();
    if (action === 'continue') void this.continue();
    if (action === 'submit') void this.submit();
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
    this.answer.restore(feedback.submittedAnswer);
  }

  private scheduleFocus(target: 'question' | 'continue' | 'result'): void {
    afterNextRender(() => this.focusState(target), { injector: this.injector });
  }

  private focusState(target: 'question' | 'continue' | 'result'): void {
    if (target === 'continue') return this.continueButton()?.nativeElement.focus();
    if (target === 'result') {
      this.result()?.focusPrimaryAction();
      return;
    }
    const control =
      this.textAnswer()?.nativeElement ??
      this.answerChoice()?.nativeElement ??
      this.availableWordToken()?.nativeElement;
    control?.focus();
  }
}

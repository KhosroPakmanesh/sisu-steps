import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { learningPaths } from '../shared/navigation/learning.paths';
import { ClearHistoryService } from '../learner-data/clear-history.service';
import {
  ConfirmationSheetComponent,
  ConfirmationSheetRequest,
} from '../learner-data/confirmation-sheet.component';
import { TopicPack } from '../shared/content/content.models';
import { findPack } from '../shared/content/content.queries';
import {
  completedAttemptCount,
  correctionCount,
  mistakeCount,
  overallAverage,
} from '../shared/progress/progress.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';
import { getTestProgress } from '../shared/progress/test-progress.queries';

interface PendingClear {
  request: ConfirmationSheetRequest;
  action: () => Promise<void>;
  successMessage: string;
}

@Component({
  selector: 'app-topic-stats',
  imports: [RouterLink, ConfirmationSheetComponent],
  templateUrl: './topic-stats.page.html',
  styleUrls: [
    './topic-stats.page.css',
    './topic-stats.page-ledgers.css',
    './topic-stats.page-interactions.css',
  ],
})
export class TopicStatsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly clearing = inject(ClearHistoryService);
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = learningPaths;
  protected readonly pack = signal<TopicPack | null>(null);
  protected readonly pageError = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly pendingClear = signal<PendingClear | null>(null);
  protected readonly errorMessage = computed(() => this.pageError() ?? this.store.error());
  protected readonly attemptCount = computed(() =>
    this.pack() ? completedAttemptCount(this.store.learnerState(), this.pack()!.id) : 0,
  );
  protected readonly average = computed(() =>
    this.pack() ? overallAverage(this.store.learnerState(), this.pack()!.id) : null,
  );
  protected readonly unresolvedMistakes = computed(() =>
    this.pack() ? mistakeCount(this.store.learnerState(), this.pack()!) : 0,
  );
  protected readonly correctedCount = computed(() =>
    this.pack() ? correctionCount(this.store.learnerState(), false, this.pack()!) : 0,
  );
  protected readonly masteredCount = computed(() =>
    this.pack() ? correctionCount(this.store.learnerState(), true, this.pack()!) : 0,
  );

  async ngOnInit(): Promise<void> {
    await this.store.ready;
    if (this.store.error()) return;
    const topicId = this.route.snapshot.paramMap.get('topicId') ?? '';
    const pack = findPack(this.store.packs(), topicId);
    if (!pack) {
      this.pageError.set('That topic pack could not be found.');
      return;
    }
    this.pack.set(pack);
  }

  protected testProgress(pack: TopicPack, testId: string) {
    return getTestProgress(this.store.learnerState(), pack, testId);
  }

  protected clearTest(topicId: string, testId: string, title: string): void {
    this.requestClear(
      {
        eyebrow: 'One test only',
        title: `Clear “${title}”?`,
        message: 'All saved attempts and mistakes for this test will be removed.',
        confirmLabel: 'Clear test history',
      },
      () => this.clearing.clearTest(topicId, testId),
      `${title} history was cleared.`,
    );
  }

  protected clearTopic(topicId: string, title: string): void {
    this.requestClear(
      {
        eyebrow: 'This topic only',
        title: `Clear “${title}”?`,
        message:
          'All saved progress and private notes for this topic will be removed. Its lessons and exercises remain available.',
        confirmLabel: 'Clear topic history',
      },
      () => this.clearing.clearTopic(topicId),
      `${title} history was cleared.`,
    );
  }

  protected async resolveClear(confirmed: boolean): Promise<void> {
    const pending = this.pendingClear();
    this.pendingClear.set(null);
    if (!confirmed || !pending) return;
    this.message.set(null);
    this.error.set(null);
    try {
      await pending.action();
      this.message.set(pending.successMessage);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The data could not be cleared.');
    }
  }

  private requestClear(
    request: ConfirmationSheetRequest,
    action: () => Promise<void>,
    successMessage: string,
  ): void {
    this.message.set(null);
    this.error.set(null);
    this.pendingClear.set({ request, action, successMessage });
  }
}

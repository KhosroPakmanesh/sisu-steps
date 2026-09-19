import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlockingOverlayAdapter } from '@/shared/browser/blocking-overlay.adapter';
import { getLearningLevelLabel } from '../shared/content/content.queries';
import { learningPaths } from '../shared/navigation/learning.paths';
import { RouteReadiness } from '../shared/navigation/route-readiness';
import {
  completedAttemptCount,
  exerciseCount,
  overallAverage,
} from '../shared/progress/progress.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';
import {
  ContinueLearningTarget,
  getContinueLearningTarget,
  getTopicGroups,
} from './topic-catalog.queries';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './topic-catalog.page.html',
  styleUrl: './topic-catalog.page.css',
})
export class TopicCatalogPage implements RouteReadiness {
  private readonly blockingOverlay = inject(BlockingOverlayAdapter);
  protected readonly store = inject(LearningStateStore);
  readonly routeRenderReady = this.store.ready;
  protected readonly paths = learningPaths;
  protected readonly exerciseCount = computed(() => exerciseCount(this.store.packSummaries()));
  protected readonly attemptCount = computed(() =>
    completedAttemptCount(this.store.learnerState()),
  );
  protected readonly average = computed(() => overallAverage(this.store.learnerState()));
  protected readonly topicGroups = computed(() =>
    getTopicGroups(this.store.learnerState(), this.store.packSummaries(), this.store.packGroups()),
  );
  protected readonly catalogLevelLabel = computed(() =>
    getLearningLevelLabel(this.store.packSummaries()),
  );
  protected readonly continueTarget = computed(() =>
    getContinueLearningTarget(this.store.learnerState(), this.store.packSummaries()),
  );

  protected continuePath(target: ContinueLearningTarget): readonly string[] {
    if (target.mode === 'mistakes') return this.paths.mistakes(target.topicId);
    if (target.mode === 'review') return this.paths.review(target.topicId);
    return this.paths.study(target.topicId, target.testId!);
  }

  protected retry(): void {
    void this.blockingOverlay.run(() => this.store.initialize());
  }
}

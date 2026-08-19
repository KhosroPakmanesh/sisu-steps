import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { routePaths } from '@/shared/navigation/route-paths';
import {
  completedAttemptCount,
  exerciseCount,
  overallAverage,
} from '../shared/progress/progress.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';
import {
  ContinueLearningTarget,
  getContinueLearningTarget,
  getTopicSummaries,
} from './dashboard.queries';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css',
})
export class DashboardPage {
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = routePaths;
  protected readonly exerciseCount = computed(() => exerciseCount(this.store.packs()));
  protected readonly attemptCount = computed(() =>
    completedAttemptCount(this.store.learnerState()),
  );
  protected readonly average = computed(() => overallAverage(this.store.learnerState()));
  protected readonly topicSummaries = computed(() =>
    getTopicSummaries(this.store.learnerState(), this.store.packs()),
  );
  protected readonly continueTarget = computed(() =>
    getContinueLearningTarget(this.store.learnerState(), this.store.packs()),
  );

  protected continuePath(target: ContinueLearningTarget): readonly string[] {
    if (target.mode === 'mistakes') return this.paths.mistakes(target.topicId);
    if (target.mode === 'review') return this.paths.review(target.topicId);
    return this.paths.study(target.topicId, target.testId!);
  }
}

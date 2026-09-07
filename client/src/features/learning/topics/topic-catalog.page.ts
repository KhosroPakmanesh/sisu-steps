import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getLearningLevelLabel } from '../shared/content/content.queries';
import { learningPaths } from '../shared/navigation/learning.paths';
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
} from './topic-catalog.queries';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './topic-catalog.page.html',
  styleUrl: './topic-catalog.page.css',
})
export class TopicCatalogPage {
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = learningPaths;
  protected readonly exerciseCount = computed(() => exerciseCount(this.store.packs()));
  protected readonly attemptCount = computed(() =>
    completedAttemptCount(this.store.learnerState()),
  );
  protected readonly average = computed(() => overallAverage(this.store.learnerState()));
  protected readonly topicSummaries = computed(() =>
    getTopicSummaries(this.store.learnerState(), this.store.packs()),
  );
  protected readonly catalogLevelLabel = computed(() => getLearningLevelLabel(this.store.packs()));
  protected readonly continueTarget = computed(() =>
    getContinueLearningTarget(this.store.learnerState(), this.store.packs()),
  );

  protected continuePath(target: ContinueLearningTarget): readonly string[] {
    if (target.mode === 'mistakes') return this.paths.mistakes(target.topicId);
    if (target.mode === 'review') return this.paths.review(target.topicId);
    return this.paths.study(target.topicId, target.testId!);
  }
}

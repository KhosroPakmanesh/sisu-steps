import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { routePaths } from '@/shared/navigation/route-paths';
import { TopicPack } from '../shared/content/content.models';
import {
  completedAttemptCount,
  correctionCount,
  mistakeCount,
  overallAverage,
} from '../shared/progress/progress.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';
import { getTestReport } from './report.queries';

@Component({
  selector: 'app-reports',
  imports: [RouterLink],
  templateUrl: './reports.page.html',
  styleUrls: [
    './reports.page.css',
    './reports.page-ledgers.css',
    './reports.page-interactions.css',
  ],
})
export class ReportsPage {
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = routePaths;
  protected readonly attemptCount = computed(() =>
    completedAttemptCount(this.store.learnerState()),
  );
  protected readonly average = computed(() => overallAverage(this.store.learnerState()));
  protected readonly mistakeCount = computed(() => mistakeCount(this.store.learnerState()));
  protected readonly correctedCount = computed(() =>
    correctionCount(this.store.learnerState(), false),
  );
  protected readonly masteredCount = computed(() =>
    correctionCount(this.store.learnerState(), true),
  );

  protected testReport(pack: TopicPack, testId: string) {
    return getTestReport(this.store.learnerState(), pack, testId);
  }

  protected topicMistakeCount(pack: TopicPack): number {
    return mistakeCount(this.store.learnerState(), pack);
  }
}

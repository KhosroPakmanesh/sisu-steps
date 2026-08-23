import { Component, computed, inject, signal } from '@angular/core';
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
import { getSkillReports, getTestReport } from './report.queries';

@Component({
  selector: 'app-reports',
  imports: [RouterLink],
  templateUrl: './reports.page.html',
  styleUrl: './reports.page.css',
})
export class ReportsPage {
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = routePaths;
  protected readonly studiedOnly = signal(false);
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

  protected skillReports(pack: TopicPack) {
    return getSkillReports(this.store.learnerState(), pack);
  }

  protected topicMistakeCount(pack: TopicPack): number {
    return mistakeCount(this.store.learnerState(), pack);
  }

  protected visibleTests(pack: TopicPack) {
    return this.studiedOnly()
      ? pack.tests.filter((test) => this.testReport(pack, test.id).attempts > 0)
      : pack.tests;
  }

  protected updateStudiedOnly(event: Event): void {
    this.studiedOnly.set((event.currentTarget as HTMLInputElement).checked);
  }
}

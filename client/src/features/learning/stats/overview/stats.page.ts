import { Component, computed, ElementRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { learningPaths } from '../../shared/navigation/learning.paths';
import { RouteReadiness } from '../../shared/navigation/route-readiness';
import { getLearningLevelLabel } from '../../shared/content/content.queries';
import { TopicPackSummary } from '../../shared/content/catalog.models';
import {
  completedAttemptCount,
  mistakeCount,
  overallAverage,
} from '../../shared/progress/progress-statistics.queries';
import { LearningStateStore } from '../../shared/state/learning-state.store';
import { TopicGroupDisclosureDirective } from '../../shared/topic-group/topic-group-disclosure.directive';

@Component({
  selector: 'app-stats',
  imports: [RouterLink, TopicGroupDisclosureDirective],
  templateUrl: './stats.page.html',
  styleUrls: [
    './stats.page.css',
    '../../shared/styles/topic-catalog-layout.css',
    '../../shared/styles/topic-card-layout.css',
    '../../shared/topic-group/topic-group-disclosure.css',
    '../../shared/topic-group/topic-group-grid.css',
  ],
})
export class StatsPage implements RouteReadiness {
  protected readonly store = inject(LearningStateStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly routeRenderReady = this.store.ready;
  protected readonly paths = learningPaths;
  protected readonly cumulativeAttempts = computed(() =>
    completedAttemptCount(this.store.learnerState()),
  );
  protected readonly cumulativeAverage = computed(() => overallAverage(this.store.learnerState()));
  protected readonly cumulativeMistakes = computed(() => mistakeCount(this.store.learnerState()));
  protected readonly catalogLevelLabel = computed(() =>
    getLearningLevelLabel(this.store.packSummaries()),
  );
  protected readonly packGroups = this.store.packGroups;

  protected completedAttempts(pack: TopicPackSummary): number {
    return completedAttemptCount(this.store.learnerState(), pack.id);
  }

  protected average(pack: TopicPackSummary): number | null {
    return overallAverage(this.store.learnerState(), pack.id);
  }

  protected unresolvedMistakes(pack: TopicPackSummary): number {
    return mistakeCount(this.store.learnerState(), pack);
  }

  focusRouteContent(): void {
    const target = this.host.nativeElement.querySelector<HTMLElement>('main');
    if (!target) return;
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
}

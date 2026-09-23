import { Component, computed, ElementRef, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { learningPaths } from '../../shared/navigation/learning.paths';
import { RouteReadiness } from '../../shared/navigation/route-readiness';
import { BackupRestoreComponent } from '../../learner-data/backup-restore/backup-restore.component';
import { DriveCheckpointComponent } from '../../learner-data/drive/drive-checkpoint.component';
import { getLearningLevelLabel } from '../../shared/content/content.queries';
import { TopicPackSummary } from '../../shared/content/catalog.models';
import {
  completedAttemptCount,
  mistakeCount,
  overallAverage,
} from '../../shared/progress/progress-statistics.queries';
import { LearningStateStore } from '../../shared/state/learning-state.store';

@Component({
  selector: 'app-stats',
  imports: [RouterLink, BackupRestoreComponent, DriveCheckpointComponent],
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.css', '../../shared/styles/topic-catalog-layout.css'],
})
export class StatsPage implements RouteReadiness {
  protected readonly store = inject(LearningStateStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
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
    const selector = this.router.url.endsWith('#google-drive-checkpoint')
      ? '#google-drive-checkpoint'
      : 'main';
    const target = this.host.nativeElement.querySelector<HTMLElement>(selector);
    if (!target) return;
    target.tabIndex = -1;
    target.focus({ preventScroll: selector === 'main' });
  }
}

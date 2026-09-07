import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { routePaths } from '@/shared/navigation/route-paths';
import { BackupRestoreComponent } from '../data-management/backup-restore.component';
import { getCatalogLevelLabel } from '../dashboard/dashboard.queries';
import { TopicPack } from '../shared/content/content.models';
import {
  completedAttemptCount,
  mistakeCount,
  overallAverage,
} from '../shared/progress/progress.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';

@Component({
  selector: 'app-stats',
  imports: [RouterLink, BackupRestoreComponent],
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.css', '../dashboard/dashboard.page.css'],
})
export class StatsPage {
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = routePaths;
  protected readonly cumulativeAttempts = computed(() =>
    completedAttemptCount(this.store.learnerState()),
  );
  protected readonly cumulativeAverage = computed(() => overallAverage(this.store.learnerState()));
  protected readonly cumulativeMistakes = computed(() => mistakeCount(this.store.learnerState()));
  protected readonly catalogLevelLabel = computed(() => getCatalogLevelLabel(this.store.packs()));

  protected completedAttempts(pack: TopicPack): number {
    return completedAttemptCount(this.store.learnerState(), pack.id);
  }

  protected average(pack: TopicPack): number | null {
    return overallAverage(this.store.learnerState(), pack.id);
  }

  protected unresolvedMistakes(pack: TopicPack): number {
    return mistakeCount(this.store.learnerState(), pack);
  }
}

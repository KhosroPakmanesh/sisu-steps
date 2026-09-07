import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { learningPaths } from '../shared/navigation/learning.paths';
import { BackupRestoreComponent } from '../learner-data/backup-restore.component';
import { getLearningLevelLabel } from '../shared/content/content.queries';
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
  styleUrls: ['./stats.page.css', '../topics/topic-catalog.page.css'],
})
export class StatsPage {
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = learningPaths;
  protected readonly cumulativeAttempts = computed(() =>
    completedAttemptCount(this.store.learnerState()),
  );
  protected readonly cumulativeAverage = computed(() => overallAverage(this.store.learnerState()));
  protected readonly cumulativeMistakes = computed(() => mistakeCount(this.store.learnerState()));
  protected readonly catalogLevelLabel = computed(() => getLearningLevelLabel(this.store.packs()));

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

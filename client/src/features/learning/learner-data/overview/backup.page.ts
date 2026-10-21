import { Component, ElementRef, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { learningPaths } from '../../shared/navigation/learning.paths';
import { RouteReadiness } from '../../shared/navigation/route-readiness';
import { LearningStateStore } from '../../shared/state/learning-state.store';
import { BackupRestoreComponent } from '../backup-restore/backup-restore.component';
import { DriveCheckpointComponent } from '../drive/drive-checkpoint.component';

@Component({
  selector: 'app-backup',
  imports: [RouterLink, BackupRestoreComponent, DriveCheckpointComponent],
  templateUrl: './backup.page.html',
  styleUrl: './backup.page.css',
})
export class BackupPage implements RouteReadiness {
  private readonly store = inject(LearningStateStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
  readonly routeRenderReady = this.store.ready;
  protected readonly paths = learningPaths;

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

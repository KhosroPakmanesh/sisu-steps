import { Component, ElementRef, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  AppearancePreference,
  AppearancePreferenceAdapter,
} from '@/shared/browser/appearance-preference.adapter';
import { BlockingOverlayAdapter } from '@/shared/browser/blocking-overlay.adapter';
import { learningPaths } from '@/features/learning/shared/navigation/learning.paths';
import { waitForRoute } from '@/features/learning/shared/navigation/route-readiness';
import { DriveBackupStatusAdapter } from '@/features/learning/learner-data/drive/drive-backup-status.adapter';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrls: ['./app-shell.css', './drive-backup-control.css'],
})
export class AppShell {
  private readonly appearancePreferences = inject(AppearancePreferenceAdapter);
  private readonly blockingOverlay = inject(BlockingOverlayAdapter);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
  private readonly driveStatus = inject(DriveBackupStatusAdapter);
  private hasActivatedRoute = false;
  protected readonly paths = learningPaths;
  protected readonly driveSavedAt = this.driveStatus.savedAt;
  protected appearance: AppearancePreference = 'automatic';

  public constructor() {
    const appRoot = this.host.nativeElement;
    this.blockingOverlay.connect(appRoot, appRoot.ownerDocument.getElementById('app-boot'));
    this.appearance = this.appearancePreferences.read();
    this.appearancePreferences.apply(this.appearance);
  }

  protected changeAppearance(preference: AppearancePreference): void {
    this.appearance = preference;
    this.appearancePreferences.apply(preference);
    this.appearancePreferences.save(preference);
  }

  protected toggleDeskLamp(): void {
    const automaticDark =
      this.appearance === 'automatic' &&
      (globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
    const lampIsOn = this.appearance === 'dark' || automaticDark;
    this.changeAppearance(lampIsOn ? 'light' : 'dark');
  }

  protected async openDriveBackup(): Promise<void> {
    await this.router.navigateByUrl(`${this.paths.stats}#google-drive-checkpoint`);
    queueMicrotask(() => {
      const heading = this.host.nativeElement.querySelector<HTMLElement>(
        '#google-drive-checkpoint',
      );
      heading?.focus();
    });
  }

  protected driveBackupLabel(): string {
    const savedAt = this.driveSavedAt();
    const status = savedAt
      ? `Saved ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(savedAt))}.`
      : 'Not set up.';
    return `Open Google Drive backup controls under Stats. ${status}`;
  }

  protected driveShortStatus(): string {
    const savedAt = this.driveSavedAt();
    return savedAt
      ? new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(
          new Date(savedAt),
        )
      : 'Not set';
  }

  protected activateRoutedContent(component: unknown): void {
    const shouldFocus = this.hasActivatedRoute;
    this.hasActivatedRoute = true;
    void this.revealRoutedContent(component, shouldFocus);
  }

  private async revealRoutedContent(component: unknown, shouldFocus: boolean): Promise<void> {
    await this.blockingOverlay.run(() => waitForRoute(component));
    if (
      typeof component === 'object' &&
      component !== null &&
      'focusRouteContent' in component &&
      typeof component.focusRouteContent === 'function'
    ) {
      component.focusRouteContent();
      return;
    }
    if (shouldFocus) this.focusRoutedContent();
  }

  private focusRoutedContent(): void {
    const routeMain = this.host.nativeElement.querySelector<HTMLElement>('.workbook-folder main');
    if (!routeMain) return;

    routeMain.tabIndex = -1;
    routeMain.focus({ preventScroll: true });
  }
}

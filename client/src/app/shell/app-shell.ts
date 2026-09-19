import { Component, ElementRef, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  AppearancePreference,
  AppearancePreferenceAdapter,
} from '@/shared/browser/appearance-preference.adapter';
import { BlockingOverlayAdapter } from '@/shared/browser/blocking-overlay.adapter';
import { learningPaths } from '@/features/learning/shared/navigation/learning.paths';
import { waitForRoute } from '@/features/learning/shared/navigation/route-readiness';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {
  private readonly appearancePreferences = inject(AppearancePreferenceAdapter);
  private readonly blockingOverlay = inject(BlockingOverlayAdapter);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private hasActivatedRoute = false;
  protected readonly paths = learningPaths;
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

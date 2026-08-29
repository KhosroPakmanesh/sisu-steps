import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  AppearancePreference,
  AppearancePreferenceAdapter,
} from '@/shared/browser/appearance-preference.adapter';
import { routePaths } from '@/shared/navigation/route-paths';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {
  private readonly appearancePreferences = inject(AppearancePreferenceAdapter);
  protected readonly paths = routePaths;
  protected appearance: AppearancePreference = 'automatic';

  public constructor() {
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
}

import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  AppearancePreference,
  AppearancePreferenceAdapter,
  isAppearancePreference,
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

  protected changeAppearance(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (!isAppearancePreference(value)) {
      return;
    }

    this.appearance = value;
    this.appearancePreferences.apply(value);
    this.appearancePreferences.save(value);
  }
}

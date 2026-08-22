import { Injectable } from '@angular/core';

export const appearancePreferenceStorageKey = 'sisu-steps.appearance';

export type AppearancePreference = 'automatic' | 'light' | 'dark';

export function isAppearancePreference(value: string): value is AppearancePreference {
  return value === 'automatic' || value === 'light' || value === 'dark';
}

@Injectable({ providedIn: 'root' })
export class AppearancePreferenceAdapter {
  read(): AppearancePreference {
    try {
      const saved = globalThis.localStorage?.getItem(appearancePreferenceStorageKey);
      return saved && isAppearancePreference(saved) ? saved : 'automatic';
    } catch {
      return 'automatic';
    }
  }

  apply(preference: AppearancePreference): void {
    const root = globalThis.document?.documentElement;
    if (!root) {
      return;
    }

    if (preference === 'automatic') {
      root.removeAttribute('data-appearance');
      return;
    }

    root.dataset['appearance'] = preference;
  }

  save(preference: AppearancePreference): void {
    try {
      if (preference === 'automatic') {
        globalThis.localStorage?.removeItem(appearancePreferenceStorageKey);
      } else {
        globalThis.localStorage?.setItem(appearancePreferenceStorageKey, preference);
      }
    } catch {
      // Appearance remains usable for this visit when browser storage is unavailable.
    }
  }
}

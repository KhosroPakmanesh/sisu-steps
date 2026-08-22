import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AppearancePreferenceAdapter,
  appearancePreferenceStorageKey,
} from '@/shared/browser/appearance-preference.adapter';

describe('AppearancePreferenceAdapter', () => {
  const adapter = new AppearancePreferenceAdapter();

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem(appearancePreferenceStorageKey);
    document.documentElement.removeAttribute('data-appearance');
  });

  it('uses automatic when there is no valid saved preference', () => {
    expect(adapter.read()).toBe('automatic');

    localStorage.setItem(appearancePreferenceStorageKey, 'sepia');

    expect(adapter.read()).toBe('automatic');
  });

  it('applies explicit themes and removes the override for automatic', () => {
    adapter.apply('dark');
    expect(document.documentElement.dataset['appearance']).toBe('dark');

    adapter.apply('automatic');
    expect(document.documentElement.hasAttribute('data-appearance')).toBe(false);
  });

  it('remembers explicit choices and removes the saved override for automatic', () => {
    adapter.save('light');
    expect(adapter.read()).toBe('light');

    adapter.save('automatic');
    expect(localStorage.getItem(appearancePreferenceStorageKey)).toBeNull();
  });

  it('falls back safely when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage unavailable');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage unavailable');
    });

    expect(adapter.read()).toBe('automatic');
    expect(() => adapter.save('dark')).not.toThrow();
  });
});

import { Injectable, signal } from '@angular/core';

export const driveBackupStatusStorageKey = 'sisu-steps.drive-backup-saved-at';

@Injectable({ providedIn: 'root' })
export class DriveBackupStatusAdapter {
  readonly savedAt = signal<string | null>(this.read());

  observeSavedAt(value: string): void {
    this.savedAt.set(value);
    try {
      globalThis.document?.defaultView?.localStorage.setItem(driveBackupStatusStorageKey, value);
    } catch {
      // The in-memory observation remains useful when browser storage is unavailable.
    }
  }

  clear(): void {
    this.savedAt.set(null);
    try {
      globalThis.document?.defaultView?.localStorage.removeItem(driveBackupStatusStorageKey);
    } catch {
      // A stale hint is harmless and never claims that Drive was checked.
    }
  }

  private read(): string | null {
    try {
      const value = globalThis.document?.defaultView?.localStorage.getItem(
        driveBackupStatusStorageKey,
      );
      return value && !Number.isNaN(Date.parse(value)) ? value : null;
    } catch {
      return null;
    }
  }
}

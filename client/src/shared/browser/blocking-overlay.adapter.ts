import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BlockingOverlayAdapter {
  private appRoot: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private pendingOperations = 0;

  connect(appRoot: HTMLElement, overlay: HTMLElement | null): void {
    this.appRoot = appRoot;
    this.overlay = overlay;
  }

  async run<T>(operation: () => PromiseLike<T> | T): Promise<T> {
    this.pendingOperations += 1;
    this.show();

    try {
      return await operation();
    } finally {
      await new Promise<void>((resolve) => globalThis.requestAnimationFrame(() => resolve()));
      this.pendingOperations -= 1;
      if (this.pendingOperations === 0) this.hide();
    }
  }

  private show(): void {
    this.appRoot?.setAttribute('aria-busy', 'true');
    this.appRoot?.setAttribute('aria-hidden', 'true');
    this.appRoot?.setAttribute('inert', '');
    this.overlay?.removeAttribute('hidden');
  }

  private hide(): void {
    this.appRoot?.removeAttribute('aria-busy');
    this.appRoot?.removeAttribute('aria-hidden');
    this.appRoot?.removeAttribute('inert');
    this.overlay?.setAttribute('hidden', '');
  }
}

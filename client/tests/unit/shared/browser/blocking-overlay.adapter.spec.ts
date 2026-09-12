import { describe, expect, it } from 'vitest';
import { BlockingOverlayAdapter } from '@/shared/browser/blocking-overlay.adapter';

describe('BlockingOverlayAdapter', () => {
  it('uses one connected overlay while an operation is pending', async () => {
    const adapter = new BlockingOverlayAdapter();
    const appRoot = document.createElement('app-root');
    const overlay = document.createElement('div');
    let finishOperation = (): void => undefined;
    const operation = new Promise<void>((resolve) => {
      finishOperation = resolve;
    });
    adapter.connect(appRoot, overlay);

    const pending = adapter.run(() => operation);

    expect(overlay.hidden).toBe(false);
    expect(appRoot.getAttribute('aria-busy')).toBe('true');
    expect(appRoot.getAttribute('aria-hidden')).toBe('true');
    expect(appRoot.hasAttribute('inert')).toBe(true);

    finishOperation();
    await pending;

    expect(overlay.hidden).toBe(true);
    expect(appRoot.hasAttribute('aria-busy')).toBe(false);
    expect(appRoot.hasAttribute('aria-hidden')).toBe(false);
    expect(appRoot.hasAttribute('inert')).toBe(false);
  });

  it('does not hide the overlay while another operation remains pending', async () => {
    const adapter = new BlockingOverlayAdapter();
    const appRoot = document.createElement('app-root');
    const overlay = document.createElement('div');
    let finishFirst = (): void => undefined;
    let finishSecond = (): void => undefined;
    adapter.connect(appRoot, overlay);

    const first = adapter.run(
      () =>
        new Promise<void>((resolve) => {
          finishFirst = resolve;
        }),
    );
    const second = adapter.run(
      () =>
        new Promise<void>((resolve) => {
          finishSecond = resolve;
        }),
    );

    finishFirst();
    await first;
    expect(overlay.hidden).toBe(false);
    expect(appRoot.hasAttribute('inert')).toBe(true);

    finishSecond();
    await second;
    expect(overlay.hidden).toBe(true);
    expect(appRoot.hasAttribute('inert')).toBe(false);
  });
});

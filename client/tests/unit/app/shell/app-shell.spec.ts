import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppShell } from '@/app/shell/app-shell';
import { RouteReadiness } from '@/features/learning/shared/navigation/route-readiness';
import { appearancePreferenceStorageKey } from '@/shared/browser/appearance-preference.adapter';

const driveBackupStatusStorageKey = 'sisu-steps.drive-backup-saved-at';

let resolveTestRoute = (): void => undefined;
let routeFocusCount = 0;

@Component({ template: '<main class="test-route">Ready</main>' })
class TestRoutePage implements RouteReadiness {
  readonly routeRenderReady = new Promise<void>((resolve) => {
    resolveTestRoute = resolve;
  });

  focusRouteContent(): void {
    routeFocusCount += 1;
  }
}

@Component({ template: '<main><h2 id="google-drive-checkpoint" tabindex="-1">Drive</h2></main>' })
class StatsAnchorPage {}

describe('AppShell', () => {
  afterEach(() => {
    window.localStorage.removeItem(appearancePreferenceStorageKey);
    window.localStorage.removeItem(driveBackupStatusStorageKey);
    document.documentElement.removeAttribute('data-appearance');
    document.getElementById('app-boot')?.remove();
    resolveTestRoute = (): void => undefined;
    routeFocusCount = 0;
  });

  it('renders local-first navigation and the product shell', async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance).toBeTruthy();
    expect(element.querySelector('.brand')?.textContent).toContain('Sisu Steps');
    expect(element.querySelector('nav')?.textContent).toContain('Notebook');
    expect(element.querySelector('nav')?.textContent).toContain('Stats');
    expect(element.querySelectorAll('.tab-number')).toHaveLength(0);
    expect(element.querySelector('nav a[href="/mistakes/topic"]')).toBeNull();
    const appearanceControl = element.querySelector('.appearance-control');
    const appearanceLegend = appearanceControl?.querySelector('legend');
    expect(appearanceLegend?.textContent?.trim()).toBe('Appearance');
    expect(appearanceLegend?.classList.contains('visually-hidden')).toBe(true);
    expect(appearanceControl?.textContent).not.toContain('Desk light');
    expect(appearanceControl?.textContent).toContain('Day');
    expect(appearanceControl?.textContent).toContain('Night');
    expect(element.querySelectorAll('.appearance-control input[type="radio"]')).toHaveLength(3);
    expect(
      [...element.querySelectorAll('.appearance-options label')].map((label) =>
        label.textContent?.trim(),
      ),
    ).toEqual(['Day', 'Automatic', 'Night']);
    expect(element.querySelector('.appearance-toggle-hardware')).not.toBeNull();
    expect(element.querySelectorAll('.appearance-choice-icon')).toHaveLength(3);
    expect(element.querySelector('.appearance-switch')?.classList).toContain('automatic-selected');
    expect(
      element.querySelector('button[aria-label="Toggle desk lamp between Day and Night"]'),
    ).not.toBeNull();
    const folder = element.querySelector('.workbook-folder');
    const tabs = [...element.querySelectorAll('.workbook-folder-tab')];
    expect(folder).not.toBeNull();
    expect(folder?.querySelector('.workbook-cover')).not.toBeNull();
    expect(folder?.querySelector('router-outlet')).not.toBeNull();
    expect(folder?.querySelector('.shell-route-loading')).toBeNull();
    expect(element.querySelector('.site-header nav')).toBeNull();
    expect(folder?.querySelector('nav[aria-label="Primary navigation"]')).not.toBeNull();
    expect(tabs.map((tab) => tab.classList.item(1))).toEqual(['tab-blue', 'tab-yellow']);
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual(['Notebook', 'Stats']);
    expect(folder?.querySelector('.workbook-page-clip')).not.toBeNull();
    const driveControl = element.querySelector('.drive-backup-control');
    expect(driveControl?.textContent?.trim()).toBe('Not set');
    expect(driveControl?.getAttribute('aria-label')).toContain('Not set up');
    expect(element.querySelector('footer')?.textContent).toContain(
      'Progress saves on this device; Drive recovery is optional.',
    );
    expect(element.querySelector('.site-footer-links a[href="/privacy"]')?.textContent).toBe(
      'Privacy Policy',
    );
    expect(element.querySelector('.site-footer-links a[href="/terms"]')?.textContent).toBe(
      'Terms of Service',
    );
  });

  it('keeps the one initial loader until the first route is ready', async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [provideRouter([{ path: '', component: TestRoutePage }])],
    }).compileComponents();

    const initialLoader = document.createElement('div');
    initialLoader.id = 'app-boot';
    document.body.append(initialLoader);
    const fixture = TestBed.createComponent(AppShell);
    const appRoot = fixture.nativeElement as HTMLElement;
    appRoot.setAttribute('inert', '');
    appRoot.setAttribute('aria-busy', 'true');
    appRoot.setAttribute('aria-hidden', 'true');
    fixture.detectChanges();

    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();

    expect(initialLoader.isConnected).toBe(true);
    expect(appRoot.hasAttribute('inert')).toBe(true);
    expect(appRoot.querySelector('.test-route')?.textContent).toBe('Ready');

    resolveTestRoute();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );

    expect(initialLoader.isConnected).toBe(true);
    expect(initialLoader.hidden).toBe(true);
    expect(appRoot.hasAttribute('inert')).toBe(false);
    expect(appRoot.hasAttribute('aria-busy')).toBe(false);
    expect(appRoot.hasAttribute('aria-hidden')).toBe(false);
    expect(routeFocusCount).toBe(1);
  });

  it('applies and remembers an explicit appearance choice', async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    const nightChoice = fixture.nativeElement.querySelector(
      '.appearance-control input[value="dark"]',
    ) as HTMLInputElement;

    nightChoice.click();
    fixture.detectChanges();

    expect(document.documentElement.dataset['appearance']).toBe('dark');
    expect(window.localStorage.getItem(appearancePreferenceStorageKey)).toBe('dark');
    expect(nightChoice.checked).toBe(true);
    expect(fixture.nativeElement.querySelector('.appearance-switch')?.classList).toContain(
      'night-selected',
    );
  });

  it('announces the locally observed save date and focuses the Drive group from the header', async () => {
    window.localStorage.setItem(driveBackupStatusStorageKey, '2026-09-22T10:00:00.000Z');
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [provideRouter([{ path: 'stats', component: StatsAnchorPage }])],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();

    const driveControl = fixture.nativeElement.querySelector(
      '.drive-backup-control',
    ) as HTMLButtonElement;
    expect(driveControl.textContent?.trim()).not.toContain('Drive backup');
    expect(driveControl.textContent?.trim()).not.toContain('Saved');
    expect(driveControl.getAttribute('aria-label')).toContain('Saved');
    driveControl.click();

    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(TestBed.inject(Router).url).toBe('/stats#google-drive-checkpoint');
      expect((document.activeElement as HTMLElement | null)?.id).toBe('google-drive-checkpoint');
    });
  });
});

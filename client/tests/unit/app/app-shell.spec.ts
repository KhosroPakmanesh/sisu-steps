import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import { AppShell } from '@/app/shell/app-shell';
import { appearancePreferenceStorageKey } from '@/shared/browser/appearance-preference.adapter';

describe('AppShell', () => {
  afterEach(() => {
    localStorage.removeItem(appearancePreferenceStorageKey);
    document.documentElement.removeAttribute('data-appearance');
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
    expect(element.querySelector('nav')?.textContent).toContain('Topics');
    expect(element.querySelector('nav')?.textContent).toContain('Reports');
    expect(element.querySelector('nav')?.textContent).toContain('Data & backup');
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
    const folder = element.querySelector('.workbook-folder');
    const tabs = [...element.querySelectorAll('.workbook-folder-tab')];
    expect(folder).not.toBeNull();
    expect(folder?.querySelector('.workbook-cover')).not.toBeNull();
    expect(folder?.querySelector('router-outlet')).not.toBeNull();
    expect(element.querySelector('.site-header nav')).toBeNull();
    expect(folder?.querySelector('nav[aria-label="Primary navigation"]')).not.toBeNull();
    expect(tabs.map((tab) => tab.classList.item(1))).toEqual([
      'tab-blue',
      'tab-white',
      'tab-yellow',
    ]);
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual([
      'Topics',
      'Reports',
      'Data & backup',
    ]);
    expect(folder?.querySelector('.workbook-page-clip')).not.toBeNull();
    expect(element.querySelector('footer')?.textContent).toContain('stays safely in this browser');
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
    expect(localStorage.getItem(appearancePreferenceStorageKey)).toBe('dark');
    expect(nightChoice.checked).toBe(true);
    expect(fixture.nativeElement.querySelector('.appearance-switch')?.classList).toContain(
      'night-selected',
    );
  });
});

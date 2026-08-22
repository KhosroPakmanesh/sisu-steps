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
    expect(element.querySelector('nav a[href="/mistakes/topic"]')).toBeNull();
    expect(element.querySelector('.appearance-control')?.textContent).toContain('Appearance');
    expect(element.querySelectorAll('.appearance-control option')).toHaveLength(3);
    expect(element.querySelector('footer')?.textContent).toContain('stays safely in this browser');
  });

  it('applies and remembers an explicit appearance choice', async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector(
      '.appearance-control select',
    ) as HTMLSelectElement;

    select.value = 'dark';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(document.documentElement.dataset['appearance']).toBe('dark');
    expect(localStorage.getItem(appearancePreferenceStorageKey)).toBe('dark');
  });
});

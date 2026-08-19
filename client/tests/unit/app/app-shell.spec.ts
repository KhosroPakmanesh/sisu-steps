import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { AppShell } from '@/app/shell/app-shell';

describe('AppShell', () => {
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
    expect(element.querySelector('nav a[href="/mistakes/topic"]')).toBeNull();
    expect(element.querySelector('footer')?.textContent).toContain('stays in this browser');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ConfirmationSheetComponent,
  ConfirmationSheetRequest,
} from '@/features/learning/learner-data/confirmation/confirmation-sheet.component';

const request: ConfirmationSheetRequest = {
  eyebrow: 'Every topic and test',
  title: 'Clear all learner history?',
  message: 'Every attempt will be removed.',
  confirmLabel: 'Clear all history',
};

describe('ConfirmationSheetComponent', () => {
  let fixture: ComponentFixture<ConfirmationSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationSheetComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmationSheetComponent);
    fixture.componentRef.setInput('request', request);
    fixture.detectChanges();
  });

  it('uses the icon close control as the focused safe cancellation action', () => {
    const element = fixture.nativeElement as HTMLElement;
    const close = element.querySelector('.modal-sheet__close') as HTMLButtonElement;

    expect((element.querySelector('dialog') as HTMLDialogElement).open).toBe(true);
    expect(close.getAttribute('aria-label')).toBe('Cancel clearing history');
    expect(document.activeElement).toBe(close);
    expect(element.textContent).not.toContain('Keep my history');
  });

  it('cancels from the backdrop without activating the destructive action', () => {
    const resolved = vi.fn();
    fixture.componentInstance.resolved.subscribe(resolved);
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue(rectangle(100, 100, 400, 400));

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 150, clientY: 150 }));
    expect(dialog.open).toBe(true);
    expect(resolved).not.toHaveBeenCalled();

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));

    expect(dialog.open).toBe(false);
    expect(resolved).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('confirms only from the labelled destructive action', () => {
    const resolved = vi.fn();
    fixture.componentInstance.resolved.subscribe(resolved);

    (
      fixture.nativeElement.querySelector('.confirmation-actions .danger') as HTMLButtonElement
    ).click();

    expect(resolved).toHaveBeenCalledExactlyOnceWith(true);
  });
});

function rectangle(left: number, top: number, right: number, bottom: number): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
    toJSON: () => ({}),
  };
}

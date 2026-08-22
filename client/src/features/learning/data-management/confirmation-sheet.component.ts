import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, effect, inject, input, output, viewChild } from '@angular/core';

export interface ConfirmationSheetRequest {
  eyebrow: string;
  title: string;
  message: string;
  confirmLabel: string;
}

@Component({
  selector: 'app-confirmation-sheet',
  templateUrl: './confirmation-sheet.component.html',
  styleUrl: './confirmation-sheet.component.css',
})
export class ConfirmationSheetComponent {
  public readonly request = input<ConfirmationSheetRequest | null>(null);
  public readonly resolved = output<boolean>();
  private readonly document = inject(DOCUMENT);
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');
  private returnFocus: HTMLElement | null = null;

  public constructor() {
    effect(() => {
      const request = this.request();
      const dialog = this.dialog()?.nativeElement;
      if (!dialog) return;

      if (request && !dialog.open) {
        this.returnFocus = this.document.activeElement as HTMLElement | null;
        dialog.showModal();
      }
      if (request) {
        this.cancelButton()?.nativeElement.focus();
      } else if (dialog.open) {
        dialog.close();
      }
    });
  }

  protected cancel(event?: Event): void {
    event?.preventDefault();
    this.finish(false);
  }

  protected confirm(): void {
    this.finish(true);
  }

  private finish(confirmed: boolean): void {
    const dialog = this.dialog()?.nativeElement;
    if (dialog?.open) dialog.close();
    this.resolved.emit(confirmed);
    queueMicrotask(() => this.returnFocus?.focus());
  }
}

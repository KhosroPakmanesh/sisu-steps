import { Component, computed, ElementRef, effect, input, viewChild } from '@angular/core';
import { Exercise, TopicPack } from '../shared/content/content.models';
import { vocabularyForExercise } from '../shared/content/content.queries';
import { isDialogBackdropClick } from '@/shared/browser/dialog-backdrop';

@Component({
  selector: 'app-question-vocabulary-dialog',
  templateUrl: './question-vocabulary-dialog.component.html',
  styleUrl: './question-vocabulary-dialog.component.css',
})
export class QuestionVocabularyDialogComponent {
  public readonly exercise = input.required<Exercise>();
  public readonly pack = input.required<TopicPack>();
  protected readonly vocabulary = computed(() =>
    vocabularyForExercise(this.pack(), this.exercise()),
  );
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  private previousQuestionId: string | undefined;
  private restoreTriggerFocus = true;

  public constructor() {
    effect(() => {
      const questionId = this.exercise().id;
      if (this.previousQuestionId && this.previousQuestionId !== questionId) {
        this.close(false);
      }
      this.previousQuestionId = questionId;
    });
  }

  protected open(): void {
    const dialog = this.dialog()?.nativeElement;
    if (!dialog || dialog.open) return;
    this.restoreTriggerFocus = true;
    dialog.showModal();
    this.closeButton()?.nativeElement.focus();
  }

  protected close(restoreFocus = true, event?: Event): void {
    event?.preventDefault();
    const dialog = this.dialog()?.nativeElement;
    if (!dialog?.open) return;
    this.restoreTriggerFocus = restoreFocus;
    dialog.close();
  }

  protected dismissFromBackdrop(event: MouseEvent): void {
    const dialog = this.dialog()?.nativeElement;
    if (dialog && isDialogBackdropClick(event, dialog)) this.close();
  }

  protected handleClosed(): void {
    if (this.restoreTriggerFocus) {
      queueMicrotask(() => this.trigger()?.nativeElement.focus());
    }
    this.restoreTriggerFocus = true;
  }
}

import { Component, computed, inject, Input, OnChanges, signal } from '@angular/core';
import { LearningStateStore } from '../state/learning-state.store';
import {
  findLearnerNote,
  LearnerNoteService,
  MAX_LEARNER_NOTE_LENGTH,
} from './learner-note.service';

@Component({
  selector: 'app-sticky-note',
  templateUrl: './sticky-note.component.html',
  styleUrl: './sticky-note.component.css',
})
export class StickyNoteComponent implements OnChanges {
  @Input({ required: true }) topicId = '';
  @Input() lessonId?: string;
  @Input() heading = 'My note';

  private readonly store = inject(LearningStateStore);
  private readonly notes = inject(LearnerNoteService);
  protected readonly maxLength = MAX_LEARNER_NOTE_LENGTH;
  protected readonly draft = signal('');
  protected readonly savedText = signal('');
  protected readonly busy = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly hasChanges = computed(() => this.draft() !== this.savedText());
  protected readonly willRemove = computed(
    () => this.savedText().length > 0 && this.draft().trim().length === 0,
  );

  ngOnChanges(): void {
    const text =
      findLearnerNote(this.store.learnerState(), this.topicId, this.lessonId)?.text ?? '';
    this.savedText.set(text);
    this.draft.set(text);
    this.message.set(null);
    this.error.set(null);
  }

  protected updateDraft(event: Event): void {
    this.draft.set((event.currentTarget as HTMLTextAreaElement).value);
    this.message.set(null);
    this.error.set(null);
  }

  protected resetDraft(): void {
    this.draft.set(this.savedText());
    this.message.set('Draft reset to the last saved note.');
    this.error.set(null);
  }

  protected async save(): Promise<void> {
    if (!this.hasChanges() || this.busy() || this.draft().length > this.maxLength) return;
    this.busy.set(true);
    this.message.set(null);
    this.error.set(null);
    try {
      const saved = await this.notes.save(this.topicId, this.lessonId, this.draft());
      const text = saved?.text ?? '';
      this.savedText.set(text);
      this.draft.set(text);
      this.message.set(saved ? 'Note saved locally.' : 'Saved note removed.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Your note could not be saved.');
    } finally {
      this.busy.set(false);
    }
  }
}

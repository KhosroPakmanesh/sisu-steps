import { computed, signal } from '@angular/core';
import { Exercise } from '../content/exercise.models';

export class AnswerDraft {
  readonly response = signal('');
  readonly selectedTokenIndexes = signal<number[]>([]);
  readonly assembledWordOrder = computed(() => {
    const tokens = this.exercise()?.tokens ?? [];
    return this.selectedTokenIndexes()
      .map((index) => tokens[index])
      .join(' ');
  });

  constructor(
    private readonly exercise: () => Exercise | undefined,
    private readonly locked: () => boolean,
  ) {}

  chooseToken(index: number): void {
    if (!this.locked() && !this.selectedTokenIndexes().includes(index)) {
      this.selectedTokenIndexes.update((indexes) => [...indexes, index]);
    }
  }

  removeToken(position: number): void {
    if (!this.locked()) {
      this.selectedTokenIndexes.update((indexes) =>
        indexes.filter((_, index) => index !== position),
      );
    }
  }

  eraseResponse(): void {
    if (!this.locked()) this.response.set('');
  }

  undoLastWord(): void {
    if (!this.locked()) {
      this.selectedTokenIndexes.update((indexes) => indexes.slice(0, -1));
    }
  }

  clearWordOrder(): void {
    if (!this.locked()) this.selectedTokenIndexes.set([]);
  }

  canSubmit(): boolean {
    return this.submittedAnswer().trim().length > 0 && !this.locked();
  }

  submittedAnswer(): string {
    return this.exercise()?.type === 'word-order' ? this.assembledWordOrder() : this.response();
  }

  restore(submittedAnswer: string): void {
    const exercise = this.exercise();
    if (!exercise || exercise.type !== 'word-order') {
      this.response.set(submittedAnswer);
      return;
    }
    const available = [...(exercise.tokens ?? [])];
    const indexes = submittedAnswer.split(' ').map((token) => {
      const index = available.indexOf(token);
      if (index >= 0) available[index] = `__used-${index}`;
      return index;
    });
    this.selectedTokenIndexes.set(indexes.filter((index) => index >= 0));
  }

  reset(): void {
    this.response.set('');
    this.selectedTokenIndexes.set([]);
  }
}

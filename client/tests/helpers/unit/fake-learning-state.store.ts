import { signal } from '@angular/core';
import { TopicPack } from '@/features/learning/shared/content/content.models';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { LearnerState } from '@/features/learning/shared/state/learner-state.models';
import { learningPack } from './learning-content.fixture';

export class FakeLearningStateStore {
  readonly packs = signal<TopicPack[]>([structuredClone(learningPack)]);
  readonly learnerState = signal<LearnerState>(
    createEmptyLearnerState({ [learningPack.id]: learningPack.version }),
  );
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly ready = Promise.resolve();

  async initialize(): Promise<void> {
    this.loading.set(false);
  }

  async commit(update: (state: LearnerState) => LearnerState): Promise<void> {
    this.learnerState.set(update(this.learnerState()));
  }

  async replace(state: LearnerState): Promise<void> {
    this.learnerState.set(structuredClone(state));
  }
}

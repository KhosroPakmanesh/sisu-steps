import { inject, Injectable, signal } from '@angular/core';
import { LearnerState } from '@/shared/domain/learner-state.models';
import { LEARNER_STATE_REPOSITORY } from '@/shared/persistence/learner-state.repository';
import { ContentCatalogService } from '../content/content-catalog.service';
import { TopicPack } from '../content/content.models';
import { alignLearnerStateWithPacks } from './align-learner-state.policy';
import { createEmptyLearnerState } from './learner-state.factory';

@Injectable({ providedIn: 'root' })
export class LearningStateStore {
  private readonly contentCatalog = inject(ContentCatalogService);
  private readonly repository = inject(LEARNER_STATE_REPOSITORY);

  readonly packs = signal<TopicPack[]>([]);
  readonly learnerState = signal<LearnerState>(createEmptyLearnerState());
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly ready = this.initialize();

  async initialize(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [packs, storedState] = await Promise.all([
        this.contentCatalog.loadPacks(),
        this.repository.load(),
      ]);
      const learnerState = storedState ?? createEmptyLearnerState();
      const compatibleState = alignLearnerStateWithPacks(learnerState, packs);
      if (JSON.stringify(compatibleState) !== JSON.stringify(learnerState)) {
        await this.repository.save(compatibleState);
      }
      this.packs.set(packs);
      this.learnerState.set(compatibleState);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The app could not start.');
    } finally {
      this.loading.set(false);
    }
  }

  async commit(update: (state: LearnerState) => LearnerState): Promise<void> {
    const nextState = update(this.learnerState());
    await this.repository.save(nextState);
    this.learnerState.set(nextState);
  }

  async replace(state: LearnerState): Promise<void> {
    await this.repository.save(state);
    this.learnerState.set(structuredClone(state));
  }
}

import { inject, Injectable, signal } from '@angular/core';
import { LearnerState } from './learner-state.models';
import { LEARNER_STATE_REPOSITORY } from './persistence/learner-state.repository';
import { ContentCatalogService } from '../content/content-catalog.service';
import { LoadedTopicPack, TopicPack, TopicPackSummary } from '../content/content.models';
import { PackContentRepository } from '../content/pack-content.repository';
import { findPackSummary } from '../content/content.queries';
import { alignLearnerStateWithPacks } from './align-learner-state.policy';
import { createEmptyLearnerState } from './learner-state.factory';

@Injectable({ providedIn: 'root' })
export class LearningStateStore {
  private readonly contentCatalog = inject(ContentCatalogService);
  private readonly packContent = inject(PackContentRepository);
  private readonly repository = inject(LEARNER_STATE_REPOSITORY);

  readonly packSummaries = signal<TopicPackSummary[]>([]);
  readonly learnerState = signal<LearnerState>(createEmptyLearnerState());
  readonly error = signal<string | null>(null);
  readonly ready = this.initialize();

  async initialize(): Promise<void> {
    this.error.set(null);
    try {
      const [packs, storedState] = await Promise.all([
        this.contentCatalog.loadPackSummaries(),
        this.repository.load(),
      ]);
      const learnerState = storedState ?? createEmptyLearnerState();
      const alignedState = alignLearnerStateWithPacks(learnerState, packs);
      if (!storedState || JSON.stringify(alignedState) !== JSON.stringify(learnerState)) {
        await this.repository.save(alignedState);
      }
      this.packSummaries.set(packs);
      this.learnerState.set(alignedState);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The app could not start.');
    }
  }

  async loadPack(topicId: string): Promise<LoadedTopicPack> {
    const summary = findPackSummary(this.packSummaries(), topicId);
    if (!summary) throw new Error('The exercise pack has not loaded yet.');
    return this.packContent.load(summary);
  }

  async loadAllPacks(): Promise<TopicPack[]> {
    const loaded = await Promise.all(
      this.packSummaries().map((summary) => this.packContent.load(summary)),
    );
    return loaded.map(({ pack }) => pack);
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

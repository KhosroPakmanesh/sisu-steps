import { signal } from '@angular/core';
import {
  LoadedTopicPack,
  PackGroupSummary,
  TopicPack,
  TopicPackSummary,
} from '@/features/learning/shared/content/content.models';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { LearnerState } from '@/features/learning/shared/state/learner-state.models';
import { learningPack } from './learning-content.fixture';

export class FakeLearningStateStore {
  readonly packSummaries = signal<TopicPackSummary[]>([topicPackToSummary(learningPack)]);
  readonly packGroups = signal<PackGroupSummary[]>([
    {
      id: 'foundations',
      title: 'Foundations',
      packs: [topicPackToSummary(learningPack)],
    },
  ]);
  readonly learnerState = signal<LearnerState>(
    createEmptyLearnerState({ [learningPack.id]: learningPack.version }),
  );
  readonly error = signal<string | null>(null);
  readonly ready = Promise.resolve();

  initialize(): Promise<void> {
    return Promise.resolve();
  }

  async loadPack(topicId: string): Promise<LoadedTopicPack> {
    if (topicId !== learningPack.id) throw new Error('The exercise pack has not loaded yet.');
    const pack = structuredClone(learningPack);
    return {
      pack,
      lessonById: new Map(pack.lessons.map((lesson) => [lesson.id, lesson])),
      testById: new Map(pack.tests.map((test) => [test.id, test])),
      exerciseById: new Map(
        pack.tests.flatMap((test) => test.exercises.map((exercise) => [exercise.id, exercise])),
      ),
    };
  }

  async loadAllPacks(): Promise<TopicPack[]> {
    return [structuredClone(learningPack)];
  }

  async commit(update: (state: LearnerState) => LearnerState): Promise<void> {
    this.learnerState.set(update(this.learnerState()));
  }

  async replace(state: LearnerState): Promise<void> {
    this.learnerState.set(structuredClone(state));
  }
}

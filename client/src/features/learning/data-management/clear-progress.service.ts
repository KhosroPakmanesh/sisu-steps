import { inject, Injectable } from '@angular/core';
import { findPack, findTest } from '../shared/content/content.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';
import { createEmptyLearnerState } from '../shared/state/learner-state.factory';

@Injectable({ providedIn: 'root' })
export class ClearProgressService {
  private readonly store = inject(LearningStateStore);

  async clearTest(topicId: string, testId: string): Promise<void> {
    const test = findTest(this.store.packs(), topicId, testId);
    const exerciseIds = new Set(test?.exercises.map((exercise) => exercise.id) ?? []);
    await this.store.commit((state) => ({
      ...state,
      attempts: state.attempts.filter(
        (attempt) =>
          !(attempt.topicId === topicId && attempt.testId === testId) &&
          !(attempt.sourceExerciseIds ?? []).some((id) => exerciseIds.has(id)),
      ),
      sessions: state.sessions.filter(
        (session) =>
          !(session.topicId === topicId && session.testId === testId) &&
          !(session.sourceExerciseIds ?? []).some((id) => exerciseIds.has(id)),
      ),
      unresolvedMistakeIds: state.unresolvedMistakeIds.filter((id) => !exerciseIds.has(id)),
      correctionRecords: (state.correctionRecords ?? []).filter(
        (record) => !exerciseIds.has(record.exerciseId),
      ),
    }));
  }

  async clearTopic(topicId: string): Promise<void> {
    const pack = findPack(this.store.packs(), topicId);
    if (!pack) throw new Error('The exercise pack has not loaded yet.');
    const exerciseIds = new Set(
      pack.tests.flatMap((test) => test.exercises.map((exercise) => exercise.id)),
    );
    const lessonIds = new Set(pack.lessons.map((lesson) => lesson.id));
    await this.store.commit((state) => ({
      ...state,
      attempts: state.attempts.filter((attempt) => attempt.topicId !== topicId),
      sessions: state.sessions.filter((session) => session.topicId !== topicId),
      unresolvedMistakeIds: state.unresolvedMistakeIds.filter((id) => !exerciseIds.has(id)),
      lessonCompletions: (state.lessonCompletions ?? []).filter(
        (completion) => !lessonIds.has(completion.lessonId),
      ),
      correctionRecords: (state.correctionRecords ?? []).filter(
        (record) => !exerciseIds.has(record.exerciseId),
      ),
    }));
  }

  async clearAll(): Promise<void> {
    await this.store.commit(() =>
      createEmptyLearnerState(
        Object.fromEntries(this.store.packs().map((pack) => [pack.id, pack.version])),
      ),
    );
  }
}

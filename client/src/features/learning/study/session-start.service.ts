import { inject, Injectable } from '@angular/core';
import { StudySession } from '@/shared/domain/learner-state.models';
import { findExercise, findPack, findTest } from '../shared/content/content.queries';
import {
  dueCorrections,
  findModeSession,
  findTestSession,
  packExerciseIds,
} from '../shared/progress/progress.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';
import { createStudySession } from './study-session.factory';

@Injectable({ providedIn: 'root' })
export class SessionStartService {
  private readonly store = inject(LearningStateStore);

  async getOrCreateTestSession(topicId: string, testId: string): Promise<StudySession> {
    const existing = findTestSession(this.store.learnerState(), topicId, testId);
    if (existing) return existing;
    const test = findTest(this.store.packs(), topicId, testId);
    const pack = findPack(this.store.packs(), topicId);
    if (!test || !pack) throw new Error('That test does not exist.');
    return this.persist(
      createStudySession({
        mode: 'test',
        topicId: pack.id,
        testId: test.id,
        title: test.title,
        exerciseIds: test.exercises.map((exercise) => exercise.id),
      }),
    );
  }

  async getOrCreateMistakeSession(topicId: string): Promise<StudySession | null> {
    const state = this.store.learnerState();
    const pack = findPack(this.store.packs(), topicId);
    if (!pack) throw new Error('The exercise pack has not loaded yet.');
    const exerciseIds = packExerciseIds(pack);
    const validIds = state.unresolvedMistakeIds.filter((id) => exerciseIds.has(id));
    const existing = findModeSession(state, topicId, 'mistakes');
    if (existing) {
      const remainingIds = existing.exerciseIds.filter((id) => validIds.includes(id));
      if (remainingIds.length > 0 && remainingIds.length === existing.exerciseIds.length) {
        return existing;
      }
    }
    if (validIds.length === 0) return null;
    return this.persist(
      createStudySession({
        mode: 'mistakes',
        topicId: pack.id,
        title: 'Practice mistakes',
        exerciseIds: validIds,
      }),
      'mistakes',
    );
  }

  async getOrCreateReviewSession(topicId: string): Promise<StudySession | null> {
    const state = this.store.learnerState();
    const existing = findModeSession(state, topicId, 'review');
    if (existing) return existing;
    const due = dueCorrections(state, this.store.packs(), topicId).filter(
      (record) =>
        record.exerciseId !== record.parallelExerciseId &&
        findExercise(this.store.packs(), record.parallelExerciseId) !== undefined,
    );
    if (due.length === 0) return null;
    const pack = findPack(this.store.packs(), topicId);
    if (!pack) throw new Error('The exercise pack has not loaded yet.');
    return this.persist(
      createStudySession({
        mode: 'review',
        topicId: pack.id,
        title: 'Review due',
        exerciseIds: due.map((record) => record.parallelExerciseId),
        sourceExerciseIds: due.map((record) => record.exerciseId),
      }),
      'review',
    );
  }

  private async persist(
    session: StudySession,
    replaceMode?: 'review' | 'mistakes',
  ): Promise<StudySession> {
    await this.store.commit((state) => ({
      ...state,
      sessions: [
        ...state.sessions.filter(
          (item) =>
            !replaceMode || !(item.mode === replaceMode && item.topicId === session.topicId),
        ),
        session,
      ],
    }));
    return session;
  }
}

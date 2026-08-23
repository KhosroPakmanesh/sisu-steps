import { Injectable } from '@angular/core';
import { LearnerState } from '../../domain/learner-state.models';
import { LearnerStateRepository } from '../learner-state.repository';
import { LEARNER_STATE_KEY, LEARNER_STATE_STORE } from './database.constants';
import { openLearnerDatabase } from './open-learner-database';

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

@Injectable()
export class IndexedDbLearnerStateRepository implements LearnerStateRepository {
  private readonly database = openLearnerDatabase();

  async load(): Promise<LearnerState | undefined> {
    const database = await this.database;
    const transaction = database.transaction(LEARNER_STATE_STORE, 'readonly');
    const stored = await requestResult(
      transaction.objectStore(LEARNER_STATE_STORE).get(LEARNER_STATE_KEY),
    );
    if (!stored) return undefined;
    const state = stored as LearnerState;
    return {
      ...state,
      lessonCompletions: state.lessonCompletions ?? [],
      correctionRecords: state.correctionRecords ?? [],
      learnerNotes: state.learnerNotes ?? [],
    };
  }

  async save(state: LearnerState): Promise<void> {
    const database = await this.database;
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(LEARNER_STATE_STORE, 'readwrite');
      transaction.objectStore(LEARNER_STATE_STORE).put(structuredClone(state), LEARNER_STATE_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error('Could not save progress.'));
      transaction.onabort = () =>
        reject(transaction.error ?? new Error('Saving progress was cancelled.'));
    });
  }
}

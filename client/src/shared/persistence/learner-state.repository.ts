import { InjectionToken } from '@angular/core';
import { LearnerState } from '../domain/learner-state.models';

export interface LearnerStateRepository {
  load(): Promise<LearnerState | undefined>;
  save(state: LearnerState): Promise<void>;
}

export const LEARNER_STATE_REPOSITORY = new InjectionToken<LearnerStateRepository>(
  'LEARNER_STATE_REPOSITORY',
);

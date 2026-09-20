import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { LoadedTopicPack } from '../../shared/content/topic-pack.models';
import { StudySession } from '../../shared/state/learner-state.models';
import { LearningStateStore } from '../../shared/state/learning-state.store';
import { SessionStartService } from '../session/session-start.service';

export interface EmptyStudySession {
  title: string;
  message: string;
}

export interface LoadedStudyRoute {
  pack: LoadedTopicPack;
  session: StudySession | null;
  empty: EmptyStudySession | null;
}

@Injectable({ providedIn: 'root' })
export class StudyRouteLoaderService {
  private readonly sessions = inject(SessionStartService);
  private readonly store = inject(LearningStateStore);

  async load(route: ActivatedRouteSnapshot): Promise<LoadedStudyRoute> {
    await this.store.ready;
    if (this.store.error()) throw new Error(this.store.error()!);

    const mode = route.data['mode'];
    const topicId = route.paramMap.get('topicId') ?? '';
    const pack = await this.store.loadPack(topicId);
    const session =
      mode === 'mistakes'
        ? await this.sessions.getOrCreateMistakeSession(topicId)
        : mode === 'review'
          ? await this.sessions.getOrCreateReviewSession(topicId)
          : await this.sessions.getOrCreateTestSession(topicId, route.paramMap.get('testId') ?? '');

    return { pack, session, empty: session ? null : this.emptyState(mode) };
  }

  private emptyState(mode: unknown): EmptyStudySession {
    return mode === 'review'
      ? {
          title: 'No review is due yet',
          message: 'Continue with any lesson or test while your next review becomes due.',
        }
      : {
          title: 'No mistakes to practise',
          message: 'You have no unresolved mistakes. Continue with any lesson or test.',
        };
  }
}

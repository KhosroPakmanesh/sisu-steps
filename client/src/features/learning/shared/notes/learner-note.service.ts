import { inject, Injectable } from '@angular/core';
import { LearnerNote, LearnerState } from '@/shared/domain/learner-state.models';
import { findPack } from '../content/content.queries';
import { LearningStateStore } from '../state/learning-state.store';

export const MAX_LEARNER_NOTE_LENGTH = 1000;

export function findLearnerNote(
  state: LearnerState,
  topicId: string,
  lessonId?: string,
): LearnerNote | undefined {
  return (state.learnerNotes ?? []).find(
    (note) => note.topicId === topicId && note.lessonId === lessonId,
  );
}

@Injectable({ providedIn: 'root' })
export class LearnerNoteService {
  private readonly store = inject(LearningStateStore);

  async save(
    topicId: string,
    lessonId: string | undefined,
    draft: string,
  ): Promise<LearnerNote | undefined> {
    this.validateScope(topicId, lessonId);
    const text = draft.trim();
    if (text.length > MAX_LEARNER_NOTE_LENGTH) {
      throw new Error(`Notes can contain at most ${MAX_LEARNER_NOTE_LENGTH} characters.`);
    }
    const note = text
      ? { topicId, ...(lessonId ? { lessonId } : {}), text, updatedAt: new Date().toISOString() }
      : undefined;
    await this.store.commit((state) => ({
      ...state,
      learnerNotes: [
        ...(state.learnerNotes ?? []).filter(
          (item) => item.topicId !== topicId || item.lessonId !== lessonId,
        ),
        ...(note ? [note] : []),
      ],
    }));
    return note;
  }

  private validateScope(topicId: string, lessonId?: string): void {
    const pack = findPack(this.store.packs(), topicId);
    if (!pack) throw new Error('This note no longer belongs to an installed topic.');
    if (lessonId && !pack.lessons.some((lesson) => lesson.id === lessonId)) {
      throw new Error('This note no longer belongs to an installed lesson.');
    }
  }
}

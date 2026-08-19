import { Injectable, inject } from '@angular/core';
import { findLesson } from '../shared/content/content.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';

@Injectable({ providedIn: 'root' })
export class LessonProgressService {
  private readonly store = inject(LearningStateStore);

  async completeLesson(lessonId: string): Promise<void> {
    const lesson = findLesson(this.store.packs(), lessonId);
    if (!lesson) throw new Error('That lesson does not exist.');
    const completion = {
      lessonId: lesson.id,
      lessonVersion: lesson.version,
      completedAt: new Date().toISOString(),
    };
    await this.store.commit((state) => ({
      ...state,
      lessonCompletions: [
        ...(state.lessonCompletions ?? []).filter((item) => item.lessonId !== lesson.id),
        completion,
      ],
    }));
  }
}

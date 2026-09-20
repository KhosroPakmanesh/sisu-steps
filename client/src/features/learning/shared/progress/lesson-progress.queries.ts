import { ContentLessonSummary, TopicPackSummary } from '../content/catalog.models';
import { findPackSummary } from '../content/content.queries';
import { LearnerState } from '../state/learner-state.models';

export interface LessonProgress {
  completed: number;
  total: number;
}

export function lessonProgressForTest(
  state: LearnerState,
  packs: TopicPackSummary[],
  topicId: string,
  testId: string,
): LessonProgress {
  const pack = findPackSummary(packs, topicId);
  const test = pack?.tests.find((candidate) => candidate.id === testId);
  const lessonIds = new Set(test?.lessonIds ?? []);
  const lessons = pack?.lessons.filter((lesson) => lessonIds.has(lesson.id)) ?? [];
  return {
    completed: lessons.filter((lesson) => isLessonCompleted(state, lesson)).length,
    total: lessons.length,
  };
}

export function isLessonCompleted(state: LearnerState, lesson: ContentLessonSummary): boolean {
  return state.lessonCompletions.some(
    (completion) =>
      completion.lessonId === lesson.id && completion.lessonVersion === lesson.version,
  );
}

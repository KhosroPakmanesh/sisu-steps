import { StudySession } from '@/shared/domain/learner-state.models';
import { createBrowserIdentifier } from '@/shared/identity/browser-identifier';

interface StudySessionInput {
  mode: StudySession['mode'];
  topicId: string;
  title: string;
  exerciseIds: string[];
  testId?: string;
  sourceExerciseIds?: string[];
}

export function createStudySession(input: StudySessionInput): StudySession {
  const now = new Date().toISOString();
  return {
    id: createBrowserIdentifier(input.mode === 'test' ? 'session' : input.mode),
    mode: input.mode,
    topicId: input.topicId,
    testId: input.testId,
    title: input.title,
    exerciseIds: input.exerciseIds,
    sourceExerciseIds: input.sourceExerciseIds,
    currentIndex: 0,
    answers: [],
    startedAt: now,
    updatedAt: now,
  };
}

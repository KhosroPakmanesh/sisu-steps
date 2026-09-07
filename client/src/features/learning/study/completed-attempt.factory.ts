import { createBrowserIdentifier } from '@/shared/browser/browser-identifier';
import { CompletedAttempt, StudySession } from '../shared/state/learner-state.models';
import { rounded } from '../shared/progress/progress.queries';

export function createCompletedAttempt(session: StudySession): CompletedAttempt {
  const correctCount = session.answers.filter((answer) => answer.correct).length;
  const skippedCount = session.answers.filter((answer) => answer.skipped === true).length;
  const incorrectCount = session.answers.filter(
    (answer) => !answer.correct && answer.skipped !== true,
  ).length;
  return {
    id: createBrowserIdentifier('attempt'),
    mode: session.mode,
    topicId: session.topicId,
    testId: session.testId,
    title: session.title,
    startedAt: session.startedAt,
    completedAt: new Date().toISOString(),
    answers: session.answers,
    sourceExerciseIds: session.sourceExerciseIds,
    correctCount,
    incorrectCount,
    skippedCount,
    total: session.exerciseIds.length,
    percentage: rounded((correctCount / session.exerciseIds.length) * 100),
  };
}

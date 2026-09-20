import { LearnerState, StudySession } from '../state/learner-state.models';

export function findSession(state: LearnerState, sessionId: string): StudySession | undefined {
  return state.sessions.find((session) => session.id === sessionId);
}

export function findTestSession(
  state: LearnerState,
  topicId: string,
  testId: string,
): StudySession | undefined {
  return state.sessions.find(
    (session) =>
      session.mode === 'test' && session.topicId === topicId && session.testId === testId,
  );
}

export function findModeSession(
  state: LearnerState,
  topicId: string,
  mode: 'review' | 'mistakes',
): StudySession | undefined {
  return state.sessions.find((session) => session.mode === mode && session.topicId === topicId);
}

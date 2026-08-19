import { inject, Injectable } from '@angular/core';
import {
  CompletedAttempt,
  StudySession,
  SubmittedAnswer,
} from '@/shared/domain/learner-state.models';
import { findExercise } from '../shared/content/content.queries';
import { gradeAnswer } from '../shared/progress/grading.policy';
import { findSession } from '../shared/progress/progress.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';
import { recordSubmittedAnswer } from './answer-progress.policy';
import { createCompletedAttempt } from './completed-attempt.factory';

@Injectable({ providedIn: 'root' })
export class SessionAnswerService {
  private readonly store = inject(LearningStateStore);

  async submitAnswer(sessionId: string, submittedAnswer: string): Promise<SubmittedAnswer> {
    const session = this.requireSession(sessionId);
    const exercise = this.requireCurrentExercise(session);
    const existing = session.answers.find((answer) => answer.exerciseId === exercise.id);
    if (existing) return existing;
    const result = gradeAnswer(exercise, submittedAnswer);
    const answer: SubmittedAnswer = {
      exerciseId: exercise.id,
      submittedAnswer,
      correct: result.correct,
      skipped: false,
      misconceptionCategory: result.misconceptionCategory,
      diagnosticExplanation: result.diagnosticExplanation,
      answeredAt: new Date().toISOString(),
    };
    await this.store.commit((state) => recordSubmittedAnswer(state, session, exercise, answer));
    return answer;
  }

  async revealAnswer(sessionId: string): Promise<SubmittedAnswer> {
    const session = this.requireSession(sessionId);
    const exercise = this.requireCurrentExercise(session);
    const existing = session.answers.find((answer) => answer.exerciseId === exercise.id);
    if (existing) return existing;
    const answer: SubmittedAnswer = {
      exerciseId: exercise.id,
      submittedAnswer: '',
      correct: false,
      skipped: true,
      answeredAt: new Date().toISOString(),
    };
    await this.store.commit((state) => ({
      ...state,
      sessions: state.sessions.map((item) =>
        item.id === session.id
          ? { ...item, answers: [...item.answers, answer], updatedAt: answer.answeredAt }
          : item,
      ),
    }));
    return answer;
  }

  async advanceSession(sessionId: string): Promise<CompletedAttempt | null> {
    const session = this.requireSession(sessionId);
    const exercise = this.requireCurrentExercise(session);
    if (!session.answers.some((answer) => answer.exerciseId === exercise.id)) {
      throw new Error('Answer the current exercise before continuing.');
    }
    if (session.currentIndex < session.exerciseIds.length - 1) {
      const next = {
        ...session,
        currentIndex: session.currentIndex + 1,
        updatedAt: new Date().toISOString(),
      };
      await this.store.commit((state) => ({
        ...state,
        sessions: state.sessions.map((item) => (item.id === next.id ? next : item)),
      }));
      return null;
    }
    const attempt = createCompletedAttempt(session);
    await this.store.commit((state) => ({
      ...state,
      attempts: [...state.attempts, attempt],
      sessions: state.sessions.filter((item) => item.id !== session.id),
    }));
    return attempt;
  }

  private requireSession(sessionId: string): StudySession {
    const session = findSession(this.store.learnerState(), sessionId);
    if (!session) throw new Error('The study session could not be found.');
    return session;
  }

  private requireCurrentExercise(session: StudySession) {
    const exercise = findExercise(this.store.packs(), session.exerciseIds[session.currentIndex]);
    if (!exercise) throw new Error('The current exercise could not be found.');
    return exercise;
  }
}

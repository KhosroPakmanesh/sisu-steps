export interface LessonCompletion {
  lessonId: string;
  lessonVersion: string;
  completedAt: string;
}

export interface LearnerNote {
  topicId: string;
  lessonId?: string;
  text: string;
  updatedAt: string;
}

export interface SubmittedAnswer {
  exerciseId: string;
  submittedAnswer: string;
  correct: boolean;
  skipped?: boolean;
  misconceptionCategory?: string;
  diagnosticExplanation?: string;
  answeredAt: string;
}

export type SessionMode = 'test' | 'mistakes' | 'review';

export interface StudySession {
  id: string;
  mode: SessionMode;
  topicId: string;
  testId?: string;
  title: string;
  exerciseIds: string[];
  sourceExerciseIds?: string[];
  currentIndex: number;
  answers: SubmittedAnswer[];
  startedAt: string;
  updatedAt: string;
}

export interface CorrectionRecord {
  exerciseId: string;
  parallelExerciseId: string;
  targetSkill: string;
  correctedAt: string;
  nextReviewAt: string;
  reviewStage: 0 | 1 | 2;
  reviewAttempts: number;
  masteredAt?: string;
}

export interface CompletedAttempt {
  id: string;
  mode: SessionMode;
  topicId: string;
  testId?: string;
  title: string;
  startedAt: string;
  completedAt: string;
  answers: SubmittedAnswer[];
  sourceExerciseIds?: string[];
  correctCount: number;
  incorrectCount?: number;
  skippedCount?: number;
  total: number;
  percentage: number;
}

export interface LearnerState {
  schemaVersion: 1;
  contentPackVersions?: Record<string, string>;
  /** Legacy single-pack field accepted for migration and old backups. */
  contentPackVersion?: string;
  attempts: CompletedAttempt[];
  sessions: StudySession[];
  unresolvedMistakeIds: string[];
  lessonCompletions?: LessonCompletion[];
  correctionRecords?: CorrectionRecord[];
  learnerNotes?: LearnerNote[];
}

export interface LearnerBackup {
  backupType: 'finnish-exercise-book';
  backupVersion: 1;
  exportedAt: string;
  state: LearnerState;
}

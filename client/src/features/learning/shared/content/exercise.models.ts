export type ExerciseType =
  'multiple-choice' | 'fill-blank' | 'translation-fi' | 'translation-en' | 'word-order';

export interface SentencePartExplanation {
  finnish: string;
  meaning: string;
  role: string;
  baseForm: string;
  formation: string;
}

export interface SentenceExplanation {
  translation: string;
  pattern: string;
  parts: SentencePartExplanation[];
}

export interface AnswerDiagnostic {
  answers: string[];
  category: string;
  explanation: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  instruction: string;
  prompt: string;
  acceptedAnswers: string[];
  explanation: string;
  tags: string[];
  requiredSkills: string[];
  vocabulary: string[];
  targetSkill?: string;
  misconceptionCategory?: string;
  parallelExerciseId?: string;
  optionFeedback?: Record<string, string>;
  answerDiagnostics?: AnswerDiagnostic[];
  options?: string[];
  tokens?: string[];
  sentenceExplanation?: SentenceExplanation;
}

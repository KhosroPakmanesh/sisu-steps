export type ExerciseType =
  'multiple-choice' | 'fill-blank' | 'translation-fi' | 'translation-en' | 'word-order';

export type LearningStage = 'focused' | 'review';

export interface VocabularyItem {
  finnish: string;
  english: string;
}

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

export interface ExerciseTest {
  id: string;
  title: string;
  focus: string;
  stage: LearningStage;
  targetSkills: string[];
  prerequisiteSkills: string[];
  lessonIds: string[];
  exercises: Exercise[];
}

export interface LessonSection {
  title: string;
  paragraphs: string[];
  keyPoints: string[];
}

export interface LessonExample {
  finnish: string;
  english: string;
  steps: string[];
}

export interface Lesson {
  id: string;
  version: string;
  title: string;
  summary: string;
  stage: LearningStage;
  targetSkills: string[];
  prerequisiteSkills: string[];
  introducedVocabulary: VocabularyItem[];
  objectives: string[];
  sections: LessonSection[];
  examples: LessonExample[];
  commonMistakes: string[];
  practiceExercises: Exercise[];
}

export interface ContentSource {
  title: string;
  url: string;
}

export interface ContentCatalogEntry {
  id: string;
  file: string;
}

export interface ContentCatalog {
  schemaVersion: 1;
  packs: ContentCatalogEntry[];
}

export interface TopicPack {
  schemaVersion: 1;
  id: string;
  version: string;
  title: string;
  level: string;
  summary: string;
  objectives: string[];
  importantSkills: string[];
  sources: ContentSource[];
  lessons: Lesson[];
  tests: ExerciseTest[];
}

export interface GradingResult {
  correct: boolean;
  normalizedAnswer: string;
  expectedAnswer: string;
  misconceptionCategory?: string;
  diagnosticExplanation?: string;
}

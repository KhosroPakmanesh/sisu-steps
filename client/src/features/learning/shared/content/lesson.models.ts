import { Exercise } from './exercise.models';
import { LearningStage } from './learning-stage.models';

export type VocabularyItemType = 'word' | 'fixed-expression';

export interface VocabularyItem {
  finnish: string;
  english: string;
  type: VocabularyItemType;
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
  reusedVocabulary: VocabularyItem[];
  suppliedVocabulary: VocabularyItem[];
  objectives: string[];
  sections: LessonSection[];
  examples: LessonExample[];
  commonMistakes: string[];
  practiceExercises: Exercise[];
}

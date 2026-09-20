import { Exercise } from './exercise.models';
import { LearningStage } from './learning-stage.models';

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

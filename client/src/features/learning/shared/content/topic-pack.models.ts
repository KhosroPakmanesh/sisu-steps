import { TopicPackSummary } from './catalog.models';
import { Exercise } from './exercise.models';
import { Lesson } from './lesson.models';
import { ExerciseTest } from './test.models';

export interface TopicPack extends Omit<TopicPackSummary, 'lessons' | 'tests'> {
  lessons: Lesson[];
  tests: ExerciseTest[];
}

export interface LoadedTopicPack {
  pack: TopicPack;
  lessonById: ReadonlyMap<string, Lesson>;
  testById: ReadonlyMap<string, ExerciseTest>;
  exerciseById: ReadonlyMap<string, Exercise>;
}

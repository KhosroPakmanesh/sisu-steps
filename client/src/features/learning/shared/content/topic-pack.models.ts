import { ContentPackManifest } from './catalog.models';
import { Exercise } from './exercise.models';
import { Lesson } from './lesson.models';
import { ExerciseTest } from './test.models';

export interface TopicPack extends Omit<
  ContentPackManifest,
  'lessonIds' | 'testIds' | 'lessonSummaries' | 'testSummaries'
> {
  lessons: Lesson[];
  tests: ExerciseTest[];
}

export interface LoadedTopicPack {
  pack: TopicPack;
  lessonById: ReadonlyMap<string, Lesson>;
  testById: ReadonlyMap<string, ExerciseTest>;
  exerciseById: ReadonlyMap<string, Exercise>;
}

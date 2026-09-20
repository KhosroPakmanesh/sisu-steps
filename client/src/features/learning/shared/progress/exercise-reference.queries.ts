import { ContentTestSummary, TopicPackSummary } from '../content/catalog.models';
import { ExerciseTest } from '../content/test.models';
import { TopicPack } from '../content/topic-pack.models';

export function testExerciseIds(test?: ExerciseTest | ContentTestSummary): Set<string> {
  if (!test) return new Set();
  return new Set(
    'exerciseIds' in test ? test.exerciseIds : test.exercises.map((exercise) => exercise.id),
  );
}

export function packExerciseIds(pack?: TopicPackSummary | TopicPack): Set<string> {
  if (!pack) return new Set();
  return new Set(
    pack.tests.flatMap((test) =>
      'exerciseIds' in test ? test.exerciseIds : test.exercises.map((exercise) => exercise.id),
    ),
  );
}

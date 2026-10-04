import { Exercise } from '../exercise.models';

const POSSESSOR =
  /(?<![\p{L}\p{N}])(?:minulla|sinulla|hänellä|meillä|teillä|heillä)(?![\p{L}\p{N}])/iu;
const HAVE_GOT =
  /\b(?:have|has|haven['’]t|hasn['’]t)\s+(?:(?:not|i|you|he(?:\s+or\s+she)?|she|we|they)\s+)?got\b/iu;

export function validateEnglishPossessionAnswers(exercise: Exercise): void {
  if (exercise.type !== 'translation-en' || !POSSESSOR.test(exercise.prompt)) return;
  if (exercise.acceptedAnswers.some((answer) => HAVE_GOT.test(answer))) {
    throw new Error(
      `Exercise ${exercise.id} must use simple English possession without have/has got.`,
    );
  }
}

import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/content.models';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validatePack as validateAffirmative } from '../../../../tools/content-validation/personal-pronouns-affirmative-olla.mjs';
import { validatePack as validateNegative } from '../../../../tools/content-validation/negative-olla-statements.mjs';
import { validatePack as validateQuestions } from '../../../../tools/content-validation/olla-questions-short-answers.mjs';

describe('split personal-pronoun and olla content validation', () => {
  let affirmative: TopicPack;
  let negative: TopicPack;
  let questions: TopicPack;

  beforeAll(async () => {
    const source = await loadContentSource('content');
    const find = (id: string) => {
      const pack = source.packs.find((candidate) => candidate['id'] === id);
      if (!pack) throw new Error(`The installed source is missing ${id}.`);
      return pack as unknown as TopicPack;
    };
    affirmative = find('personal-pronouns-affirmative-olla');
    negative = find('negative-olla-statements');
    questions = find('olla-questions-short-answers');
  });

  it('accepts all three focused pack boundaries and preserves the complete exercise inventory', () => {
    expect(validateAffirmative(affirmative)).toEqual([]);
    expect(validateNegative(negative)).toEqual([]);
    expect(validateQuestions(questions)).toEqual([]);
    const scoredCount = [affirmative, negative, questions]
      .flatMap((pack) => pack.tests)
      .flatMap((test) => test.exercises).length;
    const practiceCount = [affirmative, negative, questions]
      .flatMap((pack) => pack.lessons)
      .flatMap((lesson) => lesson.practiceExercises).length;
    expect(scoredCount).toBe(520);
    expect(practiceCount).toBe(60);
  });

  it('rejects changed counts and Focused/Review order', () => {
    const pack = structuredClone(affirmative);
    pack.tests[0].exercises.pop();
    pack.tests[6].stage = 'review';

    expect(validateAffirmative(pack)).toEqual(
      expect.arrayContaining([
        'personal-pronouns-affirmative-olla: all declared Focused tests must precede Reviews',
        'personal-pronouns-affirmative-olla: authored test counts must remain 24, 24, 24, 24, 24, 24, 24, 40, 34',
        'personal-pronouns-affirmative-olla: pack needs exactly 242 scored exercises',
      ]),
    );
  });

  it('rejects a duplicate task hidden behind a different stable ID', () => {
    const pack = structuredClone(affirmative);
    const first = pack.tests[3].exercises[0];
    const second = pack.tests[3].exercises[1];
    second.type = first.type;
    second.prompt = first.prompt;
    second.acceptedAnswers = [...first.acceptedAnswers];
    second.sentenceExplanation = structuredClone(first.sentenceExplanation);

    expect(validateAffirmative(pack)).toContain(
      `${second.id}: duplicates the scored task ${first.id}`,
    );
  });

  it('rejects spoken Finnish in learner-facing content or accepted answers', () => {
    const pack = structuredClone(negative);
    pack.tests[0].exercises[0].acceptedAnswers = ['mä'];

    expect(validateNegative(pack)).toContainEqual(
      expect.stringContaining(
        'negative-olla-statements: learner-facing content contains a spoken or excluded form',
      ),
    );
  });

  it('rejects repeated register wording below the pack summary', () => {
    const pack = structuredClone(questions);
    pack.lessons[0].summary = 'Practise written questions.';

    expect(validateQuestions(pack)).toContainEqual(
      expect.stringContaining(
        'olla-questions-short-answers: learner-facing content repeats the pack-level register label',
      ),
    );
  });

  it('rejects a construction moved outside its coherent pack boundary', () => {
    const pack = structuredClone(affirmative);
    pack.tests[0].exercises[0].tags.push('negative');

    expect(validateAffirmative(pack)).toContain(
      `${pack.tests[0].exercises[0].id}: construction falls outside the pack boundary`,
    );
  });

  it('rejects a mastery pair with a different response type or the same answer', () => {
    const pack = structuredClone(questions);
    const first = pack.tests[0].exercises[0];
    const partner = pack.tests[0].exercises.find(
      (exercise) => exercise.id === first.parallelExerciseId,
    );
    if (!partner) throw new Error('The installed source has no mastery partner.');
    partner.type = 'word-order';
    partner.acceptedAnswers = [...first.acceptedAnswers];

    expect(validateQuestions(pack)).toEqual(
      expect.arrayContaining([
        `${first.id}: mastery partner ${partner.id} must use the same response type`,
        `${first.id}: mastery partner ${partner.id} must have a different normalized answer`,
      ]),
    );
  });

  it('rejects loss of polite-singular te practice', () => {
    const pack = structuredClone(affirmative);
    for (const test of pack.tests) {
      for (const exercise of test.exercises) {
        exercise.tags = exercise.tags.filter((tag) => tag !== 'te-polite');
      }
    }
    for (const lesson of pack.lessons) {
      for (const exercise of lesson.practiceExercises) {
        exercise.tags = exercise.tags.filter((tag) => tag !== 'te-polite');
      }
    }

    expect(validateAffirmative(pack)).toContain(
      'personal-pronouns-affirmative-olla: polite singular te needs at least 12 exercises',
    );
  });
});

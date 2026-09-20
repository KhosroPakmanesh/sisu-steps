import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validateDemonstrativePack } from '../../../../tools/content-validation/demonstratives/demonstrative-pack-family.mjs';

const PACK_IDS = [
  'singular-demonstrative-pronouns',
  'plural-demonstrative-pronouns',
  'negative-demonstrative-statements',
  'demonstrative-questions',
  'inessive-demonstrative-forms',
];

describe('demonstrative-pronoun pack-family validation', () => {
  let packs: TopicPack[];

  beforeAll(async () => {
    const source = await loadContentSource('content');
    packs = PACK_IDS.map((id) => {
      const pack = source.packs.find((candidate) => candidate['id'] === id);
      if (!pack) throw new Error(`The installed source is missing ${id}.`);
      return pack as unknown as TopicPack;
    });
  });

  it('accepts the five packs and preserves the approved family inventory', () => {
    for (const pack of packs) expect(validateDemonstrativePack(pack)).toEqual([]);

    expect(packs.flatMap((pack) => pack.tests).flatMap((test) => test.exercises)).toHaveLength(632);
    expect(
      packs.flatMap((pack) => pack.lessons).flatMap((lesson) => lesson.practiceExercises),
    ).toHaveLength(96);
    expect(packs.flatMap((pack) => pack.lessons)).toHaveLength(24);
    expect(packs.filter((pack) => pack.tests.at(-1)?.stage === 'review')).toHaveLength(5);
  });

  it('rejects changed topology, counts, or a Review that claims a new skill', () => {
    const pack = structuredClone(requirePack(packs, 'singular-demonstrative-pronouns'));
    pack.tests[0].exercises.pop();
    pack.tests.at(-1)?.targetSkills.push('Untaught demonstrative skill');

    expect(validateDemonstrativePack(pack)).toEqual(
      expect.arrayContaining([
        'singular-demonstrative-pronouns: test counts must remain 20, 24, 16, 20, 16, 24',
        'singular-demonstrative-pronouns: scored exercise total does not match the approved distribution',
        'sdp-review: Review must mix only the previously taught skills',
      ]),
    );
  });

  it('rejects a Review exercise that targets a Review-only skill', () => {
    const pack = structuredClone(requirePack(packs, 'singular-demonstrative-pronouns'));
    const exercise = pack.tests.at(-1)?.exercises[0];
    if (!exercise) throw new Error('The singular pack has no Review exercise.');
    exercise.targetSkill = 'Untaught review-only target';

    expect(validateDemonstrativePack(pack)).toContain(
      `${exercise.id}: Review exercise must target and require a previously taught skill`,
    );
  });

  it('rejects an initial form task that hides the surrounding Finnish frame', () => {
    const pack = structuredClone(requirePack(packs, 'singular-demonstrative-pronouns'));
    const exercise = pack.tests[0].exercises.find(
      (candidate) => candidate.type !== 'translation-en',
    );
    if (!exercise) throw new Error('The singular pack has no Finnish form-recall task.');
    exercise.prompt = exercise.prompt.replace(/ Finnish frame: “[^”]+”/u, '');

    expect(validateDemonstrativePack(pack)).toContain(
      `${exercise.id}: initial form recall must visibly supply the Finnish sentence frame`,
    );
  });

  it('rejects affirmative agreement inside the negative Focused tests', () => {
    const pack = structuredClone(requirePack(packs, 'negative-demonstrative-statements'));
    const exercise = pack.tests[0].exercises.find(
      (candidate) => candidate.type !== 'translation-en',
    );
    if (!exercise) throw new Error('The negative pack has no Finnish-answer exercise.');
    exercise.acceptedAnswers = ['Tämä kirja on täällä.'];

    expect(validateDemonstrativePack(pack)).toContain(
      'nds-singular-negative-test: every answer must keep singular ei ole',
    );
  });

  it('rejects a question that leaves its bounded beginner frame', () => {
    const pack = structuredClone(requirePack(packs, 'demonstrative-questions'));
    const exercise = pack.tests[1].exercises.find(
      (candidate) => candidate.type !== 'translation-en',
    );
    if (!exercise) throw new Error('The question pack has no Finnish-answer exercise.');
    exercise.acceptedAnswers = ['Mitkä nämä esineet ovat?'];

    expect(validateDemonstrativePack(pack)).toEqual(
      expect.arrayContaining([
        `${exercise.id}: answer leaves the approved beginner question frame`,
        'demonstrative-questions: accepted answers must not introduce deferred mitkä',
      ]),
    );
  });

  it('checks the hidden Finnish sentence in an English-translation question', () => {
    const pack = structuredClone(requirePack(packs, 'demonstrative-questions'));
    const exercise = pack.tests[0].exercises.find(
      (candidate) => candidate.type === 'translation-en',
    );
    if (!exercise?.sentenceExplanation) {
      throw new Error('The question pack has no English-translation sentence.');
    }
    exercise.sentenceExplanation.parts[0].finnish = 'Mitä';

    expect(validateDemonstrativePack(pack)).toContain(
      `${exercise.id}: answer leaves the approved beginner question frame`,
    );
  });

  it('rejects loss of an inessive form from a Focused test', () => {
    const pack = structuredClone(requirePack(packs, 'inessive-demonstrative-forms'));
    for (const exercise of pack.tests[0].exercises) {
      exercise.acceptedAnswers = exercise.acceptedAnswers.map((answer) =>
        answer.replaceAll('tässä', 'tuossa').replaceAll('Tässä', 'Tuossa'),
      );
      for (const part of exercise.sentenceExplanation?.parts ?? []) {
        part.finnish = part.finnish.replaceAll('tässä', 'tuossa').replaceAll('Tässä', 'Tuossa');
      }
    }

    expect(validateDemonstrativePack(pack)).toContain(
      'idf-singular-inessive-test: Focused answers must cover tässä',
    );
  });

  it('rejects an independent inessive task without a matching container context', () => {
    const pack = structuredClone(requirePack(packs, 'inessive-demonstrative-forms'));
    const exercise = pack.tests[0].exercises[0];
    exercise.prompt = exercise.prompt.replace(/^Context:.*?(?=Choose|Complete|Write|Build)/u, '');

    expect(validateDemonstrativePack(pack)).toContain(
      `${exercise.id}: independent inessive task needs an explicit matching bounded-location context`,
    );
  });

  it('rejects spoken Finnish anywhere in learner-facing content', () => {
    const pack = structuredClone(requirePack(packs, 'plural-demonstrative-pronouns'));
    pack.lessons[0].summary = 'Tää points to several things.';

    expect(validateDemonstrativePack(pack)).toContainEqual(
      expect.stringContaining('learner-facing content contains excluded spoken form tää'),
    );
  });

  it('rejects malformed English demonstrative glosses', () => {
    const pack = structuredClone(requirePack(packs, 'plural-demonstrative-pronouns'));
    pack.lessons[0].summary = 'Those over there cars are new.';

    expect(validateDemonstrativePack(pack)).toContainEqual(
      expect.stringContaining('learner-facing English contains malformed gloss'),
    );
  });

  it('rejects scene-only duplicates and repeated wrong-option feedback', () => {
    const pack = structuredClone(requirePack(packs, 'singular-demonstrative-pronouns'));
    const first = pack.tests[0].exercises.find((exercise) => exercise.type === 'multiple-choice');
    const duplicate = pack.tests[0].exercises.find(
      (exercise) => exercise.type === 'multiple-choice' && exercise.id !== first?.id,
    );
    if (!first || !duplicate || !first.optionFeedback) {
      throw new Error('The singular pack lacks the required multiple-choice fixtures.');
    }
    duplicate.acceptedAnswers = [...first.acceptedAnswers];
    duplicate.prompt = 'A completely different decorative scene label.';
    const wrongOptions =
      first.options?.filter((option) => option !== first.acceptedAnswers[0]) ?? [];
    for (const option of wrongOptions) first.optionFeedback[option] = 'Use the required form.';

    expect(validateDemonstrativePack(pack)).toEqual(
      expect.arrayContaining([
        `${duplicate.id}: repeats the sentence task ${first.id}`,
        `${first.id}: each wrong option needs distinct diagnostic feedback`,
      ]),
    );
  });

  it('rejects mastery partners with a changed response type or repeated answer', () => {
    const pack = structuredClone(requirePack(packs, 'demonstrative-questions'));
    const first = pack.tests[0].exercises[0];
    const partner = pack.tests[0].exercises.find(
      (exercise) => exercise.id === first.parallelExerciseId,
    );
    if (!partner) throw new Error('The question pack has no mastery partner.');
    partner.type = 'word-order';
    partner.acceptedAnswers = [...first.acceptedAnswers];

    expect(validateDemonstrativePack(pack)).toEqual(
      expect.arrayContaining([
        `${first.id}: mastery partner must use the same response type`,
        `${first.id}: mastery partner must use a different answer`,
      ]),
    );
  });
});

function requirePack(packs: TopicPack[], id: string): TopicPack {
  const pack = packs.find((candidate) => candidate.id === id);
  if (!pack) throw new Error(`Missing installed pack ${id}.`);
  return pack;
}

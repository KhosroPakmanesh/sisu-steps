import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import {
  collectGrammarForms,
  validateGrammarBaseForms,
  validateGrammarVocabulary,
} from '@/features/learning/shared/content/validation/grammar-vocabulary.validator';
import { validateContentManifest } from '@/features/learning/shared/content/validation/content-manifest.validator';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { learningPack } from '@testing/helpers/unit/learning-content.fixture';
import { manifestFor } from '@testing/helpers/unit/pack-content.resources';
import { loadContentSource } from '../../../../../../../tools/content-source-loader.mjs';
import {
  collectGrammarForms as collectStandalone,
  validateGrammarVocabulary as validateStandalone,
} from '../../../../../../../tools/content-validation/shared/grammar-vocabulary.mjs';
import { validatePackContent } from '../../../../../../../tools/content-validation/shared/pack-content.validator.mjs';

const allExercises = (pack: TopicPack) => [
  ...pack.tests.flatMap((test) => test.exercises),
  ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
];

describe('grammar and lexical vocabulary separation', () => {
  let packs: TopicPack[];
  beforeAll(async () => {
    packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
  });

  for (const category of [
    'introducedVocabulary',
    'reusedVocabulary',
    'suppliedVocabulary',
  ] as const) {
    it(`rejects a grammar base and its inflection in ${category} at both boundaries`, () => {
      const pack = structuredClone(packs.find((pack) => pack.id === 'negative-possession')!);
      const lesson = pack.lessons[0];
      lesson[category].push(
        { finnish: 'minä', english: 'I', type: 'word' },
        { finnish: 'Minulla', english: 'I as the owner', type: 'word' },
      );
      const exercises = allExercises(pack);
      expect(() => validateGrammarVocabulary([lesson], exercises, pack.grammarBaseForms)).toThrow(
        `grammar form minä must not appear in ${category}`,
      );
      expect(validateStandalone([lesson], exercises, pack.grammarBaseForms)).toEqual([
        `${lesson.id}: grammar form minä must not appear in ${category}`,
        `${lesson.id}: grammar form Minulla must not appear in ${category}`,
      ]);
    });
  }

  it('rejects grammatical exercise vocabulary in scored and optional questions', () => {
    const pack = structuredClone(packs.find((pack) => pack.id === 'negative-possession')!);
    for (const exercise of [pack.tests[0].exercises[0], pack.lessons[0].practiceExercises[0]]) {
      exercise.vocabulary.push('minulla');
      expect(() =>
        validateGrammarVocabulary(pack.lessons, allExercises(pack), pack.grammarBaseForms),
      ).toThrow('grammar form minulla must not appear in vocabulary');
      expect(
        validateStandalone(pack.lessons, allExercises(pack), pack.grammarBaseForms).join('\n'),
      ).toContain(`${exercise.id}: grammar form minulla must not appear in vocabulary`);
    }
  });

  it('wires the reported supplied-possessor regression into full pack validation', async () => {
    const pack = structuredClone(packs.find((pack) => pack.id === 'negative-possession')!);
    for (const lesson of pack.lessons.filter((item) => item.numberScope?.number === 'singular')) {
      lesson.suppliedVocabulary.push({
        finnish: 'minulla',
        english: 'I as the owner',
        type: 'word',
      });
    }
    expect(() => validateTopicPack(pack)).toThrow(
      'grammar form minulla must not appear in suppliedVocabulary',
    );
    const result = await validatePackContent(pack);
    expect(result.errors.join('\n')).toContain(
      'grammar form minulla must not appear in suppliedVocabulary',
    );
  });

  it('keeps supporting verbs, nouns, and contextual pronouns when not declared grammar', () => {
    const pack = structuredClone(learningPack);
    pack.lessons[0].introducedVocabulary.push(
      { finnish: 'olla', english: 'to be', type: 'word' },
      { finnish: 'on', english: 'is', type: 'word' },
      { finnish: 'tämä', english: 'this', type: 'word' },
    );
    expect(() => validateGrammarVocabulary(pack.lessons, allExercises(pack), [])).not.toThrow();
    expect(validateStandalone(pack.lessons, allExercises(pack), [])).toEqual([]);
  });

  it('aligns combined sentence parts without treating supporting words as grammar', () => {
    const exercise = {
      ...learningPack.tests[0].exercises[0],
      sentenceExplanation: {
        translation: 'You are here.',
        pattern: 'subject + verb + place',
        parts: [
          {
            finnish: 'olet täällä.',
            meaning: 'are here',
            role: 'verb and place',
            baseForm: 'olla; täällä',
            formation: 'Use olet; täällä stays unchanged.',
          },
        ],
      },
    };
    expect(collectGrammarForms([exercise], ['olla'])).toEqual(new Set(['olla', 'olet']));
    expect(collectStandalone([exercise], ['olla'])).toEqual(new Set(['olla', 'olet']));
  });

  it('requires explicit valid grammar metadata through manifest and pack loading', () => {
    for (const grammar of [undefined, ['olla', 'OLLA'], ['olla ei'], [' olla'], [12]]) {
      expect(() => validateGrammarBaseForms(grammar)).toThrow('unique one-word grammar');
      expect(() =>
        validateContentManifest(
          { ...manifestFor(learningPack), grammarBaseForms: grammar },
          'topic',
        ),
      ).toThrow('unique one-word grammar');
      expect(() => validateTopicPack({ ...learningPack, grammarBaseForms: grammar })).toThrow(
        'unique one-word grammar',
      );
      expect(validateStandalone([], [], grammar)).toEqual([
        'pack must declare unique one-word grammar base forms',
      ]);
    }
  });

  it('validates every installed pack with equivalent grammar surfaces and preserved context', () => {
    for (const pack of packs) {
      const exercises = allExercises(pack);
      expect(collectGrammarForms(exercises, pack.grammarBaseForms)).toEqual(
        collectStandalone(exercises, pack.grammarBaseForms),
      );
      expect(() => validateTopicPack(pack)).not.toThrow();
      expect(validateStandalone(pack.lessons, exercises, pack.grammarBaseForms)).toEqual([]);
    }
    const reported = packs.find((pack) => pack.id === 'negative-possession')!.lessons[0];
    expect(reported.suppliedVocabulary.map((word) => word.finnish)).toContain('palloa');
    expect(reported.suppliedVocabulary.map((word) => word.finnish)).not.toContain('minulla');
    expect(reported.examples[0].steps).toContain('minulla means “I as the owner”.');
    const plural = packs.find((pack) => pack.id === 't-plural-agreement')!;
    expect(plural.grammarBaseForms).toContain('olla');
    expect(
      plural.lessons.find((lesson) => lesson.id === 'plural-sentences')!.introducedVocabulary,
    ).not.toEqual(expect.arrayContaining([expect.objectContaining({ finnish: 'on' })]));
  });
});

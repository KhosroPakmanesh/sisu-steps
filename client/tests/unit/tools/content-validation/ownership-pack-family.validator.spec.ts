import { beforeAll, describe, expect, it } from 'vitest';
import { Exercise } from '@/features/learning/shared/content/exercise.models';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validatePackContent } from '../../../../tools/content-validation/shared/pack-content.validator.mjs';
import { validateOwnershipPack } from '../../../../tools/content-validation/ownership/ownership-pack-family.mjs';

describe('beginner ownership and possession content', () => {
  let packs: TopicPack[];

  beforeAll(async () => {
    const source = await loadContentSource('content');
    const ids = source.catalog.groups.find(
      (group) => group.id === 'ownership-and-possession',
    )!.packs;
    packs = ids.map((id) => source.packs.find((pack) => pack['id'] === id) as unknown as TopicPack);
  });

  it('loads all five packs through runtime and direct-source boundaries', async () => {
    expect(packs).toHaveLength(5);
    for (const pack of packs) {
      expect(validateTopicPack(pack).id).toBe(pack.id);
      expect((await validatePackContent(pack)).errors).toEqual([]);
    }
    expect(packs.flatMap((pack) => pack.tests.flatMap((test) => test.exercises))).toHaveLength(768);
  });

  it('rejects conjugating the possession verb to agree with plural owners', () => {
    const pack = structuredClone(packs[0]);
    const row = exercise(pack, 'aps-fixed-on-test-e004');
    row.acceptedAnswers = ['Meillä olemme kynä.'];
    expect(validateOwnershipPack(pack).join('\n')).toContain('fixed affirmative verb pattern');
  });

  it('rejects cosmetic wording used to conceal a repeated semantic task', () => {
    const pack = structuredClone(packs[0]);
    const original = exercise(pack, 'aps-fixed-on-test-e013');
    replaceExercise(pack, 'aps-fixed-on-test-e014', {
      ...structuredClone(original),
      id: exercise(pack, 'aps-fixed-on-test-e014').id,
      prompt: `At home today. ${original.prompt}`,
    });
    expect(validateOwnershipPack(pack).join('\n')).toContain('repeated semantic task');
  });

  it('rejects a contracted expansion inventory or an obsolete pack version', () => {
    const pack = structuredClone(packs[4]);
    pack.version = '1.0.0';
    pack.tests[0].exercises.pop();
    expect(validateOwnershipPack(pack).join('\n')).toContain('expanded ownership topology');
  });

  it('rejects an isolated personal suffix belonging to another owner', () => {
    const pack = structuredClone(packs[4]);
    exercise(pack, 'ppe-personal-endings-test-e013').tags.push('possessive-ending-only');
    exercise(pack, 'ppe-personal-endings-test-e013').acceptedAnswers = ['nne'];
    expect(validateOwnershipPack(pack).join('\n')).toContain('isolated possessive ending');
  });

  it('rejects Review dialogue transfer in a Focused question test', () => {
    const pack = structuredClone(packs[2]);
    replaceExercise(pack, 'pqs-short-answers-test-e013', {
      ...structuredClone(exercise(pack, 'pqs-review-e017')),
      id: exercise(pack, 'pqs-short-answers-test-e013').id,
    });
    expect(validateOwnershipPack(pack).join('\n')).toContain(
      'belongs only in a taught question Review',
    );
  });

  it('rejects an incorrect question or person-conjugated reply in dialogue transfer', () => {
    const pack = structuredClone(packs[3]);
    exercise(pack, 'npq-review-e017').acceptedAnswers = ['Eikö minulla peliä? Kyllä, on.'];
    exercise(pack, 'npq-review-e021').acceptedAnswers = ['Eikö minulla ole peliä? Olen.'];
    const errors = validateOwnershipPack(pack).join('\n');
    expect(errors).toContain('fixed negative-question verb pattern');
    expect(errors).toContain('one possession question and a fixed verb reply');
  });

  it('accepts newly taught lexical meanings and natural complete dialogue replies', () => {
    const pack = packs[2];
    const dialogue = exercise(pack, 'pqs-review-e021');
    expect(gradeAnswer(dialogue, 'Onko minulla peli? On.').correct).toBe(true);
    const noun = exercise(packs[4], 'ppe-third-person-test-e020');
    expect(gradeAnswer(noun, 'her apple').correct).toBe(true);
    expect(noun.vocabulary).toEqual(['omena']);
  });

  it('rejects irregular noun scope and untaught harmony in the preceding third-person target', () => {
    const pack = structuredClone(packs[4]);
    const irregular = exercise(pack, 'ppe-personal-endings-test-e013');
    irregular.tags = ['owner-minun', 'possessive-noun-lumi', 'possessive-ending-only'];
    const earlyHarmony = exercise(pack, 'ppe-third-person-test-e009');
    earlyHarmony.tags = ['owner-hänen', 'possessive-noun-kynä'];
    earlyHarmony.acceptedAnswers = ['hänen kynänsä'];
    const errors = validateOwnershipPack(pack).join('\n');
    expect(errors).toContain('taught regular inventory');
    expect(errors).toContain('must precede new vowel-harmony decisions');
  });

  it('rejects a basic noun in negative possession and incorrect partitive harmony', () => {
    const pack = structuredClone(packs[1]);
    exercise(pack, 'nps-fixed-negative-test-e001').acceptedAnswers = ['Minulla ei ole pallo.'];
    exercise(pack, 'nps-partitive-test-e004').acceptedAnswers = ['kynäa'];
    const errors = validateOwnershipPack(pack).join('\n');
    expect(errors).toContain('fixed negative verb pattern');
    expect(errors).toContain('regular singular partitive');
  });

  it('rejects plural question verbs and person-conjugated possession replies', () => {
    const pack = structuredClone(packs[2]);
    exercise(pack, 'pqs-onko-test-e001').acceptedAnswers = ['Ovatko minulla pallo?'];
    exercise(pack, 'pqs-short-answers-test-e001').acceptedAnswers = ['Olen.'];
    const errors = validateOwnershipPack(pack).join('\n');
    expect(errors).toContain('fixed question verb pattern');
    expect(errors).toContain('echo fixed on or ei ole');
  });

  it('rejects missing ole or a nominative noun in negative questions', () => {
    const pack = structuredClone(packs[3]);
    exercise(pack, 'npq-eiko-test-e001').acceptedAnswers = [
      'Eikö minulla palloa?',
      'Eikö minulla ole pallo?',
    ];
    expect(validateOwnershipPack(pack).join('\n')).toContain(
      'fixed negative-question verb pattern',
    );
  });

  it('rejects incorrect owner endings, harmony, or ambiguous third-person reference', () => {
    const pack = structuredClone(packs[4]);
    exercise(pack, 'ppe-personal-endings-test-e001').acceptedAnswers = ['pallosi'];
    exercise(pack, 'ppe-harmony-test-e002').acceptedAnswers = ['kynänsa'];
    exercise(pack, 'ppe-pronoun-omission-test-e017').acceptedAnswers = ['kissansa'];
    const errors = validateOwnershipPack(pack).join('\n');
    expect(errors).toContain('owner and vowel harmony');
    expect(errors).toContain('retain the owner pronoun');
  });

  it('accepts natural verb echoes and explicit or omitted first-person owner pronouns', () => {
    const affirmative = exercise(packs[2], 'pqs-short-answers-test-e007');
    const negative = exercise(packs[3], 'npq-short-answers-test-e008');
    expect(gradeAnswer(affirmative, 'On.').correct).toBe(true);
    expect(gradeAnswer(affirmative, 'Kyllä, on.').correct).toBe(true);
    expect(gradeAnswer(negative, 'Ei ole.').correct).toBe(true);
    expect(gradeAnswer(negative, 'Ei, ei ole.').correct).toBe(true);
    const omission = exercise(packs[4], 'ppe-pronoun-omission-test-e013');
    expect(gradeAnswer(omission, 'Tämä on kissani.').correct).toBe(true);
    expect(gradeAnswer(omission, 'Tämä on minun kissani.').correct).toBe(true);
    expect(gradeAnswer(omission, 'Tämä on minun kissa.').correct).toBe(false);
  });

  it('rejects adding a personal suffix to the noun after kenen', () => {
    const pack = structuredClone(packs[4]);
    exercise(pack, 'ppe-whose-test-e001').acceptedAnswers = ['Kenen pallonsa tämä on?'];
    expect(validateOwnershipPack(pack).join('\n')).toContain('basic singular noun');
  });

  it('grades natural question and possessive translations and neutral-only noun harmony', () => {
    const positive = exercise(packs[2], 'pqs-onko-test-e007');
    const negative = exercise(packs[3], 'npq-eiko-test-e007');
    expect(gradeAnswer(positive, 'Do I have a book?').correct).toBe(true);
    expect(gradeAnswer(positive, 'Have I got a book?').correct).toBe(false);
    expect(gradeAnswer(negative, "Don't I have a book?").correct).toBe(true);
    expect(gradeAnswer(negative, 'Do I not have a book?').correct).toBe(true);
    const identity = exercise(packs[4], 'ppe-sentences-test-e019');
    expect(gradeAnswer(identity, 'This is his game.').correct).toBe(true);
    expect(gradeAnswer(identity, 'This is her game.').correct).toBe(true);
    expect(gradeAnswer(identity, 'Ther is her game.').correct).toBe(false);
    const neutral = packs[4].tests
      .find((item) => item.id === 'ppe-harmony-test')!
      .exercises.find((item) => item.acceptedAnswers.includes('pelinsä'))!;
    expect(gradeAnswer(neutral, 'pelinsä').correct).toBe(true);
    expect(gradeAnswer(neutral, 'pelinsa').correct).toBe(false);
  });

  it('keeps the restored construction steps Focused before the cumulative Review', () => {
    for (const pack of packs.slice(0, 4)) {
      expect(pack.tests.map((item) => item.stage)).toEqual([
        ...Array<string>(6).fill('focused'),
        'review',
      ]);
      expect(pack.lessons.every((lesson) => lesson.stage === 'focused')).toBe(true);
      const taught = new Set(pack.tests.slice(0, 6).flatMap((item) => item.targetSkills));
      for (const review of pack.tests.slice(6)) {
        expect(review.targetSkills.every((skill) => taught.has(skill))).toBe(true);
      }
      const changed = structuredClone(pack);
      changed.tests[2].stage = 'review';
      expect(validateOwnershipPack(changed).join('\n')).toContain('original Focused sequence');
    }
  });

  it.each([
    ['nps-partitive-test-e013', 'Minulla ei ole kissa.'],
    ['nps-partitive-test-e014', 'Sinulla ei ole koira.'],
    ['nps-partitive-test-e015', 'Hänellä ei ole tyyny.'],
    ['nps-partitive-test-e016', 'Meillä ei ole peli.'],
    ['nps-partitive-test-e017', 'Teillä ei ole kissa.'],
    ['nps-partitive-test-e018', 'Heillä ei ole koira.'],
  ])('diagnoses the missing partitive in %s', (id, answer) => {
    const exercise = packs[1].tests
      .flatMap((item) => item.exercises)
      .find((item) => item.id === id)!;
    const result = gradeAnswer(exercise, answer);
    expect(result.correct).toBe(false);
    expect(result.misconceptionCategory).toContain('basic noun after negation');
    expect(result.diagnosticExplanation).toContain('add -a or -ä');
    expect(gradeAnswer(exercise, exercise.acceptedAnswers[0]).correct).toBe(true);
  });
});

function exercise(pack: TopicPack, id: string): Exercise {
  return pack.tests.flatMap((test) => test.exercises).find((item) => item.id === id)!;
}

function replaceExercise(pack: TopicPack, id: string, replacement: Exercise): void {
  const test = pack.tests.find((item) => item.exercises.some((candidate) => candidate.id === id))!;
  test.exercises[test.exercises.findIndex((candidate) => candidate.id === id)] = replacement;
}

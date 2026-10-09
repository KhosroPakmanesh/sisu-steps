import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { validateFocusedNumberScopes as validateRuntime } from '@/features/learning/shared/content/validation/focused-number-scopes.validator';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validateFocusedNumberScopes as validateSource } from '../../../../tools/content-validation/shared/focused-number-scopes.mjs';
import { validatePackContent } from '../../../../tools/content-validation/shared/pack-content.validator.mjs';

describe('Focused tests separated by grammatical number', () => {
  let packs: TopicPack[];
  beforeAll(async () => {
    packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
  });

  it('keeps the full inventory and 44 groups with 44 independently owned preparation lessons', async () => {
    expect(packs).toHaveLength(14);
    expect(packs.flatMap((pack) => pack.lessons)).toHaveLength(103);
    expect(packs.flatMap((pack) => pack.tests)).toHaveLength(125);
    expect(packs.flatMap((pack) => pack.tests.flatMap((test) => test.exercises))).toHaveLength(
      2758,
    );
    expect(
      packs.flatMap((pack) => pack.lessons.flatMap((lesson) => lesson.practiceExercises)),
    ).toHaveLength(313);
    const groups = packs.flatMap((pack) => pack.tests.filter((test) => test.numberScope));
    expect(groups).toHaveLength(44);
    expect(new Set(groups.flatMap((test) => test.lessonIds)).size).toBe(44);
    expect(new Set(groups.flatMap((test) => test.exercises.map((item) => item.id))).size).toBe(880);
    for (const pack of packs) {
      expect(validateSource(pack)).toEqual([]);
      expect(() => validateRuntime(pack)).not.toThrow();
      expect(validateTopicPack(pack).id).toBe(pack.id);
      expect((await validatePackContent(pack)).errors).toEqual([]);
      for (const test of pack.tests.filter((item) => item.numberScope?.number === 'singular')) {
        const plural = pack.tests.find(
          (item) => item.id === test.id.replace('-singular-test', '-plural-test'),
        )!;
        expect(plural.lessonIds).not.toEqual(test.lessonIds);
        expect(plural.targetSkills).toEqual(test.targetSkills);
        expect(plural.numberScope?.axis).toBe(test.numberScope?.axis);
        const lesson = pack.lessons.find((item) => item.id === test.lessonIds[0])!;
        expect(lesson.targetSkills).toEqual(test.targetSkills);
        expect(lesson.numberScope).toEqual(test.numberScope);
        expect(test.focus).toBe(lesson.summary);
        expect(lesson.practiceExercises.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it.each(['person', 'owner', 'object'] as const)(
    'rejects leaked %s examples, practice and prevention notes in both directions',
    (axis) => {
      const original = packs.find((pack) =>
        pack.tests.some((test) => test.numberScope?.axis === axis),
      )!;
      for (const number of ['singular', 'plural'] as const) {
        for (const kind of ['example', 'practice'] as const) {
          const pack = structuredClone(original);
          const test = pack.tests.find(
            (item) => item.numberScope?.axis === axis && item.numberScope.number === number,
          )!;
          const lesson = pack.lessons.find((item) => item.id === test.lessonIds[0])!;
          const peer = pack.lessons.find(
            (item) =>
              item.id ===
              lesson.id.replace(
                '-' + number,
                '-' + (number === 'singular' ? 'plural' : 'singular'),
              ),
          )!;
          if (kind === 'example') lesson.examples[0] = peer.examples[0];
          else if (kind === 'practice') lesson.practiceExercises[0] = peer.practiceExercises[0];
          else lesson.commonMistakes.push(peer.examples[0].finnish);
          expect(validateSource(pack).join(' ')).toContain(
            kind === 'example' ? 'worked examples must match' : 'practice must stay',
          );
          expect(() => validateRuntime(pack)).toThrow();
        }
      }
    },
  );

  it.each([
    'shared lesson',
    'wrong lesson scope',
    'mixed summary',
    'mixed section',
    'mixed prevention note',
    'plural-owner prevention rule',
    'plural-owner verb rule',
    'stale header',
  ])('rejects %s', (mutation) => {
    const pack = structuredClone(packs.find((item) => item.id === 'possession-questions')!);
    const test = pack.tests[0];
    const lesson = pack.lessons.find((item) => item.id === test.lessonIds[0])!;
    if (mutation === 'shared lesson') pack.tests[1].lessonIds = [...test.lessonIds];
    if (mutation === 'wrong lesson scope') lesson.numberScope!.number = 'plural';
    if (mutation === 'mixed summary')
      lesson.summary += ' Use onko with meillä, teillä, and heillä.';
    if (mutation === 'mixed section') lesson.sections[0].paragraphs.push('Onko meillä pallo?');
    if (mutation === 'mixed prevention note') lesson.commonMistakes.push('Put meillä after onko.');
    if (mutation === 'plural-owner prevention rule')
      lesson.commonMistakes.push('Several owners can have one thing.');
    if (mutation === 'plural-owner verb rule') lesson.commonMistakes.push('Do not use olemmeko.');
    if (mutation === 'stale header') test.focus += ' Use it with meillä.';
    expect(validateSource(pack).length).toBeGreaterThan(0);
    expect(() => validateRuntime(pack)).toThrow();
  });

  it.each(['scored explanation', 'scored formation', 'optional explanation', 'optional formation'])(
    'rejects plural-owner teaching in singular %s',
    (kind) => {
      const pack = structuredClone(packs.find((item) => item.id === 'affirmative-possession')!);
      const exercise = kind.startsWith('scored')
        ? pack.tests.find((item) => item.id === 'aps-possessors-singular-test')!.exercises[0]
        : pack.lessons.find((item) => item.id === 'aps-possessors-singular')!.practiceExercises[0];
      if (kind.endsWith('explanation')) exercise.explanation += ' Plural owners use on.';
      else
        exercise.sentenceExplanation!.parts[1].formation +=
          ' Use it with every owner, including we and they.';
      expect(validateSource(pack).join(' ')).toContain('feedback must stay');
      expect(() => validateRuntime(pack)).toThrow('feedback must stay');
    },
  );

  it.each(['scored diagnostic', 'scored option', 'optional diagnostic', 'optional option'])(
    'rejects positive opposite-scope teaching in %s while allowing diagnostic contrasts',
    (kind) => {
      const pack = structuredClone(packs.find((item) => item.id === 'affirmative-possession')!);
      const exercise = kind.startsWith('scored')
        ? pack.tests.find((item) => item.id === 'aps-fixed-on-singular-test')!.exercises[0]
        : pack.lessons.find((item) => item.id === 'aps-fixed-on-singular')!.practiceExercises[0];
      const contrast =
        'Ovat is incorrect here. Possession uses fixed on with minulla, sinulla and hänellä.';
      if (kind.endsWith('diagnostic'))
        exercise.answerDiagnostics = [
          { answers: ['ovat'], category: 'wrong verb', explanation: contrast },
        ];
      else exercise.optionFeedback = { ovat: contrast };
      expect(validateSource(pack)).toEqual([]);
      expect(() => validateRuntime(pack)).not.toThrow();
      const leak = 'Meillä on pallo. Plural owners still take on.';
      if (kind.endsWith('diagnostic')) exercise.answerDiagnostics![0].explanation += ' ' + leak;
      else exercise.optionFeedback!['ovat'] += ' ' + leak;
      expect(validateSource(pack).join(' ')).toContain('feedback must stay');
      expect(() => validateRuntime(pack)).toThrow('feedback must stay');
    },
  );

  it('rejects positive opposite-owner teaching in correct-option feedback', () => {
    const original = packs.find((item) => item.id === 'affirmative-possession')!;
    for (const text of ['Meillä on pallo.', 'Plural owners still take on.']) {
      const pack = structuredClone(original);
      const exercise = pack.lessons.find((item) => item.id === 'aps-fixed-on-singular')!
        .practiceExercises[0];
      exercise.optionFeedback![exercise.acceptedAnswers[0]] = text;
      expect(validateSource(pack).join(' ')).toContain('feedback must stay');
      expect(() => validateRuntime(pack)).toThrow('feedback must stay');
    }
  });

  it('grades all 95 optional questions in independently scoped lessons', () => {
    const lessons = packs.flatMap((pack) => pack.lessons.filter((lesson) => lesson.numberScope));
    const practice = lessons.flatMap((lesson) => lesson.practiceExercises);
    expect(practice).toHaveLength(95);
    expect(new Set(practice.map((exercise) => exercise.id)).size).toBe(95);
    for (const lesson of lessons) {
      expect(lesson.practiceExercises.length).toBeGreaterThanOrEqual(2);
      expect(lesson.practiceExercises.length).toBeLessThanOrEqual(5);
      expect(lesson.introducedVocabulary.length).toBeLessThanOrEqual(10);
      for (const exercise of lesson.practiceExercises)
        for (const answer of exercise.acceptedAnswers)
          expect(gradeAnswer(exercise, answer).correct, exercise.id).toBe(true);
    }
  });

  it('distinguishes explicitly English completion answers from Finnish person forms', () => {
    const pack = structuredClone(packs.find((p) => p.id === 'personal-pronouns-affirmative-olla')!);
    expect(validateSource(pack)).toEqual([]);
    expect(() => validateRuntime(pack)).not.toThrow();
    const exercise = pack.tests.flatMap((t) => t.exercises).find((e) => e.id === 'ppo-t03-e20')!;
    expect(exercise.instruction).toBe('Complete in English.');
    exercise.instruction = 'Complete in Finnish.';
    expect(validateSource(pack).join(' ')).toContain('declared person singular group');
    expect(() => validateRuntime(pack)).toThrow('declared person singular group');
  });

  it('grades all 880 repartitioned questions, alternatives, and authored diagnostics', () => {
    const items = packs.flatMap((pack) =>
      pack.tests.filter((test) => test.numberScope).flatMap((test) => test.exercises),
    );
    expect(items).toHaveLength(880);
    for (const item of items) {
      for (const answer of item.acceptedAnswers)
        expect(gradeAnswer(item, answer).correct, item.id).toBe(true);
      for (const diagnostic of item.answerDiagnostics ?? [])
        for (const answer of diagnostic.answers) {
          const result = gradeAnswer(item, answer);
          expect(result.correct, item.id).toBe(false);
          expect(result.diagnosticExplanation, item.id).toBe(diagnostic.explanation);
        }
      const partner = packs
        .flatMap((pack) => pack.tests.flatMap((test) => test.exercises))
        .find((candidate) => candidate.id === item.parallelExerciseId)!;
      expect(partner.parallelExerciseId).toBe(item.id);
      expect(partner.type).toBe(item.type);
      expect(partner.targetSkill).toBe(item.targetSkill);
    }
  });

  it.each(['person', 'owner', 'object'] as const)(
    'rejects opposite-number questions for the %s axis at both complete boundaries',
    async (axis) => {
      const original = packs.find((pack) =>
        pack.tests.some((test) => test.numberScope?.axis === axis),
      )!;
      for (const number of ['singular', 'plural'] as const) {
        const pack = structuredClone(original);
        const target = pack.tests.find(
          (test) => test.numberScope?.axis === axis && test.numberScope.number === number,
        )!;
        const peer = pack.tests.find(
          (test) =>
            test.id ===
            target.id.replace(
              '-' + number + '-test',
              '-' + (number === 'singular' ? 'plural' : 'singular') + '-test',
            ),
        )!;
        [target.exercises[0], peer.exercises[0]] = [peer.exercises[0], target.exercises[0]];
        expect(validateSource(pack).join('\n')).toContain('question must stay in its declared');
        expect(() => validateRuntime(pack)).toThrow('question must stay in its declared');
        expect((await validatePackContent(pack)).errors.join('\n')).toContain(
          'question must stay in its declared',
        );
        expect(() => validateTopicPack(pack)).toThrow();
      }
    },
  );

  it.each(['missing scope', 'wrong axis', 'extra scope field', 'missing plural', 'Review scope'])(
    'rejects %s at both boundaries',
    async (mutation) => {
      const pack = structuredClone(packs.find((item) => item.id === 'affirmative-possession')!);
      const focused = pack.tests[0];
      if (mutation === 'missing scope') delete focused.numberScope;
      if (mutation === 'wrong axis') focused.numberScope!.axis = 'object';
      if (mutation === 'extra scope field') Object.assign(focused.numberScope!, { extra: true });
      if (mutation === 'missing plural') pack.tests.splice(1, 1);
      if (mutation === 'Review scope') pack.tests.at(-1)!.numberScope = focused.numberScope;
      expect(validateSource(pack).length).toBeGreaterThan(0);
      expect(() => validateRuntime(pack)).toThrow();
      expect((await validatePackContent(pack)).errors.length).toBeGreaterThan(0);
      expect(() => validateTopicPack(pack)).toThrow();
    },
  );

  it('places polite te with plural grammatical forms and retains cross-number mastery partners', () => {
    const pack = packs.find((item) => item.id === 'personal-pronouns-affirmative-olla')!;
    const reference = pack.tests.filter((test) => test.id.startsWith('ppo-written-reference-'));
    expect(reference.map((test) => test.exercises.length)).toEqual([20, 20]);
    const polite = reference
      .flatMap((test) => test.exercises)
      .filter((item) => item.tags.includes('te-polite'));
    expect(polite.length).toBeGreaterThan(0);
    for (const item of polite) expect(reference[1].exercises).toContain(item);
    const allTests = packs.flatMap((item) => item.tests);
    expect(
      allTests.some(
        (test) =>
          test.numberScope &&
          test.exercises.some((item) =>
            allTests.some(
              (peer) =>
                peer.id ===
                  test.id.replace(
                    '-' + test.numberScope?.number + '-test',
                    '-' +
                      (test.numberScope?.number === 'singular' ? 'plural' : 'singular') +
                      '-test',
                  ) &&
                peer.numberScope?.number !== test.numberScope?.number &&
                peer.exercises.some((candidate) => candidate.id === item.parallelExerciseId),
            ),
          ),
      ),
    ).toBe(true);
  });
});

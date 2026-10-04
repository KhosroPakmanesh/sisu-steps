import { beforeAll, describe, expect, it } from 'vitest';
import { Lesson } from '@/features/learning/shared/content/lesson.models';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validateOwnershipLessonExamples as validateRuntime } from '@/features/learning/shared/content/validation/ownership-lesson-examples.validator';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validateOwnershipLessonExamples as validateSource } from '../../../../tools/content-validation/shared/ownership-lesson-examples.mjs';
import { validatePackContent } from '../../../../tools/content-validation/shared/pack-content.validator.mjs';

describe('ownership worked-example coverage', () => {
  let packs: TopicPack[];
  let lessons: Lesson[];

  beforeAll(async () => {
    const source = await loadContentSource('content');
    const ids = source.catalog.groups.find(
      (group) => group.id === 'ownership-and-possession',
    )!.packs;
    packs = ids.map((id) => source.packs.find((pack) => pack['id'] === id) as unknown as TopicPack);
    lessons = packs.flatMap((pack) => pack.lessons);
  });

  it('accepts every authored lesson through both complete content boundaries', async () => {
    expect(lessons).toHaveLength(19);
    expect(lessons.flatMap((lesson) => lesson.examples)).toHaveLength(136);
    expect(validateSource(lessons)).toEqual([]);
    expect(() => validateRuntime(lessons)).not.toThrow();
    for (const pack of packs) {
      expect(validateTopicPack(pack).id).toBe(pack.id);
      expect((await validatePackContent(pack)).errors).toEqual([]);
    }
  });

  it('rejects the originally missing hänellä at both complete boundaries', async () => {
    const pack = structuredClone(packs[0]);
    pack.lessons[0].examples = pack.lessons[0].examples.filter(
      (example) => !example.finnish.includes('Hänellä'),
    );
    expect(() => validateTopicPack(pack)).toThrow('missing worked possessor hänellä');
    expect((await validatePackContent(pack)).errors.join('\n')).toContain(
      'missing worked possessor hänellä',
    );
  });

  it('rejects burying a missing owner after repeated first-six owners', () => {
    const lesson = copyLesson('nps-partitive');
    lesson.examples.push(lesson.examples.splice(2, 1)[0]);
    reject([lesson], 'first six worked examples');
  });

  it.each(['pqs-short-answers', 'npq-short-answers'])(
    'rejects question-only filler in %s',
    (id) => {
      const lesson = copyLesson(id);
      lesson.examples[0].finnish = lesson.examples[0].finnish.split(' — ')[0];
      reject([lesson], 'every short-answer worked example');
    },
  );

  it.each(['On.', 'Ei ole.', 'Kyllä, on.', 'Ei, ei ole.'])(
    'rejects omitting taught reply %s',
    (reply) => {
      const lesson = copyLesson('pqs-short-answers');
      for (const example of lesson.examples) {
        if (example.finnish.endsWith(` — ${reply}`))
          example.finnish = example.finnish.split(' — ')[0] + ' — Olen.';
      }
      reject([lesson], `missing worked reply ${reply}`);
    },
  );

  it.each(['mme', 'nne'])('rejects missing omitted plural-owner ending -%s', (ending) => {
    const lesson = copyLesson('ppe-pronoun-omission');
    lesson.examples = lesson.examples.filter((example) => !example.finnish.includes(ending + '.'));
    reject([lesson], `missing worked omission of -${ending}`);
  });

  it('does not count an explicit pronoun as an omission example', () => {
    const lesson = copyLesson('ppe-pronoun-omission');
    lesson.examples[2].finnish = 'Tämä on meidän automme.';
    reject([lesson], 'missing worked omission of -mme');
  });

  it('rejects missing neutral-only partitive and possessive harmony examples', () => {
    const partitive = copyLesson('nps-partitive');
    partitive.examples[4].finnish = 'Teillä ei ole autoa.';
    reject([partitive], 'missing worked partitive contrast peliä');
    const harmony = copyLesson('ppe-harmony');
    harmony.examples.pop();
    reject([harmony], 'missing neutral-only worked harmony pelinsä');
  });

  it('rejects complete example sets copied between targets', () => {
    const first = copyLesson('aps-possessors');
    const second = copyLesson('aps-fixed-on');
    second.examples = structuredClone(first.examples);
    reject([first, second], 'copies the complete worked-example set');
  });

  it('allows a reused sentence with steps for a distinct target', () => {
    const first = copyLesson('aps-possessors');
    const second = copyLesson('aps-fixed-on');
    second.examples[0].finnish = first.examples[0].finnish;
    expect(validateSource([first, second])).toEqual([]);
    expect(() => validateRuntime([first, second])).not.toThrow();
  });

  function copyLesson(id: string): Lesson {
    return structuredClone(lessons.find((lesson) => lesson.id === id)!);
  }

  function reject(values: Lesson[], message: string): void {
    expect(validateSource(values).join('\n')).toContain(message);
    expect(() => validateRuntime(values)).toThrow(message);
  }
});

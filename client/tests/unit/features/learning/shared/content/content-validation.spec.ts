import { describe, expect, it } from 'vitest';
import {
  ContentCatalog,
  Exercise,
  TopicPack,
} from '@/features/learning/shared/content/content.models';
import { validateContentCatalog } from '@/features/learning/shared/content/validation/content-catalog.validator';
import { validatePackCollection } from '@/features/learning/shared/content/validation/pack-collection.validator';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';

const scoredExercises = (count = 200): Exercise[] =>
  Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const partnerNumber = index % 2 === 0 ? number + 1 : number - 1;
    return {
      id: `exercise-${number}`,
      type: 'fill-blank',
      instruction: 'Answer.',
      prompt: `Prompt ${number}`,
      acceptedAnswers: [`answer-${number}`],
      explanation: `Explanation ${number}`,
      tags: [],
      requiredSkills: ['Rule'],
      vocabulary: ['talo'],
      targetSkill: 'Rule',
      misconceptionCategory: 'Rule not applied',
      parallelExerciseId: `exercise-${partnerNumber}`,
    };
  });

const validPack = (): TopicPack => ({
  schemaVersion: 1,
  id: 'pack',
  version: '1.0.0',
  title: 'Pack',
  level: 'A1',
  summary: 'Summary',
  objectives: [],
  importantSkills: ['Rule'],
  sources: [],
  lessons: [
    {
      id: 'lesson-1',
      version: '1.0.0',
      title: 'Lesson',
      summary: 'Summary',
      stage: 'focused',
      targetSkills: ['Rule'],
      prerequisiteSkills: [],
      introducedVocabulary: [{ finnish: 'talo', english: 'house' }],
      objectives: ['Learn the rule.'],
      sections: [
        { title: 'Rule', paragraphs: ['A complete explanation.'], keyPoints: ['Remember this.'] },
      ],
      examples: [{ finnish: 'talo', english: 'house', steps: ['Read the word.'] }],
      commonMistakes: ['Do not guess.'],
      practiceExercises: [
        {
          id: 'practice-1',
          type: 'fill-blank',
          instruction: 'Answer.',
          prompt: 'Practice one',
          acceptedAnswers: ['one'],
          explanation: 'Explanation',
          tags: ['lesson-practice'],
          requiredSkills: ['Rule'],
          vocabulary: ['talo'],
        },
        {
          id: 'practice-2',
          type: 'fill-blank',
          instruction: 'Answer.',
          prompt: 'Practice two',
          acceptedAnswers: ['two'],
          explanation: 'Explanation',
          tags: ['lesson-practice'],
          requiredSkills: ['Rule'],
          vocabulary: ['talo'],
        },
      ],
    },
  ],
  tests: [
    {
      id: 'test',
      title: 'Test',
      focus: 'Focus',
      set: 'core',
      stage: 'focused',
      targetSkills: ['Rule'],
      prerequisiteSkills: [],
      lessonIds: ['lesson-1'],
      exercises: scoredExercises(),
    },
  ],
});

describe('content-pack validation', () => {
  it('accepts a well-formed pack', () => {
    expect(validateTopicPack(validPack()).id).toBe('pack');
  });
  it('rejects duplicate stable exercise ids', () => {
    const pack = validPack();
    pack.tests[0].exercises.push({ ...pack.tests[0].exercises[0] });
    expect(() => validateTopicPack(pack)).toThrowError('Duplicate exercise id: exercise-1');
  });
  it('rejects exercises without accepted answers', () => {
    const pack = validPack();
    pack.tests[0].exercises[0].acceptedAnswers = [];
    expect(() => validateTopicPack(pack)).toThrowError(
      'An exercise is missing required grading information.',
    );
  });
  it('rejects sentence exercises that assume an unstructured explanation', () => {
    const pack = validPack();
    pack.tests[0].exercises[0].tags = ['sentence'];
    expect(() => validateTopicPack(pack)).toThrowError(
      'Sentence exercise exercise-1 has an incomplete explanation.',
    );
  });
  it('rejects a test that references a missing lesson', () => {
    const pack = validPack();
    pack.tests[0].lessonIds = ['missing-lesson'];
    expect(() => validateTopicPack(pack)).toThrowError('An exercise test is malformed.');
  });
  it('rejects a valid lesson that no test references', () => {
    const pack = validPack();
    const orphanLesson = structuredClone(pack.lessons[0]);
    orphanLesson.id = 'orphan-lesson';
    orphanLesson.practiceExercises = orphanLesson.practiceExercises.map((exercise, index) => ({
      ...exercise,
      id: `orphan-practice-${index + 1}`,
    }));
    pack.lessons.push(orphanLesson);

    expect(() => validateTopicPack(pack)).toThrowError(
      'The exercise pack contains a lesson that no test uses.',
    );
  });
  it('rejects a lesson without enough separate practice', () => {
    const pack = validPack();
    pack.lessons[0].practiceExercises = [pack.lessons[0].practiceExercises[0]];
    expect(() => validateTopicPack(pack)).toThrowError(
      'A lesson is missing required teaching information.',
    );
  });
  it('rejects more than one target in focused material', () => {
    const pack = validPack();
    pack.tests[0].targetSkills = ['Rule', 'Hidden rule'];
    expect(() => validateTopicPack(pack)).toThrowError(
      'Test test must declare exactly one focused target skill.',
    );
  });
  it('rejects an exercise skill outside its declared test focus', () => {
    const pack = validPack();
    pack.tests[0].exercises[0].requiredSkills = ['Undeclared rule'];
    expect(() => validateTopicPack(pack)).toThrowError(
      'Exercise exercise-1 requires a skill outside test test.',
    );
  });
  it('rejects scored vocabulary that its lesson does not introduce', () => {
    const pack = validPack();
    pack.tests[0].exercises[0].vocabulary = ['unknown'];
    expect(() => validateTopicPack(pack)).toThrowError(
      'Exercise exercise-1 uses vocabulary not introduced for test test.',
    );
  });
  it('rejects incomplete feedback for a multiple-choice option', () => {
    const pack = validPack();
    pack.tests[0].exercises[0] = {
      ...pack.tests[0].exercises[0],
      type: 'multiple-choice',
      options: ['answer', 'wrong'],
      optionFeedback: { answer: 'Correct.' },
    };
    expect(() => validateTopicPack(pack)).toThrowError(
      'Multiple-choice exercise exercise-1 has incomplete option feedback.',
    );
  });
  it('rejects a parallel exercise with a different target skill', () => {
    const pack = validPack();
    pack.tests[0].exercises[1].targetSkill = 'Another rule';
    expect(() => validateTopicPack(pack)).toThrowError(
      'Exercise exercise-1 has an invalid parallel-review relationship.',
    );
  });
  it('rejects excessive vocabulary in a focused lesson', () => {
    const pack = validPack();
    pack.lessons[0].introducedVocabulary = Array.from({ length: 11 }, (_, index) => ({
      finnish: `word-${index}`,
      english: `meaning-${index}`,
    }));
    expect(() => validateTopicPack(pack)).toThrowError(
      'Focused lesson lesson-1 introduces more than ten words.',
    );
  });
  it('rejects packs outside the 200 to 1,000 scored-exercise range', () => {
    const tooSmall = validPack();
    tooSmall.tests[0].exercises = scoredExercises(199);
    expect(() => validateTopicPack(tooSmall)).toThrowError(
      'The exercise pack must contain between 200 and 1,000 scored exercises.',
    );

    const tooLarge = validPack();
    tooLarge.tests[0].exercises = scoredExercises(1001);
    expect(() => validateTopicPack(tooLarge)).toThrowError(
      'The exercise pack must contain between 200 and 1,000 scored exercises.',
    );
  });
  it('rejects an important skill that core exercises do not cover', () => {
    const pack = validPack();
    pack.importantSkills = ['Rule', 'Missing important point'];
    expect(() => validateTopicPack(pack)).toThrowError(
      'Important skill Missing important point is not covered by a core test.',
    );
  });
  it('rejects missing or duplicate important-skill declarations', () => {
    const missing = validPack();
    missing.importantSkills = [];
    expect(() => validateTopicPack(missing)).toThrowError(
      'The exercise pack must declare unique important skills.',
    );

    const duplicated = validPack();
    duplicated.importantSkills = ['Rule', 'Rule'];
    expect(() => validateTopicPack(duplicated)).toThrowError(
      'The exercise pack must declare unique important skills.',
    );
  });
  it('rejects a new grammatical requirement introduced only by an extended test', () => {
    const pack = validPack();
    const newLesson = structuredClone(pack.lessons[0]);
    newLesson.id = 'lesson-2';
    newLesson.targetSkills = ['New rule'];
    newLesson.practiceExercises = newLesson.practiceExercises.map((exercise, index) => ({
      ...exercise,
      id: `new-practice-${index + 1}`,
      requiredSkills: ['New rule'],
    }));
    pack.lessons.push(newLesson);
    const extendedExercises = scoredExercises(2).map((exercise, index) => ({
      ...exercise,
      id: `extended-exercise-${index + 1}`,
      requiredSkills: ['New rule'],
      targetSkill: 'New rule',
      parallelExerciseId: `extended-exercise-${index === 0 ? 2 : 1}`,
    }));
    pack.tests.push({
      ...pack.tests[0],
      id: 'extended-test',
      set: 'extended',
      targetSkills: ['New rule'],
      lessonIds: [newLesson.id],
      exercises: extendedExercises,
    });
    expect(() => validateTopicPack(pack)).toThrowError(
      'Extended test extended-test introduces a skill not covered by core tests.',
    );
  });
  it('rejects a core test after the extended set has started', () => {
    const pack = validPack();
    const exercises = pack.tests[0].exercises;
    pack.tests = [
      { ...pack.tests[0], id: 'first-core-test', exercises: exercises.slice(0, 2) },
      { ...pack.tests[0], id: 'extended-test', set: 'extended', exercises: exercises.slice(2, 4) },
      { ...pack.tests[0], id: 'later-core-test', exercises: exercises.slice(4) },
    ];
    expect(() => validateTopicPack(pack)).toThrowError(
      'A core test cannot appear after the extended test set has started.',
    );
  });
});

describe('content catalog validation', () => {
  const catalog = (packs = [{ id: 'pack', file: 'pack.json' }]): ContentCatalog => ({
    schemaVersion: 1,
    packs,
  });

  it('accepts safe, unique catalog entries', () => {
    expect(validateContentCatalog(catalog()).packs).toHaveLength(1);
  });

  it('rejects duplicate ids and unsafe filenames', () => {
    expect(() =>
      validateContentCatalog(
        catalog([
          { id: 'pack', file: 'pack.json' },
          { id: 'pack', file: '../other.json' },
        ]),
      ),
    ).toThrowError('The content catalog contains an invalid or duplicate pack entry.');
  });

  it('rejects ids duplicated across different content kinds or packs', () => {
    const first = validPack();
    const second = structuredClone(first);
    second.id = 'second-pack';
    second.lessons[0].id = 'second-lesson';
    second.tests[0].lessonIds = ['second-lesson'];
    second.tests[0].id = first.lessons[0].id;
    second.lessons[0].practiceExercises = second.lessons[0].practiceExercises.map(
      (exercise, index) => ({ ...exercise, id: `second-practice-${index}` }),
    );
    second.tests[0].exercises = second.tests[0].exercises.map((exercise, index) => ({
      ...exercise,
      id: `second-exercise-${index + 1}`,
      parallelExerciseId: `second-exercise-${index % 2 === 0 ? index + 2 : index}`,
    }));

    expect(() =>
      validatePackCollection(
        catalog([
          { id: 'pack', file: 'pack.json' },
          { id: 'second-pack', file: 'second-pack.json' },
        ]),
        [first, second],
      ),
    ).toThrowError('Content id lesson-1 is duplicated across installed topic packs.');
  });
});

import { describe, expect, it } from 'vitest';
import {
  ContentCatalog,
  ContentPackManifest,
  Exercise,
  TopicPack,
} from '@/features/learning/shared/content/content.models';
import { validateContentCatalog } from '@/features/learning/shared/content/validation/content-catalog.validator';
import { validateContentManifest } from '@/features/learning/shared/content/validation/content-manifest.validator';
import { validateLessons } from '@/features/learning/shared/content/validation/lesson.validator';
import { validatePackSummaryCollection } from '@/features/learning/shared/content/validation/pack-summary-collection.validator';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';

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
      introducedVocabulary: [{ finnish: 'talo', english: 'house', type: 'word' }],
      reusedVocabulary: [],
      suppliedVocabulary: [],
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
      stage: 'focused',
      targetSkills: ['Rule'],
      prerequisiteSkills: [],
      lessonIds: ['lesson-1'],
      exercises: scoredExercises(),
    },
  ],
});

const secondPersonExplanation = () => ({
  translation: 'You are here.',
  pattern: 'Subject + verb + place word',
  parts: [
    {
      finnish: 'Sinä',
      meaning: 'you',
      role: 'singular subject',
      baseForm: 'sinä',
      formation: 'Use sinä for one person.',
    },
    {
      finnish: 'olet täällä',
      meaning: 'are here',
      role: 'verb and place word',
      baseForm: 'olla; täällä',
      formation: 'Use olet with sinä; täällä is unchanged.',
    },
  ],
});

describe('content-pack validation', () => {
  it('accepts a well-formed pack', () => {
    expect(validateTopicPack(validPack()).id).toBe('pack');
  });
  it('rejects removed Core/Extended set metadata', () => {
    const pack = validPack();
    (pack.tests[0] as unknown as Record<string, unknown>)['set'] = 'core';
    expect(() => validateTopicPack(pack)).toThrowError(
      'An exercise test must not declare Core/Extended set metadata.',
    );
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
  it('requires complete English meanings before Finnish sentence construction', () => {
    const pack = validPack();
    const exercise = pack.tests[0].exercises[0];
    exercise.tags = ['sentence'];
    exercise.prompt = 'Kissat ____ kotona.';
    exercise.sentenceExplanation = {
      translation: 'The cats are at home.',
      pattern: 'Subject + verb + place word',
      parts: [
        {
          finnish: 'Kissat',
          meaning: 'the cats',
          role: 'plural subject',
          baseForm: 'kissa',
          formation: 'Add the plural ending -t.',
        },
        {
          finnish: 'ovat',
          meaning: 'are',
          role: 'plural verb',
          baseForm: 'olla',
          formation: 'Use ovat with a plural subject.',
        },
        {
          finnish: 'kotona',
          meaning: 'at home',
          role: 'place word',
          baseForm: 'kotona',
          formation: 'This fixed word is supplied.',
        },
      ],
    };

    expect(() => validateTopicPack(pack)).toThrowError(
      'Sentence construction exercise exercise-1 must show its complete English meaning before submission.',
    );
  });
  it('rejects ambiguous singular and plural English you in Finnish production', () => {
    for (const personTag of ['person-sina', 'person-te']) {
      const pack = validPack();
      const exercise = pack.tests[0].exercises[0];
      exercise.type = 'translation-fi';
      exercise.prompt = 'Write “You are here.”';
      exercise.tags = ['sentence', personTag];
      exercise.sentenceExplanation = secondPersonExplanation();

      expect(() => validateTopicPack(pack)).toThrowError(
        'Exercise exercise-1 must identify the intended Finnish form of English “you” before submission.',
      );
    }
  });
  it('accepts visible second-person form guidance and Finnish-to-English prompts', () => {
    const cases = [
      { tag: 'person-sina', prompt: 'Complete “You are here.” Sinä ____ täällä.' },
      { tag: 'person-sina', prompt: 'Write “You are here.” Address one person.' },
      { tag: 'person-te', prompt: 'Write “You are here.” Address more than one person.' },
      { tag: 'person-te', prompt: 'Write “You are here.” Address one person politely.' },
      { tag: 'person-te', prompt: 'Complete “You are here.” Te ____ täällä.' },
      {
        tag: 'person-sina',
        prompt: 'Translate “Sinä olet täällä.” into English.',
        translate: true,
      },
    ];

    for (const item of cases) {
      const pack = validPack();
      const exercise = pack.tests[0].exercises[0];
      exercise.type = item.translate ? 'translation-en' : 'translation-fi';
      exercise.prompt = item.prompt;
      exercise.tags = ['sentence', item.tag];
      exercise.sentenceExplanation = secondPersonExplanation();

      expect(validateTopicPack(pack).id).toBe('pack');
    }
  });
  it('does not reveal the assessed meaning in Finnish-to-English translation prompts', () => {
    const pack = validPack();
    const exercise = pack.tests[0].exercises[0];
    exercise.type = 'translation-en';
    exercise.tags = ['sentence'];
    exercise.prompt = 'Kissat ovat kotona.';
    exercise.sentenceExplanation = {
      translation: 'The cats are at home.',
      pattern: 'Subject + verb + place word',
      parts: [
        {
          finnish: 'Kissat',
          meaning: 'the cats',
          role: 'plural subject',
          baseForm: 'kissa',
          formation: 'Add the plural ending -t.',
        },
        {
          finnish: 'ovat',
          meaning: 'are',
          role: 'plural verb',
          baseForm: 'olla',
          formation: 'Use ovat with a plural subject.',
        },
        {
          finnish: 'kotona',
          meaning: 'at home',
          role: 'place word',
          baseForm: 'kotona',
          formation: 'This fixed word is supplied.',
        },
      ],
    };

    expect(validateTopicPack(pack).id).toBe('pack');
  });
  it('rejects a form transformation without English meanings on both sides', () => {
    const pack = validPack();
    pack.tests[0].exercises[0].prompt = 'silta (“bridge”) → ____';

    expect(() => validateTopicPack(pack)).toThrowError(
      'Transformation exercise exercise-1 must label both forms with English meanings.',
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
  it('rejects the removed guided-combination stage', () => {
    const pack = validPack();
    (pack.tests[0] as unknown as { stage: string }).stage = 'guided-combination';
    expect(() => validateTopicPack(pack)).toThrowError(
      'Test test has incomplete focus information.',
    );
  });
  it('rejects a focused test that repeats a prerequisite lesson', () => {
    const pack = validPack();
    const prerequisiteLesson = structuredClone(pack.lessons[0]);
    prerequisiteLesson.id = 'prerequisite-lesson';
    prerequisiteLesson.targetSkills = ['Prerequisite rule'];
    prerequisiteLesson.practiceExercises = prerequisiteLesson.practiceExercises.map(
      (exercise, index) => ({
        ...exercise,
        id: `prerequisite-practice-${index + 1}`,
        requiredSkills: ['Prerequisite rule'],
      }),
    );
    pack.lessons.push(prerequisiteLesson);
    pack.tests[0].prerequisiteSkills = ['Prerequisite rule'];
    pack.tests[0].lessonIds.push(prerequisiteLesson.id);

    expect(() => validateTopicPack(pack)).toThrowError(
      'Focused test test references a lesson for another target skill.',
    );
  });
  it('rejects a focused lesson that is available only through review', () => {
    const pack = validPack();
    const reviewOnlyLesson = structuredClone(pack.lessons[0]);
    reviewOnlyLesson.id = 'review-only-lesson';
    reviewOnlyLesson.practiceExercises = reviewOnlyLesson.practiceExercises.map(
      (exercise, index) => ({ ...exercise, id: `review-only-practice-${index + 1}` }),
    );
    pack.lessons.push(reviewOnlyLesson);
    pack.tests.push({
      ...pack.tests[0],
      id: 'review-test',
      stage: 'review',
      lessonIds: [reviewOnlyLesson.id],
      exercises: [],
    });
    pack.tests[1].exercises = scoredExercises(2).map((exercise, index) => ({
      ...exercise,
      id: `review-exercise-${index + 1}`,
      parallelExerciseId: `review-exercise-${index === 0 ? 2 : 1}`,
    }));

    expect(() => validateTopicPack(pack)).toThrowError(
      'Focused lesson review-only-lesson is not referenced by a focused test.',
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
      type: 'word' as const,
    }));
    expect(() => validateTopicPack(pack)).toThrowError(
      'Focused lesson lesson-1 introduces more than ten words.',
    );
  });
  it('requires explicit reused and supplied vocabulary categories', () => {
    const pack = validPack();
    delete (pack.lessons[0] as unknown as Partial<Record<'reusedVocabulary', unknown>>)
      .reusedVocabulary;

    expect(() => validateTopicPack(pack)).toThrowError(
      'A lesson is missing required teaching information.',
    );
  });
  it('requires an explicit vocabulary item type', () => {
    const pack = validPack();
    delete (pack.lessons[0].introducedVocabulary[0] as unknown as { type?: string }).type;

    expect(() => validateTopicPack(pack)).toThrowError(
      'A lesson is missing required teaching information.',
    );
  });
  it('rejects an unsupported vocabulary item type', () => {
    const pack = validPack();
    (pack.lessons[0].introducedVocabulary[0] as unknown as { type: string }).type = 'phrase';

    expect(() => validateTopicPack(pack)).toThrowError(
      'A lesson is missing required teaching information.',
    );
  });
  it('rejects a transparent multiword combination declared as one word', () => {
    const pack = validPack();
    pack.lessons[0].introducedVocabulary[0] = {
      finnish: 'Suomessa huomenna',
      english: 'in Finland tomorrow',
      type: 'word',
    };

    expect(() => validateTopicPack(pack)).toThrowError(
      'Lesson lesson-1 declares multiword vocabulary Suomessa huomenna as a word.',
    );
  });
  it('rejects a one-word item labeled as a fixed expression', () => {
    const pack = validPack();
    pack.lessons[0].introducedVocabulary[0] = {
      finnish: 'talo',
      english: 'house',
      type: 'fixed-expression',
    };

    expect(() => validateTopicPack(pack)).toThrowError(
      'Lesson lesson-1 declares one-word vocabulary talo as a fixed expression.',
    );
  });
  it('accepts a genuine fixed expression as one explicitly typed item', () => {
    const pack = validPack();
    const expression = {
      finnish: 'hyvää huomenta',
      english: 'good morning',
      type: 'fixed-expression' as const,
    };
    pack.lessons[0].introducedVocabulary = [expression];
    pack.lessons[0].examples = [
      { finnish: 'Hyvää huomenta!', english: 'Good morning!', steps: ['Learn the greeting.'] },
    ];
    for (const exercise of pack.lessons[0].practiceExercises) {
      exercise.vocabulary = [expression.finnish];
    }
    for (const exercise of pack.tests[0].exercises) {
      exercise.vocabulary = [expression.finnish];
    }

    expect(validateTopicPack(pack).id).toBe('pack');
  });
  it('rejects vocabulary repeated across lesson categories', () => {
    const pack = validPack();
    pack.lessons[0].suppliedVocabulary = [{ finnish: 'talo', english: 'house', type: 'word' }];

    expect(() => validateTopicPack(pack)).toThrowError(
      'Lesson lesson-1 repeats vocabulary across its categories.',
    );
  });
  it('rejects reused vocabulary outside the declared prerequisite chain', () => {
    const pack = validPack();
    pack.lessons[0].reusedVocabulary = [{ finnish: 'koulu', english: 'school', type: 'word' }];

    expect(() => validateTopicPack(pack)).toThrowError(
      'Lesson lesson-1 reuses vocabulary outside its declared prerequisite chain.',
    );
  });
  it('rejects a changed meaning for vocabulary from the declared prerequisite chain', () => {
    const prerequisite = structuredClone(validPack().lessons[0]);
    prerequisite.id = 'prerequisite-lesson';
    prerequisite.targetSkills = ['Prerequisite rule'];
    prerequisite.practiceExercises = prerequisite.practiceExercises.map((exercise, index) => ({
      ...exercise,
      id: `prerequisite-practice-${index + 1}`,
      requiredSkills: ['Prerequisite rule'],
    }));

    const current = structuredClone(validPack().lessons[0]);
    current.id = 'current-lesson';
    current.targetSkills = ['Current rule'];
    current.prerequisiteSkills = ['Prerequisite rule'];
    current.introducedVocabulary = [{ finnish: 'koulu', english: 'school', type: 'word' }];
    current.reusedVocabulary = [{ finnish: 'talo', english: 'building', type: 'word' }];
    current.practiceExercises = current.practiceExercises.map((exercise, index) => ({
      ...exercise,
      id: `current-practice-${index + 1}`,
      requiredSkills: ['Current rule'],
      vocabulary: ['koulu'],
    }));

    expect(() => validateLessons([prerequisite, current], new Set())).toThrowError(
      'Lesson current-lesson reuses vocabulary outside its declared prerequisite chain.',
    );
  });
  it('rejects a changed vocabulary type from the declared prerequisite chain', () => {
    const prerequisite = structuredClone(validPack().lessons[0]);
    prerequisite.id = 'prerequisite-lesson';
    prerequisite.targetSkills = ['Prerequisite rule'];
    prerequisite.introducedVocabulary = [
      { finnish: 'hyvää huomenta', english: 'good morning', type: 'fixed-expression' },
    ];
    prerequisite.examples = [
      { finnish: 'Hyvää huomenta!', english: 'Good morning!', steps: ['Learn the greeting.'] },
    ];
    prerequisite.practiceExercises = prerequisite.practiceExercises.map((exercise, index) => ({
      ...exercise,
      id: `prerequisite-practice-${index + 1}`,
      requiredSkills: ['Prerequisite rule'],
      vocabulary: ['hyvää huomenta'],
    }));

    const current = structuredClone(validPack().lessons[0]);
    current.id = 'current-lesson';
    current.targetSkills = ['Current rule'];
    current.prerequisiteSkills = ['Prerequisite rule'];
    current.reusedVocabulary = [
      { finnish: 'hyvää huomenta', english: 'good morning', type: 'word' },
    ];
    current.practiceExercises = current.practiceExercises.map((exercise, index) => ({
      ...exercise,
      id: `current-practice-${index + 1}`,
      requiredSkills: ['Current rule'],
    }));

    expect(() => validateLessons([prerequisite, current], new Set())).toThrowError(
      'Lesson current-lesson declares multiword vocabulary hyvää huomenta as a word.',
    );
  });
  it('rejects known vocabulary hidden in a worked example', () => {
    const prerequisite = structuredClone(validPack().lessons[0]);
    prerequisite.id = 'prerequisite-lesson';
    prerequisite.targetSkills = ['Prerequisite rule'];
    prerequisite.practiceExercises = prerequisite.practiceExercises.map((exercise, index) => ({
      ...exercise,
      id: `prerequisite-practice-${index + 1}`,
      requiredSkills: ['Prerequisite rule'],
    }));

    const current = structuredClone(validPack().lessons[0]);
    current.id = 'current-lesson';
    current.targetSkills = ['Current rule'];
    current.prerequisiteSkills = ['Prerequisite rule'];
    current.introducedVocabulary = [{ finnish: 'koulu', english: 'school', type: 'word' }];
    current.examples = [{ finnish: 'talo', english: 'house', steps: ['Read the word.'] }];
    current.practiceExercises = current.practiceExercises.map((exercise, index) => ({
      ...exercise,
      id: `current-practice-${index + 1}`,
      requiredSkills: ['Current rule'],
      vocabulary: ['koulu'],
    }));

    expect(() => validateLessons([prerequisite, current], new Set())).toThrowError(
      'Lesson current-lesson uses vocabulary talo in a worked example without classifying it.',
    );
  });
  it('rejects supplied vocabulary without a visible English meaning', () => {
    const pack = validPack();
    pack.lessons[0].suppliedVocabulary = [{ finnish: 'hyvin', english: 'well', type: 'word' }];
    pack.lessons[0].examples.push({
      finnish: 'hyvin',
      english: 'clearly',
      steps: ['Read the word.'],
    });

    expect(() => validateTopicPack(pack)).toThrowError(
      'Lesson lesson-1 supplies vocabulary hyvin without showing its Finnish form and English meaning in teaching.',
    );
  });
  it('rejects a repeated optional-practice label', () => {
    const pack = validPack();
    pack.lessons[0].practiceExercises[0].prompt =
      'Optional practice: Optional practice: Answer this.';

    expect(() => validateTopicPack(pack)).toThrowError(
      'Exercise practice-1 repeats the optional-practice label.',
    );
  });
  it('does not make supplied teaching vocabulary available for scored recall', () => {
    const pack = validPack();
    pack.lessons[0].suppliedVocabulary = [{ finnish: 'koulu', english: 'school', type: 'word' }];
    pack.lessons[0].examples.push({
      finnish: 'koulu',
      english: 'school',
      steps: ['Read the word.'],
    });
    pack.tests[0].exercises[0].vocabulary = ['koulu'];

    expect(() => validateTopicPack(pack)).toThrowError(
      'Exercise exercise-1 uses vocabulary not introduced for test test.',
    );
  });
  it('allows pedagogically sized packs and rejects empty or over-limit scored sets', () => {
    const compact = validPack();
    compact.tests[0].exercises = scoredExercises(100);
    expect(validateTopicPack(compact).tests[0].exercises).toHaveLength(100);

    const empty = validPack();
    empty.tests[0].exercises = [];
    expect(() => validateTopicPack(empty)).toThrowError(
      'The exercise pack must contain scored exercises and no more than 1,000.',
    );

    const tooLarge = validPack();
    tooLarge.tests[0].exercises = scoredExercises(1001);
    expect(() => validateTopicPack(tooLarge)).toThrowError(
      'The exercise pack must contain scored exercises and no more than 1,000.',
    );
  });
  it('rejects an important skill that focused exercises do not cover', () => {
    const pack = validPack();
    pack.importantSkills = ['Rule', 'Missing important point'];
    expect(() => validateTopicPack(pack)).toThrowError(
      'Important skill Missing important point is not covered by a focused test.',
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
  it('rejects a new grammatical requirement introduced only by a review', () => {
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
    const reviewExercises = scoredExercises(2).map((exercise, index) => ({
      ...exercise,
      id: `review-exercise-${index + 1}`,
      requiredSkills: ['New rule'],
      targetSkill: 'New rule',
      parallelExerciseId: `review-exercise-${index === 0 ? 2 : 1}`,
    }));
    pack.tests.push({
      ...pack.tests[0],
      id: 'review-test',
      stage: 'review',
      targetSkills: ['New rule'],
      lessonIds: [newLesson.id],
      exercises: reviewExercises,
    });
    expect(() => validateTopicPack(pack)).toThrowError(
      'Review test review-test introduces a skill not covered by focused tests.',
    );
  });
  it('rejects a focused test after the review group has started', () => {
    const pack = validPack();
    const exercises = pack.tests[0].exercises;
    pack.tests = [
      { ...pack.tests[0], id: 'first-focused-test', exercises: exercises.slice(0, 2) },
      {
        ...pack.tests[0],
        id: 'review-test',
        stage: 'review',
        exercises: exercises.slice(2, 4),
      },
      { ...pack.tests[0], id: 'later-focused-test', exercises: exercises.slice(4) },
    ];
    expect(() => validateTopicPack(pack)).toThrowError(
      'A focused test cannot appear after the review group has started.',
    );
  });
});

describe('content catalog validation', () => {
  const catalog = (packs = ['pack']): ContentCatalog => ({
    schemaVersion: 2,
    groups: [{ id: 'test-group', title: 'Test group', packs }],
  });

  it('accepts safe, unique catalog pack IDs', () => {
    expect(validateContentCatalog(catalog(['vowel-harmony-kpt-tplural'])).groups).toHaveLength(1);
  });

  it('rejects duplicate and unsafe pack IDs', () => {
    expect(() => validateContentCatalog(catalog(['pack', '../other']))).toThrowError(
      'The content catalog contains an invalid or duplicate pack ID.',
    );
    expect(() => validateContentCatalog(catalog(['pack', 'pack']))).toThrowError(
      'The content catalog contains an invalid or duplicate pack ID.',
    );
  });

  it('rejects invalid or duplicate group declarations', () => {
    const invalid = catalog();
    invalid.groups[0].id = 'Bad ID';
    expect(() => validateContentCatalog(invalid)).toThrowError(
      'The content catalog contains an invalid or duplicate group declaration.',
    );

    const duplicated = catalog();
    duplicated.groups.push({ id: 'test-group', title: 'Another title', packs: ['second-pack'] });
    expect(() => validateContentCatalog(duplicated)).toThrowError(
      'The content catalog contains an invalid or duplicate group declaration.',
    );
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
      validatePackSummaryCollection(
        catalog(['pack', 'second-pack']),
        [first, second].map(topicPackToSummary),
      ),
    ).toThrowError('Content id lesson-1 is duplicated across installed topic packs.');
  });
});

describe('content manifest validation', () => {
  const manifest = (): ContentPackManifest => {
    const pack = validPack();
    const summary = topicPackToSummary(pack);
    return {
      schemaVersion: pack.schemaVersion,
      id: pack.id,
      version: pack.version,
      title: pack.title,
      level: pack.level,
      summary: pack.summary,
      objectives: pack.objectives,
      importantSkills: pack.importantSkills,
      sources: pack.sources,
      lessonIds: pack.lessons.map((lesson) => lesson.id),
      testIds: pack.tests.map((test) => test.id),
      lessonSummaries: summary.lessons,
      testSummaries: summary.tests,
    };
  };

  it('accepts a matching manifest with safe ordered references', () => {
    expect(validateContentManifest(manifest(), 'pack').lessonIds).toEqual(['lesson-1']);
  });

  it('rejects mismatched identities and unsafe or duplicate references', () => {
    expect(() => validateContentManifest(manifest(), 'other-pack')).toThrowError(
      'Topic pack other-pack has a mismatched or unsupported manifest.',
    );
    const unsafe = manifest();
    unsafe.lessonIds = ['../lesson'];
    expect(() => validateContentManifest(unsafe, 'pack')).toThrowError(
      'Topic pack pack has an incomplete manifest.',
    );
    const duplicated = manifest();
    duplicated.testIds = ['test', 'test'];
    expect(() => validateContentManifest(duplicated, 'pack')).toThrowError(
      'Topic pack pack has an incomplete manifest.',
    );
  });
});

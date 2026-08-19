import { signal } from '@angular/core';
import { TopicPack } from '@/features/learning/shared/content/content.models';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { LearnerState } from '@/shared/domain/learner-state.models';

export const learningPack: TopicPack = {
  schemaVersion: 1,
  id: 'topic',
  version: '1.0.0',
  title: 'Finnish foundations',
  level: 'A1',
  summary: 'Practise one dependable pattern at a time.',
  objectives: ['Use vowel harmony.'],
  importantSkills: ['Vowel harmony'],
  sources: [],
  lessons: [
    {
      id: 'lesson-1',
      version: '1.0.0',
      title: 'Vowel harmony',
      summary: 'Choose the matching ending.',
      stage: 'focused',
      targetSkills: ['Vowel harmony'],
      prerequisiteSkills: [],
      introducedVocabulary: [
        { finnish: 'talo', english: 'house' },
        { finnish: 'koulu', english: 'school' },
      ],
      objectives: ['Choose -ssa or -ssä.'],
      sections: [
        {
          title: 'The rule',
          paragraphs: ['Back vowels use -ssa.'],
          keyPoints: ['a, o, and u are back vowels.'],
        },
      ],
      examples: [
        {
          finnish: 'talo → talossa',
          english: 'in the house',
          steps: ['Find a and o.', 'Add -ssa.'],
        },
      ],
      commonMistakes: ['Do not replace ä with a.'],
      practiceExercises: [
        {
          id: 'practice-1',
          type: 'fill-blank',
          instruction: 'Complete the form.',
          prompt: 'talo + -ssa/-ssä',
          acceptedAnswers: ['talossa'],
          explanation: 'talo has back vowels, so use -ssa.',
          tags: ['lesson-practice'],
          requiredSkills: ['Vowel harmony'],
          vocabulary: ['talo'],
        },
        {
          id: 'practice-2',
          type: 'fill-blank',
          instruction: 'Complete the form.',
          prompt: 'koulu + -ssa/-ssä',
          acceptedAnswers: ['koulussa'],
          explanation: 'koulu has back vowels, so use -ssa.',
          tags: ['lesson-practice'],
          requiredSkills: ['Vowel harmony'],
          vocabulary: ['koulu'],
        },
      ],
    },
  ],
  tests: [
    {
      id: 'test-1',
      title: 'Test 1',
      focus: 'Choose the inessive ending.',
      set: 'core',
      stage: 'focused',
      targetSkills: ['Vowel harmony'],
      prerequisiteSkills: [],
      lessonIds: ['lesson-1'],
      exercises: [
        {
          id: 'exercise-1',
          type: 'fill-blank',
          instruction: 'Complete the word.',
          prompt: 'talo + -ssa',
          acceptedAnswers: ['talossa'],
          explanation: 'The word talo has back vowels, so the ending is -ssa.',
          tags: ['vowel-harmony'],
          requiredSkills: ['Vowel harmony'],
          vocabulary: ['talo'],
          targetSkill: 'Vowel harmony',
          misconceptionCategory: 'Wrong vowel-harmony ending',
          parallelExerciseId: 'exercise-2',
        },
      ],
    },
    {
      id: 'test-2',
      title: 'Extended review',
      focus: 'Retrieve the same pattern in a new word.',
      set: 'extended',
      stage: 'review',
      targetSkills: ['Vowel harmony'],
      prerequisiteSkills: [],
      lessonIds: ['lesson-1'],
      exercises: [
        {
          id: 'exercise-2',
          type: 'fill-blank',
          instruction: 'Complete the word.',
          prompt: 'koulu + -ssa',
          acceptedAnswers: ['koulussa'],
          explanation: 'The word koulu has back vowels, so the ending is -ssa.',
          tags: ['vowel-harmony'],
          requiredSkills: ['Vowel harmony'],
          vocabulary: ['koulu'],
          targetSkill: 'Vowel harmony',
          misconceptionCategory: 'Wrong vowel-harmony ending',
          parallelExerciseId: 'exercise-1',
        },
      ],
    },
  ],
};

export class FakeLearningStateStore {
  readonly packs = signal<TopicPack[]>([structuredClone(learningPack)]);
  readonly learnerState = signal<LearnerState>(
    createEmptyLearnerState({ [learningPack.id]: learningPack.version }),
  );
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly ready = Promise.resolve();

  async initialize(): Promise<void> {
    this.loading.set(false);
  }

  async commit(update: (state: LearnerState) => LearnerState): Promise<void> {
    this.learnerState.set(update(this.learnerState()));
  }

  async replace(state: LearnerState): Promise<void> {
    this.learnerState.set(structuredClone(state));
  }
}

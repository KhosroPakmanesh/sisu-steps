import { describe, expect, it } from 'vitest';
import { compatibleBackupState } from '@/features/learning/data-management/backup-compatibility.policy';
import { TopicPack } from '@/features/learning/shared/content/content.models';
import { alignLearnerStateWithPacks } from '@/features/learning/shared/state/align-learner-state.policy';
import { migrateFoundationsPackSplit } from '@/features/learning/shared/state/migrate-foundations-split.policy';
import { LearnerBackup, LearnerState } from '@/shared/domain/learner-state.models';

const packs = [
  successorPack(
    'vowel-harmony-location-endings',
    'vowel-ending-review',
    'vowel-review',
    'vowel-harmony-basics',
  ),
  successorPack('kpt-singular-forms', 'kpt-nouns', 'kpt-focused', 'genitive-nouns'),
  successorPack(
    't-plural-agreement',
    'plural-agreement-review',
    'plural-review',
    'plural-sentences',
  ),
];

describe('foundations pack split migration', () => {
  it('remaps ordinary records and splits the former mixed review without losing answers', () => {
    const migrated = migrateFoundationsPackSplit(legacyState(), packs);

    expect(migrated.contentPackVersions).toEqual({
      'vowel-harmony-location-endings': '1.0.0',
      'kpt-singular-forms': '1.0.0',
      't-plural-agreement': '1.0.0',
    });
    expect(migrated.attempts).toHaveLength(4);
    expect(migrated.attempts.find((attempt) => attempt.id === 'ordinary')?.topicId).toBe(
      'kpt-singular-forms',
    );
    expect(migrated.attempts.filter((attempt) => attempt.id.startsWith('mixed:'))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          topicId: 'vowel-harmony-location-endings',
          testId: 'vowel-ending-review',
          correctCount: 1,
          total: 1,
          percentage: 100,
        }),
        expect.objectContaining({
          topicId: 'kpt-singular-forms',
          testId: 'kpt-nouns',
          incorrectCount: 1,
          total: 1,
          percentage: 0,
        }),
        expect.objectContaining({
          topicId: 't-plural-agreement',
          testId: 'plural-agreement-review',
          skippedCount: 1,
          total: 1,
          percentage: 0,
        }),
      ]),
    );
    expect(migrated.sessions.map((session) => session.topicId).sort()).toEqual([
      'kpt-singular-forms',
      'kpt-singular-forms',
      't-plural-agreement',
      'vowel-harmony-location-endings',
    ]);
    expect(migrated.learnerNotes).toEqual([
      expect.objectContaining({ topicId: 'kpt-singular-forms', text: 'Broad note' }),
      expect.objectContaining({
        topicId: 'vowel-harmony-location-endings',
        lessonId: 'vowel-harmony-basics',
      }),
    ]);
  });

  it('keeps migrated history through normal alignment and legacy backup restore checks', () => {
    const state = legacyState();
    const aligned = alignLearnerStateWithPacks(state, packs);
    expect(aligned.attempts).toHaveLength(4);
    expect(aligned.sessions).toHaveLength(4);
    expect(aligned.lessonCompletions).toHaveLength(2);
    expect(aligned.unresolvedMistakeIds).toEqual(['kpt-focused']);
    expect(aligned.correctionRecords).toEqual([
      expect.objectContaining({ exerciseId: 'kpt-focused', masteredAt: expect.any(String) }),
    ]);

    const backup: LearnerBackup = {
      backupType: 'finnish-exercise-book',
      backupVersion: 1,
      exportedAt: '2026-09-05T10:00:00.000Z',
      state,
    };
    expect(compatibleBackupState(backup, packs).attempts).toHaveLength(4);
  });
});

function legacyState(): LearnerState {
  const answer = (exerciseId: string, correct: boolean, skipped = false) => ({
    exerciseId,
    submittedAnswer: skipped ? '' : 'answer',
    correct,
    skipped,
    answeredAt: '2026-09-05T09:00:00.000Z',
  });
  return {
    schemaVersion: 1,
    contentPackVersions: { 'vowel-harmony-kpt-tplural': '6.1.0' },
    attempts: [
      {
        id: 'ordinary',
        mode: 'test',
        topicId: 'vowel-harmony-kpt-tplural',
        testId: 'kpt-nouns',
        title: 'KPT nouns',
        startedAt: '2026-09-05T08:00:00.000Z',
        completedAt: '2026-09-05T08:10:00.000Z',
        answers: [answer('kpt-focused', true)],
        correctCount: 1,
        total: 1,
        percentage: 100,
      },
      {
        id: 'mixed',
        mode: 'test',
        topicId: 'vowel-harmony-kpt-tplural',
        testId: 'foundations-review',
        title: 'Foundations review',
        startedAt: '2026-09-05T08:20:00.000Z',
        completedAt: '2026-09-05T08:30:00.000Z',
        answers: [
          answer('vowel-review', true),
          answer('kpt-focused', false),
          answer('plural-review', false, true),
        ],
        correctCount: 1,
        incorrectCount: 1,
        skippedCount: 1,
        total: 3,
        percentage: 33.3,
      },
    ],
    sessions: [
      {
        id: 'session',
        mode: 'test',
        topicId: 'vowel-harmony-kpt-tplural',
        testId: 'foundations-review',
        title: 'Foundations review',
        exerciseIds: ['vowel-review', 'kpt-focused', 'plural-review'],
        currentIndex: 1,
        answers: [answer('vowel-review', true)],
        startedAt: '2026-09-05T09:00:00.000Z',
        updatedAt: '2026-09-05T09:05:00.000Z',
      },
      {
        id: 'ordinary-session',
        mode: 'test',
        topicId: 'vowel-harmony-kpt-tplural',
        testId: 'kpt-nouns',
        title: 'KPT nouns',
        exerciseIds: ['kpt-focused'],
        currentIndex: 0,
        answers: [],
        startedAt: '2026-09-05T09:00:00.000Z',
        updatedAt: '2026-09-05T09:05:00.000Z',
      },
    ],
    unresolvedMistakeIds: ['kpt-focused'],
    lessonCompletions: [
      {
        lessonId: 'vowel-harmony-basics',
        lessonVersion: '1.0.0',
        completedAt: '2026-09-05T07:00:00.000Z',
      },
      {
        lessonId: 'plural-sentences',
        lessonVersion: '1.0.0',
        completedAt: '2026-09-05T07:10:00.000Z',
      },
    ],
    correctionRecords: [
      {
        exerciseId: 'kpt-focused',
        parallelExerciseId: 'kpt-focused',
        targetSkill: 'Skill',
        correctedAt: '2026-09-04T09:00:00.000Z',
        nextReviewAt: '2026-09-05T09:00:00.000Z',
        reviewStage: 2,
        reviewAttempts: 2,
        masteredAt: '2026-09-05T08:00:00.000Z',
      },
    ],
    learnerNotes: [
      {
        topicId: 'vowel-harmony-kpt-tplural',
        text: 'Broad note',
        updatedAt: '2026-09-05T07:20:00.000Z',
      },
      {
        topicId: 'vowel-harmony-kpt-tplural',
        lessonId: 'vowel-harmony-basics',
        text: 'Vowel note',
        updatedAt: '2026-09-05T07:30:00.000Z',
      },
    ],
  };
}

function successorPack(
  id: string,
  testId: string,
  exerciseId: string,
  lessonId: string,
): TopicPack {
  return {
    schemaVersion: 1,
    id,
    version: '1.0.0',
    title: id,
    level: '0 - A1.3',
    summary: id,
    objectives: ['Migrate safely.'],
    importantSkills: ['Skill'],
    sources: [],
    lessons: [
      {
        id: lessonId,
        version: '1.0.0',
        title: lessonId,
        summary: lessonId,
        stage: 'focused',
        targetSkills: ['Skill'],
        prerequisiteSkills: [],
        introducedVocabulary: [],
        objectives: ['Skill'],
        sections: [],
        examples: [],
        commonMistakes: ['Mistake'],
        practiceExercises: [],
      },
    ],
    tests: [
      {
        id: testId,
        title: testId,
        focus: 'Skill',
        stage: 'focused',
        targetSkills: ['Skill'],
        prerequisiteSkills: [],
        lessonIds: [lessonId],
        exercises: [
          {
            id: exerciseId,
            type: 'fill-blank',
            instruction: 'Answer.',
            prompt: 'Answer.',
            acceptedAnswers: ['answer'],
            explanation: 'Answer.',
            tags: [],
            requiredSkills: ['Skill'],
            vocabulary: [],
            targetSkill: 'Skill',
            misconceptionCategory: 'Skill: answer',
            parallelExerciseId: exerciseId,
          },
        ],
      },
    ],
  };
}

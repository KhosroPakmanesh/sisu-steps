import { describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { alignLearnerStateWithPacks } from '@/features/learning/shared/state/align-learner-state.policy';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { learningPack } from '@testing/helpers/unit/learning-content.fixture';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';
import { prepareBackupState } from '@/features/learning/learner-data/backup/backup-state-validation.policy';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';

describe('content-pack version alignment', () => {
  it.each([
    'singular-demonstrative-pronouns',
    'plural-demonstrative-pronouns',
    'plural-ownership-possessive-endings',
  ])(
    'resets the real merged catalog and rejects a backup containing removed pack %s',
    async (removedId) => {
      const source = await loadContentSource('content');
      const packs = source.packs as unknown as TopicPack[];
      const versions = Object.fromEntries(packs.map((pack) => [pack.id, pack.version]));
      const state = createEmptyLearnerState({ ...versions, [removedId]: '1.0.0' });
      const unchanged = packs.find((pack) => pack.id === 'affirmative-possession')!;
      state.attempts.push(
        completedAttempt('unchanged-pack-history', unchanged.id, unchanged.tests[0].id),
      );
      state.learnerNotes.push({
        topicId: unchanged.id,
        text: 'Reset under removed-ID policy.',
        updatedAt: '2026-10-05T00:00:00.000Z',
      });
      const original = structuredClone(state);
      const empty = createEmptyLearnerState(versions);
      expect(alignLearnerStateWithPacks(state, packs.map(topicPackToSummary))).toEqual(empty);
      expect(alignLearnerStateWithPacks(empty, packs.map(topicPackToSummary))).toEqual(empty);
      expect(() =>
        prepareBackupState(
          {
            backupType: 'finnish-exercise-book',
            backupVersion: 1,
            exportedAt: '2026-10-05T00:00:00.000Z',
            state,
          },
          packs,
        ),
      ).toThrow('no longer installed');
      expect(state).toEqual(original);
    },
  );
  it.each([
    ['demonstrative practice expansion', { 'demonstrative-pronouns': '1.0.0' }],
    [
      'nine Focused test expansions',
      {
        'personal-pronouns-affirmative-olla': '1.2.0',
        'negative-olla-statements': '1.1.0',
        'olla-questions-short-answers': '1.1.0',
        'negative-demonstrative-statements': '1.2.0',
        'affirmative-possession': '1.4.0',
        'negative-possession': '1.4.0',
        'possession-questions': '1.4.0',
        'negative-possession-questions': '1.4.0',
        'possessive-pronouns-endings': '2.1.0',
      },
    ],
    [
      'five earlier ownership revisions',
      {
        'affirmative-possession': '1.2.0',
        'negative-possession': '1.2.0',
        'possession-questions': '1.2.0',
        'negative-possession-questions': '1.2.0',
        'possessive-pronouns-endings': '1.3.0',
      },
    ],
    [
      'nine number-separated packs',
      {
        'personal-pronouns-affirmative-olla': '1.1.0',
        'negative-olla-statements': '1.0.0',
        'olla-questions-short-answers': '1.0.0',
        'negative-demonstrative-statements': '1.1.0',
        'affirmative-possession': '1.3.0',
        'negative-possession': '1.3.0',
        'possession-questions': '1.3.0',
        'negative-possession-questions': '1.3.0',
        'possessive-pronouns-endings': '2.0.0',
      },
    ],
  ] as Array<[string, Record<string, string>]>)(
    'resets only %s and preserves other progress and owned notes',
    async (_label, oldVersions) => {
      const source = await loadContentSource('content');
      const packs = source.packs as unknown as TopicPack[];
      const state = createEmptyLearnerState(
        Object.fromEntries(packs.map((pack) => [pack.id, oldVersions[pack.id] ?? pack.version])),
      );
      for (const pack of packs) {
        const exercise = pack.tests[0].exercises[0];
        state.attempts.push(completedAttempt(`${pack.id}-attempt`, pack.id, pack.tests[0].id));
        state.sessions.push({
          id: `${pack.id}-session`,
          mode: 'test',
          topicId: pack.id,
          testId: pack.tests[0].id,
          title: pack.title,
          exerciseIds: [exercise.id],
          currentIndex: 0,
          answers: [],
          startedAt: '2026-10-04T00:00:00.000Z',
          updatedAt: '2026-10-04T00:00:00.000Z',
        });
        state.unresolvedMistakeIds.push(exercise.id);
        state.correctionRecords.push({
          exerciseId: exercise.id,
          parallelExerciseId: exercise.parallelExerciseId!,
          targetSkill: exercise.targetSkill!,
          correctedAt: '2026-10-04T00:00:00.000Z',
          nextReviewAt: '2026-10-05T00:00:00.000Z',
          reviewStage: 0,
          reviewAttempts: 0,
        });
        state.lessonCompletions.push({
          lessonId: pack.lessons[0].id,
          lessonVersion: pack.lessons[0].version,
          completedAt: '2026-10-04T00:00:00.000Z',
        });
        state.learnerNotes.push({
          topicId: pack.id,
          lessonId: pack.lessons[0].id,
          text: `Keep ${pack.title}`,
          updatedAt: '2026-10-04T00:00:00.000Z',
        });
      }
      const aligned = alignLearnerStateWithPacks(state, packs.map(topicPackToSummary));
      const compatible = new Set(
        packs.filter((pack) => !oldVersions[pack.id]).map((pack) => pack.id),
      );
      expect(aligned.attempts).toEqual(
        state.attempts.filter((attempt) => compatible.has(attempt.topicId)),
      );
      expect(aligned.sessions).toEqual(
        state.sessions.filter((session) => compatible.has(session.topicId)),
      );
      expect(aligned.unresolvedMistakeIds).toHaveLength(compatible.size);
      expect(aligned.correctionRecords).toHaveLength(compatible.size);
      expect(aligned.lessonCompletions).toHaveLength(compatible.size);
      expect(aligned.learnerNotes).toEqual(state.learnerNotes);
      expect(aligned.contentPackVersions).toEqual(
        Object.fromEntries(packs.map((pack) => [pack.id, pack.version])),
      );
      expect(alignLearnerStateWithPacks(aligned, packs.map(topicPackToSummary))).toEqual(aligned);
      const beforeImport = structuredClone(state);
      const backup = {
        backupType: 'finnish-exercise-book' as const,
        backupVersion: 1 as const,
        exportedAt: '2026-10-05T00:00:00.000Z',
        state,
      };
      const prepared = prepareBackupState(backup, packs);
      expect(prepared.compatibility.changedPacks.map((pack) => pack.id).sort()).toEqual(
        Object.keys(oldVersions).sort(),
      );
      expect(prepared.state).toEqual(aligned);
      expect(state).toEqual(beforeImport);
      expect(prepareBackupState({ ...backup, state: aligned }, packs).state).toEqual(aligned);
    },
  );

  it('resets only the rewritten real owner pack and retains other progress and owned notes', async () => {
    const source = await loadContentSource('content');
    const packs = source.packs as unknown as TopicPack[];
    const revised = packs.find((pack) => pack.id === 'possessive-pronouns-endings')!;
    const unchanged = packs.find((pack) => pack.id === 'affirmative-possession')!;
    const state = createEmptyLearnerState(
      Object.fromEntries(
        packs.map((pack) => [pack.id, pack.id === revised.id ? '1.2.0' : pack.version]),
      ),
    );
    state.attempts = [
      completedAttempt('old-ownership', revised.id, revised.tests[0].id),
      completedAttempt('kept-possession', unchanged.id, unchanged.tests[0].id),
    ];
    state.unresolvedMistakeIds = [
      revised.tests[0].exercises[0].id,
      unchanged.tests[0].exercises[0].id,
    ];
    state.lessonCompletions = [
      {
        lessonId: revised.lessons[0].id,
        lessonVersion: '1.1.2',
        completedAt: '2026-10-04T00:00:00.000Z',
      },
      {
        lessonId: unchanged.lessons[0].id,
        lessonVersion: unchanged.lessons[0].version,
        completedAt: '2026-10-04T00:00:00.000Z',
      },
    ];
    state.learnerNotes = [
      {
        topicId: revised.id,
        lessonId: revised.lessons[0].id,
        text: 'Keep my owner-form note.',
        updatedAt: '2026-10-04T00:00:00.000Z',
      },
    ];
    const aligned = alignLearnerStateWithPacks(state, packs.map(topicPackToSummary));
    expect(revised.version).toBe('2.2.0');
    expect(aligned.attempts).toEqual([state.attempts[1]]);
    expect(aligned.unresolvedMistakeIds).toEqual([state.unresolvedMistakeIds[1]]);
    expect(aligned.lessonCompletions).toEqual([state.lessonCompletions[1]]);
    expect(aligned.learnerNotes).toEqual(state.learnerNotes);
    expect(aligned.contentPackVersions[revised.id]).toBe('2.2.0');
    expect(alignLearnerStateWithPacks(aligned, packs.map(topicPackToSummary))).toEqual(aligned);
  });

  it('resets all learner data when a stored pack is no longer supported', () => {
    const oldState = createEmptyLearnerState({
      topic: '1.0.0',
      'removed-topic': '1.0.0',
    });
    oldState.attempts = [completedAttempt('current-attempt', 'topic', 'test-1')];
    oldState.unresolvedMistakeIds = ['exercise-1'];
    oldState.learnerNotes = [
      {
        topicId: 'topic',
        text: 'This current-topic data is intentionally reset too.',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
    ];

    expect(alignLearnerStateWithPacks(oldState, [topicPackToSummary(learningPack)])).toEqual(
      createEmptyLearnerState({ topic: '1.0.0' }),
    );
  });

  it('preserves compatible data and records newly installed packs', () => {
    const state = createEmptyLearnerState({ topic: '1.0.0' });
    state.unresolvedMistakeIds = ['exercise-1'];
    const secondPack = renamedPack('topic-two', '2.0.0');

    const aligned = alignLearnerStateWithPacks(
      state,
      [learningPack, secondPack].map(topicPackToSummary),
    );
    expect(aligned.unresolvedMistakeIds).toEqual(['exercise-1']);
    expect(aligned.contentPackVersions).toEqual({ topic: '1.0.0', 'topic-two': '2.0.0' });
  });

  it('clears only the topic whose installed version changed', () => {
    const secondPack = renamedPack('topic-two', '2.0.0');
    const state = createEmptyLearnerState({ topic: '0.9.0', 'topic-two': '2.0.0' });
    state.unresolvedMistakeIds = ['exercise-1', 'topic-two-exercise-1'];
    state.attempts = [
      completedAttempt('old-topic-attempt', 'topic', 'test-1'),
      completedAttempt('other-topic-attempt', 'topic-two', 'topic-two-test-1'),
    ];
    state.learnerNotes = [
      {
        topicId: 'topic',
        text: 'Keep this topic note.',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
    ];

    const aligned = alignLearnerStateWithPacks(
      state,
      [learningPack, secondPack].map(topicPackToSummary),
    );
    expect(aligned.attempts.map((attempt) => attempt.id)).toEqual(['other-topic-attempt']);
    expect(aligned.unresolvedMistakeIds).toEqual(['topic-two-exercise-1']);
    expect(aligned.learnerNotes.map((note) => note.text)).toEqual(['Keep this topic note.']);
  });

  it('discards outdated lesson marks while retaining scores, sessions, mistakes, mastery and notes', () => {
    const revised = structuredClone(learningPack);
    revised.lessons[0].version = '1.0.1';
    const unchanged = renamedPack('topic-two', '2.0.0');
    const state = createEmptyLearnerState({
      topic: revised.version,
      'topic-two': unchanged.version,
    });
    state.lessonCompletions = [
      {
        lessonId: revised.lessons[0].id,
        lessonVersion: '1.0.0',
        completedAt: '2026-10-01T00:00:00.000Z',
      },
      {
        lessonId: unchanged.lessons[0].id,
        lessonVersion: unchanged.lessons[0].version,
        completedAt: '2026-10-01T00:00:00.000Z',
      },
    ];
    state.attempts = [completedAttempt('retained-attempt', revised.id, revised.tests[0].id)];
    state.unresolvedMistakeIds = [revised.tests[0].exercises[0].id];
    state.sessions = [
      {
        id: 'retained-session',
        mode: 'test',
        topicId: revised.id,
        testId: revised.tests[0].id,
        title: 'Retained study',
        exerciseIds: revised.tests[0].exercises.map((exercise) => exercise.id),
        currentIndex: 0,
        answers: [],
        startedAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
      },
    ];
    state.correctionRecords = [
      {
        exerciseId: revised.tests[0].exercises[0].id,
        parallelExerciseId: revised.tests[0].exercises[0].parallelExerciseId!,
        targetSkill: revised.tests[0].targetSkills[0],
        correctedAt: '2026-10-01T00:00:00.000Z',
        nextReviewAt: '2026-10-02T00:00:00.000Z',
        reviewStage: 2,
        reviewAttempts: 3,
        masteredAt: '2026-10-03T00:00:00.000Z',
      },
    ];
    state.learnerNotes = [
      {
        topicId: revised.id,
        lessonId: revised.lessons[0].id,
        text: 'Keep my lesson note.',
        updatedAt: '2026-10-01T00:00:00.000Z',
      },
    ];
    const aligned = alignLearnerStateWithPacks(state, [revised, unchanged].map(topicPackToSummary));
    expect(aligned.lessonCompletions).toEqual([state.lessonCompletions[1]]);
    expect(aligned.attempts).toEqual(state.attempts);
    expect(aligned.sessions).toEqual(state.sessions);
    expect(aligned.unresolvedMistakeIds).toEqual(state.unresolvedMistakeIds);
    expect(aligned.correctionRecords).toEqual(state.correctionRecords);
    expect(aligned.learnerNotes).toEqual(state.learnerNotes);
    expect(aligned.contentPackVersions).toEqual(state.contentPackVersions);
    expect(
      alignLearnerStateWithPacks(aligned, [revised, unchanged].map(topicPackToSummary)),
    ).toEqual(aligned);
  });

  it('clears the three revised demonstrative packs while keeping an unchanged pack and notes', () => {
    const changedIds = [
      'demonstrative-pronouns',
      'negative-demonstrative-statements',
      'demonstrative-questions',
    ];
    const unchangedId = 'personal-pronouns-affirmative-olla';
    const packs = [
      ...changedIds.map((id) => renamedPack(id, '1.1.0')),
      renamedPack(unchangedId, '1.0.0'),
    ];
    const state = createEmptyLearnerState(
      Object.fromEntries(packs.map((pack) => [pack.id, '1.0.0'])),
    );
    state.attempts = packs.map((pack) =>
      completedAttempt(`${pack.id}-attempt`, pack.id, pack.tests[0].id),
    );
    state.learnerNotes = packs.map((pack) => ({
      topicId: pack.id,
      text: `${pack.id} note`,
      updatedAt: '2026-09-30T00:00:00.000Z',
    }));

    const aligned = alignLearnerStateWithPacks(state, packs.map(topicPackToSummary));

    expect(aligned.attempts.map((attempt) => attempt.id)).toEqual([`${unchangedId}-attempt`]);
    expect(aligned.learnerNotes).toHaveLength(4);
    expect(aligned.contentPackVersions).toEqual(
      Object.fromEntries(packs.map((pack) => [pack.id, pack.version])),
    );
  });
});

function renamedPack(id: string, version: string): TopicPack {
  const pack = structuredClone(learningPack);
  pack.id = id;
  pack.version = version;
  pack.lessons[0].id = `${id}-lesson`;
  pack.lessons[0].practiceExercises = pack.lessons[0].practiceExercises.map((exercise, index) => ({
    ...exercise,
    id: `${id}-practice-${index + 1}`,
  }));
  pack.tests = pack.tests.map((test, testIndex) => ({
    ...test,
    id: `${id}-test-${testIndex + 1}`,
    lessonIds: [`${id}-lesson`],
    exercises: test.exercises.map((exercise, exerciseIndex) => ({
      ...exercise,
      id: `${id}-exercise-${testIndex + exerciseIndex + 1}`,
      parallelExerciseId: `${id}-exercise-${testIndex === 0 ? 2 : 1}`,
    })),
  }));
  return pack;
}

function completedAttempt(id: string, topicId: string, testId: string) {
  return {
    id,
    mode: 'test' as const,
    topicId,
    testId,
    title: 'Attempt',
    startedAt: '2026-08-18T00:00:00.000Z',
    completedAt: '2026-08-18T00:01:00.000Z',
    answers: [],
    correctCount: 1,
    incorrectCount: 0,
    skippedCount: 0,
    total: 1,
    percentage: 100,
  };
}

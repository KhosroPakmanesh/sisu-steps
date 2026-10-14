import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';
import { alignLearnerStateWithPacks } from '@/features/learning/shared/state/align-learner-state.policy';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { LearnerState } from '@/features/learning/shared/state/learner-state.models';
import { prepareBackupState } from '@/features/learning/learner-data/backup/backup-state-validation.policy';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';

const date = '2026-10-14T12:00:00.000Z';

describe('four-pack Partitive Forms content ownership', () => {
  let packs: TopicPack[];
  beforeAll(async () => {
    packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
  });

  const oldState = () =>
    createEmptyLearnerState({
      ...Object.fromEntries(
        packs
          .filter((pack) => !pack.id.startsWith('partitive-forms-'))
          .map((pack) => [pack.id, pack.version]),
      ),
      'partitive-forms': '1.1.0',
    });
  const backup = (state: LearnerState) => ({
    backupType: 'finnish-exercise-book' as const,
    backupVersion: 1 as const,
    exportedAt: date,
    state,
  });
  const addAttempt = (state: LearnerState, topicId: string, testId: string) => {
    state.attempts.push({
      id: topicId + '-old-attempt',
      mode: 'test',
      topicId,
      testId,
      title: 'Saved test',
      startedAt: date,
      completedAt: date,
      answers: [],
      correctCount: 0,
      incorrectCount: 0,
      skippedCount: 0,
      total: 0,
      percentage: 0,
    });
  };

  it('clears old Forms attempts and moved notes while retaining other-pack data and moved question records', () => {
    const state = oldState();
    const retained = packs.find((pack) => pack.id === 'partitive-forms')!;
    const moved = packs.find((pack) => pack.id === 'partitive-forms-plural-ia-ja')!;
    const unchanged = packs.find((pack) => pack.id === 'partitive-quantities')!;
    addAttempt(state, retained.id, moved.tests[0].id);
    addAttempt(state, unchanged.id, unchanged.tests[0].id);
    state.sessions.push({
      id: 'old-forms-session',
      mode: 'test',
      topicId: retained.id,
      testId: moved.tests[0].id,
      title: 'Saved test',
      exerciseIds: moved.tests[0].exercises.map((item) => item.id),
      currentIndex: 0,
      answers: [],
      startedAt: date,
      updatedAt: date,
    });
    const retainedExercise = retained.tests[0].exercises[0];
    const movedExercise = moved.tests[0].exercises[0];
    const otherExercise = unchanged.tests[0].exercises[0];
    state.unresolvedMistakeIds = [retainedExercise.id, movedExercise.id, otherExercise.id];
    state.correctionRecords.push({
      exerciseId: movedExercise.id,
      parallelExerciseId: movedExercise.parallelExerciseId!,
      targetSkill: movedExercise.targetSkill!,
      correctedAt: date,
      nextReviewAt: date,
      reviewStage: 0,
      reviewAttempts: 0,
    });
    state.lessonCompletions = [
      {
        lessonId: retained.lessons[0].id,
        lessonVersion: retained.lessons[0].version,
        completedAt: date,
      },
      { lessonId: moved.lessons[0].id, lessonVersion: '1.0.0', completedAt: date },
      {
        lessonId: unchanged.lessons[0].id,
        lessonVersion: unchanged.lessons[0].version,
        completedAt: date,
      },
    ];
    state.learnerNotes = [
      { topicId: retained.id, text: 'Keep topic note.', updatedAt: date },
      {
        topicId: retained.id,
        lessonId: retained.lessons[0].id,
        text: 'Keep owned note.',
        updatedAt: date,
      },
      {
        topicId: retained.id,
        lessonId: moved.lessons[0].id,
        text: 'Discard moved-owner note.',
        updatedAt: date,
      },
      { topicId: unchanged.id, text: 'Keep other note.', updatedAt: date },
    ];
    const original = structuredClone(state);
    const aligned = alignLearnerStateWithPacks(state, packs.map(topicPackToSummary));
    expect(aligned.attempts).toEqual([state.attempts[1]]);
    expect(aligned.sessions).toEqual([]);
    expect(aligned.unresolvedMistakeIds).toEqual([movedExercise.id, otherExercise.id]);
    expect(aligned.correctionRecords).toEqual(state.correctionRecords);
    expect(aligned.lessonCompletions).toEqual([state.lessonCompletions[2]]);
    expect(aligned.learnerNotes).toEqual([
      state.learnerNotes[0],
      state.learnerNotes[1],
      state.learnerNotes[3],
    ]);
    expect(Object.keys(aligned.contentPackVersions)).toHaveLength(22);
    expect(alignLearnerStateWithPacks(aligned, packs.map(topicPackToSummary))).toEqual(aligned);
    expect(prepareBackupState(backup(aligned), packs).state).toEqual(aligned);
    expect(state).toEqual(original);
  });

  it('rejects older backups containing moved-item progress without the newly owning pack version', () => {
    const state = oldState();
    const moved = packs.find((pack) => pack.id === 'partitive-forms-plural-ita')!;
    state.unresolvedMistakeIds.push(moved.tests[0].exercises[0].id);
    const original = structuredClone(state);
    expect(() => prepareBackupState(backup(state), packs)).toThrow('does not record');
    expect(state).toEqual(original);
  });

  it('uses normal scoped discard for an old backup with only retained and unrelated pack progress', () => {
    const state = oldState();
    const retained = packs.find((pack) => pack.id === 'partitive-forms')!;
    const unchanged = packs.find((pack) => pack.id === 'partitive-quantities')!;
    addAttempt(state, retained.id, retained.tests[0].id);
    addAttempt(state, unchanged.id, unchanged.tests[0].id);
    const prepared = prepareBackupState(backup(state), packs);
    expect(prepared.compatibility.changedPacks.map((pack) => pack.id)).toEqual([retained.id]);
    expect(prepared.compatibility.addedPacks).toHaveLength(3);
    expect(prepared.state.attempts).toEqual([state.attempts[1]]);
    expect(prepareBackupState(backup(prepared.state), packs).state).toEqual(prepared.state);
  });
});

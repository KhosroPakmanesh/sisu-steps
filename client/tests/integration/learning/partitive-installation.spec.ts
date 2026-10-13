import { describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';
import { alignLearnerStateWithPacks } from '@/features/learning/shared/state/align-learner-state.policy';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { prepareBackupState } from '@/features/learning/learner-data/backup/backup-state-validation.policy';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';

describe('installing the partitive family', () => {
  it('preserves all fourteen existing packs’ study data and backup data', async () => {
    const packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
    const previous = packs.filter((p) => !p.id.startsWith('partitive-'));
    expect(previous).toHaveLength(14);
    const state = createEmptyLearnerState(
      Object.fromEntries(previous.map((p) => [p.id, p.version])),
    );
    const date = '2026-10-11T10:00:00.000Z';
    for (const pack of previous) {
      const test = pack.tests[0];
      const exercise = test.exercises[0];
      state.attempts.push({
        id: pack.id + '-attempt',
        mode: 'test',
        topicId: pack.id,
        testId: test.id,
        title: test.title,
        startedAt: date,
        completedAt: date,
        answers: [
          {
            exerciseId: exercise.id,
            submittedAnswer: exercise.acceptedAnswers[0],
            correct: true,
            skipped: false,
            answeredAt: date,
          },
        ],
        correctCount: 1,
        incorrectCount: 0,
        skippedCount: 0,
        total: 1,
        percentage: 100,
      });
      state.sessions.push({
        id: pack.id + '-session',
        mode: 'test',
        topicId: pack.id,
        testId: test.id,
        title: test.title,
        exerciseIds: test.exercises.map((e) => e.id),
        currentIndex: 0,
        answers: [],
        startedAt: date,
        updatedAt: date,
      });
      state.unresolvedMistakeIds.push(exercise.id);
      state.correctionRecords.push({
        exerciseId: exercise.id,
        parallelExerciseId: exercise.parallelExerciseId!,
        targetSkill: exercise.targetSkill!,
        correctedAt: date,
        nextReviewAt: date,
        reviewStage: 0,
        reviewAttempts: 0,
      });
      state.lessonCompletions.push({
        lessonId: pack.lessons[0].id,
        lessonVersion: pack.lessons[0].version,
        completedAt: date,
      });
      state.learnerNotes.push({
        topicId: pack.id,
        lessonId: pack.lessons[0].id,
        text: 'Preserve my note.',
        updatedAt: date,
      });
    }
    const expected = {
      ...state,
      contentPackVersions: Object.fromEntries(packs.map((p) => [p.id, p.version])),
    };
    expect(alignLearnerStateWithPacks(state, packs.map(topicPackToSummary))).toEqual(expected);
    const prepared = prepareBackupState(
      { backupType: 'finnish-exercise-book', backupVersion: 1, exportedAt: date, state },
      packs,
    );
    expect(prepared.state).toEqual(expected);
    expect(prepared.compatibility.changedPacks).toEqual([]);
    expect(Object.keys(state.contentPackVersions)).toHaveLength(14);
  });
});

import { describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { QUESTION_TARGETS } from '@/features/learning/shared/content/validation/question-family-targets';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';
import { alignLearnerStateWithPacks } from '@/features/learning/shared/state/align-learner-state.policy';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { prepareBackupState } from '@/features/learning/learner-data/backup/backup-state-validation.policy';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';

describe('installing the Question words and answers family', () => {
  it.each(['installation', 'correction'])(
    'preserves all thirty existing packs during %s',
    async (scenario) => {
      const packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
      const previous =
        scenario === 'installation' ? packs.filter((p) => !QUESTION_TARGETS[p.id]) : packs;
      expect(previous).toHaveLength(scenario === 'installation' ? 30 : 37);
      const state = createEmptyLearnerState(
        Object.fromEntries(
          previous.map((p) => [p.id, QUESTION_TARGETS[p.id] ? '1.0.0' : p.version]),
        ),
      );
      const date = '2026-10-28T10:00:00.000Z';
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
      const changedExerciseIds = new Set(
        packs
          .filter((p) => QUESTION_TARGETS[p.id])
          .flatMap((p) => p.tests.flatMap((t) => t.exercises.map((e) => e.id))),
      );
      const changedLessonIds = new Set(
        packs.filter((p) => QUESTION_TARGETS[p.id]).flatMap((p) => p.lessons.map((l) => l.id)),
      );
      const expected = {
        ...state,
        contentPackVersions: Object.fromEntries(packs.map((p) => [p.id, p.version])),
        attempts: state.attempts.filter((a) => !QUESTION_TARGETS[a.topicId]),
        sessions: state.sessions.filter((s) => !QUESTION_TARGETS[s.topicId]),
        unresolvedMistakeIds: state.unresolvedMistakeIds.filter(
          (id) => !changedExerciseIds.has(id),
        ),
        correctionRecords: state.correctionRecords.filter(
          (r) => !changedExerciseIds.has(r.exerciseId),
        ),
        lessonCompletions: state.lessonCompletions.filter((c) => !changedLessonIds.has(c.lessonId)),
      };
      expect(alignLearnerStateWithPacks(state, packs.map(topicPackToSummary))).toEqual(expected);
      const prepared = prepareBackupState(
        { backupType: 'finnish-exercise-book', backupVersion: 1, exportedAt: date, state },
        packs,
      );
      expect(prepared.state).toEqual(expected);
      expect(prepared.compatibility.changedPacks.map((pack) => pack.id).sort()).toEqual(
        scenario === 'installation' ? [] : Object.keys(QUESTION_TARGETS).sort(),
      );
      expect(prepared.state.learnerNotes).toEqual(state.learnerNotes);
      expect(expected.attempts).toHaveLength(30);
      expect(Object.keys(state.contentPackVersions)).toHaveLength(
        scenario === 'installation' ? 30 : 37,
      );
    },
  );
});

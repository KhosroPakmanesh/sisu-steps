import { LearnerState } from '../shared/state/learner-state.models';
import { LearnerBackup } from './backup.models';
import { TopicPack } from '../shared/content/content.models';
import { findExercise } from '../shared/content/content.queries';

export function validatedBackupState(
  backup: LearnerBackup,
  installedPacks: TopicPack[],
): LearnerState {
  validateVersions(backup.state.contentPackVersions, installedPacks);
  const referencedExerciseIds = collectExerciseReferences(backup.state);
  validateExerciseReferences(referencedExerciseIds, installedPacks);
  validateTopicAndTestReferences(backup.state, installedPacks);
  validateCorrectionReferences(backup.state, installedPacks);
  validateLessonReferences(backup.state, installedPacks);
  validateNoteReferences(backup.state, installedPacks);
  return backup.state;
}

function validateVersions(versions: Record<string, string>, packs: TopicPack[]): void {
  if (
    Object.keys(versions).length !== packs.length ||
    packs.some((pack) => versions[pack.id] !== pack.version)
  ) {
    throw new Error('This backup belongs to a different exercise-pack version.');
  }
}

function collectExerciseReferences(state: LearnerState): string[] {
  return [
    ...state.unresolvedMistakeIds,
    ...state.sessions.flatMap((session) => session.exerciseIds),
    ...state.sessions.flatMap((session) => session.answers.map((answer) => answer.exerciseId)),
    ...state.attempts.flatMap((attempt) => attempt.answers.map((answer) => answer.exerciseId)),
    ...state.attempts.flatMap((attempt) => attempt.sourceExerciseIds ?? []),
    ...state.sessions.flatMap((session) => session.sourceExerciseIds ?? []),
    ...state.correctionRecords.flatMap((record) => [record.exerciseId, record.parallelExerciseId]),
  ];
}

function validateExerciseReferences(references: string[], packs: TopicPack[]): void {
  const known = new Set(
    packs.flatMap((pack) =>
      pack.tests.flatMap((test) => test.exercises.map((exercise) => exercise.id)),
    ),
  );
  if (references.some((id) => !known.has(id))) {
    throw new Error('This backup refers to exercises that are not installed in this app.');
  }
}

function validateTopicAndTestReferences(state: LearnerState, packs: TopicPack[]): void {
  const references = [
    ...state.attempts.map((attempt) => ({ topicId: attempt.topicId, testId: attempt.testId })),
    ...state.sessions.map((session) => ({ topicId: session.topicId, testId: session.testId })),
  ];
  if (
    references.some(({ topicId, testId }) => {
      const pack = packs.find((candidate) => candidate.id === topicId);
      return !pack || (testId !== undefined && !pack.tests.some((test) => test.id === testId));
    })
  ) {
    throw new Error('This backup refers to topics or tests that are not installed in this app.');
  }
}

function validateCorrectionReferences(state: LearnerState, packs: TopicPack[]): void {
  if (
    state.correctionRecords.some((record) => {
      const exercise = findExercise(packs, record.exerciseId);
      return (
        exercise?.parallelExerciseId !== record.parallelExerciseId ||
        exercise.targetSkill !== record.targetSkill
      );
    })
  ) {
    throw new Error('This backup contains incompatible correction and mastery data.');
  }
}

function validateLessonReferences(state: LearnerState, packs: TopicPack[]): void {
  const known = new Set(packs.flatMap((pack) => pack.lessons.map((lesson) => lesson.id)));
  if (state.lessonCompletions.some((item) => !known.has(item.lessonId))) {
    throw new Error('This backup refers to lessons that are not installed in this app.');
  }
}

function validateNoteReferences(state: LearnerState, packs: TopicPack[]): void {
  if (
    state.learnerNotes.some((note) => {
      const pack = packs.find((candidate) => candidate.id === note.topicId);
      return (
        !pack || (!!note.lessonId && !pack.lessons.some((lesson) => lesson.id === note.lessonId))
      );
    })
  ) {
    throw new Error('This backup refers to note topics or lessons that are not installed.');
  }
}

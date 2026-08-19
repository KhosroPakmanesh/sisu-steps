import { LearnerBackup, LearnerState } from '@/shared/domain/learner-state.models';
import { TopicPack } from '../shared/content/content.models';
import { findExercise } from '../shared/content/content.queries';
import {
  alignLearnerStateWithPacks,
  learnerStateHasProgress,
} from '../shared/state/align-learner-state.policy';

export function compatibleBackupState(
  backup: LearnerBackup,
  installedPacks: TopicPack[],
): LearnerState {
  const backupVersions = resolveBackupVersions(backup.state, installedPacks);
  validateVersions(backupVersions, installedPacks);
  const referencedExerciseIds = collectExerciseReferences(backup.state);
  validateExerciseReferences(referencedExerciseIds, installedPacks);
  validateTopicAndTestReferences(backup.state, installedPacks);
  validateCorrectionReferences(backup.state, installedPacks);
  validateLessonReferences(backup.state, installedPacks);
  validateReferencedTopicVersions(
    backup.state,
    backupVersions,
    installedPacks,
    referencedExerciseIds,
  );
  return alignLearnerStateWithPacks(
    {
      ...backup.state,
      contentPackVersions: backupVersions,
      lessonCompletions: backup.state.lessonCompletions ?? [],
      correctionRecords: backup.state.correctionRecords ?? [],
    },
    installedPacks,
  );
}

function resolveBackupVersions(
  state: LearnerState,
  packs: TopicPack[],
): Record<string, string> | undefined {
  if (state.contentPackVersions) return state.contentPackVersions;
  if (state.contentPackVersion) {
    const firstPack = packs[0];
    if (!firstPack || firstPack.version !== state.contentPackVersion) {
      throw new Error('This backup belongs to a different exercise-pack version.');
    }
    return { [firstPack.id]: state.contentPackVersion };
  }
  if (learnerStateHasProgress(state)) {
    throw new Error('This backup does not identify the exercise-pack versions it uses.');
  }
  return undefined;
}

function validateVersions(versions: Record<string, string> | undefined, packs: TopicPack[]): void {
  const installed = Object.fromEntries(packs.map((pack) => [pack.id, pack.version]));
  if (
    Object.entries(versions ?? {}).some(
      ([topicId, version]) => installed[topicId] === undefined || installed[topicId] !== version,
    )
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
    ...(state.correctionRecords ?? []).flatMap((record) => [
      record.exerciseId,
      record.parallelExerciseId,
    ]),
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
    (state.correctionRecords ?? []).some((record) => {
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
  if ((state.lessonCompletions ?? []).some((item) => !known.has(item.lessonId))) {
    throw new Error('This backup refers to lessons that are not installed in this app.');
  }
}

function validateReferencedTopicVersions(
  state: LearnerState,
  versions: Record<string, string> | undefined,
  packs: TopicPack[],
  exerciseReferences: string[],
): void {
  const topicIds = new Set([
    ...state.attempts.map((attempt) => attempt.topicId),
    ...state.sessions.map((session) => session.topicId),
  ]);
  for (const pack of packs) {
    const exerciseIds = new Set(
      pack.tests.flatMap((test) => test.exercises.map((exercise) => exercise.id)),
    );
    const lessonIds = new Set(pack.lessons.map((lesson) => lesson.id));
    if (
      exerciseReferences.some((id) => exerciseIds.has(id)) ||
      (state.lessonCompletions ?? []).some((item) => lessonIds.has(item.lessonId))
    ) {
      topicIds.add(pack.id);
    }
  }
  if ([...topicIds].some((topicId) => !versions?.[topicId])) {
    throw new Error('This backup does not identify the exercise-pack versions it uses.');
  }
}

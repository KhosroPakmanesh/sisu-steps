import { LearnerState } from '@/shared/domain/learner-state.models';
import { TopicPack } from '../content/content.models';
import { createEmptyLearnerState } from './learner-state.factory';

function hasLearnerProgress(state: LearnerState): boolean {
  return (
    state.attempts.length > 0 ||
    state.sessions.length > 0 ||
    state.unresolvedMistakeIds.length > 0 ||
    (state.lessonCompletions?.length ?? 0) > 0 ||
    (state.correctionRecords?.length ?? 0) > 0 ||
    (state.learnerNotes?.length ?? 0) > 0
  );
}

function clearPackData(state: LearnerState, pack: TopicPack): LearnerState {
  const exerciseIds = new Set(
    pack.tests.flatMap((test) => test.exercises.map((exercise) => exercise.id)),
  );
  const lessonIds = new Set(pack.lessons.map((lesson) => lesson.id));
  return {
    ...state,
    attempts: state.attempts.filter((attempt) => attempt.topicId !== pack.id),
    sessions: state.sessions.filter((session) => session.topicId !== pack.id),
    unresolvedMistakeIds: state.unresolvedMistakeIds.filter((id) => !exerciseIds.has(id)),
    lessonCompletions: (state.lessonCompletions ?? []).filter(
      (completion) => !lessonIds.has(completion.lessonId),
    ),
    correctionRecords: (state.correctionRecords ?? []).filter(
      (record) => !exerciseIds.has(record.exerciseId),
    ),
  };
}

export function alignLearnerStateWithPacks(state: LearnerState, packs: TopicPack[]): LearnerState {
  const installedVersions = Object.fromEntries(packs.map((pack) => [pack.id, pack.version]));
  let next = structuredClone(state);
  let storedVersions = state.contentPackVersions;

  if (!storedVersions) {
    const firstPack = packs[0];
    if (state.contentPackVersion && firstPack?.version === state.contentPackVersion) {
      storedVersions = { [firstPack.id]: state.contentPackVersion };
    } else if (hasLearnerProgress(state)) {
      next = createEmptyLearnerState(installedVersions);
      storedVersions = {};
    } else storedVersions = {};
  }

  for (const pack of packs) {
    const storedVersion = storedVersions[pack.id];
    if (storedVersion && storedVersion !== pack.version) next = clearPackData(next, pack);
  }

  const installedTopicIds = new Set(packs.map((pack) => pack.id));
  const installedExerciseIds = new Set(
    packs.flatMap((pack) =>
      pack.tests.flatMap((test) => test.exercises.map((exercise) => exercise.id)),
    ),
  );
  const installedLessonIds = new Set(
    packs.flatMap((pack) => pack.lessons.map((lesson) => lesson.id)),
  );
  const withoutLegacyVersion = { ...next };
  delete withoutLegacyVersion.contentPackVersion;
  return {
    ...withoutLegacyVersion,
    contentPackVersions: installedVersions,
    attempts: next.attempts.filter((attempt) => installedTopicIds.has(attempt.topicId)),
    sessions: next.sessions.filter((session) => installedTopicIds.has(session.topicId)),
    unresolvedMistakeIds: next.unresolvedMistakeIds.filter((id) => installedExerciseIds.has(id)),
    lessonCompletions: (next.lessonCompletions ?? []).filter((completion) =>
      installedLessonIds.has(completion.lessonId),
    ),
    correctionRecords: (next.correctionRecords ?? []).filter(
      (record) =>
        installedExerciseIds.has(record.exerciseId) &&
        installedExerciseIds.has(record.parallelExerciseId),
    ),
    learnerNotes: (next.learnerNotes ?? []).filter((note) => {
      const pack = packs.find((candidate) => candidate.id === note.topicId);
      return (
        !!pack && (!note.lessonId || pack.lessons.some((lesson) => lesson.id === note.lessonId))
      );
    }),
  };
}

export function learnerStateHasProgress(state: LearnerState): boolean {
  return hasLearnerProgress(state);
}

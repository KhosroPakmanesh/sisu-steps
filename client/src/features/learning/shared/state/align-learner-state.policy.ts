import { LearnerState } from './learner-state.models';
import { TopicPackSummary } from '../content/content.models';
import { createEmptyLearnerState } from './learner-state.factory';

function clearPackData(state: LearnerState, pack: TopicPackSummary): LearnerState {
  const exerciseIds = new Set(pack.tests.flatMap((test) => test.exerciseIds));
  const lessonIds = new Set(pack.lessons.map((lesson) => lesson.id));
  return {
    ...state,
    attempts: state.attempts.filter((attempt) => attempt.topicId !== pack.id),
    sessions: state.sessions.filter((session) => session.topicId !== pack.id),
    unresolvedMistakeIds: state.unresolvedMistakeIds.filter((id) => !exerciseIds.has(id)),
    lessonCompletions: state.lessonCompletions.filter(
      (completion) => !lessonIds.has(completion.lessonId),
    ),
    correctionRecords: state.correctionRecords.filter(
      (record) => !exerciseIds.has(record.exerciseId),
    ),
  };
}

export function alignLearnerStateWithPacks(
  state: LearnerState,
  packs: TopicPackSummary[],
): LearnerState {
  const installedVersions = Object.fromEntries(packs.map((pack) => [pack.id, pack.version]));
  const installedTopicIds = new Set(packs.map((pack) => pack.id));
  if (Object.keys(state.contentPackVersions).some((topicId) => !installedTopicIds.has(topicId))) {
    return createEmptyLearnerState(installedVersions);
  }
  let next = structuredClone(state);

  for (const pack of packs) {
    const storedVersion = state.contentPackVersions[pack.id];
    if (storedVersion && storedVersion !== pack.version) next = clearPackData(next, pack);
  }

  const installedExerciseIds = new Set(
    packs.flatMap((pack) => pack.tests.flatMap((test) => test.exerciseIds)),
  );
  const installedLessonIds = new Set(
    packs.flatMap((pack) => pack.lessons.map((lesson) => lesson.id)),
  );
  return {
    ...next,
    contentPackVersions: installedVersions,
    attempts: next.attempts.filter((attempt) => installedTopicIds.has(attempt.topicId)),
    sessions: next.sessions.filter((session) => installedTopicIds.has(session.topicId)),
    unresolvedMistakeIds: next.unresolvedMistakeIds.filter((id) => installedExerciseIds.has(id)),
    lessonCompletions: next.lessonCompletions.filter((completion) =>
      installedLessonIds.has(completion.lessonId),
    ),
    correctionRecords: next.correctionRecords.filter(
      (record) =>
        installedExerciseIds.has(record.exerciseId) &&
        installedExerciseIds.has(record.parallelExerciseId),
    ),
    learnerNotes: next.learnerNotes.filter((note) => {
      const pack = packs.find((candidate) => candidate.id === note.topicId);
      return (
        !!pack && (!note.lessonId || pack.lessons.some((lesson) => lesson.id === note.lessonId))
      );
    }),
  };
}

import { LearnerState } from '../../shared/state/learner-state.models';
import { TopicPack } from '../../shared/content/topic-pack.models';
import { findExercise } from '../../shared/content/content.queries';
import { BackupCompatibility, LearnerBackup } from './backup.models';

interface PreparedBackupState {
  state: LearnerState;
  compatibility: BackupCompatibility;
}

export function prepareBackupState(
  backup: LearnerBackup,
  installedPacks: TopicPack[],
): PreparedBackupState {
  const compatibility = classifyPackVersions(backup.state.contentPackVersions, installedPacks);
  validateAbsentPackReferences(
    backup.state,
    installedPacks,
    new Set(compatibility.addedPacks.map((pack) => pack.id)),
  );
  const changedIds = new Set(compatibility.changedPacks.map((pack) => pack.id));
  const state = discardIncompatiblePackProgress(backup.state, installedPacks, changedIds);
  validateExerciseReferences(collectExerciseReferences(state), installedPacks);
  validateTopicAndTestReferences(state, installedPacks);
  validateCorrectionReferences(state, installedPacks);
  validateLessonReferences(state, installedPacks);
  validateNoteReferences(state, installedPacks);
  return { state, compatibility };
}

export function validatedBackupState(
  backup: LearnerBackup,
  installedPacks: TopicPack[],
): LearnerState {
  return prepareBackupState(backup, installedPacks).state;
}

function classifyPackVersions(
  versions: Record<string, string>,
  packs: TopicPack[],
): BackupCompatibility {
  const currentIds = new Set(packs.map((pack) => pack.id));
  if (Object.keys(versions).some((id) => !currentIds.has(id))) {
    throw new Error('This backup contains an exercise pack that is no longer installed.');
  }
  return {
    addedPacks: packs
      .filter((pack) => versions[pack.id] === undefined)
      .map(({ id, title }) => ({ id, title })),
    changedPacks: packs
      .filter((pack) => versions[pack.id] !== undefined && versions[pack.id] !== pack.version)
      .map(({ id, title }) => ({ id, title })),
  };
}

function discardIncompatiblePackProgress(
  state: LearnerState,
  packs: TopicPack[],
  changedIds: Set<string>,
): LearnerState {
  const exerciseOwner = new Map(
    packs.flatMap((pack) =>
      pack.tests.flatMap((test) =>
        test.exercises.map((exercise) => [exercise.id, pack.id] as const),
      ),
    ),
  );
  const lessonOwner = new Map(
    packs.flatMap((pack) => pack.lessons.map((lesson) => [lesson.id, pack.id] as const)),
  );
  const compatibleExercise = (id: string): boolean => {
    if (!changedIds.size) return true;
    const owner = exerciseOwner.get(id);
    return owner !== undefined && !changedIds.has(owner);
  };
  const compatibleLesson = (id: string): boolean => {
    if (!changedIds.size) return true;
    const owner = lessonOwner.get(id);
    return owner !== undefined && !changedIds.has(owner);
  };
  return {
    ...structuredClone(state),
    contentPackVersions: Object.fromEntries(packs.map((pack) => [pack.id, pack.version])),
    attempts: state.attempts.filter((attempt) => !changedIds.has(attempt.topicId)),
    sessions: state.sessions.filter((session) => !changedIds.has(session.topicId)),
    unresolvedMistakeIds: state.unresolvedMistakeIds.filter(compatibleExercise),
    correctionRecords: state.correctionRecords.filter(
      (record) =>
        compatibleExercise(record.exerciseId) && compatibleExercise(record.parallelExerciseId),
    ),
    lessonCompletions: state.lessonCompletions.filter((completion) =>
      compatibleLesson(completion.lessonId),
    ),
    learnerNotes: state.learnerNotes.filter((note) => {
      if (!changedIds.size || !note.lessonId) return true;
      const pack = packs.find((candidate) => candidate.id === note.topicId);
      if (!pack || !changedIds.has(pack.id)) return true;
      return pack.lessons.some((lesson) => lesson.id === note.lessonId);
    }),
  };
}

function validateAbsentPackReferences(
  state: LearnerState,
  packs: TopicPack[],
  absentIds: Set<string>,
): void {
  if (!absentIds.size) return;
  const exerciseOwner = new Map(
    packs.flatMap((pack) =>
      pack.tests.flatMap((test) =>
        test.exercises.map((exercise) => [exercise.id, pack.id] as const),
      ),
    ),
  );
  const lessonOwner = new Map(
    packs.flatMap((pack) => pack.lessons.map((lesson) => [lesson.id, pack.id] as const)),
  );
  const scopedToAbsent =
    state.attempts.some((attempt) => absentIds.has(attempt.topicId)) ||
    state.sessions.some((session) => absentIds.has(session.topicId)) ||
    state.learnerNotes.some((note) => absentIds.has(note.topicId));
  const exerciseInAbsent = collectExerciseReferences(state).some((id) =>
    absentIds.has(exerciseOwner.get(id) ?? ''),
  );
  const lessonInAbsent = state.lessonCompletions.some((completion) =>
    absentIds.has(lessonOwner.get(completion.lessonId) ?? ''),
  );
  if (scopedToAbsent || exerciseInAbsent || lessonInAbsent) {
    throw new Error('This backup contains progress for an exercise pack it does not record.');
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
  const known = new Map(
    packs.flatMap((pack) => pack.lessons.map((lesson) => [lesson.id, lesson.version] as const)),
  );
  if (
    state.lessonCompletions.some(
      (item) => !known.has(item.lessonId) || known.get(item.lessonId) !== item.lessonVersion,
    )
  ) {
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

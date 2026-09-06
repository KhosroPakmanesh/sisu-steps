import {
  CompletedAttempt,
  LearnerState,
  StudySession,
  SubmittedAnswer,
} from '@/shared/domain/learner-state.models';
import { TopicPack } from '../content/content.models';

const LEGACY_TOPIC_ID = 'vowel-harmony-kpt-tplural';
const LEGACY_VERSION = '6.1.0';
const FOUNDATION_REVIEW_ID = 'foundations-review';
const TOPIC_NOTE_OWNER = 'kpt-singular-forms';
const SUCCESSOR_IDS = [
  'vowel-harmony-location-endings',
  'kpt-singular-forms',
  't-plural-agreement',
] as const;
const SUCCESSOR_ID_SET = new Set<string>(SUCCESSOR_IDS);

const TEST_TOPIC_OWNERS: Record<string, (typeof SUCCESSOR_IDS)[number]> = {
  'vowel-families': 'vowel-harmony-location-endings',
  'harmony-in-forms': 'vowel-harmony-location-endings',
  'test-kpt-doubles': 'kpt-singular-forms',
  'test-kpt-singles': 'kpt-singular-forms',
  'test-kpt-special-k': 'kpt-singular-forms',
  'test-kpt-clusters': 'kpt-singular-forms',
  'kpt-patterns': 'kpt-singular-forms',
  'kpt-nouns': 'kpt-singular-forms',
  'kpt-verbs': 'kpt-singular-forms',
  'regular-t-plural': 't-plural-agreement',
  'test-kpt-t-plural': 't-plural-agreement',
  'plural-verb-harmony': 't-plural-agreement',
  'plural-in-sentences': 't-plural-agreement',
};

interface ExerciseOwner {
  topicId: string;
  testId: string;
  title: string;
}

interface MigrationOwners {
  exercises: Map<string, ExerciseOwner>;
  lessons: Map<string, string>;
}

export function migrateFoundationsPackSplit(state: LearnerState, packs: TopicPack[]): LearnerState {
  if (!canMigrate(state, packs)) return state;
  const owners = collectOwners(packs);
  const versions = { ...(state.contentPackVersions ?? {}) };
  delete versions[LEGACY_TOPIC_ID];
  for (const topicId of SUCCESSOR_IDS) {
    const pack = packs.find((candidate) => candidate.id === topicId);
    if (pack) versions[topicId] = pack.version;
  }

  return {
    ...state,
    contentPackVersions: versions,
    attempts: state.attempts.flatMap((attempt) => migrateAttempt(attempt, owners)),
    sessions: state.sessions.flatMap((session) => migrateSession(session, owners)),
    learnerNotes: (state.learnerNotes ?? []).flatMap((note) => {
      if (note.topicId !== LEGACY_TOPIC_ID) return [note];
      const topicId = note.lessonId ? owners.lessons.get(note.lessonId) : TOPIC_NOTE_OWNER;
      return topicId ? [{ ...note, topicId }] : [];
    }),
  };
}

function canMigrate(state: LearnerState, packs: TopicPack[]): boolean {
  const installed = new Set(packs.map((pack) => pack.id));
  return (
    state.contentPackVersions?.[LEGACY_TOPIC_ID] === LEGACY_VERSION &&
    !installed.has(LEGACY_TOPIC_ID) &&
    SUCCESSOR_IDS.every((id) => installed.has(id))
  );
}

function collectOwners(packs: TopicPack[]): MigrationOwners {
  const exercises = new Map<string, ExerciseOwner>();
  const lessons = new Map<string, string>();
  for (const pack of packs.filter((candidate) => SUCCESSOR_ID_SET.has(candidate.id))) {
    for (const lesson of pack.lessons) lessons.set(lesson.id, pack.id);
    for (const test of pack.tests)
      for (const exercise of test.exercises)
        exercises.set(exercise.id, { topicId: pack.id, testId: test.id, title: test.title });
  }
  return { exercises, lessons };
}

function migrateAttempt(attempt: CompletedAttempt, owners: MigrationOwners): CompletedAttempt[] {
  if (attempt.topicId !== LEGACY_TOPIC_ID) return [attempt];
  if (attempt.mode === 'test' && attempt.testId && attempt.testId !== FOUNDATION_REVIEW_ID) {
    const topicId = TEST_TOPIC_OWNERS[attempt.testId];
    return topicId ? [{ ...attempt, topicId }] : [];
  }

  const grouped = groupAnswers(attempt.answers, owners, attempt.mode === 'test');
  return [...grouped.entries()].map(([key, answers]) => {
    const owner = ownerForExercise(owners, answers[0]?.exerciseId);
    const sourceExerciseIds = filterOwnedIds(
      attempt.sourceExerciseIds,
      owner?.topicId,
      attempt.mode === 'test' ? owner?.testId : undefined,
      owners,
    );
    const correctCount = answers.filter((answer) => answer.correct).length;
    const skippedCount = answers.filter((answer) => answer.skipped === true).length;
    const incorrectCount = answers.filter(
      (answer) => !answer.correct && answer.skipped !== true,
    ).length;
    return {
      ...attempt,
      id: `${attempt.id}:${key}`,
      topicId: owner?.topicId ?? key,
      testId: attempt.mode === 'test' ? owner?.testId : undefined,
      title: attempt.mode === 'test' ? (owner?.title ?? attempt.title) : attempt.title,
      answers,
      ...(sourceExerciseIds ? { sourceExerciseIds } : { sourceExerciseIds: undefined }),
      correctCount,
      incorrectCount,
      skippedCount,
      total: answers.length,
      percentage:
        answers.length === 0 ? 0 : Math.round((correctCount / answers.length) * 1000) / 10,
    };
  });
}

function migrateSession(session: StudySession, owners: MigrationOwners): StudySession[] {
  if (session.topicId !== LEGACY_TOPIC_ID) return [session];
  if (session.mode === 'test' && session.testId && session.testId !== FOUNDATION_REVIEW_ID) {
    const topicId = TEST_TOPIC_OWNERS[session.testId];
    return topicId ? [{ ...session, topicId }] : [];
  }

  const groups = new Map<string, number[]>();
  session.exerciseIds.forEach((exerciseId, index) => {
    const owner = owners.exercises.get(exerciseId);
    if (!owner) return;
    const key = ownerKey(owner, session.mode === 'test');
    groups.set(key, [...(groups.get(key) ?? []), index]);
  });
  return [...groups.entries()].map(([key, indices]) => {
    const exerciseIds = indices.map((index) => session.exerciseIds[index]);
    const exerciseSet = new Set(exerciseIds);
    const owner = ownerForExercise(owners, exerciseIds[0]);
    const sourceExerciseIds = session.sourceExerciseIds
      ? indices.map((index) => session.sourceExerciseIds?.[index]).filter(isText)
      : undefined;
    const nextLocalIndex = indices.findIndex((index) => index >= session.currentIndex);
    return {
      ...session,
      id: `${session.id}:${key}`,
      topicId: owner?.topicId ?? key,
      testId: session.mode === 'test' ? owner?.testId : undefined,
      title: session.mode === 'test' ? (owner?.title ?? session.title) : session.title,
      exerciseIds,
      ...(sourceExerciseIds ? { sourceExerciseIds } : { sourceExerciseIds: undefined }),
      currentIndex: nextLocalIndex >= 0 ? nextLocalIndex : Math.max(0, exerciseIds.length - 1),
      answers: session.answers.filter((answer) => exerciseSet.has(answer.exerciseId)),
    };
  });
}

function groupAnswers(
  answers: SubmittedAnswer[],
  owners: MigrationOwners,
  includeTest: boolean,
): Map<string, SubmittedAnswer[]> {
  const grouped = new Map<string, SubmittedAnswer[]>();
  for (const answer of answers) {
    const owner = owners.exercises.get(answer.exerciseId);
    if (!owner) continue;
    const key = ownerKey(owner, includeTest);
    grouped.set(key, [...(grouped.get(key) ?? []), answer]);
  }
  return grouped;
}

function ownerKey(owner: ExerciseOwner, includeTest: boolean): string {
  return includeTest ? `${owner.topicId}/${owner.testId}` : owner.topicId;
}

function ownerForExercise(owners: MigrationOwners, exerciseId?: string): ExerciseOwner | undefined {
  return exerciseId ? owners.exercises.get(exerciseId) : undefined;
}

function filterOwnedIds(
  ids: string[] | undefined,
  topicId: string | undefined,
  testId: string | undefined,
  owners: MigrationOwners,
): string[] | undefined {
  if (!ids) return undefined;
  return ids.filter((id) => {
    const owner = owners.exercises.get(id);
    return owner?.topicId === topicId && (!testId || owner?.testId === testId);
  });
}

function isText(value: string | undefined): value is string {
  return typeof value === 'string';
}

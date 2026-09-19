import { LearnerState, StudySession } from '../shared/state/learner-state.models';
import {
  ContentTestSummary,
  PackGroupSummary,
  TopicPackSummary,
} from '../shared/content/content.models';
import {
  completedAttemptCount,
  dueCorrections,
  isLessonCompleted,
  mistakeCount,
  overallAverage,
} from '../shared/progress/progress.queries';

export interface TopicSummary {
  pack: TopicPackSummary;
  attemptedTests: number;
  completedLessons: number;
  totalLessons: number;
  exercises: number;
  attempts: number;
  average: number | null;
  mistakes: number;
  reviewsDue: number;
  reviewInProgress: boolean;
}

export interface ContinueLearningTarget {
  mode: 'test' | 'mistakes' | 'review';
  topicId: string;
  testId?: string;
  topicTitle: string;
  title: string;
  description: string;
  actionLabel: string;
}

export function getTopicSummary(
  state: LearnerState,
  packs: TopicPackSummary[],
  pack: TopicPackSummary,
  now = new Date(),
): TopicSummary {
  const attemptedTestIds = new Set(
    state.attempts
      .filter((attempt) => attempt.mode === 'test' && attempt.topicId === pack.id)
      .map((attempt) => attempt.testId)
      .filter((testId): testId is string => !!testId),
  );
  return {
    pack,
    attemptedTests: pack.tests.filter((test) => attemptedTestIds.has(test.id)).length,
    completedLessons: pack.lessons.filter((lesson) => isLessonCompleted(state, lesson)).length,
    totalLessons: pack.lessons.length,
    exercises: pack.tests.reduce((total, test) => total + test.exerciseIds.length, 0),
    attempts: completedAttemptCount(state, pack.id),
    average: overallAverage(state, pack.id),
    mistakes: mistakeCount(state, pack),
    reviewsDue: dueCorrections(state, packs, pack.id, now).length,
    reviewInProgress: state.sessions.some(
      (session) => session.topicId === pack.id && session.mode === 'review',
    ),
  };
}

export function getTopicSummaries(
  state: LearnerState,
  packs: TopicPackSummary[],
  now = new Date(),
): TopicSummary[] {
  return packs.map((pack) => getTopicSummary(state, packs, pack, now));
}

export interface TopicGroupSummary extends Omit<PackGroupSummary, 'packs'> {
  packs: TopicSummary[];
}

export function getTopicGroups(
  state: LearnerState,
  packs: TopicPackSummary[],
  groups: PackGroupSummary[],
  now = new Date(),
): TopicGroupSummary[] {
  return groups.map((group) => ({
    ...group,
    packs: group.packs.map((pack) => getTopicSummary(state, packs, pack, now)),
  }));
}

export function getContinueLearningTarget(
  state: LearnerState,
  packs: TopicPackSummary[],
): ContinueLearningTarget | null {
  const savedSession = mostRecentValidSession(state, packs);
  if (savedSession) return targetForSession(savedSession, packs);

  for (const pack of packs) {
    const attemptedTestIds = new Set(
      state.attempts
        .filter((attempt) => attempt.mode === 'test' && attempt.topicId === pack.id)
        .map((attempt) => attempt.testId),
    );
    const nextTest = pack.tests.find((test) => !attemptedTestIds.has(test.id));
    if (nextTest) return targetForTest(pack, nextTest, false);
  }

  const firstPack = packs[0];
  const firstTest = firstPack?.tests[0];
  return firstPack && firstTest ? targetForTest(firstPack, firstTest, true) : null;
}

function mostRecentValidSession(
  state: LearnerState,
  packs: TopicPackSummary[],
): StudySession | undefined {
  return [...state.sessions]
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
    .find((session) => {
      const pack = packs.find((candidate) => candidate.id === session.topicId);
      if (!pack || session.exerciseIds.length === 0) return false;
      const test =
        session.mode === 'test'
          ? pack.tests.find((candidate) => candidate.id === session.testId)
          : undefined;
      if (session.mode === 'test' && !test) return false;
      const validExerciseIds = new Set(
        test ? test.exerciseIds : pack.tests.flatMap((candidate) => candidate.exerciseIds),
      );
      return (
        session.currentIndex >= 0 &&
        session.currentIndex < session.exerciseIds.length &&
        session.exerciseIds.every((exerciseId) => validExerciseIds.has(exerciseId))
      );
    });
}

function targetForSession(
  session: StudySession,
  packs: TopicPackSummary[],
): ContinueLearningTarget {
  const pack = packs.find((candidate) => candidate.id === session.topicId)!;
  const modeLabel =
    session.mode === 'review' ? 'review' : session.mode === 'mistakes' ? 'practice' : 'test';
  return {
    mode: session.mode,
    topicId: pack.id,
    testId: session.testId,
    topicTitle: pack.title,
    title: session.title,
    description: `Pick up your saved ${modeLabel} in ${pack.title}.`,
    actionLabel:
      session.mode === 'review'
        ? 'Resume review'
        : session.mode === 'mistakes'
          ? 'Resume practice'
          : 'Resume test',
  };
}

function targetForTest(
  pack: TopicPackSummary,
  test: ContentTestSummary,
  repeat: boolean,
): ContinueLearningTarget {
  return {
    mode: 'test',
    topicId: pack.id,
    testId: test.id,
    topicTitle: pack.title,
    title: test.title,
    description: repeat
      ? `You have tried every test in ${pack.title}. Revisit any pattern when you are ready.`
      : `This is your next untried test in ${pack.title}. Preparation remains optional.`,
    actionLabel: repeat ? 'Practise again' : 'Start next test',
  };
}

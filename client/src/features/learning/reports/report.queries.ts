import { LearnerState, SubmittedAnswer } from '@/shared/domain/learner-state.models';
import { TopicPack } from '../shared/content/content.models';
import { rounded, testExerciseIds } from '../shared/progress/progress.queries';
import { SkillReport, TestReport } from './report.models';

export function getTestReport(state: LearnerState, pack: TopicPack, testId: string): TestReport {
  const attempts = state.attempts.filter(
    (attempt) =>
      attempt.mode === 'test' && attempt.topicId === pack.id && attempt.testId === testId,
  );
  const exerciseIds = testExerciseIds(pack.tests.find((test) => test.id === testId));
  const percentages = attempts.map((attempt) => attempt.percentage);
  const latestAttempt = attempts.at(-1);
  const corrections = (state.correctionRecords ?? []).filter((record) =>
    exerciseIds.has(record.exerciseId),
  );
  return {
    testId,
    attempts: attempts.length,
    latest: percentages.at(-1) ?? null,
    best: percentages.length ? Math.max(...percentages) : null,
    average: percentages.length
      ? rounded(percentages.reduce((sum, value) => sum + value, 0) / percentages.length)
      : null,
    mistakes: state.unresolvedMistakeIds.filter((id) => exerciseIds.has(id)).length,
    firstAttempt: percentages[0] ?? null,
    independentCorrect: latestAttempt?.correctCount ?? 0,
    skipped: latestAttempt?.skippedCount ?? 0,
    corrected: corrections.filter((record) => !record.masteredAt).length,
    mastered: corrections.filter((record) => !!record.masteredAt).length,
  };
}

export function getSkillReports(state: LearnerState, pack: TopicPack): SkillReport[] {
  const exercises = new Map(
    pack.tests.flatMap((test) => test.exercises).map((exercise) => [exercise.id, exercise]),
  );
  const skills = [
    ...new Set(
      [...exercises.values()].map((exercise) => exercise.targetSkill ?? exercise.requiredSkills[0]),
    ),
  ].filter((skill): skill is string => !!skill);
  const firstAnswers = firstTestAnswers(state, pack.id);
  const misconceptions = misconceptionCounts(state, pack.id, exercises);
  const corrections = state.correctionRecords ?? [];

  return skills.map((skill) => {
    const skillExerciseIds = new Set(
      [...exercises.values()]
        .filter((exercise) => (exercise.targetSkill ?? exercise.requiredSkills[0]) === skill)
        .map((exercise) => exercise.id),
    );
    const answers = [...firstAnswers.values()].filter((answer) =>
      skillExerciseIds.has(answer.exerciseId),
    );
    const skillCorrections = corrections.filter(
      (record) => record.targetSkill === skill && skillExerciseIds.has(record.exerciseId),
    );
    return {
      skill,
      firstAnswers: answers.length,
      independentCorrect: answers.filter((answer) => answer.correct && !answer.skipped).length,
      skipped: answers.filter((answer) => answer.skipped).length,
      corrected: skillCorrections.filter((record) => !record.masteredAt).length,
      mastered: skillCorrections.filter((record) => !!record.masteredAt).length,
      misconceptions: [...(misconceptions.get(skill) ?? new Map()).entries()]
        .map(([category, count]) => ({ category, count }))
        .sort((left, right) => right.count - left.count),
    };
  });
}

function firstTestAnswers(state: LearnerState, topicId: string): Map<string, SubmittedAnswer> {
  const answers = new Map<string, SubmittedAnswer>();
  for (const attempt of state.attempts.filter(
    (item) => item.mode === 'test' && item.topicId === topicId,
  )) {
    for (const answer of attempt.answers) {
      if (!answers.has(answer.exerciseId)) answers.set(answer.exerciseId, answer);
    }
  }
  return answers;
}

function misconceptionCounts(
  state: LearnerState,
  topicId: string,
  exercises: Map<string, TopicPack['tests'][number]['exercises'][number]>,
): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>();
  for (const attempt of state.attempts.filter((item) => item.topicId === topicId)) {
    for (const answer of attempt.answers) {
      if (answer.correct || answer.skipped || !answer.misconceptionCategory) continue;
      const skill = exercises.get(answer.exerciseId)?.targetSkill;
      if (!skill) continue;
      const counts = result.get(skill) ?? new Map<string, number>();
      counts.set(answer.misconceptionCategory, (counts.get(answer.misconceptionCategory) ?? 0) + 1);
      result.set(skill, counts);
    }
  }
  return result;
}

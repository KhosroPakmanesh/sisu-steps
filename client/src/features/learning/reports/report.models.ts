export interface TestReport {
  testId: string;
  attempts: number;
  latest: number | null;
  best: number | null;
  average: number | null;
  mistakes: number;
  firstAttempt: number | null;
  independentCorrect: number;
  skipped: number;
  corrected: number;
  mastered: number;
}

export interface SkillReport {
  skill: string;
  firstAnswers: number;
  independentCorrect: number;
  skipped: number;
  corrected: number;
  mastered: number;
  misconceptions: { category: string; count: number }[];
}

export interface OllaPackValidationConfig {
  id: string;
  summary: string;
  skills: string[];
  lessonIds: string[];
  testIds: string[];
  focusedCount: number;
  exerciseCounts: number[];
  scoredCount: number;
  practiceCount: number;
  personMinimum: number;
  coverage: Record<string, number>;
  allowedConstructionTags: string[];
  genderNeutralMinimum: number;
  politeTeMinimum: number;
  pluralTeMinimum: number;
}

export function validateOllaPack(pack: unknown, config: OllaPackValidationConfig): string[];

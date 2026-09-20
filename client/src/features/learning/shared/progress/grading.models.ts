export interface GradingResult {
  correct: boolean;
  normalizedAnswer: string;
  expectedAnswer: string;
  misconceptionCategory?: string;
  diagnosticExplanation?: string;
}

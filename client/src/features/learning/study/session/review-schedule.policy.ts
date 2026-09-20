const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const REVIEW_INTERVAL_DAYS = [1, 3, 7] as const;

export function nextReviewAt(isoDate: string, stage: 0 | 1 | 2): string {
  return new Date(
    new Date(isoDate).getTime() + REVIEW_INTERVAL_DAYS[stage] * DAY_IN_MILLISECONDS,
  ).toISOString();
}

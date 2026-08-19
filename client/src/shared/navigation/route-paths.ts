export const routePaths = {
  home: '/',
  reports: '/reports',
  data: '/data',
  topic: (topicId: string) => ['/topics', topicId] as const,
  learn: (topicId: string, testId: string) => ['/learn', topicId, testId] as const,
  study: (topicId: string, testId: string) => ['/study', topicId, testId] as const,
  mistakes: (topicId: string) => ['/mistakes', topicId] as const,
  review: (topicId: string) => ['/review', topicId] as const,
} as const;

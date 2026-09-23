export const routeSegments = {
  home: '',
  topic: 'topics/:topicId',
  learn: 'learn/:topicId/:testId',
  study: 'study/:topicId/:testId',
  mistakes: 'mistakes/:topicId',
  review: 'review/:topicId',
  stats: 'stats',
  topicStats: 'stats/:topicId',
  privacy: 'privacy',
  terms: 'terms',
} as const;

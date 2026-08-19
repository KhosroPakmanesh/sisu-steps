export const routeSegments = {
  home: '',
  topic: 'topics/:topicId',
  learn: 'learn/:topicId/:testId',
  study: 'study/:topicId/:testId',
  mistakes: 'mistakes/:topicId',
  review: 'review/:topicId',
  reports: 'reports',
  data: 'data',
} as const;

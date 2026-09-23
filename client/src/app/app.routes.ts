import { Routes } from '@angular/router';
import { routeSegments } from './routes.config';

export const routes: Routes = [
  {
    path: routeSegments.home,
    loadComponent: () =>
      import('@/features/learning/topics/catalog/topic-catalog.page').then(
        (module) => module.TopicCatalogPage,
      ),
    title: 'Sisu Steps · Finnish exercise book',
  },
  {
    path: routeSegments.topic,
    loadComponent: () =>
      import('@/features/learning/topics/detail/topic.page').then((module) => module.TopicPage),
    title: 'Topic · Sisu Steps',
  },
  {
    path: routeSegments.learn,
    loadComponent: () =>
      import('@/features/learning/lessons/reader/lesson.page').then((module) => module.LessonPage),
    title: 'Learn first · Sisu Steps',
  },
  {
    path: routeSegments.study,
    loadComponent: () =>
      import('@/features/learning/study/runner/study.page').then((module) => module.StudyPage),
    title: 'Study · Sisu Steps',
  },
  {
    path: routeSegments.mistakes,
    loadComponent: () =>
      import('@/features/learning/study/runner/study.page').then((module) => module.StudyPage),
    data: { mode: 'mistakes' },
    title: 'Practice mistakes · Sisu Steps',
  },
  {
    path: routeSegments.review,
    loadComponent: () =>
      import('@/features/learning/study/runner/study.page').then((module) => module.StudyPage),
    data: { mode: 'review' },
    title: 'Review due · Sisu Steps',
  },
  {
    path: routeSegments.topicStats,
    loadComponent: () =>
      import('@/features/learning/stats/topic/topic-stats.page').then(
        (module) => module.TopicStatsPage,
      ),
    title: 'Topic stats · Sisu Steps',
  },
  {
    path: routeSegments.stats,
    loadComponent: () =>
      import('@/features/learning/stats/overview/stats.page').then((module) => module.StatsPage),
    title: 'Stats · Sisu Steps',
  },
  {
    path: routeSegments.privacy,
    loadComponent: () =>
      import('@/features/legal/privacy/privacy.page').then((module) => module.PrivacyPage),
    title: 'Privacy Policy · Sisu Steps',
  },
  {
    path: routeSegments.terms,
    loadComponent: () =>
      import('@/features/legal/terms/terms.page').then((module) => module.TermsPage),
    title: 'Terms of Service · Sisu Steps',
  },
  { path: '**', redirectTo: '' },
];

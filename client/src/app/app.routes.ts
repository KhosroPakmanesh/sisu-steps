import { Routes } from '@angular/router';
import { routeSegments } from './routes.config';

export const routes: Routes = [
  {
    path: routeSegments.home,
    loadComponent: () =>
      import('@/features/learning/dashboard/dashboard.page').then((module) => module.DashboardPage),
    title: 'Sisu Steps · Finnish exercise book',
  },
  {
    path: routeSegments.topic,
    loadComponent: () =>
      import('@/features/learning/dashboard/topic.page').then((module) => module.TopicPage),
    title: 'Topic · Sisu Steps',
  },
  {
    path: routeSegments.learn,
    loadComponent: () =>
      import('@/features/learning/lessons/lesson.page').then((module) => module.LessonPage),
    title: 'Learn first · Sisu Steps',
  },
  {
    path: routeSegments.study,
    loadComponent: () =>
      import('@/features/learning/study/study.page').then((module) => module.StudyPage),
    title: 'Study · Sisu Steps',
  },
  {
    path: routeSegments.mistakes,
    loadComponent: () =>
      import('@/features/learning/study/study.page').then((module) => module.StudyPage),
    data: { mode: 'mistakes' },
    title: 'Practice mistakes · Sisu Steps',
  },
  {
    path: routeSegments.review,
    loadComponent: () =>
      import('@/features/learning/study/study.page').then((module) => module.StudyPage),
    data: { mode: 'review' },
    title: 'Review due · Sisu Steps',
  },
  {
    path: routeSegments.reports,
    loadComponent: () =>
      import('@/features/learning/reports/reports.page').then((module) => module.ReportsPage),
    title: 'Reports · Sisu Steps',
  },
  {
    path: routeSegments.data,
    loadComponent: () =>
      import('@/features/learning/data-management/data-settings.page').then(
        (module) => module.DataSettingsPage,
      ),
    title: 'Data & backup · Sisu Steps',
  },
  { path: '**', redirectTo: '' },
];

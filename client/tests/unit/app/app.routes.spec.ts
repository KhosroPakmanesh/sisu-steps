import { describe, expect, it } from 'vitest';
import { routes } from '@/app/app.routes';
import { routeSegments } from '@/app/routes.config';

describe('application routes', () => {
  it('keeps the public learning and Stats route contract', () => {
    expect(routeSegments).toEqual({
      home: '',
      topic: 'topics/:topicId',
      learn: 'learn/:topicId/:testId',
      study: 'study/:topicId/:testId',
      mistakes: 'mistakes/:topicId',
      review: 'review/:topicId',
      stats: 'stats',
      topicStats: 'stats/:topicId',
    });
    expect(routes.map((route) => route.path)).toEqual([
      routeSegments.home,
      routeSegments.topic,
      routeSegments.learn,
      routeSegments.study,
      routeSegments.mistakes,
      routeSegments.review,
      routeSegments.topicStats,
      routeSegments.stats,
      '**',
    ]);
    expect(routes.some((route) => route.path === 'reports' || route.path === 'data')).toBe(false);
  });

  it('lazy-loads every concrete route and keeps only the wildcard as a redirect', () => {
    const concreteRoutes = routes.filter((route) => route.path !== '**');

    expect(concreteRoutes.every((route) => typeof route.loadComponent === 'function')).toBe(true);
    expect(concreteRoutes.every((route) => route.redirectTo === undefined)).toBe(true);
    expect(routes.at(-1)).toMatchObject({ path: '**', redirectTo: '' });
  });
});

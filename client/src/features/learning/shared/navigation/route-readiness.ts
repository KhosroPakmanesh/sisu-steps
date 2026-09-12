export interface RouteReadiness {
  readonly routeRenderReady: Promise<void>;
}

export function waitForRoute(component: unknown): Promise<void> {
  if (typeof component !== 'object' || component === null || !('routeRenderReady' in component)) {
    return Promise.resolve();
  }

  return Promise.resolve((component as { routeRenderReady: PromiseLike<void> }).routeRenderReady);
}

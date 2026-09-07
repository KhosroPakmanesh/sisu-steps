import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import {
  BrowserJsonResourceLoader,
  JSON_RESOURCE_LOADER,
} from '@/shared/browser/json-resource.loader';
import { IndexedDbLearnerStateRepository } from '@/features/learning/shared/state/persistence/indexeddb/indexeddb-learner-state.repository';
import { LEARNER_STATE_REPOSITORY } from '@/features/learning/shared/state/persistence/learner-state.repository';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withViewTransitions({ skipInitialTransition: true }),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    { provide: JSON_RESOURCE_LOADER, useClass: BrowserJsonResourceLoader },
    { provide: LEARNER_STATE_REPOSITORY, useClass: IndexedDbLearnerStateRepository },
  ],
};

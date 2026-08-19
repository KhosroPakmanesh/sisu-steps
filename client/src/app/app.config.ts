import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  BrowserJsonResourceLoader,
  JSON_RESOURCE_LOADER,
} from '@/shared/browser/json-resource.loader';
import { LEARNER_STATE_REPOSITORY } from '@/shared/persistence/learner-state.repository';
import { IndexedDbLearnerStateRepository } from '@/shared/persistence/indexeddb/indexeddb-learner-state.repository';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: JSON_RESOURCE_LOADER, useClass: BrowserJsonResourceLoader },
    { provide: LEARNER_STATE_REPOSITORY, useClass: IndexedDbLearnerStateRepository },
  ],
};

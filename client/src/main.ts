import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppShell } from './app/shell/app-shell';

bootstrapApplication(AppShell, appConfig).catch((error: unknown) => console.error(error));

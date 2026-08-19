import { Injectable, InjectionToken } from '@angular/core';

export interface JsonResourceLoader {
  load(path: string, description: string): Promise<unknown>;
}

export const JSON_RESOURCE_LOADER = new InjectionToken<JsonResourceLoader>('JSON_RESOURCE_LOADER');

@Injectable()
export class BrowserJsonResourceLoader implements JsonResourceLoader {
  async load(path: string, description: string): Promise<unknown> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Could not load ${description} (${response.status}).`);
    }
    return response.json();
  }
}

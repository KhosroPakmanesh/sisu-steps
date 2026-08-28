export interface LoadedContentSource {
  catalog: {
    schemaVersion: 1;
    packs: string[];
  };
  packs: Array<Record<string, unknown>>;
}

export function loadContentSource(sourceDirectory: string): Promise<LoadedContentSource>;

export interface LoadedContentSource {
  catalog: {
    schemaVersion: 2;
    groups: Array<{
      id: string;
      title: string;
      packs: string[];
    }>;
  };
  packs: Array<Record<string, unknown>>;
}

export function loadContentSource(sourceDirectory: string): Promise<LoadedContentSource>;

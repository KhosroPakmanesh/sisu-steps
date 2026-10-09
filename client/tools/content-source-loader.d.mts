export interface LoadedContentSource {
  catalog: {
    schemaVersion: 3;
    packs: Array<Record<string, unknown>>;
    groups: Array<{
      id: string;
      title: string;
      packs: string[];
    }>;
  };
  packs: Array<Record<string, unknown>>;
}

export function loadContentSource(sourceDirectory: string): Promise<LoadedContentSource>;

export function catalogPackSummary(manifest: unknown): Record<string, unknown>;

export interface ContentSourceFixtureDefinition {
  directories?: string[];
  files: Record<string, unknown>;
}

export interface TemporaryContentSourceFixture {
  directory: string;
  cleanup(): Promise<void>;
}

export function createContentSourceFixture(
  definition: ContentSourceFixtureDefinition,
): Promise<TemporaryContentSourceFixture>;

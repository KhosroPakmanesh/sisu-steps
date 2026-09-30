export function validatePackContent(pack: unknown): Promise<{
  errors: string[];
  summary: Record<string, unknown>;
}>;

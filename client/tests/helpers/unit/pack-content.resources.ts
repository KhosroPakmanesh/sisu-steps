import { ContentPackManifest, TopicPack } from '@/features/learning/shared/content/content.models';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';
import { JsonResourceLoader } from '@/shared/browser/json-resource.loader';

const CONTENT_DIRECTORY = 'content';

export class MemoryJsonResourceLoader implements JsonResourceLoader {
  readonly requestedPaths: string[] = [];
  private readonly oneTimeFailures = new Set<string>();

  constructor(private readonly resources: Map<string, unknown>) {}

  failNext(path: string): void {
    this.oneTimeFailures.add(path);
  }

  async load(path: string): Promise<unknown> {
    this.requestedPaths.push(path);
    if (this.oneTimeFailures.delete(path)) throw new Error(`Temporary failure: ${path}`);
    if (!this.resources.has(path)) throw new Error(`Missing test resource: ${path}`);
    return structuredClone(this.resources.get(path));
  }
}

export function manifestFor(pack: TopicPack): ContentPackManifest {
  const summary = topicPackToSummary(pack);
  return {
    schemaVersion: pack.schemaVersion,
    id: pack.id,
    version: pack.version,
    title: pack.title,
    level: pack.level,
    summary: pack.summary,
    objectives: pack.objectives,
    importantSkills: pack.importantSkills,
    sources: pack.sources,
    lessonIds: pack.lessons.map((lesson) => lesson.id),
    testIds: pack.tests.map((test) => test.id),
    lessonSummaries: summary.lessons,
    testSummaries: summary.tests,
  };
}

export function resourcesFor(packs: TopicPack[]): Map<string, unknown> {
  const resources = new Map<string, unknown>([
    [
      `${CONTENT_DIRECTORY}/index.json`,
      {
        schemaVersion: 2,
        groups: [{ id: 'test-group', title: 'Test group', packs: packs.map(({ id }) => id) }],
      },
    ],
  ]);
  for (const pack of packs) {
    const packDirectory = `${CONTENT_DIRECTORY}/${pack.id}`;
    resources.set(`${packDirectory}/pack.json`, manifestFor(pack));
    for (const lesson of pack.lessons) {
      resources.set(`${packDirectory}/lessons/${lesson.id}.json`, lesson);
    }
    for (const test of pack.tests) {
      resources.set(`${packDirectory}/tests/${test.id}.json`, test);
    }
  }
  return resources;
}

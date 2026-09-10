import {
  ContentPackManifest,
  ContentTestSummary,
  TopicPack,
  TopicPackSummary,
} from './content.models';

export function manifestToPackSummary(manifest: ContentPackManifest): TopicPackSummary {
  return {
    schemaVersion: manifest.schemaVersion,
    id: manifest.id,
    version: manifest.version,
    title: manifest.title,
    level: manifest.level,
    summary: manifest.summary,
    objectives: manifest.objectives,
    importantSkills: manifest.importantSkills,
    sources: manifest.sources,
    lessons: manifest.lessonSummaries,
    tests: manifest.testSummaries,
  };
}

export function topicPackToSummary(pack: TopicPack): TopicPackSummary {
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
    lessons: pack.lessons.map(({ id, version }) => ({ id, version })),
    tests: pack.tests.map(testToSummary),
  };
}

function testToSummary(test: TopicPack['tests'][number]): ContentTestSummary {
  return {
    id: test.id,
    title: test.title,
    stage: test.stage,
    lessonIds: test.lessonIds,
    exerciseIds: test.exercises.map((exercise) => exercise.id),
  };
}

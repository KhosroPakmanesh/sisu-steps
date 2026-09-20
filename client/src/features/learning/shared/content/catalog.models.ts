import { LearningStage } from './learning-stage.models';

export interface ContentCatalogGroup {
  id: string;
  title: string;
  packs: string[];
}

export interface ContentSource {
  title: string;
  url: string;
}

export interface ContentCatalog {
  schemaVersion: 2;
  groups: ContentCatalogGroup[];
}

export interface ContentLessonSummary {
  id: string;
  version: string;
}

export interface ContentTestSummary {
  id: string;
  title: string;
  stage: LearningStage;
  lessonIds: string[];
  exerciseIds: string[];
}

export interface ContentPackManifest {
  schemaVersion: 1;
  id: string;
  version: string;
  title: string;
  level: string;
  summary: string;
  objectives: string[];
  importantSkills: string[];
  sources: ContentSource[];
  lessonIds: string[];
  testIds: string[];
  lessonSummaries: ContentLessonSummary[];
  testSummaries: ContentTestSummary[];
}

export interface TopicPackSummary {
  schemaVersion: 1;
  id: string;
  version: string;
  title: string;
  level: string;
  summary: string;
  objectives: string[];
  importantSkills: string[];
  sources: ContentSource[];
  lessons: ContentLessonSummary[];
  tests: ContentTestSummary[];
}

export interface PackGroupSummary {
  id: string;
  title: string;
  packs: TopicPackSummary[];
}

export interface LoadedContentCatalog {
  groups: PackGroupSummary[];
  packs: TopicPackSummary[];
}

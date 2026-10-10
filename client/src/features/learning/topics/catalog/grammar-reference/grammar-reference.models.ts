import { LessonExample } from '../../../shared/content/lesson.models';
import { PackGroupSummary, TopicPackSummary } from '../../../shared/content/catalog.models';

export type GrammarReferenceTarget =
  { kind: 'group'; group: PackGroupSummary } | { kind: 'pack'; pack: TopicPackSummary };

export interface GrammarReferenceLesson {
  id: string;
  title: string;
  summary: string;
  examples: Pick<LessonExample, 'finnish' | 'english'>[];
}

export interface GrammarReferencePack {
  id: string;
  title: string;
  lessons: GrammarReferenceLesson[];
}

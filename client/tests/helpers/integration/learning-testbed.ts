import { TestBed } from '@angular/core/testing';
import { BackupService } from '@/features/learning/learner-data/backup.service';
import { ClearHistoryService } from '@/features/learning/learner-data/clear-history.service';
import { LessonProgressService } from '@/features/learning/lessons/lesson-progress.service';
import { ContentCatalogService } from '@/features/learning/shared/content/content-catalog.service';
import {
  LoadedContentCatalog,
  LoadedTopicPack,
} from '@/features/learning/shared/content/content.models';
import { PackContentRepository } from '@/features/learning/shared/content/pack-content.repository';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';
import { LearnerNoteService } from '@/features/learning/shared/notes/learner-note.service';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { LearnerState } from '@/features/learning/shared/state/learner-state.models';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import {
  LEARNER_STATE_REPOSITORY,
  LearnerStateRepository,
} from '@/features/learning/shared/state/persistence/learner-state.repository';
import { SessionAnswerService } from '@/features/learning/study/session-answer.service';
import { SessionStartService } from '@/features/learning/study/session-start.service';
import { learningPack } from '../unit/learning-content.fixture';

class FakeContentCatalog {
  async loadCatalog(): Promise<LoadedContentCatalog> {
    const pack = topicPackToSummary(learningPack);
    return {
      packs: [pack],
      groups: [{ id: 'foundations', title: 'Foundations', packs: [pack] }],
    };
  }
}

class FakePackContentRepository {
  async load(): Promise<LoadedTopicPack> {
    const pack = structuredClone(learningPack);
    return {
      pack,
      lessonById: new Map(pack.lessons.map((lesson) => [lesson.id, lesson])),
      testById: new Map(pack.tests.map((test) => [test.id, test])),
      exerciseById: new Map(
        pack.tests.flatMap((test) => test.exercises.map((exercise) => [exercise.id, exercise])),
      ),
    };
  }
}

export class FakeLearnerStateRepository implements LearnerStateRepository {
  state = createEmptyLearnerState();
  saveCount = 0;

  async load(): Promise<LearnerState> {
    return structuredClone(this.state);
  }

  async save(state: LearnerState): Promise<void> {
    this.saveCount += 1;
    this.state = structuredClone(state);
  }
}

export interface LearningTestContext {
  answers: SessionAnswerService;
  backups: BackupService;
  clearing: ClearHistoryService;
  lessons: LessonProgressService;
  notes: LearnerNoteService;
  repository: FakeLearnerStateRepository;
  sessions: SessionStartService;
  store: LearningStateStore;
}

export async function createLearningTestContext(): Promise<LearningTestContext> {
  TestBed.configureTestingModule({
    providers: [
      LearningStateStore,
      SessionStartService,
      SessionAnswerService,
      LessonProgressService,
      ClearHistoryService,
      BackupService,
      { provide: ContentCatalogService, useClass: FakeContentCatalog },
      { provide: PackContentRepository, useClass: FakePackContentRepository },
      { provide: LEARNER_STATE_REPOSITORY, useClass: FakeLearnerStateRepository },
    ],
  });

  const store = TestBed.inject(LearningStateStore);
  await store.ready;
  return {
    answers: TestBed.inject(SessionAnswerService),
    backups: TestBed.inject(BackupService),
    clearing: TestBed.inject(ClearHistoryService),
    lessons: TestBed.inject(LessonProgressService),
    notes: TestBed.inject(LearnerNoteService),
    repository: TestBed.inject(LEARNER_STATE_REPOSITORY) as FakeLearnerStateRepository,
    sessions: TestBed.inject(SessionStartService),
    store,
  };
}

export async function completeTestAnswer(
  context: LearningTestContext,
  answer: string,
): Promise<void> {
  const session = await context.sessions.getOrCreateTestSession('topic', 'test-1');
  await context.answers.submitAnswer(session.id, answer);
  await context.answers.advanceSession(session.id);
}

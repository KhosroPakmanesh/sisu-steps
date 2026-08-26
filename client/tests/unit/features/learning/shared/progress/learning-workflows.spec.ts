import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackupService } from '@/features/learning/data-management/backup.service';
import { ClearProgressService } from '@/features/learning/data-management/clear-progress.service';
import { LessonProgressService } from '@/features/learning/lessons/lesson-progress.service';
import { LearnerNoteService } from '@/features/learning/shared/notes/learner-note.service';
import { getTestReport } from '@/features/learning/reports/report.queries';
import { ContentCatalogService } from '@/features/learning/shared/content/content-catalog.service';
import { TopicPack } from '@/features/learning/shared/content/content.models';
import {
  correctionCount,
  dueCorrections,
  lessonProgressForTest,
  mistakeCount,
} from '@/features/learning/shared/progress/progress.queries';
import { alignLearnerStateWithPacks } from '@/features/learning/shared/state/align-learner-state.policy';
import { createEmptyLearnerState } from '@/features/learning/shared/state/learner-state.factory';
import { LearningStateStore } from '@/features/learning/shared/state/learning-state.store';
import { SessionAnswerService } from '@/features/learning/study/session-answer.service';
import { SessionStartService } from '@/features/learning/study/session-start.service';
import { LearnerState } from '@/shared/domain/learner-state.models';
import {
  LEARNER_STATE_REPOSITORY,
  LearnerStateRepository,
} from '@/shared/persistence/learner-state.repository';
import { learningPack } from '../../../../fixtures/learning-content.fixture';

class FakeContentCatalog {
  async loadPacks(): Promise<TopicPack[]> {
    return [structuredClone(learningPack)];
  }
}

class FakeLearnerStateRepository implements LearnerStateRepository {
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

describe('learning workflows', () => {
  let store: LearningStateStore;
  let sessions: SessionStartService;
  let answers: SessionAnswerService;
  let lessons: LessonProgressService;
  let notes: LearnerNoteService;
  let clearing: ClearProgressService;
  let backups: BackupService;
  let repository: FakeLearnerStateRepository;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        LearningStateStore,
        SessionStartService,
        SessionAnswerService,
        LessonProgressService,
        ClearProgressService,
        BackupService,
        { provide: ContentCatalogService, useClass: FakeContentCatalog },
        { provide: LEARNER_STATE_REPOSITORY, useClass: FakeLearnerStateRepository },
      ],
    });
    store = TestBed.inject(LearningStateStore);
    sessions = TestBed.inject(SessionStartService);
    answers = TestBed.inject(SessionAnswerService);
    lessons = TestBed.inject(LessonProgressService);
    notes = TestBed.inject(LearnerNoteService);
    clearing = TestBed.inject(ClearProgressService);
    backups = TestBed.inject(BackupService);
    repository = TestBed.inject(LEARNER_STATE_REPOSITORY) as unknown as FakeLearnerStateRepository;
    await store.ready;
  });

  it('records installed pack versions once', async () => {
    expect(repository.saveCount).toBe(1);
    expect(repository.state.contentPackVersions).toEqual({ topic: '1.0.0' });

    await store.initialize();

    expect(repository.saveCount).toBe(1);
  });

  it('saves unfinished progress and completes an attempt', async () => {
    const session = await sessions.getOrCreateTestSession('topic', 'test-1');
    await answers.submitAnswer(session.id, 'talossa');
    expect(store.learnerState().sessions[0].answers).toHaveLength(1);

    const attempt = await answers.advanceSession(session.id);
    expect(attempt?.percentage).toBe(100);
    expect(getTestReport(store.learnerState(), store.packs()[0], 'test-1')).toMatchObject({
      attempts: 1,
      latest: 100,
      best: 100,
      average: 100,
    });
  });

  it('adds an incorrect exercise to mistakes and resolves it after a correct retry', async () => {
    await completeAnswer('talossä');
    expect(mistakeCount(store.learnerState())).toBe(1);

    await completeAnswer('talossa');

    expect(mistakeCount(store.learnerState())).toBe(0);
    expect(correctionCount(store.learnerState(), false)).toBe(1);
    expect(correctionCount(store.learnerState(), true)).toBe(0);
  });

  it('requires a different due exercise before granting mastery', async () => {
    vi.useFakeTimers();
    vi.setSystemTime('2026-08-18T08:00:00.000Z');
    try {
      await completeAnswer('talossä');
      const correction = await sessions.getOrCreateMistakeSession('topic');
      await answers.submitAnswer(correction!.id, 'talossa');
      await answers.advanceSession(correction!.id);

      expect(
        dueCorrections(
          store.learnerState(),
          store.packs(),
          'topic',
          new Date('2026-08-19T07:59:59.000Z'),
        ),
      ).toHaveLength(0);
      vi.setSystemTime('2026-08-19T08:00:00.000Z');
      const review = await sessions.getOrCreateReviewSession('topic');
      expect(review?.exerciseIds).toEqual(['exercise-2']);
      expect(review?.sourceExerciseIds).toEqual(['exercise-1']);

      await answers.submitAnswer(review!.id, 'koulussa');
      expect((await answers.advanceSession(review!.id))?.mode).toBe('review');
      expect(correctionCount(store.learnerState(), false)).toBe(0);
      expect(correctionCount(store.learnerState(), true)).toBe(1);
      expect(getTestReport(store.learnerState(), store.packs()[0], 'test-1')).toMatchObject({
        firstAttempt: 0,
        corrected: 0,
        mastered: 1,
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('reschedules an unsuccessful review after three days', async () => {
    vi.useFakeTimers();
    vi.setSystemTime('2026-08-18T08:00:00.000Z');
    try {
      await completeAnswer('wrong');
      const correction = await sessions.getOrCreateMistakeSession('topic');
      await answers.submitAnswer(correction!.id, 'talossa');
      await answers.advanceSession(correction!.id);

      vi.setSystemTime('2026-08-19T08:00:00.000Z');
      const review = await sessions.getOrCreateReviewSession('topic');
      await answers.submitAnswer(review!.id, 'wrong');
      await answers.advanceSession(review!.id);

      expect(store.learnerState().correctionRecords?.[0]).toMatchObject({
        reviewStage: 1,
        reviewAttempts: 1,
        nextReviewAt: '2026-08-22T08:00:00.000Z',
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('records a revealed answer as skipped without creating a mistake', async () => {
    const session = await sessions.getOrCreateTestSession('topic', 'test-1');
    expect(await answers.revealAnswer(session.id)).toMatchObject({
      exerciseId: 'exercise-1',
      correct: false,
      skipped: true,
    });
    expect(mistakeCount(store.learnerState())).toBe(0);
    expect(await answers.advanceSession(session.id)).toMatchObject({
      correctCount: 0,
      incorrectCount: 0,
      skippedCount: 1,
      total: 1,
      percentage: 0,
    });
  });

  it('does not resolve an existing mistake when its answer is revealed', async () => {
    await completeAnswer('talossä');
    const practice = await sessions.getOrCreateMistakeSession('topic');
    await answers.revealAnswer(practice!.id);
    await answers.advanceSession(practice!.id);

    expect(mistakeCount(store.learnerState())).toBe(1);
  });

  it('stores shared versioned lesson completion and clears it only with the topic', async () => {
    expect(lessonProgressForTest(store.learnerState(), store.packs(), 'topic', 'test-1')).toEqual({
      completed: 0,
      total: 1,
    });
    await lessons.completeLesson('lesson-1');
    await clearing.clearTest('topic', 'test-1');
    expect(lessonProgressForTest(store.learnerState(), store.packs(), 'topic', 'test-2')).toEqual({
      completed: 1,
      total: 1,
    });

    await clearing.clearTopic('topic');
    expect(
      lessonProgressForTest(store.learnerState(), store.packs(), 'topic', 'test-2').completed,
    ).toBe(0);
  });

  it('saves, backs up, restores, and deliberately clears learner notes', async () => {
    await notes.save('topic', undefined, 'Review vowel harmony.');
    await notes.save('topic', 'lesson-1', 'Remember the back vowels.');
    const backup = backups.create();

    await clearing.clearTest('topic', 'test-1');
    expect(store.learnerState().learnerNotes).toHaveLength(2);

    await clearing.clearTopic('topic');
    expect(store.learnerState().learnerNotes).toEqual([]);

    await backups.restore(backup);
    expect(store.learnerState().learnerNotes?.map((note) => note.text)).toEqual([
      'Review vowel harmony.',
      'Remember the back vowels.',
    ]);

    await clearing.clearAll();
    expect(store.learnerState().learnerNotes).toEqual([]);
  });

  it('rejects note scopes that are not installed', async () => {
    const backup = backups.create();
    backup.state.learnerNotes = [
      {
        topicId: 'topic',
        lessonId: 'missing',
        text: 'Orphaned note',
        updatedAt: backup.exportedAt,
      },
    ];

    await expect(backups.restore(backup)).rejects.toThrowError(
      'This backup refers to note topics or lessons that are not installed.',
    );
  });

  it('rejects backup references to unavailable content or incompatible corrections', async () => {
    const missingLesson = backups.create();
    missingLesson.state.lessonCompletions = [
      { lessonId: 'missing', lessonVersion: '1.0.0', completedAt: missingLesson.exportedAt },
    ];
    await expect(backups.restore(missingLesson)).rejects.toThrowError(
      'This backup refers to lessons that are not installed in this app.',
    );

    const missingVersion = backups.create();
    missingVersion.state.contentPackVersions = {};
    missingVersion.state.unresolvedMistakeIds = ['exercise-1'];
    await expect(backups.restore(missingVersion)).rejects.toThrowError(
      'This backup does not identify the exercise-pack versions it uses.',
    );

    const incompatible = backups.create();
    incompatible.state.correctionRecords = [
      {
        exerciseId: 'exercise-1',
        parallelExerciseId: 'exercise-2',
        targetSkill: 'Different skill',
        correctedAt: incompatible.exportedAt,
        nextReviewAt: '2026-08-19T00:00:00.000Z',
        reviewStage: 0,
        reviewAttempts: 0,
      },
    ];
    await expect(backups.restore(incompatible)).rejects.toThrowError(
      'This backup contains incompatible correction and mastery data.',
    );
  });

  async function completeAnswer(answer: string): Promise<void> {
    const session = await sessions.getOrCreateTestSession('topic', 'test-1');
    await answers.submitAnswer(session.id, answer);
    await answers.advanceSession(session.id);
  }
});

describe('content-pack version alignment', () => {
  it('migrates a compatible legacy single-pack state', () => {
    const oldState = createEmptyLearnerState();
    delete oldState.contentPackVersions;
    oldState.contentPackVersion = '1.0.0';

    expect(alignLearnerStateWithPacks(oldState, [learningPack]).contentPackVersions).toEqual({
      topic: '1.0.0',
    });
  });

  it('preserves compatible data and records newly installed packs', () => {
    const state = createEmptyLearnerState({ topic: '1.0.0' });
    state.unresolvedMistakeIds = ['exercise-1'];
    const secondPack = renamedPack('topic-two', '2.0.0');

    const aligned = alignLearnerStateWithPacks(state, [learningPack, secondPack]);
    expect(aligned.unresolvedMistakeIds).toEqual(['exercise-1']);
    expect(aligned.contentPackVersions).toEqual({ topic: '1.0.0', 'topic-two': '2.0.0' });
  });

  it('clears only the topic whose installed version changed', () => {
    const secondPack = renamedPack('topic-two', '2.0.0');
    const state = createEmptyLearnerState({ topic: '0.9.0', 'topic-two': '2.0.0' });
    state.unresolvedMistakeIds = ['exercise-1', 'topic-two-exercise-1'];
    state.attempts = [
      completedAttempt('old-topic-attempt', 'topic', 'test-1'),
      completedAttempt('other-topic-attempt', 'topic-two', 'topic-two-test-1'),
    ];
    state.learnerNotes = [
      {
        topicId: 'topic',
        text: 'Keep this topic note.',
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
    ];

    const aligned = alignLearnerStateWithPacks(state, [learningPack, secondPack]);
    expect(aligned.attempts.map((attempt) => attempt.id)).toEqual(['other-topic-attempt']);
    expect(aligned.unresolvedMistakeIds).toEqual(['topic-two-exercise-1']);
    expect(aligned.learnerNotes?.map((note) => note.text)).toEqual(['Keep this topic note.']);
  });
});

function renamedPack(id: string, version: string): TopicPack {
  const pack = structuredClone(learningPack);
  pack.id = id;
  pack.version = version;
  pack.lessons[0].id = `${id}-lesson`;
  pack.lessons[0].practiceExercises = pack.lessons[0].practiceExercises.map((exercise, index) => ({
    ...exercise,
    id: `${id}-practice-${index + 1}`,
  }));
  pack.tests = pack.tests.map((test, testIndex) => ({
    ...test,
    id: `${id}-test-${testIndex + 1}`,
    lessonIds: [`${id}-lesson`],
    exercises: test.exercises.map((exercise, exerciseIndex) => ({
      ...exercise,
      id: `${id}-exercise-${testIndex + exerciseIndex + 1}`,
      parallelExerciseId: `${id}-exercise-${testIndex === 0 ? 2 : 1}`,
    })),
  }));
  return pack;
}

function completedAttempt(id: string, topicId: string, testId: string) {
  return {
    id,
    mode: 'test' as const,
    topicId,
    testId,
    title: 'Attempt',
    startedAt: '2026-08-18T00:00:00.000Z',
    completedAt: '2026-08-18T00:01:00.000Z',
    answers: [],
    correctCount: 1,
    total: 1,
    percentage: 100,
  };
}

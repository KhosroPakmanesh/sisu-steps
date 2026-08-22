import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { routePaths } from '@/shared/navigation/route-paths';
import { ExerciseTest, Lesson } from '../shared/content/content.models';
import { findTest, lessonsForTest } from '../shared/content/content.queries';
import { isLessonCompleted } from '../shared/progress/progress.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';
import { LessonPracticeComponent } from './lesson-practice.component';
import { LessonProgressService } from './lesson-progress.service';

@Component({
  selector: 'app-lesson',
  imports: [LessonPracticeComponent, RouterLink],
  templateUrl: './lesson.page.html',
  styleUrl: './lesson.page.css',
})
export class LessonPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly lessonProgress = inject(LessonProgressService);
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = routePaths;
  protected readonly topicId = signal('');
  protected readonly test = signal<ExerciseTest | null>(null);
  protected readonly lessons = signal<Lesson[]>([]);
  protected readonly lessonIndex = signal(0);
  protected readonly pageError = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly preparationFinished = signal(false);
  protected readonly currentLesson = computed(() => this.lessons()[this.lessonIndex()]);
  protected readonly completedCount = computed(
    () => this.lessons().filter((lesson) => this.isCompleted(lesson)).length,
  );

  async ngOnInit(): Promise<void> {
    await this.store.ready;
    if (this.store.error()) return;
    const topicId = this.route.snapshot.paramMap.get('topicId') ?? '';
    const testId = this.route.snapshot.paramMap.get('testId') ?? '';
    const test = findTest(this.store.packs(), topicId, testId);
    if (!test) {
      this.pageError.set('That test could not be found.');
      return;
    }
    const lessons = lessonsForTest(this.store.packs(), topicId, test.id);
    if (lessons.length === 0) {
      this.pageError.set('The preparation lessons for this test could not be found.');
      return;
    }
    this.topicId.set(topicId);
    this.test.set(test);
    this.lessons.set(lessons);
    const firstUnread = lessons.findIndex((lesson) => !this.isCompleted(lesson));
    this.lessonIndex.set(firstUnread >= 0 ? firstUnread : 0);
  }

  protected isCompleted(lesson: Lesson): boolean {
    return isLessonCompleted(this.store.learnerState(), lesson);
  }

  protected openLesson(index: number): void {
    if (index < 0 || index >= this.lessons().length) return;
    this.lessonIndex.set(index);
    this.preparationFinished.set(false);
  }

  protected openLessonFromSelect(event: Event): void {
    this.openLesson(Number((event.currentTarget as HTMLSelectElement).value));
  }

  protected async finishLesson(): Promise<void> {
    const lesson = this.currentLesson();
    if (!lesson || this.busy()) return;
    this.busy.set(true);
    this.pageError.set(null);
    try {
      if (!this.isCompleted(lesson)) await this.lessonProgress.completeLesson(lesson.id);
      if (this.lessonIndex() < this.lessons().length - 1) {
        this.openLesson(this.lessonIndex() + 1);
      } else this.preparationFinished.set(true);
    } catch (error) {
      this.pageError.set(
        error instanceof Error ? error.message : 'Lesson completion could not be saved.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}

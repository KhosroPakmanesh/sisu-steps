import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { learningPaths } from '../shared/navigation/learning.paths';
import { RouteReadiness } from '../shared/navigation/route-readiness';
import { getTestProgress } from '../shared/progress/test-progress.queries';
import { TopicPack, TopicPackSummary } from '../shared/content/content.models';
import { findPackSummary } from '../shared/content/content.queries';
import {
  findModeSession,
  findTestSession,
  lessonProgressForTest,
} from '../shared/progress/progress.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';
import { StickyNoteComponent } from '../shared/notes/sticky-note.component';
import { getTopicSummary } from './topic-catalog.queries';

@Component({
  selector: 'app-topic',
  imports: [RouterLink, StickyNoteComponent],
  templateUrl: './topic.page.html',
  styleUrl: './topic.page.css',
})
export class TopicPage implements RouteReadiness {
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = learningPaths;
  protected readonly pack = signal<TopicPack | null>(null);
  protected readonly packSummary = signal<TopicPackSummary | null>(null);
  protected readonly pageError = signal<string | null>(null);
  protected readonly errorMessage = computed(() => this.pageError() ?? this.store.error());
  protected readonly summary = computed(() => {
    const pack = this.packSummary();
    return pack
      ? getTopicSummary(this.store.learnerState(), this.store.packSummaries(), pack)
      : null;
  });
  readonly routeRenderReady = this.initialize();

  private async initialize(): Promise<void> {
    await this.store.ready;
    if (this.store.error()) return;
    const topicId = this.route.snapshot.paramMap.get('topicId') ?? '';
    const summary = findPackSummary(this.store.packSummaries(), topicId);
    if (!summary) {
      this.pageError.set('That topic pack could not be found.');
      return;
    }
    try {
      this.pack.set((await this.store.loadPack(topicId)).pack);
      this.packSummary.set(summary);
    } catch (error) {
      this.pageError.set(
        error instanceof Error ? error.message : 'That topic pack could not load.',
      );
    }
  }

  protected reviewSession(topicId: string) {
    return findModeSession(this.store.learnerState(), topicId, 'review');
  }

  protected testSession(topicId: string, testId: string) {
    return findTestSession(this.store.learnerState(), topicId, testId);
  }

  protected testProgress(pack: TopicPack, testId: string) {
    return getTestProgress(this.store.learnerState(), pack, testId);
  }

  protected lessonProgress(topicId: string, testId: string) {
    return lessonProgressForTest(
      this.store.learnerState(),
      this.store.packSummaries(),
      topicId,
      testId,
    );
  }
}

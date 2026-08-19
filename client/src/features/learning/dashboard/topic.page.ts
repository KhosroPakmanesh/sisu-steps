import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { routePaths } from '@/shared/navigation/route-paths';
import { getTestReport } from '../reports/report.queries';
import { TopicPack } from '../shared/content/content.models';
import { findPack } from '../shared/content/content.queries';
import {
  findModeSession,
  findTestSession,
  lessonProgressForTest,
} from '../shared/progress/progress.queries';
import { LearningStateStore } from '../shared/state/learning-state.store';
import { getTopicSummary } from './dashboard.queries';

@Component({
  selector: 'app-topic',
  imports: [RouterLink],
  templateUrl: './topic.page.html',
  styleUrl: './topic.page.css',
})
export class TopicPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(LearningStateStore);
  protected readonly paths = routePaths;
  protected readonly pack = signal<TopicPack | null>(null);
  protected readonly pageError = signal<string | null>(null);
  protected readonly errorMessage = computed(() => this.pageError() ?? this.store.error());
  protected readonly summary = computed(() => {
    const pack = this.pack();
    return pack ? getTopicSummary(this.store.learnerState(), this.store.packs(), pack) : null;
  });

  async ngOnInit(): Promise<void> {
    await this.store.ready;
    if (this.store.error()) return;
    const topicId = this.route.snapshot.paramMap.get('topicId') ?? '';
    const pack = findPack(this.store.packs(), topicId);
    if (!pack) {
      this.pageError.set('That topic pack could not be found.');
      return;
    }
    this.pack.set(pack);
  }

  protected reviewSession(topicId: string) {
    return findModeSession(this.store.learnerState(), topicId, 'review');
  }

  protected testSession(topicId: string, testId: string) {
    return findTestSession(this.store.learnerState(), topicId, testId);
  }

  protected testReport(pack: TopicPack, testId: string) {
    return getTestReport(this.store.learnerState(), pack, testId);
  }

  protected lessonProgress(topicId: string, testId: string) {
    return lessonProgressForTest(this.store.learnerState(), this.store.packs(), topicId, testId);
  }
}

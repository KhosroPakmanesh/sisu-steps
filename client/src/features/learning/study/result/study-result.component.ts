import { Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findPackSummary } from '../../shared/content/content.queries';
import { learningPaths } from '../../shared/navigation/learning.paths';
import { mistakeCount } from '../../shared/progress/progress-statistics.queries';
import { CompletedAttempt } from '../../shared/state/learner-state.models';
import { LearningStateStore } from '../../shared/state/learning-state.store';

@Component({
  selector: 'app-study-result',
  imports: [RouterLink],
  templateUrl: './study-result.component.html',
  styleUrl: './study-result.component.css',
})
export class StudyResultComponent {
  private readonly store = inject(LearningStateStore);
  private readonly resultAction = viewChild<ElementRef<HTMLAnchorElement>>('resultAction');
  readonly result = input.required<CompletedAttempt>();
  protected readonly paths = learningPaths;
  protected readonly hasMistakes = computed(
    () =>
      mistakeCount(
        this.store.learnerState(),
        findPackSummary(this.store.packSummaries(), this.result().topicId),
      ) > 0,
  );

  focusPrimaryAction(): void {
    this.resultAction()?.nativeElement.focus();
  }
}

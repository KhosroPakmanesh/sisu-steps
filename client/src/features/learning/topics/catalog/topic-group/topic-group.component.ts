import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TopicGroupDisclosureDirective } from '../../../shared/topic-group/topic-group-disclosure.directive';
import { learningPaths } from '../../../shared/navigation/learning.paths';
import { LearningStateStore } from '../../../shared/state/learning-state.store';
import { TopicGroupSummary } from '../topic-catalog.queries';
import { GrammarReferenceComponent } from '../grammar-reference/modal/grammar-reference.component';

@Component({
  selector: 'app-topic-group',
  imports: [RouterLink, GrammarReferenceComponent],
  hostDirectives: [TopicGroupDisclosureDirective],
  templateUrl: './topic-group.component.html',
  styleUrls: [
    '../../../shared/topic-group/topic-group-disclosure.css',
    '../../../shared/styles/topic-card-layout.css',
    './topic-group.component.css',
  ],
})
export class TopicGroupComponent {
  readonly group = input.required<TopicGroupSummary>();
  protected readonly referenceGroup = computed(() => ({
    id: this.group().id,
    title: this.group().title,
    packs: this.group().packs.map(({ pack }) => pack),
  }));
  private readonly store = inject(LearningStateStore);
  protected readonly disclosure = inject(TopicGroupDisclosureDirective);
  protected readonly paths = learningPaths;

  protected toggle(event: Event): void {
    this.disclosure.toggle(event, () => this.store.loadGroupMetadata(this.group().id));
  }
}

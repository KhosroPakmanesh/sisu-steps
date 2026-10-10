import { Component, inject, input } from '@angular/core';
import { TopicGroupDisclosureDirective } from '../../../../shared/topic-group/topic-group-disclosure.directive';
import { GrammarReferenceLesson } from '../grammar-reference.models';

@Component({
  selector: 'app-grammar-reference-examples',
  hostDirectives: [TopicGroupDisclosureDirective],
  templateUrl: './grammar-reference-examples.component.html',
  styleUrls: [
    '../../../../shared/topic-group/topic-group-disclosure.css',
    '../../../../shared/styles/worked-example-cards.css',
    './grammar-reference-examples.component.css',
  ],
})
export class GrammarReferenceExamplesComponent {
  readonly lesson = input.required<GrammarReferenceLesson>();
  readonly headingLevel = input.required<4 | 5>();
  protected readonly disclosure = inject(TopicGroupDisclosureDirective);

  protected toggle(event: Event): void {
    this.disclosure.toggle(event);
  }
}

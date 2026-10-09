import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { animateTopicGroup } from './topic-group.animations';
import { keepTopicGroupVisible } from './topic-group.viewport';

@Directive({
  selector: '[appTopicGroupDisclosure]',
  exportAs: 'topicGroupDisclosure',
  host: {
    class: 'topic-group',
    '[class.expanded]': 'expanded()',
    '[class.animating]': 'animating()',
  },
})
export class TopicGroupDisclosureDirective {
  readonly expanded = signal(false);
  readonly animating = signal(false);
  readonly loaded = signal(false);
  readonly loading = signal(false);
  readonly loadError = signal(false);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private animations: Animation[] = [];
  private animationVersion = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.animationVersion++;
      this.stopAnimations();
    });
  }

  toggle(event: Event, loadContent?: () => Promise<void>): void {
    event.preventDefault();
    if (event.currentTarget instanceof HTMLButtonElement) {
      this.element.querySelector<HTMLElement>('summary')!.focus({ preventScroll: true });
    }
    const before = this.element.getBoundingClientRect();
    this.stopAnimations();
    const version = ++this.animationVersion;
    this.loadError.set(false);
    if (this.loading()) {
      this.loading.set(false);
      return;
    }
    if (!this.expanded() && !this.loaded() && loadContent) {
      void this.loadGroup(version, loadContent);
      return;
    }
    this.loaded.set(true);
    this.changeExpansion(before, !this.expanded(), version);
  }

  private async loadGroup(version: number, loadContent: () => Promise<void>): Promise<void> {
    this.loading.set(true);
    try {
      await loadContent();
      if (version !== this.animationVersion) return;
      this.loading.set(false);
      this.loaded.set(true);
      this.changeExpansion(this.element.getBoundingClientRect(), true, version);
    } catch {
      if (version !== this.animationVersion) return;
      this.loading.set(false);
      this.loadError.set(true);
    }
  }

  private changeExpansion(before: DOMRect, opening: boolean, version: number): void {
    this.expanded.set(opening);
    afterNextRender(
      () => {
        if (version === this.animationVersion) this.animate(before, opening, version);
      },
      { injector: this.injector },
    );
  }

  private animate(before: DOMRect, opening: boolean, version: number): void {
    this.animations = animateTopicGroup(
      this.element,
      this.element.querySelector<HTMLElement>('.group-cards')!,
      before,
      opening,
    );
    if (!this.animations.length) {
      if (opening) keepTopicGroupVisible(this.element);
      return;
    }
    this.animating.set(true);
    // Release fixed geometry after completion; a newer toggle owns cancellation cleanup.
    void Promise.all(this.animations.map((animation) => animation.finished))
      .then(() => {
        if (version === this.animationVersion) {
          this.stopAnimations();
          if (opening) keepTopicGroupVisible(this.element);
        }
      })
      .catch(() => undefined);
  }

  private stopAnimations(): void {
    for (const animation of this.animations) animation.cancel();
    this.animations = [];
    this.animating.set(false);
  }
}

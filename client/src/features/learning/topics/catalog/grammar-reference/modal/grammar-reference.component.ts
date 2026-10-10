import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { isDialogBackdropClick } from '@/shared/browser/dialog-backdrop';
import { GrammarReferenceExamplesComponent } from '../examples/grammar-reference-examples.component';
import { GrammarReferenceRepository } from '../grammar-reference.repository';
import { GrammarReferencePack, GrammarReferenceTarget } from '../grammar-reference.models';

@Component({
  selector: 'app-grammar-reference',
  host: { '[class.pack-reference]': "target().kind === 'pack'" },
  imports: [GrammarReferenceExamplesComponent],
  templateUrl: './grammar-reference.component.html',
  styleUrls: [
    './grammar-reference.component.css',
    '../../../../shared/styles/worked-example-cards.css',
  ],
})
export class GrammarReferenceComponent {
  readonly target = input.required<GrammarReferenceTarget>();
  protected readonly reference = computed(() => {
    const target = this.target();
    return target.kind === 'group'
      ? { id: 'group-' + target.group.id, title: target.group.title, packs: target.group.packs }
      : { id: 'pack-' + target.pack.id, title: target.pack.title, packs: [target.pack] };
  });
  private readonly repository = inject(GrammarReferenceRepository);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  protected readonly packs = signal<GrammarReferencePack[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal(false);
  private loadVersion = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.loadVersion++);
  }

  protected open(): void {
    const dialog = this.dialog()!.nativeElement;
    if (dialog.open) return;
    dialog.showModal();
    this.closeButton()!.nativeElement.focus({ preventScroll: true });
    void this.load();
  }

  protected async load(): Promise<void> {
    const version = ++this.loadVersion;
    const reference = this.reference();
    this.loadError.set(false);
    this.loading.set(true);
    this.closeButton()!.nativeElement.focus({ preventScroll: true });
    try {
      const packs: GrammarReferencePack[] = [];
      // Load one pack at a time; dismissal stops subsequent pack requests.
      for (const summary of reference.packs) {
        packs.push(await this.repository.load(summary));
        if (version !== this.loadVersion) return;
      }
      this.packs.set(packs);
    } catch {
      if (version === this.loadVersion) this.loadError.set(true);
    } finally {
      if (version === this.loadVersion) this.loading.set(false);
    }
  }

  protected close(event?: Event): void {
    event?.preventDefault();
    this.dialog()?.nativeElement.close();
    this.clear();
  }

  protected dismissFromBackdrop(event: MouseEvent): void {
    const dialog = this.dialog()!.nativeElement;
    if (isDialogBackdropClick(event, dialog)) this.close();
  }

  protected handleClosed(): void {
    if (this.dialog()?.nativeElement.open) return;
    this.clear();
    queueMicrotask(() => {
      const trigger = this.trigger()?.nativeElement;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    });
  }

  private clear(): void {
    this.loadVersion++;
    this.packs.set([]);
    this.loading.set(false);
    this.loadError.set(false);
  }
}

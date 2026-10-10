import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GrammarReferenceComponent } from '@/features/learning/topics/catalog/grammar-reference/modal/grammar-reference.component';
import { GrammarReferenceRepository } from '@/features/learning/topics/catalog/grammar-reference/grammar-reference.repository';
import { GrammarReferencePack } from '@/features/learning/topics/catalog/grammar-reference/grammar-reference.models';
import { learningPack } from '@testing/helpers/unit/learning-content.fixture';
import { topicPackToSummary } from '@/features/learning/shared/content/pack-summary.mapper';

const reference: GrammarReferencePack = {
  id: learningPack.id,
  title: learningPack.title,
  lessons: learningPack.lessons.map((lesson) => ({
    id: lesson.id,
    title: learningPack.tests.find(
      (test) => test.stage === 'focused' && test.lessonIds.includes(lesson.id),
    )!.title,
    summary: lesson.summary,
    examples: lesson.examples.map(({ finnish, english }) => ({ finnish, english })),
  })),
};

describe('GrammarReferenceComponent', () => {
  let fixture: ComponentFixture<GrammarReferenceComponent>;
  const load = vi.fn<GrammarReferenceRepository['load']>();
  let trigger: HTMLButtonElement, dialog: HTMLDialogElement;

  afterEach(() => vi.unstubAllGlobals());

  beforeEach(async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    load.mockReset().mockResolvedValue(reference);
    await TestBed.configureTestingModule({
      imports: [GrammarReferenceComponent],
      providers: [{ provide: GrammarReferenceRepository, useValue: { load } }],
    }).compileComponents();
    fixture = TestBed.createComponent(GrammarReferenceComponent);
    fixture.componentRef.setInput('target', {
      kind: 'group',
      group: {
        id: 'foundations',
        title: 'Foundations',
        packs: [topicPackToSummary(learningPack)],
      },
    });
    fixture.detectChanges();
    trigger = fixture.nativeElement.querySelector('button');
    dialog = fixture.nativeElement.querySelector('dialog');
    dialog.scrollBy = vi.fn();
  });

  it('loads only on activation, displays existing content, and restores focus after dismissal', async () => {
    expect(load).not.toHaveBeenCalled();
    trigger.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain(reference.lessons[0].summary);
    expect(dialog.querySelector('.reference-example')).toBeNull();
    (dialog.querySelector('.topic-group-toggle') as HTMLElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(dialog.querySelector('details')?.open).toBe(true);
    expect([...dialog.querySelectorAll('strong[lang="fi"]')].map((e) => e.textContent)).toEqual(
      reference.lessons[0].examples.map((example) => example.finnish),
    );
    expect(dialog.querySelector('.reference-example ol')).toBeNull();
    expect(document.activeElement?.getAttribute('aria-label')).toBe(
      'Close grammar reference for Foundations',
    );
    (dialog.querySelector('.modal-sheet__close') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(dialog.querySelector('.reference-lesson')).toBeNull();
  });

  it('shows only the selected pack, with one pack heading and ordered lesson headings', async () => {
    const summary = topicPackToSummary(learningPack);
    fixture.componentRef.setInput('target', { kind: 'pack', pack: summary });
    fixture.detectChanges();
    expect(load).not.toHaveBeenCalled();
    expect(trigger.title).toBe('Grammar reference for ' + summary.title);
    trigger.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(load).toHaveBeenCalledExactlyOnceWith(summary);
    expect(dialog.querySelector('h2')?.textContent).toBe(summary.title);
    expect(dialog.querySelector('.reference-pack > h3')).toBeNull();
    expect(
      [...dialog.querySelectorAll('.reference-lesson h3')].map((h) => h.textContent?.trim()),
    ).toEqual(reference.lessons.map((lesson) => lesson.title));
    expect(dialog.querySelector('.reference-lesson > h4')).toBeNull();
    (dialog.querySelector('.modal-sheet__close') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps group and pack heading IDs unique when they contain the same lessons', async () => {
    trigger.click();
    await fixture.whenStable();
    fixture.detectChanges();
    const packFixture = TestBed.createComponent(GrammarReferenceComponent);
    packFixture.componentRef.setInput('target', {
      kind: 'pack',
      pack: topicPackToSummary(learningPack),
    });
    packFixture.detectChanges();
    (packFixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    await packFixture.whenStable();
    packFixture.detectChanges();
    const ids = [fixture, packFixture].flatMap((current) =>
      [...(current.nativeElement as HTMLElement).querySelectorAll('[id]')].map(
        (element) => element.id,
      ),
    );
    expect(new Set(ids).size).toBe(ids.length);
    packFixture.destroy();
  });

  it('provides retry after failure and returns focus to the stable close control', async () => {
    load.mockRejectedValueOnce(new Error('Unavailable'));
    trigger.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(dialog.querySelector('[role="alert"]')).toBeTruthy();
    (dialog.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(dialog.querySelector('[role="alert"]')).toBeNull();
    expect(dialog.querySelector('.reference-lesson')).toBeTruthy();
    expect(document.activeElement).toBe(dialog.querySelector('.modal-sheet__close'));
  });

  it('ignores a dismissed pending result and stops loading the remaining packs', async () => {
    let resolve!: (value: GrammarReferencePack) => void;
    load.mockReturnValueOnce(
      new Promise((accept) => {
        resolve = accept;
      }),
    );
    fixture.componentRef.setInput('target', {
      kind: 'group',
      group: {
        id: 'foundations',
        title: 'Foundations',
        packs: [
          topicPackToSummary(learningPack),
          { ...topicPackToSummary(learningPack), id: 'second' },
        ],
      },
    });
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();
    expect(dialog.querySelector('[role="status"]')).toBeTruthy();
    (dialog.querySelector('.modal-sheet__close') as HTMLButtonElement).click();
    resolve(reference);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(load).toHaveBeenCalledTimes(1);
    expect(dialog.open).toBe(false);
    expect(dialog.querySelector('.reference-lesson')).toBeNull();
  });
});

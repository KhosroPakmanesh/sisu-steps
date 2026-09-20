import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuestionVocabularyDialogComponent } from '@/features/learning/study/vocabulary/question-vocabulary-dialog.component';
import { learningPack } from '@testing/helpers/unit/learning-content.fixture';

describe('QuestionVocabularyDialogComponent', () => {
  let fixture: ComponentFixture<QuestionVocabularyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionVocabularyDialogComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(QuestionVocabularyDialogComponent);
    fixture.componentRef.setInput('pack', structuredClone(learningPack));
    fixture.componentRef.setInput('exercise', structuredClone(learningPack.tests[0].exercises[0]));
    fixture.detectChanges();
  });

  it('starts closed, opens with the current words, and restores trigger focus', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const trigger = element.querySelector('.cheat-mode-access button') as HTMLButtonElement;
    const dialog = element.querySelector('dialog') as HTMLDialogElement;

    expect(dialog.open).toBe(false);
    trigger.click();
    fixture.detectChanges();

    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain('talo');
    expect(dialog.textContent).toContain('house');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Close Cheat mode');

    (element.querySelector('.modal-sheet__close') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes from a backdrop click but not a click inside the sheet', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const trigger = element.querySelector('.cheat-mode-access button') as HTMLButtonElement;
    const dialog = element.querySelector('dialog') as HTMLDialogElement;
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue(rectangle(100, 100, 400, 400));
    trigger.click();

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 150, clientY: 150 }));
    expect(dialog.open).toBe(true);

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));
    await fixture.whenStable();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes without returning focus when the question changes', () => {
    const element = fixture.nativeElement as HTMLElement;
    const dialog = element.querySelector('dialog') as HTMLDialogElement;
    (element.querySelector('.cheat-mode-access button') as HTMLButtonElement).click();
    expect(dialog.open).toBe(true);

    fixture.componentRef.setInput('exercise', structuredClone(learningPack.tests[1].exercises[0]));
    fixture.detectChanges();

    expect(dialog.open).toBe(false);
  });

  it('omits cheat mode when the current question has no declared vocabulary', () => {
    const exercise = structuredClone(learningPack.tests[0].exercises[0]);
    exercise.vocabulary = [];
    fixture.componentRef.setInput('exercise', exercise);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.cheat-mode-access')).toBeNull();
    expect(fixture.nativeElement.querySelector('dialog')).toBeNull();
  });
});

function rectangle(left: number, top: number, right: number, bottom: number): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
    toJSON: () => ({}),
  };
}

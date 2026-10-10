import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { keepTopicGroupVisible } from '@/features/learning/shared/topic-group/topic-group.viewport';

describe('topic-group viewport alignment', () => {
  let element: HTMLElement;
  let dialog: HTMLDialogElement;
  const modalScroll = vi.fn();
  const pageScroll = vi.fn();

  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    );
    vi.stubGlobal('scrollBy', pageScroll);
    modalScroll.mockReset();
    pageScroll.mockReset();
    element = document.createElement('section');
    element.style.scrollMarginTop = '16px';
    dialog = document.createElement('dialog');
    dialog.scrollBy = modalScroll;
    Object.defineProperties(dialog, { clientHeight: { value: 500 }, clientTop: { value: 1 } });
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 100, 544, 502));
    dialog.append(element);
    document.body.append(dialog);
  });

  afterEach(() => {
    dialog.remove();
    element.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('leaves a fully visible disclosure and the background page stationary', () => {
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 200, 400, 100));
    keepTopicGroupVisible(element);
    expect(modalScroll).not.toHaveBeenCalled();
    expect(pageScroll).not.toHaveBeenCalled();
  });

  it('scrolls the modal minimally to show a short disclosure', () => {
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 500, 400, 100));
    keepTopicGroupVisible(element);
    expect(modalScroll).toHaveBeenCalledExactlyOnceWith({ top: 15, behavior: 'smooth' });
    expect(pageScroll).not.toHaveBeenCalled();
  });

  it('aligns a tall disclosure inside the modal immediately with reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 350, 400, 800));
    keepTopicGroupVisible(element);
    expect(modalScroll).toHaveBeenCalledExactlyOnceWith({ top: 233, behavior: 'instant' });
    expect(pageScroll).not.toHaveBeenCalled();
  });

  it('continues scrolling the page for disclosures outside a modal', () => {
    document.body.append(element);
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, window.innerHeight + 20, 400, 100),
    );
    keepTopicGroupVisible(element);
    expect(pageScroll).toHaveBeenCalledExactlyOnceWith({ top: 136, behavior: 'smooth' });
    expect(modalScroll).not.toHaveBeenCalled();
  });
});

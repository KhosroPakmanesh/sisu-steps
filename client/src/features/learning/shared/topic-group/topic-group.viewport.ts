export function keepTopicGroupVisible(element: HTMLElement): void {
  const header = element.ownerDocument.querySelector<HTMLElement>('.site-header');
  const position = header && getComputedStyle(header).position;
  const headerBottom =
    header && (position === 'sticky' || position === 'fixed')
      ? Math.max(0, header.getBoundingClientRect().bottom)
      : 0;
  const gap = Number.parseFloat(getComputedStyle(element).scrollMarginTop);
  const dialog = element.closest('dialog');
  const viewport = dialog?.getBoundingClientRect();
  const top = viewport ? viewport.top + dialog!.clientTop + gap : headerBottom + gap;
  const bottom = viewport
    ? viewport.top + dialog!.clientTop + dialog!.clientHeight - gap
    : window.innerHeight - gap;
  const bounds = element.getBoundingClientRect();
  if (bounds.top >= top && bounds.bottom <= bottom) return;
  // Fit a short group with the smallest scroll; start taller groups below the header.
  const delta =
    bounds.height > bottom - top || bounds.top < top ? bounds.top - top : bounds.bottom - bottom;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  (dialog ?? window).scrollBy({ top: delta, behavior: reducedMotion ? 'instant' : 'smooth' });
}

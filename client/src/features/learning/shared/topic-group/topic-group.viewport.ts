export function keepTopicGroupVisible(element: HTMLElement): void {
  const header = element.ownerDocument.querySelector<HTMLElement>('.site-header');
  const position = header && getComputedStyle(header).position;
  const headerBottom =
    header && (position === 'sticky' || position === 'fixed')
      ? Math.max(0, header.getBoundingClientRect().bottom)
      : 0;
  const gap = Number.parseFloat(getComputedStyle(element).scrollMarginTop);
  const top = headerBottom + gap;
  const bottom = window.innerHeight - gap;
  const bounds = element.getBoundingClientRect();
  if (bounds.top >= top && bounds.bottom <= bottom) return;
  // Fit a short group with the smallest scroll; start taller groups below the header.
  const delta =
    bounds.height > bottom - top || bounds.top < top ? bounds.top - top : bounds.bottom - bottom;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollBy({ top: delta, behavior: reducedMotion ? 'instant' : 'smooth' });
}

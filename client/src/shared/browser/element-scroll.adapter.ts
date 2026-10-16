export function scrollElementIntoView(element: HTMLElement | undefined): void {
  if (!element) return;
  const reducedMotion = element.ownerDocument.defaultView?.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  element.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'instant' : 'smooth' });
}

export function animateTopicGroup(
  element: HTMLElement,
  cards: HTMLElement,
  before: DOMRect,
  opening: boolean,
): Animation[] {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return [];
  const after = element.getBoundingClientRect();
  const changesWidth = Math.abs(after.width - before.width) > 1;
  const token = changesWidth ? '--motion-page' : '--motion-standard';
  const duration = Number.parseFloat(getComputedStyle(element).getPropertyValue(token));
  const origin = `${before.x - after.x}px ${before.y - after.y}px`;
  const first = { width: `${before.width}px`, height: `${before.height}px`, translate: origin };
  const last = { width: `${after.width}px`, height: `${after.height}px`, translate: '0 0' };
  const frames: Keyframe[] = [first];
  if (changesWidth) {
    frames.push(
      opening
        ? { ...last, height: first.height, offset: 0.5 }
        : { ...first, height: last.height, offset: 0.5 },
    );
  }
  frames.push(last);
  const animations = [element.animate(frames, { duration, easing: 'ease-in-out', fill: 'both' })];
  if (opening) {
    animations.push(
      cards.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: changesWidth ? duration / 2 : duration,
        delay: changesWidth ? duration / 2 : 0,
        fill: 'both',
      }),
    );
  }
  return animations;
}

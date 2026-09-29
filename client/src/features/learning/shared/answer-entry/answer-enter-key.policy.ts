export type AnswerEnterAction = 'block' | 'continue' | 'submit' | null;

export function answerEnterAction(
  event: KeyboardEvent,
  hasFeedback: boolean,
  canSubmit: boolean,
): AnswerEnterAction {
  if (event.repeat) return 'block';
  if (hasFeedback) return 'continue';
  if (
    event.defaultPrevented ||
    event.isComposing ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return null;
  }
  const target = event.target;
  if (!(target instanceof HTMLElement)) return null;
  if (target.closest('a, button:not(.submit-button)')) return null;
  const isAnswerControl =
    target.matches('input[type="text"], input[type="radio"]') || !!target.closest('.submit-button');
  return isAnswerControl && canSubmit ? 'submit' : null;
}

export type StudyEnterAction = 'block' | 'continue' | 'submit' | null;

export function studyEnterAction(
  event: KeyboardEvent,
  hasFeedback: boolean,
  canSubmit: boolean,
): StudyEnterAction {
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

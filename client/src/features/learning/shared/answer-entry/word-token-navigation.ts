export function wordTokenArrowStep(event: KeyboardEvent): -1 | 1 | null {
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
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') return -1;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') return 1;
  return null;
}

export function nextAvailableWordIndex(
  tokenCount: number,
  selectedIndexes: readonly number[],
  currentIndex: number,
  step: -1 | 1 = 1,
): number | null {
  const selected = new Set(selectedIndexes);
  for (let offset = 1; offset <= tokenCount; offset += 1) {
    const index = (currentIndex + step * offset + tokenCount) % tokenCount;
    if (!selected.has(index)) return index;
  }
  return null;
}

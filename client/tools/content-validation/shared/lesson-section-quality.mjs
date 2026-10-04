export function validateLessonSectionResponsibilities(lessons) {
  const errors = [];
  for (const lesson of lessons) {
    const vocabulary = [
      ...(lesson.introducedVocabulary ?? []),
      ...(lesson.reusedVocabulary ?? []),
      ...(lesson.suppliedVocabulary ?? []),
    ];
    for (const section of lesson.sections ?? []) {
      const repeatedWords = new Set();
      for (const line of [...(section.paragraphs ?? []), ...(section.keyPoints ?? [])]) {
        if (typeof line !== 'string') continue;
        const pair = line.split(/\s+[—–-]\s+/u);
        if (pair.length !== 2) continue;
        for (const item of vocabulary) {
          if (
            typeof item?.finnish === 'string' &&
            typeof item?.english === 'string' &&
            normalizeEntry(pair[0]) === normalizeEntry(item.finnish) &&
            normalizeEntry(pair[1]) === normalizeEntry(item.english)
          ) {
            repeatedWords.add(item.finnish);
          }
        }
      }
      // Two distinct lexical entries establish a list; contextual sentences and form maps differ.
      if (repeatedWords.size >= 2) {
        errors.push(
          `${lesson.id}: repeats its vocabulary list in grammar section ${section.title}`,
        );
      }
    }
  }
  return errors;
}

function normalizeEntry(value) {
  return value
    .split(';')[0]
    .trim()
    .replace(/[.!?]+$/u, '')
    .replace(/\s+/gu, ' ')
    .toLocaleLowerCase('fi-FI');
}

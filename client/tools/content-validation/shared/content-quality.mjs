import { validateEnglishPronounAnswers } from './english-pronoun.mjs';
import { validateEnglishPossessionAnswers } from './english-possession.mjs';

export function validateLessonVocabularyVisibility(lessons) {
  const errors = [];
  const knownVocabulary = new Set(
    lessons.flatMap((lesson) =>
      [
        ...(lesson.introducedVocabulary ?? []),
        ...(lesson.reusedVocabulary ?? []),
        ...(lesson.suppliedVocabulary ?? []),
      ]
        .map((item) => item?.finnish)
        .filter((item) => typeof item === 'string' && item.trim()),
    ),
  );

  for (const lesson of lessons) {
    const declaredHere = new Set(
      [
        ...(lesson.introducedVocabulary ?? []),
        ...(lesson.reusedVocabulary ?? []),
        ...(lesson.suppliedVocabulary ?? []),
      ]
        .map((item) => item?.finnish)
        .filter((item) => typeof item === 'string')
        .map(normalizeFinnish),
    );
    const workedExamples = (lesson.examples ?? [])
      .map((example) => example.finnish ?? '')
      .join('\n');
    const uncoveredWorkedExamples = [
      ...(lesson.introducedVocabulary ?? []),
      ...(lesson.reusedVocabulary ?? []),
      ...(lesson.suppliedVocabulary ?? []),
    ]
      .filter((item) => item?.type === 'fixed-expression')
      .reduce((text, item) => maskItem(text, item.finnish), workedExamples);
    for (const item of knownVocabulary) {
      if (
        !declaredHere.has(normalizeFinnish(item)) &&
        containsItem(uncoveredWorkedExamples, item)
      ) {
        errors.push(`${lesson.id}: worked-example vocabulary ${item} is not classified`);
      }
    }

    const teachingText = collectStrings({
      title: lesson.title,
      summary: lesson.summary,
      objectives: lesson.objectives,
      sections: lesson.sections,
      examples: lesson.examples,
      commonMistakes: lesson.commonMistakes,
      practiceExercises: lesson.practiceExercises,
    }).join('\n');
    for (const item of lesson.suppliedVocabulary ?? []) {
      if (
        item?.finnish?.trim() &&
        item?.english?.trim() &&
        (!containsItem(teachingText, item.finnish) || !containsItem(teachingText, item.english))
      ) {
        errors.push(
          `${lesson.id}: supplied vocabulary ${item.finnish} lacks a visible Finnish form and English meaning`,
        );
      }
    }
  }
  return errors;
}

export function validateVocabularyItemTypes(lessons) {
  const errors = [];
  for (const lesson of lessons) {
    const items = [
      ...(lesson.introducedVocabulary ?? []),
      ...(lesson.reusedVocabulary ?? []),
      ...(lesson.suppliedVocabulary ?? []),
    ];
    for (const item of items) {
      const label = item?.finnish?.trim() || '[unknown]';
      if (item?.type !== 'word' && item?.type !== 'fixed-expression') {
        errors.push(`${lesson.id}: vocabulary ${label} has an invalid type`);
      } else if (item.type === 'word' && /\s/u.test(item.finnish)) {
        errors.push(`${lesson.id}: word vocabulary ${label} must contain one Finnish word`);
      } else if (
        item.type === 'fixed-expression' &&
        (item.finnish !== item.finnish.trim() || item.finnish.trim().split(/\s+/u).length < 2)
      ) {
        errors.push(
          `${lesson.id}: fixed-expression vocabulary ${label} must contain multiple Finnish words`,
        );
      }
    }
  }
  return errors;
}

export function validateExerciseVocabularyCoverage(exercises, grammarBaseForms) {
  const errors = [];
  if (
    !Array.isArray(grammarBaseForms) ||
    grammarBaseForms.some((word) => typeof word !== 'string' || !word.trim()) ||
    new Set(grammarBaseForms.map(normalizeFinnish)).size !== grammarBaseForms.length
  ) {
    return ['pack must declare unique grammar base forms for vocabulary coverage'];
  }
  const grammar = new Set(grammarBaseForms.map(normalizeFinnish));
  for (const exercise of exercises) {
    const parts = exercise.sentenceExplanation?.parts;
    if (!Array.isArray(parts)) continue;
    const declared = new Set((exercise.vocabulary ?? []).map(normalizeFinnish));
    const explained = parts.map((part) => part.finnish).join(' ');
    if (exercise.type === 'translation-en') {
      const quotedSource = exercise.prompt?.match(/Translate\s+[“"]([^”"]+)[”"]/iu);
      const source =
        quotedSource?.[1] ?? (exercise.prompt ?? '').replace(/^Optional practice:\s*/iu, '');
      if (normalizeWords(source) !== normalizeWords(explained)) {
        errors.push(
          `${exercise.id}: Finnish translation source is not fully covered by sentence parts`,
        );
      }
    } else if (
      (exercise.type === 'translation-fi' || exercise.type === 'word-order') &&
      normalizeWords(exercise.acceptedAnswers?.[0] ?? '') !== normalizeWords(explained)
    ) {
      errors.push(`${exercise.id}: Finnish answer is not fully covered by sentence parts`);
    }
    for (const part of parts) {
      const baseWords = splitBaseForms(part.baseForm);
      const surfaceWords = splitSurfaceForms(part.finnish);
      if (baseWords.length !== surfaceWords.length) {
        errors.push(`${exercise.id}: sentence part ${part.finnish} has unaligned base forms`);
        continue;
      }
      if (declared.has(normalizeFinnish(part.baseForm))) continue;
      for (const [index, baseWord] of baseWords.entries()) {
        if (grammar.has(baseWord) || declared.has(baseWord)) continue;
        const surface = surfaceWords[index];
        const visibleFinnish = [
          exercise.prompt ?? '',
          ...(exercise.options ?? []),
          ...(exercise.tokens ?? []),
        ].some((text) => containsItem(text, surface) || containsItem(text, baseWord));
        if (exercise.type !== 'translation-en' && visibleFinnish) continue;
        errors.push(
          `${exercise.id}: recall word ${baseWord} (${surface}) is missing from vocabulary`,
        );
      }
    }
  }
  return errors;
}

function splitBaseForms(value) {
  return (value ?? '')
    .toLocaleLowerCase('fi-FI')
    .split(/[\s+,;/]+/u)
    .filter(Boolean);
}

function splitSurfaceForms(value) {
  return (value ?? '').toLocaleLowerCase('fi-FI').match(/[\p{L}\p{N}]+/gu) ?? [];
}

function normalizeWords(value) {
  return splitSurfaceForms(value).join(' ');
}

export function validateExerciseEditorialQuality(exercises) {
  const errors = [
    ...validateEnglishPronounAnswers(exercises),
    ...validateEnglishPossessionAnswers(exercises),
  ];
  for (const exercise of exercises) {
    if (typeof exercise?.prompt === 'string' && exercise.prompt.trim().split(/\s+/u).length > 40) {
      errors.push(`${exercise.id}: prompt exceeds the 40-word editorial limit`);
    }
    if (
      typeof exercise?.prompt === 'string' &&
      /(?:Optional practice:\s*){2,}/iu.test(exercise.prompt)
    ) {
      errors.push(`${exercise.id}: repeats the optional-practice label`);
    }
    if (
      typeof exercise?.prompt === 'string' &&
      /Write the complete Finnish sentence: ____|The identity-sentence frame is supplied/iu.test(
        exercise.prompt,
      )
    ) {
      errors.push(`${exercise.id}: prompt repeats an instruction or exposes authoring notes`);
    }
    if (hasAmbiguousSecondPersonPrompt(exercise)) {
      errors.push(
        `${exercise.id}: second-person Finnish production prompt does not identify the intended form`,
      );
    }
  }
  return errors;
}

function hasAmbiguousSecondPersonPrompt(exercise) {
  if (
    exercise?.type === 'translation-en' ||
    !exercise?.tags?.includes('sentence') ||
    !/\byou\b/iu.test(exercise?.sentenceExplanation?.translation ?? '')
  ) {
    return false;
  }
  const prompt = exercise.prompt ?? '';
  if (exercise.tags.includes('person-sina')) {
    return !/(?<![\p{L}\p{N}])sinä(?![\p{L}\p{N}])|\bone person\b|\bsingular\b/iu.test(prompt);
  }
  if (exercise.tags.includes('person-te')) {
    return !/(?<![\p{L}\p{N}])te(?![\p{L}\p{N}])|\bmore than one\b|\bgroup\b|\bplural\b|\bpolite(?:ly)?\b/iu.test(
      prompt,
    );
  }
  return false;
}

function collectStrings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value !== null && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

function containsItem(text, item) {
  return itemPattern(item).test(text);
}

function maskItem(text, item) {
  return text.replace(itemPattern(item, true), ' ');
}

function itemPattern(item, global = false) {
  const escaped = item.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, global ? 'giu' : 'iu');
}

function normalizeFinnish(value) {
  return value.trim().toLocaleLowerCase('fi-FI');
}

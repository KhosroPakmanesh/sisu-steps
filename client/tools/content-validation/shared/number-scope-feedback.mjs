const FORMS = {
  person: {
    singular: ['minä', 'sinä', 'hän', 'tämä', 'tuo'],
    plural: ['me', 'te', 'he', 'nämä', 'nuo'],
  },
  owner: { singular: ['minulla', 'sinulla', 'hänellä'], plural: ['meillä', 'teillä', 'heillä'] },
  object: { singular: ['tämä'], plural: ['nämä'] },
};

export function supplementalFeedbackLeaks(exercise, scope) {
  const explanations = [
    ...Object.entries(exercise.optionFeedback ?? {}).map(([answer, text]) => ({
      answers: exercise.acceptedAnswers.includes(answer) ? [] : [answer],
      text,
    })),
    ...(exercise.answerDiagnostics ?? []).map((diagnostic) => ({
      answers: diagnostic.answers,
      text: diagnostic.explanation,
    })),
  ];
  const opposite = scope.number === 'singular' ? 'plural' : 'singular';
  for (const { answers, text } of explanations) {
    // Incorrect displayed answers are diagnostic contrasts, not positive scope teaching.
    let teaching = text;
    for (const answer of answers) teaching = teaching.replaceAll(answer, '');
    const forms = FORMS[scope.axis][opposite].join('|');
    const predicate =
      scope.axis === 'owner'
        ? '(?:on|ei ole|onko|eikö)'
        : '(?:on|ovat|olen|olet|olemme|olette|ei|eivät|en|et|emme|ette)';
    const sentence = new RegExp('(?:^|[.!?]\\s+)(' + forms + ')\\s+' + predicate + '\\b', 'iu');
    if (sentence.test(teaching)) return true;
    if (scope.axis === 'owner') {
      const label = opposite === 'plural' ? '(?:plural|several)' : '(?:singular|one)';
      const rule = new RegExp(
        '(?:^|[.!?]\\s+)' +
          label +
          ' owners? (?:still )?(?:use|uses|take|takes|can have|have|has)\\b',
        'iu',
      );
      if (rule.test(teaching)) return true;
    }
  }
  return false;
}

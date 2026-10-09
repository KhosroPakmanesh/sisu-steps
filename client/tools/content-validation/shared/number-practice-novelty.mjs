const normalize = (text) =>
  text
    .toLocaleLowerCase('fi-FI')
    .replaceAll('’', "'")
    .replace(/[.,!?]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
const answers = (exercise) => [...new Set(exercise.acceptedAnswers.map(normalize))].sort();
const prompt = (exercise) => normalize(exercise.prompt.replace(/^Optional practice:\s*/u, ''));

function taskKey(exercise) {
  const demand = /\bChange\s+[^“]+[.?!]\s*[“"]/u.test(exercise.prompt)
    ? 'transformation'
    : 'construction';
  if (exercise.type === 'word-order')
    return JSON.stringify([
      exercise.type,
      demand,
      answers(exercise),
      [...exercise.tokens].map(normalize).sort(),
    ]);
  const cues = [...exercise.prompt.matchAll(/[“"]([^”"]+)[”"]/gu)].map((match) => match[1]);
  if (exercise.type === 'translation-en')
    return JSON.stringify([exercise.type, normalize(cues[0] ?? exercise.prompt)]);
  const question = cues.find((cue) => /^(?:onko|eikö)\b/iu.test(cue));
  const frame = exercise.prompt.match(/(?:Kyllä|Ei)[,\s]+_+(?:\s+_+)?/iu)?.[0];
  if (exercise.type === 'fill-blank' && question && frame)
    return JSON.stringify([
      exercise.type,
      normalize(question),
      normalize(frame),
      answers(exercise),
    ]);
  return JSON.stringify([exercise.type, prompt(exercise), answers(exercise)]);
}

export function validateNumberPracticeNovelty(pack) {
  const inventory = [
    ...pack.tests.flatMap((test) => test.exercises),
    ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
  ];
  const additions = pack.lessons
    .filter((lesson) => lesson.numberScope)
    .flatMap((lesson) =>
      lesson.practiceExercises.filter((exercise) =>
        exercise.id.startsWith(lesson.id + '-practice-'),
      ),
    );
  const errors = [];
  for (const added of additions) {
    const peer = inventory.find(
      (exercise) => exercise.id !== added.id && taskKey(exercise) === taskKey(added),
    );
    if (peer) errors.push(added.id + ': repeated number-specific optional task of ' + peer.id);
  }
  return errors;
}

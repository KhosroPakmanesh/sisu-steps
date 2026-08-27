import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(root, 'public/content/vowel-harmony-kpt-tplural.json');

const make = (id, type, instruction, prompt, acceptedAnswers, explanation, tags, extra = {}) => ({
  id,
  type,
  instruction,
  prompt,
  acceptedAnswers: Array.isArray(acceptedAnswers) ? acceptedAnswers : [acceptedAnswers],
  explanation,
  tags,
  requiredSkills: [],
  vocabulary: [],
  ...extra,
});

const choice = (id, prompt, options, answer, explanation, tags, extra = {}) =>
  make(id, 'multiple-choice', 'Choose the best answer.', prompt, answer, explanation, tags, {
    options,
    optionFeedback: Object.fromEntries(
      options.map((option) => [
        option,
        option === answer
          ? `Correct. ${explanation}`
          : `“${option}” does not show the required pattern. ${explanation}`,
      ]),
    ),
    ...extra,
  });
const fill = (id, prompt, answer, explanation, tags, extra = {}) =>
  make(id, 'fill-blank', 'Complete the Finnish form.', prompt, answer, explanation, tags, extra);
const toFinnish = (id, prompt, answer, explanation, tags, extra = {}) =>
  make(id, 'translation-fi', 'Translate into Finnish.', prompt, answer, explanation, tags, extra);
const toEnglish = (id, prompt, answer, explanation, tags, extra = {}) =>
  make(id, 'translation-en', 'Translate into English.', prompt, answer, explanation, tags, extra);
const order = (id, tokens, answer, explanation, tags, extra = {}) =>
  make(
    id,
    'word-order',
    'Put the words in the correct order.',
    'Build the Finnish sentence.',
    answer,
    explanation,
    tags,
    { tokens, ...extra },
  );
const swapSsa = (form) =>
  form.endsWith('ssä') ? `${form.slice(0, -3)}ssa` : `${form.slice(0, -3)}ssä`;
const swapVat = (form) =>
  form.endsWith('vät') ? `${form.slice(0, -3)}vat` : `${form.slice(0, -3)}vät`;

const diagnosticCategory = (skill) => `${skill}: form not yet correct`;

const sentenceExplanation = (translation, pattern, parts) => ({
  sentenceExplanation: { translation, pattern, parts },
});

const sentencePart = (finnish, meaning, role, baseForm, formation) => ({
  finnish,
  meaning,
  role,
  baseForm,
  formation,
});

const lessonProfiles = {
  'vowel-harmony-basics': {
    stage: 'focused',
    targetSkills: ['Vowel harmony'],
    prerequisiteSkills: [],
    introducedVocabulary: [
      ['talo', 'house'],
      ['koulu', 'school'],
      ['auto', 'car'],
      ['päivä', 'day'],
      ['pöytä', 'table'],
      ['kylä', 'village'],
      ['metsä', 'forest'],
      ['nimi', 'name'],
      ['tie', 'road'],
      ['sininen', 'blue'],
    ],
    practiceVocabulary: ['talo', 'päivä', 'tie'],
  },
  'inside-ending': {
    stage: 'focused',
    targetSkills: ['Inessive -ssa/-ssä'],
    prerequisiteSkills: ['Vowel harmony'],
    introducedVocabulary: [
      ['kirjasto', 'library'],
      ['puisto', 'park'],
      ['kahvila', 'café'],
      ['sauna', 'sauna'],
      ['toimisto', 'office'],
      ['myymälä', 'shop'],
      ['elämä', 'life'],
    ],
    practiceVocabulary: ['sauna', 'toimisto', 'myymälä'],
  },
  'kpt-doubles': {
    stage: 'focused',
    targetSkills: ['KPT double consonants'],
    prerequisiteSkills: [],
    introducedVocabulary: [
      ['pankki', 'bank'],
      ['kauppa', 'shop'],
      ['matto', 'rug'],
      ['kukka', 'flower'],
      ['hattu', 'hat'],
      ['lippu', 'ticket'],
      ['nukkua', 'to sleep'],
      ['ottaa', 'to take'],
    ],
    practiceVocabulary: ['pankki', 'kauppa', 'matto', 'kukka'],
  },
  'kpt-singles': {
    stage: 'focused',
    targetSkills: ['KPT common single consonants'],
    prerequisiteSkills: [],
    introducedVocabulary: [
      ['jalka', 'foot or leg'],
      ['leipä', 'bread'],
      ['pöytä', 'table'],
      ['hakea', 'to fetch'],
      ['lukea', 'to read'],
    ],
    practiceVocabulary: ['jalka', 'leipä', 'pöytä', 'hakea'],
  },
  'kpt-special-k': {
    stage: 'focused',
    targetSkills: ['KPT special k changes'],
    prerequisiteSkills: [],
    introducedVocabulary: [
      ['poika', 'boy'],
      ['puku', 'suit'],
      ['aika', 'time'],
      ['luku', 'number or chapter'],
    ],
    practiceVocabulary: ['poika', 'puku', 'aika', 'luku'],
  },
  'kpt-clusters': {
    stage: 'focused',
    targetSkills: ['KPT consonant clusters'],
    prerequisiteSkills: [],
    introducedVocabulary: [
      ['kaupunki', 'city'],
      ['kenkä', 'shoe'],
      ['kampa', 'comb'],
      ['pelto', 'field'],
      ['antaa', 'to give'],
      ['lentää', 'to fly'],
      ['kertoa', 'to tell'],
      ['ymmärtää', 'to understand'],
      ['ranta', 'beach'],
      ['silta', 'bridge'],
    ],
    practiceVocabulary: ['kenkä', 'kampa', 'pelto', 'ranta'],
  },
  'kpt-basics': {
    stage: 'focused',
    targetSkills: ['KPT recognition'],
    prerequisiteSkills: [
      'KPT double consonants',
      'KPT common single consonants',
      'KPT special k changes',
      'KPT consonant clusters',
    ],
    introducedVocabulary: [],
    practiceVocabulary: ['pankki', 'jalka', 'poika', 'kenkä'],
  },
  'genitive-nouns': {
    stage: 'focused',
    targetSkills: ['Genitive -n'],
    prerequisiteSkills: ['KPT recognition'],
    introducedVocabulary: [
      ['tyttö', 'girl'],
      ['takki', 'coat'],
      ['katto', 'roof'],
      ['ranta', 'beach'],
    ],
    practiceVocabulary: ['pankki', 'kauppa', 'matto'],
  },
  'verb-kpt': {
    stage: 'focused',
    targetSkills: ['Minä verb forms with KPT'],
    prerequisiteSkills: ['KPT recognition'],
    introducedVocabulary: [
      ['auttaa', 'to help'],
      ['pukea', 'to get dressed'],
    ],
    practiceVocabulary: ['nukkua', 'lentää', 'ottaa'],
  },
  't-plural-basics': {
    stage: 'focused',
    targetSkills: ['Regular T-plural'],
    prerequisiteSkills: [],
    introducedVocabulary: [
      ['kirja', 'book'],
      ['koira', 'dog'],
      ['kynä', 'pen'],
      ['omena', 'apple'],
      ['sana', 'word'],
      ['kuva', 'picture'],
      ['tuoli', 'chair'],
      ['kissa', 'cat'],
      ['pallo', 'ball'],
      ['ystävä', 'friend'],
    ],
    practiceVocabulary: ['kissa', 'pallo', 'ystävä'],
  },
  'kpt-t-plural': {
    stage: 'focused',
    targetSkills: ['T-plural with KPT'],
    prerequisiteSkills: ['KPT recognition', 'Regular T-plural'],
    introducedVocabulary: [
      ['keitto', 'soup'],
      ['silta', 'bridge'],
      ['kampa', 'comb'],
      ['takki', 'coat'],
      ['katto', 'roof'],
      ['tyttö', 'girl'],
      ['ranta', 'beach'],
    ],
    practiceVocabulary: ['pankki', 'kauppa', 'pelto'],
  },
  'he-verbs': {
    stage: 'focused',
    targetSkills: ['Third-person plural -vat/-vät'],
    prerequisiteSkills: ['Vowel harmony'],
    introducedVocabulary: [
      ['puhua', 'to speak'],
      ['asua', 'to live'],
      ['laulaa', 'to sing'],
      ['ostaa', 'to buy'],
      ['kysyä', 'to ask'],
      ['lähteä', 'to leave'],
      ['istua', 'to sit'],
      ['sanoa', 'to say'],
      ['katsoa', 'to look or watch'],
      ['seisoa', 'to stand'],
    ],
    practiceVocabulary: ['laulaa', 'kysyä', 'asua'],
  },
  'plural-sentences': {
    stage: 'focused',
    targetSkills: ['Plural subject + ovat'],
    prerequisiteSkills: ['Regular T-plural'],
    introducedVocabulary: [
      ['olla', 'to be'],
      ['ovat', 'are, for a plural subject'],
      ['täällä', 'here'],
      ['kotona', 'at home'],
      ['ulkona', 'outside'],
      ['auki', 'open'],
    ],
    practiceVocabulary: ['kissa', 'pallo', 'auto', 'olla', 'ovat', 'kotona', 'täällä', 'ulkona'],
  },
};

const vocabularyForLessons = (lessonIds) => [
  ...new Set(
    lessonIds.flatMap((id) =>
      (lessonProfiles[id]?.introducedVocabulary ?? []).map(([finnish]) => finnish),
    ),
  ),
];

const vocabularyMeanings = new Map(
  Object.values(lessonProfiles).flatMap((profile) => profile.introducedVocabulary),
);
const meaningOf = (form) => {
  const meaning = vocabularyMeanings.get(form);
  if (!meaning) throw new Error(`Missing English meaning for ${form}.`);
  return meaning;
};
const splitKptMeanings = (meaning) => {
  const [sourceMeaning, targetMeaning] = meaning.split(' → ');
  return [sourceMeaning, targetMeaning ?? `of the ${sourceMeaning}`];
};

const testProfiles = {
  'vowel-families': { stage: 'focused', targetSkills: ['Vowel harmony'], prerequisiteSkills: [] },
  'harmony-in-forms': {
    stage: 'focused',
    targetSkills: ['Inessive -ssa/-ssä'],
    prerequisiteSkills: ['Vowel harmony'],
  },
  'test-kpt-doubles': {
    stage: 'focused',
    targetSkills: ['KPT double consonants'],
    prerequisiteSkills: [],
  },
  'test-kpt-singles': {
    stage: 'focused',
    targetSkills: ['KPT common single consonants'],
    prerequisiteSkills: [],
  },
  'test-kpt-clusters': {
    stage: 'focused',
    targetSkills: ['KPT consonant clusters'],
    prerequisiteSkills: [],
  },
  'test-kpt-special-k': {
    stage: 'focused',
    targetSkills: ['KPT special k changes'],
    prerequisiteSkills: [],
  },
  'kpt-patterns': {
    stage: 'focused',
    targetSkills: ['KPT recognition'],
    prerequisiteSkills: [
      'KPT double consonants',
      'KPT common single consonants',
      'KPT special k changes',
      'KPT consonant clusters',
    ],
  },
  'kpt-nouns': {
    stage: 'focused',
    targetSkills: ['Genitive -n'],
    prerequisiteSkills: ['KPT recognition'],
  },
  'kpt-verbs': {
    stage: 'focused',
    targetSkills: ['Minä verb forms with KPT'],
    prerequisiteSkills: ['KPT recognition'],
  },
  'regular-t-plural': {
    stage: 'focused',
    targetSkills: ['Regular T-plural'],
    prerequisiteSkills: [],
  },
  'test-kpt-t-plural': {
    stage: 'focused',
    targetSkills: ['T-plural with KPT'],
    prerequisiteSkills: ['KPT recognition', 'Regular T-plural'],
  },
  'plural-verb-harmony': {
    stage: 'focused',
    targetSkills: ['Third-person plural -vat/-vät'],
    prerequisiteSkills: ['Vowel harmony'],
  },
  'plural-in-sentences': {
    stage: 'focused',
    targetSkills: ['Plural subject + ovat'],
    prerequisiteSkills: ['Regular T-plural'],
  },
  'foundations-review': {
    stage: 'review',
    targetSkills: [
      'Vowel harmony',
      'Inessive -ssa/-ssä',
      'KPT double consonants',
      'KPT common single consonants',
      'KPT consonant clusters',
      'KPT recognition',
      'Genitive -n',
      'Minä verb forms with KPT',
      'Regular T-plural',
      'T-plural with KPT',
      'Third-person plural -vat/-vät',
      'Plural subject + ovat',
    ],
    prerequisiteSkills: [],
  },
  'guided-review': {
    stage: 'review',
    targetSkills: [
      'Vowel harmony',
      'Inessive -ssa/-ssä',
      'KPT double consonants',
      'KPT common single consonants',
      'KPT consonant clusters',
      'KPT recognition',
      'Genitive -n',
      'Minä verb forms with KPT',
      'Regular T-plural',
      'T-plural with KPT',
      'Third-person plural -vat/-vät',
      'Plural subject + ovat',
    ],
    prerequisiteSkills: [],
  },
};

const inferTargetSkill = (exercise, fallback) => {
  if (exercise.targetSkill) return exercise.targetSkill;
  const tags = new Set(exercise.tags ?? []);
  if (tags.has('inessive')) return 'Inessive -ssa/-ssä';
  if (tags.has('genitive')) return 'Genitive -n';
  if (tags.has('verb') && tags.has('kpt')) return 'Minä verb forms with KPT';
  if (tags.has('t-plural') && tags.has('kpt')) return 'T-plural with KPT';
  if (tags.has('verb') && tags.has('plural')) return 'Third-person plural -vat/-vät';
  if (tags.has('sentence')) return 'Plural subject + ovat';
  if (tags.has('t-plural')) return 'Regular T-plural';
  if (tags.has('kpt')) return 'KPT recognition';
  if (tags.has('vowel-harmony')) return 'Vowel harmony';
  return fallback;
};

const renumberExercises = (testNumber, exercises) =>
  exercises.map((exercise, index) => ({ ...exercise, id: idFor(testNumber, index) }));

const test = (id, title, focus, lessonIds, exercises) => {
  const profile = testProfiles[id];
  if (!profile) throw new Error(`Missing test focus profile for ${id}.`);
  const vocabulary = vocabularyForLessons(lessonIds);
  const requiredSkills = [...profile.targetSkills, ...profile.prerequisiteSkills];
  return {
    id,
    title,
    focus,
    lessonIds,
    ...profile,
    exercises: exercises.map((exercise) => {
      const targetSkill = inferTargetSkill(exercise, profile.targetSkills[0]);
      return {
        ...exercise,
        targetSkill,
        misconceptionCategory: exercise.misconceptionCategory ?? diagnosticCategory(targetSkill),
        requiredSkills: exercise.requiredSkills.length ? exercise.requiredSkills : requiredSkills,
        vocabulary: exercise.vocabulary.length ? exercise.vocabulary : vocabulary,
      };
    }),
  };
};
const lesson = (
  id,
  title,
  summary,
  objectives,
  sections,
  examples,
  commonMistakes,
  practiceExercises,
) => ({
  id,
  version: '5.1.0',
  ...lessonProfiles[id],
  title,
  summary,
  objectives,
  sections,
  examples,
  commonMistakes,
  introducedVocabulary: (lessonProfiles[id]?.introducedVocabulary ?? []).map(
    ([finnish, english]) => ({ finnish, english }),
  ),
  practiceExercises: practiceExercises.map((exercise) => ({
    ...exercise,
    requiredSkills: [
      ...(lessonProfiles[id]?.targetSkills ?? []),
      ...(lessonProfiles[id]?.prerequisiteSkills ?? []),
    ],
    vocabulary: lessonProfiles[id]?.practiceVocabulary ?? [],
  })),
});
const lessonSection = (title, paragraphs, keyPoints) => ({ title, paragraphs, keyPoints });
const lessonExample = (finnish, english, steps) => ({ finnish, english, steps });
const idFor = (testNumber, index) =>
  `ff-a1-t${String(testNumber).padStart(2, '0')}-e${String(index + 1).padStart(2, '0')}`;

const vowelClasses = [
  ['talo', 'back vowels', 'The word has a and o, both back vowels.'],
  ['koulu', 'back vowels', 'The word has o and u, both back vowels.'],
  ['auto', 'back vowels', 'The word has a and u; both belong to the back-vowel group.'],
  ['päivä', 'front vowels', 'The word contains ä. The vowel i is neutral.'],
  ['pöytä', 'front vowels', 'The word contains ö, y, and ä, all front vowels.'],
  ['kylä', 'front vowels', 'The word contains y and ä, both front vowels.'],
  ['metsä', 'front vowels', 'The decisive vowel is ä; e is neutral.'],
  [
    'nimi',
    'only neutral vowels',
    'The vowels i and e are neutral. Neutral-only words normally take front-vowel endings.',
  ],
  ['tie', 'only neutral vowels', 'The vowels i and e are neutral.'],
  ['sininen', 'only neutral vowels', 'This word contains only i and e, the neutral vowels.'],
];

const harmonySuffixes = [
  ['talo', '-ssa', 'talo contains back vowels, so the ending uses a: -ssa.'],
  ['koulu', '-ssa', 'koulu contains o and u, so use the back-vowel ending -ssa.'],
  ['auto', '-ssa', 'auto contains a and u, so use -ssa.'],
  ['päivä', '-ssä', 'päivä contains ä, so use the front-vowel ending -ssä.'],
  ['pöytä', '-ssä', 'pöytä contains front vowels, so use -ssä.'],
  ['kylä', '-ssä', 'kylä contains y and ä, so use -ssä.'],
  ['metsä', '-ssä', 'metsä contains ä, so use -ssä.'],
  [
    'nimi',
    '-ssä',
    'A word containing only neutral i/e normally takes the front-vowel ending -ssä.',
  ],
  ['perhe', '-ssä', 'A neutral-only word normally uses the front-vowel ending -ssä.'],
  ['keittiö', '-ssä', 'keittiö contains ö, so use -ssä.'],
];

const test1 = [
  ...vowelClasses.map(([word, answer, explanation], index) =>
    choice(
      idFor(1, index),
      `Which vowel group describes “${word}”?`,
      ['back vowels', 'front vowels', 'only neutral vowels'],
      answer,
      explanation,
      ['vowel-harmony', 'recognition'],
      { vocabulary: [word] },
    ),
  ),
  ...harmonySuffixes.map(([word, answer, explanation], index) =>
    choice(
      idFor(1, index + 10),
      `Which inessive ending fits “${word}”?`,
      ['-ssa', '-ssä'],
      answer,
      explanation,
      ['vowel-harmony', 'suffix-choice'],
      { vocabulary: [word] },
    ),
  ),
];

const harmonyForms = [
  ['talo', 'talossa', 'in the house', 'The back vowels a/o select -ssa.'],
  ['koulu', 'koulussa', 'in the school', 'The back vowels o/u select -ssa.'],
  ['auto', 'autossa', 'in the car', 'The back vowels a/u select -ssa.'],
  ['kirjasto', 'kirjastossa', 'in the library', 'The back vowels a/o select -ssa.'],
  ['puisto', 'puistossa', 'in the park', 'The back vowels u/o select -ssa.'],
  ['kahvila', 'kahvilassa', 'in the café', 'The back vowel a selects -ssa.'],
  ['sauna', 'saunassa', 'in the sauna', 'The back vowels a/u select -ssa.'],
  ['toimisto', 'toimistossa', 'in the office', 'The back vowel o selects -ssa.'],
  ['myymälä', 'myymälässä', 'in the shop', 'The front vowels y/ä select -ssä.'],
  ['elämä', 'elämässä', 'in life', 'The front vowel ä selects -ssä.'],
  ['talo', 'talossa', 'in the house', 'The back vowels a/o select -ssa.'],
  ['koulu', 'koulussa', 'in the school', 'The back vowels o/u select -ssa.'],
  ['auto', 'autossa', 'in the car', 'The back vowels a/u select -ssa.'],
  ['sauna', 'saunassa', 'in the sauna', 'The back vowels a/u select -ssa.'],
  ['myymälä', 'myymälässä', 'in the shop', 'The front vowels y/ä select -ssä.'],
  ['puisto', 'puistossa', 'in the park', 'The back vowels u/o select -ssa.'],
  ['kahvila', 'kahvilassa', 'in the café', 'The back vowel a selects -ssa.'],
  ['toimisto', 'toimistossa', 'in the office', 'The back vowel o selects -ssa.'],
];

const test2 = harmonyForms.map(([base, form, english, explanation], index) => {
  const id = idFor(2, index);
  const focus = { vocabulary: [base] };
  const baseMeaning = meaningOf(base);
  const completeExplanation = `${base} means “${baseMeaning}”; ${form} means “${english}”. ${explanation}`;
  if (index % 4 === 0)
    return fill(
      id,
      `${base} (“${baseMeaning}”) + -ssa/-ssä → ____ (“${english}”)`,
      form,
      completeExplanation,
      ['vowel-harmony', 'inessive'],
      focus,
    );
  if (index % 4 === 1)
    return choice(
      id,
      `Choose the form meaning “${english}” from ${base} (“${baseMeaning}”).`,
      [form, swapSsa(form), base],
      form,
      completeExplanation,
      ['vowel-harmony', 'inessive'],
      focus,
    );
  if (index % 4 === 2)
    return toFinnish(
      id,
      `${english} — use the supplied base ${base} (“${baseMeaning}”)`,
      form,
      completeExplanation,
      ['vowel-harmony', 'inessive'],
      focus,
    );
  return fill(
    id,
    `${base} (“${baseMeaning}”) → ____ (“${english}”) · use -ssa or -ssä`,
    form,
    completeExplanation,
    ['vowel-harmony', 'inessive'],
    focus,
  );
});

const kptPairs = [
  ['pankki', 'pankin', 'bank', 'of the bank', 'kk → k', 'A double k weakens to one k.'],
  ['kauppa', 'kaupan', 'shop', 'of the shop', 'pp → p', 'A double p weakens to one p.'],
  ['matto', 'maton', 'rug', 'of the rug', 'tt → t', 'A double t weakens to one t.'],
  [
    'jalka',
    'jalan',
    'foot or leg',
    'of the foot or leg',
    'k → ∅',
    'A single k can disappear in the weak grade.',
  ],
  [
    'poika',
    'pojan',
    'boy',
    'of the boy',
    'k → j',
    'Between an i and the next vowel, k can change to j.',
  ],
  ['puku', 'puvun', 'suit', 'of the suit', 'k → v', 'In this pattern, k changes to v.'],
  ['leipä', 'leivän', 'bread', 'of the bread', 'p → v', 'A single p can weaken to v.'],
  ['pöytä', 'pöydän', 'table', 'of the table', 't → d', 'A single t can weaken to d.'],
  ['kaupunki', 'kaupungin', 'city', 'of the city', 'nk → ng', 'The cluster nk weakens to ng.'],
  ['kenkä', 'kengän', 'shoe', 'of the shoe', 'nk → ng', 'In spelling, nk weakens to ng.'],
  ['kampa', 'kamman', 'comb', 'of the comb', 'mp → mm', 'The cluster mp weakens to mm.'],
  ['pelto', 'pellon', 'field', 'of the field', 'lt → ll', 'The cluster lt weakens to ll.'],
  ['hakea', 'haen', 'to fetch', 'I fetch', 'k → ∅', 'The k disappears in the minä-form haen.'],
  ['lukea', 'luen', 'to read', 'I read', 'k → ∅', 'The k disappears in the minä-form luen.'],
  ['ottaa', 'otan', 'to take', 'I take', 'tt → t', 'The double t weakens to one t in otan.'],
  ['nukkua', 'nukun', 'to sleep', 'I sleep', 'kk → k', 'The double k weakens to one k in nukun.'],
  ['antaa', 'annan', 'to give', 'I give', 'nt → nn', 'The cluster nt weakens to nn in annan.'],
  ['lentää', 'lennän', 'to fly', 'I fly', 'nt → nn', 'The cluster nt weakens to nn in lennän.'],
  ['kertoa', 'kerron', 'to tell', 'I tell', 'rt → rr', 'The cluster rt weakens to rr in kerron.'],
  [
    'ymmärtää',
    'ymmärrän',
    'to understand',
    'I understand',
    'rt → rr',
    'The cluster rt weakens to rr in ymmärrän.',
  ],
];

const kptRules = [
  'kk → k',
  'pp → p',
  'tt → t',
  'k → ∅',
  'k → j',
  'k → v',
  'p → v',
  't → d',
  'nk → ng',
  'mp → mm',
  'nt → nn',
  'lt → ll',
  'rt → rr',
];
const test3 = kptPairs.map(
  ([base, form, sourceMeaning, targetMeaning, rule, explanation], index) => {
    const alternatives = kptRules.filter((candidate) => candidate !== rule);
    return choice(
      idFor(3, index),
      `What KPT change appears in ${base} (“${sourceMeaning}”) → ${form} (“${targetMeaning}”)?`,
      [
        rule,
        alternatives[(index + 3) % alternatives.length],
        alternatives[(index + 7) % alternatives.length],
      ],
      rule,
      explanation,
      ['kpt', 'recognition'],
      { vocabulary: [base] },
    );
  },
);

const buildKptBlock = (items, count, targetSkill) =>
  Array.from({ length: count }, (_, index) => {
    const [base, form, meaning, rule] = items[index % items.length];
    const [sourceMeaning, targetMeaning] = splitKptMeanings(meaning);
    const isVerb = sourceMeaning.startsWith('to ');
    const suppliedEnding = isVerb ? 'minä ending -n' : 'genitive ending -n';
    const suppliedStem = isVerb ? `${base.slice(0, -1)}-` : null;
    const suppliedFrame = suppliedStem ? `, supplied stem ${suppliedStem} + minä -n` : '';
    const explanation = `${base} means “${sourceMeaning}”; ${form} means “${targetMeaning}”. ${suppliedStem ? `The stem ${suppliedStem} and minä ending -n are supplied` : 'The genitive ending -n is supplied'}, so they are not new decisions here. Apply only ${rule}: ${base} → ${form}.`;
    const extra = {
      targetSkill,
      vocabulary: [base],
      answerDiagnostics: [
        {
          answers: [base],
          category: `${targetSkill}: KPT change omitted`,
          explanation: `The unchanged form ${base} does not show the required ${rule} change.`,
        },
      ],
    };
    if (index < Math.min(items.length, 5)) {
      const alternatives = kptRules.filter((candidate) => candidate !== rule);
      return choice(
        `temporary-${targetSkill}-${index}`,
        `What change appears in ${base} (“${sourceMeaning}”) → ${form} (“${targetMeaning}”)?`,
        [
          rule,
          alternatives[(index + 2) % alternatives.length],
          alternatives[(index + 6) % alternatives.length],
        ],
        rule,
        explanation,
        ['kpt', 'recognition'],
        extra,
      );
    }
    return fill(
      `temporary-${targetSkill}-${index}`,
      `${base} (“${sourceMeaning}”)${suppliedFrame} → ____ (“${targetMeaning}”) · use the supplied ${suppliedEnding}; apply ${rule}`,
      form,
      explanation,
      ['kpt', 'controlled-production'],
      extra,
    );
  });

const doubleKptItems = [
  ['pankki', 'pankin', 'bank', 'kk → k'],
  ['kauppa', 'kaupan', 'shop', 'pp → p'],
  ['matto', 'maton', 'rug', 'tt → t'],
  ['kukka', 'kukan', 'flower', 'kk → k'],
  ['hattu', 'hatun', 'hat', 'tt → t'],
  ['lippu', 'lipun', 'ticket', 'pp → p'],
  ['nukkua', 'nukun', 'to sleep → I sleep', 'kk → k'],
  ['ottaa', 'otan', 'to take → I take', 'tt → t'],
];
const singleKptItems = [
  ['jalka', 'jalan', 'foot or leg', 'k → ∅'],
  ['leipä', 'leivän', 'bread', 'p → v'],
  ['pöytä', 'pöydän', 'table', 't → d'],
  ['hakea', 'haen', 'to fetch → I fetch', 'k → ∅'],
  ['lukea', 'luen', 'to read → I read', 'k → ∅'],
];
const clusterKptItems = [
  ['kaupunki', 'kaupungin', 'city', 'nk → ng'],
  ['kenkä', 'kengän', 'shoe', 'nk → ng'],
  ['kampa', 'kamman', 'comb', 'mp → mm'],
  ['pelto', 'pellon', 'field', 'lt → ll'],
  ['antaa', 'annan', 'to give → I give', 'nt → nn'],
  ['lentää', 'lennän', 'to fly → I fly', 'nt → nn'],
  ['kertoa', 'kerron', 'to tell → I tell', 'rt → rr'],
  ['ymmärtää', 'ymmärrän', 'to understand → I understand', 'rt → rr'],
  ['ranta', 'rannan', 'beach', 'nt → nn'],
  ['silta', 'sillan', 'bridge', 'lt → ll'],
];
const specialKptItems = [
  ['poika', 'pojan', 'boy', 'k → j'],
  ['puku', 'puvun', 'suit', 'k → v'],
  ['aika', 'ajan', 'time', 'k → j'],
  ['luku', 'luvun', 'number or chapter', 'k → v'],
];
const mixedKptItems = [
  ['poika', 'pojan', 'boy', 'k → j'],
  ['puku', 'puvun', 'suit', 'k → v'],
  ['aika', 'ajan', 'time', 'k → j'],
  ['luku', 'luvun', 'number or chapter', 'k → v'],
  ['pankki', 'pankin', 'bank', 'kk → k'],
  ['leipä', 'leivän', 'bread', 'p → v'],
  ['kenkä', 'kengän', 'shoe', 'nk → ng'],
  ['pelto', 'pellon', 'field', 'lt → ll'],
];

const kptDoublePool = buildKptBlock(doubleKptItems, 14, 'KPT double consonants');
const kptSinglePool = buildKptBlock(singleKptItems, 14, 'KPT common single consonants');
const kptClusterPool = buildKptBlock(clusterKptItems, 14, 'KPT consonant clusters');
const kptSpecialPool = buildKptBlock(specialKptItems, 8, 'KPT special k changes');
const kptMixedPool = buildKptBlock(mixedKptItems, 16, 'KPT recognition');
const mixedKptRecognitionPool = [
  test3[0],
  test3[3],
  test3[4],
  test3[5],
  test3[6],
  test3[8],
  test3[10],
  test3[11],
];

const nounGenitives = [
  ['pankki', 'pankin', "the bank's / of the bank", 'kk weakens to k.'],
  ['kauppa', 'kaupan', "the shop's / of the shop", 'pp weakens to p.'],
  ['matto', 'maton', "the rug's / of the rug", 'tt weakens to t.'],
  ['jalka', 'jalan', "the foot's / of the foot", 'k disappears.'],
  ['poika', 'pojan', "the boy's / of the boy", 'k changes to j.'],
  ['puku', 'puvun', "the suit's / of the suit", 'k changes to v.'],
  ['leipä', 'leivän', "the bread's / of the bread", 'p changes to v.'],
  ['pöytä', 'pöydän', "the table's / of the table", 't changes to d.'],
  ['kaupunki', 'kaupungin', "the city's / of the city", 'nk weakens to ng.'],
  ['kenkä', 'kengän', "the shoe's / of the shoe", 'nk weakens to ng.'],
  ['ranta', 'rannan', "the beach's / of the beach", 'nt weakens to nn.'],
  ['pankki', 'pankin', "the bank's / of the bank", 'kk weakens to k.'],
  ['kauppa', 'kaupan', "the shop's / of the shop", 'pp weakens to p.'],
  ['tyttö', 'tytön', "the girl's / of the girl", 'tt weakens to t.'],
  ['katto', 'katon', "the roof's / of the roof", 'tt weakens to t.'],
  ['hattu', 'hatun', "the hat's / of the hat", 'tt weakens to t.'],
  ['lippu', 'lipun', "the ticket's / of the ticket", 'pp weakens to p.'],
  ['kukka', 'kukan', "the flower's / of the flower", 'kk weakens to k.'],
  ['takki', 'takin', "the coat's / of the coat", 'kk weakens to k.'],
  ['matto', 'maton', "the rug's / of the rug", 'tt weakens to t.'],
];

const test4 = nounGenitives.map(([base, form, english, rule], index) => {
  const baseMeaning = meaningOf(base);
  const explanation = `${base} means “${baseMeaning}”; ${form} means “${english}”. The genitive ends in -n. ${rule}`;
  const focus = { vocabulary: [base] };
  if (index % 4 === 0)
    return fill(
      idFor(4, index),
      `${base} (“${baseMeaning}”) → ____ (“${english}”) · add genitive -n`,
      form,
      explanation,
      ['kpt', 'noun', 'genitive'],
      focus,
    );
  if (index % 4 === 1)
    return toFinnish(
      idFor(4, index),
      `${english} — use the supplied base ${base} (“${baseMeaning}”)`,
      form,
      explanation,
      ['kpt', 'noun', 'genitive'],
      focus,
    );
  if (index % 4 === 2)
    return choice(
      idFor(4, index),
      `Choose the form meaning “${english}” from ${base} (“${baseMeaning}”).`,
      [form, `${base}n`, base],
      form,
      explanation,
      ['kpt', 'noun', 'genitive'],
      focus,
    );
  return toEnglish(idFor(4, index), form, english, explanation, ['kpt', 'noun', 'genitive'], focus);
});

const verbForms = [
  ['nukkua', 'nukun', 'I sleep', 'kk weakens to k.'],
  ['ottaa', 'otan', 'I take', 'tt weakens to t.'],
  ['auttaa', 'autan', 'I help', 'tt weakens to t.'],
  ['lukea', 'luen', 'I read', 'k disappears.'],
  ['pukea', 'puen', 'I get dressed', 'k disappears.'],
  ['hakea', 'haen', 'I fetch', 'k disappears.'],
  ['antaa', 'annan', 'I give', 'nt weakens to nn.'],
  ['lentää', 'lennän', 'I fly', 'nt weakens to nn.'],
  ['kertoa', 'kerron', 'I tell', 'rt weakens to rr.'],
  ['ymmärtää', 'ymmärrän', 'I understand', 'rt weakens to rr.'],
  ['nukkua', 'nukun', 'I sleep', 'kk weakens to k.'],
  ['ottaa', 'otan', 'I take', 'tt weakens to t.'],
  ['auttaa', 'autan', 'I help', 'tt weakens to t.'],
  ['lukea', 'luen', 'I read', 'k disappears.'],
  ['pukea', 'puen', 'I get dressed', 'k disappears.'],
  ['hakea', 'haen', 'I fetch', 'k disappears.'],
  ['antaa', 'annan', 'I give', 'nt weakens to nn.'],
  ['lentää', 'lennän', 'I fly', 'nt weakens to nn.'],
  ['kertoa', 'kerron', 'I tell', 'rt weakens to rr.'],
  ['ymmärtää', 'ymmärrän', 'I understand', 'rt weakens to rr.'],
];

const test5 = verbForms.map(([infinitive, minä, english, rule], index) => {
  const infinitiveMeaning = meaningOf(infinitive);
  const explanation = `${infinitive} means “${infinitiveMeaning}”; ${minä} means “${english}”. This is the minä-form of ${infinitive}. Add the minä ending -n after forming the stem. ${rule}`;
  const focus = { vocabulary: [infinitive] };
  if (index % 4 === 0)
    return fill(
      idFor(5, index),
      `${infinitive} (“${infinitiveMeaning}”) → minä ____ (“${english}”) · add minä -n`,
      minä,
      explanation,
      ['kpt', 'verb'],
      focus,
    );
  if (index % 4 === 1)
    return toFinnish(
      idFor(5, index),
      `${english} — use the supplied dictionary form ${infinitive} (“${infinitiveMeaning}”)`,
      minä,
      explanation,
      ['kpt', 'verb'],
      focus,
    );
  if (index % 4 === 2)
    return choice(
      idFor(5, index),
      `Choose the form meaning “${english}” from ${infinitive} (“${infinitiveMeaning}”).`,
      [minä, `${infinitive.slice(0, -1)}n`, infinitive],
      minä,
      explanation,
      ['kpt', 'verb'],
      focus,
    );
  return toEnglish(idFor(5, index), minä, english, explanation, ['kpt', 'verb'], focus);
});

const regularPlurals = [
  ['kirja', 'kirjat', 'books'],
  ['koira', 'koirat', 'dogs'],
  ['kynä', 'kynät', 'pens'],
  ['omena', 'omenat', 'apples'],
  ['sana', 'sanat', 'words'],
  ['kuva', 'kuvat', 'pictures'],
  ['tuoli', 'tuolit', 'chairs'],
  ['kissa', 'kissat', 'cats'],
  ['pallo', 'pallot', 'balls'],
  ['ystävä', 'ystävät', 'friends'],
  ['kirja', 'kirjat', 'books'],
  ['koira', 'koirat', 'dogs'],
  ['kynä', 'kynät', 'pens'],
  ['omena', 'omenat', 'apples'],
  ['sana', 'sanat', 'words'],
  ['kuva', 'kuvat', 'pictures'],
  ['tuoli', 'tuolit', 'chairs'],
  ['kissa', 'kissat', 'cats'],
  ['pallo', 'pallot', 'balls'],
  ['ystävä', 'ystävät', 'friends'],
];

const test6 = regularPlurals.map(([singular, plural, english], index) => {
  const singularMeaning = meaningOf(singular);
  const explanation = `${singular} means “${singularMeaning}”; ${plural} means “${english}”. The nominative T-plural is formed here by adding -t: ${singular} → ${plural}.`;
  const focus = { vocabulary: [singular] };
  if (index % 4 === 0)
    return fill(
      idFor(6, index),
      `${singular} (“${singularMeaning}”) → ____ (“${english}”) · add plural -t`,
      plural,
      explanation,
      ['t-plural', 'regular'],
      focus,
    );
  if (index % 4 === 1)
    return toFinnish(
      idFor(6, index),
      `${english} — use the supplied base ${singular} (“${singularMeaning}”)`,
      plural,
      explanation,
      ['t-plural', 'regular'],
      focus,
    );
  if (index % 4 === 2)
    return choice(
      idFor(6, index),
      `Choose the form meaning “${english}” from ${singular} (“${singularMeaning}”).`,
      [plural, `${singular}et`, singular],
      plural,
      explanation,
      ['t-plural', 'regular'],
      focus,
    );
  return fill(
    idFor(6, index),
    `${singular} (“${singularMeaning}”) → ____ (“${english}”) · add plural -t`,
    plural,
    explanation,
    ['t-plural', 'regular'],
    focus,
  );
});

const gradatingPlurals = [
  ['pankki', 'pankit', 'banks', 'kk → k'],
  ['kauppa', 'kaupat', 'shops', 'pp → p'],
  ['matto', 'matot', 'rugs', 'tt → t'],
  ['kukka', 'kukat', 'flowers', 'kk → k'],
  ['hattu', 'hatut', 'hats', 'tt → t'],
  ['lippu', 'liput', 'tickets', 'pp → p'],
  ['takki', 'takit', 'coats', 'kk → k'],
  ['katto', 'katot', 'roofs', 'tt → t'],
  ['tyttö', 'tytöt', 'girls', 'tt → t'],
  ['keitto', 'keitot', 'soups', 'tt → t'],
  ['kenkä', 'kengät', 'shoes', 'nk → ng'],
  ['kaupunki', 'kaupungit', 'cities', 'nk → ng'],
  ['pöytä', 'pöydät', 'tables', 't → d'],
  ['leipä', 'leivät', 'breads / loaves', 'p → v'],
  ['silta', 'sillat', 'bridges', 'lt → ll'],
  ['ranta', 'rannat', 'beaches', 'nt → nn'],
  ['pelto', 'pellot', 'fields', 'lt → ll'],
  ['kampa', 'kammat', 'combs', 'mp → mm'],
  ['jalka', 'jalat', 'feet / legs', 'k → ∅'],
  ['poika', 'pojat', 'boys', 'k → j'],
];

const test7 = gradatingPlurals.map(([singular, plural, english, rule], index) => {
  const singularMeaning = meaningOf(singular);
  const explanation = `${singular} means “${singularMeaning}”; ${plural} means “${english}”. Add plural -t to the weak stem. The KPT change is ${rule}: ${singular} → ${plural}.`;
  const focus = { vocabulary: [singular] };
  if (index % 4 === 0)
    return fill(
      idFor(7, index),
      `${singular} (“${singularMeaning}”) → ____ (“${english}”) · add plural -t`,
      plural,
      explanation,
      ['t-plural', 'kpt'],
      focus,
    );
  if (index % 4 === 1)
    return toFinnish(
      idFor(7, index),
      `${english} — use the supplied base ${singular} (“${singularMeaning}”)`,
      plural,
      explanation,
      ['t-plural', 'kpt'],
      focus,
    );
  if (index % 4 === 2)
    return choice(
      idFor(7, index),
      `Choose the form meaning “${english}” from ${singular} (“${singularMeaning}”).`,
      [plural, `${singular}t`, singular],
      plural,
      explanation,
      ['t-plural', 'kpt'],
      focus,
    );
  return toEnglish(idFor(7, index), plural, english, explanation, ['t-plural', 'kpt'], focus);
});

const thirdPlural = [
  ['puhua', 'puhu-', 'puhuvat', 'they speak', '-vat'],
  ['asua', 'asu-', 'asuvat', 'they live', '-vat'],
  ['laulaa', 'laula-', 'laulavat', 'they sing', '-vat'],
  ['ostaa', 'osta-', 'ostavat', 'they buy', '-vat'],
  ['kysyä', 'kysy-', 'kysyvät', 'they ask', '-vät'],
  ['lähteä', 'lähte-', 'lähtevät', 'they leave', '-vät'],
  ['istua', 'istu-', 'istuvat', 'they sit', '-vat'],
  ['sanoa', 'sano-', 'sanovat', 'they say', '-vat'],
  ['katsoa', 'katso-', 'katsovat', 'they look / watch', '-vat'],
  ['seisoa', 'seiso-', 'seisovat', 'they stand', '-vat'],
  ['puhua', 'puhu-', 'puhuvat', 'they speak', '-vat'],
  ['asua', 'asu-', 'asuvat', 'they live', '-vat'],
  ['laulaa', 'laula-', 'laulavat', 'they sing', '-vat'],
  ['ostaa', 'osta-', 'ostavat', 'they buy', '-vat'],
  ['kysyä', 'kysy-', 'kysyvät', 'they ask', '-vät'],
  ['lähteä', 'lähte-', 'lähtevät', 'they leave', '-vät'],
  ['istua', 'istu-', 'istuvat', 'they sit', '-vat'],
  ['sanoa', 'sano-', 'sanovat', 'they say', '-vat'],
  ['katsoa', 'katso-', 'katsovat', 'they look / watch', '-vat'],
  ['seisoa', 'seiso-', 'seisovat', 'they stand', '-vat'],
];

const verbSentenceLesson = (infinitive, stem, form, english, suffix) =>
  sentenceExplanation(
    `${english.charAt(0).toUpperCase()}${english.slice(1)}.`,
    'Subject (who does it) + verb (what they do)',
    [
      sentencePart(
        'he',
        'they',
        'Subject — the people doing the action.',
        'he',
        'he is already the basic pronoun meaning “they”, so it does not need an ending here.',
      ),
      sentencePart(
        form,
        english.replace(/^they /, ''),
        'Verb — the action performed by the plural subject.',
        infinitive,
        `The exercise supplies the stem ${stem}, so no stem-building rule is being tested. Add ${suffix}; this ending shows that the subject is he (“they”). ${suffix === '-vat' ? 'Vowel harmony chooses -vat because the supplied stem contains a back vowel: a, o, or u.' : 'Vowel harmony chooses -vät because the supplied stem uses front vowels ä, ö, or y, or only neutral vowels e and i.'}`,
      ),
    ],
  );

const test8 = thirdPlural.map(([infinitive, stem, form, english, suffix], index) => {
  const infinitiveMeaning = meaningOf(infinitive);
  const explanation = `${infinitive} means “${infinitiveMeaning}”; ${form} means “${english}”. The stem ${stem} is supplied. For he (“they”), vowel harmony selects ${suffix}: ${form}.`;
  const lesson = verbSentenceLesson(infinitive, stem, form, english, suffix);
  const tags = ['vowel-harmony', 'verb', 'plural', 'sentence'];
  const focus = { ...lesson, vocabulary: [infinitive] };
  if (index % 4 === 0)
    return fill(
      idFor(8, index),
      `${infinitive} (“${infinitiveMeaning}”): ${stem} + ${suffix} → ____ (“${english}”)`,
      form,
      explanation,
      tags,
      focus,
    );
  if (index % 4 === 1)
    return choice(
      idFor(8, index),
      `Which ending completes supplied ${stem} from ${infinitive} (“${infinitiveMeaning}”) to mean “${english}”?`,
      ['-vat', '-vät'],
      suffix,
      explanation,
      tags,
      focus,
    );
  if (index % 4 === 2)
    return choice(
      idFor(8, index),
      `Choose the he-form meaning “${english}” built from ${infinitive} (“${infinitiveMeaning}”) and supplied stem ${stem}.`,
      [form, swapVat(form), infinitive],
      form,
      explanation,
      tags,
      focus,
    );
  return toFinnish(
    idFor(8, index),
    `${english} — use the supplied stem ${stem} from ${infinitive} (“${infinitiveMeaning}”)`,
    [`he ${form}`, form],
    explanation,
    tags,
    focus,
  );
});

const pluralSentences = [
  ['kirja', 'Kirjat', 'the books', 'kotona', 'at home', 'The books are at home.'],
  ['koira', 'Koirat', 'the dogs', 'ulkona', 'outside', 'The dogs are outside.'],
  ['kynä', 'Kynät', 'the pens', 'täällä', 'here', 'The pens are here.'],
  ['omena', 'Omenat', 'the apples', 'täällä', 'here', 'The apples are here.'],
  ['sana', 'Sanat', 'the words', 'täällä', 'here', 'The words are here.'],
  ['kuva', 'Kuvat', 'the pictures', 'täällä', 'here', 'The pictures are here.'],
  ['tuoli', 'Tuolit', 'the chairs', 'täällä', 'here', 'The chairs are here.'],
  ['kissa', 'Kissat', 'the cats', 'kotona', 'at home', 'The cats are at home.'],
  ['pallo', 'Pallot', 'the balls', 'ulkona', 'outside', 'The balls are outside.'],
  ['ystävä', 'Ystävät', 'the friends', 'kotona', 'at home', 'The friends are at home.'],
  ['kirja', 'Kirjat', 'the books', 'täällä', 'here', 'The books are here.'],
  ['koira', 'Koirat', 'the dogs', 'täällä', 'here', 'The dogs are here.'],
  ['kynä', 'Kynät', 'the pens', 'kotona', 'at home', 'The pens are at home.'],
  ['omena', 'Omenat', 'the apples', 'kotona', 'at home', 'The apples are at home.'],
  ['sana', 'Sanat', 'the words', 'kotona', 'at home', 'The words are at home.'],
  ['kuva', 'Kuvat', 'the pictures', 'kotona', 'at home', 'The pictures are at home.'],
  ['tuoli', 'Tuolit', 'the chairs', 'ulkona', 'outside', 'The chairs are outside.'],
  ['kissa', 'Kissat', 'the cats', 'täällä', 'here', 'The cats are here.'],
  ['pallo', 'Pallot', 'the balls', 'täällä', 'here', 'The balls are here.'],
  ['ystävä', 'Ystävät', 'the friends', 'täällä', 'here', 'The friends are here.'],
].map(([singular, plural, subjectMeaning, complement, complementMeaning, translation]) => ({
  singular,
  plural,
  subjectMeaning,
  subjectFormation: `Start with ${singular}. The stem stays unchanged. Add plural -t: ${plural.toLocaleLowerCase('fi-FI')}.`,
  complement,
  complementMeaning,
  complementBase: complement,
  complementFormation: `${complement} is supplied as a complete fixed word meaning “${complementMeaning}”. No place-ending rule is being tested.`,
  translation,
}));

const pluralSentenceLesson = (item) =>
  sentenceExplanation(
    item.translation,
    'Plural subject (who or what) + ovat (“are”) + place or state',
    [
      sentencePart(
        item.plural,
        item.subjectMeaning,
        'Subject — the people or things that the sentence is about.',
        item.singular,
        item.subjectFormation,
      ),
      sentencePart(
        'ovat',
        'are',
        'Verb — connects the plural subject to its place or state.',
        'olla',
        'olla is the dictionary form meaning “to be”. Because the subject means more than one, use the third-person plural form ovat, meaning “they are”.',
      ),
      sentencePart(
        item.complement,
        item.complementMeaning,
        'Place or state — tells where the subject is or what its condition is.',
        item.complementBase,
        item.complementFormation,
      ),
    ],
  );

const test9 = pluralSentences.map((item, index) => {
  const sentence = `${item.plural} ovat ${item.complement}.`;
  const explanation = `The subject is plural: ${item.singular} → ${item.plural}. A plural subject uses ovat, meaning “are”.`;
  const lesson = pluralSentenceLesson(item);
  const focus = { ...lesson, vocabulary: [item.singular, 'olla', 'ovat', item.complement] };
  if (index % 4 === 0)
    return fill(
      idFor(9, index),
      `____ ovat ${item.complement}. (${item.singular})`,
      item.plural,
      explanation,
      ['t-plural', 'sentence'],
      focus,
    );
  if (index % 4 === 1)
    return order(
      idFor(9, index),
      ['ovat', `${item.complement}.`, item.plural],
      sentence,
      explanation,
      ['t-plural', 'sentence'],
      focus,
    );
  if (index % 4 === 2)
    return fill(
      idFor(9, index),
      `${item.plural} ____ ${item.complement}. (“are”)`,
      'ovat',
      explanation,
      ['t-plural', 'sentence'],
      focus,
    );
  return toEnglish(
    idFor(9, index),
    sentence,
    item.translation,
    explanation,
    ['t-plural', 'sentence'],
    focus,
  );
});

const pluralLessonFor = (singular) => {
  const item = pluralSentences.find((candidate) => candidate.singular === singular);
  if (!item) throw new Error(`Missing plural sentence lesson for ${singular}.`);
  return pluralSentenceLesson(item);
};

const verbLessonFor = (infinitive) => {
  const item = thirdPlural.find((candidate) => candidate[0] === infinitive);
  if (!item) throw new Error(`Missing verb sentence lesson for ${infinitive}.`);
  return verbSentenceLesson(item[0], item[1], item[2], item[3], item[4]);
};

const lessonPluralSentence = (
  singular,
  plural,
  subjectMeaning,
  subjectFormation,
  complement,
  complementMeaning,
  complementBase,
  complementFormation,
  translation,
) =>
  sentenceExplanation(
    translation,
    'Plural subject (more than one person or thing) + ovat (“are”) + place or state',
    [
      sentencePart(
        plural,
        subjectMeaning,
        'Subject — the people or things that the sentence is about.',
        singular,
        subjectFormation,
      ),
      sentencePart(
        'ovat',
        'are',
        'Verb — connects the plural subject to its place or state.',
        'olla',
        'olla means “to be”. A subject meaning more than one uses ovat, meaning “are”.',
      ),
      sentencePart(
        complement,
        complementMeaning,
        'Place or state — tells where the subject is or what it is like.',
        complementBase,
        complementFormation,
      ),
    ],
  );

const lessons = [
  lesson(
    'vowel-harmony-basics',
    'Vowel harmony from the beginning',
    'Learn why many Finnish endings have two forms and how to choose between a and ä.',
    [
      'Recognise the back vowels a, o, and u.',
      'Recognise the front vowels ä, ö, and y.',
      'Handle words that contain only the neutral vowels e and i.',
    ],
    [
      lessonSection(
        'What vowel harmony means',
        [
          'A vowel is a speech sound written with a letter such as a, e, i, o, u, y, ä, or ö. Finnish endings often come in two matching versions. One version contains a and the other contains ä.',
          'The vowels a, o, and u form the back-vowel family. The vowels ä, ö, and y form the front-vowel family. The vowels e and i are neutral: they can live beside either family.',
        ],
        ['Back vowels: a, o, u', 'Front vowels: ä, ö, y', 'Neutral vowels: e, i'],
      ),
      lessonSection(
        'How to choose an ending',
        [
          'Look through the Finnish word for a, o, or u. If one of them appears, choose the ending with a, such as -ssa or -vat.',
          'If the word has ä, ö, or y and no back vowel, choose the ending with ä, such as -ssä or -vät. A word containing only e and i normally also chooses the ä version.',
        ],
        ['talo → -ssa', 'pöytä → -ssä', 'nimi → -ssä'],
      ),
    ],
    [
      lessonExample('talo + -ssa → talossa', 'in the house', [
        'talo contains a and o.',
        'Both are back vowels.',
        'Choose the a-ending -ssa.',
      ]),
      lessonExample('kylä + -ssä → kylässä', 'in the village', [
        'kylä contains y and ä.',
        'They are front vowels.',
        'Choose the ä-ending -ssä. The stem stays unchanged.',
      ]),
      lessonExample('tie + -ssä → tiessä', 'on the road', [
        'tie contains only i and e.',
        'i and e are neutral.',
        'A neutral-only Finnish word normally chooses the front-vowel ending -ssä.',
      ]),
    ],
    [
      'Do not choose an ending from the final vowel alone; inspect the whole Finnish word.',
      'The letters a and ä are different Finnish vowels, not decorative versions of one letter.',
      'Loanwords can behave differently, but the regular beginner rule covers the words in this pack.',
    ],
    [
      choice(
        'ff-a1-l-vh-p01',
        'Look at “talo”. Which family contains its non-neutral vowels?',
        ['back vowels', 'front vowels', 'only neutral vowels'],
        'back vowels',
        'talo contains a and o. Both belong to the back-vowel family.',
        ['lesson-practice', 'vowel-harmony'],
      ),
      choice(
        'ff-a1-l-vh-p02',
        'Which ending fits “päivä”?',
        ['-ssa', '-ssä'],
        '-ssä',
        'päivä contains ä and no back vowel, so it takes the front-vowel ending -ssä.',
        ['lesson-practice', 'vowel-harmony'],
      ),
      choice(
        'ff-a1-l-vh-p03',
        'The vowels in “tie” belong to which group?',
        ['back vowels', 'front vowels', 'only neutral vowels'],
        'only neutral vowels',
        'tie contains only i and e. Both are neutral vowels.',
        ['lesson-practice', 'vowel-harmony'],
      ),
    ],
  ),
  lesson(
    'inside-ending',
    'Saying “in” with -ssa and -ssä',
    'Build a common Finnish place form after choosing the vowel-harmony version of the ending.',
    [
      'Understand what -ssa/-ssä means.',
      'Attach the ending to a stable word.',
      'Keep your attention on the ending rather than an unrelated stem rule.',
    ],
    [
      lessonSection(
        'The meaning of the ending',
        [
          'Finnish often expresses an English preposition by adding an ending to a word. The ending -ssa or -ssä usually means “in”.',
          'The two endings have the same meaning. Vowel harmony chooses their spelling: back-vowel words use -ssa and front- or neutral-only words use -ssä.',
        ],
        ['-ssa and -ssä both mean “in”', 'Only the vowel-harmony spelling changes'],
      ),
      lessonSection(
        'Build the form one step at a time',
        [
          'Start with the basic dictionary form. Decide whether the word needs the a-ending or ä-ending. Then attach the ending without a space.',
          'Every word in this focused lesson has a stable stem. No consonant or final-vowel change is hidden inside the answer.',
        ],
        ['sauna + -ssa → saunassa', 'myymälä + -ssä → myymälässä'],
      ),
    ],
    [
      lessonExample('sauna → saunassa', 'in the sauna', [
        'sauna contains the back vowels a and u.',
        'Choose -ssa.',
        'Attach it directly: sauna + ssa = saunassa.',
      ]),
      lessonExample('myymälä → myymälässä', 'in the store', [
        'myymälä contains the front vowels y and ä.',
        'Choose -ssä.',
        'Attach it directly: myymälä + ssä = myymälässä.',
      ]),
    ],
    [
      'Do not write the ending as a separate word.',
      'Do not translate every English “in” mechanically; this lesson covers the regular physical-place meaning.',
      'Do not invent a stem change: every word in this lesson keeps the supplied stem.',
    ],
    [
      fill(
        'ff-a1-l-in-p01',
        'Practise the inside ending: sauna (“sauna”) → ____ (“in the sauna”)',
        'saunassa',
        'sauna has back vowels, so add -ssa directly: saunassa.',
        ['lesson-practice', 'vowel-harmony', 'inessive'],
      ),
      choice(
        'ff-a1-l-in-p02',
        'Which option means “in the office”?',
        ['toimistossa', 'toimistössä', 'toimisto'],
        'toimistossa',
        'toimisto contains the back vowel o, so “in the office” is toimistossa.',
        ['lesson-practice', 'vowel-harmony', 'inessive'],
      ),
      toFinnish(
        'ff-a1-l-in-p03',
        'in the store',
        'myymälässä',
        'myymälä contains y and ä, so the front-vowel ending is -ssä: myymälässä.',
        ['lesson-practice', 'vowel-harmony', 'inessive'],
      ),
    ],
  ),
  lesson(
    'kpt-doubles',
    'KPT step 1: double consonants',
    'Learn only the three most visible KPT changes: kk → k, pp → p, and tt → t.',
    [
      'Understand strong and weak grade in plain English.',
      'Recognise the three double-consonant changes.',
      'Produce a supplied weak form without learning another KPT family.',
    ],
    [
      lessonSection(
        'One letter remains',
        [
          'A double consonant has two identical consonant letters. In these weak forms, the pair becomes one letter.',
          'Strong grade is the form with the double consonant. Weak grade is the form with one consonant.',
        ],
        ['kk → k', 'pp → p', 'tt → t'],
      ),
      lessonSection(
        'Keep the ending separate',
        [
          'First notice or make the consonant change. Then read the ending already shown in the complete form.',
          'This lesson does not ask you to predict single-consonant or cluster changes.',
        ],
        ['pankki → panki- → pankin', 'matto → mato- → maton'],
      ),
    ],
    [
      lessonExample('pankki → pankin', 'bank → of the bank', [
        'Compare the middle of the two forms.',
        'The two k letters become one: kk → k.',
        'The final -n is a separate ending.',
      ]),
      lessonExample('kauppa → kaupan', 'shop → of the shop', [
        'The two p letters become one: pp → p.',
        'The weak part is kaupa-.',
        'The complete supplied form is kaupan.',
      ]),
      lessonExample('matto → maton', 'rug → of the rug', [
        'The two t letters become one: tt → t.',
        'The weak part is mato-.',
        'The complete supplied form is maton.',
      ]),
    ],
    [
      'Do not remove both consonants.',
      'Do not apply a single-consonant rule in this lesson.',
      'The final ending is not part of the KPT change.',
    ],
    [
      choice(
        'ff-a1-l-kptd-p01',
        'What changes in pankki (“bank”) → pankin (“of the bank”)?',
        ['kk → k', 'k → ∅', 'nk → ng'],
        'kk → k',
        'The double kk becomes one k.',
        ['lesson-practice', 'kpt'],
      ),
      choice(
        'ff-a1-l-kptd-p02',
        'What changes in kauppa (“shop”) → kaupan (“of the shop”)?',
        ['pp → p', 'p → v', 'mp → mm'],
        'pp → p',
        'The double pp becomes one p.',
        ['lesson-practice', 'kpt'],
      ),
      fill(
        'ff-a1-l-kptd-p03',
        'Practice only: matto (“rug”) → ____ (“of the rug”) · use supplied genitive -n; apply tt → t',
        'maton',
        'First shorten tt to t, giving mato-, and then read the supplied complete pattern maton.',
        ['lesson-practice', 'kpt'],
      ),
      fill(
        'ff-a1-l-kptd-p04',
        'Practice only: kukka (“flower”) → ____ (“of the flower”) · use supplied genitive -n; apply kk → k',
        'kukan',
        'The supplied target is the genitive meaning “of the flower”, so keep -n fixed. Shorten kk to k: kukka → kuka-, then add -n to make kukan.',
        ['lesson-practice', 'kpt'],
      ),
    ],
  ),
  lesson(
    'kpt-singles',
    'KPT step 2: common single consonants',
    'Learn three common weak changes without mixing in double consonants or clusters.',
    ['Recognise when k disappears.', 'Recognise p → v.', 'Recognise t → d.'],
    [
      lessonSection(
        'Three changes only',
        [
          'A single consonant can change rather than merely shorten. In this block, k disappears, p becomes v, or t becomes d.',
          'Both complete forms are supplied during recognition.',
        ],
        ['k → ∅', 'p → v', 't → d'],
      ),
      lessonSection(
        'Compare the same position',
        [
          'Find the consonant in the first form and compare the same part of the second form.',
          'The symbol ∅ means that no letter remains in that position.',
        ],
        ['jalka → jalan', 'leipä → leivän', 'pöytä → pöydän'],
      ),
    ],
    [
      lessonExample('jalka → jalan', 'foot or leg → of the foot or leg', [
        'Compare jalka and jalan.',
        'The k is absent in the weak form: k → ∅.',
        'The other letters remain visible around that position.',
      ]),
      lessonExample('leipä → leivän', 'bread → of the bread', [
        'Compare leipä and leivän.',
        'The p becomes v: p → v.',
        'The final -n belongs to the complete noun form.',
      ]),
      lessonExample('pöytä → pöydän', 'table → of the table', [
        'Compare pöytä and pöydän.',
        'The t becomes d: t → d.',
        'Keep the Finnish vowels ö and ä unchanged.',
      ]),
    ],
    [
      'Do not remove every k in Finnish.',
      'Do not change p to b; the taught change is p → v.',
      'Do not replace Finnish d with English-style spelling.',
    ],
    [
      choice(
        'ff-a1-l-kpts-p01',
        'What changes in jalka (“foot or leg”) → jalan (“of the foot or leg”)?',
        ['k → ∅', 'k → j', 'kk → k'],
        'k → ∅',
        'The single k disappears in the supplied weak form.',
        ['lesson-practice', 'kpt'],
      ),
      choice(
        'ff-a1-l-kpts-p02',
        'What changes in leipä (“bread”) → leivän (“of the bread”)?',
        ['p → v', 'pp → p', 't → d'],
        'p → v',
        'The single p becomes v.',
        ['lesson-practice', 'kpt'],
      ),
      choice(
        'ff-a1-l-kpts-p03',
        'What changes in pöytä (“table”) → pöydän (“of the table”)?',
        ['t → d', 'tt → t', 'lt → ll'],
        't → d',
        'The single t becomes d.',
        ['lesson-practice', 'kpt'],
      ),
      fill(
        'ff-a1-l-kpts-p04',
        'hakea (“to fetch”), supplied stem hake- + minä -n → ____ (“I fetch”) · k disappears',
        'haen',
        'The supplied target means “I fetch”. Use the supplied stem hake- and minä ending -n, let k disappear, and combine the parts: hakea → haen.',
        ['lesson-practice', 'kpt'],
      ),
    ],
  ),
  lesson(
    'kpt-special-k',
    'KPT step 3: two special k changes',
    'Treat k → j and k → v as small, separately memorised word families.',
    [
      'Recognise k → j in supplied word pairs.',
      'Recognise k → v in supplied word pairs.',
      'Avoid guessing these changes for unfamiliar words.',
    ],
    [
      lessonSection(
        'Learn the pair with the word',
        [
          'Some k changes are less predictable for a beginner. Learn each supplied dictionary form together with its weak partner.',
          'This block contains only k → j and k → v.',
        ],
        ['poika → pojan: k → j', 'puku → puvun: k → v'],
      ),
      lessonSection(
        'Recognition before free production',
        [
          'Read both forms aloud or silently and point to the changed position.',
          'The later mixed block will ask you to distinguish these from the earlier KPT families.',
        ],
        ['aika → ajan: k → j', 'luku → luvun: k → v'],
      ),
    ],
    [
      lessonExample('poika → pojan', 'boy → of the boy', [
        'The supplied forms show k becoming j.',
        'Keep oi in poika and oj in pojan as one learned pair.',
        'The final -n is separate from KPT.',
      ]),
      lessonExample('puku → puvun', 'suit → of the suit', [
        'The supplied forms show k becoming v.',
        'Learn puku together with puvun.',
        'Do not apply this change to every word containing k.',
      ]),
    ],
    [
      'Do not assume every k becomes j.',
      'Do not assume every k becomes v.',
      'Use only the supplied and practised word families at this level.',
    ],
    [
      choice(
        'ff-a1-l-kptk-p01',
        'What changes in poika (“boy”) → pojan (“of the boy”)?',
        ['k → j', 'k → v', 'k → ∅'],
        'k → j',
        'In this learned pair, k becomes j.',
        ['lesson-practice', 'kpt'],
      ),
      choice(
        'ff-a1-l-kptk-p02',
        'What changes in puku (“suit”) → puvun (“of the suit”)?',
        ['k → v', 'k → j', 'p → v'],
        'k → v',
        'In this learned pair, k becomes v.',
        ['lesson-practice', 'kpt'],
      ),
      fill(
        'ff-a1-l-kptk-p03',
        'Practice only: aika (“time”) → ____ (“of the time”) · use supplied genitive -n; apply k → j',
        'ajan',
        'Use the learned weak partner aja- and the displayed complete form ajan.',
        ['lesson-practice', 'kpt'],
      ),
      fill(
        'ff-a1-l-kptk-p04',
        'Practice only: luku (“number or chapter”) → ____ (“of the number or chapter”) · use supplied genitive -n; apply k → v',
        'luvun',
        'Use the learned weak partner luvu- and the displayed complete form luvun.',
        ['lesson-practice', 'kpt'],
      ),
    ],
  ),
  lesson(
    'kpt-clusters',
    'KPT step 4: consonant clusters',
    'Learn changes where two neighbouring consonants act as one pattern.',
    [
      'Understand the word consonant cluster.',
      'Recognise five common cluster changes.',
      'Compare complete forms without adding a new ending decision.',
    ],
    [
      lessonSection(
        'A cluster is a pair',
        [
          'A consonant cluster is two neighbouring consonants. Compare the whole pair instead of changing one isolated letter.',
          'The five patterns in this block are shown explicitly.',
        ],
        ['nk → ng', 'mp → mm', 'nt → nn', 'lt → ll', 'rt → rr'],
      ),
      lessonSection(
        'Look at the middle',
        [
          'The ending may come after the changed cluster, but the ending is not the target here.',
          'Read the complete supplied forms and name only the cluster change.',
        ],
        ['kenkä → kengän', 'kampa → kamman', 'pelto → pellon'],
      ),
    ],
    [
      lessonExample('kenkä → kengän', 'shoe → of the shoe', [
        'The cluster is nk.',
        'In the weak form it is ng.',
        'Therefore the visible KPT change is nk → ng.',
      ]),
      lessonExample('pelto → pellon', 'field → of the field', [
        'The cluster is lt.',
        'In the weak form it is ll.',
        'Therefore the visible KPT change is lt → ll.',
      ]),
      lessonExample('ranta → rannan', 'beach → of the beach', [
        'The cluster is nt.',
        'In the weak form it is nn.',
        'Therefore the visible KPT change is nt → nn.',
      ]),
    ],
    [
      'Do not call the final -n part of the cluster.',
      'Compare both consonants together.',
      'Do not mix cluster patterns until each pair is familiar.',
    ],
    [
      choice(
        'ff-a1-l-kptc-p01',
        'What changes in kenkä (“shoe”) → kengän (“of the shoe”)?',
        ['nk → ng', 'nt → nn', 'kk → k'],
        'nk → ng',
        'The whole cluster nk becomes ng.',
        ['lesson-practice', 'kpt'],
      ),
      choice(
        'ff-a1-l-kptc-p02',
        'What changes in kampa (“comb”) → kamman (“of the comb”)?',
        ['mp → mm', 'pp → p', 'nt → nn'],
        'mp → mm',
        'The whole cluster mp becomes mm.',
        ['lesson-practice', 'kpt'],
      ),
      choice(
        'ff-a1-l-kptc-p03',
        'What changes in pelto (“field”) → pellon (“of the field”)?',
        ['lt → ll', 'rt → rr', 'tt → t'],
        'lt → ll',
        'The whole cluster lt becomes ll.',
        ['lesson-practice', 'kpt'],
      ),
      fill(
        'ff-a1-l-kptc-p04',
        'Practice only: ranta (“beach”) → ____ (“of the beach”) · use supplied genitive -n; apply nt → nn',
        'rannan',
        'The supplied target is the genitive meaning “of the beach”, so keep -n fixed. Change nt to nn and add -n: ranta → rannan.',
        ['lesson-practice', 'kpt'],
      ),
    ],
  ),
  lesson(
    'kpt-basics',
    'KPT step 5: distinguish the families',
    'Combine only the four KPT families that were taught in separate blocks.',
    [
      'Choose which known family a supplied pair uses.',
      'Keep KPT separate from the ending.',
      'Prepare to use known weak stems in later noun, verb, and plural lessons.',
    ],
    [
      lessonSection(
        'Ask one comparison question',
        [
          'Which consonant letters differ between the supplied first and second forms? Answering that question identifies the KPT family.',
          'You are not expected to predict an unfamiliar word.',
        ],
        ['double → one consonant', 'single consonant changes', 'special k pair', 'cluster changes'],
      ),
      lessonSection(
        'The next lessons add endings',
        [
          'This mixed block still focuses on seeing the consonant change.',
          'Later lessons will explicitly separate two construction steps: make the known weak stem, then add an ending.',
        ],
        ['pankki → panki- + n', 'pelto → pello- + t'],
      ),
    ],
    [
      lessonExample('pankki → pankin', 'bank → of the bank', [
        'Identify the double-consonant family.',
        'Apply kk → k.',
        'Ignore final -n when naming the KPT change.',
      ]),
      lessonExample('poika → pojan', 'boy → of the boy', [
        'Recognise this as a learned special-k pair.',
        'The change is k → j.',
        'Do not generalise it to every word with k.',
      ]),
      lessonExample('kenkä → kengän', 'shoe → of the shoe', [
        'Identify the cluster nk.',
        'The change is nk → ng.',
        'The final -n is separate.',
      ]),
    ],
    [
      'Do not choose a rule from the English meaning.',
      'Do not treat an ending as part of KPT.',
      'Return to the smaller lesson if one family is still unclear.',
    ],
    [
      choice(
        'ff-a1-l-kptm-p01',
        'What changes in pankki (“bank”) → pankin (“of the bank”)?',
        ['kk → k', 'k → ∅', 'nk → ng'],
        'kk → k',
        'This is the double-consonant family.',
        ['lesson-practice', 'kpt'],
      ),
      choice(
        'ff-a1-l-kptm-p02',
        'What changes in jalka (“foot or leg”) → jalan (“of the foot or leg”)?',
        ['k → ∅', 'k → j', 'kk → k'],
        'k → ∅',
        'This is the common single-k disappearance pattern.',
        ['lesson-practice', 'kpt'],
      ),
      choice(
        'ff-a1-l-kptm-p03',
        'What changes in poika (“boy”) → pojan (“of the boy”)?',
        ['k → j', 'k → v', 'p → v'],
        'k → j',
        'This is a separately learned special-k pair.',
        ['lesson-practice', 'kpt'],
      ),
      choice(
        'ff-a1-l-kptm-p04',
        'What changes in kenkä (“shoe”) → kengän (“of the shoe”)?',
        ['nk → ng', 'nt → nn', 'mp → mm'],
        'nk → ng',
        'This is the consonant-cluster family.',
        ['lesson-practice', 'kpt'],
      ),
    ],
  ),
  lesson(
    'genitive-nouns',
    'Building noun forms with -n',
    'Form the Finnish genitive, which often expresses “of” or possession.',
    [
      'Understand the basic meaning of the genitive.',
      'Add the ending -n.',
      'Apply a known weak-grade KPT change before -n.',
    ],
    [
      lessonSection(
        'Meaning and ending',
        [
          'A noun names a person, place, thing, or idea. The genitive is a noun form that often corresponds to English “of” or apostrophe-s.',
          'The basic genitive ending is -n. Many simple words add it to a stem that uses the weak KPT grade.',
        ],
        ['talo → talon: of the house', 'The written ending is -n'],
      ),
      lessonSection(
        'Construction order',
        [
          'Start with the dictionary form. Make the required KPT change to get the weak stem. Add -n to that stem.',
          'Not every noun changes. If there is no KPT pattern, the stem may remain stable.',
        ],
        ['pankki → panki- → pankin', 'matto → mato- → maton'],
      ),
    ],
    [
      lessonExample('pankki → pankin', 'of the bank', [
        'Use the previously learned change kk → k: pankki → panki-.',
        'Add the new target ending -n: pankin.',
      ]),
      lessonExample('kauppa → kaupan', 'of the shop', [
        'Use the previously learned change pp → p: kauppa → kaupa-.',
        'Add the new target ending -n: kaupan.',
      ]),
    ],
    [
      'Do not add -n before making the stem change.',
      'The genitive does not always mean literal ownership; it can also connect two nouns.',
      'Keep Finnish ä and ö exactly as written.',
    ],
    [
      fill(
        'ff-a1-l-gen-p01',
        'Pankki (“bank”) → ____ (“of the bank”) · use genitive -n; practise kk → k',
        'pankin',
        'Use the known kk → k change, then add -n: pankki → panki- → pankin.',
        ['lesson-practice', 'kpt', 'noun', 'genitive'],
      ),
      fill(
        'ff-a1-l-gen-p02',
        'Kauppa (“shop”) → ____ (“of the shop”) · use genitive -n; practise pp → p',
        'kaupan',
        'Use the known pp → p change, then add -n: kauppa → kaupa- → kaupan.',
        ['lesson-practice', 'kpt', 'noun', 'genitive'],
      ),
      choice(
        'ff-a1-l-gen-p03',
        'Which option means “of the rug”?',
        ['maton', 'matton', 'matto'],
        'maton',
        'Use the known tt → t change, then add -n: matto → mato- → maton.',
        ['lesson-practice', 'kpt', 'noun', 'genitive'],
      ),
    ],
  ),
  lesson(
    'verb-kpt',
    'Known KPT changes in “I” verb forms',
    'Apply the same strong-to-weak KPT changes to a small set of familiar minä forms.',
    [
      'Understand that minä means “I”.',
      'Recognise the minä ending -n.',
      'Apply one previously learned strong-to-weak KPT change.',
    ],
    [
      lessonSection(
        'From dictionary form to minä form',
        [
          'A verb expresses an action or state. The dictionary form is the form listed in a dictionary, such as nukkua, meaning “to sleep”.',
          'The minä form says that I perform the action. It ends in -n in these exercises, and the familiar KPT consonant becomes weak before that ending.',
        ],
        ['minä = I', 'nukkua → nukun = I sleep'],
      ),
      lessonSection(
        'One direction only in this lesson',
        [
          'This lesson uses only strong-to-weak changes already shown in the KPT recognition lesson: a double consonant shortens, k can disappear, or a familiar cluster weakens.',
          'Other verb types and strong-grade building are deliberately left for a later topic. They are not hidden in this test.',
        ],
        ['nukkua → nukun: kk → k', 'lentää → lennän: nt → nn'],
      ),
    ],
    [
      lessonExample('nukkua → minä nukun', 'I sleep', [
        'Use the familiar weak change kk → k.',
        'The weak part is nuku-.',
        'Add the minä ending -n: nukun.',
      ]),
      lessonExample('lentää → minä lennän', 'I fly', [
        'Use the personal stem lennä-.',
        'The cluster nt weakens to nn.',
        'Add -n: lennän.',
      ]),
    ],
    [
      'Do not simply attach -n to the complete dictionary form.',
      'Use only the strong-to-weak pattern shown for the supplied verb.',
      'A long vowel or doubled consonant is meaningful; copy it accurately.',
    ],
    [
      fill(
        'ff-a1-l-verb-p01',
        'Nukkua (“to sleep”) → minä ____ (“I sleep”) · use minä -n; practise kk → k',
        'nukun',
        'Use kk → k to make nuku-, then add -n: nukun.',
        ['lesson-practice', 'kpt', 'verb'],
      ),
      toFinnish(
        'ff-a1-l-verb-p02',
        'Practice translation: I fly',
        'lennän',
        'lentää uses the personal stem lennä- with nt → nn, then the minä ending -n: lennän.',
        ['lesson-practice', 'kpt', 'verb'],
      ),
      choice(
        'ff-a1-l-verb-p03',
        'Choose the minä-form of “ottaa”.',
        ['otan', 'ottan', 'ottaan'],
        'otan',
        'The double tt weakens to t in ota-. Add -n: otan.',
        ['lesson-practice', 'kpt', 'verb'],
      ),
    ],
  ),
  lesson(
    't-plural-basics',
    'More than one: the T-plural',
    'Use the nominative plural ending -t for people and things that are the subject of a basic sentence.',
    [
      'Understand singular and plural.',
      'Recognise the nominative subject form.',
      'Add -t to a stable noun stem.',
    ],
    [
      lessonSection(
        'Singular, plural, and nominative',
        [
          'Singular means one: yksi kissa, one cat. Plural means more than one: kissat, cats.',
          'Nominative is the basic subject form. A subject is the person or thing that the sentence is about. The Finnish nominative plural usually ends in -t.',
        ],
        ['kissa = one cat', 'kissat = cats', 'Plural subject ending: -t'],
      ),
      lessonSection(
        'The regular construction',
        [
          'For a stable word, start with the singular and attach -t directly. The -t itself does not have a vowel, so vowel harmony does not choose between two versions.',
          'Some nouns need KPT before -t. The next lesson separates that stem change from the plural ending.',
        ],
        ['pallo + t → pallot', 'ystävä + t → ystävät'],
      ),
    ],
    [
      lessonExample('kissa → kissat', 'cat → cats', [
        'The singular stem kissa- stays unchanged.',
        'Add plural -t: kissat.',
      ]),
      lessonExample('ystävä → ystävät', 'friend → friends', [
        'The singular stem ystävä- stays unchanged.',
        'Add plural -t: ystävät.',
        'Keep ä; the plural ending is only t.',
      ]),
    ],
    [
      'Do not add English -s to a Finnish word.',
      'Do not change a final a to ä; preserve the vowels of the noun.',
      'The T-plural is one plural form; later Finnish cases use other plural construction patterns.',
    ],
    [
      fill(
        'ff-a1-l-tpl-p01',
        'Optional practice: kissa (“cat”) → ____ (“cats”) · add plural -t',
        'kissat',
        'The stem stays kissa-. Add plural -t: kissat.',
        ['lesson-practice', 't-plural', 'regular'],
      ),
      toFinnish(
        'ff-a1-l-tpl-p02',
        'balls',
        'pallot',
        'The singular pallo has a stable stem. Add -t: pallot.',
        ['lesson-practice', 't-plural', 'regular'],
      ),
      choice(
        'ff-a1-l-tpl-p03',
        'Choose the plural of “ystävä”.',
        ['ystävät', 'ystäväät', 'ystävä'],
        'ystävät',
        'Add plural -t directly to ystävä: ystävät.',
        ['lesson-practice', 't-plural', 'regular'],
      ),
    ],
  ),
  lesson(
    'kpt-t-plural',
    'T-plurals that use KPT',
    'Change the consonant stem first and add plural -t second.',
    [
      'Identify the KPT change in a plural.',
      'Build the weak noun stem.',
      'Add -t only after the stem is ready.',
    ],
    [
      lessonSection(
        'Two construction steps',
        [
          'Many nouns use the weak KPT grade before nominative plural -t. First build the weak stem; then add the plural ending.',
          'Keeping the steps separate makes the form easier to understand: noun → weak stem → plural.',
        ],
        ['pankki → panki- → pankit', 'pelto → pello- → pellot'],
      ),
      lessonSection(
        'The same familiar KPT pairs',
        [
          'The changes are the same ones introduced earlier: double consonants can shorten, a single p can become v, and clusters can change.',
          'The final -t is the plural ending. A t created inside the stem is not the plural ending.',
        ],
        ['kk → k', 'p → v', 'lt → ll'],
      ),
    ],
    [
      lessonExample('pankki → pankit', 'bank → banks', [
        'Use the known change kk → k: pankki → panki-.',
        'Add the known plural ending -t: pankit.',
      ]),
      lessonExample('kauppa → kaupat', 'shop → shops', [
        'Use the known change pp → p: kauppa → kaupa-.',
        'Add the known plural ending -t: kaupat.',
      ]),
    ],
    [
      'Do not attach -t to the unchanged dictionary form when KPT is required.',
      'Do not count the final plural -t as part of the KPT change.',
      'Use the learned stem for that word; spelling cannot always be guessed from English.',
    ],
    [
      fill(
        'ff-a1-l-ktp-p01',
        'Practise both steps: pankki (“bank”) → ____ (“banks”)',
        'pankit',
        'First use kk → k: panki-. Then add plural -t: pankit.',
        ['lesson-practice', 't-plural', 'kpt'],
      ),
      toFinnish(
        'ff-a1-l-ktp-p02',
        'Practice translation: shops',
        'kaupat',
        'kauppa uses pp → p in the weak stem kaupa-. Add -t: kaupat.',
        ['lesson-practice', 't-plural', 'kpt'],
      ),
      choice(
        'ff-a1-l-ktp-p03',
        'Choose the plural of “pelto”.',
        ['pellot', 'peltot', 'pelto'],
        'pellot',
        'First change lt → ll to make pello-. Then add plural -t: pellot.',
        ['lesson-practice', 't-plural', 'kpt'],
      ),
    ],
  ),
  lesson(
    'he-verbs',
    'Saying what “they” do',
    'Add -vat or -vät to a supplied verb stem; stem building is not tested here.',
    [
      'Understand that he means “they”.',
      'Recognise the supplied verb stem.',
      'Choose and attach -vat or -vät with vowel harmony.',
    ],
    [
      lessonSection(
        'Subject and verb agreement',
        [
          'The subject tells who performs an action. The Finnish pronoun he means “they” when speaking about people.',
          'The verb must agree with that plural subject. In the present tense, the he form commonly ends in -vat or -vät.',
        ],
        ['he laulavat = they sing', 'he kysyvät = they ask'],
      ),
      lessonSection(
        'Choose the ending',
        [
          'A verb stem is the part before the personal ending. Every question supplies that stem. Your only new task is to use vowel harmony and attach -vat or -vät.',
          'Use -vat for a back-vowel stem and -vät for a front- or neutral-vowel stem. You never have to discover an irregular stem in this lesson.',
        ],
        ['laula- + vat → laulavat', 'kysy- + vät → kysyvät'],
      ),
    ],
    [
      lessonExample('he laulavat', 'they sing', [
        'The lesson supplies the stem laula-.',
        'The back vowels a and u select -vat.',
        'laula- + vat = laulavat.',
      ]),
      lessonExample('he kysyvät', 'they ask', [
        'The lesson supplies the stem kysy-.',
        'The front vowel y selects -vät.',
        'kysy- + vät = kysyvät.',
      ]),
    ],
    [
      'Do not use the minä ending -n with he.',
      'Do not choose -vat/-vät from the English translation.',
      'The pronoun he and the verb are separate words, but the ending joins directly to the verb stem.',
    ],
    [
      fill(
        'ff-a1-l-he-p01',
        'Optional practice with laulaa (“to sing”): laula- + -vat → ____ (“they sing”)',
        'laulavat',
        'The stem laula- is supplied. Attach back-vowel -vat: laulavat.',
        ['lesson-practice', 'verb', 'plural', 'vowel-harmony'],
      ),
      choice(
        'ff-a1-l-he-p02',
        'Which ending completes kysy- (“ask”)?',
        ['-vat', '-vät'],
        '-vät',
        'The supplied stem kysy- contains y, so choose -vät.',
        ['lesson-practice', 'verb', 'plural', 'vowel-harmony'],
      ),
      toFinnish(
        'ff-a1-l-he-p03',
        'Practice sentence: they live (stem: asu-)',
        ['he asuvat', 'asuvat'],
        'The stem asu- is supplied. Back vowels select -vat: he asuvat.',
        ['lesson-practice', 'verb', 'plural', 'vowel-harmony'],
      ),
    ],
  ),
  lesson(
    'plural-sentences',
    'Building short plural sentences',
    'Combine a T-plural subject with ovat and a word that tells its place or state.',
    [
      'Recognise the subject of a sentence.',
      'Use ovat with a plural subject.',
      'Read the sentence in three understandable parts.',
    ],
    [
      lessonSection(
        'The three-part pattern',
        [
          'A sentence communicates a complete idea. In these beginner sentences, the first part names more than one person or thing, the second part is ovat (“are”), and the final part gives a place or state.',
          'Finnish normally does not use a separate word for English “the”, so kissat can mean “cats” or “the cats” depending on context.',
        ],
        ['Plural subject + ovat + place/state', 'Kissat ovat kotona.'],
      ),
      lessonSection(
        'Agreement keeps the sentence connected',
        [
          'Agreement means that related parts use matching forms. A plural subject uses ovat. A singular subject would use on, meaning “is”.',
          'The place or state word does not become plural just because the subject is plural.',
        ],
        ['Kissa on kotona. = The cat is at home.', 'Kissat ovat kotona. = The cats are at home.'],
      ),
    ],
    [
      lessonExample('Kissat ovat kotona.', 'The cats are at home.', [
        'kissa becomes the plural subject kissat by adding -t.',
        'A plural subject uses ovat.',
        'kotona is a fixed form meaning “at home”.',
      ]),
      lessonExample('Pallot ovat täällä.', 'The balls are here.', [
        'pallo becomes pallot.',
        'ovat means “are” for more than one.',
        'täällä means “here” and does not change.',
      ]),
    ],
    [
      'Do not use on (“is”) with a plural subject in this pattern.',
      'Do not add a plural ending to the place word merely because the subject is plural.',
      'Begin a written sentence with a capital letter and finish it with punctuation.',
    ],
    [
      order(
        'ff-a1-l-sent-p01',
        ['kotona.', 'ovat', 'Kissat'],
        'Kissat ovat kotona.',
        'Kissat is the plural subject, ovat means “are”, and kotona means “at home”.',
        ['lesson-practice', 't-plural', 'sentence'],
        lessonPluralSentence(
          'kissa',
          'Kissat',
          'the cats',
          'Start with kissa and add plural -t: kissat.',
          'kotona',
          'at home',
          'kotona',
          'kotona is a fixed form meaning “at home”.',
          'The cats are at home.',
        ),
      ),
      toEnglish(
        'ff-a1-l-sent-p02',
        'Pallot ovat täällä.',
        'The balls are here.',
        'Pallot means “the balls”, ovat means “are”, and täällä means “here”.',
        ['lesson-practice', 't-plural', 'sentence'],
        lessonPluralSentence(
          'pallo',
          'Pallot',
          'the balls',
          'Start with pallo and add plural -t: pallot.',
          'täällä',
          'here',
          'täällä',
          'täällä is a fixed place word meaning “here”.',
          'The balls are here.',
        ),
      ),
      fill(
        'ff-a1-l-sent-p03',
        'Autot ____ ulkona. (“are”)',
        'ovat',
        'Autot is already plural. A plural subject uses ovat; ulkona is supplied as the fixed word “outside”.',
        ['lesson-practice', 't-plural', 'sentence'],
        lessonPluralSentence(
          'auto',
          'Autot',
          'the cars',
          'Start with auto and add plural -t: autot.',
          'ulkona',
          'outside',
          'ulkona',
          'ulkona is supplied as a complete fixed word meaning “outside”.',
          'The cars are outside.',
        ),
      ),
    ],
  ),
];

const reviewPool = [
  ...test1.slice(10, 12),
  ...test2.slice(15, 16),
  ...kptDoublePool.slice(12, 14),
  ...kptSinglePool.slice(12, 14),
  ...kptClusterPool.slice(12, 14),
  ...kptMixedPool.slice(12, 16),
  ...test4.slice(15, 18),
  ...test5.slice(15, 18),
  ...test6.slice(15, 20),
  ...test7.slice(15, 18),
  ...test8.slice(15, 18),
  ...test9.slice(15, 18),
];

const allKptLessonIds = [
  'kpt-doubles',
  'kpt-singles',
  'kpt-special-k',
  'kpt-clusters',
  'kpt-basics',
];
const allLessonIds = [
  'vowel-harmony-basics',
  'inside-ending',
  ...allKptLessonIds,
  'genitive-nouns',
  'verb-kpt',
  't-plural-basics',
  'kpt-t-plural',
  'he-verbs',
  'plural-sentences',
];

const importantSkills = [
  'Vowel harmony',
  'Inessive -ssa/-ssä',
  'KPT double consonants',
  'KPT common single consonants',
  'KPT special k changes',
  'KPT consonant clusters',
  'KPT recognition',
  'Genitive -n',
  'Minä verb forms with KPT',
  'Regular T-plural',
  'T-plural with KPT',
  'Third-person plural -vat/-vät',
  'Plural subject + ovat',
];

const pack = {
  schemaVersion: 1,
  id: 'vowel-harmony-kpt-tplural',
  version: '5.1.0',
  title: 'Vowel harmony, KPT & T-plural',
  level: 'Pre-A1–A1.3 Finnish grammar foundations',
  summary:
    'A progressive set of short, focused tests for the sound and stem patterns that make Finnish endings feel predictable.',
  objectives: [
    'Choose back- or front-vowel endings confidently.',
    'Recognise and produce common strong-to-weak KPT changes.',
    'Form regular and gradating nominative T-plurals.',
    'Use the patterns in short A1-level phrases and sentences.',
  ],
  importantSkills,
  sources: [
    {
      title: 'Uusi kielemme: Vowel Harmony',
      url: 'https://uusikielemme.fi/finnish-grammar/vowel-harmony-vokaaliharmonia-finnish-grammar',
    },
    {
      title: 'Uusi kielemme: T-Plural',
      url: 'https://uusikielemme.fi/finnish-grammar/finnish-cases/grammatical-cases/the-t-plural-t-monikko-plural-nominative',
    },
    {
      title: 'Uusi kielemme: Beginner Finnish Topics A1',
      url: 'https://uusikielemme.fi/language-levels/beginner-finnish-topics-level-a1-a1-1-to-a1-3',
    },
  ],
  lessons,
  tests: [
    test(
      'vowel-families',
      'Vowel families',
      'Recognise back, front, and neutral vowels, then choose the matching ending.',
      ['vowel-harmony-basics'],
      renumberExercises(1, test1.slice(0, 10)),
    ),
    test(
      'harmony-in-forms',
      'Harmony in real forms',
      'Build and translate common -ssa/-ssä forms.',
      ['inside-ending'],
      renumberExercises(2, test2.slice(0, 15)),
    ),
    test(
      'test-kpt-doubles',
      'KPT: double consonants',
      'Focus only on kk → k, pp → p, and tt → t.',
      ['kpt-doubles'],
      renumberExercises(3, kptDoublePool.slice(0, 12)),
    ),
    test(
      'test-kpt-singles',
      'KPT: common single consonants',
      'Focus only on k disappearing, p → v, and t → d.',
      ['kpt-singles'],
      renumberExercises(4, kptSinglePool.slice(0, 12)),
    ),
    test(
      'test-kpt-clusters',
      'KPT: consonant clusters',
      'Focus on nk, mp, nt, lt, and rt cluster changes.',
      ['kpt-clusters'],
      renumberExercises(5, kptClusterPool.slice(0, 12)),
    ),
    test(
      'test-kpt-special-k',
      'KPT: two special k changes',
      'Focus only on the separately learned k → j and k → v word families.',
      ['kpt-special-k'],
      renumberExercises(15, kptSpecialPool),
    ),
    test(
      'kpt-patterns',
      'KPT: distinguish the families',
      'Distinguish the separately learned KPT families, including the two special k patterns.',
      ['kpt-basics'],
      renumberExercises(6, mixedKptRecognitionPool),
    ),
    test(
      'kpt-nouns',
      'KPT in nouns',
      'Produce weak-grade genitive forms of familiar nouns.',
      ['genitive-nouns'],
      renumberExercises(7, test4.slice(0, 15)),
    ),
    test(
      'kpt-verbs',
      'KPT in verbs',
      'Use familiar strong-to-weak KPT changes in common minä forms; no strengthening patterns are included.',
      ['verb-kpt'],
      renumberExercises(8, test5.slice(0, 15)),
    ),
    test(
      'regular-t-plural',
      'Regular T-plurals',
      'Add nominative plural -t to stable stems.',
      ['t-plural-basics'],
      renumberExercises(9, test6.slice(0, 15)),
    ),
    test(
      'test-kpt-t-plural',
      'T-plural with KPT',
      'Use weak noun stems before the plural -t ending.',
      ['kpt-t-plural'],
      renumberExercises(10, test7.slice(0, 15)),
    ),
    test(
      'plural-verb-harmony',
      'They do: -vat or -vät',
      'Choose and attach -vat or -vät to a verb stem that is always supplied.',
      ['he-verbs'],
      renumberExercises(11, test8.slice(0, 15)),
    ),
    test(
      'plural-in-sentences',
      'Plurals in sentences',
      'Build regular T-plural subjects with ovat and supplied fixed place or state words.',
      ['plural-sentences'],
      renumberExercises(12, test9.slice(0, 15)),
    ),
    test(
      'guided-review',
      'Foundations checkpoint review',
      'Retrieve earlier patterns in a fixed, mixed checkpoint.',
      allLessonIds,
      renumberExercises(13, reviewPool.slice(0, 16)),
    ),
    test(
      'foundations-review',
      'Foundations review',
      'Bring vowel harmony, KPT, and T-plural together.',
      allLessonIds,
      renumberExercises(14, reviewPool.slice(16)),
    ),
  ],
};

const ids = pack.tests.flatMap((group) => group.exercises.map((exercise) => exercise.id));
if (ids.length < 200 || ids.length > 1000)
  throw new Error('A grammar pack must contain between 200 and 1,000 scored exercises.');
if (new Set(ids).size !== ids.length) throw new Error('Every exercise id must be unique.');

const exercisesBySkill = new Map();
for (const exercise of pack.tests.flatMap((group) => group.exercises)) {
  const group = exercisesBySkill.get(exercise.targetSkill) ?? [];
  group.push(exercise);
  exercisesBySkill.set(exercise.targetSkill, group);
}
for (const [skill, skillExercises] of exercisesBySkill) {
  if (skillExercises.length % 2 !== 0)
    throw new Error(`Parallel review requires an even exercise count for ${skill}.`);
  const remaining = [...skillExercises];
  while (remaining.length) {
    const first = remaining.shift();
    const partnerIndex = remaining.findIndex(
      (candidate) => candidate.acceptedAnswers[0] !== first.acceptedAnswers[0],
    );
    if (partnerIndex < 0) throw new Error(`No distinct parallel answer is available for ${skill}.`);
    const [second] = remaining.splice(partnerIndex, 1);
    first.parallelExerciseId = second.id;
    second.parallelExerciseId = first.id;
  }
}
const practiceIds = pack.lessons.flatMap((item) =>
  item.practiceExercises.map((exercise) => exercise.id),
);
if (new Set([...ids, ...practiceIds]).size !== ids.length + practiceIds.length)
  throw new Error('Every scored and lesson-practice exercise id must be unique.');

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(pack, null, 2)}\n`, 'utf8');
console.log(`Generated ${ids.length} exercises at ${outputPath}`);

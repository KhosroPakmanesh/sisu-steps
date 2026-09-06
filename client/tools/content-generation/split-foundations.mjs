import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const contentRoot = resolve(root, 'content');
const legacyRoot = resolve(contentRoot, 'vowel-harmony-kpt-tplural');
const generatedId = /^(?:vhx|kptx|tpx)-/u;

const packRoots = {
  harmony: resolve(contentRoot, 'vowel-harmony-location-endings'),
  kpt: resolve(contentRoot, 'kpt-singular-forms'),
  plural: resolve(contentRoot, 't-plural-agreement'),
};

const sources = {
  vowel: {
    title: 'Uusi kielemme: Vowel Harmony',
    url: 'https://uusikielemme.fi/finnish-grammar/vowel-harmony-vokaaliharmonia-finnish-grammar',
  },
  level: {
    title: 'Uusi kielemme: Beginner Finnish Topics A1',
    url: 'https://uusikielemme.fi/language-levels/beginner-finnish-topics-level-a1-a1-1-to-a1-3',
  },
  kpt: {
    title: 'Kielitoimiston ohjepankki: Consonant gradation in inflection',
    url: 'https://kielitoimistonohjepankki.fi/ohje/taivutustyyppeja-vierassanat-gallupeja-bloggaan-astevaihtelu/',
  },
  specialK: {
    title: 'Uusi kielemme: K disappearing in ruoka, aika and poika',
    url: 'https://uusikielemme.fi/finnish-grammar/morphology/ruoka-ruoat-consonant-gradation-where-k-disappears-kpt',
  },
  verb: {
    title: 'Uusi kielemme: Verbtype 1 conjugation',
    url: 'https://uusikielemme.fi/finnish-grammar/verbs/verbtypes/verbtype-1-conjugation-all-tenses-and-moods',
  },
  verbs: {
    title: 'Uusi kielemme: First 100 Finnish verbs',
    url: 'https://uusikielemme.fi/finnish-vocabulary/vocabulary-lists/your-first-100-finnish-verbs-finnish-for-beginners',
  },
  plural: {
    title: 'Uusi kielemme: T-Plural',
    url: 'https://uusikielemme.fi/finnish-grammar/finnish-cases/grammatical-cases/the-t-plural-t-monikko-plural-nominative',
  },
};

const vowelWords = [
  { base: 'talo', english: 'house', group: 'back vowels' },
  { base: 'pöytä', english: 'table', group: 'front vowels' },
  { base: 'koulu', english: 'school', group: 'back vowels' },
  { base: 'kylä', english: 'village', group: 'front vowels' },
  { base: 'auto', english: 'car', group: 'back vowels' },
  { base: 'nimi', english: 'name', group: 'only neutral vowels' },
  { base: 'päivä', english: 'day', group: 'front vowels' },
  { base: 'tie', english: 'road', group: 'only neutral vowels' },
  { base: 'metsä', english: 'forest', group: 'front vowels' },
  { base: 'sininen', english: 'blue', group: 'only neutral vowels' },
];

const neutralWords = [
  { base: 'paperi', english: 'paper', suffix: '-ssa', reason: 'a is a back vowel' },
  { base: 'kieli', english: 'language', suffix: '-ssä', reason: 'e and i are neutral only' },
  { base: 'hotelli', english: 'hotel', suffix: '-ssa', reason: 'o is a back vowel' },
  { base: 'tie', english: 'road', suffix: '-ssä', reason: 'i and e are neutral only' },
  { base: 'tuoli', english: 'chair', suffix: '-ssa', reason: 'u and o are back vowels' },
  { base: 'sininen', english: 'blue', suffix: '-ssä', reason: 'i and e are neutral only' },
  { base: 'toimisto', english: 'office', suffix: '-ssa', reason: 'o is a back vowel' },
  { base: 'keittiö', english: 'kitchen', suffix: '-ssä', reason: 'ö is a front vowel' },
  { base: 'bussi', english: 'bus', suffix: '-ssa', reason: 'u is a back vowel' },
  { base: 'nimi', english: 'name', suffix: '-ssä', reason: 'i is neutral only' },
  { base: 'museo', english: 'museum', suffix: '-ssa', reason: 'o is a back vowel' },
  { base: 'pieni', english: 'small', suffix: '-ssä', reason: 'e and i are neutral only' },
  { base: 'auto', english: 'car', suffix: '-ssa', reason: 'a and u are back vowels' },
  { base: 'mies', english: 'man', suffix: '-ssä', reason: 'i and e are neutral only' },
  { base: 'koulu', english: 'school', suffix: '-ssa', reason: 'o and u are back vowels' },
  { base: 'päivä', english: 'day', suffix: '-ssä', reason: 'ä is a front vowel' },
];

const inessiveForms = [
  {
    base: 'kirjasto',
    english: 'library',
    answer: 'kirjastossa',
    target: 'in the library',
    suffix: '-ssa',
  },
  { base: 'myymälä', english: 'shop', answer: 'myymälässä', target: 'in the shop', suffix: '-ssä' },
  { base: 'puisto', english: 'park', answer: 'puistossa', target: 'in the park', suffix: '-ssa' },
  { base: 'elämä', english: 'life', answer: 'elämässä', target: 'in life', suffix: '-ssä' },
  { base: 'kahvila', english: 'café', answer: 'kahvilassa', target: 'in the café', suffix: '-ssa' },
  { base: 'kylä', english: 'village', answer: 'kylässä', target: 'in the village', suffix: '-ssä' },
  { base: 'sauna', english: 'sauna', answer: 'saunassa', target: 'in the sauna', suffix: '-ssa' },
  { base: 'metsä', english: 'forest', answer: 'metsässä', target: 'in the forest', suffix: '-ssä' },
  {
    base: 'toimisto',
    english: 'office',
    answer: 'toimistossa',
    target: 'in the office',
    suffix: '-ssa',
  },
  { base: 'päivä', english: 'day', answer: 'päivässä', target: 'during the day', suffix: '-ssä' },
];

const locationSentences = [
  sentence(
    'Kirja',
    'book',
    'kirja',
    'on',
    'is',
    'olla',
    'kirjastossa',
    'in the library',
    'kirjasto',
    'The book is in the library.',
  ),
  sentence(
    'Takki',
    'coat',
    'takki',
    'on',
    'is',
    'olla',
    'myymälässä',
    'in the shop',
    'myymälä',
    'The coat is in the shop.',
  ),
  sentence(
    'Auto',
    'car',
    'auto',
    'on',
    'is',
    'olla',
    'puistossa',
    'in the park',
    'puisto',
    'The car is in the park.',
  ),
  sentence(
    'Isä',
    'father',
    'isä',
    'on',
    'is',
    'olla',
    'saunassa',
    'in the sauna',
    'sauna',
    'The father is in the sauna.',
  ),
  sentence(
    'Äiti',
    'mother',
    'äiti',
    'on',
    'is',
    'olla',
    'toimistossa',
    'in the office',
    'toimisto',
    'The mother is in the office.',
  ),
  sentence(
    'Koira',
    'dog',
    'koira',
    'on',
    'is',
    'olla',
    'kylässä',
    'in the village',
    'kylä',
    'The dog is in the village.',
  ),
  sentence(
    'Opiskelija',
    'student',
    'opiskelija',
    'on',
    'is',
    'olla',
    'kahvilassa',
    'in the café',
    'kahvila',
    'The student is in the café.',
  ),
  sentence(
    'Äiti',
    'mother',
    'äiti',
    'on',
    'is',
    'olla',
    'metsässä',
    'in the forest',
    'metsä',
    'The mother is in the forest.',
  ),
];

const kptFamilies = {
  'KPT double consonants': [
    form('pankki', 'bank', 'pankin', 'of the bank', 'panki-', 'kk → k', ['pankkin', 'panki']),
    form('kauppa', 'shop', 'kaupan', 'of the shop', 'kaupa-', 'pp → p', ['kauppan', 'kaupa']),
    form('matto', 'rug', 'maton', 'of the rug', 'mato-', 'tt → t', ['matton', 'mato']),
    form('kukka', 'flower', 'kukan', 'of the flower', 'kuka-', 'kk → k', ['kukkan', 'kuka']),
    form('hattu', 'hat', 'hatun', 'of the hat', 'hatu-', 'tt → t', ['hattun', 'hatu']),
    form('lippu', 'ticket', 'lipun', 'of the ticket', 'lipu-', 'pp → p', ['lippun', 'lipu']),
  ],
  'KPT common single consonants': [
    form('jalka', 'foot or leg', 'jalan', 'of the foot or leg', 'jala-', 'k disappears', [
      'jalkan',
      'jalka',
    ]),
    form('pöytä', 'table', 'pöydän', 'of the table', 'pöydä-', 't → d', ['pöytän', 'pöydä']),
    form('leipä', 'bread', 'leivän', 'of the bread', 'leivä-', 'p → v', ['leipän', 'leivä']),
    form('katu', 'street', 'kadun', 'of the street', 'kadu-', 't → d', ['katun', 'kadu']),
    form('tapa', 'habit', 'tavan', 'of the habit', 'tava-', 'p → v', ['tapan', 'tava']),
    form('satu', 'story', 'sadun', 'of the story', 'sadu-', 't → d', ['satun', 'sadu']),
    form('lupa', 'permission', 'luvan', 'of the permission', 'luva-', 'p → v', ['lupan', 'luva']),
  ],
  'KPT special k changes': [
    form('poika', 'boy', 'pojan', 'of the boy', 'poja-', 'k disappears and i becomes j', [
      'poikan',
      'poijan',
    ]),
    form('puku', 'suit', 'puvun', 'of the suit', 'puvu-', 'k → v', ['pukun', 'puun']),
    form('aika', 'time', 'ajan', 'of the time', 'aja-', 'k disappears and i becomes j', [
      'aikan',
      'aijan',
    ]),
    form('luku', 'number or chapter', 'luvun', 'of the number or chapter', 'luvu-', 'k → v', [
      'lukun',
      'luun',
    ]),
  ],
  'KPT consonant clusters': [
    form('kaupunki', 'city', 'kaupungin', 'of the city', 'kaupungi-', 'nk → ng', [
      'kaupunkin',
      'kaupung',
    ]),
    form('kenkä', 'shoe', 'kengän', 'of the shoe', 'kengä-', 'nk → ng', ['kenkän', 'kengä']),
    form('kampa', 'comb', 'kamman', 'of the comb', 'kamma-', 'mp → mm', ['kampan', 'kamma']),
    form('pelto', 'field', 'pellon', 'of the field', 'pello-', 'lt → ll', ['pelton', 'pello']),
    form('ranta', 'beach', 'rannan', 'of the beach', 'ranna-', 'nt → nn', ['rantan', 'ranna']),
    form('silta', 'bridge', 'sillan', 'of the bridge', 'silla-', 'lt → ll', ['siltan', 'silla']),
  ],
};

const allKptForms = Object.values(kptFamilies).flat();
const strongWeakForms = [
  kptFamilies['KPT double consonants'][0],
  kptFamilies['KPT consonant clusters'][0],
  kptFamilies['KPT double consonants'][1],
  kptFamilies['KPT consonant clusters'][1],
  kptFamilies['KPT common single consonants'][1],
  kptFamilies['KPT special k changes'][0],
  kptFamilies['KPT common single consonants'][2],
  kptFamilies['KPT special k changes'][1],
  kptFamilies['KPT consonant clusters'][4],
  kptFamilies['KPT double consonants'][4],
];
const reviewGradeForms = allKptForms.filter(
  (item) => !strongWeakForms.some((strongWeak) => strongWeak.base === item.base),
);

const verbSentences = [
  verbSentence('nukkua', 'to sleep', 'nukku-', 'nukun', 'kk → k', 'hyvin', 'well', 'I sleep well.'),
  verbSentence(
    'lentää',
    'to fly',
    'lentä-',
    'lennän',
    'nt → nn',
    'tänään',
    'today',
    'I fly today.',
  ),
  verbSentence(
    'odottaa',
    'to wait',
    'odotta-',
    'odotan',
    'tt → t',
    'täällä',
    'here',
    'I wait here.',
  ),
  verbSentence('lukea', 'to read', 'luke-', 'luen', 'k disappears', 'nyt', 'now', 'I read now.'),
  verbSentence(
    'saapua',
    'to arrive',
    'saapu-',
    'saavun',
    'p → v',
    'pian',
    'soon',
    'I arrive soon.',
  ),
  verbSentence(
    'ymmärtää',
    'to understand',
    'ymmärtä-',
    'ymmärrän',
    'rt → rr',
    'hyvin',
    'well',
    'I understand well.',
  ),
  verbSentence(
    'oppia',
    'to learn',
    'oppi-',
    'opin',
    'pp → p',
    'nopeasti',
    'quickly',
    'I learn quickly.',
  ),
  verbSentence('piirtää', 'to draw', 'piirtä-', 'piirrän', 'rt → rr', 'nyt', 'now', 'I draw now.'),
];

const regularPlurals = [
  plural('kirja', 'book', 'kirjat', 'books'),
  plural('koira', 'dog', 'koirat', 'dogs'),
  plural('kynä', 'pen', 'kynät', 'pens'),
  plural('omena', 'apple', 'omenat', 'apples'),
  plural('sana', 'word', 'sanat', 'words'),
  plural('kuva', 'picture', 'kuvat', 'pictures'),
  plural('tuoli', 'chair', 'tuolit', 'chairs'),
  plural('kissa', 'cat', 'kissat', 'cats'),
  plural('pallo', 'ball', 'pallot', 'balls'),
  plural('ystävä', 'friend', 'ystävät', 'friends'),
];

const kptPlurals = [
  pluralKpt('keitto', 'soup', 'keitot', 'soups', 'keito-', 'tt → t'),
  pluralKpt('silta', 'bridge', 'sillat', 'bridges', 'silla-', 'lt → ll'),
  pluralKpt('kampa', 'comb', 'kammat', 'combs', 'kamma-', 'mp → mm'),
  pluralKpt('takki', 'coat', 'takit', 'coats', 'taki-', 'kk → k'),
  pluralKpt('katto', 'roof', 'katot', 'roofs', 'kato-', 'tt → t'),
  pluralKpt('tyttö', 'girl', 'tytöt', 'girls', 'tytö-', 'tt → t'),
  pluralKpt('ranta', 'beach', 'rannat', 'beaches', 'ranna-', 'nt → nn'),
  pluralKpt('pankki', 'bank', 'pankit', 'banks', 'panki-', 'kk → k'),
  pluralKpt('kauppa', 'shop', 'kaupat', 'shops', 'kaupa-', 'pp → p'),
  pluralKpt('pelto', 'field', 'pellot', 'fields', 'pello-', 'lt → ll'),
];

const thirdPluralVerbs = [
  heVerb('puhua', 'to speak', 'puhu-', 'puhuvat', '-vat', 'They speak.'),
  heVerb('kysyä', 'to ask', 'kysy-', 'kysyvät', '-vät', 'They ask.'),
  heVerb('asua', 'to live', 'asu-', 'asuvat', '-vat', 'They live.'),
  heVerb('lähteä', 'to leave', 'lähte-', 'lähtevät', '-vät', 'They leave.'),
  heVerb('laulaa', 'to sing', 'laula-', 'laulavat', '-vat', 'They sing.'),
  heVerb('istua', 'to sit', 'istu-', 'istuvat', '-vat', 'They sit.'),
  heVerb('ostaa', 'to buy', 'osta-', 'ostavat', '-vat', 'They buy.'),
  heVerb('sanoa', 'to say', 'sano-', 'sanovat', '-vat', 'They say.'),
  heVerb('katsoa', 'to watch', 'katso-', 'katsovat', '-vat', 'They watch.'),
  heVerb('seisoa', 'to stand', 'seiso-', 'seisovat', '-vat', 'They stand.'),
];

const pluralSentences = [
  sentence(
    'Kirjat',
    'the books',
    'kirja',
    'ovat',
    'are',
    'olla',
    'täällä',
    'here',
    'täällä',
    'The books are here.',
  ),
  sentence(
    'Koirat',
    'the dogs',
    'koira',
    'ovat',
    'are',
    'olla',
    'kotona',
    'at home',
    'kotona',
    'The dogs are at home.',
  ),
  sentence(
    'Kynät',
    'the pens',
    'kynä',
    'ovat',
    'are',
    'olla',
    'täällä',
    'here',
    'täällä',
    'The pens are here.',
  ),
  sentence(
    'Omenat',
    'the apples',
    'omena',
    'ovat',
    'are',
    'olla',
    'täällä',
    'here',
    'täällä',
    'The apples are here.',
  ),
  sentence(
    'Tuolit',
    'the chairs',
    'tuoli',
    'ovat',
    'are',
    'olla',
    'ulkona',
    'outside',
    'ulkona',
    'The chairs are outside.',
  ),
  sentence(
    'Kissat',
    'the cats',
    'kissa',
    'ovat',
    'are',
    'olla',
    'kotona',
    'at home',
    'kotona',
    'The cats are at home.',
  ),
  sentence(
    'Pallot',
    'the balls',
    'pallo',
    'ovat',
    'are',
    'olla',
    'täällä',
    'here',
    'täällä',
    'The balls are here.',
  ),
  sentence(
    'Kirjat',
    'the books',
    'kirja',
    'ovat',
    'are',
    'olla',
    'auki',
    'open',
    'auki',
    'The books are open.',
  ),
];

function form(base, english, answer, target, stem, change, distractors) {
  return { base, english, answer, target, stem, change, distractors };
}

function plural(base, english, answer, target) {
  return {
    base,
    english,
    answer,
    target,
    stem: base,
    change: 'the stem stays unchanged',
    distractors: [base, `${base}t`],
  };
}

function pluralKpt(base, english, answer, target, stem, change) {
  return { base, english, answer, target, stem, change, distractors: [`${base}t`, base] };
}

function sentence(
  subject,
  subjectMeaning,
  subjectBase,
  verb,
  verbMeaning,
  verbBase,
  context,
  contextMeaning,
  contextBase,
  translation,
) {
  return {
    subject,
    subjectMeaning,
    subjectBase,
    verb,
    verbMeaning,
    verbBase,
    context,
    contextMeaning,
    contextBase,
    translation,
  };
}

function verbSentence(base, english, stem, verb, change, context, contextMeaning, translation) {
  return { base, english, stem, verb, change, context, contextMeaning, translation };
}

function heVerb(base, english, stem, verb, ending, translation) {
  return { base, english, stem, verb, ending, translation };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function findOwned(kind, id) {
  const candidates = [legacyRoot, ...Object.values(packRoots)].map((base) =>
    resolve(base, kind, `${id}.json`),
  );
  const path = candidates.find(existsSync);
  if (!path) throw new Error(`Cannot find ${kind}/${id}.json`);
  return readJson(path);
}

function cleanExercise(exercise) {
  return !generatedId.test(exercise.id);
}

function loadLesson(id) {
  const lesson = structuredClone(findOwned('lessons', id));
  lesson.practiceExercises = lesson.practiceExercises.filter(cleanExercise);
  return lesson;
}

function loadTest(id) {
  const test = structuredClone(findOwned('tests', id));
  test.exercises = test.exercises.filter(cleanExercise);
  return test;
}

function loadLegacyReviewExercises() {
  const legacy = resolve(legacyRoot, 'tests', 'foundations-review.json');
  if (existsSync(legacy)) return readJson(legacy).exercises;
  const preserved = Object.values(packRoots).flatMap((packRoot) => {
    const manifestPath = resolve(packRoot, 'pack.json');
    if (!existsSync(manifestPath)) return [];
    return readJson(manifestPath).testIds.flatMap((id) => {
      const testPath = resolve(packRoot, 'tests', `${id}.json`);
      if (!existsSync(testPath)) return [];
      return readJson(testPath).exercises.filter((exercise) =>
        /^ff-a1-(?:t13-e|t14-e|review-)/u.test(exercise.id),
      );
    });
  });
  if (preserved.length === 33) return preserved;
  return JSON.parse(
    execFileSync(
      'git',
      ['show', 'HEAD:client/content/vowel-harmony-kpt-tplural/tests/foundations-review.json'],
      { cwd: resolve(root, '..'), encoding: 'utf8' },
    ),
  ).exercises;
}

function pairSeries({ prefix, count, skill, items, types, offset = 0, make }) {
  if (count % 2 !== 0) throw new Error(`${prefix}: generated series must contain pairs`);
  const exercises = [];
  for (let index = 0; index < count; index += 2) {
    const type = types[(index / 2) % types.length];
    const pair = [0, 1].map((side) => {
      const ordinal = index + side;
      const itemIndex = offset + ordinal;
      const item = items[itemIndex % items.length];
      const id = `${prefix}-${String(ordinal + 1).padStart(3, '0')}`;
      return make({
        id,
        type,
        skill,
        item,
        ordinal,
        variant: Math.floor(itemIndex / items.length),
      });
    });
    if (pair[0].acceptedAnswers[0] === pair[1].acceptedAnswers[0]) {
      throw new Error(`${prefix}: pair ${index + 1} needs different answers`);
    }
    pair[0].parallelExerciseId = pair[1].id;
    pair[1].parallelExerciseId = pair[0].id;
    exercises.push(...pair);
  }
  return exercises;
}

function baseExercise({
  id,
  type,
  skill,
  instruction,
  prompt,
  answers,
  explanation,
  vocabulary,
  tags = [],
  options,
  optionFeedback,
  diagnostics,
  sentenceExplanation,
  tokens,
}) {
  return {
    id,
    type,
    instruction,
    prompt,
    acceptedAnswers: answers,
    explanation,
    tags,
    requiredSkills: [skill],
    vocabulary,
    ...(options ? { options, optionFeedback } : {}),
    targetSkill: skill,
    misconceptionCategory: `${skill}: form not yet correct`,
    ...(diagnostics?.length ? { answerDiagnostics: diagnostics } : {}),
    ...(sentenceExplanation ? { sentenceExplanation } : {}),
    ...(tokens ? { tokens } : {}),
  };
}

function makeClassification({ id, type, skill, item, variant }) {
  const promptLead = variant % 2 ? 'Review the whole word.' : 'Look at every vowel.';
  const explanation = `${item.base} (“${item.english}”) belongs to the ${item.group} group. Back vowels are a, o, u; front vowels are ä, ö, y; e and i are neutral.`;
  if (type === 'multiple-choice') {
    const options = ['back vowels', 'front vowels', 'only neutral vowels'];
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Choose the best answer.',
      prompt: `${promptLead} Which vowel group describes ${item.base} (“${item.english}”)?`,
      answers: [item.group],
      explanation,
      vocabulary: [item.base],
      tags: ['vowel-harmony', 'recognition'],
      options,
      optionFeedback: Object.fromEntries(
        options.map((option) => [
          option,
          option === item.group
            ? `Correct. ${explanation}`
            : `${option} does not match all the vowels in ${item.base}. ${explanation}`,
        ]),
      ),
    });
  }
  return baseExercise({
    id,
    type: 'fill-blank',
    skill,
    instruction: 'Name the vowel group.',
    prompt: `${promptLead} Write “back vowels”, “front vowels”, or “only neutral vowels” for ${item.base} (“${item.english}”).`,
    answers: [item.group],
    explanation,
    vocabulary: [item.base],
    tags: ['vowel-harmony', 'recognition'],
  });
}

function makeNeutralChoice({ id, type, skill, item, variant }) {
  const lead =
    variant % 2 ? 'Check the non-neutral vowels before choosing.' : 'Choose the harmonic ending.';
  const explanation = `${item.base} (“${item.english}”) takes ${item.suffix} because ${item.reason}. Neutral e and i do not force a back-vowel ending.`;
  if (type === 'multiple-choice') {
    const options = ['-ssa', '-ssä'];
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Choose the ending.',
      prompt: `${lead} Which inessive ending belongs with ${item.base} (“${item.english}”)?`,
      answers: [item.suffix],
      explanation,
      vocabulary: [item.base],
      tags: ['vowel-harmony', 'neutral-vowels'],
      options,
      optionFeedback: Object.fromEntries(
        options.map((option) => [
          option,
          option === item.suffix
            ? `Correct. ${explanation}`
            : `${option} conflicts with the vowel family in this word. ${explanation}`,
        ]),
      ),
    });
  }
  return baseExercise({
    id,
    type: 'fill-blank',
    skill,
    instruction: 'Write the ending.',
    prompt: `${lead} ${item.base} (“${item.english}”) + ____`,
    answers: [item.suffix],
    explanation,
    vocabulary: [item.base],
    tags: ['vowel-harmony', 'neutral-vowels'],
  });
}

function makeFormExercise({ id, type, skill, item, variant, mode = 'genitive', extraSkill }) {
  const ending = mode === 'plural' ? '-t' : '-n';
  const hint =
    mode === 'genitive'
      ? skill === 'Genitive -n'
        ? `use the supplied stem ${item.stem} and add genitive -n`
        : 'use the supplied genitive ending -n'
      : skill === 'Regular T-plural'
        ? 'add the plural ending -t to the unchanged stem'
        : 'use the supplied plural ending -t';
  const explanation =
    mode === 'genitive'
      ? skill === 'Genitive -n'
        ? `The weak stem ${item.stem} is supplied. Add genitive -n: ${item.answer} (“${item.target}”).`
        : `The genitive ending -n is supplied. Apply ${item.change} to make ${item.stem}, then add -n: ${item.answer} (“${item.target}”).`
      : skill === 'Regular T-plural'
        ? `The stem stays unchanged. Add plural -t: ${item.answer} (“${item.target}”).`
        : `The plural ending -t is supplied. Apply ${item.change} to make ${item.stem}, then add -t: ${item.answer} (“${item.target}”).`;
  const requiredSkills = [skill, ...(extraSkill ? [extraSkill] : [])];
  const common = {
    id,
    type,
    skill,
    instruction: 'Complete the Finnish form.',
    prompt: `${variant % 2 ? 'Retrieve the form without a family label. ' : ''}${item.base} (“${item.english}”) → ____ (“${item.target}”) · ${hint}`,
    answers: [item.answer],
    explanation,
    vocabulary: [item.base],
    tags: [mode === 'plural' ? 't-plural' : 'kpt', 'controlled-production'],
  };
  let exercise;
  if (type === 'multiple-choice') {
    const options = [...new Set([item.answer, ...item.distractors])].slice(0, 3);
    exercise = baseExercise({
      ...common,
      instruction: 'Choose the best answer.',
      prompt: `${item.base} (“${item.english}”) → ? (“${item.target}”) · ${hint}`,
      options,
      optionFeedback: Object.fromEntries(
        options.map((option) => [
          option,
          option === item.answer
            ? `Correct. ${explanation}`
            : `${option} misses the required construction. ${explanation}`,
        ]),
      ),
    });
  } else if (type === 'translation-fi') {
    exercise = baseExercise({
      ...common,
      instruction: 'Write the Finnish form.',
      prompt: `Write “${item.target}”. Use ${item.base} (“${item.english}”); ${hint}.`,
    });
  } else if (type === 'translation-en') {
    exercise = baseExercise({
      ...common,
      instruction: 'Translate the Finnish form into English.',
      prompt: item.answer,
      answers: [item.target],
      explanation,
    });
  } else exercise = baseExercise(common);
  exercise.requiredSkills = requiredSkills;
  return exercise;
}

function makeInessiveExercise({ id, type, skill, item, variant }) {
  const otherSuffix = item.suffix === '-ssa' ? '-ssä' : '-ssa';
  const wrongHarmony = `${item.base}${otherSuffix.slice(1)}`;
  const explanation = `${item.base} (“${item.english}”) takes ${item.suffix}. Attach it directly to the unchanged stem: ${item.answer} (“${item.target}”).`;
  const hint = `The stem remains ${item.base}; choose ${item.suffix} and attach it directly.`;
  const common = {
    id,
    type,
    skill,
    instruction: 'Complete the Finnish form.',
    prompt: `${variant % 2 ? 'Retrieve the complete form. ' : ''}${item.base} (“${item.english}”) → ____ (“${item.target}”). ${hint}`,
    answers: [item.answer],
    explanation,
    vocabulary: [item.base],
    tags: ['inessive', 'vowel-harmony', 'controlled-production'],
  };
  if (type === 'multiple-choice') {
    const options = [item.answer, wrongHarmony, item.base];
    return baseExercise({
      ...common,
      instruction: 'Choose the best answer.',
      prompt: `${item.base} (“${item.english}”) → ? (“${item.target}”). ${hint}`,
      options,
      optionFeedback: Object.fromEntries(
        options.map((option) => [
          option,
          option === item.answer
            ? `Correct. ${explanation}`
            : `${option} does not use the required inessive construction. ${explanation}`,
        ]),
      ),
    });
  }
  if (type === 'translation-fi') {
    return baseExercise({
      ...common,
      instruction: 'Write the Finnish form.',
      prompt: `Write “${item.target}.” Use ${item.base} (“${item.english}”); ${hint}`,
    });
  }
  if (type === 'translation-en') {
    return baseExercise({
      ...common,
      instruction: 'Translate the Finnish form into English.',
      prompt: item.answer,
      answers: [item.target],
    });
  }
  return baseExercise(common);
}

function makeGradeExercise({ id, type, skill, item, ordinal }) {
  const answer = ordinal % 2 ? 'weak grade' : 'strong grade';
  const shown = answer === 'strong grade' ? item.base : item.answer;
  const counterpart = answer === 'strong grade' ? item.answer : item.base;
  const explanation = `${shown} is the ${answer} form in the learned pair ${item.base} → ${item.answer}. The labels name consonant patterns; both forms are correct in their own grammatical positions.`;
  if (type === 'multiple-choice') {
    const options = ['strong grade', 'weak grade'];
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Choose the grade.',
      prompt: `In the pair ${item.base} (“${item.english}”) → ${item.answer} (“${item.target}”), which grade is ${shown}?`,
      answers: [answer],
      explanation,
      vocabulary: [item.base],
      tags: ['kpt', 'grade-recognition'],
      options,
      optionFeedback: Object.fromEntries(
        options.map((option) => [
          option,
          option === answer
            ? `Correct. ${explanation}`
            : `${shown} is not the ${option} member of this pair. Compare it with ${counterpart}.`,
        ]),
      ),
    });
  }
  return baseExercise({
    id,
    type: 'fill-blank',
    skill,
    instruction: 'Name the consonant grade.',
    prompt: `${shown} in ${item.base} (“${item.english}”) → ${item.answer} (“${item.target}”) is the ____ grade.`,
    answers: [answer.replace(' grade', '')],
    explanation,
    vocabulary: [item.base],
    tags: ['kpt', 'grade-recognition'],
  });
}

function makeKptRecognition({ id, type, skill, item, variant }) {
  const answer = item.change;
  const explanation = `${item.base} → ${item.answer} uses ${item.change}. The ending is already present; identify only the consonant change.`;
  const alternatives = [
    'kk → k',
    'pp → p',
    'tt → t',
    'p → v',
    't → d',
    'k disappears',
    'k → v',
    'nk → ng',
    'mp → mm',
    'nt → nn',
    'lt → ll',
  ];
  if (type === 'multiple-choice') {
    const options = [
      answer,
      ...alternatives.filter((value) => value !== answer).slice(variant % 5, (variant % 5) + 2),
    ];
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Choose the KPT change.',
      prompt: `Which learned change appears in ${item.base} (“${item.english}”) → ${item.answer} (“${item.target}”)?`,
      answers: [answer],
      explanation,
      vocabulary: [item.base],
      tags: ['kpt', 'recognition'],
      options,
      optionFeedback: Object.fromEntries(
        options.map((option) => [
          option,
          option === answer
            ? `Correct. ${explanation}`
            : `${option} does not describe the visible consonants in this pair.`,
        ]),
      ),
    });
  }
  return baseExercise({
    id,
    type: 'fill-blank',
    skill,
    instruction: 'Name the KPT change.',
    prompt: `${item.base} (“${item.english}”) → ${item.answer} (“${item.target}”): write the consonant change.`,
    answers: [answer],
    explanation,
    vocabulary: [item.base],
    tags: ['kpt', 'recognition'],
  });
}

function makeWeakStemExercise({ id, type, skill, item }) {
  const explanation = `${item.base} (“${item.english}”) uses ${item.change} in its learned weak stem ${item.stem}. No case ending is being tested in this question.`;
  const common = {
    id,
    type,
    skill,
    instruction: 'Write the learned weak stem.',
    prompt: `Write the learned weak stem for ${item.base} (“${item.english}”): ____`,
    answers: [item.stem],
    explanation,
    vocabulary: [item.base],
    tags: ['kpt', 'weak-stem', 'controlled-production'],
  };
  if (type !== 'multiple-choice') return baseExercise(common);
  const options = [item.stem, `${item.base}-`, item.answer];
  return baseExercise({
    ...common,
    instruction: 'Choose the learned weak stem.',
    options,
    optionFeedback: Object.fromEntries(
      options.map((option) => [
        option,
        option === item.stem
          ? `Correct. ${explanation}`
          : `${option} is not the weak stem. ${explanation}`,
      ]),
    ),
  });
}

function makeVerbExercise({ id, type, skill, item, variant }) {
  const finnish = `Minä ${item.verb} ${item.context}.`;
  const explanation = `${finnish} means “${item.translation.replace(/\.$/u, '')}”. The prompt supplies minä, ${item.stem}, the minä ending -n, and ${item.context} (“${item.contextMeaning}”). Apply ${item.change}: ${item.verb}.`;
  const sentenceExplanation = {
    translation: item.translation,
    pattern: 'Subject (who) + verb (action or state) + supplied context word',
    parts: [
      {
        finnish: 'Minä',
        meaning: 'I',
        role: 'Subject — names who acts.',
        baseForm: 'minä',
        formation: 'minä is supplied unchanged.',
      },
      {
        finnish: item.verb,
        meaning: item.english.replace('to ', ''),
        role: 'Verb — tells what I do.',
        baseForm: item.base,
        formation: `Use the supplied stem ${item.stem}. Apply ${item.change}, then add the supplied minä ending -n: ${item.verb}.`,
      },
      {
        finnish: item.context,
        meaning: item.contextMeaning,
        role: 'Context — tells when, where, or how.',
        baseForm: item.context,
        formation: `${item.context} is supplied as a complete fixed word.`,
      },
    ],
  };
  const hint = `Use the supplied subject Minä, stem ${item.stem}, minä ending -n, and ${item.context} (“${item.contextMeaning}”).`;
  if (type === 'translation-en') {
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Translate the complete sentence into English.',
      prompt: finnish,
      answers: [item.translation.replace(/\.$/u, '')],
      explanation,
      vocabulary: [item.base, item.context],
      tags: ['kpt', 'verb', 'sentence'],
      sentenceExplanation,
    });
  }
  if (type === 'word-order') {
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Put the supplied words in subject–verb–context order.',
      prompt: `Build “${item.translation}” The complete KPT verb form is supplied for recognition.`,
      answers: [finnish],
      explanation,
      vocabulary: [item.base, item.context],
      tags: ['kpt', 'verb', 'sentence'],
      sentenceExplanation,
      tokens: [`${item.context}.`, 'Minä', item.verb],
    });
  }
  if (type === 'multiple-choice') {
    const wrong = `${item.stem.replace(/-$/u, '')}n`;
    const options = [...new Set([item.verb, wrong, item.base])];
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Choose the verb that completes the sentence.',
      prompt: `Complete “${item.translation}” Minä ____ ${item.context}. ${hint}`,
      answers: [item.verb],
      explanation,
      vocabulary: [item.base, item.context],
      tags: ['kpt', 'verb', 'sentence'],
      sentenceExplanation,
      options,
      optionFeedback: Object.fromEntries(
        options.map((option) => [
          option,
          option === item.verb
            ? `Correct. ${explanation}`
            : `${option} does not show the required weak-grade minä form. ${explanation}`,
        ]),
      ),
    });
  }
  const whole = type === 'translation-fi';
  return baseExercise({
    id,
    type,
    skill,
    instruction: whole ? 'Translate into Finnish.' : 'Complete the Finnish sentence.',
    prompt: whole
      ? `Write “${item.translation}” ${hint}`
      : `Complete “${item.translation}” Minä ____ ${item.context}. ${hint}`,
    answers: whole ? [finnish] : [item.verb],
    explanation,
    vocabulary: [item.base, item.context],
    tags: ['kpt', 'verb', 'sentence'],
    sentenceExplanation,
  });
}

function makePluralRecognition({ id, type, skill, item, ordinal, kpt = false }) {
  const answer = ordinal % 2 ? item.answer : item.base;
  const label = ordinal % 2 ? 'plural' : 'singular';
  const explanation = `${answer} is ${label}. The singular is ${item.base} (“${item.english}”); the T-plural is ${item.answer} (“${item.target}”).${kpt ? ` The plural also shows ${item.change}.` : ''}`;
  if (type === 'multiple-choice') {
    const options = ['singular', 'plural'];
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Choose singular or plural.',
      prompt: `Is ${answer} singular or plural?`,
      answers: [label],
      explanation,
      vocabulary: [item.base],
      tags: ['t-plural', 'recognition'],
      options,
      optionFeedback: Object.fromEntries(
        options.map((option) => [
          option,
          option === label
            ? `Correct. ${explanation}`
            : `${answer} is not ${option} in this pair. ${explanation}`,
        ]),
      ),
    });
  }
  if (type === 'translation-en') {
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Translate the noun form into English.',
      prompt: answer,
      answers: [label === 'plural' ? item.target : item.english],
      explanation,
      vocabulary: [item.base],
      tags: ['t-plural', 'recognition'],
    });
  }
  if (type === 'translation-fi') {
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Write the Finnish noun form.',
      prompt: `Write the ${label} form meaning “${label === 'plural' ? item.target : item.english}”.`,
      answers: [answer],
      explanation,
      vocabulary: [item.base],
      tags: ['t-plural', 'recognition'],
    });
  }
  return baseExercise({
    id,
    type: 'fill-blank',
    skill,
    instruction: 'Write singular or plural.',
    prompt: `${answer} is a ____ noun form.`,
    answers: [label],
    explanation,
    vocabulary: [item.base],
    tags: ['t-plural', 'recognition'],
  });
}

function makeHeVerbExercise({ id, type, skill, item }) {
  const finnish = `He ${item.verb}.`;
  const explanation = `The supplied stem is ${item.stem}. Add ${item.ending} to agree with he (“they”): ${item.verb}.`;
  const sentenceExplanation = {
    translation: item.translation,
    pattern: 'Plural subject (who) + third-person plural verb',
    parts: [
      {
        finnish: 'He',
        meaning: 'they',
        role: 'Subject — names the people acting.',
        baseForm: 'he',
        formation: 'he is supplied unchanged.',
      },
      {
        finnish: item.verb,
        meaning: item.english.replace('to ', ''),
        role: 'Verb — tells what they do.',
        baseForm: item.base,
        formation: `The stem ${item.stem} is supplied. Add ${item.ending}: ${item.verb}.`,
      },
    ],
  };
  const hint = `Use the supplied stem ${item.stem}; choose and attach -vat or -vät.`;
  if (type === 'translation-en')
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Translate the complete sentence into English.',
      prompt: finnish,
      answers: [item.translation.replace(/\.$/u, '')],
      explanation,
      vocabulary: [item.base],
      tags: ['verb', 'plural', 'sentence'],
      sentenceExplanation,
    });
  if (type === 'word-order')
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Put the supplied words in subject–verb order.',
      prompt: `Build “${item.translation}” The complete agreeing verb is supplied for recognition.`,
      answers: [finnish],
      explanation,
      vocabulary: [item.base],
      tags: ['verb', 'plural', 'sentence'],
      sentenceExplanation,
      tokens: [`${item.verb}.`, 'He'],
    });
  if (type === 'multiple-choice') {
    const wrongEnding = item.ending === '-vat' ? '-vät' : '-vat';
    const wrong = `${item.stem.replace(/-$/u, '')}${wrongEnding.slice(1)}`;
    const options = [item.verb, wrong];
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Choose the agreeing verb.',
      prompt: `Complete “${item.translation}” He ____. ${hint}`,
      answers: [item.verb],
      explanation,
      vocabulary: [item.base],
      tags: ['verb', 'plural', 'sentence'],
      sentenceExplanation,
      options,
      optionFeedback: Object.fromEntries(
        options.map((option) => [
          option,
          option === item.verb
            ? `Correct. ${explanation}`
            : `${option} uses the wrong harmonic ending. ${explanation}`,
        ]),
      ),
    });
  }
  const whole = type === 'translation-fi';
  return baseExercise({
    id,
    type: whole ? 'translation-fi' : 'fill-blank',
    skill,
    instruction: whole ? 'Translate into Finnish.' : 'Complete the Finnish sentence.',
    prompt: whole
      ? `Write “${item.translation}” ${hint}`
      : `Complete “${item.translation}” He ____. ${hint}`,
    answers: whole ? [finnish, item.verb] : [item.verb],
    explanation,
    vocabulary: [item.base],
    tags: ['verb', 'plural', 'sentence'],
    sentenceExplanation,
  });
}

function makeSentenceExercise({ id, type, skill, item, variant }) {
  const finnish = `${item.subject} ${item.verb} ${item.context}.`;
  const explanation = `${finnish} means “${item.translation.replace(/\.$/u, '')}”. The subject is plural or supplied, ${item.verb} agrees with it, and ${item.context} gives the supplied place or state.`;
  const sentenceExplanation = {
    translation: item.translation,
    pattern: 'Subject (who or what) + olla verb + place or state',
    parts: [
      {
        finnish: item.subject,
        meaning: item.subjectMeaning,
        role: 'Subject — names who or what the sentence is about.',
        baseForm: item.subjectBase,
        formation: item.subject.endsWith('t')
          ? `Start with ${item.subjectBase}; use the learned plural form ${item.subject}.`
          : `${item.subject} is supplied unchanged.`,
      },
      {
        finnish: item.verb,
        meaning: item.verbMeaning,
        role: 'Verb — connects the subject to its place or state.',
        baseForm: item.verbBase,
        formation: `${item.verb} is the supplied written form of ${item.verbBase} for this subject.`,
      },
      {
        finnish: item.context,
        meaning: item.contextMeaning,
        role: 'Place or state — completes the idea.',
        baseForm: item.contextBase,
        formation:
          item.context !== item.contextBase && /ss[ae]̈?$/u.test(item.context.normalize('NFD'))
            ? `Start with ${item.contextBase} and attach the learned inessive ending to form ${item.context}.`
            : `${item.context} is supplied as a complete fixed word.`,
      },
    ],
  };
  const vocabulary = [...new Set([item.subjectBase, item.verbBase, item.verb, item.contextBase])];
  if (type === 'translation-en')
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Translate the complete sentence into English.',
      prompt: finnish,
      answers: [item.translation.replace(/\.$/u, '')],
      explanation,
      vocabulary,
      tags: ['sentence'],
      sentenceExplanation,
    });
  if (type === 'word-order')
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Put the words in subject–verb–place order.',
      prompt: `Build “${item.translation}”`,
      answers: [finnish],
      explanation,
      vocabulary,
      tags: ['sentence'],
      sentenceExplanation,
      tokens: [`${item.context}.`, item.subject, item.verb],
    });
  if (type === 'multiple-choice') {
    const wrong = `${item.subject} ${item.context} ${item.verb}.`;
    const options = [finnish, wrong];
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Choose the complete sentence.',
      prompt: `Choose “${item.translation}”`,
      answers: [finnish],
      explanation,
      vocabulary,
      tags: ['sentence'],
      sentenceExplanation,
      options,
      optionFeedback: {
        [finnish]: `Correct. ${explanation}`,
        [wrong]: `Use subject–verb–place order. ${explanation}`,
      },
    });
  }
  if (type === 'fill-blank')
    return baseExercise({
      id,
      type,
      skill,
      instruction: 'Complete the Finnish sentence.',
      prompt: `Complete “${item.translation}” ${item.subject} ${item.verb} ____.`,
      answers: [item.context],
      explanation,
      vocabulary,
      tags: ['sentence'],
      sentenceExplanation,
    });
  return baseExercise({
    id,
    type: 'translation-fi',
    skill,
    instruction: 'Translate into Finnish.',
    prompt: `Write “${item.translation}”`,
    answers: [finnish],
    explanation,
    vocabulary,
    tags: ['sentence'],
    sentenceExplanation,
  });
}

function practiceFrom(exercises, prefix) {
  return exercises.map((exercise, index) => {
    const practice = structuredClone(exercise);
    practice.id = `${prefix}-p${String(index + 1).padStart(2, '0')}`;
    practice.prompt = `Optional practice: ${practice.prompt}`;
    practice.tags = [...new Set(['lesson-practice', ...practice.tags])];
    delete practice.parallelExerciseId;
    return practice;
  });
}

function lesson({
  id,
  title,
  summary,
  skill,
  prerequisites = [],
  vocabulary,
  objectives,
  sections,
  examples,
  mistakes,
  practice,
}) {
  return {
    id,
    version: '1.0.0',
    title,
    summary,
    stage: 'focused',
    targetSkills: [skill],
    prerequisiteSkills: prerequisites,
    introducedVocabulary: vocabulary,
    objectives,
    sections,
    examples,
    commonMistakes: mistakes,
    practiceExercises: practice,
  };
}

function focusedTest({ id, title, focus, skill, prerequisites = [], lessonId, exercises }) {
  return {
    id,
    title,
    focus,
    stage: 'focused',
    targetSkills: [skill],
    prerequisiteSkills: prerequisites,
    lessonIds: [lessonId],
    exercises,
  };
}

function reviewTest({ id, title, focus, skills, lessonIds, exercises }) {
  return {
    id,
    title,
    focus,
    stage: 'review',
    targetSkills: skills,
    prerequisiteSkills: [],
    lessonIds,
    exercises,
  };
}

function append(test, exercises, overrides = {}) {
  return { ...test, ...overrides, exercises: [...test.exercises, ...exercises] };
}

function replaceSkill(exercise, from, to) {
  const next = structuredClone(exercise);
  next.requiredSkills = next.requiredSkills.map((skill) => (skill === from ? to : skill));
  if (next.targetSkill === from) next.targetSkill = to;
  return next;
}

function removeSkill(exercise, skill) {
  const next = structuredClone(exercise);
  next.requiredSkills = next.requiredSkills.filter((candidate) => candidate !== skill);
  return next;
}

function writePack(rootPath, manifest, lessons, tests) {
  writeJson(resolve(rootPath, 'pack.json'), {
    ...manifest,
    lessonIds: lessons.map((item) => item.id),
    testIds: tests.map((item) => item.id),
  });
  for (const item of lessons) writeJson(resolve(rootPath, 'lessons', `${item.id}.json`), item);
  for (const item of tests) writeJson(resolve(rootPath, 'tests', `${item.id}.json`), item);
}

function buildHarmonyPack(reviewExercises) {
  const vowelLesson = loadLesson('vowel-harmony-basics');
  const insideLesson = loadLesson('inside-ending');
  const neutralPractice = practiceFrom(
    pairSeries({
      prefix: 'vhx-neutral-practice-seed',
      count: 4,
      skill: 'Neutral-vowel harmony',
      items: neutralWords,
      types: ['multiple-choice', 'fill-blank'],
      make: makeNeutralChoice,
    }),
    'vhx-neutral-practice',
  );
  const locationPractice = practiceFrom(
    pairSeries({
      prefix: 'vhx-location-practice-seed',
      count: 4,
      skill: 'Inessive location sentences',
      items: locationSentences,
      types: ['word-order', 'translation-fi'],
      make: makeSentenceExercise,
    }),
    'vhx-location-practice',
  );
  const neutralLesson = lesson({
    id: 'neutral-vowel-harmony',
    title: 'Neutral vowels in ending choice',
    summary:
      'Use e and i with the word’s other vowels, or choose the front-vowel ending when they appear alone.',
    skill: 'Neutral-vowel harmony',
    prerequisites: ['Vowel harmony'],
    vocabulary: neutralWords
      .filter(({ base }) => !vowelWords.some((word) => word.base === base))
      .map(({ base, english }) => ({ finnish: base, english })),
    objectives: [
      'Recognise e and i as neutral vowels.',
      'Check the whole word for a, o, u or ä, ö, y.',
      'Choose the correct harmonic ending without changing the stem.',
    ],
    sections: [
      {
        title: 'Neutral does not mean ignored',
        paragraphs: [
          'The vowels e and i can occur with either vowel family. Look for another vowel in the word before choosing an ending.',
          'If a simple word contains only e and i, use the front-vowel ending in this beginner scope.',
        ],
        keyPoints: [
          'paperi takes -ssa because it contains a',
          'kieli takes -ssä because it contains only e and i',
        ],
      },
      {
        title: 'Choose an ending, not a new stem',
        paragraphs: [
          'These questions ask only for -ssa or -ssä. You do not need to build the complete inflected word.',
          'Compound words and loanword exceptions are outside this pack.',
        ],
        keyPoints: ['tuoli → -ssa', 'keittiö → -ssä'],
      },
    ],
    examples: [
      {
        finnish: 'paperi + -ssa',
        english: 'in the paper',
        steps: ['e and i are neutral.', 'The back vowel a selects -ssa.'],
      },
      {
        finnish: 'kieli + -ssä',
        english: 'in the language',
        steps: ['The word contains only neutral e and i.', 'Use the front-vowel ending -ssä.'],
      },
    ],
    mistakes: [
      'Do not choose from the final vowel alone.',
      'Do not automatically choose -ssä whenever the word contains e or i.',
      'Do not build an unstated stem when the task asks only for an ending.',
    ],
    practice: neutralPractice,
  });
  const locationLesson = lesson({
    id: 'inessive-location-sentences',
    title: 'Short sentences with -ssa and -ssä',
    summary: 'Put a learned inessive location after the supplied form on (“is”).',
    skill: 'Inessive location sentences',
    prerequisites: ['Inessive -ssa/-ssä'],
    vocabulary: [
      { finnish: 'kirja', english: 'book' },
      { finnish: 'takki', english: 'coat' },
      { finnish: 'isä', english: 'father' },
      { finnish: 'äiti', english: 'mother' },
      { finnish: 'koira', english: 'dog' },
      { finnish: 'opiskelija', english: 'student' },
      { finnish: 'olla', english: 'to be' },
      { finnish: 'on', english: 'is' },
    ],
    objectives: [
      'Read the subject–on–location pattern.',
      'Use a learned -ssa/-ssä location in a complete sentence.',
      'Keep the supplied verb separate from the location word.',
    ],
    sections: [
      {
        title: 'A complete location statement',
        paragraphs: [
          'A short Finnish location statement can use a subject, on (“is”), and an inessive location.',
          'The verb on is supplied here. The assessed target is placing or producing the learned location form.',
        ],
        keyPoints: ['Kirja on kirjastossa.', 'Äiti on toimistossa.'],
      },
      {
        title: 'Keep the words separate',
        paragraphs: [
          'The subject, on, and the location are separate written words.',
          'The ending -ssa/-ssä joins directly to the location noun.',
        ],
        keyPoints: ['on kirjastossa, not onkirjastossa', 'myymälä + ssä = myymälässä'],
      },
    ],
    examples: [
      {
        finnish: 'Kirja on kirjastossa.',
        english: 'The book is in the library.',
        steps: ['Kirja is the subject.', 'on means “is”.', 'kirjasto + -ssa gives kirjastossa.'],
      },
      {
        finnish: 'Takki on myymälässä.',
        english: 'The coat is in the shop.',
        steps: ['Takki is the subject.', 'myymälä has front vowels.', 'Add -ssä: myymälässä.'],
      },
    ],
    mistakes: [
      'Do not attach on to another word.',
      'Do not choose the ending from the English word.',
      'Do not omit the complete sentence meaning when building Finnish.',
    ],
    practice: locationPractice,
  });

  const vowelExtra = pairSeries({
    prefix: 'vhx-vowel-focused',
    count: 10,
    skill: 'Vowel harmony',
    items: vowelWords,
    types: ['multiple-choice', 'fill-blank'],
    make: makeClassification,
  });
  const neutralExercises = pairSeries({
    prefix: 'vhx-neutral-focused',
    count: 20,
    skill: 'Neutral-vowel harmony',
    items: neutralWords,
    types: [
      'multiple-choice',
      'fill-blank',
      'multiple-choice',
      'fill-blank',
      'multiple-choice',
      'fill-blank',
      'multiple-choice',
      'fill-blank',
      'fill-blank',
      'multiple-choice',
    ],
    make: makeNeutralChoice,
  });
  const insideExtra = pairSeries({
    prefix: 'vhx-inessive-focused',
    count: 6,
    skill: 'Inessive -ssa/-ssä',
    items: inessiveForms,
    types: ['multiple-choice', 'fill-blank', 'translation-fi'],
    make: makeInessiveExercise,
  });
  const locationExercises = pairSeries({
    prefix: 'vhx-location-focused',
    count: 20,
    skill: 'Inessive location sentences',
    items: locationSentences,
    types: ['multiple-choice', 'fill-blank', 'translation-fi', 'translation-en', 'word-order'],
    make: makeSentenceExercise,
  });

  const oldVowel = reviewExercises.filter((exercise) => exercise.targetSkill === 'Vowel harmony');
  const oldInside = reviewExercises.filter(
    (exercise) => exercise.targetSkill === 'Inessive -ssa/-ssä',
  );
  const reviewOneNew = [
    ...pairSeries({
      prefix: 'vhx-review-one-vowel',
      count: 4,
      skill: 'Vowel harmony',
      items: vowelWords,
      types: ['fill-blank', 'multiple-choice'],
      offset: 4,
      make: makeClassification,
    }),
    ...pairSeries({
      prefix: 'vhx-review-one-neutral',
      count: 4,
      skill: 'Neutral-vowel harmony',
      items: neutralWords,
      types: ['fill-blank', 'multiple-choice'],
      offset: 4,
      make: makeNeutralChoice,
    }),
    ...pairSeries({
      prefix: 'vhx-review-one-inessive',
      count: 4,
      skill: 'Inessive -ssa/-ssä',
      items: inessiveForms,
      types: ['multiple-choice', 'translation-en'],
      offset: 2,
      make: makeInessiveExercise,
    }),
  ];
  const reviewTwoNew = [
    ...pairSeries({
      prefix: 'vhx-review-two-neutral',
      count: 4,
      skill: 'Neutral-vowel harmony',
      items: neutralWords,
      types: ['fill-blank', 'multiple-choice'],
      offset: 8,
      make: makeNeutralChoice,
    }),
    ...pairSeries({
      prefix: 'vhx-review-two-inessive',
      count: 4,
      skill: 'Inessive -ssa/-ssä',
      items: inessiveForms,
      types: ['translation-fi', 'translation-en'],
      offset: 6,
      make: makeInessiveExercise,
    }),
    ...pairSeries({
      prefix: 'vhx-review-two-location',
      count: 4,
      skill: 'Inessive location sentences',
      items: locationSentences,
      types: ['word-order', 'multiple-choice'],
      offset: 4,
      make: makeSentenceExercise,
    }),
  ];

  const lessons = [vowelLesson, neutralLesson, insideLesson, locationLesson];
  const tests = [
    append(loadTest('vowel-families'), vowelExtra),
    focusedTest({
      id: 'neutral-vowel-harmony-test',
      title: 'Neutral vowels and endings',
      focus: 'Use e and i with the word’s other vowels when choosing a harmonic ending.',
      skill: 'Neutral-vowel harmony',
      prerequisites: ['Vowel harmony'],
      lessonId: 'neutral-vowel-harmony',
      exercises: neutralExercises,
    }),
    append(loadTest('harmony-in-forms'), insideExtra),
    focusedTest({
      id: 'inessive-location-sentences-test',
      title: 'Location sentences',
      focus: 'Use learned -ssa/-ssä forms in short written location statements.',
      skill: 'Inessive location sentences',
      prerequisites: ['Inessive -ssa/-ssä'],
      lessonId: 'inessive-location-sentences',
      exercises: locationExercises,
    }),
    reviewTest({
      id: 'vowel-ending-review',
      title: 'Vowel and ending review',
      focus: 'Retrieve vowel-family and ending choices without adding a new grammar rule.',
      skills: ['Vowel harmony', 'Neutral-vowel harmony', 'Inessive -ssa/-ssä'],
      lessonIds: lessons.map((item) => item.id),
      exercises: [...oldVowel.slice(0, 1), ...oldInside.slice(0, 1), ...reviewOneNew],
    }),
    reviewTest({
      id: 'location-transfer-review',
      title: 'Location transfer review',
      focus: 'Mix neutral-vowel choices, inessive forms, and complete location statements.',
      skills: [
        'Vowel harmony',
        'Neutral-vowel harmony',
        'Inessive -ssa/-ssä',
        'Inessive location sentences',
      ],
      lessonIds: lessons.map((item) => item.id),
      exercises: [...oldVowel.slice(1), ...oldInside.slice(1), ...reviewTwoNew],
    }),
  ];
  writePack(
    packRoots.harmony,
    {
      schemaVersion: 1,
      id: 'vowel-harmony-location-endings',
      version: '1.0.0',
      title: 'Vowel harmony and location endings',
      level: '0 - A1.3',
      summary:
        'Choose harmonic endings and use -ssa/-ssä in controlled written location forms and sentences.',
      objectives: [
        'Distinguish back, front, and neutral vowels.',
        'Choose -ssa or -ssä from the complete Finnish word.',
        'Build stable-stem inessive forms.',
        'Use learned location forms in short written sentences.',
      ],
      importantSkills: [
        'Vowel harmony',
        'Neutral-vowel harmony',
        'Inessive -ssa/-ssä',
        'Inessive location sentences',
      ],
      sources: [sources.vowel, sources.level],
    },
    lessons,
    tests,
  );
}

function buildKptPack(reviewExercises) {
  const gradePractice = practiceFrom(
    pairSeries({
      prefix: 'kptx-grade-practice-seed',
      count: 4,
      skill: 'Strong and weak KPT grades',
      items: strongWeakForms,
      types: ['multiple-choice', 'fill-blank'],
      make: makeGradeExercise,
    }),
    'kptx-grade-practice',
  );
  const gradeLesson = lesson({
    id: 'strong-weak-kpt-grades',
    title: 'Strong and weak KPT grades',
    summary: 'Understand why one known word can show two related consonant patterns.',
    skill: 'Strong and weak KPT grades',
    vocabulary: strongWeakForms.map(({ base, english }) => ({ finnish: base, english })),
    objectives: [
      'Recognise the strong and weak member of a learned pair.',
      'Understand that the labels describe patterns, not correctness.',
      'Prepare to study one KPT change family at a time.',
    ],
    sections: [
      {
        title: 'One word, two related forms',
        paragraphs: [
          'Some Finnish words use a strong consonant grade in one form and a weak grade in another.',
          'Both forms are correct. The surrounding grammatical form determines which grade appears.',
        ],
        keyPoints: ['pankki is strong; pankin is weak', 'ranta is strong; rannan is weak'],
      },
      {
        title: 'Names for consonant patterns',
        paragraphs: [
          'Strong and weak describe the consonants, not emphasis or quality.',
          'This lesson asks only which member of a displayed pair is strong or weak. Later lessons teach the individual changes.',
        ],
        keyPoints: [
          'kk and nt are strong patterns in the displayed examples',
          'k and nn are their weak partners',
        ],
      },
    ],
    examples: [
      {
        finnish: 'pankki → pankin',
        english: 'bank → of the bank',
        steps: [
          'pankki shows strong kk.',
          'pankin shows weak k.',
          'The meaning still belongs to the same word.',
        ],
      },
      {
        finnish: 'ranta → rannan',
        english: 'beach → of the beach',
        steps: [
          'ranta shows strong nt.',
          'rannan shows weak nn.',
          'The labels identify the visible consonant patterns.',
        ],
      },
    ],
    mistakes: [
      'Do not treat the weak grade as incorrect or less important.',
      'Do not assume every doubled consonant always changes.',
      'Do not guess an unfamiliar word’s pattern from English.',
    ],
    practice: gradePractice,
  });

  const familyLessonIds = ['kpt-doubles', 'kpt-singles', 'kpt-special-k', 'kpt-clusters'];
  const familySkillByLesson = {
    'kpt-doubles': 'KPT double consonants',
    'kpt-singles': 'KPT common single consonants',
    'kpt-special-k': 'KPT special k changes',
    'kpt-clusters': 'KPT consonant clusters',
  };
  const lessons = [
    gradeLesson,
    ...familyLessonIds.map((id) => ({
      ...loadLesson(id),
      prerequisiteSkills: ['Strong and weak KPT grades'],
    })),
    loadLesson('kpt-basics'),
    loadLesson('genitive-nouns'),
    loadLesson('verb-kpt'),
  ];
  const singleLesson = lessons.find((item) => item.id === 'kpt-singles');
  if (singleLesson) {
    for (const { base: finnish, english } of kptFamilies['KPT common single consonants'].slice(3)) {
      if (!singleLesson.introducedVocabulary.some((item) => item.finnish === finnish))
        singleLesson.introducedVocabulary.push({ finnish, english });
    }
  }
  const tests = [];
  const gradeExercises = pairSeries({
    prefix: 'kptx-grade-focused',
    count: 20,
    skill: 'Strong and weak KPT grades',
    items: strongWeakForms,
    types: ['multiple-choice', 'fill-blank'],
    make: makeGradeExercise,
  });
  tests.push(
    focusedTest({
      id: 'strong-weak-kpt-grades-test',
      title: 'Strong and weak grades',
      focus: 'Identify the strong and weak member of familiar KPT pairs.',
      skill: 'Strong and weak KPT grades',
      lessonId: 'strong-weak-kpt-grades',
      exercises: gradeExercises,
    }),
  );
  for (const lessonId of familyLessonIds) {
    const skill = familySkillByLesson[lessonId];
    const testId = `test-${lessonId}`;
    const types =
      testId === 'test-kpt-special-k'
        ? [
            'multiple-choice',
            'fill-blank',
            'translation-fi',
            'translation-en',
            'fill-blank',
            'multiple-choice',
          ]
        : testId === 'test-kpt-doubles'
          ? ['multiple-choice', 'translation-fi', 'fill-blank', 'translation-en']
          : testId === 'test-kpt-singles'
            ? ['multiple-choice', 'multiple-choice', 'translation-fi', 'translation-en']
            : ['multiple-choice', 'fill-blank', 'translation-fi', 'translation-en'];
    const extra = pairSeries({
      prefix: `kptx-${lessonId}-focused`,
      count: testId === 'test-kpt-special-k' ? 12 : 8,
      skill,
      items: kptFamilies[skill],
      types,
      offset: 2,
      make: makeFormExercise,
    });
    const existingTest = loadTest(testId);
    if (testId === 'test-kpt-singles') {
      const replacements = kptFamilies['KPT common single consonants'].slice(-2);
      existingTest.exercises = existingTest.exercises.map((exercise) => {
        const index = ['ff-a1-t04-e11', 'ff-a1-t04-e12'].indexOf(exercise.id);
        if (index < 0) return exercise;
        const replacement = makeFormExercise({
          id: exercise.id,
          type: exercise.type,
          skill,
          item: replacements[index],
          variant: 0,
        });
        replacement.parallelExerciseId = exercise.parallelExerciseId;
        return replacement;
      });
    }
    tests.push(append(existingTest, extra, { prerequisiteSkills: ['Strong and weak KPT grades'] }));
  }
  const recognitionExtra = pairSeries({
    prefix: 'kptx-recognition-focused',
    count: 12,
    skill: 'KPT recognition',
    items: allKptForms,
    types: ['multiple-choice', 'fill-blank'],
    offset: 4,
    make: makeKptRecognition,
  });
  tests.push(append(loadTest('kpt-patterns'), recognitionExtra));
  const genitiveExtra = pairSeries({
    prefix: 'kptx-genitive-focused',
    count: 6,
    skill: 'Genitive -n',
    items: allKptForms,
    types: ['multiple-choice', 'fill-blank', 'translation-fi'],
    offset: 3,
    make: makeFormExercise,
  });
  const genitiveTest = loadTest('kpt-nouns');
  genitiveTest.exercises = genitiveTest.exercises.map((exercise) => {
    if (exercise.type !== 'fill-blank') return exercise;
    const item = allKptForms.find((candidate) => candidate.base === exercise.vocabulary[0]);
    if (!item) return exercise;
    return {
      ...exercise,
      prompt: `${exercise.prompt.split('·')[0].trim()} · use the supplied weak stem ${item.stem} and add genitive -n`,
    };
  });
  tests.push(append(genitiveTest, genitiveExtra));
  const verbExtra = pairSeries({
    prefix: 'kptx-verb-focused',
    count: 6,
    skill: 'Minä verb forms with KPT',
    items: verbSentences,
    types: ['multiple-choice', 'fill-blank', 'translation-en'],
    offset: 2,
    make: makeVerbExercise,
  });
  tests.push(append(loadTest('kpt-verbs'), verbExtra));

  const oldBySkill = Object.groupBy(reviewExercises, (exercise) => exercise.targetSkill);
  const familyReviewOld = [
    'KPT double consonants',
    'KPT common single consonants',
    'KPT special k changes',
    'KPT consonant clusters',
  ].flatMap((skill) => oldBySkill[skill] ?? []);
  const formReviewOld = [
    ...(oldBySkill['KPT recognition'] ?? []),
    ...(oldBySkill['Genitive -n'] ?? []),
    ...(oldBySkill['Minä verb forms with KPT'] ?? []),
  ];
  const familyReviewNew = [
    ...pairSeries({
      prefix: 'kptx-family-review-grade',
      count: 8,
      skill: 'Strong and weak KPT grades',
      items: strongWeakForms,
      types: ['multiple-choice', 'fill-blank'],
      offset: 5,
      make: makeGradeExercise,
    }),
    ...Object.entries(kptFamilies).flatMap(([skill, items]) => {
      const types =
        skill === 'KPT double consonants'
          ? ['multiple-choice', 'translation-en']
          : skill === 'KPT common single consonants'
            ? ['translation-en', 'translation-en']
            : skill === 'KPT special k changes'
              ? ['translation-fi', 'translation-en']
              : ['multiple-choice', 'fill-blank'];
      const offset = skill === 'KPT common single consonants' ? 3 : 4;
      return pairSeries({
        prefix: `kptx-family-review-${slug(skill)}`,
        count: 4,
        skill,
        items,
        types,
        offset,
        make: makeFormExercise,
      });
    }),
  ];
  const formReviewNew = [
    ...pairSeries({
      prefix: 'kptx-form-review-recognition',
      count: 8,
      skill: 'KPT recognition',
      items: allKptForms,
      types: ['multiple-choice', 'fill-blank'],
      offset: 10,
      make: makeKptRecognition,
    }),
    ...pairSeries({
      prefix: 'kptx-form-review-genitive',
      count: 8,
      skill: 'Genitive -n',
      items: allKptForms,
      types: ['fill-blank', 'translation-fi'],
      offset: 8,
      make: makeFormExercise,
    }),
    ...pairSeries({
      prefix: 'kptx-form-review-verbs',
      count: 8,
      skill: 'Minä verb forms with KPT',
      items: verbSentences,
      types: ['multiple-choice', 'fill-blank', 'translation-en', 'word-order'],
      offset: 4,
      make: makeVerbExercise,
    }),
  ];
  const transferReviewNew = [
    ...pairSeries({
      prefix: 'kptx-transfer-review-grade',
      count: 6,
      skill: 'Strong and weak KPT grades',
      items: reviewGradeForms,
      types: ['multiple-choice', 'fill-blank'],
      make: makeGradeExercise,
    }),
    ...Object.entries(kptFamilies).flatMap(([skill, items]) =>
      pairSeries({
        prefix: `kptx-transfer-review-${slug(skill)}`,
        count: 2,
        skill,
        items,
        types: [skill === 'KPT special k changes' ? 'multiple-choice' : 'translation-fi'],
        offset: 8,
        make: skill === 'KPT special k changes' ? makeWeakStemExercise : makeFormExercise,
      }),
    ),
    ...pairSeries({
      prefix: 'kptx-transfer-review-recognition',
      count: 4,
      skill: 'KPT recognition',
      items: allKptForms,
      types: ['multiple-choice', 'fill-blank'],
      offset: 18,
      make: makeKptRecognition,
    }),
    ...pairSeries({
      prefix: 'kptx-transfer-review-genitive',
      count: 8,
      skill: 'Genitive -n',
      items: allKptForms,
      types: ['multiple-choice', 'translation-fi'],
      offset: 16,
      make: makeFormExercise,
    }),
    ...pairSeries({
      prefix: 'kptx-transfer-review-verbs',
      count: 8,
      skill: 'Minä verb forms with KPT',
      items: verbSentences,
      types: ['word-order', 'fill-blank', 'translation-fi', 'multiple-choice'],
      offset: 8,
      make: makeVerbExercise,
    }),
  ];
  const lessonIds = lessons.map((item) => item.id);
  const allKptSkills = [
    'Strong and weak KPT grades',
    ...Object.keys(kptFamilies),
    'KPT recognition',
    'Genitive -n',
    'Minä verb forms with KPT',
  ];
  tests.push(
    reviewTest({
      id: 'kpt-family-review',
      title: 'KPT family review',
      focus: 'Retrieve the learned KPT families and strong–weak relationship.',
      skills: allKptSkills,
      lessonIds,
      exercises: [...familyReviewOld, ...familyReviewNew],
    }),
    reviewTest({
      id: 'kpt-form-review',
      title: 'Singular form review',
      focus: 'Apply learned KPT patterns in controlled genitive and minä forms.',
      skills: allKptSkills,
      lessonIds,
      exercises: [...formReviewOld, ...formReviewNew],
    }),
    reviewTest({
      id: 'kpt-transfer-review',
      title: 'KPT transfer review',
      focus: 'Mix every learned KPT family and singular application without new grammar.',
      skills: allKptSkills,
      lessonIds,
      exercises: transferReviewNew,
    }),
  );
  writePack(
    packRoots.kpt,
    {
      schemaVersion: 1,
      id: 'kpt-singular-forms',
      version: '1.0.0',
      title: 'KPT and singular forms',
      level: '0 - A1.3',
      summary:
        'Learn strong and weak KPT patterns, then apply them in controlled genitive noun and minä verb forms.',
      objectives: [
        'Understand strong and weak grades.',
        'Recognise the beginner KPT families.',
        'Build controlled genitive noun forms.',
        'Use KPT minä forms in short written sentences.',
      ],
      importantSkills: [
        'Strong and weak KPT grades',
        'KPT double consonants',
        'KPT common single consonants',
        'KPT special k changes',
        'KPT consonant clusters',
        'KPT recognition',
        'Genitive -n',
        'Minä verb forms with KPT',
      ],
      sources: [sources.kpt, sources.specialK, sources.verb, sources.verbs, sources.level],
    },
    lessons,
    tests,
  );
}

function buildPluralPack(reviewExercises) {
  const recognitionPractice = practiceFrom(
    pairSeries({
      prefix: 'tpx-recognition-practice-seed',
      count: 4,
      skill: 'T-plural recognition',
      items: regularPlurals,
      types: ['multiple-choice', 'fill-blank'],
      make: makePluralRecognition,
    }),
    'tpx-recognition-practice',
  );
  const kptRecognitionPractice = practiceFrom(
    pairSeries({
      prefix: 'tpx-kpt-recognition-practice-seed',
      count: 4,
      skill: 'KPT T-plural recognition',
      items: kptPlurals,
      types: ['multiple-choice', 'fill-blank'],
      make: (input) => makePluralRecognition({ ...input, kpt: true }),
    }),
    'tpx-kpt-recognition-practice',
  );
  const recognitionLesson = lesson({
    id: 't-plural-recognition',
    title: 'Recognising the T-plural',
    summary: 'Distinguish one item from more than one before building plural forms.',
    skill: 'T-plural recognition',
    vocabulary: regularPlurals.map(({ base, english }) => ({ finnish: base, english })),
    objectives: [
      'Recognise the final plural -t.',
      'Distinguish a supplied singular and plural pair.',
      'Connect the plural form with “more than one”.',
    ],
    sections: [
      {
        title: 'One or more than one',
        paragraphs: [
          'The basic singular names one item. The nominative T-plural commonly names more than one item when the noun is a plural subject.',
          'This first step asks only whether a displayed form is singular or plural.',
        ],
        keyPoints: ['kirja = book', 'kirjat = books'],
      },
      {
        title: 'The visible plural signal',
        paragraphs: [
          'In the stable forms used here, plural -t appears at the end.',
          'Other Finnish plural cases are outside this pack.',
        ],
        keyPoints: ['koira → koirat', 'kynä → kynät'],
      },
    ],
    examples: [
      {
        finnish: 'kirja → kirjat',
        english: 'book → books',
        steps: ['kirja is singular.', 'Final -t marks this nominative plural.'],
      },
      {
        finnish: 'kynä → kynät',
        english: 'pen → pens',
        steps: ['kynä names one pen.', 'kynät names more than one pen.'],
      },
    ],
    mistakes: [
      'Do not treat every final t as a complete explanation of all Finnish plurals.',
      'Do not add a second case ending.',
      'Do not change a stable stem in this recognition step.',
    ],
    practice: recognitionPractice,
  });
  const kptRecognitionLesson = lesson({
    id: 'kpt-t-plural-recognition',
    title: 'Recognising KPT in T-plurals',
    summary: 'Notice the weak consonant grade before the final plural -t.',
    skill: 'KPT T-plural recognition',
    prerequisites: ['Regular T-plural'],
    vocabulary: kptPlurals.map(({ base, english }) => ({ finnish: base, english })),
    objectives: [
      'Separate the final plural -t from the noun stem.',
      'Recognise the displayed strong-to-weak change.',
      'Prepare to produce familiar KPT plurals.',
    ],
    sections: [
      {
        title: 'Stem first, plural ending second',
        paragraphs: [
          'Some familiar nouns use a weak consonant grade before plural -t.',
          'Identify the stem change separately from the final -t.',
        ],
        keyPoints: ['takki → taki- + t → takit', 'ranta → ranna- + t → rannat'],
      },
      {
        title: 'Known pairs only',
        paragraphs: [
          'This pack teaches the displayed word pairs from first principles.',
          'Do not assume every unfamiliar noun changes in the same way.',
        ],
        keyPoints: ['tt → t in keitto → keitot', 'lt → ll in silta → sillat'],
      },
    ],
    examples: [
      {
        finnish: 'takki → takit',
        english: 'coat → coats',
        steps: ['Change kk to k: taki-.', 'Add plural -t: takit.'],
      },
      {
        finnish: 'ranta → rannat',
        english: 'beach → beaches',
        steps: ['Change nt to nn: ranna-.', 'Add plural -t: rannat.'],
      },
    ],
    mistakes: [
      'Do not attach -t to the unchanged strong form when the learned pair uses KPT.',
      'Do not count an internal t as the plural ending.',
      'Do not guess beyond the displayed vocabulary.',
    ],
    practice: kptRecognitionPractice,
  });

  const regularLesson = {
    ...loadLesson('t-plural-basics'),
    prerequisiteSkills: ['T-plural recognition'],
  };
  const kptPluralLesson = loadLesson('kpt-t-plural');
  kptPluralLesson.prerequisiteSkills = ['Regular T-plural', 'KPT T-plural recognition'];
  kptPluralLesson.introducedVocabulary = [
    { finnish: 'matto', english: 'rug' },
    { finnish: 'kukka', english: 'flower' },
    { finnish: 'hattu', english: 'hat' },
    { finnish: 'lippu', english: 'ticket' },
    { finnish: 'kenkä', english: 'shoe' },
    { finnish: 'kaupunki', english: 'city' },
    { finnish: 'pöytä', english: 'table' },
    { finnish: 'leipä', english: 'bread' },
  ];
  kptPluralLesson.sections[1].paragraphs[0] =
    'The changes are the same ones shown in this pack’s recognition lesson: double consonants can shorten, a single p can become v, and clusters can change.';
  kptPluralLesson.practiceExercises = kptPluralLesson.practiceExercises.map((exercise) =>
    replaceSkill(exercise, 'KPT recognition', 'KPT T-plural recognition'),
  );
  const heLesson = loadLesson('he-verbs');
  heLesson.prerequisiteSkills = [];
  heLesson.practiceExercises = heLesson.practiceExercises.map((exercise) =>
    removeSkill(exercise, 'Vowel harmony'),
  );
  const pluralLesson = loadLesson('plural-sentences');
  pluralLesson.introducedVocabulary = pluralLesson.introducedVocabulary.filter(
    (item, index, values) =>
      values.findIndex((candidate) => candidate.finnish === item.finnish) === index,
  );
  if (!pluralLesson.introducedVocabulary.some((item) => item.finnish === 'auto'))
    pluralLesson.introducedVocabulary.push({ finnish: 'auto', english: 'car' });
  pluralLesson.practiceExercises = pluralLesson.practiceExercises.map((exercise) => ({
    ...exercise,
    prompt: `Optional practice: ${exercise.prompt}`,
  }));
  const lessons = [
    recognitionLesson,
    regularLesson,
    kptRecognitionLesson,
    kptPluralLesson,
    heLesson,
    pluralLesson,
  ];

  const recognitionExercises = pairSeries({
    prefix: 'tpx-recognition-focused',
    count: 20,
    skill: 'T-plural recognition',
    items: regularPlurals,
    types: ['multiple-choice', 'fill-blank'],
    make: makePluralRecognition,
  });
  const regularExtra = pairSeries({
    prefix: 'tpx-regular-focused',
    count: 6,
    skill: 'Regular T-plural',
    items: regularPlurals,
    types: ['multiple-choice', 'fill-blank', 'translation-fi'],
    offset: 4,
    make: (input) => makeFormExercise({ ...input, mode: 'plural' }),
  });
  const kptRecognitionExercises = pairSeries({
    prefix: 'tpx-kpt-recognition-focused',
    count: 20,
    skill: 'KPT T-plural recognition',
    items: kptPlurals,
    types: ['multiple-choice', 'fill-blank'],
    make: (input) => makePluralRecognition({ ...input, kpt: true }),
  });
  const kptExtra = pairSeries({
    prefix: 'tpx-kpt-focused',
    count: 6,
    skill: 'T-plural with KPT',
    items: kptPlurals,
    types: ['multiple-choice', 'fill-blank', 'translation-fi'],
    offset: 4,
    make: (input) =>
      makeFormExercise({ ...input, mode: 'plural', extraSkill: 'KPT T-plural recognition' }),
  });
  const heExtra = pairSeries({
    prefix: 'tpx-he-focused',
    count: 6,
    skill: 'Third-person plural -vat/-vät',
    items: thirdPluralVerbs,
    types: ['translation-en', 'multiple-choice', 'translation-fi'],
    offset: 4,
    make: makeHeVerbExercise,
  });
  const sentenceExtra = pairSeries({
    prefix: 'tpx-sentence-focused',
    count: 6,
    skill: 'Plural subject + ovat',
    items: pluralSentences,
    types: ['multiple-choice', 'multiple-choice', 'translation-en'],
    offset: 2,
    make: makeSentenceExercise,
  });

  const kptTest = loadTest('test-kpt-t-plural');
  kptTest.prerequisiteSkills = ['Regular T-plural', 'KPT T-plural recognition'];
  kptTest.exercises = kptTest.exercises.map((exercise) =>
    replaceSkill(exercise, 'KPT recognition', 'KPT T-plural recognition'),
  );
  const heTest = loadTest('plural-verb-harmony');
  heTest.prerequisiteSkills = [];
  heTest.exercises = heTest.exercises.map((exercise) => removeSkill(exercise, 'Vowel harmony'));

  const oldRegular = reviewExercises.filter(
    (exercise) => exercise.targetSkill === 'Regular T-plural',
  );
  const oldKpt = reviewExercises
    .filter((exercise) => exercise.targetSkill === 'T-plural with KPT')
    .map((exercise) => replaceSkill(exercise, 'KPT recognition', 'KPT T-plural recognition'))
    .map((exercise) =>
      replaceSkill(exercise, 'KPT consonant clusters', 'KPT T-plural recognition'),
    );
  const oldHe = reviewExercises
    .filter((exercise) => exercise.targetSkill === 'Third-person plural -vat/-vät')
    .map((exercise) => removeSkill(exercise, 'Vowel harmony'));
  const oldSentences = reviewExercises.filter(
    (exercise) => exercise.targetSkill === 'Plural subject + ovat',
  );
  const nounReviewNew = [
    ...pairSeries({
      prefix: 'tpx-noun-review-recognition',
      count: 8,
      skill: 'T-plural recognition',
      items: regularPlurals,
      types: ['translation-en'],
      offset: 6,
      make: makePluralRecognition,
    }),
    ...pairSeries({
      prefix: 'tpx-noun-review-regular',
      count: 8,
      skill: 'Regular T-plural',
      items: regularPlurals,
      types: ['multiple-choice', 'translation-fi'],
      offset: 8,
      make: (input) => makeFormExercise({ ...input, mode: 'plural' }),
    }),
    ...pairSeries({
      prefix: 'tpx-noun-review-kpt-recognition',
      count: 8,
      skill: 'KPT T-plural recognition',
      items: kptPlurals,
      types: ['multiple-choice', 'fill-blank'],
      offset: 6,
      make: makeKptRecognition,
    }),
    ...pairSeries({
      prefix: 'tpx-noun-review-kpt',
      count: 8,
      skill: 'T-plural with KPT',
      items: kptPlurals,
      types: ['multiple-choice', 'translation-fi'],
      offset: 8,
      make: (input) =>
        makeFormExercise({ ...input, mode: 'plural', extraSkill: 'KPT T-plural recognition' }),
    }),
  ];
  const sentenceReviewNew = [
    ...pairSeries({
      prefix: 'tpx-sentence-review-recognition',
      count: 4,
      skill: 'T-plural recognition',
      items: regularPlurals,
      types: ['translation-fi'],
      offset: 12,
      make: makePluralRecognition,
    }),
    ...pairSeries({
      prefix: 'tpx-sentence-review-regular',
      count: 4,
      skill: 'Regular T-plural',
      items: regularPlurals,
      types: ['translation-en', 'translation-fi'],
      offset: 14,
      make: (input) => makeFormExercise({ ...input, mode: 'plural' }),
    }),
    ...pairSeries({
      prefix: 'tpx-sentence-review-kpt-recognition',
      count: 4,
      skill: 'KPT T-plural recognition',
      items: kptPlurals,
      types: ['multiple-choice'],
      offset: 12,
      make: makeWeakStemExercise,
    }),
    ...pairSeries({
      prefix: 'tpx-sentence-review-kpt',
      count: 4,
      skill: 'T-plural with KPT',
      items: kptPlurals,
      types: ['translation-en'],
      make: (input) =>
        makeFormExercise({ ...input, mode: 'plural', extraSkill: 'KPT T-plural recognition' }),
    }),
    ...pairSeries({
      prefix: 'tpx-sentence-review-he',
      count: 8,
      skill: 'Third-person plural -vat/-vät',
      items: thirdPluralVerbs,
      types: ['word-order'],
      offset: 8,
      make: makeHeVerbExercise,
    }),
    ...pairSeries({
      prefix: 'tpx-sentence-review-ovat',
      count: 8,
      skill: 'Plural subject + ovat',
      items: pluralSentences,
      types: ['multiple-choice', 'word-order', 'translation-fi', 'translation-fi'],
      offset: 6,
      make: makeSentenceExercise,
    }),
  ];
  const lessonIds = lessons.map((item) => item.id);
  const tests = [
    focusedTest({
      id: 't-plural-recognition-test',
      title: 'Recognising T-plurals',
      focus: 'Distinguish singular noun forms from familiar nominative T-plurals.',
      skill: 'T-plural recognition',
      lessonId: 't-plural-recognition',
      exercises: recognitionExercises,
    }),
    append(loadTest('regular-t-plural'), regularExtra, {
      prerequisiteSkills: ['T-plural recognition'],
    }),
    focusedTest({
      id: 'kpt-t-plural-recognition-test',
      title: 'Recognising KPT plurals',
      focus: 'Identify the weak consonant grade before a supplied final plural -t.',
      skill: 'KPT T-plural recognition',
      prerequisites: ['Regular T-plural'],
      lessonId: 'kpt-t-plural-recognition',
      exercises: kptRecognitionExercises,
    }),
    append(kptTest, kptExtra),
    append(heTest, heExtra),
    append(loadTest('plural-in-sentences'), sentenceExtra),
    reviewTest({
      id: 't-plural-form-review',
      title: 'T-plural form review',
      focus: 'Mix regular and KPT noun plurals after both have been learned.',
      skills: [
        'T-plural recognition',
        'Regular T-plural',
        'KPT T-plural recognition',
        'T-plural with KPT',
      ],
      lessonIds,
      exercises: [...oldRegular, ...oldKpt, ...nounReviewNew],
    }),
    reviewTest({
      id: 'plural-agreement-review',
      title: 'Plural agreement review',
      focus: 'Use plural nouns and written plural verbs in controlled complete sentences.',
      skills: [
        'T-plural recognition',
        'Regular T-plural',
        'KPT T-plural recognition',
        'T-plural with KPT',
        'Third-person plural -vat/-vät',
        'Plural subject + ovat',
      ],
      lessonIds,
      exercises: [...oldHe, ...oldSentences, ...sentenceReviewNew],
    }),
  ];
  writePack(
    packRoots.plural,
    {
      schemaVersion: 1,
      id: 't-plural-agreement',
      version: '1.0.0',
      title: 'T-plural and plural agreement',
      level: '0 - A1.3',
      summary:
        'Recognise and form nominative T-plurals, then use written plural verb agreement in short sentences.',
      objectives: [
        'Distinguish singular and T-plural noun forms.',
        'Build regular and familiar KPT T-plurals.',
        'Choose -vat or -vät from a supplied verb stem.',
        'Use plural subjects with ovat in short written sentences.',
      ],
      importantSkills: [
        'T-plural recognition',
        'Regular T-plural',
        'KPT T-plural recognition',
        'T-plural with KPT',
        'Third-person plural -vat/-vät',
        'Plural subject + ovat',
      ],
      sources: [sources.plural, sources.vowel, sources.kpt, sources.level],
    },
    lessons,
    tests,
  );
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '');
}

const reviewExercises = loadLegacyReviewExercises();
buildHarmonyPack(reviewExercises);
buildKptPack(reviewExercises);
buildPluralPack(reviewExercises);
console.log('Generated three grammar-foundation successor packs.');

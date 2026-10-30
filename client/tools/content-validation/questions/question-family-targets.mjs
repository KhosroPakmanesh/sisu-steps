const target = (id, question, answer, scope) => ({
  id,
  question,
  answer,
  ...(scope ? { scope } : {}),
});
const singular = { axis: 'form', number: 'singular' };
const plural = { axis: 'form', number: 'plural' };
const onePerson = { axis: 'person', number: 'singular' };
const people = { axis: 'person', number: 'plural' };
// Independent bounded inventories validate the authored family; they do not generate teaching.
export const QUESTION_TARGETS = {
  'who-and-what-questions': [
    target('qw-kuka-singular', '^kuka ', '\\b(?:olen|olet|on)\\b', onePerson),
    target('qw-ketka-plural', '^ketkä ', '\\b(?:olemme|olette|ovat)\\b', people),
    target('qw-mika-singular', '^mikä ', '\\bon\\b', singular),
    target('qw-mitka-plural', '^mitkä ', '\\bovat\\b', plural),
    target(
      'qw-mita-plural-classification',
      '^mitä (?:nämä|nuo|ne) ovat$',
      '\\b(?:ovat|eivät ole) (?:kirjoja|kyniä|autoja|laukkuja|puhelimia|avaimia|palloja|kukkia|kuppeja|tuoleja|pulloja|laatikoita)(?:$| )',
      plural,
    ),
    target(
      'qw-mita-actions',
      '^mitä ',
      '(?:^| )(?:juon|juo|juovat|juomme|syö|syömme|syön|luen|lukee)(?: |$)',
    ),
    target(
      'qw-mita-substances',
      '^mitä ',
      '(?:vettä|kahvia|mehua|maitoa|teetä|keittoa|puuroa|riisiä|juustoa)$',
      singular,
    ),
  ],
  'place-and-direction-questions': [
    target(
      'qw-missa-inside',
      '^missä ',
      '(?:koulussa|talossa|kahvilassa|kirjastossa|hallissa|kaupungissa|laukussa|metsässä)$',
    ),
    target('qw-missa-outside', '^missä ', '(?:asemalla|pöydällä|torilla|pihalla|tuolilla)$'),
    target(
      'qw-mista-inside',
      '^mistä ',
      '(?:koulusta|kahvilasta|kirjastosta|talosta|suomesta|ruotsista|hallista|kaupungista|virosta|metsästä)$',
    ),
    target('qw-mista-outside', '^mistä ', '(?:asemalta|torilta|pihalta|pöydältä|tuolilta)$'),
    target(
      'qw-mihin-inside',
      '^(?:mihin|minne) ',
      '(?:kouluun|kahvilaan|kirjastoon|taloon|halliin|metsään)$',
    ),
    target(
      'qw-mihin-outside',
      '^(?:mihin|minne) ',
      '(?:asemalle|torille|pihalle|pöydälle|tuolille)$',
    ),
  ],
  'time-questions': [
    target('qw-milloin-times', '^milloin ', '(?:huomenna|tänään|aamulla|illalla|nyt)$'),
    target(
      'qw-milloin-weekdays',
      '^milloin ',
      '(?:maanantaina|tiistaina|keskiviikkona|torstaina|perjantaina|lauantaina|sunnuntaina)$',
    ),
    target(
      'qw-clock-times',
      '^(?:mihin aikaan|milloin) ',
      'kello (?:yksi|kaksi|kolme|neljä|viisi|kuusi|seitsemän|kahdeksan|yhdeksän|kymmenen)$',
    ),
  ],
  'how-and-why-questions': [
    target('qw-manner', '^(?:miten|kuinka) ', '(?:hitaasti|hyvin|selvästi|nopeasti)$'),
    target(
      'qw-degree',
      '^(?:kuinka|miten) ',
      '(?:vuotta vanha|kilometriä(?: pitkä)?|sivua(?: pitkä)?|senttimetriä pitkä)$',
    ),
    target('qw-reasons', '^miksi ', '(?:^koska |^.+ koska )'),
  ],
  'description-colour-appearance-questions': [
    target(
      'qw-description-singular',
      '^(?:millainen|minkälainen) ',
      '(?:pieni|hyvä|uusi|suuri|ystävällinen|vanha)$',
      singular,
    ),
    target(
      'qw-description-plural',
      '^(?:millaisia|minkälaisia) ',
      '(?:pieniä|hyviä|uusia|suuria|ystävällisiä|vanhoja)$',
      plural,
    ),
    target(
      'qw-description-substance',
      '^(?:millaista|minkälaista) ',
      '(?:kuumaa|kylmää|makeaa|hyvää)$',
      singular,
    ),
    target(
      'qw-colour-singular',
      '^minkä ?värinen ',
      '(?:punainen|sininen|valkoinen|musta|vihreä|keltainen|ruskea)$',
      singular,
    ),
    target(
      'qw-colour-plural',
      '^minkä ?värisiä ',
      '(?:punaisia|sinisiä|valkoisia|mustia|vihreitä|keltaisia|ruskeita)$',
      plural,
    ),
    target(
      'qw-colour-substance',
      '^minkä ?väristä ',
      '(?:valkoista|ruskeaa|punaista|vihreää|keltaista|mustaa|sinistä)$',
      singular,
    ),
    target(
      'qw-appearance-singular',
      '^minkä ?näköinen ',
      '(?:korkea|pitkä|punainen|pieni|suuri|musta|pyöreä|ruskea|sininen|vihreä|valkoinen)$',
      singular,
    ),
    target(
      'qw-appearance-plural',
      '^minkä ?näköisiä ',
      '(?:korkeita|pitkiä|punaisia|pieniä|suuria|mustia|pyöreitä|ruskeita|sinisiä|vihreitä|valkoisia)$',
      plural,
    ),
  ],
  'nationality-questions': [
    target(
      'qw-nationality-singular',
      '^minkä ?maalainen ',
      '(?:suomalainen|ruotsalainen|virolainen|saksalainen)$',
      singular,
    ),
    target(
      'qw-nationality-plural',
      '^minkä ?maalaisia ',
      '(?:suomalaisia|ruotsalaisia|virolaisia|saksalaisia)$',
      plural,
    ),
  ],
  'negative-information-questions': [
    target(
      'qw-negative-olla-singular',
      '^(?:miksi|missä|milloin) (?:(?:minä|sinä|hän) )?(?:en|et|ei) ole(?: |$)',
      '\\b(?:olen|on|en ole|ei ole)\\b',
      onePerson,
    ),
    target(
      'qw-negative-olla-plural',
      '^(?:miksi|missä|milloin) (?:(?:me|te|he) )?(?:emme|ette|eivät) ole(?: |$)',
      '\\b(?:olemme|ovat|emme ole|eivät ole)\\b',
      people,
    ),
    target(
      'qw-negative-actions-singular',
      '^(?:miksi|mitä|milloin|mihin|minne) (?:(?:minä|sinä|hän) )?(?:en|et|ei) (?:tule|lue|juo|syö|mene|puhu)(?: |$)',
      '^koska |(?:^| )(?:en|ei) (?:tule|lue|juo|syö|mene|puhu)(?: |$)',
      onePerson,
    ),
    target(
      'qw-negative-actions-plural',
      '^(?:miksi|mitä|milloin|mihin|minne) (?:(?:me|te|he) )?(?:emme|ette|eivät) (?:tule|lue|juo|syö|mene|puhu)(?: |$)',
      '^koska |(?:^| )(?:emme|eivät) (?:tule|lue|juo|syö|mene|puhu)(?: |$)',
      people,
    ),
    target('qw-nobody', '^kuka ', '^(?:kukaan ei|ei kukaan) '),
    target('qw-nothing', '^mitä ', '\\b(?:en|ei|emme|eivät) .+ mitään$'),
    target('qw-correct-assumption', '^miksi ', '^(?!.*\\b(?:en|et|ei|emme|ette|eivät)\\b).+'),
  ],
};

# Question words and answers: audit corrections

## Scope and sources

2026-10-29. The user authorized fixes to the independent audit’s ten findings.
The original 30 packs and their 406 pack-owned JSON files remain outside the
editing boundary. The seven new packs advance to 1.1.0 because answer meanings,
mastery evidence and Review retrievals change. Materially revised lessons advance
to 1.0.1; the new plural classification lesson starts at 1.0.0.

Use the original [family assessment](question-words-family.md) as historical
blueprint evidence; its final approval predates the independent findings and is
superseded by this correction assessment. Original read-only audit artifacts are
retained under `client/tmp/independent-qw-audit/`; correction snapshots and exact
commands/results are retained under `client/tmp/question-words-fix/` (ignored).

Authoritative sources supporting the corrections:

- [Kotus: predicative case](https://kielitoimistonohjepankki.fi/ohje/predikatiivi-elama-on-ihanaa-lapset-ovat-iloisia-yleiskatsaus-sijamuodon-valintaan/):
  plural classification and ordinary plural partitive predicates.
- [Kielikello: koska and sillä](https://kielikello.fi/koska-ja-silla/):
  full main-clause/because replies and short because clauses.
- [Taste of Finnish: grammar](https://tasteoffinnish.fi/grammar/):
  optional first/second-person subject pronouns, negative conjugation and origin.
- [Kotus: compound or separate](https://kielitoimistonohjepankki.fi/ohje/yhdyssana-vai-ei-tamantyyppinen-vai-taman-tyyppinen/):
  natural minkä värinen / minkävärinen alternatives.

## Correction blueprint and pre-authoring decision

**Actual gate: approved with limitations, 2026-10-29, before bulk correction.**
Representative before/after previews for all ten classes were shown to the user.
The complete affected class includes every free-text alternative, the four negative
Focused tests’ reciprocal pairs, the missing full-reason model, plural classification,
all degree prompts, every lesson’s vocabulary declarations, both number validators,
all seven Reviews, generated negative options/diagnostics, and origin feedback.

Add one Focused plural classification lesson immediately after plural selection:
Mitä nämä/nuo/ne ovat? → Nämä/nuo/ne ovat kirjoja etc. Teach the classification
question and ordinary partitive-plural category reply; provide complete supporting
noun forms and negative phrase eivät ole. Distinguish selection, classification,
and closed-set identification without teaching a blanket olla/other-verb shortcut.
Prerequisite is plural selection, followed by action/object questions. Supply rather
than assess unfamiliar noun inflections; no comprehensive plural-case paradigm.

Planned inventory: 36 lessons, 36 Focused tests of 20 meaningful scored items,
seven Reviews with four retrievals per target (144), 864 total scored questions,
and three optional items per lesson (108). Plural classification uses recognition,
question/answer production, interpretation and misconception repair; additional
situations supply independent optional practice. Reviews interleave recognition,
interpretation, completion and production from previously taught targets.

The correction keeps one target per Focused step, complete English meanings before
Finnish production, full-sentence verb examples, controlled vocabulary (maximum ten
new lexical words), local prerequisite provenance and dedicated vocabulary lists.
Mastery partners must match the actual grammatical operation, response demand and
polarity, with different surfaces and intervening retrieval. Explicit authored
alternatives retain significant Finnish diacritics; no fuzzy grading is introduced.

All pre-authoring rubric criteria are satisfied by this bounded blueprint and the
inherited level/scope analysis. Limitations: written controlled grammar only; the
new plural examples cover ordinary open categories rather than every predicative
exception. Technical and rendered validation remain pending and cannot be inferred
from this approval.

## Final assessment

**Disposition: approved with limitations, 2026-10-29.** The ten findings are
resolved in the finished sources, actual grading and rendered workflows. Both the
pre-authoring correction gate and this final gate are approved with limitations.

### Final inventory

| Pack                               | Lessons / Focused tests | Review questions | Total scored | Optional | New / reused / supplied words |
| ---------------------------------- | ----------------------: | ---------------: | -----------: | -------: | ----------------------------: |
| Who and what                       |                       7 |               28 |          168 |       21 |                  13 / 11 / 78 |
| Place and direction                |                       6 |               24 |          144 |       18 |                  17 / 9 / 110 |
| Time                               |                       3 |               12 |           72 |        9 |                   13 / 2 / 54 |
| How and why                        |                       3 |               12 |           72 |        9 |                   16 / 1 / 52 |
| Description, colour and appearance |                       8 |               32 |          192 |       24 |                 20 / 23 / 105 |
| Nationality                        |                       2 |                8 |           48 |        6 |                    8 / 2 / 27 |
| Negative information               |                       7 |               28 |          168 |       21 |                  17 / 18 / 76 |
| **Family**                         |                  **36** |          **144** |      **864** |  **108** |            **104 / 66 / 502** |

Each Focused test contains 20 questions. The seven Reviews retrieve previously
taught targets four times each; none introduces a new target. The largest pack
has 192 scored items. The family has 443 worked examples and 100 teaching sections.
All 672 vocabulary declarations are individual words; there are no fixed-expression
exceptions. The maximum New words list is nine and the longest prompt is 34 words.

### Findings and complete affected classes

| Finding                          | Correction and evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Natural replies rejected         | Inventory all free-text answers, including optional practice. Add because-clause subjects, English contractions, sick/ill, nobody/no one, the/a house, full measurements, ordinary descriptive-question word order and Ei kukaan replies. Keep diacritics significant and word tiles constrained to their actual bank. The final actual-grader sweep covers 1,362 authored answers, 624 choices and 470 diagnostic answers. Independent regression candidates supplement those authored arrays.                                                                                                                |
| False mastery evidence           | Review all four negative Focused tests and all 432 family pairs: 360 Focused and 72 Review pairs. Pair actual question construction, short/full reasons, affirmative replies and negative replies with the same operation, format, repair demand and comparable difficulty. Preserve different surfaces, reciprocity and intervening retrieval. Sixteen negative-test models change to make balanced, meaningful pairs possible; the 20 original polarity mismatches are eliminated. The regression mutation preserves reciprocal links so that semantic rejection cannot be attributed to broken links alone. |
| Missing full reason reply        | Add a worked Olen kotona, koska olen sairas with complete translation, construction notes and comma placement. Add two scored full main-clause/because replies with each other as partners. Source and runtime guards accept the valid full pattern and reject removal of its teaching.                                                                                                                                                                                                                                                                                                                        |
| Missing plural classification    | Add qw-mita-plural-classification after plural selection: 20 Focused, four Review and three optional items, with 17 worked examples. Teach Mitä nämä/nuo/ne ovat, plural ovat, ordinary partitive-plural category replies, short replies, negative rejection and correction. Contrast selection and closed-set identification. Worked pronouns stand alone as subjects and mitä feedback describes classification explicitly.                                                                                                                                                                                  |
| Hidden measurement inflection    | Check all 13 typed degree-production prompts containing measurements. Supply vuotta, kilometriä, sivua and senttimetriä as complete forms before submission. Deriving these supporting inflections is not a new hidden requirement.                                                                                                                                                                                                                                                                                                                                                                            |
| Unclassified teaching vocabulary | Resolve all 42 inventoried omissions across 17 lessons, classify four nationality country names, and inventory every lesson’s examples and formation notes. Reconcile all 972 scored/optional recall lists independently with visible context and linked teaching: zero missing/unnecessary entries and zero prerequisite provenance gaps. Preserve meaningful noun/adjective variety; no convenient multiword bundles are relabelled as fixed expressions.                                                                                                                                                    |
| Weak number guards               | Both boundaries use independent bounded subject and finite-verb inventories alongside question/predicate form checks. Correct prefixes and tags cannot admit Minkä värisiä kynä on, kynät on, or kynä ovat. Validate examples, feedback and every Finnish alternative. Existing Partitive/Genitive and unknown-family rejection remain intact.                                                                                                                                                                                                                                                                 |
| Duplicate/weak Reviews           | Replace weekday and source-location question duplicates with actual weekday and inside/outside source retrievals. Interleave skills and response formats in two rounds. Each Review mixes recognition, completion, interpretation and production; nationality uses four suitable formats for its eight items. All 72 Review pairs are eligible and there are zero exact duplicate Review tasks.                                                                                                                                                                                                                |
| Generated wrong answers          | Audit 90 diagnostic/choice-bearing source items across the four negative targets and action/object questions, including their Reviews and optional practice. Correct all 12 negative MC items (24 wrong options); replace the remaining because-clause error inventories and standalone yes/no reply inventories. Errors keep the requested verb and context and demonstrate one plausible misconception. Correct capitalization in models, choices and diagnostics; finite because-clause verbs stay lowercase. Both boundaries reject the generated capitalization defect.                                   |
| Origin labelled identity         | Give every Suomesta, Ruotsista and Virosta complement its origin/source role in worked notes, scored feedback, Review and optional feedback. Retain the country base forms and elative formation; nationality predicates still express nationality.                                                                                                                                                                                                                                                                                                                                                            |

The ignored correction records contain complete per-ID inventories:
`answer-changes.json`, `corrected-error-inventory.json`, `reason-distractors.json`,
`object-distractors.json`, `mastery-review.json`, `recall-vocabulary.json`,
`grading-results.json`, `inventory.txt` and `preservation.json`.

### Final rubric evidence

The amended boundary is coherent for controlled written 0–A1.3 practice. Each
Focused lesson owns one question/answer relationship with an explicit local
prerequisite chain. The inserted classification step precedes action/object work;
its supplied plural noun forms do not claim to teach a complete plural paradigm.
Singular/plural and substance distinctions remain independently prepared. No
blanket olla/other-verb or exact/inexact shortcut is taught.

Complete English meanings precede Finnish production. Lesson sections retain their
separate jobs and the dedicated vocabulary area owns lexical lists. Worked examples
and feedback explain complete sentences, meanings, roles, bases and relevant forms;
new classification notes describe the current category decision rather than an
unrelated object rule. Supporting forms are visible before grading. Common errors
receive specific feedback and unmatched answers retain one general explanation.

All question recall lists and local reused-word provenance have been checked in
both directions. Grammar-only finite olla/negative-verb forms and mikään → mitään
remain assessed grammar; supporting nouns and adjectives are not hidden in grammar
metadata. Category stems and measurement inflections are supplied as whole forms.
No inherited word, noun context or useful contrast was deleted to meet a ceiling.

Parallel exercises have different surfaces and comparable response demands. Strict
pack alignment removes incompatible earlier mastery evidence. Optional practice
remains independent of scored attempts, mistakes and statistics. Corrective replies
to false negative assumptions remain distinct from negative confirmations.

Rendered records match all 36 lessons, 864 scored and 108 optional items at each
of 320/768/1440 pixels: 3,024 distinct item/lesson records, zero omitted fields,
missing IDs, extra IDs or page errors. All 2,016 vocabulary declaration appearances
match their Finnish/English source. Complete prompt, translation, sentence pattern,
word roles, base forms, formation notes and lesson construction steps are compared
against actual rendered text, with later corrected captures taking precedence.

## Technical validation

- Full final npm --prefix client run check: passed with 547 unit cases in 57 files,
  37 integration cases in eight files, all static/type/format/module checks,
  validation of all 37 source packs and the production build.
- An additional 34-case question-family unit run passes after making the semantic
  mastery mutation fully reciprocal; its assertions and original time limits remain.
- Source/runtime negative cases cover agreement despite a valid prefix, wrong
  feedback, absent answer/full-reason teaching, omitted formation vocabulary,
  short Focused tests, bad spacing/tiles, semantic pairs, weekday retrieval,
  capitalization and unknown families. No generic grading policy was loosened.
- All 406 original pack-owned files match both HEAD raw bytes and the pre-fix
  snapshot; six original groups and 30 original summaries are preserved. All
  493 deployed source files match authored bytes.
- Main browser run: 108 passed, 24 authored desktop-only skips, zero failures,
  at 320/768/1440. It covers all 51 question-family cases and the catalog. Split
  appearance/width matrices retain every assertion and unchanged time limits.
- Final content/section/loading/ledger run: 64 passed; three stale route assertions
  and two desktop multi-scenario timeouts were found. Correct the old four-lesson
  count/title to the preserved three-lesson preparation and split text scaling by
  font size while retaining every route, assertion and the original 120-second
  timeout. The subsequent complete 15-case route/text-size run passes at all widths
  and both appearances. A further 320-pixel catalog/map case also passes.
- Final native suite: 63 passed. All 13 new/changed diagnostic classes and seven
  pack-specific unmatched fallbacks render once at each width. Other diagnostic
  classes retain the original independent audit’s complete 180-case evidence.
  Pointer/Space/Enter actions and hit tests reach the last group after all six
  previous groups expand; the last long-example step remains reachable. Four
  incorrect optional MC submissions per width create no attempts, sessions or
  mistakes. Nine additional natural-answer submissions receive correct feedback.
- Ten fresh screenshots were visually inspected: group headers, long examples and
  plural classification at all three widths, plus optional incorrect feedback on
  mobile. Text wraps within its paper and the inspected controls/steps remain
  accessible. Rendered checks use the final production bundle.
- The full repository-wide Playwright suite was not rerun; the complete new-family
  inventory, affected catalog/lesson/feedback workflows, modified fixtures and the
  listed responsive/native cases were checked. Failed intermediate reports and
  traces remain available alongside their passing resolution runs.

Exact commands, raw reports, screenshots and retained failures are stored under
client/tmp/question-words-fix. The earlier targeted run caught a diagnostic identical
to its accepted answer; it was corrected before the passing full gate. The initial
read-only audit’s failures remain historical evidence, not current passing results.
No assertions were removed or weakened and no test timeout was increased.

## Compatibility and final decision

All seven family packs advance from 1.0.0 to 1.1.0. Twenty-eight materially revised
existing lessons advance to 1.0.1, seven unchanged lessons retain 1.0.0 and the new
classification lesson starts at 1.0.0. Existing strict alignment/backup handling
intentionally discards the seven packs’ old attempts, sessions, mistakes, corrections
and lesson completions. Still-owned notes and all original 30 packs’ state remain
compatible. Integration tests seed those data categories across all 37 packs and
verify installation, scoped discard, backup classification and retained notes.
No migration, fallback reader, legacy alias, storage schema change or service
requirement is introduced.

**Final decision: approved with limitations.** No high-impact finding or failed
affected check remains unresolved. Written grammar
practice does not certify general CEFR competence. Native browser zoom, screen
readers, physical devices, listening and speech are not assessed. No commit or
publication is authorized or performed.

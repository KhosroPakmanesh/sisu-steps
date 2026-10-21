# Partitive worked-example repetition — 2026-10-21

## Scope and inherited evidence

Scoped editorial correction under REQ-G001-152 and REQ-G001-136, requested after
the user identified a grammar key point repeated as the opening step of every
worked example. The complete source audit covers 169 lessons and 889 examples
across 30 registered packs; the affected class is 23 lessons and 96 examples in
four Partitive packs, all at level `0 - A1.3`.

Inherit the grammar sources, coverage, prerequisites, misconception map, lexical
provenance and question inventories from the [original family](partitive-family.md),
[expansion](partitive-expansion.md) and the individual
[quantities](partitive-quantities.md), [sentences](partitive-sentences.md),
[adjectives](partitive-adjectives.md) and
[pronouns/questions](partitive-pronouns-questions.md) records. No Finnish form,
translation, rule, exception, vocabulary item or scored demand is being authored
or revised, so no new linguistic research or grammar approval is claimed.

## Pre-authoring assessment

Disposition: **approved with limitations**, recorded before lesson edits on
2026-10-21. The user approved a representative before/after and authorized applying
the correction to the complete inventoried class.

Every affected example's first step is exactly a grammar paragraph or key point
in its owning lesson. Delete that first step and retain all remaining construction
notes unchanged. The general rule stays visible in grammar teaching; examples
start with their own words and forms. No example-specific contrast or exception
is removed. Every example retains at least two construction steps.

The existing one-target progression, person/form number scopes, prerequisites,
vocabulary ownership, recognition/production balance, misconceptions, Focused
coverage, cumulative Review boundary and question counts remain appropriate to
this unchanged teaching inventory. The four packs retain 23 Focused tests, four
Reviews, 620 scored questions and 69 optional items; no question is added as filler.
The vocabulary ledger remains 108 introduced, 103 reused and one supplied entry:
211 words and one fixed expression. The dedicated vocabulary area retains its
role. All sentence-specific meanings, roles, stems, endings, agreement and sound
changes remain. Existing written-practice and independent-review limitations
continue to apply.

This correction changes neither scored interpretation nor lesson-completion
meaning. The governing amendment explicitly retains all pack/lesson versions,
manifests, progress, completions, sessions and notes. Baseline source and inventory
evidence is saved in ignored `client/tmp/partitive-worked-example-repetition/`.

## Complete affected inventory

| Pack                         | Lesson IDs                                                                                                                                                                                                                             | Lessons | Examples |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------: | -------: |
| partitive-quantities         | `ptq-counting-singular`, `ptq-measure-singular`, `ptq-amount-singular`, `ptq-amount-plural`                                                                                                                                            |       4 |       16 |
| partitive-sentences          | `pts-amount-singular`, `pts-amount-plural`, `pts-languages-singular`, `pts-verbs-singular`, `pts-verbs-plural`, `pts-negative-singular`, `pts-negative-plural`, `pts-process-singular`, `pts-absence-singular`, `pts-existence-plural` |      10 |       40 |
| partitive-adjectives         | `pta-agreement-singular`, `pta-agreement-plural`, `pta-predicate-singular`, `pta-predicate-plural`                                                                                                                                     |       4 |       20 |
| partitive-pronouns-questions | `ptp-personal-singular`, `ptp-personal-plural`, `ptp-demonstrative-singular`, `ptp-demonstrative-plural`, `ptp-object-questions`                                                                                                       |       5 |       20 |

There are no exceptions within this class. Repeated word-specific formation or
role explanations elsewhere are outside the reported duplicate-opening-rule
class. The eight plural-predicate examples account for the total exceeding four
examples per lesson.

## Final assessment and technical validation

Disposition: **approved with limitations**, after source, client-gate and rendered
checks on 2026-10-21. All 23 lessons now start each worked example with its own
sentence-specific explanation. Exactly 96 duplicate opening steps are removed;
all 244 remaining construction steps, 96 Finnish examples and English meanings
are unchanged. The original rules remain in their grammar paragraphs/key points.
There are no exceptions or unresolved findings in this correction's scope.

The complete 407-file source snapshot comparison proves that only those 23
lesson files change and that each example's `steps` equals its original tail.
The other 384 content files are byte-identical, including manifests, startup
summaries, scored tests, all 26 unrelated packs and their lessons. Every other
property in the affected lessons is unchanged, including vocabulary, optional
questions, targets, prerequisite chains, common mistakes, IDs and versions.
The four packs retain the 23 Focused tests, four Reviews, 620 scored/69 optional
questions and 108 introduced/103 reused/one supplied lexical entries recorded
above. No new recall, grading, diagnostic or mastery-pair requirement is created.

Completed checks:

- `npm --prefix client run check` passes under the existing cached Node 24.19.0
  runtime with process-local `VITEST_MAX_WORKERS=2`: lint/CSS, 17 module-checker
  regressions, module size, reachability, architecture, repository formatting,
  application/test type checks, all 30 direct-source pack validations, production
  build, **513 unit tests and 35 integration tests**. No configuration is changed.
- All 407 deployed content files match their current authored sources byte for
  byte. An ad hoc Playwright inspection of every affected lesson at
  320/768/1440 pixels passes **69 lesson reads, 288 example checks and 732
  construction-step checks**. Each card's exact Finnish, English and ordered steps
  match its source; the removed rule is absent from worked examples and present
  in grammar teaching. There are no page errors or horizontal overflow.
- Four representative mobile/desktop captures of the reported personal-pronoun
  example and the expanded plural-adjective example were visually inspected.
  The word-level teaching remains readable and numbering starts at its first
  retained construction step. Existing grammar-reference summaries contain only
  Finnish/English example labels and are unaffected by this step-only correction.
- Local documentation links resolve, and `git diff --check` passes. Logs,
  snapshot/preservation reports, rendered inventory and captures are retained in
  ignored `client/tmp/partitive-worked-example-repetition/`.

Both scoped assessment gates are approved with limitations. This editorial
approval inherits the earlier Finnish teaching and vocabulary judgments; it does
not re-certify unchanged exercises, grading alternatives, diagnostics, mastery
pairs, lexical recall or general CEFR proficiency. Full unrelated browser
coverage, physical-device testing, new linguistic research, independent teacher
review and learner trials were not performed. Pack/lesson versions and learner
data remain compatible. No commit or publication was performed.

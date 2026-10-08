# Grammar forms in lesson vocabulary: scoped assessment

This record retains dated pre-correction inventories and subsequent resolutions. Following the 2026-10-05 demonstrative merge, lesson links below point to their current owning folder while labels and original findings remain unchanged; [the merge assessment](demonstrative-pronouns.md) records source preservation.
Date: 2026-10-04.

The inventory and per-lesson judgments below describe the pre-correction source. The implementation assessment at the end records the follow-up correction under REQ-G001-141.

## Request and scope

Assess the user's concern that key grammar forms, such as `minulla`, `sinulla`, `hänellä`, `meillä`, `teillä`, and `heillä`, should be taught as grammar rather than listed in the lesson's Words area. This is an assessment of all installed lessons, not an implementation of a new exclusion rule.

The source inventory covers all **15 catalog packs, 72 lessons, and 873 lesson vocabulary declarations**: 316 introduced, 424 reused, and 133 supplied entries. It also checks the pack manifests, sentence-breakdown surface/base relationships in all scored and optional exercises, the lesson renderer, and both vocabulary-validation boundaries.

## Decision

Disposition: **revision required** for consistent separation of grammar forms and lexical vocabulary.

The user's intended separation is right. The six highlighted forms are personal-pronoun forms already represented by `minä`, `sinä`, `hän`, `me`, `te`, and `he` in the negative-possession pack's `grammarBaseForms`. Their meanings and use should remain visible in grammar teaching and worked examples, without presenting them as standalone lexical vocabulary.

The assumption that `grammarBaseForms` already controls the Words area is incorrect. It is pack-level authoring metadata for the direct-source exercise recall audit, not a rendered lesson section or a UI exclusion rule. Lesson vocabulary is independently authored in `introducedVocabulary`, `reusedVocabulary`, and `suppliedVocabulary`; the template renders each array directly. Adding a base form to the manifest does not remove its surface forms from these arrays.

The existing contract has a gap: `REQ-G001-122` explicitly exempts target personal pronouns from vocabulary counting, while `REQ-G001-133` distinguishes grammar from lexical recall in exercise metadata. Neither establishes a general prohibition on displaying every pack-declared grammar form in the three lesson vocabulary arrays. The broad correction recommended here follows the user's requested separation; it should be stated explicitly in the governing requirements before implementation.

## Findings and counts

- **36 lessons contain 150 entries** that match their pack's declared grammar base forms, either directly or through authored sentence-breakdown inflections.
- Of these, **35 lessons contain 149 clear grammar-form entries** that should move out of the standalone vocabulary declarations under the requested separation. These cover demonstratives, interrogatives, personal pronouns, affirmative and negative `olla` forms, and possessors.
- The remaining overlap is `kyllä — yes` in `ppo-written-short-answers`. It needs an explicit classification decision. It is a meaningful lexical answer particle, so its word class alone does not prove that its vocabulary card is wrong. Currently it is simultaneously introduced as vocabulary and exempted as grammar in the manifest; no exercise vocabulary array lists it.
- An additional lesson, `plural-sentences`, explicitly teaches `Plural subject + ovat` but declares `olla`, `ovat`, and contrastive `on` as new vocabulary. The pack only declares `he` in `grammarBaseForms`. This is a missing-metadata case, which a check using the current grammar list alone would miss. Across this pack's scored and optional exercises, 35 items list both `olla` and `ovat` in lexical-recall metadata.
- Together, **36 lessons require revision**, covering **152 candidate grammar entries**; **one lesson needs the `kyllä` classification decision**, and **35 lessons have no finding for this specific separation check**. These categories cover all 72 lessons. The 152 entries include the 149 declared-grammar overlaps plus the three plural-sentence declarations.
- No exercise vocabulary array overlaps a grammar form recognized from its own pack's existing declaration and authored sentence parts. That observation does not certify complete exercise vocabulary correctness: the omitted `olla` declaration above demonstrates the limit.

The screenshot's lesson, `nps-fixed-negative`, includes all six highlighted possessors in `suppliedVocabulary`. The same six appear in every lesson of negative possession, possession questions, and negative possession questions: **54 supplied grammar-form entries across nine lessons**. The earlier section-responsibility correction preserved these declarations while removing duplicate lexical lists from grammar sections. Its approval was scoped to section layout and preservation, not to excluding grammar forms from the vocabulary area.

## Correct lexical and contextual exceptions

Keep supporting lexical items such as `pallo`, `kirja`, `auto`, `kynä`, `kissa`, `koira`, `tyyny`, and `peli` classified as vocabulary. Grammar forms can remain fully explained beside the sentences and transformations that teach them.

Do not apply a universal pronoun or verb ban. A verb can be supporting lexical vocabulary when its meaning is not the grammar target; a demonstrative can be supplied or introduced context in a lesson about a different construction. For example, `tämä` is contextual vocabulary in the possessive-ending pack, whose manifest does not classify it as assessed grammar.

Likewise, a supporting noun's supplied inflected form is not automatically the same problem as a grammar-only pronoun. `palloa` and `kirjaa` name ordinary lexical items; their complete forms may be supplied when deriving the partitive is outside the current target. Supplied forms such as `palloni` in the owner-form lesson support grammar that is taught later. This assessment does not propose deleting them indiscriminately or replacing contextual meanings with hidden prerequisites.

The location-sentence lesson teaches inessive locations and uses `on` as a supporting supplied verb, so it is not counted as an assessed-grammar overlap here. Its exercise lexical-recall metadata may warrant a separate supply audit; this report does not approve all unrelated vocabulary decisions.

## Per-pack inventory

| Pack                                 | Lessons | Declared-grammar overlap: lessons / entries | Additional finding                                                                          |
| ------------------------------------ | ------: | ------------------------------------------: | ------------------------------------------------------------------------------------------- |
| `vowel-harmony-location-endings`     |       4 |                                       0 / 0 | —                                                                                           |
| `kpt-singular-forms`                 |       8 |                                       0 / 0 | —                                                                                           |
| `t-plural-agreement`                 |       6 |                                       0 / 0 | One additional target-grammar lesson: olla / ovat / on; olla absent from manifest           |
| `personal-pronouns-affirmative-olla` |       7 |                                       0 / 0 | —                                                                                           |
| `negative-olla-statements`           |       3 |                                       0 / 0 | —                                                                                           |
| `olla-questions-short-answers`       |       5 |                                       1 / 1 | The single overlap is kyllä; classification review                                          |
| `singular-demonstrative-pronouns`    |       5 |                                      5 / 19 | —                                                                                           |
| `plural-demonstrative-pronouns`      |       6 |                                      6 / 23 | —                                                                                           |
| `negative-demonstrative-statements`  |       3 |                                      3 / 19 | —                                                                                           |
| `demonstrative-questions`            |       6 |                                      6 / 28 | —                                                                                           |
| `affirmative-possession`             |       3 |                                       3 / 3 | —                                                                                           |
| `negative-possession`                |       3 |                                      3 / 18 | —                                                                                           |
| `possession-questions`               |       3 |                                      3 / 18 | —                                                                                           |
| `negative-possession-questions`      |       3 |                                      3 / 18 | —                                                                                           |
| `possessive-pronouns-endings`        |       7 |                                       3 / 3 | Four lessons have no grammar-only overlap; contextual tämä and supplied noun forms retained |

## Every lesson: scoped judgment

“Revise” means that grammar-only entries should leave the vocabulary declarations under the user's requested separation. “Review” identifies the lexical-particle policy decision. “No finding” concerns only this audit; it does not certify the lesson's complete pedagogy.

| Lesson source                                                                                                                       | Judgment   | Entries and reason                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`vowel-harmony-basics`](../../client/content/vowel-harmony-location-endings/lessons/vowel-harmony-basics.json)                     | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`neutral-vowel-harmony`](../../client/content/vowel-harmony-location-endings/lessons/neutral-vowel-harmony.json)                   | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`inside-ending`](../../client/content/vowel-harmony-location-endings/lessons/inside-ending.json)                                   | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`inessive-location-sentences`](../../client/content/vowel-harmony-location-endings/lessons/inessive-location-sentences.json)       | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`strong-weak-kpt-grades`](../../client/content/kpt-singular-forms/lessons/strong-weak-kpt-grades.json)                             | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`kpt-doubles`](../../client/content/kpt-singular-forms/lessons/kpt-doubles.json)                                                   | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`kpt-singles`](../../client/content/kpt-singular-forms/lessons/kpt-singles.json)                                                   | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`kpt-special-k`](../../client/content/kpt-singular-forms/lessons/kpt-special-k.json)                                               | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`kpt-clusters`](../../client/content/kpt-singular-forms/lessons/kpt-clusters.json)                                                 | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`kpt-basics`](../../client/content/kpt-singular-forms/lessons/kpt-basics.json)                                                     | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`genitive-nouns`](../../client/content/kpt-singular-forms/lessons/genitive-nouns.json)                                             | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`verb-kpt`](../../client/content/kpt-singular-forms/lessons/verb-kpt.json)                                                         | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`t-plural-recognition`](../../client/content/t-plural-agreement/lessons/t-plural-recognition.json)                                 | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`t-plural-basics`](../../client/content/t-plural-agreement/lessons/t-plural-basics.json)                                           | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`kpt-t-plural-recognition`](../../client/content/t-plural-agreement/lessons/kpt-t-plural-recognition.json)                         | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`kpt-t-plural`](../../client/content/t-plural-agreement/lessons/kpt-t-plural.json)                                                 | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`he-verbs`](../../client/content/t-plural-agreement/lessons/he-verbs.json)                                                         | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`plural-sentences`](../../client/content/t-plural-agreement/lessons/plural-sentences.json)                                         | Revise     | New words: `olla`, `ovat`, `on`; explicit plural-verb target and singular contrast, but `olla` is absent from grammarBaseForms. |
| [`ppo-singular-pronouns`](../../client/content/personal-pronouns-affirmative-olla/lessons/ppo-singular-pronouns.json)               | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-plural-pronouns`](../../client/content/personal-pronouns-affirmative-olla/lessons/ppo-plural-pronouns.json)                   | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-written-reference`](../../client/content/personal-pronouns-affirmative-olla/lessons/ppo-written-reference.json)               | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-singular-affirmative`](../../client/content/personal-pronouns-affirmative-olla/lessons/ppo-singular-affirmative.json)         | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-plural-affirmative`](../../client/content/personal-pronouns-affirmative-olla/lessons/ppo-plural-affirmative.json)             | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-affirmative-agreement`](../../client/content/personal-pronouns-affirmative-olla/lessons/ppo-affirmative-agreement.json)       | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-pronoun-presence`](../../client/content/personal-pronouns-affirmative-olla/lessons/ppo-pronoun-presence.json)                 | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-singular-negative`](../../client/content/negative-olla-statements/lessons/ppo-singular-negative.json)                         | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-plural-negative`](../../client/content/negative-olla-statements/lessons/ppo-plural-negative.json)                             | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-negative-transformations`](../../client/content/negative-olla-statements/lessons/ppo-negative-transformations.json)           | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-singular-positive-questions`](../../client/content/olla-questions-short-answers/lessons/ppo-singular-positive-questions.json) | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-plural-positive-questions`](../../client/content/olla-questions-short-answers/lessons/ppo-plural-positive-questions.json)     | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-singular-negative-questions`](../../client/content/olla-questions-short-answers/lessons/ppo-singular-negative-questions.json) | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-plural-negative-questions`](../../client/content/olla-questions-short-answers/lessons/ppo-plural-negative-questions.json)     | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppo-written-short-answers`](../../client/content/olla-questions-short-answers/lessons/ppo-written-short-answers.json)             | Review     | New words: `kyllä`; ordinary “yes” particle also exempted by grammarBaseForms.                                                  |
| [`sdp-singular-forms`](../../client/content/demonstrative-pronouns/lessons/sdp-singular-forms.json)                                 | Revise     | New words: `tämä`, `tuo`, `se`, `on`                                                                                            |
| [`sdp-reference-choice`](../../client/content/demonstrative-pronouns/lessons/sdp-reference-choice.json)                             | Revise     | Used again: `tämä`, `tuo`, `se`, `on`                                                                                           |
| [`sdp-independent-use`](../../client/content/demonstrative-pronouns/lessons/sdp-independent-use.json)                               | Revise     | Used again: `tämä`, `tuo`, `se`, `on`                                                                                           |
| [`sdp-noun-modifier`](../../client/content/demonstrative-pronouns/lessons/sdp-noun-modifier.json)                                   | Revise     | Used again: `tämä`, `tuo`, `se`, `on`                                                                                           |
| [`sdp-se-han`](../../client/content/demonstrative-pronouns/lessons/sdp-se-han.json)                                                 | Revise     | New words: `hän`; Used again: `se`, `on`                                                                                        |
| [`pdp-plural-forms`](../../client/content/demonstrative-pronouns/lessons/pdp-plural-forms.json)                                     | Revise     | New words: `nämä`, `nuo`, `ne`, `ovat`                                                                                          |
| [`pdp-reference-choice`](../../client/content/demonstrative-pronouns/lessons/pdp-reference-choice.json)                             | Revise     | Used again: `nämä`, `nuo`, `ne`, `ovat`                                                                                         |
| [`pdp-independent-use`](../../client/content/demonstrative-pronouns/lessons/pdp-independent-use.json)                               | Revise     | Used again: `nämä`, `nuo`, `ne`, `ovat`                                                                                         |
| [`pdp-noun-modifier`](../../client/content/demonstrative-pronouns/lessons/pdp-noun-modifier.json)                                   | Revise     | Used again: `nämä`, `nuo`, `ne`, `ovat`                                                                                         |
| [`pdp-number-agreement`](../../client/content/demonstrative-pronouns/lessons/pdp-number-agreement.json)                             | Revise     | Used again: `nämä`, `nuo`, `ne`, `ovat`                                                                                         |
| [`pdp-ne-he`](../../client/content/demonstrative-pronouns/lessons/pdp-ne-he.json)                                                   | Revise     | New words: `he`; Used again: `ne`, `ovat`                                                                                       |
| [`nds-singular-negative`](../../client/content/negative-demonstrative-statements/lessons/nds-singular-negative.json)                | Revise     | New words: `tämä`, `tuo`, `se`, `ei`, `ole`                                                                                     |
| [`nds-plural-negative`](../../client/content/negative-demonstrative-statements/lessons/nds-plural-negative.json)                    | Revise     | New words: `nämä`, `nuo`, `ne`, `eivät`; Used again: `ole`                                                                      |
| [`nds-negative-transformation`](../../client/content/negative-demonstrative-statements/lessons/nds-negative-transformation.json)    | Revise     | Used again: `tämä`, `tuo`, `se`, `nämä`, `nuo`, `ne`, `ei`, `eivät`, `ole`                                                      |
| [`dqs-what-singular`](../../client/content/demonstrative-questions/lessons/dqs-what-singular.json)                                  | Revise     | New words: `mikä`, `tämä`, `tuo`, `se`, `on`                                                                                    |
| [`dqs-what-plural`](../../client/content/demonstrative-questions/lessons/dqs-what-plural.json)                                      | Revise     | New words: `mitä`, `nämä`, `nuo`, `ne`, `ovat`                                                                                  |
| [`dqs-yesno-singular`](../../client/content/demonstrative-questions/lessons/dqs-yesno-singular.json)                                | Revise     | New words: `onko`; Used again: `tämä`, `tuo`, `se`                                                                              |
| [`dqs-yesno-plural`](../../client/content/demonstrative-questions/lessons/dqs-yesno-plural.json)                                    | Revise     | New words: `ovatko`; Used again: `nämä`, `nuo`, `ne`                                                                            |
| [`dqs-negative-singular`](../../client/content/demonstrative-questions/lessons/dqs-negative-singular.json)                          | Revise     | New words: `eikö`, `ole`; Used again: `tämä`, `tuo`, `se`                                                                       |
| [`dqs-negative-plural`](../../client/content/demonstrative-questions/lessons/dqs-negative-plural.json)                              | Revise     | New words: `eivätkö`; Used again: `nämä`, `nuo`, `ne`, `ole`                                                                    |
| [`aps-possessors`](../../client/content/affirmative-possession/lessons/aps-possessors.json)                                         | Revise     | Supplied in examples: `on`                                                                                                      |
| [`aps-fixed-on`](../../client/content/affirmative-possession/lessons/aps-fixed-on.json)                                             | Revise     | Supplied in examples: `on`                                                                                                      |
| [`aps-sentences`](../../client/content/affirmative-possession/lessons/aps-sentences.json)                                           | Revise     | Supplied in examples: `on`                                                                                                      |
| [`nps-fixed-negative`](../../client/content/negative-possession/lessons/nps-fixed-negative.json)                                    | Revise     | Supplied in examples: `minulla`, `sinulla`, `hänellä`, `meillä`, `teillä`, `heillä`                                             |
| [`nps-partitive`](../../client/content/negative-possession/lessons/nps-partitive.json)                                              | Revise     | Supplied in examples: `minulla`, `sinulla`, `hänellä`, `meillä`, `teillä`, `heillä`                                             |
| [`nps-sentences`](../../client/content/negative-possession/lessons/nps-sentences.json)                                              | Revise     | Supplied in examples: `minulla`, `sinulla`, `hänellä`, `meillä`, `teillä`, `heillä`                                             |
| [`pqs-onko`](../../client/content/possession-questions/lessons/pqs-onko.json)                                                       | Revise     | Supplied in examples: `minulla`, `sinulla`, `hänellä`, `meillä`, `teillä`, `heillä`                                             |
| [`pqs-short-answers`](../../client/content/possession-questions/lessons/pqs-short-answers.json)                                     | Revise     | Supplied in examples: `minulla`, `sinulla`, `hänellä`, `meillä`, `teillä`, `heillä`                                             |
| [`pqs-word-order`](../../client/content/possession-questions/lessons/pqs-word-order.json)                                           | Revise     | Supplied in examples: `minulla`, `sinulla`, `hänellä`, `meillä`, `teillä`, `heillä`                                             |
| [`npq-eiko`](../../client/content/negative-possession-questions/lessons/npq-eiko.json)                                              | Revise     | Supplied in examples: `minulla`, `sinulla`, `hänellä`, `meillä`, `teillä`, `heillä`                                             |
| [`npq-short-answers`](../../client/content/negative-possession-questions/lessons/npq-short-answers.json)                            | Revise     | Supplied in examples: `minulla`, `sinulla`, `hänellä`, `meillä`, `teillä`, `heillä`                                             |
| [`npq-word-order`](../../client/content/negative-possession-questions/lessons/npq-word-order.json)                                  | Revise     | Supplied in examples: `minulla`, `sinulla`, `hänellä`, `meillä`, `teillä`, `heillä`                                             |
| [`ppe-owner-forms`](../../client/content/possessive-pronouns-endings/lessons/ppe-owner-forms.json)                                  | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppe-personal-endings`](../../client/content/possessive-pronouns-endings/lessons/ppe-personal-endings.json)                        | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppe-third-person`](../../client/content/possessive-pronouns-endings/lessons/ppe-third-person.json)                                | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppe-harmony`](../../client/content/possessive-pronouns-endings/lessons/ppe-harmony.json)                                          | No finding | No grammar-only vocabulary overlap identified for this lesson's target.                                                         |
| [`ppe-sentences`](../../client/content/possessive-pronouns-endings/lessons/ppe-sentences.json)                                      | Revise     | Supplied in examples: `on`                                                                                                      |
| [`ppe-pronoun-omission`](../../client/content/possessive-pronouns-endings/lessons/ppe-pronoun-omission.json)                        | Revise     | Supplied in examples: `on`                                                                                                      |
| [`ppe-whose`](../../client/content/possessive-pronouns-endings/lessons/ppe-whose.json)                                              | Revise     | Supplied in examples: `on`                                                                                                      |

## Implementation boundary

A correction should preserve grammar explanations, all six owners, contextual translations, useful lexical variety, question IDs, and existing authored order. Clarify the vocabulary exclusion rule in `REQ-G001-122` / `133`, then remove the affected grammar entries from the three vocabulary arrays and correct genuinely missing grammar metadata. Decide whether `kyllä` is lexical vocabulary or a grammatical answer element consistently.

Validation needs to reject contradictory grammar/vocabulary declarations and recognize authored inflected forms, rather than checking only exact equality between `minulla` and `minä`. Keep runtime and direct-source rules equivalent and preserve visibility of contextual meanings. Do not infer that adding more forms to the manifest alone fixes the rendered page. If exercise recall interpretation changes, apply the existing pack-version and scoped progress-reset contract; this assessment makes no such change.

## Evidence and validation

- [REQ-G001-122](../features/G001-local-finnish-exercise-book/requirements.md): lesson vocabulary categories and the target-personal-pronoun exception.
- [REQ-G001-133](../features/G001-local-finnish-exercise-book/requirements.md): pack-declared grammar base forms for exercise recall validation.
- [REQ-G001-136 and authoring responsibilities](../content-authoring.md): grammar paradigms and contextual transformations belong in teaching; vocabulary owns standalone lexical lists.
- [Reported lesson declarations](../../client/content/negative-possession/lessons/nps-fixed-negative.json) and [its manifest](../../client/content/negative-possession/pack.json): supplied possessors coexist with their grammar bases.
- [Lesson renderer](../../client/src/features/learning/lessons/reader/lesson.page.html): renders all three vocabulary arrays without a grammar filter.
- [Direct-source recall check](../../client/tools/content-validation/shared/content-quality.mjs) and [pack validation](../../client/tools/content-validation/shared/pack-content.validator.mjs): grammarBaseForms is used for exercise coverage, not lesson-vocabulary exclusion.
- [Runtime vocabulary validation](../../client/src/features/learning/shared/content/validation/lesson-vocabulary.validator.ts) and [lesson validation](../../client/src/features/learning/shared/content/validation/lesson.validator.ts): enforce provenance, types, duplicates, and visibility, but not the proposed grammar-only exclusion.
- [Earlier section-responsibility assessment](lesson-section-responsibilities.md): explicitly preserved vocabulary declarations during its narrower correction.
- `npm --prefix client run content:validate` passed on 2026-10-04 for all 15 packs, 72 lessons, 2,154 scored exercises, and 263 optional-practice items. Passing confirms the current schema and guards, not this proposed separation.

## Limitations

This is a complete source assessment for the requested grammar/vocabulary separation, supported by the attached screenshot and the direct rendering path. No new all-lesson browser run or independent Finnish-teacher review was performed. Sentence surface/base relationships come from the authored explanations and were supplemented by reviewing every lesson vocabulary inventory and the missing plural-verb case. The audit does not claim a full lexical-recall, translation, grading, or CEFR assessment.

At the initial audit handoff, only this assessment and the changelog record were added; lessons, application code, requirements, versions, and learner data were unchanged. The follow-up below implements the subsequent correction request.

## Follow-up: pre-correction assessment

Disposition: **approved** for the scoped metadata correction requested after this audit.

Remove the 152 grammar declarations identified for revision, classify the question packs' optional `kyllä` consistently as a taught answer element, and remove its three vocabulary declarations. Add `olla` to the T-plural grammar bases and `kyllä` to both possession-question manifests. Preserve supporting lexical vocabulary, all grammar teaching, examples, question variety, and every scoring definition. Expected scope: 155 vocabulary declarations across 37 lessons, plus 70 grammatical exercise-vocabulary references across 35 T-plural items. Advance those lesson patch versions only.

The main risks are losing visible meanings, deleting supporting lexemes merely because their word class is grammatical, or using an exact-base comparison that misses `minulla`. Preserve teaching verbatim and derive inflected surfaces from aligned authored sentence parts in both validators. Runtime loading must retain the existing grammar metadata. Before handoff, compare every source item with the pre-correction snapshot, validate all packs, exercise negative mutations through both boundaries, and render every lesson. Pack versions and scored history stay intact; only obsolete revised-lesson completion marks require renewal.

## Follow-up: final correction assessment

Disposition: **approved with limitations** for the grammar/vocabulary correction under `REQ-G001-141`.

All 72 lessons now respect the declared grammar/lexical boundary. Removed 155 declarations from 37 lessons: 38 introduced, 55 reused, and 62 supplied grammar entries. The lexical ledger now contains **718 entries: 278 introduced, 369 reused, and 71 supplied**, all still typed `word`. Every retained supporting entry preserves its Finnish, English meaning, type, and order; no fixed expression was introduced or removed.

The three question/short-answer packs treat `kyllä` consistently as the taught optional affirmative answer element. Its meaning remains visible in grammar and worked examples, and its three vocabulary cards are removed. The T-plural pack declares `olla` as grammar; 70 `olla` / `ovat` recall references are removed from **32 scored and three optional questions**. The contrastive `on` card is removed through the manual lesson inventory: its grammatical relationship appears in teaching prose rather than aligned sentence parts.

The complete comparison against a temporary pre-edit source snapshot confirms that all **2,154 scored and 263 optional definitions** preserve IDs, prompts, answers, options/feedback, tokens, skills, diagnostics, mastery links, and order, with only the stated lexical metadata changing. All 72 lessons preserve grammar sections, objectives, worked examples and their steps, common mistakes, and prerequisite structure. All pack versions are unchanged. Exactly 37 lesson patch versions and their matching manifest summaries advance; compatible scored history and notes remain intact, while their obsolete completion marks require renewal under existing alignment.

Runtime manifest validation, catalog-summary mapping, and pack assembly now retain and require `grammarBaseForms`. Equivalent runtime and standalone guards reject grammar bases and explicitly aligned inflected forms in all vocabulary categories and exercise arrays. Negative tests cover the reported supplied possessor, each lesson category, scored/optional recall, malformed metadata, and mixed grammar/lexical sentence parts. Positive regressions retain supporting verbs, nouns, contextual pronouns, and supplied noun forms.

### Corrected lesson versions

| Lesson                        | Previous version | Current version | Removed grammar entries |
| ----------------------------- | ---------------- | --------------- | ----------------------: |
| `plural-sentences`            | 6.2.0            | 6.2.1           |                       3 |
| `ppo-written-short-answers`   | 1.2.0            | 1.2.1           |                       1 |
| `sdp-singular-forms`          | 1.0.0            | 1.0.1           |                       4 |
| `sdp-reference-choice`        | 1.0.0            | 1.0.1           |                       4 |
| `sdp-independent-use`         | 1.0.0            | 1.0.1           |                       4 |
| `sdp-noun-modifier`           | 1.1.0            | 1.1.1           |                       4 |
| `sdp-se-han`                  | 1.0.0            | 1.0.1           |                       3 |
| `pdp-plural-forms`            | 1.0.0            | 1.0.1           |                       4 |
| `pdp-reference-choice`        | 1.0.0            | 1.0.1           |                       4 |
| `pdp-independent-use`         | 1.0.0            | 1.0.1           |                       4 |
| `pdp-noun-modifier`           | 1.1.0            | 1.1.1           |                       4 |
| `pdp-number-agreement`        | 1.1.0            | 1.1.1           |                       4 |
| `pdp-ne-he`                   | 1.0.0            | 1.0.1           |                       3 |
| `nds-singular-negative`       | 1.1.0            | 1.1.1           |                       5 |
| `nds-plural-negative`         | 1.1.0            | 1.1.1           |                       5 |
| `nds-negative-transformation` | 1.1.0            | 1.1.1           |                       9 |
| `dqs-what-singular`           | 1.1.0            | 1.1.1           |                       5 |
| `dqs-what-plural`             | 1.1.0            | 1.1.1           |                       5 |
| `dqs-yesno-singular`          | 1.1.0            | 1.1.1           |                       4 |
| `dqs-yesno-plural`            | 1.1.0            | 1.1.1           |                       4 |
| `dqs-negative-singular`       | 1.1.0            | 1.1.1           |                       5 |
| `dqs-negative-plural`         | 1.1.0            | 1.1.1           |                       5 |
| `aps-possessors`              | 1.1.2            | 1.1.3           |                       1 |
| `aps-fixed-on`                | 1.1.2            | 1.1.3           |                       1 |
| `aps-sentences`               | 1.2.3            | 1.2.4           |                       1 |
| `nps-fixed-negative`          | 1.1.2            | 1.1.3           |                       6 |
| `nps-partitive`               | 1.1.2            | 1.1.3           |                       6 |
| `nps-sentences`               | 1.2.3            | 1.2.4           |                       6 |
| `pqs-onko`                    | 1.2.2            | 1.2.3           |                       6 |
| `pqs-short-answers`           | 1.1.2            | 1.1.3           |                       7 |
| `pqs-word-order`              | 1.1.3            | 1.1.4           |                       6 |
| `npq-eiko`                    | 1.1.2            | 1.1.3           |                       6 |
| `npq-short-answers`           | 1.1.2            | 1.1.3           |                       7 |
| `npq-word-order`              | 1.1.3            | 1.1.4           |                       6 |
| `ppe-sentences`               | 1.1.2            | 1.1.3           |                       1 |
| `ppe-pronoun-omission`        | 1.1.2            | 1.1.3           |                       1 |
| `ppe-whose`                   | 1.1.2            | 1.1.3           |                       1 |

### Final validation evidence

- `npm --prefix client run check` passed static, formatting, architecture, content, type, and production-build checks, **315 unit tests and 17 integration tests**. Existing lesson-version alignment tests preserve attempts, sessions, mistakes, mastery, notes, and compatible completions while discarding obsolete revised-lesson completion marks.
- The all-lesson and content-loading Playwright run passed **21 cases** at 320, 768, and 1440 pixels. It checks all **216 rendered lesson views**, their exact lexical declarations, preserved grammar and every example/step, and viewport containment. The reported possessors are absent from vocabulary cards but remain in teaching. Phone/tablet/desktop screenshots and per-project rendered inventories are in ignored `client/test-results/`; tablet and desktop screenshots were visually inspected.
- Related modal/vocabulary and unfinished-session recovery checks passed **nine cases**. The focused T-plural Study regression passed **three cases**, confirming lexical-only Cheat mode, an unchanged question after dismissal, correct grading, and retained `olla` / `ovat` grammar feedback. This totals **33 distinct browser cases across targeted runs**. The additional test's text-comparison assertion was corrected to use rendered text; it required no app change.
- Final document formatting, local-link checks, and scoped diff review pass. No commit or deployment was created.

Limitations: automatic exclusion recognizes declared bases and surfaces explicitly related by aligned authored sentence parts. A newly authored non-sentence form, prose-only relationship such as the reviewed singular `on` contrast, or omitted grammar base still requires the manual inventory. No general Finnish inflection guesser or universal word-class ban is added. This is a scoped metadata and rendered-content assessment, not independent teacher review, CEFR certification, or a new full audit of every lexical-recall judgment.

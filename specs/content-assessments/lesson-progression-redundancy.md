# Lesson progression and repetition assessment

Assessment date: **2026-10-03**. Scope: every pack registered in the current working-tree [catalog](../../client/content/index.json), including the pending ownership content. Level: `0 - A1.3`. Request: assess lessons that repeat earlier teaching and whether they can be removed.

**Disposition: revision required for lesson progression.** Fifteen of the 72 standalone teaching lessons are candidates for consolidation: nine merges and six conversions to Review practice. The proposed teaching inventory would contain 57 lessons while retaining the grammatical coverage. This is a recommendation, not an implemented or approved replacement blueprint. The finding does not withdraw approval of unrelated grammar or grading corrections.

## Scoped follow-up — 2026-10-04

The inventory below records the original progression recommendations. The user reversed the four ownership conversions to Review; those steps retain Focused stages and original skill labels, with shorter explanations and specific mistake guidance kept. The current catalog contains 72 Focused lessons/tests, 21 Review tests and 2,154 scored exercises. All fifteen consolidation recommendations remain advisory and unimplemented in the current content. See the [ownership consistency assessment](ownership-consistency.md) for the selective reversal and retained corrections.

## Scope and evidence

Read every lesson's actual grammar sections, key points, worked examples, common mistakes, targets, and prerequisites; compare each with earlier teaching in its pack. Inventory all test-to-lesson references and all 2,154 scored exercises. Inspect response demands in the affected tests, including supplied forms, sentence construction, recognition, translation, and error repair. The inventory includes 263 optional exercises; this assessment does not individually regrade all optional or scored answers.

The screenshot shows **test cards**, each linking to its preparation lesson. A completed preparation lesson changes the link to **Review lessons**; it does not turn the test into a Review-stage test. All 72 lessons and their corresponding tests currently declare `focused`; the catalog also has 21 Review tests. The learner therefore sees some recap and transfer steps presented as additional Focused teaching.

| Pack                               | Lessons / Focused tests | Review tests | Scored exercises | Optional exercises | Standalone lessons to consolidate |
| ---------------------------------- | ----------------------: | -----------: | ---------------: | -----------------: | --------------------------------: |
| vowel-harmony-location-endings     |                       4 |            2 |              110 |                 14 |                                 1 |
| kpt-singular-forms                 |                       8 |            3 |              260 |                 32 |                                 2 |
| t-plural-agreement                 |                       6 |            2 |              200 |                 20 |                                 2 |
| personal-pronouns-affirmative-olla |                       7 |            2 |              242 |                 28 |                                 1 |
| negative-olla-statements           |                       3 |            1 |              100 |                 12 |                                 1 |
| olla-questions-short-answers       |                       5 |            2 |              178 |                 20 |                                 0 |
| singular-demonstrative-pronouns    |                       5 |            1 |              120 |                 20 |                                 1 |
| plural-demonstrative-pronouns      |                       6 |            1 |              144 |                 24 |                                 2 |
| negative-demonstrative-statements  |                       3 |            1 |               88 |                 12 |                                 1 |
| demonstrative-questions            |                       6 |            1 |              160 |                 24 |                                 0 |
| affirmative-possession             |                       3 |            1 |               96 |                  9 |                                 1 |
| negative-possession                |                       3 |            1 |               96 |                  9 |                                 1 |
| possession-questions               |                       3 |            1 |               96 |                  9 |                                 1 |
| negative-possession-questions      |                       3 |            1 |               96 |                  9 |                                 1 |
| possessive-pronouns-endings        |                       7 |            1 |              168 |                 21 |                                 0 |
| **Total: 15 packs**                |                  **72** |       **21** |        **2,154** |            **263** |                            **15** |

The 15 candidate lessons currently own 336 Focused questions and 56 optional exercises. Those counts describe the material needing reassignment and deduplication; they are **not deletion totals**. Useful practice, vocabulary introductions, diagnostics, and mastery pairs must be retained where they add evidence.

## Why the repetition exists

The constitution requires one assessed grammatical decision at a time, and the authoring policy gives each non-review topic its own matching Focused lesson and test. That is useful when the steps introduce distinct forms or rules. The current blueprints also treat recognition, terminology, gathering known forms into a table, sentence assembly, and transformations as separate new skills even when the actual teaching adds no rule. Those labels generate additional lessons and test cards.

Earlier lessons demonstrate complete sentences and explain their parts. Later lessons then repeat that same pattern as their headline teaching. Supplying a supporting form can correctly isolate an assessed decision; it does not mean the earlier learner has never seen or been told about that rule. Teaching novelty and assessment focus need separate judgments.

The fixed family topologies in `REQ-G001-112`–`118`, `124`–`127`, and `135` preserve these splits. Structural validation checks declared skills, counts, prerequisite coverage, and target-matching lessons. It cannot establish that a newly named skill teaches something new. For demonstratives, [the duplicate-task fingerprint](../../client/tools/content-validation/demonstratives/demonstrative-pack-family.mjs) includes `targetSkill`, allowing the same task to recur under another label.

The ownership worked-example correction under `REQ-G001-139` improved target-specific explanations, but different nouns and construction-step wording do not by themselves establish a new grammatical rule. All twelve possession-pattern lessons also have the same three-item common-mistakes list. Keep the applicable warning once in each owning teaching context; a copied list is not evidence that every step needs a separate lesson.

## The possession example

1. `aps-possessors` teaches the six owner forms. All eight worked examples already use **owner + on + basic singular noun**, and their steps explain placing the noun after `on`. The lesson warns against person-conjugated possession verbs. Its scored sentence breakdowns explicitly explain that `on` stays fixed with every owner.
2. `aps-fixed-on` focuses on a worthwhile misconception: **Meillä on**, not **Meillä olemme**. This is a different assessed decision from choosing `meillä`. Retain a concise Focused explanation of that contrast, with owner and noun supplied; reduce the repeated introduction and full owner walkthroughs. It adds depth to a rule already encountered rather than an entirely unseen pattern.
3. `aps-sentences` repeats the order and singular-noun pattern already demonstrated in the first two lessons. Its error-repair question `aps-sentences-test-e019` repairs **Minulla olen koira**, repeating the fixed-verb decision. Convert useful sentence assembly and retrieval to Review; remove this standalone introductory lesson after references and skill ownership are revised.

Recommended local sequence: **owner forms → fixed-verb contrast → Review using both**. Combining the first two into one integrated lesson is another possible product design, but it would require changing the present single-target lesson contract. Simply removing the fixed-verb warning would lose an important English-speaker misconception.

## Complete lesson decisions

**Keep** means a distinct form, rule, construction, or useful contrast warrants its own teaching. It does not approve every repeated paragraph. **Merge** means move its useful instruction and recognition practice into the named owner and retire its standalone lesson. **Review** means retain useful retrieval or transfer under previously taught skills, without a new introductory lesson or invented Focused target. Sequence and vocabulary ownership must be rebuilt before implementing either consolidation.

### Foundations: 18 lessons

| Pack / lesson ID                                        | Decision                          | Teaching contribution or reason                                                                                                                |
| ------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| vowel-harmony-location-endings / `vowel-harmony-basics` | Keep                              | Back, front, and neutral vowel families and ending selection.                                                                                  |
| `neutral-vowel-harmony`                                 | Merge into `vowel-harmony-basics` | The first lesson already states the neutral-only rule and demonstrates `tie`; this adds examples and misconception practice, not another rule. |
| `inside-ending`                                         | Keep                              | Meaning of the inessive and attaching the selected ending to a stable stem.                                                                    |
| `inessive-location-sentences`                           | Keep                              | Introduces a complete subject–verb–location frame, beyond isolated noun forms.                                                                 |
| kpt-singular-forms / `strong-weak-kpt-grades`           | Merge into `kpt-doubles`          | Terminology and same-word comparison are already fully explained in the next lesson; retain a short orientation and noticing practice.         |
| `kpt-doubles`                                           | Keep                              | New `kk → k`, `pp → p`, and `tt → t` transformations.                                                                                          |
| `kpt-singles`                                           | Keep                              | Different learned single-consonant transformations.                                                                                            |
| `kpt-special-k`                                         | Keep                              | Bounded special word pairs, distinct from the common single-consonant patterns.                                                                |
| `kpt-clusters`                                          | Keep                              | New cluster transformations.                                                                                                                   |
| `kpt-basics`                                            | Review                            | Explicitly combines four already taught families. Family discrimination is retrieval, not a fifth new transformation family.                   |
| `genitive-nouns`                                        | Keep                              | Adds genitive meaning and the `-n` construction.                                                                                               |
| `verb-kpt`                                              | Keep                              | Applies known stems to the new bounded first-person verb construction and sentence use.                                                        |
| t-plural-agreement / `t-plural-recognition`             | Merge into `t-plural-basics`      | Singular/plural meaning and the final `-t` signal are repeated by the formation lesson. Recognition can open that lesson.                      |
| `t-plural-basics`                                       | Keep                              | Owns the regular nominative plural rule and controlled production.                                                                             |
| `kpt-t-plural-recognition`                              | Merge into `kpt-t-plural`         | Both lessons teach weak stem then `-t`; the recognition test largely asks “singular or plural,” already covered earlier.                       |
| `kpt-t-plural`                                          | Keep                              | Owns applying the known weak-stem rule before plural `-t`.                                                                                     |
| `he-verbs`                                              | Keep                              | Introduces bounded third-person plural verb endings and their harmony.                                                                         |
| `plural-sentences`                                      | Keep                              | Introduces `ovat` agreement in complete plural-subject statements.                                                                             |

### Pronouns and olla: 15 lessons

| Pack / lesson ID                                                 | Decision      | Teaching contribution or reason                                                                               |
| ---------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------- |
| personal-pronouns-affirmative-olla / `ppo-singular-pronouns`     | Keep          | Three new singular pronoun forms and speaker/listener reference.                                              |
| `ppo-plural-pronouns`                                            | Keep          | Three different plural forms; similar explanation structure is justified.                                     |
| `ppo-written-reference`                                          | Keep, shorten | Polite singular `te` adds a distinct use; shorten the gender-neutral recap.                                   |
| `ppo-singular-affirmative`                                       | Keep          | New `olen`, `olet`, and `on` mappings.                                                                        |
| `ppo-plural-affirmative`                                         | Keep          | New `olemme`, `olette`, and `ovat` mappings.                                                                  |
| `ppo-affirmative-agreement`                                      | Review        | Collects the six known mappings into a paradigm and mixes them; no seventh agreement rule.                    |
| `ppo-pronoun-presence`                                           | Keep          | Adds pronoun omission and the bounded third-person reference distinction.                                     |
| negative-olla-statements / `ppo-singular-negative`               | Keep          | New negative verb plus invariant `ole`.                                                                       |
| `ppo-plural-negative`                                            | Keep          | New plural negative forms and polite `te` agreement.                                                          |
| `ppo-negative-transformations`                                   | Review        | Changes polarity with forms already taught; move the explicit transformation map into the two owning lessons. |
| olla-questions-short-answers / `ppo-singular-positive-questions` | Keep          | Introduces question suffix attachment and question order.                                                     |
| `ppo-plural-positive-questions`                                  | Keep          | Different plural question forms; trim repeated question-order explanation.                                    |
| `ppo-singular-negative-questions`                                | Keep          | Suffix attaches to the negative verb, with `ole` retained separately.                                         |
| `ppo-plural-negative-questions`                                  | Keep          | New plural negative question forms.                                                                           |
| `ppo-written-short-answers`                                      | Keep          | Answer viewpoint and facts after negative questions add a distinct interpretation task.                       |

### Demonstratives: 20 lessons

| Pack / lesson ID                                            | Decision                        | Teaching contribution or reason                                                                                                                       |
| ----------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| singular-demonstrative-pronouns / `sdp-singular-forms`      | Keep                            | Own the three forms and their reference meanings.                                                                                                     |
| `sdp-reference-choice`                                      | Merge into `sdp-singular-forms` | Repeats the near/far/identifiable distinction already taught. Move supported recall followed by contextual choice into the same teaching progression. |
| `sdp-independent-use`                                       | Keep, clarify contrast          | Explicitly teaches a demonstrative standing for an understood referent, including descriptive predicates. Contrast this with a following named noun.  |
| `sdp-noun-modifier`                                         | Keep                            | Adds the demonstrative-before-noun construction.                                                                                                      |
| `sdp-se-han`                                                | Keep                            | Adds the standard-written person/non-human reference contrast.                                                                                        |
| plural-demonstrative-pronouns / `pdp-plural-forms`          | Keep                            | Three new plural forms, with local reference meanings for this self-contained pack.                                                                   |
| `pdp-reference-choice`                                      | Merge into `pdp-plural-forms`   | Same reference families and decision already explained in the preceding lesson.                                                                       |
| `pdp-independent-use`                                       | Keep, clarify contrast          | Explicit independent use with an understood group; teach against the following noun-modifier construction.                                            |
| `pdp-noun-modifier`                                         | Keep                            | Own the plural demonstrative + plural noun pattern.                                                                                                   |
| `pdp-number-agreement`                                      | Merge into `pdp-noun-modifier`  | Make matching number explicit in that construction. Preserve the useful mixed-number distractors; much of the current test repeats the prior task.    |
| `pdp-ne-he`                                                 | Keep                            | Adds the written human/non-human plural reference contrast.                                                                                           |
| negative-demonstrative-statements / `nds-singular-negative` | Keep                            | Establishes this pack's singular negative construction without an undeclared dependency on another pack.                                              |
| `nds-plural-negative`                                       | Keep                            | Adds plural negative agreement.                                                                                                                       |
| `nds-negative-transformation`                               | Review                          | Reuses the two known negative constructions; its own examples largely show final negative sentences rather than a new operation.                      |
| demonstrative-questions / `dqs-what-singular`               | Keep                            | Introduces the bounded `Mikä … on?` frame.                                                                                                            |
| `dqs-what-plural`                                           | Keep                            | Introduces the different bounded `Mitä … ovat?` classification frame.                                                                                 |
| `dqs-yesno-singular`                                        | Keep                            | Introduces singular yes/no formation in this self-contained pack.                                                                                     |
| `dqs-yesno-plural`                                          | Keep                            | Adds plural yes/no agreement.                                                                                                                         |
| `dqs-negative-singular`                                     | Keep                            | Adds the separate negative-question construction.                                                                                                     |
| `dqs-negative-plural`                                       | Keep                            | Adds plural negative-question agreement.                                                                                                              |

### Ownership and possession: 19 lessons

| Pack / lesson ID                                | Decision              | Teaching contribution or reason                                                                                                    |
| ----------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| affirmative-possession / `aps-possessors`       | Keep                  | Six adessive owner forms; supply the verb and noun during owner-form assessment.                                                   |
| `aps-fixed-on`                                  | Keep, shorten         | Explicit contrast with person-conjugated “be” forms remains useful; avoid replaying the full owner introduction.                   |
| `aps-sentences`                                 | Review                | Sentence order and the basic singular thing are already demonstrated; assembly is application of those rules.                      |
| negative-possession / `nps-fixed-negative`      | Keep                  | Adds invariant `ei ole` in the possession construction.                                                                            |
| `nps-partitive`                                 | Keep                  | Adds bounded regular singular partitive formation, including harmony.                                                              |
| `nps-sentences`                                 | Review                | Its teaching expressly says it combines the verb and noun forms already taught; no new negative possession rule.                   |
| possession-questions / `pqs-onko`               | Keep                  | Teaches `on + -ko`, invariant possession agreement, and moving it first.                                                           |
| `pqs-word-order`                                | Merge into `pqs-onko` | `pqs-onko` already states the full order and demonstrates it for all owners; retain arrangement practice there.                    |
| `pqs-short-answers`                             | Keep                  | Adds the reply convention and affirmative/negative facts.                                                                          |
| negative-possession-questions / `npq-eiko`      | Keep                  | Teaches `ei + -kö`, invariant possession form, `ole` placement, and negative noun support.                                         |
| `npq-word-order`                                | Merge into `npq-eiko` | Preceding instruction already puts the owner between `eikö` and `ole`, with the noun last.                                         |
| `npq-short-answers`                             | Keep, shorten         | Negative-question interpretation is a real misconception; retain fact-based reply teaching and trim repeated noun transformations. |
| possessive-pronouns-endings / `ppe-owner-forms` | Keep                  | Six genitive personal owner forms differ from adessive possessors.                                                                 |
| `ppe-personal-endings`                          | Keep                  | Adds the four first-/second-person suffixes.                                                                                       |
| `ppe-third-person`                              | Keep                  | Shared third-person suffix and owner-reference distinction.                                                                        |
| `ppe-harmony`                                   | Keep                  | Chooses suffix vowels from the noun, not the owner pronoun.                                                                        |
| `ppe-sentences`                                 | Keep                  | Adds the local identity frame and distinguishes the one identified thing from multiple owners.                                     |
| `ppe-pronoun-omission`                          | Keep                  | Adds omission with first/second person and bounded explicit third-person reference.                                                |
| `ppe-whose`                                     | Keep                  | Adds `kenen` and its distinct question construction without a personal possessive suffix.                                          |

## Equivalent scored tasks

An independent comparison ignores IDs, skill labels, explanation metadata, and stage. It compares pack, response type, instruction, whitespace-normalized prompt, all accepted answers, and the available choice/token sets. Shuffled choices or word-order tokens do not create a different grammatical task. This is stricter than matching the answer alone.

Found **23 pairs involving 46 scored items**: 19 pairs between Focused tests, three Focused/Review pairs, and one pair within the same Review. All 23 have different target labels, which explains why the current demonstrative fingerprint misses them. Among these, the strongest lesson-level evidence is the repeated plural noun-modifier/number-agreement sequence.

| Pack                              | First scored exercise ID          | Repeated scored exercise ID             |
| --------------------------------- | --------------------------------- | --------------------------------------- |
| singular-demonstrative-pronouns   | `sdp-singular-forms-test-e007`    | `sdp-reference-choice-test-e015`        |
| singular-demonstrative-pronouns   | `sdp-singular-forms-test-e008`    | `sdp-reference-choice-test-e016`        |
| singular-demonstrative-pronouns   | `sdp-singular-forms-test-e017`    | `sdp-review-e021`                       |
| singular-demonstrative-pronouns   | `sdp-singular-forms-test-e018`    | `sdp-review-e022`                       |
| plural-demonstrative-pronouns     | `pdp-plural-forms-test-e007`      | `pdp-reference-choice-test-e015`        |
| plural-demonstrative-pronouns     | `pdp-plural-forms-test-e008`      | `pdp-reference-choice-test-e016`        |
| plural-demonstrative-pronouns     | `pdp-noun-modifier-test-e001`     | `pdp-number-agreement-test-e009`        |
| plural-demonstrative-pronouns     | `pdp-noun-modifier-test-e002`     | `pdp-number-agreement-test-e010`        |
| plural-demonstrative-pronouns     | `pdp-noun-modifier-test-e003`     | `pdp-number-agreement-test-e011`        |
| plural-demonstrative-pronouns     | `pdp-noun-modifier-test-e004`     | `pdp-number-agreement-test-e012`        |
| plural-demonstrative-pronouns     | `pdp-noun-modifier-test-e007`     | `pdp-number-agreement-test-e015`        |
| plural-demonstrative-pronouns     | `pdp-noun-modifier-test-e008`     | `pdp-number-agreement-test-e016`        |
| plural-demonstrative-pronouns     | `pdp-noun-modifier-test-e009`     | `pdp-number-agreement-test-e017`        |
| plural-demonstrative-pronouns     | `pdp-noun-modifier-test-e010`     | `pdp-number-agreement-test-e018`        |
| plural-demonstrative-pronouns     | `pdp-noun-modifier-test-e011`     | `pdp-number-agreement-test-e019`        |
| plural-demonstrative-pronouns     | `pdp-noun-modifier-test-e012`     | `pdp-number-agreement-test-e020`        |
| plural-demonstrative-pronouns     | `pdp-noun-modifier-test-e013`     | `pdp-number-agreement-test-e021`        |
| plural-demonstrative-pronouns     | `pdp-noun-modifier-test-e014`     | `pdp-number-agreement-test-e022`        |
| negative-demonstrative-statements | `nds-singular-negative-test-e007` | `nds-review-e011`                       |
| negative-demonstrative-statements | `nds-singular-negative-test-e018` | `nds-negative-transformation-test-e013` |
| negative-demonstrative-statements | `nds-plural-negative-test-e005`   | `nds-negative-transformation-test-e004` |
| negative-demonstrative-statements | `nds-plural-negative-test-e015`   | `nds-negative-transformation-test-e014` |
| negative-demonstrative-statements | `nds-review-e012`                 | `nds-review-e015`                       |

For example, `pdp-noun-modifier-test-e007` and `pdp-number-agreement-test-e015` both ask the learner to write “These keys are at home,” supply `avaimet` and `kotona`, and accept `Nämä avaimet ovat kotona.` Changing the declared target does not create new teaching or a new response demand.

The number-agreement test has **12 of 24 tasks equivalent in full interaction** to noun-modifier tasks and another four with the same prompt/type/answers but different, useful multiple-choice distractors. Preserve the mixed-number diagnostic value of those four when consolidating; do not describe them as identical interactions. Overall, the broader prompt/type/answer comparison finds 27 pairs; four are excluded from the stricter total because the choices differ.

Repeated Focused/Review tasks can sometimes support deliberate retrieval, but these records do not establish useful spacing or a new transfer demand. Replace adjacent duplicate Focused tasks, remove the duplicate within one Review, and justify or vary remaining Review repetitions. Repeated answers alone are not a reason for removal: choosing an owner, correcting a verb, translating meaning, and answering a question can use the same sentence for different purposes.

## Useful repetition to preserve

Retain brief prerequisite reminders, full contextual meanings, new inflections, contrasting error choices, reduced support, meaningful transfer, and delayed retrieval. Similar headings or sentence frames do not prove duplication. Singular and plural forms, negative and affirmative patterns, genitive versus adessive owners, suffix formation, and pronoun omission remain materially different learning targets.

The [IES practice guide](https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf), recommendations 1 and 5, supports spacing and active retrieval. Applying that evidence here is a design judgment: repetition is useful in clearly identified practice and Review, while another full introductory lesson needs a teaching purpose. The guide does not prescribe 57 lessons or this application's question counts.

Cross-pack overlap is partly intentional because the packs are self-contained and prerequisite lookup is local. For example, learning `ei ole` with a personal subject does not remove the need to establish negative agreement for a demonstrative subject in an independently usable pack. Do not delete whole packs on the assumption that every learner completed another one. A shared cross-pack curriculum would need a separate contract change.

The [Eila ja Ossi beginner textbook](https://kansalaisopistojenliitto.fi/wp-content/uploads/2015/09/eila_ja_ossi_ktol_2007.pdf), chapter 5, supports the possession, negative-possession, and question constructions; these grammatical distinctions should survive consolidation. The [Kielitoimiston owner-pronoun guidance](https://kielitoimistonohjepankki.fi/ohje/omistusliitteet-persoonapronomini-ja-omistusliite-laulaja-ja-hanen-puolisonsa/) supports keeping the possessive pronoun-omission/reference distinction rather than treating it as a repeat of suffix formation.

## Required work before removal

1. Replace the affected skill blueprints and fixed family counts in the governing [G001 requirements](../features/G001-local-finnish-exercise-book/requirements.md), plan, validation, and pack assessments. A Focused teaching step must identify its distinct rule or contrast; changing response format or collecting known rules cannot alone justify a new skill.
2. Merge teaching in a sequence that still isolates assessed decisions. Move the six cumulative steps into final Reviews and retarget their useful questions to the underlying taught skills. Revise prerequisites, important skills, lesson/test references, manifests, catalog summaries, and family topology guards together. Do not merely change `stage` while retaining an otherwise untaught synthetic skill label.
3. Preserve vocabulary provenance and the ten-new-word Focused limit. Two candidates already introduce ten words each: `neutral-vowel-harmony` and `strong-weak-kpt-grades`. Their vocabulary must be redistributed or supplied visibly before merging. The 336 associated questions and 56 optional exercises need purposeful selection and reassignment, not wholesale deletion.
4. Strengthen duplicate checking across skill labels using actual learner-facing tasks. Keep legitimate same-answer tasks with different assessed decisions; flag identical interactions and require explicit justification for deliberate Review retrieval. Retain useful diagnostic distractors and valid mutual same-skill mastery pairs.
5. Apply the existing content-version policy to the final structural/scoring changes, disclose any intentional loss in the owning specification and changelog, and verify scoped progress reset and backup validation. Preserve unrelated compatible packs. Do not introduce aliases or migrations.
6. Complete new pre-authoring and final rendered pedagogy assessments for the revised sequences, direct-source/runtime validation, applicable unit tests, production build, and browser checks of Learn first, Review, completions, Cheat mode, and study order.

## Validation and limits

- `npm --prefix client run content:validate` **passed** for all 15 current packs. This verifies the current authored contract, not the pedagogical novelty of each lesson.
- Independent source inventory confirmed 72 lessons, 72 Focused tests, 21 Reviews, 2,154 scored exercises, and 263 optional exercises. The equivalent-task comparison scanned every scored item; the candidate inventory confirmed nine merges, six Review conversions, 336 associated scored items, and 56 optional items.
- This assessment uses current authored teaching and task content, the supplied screenshot, and the UI's test-card/link logic. No live rendering matrix, fresh grading sweep, production build, or empirical learner study was performed for this assessment-only change. It is not a replacement final approval for any pack.
- Assessment and changelog only: no lessons, tests, versions, learner data, or executable validation rules were changed. Existing unrelated working-tree changes remain outside this assessment.

The standalone repetitions can be removed after their useful teaching and practice have a clear owner. The recommendation preserves meaningful reinforcement and reduces the number of introductory lessons instead of removing important grammar.

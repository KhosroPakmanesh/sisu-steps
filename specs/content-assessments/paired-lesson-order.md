# Paired singular/plural lesson ordering

Date: 2026-10-05. Requirement: REQ-G001-146; validation: VAL-G001-103. Level: unchanged `0 - A1.3`. Scope: organization of two merged packs, with no lesson or question edits.

## Pre-change pedagogy gate

**Disposition: approved with limitations.** The user approved placing corresponding singular/plural topics next to each other after the all-pack ordering audit. Both forms are recognized first; reference, independent use, noun modification and person-reference contrasts then follow in demonstratives. Ownership progresses through owner forms, personal endings, third-person endings, harmony, one/several possessed objects, omission and whose questions. Topic pairs make comparisons close while each Focused test retains its original single target and number boundary. Original prerequisite chains retain their within-number order; every declared prerequisite must be verified earlier in the assembled sequence before handoff.

The existing skill coverage, lexical load, vocabulary provenance, section responsibilities, prompts, diagnostics, examples and production demands remain unchanged. Counts are inherited for coverage and retrieval, without padding or deduplication: 648 scored and 92 optional questions across the two packs, each below the 1,000-scored ceiling. The complete Focused sequences precede both original Reviews. No new grammar, source research or linguistic rewriting is involved; [demonstrative evidence](demonstrative-pronouns.md), [possessive evidence](possessive-pronouns-endings.md) and [test-separation evidence](number-focused-test-separation.md) remain authoritative for retained content.

Limits: Reviews retain their original number-group scopes; some preparation lessons and optional practice explain both owned-object numbers. Cross-number mastery partners and bounded written standard-Finnish practice remain unchanged. This arrangement does not certify general CEFR speaking/listening ability. No high-impact ordering issue was found in the pre-change audit.

## Demonstrative pronouns

Version: `1.0.0`. 11 lessons, 11 Focused tests, two Reviews, 264 scored / 44 optional questions.

| Order | Existing lesson ID     | Existing title                                 | Prerequisite skills                  |
| ----- | ---------------------- | ---------------------------------------------- | ------------------------------------ |
| 1     | `sdp-singular-forms`   | Singular demonstratives: tämä, tuo, se         | None                                 |
| 2     | `pdp-plural-forms`     | Plural demonstratives: nämä, nuo, ne           | None                                 |
| 3     | `sdp-reference-choice` | Choosing nearby, farther away, or identifiable | Singular demonstrative forms         |
| 4     | `pdp-reference-choice` | Choosing the correct plural demonstrative      | Plural demonstrative forms           |
| 5     | `sdp-independent-use`  | Using singular demonstratives without a noun   | Singular demonstrative reference     |
| 6     | `pdp-independent-use`  | Using plural demonstratives without a noun     | Plural demonstrative reference       |
| 7     | `sdp-noun-modifier`    | Using singular demonstratives before a noun    | Independent singular demonstratives  |
| 8     | `pdp-noun-modifier`    | Using plural demonstratives before a noun      | Independent plural demonstratives    |
| 9     | `pdp-number-agreement` | Matching demonstratives with plural nouns      | Plural demonstratives before nouns   |
| 10    | `sdp-se-han`           | Se and hän in standard Finnish                 | Singular demonstratives before nouns |
| 11    | `pdp-ne-he`            | Ne and he in standard Finnish                  | Plural demonstrative-noun agreement  |

Each lesson retains its existing matching Focused test. Finish with `sdp-review`, then `pdp-review`.

## Possessive pronouns and endings

Version: `2.1.0`. 16 lessons, 20 Focused tests, two Reviews, 384 scored / 48 optional questions.

| Order | Existing lesson ID     | Existing title                             | Prerequisite skills                                                                |
| ----- | ---------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| 1     | `ppe-owner-forms`      | Singular owner forms: minun, sinun, hänen  | None                                                                               |
| 2     | `pop-owner-forms`      | Plural owner forms: meidän, teidän, heidän | None                                                                               |
| 3     | `ppe-personal-endings` | My and your endings: -ni, -si              | Genitive personal owner forms                                                      |
| 4     | `pop-personal-endings` | Our and your endings: -mme, -nne           | Genitive personal owner forms                                                      |
| 5     | `ppe-third-person`     | His and her ending: -nsa                   | Genitive personal owner forms; First- and second-person possessive endings         |
| 6     | `pop-third-person`     | Their ending: -nsa                         | Genitive personal owner forms; First- and second-person possessive endings         |
| 7     | `ppe-harmony`          | His and her endings: choosing -nsa or -nsä | Shared third-person possessive endings                                             |
| 8     | `pop-harmony`          | Their endings: choosing -nsa or -nsä       | Shared third-person possessive endings                                             |
| 9     | `ppe-sentences`        | One owned thing: Tämä on …                 | First- and second-person possessive endings; Third-person possessive vowel harmony |
| 10    | `pop-sentences`        | One owned thing: Tämä on …                 | First- and second-person possessive endings; Third-person possessive vowel harmony |
| 11    | `ppe-plural-objects`   | Several owned things: Nämä ovat …          | Simple ownership identity sentences                                                |
| 12    | `pop-plural-objects`   | Several owned things: Nämä ovat …          | Simple ownership identity sentences                                                |
| 13    | `ppe-pronoun-omission` | When minun and sinun can be left out       | Plural possessed nouns in ownership sentences                                      |
| 14    | `pop-pronoun-omission` | When meidän and teidän can be left out     | Plural possessed nouns in ownership sentences                                      |
| 15    | `ppe-whose`            | Whose is this? Whose are these? Kenen …?   | Plural possessed nouns in ownership sentences                                      |
| 16    | `pop-whose`            | Whose is this? Whose are these? Kenen …?   | Plural possessed nouns in ownership sentences                                      |

Omission and whose lessons retain both existing object-number tests, singular then plural, together under their original shared lesson. All other lessons retain their existing single Focused test. Finish with `ppe-review`, then `pop-review`.

## Final organizational audit

**Disposition: approved with limitations.** The exact approved order is implemented. Every lesson and test prerequisite remains earlier in all fourteen packs, and the relative order inside each original number group is retained. Both maps display paired targets and end with their two original Reviews. Shared-object-number omission/whose lessons still have contiguous singular/plural tests. No high-impact sequencing finding remains unresolved.

- The immediately preceding snapshot comparison preserves all **81 lesson and 125 test files** byte-for-byte, including the **62 affected lesson/test files**. All **156 files in the twelve untouched packs** and the catalog registration match. Only the four ordering arrays change in each affected manifest; their summary objects, pack versions, lesson versions, IDs, names and counts are unchanged.
- All fourteen packs retain **81 lessons / 125 tests / 2,370 scored / 290 optional questions**. The two packs retain **264 scored / 44 optional** and **384 scored / 48 optional**. Every prerequisite remains earlier, paired topics follow the exact approved sequence, object-number test pairs stay together and the two original Reviews remain last.
- The complete **npm --prefix client run check** gate passes static/style/module/architecture/format/type/source/build checks, **369 unit tests** and **23 integration tests**. New negative cases reject reversed lesson/test number pairs in both source pack guards and the possessive runtime guard; existing grammar, number-scope, variety, Review-scope and progress-alignment checks remain active.
- Affected Playwright coverage passes all **six route cases** at **320/768/1440 pixels**: all **27 lessons and 35 tests**, totaling **186 route views**, with source teaching/examples/warnings and first-question feedback checked. Ordered map titles and stable routes match both manifests with no horizontal overflow. Six separate fully loaded map captures and their first singular/plural cards verify final rendering; phone cards and both wide maps were inspected. The screenshot fixture now waits for the completed map rather than capturing the opening screen.
- Both organizational pedagogy gates are **approved with limitations**. Shared optional teaching, original number-specific Reviews, unchanged cross-number mastery partners and written-only standard-Finnish limits remain. No content, persistence implementation, migration or alias changes were made; current learner data is preserved by unchanged versions and stable definitions. Full all-question grading is inherited from the previous byte-identical content audit rather than repeated for this order-only change.

The independent linguistic correctness, accepted alternatives, distractors, diagnostics, lexical/grammar classification and instructional limits remain supported by the dated source-content assessments and the immediately preceding all-item audit. This final gate certifies source-preserving organization and rendered ordering; it does not claim a fresh linguistic reauthoring audit.

# Finnish-teaching assessment: English pronoun and possession alternatives

## Scope and sources

This targeted correction implements `REQ-G001-137` at the installed `0 - A1.3` level. The source audit covered all 15 packs, 2,154 scored exercises, 263 optional-practice exercises, 72 lessons, and 93 tests. Thirty English text-entry items translate gender-neutral third-person reference: 26 use subject pronouns and four use possessive pronouns. Of these, 28 are scored and two are optional practice.

The user's subsequent `REQ-G001-138` boundary excludes `have/has got` possession. The complete inventory found these alternatives in 48 items: 22 affirmative, 16 negative, and ten positive-question items, including six optional questions across three lessons. None of the ten previous packs contained them. All existing models use the permitted simple construction. The two corrections together change 58 distinct items (52 scored and six optional), with six overlapping scored items; the rendered audit covers all 72 applicable pronoun or possession items.

- [Finland's official explanation of gender-neutral hän](https://finland.fi/han/article/)
- [Repository authoring contract](../content-authoring.md)
- [Product requirement and acceptance cases](../features/G001-local-finnish-exercise-book/requirements.md#consistent-english-pronoun-alternatives)

## Pre-authoring assessment

**Disposition: approved with limitations.** The completed read-only assessment and accepted correction preview establish the scope: allow either individual English pronoun and the combined rendering without introducing new Finnish grammar or vocabulary. Twelve subject-pronoun items need alignment, and four possessive items have the equivalent omission. Fourteen items, including both optional exercises, already accept the required alternatives. Existing question counts, Finnish forms, model answers, diagnostics, skills, vocabulary, order, and parallel links remain fixed. The subsequent possession boundary removes only excluded `got` construction variants; permitted article choices and negative contractions stay available.

| Pack                               | Corrected scored items | Correction                                                                                                                     |
| ---------------------------------- | ---------------------: | ------------------------------------------------------------------------------------------------------------------------------ |
| personal-pronouns-affirmative-olla |                      4 | Accept individual pronouns in isolated hän translations and remove the wording that demands an unspecified-gender formulation. |
| singular-demonstrative-pronouns    |                      1 | Accept He is here and She is here alongside the combined subject.                                                              |
| affirmative-possession             |                      3 | Accept the combined subject in every existing possession frame.                                                                |
| negative-possession                |                      2 | Accept the combined subject with every existing article and negative/contraction frame.                                        |
| possession-questions               |                      1 | Accept the combined subject in each existing positive-question frame.                                                          |
| negative-possession-questions      |                      1 | Accept the combined subject in each existing negative-question frame.                                                          |
| possessive-pronouns-endings        |                      4 | Accept his or her in isolated owner, noun-phrase, and full-sentence translations.                                              |

Prompt cues now clearly quote the individual alternatives. Choosing English gender is not a Finnish grammar target. Finnish plural `he`, number, polarity, and possession patterns retain their distinct meanings. No lesson vocabulary is added, removed, or reclassified.

## Final assessment and validation

**Final disposition: approved with limitations.** Source comparison confirms 58 changed items (52 scored and six optional), stable model answers and question metadata, and preservation of every permitted original alternative. All 15 packs retain 2,154 scored and 263 optional questions. No authored content contains `got`. The 200 excluded answer-list entries were removed from 48 items.

- The final `npm --prefix client run check` passes lint, formatting, architecture/reachability and module gates, application and test typechecks, direct-source validation of all 15 packs, production build, 284 unit tests, and 15 integration tests. One initial unit runner exited unexpectedly; the rerun exposed an older assertion accepting `Have I got a book?`, which now verifies rejection and accepts `Do I have a book?` instead. The complete final gate then passed.
- The focused Playwright run passes seven cases with two configured skips. Both pronoun acceptance and `got` rejection are checked in scored and optional workflows at 320, 768, and 1440 pixels. The desktop all-item audit records 132 successful submissions across all 72 applicable questions: three variants for each of 30 pronoun items and one permitted model for each of 42 additional possession items.
- Runtime and direct-source negative tests reject missing individual/combined pronoun answers, ambiguous wording, and excluded positive, negative, contracted, and question possession forms. Complete optional-practice pack validation covers both policies. Actual grading retains articles and allowed negative contractions and rejects changed number, polarity, and the excluded construction.
- The earlier full browser run was interrupted when the user narrowed the English possession policy. Its two initial mobile accessibility failures occurred in `beforeEach` while navigating, before assertions; their isolated final rerun is recorded in the feature validation evidence. The full browser suite was not repeated for this final correction.
- The installed content creator skill passes its quick validator; its learner-facing reference and repository authoring policy include both boundaries.

## Versioning and limitations

Personal pronouns and affirmative olla advances from `1.0.0` to `1.1.0`. Singular demonstratives and all five ownership packs advance from `1.1.0` to `1.2.0`. The existing scoped version reset intentionally discards prior attempts, unfinished sessions, mistakes, mastery, and lesson completions in those seven packs. Unchanged packs and still-owned notes remain intact. The three lessons `aps-sentences`, `nps-sentences`, and `pqs-onko` advance from `1.1.0` to `1.2.0` because six optional answers change; their manifest summaries match. Other lesson content and versions are unchanged.

This review addresses authored English alternatives and their presentation and grading. It does not claim listening, speaking, general CEFR competence, empirical difficulty, or an independent professional teacher assessment.

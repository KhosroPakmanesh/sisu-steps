# Lesson section responsibility audit — 2026-10-03

## Scope and contract

Scoped structural assessment for `REQ-G001-136`, using the [authoring contract](../content-authoring.md#lesson-section-responsibilities). Inspect all 72 installed lessons across 15 packs; correct 19 ownership lessons. Existing pack assessments and sources remain responsible for their Finnish scope and broader pedagogy. This assessment does not supersede pending final assessments of the ownership exercise expansion.

## Pre-correction assessment

Disposition: **approved** for the proposed structural correction.

The source inventory contains 145 authored grammar sections and 873 vocabulary declarations: 316 introduced, 424 reused, and 133 supplied, all `word` entries and no `fixed-expression` entries. All 19 ownership lessons contain a redundant vocabulary section; the remaining 53 lessons have no separate vocabulary-only section. Two demonstrative form lessons use terse lexical-pair key points for their grammar targets; clarify these as grammar guidance and singular-to-plural form mappings. Six duplicate sections also contain four useful partitive transformations each, which must be retained as grammatical teaching.

Remove lexical lists from grammar sections, preserve the 24 transformation rows, and keep vocabulary declarations, exercises, IDs, and versions. Supplied forms and meanings must remain visible in actual teaching. Where the removed lists were the only visible support, explain the owner role in a worked example and use the existing possession patterns in complete translated examples. Add no grammar target or scored exercise. The two-to-five optional-practice rule and each pack's existing scored count are unchanged.

The high-impact risk is losing contextual support while removing duplicate lists. Resolve it through form explanations and worked examples, with the existing vocabulary-visibility guards kept intact. Automated duplicate-list matching covers clear lexical lists; semantic purpose, full explanations, and contextual meanings require complete rendered review.

## Final scoped assessment

Disposition: **approved with limitations** for the scoped section correction.

All 72 installed lessons were audited in source and rendered at 320, 768, and 1440 pixels: 216 rendered lesson checks. The 19 redundant ownership vocabulary sections are removed. Two demonstrative lessons now express their grammar targets as usage guidance and singular-to-plural mappings. There are 132 authored grammar sections after retaining six partitive-form teaching sections and all 24 original transformation rows.

The unchanged vocabulary ledger remains 316 introduced, 424 reused, and 133 supplied entries: 873 words and zero fixed expressions. All 248 original Finnish example strings and English translations remain intact. Twenty-three complete translated context examples and explanatory owner roles make supplied material visible after removing the lexical lists, bringing the example total to 271. The comparison with the pre-correction snapshot confirms that every lesson field outside sections/examples is unchanged, including objectives, targets, prerequisites, vocabulary, common mistakes, optional exercises, IDs, and versions. The 2,154 scored and 263 optional exercises retain their definitions and variety.

Intentional teaching repetition: the six negative-pattern lessons retain noun-form transformations with contextual meanings; personal-pronoun and genitive paradigms demonstrate grammatical relationships; demonstrative reference/number/person tables summarize grammatical contrasts; worked examples repeat words and patterns in full contexts. Short summaries orient the learner before the detailed teaching. These do not create a second standalone lexical list. No exception permits a duplicate vocabulary-only section.

The complete rendered audit checks one dedicated vocabulary area, exact Finnish/English entries in all three categories, each grammar key point, all example meanings and steps, and viewport containment. Full-page captures of the reported possession lesson were reviewed at mobile and desktop widths. Per-project rendered inventories are recorded by the lesson-section Playwright test.

Runtime and direct-source checks reject renamed lists, annotated supplied forms, and paragraph lists, while retaining form transformations and contextual sentences. The existing vocabulary-visibility guards pass without weakening their rules. Lint, formatting, architecture, module/reachability checks, application/test type checking, aggregate validation of all 15 packs, and the production build pass. All 238 unit and 15 integration tests pass using a temporary single-worker thread configuration after the default Vitest child worker exited unexpectedly in this environment. The temporary runner configuration is not a repository policy change. The installed content-creator skill passes its bundled validator.

Limitations: automated matching identifies two or more distinct declared lexical pairs in a section and cannot prove semantic purpose for every possible phrasing; the complete rendered assessment supplements that boundary. This audit approves section responsibility and preservation of existing teaching, not the unfinished broader exercise-expansion assessment, CEFR certification, empirical difficulty calibration, or independent professional teacher review. The broader browser suite completed with 289 passes and 47 conditional viewport/project skips, including all 552 ownership scored exercises and 57 optional-practice items. Detailed outcomes are recorded in G001 validation.

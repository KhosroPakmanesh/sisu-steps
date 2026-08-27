# Finnish foundations A1 — pedagogy assessment

## Version 5.1.0 transformation-meaning revision

### Pre-authoring assessment

**Disposition: approved with limitations.**

The learner identified a high-impact clarity gap in prompts such as `silta (“bridge”) → ____ · apply lt → ll`: the expected answer `sillan` also requires genitive `-n` and means “of the bridge”, but neither the target meaning nor the non-target ending was supplied. The same pattern affected noun, verb, inessive, and plural transformations across scored and optional practice material.

The approved revision retains the topic boundary, thirteen-skill sequence, fifteen tests, 200 scored exercises, 44 optional practice exercises, response types, stable lesson/test/exercise IDs, vocabulary, accepted answers, diagnostics, and parallel relationships. It will:

- label the source form with its lexical English meaning and the target form with its inflected English meaning;
- supply every ending or stem frame that is not the exercise's declared target;
- strengthen generic and standalone validation so this omission cannot recur;
- update the repository authoring guide and reusable content-creator skill;
- increase the pack and lesson versions to 5.1.0 so older attempts are not silently interpreted against materially revised prompts and explanations.

The 200-question total remains justified because the revision removes hidden decisions without adding or removing assessed skills. Written grammar practice remains limited by the absence of listening, speaking, pronunciation, free composition, and communicative assessment.

## Version 5.0.0 pre-authoring reassessment

**Disposition: approved with limitations.**

The learner has approved a two-stage policy: every non-review topic receives a separate focused test and topic-specific **Learn first** preparation, while Review remains the only stage that may combine previously introduced topics. Earlier skills remain explicit prerequisites but their lessons are not repeated on later focused preparation pages.

The existing thirteen-skill sequence, fourteen existing test IDs, 200 scored exercises, diagnostic metadata, and parallel-review relationships remain in scope. One new stable test ID is added for the previously combined special-`k` topic. This revision changes stage metadata, focused lesson mappings, validation rules, presentation labels, and the pack version; it does not add grammar, rewrite scoring, or claim broader CEFR competence. The principal continuing limitation is that written recognition and production do not assess listening, speaking, pronunciation, interaction, or general communicative ability.

## Scope

- **Pack:** `vowel-harmony-kpt-tplural`
- **Pack version:** `5.0.0`
- **Topic:** vowel harmony, KPT consonant gradation, and nominative T-plural foundations
- **Level statement:** Pre-A1–A1.3 written grammar foundations, not general CEFR certification
- **Current size:** 200 scored exercises, 13 Focused tests, 2 mixed Reviews, 13 lessons, and 44 optional practice exercises

## Sources used by the pack

- Uusi kielemme: Vowel Harmony
- Uusi kielemme: The T-Plural
- Uusi kielemme: Beginner Finnish Topics A1

These sources support the existing authored scope. A qualified native-speaker or Finnish-teaching professional should still review new natural-answer variants and any future expansion beyond the present beginner boundary.

## Pre-authoring assessment reconstructed from the current design

**Disposition: approved with limitations.**

The thirteen declared important skills form a coherent written-grammar progression: vowel-family recognition, harmony in a supplied ending, separately tested KPT families, mixed KPT recognition, focused noun and verb forms, regular and gradating T-plurals, third-person plural endings, and short plural-subject sentences.

The sequence limits Focused work to one decision, supplies non-target stems and meanings, limits focused lesson vocabulary, and moves from recognition to controlled production and then cumulative retrieval. The thirteen Focused tests each own one target and show only target-specific preparation. The final two Reviews mix previously introduced grammar without introducing a new target.

The principal limitation is breadth rather than sequencing: the pack assesses written form recognition and production only. It does not assess listening, speaking, pronunciation, interaction, free composition, or broad A1 communicative competence.

## Version 5.0.0 final content assessment

**Disposition: approved with limitations.**

Strengths:

- lessons and feedback explain rules from first principles in English;
- sentence questions include complete meanings, patterns, and part-by-part formation;
- difficult KPT material is divided into smaller families before combination;
- every non-review topic has a separate focused test and target-specific preparation list;
- focused vocabulary is controlled and reused across response formats;
- answer reveal, mistake correction, delayed parallel review, and mastery are distinguished;
- every declared important skill is required by Focused scored work;
- only the two Reviews combine previously covered material, without adding an uncovered requirement.

Limitations and continuing safeguards:

- authored alternatives cannot guarantee every natural Finnish wording without ongoing language review;
- KPT is deliberately taught through controlled familiar families and must not be presented as fully predictable for unfamiliar words;
- repeated items are useful only when they change retrieval context or response demand; future expansion must reject surface-only duplication;
- the absence of audio and communicative tasks must remain visible in level claims;
- native-speaker review remains recommended before treating the pack as linguistically exhaustive.

## Technical evidence

- Aggregate generation produced the cataloged 5.0.0 pack deterministically with fifteen tests and 200 scored exercises.
- Complete-catalog validation passed the two-stage schema, one-topic Focused lesson mappings, transitive prerequisite vocabulary, Focused important-skill coverage before Reviews, pairing, sentence explanations, topic-specific KPT, and cross-pack ID checks for 200 scored and 44 practice exercises.
- All 71 automated unit tests passed, including rejection of the removed stage, focused-test lesson isolation, catalog, topic isolation, backup-version, grading, lesson, reveal, review, and user-interface behavior.
- The Angular production build completed without warnings, and all 18 Playwright workflows passed across mobile, tablet, and wide Chromium projects.
- Live route inspection confirmed one target-specific lesson on the special-`k`, mixed-KPT, KPT-noun, KPT-verb, and KPT T-plural focused pages; each cumulative Review page retained all thirteen lessons.
- The reusable `$finnish-grammar-content-creator` skill passed the official structural validator.
- Future material revisions require regeneration, complete catalog validation, automated tests, production build, and a renewed final pedagogy assessment.

## Final decision

The version 5.0.0 pack is approved with the stated limitations for its purpose as a calm, structured beginner written-grammar exercise book. It must retain its limited grammar-foundation claim and the safeguards above.

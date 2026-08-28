# Finnish foundations A1 — pedagogy assessment

## Lesson 5.2.0 strong-and-weak-grade introduction

### Pre-authoring assessment

**Disposition: approved with limitations.**

The learner identified a first-principles gap in the first KPT lesson. It named the strong and weak grades and described the visible `kk → k`, `pp → p`, and `tt → t` changes, but it did not explain why one word can appear with two grades, what the labels mean, or why the course begins with double consonants. Later material then reused the terms as if that conceptual model had already been established.

The approved revision remains within the existing Pre-A1–A1.3 KPT double-consonant target. Before presenting the three patterns, it will explain that:

- one Finnish word can use closely related strong-grade and weak-grade stems;
- adding an ending can select a different grade while the word retains its basic lexical meaning;
- “strong” and “weak” name consonant patterns rather than correctness, emphasis, or quality;
- double consonants are taught first because the two-letter-to-one-letter contrast is easy to see;
- the double-to-single pattern is one KPT family and must not be generalized as the definition of all consonant gradation.

The first worked example will connect the rationale to `pankki → pankin` while keeping the genitive `-n` visibly separate from the KPT change. No exercise, answer, vocabulary item, skill, test, ID, or progression changes. Only the revised `kpt-doubles` lesson advances to version 5.2.0; the pack remains at 5.1.0 because scored-attempt interpretation is unchanged and existing learner progress should not be cleared.

The continuing limitations are unchanged: the pack teaches controlled written recognition and production rather than the complete historical or phonological account of Finnish consonant gradation, dialect variation, listening, speaking, pronunciation, or communicative competence.

### Final pedagogy assessment

**Disposition: approved with limitations.**

The rendered 5.2.0 lesson now introduces strong and weak grade before using those terms as assumed knowledge. The opening establishes one word with two related stem grades, states that the labels describe consonant patterns rather than correctness or emphasis, and explains the sequencing rationale for starting with the most visible double-consonant family. The following section explicitly limits `kk → k`, `pp → p`, and `tt → t` to the family being taught rather than presenting double-to-single shortening as a universal definition of KPT.

The revised `pankki → pankin` walkthrough preserves one-decision focus: it identifies the shared word meaning, connects the ending to selection of the weak grade in this example, and separates genitive `-n` from the consonant change. The remaining examples, common-mistake guidance, and four optional practice exercises remain aligned with that explanation. No answer model, distractor, diagnostic, parallel pair, vocabulary declaration, Focused/Review boundary, or scored progression changed.

Technical validation regenerated the cataloged pack deterministically, retained 15 tests, 200 scored exercises, 13 lessons, 44 optional practice exercises, and 36 sentence exercises, and confirmed that only `kpt-doubles` advanced to lesson version 5.2.0 while the pack and other lessons remained at 5.1.0. The complete client quality gate passed formatting, linting, architecture, production and test typechecks, catalog validation, production build, and all 91 unit tests in 13 files.

The revision is approved for the stated beginner written-grammar purpose. It deliberately gives a practical first mental model rather than a complete linguistic history or exhaustive prediction system; native-speaker or Finnish-teaching-professional review remains recommended for future expansion.

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

### Final pedagogy assessment

**Disposition: approved with limitations.**

The generated 5.1.0 material labels both sides of form transformations with distinct English meanings and visibly supplies non-target genitive, `minä`, plural, inessive, stem-frame, and agreement information where required. The audit found no changed answer, vocabulary, skill, diagnostic, or parallel relationship and no hidden second decision in KPT-only production. Generic and standalone validators reject transformation prompts without meanings on both sides, while the topic-specific audit checks supplied noun and verb endings in KPT-only production.

The aggregate client quality gate passed content validation, formatting, linting, typechecks, the production build, and all 91 unit tests in 13 files. The pack contains 15 tests, 200 scored exercises, 13 lessons, 44 optional practice exercises, and 36 sentence exercises. The revision is approved for controlled beginner written practice with the continuing limitations that authored translations cannot exhaust every contextual nuance and the pack does not assess listening, speaking, pronunciation, free composition, or communicative ability.

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

- Kielitoimiston ohjepankki: Consonant gradation in inflection
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

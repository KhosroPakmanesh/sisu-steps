# G001 — Local Finnish exercise book

## Goal

Deliver a browser-only Angular exercise book and its first Pre-A1–A1.3 grammar-foundation pack covering vowel harmony, KPT consonant gradation, and the nominative T-plural.

## Included capabilities

- Topic dashboard and ordered test selection
- Authored grammar packs containing 200–1,000 scored exercises according to coverage needs
- A complete Focused-test sequence followed by visibly separate mixed Reviews
- Declared important-skill coverage that prevents a focused grammar point from being omitted
- Multiple choice, fill-in-the-blank, bidirectional translation, and word-order exercises
- Immediate answer grading, correction, and English explanation
- Answer reveal with a visible control and `Alt+A`, recorded separately from incorrect answers
- First-principles sentence feedback with full translation, sentence pattern, and part-by-part formation notes
- Optional **Learn first** preparation for every focused test, limited to lessons for that test's target skill; review tests may reuse earlier lessons
- Worked examples, common-mistake guidance, and separate unscored practice in each lesson
- Local, version-aware lesson completion that never locks a test
- Learner-friendly typed-answer normalization with significant Finnish diacritics
- Persistent attempts and unfinished sessions in IndexedDB
- Practice-mistakes sessions
- Latest, best, and average score reporting
- JSON backup/restore and test/topic/all-history clearing
- Responsive, keyboard-usable interface
- A focused single-lesson reading hierarchy and responsive multi-lesson review navigation that never obscures or buries the active lesson
- Explicit focused and review stages with visible targets and prerequisites; only review combines previously taught topics
- Lesson vocabulary lists and exercise skill declarations that prevent hidden grammar or vocabulary requirements
- One-time learner-progress reset when the materially revised content-pack version is first installed
- Smaller KPT learning blocks for double consonants, common single-consonant changes, special `k` changes, clusters, and mixed recognition
- Diagnostic feedback for authored distractors and common typed-answer misconceptions
- Prominent but optional fixed review sessions with locally calculated due dates
- Separate corrected and delayed-mastery states using pre-authored parallel exercises
- Private topic and lesson notes stored with local learner data and included in backup and restore

## Non-goals

- Authentication, multiple learners, backend APIs, or cloud synchronization
- Runtime AI calls or automatic content generation in the browser
- In-app exercise editing
- Audio, speech recognition, or pronunciation grading
- Locked tests, randomized ordinary tests, streaks, badges, or social features
- Runtime question generation or a review system that blocks ordinary study
- A claim that this grammar pack certifies general CEFR A1.3 proficiency

## Affected areas

- Angular application shell and routes
- Exercise content schema and bundled JSON loader
- Exercise session and grading domain logic
- Skip/reveal outcome storage and completed-session counts
- Structured teaching-note schema and feedback presentation
- Reusable lesson schema, lesson reader, and temporary practice interaction
- Lesson completion persistence, backup, restore, and clearing behavior
- IndexedDB persistence and migrations
- Reports, mistake practice, backup, and clearing controls
- Topic and lesson note persistence, validation, backup, restore, and clearing semantics
- Automated tests and accessibility checks
- Content focus metadata, vocabulary declarations, dependency validation, and stage labels
- Pack-version alignment for learner data
- Review scheduling, parallel-exercise relationships, misconception metadata, and mastery persistence
- Dashboard review recommendations and expanded skill-level reports
- Focused/Review stage metadata, coverage validation, and dashboard grouping
- A catalog of independently versioned topic packs with topic-aware routes, progress, reports, review, and clearing
- A reusable Finnish grammar content-creator skill and saved two-stage pedagogy assessments

## Implementation plan

1. Scaffold the strict standalone Angular application.
2. Define and validate the content-pack domain model.
3. Build the dashboard, test runner, and immediate feedback flow.
4. Add IndexedDB-backed attempt and session persistence.
5. Add mistake practice, reporting, export/import, and clearing.
6. Author the 200-exercise Pre-A1–A1.3 grammar-foundation pack as fifteen progressive tests.
7. Validate grading, storage, recovery, accessibility, tests, and production build.
8. Add reusable first-principles lessons and optional unscored preparation for all fifteen tests.
9. Refactor the pack around one-new-decision focused learning, declared prerequisites, declared vocabulary, and automatic focus validation.
10. Reorganize the 200 exercises into fourteen shorter groups and split KPT into smaller authored learning blocks.
11. Add per-option feedback, typed-error classification, parallel review exercises, optional due reviews, and delayed mastery.
12. Expand reporting to distinguish first attempts, independent work, reveals, corrected mistakes, and delayed mastery by skill.
13. Generalize the authored content policy to 200–1,000 scored exercises per grammatical-topic pack and require declared important-skill coverage in the Focused sequence before mixed Reviews.
14. Add a static content catalog, load every bundled pack, and make navigation and learner workflows topic-aware.
15. Replace the single content version with per-pack version alignment so adding or changing one topic does not erase unrelated progress.
16. Create a reusable content-authoring skill with pre-authoring and final Finnish-teaching pedagogy assessments and a saved assessment record.
17. Remove the guided-combination stage, give every non-review topic separate focused preparation and testing, and reserve multi-topic combination for review.
18. Remove the redundant Core/Extended test-set classification, group the learning map by Focused tests and Reviews, and communicate each group through its section rather than repeated card badges.
19. Add one private sticky note per topic and lesson with validated local persistence, backup/restore coverage, and explicit clearing behavior.

## Risks

- Native IndexedDB is origin-scoped and can be cleared by the browser; export/restore mitigates data loss.
- Finnish prompts may allow more than one natural answer; exercises must declare accepted alternatives rather than depend on a single surface form.
- KPT terminology and applicable word/verb types can overwhelm an A1 learner; tests must progress from recognition to controlled production.
- Updating bundled content while retaining old attempts requires stable exercise IDs and pack versions.
- Topic-specific lessons can drift away from the exercises that reference them; content validation must reject missing, duplicate, unrelated, or unreferenced lesson mappings.
- Lesson practice can be mistaken for scored work; the interface must repeatedly and clearly label it optional and unscored.
- Metadata cannot discover Finnish morphology by itself; authored skill and vocabulary declarations still require a content review for truthfulness.
- A learner may memorize an exact correction; delayed mastery therefore depends on a different authored exercise in the same skill family.
- Review due dates depend on the local browser clock and are recommendations rather than gates or certification decisions.
- The pack covers beginner grammar foundations only; CEFR wording must not imply assessment of listening, speaking, interaction, or overall proficiency.
- A declared coverage list can still be incomplete through author error; automated validation proves that declared points are assessed, while pedagogical review must confirm that the declared list itself is exhaustive.
- Exercise and lesson IDs must remain globally unique because mistakes, corrections, mastery, and lesson completion refer to them outside a single active topic.
- Multi-pack backup migration must preserve compatible existing progress while rejecting unknown or internally inconsistent references.
- Learner-authored notes must survive compatible pack updates without retaining references to removed topics or lessons, and destructive clearing text must state when notes are affected.

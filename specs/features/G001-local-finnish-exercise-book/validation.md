# G001 validation

## Automated validation

- **VAL-G001-001** (`REQ-G001-013`–`016`): Unit-test answer normalization, accepted alternatives, diacritic sensitivity, choice grading, and word-order grading.
- **VAL-G001-002** (`REQ-G001-001`, `003`–`005`): Validate the bundled pack schema, unique stable IDs, stored `0 - A1.3` level ranges, non-empty pedagogically justified scored sets of no more than 1,000 exercises, exercise types, and topic coverage. Browser checks verify that catalog, topic, reports, and Data & backup surfaces prepend the visible `Level:` label.
- **VAL-G001-003** (`REQ-G001-007`–`012`): Component/service tests cover immediate feedback, answer locking, resume behavior, repeated attempts, mistake inclusion, and mistake resolution.
- **VAL-G001-004** (`REQ-G001-017`–`023`): Persistence tests cover versioned records, atomic backup import, scoped clearing, and preservation of bundled content.
- **VAL-G001-005** (`REQ-G001-024`–`026`): Reporting tests verify latest, best, average, attempt counts, mistake counts, and session summaries.
- **VAL-G001-006** (`REQ-G001-030`): Error-path tests verify visible failures for invalid content, unavailable storage, and invalid backups.
- **VAL-G001-007**: Run the complete unit test suite successfully.
- **VAL-G001-008**: Run a successful production build with strict TypeScript checks.
- **VAL-G001-018** (`REQ-G001-031`–`034`): Validate that every sentence-tagged exercise contains a translation, sentence pattern, and at least two complete part explanations with Finnish form, meaning, role, and formation.
- **VAL-G001-021** (`REQ-G001-037`–`039`): Service tests verify that a reveal is persisted as skipped, receives no score credit, is excluded from incorrect counts, and neither creates nor resolves an unresolved mistake.
- **VAL-G001-022** (`REQ-G001-035`, `036`): Runner and lesson-practice tests verify that the visible button reveals the correct answer and explanation without a submitted response, no shortcut badge or metadata is rendered, and `Alt+A` is not intercepted and does not reveal an answer or change progress.
- **VAL-G001-024** (`REQ-G001-042`–`045`, `050`, `055`): Content validation verifies stable unique lesson and practice IDs, complete teaching sections, two-to-five practice counts, valid ordered test references, focused tests referencing only target-matching lessons, full authored-test coverage, and no reuse of scored exercise IDs.
- **VAL-G001-025** (`REQ-G001-046`): Lesson-page tests verify practice grading and reveal feedback without changing learner attempts, sessions, reports, or mistakes.
- **VAL-G001-026** (`REQ-G001-047`–`051`): Service and backup tests verify versioned lesson completion, cross-test reuse, backup/restore, and test/topic/all clearing semantics.
- **VAL-G001-027** (`REQ-G001-040`, `041`, `049`): Topic-page and routing tests verify separate lesson/test actions, direct test entry, completion labels, and rereading.
- **VAL-G001-030** (`REQ-G001-053`–`060`): Content validation verifies only focused and review stages, one target for focused material, review-only combination, declared prerequisite closure, exercise skill containment, lesson vocabulary entries, and vocabulary references limited to current or transitive prerequisite lessons.
- **VAL-G001-031** (`REQ-G001-061`): Service tests verify that an older or unversioned learner state is reset once, the installed pack version is stored, and same-version progress survives later initialization.
- **VAL-G001-032** (`REQ-G001-053`, `055`, `056`): Topic-page and lesson-page tests verify visible focused/review stages, target and prerequisite guidance, topic-specific focused lesson lists, and combination guidance only for review.
- **VAL-G001-034** (`REQ-G001-063`–`066`): Content and runner tests verify supplied base-word meanings, per-option explanations, authored misconception matching, and general diagnostic fallback.
- **VAL-G001-035** (`REQ-G001-067`–`072`): Service tests verify corrected-versus-mastered transitions, different parallel exercises, review eligibility, the one/three/seven-day schedule, optional access, and reveal behavior.
- **VAL-G001-036** (`REQ-G001-073`): Persistence and backup tests verify correction, due-review, review-attempt, and mastery records and reject malformed records atomically.
- **VAL-G001-037** (`REQ-G001-074`): Reporting tests verify first-attempt, independent, skipped, corrected, and mastered per-test summaries.
- **VAL-G001-038** (`REQ-G001-076`, `077`): Content validation verifies the five KPT learning blocks, four-to-five practice items for difficult KPT lessons, worked contrasts, and the vocabulary ceiling.
- **VAL-G001-039** (`REQ-G001-062`, `070`): Catalog and topic-page tests verify grammar-foundations wording and a prominent optional review action that does not gate tests.
- **VAL-G001-040** (`REQ-G001-078`): Version-alignment tests verify a one-time reset from an incompatible prior content version and preservation after the revised version is stored.
- **VAL-G001-045** (`REQ-G001-003`): Content-service and standalone validation tests reject empty packs and packs with more than 1,000 scored exercises.
- **VAL-G001-046** (`REQ-G001-080`–`084`): Content validation rejects missing or duplicate important-skill declarations, an important skill absent from Focused exercises, a Focused test after the Review boundary, and a Review exercise that requires a skill not covered by Focused tests.
- **VAL-G001-047** (`REQ-G001-081`, `082`, `085`): Topic-page tests verify separate **Focused tests** and **Reviews** sections, authored order, direct access to both groups, and the absence of redundant stage or set badges on test cards.
- **VAL-G001-049** (`REQ-G001-086`, `087`, `093`, `094`): Catalog and content-service tests cover catalog and manifest schemas, ordered fragment loading and in-memory assembly, ID/path matching, malformed or missing resources, and duplicate IDs across packs.
- **VAL-G001-050** (`REQ-G001-090`, `091`; legacy-migration evidence superseded by `VAL-G001-079`): State-alignment tests originally verified compatible legacy migration, new-pack preservation, changed-pack scoped clearing, unchanged-pack preservation, and removal of records for packs no longer installed.
- **VAL-G001-051** (`REQ-G001-088`, `089`): Catalog, topic-page, route, runner, lesson, review, and mistake tests verify topic-aware links and topic isolation.
- **VAL-G001-052** (`REQ-G001-092`; superseded by `VAL-G001-079`): Backup tests originally accepted a valid per-pack version map, migrated compatible legacy data, and atomically rejected unknown topic or cross-pack references.
- **VAL-G001-053** (`REQ-G001-089`): Reporting and data-clearing tests verify per-topic summaries, per-test clearing within a topic, topic-only clearing, and global clearing.
- **VAL-G001-054** (`REQ-G001-095`): The validation command assembles every registered same-named JSON folder directly, rejects malformed ownership or cross-pack identities, reports every installed pack, and the production build contains an unchanged deployed content tree with no generated bundled pack.
- **VAL-G001-055** (`REQ-G001-096`): Run the official skill quick validator and inspect its discovery description, repository-contract routing, authoring workflow, validation commands, and stopping conditions.
- **VAL-G001-056** (`REQ-G001-097`–`099`): Inspect the skill and saved assessment template for distinct pre-authoring and final Finnish-teaching pedagogy gates, required rubric dimensions, recorded limitations, and revision blocking for unresolved high-impact findings.
- **VAL-G001-058** (`REQ-G001-029`, `052`, `101`): Lesson component and Playwright tests verify a centered single-lesson reader without redundant navigation, compact multi-lesson selection at 320 and 768 pixels, desktop lesson navigation below the sticky application header, consistent route-specific page headings, and no horizontal overflow.
- **VAL-G001-060** (`REQ-G001-102`–`104`): Note-service and topic/lesson component tests verify one note per scope, the 1,000-character limit, explicit save/removal, local commit behavior, visible status, and preservation of a failed draft.
- **VAL-G001-061** (`REQ-G001-105`): Backup tests accept valid topic and lesson notes and atomically reject malformed, duplicate, over-limit, unknown-topic, unknown-lesson, and cross-topic lesson references.
- **VAL-G001-062** (`REQ-G001-106`): Clearing and state-alignment tests verify that test clearing preserves notes, topic clearing removes only owning notes, all-history clearing removes every note, compatible pack updates preserve valid notes, and removed owners are discarded.
- **VAL-G001-064** (`REQ-G001-107`): Generic and standalone content validation reject a transformation prompt unless English meanings appear on both sides. The current-pack audit also verifies that KPT-only production supplies genitive or `minä` endings explicitly instead of testing an undeclared second decision.

## Content-quality validation

- **VAL-G001-009** (`REQ-G001-004`): Review all Finnish prompts, answers, translations, and explanations for Pre-A1–A1.3 grammar-foundation suitability and grammatical correctness.
- **VAL-G001-010**: Check that difficulty progresses across the authored Focused sequence and then mixed Reviews, and that no exercise requires unexplained concepts beyond the declared scope.
- **VAL-G001-048** (`REQ-G001-080`, `083`): Pedagogically audit each pack's important-skill declaration for completeness; automated coverage checks cannot determine whether an author omitted an important point from the declaration itself.
- **VAL-G001-011**: Check every production exercise for all common natural accepted answers that are valid at the declared level.
- **VAL-G001-012**: Check that distractors are plausible but unambiguously incorrect for the supplied prompt.
- **VAL-G001-019** (`REQ-G001-033`, `034`): Review sentence breakdowns for unexplained terminology, hidden inflection steps, and concepts that would require unstated prior knowledge.
- **VAL-G001-028** (`REQ-G001-043`, `044`): Review every lesson and practice item for first-principles clarity, grammatical correctness, alignment with referenced tests, non-duplication, and absence of scored-test answer reuse.
- **VAL-G001-033** (`REQ-G001-054`, `059`, `060`): Audit every focused item for exactly one new grammatical decision, no hidden stem or spelling change, no unintroduced scored vocabulary, and no distractor that depends on an undeclared rule.
- **VAL-G001-041** (`REQ-G001-063`, `076`, `077`): Review every revised lesson and test for cognitive focus, controlled lexical load, recognition-to-production progression, and first-principles suitability.
- **VAL-G001-042** (`REQ-G001-064`–`066`): Review every option explanation and typed misconception for accurate diagnosis, constructive wording, and an unambiguous correct answer.
- **VAL-G001-043** (`REQ-G001-068`, `069`): Review every parallel relationship to ensure the second item tests the same skill with a different surface answer and comparable difficulty.
- **VAL-G001-044** (`REQ-G001-079`): Content validation rejects focused lessons with more than ten introduced words and audits reuse of core vocabulary across recognition and production formats.
- **VAL-G001-057** (`REQ-G001-097`, `098`): Review the current pack's saved pedagogy assessment for scope completeness, first-principles suitability, controlled lexical load, exercise progression, useful redundancy, feedback quality, review validity, and clearly stated limitations.
- **VAL-G001-065** (`REQ-G001-107`): Review every transformed word or verb form for an accurate source meaning, an accurate target meaning, and explicit disclosure of every non-target ending, stem frame, or agreement choice.

## Manual validation

- **VAL-G001-080** (`REQ-G001-008`, `036`, `045`): In both scored Study and optional lesson practice, submit an answer and reveal an answer; confirm **Continue**, **See result**, or **Finish practice** replaces the **Check answer** and **Show answer** group in the same position before feedback and any step-by-step sentence explanation, with no duplicate forward action below the explanation.

- **VAL-G001-013** (`REQ-G001-001`, `002`, `006`–`012`): Complete, leave, resume, repeat, and practise mistakes from a real browser session.
- **VAL-G001-014** (`REQ-G001-020`–`023`): Export progress, clear it, restore it, try an invalid backup, and verify scoped clearing.
- **VAL-G001-015** (`REQ-G001-028`): Navigate all primary flows using only a keyboard and inspect accessible names and focus order.
- **VAL-G001-016** (`REQ-G001-029`): Inspect dashboard, runner, results, reports, and settings at 320, 768, and 1440 pixel widths.
- **VAL-G001-017** (`REQ-G001-027`): Disable network access after loading the static app and verify study, persistence, and reporting remain functional.
- **VAL-G001-020** (`REQ-G001-031`–`034`): Submit sentence answers on a narrow and wide viewport and verify the structured breakdown is readable, ordered, and announced after immediate feedback.
- **VAL-G001-023** (`REQ-G001-035`–`039`): Activate the reveal button by pointer and native keyboard activation in ordinary and mistake-practice sessions; verify focus behavior, separate result counts, and persistence after reloading. Verify that `Alt+A` has no answer-reveal behavior.
- **VAL-G001-029** (`REQ-G001-040`–`052`): Read, practise, skip practice, finish, reread, and start the associated test using keyboard-only navigation at 320, 768, and 1440 pixel widths.
- **VAL-G001-059** (`REQ-G001-101`): At 320, 768, and 1440 pixels, inspect one focused preparation route and one cumulative review route for consistent section gutters, immediate access to the active lesson, visible selected-lesson state, and absence of overlap with the sticky application header.
- **VAL-G001-063** (`REQ-G001-102`–`106`): Save, edit, remove, export, restore, and clear topic and lesson notes using pointer and keyboard at 320 and 1440 pixels; verify plain-text rendering, readable status, retained drafts on failure, and the documented clearing consequences.

## Completion evidence

- Test command and passing summary
- Production build command and output
- Content validation result and exercise counts
- Manual validation notes, including any unverified browser-only checks

## Execution evidence — 2026-08-18

- `npm run content:validate`: passed; 10 tests, 200 scored exercises, 9 reusable lessons, 27 separate practice exercises across all 5 supported interaction types, 46 fully structured scored sentence explanations, unique IDs, complete lesson references, valid grading data, and no duplicate choices.
- `npm test -- --watch=false`: passed; 8 test files and 30 tests, including lesson schema/reference validation, separate dashboard actions, temporary practice grading/reveal, versioned completion sharing, backup validation, clearing semantics, structured sentence validation, skipped scoring, and mistake preservation.
- `npm run build`: passed without warnings; production initial bundle estimated at 70.13 kB transferred.
- Served smoke check: `/`, `/learn/vowel-families`, and `/content/finnish-foundations-a1.json` returned HTTP 200; the served pack contained 10 tests, 200 scored exercises, 9 lessons, and 27 practice exercises.
- `npm install`: completed with 0 reported vulnerabilities.
- Finnish test and lesson content was structured against the cited vowel-harmony, T-plural, and A1 topic references; a native-speaker review remains recommended before treating all rules, examples, and natural answer variants as exhaustive.
- Full visual checks of the dashboard, lesson reader, lesson practice, runner, reports, and settings at 320, 768, and 1440 pixels and a keyboard-only real-browser walkthrough remain manual follow-up items.

## Execution evidence — 2026-08-18 focused-content revision

- `npm run content:generate`: passed; regenerated content pack version 2.0.0 with 200 scored exercises and nine version-2 lessons.
- `npm run content:validate`: passed; 10 tests, 200 scored exercises, 27 lesson-practice exercises, 46 structured sentence explanations, five focused tests, four guided-combination tests, and one review under the superseded three-stage policy.
- Focus guards passed: the inessive group contains only stable stems, every `-vat/-vät` item states that its verb stem is supplied, and every plural-sentence item uses a stable subject stem plus one of four supplied fixed context words.
- `npm test -- --watch=false`: passed; 8 test files and 37 tests, including focus metadata, vocabulary containment, stage presentation, content-version reset, same-version preservation, and the prior grading/storage/lesson behaviors.
- `npm run build`: passed without warnings; production initial bundle estimated at 70.56 kB transferred.
- Served smoke check: `/`, `/learn/vowel-families`, and `/content/finnish-foundations-a1.json` returned HTTP 200.
- Manual content pass removed hidden KPT and e-stem changes from the focused inessive test, irregular stem discovery from the focused `-vat/-vät` test, inflected place complements from plural sentences, type-4 strengthening from the verb KPT group, ambiguous translations, and an untaught review ending.
- Native-speaker review and real-browser visual/keyboard checks remain recommended manual follow-up.

## Execution evidence — 2026-08-18 pedagogical-mastery revision

- `npm run content:generate`: passed; generated content-pack version 3.0.0 with fourteen ordered tests and exactly 200 scored exercises.
- `npm run content:validate`: passed; fourteen tests, 200 scored exercises, thirteen lessons, 44 optional unscored practice exercises, 36 structured sentence exercises, seven focused tests, five guided-combination tests, and two reviews across all five supported interaction types under the superseded three-stage policy.
- Content guards passed for mutual same-skill parallel-review relationships with different surface answers, authored misconception metadata, multiple-choice option feedback, the five KPT teaching blocks, and the ten-word focused-lesson vocabulary ceiling.
- `npm test -- --watch=false`: passed; 8 test files and 49 tests, including diagnostic feedback, correction-versus-mastery state, one/three/seven-day review scheduling, failed and skipped review behavior, backup validation, progress-version reset, focused vocabulary limits, reporting, and the prior learning flows.
- `npm run build`: passed without warnings; production initial bundle estimated at 72.10 kB transferred.
- Served smoke check: `/`, `/review`, `/reports`, `/learn/kpt-doubles`, and `/content/finnish-foundations-a1.json` returned HTTP 200; the development server was stopped after verification.
- Native-speaker review and full real-browser visual, responsive, screen-reader, and keyboard-only checks remain recommended manual follow-up items.

## Execution evidence — 2026-08-18 variable-size and former set-metadata revision

- `npm run content:generate`: passed; generated content-pack version 4.0.0 under the new 200–1,000 scored-exercise policy.
- `npm run content:validate`: passed; that superseded pack contained 200 scored exercises in fourteen tests, divided by the former Core/Extended metadata into twelve Core tests and two Extended tests, plus thirteen lessons and 44 optional practice exercises.
- Coverage validation passed under the superseded set policy for all thirteen declared important skills.
- The third-person plural `-vat/-vät` exercises now use their own target-skill metadata instead of being combined with the separate `plural subject + ovat` reporting category.
- `npm test -- --watch=false`: passed; 8 test files and 55 tests under the superseded set policy, including lower and upper exercise-count limits, missing and duplicate coverage declarations, set-boundary coverage, and dashboard grouping.
- `npm run build`: passed without warnings; production initial bundle estimated at 72.54 kB transferred.
- `npx prettier --check ...`: passed for all changed source, content, specification, documentation, and test files.
- The declared important-skill list was reviewed against the current vowel-harmony, KPT, and T-plural lesson/test scope. Native-speaker review remains recommended when new grammar points or additional questions are authored.

## Execution evidence — 2026-08-18 multi-topic and authoring-skill revision

- `npm run content:generate`: passed through the aggregate generator and produced the cataloged `finnish-foundations-a1` pack at version 4.1.0.
- `npm run content:validate`: passed for the complete catalog; the current pack contains fourteen tests, 200 scored exercises, thirteen lessons, 44 optional practice exercises, and 36 sentence exercises. Cross-pack lesson, test, practice, and scored-exercise IDs are globally unique.
- `npm test`: passed; 8 test files and 60 tests cover catalog validation, topic-aware routes, per-pack version migration, changed-pack-only clearing, backup version maps, topic-isolated reports and resets, and all prior learning behavior.
- `npm run build`: passed without warnings; the production initial bundle is estimated at 73.95 kB transferred.
- `npm exec -- prettier --check ...`: passed for every changed application, tool, specification, and documentation file.
- The `$finnish-grammar-content-creator` personal skill passed the official `quick_validate.py` check.
- The saved current-pack pedagogy record contains distinct pre-authoring and final dispositions, findings, limitations, technical evidence, and the final decision.
- Real-browser responsive, screen-reader, and keyboard-only walkthroughs remain manual follow-up checks; component tests and template compilation passed.

## Execution evidence — 2026-08-22 focused-topic test revision

- `npm run content:generate` produced the cataloged `finnish-foundations-a1` pack at version 5.0.0 with fifteen tests and exactly 200 scored exercises.
- `npm run content:validate` passed for thirteen Focused tests, two cumulative mixed Reviews, thirteen lessons, 44 optional practice exercises, and 36 structured sentence exercises. Neither Guided combination nor Core/Extended set metadata remains.
- Content guards passed for target-matching Focused lesson lists, transitive prerequisite vocabulary, one Focused test for every focused lesson, complete Focused important-skill coverage before Reviews, rejection of removed set metadata, mutual parallel-review relationships, and global IDs.
- `npm run check` passed ESLint, Stylelint, module-size, reachability, architecture, formatting, production and test typechecks, complete-catalog validation, the production build, and all 72 unit tests in ten files.
- `npm run test:e2e` passed all 18 workflows across mobile, tablet, and wide Chromium projects, including separate **Focused tests** and **Reviews** sections without classification badges, the fifteen-test catalog, centered one-lesson Focused preparation, compact 320/768-pixel Review selection, correctly offset sticky 1440-pixel Review navigation, persistence, and deliberate data controls.
- Live route inspection at 320, 768, and 1440 pixels confirmed route-specific page headings, aligned lesson-reader gutters, immediate access to the active lesson, no horizontal overflow, and no overlap with the sticky application header. The special-`k`, mixed-KPT, KPT-noun, KPT-verb, and KPT T-plural focused routes each display one target-specific lesson and no **Guided combination** label, while both Review routes retain all thirteen lessons.
- The updated `$finnish-grammar-content-creator` skill passed the official `quick_validate.py` structural check and now creates complete Focused coverage followed only by mixed Reviews, without a second set classification.
- Loading version 5.0.0 invokes the existing pack-scoped version-alignment reset for incompatible older progress; no manual IndexedDB deletion is required.

## Execution evidence — 2026-08-23 private learner notes

- Implemented `REQ-G001-102`–`106` as one plain-text note per topic or lesson with a 1,000-character limit, explicit save/removal, failure-safe drafts, native IndexedDB persistence, and no network dependency.
- Backup validation accepts valid notes and rejects malformed, duplicate, over-limit, unknown-topic, unknown-lesson, and cross-topic lesson references before replacement. Existing backups without notes remain compatible.
- Unit coverage verifies save, removal, failure retention, backup/restore, test-clear preservation, topic-scoped clearing, all-history clearing, and note preservation across compatible installed owners; all 85 unit tests passed.
- Playwright verified topic-note persistence after navigation and native field/button operation in all three configured browser projects; all 33 runs passed across 320-, 768-, and 1440-pixel viewports.
- Data & backup text now states that backups include private notes, one-test clearing keeps them, topic clearing removes the owning notes, and all-history clearing removes every note.

## Execution evidence — 2026-08-30 answer-reveal shortcut removal

- Updated `REQ-G001-035` at the learner's request: removed the visible shortcut badge, both global `Alt+A` listeners, their accessibility metadata, and unused badge styling. The native **Show answer** buttons and existing reveal/scoring semantics remain intact.
- All 107 unit tests passed, including no-interception/no-reveal checks for `Alt+A`, absent shortcut text/metadata, and button-operated answer reveal. Production/test TypeScript checks, direct-source content validation, and the production build passed (79.01 kB estimated initial transfer).
- The full Playwright matrix passed 50 cases with 18 expected project-specific skips; one existing wide hover-motion case timed out and then passed when rerun alone. All shortcut-removal, native keyboard activation, optional-practice, and persisted-reveal checks passed on the first run.
- ESLint/template accessibility, Stylelint, module-size, source-reachability, and architecture checks passed. The aggregate check still stops at the existing 21-file repository-wide Prettier baseline; no additional formatting failure remains.

## Single-review consolidation validation

- **VAL-G001-066** (`REQ-G001-108`, `109`): Validate exactly thirteen Focused tests and one final `foundations-review`, 33 review questions, 200 pack questions, all thirteen actual primary targets with two or three items each, no duplicate prompt/answer tasks, accurate required-skill declarations, all five response formats, mutual different-answer pairs and no retired test references. Negative tests reject a second review, missing coverage and duplicate tasks.
- **VAL-G001-067** (`REQ-G001-108`–`110`): Browser coverage verifies one review card and preparation page, thirteen optional lessons, a 33-question fixed session, save/reload/resume and completion/reporting. Existing version-alignment coverage plus a real-content reset case verifies that 5.1.0 progress is cleared once on loading 6.0.0 while unrelated packs and still-owned notes follow their existing policy.
- **VAL-G001-068** (`REQ-G001-109`): Inspect every rendered review prompt and feedback, sample all response controls and sentence explanations, compare parallel pairs for task demand, and record the final pedagogy disposition. Check Day/Night and narrow/wide layouts without claiming native screen-reader or general CEFR validation.

## Complete sentence-meaning prompt validation

- **VAL-G001-069** (`REQ-G001-111`): Runtime and standalone content validators inspect every sentence-tagged construction or completion exercise and reject it when the normalized prompt omits the complete `sentenceExplanation.translation`. Negative unit coverage proves the rejection, while Finnish-to-English translation exercises remain exempt.
- **VAL-G001-070** (`REQ-G001-111`): Audit all 62 sentence-tagged exercises in the installed pack, confirm that every non-translation English meaning is visible before response, and verify that the 21 corrected prompts retain their existing IDs, response types, answers, scoring metadata, order and mastery pairs.

## Personal pronouns and olla pack-family validation

- **VAL-G001-071** (`REQ-G001-003`, `112`–`115`): Direct-source and pack-specific validation verify three registered pack folders with 242, 100, and 178 scored exercises; fifteen Focused tests of 24 questions; five target-scoped Reviews; fifteen lessons; four practice exercises per lesson; all five response types in each pack; globally unique IDs; fixed order; and 520 complete mutual same-skill different-answer mastery pairs across the family.
- **VAL-G001-072** (`REQ-G001-113`–`115`): Pack-family validation audits each declared skill and construction boundary, all six grammatical persons, affirmative, negative, positive-question, negative-question, and short-answer coverage, plural and polite-singular `te` agreement, exact duplicate fingerprints, and the absence of spoken or informal forms from learner-facing Finnish and accepted answers. Negative unit cases prove count, ordering, boundary, duplication, register, mastery-pair, and `te` guards reject representative violations.
- **VAL-G001-073** (`REQ-G001-031`–`034`, `111`–`115`): Inspect all fifteen lessons, 520 scored exercises, 60 optional practice items, diagnostics, explanations, and sentence breakdowns after the split. Verify accurate standard Finnish, complete pre-response meanings, controlled vocabulary, one assessed change, natural accepted alternatives, useful distractors, no hidden grammar, and no lost or duplicated stable ID. Record a separate final pedagogy disposition for each pack.
- **VAL-G001-074** (`REQ-G001-086`–`095`, `112`): Catalog, topic, lesson, study, reports, Data & backup, persistence, backup, and browser checks verify that all installed packs are independently reachable and isolated, level labels remain consistent, and every workflow remains local-only and usable at 320-, 768-, and 1440-pixel widths. Current successor-pack totals and migration behavior are verified by `VAL-G001-075`–`078`.

### Execution evidence — 2026-09-01

- Pack version 6.0.0 contains thirteen Focused tests followed by one 33-question **Foundations review**, with 200 scored questions overall, thirteen referenced lessons, 44 optional practice exercises and all five response types. The retired `guided-review` source and route references are absent.
- Primary Review coverage is balanced at two or three questions for each of the thirteen declared skills. All 33 Review pairs are mutual, same-skill and have different first answers; internal partners are spaced by seven or thirteen questions.
- Pack-specific validation and seven negative/positive unit cases passed. The full client quality gate passed 115 unit tests in 17 files, direct-source validation, linting, formatting, architecture checks, production and test typechecks, and the production build.
- Dedicated Playwright coverage passed all nine Day/Night cases across 320-, 768- and 1440-pixel projects. It completed and rendered all 33 prompts and feedback explanations, verified optional thirteen-lesson preparation, save/reload/resume, 33/33 results, report persistence, and a seeded version 5.1.0-to-6.0.0 pack reset that preserved the still-owned topic note.
- The recorded final pedagogy gate is **approved with limitations**. It resolved an uneven KPT T-plural mastery pair and found no unresolved high-impact content issue. The remaining limits are written-only controlled practice, authored rather than empirical difficulty calibration, and no independent professional Finnish-teacher review.

### Execution evidence — 2026-09-02 complete sentence meanings

- The audited inventory contains 62 sentence-tagged exercises: 53 Finnish-construction or completion tasks and 9 Finnish-to-English translations. All 53 construction prompts contain their complete normalized `sentenceExplanation.translation`; the 9 translation prompts intentionally remain exempt.
- Twenty-one prompts were corrected across `plural-sentences`, `plural-in-sentences`, `verb-kpt`, `kpt-verbs` and `foundations-review`. Their Finnish, accepted answers, interaction types, skills, vocabulary, diagnostics, order and parallel links remain unchanged. The pending pack stays at 6.1.0 and `plural-sentences` advances to lesson version 6.1.0.
- The aggregate client gate passed ESLint, Stylelint, module-size, reachability, architecture, repository formatting, production and test typechecks, direct-source validation, the production build and all 121 unit tests. New negative and exemption cases cover the prompt rule.
- The targeted Foundations review Playwright matrix passed all 9 Day/Night cases across mobile, tablet and wide Chromium, including all 33 review prompts and the 6.0.0-to-6.1.0 progress reset.
- The final pedagogy disposition remains **approved with limitations** for controlled written practice. No unresolved high-impact content issue remains; listening, speaking, pronunciation, interaction, free composition, empirical difficulty calibration and independent professional Finnish-teacher review remain outside this change.

### Execution evidence — 2026-09-05 personal pronouns and `olla` split

- Registered `personal-pronouns-affirmative-olla`, `negative-olla-statements`, and `olla-questions-short-answers` at version 1.0.0 and level `0 - A1.3`. Their learning maps contain 9, 4, and 7 tests with 242, 100, and 178 scored exercises respectively. Together they preserve the original fifteen 24-question Focused tests, 520 scored IDs, fifteen lessons, and 60 optional practice IDs exactly once.
- Review questions were partitioned by their actual target skill: the affirmative pack contains Reviews of 40 and 34 questions, the negative pack one Review of 28, and the question pack Reviews of 40 and 18. Validation finds no negative or question construction in the affirmative pack, no non-negative construction in the negative pack, and no statement-only target in the question pack.
- `npm run content:validate` passed all four installed packs. The pack-family validators confirm each exact topology, all five response types per pack, global IDs, controlled vocabulary, 424 sentence-tagged exercises with complete pre-response meanings, exact-task and sentence-semantic uniqueness, and 520 mutual same-skill/same-type/different-answer mastery pairs.
- Self-contained vocabulary validation passes after redistributing the existing contextual definitions across the negative and question lessons. No Focused lesson introduces more than ten items, and the first negative and affirmative-question lessons no longer declare unavailable cross-pack prerequisites.
- Coverage across the split remains `minä` 83, `sinä` 73, `hän` 88, `me` 93, `te` 89, and `he` 94. Construction coverage remains 96 pronoun, 146 affirmative, 100 negative, 68 positive-question, 70 negative-question, and 40 short-answer tasks; 51 polite-singular and 26 plural `te` tasks visibly keep plural agreement.
- Register validation finds no informal or spoken learner-facing model or accepted answer. Fifty-nine scored diagnostic answer strings remain confined to corrections that redirect the learner to the required form. Eight pack-family unit cases reject representative count, ordering, boundary, duplication, register, balance, pairing, and `te`-coverage violations.
- Production and test TypeScript checks, the production build, and all 129 unit tests in eighteen files passed. The initial production bundle is 329.28 kB raw and 81.22 kB estimated transfer.
- Dedicated Playwright coverage passed all twelve split-pack workflows across 320-, 768-, and 1440-pixel projects. The complete 210-case run produced 174 passes, 26 expected responsive-project skips, and ten timeout-style failures under four-worker load; all ten failures passed in the serial last-failed rerun.
- The aggregate quality command passed lint, Stylelint, module-size, source-reachability, and architecture checks before stopping at the unchanged seventeen-file repository-wide Prettier baseline. Every file changed for this split passes targeted formatting, and the remaining typechecks, content validation, build, unit, and browser commands pass independently.
- Each pack's recorded final pedagogy disposition is **approved with limitations**. The family assesses controlled standard-Finnish grammar only; spoken Finnish, listening, pronunciation, other tenses and verbs, personal-pronoun cases, possession, passive voice, free interaction, empirical difficulty calibration, and independent professional Finnish-teacher review remain outside scope.

## Grammar-foundation successor-pack validation

- **VAL-G001-075** (`REQ-G001-116`–`118`): Direct-source and pack-specific validation verify three registered successor folders with exact topologies of 4 Focused + 2 Reviews, 8 Focused + 3 Reviews, and 6 Focused + 2 Reviews; exact scored totals of 110, 260, and 200; all five response types in every pack; fixed authored order; globally unique IDs; and preservation of every former stable content ID once.
- **VAL-G001-076** (`REQ-G001-118`, `120`): Pack-family validation audits Focused target ownership, construction boundaries, controlled vocabulary, complete English meanings, non-target supplied forms, exact and semantic task duplication, standard written register, and mutual same-skill different-answer mastery pairs. Negative unit cases prove representative topology, boundary, prompt, duplicate, pairing, and register violations are rejected.
- **VAL-G001-077** (`REQ-G001-119`; superseded by `VAL-G001-079`): This historical evidence verified remapping of version 6.1.0 records before the compatibility migration was retired.
- **VAL-G001-078** (`REQ-G001-116`–`120`): Inspect all 18 lessons, 570 scored exercises, optional practice, diagnostics, explanations, and sentence breakdowns. Browser coverage verifies all three learning maps, Focused and Review preparation, migrated reports and Data & backup ownership, and local-only operation at 320, 768, and 1440 pixels. Record separate final pedagogy dispositions for all three successor packs.
- **VAL-G001-079** (`REQ-G001-121`): State-contract, alignment, backup, integration, and browser tests accept complete current data, reset and persist a complete empty state when stored data has an obsolete shape or removed pack, and reject legacy or pack-incompatible backups before replacement. Repository searches verify no production legacy field, migration policy, fallback hydration, or retired content-generation command remains.
- **VAL-G001-081** (`REQ-G001-057`, `059`, `079`, `122`): Runtime and standalone content validators require all three lesson vocabulary categories and an explicit `word` or `fixed-expression` type, reject malformed or duplicate entries, reject whitespace in a `word` and require multiple written words in a `fixed-expression`, verify each reused Finnish item, English meaning, and type through the transitive declared prerequisite chain, reject known worked-example vocabulary omitted from all three categories while treating an owned fixed expression as one unit, reject supplied items whose Finnish form and English meaning are not visible in teaching, keep supplied teaching vocabulary outside scored-exercise vocabulary availability, reject repeated optional-practice labels, and retain the ten-item ceiling only for newly introduced Focused vocabulary. Unit tests cover each negative case and content-specific regressions cover the corrected singular-subject explanations. Inspect all 33 rendered lessons and record category counts, missing-word resolutions, intentional fixed expressions, and question-variety findings in the six pedagogy assessments. Browser and component coverage confirm three always-present semantic category containers, English meanings, computed worked-example surface parity including binding holes, hover and reduced-motion behavior, responsive padding, and equal sparse-card widths without changing study, scoring, or persistence behavior.
- **VAL-G001-082** (`REQ-G001-123`): Runtime and standalone content validators reject a Finnish sentence-construction or completion exercise when its English meaning contains `you`, its tags require `person-sina` or `person-te`, and its prompt does not visibly supply the matching Finnish subject or addressing meaning. Negative unit tests cover ambiguous `sinä` and `te` prompts; positive cases cover one-person, group, polite-singular, explicit-subject, and Finnish-to-English exemptions.
- **VAL-G001-083** (`REQ-G001-111`, `115`, `123`): Audit all 126 second-person Finnish-production sentences across the three personal-pronoun and `olla` packs. Correct the 24 underspecified prompts while preserving IDs, answers, response types, order, diagnostics, vocabulary, and mastery pairs, then record separate final pedagogy dispositions for the three affected packs.

### Execution evidence — 2026-09-06 grammar-foundation successor split

- Registered `vowel-harmony-location-endings`, `kpt-singular-forms`, and `t-plural-agreement` at version 1.0.0 and level `0 - A1.3`, replacing the combined version 6.1.0 catalog entry. Their learning maps contain 6, 11, and 8 tests with 110, 260, and 200 scored exercises; 4, 8, and 6 lessons; and 14, 32, and 20 optional practice exercises.
- `npm run content:validate` passed all six installed packs. The successor validators confirm exact topology, all five scored response types in each pack, globally unique IDs, controlled Focused boundaries, complete prompt meanings, standard written register, valid mastery pairs, and no exact or same-type sentence duplicate.
- With `VITEST_MAX_WORKERS=1`, `npm run check` passed lint, Stylelint, module-size, source-reachability, architecture, formatting, both typechecks, content validation, the production build, and all 19 unit-test files with 124 tests.
- All 246 former scored and optional-practice IDs remain present exactly once across the successor family. The expansion adds 370 distinct scored exercises, bringing the family total to 570 without padding the three packs to equal sizes.
- State and backup unit coverage verifies one-time migration of version 6.1.0 ordinary attempts and sessions by test owner, splitting of the former cumulative Review by exercise owner, retained mistakes/corrections/mastery and lesson completions, lesson-note ownership, and transfer of the broad topic note to `kpt-singular-forms`.
- Responsive Playwright coverage exercises all three viewport sizes, Day and Night appearance, the six-card catalog, new topic and Review routes, save/reload/resume, reports, Data & backup ledgers, and real IndexedDB migration. The 210-case parallel matrix produced 174 passes, 26 expected project-specific skips, and ten load-sensitive or stale-layout failures; nine passed immediately in the serial last-failed rerun, and the remaining hero-alignment assertion was corrected to follow the rendered one- or two-column container state before passing across its responsive projects.
- The three recorded pedagogy dispositions are **approved with limitations**. No unresolved high-impact content issue remains; controlled written practice, authored rather than empirical difficulty, and the absence of independent professional Finnish-teacher review remain explicit limitations.

### Execution evidence — 2026-09-09 breaking learner-data policy

- Removed the foundations-split migration, legacy single-pack state field and fallback hydration, and retired foundations generator. The persistence boundary now accepts only the complete current learner-state shape.
- Unit and integration coverage verifies current state and backups, complete reset for a stored version map containing a removed pack, strict backup pack/version matching, and atomic rejection of unsupported backups. The complete client gate passed 126 unit tests and 14 integration tests.
- The IndexedDB reset workflow passed at 320, 768, and 1440 pixels. The broader browser run completed with 198 passes and 34 intentional responsive skips; five unrelated existing topic-card material or hover assertions remain failing.

### Execution evidence — 2026-09-12 vocabulary visibility audit

- Audited all 33 installed lessons and recorded 227 introduced, 138 prerequisite-reused, and 14 supplied teaching-vocabulary entries. Twenty-four materially revised lessons advanced without version regression: thirteen from `1.0.0` to `1.1.0`, eight from `5.1.0` to `5.2.0`, one from `5.2.0` to `5.3.0`, and two from `6.1.0` to `6.2.0`. Pack versions, exercise and lesson IDs, scored and practice inventories, answers, order, diagnostics, response types, and mastery pairs remain unchanged.
- Runtime and standalone validators require all three categories, reject malformed and duplicate entries, verify reused Finnish and English through the transitive prerequisite chain, detect omitted known vocabulary in worked examples, require supplied Finnish forms and English meanings to be visible in teaching, reject repeated optional-practice labels, and keep supplied teaching vocabulary unavailable for scored recall. The six-pack direct-source validator passes with every Focused lesson at or below ten introduced items.
- Three malformed optional-practice prompts were reduced to one label without changing their question substance, and four inaccurate practice explanations now identify their subjects as singular. Content-specific tests preserve those corrections.
- The complete client quality gate passes linting, Stylelint, module-size, source-reachability and architecture checks, repository formatting, production and test typechecks, direct-source validation, the production build, 134 unit tests, and 14 integration tests.
- The focused vocabulary Playwright case verifies all three independent vocabulary-group containers at 320, 768, and 1440 pixels; compares computed background, ruling, border, clipped shape, depth, responsive padding, binding-hole pseudo-element, hover, and reduced-motion styles with a worked-example card; and checks equal word-card widths in sparse categories. The previously recorded unrelated topic-card material and hover baseline remain outside this change.

### Execution evidence — 2026-09-13 lexical-unit vocabulary entries

- All 33 lessons now explicitly type every vocabulary declaration. The installed inventory contains 193 introduced, 182 prerequisite-reused, and 15 supplied entries, all typed `word`; no current lesson needs a multiword fixed expression. Sixty-five transparent multiword declarations were replaced by component words with canonical meanings, and ten visibly revised `olla` lessons advanced from `1.1.0` to `1.2.0` with matching manifest summaries.
- Vocabulary metadata changed in 231 scored or practice exercises: 224 transparent combinations now reference their component words, and seven additional grammar-only items no longer claim lexical recall. Sixteen grammar-only items now have empty lexical-recall arrays because their Finnish context and English meaning are already visible or their Finnish words are supplied as word-order tokens. Exercise IDs, prompts, accepted answers, order, diagnostics, response types, scoring behavior, and mutual mastery pairs remain unchanged; pack versions and learner-state contracts are unchanged.
- Runtime and standalone negative cases reject missing or invalid types, multiword values labeled `word`, one-word values labeled `fixed-expression`, and prerequisite reuse with an inconsistent meaning or type. A positive fixed-expression case verifies that `hyvää huomenta` remains one owned item without forcing a separate declaration for a known component.
- `npm --prefix client run check` passes linting, Stylelint, module-size, reachability and architecture checks, repository formatting, production and test typechecks, direct-source validation, the production build, 152 unit tests, and 14 integration tests. The focused vocabulary Playwright case passes at 320, 768, and 1440 pixels, including the component-card assertions and computed surface-parity checks. The Finnish content-creator skill passes `quick_validate.py`.

### Execution evidence — 2026-09-13 second-person prompt clarity

- The complete audit covered 126 sentence exercises that ask the learner to produce Finnish from an English second-person meaning: 47 affirmative, 36 negative-statement, and 43 question exercises. Twenty-four underspecified prompts were corrected—sixteen affirmative, four negative-statement, and four question items—and no ambiguous item remains.
- The corrections preserve every exercise ID, accepted answer, response type, order, diagnostic, vocabulary declaration, target skill, sentence explanation, and mastery pair. Pack versions remain unchanged. Three lessons containing corrected optional practice advance monotonically: `ppo-singular-affirmative` to `1.1.0`, `ppo-pronoun-presence` to `1.3.0`, and `ppo-singular-negative` to `1.3.0`.
- Runtime and standalone validators reject number-neutral English `you` when a Finnish-production sentence tagged `person-sina` or `person-te` does not visibly identify the intended form. Unit cases cover ambiguous singular and plural prompts, explicit `Sinä` and `Te` frames, one-person, group, polite-singular, and Finnish-to-English exemptions.
- `npm --prefix client run check` passes linting, Stylelint, module-size, reachability and architecture checks, repository formatting, production and test typechecks, all six direct-source packs, the production build, 156 unit tests, and 14 integration tests. Browser E2E was not rerun because routes, persistence, responsive behavior, keyboard behavior, and primary interactions are unchanged.

# G001 validation

## Automated validation

- **VAL-G001-001** (`REQ-G001-013`–`016`): Unit-test answer normalization, accepted alternatives, diacritic sensitivity, choice grading, and word-order grading.
- **VAL-G001-002** (`REQ-G001-003`–`005`): Validate the bundled pack schema, unique stable IDs, 200–1,000 scored exercises, exercise types, grammar-foundations level wording, and topic coverage.
- **VAL-G001-003** (`REQ-G001-007`–`012`): Component/service tests cover immediate feedback, answer locking, resume behavior, repeated attempts, mistake inclusion, and mistake resolution.
- **VAL-G001-004** (`REQ-G001-017`–`023`): Persistence tests cover versioned records, atomic backup import, scoped clearing, and preservation of bundled content.
- **VAL-G001-005** (`REQ-G001-024`–`026`): Reporting tests verify latest, best, average, attempt counts, mistake counts, and session summaries.
- **VAL-G001-006** (`REQ-G001-030`): Error-path tests verify visible failures for invalid content, unavailable storage, and invalid backups.
- **VAL-G001-007**: Run the complete unit test suite successfully.
- **VAL-G001-008**: Run a successful production build with strict TypeScript checks.
- **VAL-G001-018** (`REQ-G001-031`–`034`): Validate that every sentence-tagged exercise contains a translation, sentence pattern, and at least two complete part explanations with Finnish form, meaning, role, and formation.
- **VAL-G001-021** (`REQ-G001-037`–`039`): Service tests verify that a reveal is persisted as skipped, receives no score credit, is excluded from incorrect counts, and neither creates nor resolves an unresolved mistake.
- **VAL-G001-022** (`REQ-G001-035`, `036`): Runner tests verify that the visible control and `Alt+A` reveal the correct answer and explanation without a submitted response.
- **VAL-G001-024** (`REQ-G001-042`–`045`, `050`): Content validation verifies stable unique lesson and practice IDs, complete teaching sections, two-to-five practice counts, valid ordered test references, full authored-test coverage, and no reuse of scored exercise IDs.
- **VAL-G001-025** (`REQ-G001-046`): Lesson-page tests verify practice grading and reveal feedback without changing learner attempts, sessions, reports, or mistakes.
- **VAL-G001-026** (`REQ-G001-047`–`051`): Service and backup tests verify versioned lesson completion, cross-test reuse, backup/restore, and test/topic/all clearing semantics.
- **VAL-G001-027** (`REQ-G001-040`, `041`, `049`): Topic-page and routing tests verify separate lesson/test actions, direct test entry, completion labels, and rereading.
- **VAL-G001-030** (`REQ-G001-053`–`060`): Content validation verifies valid learning stages, one target for focused material, declared prerequisite closure, exercise skill containment, lesson vocabulary entries, and vocabulary references limited to the lessons available to each test.
- **VAL-G001-031** (`REQ-G001-061`): Service tests verify that an older or unversioned learner state is reset once, the installed pack version is stored, and same-version progress survives later initialization.
- **VAL-G001-032** (`REQ-G001-053`, `055`): Topic-page and lesson-page tests verify visible stage, target, prerequisite, and combination guidance.
- **VAL-G001-034** (`REQ-G001-063`–`066`): Content and runner tests verify supplied base-word meanings, per-option explanations, authored misconception matching, and general diagnostic fallback.
- **VAL-G001-035** (`REQ-G001-067`–`072`): Service tests verify corrected-versus-mastered transitions, different parallel exercises, review eligibility, the one/three/seven-day schedule, optional access, and reveal behavior.
- **VAL-G001-036** (`REQ-G001-073`): Persistence and backup tests verify correction, due-review, review-attempt, and mastery records and reject malformed records atomically.
- **VAL-G001-037** (`REQ-G001-074`, `075`): Reporting tests verify first-attempt, independent, skipped, corrected, mastered, per-skill, and misconception summaries.
- **VAL-G001-038** (`REQ-G001-076`, `077`): Content validation verifies the five KPT learning blocks, four-to-five practice items for difficult KPT lessons, worked contrasts, and the vocabulary ceiling.
- **VAL-G001-039** (`REQ-G001-062`, `070`): Catalog and topic-page tests verify grammar-foundations wording and a prominent optional review action that does not gate tests.
- **VAL-G001-040** (`REQ-G001-078`): Version-alignment tests verify a one-time reset from an incompatible prior content version and preservation after the revised version is stored.
- **VAL-G001-045** (`REQ-G001-003`): Content-service and standalone validation tests reject packs with fewer than 200 or more than 1,000 scored exercises.
- **VAL-G001-046** (`REQ-G001-080`–`084`): Content validation rejects missing or duplicate important-skill declarations, an important skill absent from core exercises, a core test after the extended boundary, and an extended exercise that requires a skill not covered by core tests.
- **VAL-G001-047** (`REQ-G001-081`, `082`, `085`): Topic-page tests verify separate core and extended groups, visible extended labels and guidance, authored order, and direct access to both sets.
- **VAL-G001-049** (`REQ-G001-086`, `087`, `093`, `094`): Catalog and content-service tests cover catalog schema, ordered loading, ID/path matching, malformed entries, missing packs, and duplicate IDs across packs.
- **VAL-G001-050** (`REQ-G001-090`, `091`): State-alignment tests verify compatible legacy migration, new-pack preservation, changed-pack scoped clearing, unchanged-pack preservation, and removal of records for packs no longer installed.
- **VAL-G001-051** (`REQ-G001-088`, `089`): Catalog, topic-page, route, runner, lesson, review, and mistake tests verify topic-aware links and topic isolation.
- **VAL-G001-052** (`REQ-G001-092`): Backup tests accept a valid per-pack version map, migrate compatible legacy data, and atomically reject unknown topic or cross-pack references.
- **VAL-G001-053** (`REQ-G001-089`): Reporting and data-clearing tests verify per-topic summaries, per-test clearing within a topic, topic-only clearing, and global clearing.
- **VAL-G001-054** (`REQ-G001-095`): The generation command runs every registered pack generator, and catalog validation reports a summary for every installed pack.
- **VAL-G001-055** (`REQ-G001-096`): Run the official skill quick validator and inspect its discovery description, repository-contract routing, authoring workflow, validation commands, and stopping conditions.
- **VAL-G001-056** (`REQ-G001-097`–`099`): Inspect the skill and saved assessment template for distinct pre-authoring and final Finnish-teaching pedagogy gates, required rubric dimensions, recorded limitations, and revision blocking for unresolved high-impact findings.

## Content-quality validation

- **VAL-G001-009** (`REQ-G001-004`): Review all Finnish prompts, answers, translations, and explanations for Pre-A1–A1.3 grammar-foundation suitability and grammatical correctness.
- **VAL-G001-010**: Check that difficulty progresses across the authored core sequence and then the extended sequence, and that no exercise requires unexplained concepts beyond the declared scope.
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

## Manual validation

- **VAL-G001-013** (`REQ-G001-001`, `002`, `006`–`012`): Complete, leave, resume, repeat, and practise mistakes from a real browser session.
- **VAL-G001-014** (`REQ-G001-020`–`023`): Export progress, clear it, restore it, try an invalid backup, and verify scoped clearing.
- **VAL-G001-015** (`REQ-G001-028`): Navigate all primary flows using only a keyboard and inspect accessible names and focus order.
- **VAL-G001-016** (`REQ-G001-029`): Inspect dashboard, runner, results, reports, and settings at 320, 768, and 1440 pixel widths.
- **VAL-G001-017** (`REQ-G001-027`): Disable network access after loading the static app and verify study, persistence, and reporting remain functional.
- **VAL-G001-020** (`REQ-G001-031`–`034`): Submit sentence answers on a narrow and wide viewport and verify the structured breakdown is readable, ordered, and announced after immediate feedback.
- **VAL-G001-023** (`REQ-G001-035`–`039`): Use the reveal control and shortcut in ordinary and mistake-practice sessions; verify focus behavior, separate result counts, and persistence after reloading.
- **VAL-G001-029** (`REQ-G001-040`–`052`): Read, practise, skip practice, finish, reread, and start the associated test using keyboard-only navigation at 320, 768, and 1440 pixel widths.

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
- `npm run content:validate`: passed; 10 tests, 200 scored exercises, 27 lesson-practice exercises, 46 structured sentence explanations, five focused tests, four guided-combination tests, and one review.
- Focus guards passed: the inessive group contains only stable stems, every `-vat/-vät` item states that its verb stem is supplied, and every plural-sentence item uses a stable subject stem plus one of four supplied fixed context words.
- `npm test -- --watch=false`: passed; 8 test files and 37 tests, including focus metadata, vocabulary containment, stage presentation, content-version reset, same-version preservation, and the prior grading/storage/lesson behaviors.
- `npm run build`: passed without warnings; production initial bundle estimated at 70.56 kB transferred.
- Served smoke check: `/`, `/learn/vowel-families`, and `/content/finnish-foundations-a1.json` returned HTTP 200.
- Manual content pass removed hidden KPT and e-stem changes from the focused inessive test, irregular stem discovery from the focused `-vat/-vät` test, inflected place complements from plural sentences, type-4 strengthening from the verb KPT group, ambiguous translations, and an untaught review ending.
- Native-speaker review and real-browser visual/keyboard checks remain recommended manual follow-up.

## Execution evidence — 2026-08-18 pedagogical-mastery revision

- `npm run content:generate`: passed; generated content-pack version 3.0.0 with fourteen ordered tests and exactly 200 scored exercises.
- `npm run content:validate`: passed; fourteen tests, 200 scored exercises, thirteen lessons, 44 optional unscored practice exercises, 36 structured sentence exercises, seven focused tests, five guided-combination tests, and two reviews across all five supported interaction types.
- Content guards passed for mutual same-skill parallel-review relationships with different surface answers, authored misconception metadata, multiple-choice option feedback, the five KPT teaching blocks, and the ten-word focused-lesson vocabulary ceiling.
- `npm test -- --watch=false`: passed; 8 test files and 49 tests, including diagnostic feedback, correction-versus-mastery state, one/three/seven-day review scheduling, failed and skipped review behavior, backup validation, progress-version reset, focused vocabulary limits, reporting, and the prior learning flows.
- `npm run build`: passed without warnings; production initial bundle estimated at 72.10 kB transferred.
- Served smoke check: `/`, `/review`, `/reports`, `/learn/kpt-doubles`, and `/content/finnish-foundations-a1.json` returned HTTP 200; the development server was stopped after verification.
- Native-speaker review and full real-browser visual, responsive, screen-reader, and keyboard-only checks remain recommended manual follow-up items.

## Execution evidence — 2026-08-18 variable-size and extended-set revision

- `npm run content:generate`: passed; generated content-pack version 4.0.0 under the new 200–1,000 scored-exercise policy.
- `npm run content:validate`: passed; the current pack contains 200 scored exercises in fourteen tests, divided into twelve core tests and two extended tests, plus thirteen lessons and 44 optional practice exercises.
- Coverage validation passed for all thirteen declared important skills. Every declared point is required by at least one core scored exercise, all core tests precede the extended boundary, and extended tests introduce no uncovered required skill.
- The third-person plural `-vat/-vät` exercises now use their own target-skill metadata instead of being combined with the separate `plural subject + ovat` reporting category.
- `npm test -- --watch=false`: passed; 8 test files and 55 tests, including lower and upper exercise-count limits, missing and duplicate coverage declarations, absent core coverage, extended-only grammar, core-after-extended ordering, and dashboard grouping.
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

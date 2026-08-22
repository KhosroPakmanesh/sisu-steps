# Changelog

## Unreleased

### Added

- Adapted repository, source, architecture, persistence, design-system, accessibility, commit, and feature-spec guidance from the read-only UI prototype.
- Angular-aware ESLint/template accessibility checks, Stylelint, Prettier, module-size, source-reachability, architecture, separate production/test typechecks, and an aggregate quality gate.
- Playwright coverage for catalog navigation, optional lesson practice, IndexedDB session recovery, responsive reports, and deliberate data controls at 320, 768, and 1440 pixel widths.
- A source-guidance adoption record, module-responsibility audit, and manual refactor review guide.
- Initial local-first Finnish exercise-book specification.
- Angular 21 browser application with grouped tests, immediate feedback, responsive navigation, and accessible study controls.
- Native IndexedDB progress, unfinished-session recovery, mistake practice, per-test reports, backup/restore, and scoped history clearing.
- Pre-A1–A1.3 grammar-foundation pack with 200 exercises covering vowel harmony, KPT consonant gradation, and the T-plural.
- Automated checks for grading, content validation, learner sessions, reporting, and backup validation.
- A **Show answer** control and `Alt+A` shortcut with separately stored and reported skipped exercises that do not create or resolve mistakes.
- Optional **Learn first** preparation for all fifteen tests with reusable beginner lessons, worked examples, common mistakes, separate unscored practice, and local completion tracking.
- Visible **Focused** and **Review** stages with declared target skills, prerequisites, and lesson vocabulary.
- Automated content checks for one-target focused material, skill dependencies, introduced vocabulary, supplied verb stems, stable inessive stems, and fixed plural-sentence context.
- Diagnostic feedback for individual answer options and authored typed-answer misconceptions.
- Prominent optional review sessions with fixed parallel exercises, due dates, corrected states, and delayed mastery.
- Skill-level reporting for first attempts, independent answers, reveals, corrections, mastery, and misconception categories.
- Focused tests and mixed Reviews, with a declared important-skill coverage contract and visibly separate dashboard groups.
- A reusable Finnish grammar content-authoring workflow with saved pre-authoring and final Finnish-teaching pedagogy assessments.
- A static multi-topic content catalog with topic-aware study, review, reporting, progress versioning, and clearing.
- A compact topic catalog, prominent continue-learning recommendation, and lazy topic-detail route for scalable multi-pack navigation.

### Changed

- Completed the notebook-object pass across repeated UI surfaces: the catalog now uses a clipped assignment slip, printed record strip, and bound topic cover; topic maps use taped objectives and connected punched test cards; lessons use binder tabs, flashcards, vocabulary index cards, and practice sheets; study uses pinned targets, perforated answer slips, sentence strips, word pockets, correction slips, and foldouts; reports and data use ledger stamps, archive strips, and drafting sheets. Reports and Data & backup return navigation now uses the same folded paper link as the rest of the workbook.
- Extended the Nordic notebook into a fully interactive workbook world: a lit wooden desk and physical page stack now frame exercise-book topic covers, a connected fold-out learning map, a true two-page lesson spread, a loose study sheet, returned result paper, school ledger, and archive drawer. Every action variant now shares one cut-paper construction with hierarchy expressed through readable ink and edge accents; answer controls, selects, fields, word cutouts, progress rulers, feedback, loading, notices, errors, focus, and scroll position use complementary physical-object styling with immediate page, tab, stamp, pencil, and paper motion plus a static reduced-motion mode.
- Renamed the visible Light and Dark Appearance choices to the friendlier desk-light labels **Day** and **Night** without changing stored preference values or Automatic device-theme behavior. The header now removes numeric navigation prefixes and the redundant visible Appearance and Desk light headings, placing Topics, Reports, Data & backup, Automatic, Day, and Night in one continuous row while preserving an accessible group name. Destructive browser prompts are now accessible clipped confirmation sheets that focus Cancel, support Escape, restore focus, and preserve consequence-specific clear behavior.
- Restyled the client’s existing native controls as restrained Nordic school stationery: subject-divider navigation, labelled Appearance paper swatches, notebook-label actions, pencil-marked choices, ruled answer fields, vocabulary cards, ruler progress, teacher feedback stamps, school-ledger reports, and archive-like data controls. Labels, semantics, keyboard operation, action order, persistence, and clearing safeguards remain unchanged.
- Redesigned the complete browser client as an immersive Nordic school notebook with warm low-glare Light and Dark palettes, Automatic device-theme following plus a remembered override, restrained decorative handwriting, clearer novice-friendly labels, and responsive accessible paper-and-ink components across catalog, topic, lesson, study, reports, and data workflows. Physical workbook cues now include a punched binding edge, subtle paper grain, stacked sheets, printed Finnish workbook marks, masking tape, index tabs, and ledger dividers.
- The grammar-foundation pack is now version 5.0.0 with fifteen tests: thirteen single-topic Focused tests and two cumulative mixed Reviews. Focused **Learn first** pages now show only target-specific lessons, a dedicated special-`k` test covers that topic separately, and loading the new version clears only this pack's incompatible older progress.
- Reorganized the root Git workspace so product guidance remains at the root, Angular/browser implementation guidance lives with `client/`, and documentation-only .NET backend guidance lives with `server/`; updated shared VS Code tasks, indexes, specifications, and ignore rules without adding backend behavior.
- Reorganized production code into app composition, Learning workflow slices, design-system foundations, and app-agnostic shared infrastructure without changing public routes or persisted-data contracts.
- Split the former broad content and learning services into focused validators, queries, policies, stores, operations, repositories, and browser adapters; moved unit tests to a mirrored `tests/unit` tree with explicit Vitest imports.
- Extracted canonical CSS tokens and reusable feedback/sentence-explanation patterns while retaining the existing visual language.
- The grammar-foundation pack is now version 4.1.0; four test IDs were separated from lesson IDs to enforce catalog-wide uniqueness. Installing it clears only this pack's older incompatible progress.
- Sentence feedback now teaches from first principles with a full translation, word-order pattern, and part-by-part meaning, role, base-form, ending, KPT, and vowel-harmony explanations.
- The grammar-foundation content pack is now version 4.0.0. Focused tests avoid hidden stem changes and irregular verb construction; prerequisites and cumulative review work are explicitly identified.
- Existing progress from an earlier, unversioned, or version-3 content pack is cleared once when version 4.0.0 is installed, preventing old results from being attached to revised skill and review metadata.
- The beginner grammar pack is reorganized into fourteen shorter fixed tests while retaining 200 scored exercises and is labelled as Pre-A1–A1.3 grammar foundations.
- KPT teaching is split into smaller double-consonant, single-consonant, special-`k`, cluster, and mixed-recognition blocks with reduced vocabulary load and more optional practice.
- Focused production prompts now supply non-target Finnish base words and English meanings so vocabulary recall does not obscure the grammar being assessed.
- Core vocabulary is deliberately reused across recognition and production, and focused lessons are limited to at most ten scored words.
- Grammar packs may now contain 200–1,000 authored scored exercises according to coverage needs instead of being fixed at exactly 200; Focused tests must cover every declared important skill before mixed Reviews begin.
- Content versions are tracked per topic pack so adding a topic preserves existing work and changing one pack clears only that pack's incompatible progress.
- Full Focused/Review test maps and objectives now live on their owning topic page instead of expanding every installed pack on the landing page; lesson and study exits return to that topic.

### Removed

- The redundant Core/Extended test-set field, validation rules, labels, and badges. Tests are now grouped only as **Focused tests** and mixed **Reviews**.
- The **Guided combination** learning stage. Focused lessons and tests now have one target, prerequisite lessons are not repeated, and only Review may combine previously taught topics.

### Fixed

- Focused **Learn first** routes now use a centered single-lesson hierarchy without redundant navigation, while cumulative Review routes use a compact accessible selector on narrow screens and a correctly offset sticky lesson navigator on wide screens; lesson headings and section gutters are aligned consistently.
- The shell's Mistakes navigation now includes the active topic-pack ID instead of pointing to an incomplete route.
- Added previously referenced stone, blue, and green CSS token aliases so status and secondary styles resolve consistently.

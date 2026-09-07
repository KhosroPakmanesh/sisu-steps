# G008 concept-aligned client structure validation

## Static structure checks

- **VAL-G008-001:** Verify the learning feature contains only `topics`, `lessons`, `study`, `stats`, `learner-data`, and `shared` production roots and contains no production symbol or filename using report terminology. Covers REQ-G008-001 and REQ-G008-004 through REQ-G008-009.
- **VAL-G008-002:** Verify root `src/shared` contains only product-agnostic modules and all learner state, persistence, navigation, and progress-summary code is learning-owned. Covers REQ-G008-006 and REQ-G008-007.
- **VAL-G008-003:** Verify shell CSS is shell-owned, design-system files are reusable primitives, and workflow CSS remains owned by its workflow without changing stylesheet order. Covers REQ-G008-008.
- **VAL-G008-004:** Run the architecture checker with its negative fixtures or assertions for retired roots, forbidden sibling imports, learner-specific root-shared code, and non-mirrored unit paths. Covers REQ-G008-007, REQ-G008-010, and REQ-G008-014.

## Automated compatibility checks

- **VAL-G008-005:** Run route tests for every configured path and verify route paths and lazy targets are unchanged. Covers REQ-G008-002.
- **VAL-G008-006:** Run state migration, repository, backup compatibility, restore, clear-history, notes, sessions, grading, review, and progress-statistics tests. Covers REQ-G008-001 through REQ-G008-003 and REQ-G008-009.
- **VAL-G008-007:** Verify unit, integration, and browser suites are independently discoverable and the aggregate check runs unit and integration tests. Covers REQ-G008-010 through REQ-G008-013.
- **VAL-G008-008:** Verify Playwright launches the configured application server for the test run and its setup rejects an incompatible responding process. Covers REQ-G008-015.
- **VAL-G008-009:** Inspect CI and confirm the aggregate client check precedes deployment packaging. Covers REQ-G008-016.

## Repository gates

- **VAL-G008-010:** Run `npm run lint:architecture`, `npm run format:check`, `npm run typecheck`, and `npm run test:typecheck`. Covers REQ-G008-004 through REQ-G008-014.
- **VAL-G008-011:** Run `npm run test:unit` and `npm run test:integration`. Covers REQ-G008-002, REQ-G008-003, and REQ-G008-010 through REQ-G008-013.
- **VAL-G008-012:** Run `npm run content:validate`, `npm run build`, and `npm run check`. Covers REQ-G008-002, REQ-G008-003, and REQ-G008-013.
- **VAL-G008-013:** Run `npm run test:e2e` and verify the topic catalog, lesson, study, mistakes, review, statistics, notes, backup/restore, clear-history, accessibility, and responsive workflows. Covers REQ-G008-002, REQ-G008-003, REQ-G008-012, and REQ-G008-015.

## Manual checks

- **VAL-G008-014:** Review the final diff and confirm route strings, learner-visible copy, content JSON, IndexedDB constants, serialized state fields, and backup schema are unchanged. Covers REQ-G008-002 and REQ-G008-003.
- **VAL-G008-015:** Ask a maintainer unfamiliar with the migration to locate topic browsing, progress statistics, learner-data management, state persistence, and their tests from the tree alone; each shall have one unambiguous owner. Covers REQ-G008-001 and REQ-G008-004 through REQ-G008-012.
- **VAL-G008-016:** Verify current guidance identifies G008's limited supersession of G002 and does not rewrite completed historical evidence as if it used the new structure. Covers REQ-G008-017.

## Completion evidence — 2026-09-07

- **Structure and vocabulary:** The production learning roots are `topics`, `lessons`, `study`, `stats`, `learner-data`, and `shared`. Root `src/shared` contains only product-agnostic browser adapters and utilities. A repository search found no retired source or test import paths and no report terminology in production code. The remaining test references to `/reports`, `reports`, and `/data` are explicit assertions that those retired routes and state concepts do not exist. Covers VAL-G008-001 through VAL-G008-004.
- **Compatibility:** Route, persistence, migration, backup, clear-history, note, session, grading, review, and progress-statistics tests passed. Authored content files were not changed, and the refactor retained the existing route strings, IndexedDB constants and schema, serialized learner-state fields, and backup schema. Covers VAL-G008-005 and VAL-G008-006.
- **Test topology:** Vitest discovered 22 unit files with 118 passing tests and four integration files with 14 passing tests through their separate commands in the aggregate check. Playwright setup is isolated under `tests/e2e/support`, and specifications are grouped under workflow or quality-concern folders. Covers VAL-G008-007 and VAL-G008-008.
- **Repository and CI gates:** `npm.cmd run check` passed linting, style linting, module-size enforcement, dead-code detection, architecture enforcement, formatting, production and test typechecks, all direct-source content validators, the production build, unit tests, and integration tests. The deployment workflow now runs that aggregate check before its deployment build. Covers VAL-G008-009 through VAL-G008-012.
- **Browser workflows:** `npx.cmd playwright test` passed with the configured two-worker limit: 193 passed and 26 intentionally skipped across mobile, tablet, and wide projects. The run covered topic browsing, lessons, study, review, statistics, notes, persistence, backup/restore, clear history, accessibility, responsive layout, keyboard behavior, and retired-route handling. Covers VAL-G008-013.
- **Final review:** `git diff --check` passed. The final tree gives topic browsing, statistics, learner-data operations, state persistence, and each test layer one explicit owner. Current client guidance records G008's limited supersession of G002 while completed G002 evidence remains historical. Covers VAL-G008-014 through VAL-G008-016.

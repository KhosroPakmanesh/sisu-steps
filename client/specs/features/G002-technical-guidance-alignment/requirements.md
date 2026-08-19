# G002 technical guidance alignment requirements

## Documentation requirements

- **REQ-G002-001:** The repository shall contain an adapted working agreement, architecture guidance, browser-local persistence guidance, design-system guidance, commit checklist, changelog entry, feature index, refactor review record, and source-adoption record.
- **REQ-G002-002:** The source-adoption record shall identify every Markdown file in the selected prototype working tree and classify it as adapted, consolidated, retained as target-specific history, or excluded with a reason.
- **REQ-G002-003:** Guidance shall describe the actual Angular, strict TypeScript, plain-CSS, static-browser, IndexedDB, and versioned-JSON stack and shall not claim that React, Bootstrap, a backend, authentication, cloud storage, or multi-user data exists.
- **REQ-G002-004:** Existing G001 requirement and validation identifiers shall remain stable; this migration shall use G002 identifiers.

## Architecture requirements

- **REQ-G002-005:** Production source shall live under `client/src` and be organized into `app`, `features`, `design-system`, and `shared` ownership areas.
- **REQ-G002-006:** App bootstrapping, route composition, provider composition, route metadata, and shell composition shall remain under `client/src/app`, except for `client/src/main.ts`.
- **REQ-G002-007:** The substantial Learning feature shall be organized by dashboard, lessons, study, reports, and data-management workflows before technical responsibility.
- **REQ-G002-008:** Reusable visual foundations and canonical tokens shall live under `client/src/design-system`; cross-feature browser, identity, domain-contract, and persistence infrastructure shall live under `client/src/shared`.
- **REQ-G002-009:** Shared and design-system modules shall not import app or feature modules, and feature modules shall not import app implementations.
- **REQ-G002-010:** Lazy-loaded routes and every public route path shall remain unchanged.

## Module responsibility requirements

- **REQ-G002-011:** Every production module shall have one dominant responsibility represented by a purpose-named component, store, service, policy, query, validator, repository contract, or browser adapter.
- **REQ-G002-012:** Route pages shall coordinate route state and compose views; independent practice interaction, data operations, pure transformations, persistence mechanics, and browser I/O shall have narrower owners.
- **REQ-G002-013:** Complete user operations and learner-state persistence orchestration shall live in purpose-named services with explicit dependencies and typed outcomes; presentation modules shall not access IndexedDB directly.
- **REQ-G002-014:** Pure grading, alignment, validation, reporting, and state-transition decisions shall remain separate from Angular presentation state and browser I/O.
- **REQ-G002-015:** Direct `fetch`, IndexedDB, `document`, `URL`, `Blob`, file-reading, confirmation, and random-identifier access shall be isolated in purpose-named shared browser or persistence adapters.
- **REQ-G002-016:** Vague production folders or catch-all modules named `lib`, `utils`, `helpers`, `common`, `core`, `rules`, or feature-wide `types` shall not own unrelated behavior.
- **REQ-G002-017:** Production TypeScript modules over 300 physical lines, functions or Angular components over 150 physical lines, and CSS modules over 400 physical lines shall fail automated validation unless a cohesive declarative or generated exception is documented beside the override.

## Data and compatibility requirements

- **REQ-G002-018:** The database name `sisu-steps`, schema version `1`, store `learner-state`, state key `current`, transaction behavior, learner-state shape, backup shape, content catalog schema, topic-pack schema, and stable content IDs shall remain unchanged.
- **REQ-G002-019:** Grading normalization, Finnish diacritic significance, attempt/resume behavior, skipped-answer semantics, mistake correction, one/three/seven-day review scheduling, delayed mastery, reporting, backup validation, and scoped clearing shall remain unchanged.
- **REQ-G002-020:** Bundled content and content-generation tools shall remain separate from runtime learner data and shall not be modified by the architecture refactor.
- **REQ-G002-021:** The refactor shall add no backend, authentication, remote persistence, synchronization, analytics, external request beyond the existing same-origin static content load, or runtime AI call.

## Design and accessibility requirements

- **REQ-G002-022:** Canonical design tokens shall cover reusable color, spacing, typography, radius, shadow, layout, focus, control, and state values; feature styles shall use tokens before repeating raw reusable values.
- **REQ-G002-023:** App, feature, and design-system styles shall remain with their owners, retain selector scope and cascade order, and remain usable from 320 pixels upward.
- **REQ-G002-024:** Semantic landmarks, native controls, visible labels, keyboard operation, visible focus, reduced-motion behavior, practical touch targets, non-color status cues, and accessible live feedback shall be preserved or improved.
- **REQ-G002-025:** Destructive actions shall remain consequence-specific and deliberate; downloads and restores shall remain explicit local user actions with recoverable error feedback.

## Test and workflow requirements

- **REQ-G002-026:** Unit tests shall live outside production source under a mirrored `client/tests/unit` tree and shall use explicit Vitest imports.
- **REQ-G002-027:** Production and test TypeScript environments shall be configured separately, with unused locals and parameters rejected.
- **REQ-G002-028:** The client package shall expose lint, template lint, CSS lint, module-size, reachability, architecture, repository-format, production typecheck, test typecheck, unit-test, content validation, build, browser-test, and aggregate check commands runnable from the repository root.
- **REQ-G002-029:** Architecture validation shall reject shared/design-system back edges, feature-to-app imports, feature cycles, vague feature owners, browser APIs in pure feature owners, misplaced unit tests, and invalid workflow roots.
- **REQ-G002-030:** Reachability validation shall follow static imports, re-exports, lazy imports, TypeScript aliases, Angular component `templateUrl`/`styleUrl` metadata, CSS imports, and configured Angular global-style entrypoints.

## Acceptance criteria

- **REQ-G002-031:** Given dependencies are installed, `npm --prefix client run check` shall pass every non-browser quality gate.
- **REQ-G002-032:** Given an installed Chrome-compatible browser, `npm --prefix client run test:e2e` shall pass critical dashboard, lesson, study, reports, data, persistence, responsive, and keyboard journeys.
- **REQ-G002-033:** A maintainer shall be able to locate each workflow's route boundary, presentation, state orchestration, decisions, queries, operations, and styles under one immediately identifiable owner.
- **REQ-G002-034:** The final comparison against the retained baseline shall show no content-pack change, persistence-contract change, route change, or unexplained generated artifact.
- **REQ-G002-035:** The repository root shall own Git metadata, repository-wide ignore rules, shared editor configuration, the changelog, product guidance, and product specifications; client technical guidance and the Angular toolchain shall live under `client/`; and `server/` shall own only backend placeholder guidance until backend behavior is explicitly approved and specified.

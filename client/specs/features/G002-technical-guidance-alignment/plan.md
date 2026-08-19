# G002 — Technical guidance alignment

## Goal

Adopt the applicable engineering governance from `D:\\Repositories\\unnamed-app-ui-prototype` while preserving Sisu Steps' Angular, strict TypeScript, plain-CSS, browser-only, local-first architecture and every G001 learner workflow.

## Included capabilities

- A complete repository working agreement, architecture guide, design-system guide, source-adoption record, commit checklist, and refactor review record.
- A root Git workspace with product guidance at the root, the Angular application and client technical guidance under `client/`, backend placeholder guidance under `server/`, and workflow-first production ownership under `client/src/app`, `client/src/features`, `client/src/design-system`, and `client/src/shared`.
- Purposeful Angular modules with thin route pages, focused components, pure policies and queries, purpose-named application services, repository contracts, and browser adapters.
- Unit tests outside production source with a separate test TypeScript configuration.
- Angular-aware ESLint and template accessibility checks, Stylelint, Prettier, production and test typechecks, module-size, reachability, architecture, unit-test, content, build, and Playwright workflows.
- Canonical design tokens and feature-owned styles without changing the visual design.

## Scope

- Repository Markdown governance and G002 feature specifications.
- Behavior-preserving source and test organization.
- Decomposition of responsibility-heavy content validation, learner-state, session, reporting, backup, and page modules.
- Isolation of IndexedDB, fetch, local-file reading, download, identifier, and confirmation browser boundaries.
- Design-token extraction and stylesheet ownership.
- Validation of existing G001 behavior plus critical browser journeys.

## Non-goals

- No new learner workflow, content pack, exercise, route, label, or visual redesign.
- No change to Angular 21, strict TypeScript, native IndexedDB, versioned JSON content, or plain CSS.
- No change to the IndexedDB name, version, store name, state key, stored learner shape, backup version, or content schemas.
- No backend, remote database, account, authentication, cloud sync, analytics beacon, automatic external fetch, or runtime AI call.
- No edits to the source prototype.

## Affected areas

- Root `AGENTS.md`, `README.md`, `CHANGELOG.md`, `docs/`, and product `specs/`; client `AGENTS.md`, `README.md`, `docs/`, `specs/`, and `src/AGENTS.md`; and server placeholder guidance.
- `client/src/app`, `client/src/features`, `client/src/design-system`, and `client/src/shared`.
- `client/tests/unit`, `client/tests/e2e`, TypeScript/Angular/lint/format configuration, package scripts, architecture scripts, and the documented `server/` placeholder.

## Implementation plan

1. Record the prototype snapshot, conflicts, target decisions, and disposition of every source Markdown file.
2. Add Angular-specific architecture, persistence, design-system, accessibility, and commit guidance.
3. Move app composition, feature workflows, visual foundations, and cross-feature infrastructure to explicit owners.
4. Split broad models, validators, state orchestration, queries, policies, services, repositories, and browser adapters by dominant responsibility.
5. Move unit tests out of `src`, mirror production ownership, and use explicit Vitest imports.
6. Extract canonical tokens, colocate feature CSS, and preserve cascade, responsive behavior, focus, and reduced-motion behavior.
7. Add Angular-aware lint, module, reachability, architecture, format, type, unit, content, build, and browser-test gates.
8. Run the full gate and review the final tree for stale paths, behavior drift, storage drift, inaccessible markup, and new network boundaries.
9. Keep Git and product governance at the repository root, move the complete Angular workspace and client technical guidance under `client/`, retain documentation-only server guidance, and update root-invoked tooling and documentation paths.

## Risks

- Moving standalone components can break lazy route imports or test discovery.
- Splitting the learner-state workflow can alter atomic save ordering, mistake correction, or review scheduling if state transitions are not preserved exactly.
- Splitting validation can weaken cross-pack ID or core/extended coverage checks if context is lost.
- CSS ownership changes can alter cascade order or expose currently undefined custom properties.
- Angular template linting can expose real accessibility defects that require small markup corrections.
- The target has no Git history; the retained baseline copy is required for an auditable pre/post comparison.

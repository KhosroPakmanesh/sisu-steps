# G009 — Bounded pack content loading

## Goal

Keep client startup work and steady-state content memory proportional to the catalog summaries and the packs a learner is actively using, while preserving current routes, content, scoring, current-format persistence and backups, and final rendered appearance.

This feature supersedes only the eager runtime-loading behavior documented by G006. Pack-owned JSON remains the canonical deployed source and is still validated directly.

## Scope

- Extend each pack manifest with the small lesson and test summaries required by catalog, progress, history, and navigation decisions.
- Initialize the application from `content/index.json`, pack manifests, and learner state without fetching lesson or test fragments.
- Load and validate a complete pack when a workflow opens it.
- Keep at most two successfully loaded packs in an in-memory least-recently-used cache and deduplicate concurrent loads.
- Build per-pack maps for lesson, test, and exercise lookup when a pack is assembled.
- Keep the incomplete application shell hidden during startup so its construction cannot visibly shift the footer or routed paper.
- Keep one reusable full-viewport pencil-loading overlay visible from the first HTML paint until the initial routed page is fully renderable, including pack content required by a direct URL, and reuse it for later uncached route loads.
- Build the Angular shell behind that overlay while keeping it hidden, inert, and absent from the accessibility tree; reveal it atomically without a second shell loader.
- Rely on IndexedDB's structured-clone operation instead of cloning learner state immediately before a write.
- Cover startup request boundaries, pack loading, cache eviction, retry, validation, and unchanged workflows with automated tests.

## Non-goals

- Changing authored lesson, test, exercise, or stable identifier content.
- Changing routes, study selection, scoring, progress, history, note, correction, or current-format backup behavior.
- Changing the learner-state schema, backup schema, or IndexedDB database/store layout.
- Adding a backend dependency, generated content copy, service worker, deployment compression configuration, or analytics.
- Redesigning, restyling, or replacing the existing loading and loaded views.

## Design

1. The catalog service loads the catalog and all registered manifests, validates their summary metadata, and exposes lightweight topic-pack summaries.
2. The learning state store aligns persisted state against those summaries and remains the workflow-facing entry point for pack access.
3. A pack content repository owns fragment I/O, full-pack validation, indexed read models, in-flight request deduplication, and the two-entry LRU cache.
4. Pack-specific pages and services request the selected pack before using lessons, tests, or exercises. Catalog-wide operations continue from manifest summaries.
5. Explicit full-backup restoration may load every pack because full exercise validation is required at that user-invoked boundary; the LRU still retains only two packs afterward.
6. The initial HTML owns the application's only self-styled pencil-loading overlay outside the Angular root. Angular builds each pending route behind it while the root remains hidden, inert, and excluded from the accessibility tree. Each route exposes its render readiness; a shared browser adapter hides the overlay and reveals the root together on the next animation frame. The loader stays in the document while idle so later uncached routes and catalog retry reuse the same element; route templates and the shell contain no competing loader markup or styling.
7. Persisted learner state is accepted only in the complete current shape. Unsupported stored state resets to the current empty state, while unsupported backups are rejected before replacement; no legacy data is remapped.

## Delivery

- Update manifest models, validators, source tooling, and all checked-in manifests together.
- Introduce the repository and summary-aware queries/policies without changing public product behavior.
- Adapt unit, integration, and end-to-end fixtures to the same loading boundary.
- Run `npm --prefix client run check` from the repository root and `npm --prefix client run test:e2e` because startup, persistence-adjacent code, routes, and primary workflows are affected.

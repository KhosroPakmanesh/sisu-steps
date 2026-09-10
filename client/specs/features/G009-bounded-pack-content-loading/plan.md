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
- Reserve the application shell's route area during startup so the footer does not jump when content resolves.
- Show the existing pencil-loading presentation from the first HTML paint through initial lazy-route activation so the workbook folder never appears incomplete.
- Keep the initial shell and catalog loading papers aligned with the visible folder hardware without changing loaded-page dimensions.
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
6. The initial HTML owns a small self-styled pencil-loading presentation until Angular replaces it. The shell then owns the same loading-card state until the first lazy route activates, after which the route's existing data-loading state takes over. A loading-only page modifier fills the folder's reserved route height and centers the card while visible hardware is present; final loaded-page CSS remains unchanged.
7. Persisted learner state is accepted only in the complete current shape. Unsupported stored state resets to the current empty state, while unsupported backups are rejected before replacement; no legacy data is remapped.

## Delivery

- Update manifest models, validators, source tooling, and all checked-in manifests together.
- Introduce the repository and summary-aware queries/policies without changing public product behavior.
- Adapt unit, integration, and end-to-end fixtures to the same loading boundary.
- Run `npm --prefix client run check` from the repository root and `npm --prefix client run test:e2e` because startup, persistence-adjacent code, routes, and primary workflows are affected.

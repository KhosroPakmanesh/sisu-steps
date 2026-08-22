# Browser-local persistence architecture

Native IndexedDB is Sisu Steps' only runtime database. Bundled lessons and exercises remain versioned static JSON; mutable learner data remains separate. Small presentation-only preferences may use browser key-value storage behind a purpose-named adapter.

## Canonical contract

- Database name: `sisu-steps`.
- Schema version: `1`.
- Store name: `learner-state`.
- State key: `current`.
- Persisted record contracts: `client/src/shared/domain/learner-state.models.ts`.
- Repository contract: `client/src/shared/persistence/learner-state.repository.ts`.
- Native adapter: `client/src/shared/persistence/indexeddb/indexeddb-learner-state.repository.ts`.
- Feature state composition: `client/src/features/learning/shared/state/learning-state.store.ts`.

## Rules

- Treat the database name, version, store, key, transaction mode, and persisted shapes as durable public data contracts.
- Add a versioned migration before changing a persisted shape; never reinterpret incompatible learner history only at render time.
- Preserve topic, test, lesson, exercise, attempt, session, correction, and parallel-review identifiers.
- Save each complete learner-state transition in one read-write transaction.
- Close stale connections on `versionchange` so another tab can upgrade safely.
- Surface initialization and write failures as safe user-facing errors without exposing learner answers or raw private data.
- Do not log backup bodies, learner answers, lesson completion data, or imported files.

## Dependency boundary

- Feature services depend on the repository contract and the Learning state store, never on native IndexedDB details.
- The app layer provides the native repository adapter through Angular dependency injection.
- Shared persistence remains product-operation neutral; lesson completion, session, reporting, backup, and clearing behavior belongs to the owning Learning workflow.
- Pure policies, validators, queries, and mappers must not access browser globals.
- The Appearance choice is presentation-only, uses `shared/browser/appearance-preference.adapter.ts`, and must never enter learner state or backup data.

## Content and learner data

- `client/public/content/index.json` and its listed packs are immutable bundled input for a deployed version.
- Learner state stores only progress and stable references, never executable content.
- Content version alignment clears only incompatible progress for the changed or removed pack.
- Invalid backup data must be rejected before replacing existing state.

## Recoverability and security boundary

The current browser profile and origin are the privacy and ownership boundary. IndexedDB is not encrypted and can be removed by browser/profile cleanup. Versioned JSON export is the supported portable backup. There is no authentication, synchronization, or remote authorization. Any future remote boundary requires an explicit constitution and feature-spec change.

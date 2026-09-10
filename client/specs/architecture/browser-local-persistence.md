# Browser-local persistence architecture

Native IndexedDB is Sisu Steps' only runtime database. Bundled lessons and exercises remain versioned static JSON; mutable learner data remains separate. Small presentation-only preferences may use browser key-value storage behind a purpose-named adapter.

## Canonical contract

- Database name: `sisu-steps`.
- Schema version: `1`.
- Store name: `learner-state`.
- State key: `current`.
- Persisted record contracts: `client/src/features/learning/shared/state/learner-state.models.ts`.
- Repository contract: `client/src/features/learning/shared/state/persistence/learner-state.repository.ts`.
- Native adapter: `client/src/features/learning/shared/state/persistence/indexeddb/indexeddb-learner-state.repository.ts`.
- Feature state composition: `client/src/features/learning/shared/state/learning-state.store.ts`.

## Rules

- Treat the database name, version, store, key, transaction mode, and persisted shapes as durable public data contracts.
- Do not add compatibility migrations, fallback readers, legacy aliases, or transitional persisted shapes. When the current state contract cannot read a stored record, reset it to the current empty state; reject an unsupported backup before replacing current data.
- Preserve topic, test, lesson, exercise, attempt, session, correction, and parallel-review identifiers.
- Save each complete learner-state transition in one read-write transaction.
- Close stale connections on `versionchange` so another tab can upgrade safely.
- Surface initialization and write failures as safe user-facing errors without exposing learner answers or raw private data.
- Do not log backup bodies, learner answers, lesson completion data, or imported files.

## Dependency boundary

- Feature services depend on the repository contract and the Learning state store, never on native IndexedDB details.
- The app layer provides the native repository adapter through Angular dependency injection.
- Learning-shared persistence remains product-operation neutral; lesson completion, sessions, derived progress statistics, backup, and clearing behavior belongs to the owning learning workflow.
- Pure policies, validators, queries, and mappers must not access browser globals.
- The Appearance choice is presentation-only, uses `shared/browser/appearance-preference.adapter.ts`, and must never enter learner state or backup data.

## Content and learner data

- `client/content/` is immutable bundled input for a deployed version; Angular copies the same files to `/content/`, and the browser assembles manifests and fragments only in memory.
- Learner state stores only progress and stable references, never executable content.
- Content version alignment clears a changed pack's incompatible progress. A stored version map containing a pack that is no longer installed resets the complete learner state rather than remapping retired data.
- Invalid backup data must be rejected before replacing existing state.

## Recoverability and security boundary

The current browser profile and origin are the privacy and ownership boundary. IndexedDB is not encrypted and can be removed by browser/profile cleanup. Versioned JSON export is the supported portable backup. There is no authentication, synchronization, or remote authorization. Any future remote boundary requires an explicit constitution and feature-spec change.

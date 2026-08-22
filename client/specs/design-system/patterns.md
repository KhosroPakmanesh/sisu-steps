# UI patterns

## Deliberate local action

Use a clearly labelled action for backup download, restore, answer reveal, lesson completion, and progress clearing.

- State what will happen.
- Do not imply cloud synchronization or remote storage.
- Preserve a cancel path for destructive confirmation.
- Announce success or failure accessibly.

## Destructive confirmation

- Name the test, topic, or complete learner dataset affected.
- State which attempts, sessions, mistakes, lessons, corrections, and mastery records will be removed.
- State that bundled lessons and exercises remain available.
- State when the action cannot be undone without a backup.

## Backup restore

- Treat selected JSON as untrusted input.
- Parse and validate the complete backup and installed content references before any state replacement.
- Preserve current learner state when validation fails.
- Reset the file input after success or failure so the same file can be selected again.

## Answer reveal and feedback

- Keep **Show answer** visible before submission and pair it with `Alt+A`.
- Explain that reveal records a skip, grants no score credit, and does not create or resolve a mistake.
- Use text plus an icon/symbol for correct, incorrect, and skipped states.
- Show the correct answer and first-principles explanation before continuing.

## Empty and error states

- State what is missing or failed.
- Preserve learner input when possible.
- Offer the next useful recovery action.
- Never expose stack traces, browser internals, backup contents, or learner answers in user-facing errors.

## Topic catalog and learning map

- Keep home at catalog level: one compact summary per installed topic pack plus one prominent continue-learning action.
- Put an individual pack's objectives, Focused/Review sequence, lesson progress, and test actions on its topic route. Communicate the two learning groups through section headings instead of repeating classification badges on every test card.
- Do not render lesson teaching sections or multiple expanded test sequences on home.
- Name progress truthfully: count distinct attempted tests as **tests tried** unless a separate completion threshold is specified.
- When a saved session references installed content, prefer resuming it; otherwise recommend the first untried test in catalog and authored order.

## Appearance choice

- Offer **Automatic**, **Light**, and **Dark** as a native labelled radio group in the application shell; each option may include a non-essential paper swatch.
- Let Automatic follow `prefers-color-scheme`, including changes made while the app is open.
- Store only explicit Light or Dark overrides; removing an override returns to Automatic.
- Treat missing, invalid, or unavailable browser storage as Automatic and never block learning because an appearance preference cannot be read or saved.
- Keep the chosen appearance independent of learner progress, IndexedDB, backup, restore, and clear-history behavior.

## Stationery controls

- Present primary navigation as subject-divider tabs without changing link order, wording, destinations, or active-page semantics.
- Present actions as restrained notebook labels or teacher stamps; primary actions remain the strongest and destructive actions remain explicitly labelled.
- Present answer radios as pencil-marked circles, text answers as ruled fields, and word-order buttons as movable vocabulary cards while preserving native form behavior.
- Present progress as printed ruler scales and state badges as teacher marks, always paired with readable text or numbers.
- Present reports as ledgers and data actions as archive labels without hiding values, local-storage scope, restore behavior, or clearing consequences.
- Use the physical metaphor only as a visual aid. Do not require object recognition to discover, understand, or operate a control.

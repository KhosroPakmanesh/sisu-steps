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
- Put an individual pack's objectives, core/extended sequence, lesson progress, and test actions on its topic route.
- Do not render lesson teaching sections or multiple expanded test sequences on home.
- Name progress truthfully: count distinct attempted tests as **tests tried** unless a separate completion threshold is specified.
- When a saved session references installed content, prefer resuming it; otherwise recommend the first untried test in catalog and authored order.

# G007 implementation plan

## Goal

Keep progress statistics and learner-data controls usable as the installed language-pack catalog grows by separating the compact Stats overview from each pack's detailed history.

## Requirement slice

- `REQ-G007-001`–`REQ-G007-013`
- Refines the navigation and presentation of `REQ-G001-020`–`025`, `REQ-G001-051`, `REQ-G001-074`, and `REQ-G001-089` without changing their backup, progress-statistics, or clearing semantics.

## Included

- Two primary workbook destinations named **Notebook** and **Stats**.
- A new lazy `/stats` route whose **Statistics** hero pairs its introduction with cumulative all-topic statistics, centers the handwritten progress note beneath them, and presents **Backup & restore** before **Progress by topic**.
- One compact Stats card per installed topic pack with attempts, average, unresolved mistakes, and a dedicated-page action.
- The same validated, catalog-owned group sections used by the topic catalog, preserving authored group and pack order.
- A new lazy `/stats/:topicId` route with pack-scoped summary statistics, authored test rows, mistake practice, test-history clearing, and topic-history clearing.
- Removal of the former `/reports` and `/data` routes without compatibility redirects.
- Existing stationery components, semantic hierarchy, spacing tokens, confirmation sheets, responsive patterns, and the complete bound-sheet construction around the three original learner-data operations. G008 adds a separate Drive container after it.

## Non-goals

- Changes to progress calculations, scoring, grading, review scheduling, or mistake semantics.
- Changes to IndexedDB records, backup shape, restore validation, or clearing consequences.
- New Finnish lessons, tests, exercises, or changes to existing learning-content semantics.
- Accounts, synchronization, backend behavior, analytics, or runtime network calls other than G008's explicit manual Google Drive recovery actions.
- Compatibility redirects for the removed Reports or Data & backup routes.

## Implementation steps

1. Add typed Stats routes and replace the primary navigation labels and destinations.
2. Extract the existing backup/restore/clear-all archive into a reusable Stats-owned composition, retain the complete ruled, clipped, bound container around its actions, and preserve the data-management services.
3. Build the Stats overview with a reference-style cumulative assignment sheet in the hero, the centered handwritten progress note, the archive first, and a responsive grouped topic summary grid second.
4. Move the progress ledger into a topic-scoped Stats page and place existing test/topic clearing actions with their owning statistics.
5. Add unknown-topic recovery, focused component coverage, and end-to-end navigation, clearing, responsive, and keyboard checks.
6. Update design-system guidance, validation evidence, and the changelog.

## Risks

- Destructive actions placed beside statistics must retain consequence-specific confirmation and must not become easier to trigger accidentally.
- Removing old routes intentionally breaks old bookmarks; the wildcard route must not masquerade as a compatibility redirect.
- Combining progress statistics and clearing presentation must not combine or broaden their underlying data operations.
- Stats and Notebook must consume the same validated catalog-owned groups so their pack order and labels cannot diverge.
- Reusing the wide ledger must preserve readable mobile reflow and practical action targets from 320 pixels upward.

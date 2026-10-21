# G007 implementation plan

## Goal

Keep progress statistics and learner-data controls usable as the installed language-pack catalog grows by separating the compact Stats overview from each pack's detailed history.

## Requirement slice

- `REQ-G007-001`–`REQ-G007-013`
- Refines the navigation and presentation of `REQ-G001-020`–`025`, `REQ-G001-051`, `REQ-G001-074`, and `REQ-G001-089` without changing their backup, progress-statistics, or clearing semantics.

## Included

- Three primary workbook destinations named **Notebook**, **Stats**, and **Backup**, using blue, yellow, and green tabs.
- A new lazy `/stats` route whose **Statistics** hero pairs its introduction with cumulative all-topic statistics, centers the handwritten progress note beneath them, and presents **Progress by topic** without global backup controls.
- A lazy `/backup` route that composes the existing **Backup & restore** and **Google Drive checkpoint** sections intact, including Clear all history and all Drive management actions. The header cloud shortcut targets and focuses the moved Drive heading.
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

1. Keep typed Stats routes and add the lazy typed Backup route and green third primary tab after Stats.
2. Compose the existing backup/restore/clear-all archive and following Drive checkpoint component on the learner-data-owned Backup page, preserving their complete containers, contents, behavior, services, and stored data.
3. Build the Stats overview with a reference-style cumulative assignment sheet in the hero, the centered handwritten progress note, and a responsive grouped topic summary grid. Remove global data controls and adjust only the introduction that referred to them.
4. Move the progress ledger into a topic-scoped Stats page and place existing test/topic clearing actions with their owning statistics.
5. Preserve unknown-topic recovery, move archive composition coverage to Backup, and update end-to-end navigation, header focus, backup/restore, clearing, responsive, and keyboard checks.
6. Update design-system guidance, validation evidence, and the changelog.

## Risks

- Destructive actions placed beside statistics must retain consequence-specific confirmation and must not become easier to trigger accidentally.
- Removing old routes intentionally breaks old bookmarks; the wildcard route must not masquerade as a compatibility redirect.
- Combining progress statistics and clearing presentation must not combine or broaden their underlying data operations.
- Stats and Notebook must consume the same validated catalog-owned groups so their pack order and labels cannot diverge.
- Reusing the wide ledger must preserve readable mobile reflow and practical action targets from 320 pixels upward.

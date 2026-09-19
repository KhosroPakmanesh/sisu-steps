# G007 requirements

## Navigation requirements

- **REQ-G007-001:** Primary workbook navigation shall contain exactly two destinations in order: **Notebook**, which opens the existing topic catalog, and **Stats**, which opens `/stats`.
- **REQ-G007-002:** The former `/reports` and `/data` routes shall be removed without redirects or compatibility aliases; `/stats` and `/stats/:topicId` shall be the only Stats routes.
- **REQ-G007-003:** Both Stats routes shall remain lazy-loaded and their segments and path construction shall remain centralized in typed route configuration.

## Stats overview requirements

- **REQ-G007-004:** `/stats` shall use **Statistics** as its page heading beneath **Your progress and data**. Its hero shall place a cumulative all-topic summary in the established attached assignment-sheet style opposite the introduction when space permits, center **progress, not perfection** beneath the hero content, and then present the existing **Backup & restore** archive before the **Progress by topic** catalog.
- **REQ-G007-005:** **Backup & restore** shall retain, in order, **Download backup**, **Restore backup**, and **Clear all history**, including existing validation, confirmation, feedback, and learner-data consequences. Its section heading shall sit above and outside one complete warm ruled-paper container holding all three operations, matching the hierarchy of **Progress by topic**; the container shall retain its clipped outline, left binding marks, and layered right paper edge.
- **REQ-G007-006:** **Progress by topic** shall show the installed packs' shared level range once at the top of the topic container, then present every installed topic pack once in authored order as a compact card showing the pack title, completed-attempt count, average score, unresolved-mistake count, and a **View stats** link. Catalog-owned groups shall render as labeled sections matching the home catalog's authored group and pack order so the two pack lists do not diverge.
- **REQ-G007-007:** Selecting **View stats** shall open `/stats/:topicId` for only the selected pack without rendering other packs' test ledgers.

## Topic Stats requirements

- **REQ-G007-008:** A valid topic Stats page shall show the selected pack's title and level, an **At a glance** summary, every authored test in order under **Test results**, and the existing topic-scoped mistake-practice action when unresolved mistakes exist.
- **REQ-G007-009:** Every test row shall show its existing first, latest, best, and average percentages; attempts; unresolved mistakes; corrected, mastered, independent-correct, and skipped counts; and an adjacent **Clear test history** action.
- **REQ-G007-010:** **Clear test history** shall use the existing confirmation sheet and clearing operation, shall retain shared lesson completions and private notes, and shall refresh the visible pack statistics after successful clearing.
- **REQ-G007-011:** The topic Stats page shall provide one compact **This topic only** clearing row as the final row inside the complete test ledger and before optional mistake practice, matching the test-row hierarchy while covering the ledger's punched gutter and using the warm warning-paper color to distinguish its wider scope. It shall not add a separate large visible management heading. Its action shall remain labelled **Clear topic history**, use the existing confirmation sheet, and remove that topic's attempts, unfinished sessions, mistakes, corrections, mastery, lesson completions, and topic/lesson notes while preserving other packs and bundled content.
- **REQ-G007-012:** An unknown topic ID shall show a recoverable page-level error with a native link back to **All stats**.

## Quality requirements

- **REQ-G007-013:** Stats shall reuse the existing complete bound backup archive, topic-card grid, assignment summary, ledger, cut-paper action, confirmation, heading hierarchy, and canonical spacing patterns; preserve semantic headings, tables, links, buttons, focus, non-color labels, reduced motion, and remain usable without horizontal overflow from 320 pixels upward.

## Acceptance criteria

- Given any route, when primary navigation is inspected, then only **Notebook** and **Stats** are present in that order.
- Given `/reports` or `/data`, when navigation resolves, then no legacy Reports or Data page or redirect is provided.
- Given `/stats`, when content is read in document order, then **Backup & restore** precedes **Progress by topic**.
- Given the Statistics hero, when learner state changes, then its cumulative completed attempts, average score, and unresolved mistakes truthfully summarize all installed topics; the handwritten progress note remains centered beneath the introduction and summary.
- Given **Backup & restore**, when its visual structure is inspected, then its heading sits immediately above and outside one complete ruled, clipped, bound-paper container containing all three action rows.
- Given the backup archive followed by **Progress by topic**, when their layout is inspected, then the inter-section gap uses balanced canonical section spacing rather than either crowding the heading or recreating the former large empty band.
- Given multiple installed packs, when `/stats` opens, then one compact card per pack shows truthful attempts, average, and unresolved mistakes.
- Given a selected pack, when **View stats** is activated, then only that pack's summary and authored test ledger appear.
- Given confirmed test-history clearing, when the operation completes, then that test's progress values reset while shared lesson completions, private notes, other tests, and other packs remain unchanged.
- Given confirmed topic-history clearing, when the operation completes, then the selected topic's learner records and notes are removed while other packs and bundled learning content remain unchanged.
- Given an unknown Stats topic, when the page opens, then a recoverable error and **All stats** link are visible.

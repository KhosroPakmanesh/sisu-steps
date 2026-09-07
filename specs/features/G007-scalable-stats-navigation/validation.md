# G007 validation

## Automated validation

- **VAL-G007-001** (`REQ-G007-001`–`003`): Shell and routing tests verify the two Notebook/Stats destinations, new lazy Stats routes, centralized paths, and absence of legacy route definitions or redirects.
- **VAL-G007-002** (`REQ-G007-004`–`007`): Stats overview component and browser tests verify the **Statistics** heading, cumulative all-topic assignment sheet, centered progress note, archive-before-catalog order, the external **Backup & restore** section heading, the complete ruled/clipped/bound actions container, balanced canonical inter-section spacing, one shared container-level range, unchanged global operations, one authored-order card per pack without repeated level labels, truthful compact metrics, and pack-specific links.
- **VAL-G007-003** (`REQ-G007-008`, `009`): Topic Stats tests verify selected-pack-only summary and authored ledger order, complete existing report fields, adjacent clear-test actions, and optional mistake practice.
- **VAL-G007-004** (`REQ-G007-010`, `011`): Component, service, and browser tests verify the compact warm-warning **This topic only** final ledger row before optional mistake practice, its coverage of the punched gutter, retained **Clear topic history** label, safe confirmation, cancellation, focused test clearing, complete topic clearing, visible statistic refresh, and isolation of unaffected lessons, notes, tests, and packs.
- **VAL-G007-005** (`REQ-G007-012`): Topic Stats component tests verify recoverable unknown-topic presentation and an **All stats** link.
- **VAL-G007-006** (`REQ-G007-013`): Lint, typechecks, build, unit tests, and Playwright verify semantic hierarchy, native controls, visible focus, static reduced motion, 320/768/1440-pixel reflow, no horizontal overflow, and reuse of established material and spacing recipes.

## Manual checks

- Open `/stats` at 320, 768, and 1440 pixels in Day and Night and confirm the cumulative assignment sheet reflows beside/below the introduction, the progress note remains centered, the **Backup & restore** heading sits outside its complete ruled, clipped, left-bound, layered-edge actions container, the following gap has balanced section breathing room, and **Progress by topic** shows one shared level range above its cards.
- Open a topic Stats page at each width and confirm every ledger value and clearing action remains readable and keyboard reachable.
- Cancel and confirm one test clear, one topic clear, and clear-all; verify consequence wording, safe initial focus, focus return, live feedback, and unaffected data.
- Enter an unknown Stats topic ID and confirm the error returns to **All stats**.
- Confirm `/reports` and `/data` do not expose or redirect to legacy pages.

## Execution evidence

- `npm.cmd run check` plus an independent `npm.cmd test -- --no-watch --no-progress` rerun — passed on 2026-09-07: lint, Stylelint, module-size, dead-code, architecture, formatting, application and test typechecks, six-pack content validation, production build, and 128 unit tests. The independent unit rerun was used after the chained command's Vitest worker was terminated by the environment following the long browser run.
- `npx.cmd playwright test --workers=2` — passed on 2026-09-07: 187 passed and 26 intentionally breakpoint-skipped checks across Chromium mobile, tablet, and wide projects in Day and Night modes.

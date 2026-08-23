# G005 validation

## Automated validation

- **VAL-G005-001** (`REQ-G005-001`–`005`): Shell unit and browser tests verify semantic unnumbered navigation, one continuous header control row, and the Automatic, Day, and Night labelled radio choices with an accessible group name and unchanged preference values.
- **VAL-G005-002** (`REQ-G005-006`–`011`): Existing component and browser workflows operate actions, choices, text fields, selects, word tokens, progress, file controls, feedback, and focus after the object-control restyle.
- **VAL-G005-003** (`REQ-G005-012`–`016`, `REQ-G005-019`): Browser tests open every route scene across configured mobile, tablet, and wide projects and verify there is no horizontal page overflow.
- **VAL-G005-004** (`REQ-G005-017`): Unit or browser coverage verifies the confirmation sheet's consequence text, safe initial focus, Escape/Cancel behavior, focus return, and confirm-only execution.
- **VAL-G005-005** (`REQ-G005-018`): A reduced-motion browser check verifies animations are disabled without delaying navigation or state changes.
- **VAL-G005-006** (`REQ-G005-019`): ESLint and Angular template accessibility lint, Stylelint, module-size and architecture checks, Prettier, production/test typechecks, content validation, production build, unit tests, and Playwright complete without regression.
- **VAL-G005-007** (`REQ-G005-010`, `020`, `025`, `026`): Component and browser checks verify ruler-only progress, readable static/animated teacher stamps, selected/focus-within tab and card reactions, ruled non-handwritten input, and reduced-motion suppression.
- **VAL-G005-008** (`REQ-G005-022`): Study component and browser tests verify choice clearing, typed-draft clearing, word-order undo/clear, and no stored-state mutation before submission.
- **VAL-G005-009** (`REQ-G005-023`, `REQ-G001-102`–`106`): Topic and lesson browser workflows verify the sticky-note field, limit, save/removal status, persistence after navigation, backup/restore inclusion, and clearing semantics.
- **VAL-G005-010** (`REQ-G005-024`): Report component and browser checks operate the native paper-clipped checkbox by pointer and keyboard and verify visible-row filtering without changing report values.
- **VAL-G005-011** (`REQ-G005-027`): Template and browser inspection verify that the stationery refinement introduces no accordion, disclosure, collapsible panel, expandable toolbar, or hidden tool tray.

## Manual checks

- Inspect the catalog, topic map, single and cumulative lessons, multiple-choice, typed-answer, word-order, results, reports, and data settings in Day and Night appearances.
- At 320, 768, and 1440 pixels, confirm the desktop becomes a pocket notebook where necessary and no page, object, label, dialog, or action overlaps, clips, or causes horizontal scrolling.
- Confirm the unnumbered subject dividers and Automatic, Day, and Night desk-light choices form one continuous header row without visible group headings, and that all stationery controls remain understandable without relying on the physical metaphor.
- Use only the keyboard to navigate, change appearance, answer each exercise type, open and cancel the confirmation sheet with Escape, and restore focus to the initiating action.
- Confirm Day and Night text, focus, state, destructive, and disabled combinations meet WCAG 2.2 AA and remain meaningful without color.
- Confirm reduced motion removes page, tab, paper, stamp, pencil, token, desk-light, and parallax movement while preserving immediate state changes.
- Confirm no topic appears locked and no point, reward, currency, streak, life, leaderboard, or other gameplay behavior is introduced.
- Confirm no remote assets, external fonts, route changes, grading changes, or unapproved data-contract changes occur; the only learner-state extension is `REQ-G001-102`–`106`.
- Confirm every progress surface is a ruler without a pencil marker; stamp feedback remains readable and static under reduced motion.
- Use correction/eraser actions for choice, text, and word-order exercises without submitting.
- Save and remove topic and lesson sticky notes, navigate away and back, and verify backup, restore, topic clearing, and all-history clearing behavior.
- Operate **Show studied tests only** with pointer and keyboard and confirm its paper clip does not obscure the checkbox, label, or focus outline.
- Confirm no new section or stationery tool can be collapsed or expanded.

## Completion evidence

- Record complete quality-gate, production build, unit, and Playwright results.
- Record visually inspected routes, appearances, viewport widths, and reduced-motion behavior.
- Record confirmation-dialog keyboard results and any deferred assistive-technology or browser-specific follow-up.

No generated learning content or AI quality-evaluation layer is part of this presentation-only feature.

### 2026-08-22 implementation

- `npm run check`: passed ESLint and Angular template accessibility lint, Stylelint, purposeful-module size, source reachability, architecture boundaries, repository-wide Prettier, production and test TypeScript checks, content validation, production build, and all 77 unit tests.
- Production build: passed without CSS-budget warnings at a 75.89 kB estimated initial transfer size.
- Playwright: all 27 runs passed across 320-pixel mobile, 768-pixel tablet, and 1440-pixel wide Chromium projects. Coverage includes semantic navigation, native answer controls, word cutouts, progress, backup, session recovery, Automatic/Day appearance behavior, the confirmation sheet's safe initial focus, Escape cancellation, focus return, confirm-only execution, reduced motion, and horizontal-overflow checks.
- Visual inspection: Day catalog, lesson two-page spread, study sheet, data archive, and confirmation sheet plus Night catalog, topic map, and reports were inspected at 1440 pixels; Day lesson and Night catalog pocket-notebook layouts were inspected at 320 pixels. All inspected pages reported no horizontal overflow and no browser console warnings.
- Motion review: Angular route view transitions are non-blocking, and `prefers-reduced-motion` collapses the desk-light and shared interaction animations to an immediate static state while routed content remains available.
- Behavior review: no route, Finnish content, grading, session, attempt, mistake, review, report value, backup payload, restore validation, IndexedDB schema, content version, or clearing consequence changed. Visible Day and Night labels continue to use the existing `light` and `dark` preference values.
- Deferred manual follow-up: a full assistive-technology walkthrough and browser-specific contrast audit remain advisable; affected interactions use semantic links, buttons, radios, inputs, selects, file inputs, progress elements, and a native dialog and passed automated keyboard/accessibility checks.

### 2026-08-22 unified action refinement

- Refined `REQ-G005-006` and `REQ-G005-009` so primary, secondary, compact, text, review, file, dialog, disabled, and destructive actions share one cut-paper silhouette, inset cut line, folded corner, paper depth, and lift/press behavior. Variants now communicate hierarchy through paper tint, ink, edge accent, internal marks, and explicit wording.
- Computed-style and screenshot checks covered Day catalog actions, selected and disabled Night study actions, the complete 320-pixel data page, backup/restore controls, per-test/topic/all-history clearing, and the confirmation sheet. Every inspected `.button` reported one shared clip path, no route had horizontal overflow, and no browser console warnings appeared.
- `npm run check`: passed the complete client gate, including the production build without CSS-budget warnings at a 75.77 kB estimated initial transfer size and all 77 unit tests.
- Playwright: all 27 runs passed with one worker across 320-pixel mobile, 768-pixel tablet, and 1440-pixel wide Chromium projects. Parallel runs encountered isolated worker-contention timeouts on two unrelated existing navigation assertions; each exact case passed immediately alone before the complete serial matrix passed.
- Behavior review: button and link elements, labels, disabled states, focus behavior, action order, routing, grading, persistence, backup, restore, and clearing consequences remain unchanged.

### 2026-08-22 compact header refinement

- Removed the visible numeric prefixes from Topics, Reports, and Data & backup, and removed the visible Appearance and Desk light headings. The fieldset retains the accessible name Appearance, while all six visible controls occupy one continuous row.
- Responsive visual and computed-layout checks covered 320-, 768-, and 1440-pixel Day headers. Every viewport reported six controls with a zero-pixel top-position spread, no page overflow, no visible removed labels, and no browser console errors. At 320 pixels, only the header strip scrolls horizontally so the single row and document width are both preserved.
- `npm run check`: passed the complete client gate, including the production build without CSS-budget warnings at a 75.72 kB estimated initial transfer size and all 77 unit tests.
- Playwright: all 27 runs passed with one worker across 320-pixel mobile, 768-pixel tablet, and 1440-pixel wide Chromium projects. Coverage verifies the unnumbered navigation, accessible Appearance group, absence of Desk light, six-control row, unchanged appearance selection, and no horizontal page overflow.
- Behavior review: navigation order, link destinations, active states, radio semantics, preference values, local-memory behavior, routes, learning behavior, and persistence contracts remain unchanged.

### 2026-08-22 complete object-surface refinement

- Replaced the remaining generic repeated surfaces with documented notebook objects: clipped assignments, printed record strips, bound topic covers, taped objectives, punched test cards, binder tabs, flashcards, vocabulary index cards, practice sheets, pinned targets, perforated answer slips, sentence strips, word pockets, correction slips, foldouts, ledger stamps, archive strips, and loose drafting sheets. Reports and Data & backup now use folded-paper return links.
- `npm run check`: passed ESLint and Angular template accessibility lint, Stylelint, purposeful-module size, source reachability, architecture boundaries, repository-wide Prettier, production and test TypeScript checks, content validation, production build, and all 77 unit tests.
- Production build: passed without CSS-budget warnings at a 77.31 kB estimated initial transfer size; the complete production stylesheet is 9.12 kB estimated transfer size.
- Playwright: all 30 runs passed with one worker across 320-pixel mobile, 768-pixel tablet, and 1440-pixel wide Chromium projects. New coverage verifies clipped catalog, topic-map, and answer surfaces; square notebook objective labels; and folded Reports and Data & backup return links while retaining native control semantics and keyboard operation.
- Visual inspection: Day catalog, topic map, single and cumulative lesson pages, study sheet, reports, and data archive were inspected on wide or 320-pixel layouts; Night catalog, topic map, and study sheet were inspected at 1440 pixels. Text remained readable, the corrected assignment slip retained comfortable ink contrast, and the physical silhouettes remained distinct without obscuring labels or state.
- Behavior review: no routes, learning sequence, Finnish content, form-control semantics, keyboard behavior, grading, progress, persistence, backup, restore, clearing consequence, or stored-data contract changed. The refinement is presentation-only.

### 2026-08-23 stationery interaction refinement

- Implemented `REQ-G005-020` and `REQ-G005-022`–`027`: readable state stamps; safe choice, text, and word-order correction controls; attached topic/lesson notes; a native paper-clipped report filter; stronger active/focus states; ruled-input feedback; and no new collapse/expand behavior. `REQ-G005-021` was withdrawn and its pencil-case toolbar was removed at the learner's request.
- Updated `REQ-G005-010` and every progress template to use ruler-only progress. No `.progress-pencil` element or progress-pencil CSS remains.
- `npm --prefix client run check` passed ESLint and Angular template accessibility lint, Stylelint, module-size, source-reachability, architecture, repository formatting, production/test typechecks, catalog validation, the production build at a 77.68 kB estimated initial transfer size, and all 85 unit tests after the pencil-case withdrawal.
- Playwright passed all 33 cases with one worker across 320-pixel mobile, 768-pixel tablet, and 1440-pixel wide Chromium projects after the withdrawal. Coverage includes native answer correction tools, erasing/undo, ruler-only progress, topic-note persistence, report filtering, reduced motion, and horizontal overflow. On Windows, the wrapper required interruption only after every case passed while its managed development server was shutting down; port 4200 was confirmed stopped.
- Visual inspection covered the Day topic map with its sticky note at 1440 pixels, the compact study ruler and answer correction tools at 1440 pixels, and the complete paper-clipped reports ledger at 320 pixels. Required labels and content remained clearer than the stationery effects.

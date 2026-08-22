# G004 validation

## Automated validation

- **VAL-G004-001** (`REQ-G004-007`–`010`): Appearance preference tests verify Automatic, Light, and Dark selection, device-preference changes, remembered overrides, invalid saved data, and unavailable storage.
- **VAL-G004-002** (`REQ-G004-001`–`006`): Existing component and browser tests remain green after the shared visual and plain-language hierarchy changes.
- **VAL-G004-003** (`REQ-G004-011`, `012`): Lint, template accessibility lint, Stylelint, production/test typechecks, build, unit tests, and Playwright complete without regression.
- **VAL-G004-004** (`REQ-G004-011`, `012`): Browser checks cover labelled Appearance operation, keyboard reachability, and absence of horizontal page overflow at configured mobile, tablet, and wide viewports.

## Manual checks

- Inspect the catalog, topic map, single lesson, cumulative lesson route, active test, answer feedback, session result, reports, and data settings in warm Light and low-glare Dark appearances.
- At 320, 768, and 1440 pixels, confirm that the header, navigation, Appearance control, notebook margins, cards, instructions, and actions do not overlap or clip.
- Use only the keyboard to select each appearance and move through Topics, Reports, Data, Learn first, Start test, Show answer, and answer continuation.
- Confirm the device color-scheme changes Automatic mode and does not change an explicit Light or Dark override.
- Confirm body text and required labels use print typography; handwriting appears only in short optional annotations.
- Confirm correct, incorrect, skipped, review, warning, and danger states remain understandable without color.
- Confirm focus indicators are clearly visible on paper, raised, state, and dark surfaces.
- Confirm notebook ornament never resembles an unlabelled control and does not obscure lesson or feedback text.

## Completion evidence

- Record quality-gate and browser-test results after implementation.
- Record the routes, themes, and viewport widths visually inspected.
- Record any deferred assistive-technology or browser-specific follow-up.

### 2026-08-22 implementation

- `npm run check`: passed ESLint and Angular template accessibility lint, Stylelint, purposeful-module size, source reachability, architecture boundaries, repository-wide Prettier, production and test TypeScript checks, content validation, production build, and all 77 unit tests.
- Production build: passed without CSS-budget warnings at a 68.51 kB estimated initial transfer size.
- Playwright: 21 runs passed across 320-pixel mobile, 768-pixel tablet, and 1440-pixel wide Chromium projects, including Appearance persistence/Automatic reset, catalog/topic overflow, sticky wide lesson navigation, optional practice, session recovery, reports, backup, and clearing controls.
- The standard Playwright command initially reused an older server already occupying port 4200; the complete matrix was rerun against the verified current client server on port 4300.
- Visual inspection: Light and Dark catalog, topic, lesson, study, reports, and data screens were inspected at 1440 and 320 pixels; the Playwright tablet project covered 768-pixel responsive behavior.
- Contrast review: primary, secondary, muted, brand, red-pencil, and focus colors were checked against their main paper and header surfaces; text combinations were at least 4.70:1 and the light-theme focus ring was at least 3.10:1 against both paper and the ink header.
- Persistence review: only the explicit presentation override uses browser key-value storage. No IndexedDB schema, learner-state shape, backup payload, content version, grading, or clearing contract changed.
- Deferred manual follow-up: a full assistive-technology walkthrough and browser-specific contrast audit remain advisable; affected controls use native links, buttons, inputs, and a labelled select and passed automated keyboard/accessibility checks.

### 2026-08-22 deeper immersion pass

- Added CSS-only physical-notebook cues across the existing interface: punched binding holes, subtle paper grain, stacked sheet edges, a printed Finnish workbook stamp, masking tape, index tabs, and ledger dividers. No route, learner data, content, action order, or theme behavior changed.
- Visual inspection covered the Light catalog and active study screens at 1440 pixels, the Dark topic screen at 1440 pixels, and the Dark catalog plus Light data settings at 320 pixels. The ornament remained behind or outside the reading flow, and primary actions stayed visually dominant.
- `npm run check`: passed the complete quality gate after the immersion changes, including the production build at a 68.72 kB estimated initial transfer size and all 77 unit tests.
- Playwright: all 21 runs passed against the current server across 320-pixel mobile, 768-pixel tablet, and 1440-pixel wide Chromium projects, including horizontal-overflow and Appearance-preference checks.

# G003 validation

Execute current catalog/topic tests against the [G005 compact-card refinement](../G005-interactive-nordic-workbook-world/requirements.md#page-scene-requirements) and [G007 Stats navigation](../G007-scalable-stats-navigation/requirements.md). Older dashboard/report names in dated evidence refer to the delivered G003 baseline.

## Automated validation

- **VAL-G003-001** (`REQ-G003-001`, `002`, `007`): Dashboard component and browser tests verify one summary per pack, one truthful encompassing-grid `Level:` or `Levels:` label, no repeated card-level labels, compact progress, topic links, absence of expanded test cards, and labeled catalog-owned groups in authored group and pack order. Content-catalog service tests reject invalid or duplicate group declarations before loading manifests.
- **VAL-G003-002** (`REQ-G003-003`): Query and dashboard tests verify recent valid session resume, invalid-session fallback, and the first unattempted test recommendation.
- **VAL-G003-003** (`REQ-G003-004`, `005`): Topic-page tests verify authored test order, separate Focused/Review sections without repeated classification badges, stage and skill guidance, lesson progress, and direct lesson/test links.
- **VAL-G003-004** (`REQ-G003-006`): Topic-page tests verify a recoverable unknown-topic state and home link.
- **VAL-G003-005** (`REQ-G003-008`): Existing learning, persistence, content, reports, and backup tests remain green without learner-state migration.
- **VAL-G003-006** (`REQ-G003-009`, `010`): Lint, typecheck, production build, and Playwright verify semantic navigation, lazy routing, and 320-pixel catalog/topic usability.

- **VAL-G003-007** (`REQ-G003-009`, `011`): Browser checks verify every group starts collapsed, headers retain real headings and right-aligned state chevrons, mouse and Enter/Space toggle groups independently, hidden topic actions leave the focus order, reload and route revisit reset expansion, and expanded cards remain usable at 320, 768, and 1440 pixels with enlarged text and reduced motion.

- **VAL-G003-008** (`REQ-G003-009`, `012`): Browser checks verify four/two/one collapsed-group columns at workbook breakpoints, full-row expansion for every group, widening before card reveal, restored collapsed placement, cancellation on repeated activation, and immediate reduced-motion state.

- **VAL-G003-009** (`REQ-G003-013`): Client G009 metadata lifecycle checks verify index-only startup, immediate exact totals/Continue learning, group-only first loads, caching, retry, and canceled activation.
- **VAL-G003-010** (`REQ-G003-014`): Browser checks open groups near the viewport edge with normal/reduced motion, verify short groups fit and tall-group headers remain below the sticky header, preserve focus, avoid scrolling already-visible groups, and ignore canceled opening.

- **VAL-G003-011** (`REQ-G003-015`): Stats unit and browser checks verify initially collapsed groups, authored metrics/links after expansion, matching responsive geometry, independent mouse/keyboard toggles, route reset, width-before-reveal animation and cancellation, normal/reduced-motion scrolling, enlarged text, and no pack-content requests. Existing cumulative-statistics, archive, and Drive checks verify their unchanged presentation and controls.

## Manual checks

- Open home and the Stats overview at 320, 768, and 1440 pixels, expand their groups, and confirm headers, chevrons, focus indicators, and topic cards do not clip or create horizontal scrolling.
- Open a topic at each width and confirm Focused/Review headings, test actions, and objectives remain readable.
- Navigate home, a topic, Learn first, and a test using only the keyboard; confirm visible focus and logical order.
- Create or resume a saved session and confirm the home continue action names and opens the correct workflow.

## Execution evidence

### 2026-10-09 Stats topic-group extension

- **REQ-G003-015 / VAL-G003-011:** Stats groups now share Notebook's independent native disclosures, default closed state, chevrons, responsive four/two/one columns, full-row animation, cancellation, reduced motion, and viewport alignment. Stats uses its available summaries without requesting manifests or lesson/test fragments. Shared interaction code and styles live under Learning shared ownership; Notebook retains its workflow-owned cards and metadata activation.
- **Automated gates:** ESLint, Stylelint, module size, source reachability, architecture, application/test TypeScript, production build, and changed-file formatting passed. The required aggregate check stopped on the same 36 formatting failures in untouched files; those files remain unchanged. Template/CSS lint and the affected eight component tests passed again after the final wrapper correction.
- **Unit/integration:** All 49 unit files / 434 tests and four integration files / 28 tests passed using the existing ignored one-thread Vitest configuration. No runner configuration or dependency was changed.
- **Browser scope:** The final 84-case run passed 72 checks, with 12 intended viewport-specific skips. It covers both catalogs' default state, authored order, mouse/Enter/Space controls, hidden-action focus order, route reset, chevrons, workbook breakpoints, full-row width before card reveal, rapid toggles, normal/reduced-motion scrolling, and 150%/200% root text in Day and Night. Existing Stats metrics, level labels, visual roles, archive presentation, clearing confirmation, and reduced-motion behavior also passed. The earlier 33 startup/loading and Drive cases passed; the final focused Stats run separately passed 21 checks with six intended skips. An initial broad run exposed overbroad card selectors, paper-transition assumptions in tests, and a scroll offset caused by applying disclosure geometry to the transformed paper; scoped selectors and a stable outer wrapper corrected these before the final run.
- **Scope and visual review:** The Stats card content, hero, archive composition, metric calculations, and operations match their previous implementation. The 1440px and 320px expanded Stats screenshots were inspected: fitting groups are completely visible and tall groups retain a visible header. This extension does not change the catalog index, authored content, learner data, storage, backup formats, or route definitions. The governing G003/G005/G007 guidance, design pattern, and Unreleased changelog record the Stats exception and shared ownership.
- **Manual limitations:** Native browser zoom, screen-reader walkthroughs, and physical-device checks were not performed for this extension.

### 2026-10-09 collapsible catalog, lazy metadata, and viewport alignment

- **REQ-G003-011–014 / VAL-G003-007–010:** Notebook groups start closed on each route visit, use independent native disclosures and right-aligned chevrons, follow four/two/one workbook columns, and animate to a full row before revealing the existing three/two/one card grid. Completed openings scroll only when needed; fitting groups remain completely visible and taller groups align below the actual sticky header. Reduced motion applies layout and scrolling immediately. Stats retains its original visible, full-width groups.
- **Automated gates:** ESLint, Stylelint, module-size, source-reachability, architecture, application/test TypeScript, direct-source validation for all 14 packs, production build, and formatting of all changed files passed. The required `npm --prefix client run check` stopped at 36 pre-existing formatting failures in untouched files; the later gates were run separately.
- **Unit/integration:** All 49 unit files / 433 tests and four integration files / 28 tests passed using an ignored temporary Vitest configuration with one thread worker. The default fork worker timed out during startup on this Windows Node 26.8.1 environment; no permanent runner configuration or dependency changed. The final retry-focus change also passed the five affected catalog component tests.
- **Browser scope:** The broad workflow/accessibility/visual/catalog run completed with 251 passes, 41 intended skips, and five initial failures. The Stats style regression and outdated group/card test setup were corrected, and the visual timeout was covered by a focused rerun. On the corrected implementation, 82 distinct selected browser cases passed across the final 90-case run and its one-case material rerun, with eight intended viewport-specific skips. These cover mouse/Enter/Space, hidden-action focus order, route reset, responsive/full-row geometry, width-before-reveal animation, rapid-toggle cancellation, 150%/200% root text, both appearances, metadata lifecycle, pack navigation, and normal/reduced-motion viewport alignment. The last retry-focus change additionally passed at all three viewports.
- **Visual review:** The 1440px screenshot was inspected with the opened group entirely inside the viewport, with corresponding 320px evidence for a taller group's visible header. Startup and first-expansion request boundaries are detailed in client G009.
- **Data review:** Authored pack manifests/fragments, stable IDs, pack/lesson versions, IndexedDB, learner-state and backup formats, scoring, and progress semantics are preserved. Catalog schema 3 replaces schema 2 without a fallback or learner-data loss. `CHANGELOG.md` records the user-visible behavior and format change.
- **Manual limitations:** Native browser zoom, a screen-reader walkthrough, and physical-device checks were not performed. Root-text, viewport, keyboard, reduced-motion, and relevant automated visual checks are recorded above.

### 2026-09-19 pack grouping extension

- `npm.cmd run check`: passed ESLint, Stylelint, purposeful-module size, source reachability, architecture boundaries, repository-wide Prettier, application and test TypeScript checks, all 11-pack direct-source validation, production build, 172 unit tests, and 14 integration tests.
- Content-catalog service tests reject invalid or duplicate catalog-owned group declarations before loading pack manifests, matching the standalone source validator at the browser trust boundary.
- `npx.cmd playwright test tests/e2e/content/pack-groups.spec.ts tests/e2e/workflows/content-loading.spec.ts --config=playwright.review.config.ts`: 27 checks passed across the configured mobile, tablet, and wide Chromium projects, covering labeled headings, authored group and pack order, matching Notebook/Stats groups, containment inside the bound sheet, startup manifest loading, direct routes, retry, and lazy full-pack loading. The disposable port-4211 review server and config were removed after the run because an unrelated process occupied the standard port 4200.
- Persistence review: no IndexedDB schema, learner-state shape, backup shape, stable content ID, lesson/test/exercise content, pack version, grading, or clearing behavior changed.

### 2026-08-19 implementation

- `npm run check`: passed ESLint, Angular template accessibility lint, Stylelint, purposeful-module size, source reachability, architecture boundaries, repository-wide Prettier, production and test TypeScript checks, content validation, production build, and unit tests.
- Unit tests: 10 files and 68 tests passed, including compact multi-pack summaries, saved-session resume, authored next-test selection, topic-page ordering and actions, unknown-topic recovery, due-review prominence, and explicit orphan-lesson rejection.
- Content validation: one cataloged pack passed with fourteen tests, 200 scored exercises, thirteen lessons, 44 separate practice exercises, complete references, and globally unique IDs.
- Production build: passed with a 66.84 kB estimated initial transfer and separate lazy chunks for the dashboard and topic pages.
- `npm run test:e2e`: 18 Playwright runs passed across the configured mobile, tablet, and wide Chromium projects, including catalog-to-topic navigation, session recovery, lesson separation, complete primary-nav labels, and no 320-pixel horizontal overflow.
- Visual inspection: the ready home catalog and topic map were inspected at 1440 pixels, and the home header and complete topic map were inspected at 320 pixels. The mobile primary navigation was changed to a stacked layout so **Topics**, **Reports**, and **Data** remain fully visible.
- Persistence review: no IndexedDB schema, learner-state shape, content-pack version, exercise content, lesson content, grading, backup, or clearing contract changed.
- Deferred manual follow-up: a full assistive-technology walkthrough remains advisable; the affected controls use native links and progress elements and passed automated keyboard/accessibility lint and browser checks.

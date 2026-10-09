# G009 validation — Bounded pack content loading

## Automated evidence

- **VAL-G009-001 / REQ-G009-001:** Catalog-service unit and browser tests assert landing-page initialization requests only the index, while exact totals and Continue learning remain available.
- **VAL-G009-002 / REQ-G009-002, REQ-G009-016, REQ-G009-022:** Index, manifest, and aggregate-validator tests cover required summaries, global uniqueness, exact manifest/fragment agreement, and rejection of unsupported catalog schemas.
- **VAL-G009-003 / REQ-G009-003:** Pack-repository unit tests assert declared fragments are assembled and validated on demand.
- **VAL-G009-004 / REQ-G009-004:** A concurrent-load test asserts one set of fragment requests for duplicate callers.
- **VAL-G009-005 / REQ-G009-005:** A failure/retry test asserts a rejected load can succeed on a later request.
- **VAL-G009-006 / REQ-G009-006, REQ-G009-007:** LRU tests assert a two-pack bound, recency refresh, and least-recently-used eviction.
- **VAL-G009-007 / REQ-G009-008:** Repository tests assert lesson, test, and exercise maps resolve the assembled objects.
- **VAL-G009-008 / REQ-G009-009, REQ-G009-013:** State, backup, integration, and browser tests assert complete current state is retained, unsupported stored state resets completely, and obsolete or removed-pack backups are rejected before replacement. Root `VAL-G008-004` covers the later new-pack and changed-pack compatibility policy that supersedes G009's original exact-set rule.
- **VAL-G009-009 / REQ-G009-010:** IndexedDB repository tests persist and retrieve learner state after the redundant caller-side clone is removed.
- **VAL-G009-010 / REQ-G009-011, REQ-G009-014:** Shell unit/browser checks assert the incomplete root stays hidden until its routed layout is ready, the full-viewport overlay prevents a visible startup shift, and final loaded-page markup remains unchanged.
- **VAL-G009-011 / REQ-G009-012:** Existing learning unit, integration, and Playwright suites remain green.
- **VAL-G009-012 / REQ-G009-015:** Direct-source tooling tests and the aggregate content validator continue reading `content/` in place.
- **VAL-G009-013 / REQ-G009-017:** Source-policy and module-limit checks remain green.
- **VAL-G009-014:** Run `npm --prefix client run check` from the repository root. This aggregate regression gate supplements the requirement-specific checks; record failures and skipped layers separately.
- **VAL-G009-015:** Run `npm --prefix client run test:e2e` from the repository root. This broad browser gate supplements the mapped loading/workflow checks; retain unrelated failures and deliberate skips in the execution evidence.
- **VAL-G009-016 / REQ-G009-018:** Shell and browser-adapter unit tests shall assert that the initial overlay remains until route readiness settles, concurrent operations cannot hide it early, and revealing the root removes its hidden, inert, busy, and accessibility-hidden state. A browser test with application JavaScript blocked shall assert the self-styled loader remains visible and fills the viewport.
- **VAL-G009-017 / REQ-G009-019:** Browser checks at phone, tablet, and wide widths shall delay the catalog index, direct-route pack fragments, and an uncached pack opened after startup; assert that the same overlay remains or reappears while Angular is ready underneath; assert that no route or shell spinner exists; and assert that the complete routed page replaces the overlay.

- **VAL-G009-018 / REQ-G009-020, REQ-G009-021, REQ-G009-023:** Unit/browser checks assert first expansion fetches only that group's manifests, concurrent activation shares requests, later expansion and topic navigation reuse metadata, loading/failure is accessible and retryable, canceled activation does not reopen a group, and stale manifest/index pairs fail safely.

## Manual review

- Confirm startup shows the same loading card and the loaded pages retain the same visual styling.
- Confirm navigating among three topics reloads an evicted pack without losing learner state.
- Confirm no manifest is requested on landing-page startup, group expansion requests only its own manifests, and no lesson/test JSON is requested before a pack-owned route opens.
- Confirm a throttled cold load keeps the same full-viewport loader until the complete initial destination replaces it, without exposing the Angular shell or a second loader.
- Confirm later navigation to an uncached pack and catalog retry reuse the same full-viewport loader and that route templates contain no separate loading state.

## Completion evidence — 2026-09-09

The dated results below record the G009 delivery before root G008 changed backup compatibility. Its original exact pack/version-set rejection evidence remains historical; current compatibility validation is recorded under root `VAL-G008-004`.

- **Startup boundary and layout:** The Playwright loading check passed at 320, 768, and 1440 pixels. Each cold catalog load requested one index and six manifests, requested no lesson or test fragments, and loaded only the selected pack's fragments after navigation. Measured startup layout shift was 0.010, 0.0078, and 0.0016 respectively. Covers VAL-G009-001, VAL-G009-010, and VAL-G009-015.
- **Pack lifecycle:** Unit tests cover validated assembly, lesson/test/exercise maps, concurrent-load deduplication, retry after failure, cache recency, and two-pack least-recently-used eviction. Covers VAL-G009-003 through VAL-G009-007.
- **Content integrity:** Direct-source validation passed for all six packs, 33 lessons, and 1,090 scored exercises. Source-loader tests reject manifest-summary drift, and runtime validator tests cover malformed and duplicate summary data. Covers VAL-G009-002 and VAL-G009-012.
- **Continuous first paint:** The shell test confirms the loading page is present before the first route activates and removed only after routed content exists. Browser checks with application JavaScript blocked confirm the self-styled first-paint loader remains visible and fills the viewport at 320, 768, and 1440 pixels. Covers VAL-G009-010 and VAL-G009-016.
- **Loading paper geometry:** With manifest responses delayed, browser checks confirm the loading paper and page clip bottom edges remain within eight pixels at 768 and 1440 pixels. The 320-pixel project intentionally omits this assertion because its established phone layout hides folder hardware. Covers VAL-G009-017.
- **Current-format state:** State and backup coverage verifies the complete current contract, full reset of unsupported stored state, atomic rejection of obsolete or pack-incompatible backups, clearing, notes, lessons, sessions, corrections, and progress. The complete client gate passed 126 unit tests and 14 integration tests. The IndexedDB reset workflow passed at all three supported widths. Covers VAL-G009-008, VAL-G009-009, VAL-G009-011, VAL-G009-013, and VAL-G009-014.
- **Broader browser suite:** The loading-specific browser checks passed, including the intentional phone-hardware skip. A full run against the already-running development server completed 198 tests with 34 intended skips. Five existing visual assertions about topic-card material and hover lift remain failing; this feature does not change those styles or assertions. No unrelated visual baseline was modified.

## Single-loader completion evidence — 2026-09-10

- **One physical loader:** Production-source inspection finds only the static `#app-boot` overlay; shell, catalog, topic, lesson, study, and topic-stats spinner markup and the obsolete shared spinner/loading-page CSS are absent. Covers REQ-G009-018 and REQ-G009-019.
- **Lifecycle and accessibility:** Shell and adapter unit tests verify route-readiness waiting, concurrent-operation ownership, reuse of the same element, and removal of `inert`, `aria-busy`, and `aria-hidden` only when loading completes. The complete client gate passed 128 unit tests and 14 integration tests. Covers VAL-G009-010, VAL-G009-014, and VAL-G009-016.
- **Browser behavior:** All 18 focused Playwright checks passed across 320, 768, and 1440 pixels. They cover JavaScript-blocked first paint, delayed catalog startup, a delayed direct topic URL, later navigation to an uncached pack, catalog retry, absence of route spinners, and unchanged request boundaries. Covers VAL-G009-015 and VAL-G009-017.
- **Broader regression run:** Every loading check passed in the complete Playwright run. Unrelated existing topic-card material and hover-lift assertions kept the broad suite from an all-green result; no topic-card production or specification change is included in this work.

## Index-first metadata evidence — 2026-10-09

- **VAL-G009-001/002/012/018:** The canonical schema-3 index supplies exact totals, Continue learning, grouping, and identifier/version inventories. Browser startup requests only `content/index.json`, reducing the current catalog's content requests from 15 to one. No pack manifest or lesson/test fragment is requested on the landing page; the overview still shows 14 packs and 2,758 scored questions immediately.
- **VAL-G009-018:** First Foundations activation requests only its three manifests. Reopening, returning from a topic, and entering a pack workflow reuse successful metadata; lessons/tests load only for the selected pack. Canceled pending activation does not reopen its group, other groups remain operable, and a single failed manifest retries without refetching its successful siblings. Retry returns focus to the stable disclosure header.
- **VAL-G009-002/003/016/017/018:** Unit tests cover malformed inventories, unsafe manifest references, shared concurrent requests, successful-cache reuse, failure/retry, and stale manifest/index rejection. Source-loader tests reject missing, stale, reordered, duplicate, and schema-2 indexes. Full-pack validation, prebuilt maps, and the two-pack LRU remain covered. Delayed index/direct-route/uncached-topic/global-retry checks retain the one shared overlay.
- **Gates and regression evidence:** Application/test types, all 14 canonical packs, production build, source policies, and changed-file formatting passed. The minimal-diff review passed 433 unit, 28 integration, and 54 focused browser tests, with six intentional viewport-specific skips. Unit/integration runs used the ignored temporary single-thread Vitest configuration; an initial unit-worker startup timeout resolved on an isolated rerun. The aggregate check still stops on 36 untouched formatting failures. Earlier browser results and manual limitations are recorded under [root G003](../../../../specs/features/G003-scalable-topic-navigation/validation.md#2026-10-09-collapsible-catalog-lazy-metadata-and-viewport-alignment).
- **Persistence boundary:** Startup alignment uses the unchanged complete ID/version inventory. Pack/lesson versions, stored state, backups, grading, and clearing semantics remain unchanged; the schema-3 bundled-catalog change causes no learner-data loss.

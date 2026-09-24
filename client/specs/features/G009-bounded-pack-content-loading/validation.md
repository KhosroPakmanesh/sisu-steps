# G009 validation — Bounded pack content loading

## Automated evidence

- **VAL-G009-001 / REQ-G009-001:** Catalog-service unit tests assert initialization reads only the catalog and one manifest per registered pack.
- **VAL-G009-002 / REQ-G009-002, REQ-G009-016:** Manifest and aggregate content-validator tests cover required summaries, global uniqueness, and exact fragment agreement.
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
- **VAL-G009-014:** Run `npm --prefix client run check` from the repository root.
- **VAL-G009-015:** Run `npm --prefix client run test:e2e` from the repository root.
- **VAL-G009-016 / REQ-G009-018:** Shell and browser-adapter unit tests shall assert that the initial overlay remains until route readiness settles, concurrent operations cannot hide it early, and revealing the root removes its hidden, inert, busy, and accessibility-hidden state. A browser test with application JavaScript blocked shall assert the self-styled loader remains visible and fills the viewport.
- **VAL-G009-017 / REQ-G009-019:** Browser checks at phone, tablet, and wide widths shall delay catalog manifests, direct-route pack fragments, and an uncached pack opened after startup; assert that the same overlay remains or reappears while Angular is ready underneath; assert that no route or shell spinner exists; and assert that the complete routed page replaces the overlay.

## Manual review

- Confirm startup shows the same loading card and the loaded pages retain the same visual styling.
- Confirm navigating among three topics reloads an evicted pack without losing learner state.
- Confirm no lesson or test JSON request occurs before a pack-owned route is opened.
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

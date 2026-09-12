# G009 requirements — Bounded pack content loading

## Functional requirements

- **REQ-G009-001:** Application initialization shall fetch the content index and registered pack manifests, but shall not fetch lesson or test fragments.
- **REQ-G009-002:** Pack manifests shall contain sufficient summary metadata to preserve catalog display, progress alignment, mistake and correction counts, note-scope validation, clear-history operations, and continue-session navigation without loading full packs.
- **REQ-G009-003:** Opening a pack-owned workflow shall load that pack's declared lesson and test fragments from the canonical `content/` sources and validate the assembled pack before use.
- **REQ-G009-004:** Concurrent requests for the same unloaded pack shall share one in-flight load.
- **REQ-G009-005:** A failed pack load shall not be cached and shall be retryable.
- **REQ-G009-006:** The successful full-pack cache shall retain at most two packs and evict the least recently used pack.
- **REQ-G009-007:** Reading a cached pack shall refresh its recency.
- **REQ-G009-008:** Each loaded pack shall expose prebuilt maps keyed by lesson, test, and scored-exercise identifier for repeated workflow lookups.
- **REQ-G009-009:** Full-backup restoration shall validate the current backup contract, require the exact installed pack/version set, and validate referenced content against all installed full packs before replacing current data.
- **REQ-G009-010:** Learner-state writes shall preserve the existing IndexedDB schema and values while avoiding a redundant explicit structured clone immediately before `IDBObjectStore.put`.
- **REQ-G009-011:** The startup transition shall keep the incomplete application shell hidden and shall reveal only its complete routed layout so shell construction does not create a visible layout shift.
- **REQ-G009-018:** The initial HTML response shall show one complete, self-styled, full-viewport loading overlay outside the Angular root before bootstrap and retain that same DOM loader until the initial routed page reaches a renderable success, empty, or error state. While it remains, the Angular root shall be hidden, inert, and excluded from the accessibility tree.
- **REQ-G009-019:** The application shall contain no route-specific or shell-specific loader. Removing the shared overlay shall reveal the complete routed page in one paint; direct pack-owned URLs shall retain it until their required pack fragments finish loading. Later in-app navigation to an uncached pack and catalog retry shall reuse that same full-viewport loader and keep the routed page hidden until the destination is renderable.

## Current behavior and breaking-data policy

- **REQ-G009-012:** Existing URLs, visible text, interaction flows, scoring results, progress semantics, history semantics, note behavior, and correction behavior shall remain unchanged.
- **REQ-G009-013:** The current learner-state and backup schema numbers and serialized fields shall remain unchanged. Stored state with an obsolete shape or a version entry for a removed pack shall reset completely; an obsolete backup or a backup whose pack/version set differs from the installed set shall be rejected atomically. No compatibility migration, fallback reader, legacy alias, or transitional format shall be introduced.
- **REQ-G009-014:** The final loaded appearance shall remain unchanged. Startup may reproduce the existing pencil-loading presentation before route activation, but no new skeleton, visual style, color or spacing token, or loaded-page component redesign shall be introduced.
- **REQ-G009-015:** Pack JSON under `content/` shall remain the sole deployed content source, with no generated public copy.
- **REQ-G009-016:** Direct-source validation shall reject summary metadata that is missing, malformed, duplicated globally, or inconsistent with the referenced lesson and test fragments.
- **REQ-G009-017:** Production TypeScript and CSS shall continue satisfying the repository's ownership and module-size rules.

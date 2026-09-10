# Client specifications

- `constitution.md` defines the current client technology and integration boundaries.
- `architecture/` defines client source ownership, module cohesion, and browser-local persistence.
- `design-system/` defines client visual, interaction, and accessibility contracts.
- `features/G002-technical-guidance-alignment/` retains the completed client architecture and developer-workflow migration requirements and evidence.
- `features/G006-pack-owned-content-sources/` defines the approved separation of pure-JSON, pack-owned content from generic validation, in-memory runtime assembly, and Angular presentation, with no generated content copy.
- `features/G008-concept-aligned-client-structure/` defines the current learning feature roots, product vocabulary, dependency boundaries, and unit/integration/browser test topology. It supersedes the feature-root and test-layout portions of G002 without rewriting that completed migration's historical evidence.
- `features/G009-bounded-pack-content-loading/` defines manifest-only startup, validated on-demand pack assembly, bounded in-memory caching, indexed pack lookups, startup layout stability, and explicit reset/rejection of unsupported learner data without changing current-format workflows or final appearance.

Product behavior, Finnish content policy, and cross-area system decisions remain under root `specs/`.

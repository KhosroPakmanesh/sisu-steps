# Client specifications

- [constitution.md](constitution.md) defines the current client technology and integration boundaries.
- [architecture](architecture/) defines client source ownership, module cohesion, and browser-local persistence.
- [design-system](design-system/) defines client visual, interaction, and accessibility contracts.
- [features/G002-technical-guidance-alignment](features/G002-technical-guidance-alignment/) retains the completed client architecture and developer-workflow migration requirements and evidence.
- [features/G006-pack-owned-content-sources](features/G006-pack-owned-content-sources/) defines the approved separation of pure-JSON, pack-owned content from generic validation, in-memory runtime assembly, and Angular presentation, with no generated content copy.
- [features/G008-concept-aligned-client-structure](features/G008-concept-aligned-client-structure/) defines the current learning feature roots, product vocabulary, dependency boundaries, and unit/integration/browser test topology. It supersedes the feature-root and test-layout portions of G002 without rewriting that completed migration's historical evidence.
- [features/G009-bounded-pack-content-loading](features/G009-bounded-pack-content-loading/) defines manifest-only startup, validated on-demand pack assembly, bounded in-memory caching, indexed pack lookups, startup layout stability, and explicit reset/rejection of unsupported learner data without changing current-format workflows or final appearance. Root G008 recovery requirements supersede G009's original exact backup pack/version-set rule.

Product behavior, Finnish content policy, and cross-area system decisions remain under root `specs/`.

Root [G008 Drive recovery](../../specs/features/G008-manual-google-drive-recovery/requirements.md) and [client G008 structure](features/G008-concept-aligned-client-structure/requirements.md) retain separate historical ID namespaces. Qualify cross-area REQ-G008/VAL-G008 references by the owning path or by `root`/`client`; do not renumber either pack.

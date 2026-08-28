# Client technical constitution

## Scope

This contract governs the Angular browser client. Root product requirements remain authoritative for learner behavior, content semantics, and cross-area decisions.

## Technology constraints

- Angular with standalone components
- Strict TypeScript
- Native IndexedDB for learner data
- Versioned JSON files for bundled exercise content
- Plain CSS and no third-party UI framework
- Static browser deployment for the client

## Client boundaries

- Core study, scoring, history, reporting, backup, and clearing remain usable without a server dependency.
- Automatic network access is limited to same-origin bundled client resources unless an explicit product requirement and versioned client/server contract approve another boundary.
- Browser persistence, file access, downloads, confirmation, and identifiers remain behind purpose-named adapters or repositories.
- Client code must not infer future server APIs, authentication, storage, or synchronization behavior.
- Client/server integration requires root product requirements plus matching client and server specifications before implementation.

## Related guidance

- `architecture/client-feature-slices.md`
- `architecture/purposeful-modules.md`
- `architecture/browser-local-persistence.md`
- `design-system/`
- `features/G002-technical-guidance-alignment/`
- `features/G006-pack-owned-content-sources/`

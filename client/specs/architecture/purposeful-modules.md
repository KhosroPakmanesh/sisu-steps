# Purposeful module architecture

Sisu Steps applies SOLID-inspired responsibility boundaries to standalone Angular components and TypeScript functions. The goal is cohesive, discoverable modules, not class hierarchies or abstraction for its own sake.

## Core rules

- Give every production file one dominant responsibility that its name describes.
- Apply single responsibility at module, component, service, policy, query, validator, mapper, repository, and function levels.
- Prefer Angular dependency injection and explicit function inputs over service locators, hidden registries, or global mutable state.
- Depend on narrow contracts at real boundaries such as IndexedDB, JSON loading, downloads, files, confirmations, identifiers, and time-sensitive state transitions.
- Keep capability behavior in the Learning feature. Move code to root `shared` only for a real cross-feature contract or infrastructure boundary.
- Do not create catch-all `utils`, `helpers`, `common`, `core`, `rules`, or feature-wide `types` owners.

## Responsibility decision

Classify code before choosing a folder:

1. Rendering and accessible interaction belongs in a standalone component.
2. Route parameter and page-level coordination belongs in a thin route page.
3. A complete learner operation or persisted transition belongs in an application service.
4. A pure business decision belongs in a policy or validator.
5. Filtering, grouping, counts, summaries, and display-model construction belong in a query.
6. Conversion between persisted, content, backup, and display shapes belongs in a mapper.
7. IndexedDB, fetch, file, download, confirmation, and identifier access belongs behind a repository or browser adapter.
8. Stable routes, labels, supported variants, and metadata belong in typed configuration.

A file should normally occupy one category.

## Services and state

- Name services after one operation or one cohesive workflow lifecycle.
- Accept explicit dependencies through Angular injection and return typed results or promises.
- Keep DOM, focus, notification copy, template state, and CSS concerns out of application services.
- Keep persistence atomic: a state transition must be computed before the repository commits the replacement learner state.
- Route pages and components must not open IndexedDB transactions or construct browser downloads.
- A feature-wide reactive store may own canonical loaded content and learner-state signals plus the atomic commit boundary; product operations remain in focused services.

## Queries, policies, validators, and models

- Queries read and derive; they do not persist or mutate input.
- Policies and validators return decisions or throw safe domain errors; they do not access Angular, browser globals, or IndexedDB.
- Keep content contracts separate from persisted learner contracts and workflow-only report/view types.
- Split validation by catalog, exercise, lesson, test, pack, backup, and cross-pack responsibility so each boundary can be tested directly.
- Keep public exports narrow; do not add forwarding barrels solely to preserve obsolete paths.

## Stylesheet ownership

- App styles own shell and cross-route layout only.
- Feature styles live with the workflow that owns the markup and use owner-specific selectors where global primitives are not intended.
- Design-system styles own tokens, foundations, reusable controls, reusable feedback, and shared sentence-explanation patterns.
- Tokens are canonical; splitting styles must not duplicate reusable color, spacing, typography, radius, shadow, focus, control, or breakpoint values.

## Decomposition triggers

The following are mandatory review triggers:

- a production TypeScript module exceeds 300 physical lines;
- a function or Angular component implementation exceeds 150 physical lines;
- a stylesheet exceeds 400 physical lines;
- a page owns more than one independent interaction workflow;
- a module mixes presentation, domain policy, and persistence or browser I/O;
- a module needs multiple unrelated nouns to describe its responsibility.

Crossing a size trigger requires decomposition unless the file is cohesive declarative data or generated code. Any exception must be documented beside the lint override. Dense formatting or a renamed catch-all is not a valid exception.

## Review checklist

- Can the file's responsibility be stated without “and”?
- Does the route page read as orchestration?
- Are pure decisions separate from Angular signals and browser I/O?
- Are complete operations purpose-named and committed atomically?
- Are reports and content summaries derived by queries rather than templates reimplementing policy?
- Do adapters isolate every browser boundary?
- Are dependency direction, workflow ownership, accessibility, error states, and data contracts still visible?

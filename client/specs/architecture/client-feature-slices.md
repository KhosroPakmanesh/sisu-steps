# Angular client feature-slice architecture

Sisu Steps is organized around learner workflows. Shared code exists only for cross-workflow contracts or genuinely reusable browser infrastructure.

## Target structure

```text
client/
  src/
    main.ts
    app/
      app.config.ts
      app.routes.ts
      routes.config.ts
      shell/
    design-system/
      tokens.css
      foundations.css
      primitives.css
      feedback.css
      sentence-explanation.css
    features/
      learning/
        dashboard/
        lessons/
        study/
        reports/
        data-management/
        shared/
          content/
          state/
          progress/
    shared/
      browser/
      domain/
      identity/
      persistence/
  tests/
    unit/
      app/
      features/
      shared/
    e2e/
server/
  .gitkeep
```

## Rules

- Keep `client/src/main.ts` small; compose providers, routes, and shell behavior under `client/src/app`.
- Keep learner-facing behavior under the `learning` feature and choose the user workflow before a technical role.
- Keep route pages with their workflows and make them composition boundaries.
- Keep catalog-level summaries, continue-learning selection, and pack-level test maps under the `dashboard` workflow; lesson teaching content remains under `lessons`.
- Keep modules used by several Learning workflows under `features/learning/shared`; do not move product behavior to root `shared` merely because it is reused.
- Keep reusable visual foundations and canonical tokens under `client/src/design-system`.
- Keep persisted cross-workflow contracts, generic IndexedDB infrastructure, identifier adapters, file/download adapters, and JSON resource loading under `client/src/shared`.
- Keep siblings at approximately the same abstraction level. Do not create vague `core`, `lib`, `utils`, `helpers`, or `common` dumping grounds.
- Keep small workflow slices deliberately flat when more folders would add navigation without clarifying ownership.
- Preserve lazy loading for every secondary route.
- Keep tests outside production source and mirror the owning production path under `client/tests/unit`.
- Keep `server/` limited to its tracking placeholder until backend behavior is explicitly approved and specified.

## Dependency direction

- App composition may import features, design-system foundations, and shared infrastructure.
- Feature workflows may import their feature-shared modules, design-system foundations, and shared contracts/infrastructure.
- `features/learning/shared` must not import a workflow page or workflow presentation component.
- Root `shared` and `design-system` must not import from `app` or `features`.
- Features must not import app implementations.
- Circular workflow or feature dependencies are prohibited.

## Angular boundaries

- A route page may read route parameters, invoke focused feature services, coordinate navigation-level errors, and compose child views.
- Independent interaction state belongs in a focused standalone component or controller.
- Complete user operations and persisted state transitions belong in purpose-named feature services.
- Pure grading, validation, alignment, scheduling, reporting, and mapping decisions belong in policies, validators, queries, or mappers.
- IndexedDB, fetch, `File`, download, confirmation, and identifier APIs belong behind shared adapters.
- Stable route paths and navigation labels belong in typed app configuration.

## Enforcement

- `npm --prefix client run lint:architecture` rejects invalid workflow roots, vague directories, shared/design-system back edges, feature-to-app imports, cycles, browser globals in pure feature owners, and tests inside `client/src`.
- `npm --prefix client run lint:dead-code` follows TypeScript imports, lazy imports, aliases, Angular component templates/styles, and CSS imports from the explicit runtime entrypoints.

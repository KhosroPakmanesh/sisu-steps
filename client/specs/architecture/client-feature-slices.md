# Angular client feature-slice architecture

Sisu Steps is organized around learner concepts and workflows. Shared code exists only for behavior genuinely used by more than one learning workflow or for product-agnostic browser infrastructure.

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
    features/
      learning/
        topics/
          catalog/
          detail/
        lessons/
          practice/
          reader/
        study/
          result/
          runner/
          session/
          vocabulary/
        stats/
          overview/
          topic/
        learner-data/
          backup/
          backup-restore/
          confirmation/
        shared/
          answer-entry/
          content/
          navigation/
          notes/
          progress/
          styles/
          state/
            persistence/
    shared/
      browser/
  tests/
    setup.ts
    helpers/
      unit/
    unit/
      app/
      features/
      shared/
      tools/
    integration/
      learning/
    e2e/
      accessibility/
      content/
      support/
      visual/
      workflows/
  tools/
    content-validation/
      shared/
      foundations/
      olla/
      demonstratives/
```

## Rules

- Keep `client/src/main.ts` small; compose providers, routes, and shell behavior under `client/src/app`.
- Keep learner-facing behavior under `learning` and choose `topics`, `lessons`, `study`, `stats`, or `learner-data` before a technical role.
- Keep topic catalog summaries, continue-learning selection, and topic details under `topics`; keep computed progress summaries and their presentation under learning-shared progress and `stats` respectively.
- Keep backup, restore, and scoped history clearing under `learner-data`. Sisu Steps has no report entity or report workflow.
- Keep modules used by several learning workflows under `features/learning/shared`; learner state, IndexedDB, learning navigation, notes, content, and progress contracts are product-specific and belong there.
- Keep root `shared` limited to product-agnostic browser adapters and identifier mechanics.
- Keep reusable visual foundations and canonical tokens under `client/src/design-system`; keep the workbook shell's global CSS under `client/src/app/shell` and workflow-only CSS with its markup owner.
- Keep siblings at approximately the same abstraction level. Do not create vague `core`, `lib`, `utils`, `helpers`, or `common` production owners.
- Keep single-responsibility leaf slices flat. When a workflow contains distinct routes, operations, or independently reusable interaction areas, group them in purpose-named subfolders that clarify ownership.
- Keep generic content validation orchestration under `tools/content-validation/shared` and group topic-specific rules by their content family; the CLI entry point must only parse input, report the result, and select an exit status.
- Preserve lazy loading for every secondary route.
- Keep isolated tests under the mirrored `client/tests/unit` owner, cross-workflow stateful tests under `client/tests/integration`, and browser journeys under a purpose-named `client/tests/e2e` group.
- Keep reusable test fixtures under `client/tests/helpers`; production modules must never import them.

## Dependency direction

- App composition may import learning entry points, learning-shared providers, design-system foundations, and root browser infrastructure.
- A learning workflow may import its own modules, `features/learning/shared`, design-system foundations, and root browser adapters.
- `stats` may compose learner-data controls; no other sibling-workflow implementation dependency is allowed.
- `features/learning/shared` must not import a workflow implementation.
- Root `shared` and `design-system` must not import from `app` or `features`.
- Features must not import app implementations, and circular workflow dependencies are prohibited.

## Angular boundaries

- A route page may read route parameters, invoke focused feature services, coordinate navigation-level errors, and compose child views.
- Independent interaction state belongs in a focused standalone component or controller.
- Complete learner operations and persisted state transitions belong in purpose-named feature services.
- Pure grading, validation, alignment, scheduling, and mapping decisions belong in policies, validators, queries, or mappers.
- Derived test progress is a read model, not a stored report.
- IndexedDB, fetch, `File`, download, confirmation, and identifier APIs belong behind repositories or browser adapters.
- Stable learning route paths belong in learning-shared navigation; route matching and route composition remain app-owned.

## Enforcement

- `npm --prefix client run lint:architecture` rejects retired workflow roots and terminology, vague directories, forbidden sibling imports, learner-specific root-shared modules, shared/design-system back edges, feature-to-app imports, cycles, browser globals in pure feature owners, misplaced learning unit tests, and tests inside `client/src`.
- `npm --prefix client run lint:dead-code` follows TypeScript imports, lazy imports, aliases, Angular component templates/styles, and CSS imports from explicit runtime entry points.
- `npm --prefix client run test:unit` and `npm --prefix client run test:integration` validate their layers independently; `npm --prefix client run check` runs both.

G008 supersedes the workflow-root and test-topology portions of completed G002. G002's module-size, accessibility, storage-compatibility, and workflow rules remain in force.

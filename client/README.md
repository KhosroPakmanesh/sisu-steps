# Sisu Steps client

The client is the complete current Sisu Steps application. It provides the Angular browser interface, local learner-data persistence, bundled Finnish content, content tooling, and automated client validation. Core learning workflows do not require a backend.

## Technology

- Angular 21 with standalone components
- Strict TypeScript
- Native IndexedDB for learner data
- Versioned JSON for bundled exercise content
- Plain CSS with no third-party UI framework
- Static browser deployment

## Run locally

Requirements: Node.js compatible with Angular 21 and npm. From the repository root:

```powershell
npm --prefix client install
npm --prefix client start
```

Open the URL printed by Angular, normally `http://localhost:4200`.

## Validate

```powershell
npm --prefix client run check
npm --prefix client run test:e2e
```

For a focused test layer, use `npm --prefix client run test:unit` or `npm --prefix client run test:integration`.

The aggregate gate runs Angular TypeScript/template linting, Stylelint, module-size, source-reachability and architecture checks, repository formatting, production and test typechecking, content validation, a production build, unit tests, and cross-workflow integration tests.

Playwright covers critical topic, lesson, study persistence, progress-statistics, and learner-data journeys at 320, 768, and 1440 pixels. Install Chromium when needed:

```powershell
npm --prefix client exec -- playwright install chromium
```

## Engineering structure

- `src/app` owns bootstrapping, providers, route composition, and the application shell.
- `src/features/learning` owns topics, lessons, study, progress statistics, learner data, and learning-shared behavior including learner state and IndexedDB persistence.
- `src/design-system` owns canonical tokens, visual foundations, primitives, feedback, and sentence-explanation patterns.
- `src/shared` owns only product-agnostic browser infrastructure.
- `tests/unit` mirrors production ownership, `tests/integration` owns cross-workflow stateful operations, `tests/helpers` owns reusable test fixtures, and `tests/e2e` groups critical browser journeys by concern.

Start with `AGENTS.md`, `src/AGENTS.md`, and `specs/README.md`. Client review records live under `docs/`.

## Content workflow

Authored packs are registered in `content/index.json`. Each pack owns a same-named folder containing `pack.json`, one JSON file per reusable lesson under `lessons/`, and one JSON file per authored learning test under `tests/`.

`content/` is the only persisted content tree. Angular copies it unchanged to the deployed `/content/` path. At startup, the generic content service loads the catalog, each pack manifest, and its referenced lesson and test files; validates their identities and schemas; and assembles the existing runtime pack model in browser memory. Presentation components receive only that generic assembled model.

```powershell
npm --prefix client run content:validate
```

Product-level content policy and pedagogy records remain under root `specs/`. The client owns pack sources, generic direct-source validation, runtime content assembly, and static deployment configuration.

## Storage notes

Progress is stored in IndexedDB under the browser origin serving the client. A different hostname, port, or deployment URL has separate browser storage. The client provides explicit JSON backup, restore, and scoped clearing controls.

Adding a topic pack preserves existing progress. A materially changed pack version clears only that pack's incompatible local progress once, and backups require compatible installed pack versions.

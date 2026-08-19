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

The aggregate gate runs Angular TypeScript/template linting, Stylelint, module-size, source-reachability and architecture checks, repository formatting, production and test typechecking, content validation, a production build, and unit tests.

Playwright covers the critical dashboard, lesson, study persistence, reports, and data-management journeys at 320, 768, and 1440 pixels. Install Chromium when needed:

```powershell
npm --prefix client exec -- playwright install chromium
```

## Engineering structure

- `src/app` owns bootstrapping, providers, route composition, and the application shell.
- `src/features/learning` owns dashboard, lessons, study, reports, data management, and Learning-shared behavior.
- `src/design-system` owns canonical tokens, visual foundations, primitives, feedback, and sentence-explanation patterns.
- `src/shared` owns app-agnostic browser, identity, domain-contract, navigation, and persistence infrastructure.
- `tests/unit` mirrors production ownership; `tests/e2e` covers critical browser journeys.

Start with `AGENTS.md`, `src/AGENTS.md`, and `specs/README.md`. Client review records live under `docs/`.

## Content workflow

Installed packs are registered in `public/content/index.json`. The current pack is served from `public/content/finnish-foundations-a1.json`; its deterministic source is `tools/generate-content.mjs`.

```powershell
npm --prefix client run content:generate
npm --prefix client run content:validate
```

Product-level content policy and pedagogy records remain under root `specs/`. The client owns the current generator, validator, catalog, and bundled JSON implementation.

## Storage notes

Progress is stored in IndexedDB under the browser origin serving the client. A different hostname, port, or deployment URL has separate browser storage. The client provides explicit JSON backup, restore, and scoped clearing controls.

Adding a topic pack preserves existing progress. A materially changed pack version clears only that pack's incompatible local progress once, and backups require compatible installed pack versions.

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

Open the URL printed by Angular, normally `http://localhost:14200`.

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

`content/` is the only persisted content tree. Angular copies it unchanged to the deployed `/content/` path. At startup, the generic content service loads the catalog and each pack manifest. It loads, assembles, and validates a pack's lesson and test files only when that pack is opened, retaining at most two complete packs in memory. Presentation components receive only the generic assembled model.

```powershell
npm --prefix client run content:validate
```

Product-level content policy and pedagogy records remain under root `specs/`. The client owns pack sources, generic direct-source validation, runtime content assembly, and static deployment configuration.

## Storage notes

Progress is stored in IndexedDB under the browser origin serving the client. A different hostname, port, or deployment URL has separate browser storage. The client provides explicit JSON backup and restore, optional manual Google Drive recovery checkpoints, and scoped clearing controls. Drive is never required for study and is never contacted at startup or on browser close.

Adding a topic pack preserves current-format progress. A materially changed installed pack clears only that pack's incompatible local progress. A stored state containing an obsolete shape or removed pack resets completely. Restore accepts the complete current state format, initializes newly installed packs empty, discards explicitly disclosed progress from changed packs, and rejects removed packs or unsupported schemas.

## Optional Google Drive setup

Google Drive recovery uses Google Identity Services' browser token flow and the single `drive.appdata` permission. Tokens remain in memory; there is no client secret, refresh token, profile request, background synchronization, or custom password encryption.

To enable the feature for a deployment:

1. Enable the Google Drive API in a Google Cloud project and configure its OAuth consent screen.
2. Create a **Web application** OAuth client and register every exact HTTPS deployment origin under **Authorized JavaScript origins**. For local testing, also register the exact local origin such as `http://localhost:14200`.
3. Set the deployment's `GOOGLE_OAUTH_CLIENT_ID` GitHub Actions repository variable to the browser client ID. The deployment build writes it to the generated same-origin `runtime-config.js`; it is public configuration, not a secret.
4. For local testing, copy `.env.example` to the ignored `.env.local`, set `GOOGLE_OAUTH_CLIENT_ID` there, and start the client normally. `npm start` and `npm run watch` read the local file and generate `public/runtime-config.js` before Angular runs, so no tracked source file needs editing. Ordinary builds stay unconfigured unless `GOOGLE_OAUTH_CLIENT_ID` is explicitly present in the process environment, keeping tests and production builds deterministic.

For the existing GitHub Pages site, the public policy links for Google Auth Platform's Branding page are:

- Privacy Policy: `https://khosropakmanesh.github.io/sisu-steps/privacy/`
- Terms of Service: `https://khosropakmanesh.github.io/sisu-steps/terms/`

Both routes use the regular app shell and are linked from its footer. The build writes a dedicated `index.html` for each route so a direct GitHub Pages request returns HTTP 200. Enter these URLs in Google Cloud only after the updated site has been deployed and both pages have been checked live.

The local file contains only public browser configuration and must never contain a Google client secret:

```text
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

If the value is absent, local learning and file backup continue normally and Drive actions show a recoverable configuration message. Keep the existing Content Security Policy restricted to Google Identity Services and the Drive API origins already declared in `src/index.html`.

# G008 validation

## Automated validation

- **VAL-G008-001** (`REQ-G008-001`, `002`): Browser tests prove startup, study, Stats, file backup, and clearing make no Google request.
- **VAL-G008-002** (`REQ-G008-003`–`006`, `047`–`051`): Unit and integration tests verify the exact scope, action-triggered authorization, in-memory token handling, cancellation, configuration failure, revoked/expired-token recovery, and absence of identity scopes and persistent credentials.
- **VAL-G008-003** (`REQ-G008-007`, `008`, `014`–`019`): Contract tests prove file and Drive recovery share the canonical envelope, parser, structural validation, content-reference validation, and replacement operation.
- **VAL-G008-004** (`REQ-G008-020`–`025`): Policy tests cover exact versions, new packs, changed packs, surviving notes, removed lessons, removed packs, unsupported schemas, malformed records, unknown references, and stable-ID ownership.
- **VAL-G008-005** (`REQ-G008-009`–`013`, `016`): Integration tests inject failure before upload, during replacement, after download, during validation, and before local replacement; the prior checkpoint and local state remain correct.
- **VAL-G008-006** (`REQ-G008-026`–`029`, `045`): Component and browser tests verify overwrite, restore, compatibility-loss, Drive deletion, local clearing, disconnection, every cancellation path, and focus restoration.
- **VAL-G008-007** (`REQ-G008-030`–`037`): Component tests verify the unchanged three-row local archive, the separate following Drive container, all explicit actions, disclosures, data summaries, operation locking, live feedback, and empty/incompatible states.
- **VAL-G008-008** (`REQ-G008-038`–`046`): Shell and browser tests verify the background-free cloud forms, switch-matched visual weight, compact **Not set** or short-date text, accessible saved-state names, navigation and heading focus, truthful footer wording, and lack of connected/disconnected claims.
- **VAL-G008-009** (`REQ-G008-043`–`045`): Browser checks cover keyboard, focus, live regions, non-color status, practical touch targets, reduced motion, forced colors, text spacing, 200%/400% zoom, enlarged text, and 320/768/1440-pixel Day/Night layouts.
- **VAL-G008-010** (`REQ-G008-047`–`051`): Security review verifies OAuth origins and CSP, generated same-origin runtime configuration, ignored local configuration, deployment-variable injection, malformed client-ID rejection, no client secret or refresh token, no sensitive logging, least privilege, and no unsupported privacy or encryption claims.
- **VAL-G008-011**: The complete client check and end-to-end suite pass; feature index, design guidance, setup documentation, and `CHANGELOG.md` are updated.
- **VAL-G008-012** (`REQ-G008-052`–`054`): Browser checks open both policy URLs directly with successful responses inside the regular app shell, confirm their generated GitHub Pages entry files, follow footer links, verify both contact methods, check that the policy content fills the available workbook width without horizontal overflow at mobile, tablet, and desktop sizes, and check that the privacy and terms text matches the implemented local and Drive data boundaries.

## Provider failure matrix

- No checkpoint and externally deleted checkpoint.
- Popup blocked, authorization cancelled, and permission denied.
- Offline, timeout, interrupted response, `401`, `403`, quota, rate limiting, and temporary server errors.
- Existing checkpoint changed between inspection and confirmed replacement.
- Malformed metadata, malformed JSON, unsupported schema, removed pack, changed pack, and unknown references.

## Manual checks

- Exercise the archive and header control at 320, 768, and 1440 pixels in Day and Night.
- Verify native keyboard order, visible clipped-control focus, confirmation cancellation, focus restoration, live announcements, and static reduced motion.
- Verify browser zoom, enlarged text, forced colors, and text-spacing overrides do not clip labels or controls.
- Inspect the Google consent screen and network requests to confirm only `drive.appdata` is requested and no profile endpoint is called.
- Confirm no Google request occurs before a Drive action and no token or backup content appears in browser storage or application logs.
- Confirm a failed upload retains the earlier checkpoint and every failed or cancelled restore retains current IndexedDB data.

## Execution evidence

Recorded on 2026-09-22:

- `npm run check` passed: ESLint, Stylelint, module-size, dead-code, architecture,
  formatting, application and test TypeScript, all 11 content packs, the production build,
  204 unit tests, and 14 integration tests.
- `npm run test:e2e` passed with 247 tests passing and 35 intentionally skipped across the
  320-pixel mobile, 768-pixel tablet, and 1440-pixel wide Chromium projects (282 scheduled
  cases total).
- The focused Drive recovery browser file passed all 6 mobile, tablet, and wide cases.
- The focused enlarged-text browser file passed all 6 Day/Night mobile cases at 150% and 200%
  text sizing.
- Live Google consent and Drive API checks remain a deployment check because this local run did
  not use a configured Google OAuth client or a real Google account.

Runtime-configuration change recorded on 2026-09-23:

- `npm run check` passed: ESLint, Stylelint, module-size, dead-code, architecture,
  formatting, application and test TypeScript, all 11 content packs, the production build,
  205 unit tests, and 14 integration tests.
- The runtime generator passed in unconfigured, ignored-local-file, deployment-environment, and
  environment-over-local precedence modes; a malformed Google OAuth client ID was rejected.
- A deployment-like production build with the `/sisu-steps/` base path contained the injected
  client ID in `runtime-config.js`, loaded that same-origin file, and contained no legacy OAuth
  metadata in the tracked HTML.
- The focused Drive recovery browser file passed all 6 mobile, tablet, and wide cases, including
  verification that the ordinary test build remains deliberately unconfigured.

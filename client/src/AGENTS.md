# Angular, template, and CSS rules

These rules apply under `client/src/`.

## Ownership

- Keep bootstrapping, providers, route metadata, route composition, and shell composition under `app/`.
- Keep learner-facing UI and behavior under `features/learning/`.
- Inside Learning, choose dashboard, lessons, study, reports, or data-management before a technical-role folder.
- Keep cross-workflow Learning behavior under `features/learning/shared`; keep root `shared` for app-agnostic contracts and browser infrastructure.
- Keep reusable visual primitives and tokens under `design-system/`.
- Do not create broad root-level `components`, `pages`, `state`, `data`, `domain`, `core`, `lib`, `utils`, `helpers`, or `common` dumping grounds.

## Angular and TypeScript

- Use standalone Angular components, signals, strict TypeScript, and explicit dependency injection.
- Keep route pages focused on route state, feature operations, and purpose-named view composition.
- Put independent interaction state in focused components; complete persisted operations in feature services; pure decisions in policies/validators; derived read models in queries; and browser/IndexedDB I/O behind repositories/adapters.
- Give each file one dominant responsibility. Do not create replacement catch-all services or feature-wide type barrels.
- Keep production TypeScript modules at or below 300 physical lines and functions or component implementations at or below 150 physical lines. A cohesive declarative/generated exception requires an adjacent explanation.
- Preserve lazy loading for every secondary route.
- Add concise comments only at meaningful data-flow, transaction, cleanup, and non-obvious policy boundaries.

## Templates and accessibility

- Use semantic HTML before generic wrappers and ARIA.
- Use buttons for actions and links for navigation.
- Give controls visible labels or accessible names and preserve keyboard access.
- Preserve visible focus, reduced motion, practical touch targets, and non-color-only status cues.
- Associate validation and helper text with the control or operation they describe.
- Use live regions for meaningful asynchronous feedback.

## CSS and design

- Read `client/specs/design-system/` before adding reusable visual behavior.
- Use `design-system/tokens.css` before raw reusable colors, spacing, shadows, radii, typography, control geometry, or breakpoints.
- Keep selectors scoped to the owning app shell, feature workflow, or design-system primitive.
- Keep CSS with its owner and each stylesheet at or below 400 physical lines.
- Avoid inline styles unless the value is dynamic and local.
- Prevent overlap and clipped controls at desktop and mobile widths.
- Update design-system guidance when adding a reusable token, component, or interaction pattern.

## Trust boundaries

- Treat imported JSON, learner input, and bundled static content as untrusted until validated by the owning boundary.
- Validate a complete backup before replacing persisted state.
- Preserve consequence-specific confirmation for destructive actions and explicit controls for downloads/restores.
- Do not add remote requests, analytics beacons, scraping, synchronization, or provider calls without an approved spec.

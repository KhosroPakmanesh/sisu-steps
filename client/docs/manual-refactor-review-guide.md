# Manual refactor review guide

Use this after `npm --prefix client run check` and `npm --prefix client run test:e2e` when a change affects architecture, persistence, responsive layout, keyboard behavior, downloads, restores, or destructive actions.

## Structural review

- Confirm route metadata/composition stays in `client/src/app` and route pages stay under their Learning workflow.
- Confirm complete mutations live in services, pure decisions in policies/validators, derived reads in queries, and browser I/O in shared adapters/repositories.
- Confirm no feature imports `client/src/app`, no shared/design-system module imports app/features, and no vague `core`, `lib`, `utils`, `helpers`, or `common` owner was introduced.
- Confirm unit tests mirror their production owner under `client/tests/unit` and use explicit Vitest imports.
- Confirm new tokens/components/patterns are documented under `client/specs/design-system`.

## Learner workflow review

1. Open the dashboard and verify 15 ordered tests remain grouped into **Focused tests** and **Reviews** sections without repeated classification badges on the cards.
2. Open Learn first, move through lesson navigation, run and reveal optional practice, and confirm it does not affect attempts or mistakes.
3. Start a test, answer incorrectly, reload, and verify the session and feedback recover.
4. Reveal with `Alt+A`; confirm it records a skip and does not create or resolve a mistake.
5. Correct a mistake, verify its delayed review, then answer the paired review exercise and inspect Reports.
6. Export a backup, reject malformed/incompatible imports without replacing state, and verify clear-test/topic/all confirmations describe their exact consequence.

## Accessibility and responsive review

- Review dashboard, lesson, study, reports, and data settings at 320, 768, and 1440 pixels.
- Tab through the shell and every visible control; focus must remain visible and order must follow the page.
- Confirm links navigate, buttons act, labels name inputs, feedback uses live regions, and status is not color-only.
- Confirm no horizontal document overflow, overlapping controls, clipped text, or inaccessible touch targets.
- With reduced motion enabled, confirm non-essential motion is removed.

## Persistence and network review

- Confirm database constants remain `sisu-steps` / `1` / `learner-state` / `current` unless a migration is explicitly specified.
- Confirm writes remain atomic at the learner-state repository boundary and failed validation cannot partially replace state.
- Confirm bundled content remains immutable static JSON and same-origin content loading is the only automatic request.
- Confirm downloads, restore-file reads, and destructive clearing remain explicit user actions.

## G002 review evidence (2026-08-18)

- Static ownership, module-size, reachability, architecture, lint, format, strict production/test typechecking, content validation, unit tests, and production build passed.
- Unit result: 8 files, 57 tests passed.
- Browser result: dashboard, lesson practice, keyboard reveal/session recovery, responsive reports, and data controls passed in Chromium at 320, 768, and 1440 pixels.
- Content result: one version-4.1.0 pack, 14 tests, 200 scored exercises, 13 lessons, and 44 practice exercises.
- No backend, remote persistence, authentication, analytics, provider call, or content change was introduced.

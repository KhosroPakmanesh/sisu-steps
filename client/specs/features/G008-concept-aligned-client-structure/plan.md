# G008 — Concept-aligned client structure

## Goal

Make the client tree explain the application in product language. Learning code is organized around topics, lessons, study, progress statistics, learner data, and explicitly shared learning capabilities. Tests distinguish isolated modules, cross-workflow integration, and browser journeys.

## Scope

- Rename historical `dashboard`, `reports`, and `data-management` owners to `topics`, `stats`, and `learner-data`.
- Replace report terminology in current code with computed progress-summary terminology; do not introduce a report record or storage concept.
- Move learner state, persistence, and navigation from root `shared` into learning-owned `shared`.
- Move shell-owned CSS out of the reusable design-system folder and rename remaining generic layout primitives by purpose.
- Mirror production owners in unit tests, move cross-workflow tests to integration, group browser tests, and move reusable fixtures into test helpers.
- Strengthen architecture checks, test commands, browser-server isolation, CI, and current technical guidance.

## Non-goals

- No route, screen, copy, learning-content, grading, review-scheduling, or accessibility redesign.
- No IndexedDB schema, backup format, stable-ID, or content-version change.
- No backend, account, synchronization, analytics, runtime AI, or remote persistence.
- No replacement of Angular, Vitest, Testing Library, Playwright, IndexedDB, or plain CSS.

## Target production structure

```text
src/
  app/
    shell/
  design-system/
  features/learning/
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
tools/
  content-validation/
    shared/
    foundations/
    olla/
    demonstratives/
```

## Target test structure

```text
tests/
  setup.ts
  helpers/
    unit/
    integration/
  unit/
    app/
    features/learning/
    shared/browser/
    tools/
  integration/learning/
  e2e/
    workflows/
    content/
    accessibility/
    support/
    visual/
```

## Implementation plan

1. Record the compatibility boundary and supersession relationship in this specification.
2. Move production modules into concept-aligned owners and update imports, symbols, selectors, and route loaders without changing route paths or state contracts.
3. Relocate shell styling and learning-owned state, persistence, navigation, progress summaries, and browser identifiers to their true owners.
4. Reorganize unit, integration, helper, and Playwright files and update Vitest/TypeScript commands so each layer is independently runnable.
5. Extend architecture enforcement to validate workflow dependencies and unit-test mirroring.
6. Update client technical guidance and repository workflow documentation; add the aggregate client gate to CI.
7. Run formatting, architecture, type, unit, integration, content, build, and browser validation and inspect the final diff for behavioral or storage changes.

## Risks

- Broad path changes can leave lazy route imports or test fixtures stale unless all TypeScript and template references are searched and typechecked.
- Moving CSS can change cascade order unless imports remain in the same order.
- A renamed TypeScript model can accidentally imply a persisted migration; compatibility tests must prove the serialized learner state is unchanged.
- Browser suites can be flaky when multiple projects mutate the same browser-local state or reuse an unrelated development server.

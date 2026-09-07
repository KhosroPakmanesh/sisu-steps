# G008 concept-aligned client structure requirements

## Product-language requirements

- **REQ-G008-001:** Client production code, tests, and current technical guidance shall describe the learner-facing concepts as topics, lessons, study, progress statistics, and learner data; they shall not model a persisted or generated `Report` entity.
- **REQ-G008-002:** The existing `/`, `/topics/:topicId`, `/lessons/:lessonId`, `/study/:testId`, `/stats`, and `/stats/:topicId` routes and their learner-visible behavior shall remain unchanged.
- **REQ-G008-003:** The refactor shall preserve IndexedDB database names, object stores, keys, record shapes, schema versions, backup compatibility, stable content IDs, authored content, and content versions.

## Source-ownership requirements

- **REQ-G008-004:** Learning production code shall use the workflow roots `topics`, `lessons`, `study`, `stats`, `learner-data`, and `shared` under `src/features/learning/`.
- **REQ-G008-005:** Topic catalog and topic-detail pages and queries shall be owned by `topics`; progress overview and topic-progress pages shall be owned by `stats`; backup, restore, and clear-history operations shall be owned by `learner-data`.
- **REQ-G008-006:** Cross-workflow progress read models and queries, learning navigation, learner-state models, the learning-state store, state alignment, and learner-state persistence shall be owned by `features/learning/shared`.
- **REQ-G008-007:** Root `src/shared` shall contain only product-agnostic browser or utility code. Learning workflows shall not depend on sibling workflow internals, except that `stats` may compose learner-data controls.
- **REQ-G008-008:** Application-shell styling shall be owned by `app/shell`; reusable visual primitives shall remain in `design-system`; workflow-only styling shall be owned by the applicable learning workflow.
- **REQ-G008-009:** Purpose names shall replace historical container names where meaning is clearer, including `TopicCatalogPage`, `TestProgressSummary`, `getTestProgress`, and `ClearHistoryService`.

## Test-ownership requirements

- **REQ-G008-010:** Unit tests shall live under `tests/unit` and mirror the production owner and module name. Reusable unit fakes and builders shall live under `tests/helpers/unit` rather than a fake production feature.
- **REQ-G008-011:** Tests that exercise more than one learning workflow or a complete stateful operation shall live under `tests/integration/learning`; unit tests shall not act as catch-all workflow suites.
- **REQ-G008-012:** Playwright tests shall be grouped by learner workflows and cross-cutting quality concerns under `tests/e2e`; shared browser setup and helpers shall not be mixed with test specifications.
- **REQ-G008-013:** The regular unit command shall run unit tests only, a dedicated integration command shall run integration tests, and the aggregate check shall run both before the production build.

## Enforcement and compatibility requirements

- **REQ-G008-014:** Automated architecture checks shall reject retired production or test roots, forbidden sibling-workflow imports, misplaced mirrored unit tests, and learner-specific modules under root `shared`.
- **REQ-G008-015:** Browser test startup shall use the repository's configured application server and shall not silently accept an unrelated process merely because it responds on the configured port.
- **REQ-G008-016:** Continuous integration shall run the aggregate client check before deployment packaging.
- **REQ-G008-017:** Current client specifications, agent guidance, and developer documentation shall identify G008 as superseding the feature-root and test-topology portions of G002 while retaining G002's module-size, accessibility, and workflow rules.

## Acceptance criteria

- Given the source tree, when a maintainer looks for a learner concept, then its modules are found under the workflow named for that concept and no `reports` or `data-management` production root exists.
- Given a test path, when its scope is inspected, then a unit test mirrors one production owner, a cross-workflow test is under integration, and a browser test is grouped by workflow or quality concern.
- Given existing learner data and bundled content, when the reorganized client starts, then routes, progress, notes, sessions, history, backups, and statistics behave as before without a migration.
- Given a forbidden workflow dependency or misplaced unit test, when the architecture check runs, then it fails with the violating path.
- Given the aggregate check and browser suite, when they run against the reorganized tree, then they pass without changing learner-visible content or behavior.

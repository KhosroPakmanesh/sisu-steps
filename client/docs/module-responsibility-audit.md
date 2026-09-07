# Module responsibility audit

## Result

The client tree now reflects the app's actual concepts. There is no stored or generated report concept: Stats derives progress summaries from learner history. Historical `dashboard`, `reports`, and `data-management` source roots have been replaced by `topics`, `stats`, and `learner-data`, and learning-specific state no longer appears product-agnostic at root.

## Responsibility map

| Owner                               | Dominant responsibility                                                            | Key modules                                                              | Audit result                                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `client/src/app`                    | Bootstrap, providers, route metadata/tree, and shell composition                   | `app.config.ts`, `app.routes.ts`, `routes.config.ts`, `shell/`           | Cohesive; feature implementation remains lazy and shell-specific global CSS is shell-owned.         |
| `learning/topics`                   | Topic catalog, topic details, continue-learning selection, and topic summaries     | `topic-catalog.page.*`, `topic-catalog.queries.ts`, `topic.page.*`       | Thin pages use pure queries and learning-shared progress without importing Stats.                   |
| `learning/lessons`                  | Lesson reading, optional unscored practice, and lesson completion                  | lesson page, practice component, progress service                        | Interaction, route coordination, and durable completion remain separate.                            |
| `learning/study`                    | Session creation, answering, correction/review transitions, and attempt completion | page, services, policies, and factories                                  | Complete operations are service-owned; grading and transitions remain pure.                         |
| `learning/stats`                    | Progress overview and topic-progress presentation                                  | `stats.page.*`, `topic-stats.page.*`                                     | Presents derived history; it owns no report model and may compose learner-data controls explicitly. |
| `learning/learner-data`             | Backup contracts, compatibility, import/export, and scoped history clearing        | backup models/service/validator/policy, restore component, clear service | File/confirmation boundaries are adapted; complete replacement occurs only after validation.        |
| `learning/shared/content`           | Content contracts, loading, validation, lookups, and cross-workflow content labels | focused model, service, query, and validator files                       | Generic within Learning and independent of any topic subject.                                       |
| `learning/shared/navigation`        | Stable path construction used by learning screens and the shell                    | `learning.paths.ts`                                                      | Route strings are unchanged; route matching remains app-owned.                                      |
| `learning/shared/notes`             | Learner notes and their reusable presentation                                      | note service and sticky-note component                                   | Notes are learning-specific and shared by topic, lesson, and data workflows.                        |
| `learning/shared/progress`          | Grading, cross-workflow progress reads, and derived test progress summaries        | policies, queries, `test-progress.*`                                     | Pure and framework-independent; no derived summary is persisted.                                    |
| `learning/shared/state`             | Learner-state contracts, creation, alignment, initialization, and atomic commits   | models, factory, policies, store, `persistence/`                         | Persisted contracts and IndexedDB are co-located with their only product owner.                     |
| `client/src/design-system`          | Canonical tokens and reusable visual foundations/patterns                          | reusable CSS layers                                                      | No app/feature dependency; workbook shell CSS has moved to the shell.                               |
| `client/src/shared/browser`         | Product-agnostic fetch, file, appearance, and identifier browser boundaries        | four adapters/functions                                                  | No learning model dependency and no app/feature import.                                             |
| `client/tests/unit`                 | Isolated module and component behavior                                             | mirrored app/feature/shared/tool owners                                  | Unit discovery excludes stateful cross-workflow tests.                                              |
| `client/tests/integration/learning` | Complete stateful operations spanning learning owners                              | study, correction/review, learner-data, and content-alignment suites     | Former catch-all unit coverage is split by operation and explicitly classified as integration.      |
| `client/tests/e2e`                  | Browser workflows and cross-cutting UI qualities                                   | workflow, content, accessibility, visual, and support groups             | Browser setup is separate from specs and refuses to reuse an arbitrary responding server.           |

## Dependency audit

- Learning workflows import their own implementation and learning-shared capabilities.
- Stats has the sole documented sibling dependency because the Stats screen composes learner-data controls.
- Learning-shared modules do not import workflow implementations.
- Root shared is limited to `browser/` and has no app or feature dependency.
- The architecture gate evaluates learning workflow dependencies directly rather than collapsing every workflow into one `learning` node.

## Compatibility audit

- Public paths remain `/`, `/topics/:topicId`, `/learn/:topicId/:testId`, `/lessons/:lessonId`, `/study/:topicId/:testId`, `/mistakes/:topicId`, `/review/:topicId`, `/stats`, and `/stats/:topicId`.
- IndexedDB remains database `sisu-steps`, version `1`, store `learner-state`, key `current`.
- Backup type/version, serialized learner-state fields, stable content IDs, and content versions remain unchanged.
- Authored content and learner-visible behavior are outside this structural migration.

## Test audit

- `test:unit` runs only mirrored unit tests.
- `test:integration` runs cross-workflow stateful tests.
- `check` runs both layers after static, type, content, and production-build validation.
- Playwright specs are grouped by concern; global setup serves the just-built static application and no longer silently accepts an unrelated server on port 4200.

No module-size, function-size, CSS-size, reachability, architecture, lint, or test exception is introduced by G008.

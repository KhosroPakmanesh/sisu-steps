# Module responsibility audit

## Result

The former `app/core` and `app/pages` topology has been removed. Production ownership is explicit, all production TypeScript/CSS files pass the 300/400-line limits, every production function/component passes the 150-line trigger, and the reachability/architecture gates report no orphan, vague owner, back edge, or feature cycle.

## Responsibility map

| Owner                           | Dominant responsibility                                                            | Key modules                                                                  | Audit result                                                                                          |
| ------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `client/src/app`                | Bootstrap, providers, route metadata/tree, and shell composition                   | `app.config.ts`, `app.routes.ts`, `routes.config.ts`, `shell/app-shell.*`    | Cohesive; feature implementation is lazy and app-owned navigation paths are not imported by features. |
| `learning/dashboard`            | Catalog overview and learner-facing entry points                                   | `dashboard.page.*`                                                           | Thin query/composition page; no persistence or browser I/O.                                           |
| `learning/lessons`              | Lesson reading, optional unscored practice, and lesson completion                  | `lesson.page.*`, `lesson-practice.component.*`, `lesson-progress.service.ts` | Interaction, route coordination, and durable operation have separate owners.                          |
| `learning/study`                | Session creation, answering, correction/review transitions, and attempt completion | page, two services, three policies/factories                                 | Complete operations are service-owned; grading/state transitions remain pure.                         |
| `learning/reports`              | Test/skill read models and presentation                                            | page, `report.queries.ts`, `report.models.ts`                                | Derived reads are pure and separated from presentation.                                               |
| `learning/data-management`      | Backup compatibility, import/export coordination, and scoped clearing              | page, two services, validator, policy                                        | File/confirmation APIs are adapters; complete state replacement occurs only after validation.         |
| `learning/shared/content`       | Content contracts, catalog loading, cross-pack validation, and lookup queries      | focused model, service, query, and validator files                           | Former 511-line service decomposed without weakening validation context.                              |
| `learning/shared/progress`      | Grading and cross-workflow progress reads                                          | grading policy and progress queries                                          | Pure, framework-independent decisions.                                                                |
| `learning/shared/state`         | Learner-state creation, pack compatibility, initialization, and atomic commits     | factory, alignment policy, store                                             | Former broad orchestration separated from individual workflow operations.                             |
| `client/src/design-system`      | Canonical tokens and reusable visual foundations/patterns                          | five CSS layers                                                              | No app/feature dependency; reusable feedback and sentence explanation are single-owned.               |
| `client/src/shared/browser`     | Fetch, file reading/download, and confirmation browser boundaries                  | three adapters                                                               | Direct DOM/file/network calls are isolated and user initiated where required.                         |
| `client/src/shared/domain`      | Persisted learner-state contracts                                                  | `learner-state.models.ts`                                                    | Stable schema shapes retained with no feature dependency.                                             |
| `client/src/shared/identity`    | Browser-local identifiers                                                          | `browser-identifier.ts`                                                      | Random/time access isolated from policies.                                                            |
| `client/src/shared/navigation`  | App-agnostic public path construction                                              | `route-paths.ts`                                                             | Removes feature-to-app dependency while preserving paths.                                             |
| `client/src/shared/persistence` | Repository contract and IndexedDB mechanics                                        | contract plus three IndexedDB modules                                        | Database name/version/store/key and transaction semantics are explicit and unchanged.                 |

## Compatibility audit

- Public paths remain `/`, `/learn/:topicId/:testId`, `/study/:topicId/:testId`, `/mistakes/:topicId`, `/review/:topicId`, `/reports`, and `/data`.
- IndexedDB remains database `sisu-steps`, version `1`, store `learner-state`, key `current`.
- Backup type/version and learner-state interfaces remain stable.
- The catalog still contains one pack at version 4.1.0 with 200 scored exercises, 13 lessons, and 44 unscored practice exercises.
- The source prototype was not modified.

## Exceptions

No module-size, function-size, CSS-size, reachability, architecture, lint, or test exception is required. The Angular production style budget warns at 6 kB and fails at 8 kB per component; the stricter 400-physical-line stylesheet gate remains independently enforced.

# Technical-guidance adoption record

## Source and method

- Source repository: `D:\Repositories\unnamed-app-ui-prototype`
- Commit at inspection: `7d22356dc95d66165d2c167ead34d6102054369b`
- Inspection date: 2026-08-18
- Scope: all 55 project-owned Markdown files outside `node_modules`, plus the source repository's enforcement scripts and configuration
- Safety: the source repository was read only. Its pre-existing working-tree changes were observed but not edited, staged, cleaned, or normalized.

The source is a React/Vite job-search prototype. Sisu Steps is an Angular local-first Finnish exercise book. Product behavior, product entities, framework-specific implementation, visual identity, and historical changelog content were therefore not copied. Applicable engineering governance was adapted to the target's actual stack and constraints.

## Decision summary

- **Adapted:** workflow-first feature ownership, app/feature/design-system/shared dependency direction, purposeful modules, thin routes, pure policies/queries/validators, complete application operations, browser adapters, repository boundaries, mirrored external tests, strict static gates, canonical tokens, accessibility rules, and adoption/audit records.
- **Consolidated:** the source's G003–G009 refactor lessons are represented by target feature `G002-technical-guidance-alignment` and the architecture documents instead of seven artificial target features.
- **Retained target-specific:** Sisu Steps' Angular 21 stack, local IndexedDB schema, content authoring rules, Finnish pedagogy, G001 identifiers, routes, and visual language.
- **Excluded:** job-search workflows/entities, React/Bootstrap/Vite instructions, authentication or service assumptions, and source history that does not govern this product.

## Complete Markdown inventory

| Source file                                                               | Disposition in Sisu Steps                                                                                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                                                               | Adapted into root `AGENTS.md`, `client/AGENTS.md`, and `client/src/AGENTS.md`; product and React-specific rules excluded. |
| `CHANGELOG.md`                                                            | Reviewed as historical evidence only; not copied because it describes another product.                                    |
| `README.md`                                                               | Adapted developer-navigation and validation concepts into the target README; product copy excluded.                       |
| `docs/commit-checklist.md`                                                | Adapted into `client/docs/commit-checklist.md` with IndexedDB, content, and browser-only safety checks.                   |
| `docs/guidance-adoption.md`                                               | Adapted as `client/docs/guidance-adoption.md`, the complete client provenance and disposition record.                     |
| `docs/manual-refactor-review-guide.md`                                    | Adapted into `client/docs/manual-refactor-review-guide.md` for Angular/browser workflows.                                 |
| `docs/module-responsibility-audit.md`                                     | Adapted into `client/docs/module-responsibility-audit.md`; job-search module findings excluded.                           |
| `specs/architecture/browser-local-persistence.md`                         | Adapted into `client/specs/architecture/` for native IndexedDB and compatibility boundaries.                              |
| `specs/architecture/client-feature-slices.md`                             | Adapted into `client/specs/architecture/` for Angular and Learning workflow topology.                                     |
| `specs/architecture/purposeful-modules.md`                                | Adapted into `client/specs/architecture/`, including the 300/150/400 review triggers.                                     |
| `specs/backlog.md`                                                        | Reviewed; not copied because all entries are source-product backlog items.                                                |
| `specs/constitution.md`                                                   | Structural linking pattern adapted; target constitution and G001 product contract retained.                               |
| `specs/constitution/approval-gates.md`                                    | Adapted to deliberate downloads, restores, destructive clearing, new network boundaries, and storage migrations.          |
| `specs/constitution/core-data-entities.md`                                | Reviewed; job-search entities excluded, target content and learner-state entities retained.                               |
| `specs/constitution/mission.md`                                           | Reviewed; source mission excluded and target Finnish-learning mission retained.                                           |
| `specs/constitution/product-direction.md`                                 | Reviewed; source direction excluded and target local-first direction retained.                                            |
| `specs/constitution/product-principles.md`                                | Engineering clarity, recoverability, accessibility, and local ownership adapted; product-specific principles excluded.    |
| `specs/constitution/roadmap.md`                                           | Reviewed; source roadmap excluded because it would invent target product commitments.                                     |
| `specs/constitution/scope.md`                                             | Scope-discipline method adapted; source job-search scope excluded.                                                        |
| `specs/constitution/tech-stack.md`                                        | Dependency and boundary discipline adapted; React, Vite, Bootstrap, and document-processing stack excluded.               |
| `specs/constitution/validation-priorities.md`                             | Adapted into the G002 validation matrix and aggregate checks.                                                             |
| `specs/design-system/accessibility.md`                                    | Adapted into `client/specs/design-system/` for Angular accessibility and responsive behavior.                             |
| `specs/design-system/components.md`                                       | Adapted into `client/specs/design-system/` for client component contracts.                                                |
| `specs/design-system/patterns.md`                                         | Adapted into `client/specs/design-system/` for client workflow patterns.                                                  |
| `specs/design-system/principles.md`                                       | Adapted into `client/specs/design-system/` while retaining the calm exercise-book visual language.                        |
| `specs/design-system/tokens.md`                                           | Adapted into `client/specs/design-system/` as canonical client tokens; Bootstrap coupling excluded.                       |
| `specs/features/G001-focused-journey/plan.md`                             | Reviewed; excluded as source-product scope. Planning structure informed target G002.                                      |
| `specs/features/G001-focused-journey/requirements.md`                     | Reviewed; excluded as source-product requirements. Stable-ID discipline retained in target specs.                         |
| `specs/features/G001-focused-journey/validation.md`                       | Reviewed; excluded as source-product validation. Evidence structure adapted.                                              |
| `specs/features/G002-complete-job-search-workspace/plan.md`               | Reviewed; excluded as source-product scope.                                                                               |
| `specs/features/G002-complete-job-search-workspace/requirements.md`       | Reviewed; excluded as job-search behavior and entities.                                                                   |
| `specs/features/G002-complete-job-search-workspace/validation.md`         | Reviewed; workflow-validation method adapted without job-search assertions.                                               |
| `specs/features/G003-technical-guidance-alignment/plan.md`                | Consolidated into target G002 plan and this adoption record.                                                              |
| `specs/features/G003-technical-guidance-alignment/requirements.md`        | Consolidated into REQ-G002-001 through REQ-G002-034.                                                                      |
| `specs/features/G003-technical-guidance-alignment/validation.md`          | Consolidated into VAL-G002-001 through VAL-G002-020.                                                                      |
| `specs/features/G004-library-naming-alignment/plan.md`                    | Naming/ownership method consolidated into target architecture; Library product area excluded.                             |
| `specs/features/G004-library-naming-alignment/requirements.md`            | Vague-owner and route-scope requirements consolidated into REQ-G002-007, 016, and 029.                                    |
| `specs/features/G004-library-naming-alignment/validation.md`              | Consolidated into topology and stale-path checks.                                                                         |
| `specs/features/G005-application-document-ownership/plan.md`              | Complete-operation ownership method consolidated; document-generation behavior excluded.                                  |
| `specs/features/G005-application-document-ownership/requirements.md`      | Consolidated into service, policy, adapter, and typed-operation requirements.                                             |
| `specs/features/G005-application-document-ownership/validation.md`        | Consolidated into unit, architecture, and manual workflow checks.                                                         |
| `specs/features/G006-shared-ownership-alignment/plan.md`                  | Shared-ownership method consolidated into root-shared and feature-shared boundaries.                                      |
| `specs/features/G006-shared-ownership-alignment/requirements.md`          | Consolidated into REQ-G002-008, 009, 015, and 016.                                                                        |
| `specs/features/G006-shared-ownership-alignment/validation.md`            | Consolidated into the dependency-direction architecture gate.                                                             |
| `specs/features/G007-module-cohesion-alignment/plan.md`                   | Module-decomposition method consolidated into the target refactor.                                                        |
| `specs/features/G007-module-cohesion-alignment/requirements.md`           | Consolidated into REQ-G002-011 through REQ-G002-017.                                                                      |
| `specs/features/G007-module-cohesion-alignment/validation.md`             | Consolidated into ESLint and module-size checks plus the module audit.                                                    |
| `specs/features/G008-dead-code-cleanup/plan.md`                           | Reachability and deletion method consolidated into target cleanup.                                                        |
| `specs/features/G008-dead-code-cleanup/requirements.md`                   | Consolidated into REQ-G002-030 and REQ-G002-034.                                                                          |
| `specs/features/G008-dead-code-cleanup/validation.md`                     | Consolidated into the Angular-aware reachability gate and stale-path review.                                              |
| `specs/features/G009-workflow-oriented-feature-structure/plan.md`         | Workflow-first migration method consolidated into target Learning slices.                                                 |
| `specs/features/G009-workflow-oriented-feature-structure/requirements.md` | Consolidated into REQ-G002-005 through REQ-G002-010.                                                                      |
| `specs/features/G009-workflow-oriented-feature-structure/validation.md`   | Consolidated into topology checks, lazy-route build validation, and browser journeys.                                     |
| `specs/features/README.md`                                                | Adapted into the target feature index without copying source feature IDs.                                                 |
| `src/AGENTS.md`                                                           | Adapted into Angular/template/CSS ownership rules under the target `client/src/`.                                         |

## Enforcement mapping

| Guideline                               | Target enforcement/evidence                                                                                 |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Dependency direction and workflow roots | `client/scripts/check-architecture.mjs`, lazy route configuration, and mirrored topology tests              |
| Purposeful module/function/CSS size     | `client/scripts/check-module-size.mjs` and ESLint `max-lines-per-function`                                  |
| No orphaned production modules/styles   | Angular-aware `client/scripts/check-source-reachability.mjs`                                                |
| Strict production/test environments     | `client/tsconfig.app.json`, `client/tsconfig.spec.json`, and the client typecheck commands                  |
| Angular/template/CSS quality            | Angular ESLint recommended/accessibility configs and Stylelint standard config                              |
| Formatting                              | Prettier and `npm --prefix client run format:check`                                                         |
| Behavioral compatibility                | 57 unit tests, content validator, production build, and Playwright browser journeys                         |
| Storage/local ownership                 | repository contract, IndexedDB adapter, browser adapters, backup policies, and unchanged database constants |
| Design-system/accessibility             | canonical CSS layers, semantic templates, reduced-motion/focus rules, and multi-viewport browser tests      |

## Intentional target-specific decisions

- Angular standalone components and signals remain; no React migration was performed.
- Native IndexedDB remains the durable store; no localStorage, backend, or cloud synchronization was introduced.
- Plain CSS remains; no Bootstrap or component framework was added.
- Same-origin static JSON remains the only runtime fetch boundary.
- G001 content, pedagogy, schemas, stable IDs, public routes, and persisted learner data remain authoritative.

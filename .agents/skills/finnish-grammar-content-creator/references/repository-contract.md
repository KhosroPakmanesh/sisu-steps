# Repository integration

Use this reference when adding, integrating, or technically validating a pack. Resolve paths from the owning repository (`../../../..` from this reference), so all guides travel with the checkout.

## Read the affected owners

Read [root guidance](../../../../AGENTS.md), [client guidance](../../../../client/AGENTS.md), and [source guidance](../../../../client/src/AGENTS.md), plus the active G001 [plan](../../../../specs/features/G001-local-finnish-exercise-book/plan.md), [requirements](../../../../specs/features/G001-local-finnish-exercise-book/requirements.md), and [validation](../../../../specs/features/G001-local-finnish-exercise-book/validation.md). Use current client specifications when transport, schemas, or content tooling change.

Inspect the current files rather than copying a schema into this reference:

| Owner                                                            | Repository path                                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Catalog registration and group order                             | `client/content/index.json`                                                     |
| Pack manifest, sources, grammar metadata, and ordered references | `client/content/<pack-id>/pack.json`                                            |
| ID-named lesson and learning-test JSON                           | `client/content/<pack-id>/lessons/` and `tests/`                                |
| Runtime models, loading, and validation                          | `client/src/features/learning/shared/content/`                                  |
| Direct-source validation entry points                            | `client/tools/validate-content.mjs` and `client/tools/validate-all-content.mjs` |
| Shared and pack-specific source guards                           | `client/tools/content-validation/`                                              |
| Assessment evidence                                              | `specs/content-assessments/<pack-id>.md`                                        |

## Integrate the approved change

Apply [source and catalog ownership](../../../../specs/content-authoring.md#source-files-and-catalog-grouping), [versions and history](../../../../specs/content-authoring.md#versions-and-learner-history), and the owning feature's acceptance criteria. Check global lesson/test/practice/scored IDs, manifest summaries, ordered references, catalog grouping, and source/runtime agreement against the current models and validators. Namespace new IDs by pack when useful.

Keep irreducibly topic-specific semantic checks with the owning pack; reuse universal validation for shared rules. Correct invalid authored declarations and preserve meaningful failure cases rather than weakening a guard to admit a pack.

Update the owning validation evidence, assessment record, and [changelog](../../../../CHANGELOG.md). Update README guidance when its public instructions change. Follow the [repository checklist](../../../../docs/commit-checklist.md) and applicable client checklist.

## Run checks appropriate to the change

During pack authoring, use the aggregate validator for direct source feedback:

```powershell
npm --prefix client run content:validate
```

Before handing off client content or tooling changes, complete the client gate:

```powershell
npm --prefix client run check
```

Run rendered content checks required by the authoring policy and owning feature validation. Run Playwright for affected routes, persistence, responsive or keyboard behavior, and primary learner workflows under client guidance:

```powershell
npm --prefix client run test:e2e
```

For documentation-only skill maintenance, validate skill metadata, local links and anchors, requirement references, and formatting. A completed command proves only its actual checks; record rendered/manual assessment separately.

# G006 pack-owned content-source validation

## Source-structure checks

- **VAL-G006-001:** Verify `client/content/index.json` contains only ordered safe pack IDs and every registration resolves to exactly one same-named `client/content/<pack-id>/` folder. Covers REQ-G006-001 through REQ-G006-004 and REQ-G006-015.
- **VAL-G006-002:** Verify each pack contains `pack.json`, `lessons/`, and `tests/`; every referenced lesson and learning-test file exists; every filename matches its contained stable ID; and no undeclared JSON source remains in either collection. Covers REQ-G006-004 through REQ-G006-007 and REQ-G006-015.
- **VAL-G006-003:** Search JavaScript, TypeScript, and Angular templates for migrated Finnish lesson/test prose, vocabulary/form tables, authored answers, pack-ID branches, tag-to-skill inference, and review-pair assignment; verify those responsibilities exist only in pack-owned JSON or pack-grouped validation assertions. Covers REQ-G006-008 through REQ-G006-011 and REQ-G006-024.
- **VAL-G006-004:** Inspect Angular assets and confirm `client/content/` is copied unchanged to deployed `/content/`, with no generated `client/public/content/` tree. Covers REQ-G006-001, REQ-G006-007, REQ-G006-012, and REQ-G006-016.

## Automated source and loader checks

- **VAL-G006-005:** Add unit coverage with neutral, runtime-created temporary fixture packs for successful one-pack and two-pack source assembly, explicit authored order, and addition of a pack without generic source-loader changes. Covers REQ-G006-013, REQ-G006-017, REQ-G006-023, and REQ-G006-025.
- **VAL-G006-006:** Add negative offline coverage with automatically cleaned temporary filesystem trees for malformed JSON, missing manifests, unsafe paths, missing and undeclared files, folder/manifest/file ID mismatches, duplicate registrations and references, duplicate global IDs, and invalid cross-references. Do not commit empty marker files merely to preserve invalid fixture directories. Covers REQ-G006-015 and REQ-G006-023.
- **VAL-G006-007:** Add `ContentCatalogService` coverage for exact request paths, manifest-driven ordering despite asynchronous completion, in-memory `TopicPack` assembly, fragment identity checks, complete-collection validation, and recoverable load failures. Covers REQ-G006-012 through REQ-G006-015 and REQ-G006-021.
- **VAL-G006-008:** Run the direct-source validator; verify universal checks apply to every fixture pack and topic-specific checks execute only for their same-named pack. Covers REQ-G006-023 through REQ-G006-025.

## Compatibility checks

- **VAL-G006-009:** Preserve a normalized baseline of the former bundled `vowel-harmony-kpt-tplural` pack; deep-compare it with the directly assembled source pack recursively with array order preserved and require no difference. Covers REQ-G006-018 through REQ-G006-020 and REQ-G006-027.
- **VAL-G006-010:** Confirm browser assembly produces a topic pack that passes the existing TypeScript/runtime validators without compatibility adapters in learner workflows. Covers REQ-G006-018 and REQ-G006-021.
- **VAL-G006-011:** Load compatible learner state associated with pack version `5.1.0`, initialize against the refactored content, and verify attempts, sessions, mistakes, corrections, lesson completions, and notes are not cleared. Covers REQ-G006-019 through REQ-G006-021.
- **VAL-G006-012:** Run existing unit coverage for catalog loading, lesson selection, optional practice, grading, sessions, corrections, reviews, reports, backup validation, and scoped clearing. Covers REQ-G006-021 and REQ-G006-022.

## Repository gates

- **VAL-G006-013:** Verify `package.json` has no content-generation command and the repository has no compiler or generated content artifacts. Covers REQ-G006-016 and REQ-G006-026.
- **VAL-G006-014:** Run `npm --prefix client run content:validate`. Covers REQ-G006-018 and REQ-G006-023 through REQ-G006-025.
- **VAL-G006-015:** Run `npm --prefix client run format:check`, `npm --prefix client run typecheck`, `npm --prefix client run test:typecheck`, and `npm --prefix client run test`. Covers REQ-G006-021 and REQ-G006-026.
- **VAL-G006-016:** Run `npm --prefix client run build` and inspect the output asset tree, then run `npm --prefix client run check`. Covers REQ-G006-012, REQ-G006-018, REQ-G006-021, REQ-G006-023, and REQ-G006-025.
- **VAL-G006-017:** Run `npm --prefix client run test:e2e`; verify the catalog, topic, focused lesson, review lesson selector, all five exercise presentations, answer feedback, session resume, mistakes, review, reports, and learner notes remain operational. Covers REQ-G006-021.

## Manual checks

- **VAL-G006-018:** Review the final diff and confirm changes are limited to direct content ownership/loading, generic validation/tests, specifications, documentation, and asset configuration; reject unapproved learner-visible or persistence changes. Covers REQ-G006-018 through REQ-G006-022.
- **VAL-G006-019:** Follow the documented future-pack procedure with a neutral fixture or temporary pack and confirm no JavaScript registry, pack-specific loader branch, or presentation edit is required. Covers REQ-G006-017 and REQ-G006-026.
- **VAL-G006-020:** Inspect `client/content/`, build output, and contributor guidance and confirm the same JSON files are the sole source and deployed assets, with no generated runtime copy. Covers REQ-G006-001, REQ-G006-007, REQ-G006-012, REQ-G006-016, and REQ-G006-026.

## Completion evidence

Completed 2026-08-28.

- `client/content/` is now the only persisted content tree. Its catalog registers one same-named pack folder containing one manifest, thirteen ID-named lesson files, and fifteen ID-named learning-test files.
- Angular copies those files directly to deployed `/content/`. The production output contained all 30 source files, no extra content files, and zero source/deployment SHA-256 mismatches.
- `ContentCatalogService` now validates safe catalog IDs and pack manifests, loads referenced lesson and test fragments in manifest order, verifies every fragment identity, assembles the unchanged `TopicPack` model in memory, and runs existing pack and collection validation before exposing content.
- The generated `client/public/content/` catalog and bundled pack, generic compiler, generator entry point, compiler declarations, and `content:generate` package command were removed. At migration time, `client/public/` retained only the unrelated favicon; `REQ-G005-034` later replaced it with the branded SVG, ICO and touch-icon set without recreating `public/content/`.
- The direct-source loader and aggregate validator enforce exact folder ownership, safe paths, authored order, manifest/file identity, unique references, global IDs, universal content rules, and pack-grouped topic checks without writing output.
- In-memory assembly of the current pack retained SHA-256 `E7DC4C541C5A87D3CA09D032383CBEC7C3B9BA69B00314B702DAE66DAFB32ADB` under the former deterministic serialization, matching the preserved pre-direct-loading working baseline. Pack version `5.1.0`, stable IDs, ordering, and semantic values remained unchanged.
- `npm --prefix client run content:validate` passed for one pack, thirteen lessons, fifteen tests, 200 scored exercises, 44 optional practice exercises, and 36 sentence exercises.
- Direct source-loader tests create and automatically remove exact temporary filesystem trees for multi-pack source order, malformed ownership, duplicate registrations/references/global IDs, and missing or undeclared entries. No empty fixture marker or committed invalid fixture tree remains. Separate browser-loader coverage verifies request paths, complete in-memory equivalence, safe references, and fragment identity; additional tests cover the installed pack and its dynamically loaded pack-specific pedagogy validator.
- `npm --prefix client run check` passed linting, architecture and reachability checks, formatting, production and test typechecks, direct-source validation, the production build, and all 107 unit tests in sixteen files.
- `npm --prefix client run test:e2e` passed all 36 critical workflows across mobile, tablet, and wide Chromium.
- Angular presentation components, routes, IndexedDB, backups, grading, review scheduling, reports, learner notes, and scoped clearing remain unchanged and consume only the assembled generic runtime models.

### Superseded compiler phase

- The initial G006 implementation extracted the current pack into pack-owned JSON and proved semantic equivalence with the former bundled pack.
- Its generated `client/public/content/` layer and compiler workflow are intentionally superseded by this revision and are not the target architecture.

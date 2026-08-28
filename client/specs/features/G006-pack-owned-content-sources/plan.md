# G006 — Pack-owned content sources

## Goal

Separate authored Finnish content completely from Angular presentation and content tooling by giving every topic pack one same-named folder of pure JSON files. The files under `client/content/` are both the only source of truth and the static assets deployed by Angular. A generic browser content service assembles the registered manifests, lessons, and learning tests in memory without generating or storing a second content tree.

## Included capabilities

- A source catalog at `client/content/index.json` that registers pack folders in authored order.
- One source folder per pack at `client/content/<pack-id>/`.
- Pack metadata in `pack.json`, reusable lesson content under `lessons/`, and authored learning-test content under `tests/`.
- One JSON file per lesson and one JSON file per learning test, named by its stable ID.
- Angular build configuration that copies `client/content/` unchanged to the deployed `/content/` path.
- A generic browser content service that validates and assembles catalog, manifest, lesson, and test fragments into the existing `TopicPack` runtime model.
- Direct-source validation, including exact folder ownership, cross-pack identity checks, and behavior-preserving migration evidence.
- Pack-specific automated validation grouped under the same pack ID when universal schema checks cannot express an existing topic-specific invariant.
- Documentation that identifies `client/content/` as the single content source and deployed asset tree.

## Scope

- Keep the current `vowel-harmony-kpt-tplural` metadata, lesson prose, vocabulary, examples, practice exercises, tests, scored exercises, answers, explanations, diagnostics, skills, and review pairings in its same-named JSON source folder.
- Replace generated runtime content with direct static deployment and generic runtime assembly.
- Preserve the assembled `TopicPack`, `Lesson`, `ExerciseTest`, and `Exercise` runtime contracts.
- Preserve same-origin loading and generic Angular renderers while changing the resource granularity from one generated pack file to a manifest plus lesson and test fragments.
- Update content-validation commands, tests, client technical guidance, and developer-workflow documentation as required.

## Non-goals

- No new or materially revised Finnish lesson, test, exercise, answer, explanation, vocabulary item, source, or pedagogy decision.
- No content-management UI, database, server, account, synchronization, runtime AI, or external runtime content request.
- No Markdown, YAML, MDX, executable content module, or JavaScript-authored pack source.
- No change to Angular lesson or exercise presentation, grading, reporting, review scheduling, learner notes, IndexedDB, backups, routes, or accessibility behavior.
- No stable-ID change, content-version bump, or learner-progress reset.
- No generated copy under `client/public/content/` and no content compilation step.

## Target structure

```text
client/
  content/
    index.json
    vowel-harmony-kpt-tplural/
      pack.json
      lessons/
        vowel-harmony-basics.json
        ...
      tests/
        vowel-families.json
        ...
  src/
    features/learning/shared/content/
      content-catalog.service.ts
      ...generic runtime validators...
  tools/
    validate-all-content.mjs
    ...generic source validators...
    content-validation/
      vowel-harmony-kpt-tplural.mjs
  tests/
    unit/
      features/learning/shared/content/
      tools/content/
```

## Responsibility boundaries

- `client/content/` owns every authored or pedagogical value and is the only persisted content representation.
- Each `client/content/<pack-id>/` folder owns only that pack's metadata, lessons, and learning tests.
- Angular build configuration copies those files without transforming their content.
- The generic browser content service owns safe URL construction, JSON loading, runtime validation, ordered reference resolution, and in-memory `TopicPack` assembly.
- Offline universal validators own exact source shape, references, uniqueness, ordering, and product-contract checks that apply to every pack.
- Pack-specific validation owns only irreducibly topic-specific invariants and is grouped by the same pack ID; it must not become a second source of lesson or exercise content.
- Angular pages and presentation components consume only assembled generic runtime models and remain independent of source layout and pack subject matter.

## Implementation plan

1. Revise and document the pure-JSON source catalog, pack manifest, lesson-file, and learning-test-file contracts.
2. Preserve a normalized baseline of the current assembled pack for exact semantic comparison.
3. Configure Angular to copy `client/content/` unchanged to deployed `/content/` and remove the generated `client/public/content/` tree.
4. Adapt the content catalog service to validate safe pack IDs, load each manifest, resolve lessons and tests in explicit authored order, validate fragment identities, assemble `TopicPack` objects in memory, and apply existing runtime pack validation.
5. Replace compilation tooling with direct-source validation; retain exact folder/file ownership, safe paths, global-ID checks, universal rules, and pack-grouped rules.
6. Remove compiler-only scripts, package commands, tests, declarations, and generated output.
7. Add runtime-loader and negative-case tests for request paths, multiple packs, ordered assembly, malformed or mismatched fragments, duplicate IDs, and recoverable failure.
8. Update documentation so future packs require only a same-named content folder and source-catalog registration.
9. Run formatting, content validation, typechecks, unit tests, production build, aggregate checks, and browser workflows; record exact compatibility evidence.

## Risks

- More static requests can expose partial or malformed packs unless every layer is validated before it reaches learner workflows.
- Unsafe IDs could become path traversal inputs unless catalog and manifest references use a restricted stable-ID grammar before URL construction.
- Changing array order, stable IDs, lesson versions, or the pack version can invalidate saved learner references or trigger a progress reset.
- Build configuration could accidentally omit source files unless production output is inspected.
- File discovery can become nondeterministic unless authored order comes exclusively from explicit JSON manifests.
- Splitting large content into many files can weaken cross-file validation unless runtime assembly and offline complete-source checks both remain mandatory.

# G006 pack-owned content-source requirements

## Source ownership requirements

- **REQ-G006-001:** The client shall keep authored topic-pack content under `client/content/`, separate from Angular production source, generic tooling, generated build output, and mutable learner data.
- **REQ-G006-002:** Every registered topic pack shall own one folder at `client/content/<pack-id>/`, and the folder name shall exactly equal the pack's stable ID.
- **REQ-G006-003:** `client/content/index.json` shall register every pack folder in authored order without embedding lesson, test, or exercise content.
- **REQ-G006-004:** Each pack folder shall contain `pack.json` for pack metadata and explicit ordered lesson and learning-test references, `lessons/` for that pack's reusable lessons, and `tests/` for that pack's authored learning tests.
- **REQ-G006-005:** Every lesson shall be stored as pure JSON in `lessons/<lesson-id>.json`, and the filename shall match the stable lesson ID contained by the file.
- **REQ-G006-006:** Every learning test shall be stored as pure JSON in `tests/<test-id>.json`, and the filename shall match the stable test ID contained by the file.
- **REQ-G006-007:** A pack folder shall not contain a lesson or learning test owned by another pack, and no generated content copy shall be treated as a source or deployed alongside `client/content/`.

## Content-separation requirements

- **REQ-G006-008:** Every learner-visible or pedagogical value—including Finnish and English text, objectives, sections, examples, vocabulary, common mistakes, prompts, options, tokens, accepted answers, explanations, diagnostics, skills, tags, and source citations—shall be declared in the owning pack's JSON files rather than JavaScript or Angular presentation code.
- **REQ-G006-009:** Stable lesson, test, practice-exercise, and scored-exercise IDs; lesson and pack versions; authored ordering; option feedback; misconception metadata; required vocabulary and skills; sentence explanations; and parallel-exercise relationships shall be explicit in the owning JSON files.
- **REQ-G006-010:** Generic tooling and runtime loading shall not infer pedagogical meaning from tags, synthesize Finnish content from word or form tables, choose semantic defaults, assign review partners, or branch on a topic-pack ID.
- **REQ-G006-011:** Angular pages and presentation components shall render only generic assembled runtime content models and shall not depend on a pack ID or contain pack-specific lesson or exercise content.

## Direct-loading requirements

- **REQ-G006-012:** Angular shall copy `client/content/` unchanged to the deployed same-origin `/content/` asset path without creating a second authored or generated content tree.
- **REQ-G006-013:** Authored order shall come from explicit JSON references; filesystem enumeration and network-completion order shall not determine pack, lesson, test, or exercise order.
- **REQ-G006-014:** A generic browser content service shall validate the source catalog and each pack manifest, load referenced lesson and test files, verify referenced identities, assemble the existing `TopicPack` objects in memory, and apply existing runtime pack and collection validation before exposing content.
- **REQ-G006-015:** Runtime loading shall reject unsafe IDs, missing or malformed resources, folder/manifest/file identity mismatches, duplicate registrations or references, invalid assembled packs, and invalid cross-pack collections through the existing recoverable initialization error path. Offline validation shall additionally reject undeclared files and invalid JSON before handoff.
- **REQ-G006-016:** The repository shall not contain a generated public catalog, generated bundled pack artifact, content compiler, or content-generation command.
- **REQ-G006-017:** Adding a valid future pack shall require only its same-named source folder and source-catalog registration, without pack-specific loading code or Angular presentation changes.

## Compatibility requirements

- **REQ-G006-018:** The refactor may replace the generated catalog and pack-file transport contracts, but it shall preserve the assembled runtime `TopicPack`, `Lesson`, `ExerciseTest`, and `Exercise` schemas consumed by learner workflows.
- **REQ-G006-019:** The assembled `vowel-harmony-kpt-tplural` pack shall preserve every current semantic value, array order, stable ID, lesson version, pack version, and cross-reference.
- **REQ-G006-020:** The migration shall not increment the `vowel-harmony-kpt-tplural` pack version or cause the content-version alignment policy to clear compatible learner progress.
- **REQ-G006-021:** Same-origin content loading, runtime content validation, grading, lessons, optional practice, tests, mistakes, review, reports, learner notes, backup/restore, and scoped clearing shall remain behaviorally unchanged after initialization.
- **REQ-G006-022:** The refactor shall add no backend, account, remote storage, synchronization, analytics, runtime AI, or external runtime content request.

## Validation and workflow requirements

- **REQ-G006-023:** Offline source validation shall assemble and validate every registered pack directly from `client/content/`; runtime validation shall validate each loaded layer and the complete assembled collection before content is exposed.
- **REQ-G006-024:** Universal content rules shall remain pack-independent; any irreducibly topic-specific automated check shall be grouped under the same pack ID and shall not contain a second copy of authored lesson, test, or exercise content.
- **REQ-G006-025:** The aggregate content-validation command shall validate every pack registered in the source catalog without generating output.
- **REQ-G006-026:** Repository documentation and commands shall identify `client/content/` as both the sole authored source and the static deployment input and shall contain no instruction to generate a second runtime copy.
- **REQ-G006-027:** Automated regression evidence shall compare the pre-refactor assembled pack and the directly loaded assembled pack as parsed JSON and fail on any semantic, identity, version, reference, or ordering difference.

## Acceptance criteria

- Given the repository source tree, when a maintainer searches JavaScript and Angular files, then no current Finnish lesson, learning-test, exercise, answer, vocabulary table, or topic-specific generation rule is present outside the owning pack's JSON folder.
- Given `vowel-harmony-kpt-tplural`, when its source is inspected, then its metadata is in `pack.json`, every lesson is under its `lessons/` folder, and every authored learning test is under its `tests/` folder.
- Given a production build, when its static assets are inspected, then the files under deployed `/content/` correspond directly to `client/content/` and no generated bundled pack JSON exists.
- Given the migrated current pack, when its browser-assembled JSON is compared with the pre-refactor pack after parsing, then the values, arrays, IDs, versions, references, and ordering are identical.
- Given a valid second fixture pack, when runtime loading and offline validation run, then it is assembled without pack-specific loader or presentation-code changes.
- Given a missing, mismatched, duplicated, unsafe, malformed, or undeclared source file, when the applicable runtime or offline validation runs, then it fails before exposing a complete content collection.
- Given existing compatible IndexedDB learner state, when the refactored build starts, then content alignment preserves that state and every current learner workflow behaves as before.

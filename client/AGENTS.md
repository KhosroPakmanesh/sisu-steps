# Client workspace guidance

- Treat root `specs/constitution.md` and root product features as the product contract. Treat `client/specs/constitution.md`, its linked client architecture/design guidance, and client technical feature specs as the client implementation contract.
- Keep the client usable for core study, scoring, history, and reporting without a backend dependency.
- Use Angular standalone components, strict TypeScript, native browser APIs, IndexedDB, versioned bundled JSON, and plain CSS.
- Keep the Angular application, tests, build configuration, content tooling, and client technical guidance under `client/`.
- Organize production code by `app`, `features`, `design-system`, and `shared` ownership. Within Learning, choose the learner workflow before a technical role. Follow `src/AGENTS.md` for source-specific rules.
- Keep route pages thin, complete operations in purpose-named services, pure decisions in policies/validators, derived read models in queries, and browser I/O behind adapters or repositories.
- Keep production TypeScript modules at or below 300 lines, functions/components at or below 150 lines, and CSS modules at or below 400 lines unless a cohesive declarative/generated exception is documented beside the enforcement override.
- Follow root `specs/content-authoring.md` for every new or materially revised Finnish topic pack, including the recorded pedagogy assessments under root `specs/content-assessments/`.
- Register topic packs in `public/content/index.json`, keep lesson/test/practice/scored IDs globally unique, and run the aggregate generator and catalog validator.
- Keep unit tests under the mirrored `tests/unit` tree with explicit Vitest imports. Use Playwright for critical browser workflows.
- Use canonical tokens and documented client design-system patterns before introducing reusable raw CSS values. Preserve semantic HTML, keyboard access, visible focus, reduced motion, practical touch targets, and non-color status cues.
- From the repository root, run `npm --prefix client run check` before handing off client code or configuration changes. Run `npm --prefix client run test:e2e` when routes, persistence, downloads, responsive behavior, keyboard behavior, or primary workflows change.
- Use `docs/commit-checklist.md` for client review and root `../docs/commit-checklist.md` for cross-area changes.
- Update root `CHANGELOG.md` under `Unreleased` for user-visible, storage, setup, specification, or developer-workflow changes.
- Do not commit changes unless the user explicitly asks.

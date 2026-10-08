# Client workspace guidance

Root [repository guidance](../AGENTS.md) applies throughout this workspace, including authority order, core independence, breaking-data policy, changelog updates and commit authorization.

- Treat root `specs/constitution.md` and root product features as the product contract. Treat `client/specs/constitution.md`, its linked client architecture/design guidance, and client technical feature specs as the client implementation contract.
- Use Angular standalone components, strict TypeScript, native browser APIs, IndexedDB, versioned bundled JSON, and plain CSS.
- Keep the Angular application, tests, build configuration, content tooling, and client technical guidance under `client/`.
- Organize production code by `app`, `features`, `design-system`, and `shared` ownership. Within Learning, choose the learner workflow before a technical role. Follow `src/AGENTS.md` for source-specific rules.
- Keep route pages thin, complete operations in purpose-named services, pure decisions in policies/validators, derived read models in queries, and browser I/O behind adapters or repositories.
- Apply the [module decomposition triggers](specs/architecture/purposeful-modules.md#decomposition-triggers) and source guidance to production TypeScript, functions/components and CSS.
- Follow root `specs/content-authoring.md` for every new or materially revised Finnish topic pack, including the recorded pedagogy assessments under root `specs/content-assessments/`.
- Register topic-pack folders in `content/index.json`, keep each pack's lessons and learning tests under its same-named folder, deploy `content/` directly without a generated copy, keep lesson/test/practice/scored IDs globally unique, and run the aggregate direct-source validator.
- Follow the [test ownership and enforcement rules](specs/architecture/client-feature-slices.md#rules); use explicit Vitest imports and Playwright for critical browser workflows.
- Use the canonical [tokens](specs/design-system/tokens.md), [patterns](specs/design-system/patterns.md) and [accessibility contract](specs/design-system/accessibility.md) for reusable UI changes.
- From the repository root, run `npm --prefix client run check` before handing off client code or configuration changes. Run `npm --prefix client run test:e2e` when routes, persistence, downloads, responsive behavior, keyboard behavior, or primary workflows change.
- Use `docs/commit-checklist.md` for client review and root `../docs/commit-checklist.md` for cross-area changes.

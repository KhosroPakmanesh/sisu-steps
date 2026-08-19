# Repository guidance

- Treat `specs/constitution.md` and the product feature specs under `specs/features/` as the repository-wide product contract. When instructions conflict, explicit user direction wins, then the constitution, then active requirements, then supporting guidance.
- Keep Git metadata, repository-wide ignore rules, shared editor configuration, the changelog, product documentation, and product specifications at the repository root.
- Follow `client/AGENTS.md` for client workspace rules and `client/src/AGENTS.md` for Angular source rules.
- Follow `server/AGENTS.md` for server workspace rules. Do not implement backend behavior until an explicit product requirement and a server-owned specification approve it.
- Preserve the product invariant that core study, scoring, history, and reporting work without a service dependency unless the root product contract is explicitly amended.
- Keep cross-area contracts explicit. When a change affects both client and server, update the owning specifications and validate both sides before handoff.
- Keep authored Finnish content policy and pedagogy records under root `specs/`; implementation-specific content tooling remains client-owned until another approved spec changes ownership.
- Use `docs/commit-checklist.md` for repository-wide review and the relevant area checklist for implementation-specific validation.
- Update `CHANGELOG.md` under `Unreleased` for user-visible, storage, setup, specification, or developer-workflow changes.
- Do not commit changes unless the user explicitly asks.

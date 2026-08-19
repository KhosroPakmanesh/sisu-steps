# Server workspace guidance

- Treat root `specs/constitution.md` and root product feature specs as the product contract.
- Treat `server/specs/` as the owner of future backend technology, API, storage, security, privacy, deployment, and operational requirements.
- Do not add executable backend code until an explicit root product requirement and a server-owned specification define the capability and validation.
- The planned platform is .NET; the supported version, hosting model, persistence, authentication, API style, and deployment model remain undecided until specified.
- Do not make the server mandatory for core study, scoring, history, or reporting unless the root constitution is explicitly amended.
- Do not infer client/server data contracts. Specify versioning, validation, privacy, authorization, failure behavior, and compatibility before implementation.
- Keep server documentation and implementation-specific decisions inside `server/`.
- When server code exists, add server-owned formatting, linting, build, test, security, and migration checks before handoff.
- Use root `../docs/commit-checklist.md` for cross-area changes and update root `CHANGELOG.md` when required.
- Do not commit changes unless the user explicitly asks.

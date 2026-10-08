# Sisu Steps server

The server workspace is reserved for a future explicitly specified .NET backend. No backend application, API, database, authentication, hosting, or deployment behavior is implemented yet.

Before adding executable code:

1. Activate a root product requirement that needs server behavior.
2. Define server requirements and validation under `specs/`.
3. Define any versioned client/server contract on both sides.
4. Record privacy, authorization, storage, migration, failure, and operational decisions.
5. Add server-specific build, test, formatting, linting, and security guidance.

See [server guidance](AGENTS.md) and the [specification entrypoint](specs/README.md) before working in this directory. Future architecture decisions, operational runbooks, deployment guidance and maintenance records belong in `server/docs/` after an owning server specification approves them; the empty documentation placeholder is unnecessary until such records exist.

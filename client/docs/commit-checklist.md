# Commit checklist

Use this checklist before asking for or creating a commit.

## Scope

- [ ] The change is tied to the user request and a requirement ID.
- [ ] Relevant constitution, architecture, design-system, and feature specs were read or updated.
- [ ] Deferred product behavior was not implemented without explicit selection.
- [ ] No unrelated product behavior, content, route, storage, or stack migration was included.

## Validation

- [ ] `npm --prefix client run check` passed when code or configuration changed.
- [ ] Targeted unit tests passed.
- [ ] `npm --prefix client run test:e2e` passed when routes, persistence, downloads, responsive behavior, or primary workflows changed.
- [ ] Manual responsive, keyboard, accessibility, download, restore, or persistence checks were completed or explicitly deferred.

## Safety

- [ ] IndexedDB name, version, store, key, transactions, and learner-state shapes were preserved or intentionally specified.
- [ ] Bundled content remains separate from mutable learner data.
- [ ] Invalid backups remain atomic and do not replace current state.
- [ ] Destructive actions and downloads retain deliberate user control.
- [ ] No new remote request, analytics, authentication, synchronization, or provider boundary was introduced.

## Documentation and review

- [ ] `CHANGELOG.md` was updated under `## Unreleased`, or the handoff explains why not.
- [ ] Specs or agent rules changed when behavior, architecture, validation, storage, or developer workflow changed.
- [ ] The baseline comparison was reviewed for stale paths, hidden behavior changes, and generated artifacts.
- [ ] Remaining risks and skipped checks are documented.

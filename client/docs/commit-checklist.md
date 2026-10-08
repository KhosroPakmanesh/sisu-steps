# Commit checklist

Use this checklist before client handoff or a requested commit. Root [repository guidance](../../AGENTS.md) and the [repository checklist](../../docs/commit-checklist.md) also apply; the same checks support refactor review.

## Scope

- [ ] The change is tied to the user request and a requirement ID.
- [ ] Relevant constitution, architecture, design-system, and feature specs were read or updated.
- [ ] Deferred product behavior was not implemented without explicit selection.
- [ ] No unrelated product behavior, content, route, storage, or stack migration was included.

## Validation

- [ ] `npm --prefix client run check` passed when code or configuration changed.
- [ ] Targeted unit and integration tests passed.
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

## Refactor and affected-workflow review

- [ ] Review source ownership and responsibility against [feature slices](../specs/architecture/client-feature-slices.md) and [purposeful modules](../specs/architecture/purposeful-modules.md), including lazy routes, dependency direction, mirrored unit tests and separate integration coverage.
- [ ] Exercise the affected topic map, lesson reading/practice, saved-session reload, mistake correction and eligible parallel review. Optional practice stays unscored; button-operated answer reveal records a skip without creating or resolving mistakes.
- [ ] Check changed screens at 320, 768 and 1440 pixels with a keyboard and reduced motion, following the [accessibility validation](../specs/design-system/accessibility.md#validation). Record any native zoom, assistive-technology or physical-device check not performed.
- [ ] Export and restore when data operations change; verify malformed/incompatible imports preserve current data and test/topic/all clearing uses exact consequence wording. Follow [persistence](../specs/architecture/browser-local-persistence.md) and the governing compatibility requirements.
- [ ] Review automatic bundled-resource requests and explicit download/restore/clear actions; any new external boundary requires the owning product contract. Optional Drive recovery follows root [G008](../../specs/features/G008-manual-google-drive-recovery/requirements.md).

The original 2026-08-18 refactor results remain in [G002 completion evidence](../specs/features/G002-technical-guidance-alignment/validation.md#completion-evidence); this checklist replaces the separate manual refactor guide.

# Repository commit checklist

Use this checklist before asking for or creating a commit that affects the repository root or more than one implementation area.

## Scope and contracts

- [ ] The change is tied to the user request and the owning product or technical requirement.
- [ ] Root product requirements remain separate from client- or server-specific implementation rules.
- [ ] Cross-area contracts, compatibility behavior, privacy boundaries, and negative cases are specified when relevant.
- [ ] Deferred product behavior was not implemented without explicit approval.

## Validation

- [ ] Every affected area completed its own checklist and required automated validation.
- [ ] Cross-area integration or contract checks passed when more than one area changed.
- [ ] Generated artifacts, runtime data, secrets, logs, and local tool state are excluded from Git.

## Documentation and handoff

- [ ] Root and area-specific indexes and links still resolve.
- [ ] `CHANGELOG.md` was updated under `Unreleased`, or the handoff explains why not.
- [ ] Remaining risks and skipped checks are documented.
- [ ] No commit is created without explicit user approval.

# G008 — Manual Google Drive recovery checkpoint

## Goal

Let one local learner manually save one recovery checkpoint in Google Drive and restore it after browser-data loss or a device change without making Google necessary for study or turning recovery into synchronization.

## Requirement slice

- `REQ-G008-001`–`REQ-G008-051`
- Extends `REQ-G001-020`, `REQ-G001-021`, `REQ-G001-027`, `REQ-G001-105`, `REQ-G001-121`, `REQ-G007-005`, and `REQ-G007-013` only where this specification explicitly says so.

## Included

- Manual backup, restore, deletion, and disconnection.
- One hidden Google Drive application-data checkpoint per selected account.
- The existing canonical learner-backup representation for file and Drive recovery.
- Explicit overwrite, restore, compatibility-loss, and deletion confirmations.
- Safe handling of pack additions, pack-version changes, schema changes, invalid data, and provider failures.
- A compact Drive-backup shortcut with only a cloud form and short status beside the Appearance control.
- Least-privilege browser authorization with no Google profile access or persistent tokens.

## Non-goals

- Automatic, scheduled, startup, close-time, or background backup.
- Multi-device synchronization, record merging, or conflict resolution.
- Multiple checkpoints, history, or save slots.
- A Sisu Steps account, backend, refresh-token store, or server-owned Drive integration.
- Google email, name, profile-image, or identity display.
- Custom encryption, passwords, or recovery keys.
- Automatic restoration or a runtime Google dependency for core learning.

## Affected areas

- Root backup and content-compatibility contracts.
- Client learner-data backup parsing, validation, normalization, and atomic replacement.
- Browser Google authorization and Drive I/O adapters.
- Generated local and deployment runtime configuration for the public OAuth client ID.
- Stats local backup archive, separate following Drive checkpoint container, and shared confirmation sheet.
- Application header, footer wording, design-system guidance, and responsive behavior.
- Directly loadable public Privacy Policy and Terms of Service pages for the existing OAuth project's production consent screen.
- Unit, integration, and browser validation plus deployment documentation.

## Implementation plan

1. Record this product contract and its explicit G001/G007 supersessions.
2. Make file and Drive restore share one canonical parser, compatibility policy, preview, and atomic replacement operation.
3. Add browser-only Google authorization and hidden-app-data Drive adapters behind client I/O boundaries, with the public client ID generated from ignored local or deployment configuration rather than tracked source edits.
4. Add a manual checkpoint service for inspect, create, replace, restore, delete, and disconnect operations.
5. Preserve the existing bound Stats archive, add a separate bound Drive container immediately after it, and reuse the shared confirmation workflow without adding another route or settings page.
6. Add the compact header shortcut and make local-versus-Drive wording truthful.
7. Validate local independence, token privacy, provider failures, compatibility loss, atomicity, accessibility, and responsive layout.

## Risks

- Browser OAuth tokens are exposed to any same-origin script, so XSS prevention and in-memory-only token handling are security boundaries.
- A locally remembered backup date can become stale after external deletion; it must not claim current authorization or remote verification.
- One checkpoint means a confirmed overwrite removes the previous recovery point.
- Pack-version normalization can discard incompatible progress; the learner must see the affected packs and categories before confirmation.
- Hidden Drive app data can be deleted outside Sisu Steps, and provider availability cannot be guaranteed.
- Cross-device manual overwrites can race; a confirmation must apply only to the checkpoint metadata that was inspected.

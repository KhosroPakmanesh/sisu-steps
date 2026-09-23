# G008 requirements

## Local-first boundary

- **REQ-G008-001:** IndexedDB shall remain the authoritative live learner-data store. Study, scoring, session recovery, notes, history, statistics, file backup, clearing, and every other core workflow shall operate without Google authorization or connectivity.
- **REQ-G008-002:** Google Drive operations shall occur only after an explicit learner action. The client shall make no Drive request during startup, ordinary study, route navigation, shutdown, tab hiding, or browser closure.

## Authorization and permissions

- **REQ-G008-003:** A Drive action shall request only the `drive.appdata` permission through Google's supported browser authorization flow.
- **REQ-G008-004:** Sisu Steps shall not request, read, store, or display the learner's Google email, name, profile image, or other profile information.
- **REQ-G008-005:** Google access tokens shall remain in memory and shall never be written to browser storage, URLs, logs, backups, diagnostics, or user-facing errors. The browser client shall contain no OAuth client secret or refresh token.
- **REQ-G008-006:** Cancelling, declining, blocking, expiring, or revoking Google authorization shall leave local learner data unchanged and shall not prevent local use.

## Checkpoint creation

- **REQ-G008-007:** **Back up to Google Drive** shall create a checkpoint with the same canonical versioned learner-backup representation used by downloadable JSON backup.
- **REQ-G008-008:** The checkpoint shall contain complete learner state, including attempts, answers, unfinished sessions, mistakes, correction and mastery records, lesson completions, content-pack versions, and private notes. It shall exclude executable content, OAuth credentials, and bundled exercises.
- **REQ-G008-009:** Each Google account shall contain at most one logical Sisu Steps checkpoint in hidden application-data storage.
- **REQ-G008-010:** Creating the first checkpoint shall proceed after successful authorization and validation without overwrite confirmation.
- **REQ-G008-011:** Replacing an existing checkpoint shall require confirmation showing its date and stating that it will be permanently replaced.
- **REQ-G008-012:** Checkpoint replacement shall preserve the previous valid checkpoint unless the new upload and replacement complete successfully.
- **REQ-G008-013:** If the checkpoint changes after its metadata was presented for confirmation, replacement shall stop and require the learner to review the current checkpoint.

## Restore and compatibility

- **REQ-G008-014:** **Restore from Google Drive** shall download and completely validate the checkpoint before presenting confirmation or changing IndexedDB.
- **REQ-G008-015:** Restore confirmation shall show the checkpoint date, a concise learner-data summary, the fact that current local data will be replaced, and every known compatibility-related loss.
- **REQ-G008-016:** Confirmed restore shall atomically replace local learner data. Cancellation or failure shall preserve the complete previous local state.
- **REQ-G008-017:** File restore and Drive restore shall use the same canonical parser, structural validator, content-reference validator, compatibility policy, and atomic replacement operation.
- **REQ-G008-018:** A backup using an unsupported envelope version or learner-state schema shall be rejected without a legacy alias, fallback reader, transitional format, or one-off migration.
- **REQ-G008-019:** A backup containing malformed values, duplicate note scopes, invalid dates, unknown modes, invalid counts, unknown references, or internally inconsistent records shall be rejected before replacement.
- **REQ-G008-020:** When the current catalog contains new packs absent from an otherwise compatible backup, restore shall restore the recorded packs and initialize the new packs with current versions and empty progress.
- **REQ-G008-021:** When the same installed pack ID has a different version, restore shall discard that pack's incompatible attempts, sessions, mistakes, correction and mastery records, and lesson completions while preserving compatible packs.
- **REQ-G008-022:** A topic note for a changed but still-installed pack shall remain restorable. A lesson note shall remain restorable only while its topic and lesson still exist.
- **REQ-G008-023:** Before restoring a backup with changed packs, the client shall name every affected pack and state which data categories will be discarded. Restoration shall require explicit confirmation.
- **REQ-G008-024:** A backup containing a pack ID that is no longer installed shall be rejected completely.
- **REQ-G008-025:** Stable exercise and lesson IDs from an incompatible pack shall not be reassigned to another pack in a way that could reinterpret old unscoped learner records.

`REQ-G008-020`–`024` supersede the exact installed pack/version-set clause of `REQ-G001-121`. Its current-format-only, removed-pack rejection, and no-legacy-reader rules remain in force.

## Deletion and disconnection

- **REQ-G008-026:** **Delete Drive backup** shall permanently delete only the Drive checkpoint after consequence-specific confirmation.
- **REQ-G008-027:** **Clear all history** shall affect only local learner data, and its confirmation shall state that an existing Drive checkpoint remains available.
- **REQ-G008-028:** **Disconnect Google Drive** shall end or revoke current Google authorization without deleting local data or the Drive checkpoint.
- **REQ-G008-029:** Drive deletion, local clearing, and disconnection shall remain separate operations with separate controls and consequence text.

## Stats archive UI

- **REQ-G008-030:** The existing **Backup & restore** bound archive shall remain one complete ruled, clipped, left-bound sheet containing only its original **Download backup**, **Restore backup**, and **Clear all history** rows in that order.
- **REQ-G008-031:** A separate **Google Drive checkpoint** section shall appear immediately after the existing archive. Its heading and optional-account explanation shall sit above and outside its own complete ruled, clipped, left-bound container, which shall expose **Back up to Google Drive**, **Restore from Google Drive**, and **Delete Drive backup** without an accordion, disclosure, hidden menu, or settings route.
- **REQ-G008-032:** **Disconnect Google Drive** shall be a lower-emphasis, non-destructive Drive-management action.
- **REQ-G008-033:** The Drive group shall disclose that the checkpoint includes private notes, uses hidden application storage, does not read the Google profile, and has no additional Sisu Steps password encryption.
- **REQ-G008-034:** Before authorization, the Drive group shall explain that Drive is optional and an account is selected only for a requested Drive action.
- **REQ-G008-035:** After Drive has been checked, the group shall distinguish no checkpoint, valid checkpoint, incompatible checkpoint, authorization required, progress, success, and failure with visible text rather than color alone.
- **REQ-G008-036:** A valid checkpoint status shall show its creation date and a concise data summary without exposing note contents or submitted answers.
- **REQ-G008-037:** Drive controls shall be disabled only while their owning operation runs, and repeated activation shall not duplicate an operation.

`REQ-G008-030`–`031` preserve the three-row ordering in `REQ-G007-005` and add Drive recovery as a separate following container; all existing local operation semantics remain in force.

## Header, feedback, and responsive behavior

- **REQ-G008-038:** The header shall place a compact **Drive backup** control beside, but outside, the Appearance radio group; it shall have no visible action label, panel background, border, or shadow and may show only a one- or two-word status or a short date.
- **REQ-G008-039:** The control shall align its compact status with the Day/Automatic/Night icon row, place its cloud form in the lower hardware row, and match the Appearance switch hardware's visible size, bottom alignment, boldness, silver-metal palette, highlights, dark edge, and cast shadow while retaining a background-free outer control; it shall use upload and check marks for its two saved states.
- **REQ-G008-040:** Before a successful backup observed by the current browser, the control shall use the neutral cloud-upload form with compact **Not set** text and without warning, failure, or disconnected styling; its accessible name shall include **Not set up**.
- **REQ-G008-041:** After success, the control shall use the cloud-check form and show only the locally observed short date; its accessible name shall include **Saved** and that date without claiming current authorization or remote verification.
- **REQ-G008-042:** Activating the header control shall navigate to the Drive checkpoint group under Stats and focus its heading. It shall not upload from the shell.
- **REQ-G008-043:** The brand, Drive control, and Appearance switch shall remain on one header row whenever their measured widths fit, including at 375 pixels, and shall wrap only when necessary without overlap, clipping, horizontal scrolling, reduced touch targets, or hidden labels from 320 pixels upward and under enlarged text.
- **REQ-G008-044:** Loading, success, compatibility, authorization, empty, and failure feedback shall use accessible live regions and shall not expose tokens, raw provider responses, backup contents, answers, or note text.
- **REQ-G008-045:** Overwrite, restore, Drive deletion, and local clearing confirmations shall use the shared loose-sheet dialog. Its close control, Escape, and backdrop shall cancel safely and restore focus.
- **REQ-G008-046:** Footer and backup descriptions shall truthfully distinguish automatic local saving from optional Drive recovery and shall not claim unconditionally that learner data remains only in the browser.

## Security and failure behavior

- **REQ-G008-047:** Production authorization shall use HTTPS, approved JavaScript origins, Google's supported browser authorization library, and the narrow application-data permission. The public OAuth client ID shall come from an ignored local environment file or a deployment variable through a generated same-origin runtime configuration; enabling Drive shall not require editing tracked application source, and no client secret shall enter browser configuration.
- **REQ-G008-048:** The client shall retain a strict Content Security Policy that permits only the required Google authorization and Drive connections without broadening unrelated script or network access.
- **REQ-G008-049:** The feature shall not claim end-to-end encryption, custom encryption, or a recovery password.
- **REQ-G008-050:** Drive files, metadata, responses, and authorization results shall remain untrusted until validated by their owning boundary.
- **REQ-G008-051:** Missing OAuth configuration, blocked popups, offline operation, expired or revoked authorization, an absent or externally deleted checkpoint, insufficient permission, quota failure, rate limiting, and temporary provider failure shall produce recoverable feedback without changing local data.

## Public publishing information

- **REQ-G008-052:** The public site shall offer directly loadable, same-origin Privacy Policy and Terms of Service routes within the regular application shell, linked from its footer and using the full routed workbook-page width without an empty reserved side column. GitHub Pages deployment shall return the application entry page with HTTP 200 for both routes. Both pages shall identify an email address for general enquiries and the official GitHub Issues page for bug reports.
- **REQ-G008-053:** The Privacy Policy shall accurately explain local learner storage, optional manual Google Drive checkpoint contents and permission, in-memory authorization tokens, the absence of Google profile access and custom encryption, and the separate controls for local clearing, Drive deletion, and disconnection.
- **REQ-G008-054:** The Terms of Service shall describe the official app's educational purpose, free use, local-data and optional-backup responsibilities, and service limitations without contradicting the repository's existing source-and-content license or promising uninterrupted access or infallible recovery.

## Acceptance criteria

- Given a learner who never uses Drive, every existing workflow behaves as before without a Google request.
- Given the first manual backup, successful authorization creates one hidden checkpoint and reports its date.
- Given an existing checkpoint, backup cannot replace it without explicit confirmation.
- Given a failed replacement, the previous checkpoint remains restorable.
- Given a valid checkpoint, restore previews its date, summary, and replacement consequences before changing IndexedDB.
- Given a backup missing only new packs, restore succeeds and initializes those packs empty.
- Given a changed pack, restore preserves compatible packs and valid notes while explicitly discarding incompatible progress from that pack.
- Given a removed pack, unsupported schema, malformed state, or invalid reference, restore is rejected without changing local data.
- Given an expired token, the next Drive action requests authorization again without affecting local workflows.
- Given local clearing, Drive deletion, or disconnection, only the consequence named by that action occurs.
- Given the header before and after backup, its neutral text truthfully reports local knowledge without claiming a persistent connection.
- Given keyboard, touch, reduced-motion, enlarged-text, Day, Night, 320px, 768px, and 1440px use, every Drive action, status, and confirmation remains operable and readable.

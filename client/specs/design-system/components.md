# Design components

Create or extract a reusable component only when real screens share the behavior or a page owns an independently testable interaction.

## Current vocabulary

- App shell, brand, unnumbered subject-divider primary navigation, a screen-reader-named compact side-view mechanical Appearance toggle with accessible Day/Automatic/Night icons separated from navigation within the shared header row, decorative desk stage, and footer.
- Page heading, eyebrow, card kicker, and readable page shell.
- One cut-paper action family with primary, secondary, compact, text, review, file, dialog, disabled, and destructive ink-and-edge variants.
- Pencil-sketch loading on a loose drafting sheet, plain empty sheet, torn correction error, attached success/failure notice, and operation states.
- Bound exercise-book topic cover, shared clipped continue-learning/topic-progress assignment sheet, printed catalog record strip, inside-cover topic pocket, taped objective sheet, binder group divider, connected punched test card, stage/score stamp, and ledger summary.
- Labelled answer-line text input, correction/eraser draft controls, perforated answer slip with animated pencil-circle radio, cut-paper archive file input, tab-stack select, and lift-and-settle vocabulary-card word-order builder with ruled sentence strip and vocabulary pocket.
- Teacher correction-slip answer feedback, answer reveal, returned-paper session result, and fold-out sentence-construction diagram.
- Binder-index lesson navigation, clipped focus contract, margin key-point labels, example flashcards, vocabulary index cards, detachable optional-practice sheet, and completion stamp.
- Consequence-specific modal confirmation sheet for clear-test, clear-topic, and clear-all actions.
- Attached topic/lesson sticky note with a native textarea, explicit save/removal status, and paper-lift hover/focus response; the topic note follows the complete learning map. Also included are a paper-clipped native report filter checkbox, ruler-only progress, and readable teacher-stamp feedback.
- Catalog exercise-book covers, connected fold-out topic map, two-page lesson spread, loose study and returned-result sheets, Finnish school ledger, and archive-drawer data scene.

## Rules

- Use semantic HTML and native controls first.
- Keep component inputs and outputs small, explicit, and behavior-focused.
- Support loading, empty, validation, error, success, disabled, skipped, and confirmation states when applicable.
- Make destructive actions visually distinct and consequence-specific.
- Give icon-only controls an accessible name and mark decorative symbols `aria-hidden`.
- Preserve entered values when validation or persistence fails.
- Put guidance beside the control it describes and operation-level failures in an alert or live region.
- Put the primary action last in visual and keyboard order when the layout permits.
- Keep notebook ornament in CSS or `aria-hidden` elements so it cannot add noise to the accessibility tree.
- Controls may look wholly custom and object-like, but their DOM semantics remain familiar: visual tabs stay links, desk lights and answer circles stay radios, answer lines stay inputs, selectors stay selects, and vocabulary cutouts stay buttons.
- Every action button and action-link uses the same torn silhouette, inset cut line, folded corner, paper depth, and lift/press behavior. Use paper tint, ink, edge accent, and explicit wording—not a different construction—to communicate hierarchy and state.
- A correction, filter, or note control remains visible and directly operable; do not hide it in a disclosure or replace its native semantics with a stationery object.
- Repeated information surfaces use a small material vocabulary: bound covers for topics, punched index cards for mapped tests, flashcards and margin labels inside lessons, perforated slips for answer choices, ledger rows and stamps for reports, and file dividers for data. Do not use a generic rounded-card fallback.
- Prefer a native `<dialog>` for the confirmation sheet; focus Cancel on open, cancel on Escape, return focus on close, and emit the destructive decision only from the labelled confirm action.

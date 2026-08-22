# Design components

Create or extract a reusable component only when real screens share the behavior or a page owns an independently testable interaction.

## Current vocabulary

- App shell, brand, primary navigation, labelled Appearance selector, and footer.
- Page heading, eyebrow, card kicker, and readable page shell.
- Primary, secondary, compact, text, review, and destructive buttons.
- Loading, empty, error, success, and operation notice states.
- Topic-catalog card, continue-learning summary, topic overview, test card, stage/set/score badges, and report summaries.
- Labelled text input, radio choice list, file input, and word-order builder.
- Answer feedback, answer reveal, session result, and sentence-construction explanation.
- Lesson navigation, focus contract, vocabulary, worked examples, optional practice, and completion states.
- Consequence-specific confirmation for clear-test, clear-topic, and clear-all actions.

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

# Accessibility

Accessibility is part of implementation and validation, not a cleanup phase.

## Requirements

- Use semantic landmarks and native elements before ARIA.
- Use buttons for actions and links for navigation.
- Give every form control a visible label or accessible name.
- Preserve keyboard operation, logical focus order, and visible focus indicators.
- Deliberately place focus after routed context changes, operation errors, and any custom confirmation close when practical.
- Keep text and controls readable from 320 pixels through desktop widths.
- Provide practical pointer and touch target sizes.
- Respect `prefers-reduced-motion`.
- Do not rely on color alone for correctness, risk, validation, test set, learning stage, skipped state, or mastery.
- Associate helper and validation text programmatically where applicable.
- Use live regions for loading and operation feedback without announcing decorative changes.
- Ensure disabled states remain understandable and do not remove the explanation for why an action is unavailable.
- Keep required text in readable print typography; decorative handwriting must be brief, optional, and hidden from assistive technology.
- Preserve text contrast, visible focus, state meaning, and control boundaries in warm Light, low-glare Dark, and Automatic appearances.
- Ensure every stationery-inspired control remains understandable from its visible label, native role, and state without requiring recognition of the represented object.
- Permit fully custom control appearance only while the underlying link, button, input, textarea, radio, checkbox, select, file input, progress, or dialog semantics and keyboard behavior remain native.
- Keep correction/eraser actions, sticky-note fields, and the report filter visible, labelled, focusable, and understandable without recognizing their stationery metaphors; do not put them behind collapse/expand controls.
- For destructive confirmation, focus the safe Cancel action when the modal sheet opens, cancel on Escape, return focus to the initiating control, and execute only through explicit confirmation.
- Keep route content available immediately during page-turn effects, and reduce all desk, page, tab, paper, stamp, pencil, light, and token movement to a static state under `prefers-reduced-motion`.

## Validation

- Run TypeScript and Angular template lint, Stylelint, type, unit, build, and browser checks after UI changes.
- Manually verify keyboard navigation, focus visibility, `Alt+A`, file restore, and destructive confirmation for affected workflows.
- Check 320, 768, and 1440 pixel widths for overlap, clipping, hidden actions, and horizontal scrolling.
- Verify status meaning remains understandable without color and with reduced motion enabled.
- Verify the labelled Automatic/Day/Night Appearance control by keyboard and confirm Automatic responds to device color-scheme changes while explicit Day and Night choices remain stable.

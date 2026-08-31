# Accessibility

Accessibility is part of implementation and validation, not a cleanup phase.

## Requirements

- Use semantic landmarks and native elements before ARIA.
- Use buttons for actions and links for navigation.
- Give every form control a visible label or accessible name.
- Preserve keyboard operation, logical focus order, and visible focus indicators.
- Deliberately place focus after routed context changes, operation errors, and any custom confirmation close when practical.
- After in-app route navigation, focus the newly activated main landmark without stealing focus on the initial page load.
- Open each destination at the top of the document, including browser Back and Forward navigation. Focus the routed main landmark without scrolling so focus cannot override the router's scroll reset.
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
- Render focus indicators inside clipped stationery controls so their silhouettes cannot hide the indicator.
- Keep **Show answer** as a native keyboard-operable button without an `Alt+A` binding, shortcut metadata, or a visible shortcut annotation.
- Permit fully custom control appearance only while the underlying link, button, input, textarea, radio, checkbox, select, file input, progress, or dialog semantics and keyboard behavior remain native.
- Keep correction/eraser actions and sticky-note fields visible, labelled, focusable, and understandable without recognizing their stationery metaphors; do not put them behind collapse/expand controls. The report filter is withdrawn.
- For destructive confirmation, focus the safe Cancel action when the modal sheet opens, cancel on Escape, return focus to the initiating control, and execute only through explicit confirmation.
- Keep route content available immediately during page-turn effects, and reduce all desk, page, tab, paper, stamp, pencil, light, and token movement to a static state under `prefers-reduced-motion`.

## Validation

- Run TypeScript and Angular template lint, Stylelint, type, unit, build, and browser checks after UI changes.
- Manually verify keyboard navigation, focus visibility, button-operated answer reveal, file restore, and destructive confirmation for affected workflows.
- Check 320, 768, and 1440 pixel widths for overlap, clipping, hidden actions, and horizontal scrolling.
- Check the scroll width and required-child bounds of clipped paper surfaces; document-level overflow alone cannot reveal content hidden by `overflow: clip`.
- Inspect visible focus pixels on back links, lesson tabs/selects, file labels and correction actions; a focused DOM element or computed outward outline does not prove the indicator survives clipping.
- Check native 200%/400% browser zoom, text enlargement, text-spacing overrides, forced colors and screen-reader behavior. Record unavailable checks explicitly; root-font or viewport simulations are not native browser zoom.
- Exercise 150%/200% root text from 320px upward. Header controls may wrap as one group; content breakpoints follow the root text size. Very narrow enlarged-text layouts reduce decorative padding and hardware instead of reducing required text. Validate both internal content bounds and visible text within clipped paper, including empty/feedback/result states; restoring default text must restore the existing layout.
- Verify status meaning remains understandable without color and with reduced motion enabled.
- Verify the icon-led Day/Automatic/Night Appearance toggle exposes all three text names to assistive technology, works by keyboard, keeps focus visible despite its unframed presentation, and confirms its decorative lever follows the native radio state while Automatic responds to device color-scheme changes and explicit Day and Night choices remain stable.

# Design tokens

The canonical implementation is `client/src/design-system/tokens.css`.

## Token groups

- Ink and surfaces: primary, secondary, muted, desk, canvas, paper, raised, ink-dark, and header surfaces and borders.
- Brand and state: focus, success, warning, danger, skipped/review, disabled, and selected treatments.
- Notebook atmosphere: ruling, margin, grid, overlay, paper shadow, and sheet-gutter values.
- Typography: readable body/display stacks plus a decorative note stack, reusable sizes, line heights, and weights.
- Spacing: a consistent step scale for gaps and padding.
- Radius and shadow: restrained control, card, panel, and pill geometry.
- Layout: readable page widths, runner width, control heights, touch target, and breakpoints.
- Motion: short interaction timings with reduced-motion overrides.

## Rules

- Use a token before repeating a raw color, spacing, radius, shadow, text size, control height, or component geometry.
- Add a token only when at least two current or near-term uses share the same semantic value.
- Raw values are acceptable for one-off local geometry or calculated positions.
- Do not use viewport-scaled body text; display headings may use bounded `clamp()` values.
- Keep media-query literals aligned with the documented 560, 620, 650, 700, 800, and 900 pixel breakpoint tokens until custom media queries are supported by the build.
- Preserve practical WCAG 2.2 AA contrast and visible focus.
- Load tokens before foundations, reusable primitives, app shell, or feature styles.
- Define the warm light palette on `:root`, the explicit dark override on `data-appearance="dark"`, and Automatic dark values under `prefers-color-scheme`; explicit Light must retain the root palette.
- Use `--font-note` only for short `aria-hidden` annotations. Never apply it to required content or controls.

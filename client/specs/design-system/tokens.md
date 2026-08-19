# Design tokens

The canonical implementation is `client/src/design-system/tokens.css`.

## Token groups

- Ink and surfaces: primary, secondary, muted, canvas, raised surfaces, and borders.
- Brand and state: focus, success, warning, danger, skipped/review, disabled, and selected treatments.
- Typography: body/display stacks, reusable sizes, line heights, and weights.
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

# Design tokens

The canonical implementation is `client/src/design-system/tokens.css`.

## Token groups

- Ink and surfaces: primary, secondary, muted, desk, canvas, paper, raised, ink-dark, and header surfaces and borders.
- Brand and state: focus, success, warning, danger, skipped/review, disabled, and selected treatments.
- Notebook atmosphere: ruling, margin, grid, overlay, paper shadow, sheet gutter, paper edge, desk wood, groove, glow, metal, graphite, compact folder-cover, translucent page-clip, and divider-tab values.
- Typography: readable body/display stacks plus a decorative note stack, reusable sizes, line heights, and weights.
- Instructional prose and worked-example explanations share `--text-body` (1rem) and `--line-body` (1.65). Essential captions, metadata and folder labels use at least `--text-caption` (0.75rem); decorative hidden stamps are exempt.
- Shared detail text, compact titles, summary values and actions use named size/line-height roles rather than repeated literals. These roles preserve the existing hierarchy and font families.
- Spacing: a consistent step scale for gaps and padding.
- Radius and shadow: restrained control, pressed-label, card, panel, and pill geometry.
- Layout: readable page widths, runner width, control heights, touch target, and breakpoints.
- Motion: short interaction, standard object, and page-scene timings with reduced-motion overrides.

## Rules

- Use a token before repeating a raw color, spacing, radius, shadow, text size, control height, or component geometry.
- Add a token only when at least two current or near-term uses share the same semantic value.
- Raw values are acceptable for one-off local geometry or calculated positions.
- Do not use viewport-scaled body text; display headings may use bounded `clamp()` values.
- Reuse the existing media-query boundaries: 420px for dense ledgers and summaries, 480px for confirmation sheets, 560px for pocket-notebook controls and content, 620px for the compact header/folder, 650px for catalog and ledger layouts, 800px for lesson navigation and page layouts, and 900px for wider grids/header arrangements. Decorative desk props additionally adapt at 1100px and 1600px. These are CSS media-query literals, not custom-property tokens.
- Preserve practical WCAG 2.2 AA contrast and visible focus.
- Muted text must remain readable on tinted answer paper as well as plain paper. Its semantic mix strengthens contrast without changing the underlying stone palette; validate explicit and Automatic appearances together.
- Folder labels and inset focus share `--folder-tab-ink`, a strengthened mix of the existing folder ink. Check label contrast against the painted active shade, not only the tab's unshaded background color.
- Keep action geometry independent of semantic ink, paper and edge tokens. Compact danger actions remain destructive in Day and Night, including hover and disabled states.
- Preserve available-width lesson reading; do not introduce a maximum prose-width cap. Repair inner shrinking and wrapping without changing the approved outer folder geometry.
- Load tokens before foundations, reusable primitives, app shell, or feature styles.
- Define the warm light palette on `:root`, the explicit dark override on `data-appearance="dark"`, and Automatic dark values under `prefers-color-scheme`; explicit Light must retain the root palette.
- Use `--font-note` only for short `aria-hidden` annotations. Never apply it to required content or controls.

# Design tokens

The canonical implementation is `client/src/design-system/tokens.css`.

## Token groups

- Ink and surfaces: primary, secondary, muted, desk, paper, raised, and header surfaces and borders.
- Brand and state: focus, success, warning, danger, skipped/review, disabled, and selected treatments.
- Notebook atmosphere: ruling, margin, grid, overlay, paper shadow, sheet gutter, paper edge, desk wood, groove, glow, metal, graphite, compact folder-cover, translucent page-clip, and divider-tab values.
- Material roles: red-pencil decoration, amber stationery, shared paper tape, mechanical-switch metal, and page-clip highlights remain separate from danger, warning, and interaction roles even when they resolve to the same primitive hue.
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
- Keep primitive hue tokens separate from semantic roles. Components consume text, surface, border, progress, state, or material aliases when a future contrast or material adjustment must not affect an unrelated role.
- Use `--surface-stationery` for neutral warm-paper objects such as assignments, topic covers, lesson/reference sheets, common-mistake advisories, and ledgers. Common-mistake reference sheets retain an amber edge and explicit caution wording without becoming active warning surfaces. Reserve `--surface-warning` for active warning, incorrect-answer, and review meaning; visual paper texture does not make a neutral object a warning.
- Keep shared component colour recipes in their design-system owner. Feature styles may place or size those components, but they must not restyle the same progress, action, navigation, loading, or state role through a more specific page selector.
- Derive translucent notebook rule, grid, red margin, overlay, and shared tape values from their solid ink, surface, or material source instead of repeating RGB channels. Preserve separate opacity roles when they communicate a real difference in page depth.
- Let fixed warm-white tab and on-ink text roles share one primitive without coupling paper, raised-paper, or warning surfaces to foreground text.
- Keep informational blue, success green, warning amber, and danger red surfaces visibly distinct in both appearances. Similar low-chroma status surfaces are a reason to strengthen hue separation, not to collapse state roles.
- Limit detailed CSS-only hardware to a small owner-local material scale. The Appearance switch uses edge, shadow, middle, light, and highlight metal roles; the page clip may share highlights and depth shadows while retaining visibly different outer and inner edges.
- Raw values are acceptable for one-off local geometry or calculated positions.
- Do not use viewport-scaled body text; display headings may use bounded `clamp()` values.
- Use the named `workbook` inline-size container for content reflow. Its root-relative boundaries preserve the default 16px-scale layouts: 26.25rem/420px for dense ledgers and summaries, 30rem/480px for confirmation sheets, 35rem/560px for pocket-notebook controls and content, 38.75rem/620px for the compact header/folder, 40.625rem/650px for catalog and ledger layouts, 50rem/800px for lesson navigation and page layouts, and 56.25rem/900px for wider grids/header arrangements. Unlike fixed-pixel viewport queries, these boundaries also respond to enlarged root text. Decorative outer desk props retain 1100px/1600px viewport queries.
- Preserve practical WCAG 2.2 AA contrast and visible focus.
- Muted text must remain readable on tinted answer paper as well as plain paper. Its semantic mix strengthens contrast without changing the underlying stone palette; validate explicit and Automatic appearances together.
- Folder labels and inset focus share `--folder-tab-ink`, a strengthened mix of the existing folder ink. Check label contrast against the painted active shade, not only the tab's unshaded background color.
- Keep action geometry independent of semantic ink, paper and edge tokens. Compact danger actions remain destructive in Day and Night, including hover and disabled states.
- Preserve available-width lesson reading; do not introduce a maximum prose-width cap. Preserve the approved outer folder geometry at default text size. Below 20rem of available shell width, enlarged text may use narrower decorative cover/binding/clip spacing, the physical `--space-reflow-inline` padding, and stacked answer controls. Required typography and practical control heights remain relative to the requested text size.
- Load tokens before foundations, reusable primitives, app shell, or feature styles.
- Define the warm light palette on `:root`, the explicit dark override on `data-appearance="dark"`, and Automatic dark values under `prefers-color-scheme`; explicit Light must retain the root palette.
- Use `--font-note` only for short `aria-hidden` annotations. Never apply it to required content or controls.

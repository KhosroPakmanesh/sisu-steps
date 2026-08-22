# G004 implementation plan

## Goal

Give the complete Sisu Steps client an immersive Nordic school-notebook atmosphere that remains professional, calm, accessible, and exceptionally easy to understand during long study sessions.

## Requirement slice

- `REQ-G004-001`–`REQ-G004-019`
- Refines the presentation and interaction clarity required by `REQ-G001-028`–`REQ-G001-030` and `REQ-G003-009` without changing learning, content, routing, or persistence semantics.

## Included

- A coherent notebook-inspired visual language across the application shell and every learner-facing route.
- Eye-comfortable warm light and low-glare dark palettes using semantic design tokens.
- An accessible Appearance control with remembered Automatic, Light, and Dark choices.
- Automatic theme selection that follows the learner's device preference.
- Immersive but non-interactive paper, ruling, margin, label, tab, stamp, and annotation details.
- Plain-language labels and simplified visual hierarchy for learners with little computer experience.
- Native navigation, appearance, action, answer, progress, status, report, and data controls presented through restrained real-stationery cues.
- Design-system guidance, targeted automated coverage, responsive visual checks, and changelog evidence.

## Non-goals

- Changes to Finnish content, grading, attempts, mistakes, reviews, reports, backups, IndexedDB, or content-version alignment.
- Changes to routes or the availability and order of learning actions.
- Accounts, cloud synchronization, analytics, external fonts, images, or other runtime network dependencies.
- Handwritten typography for instructions, lesson content, navigation, controls, or learner input.
- Decorative controls or notebook objects that introduce new interaction behavior.

## Implementation steps

1. Extend the client design tokens and foundations with warm paper, ink, rule, margin, and dark-theme semantic values.
2. Add a browser-local appearance preference boundary and expose a labelled Appearance control in the shell.
3. Restyle shared primitives, feedback, and sentence explanations as legible notebook elements.
4. Apply the shared notebook hierarchy across catalog, topic, lesson, study, reports, and data-management routes.
5. Simplify unclear presentation labels where this does not alter product behavior.
6. Add automated appearance-preference coverage and run the repository client quality gate.
7. Inspect representative routes at 320, 768, and 1440 pixels in light and dark appearances.
8. Map existing controls to subject tabs, paper swatches, notebook labels, pencil marks, ruled fields, word cards, rulers, teacher stamps, ledgers, and archive labels without adding interaction behavior.

## Risks

- Immersive decoration can compete with teaching content; ornament must remain low-contrast, non-interactive, and outside the reading hierarchy.
- Warm low-chroma palettes can lose contrast; text, state, border, and focus combinations require explicit contrast and non-color checks.
- The header can become crowded at narrow widths; navigation and Appearance controls must remain fully labelled and easy to reach.
- Remembered overrides must not prevent Automatic mode from responding to device-theme changes.

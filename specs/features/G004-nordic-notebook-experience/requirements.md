# G004 requirements

## Visual and interaction requirements

- **REQ-G004-001:** Every learner-facing route shall use a coherent immersive Nordic school-notebook visual language while preserving the existing information and action hierarchy.
- **REQ-G004-002:** The light appearance shall use warm, low-glare paper surfaces, softened dark ink, muted ink-blue and pine accents, and restrained red-pencil accents suitable for extended reading.
- **REQ-G004-003:** The dark appearance shall use low-glare charcoal and deep blue-green paper surfaces with softened light ink and muted state accents suitable for extended reading.
- **REQ-G004-004:** Notebook decoration may include paper ruling, page margins, layered sheets, labels, tabs, stamps, and short handwritten annotations, but it shall remain non-interactive and subordinate to learner content.
- **REQ-G004-005:** Handwritten typography shall be limited to brief decorative annotations and shall not be used for navigation, instructions, lessons, controls, learner input, status, or required information.
- **REQ-G004-006:** Labels, instructions, and action hierarchy shall use plain language and make the next useful action evident to learners with little computer experience.

## Appearance requirements

- **REQ-G004-007:** The application shall provide a visible, explicitly labelled Appearance control with Automatic, Light, and Dark choices.
- **REQ-G004-008:** Automatic appearance shall follow the device's preferred color scheme and respond when that preference changes.
- **REQ-G004-009:** An explicit Light or Dark choice shall override the device preference, and the selected choice shall be remembered locally in the same browser.
- **REQ-G004-010:** Missing, unavailable, or invalid saved appearance data shall safely fall back to Automatic without blocking the application.

## Quality requirements

- **REQ-G004-011:** All appearances shall preserve semantic landmarks, native controls, visible focus, practical touch targets, reduced-motion behavior, non-color status meaning, and WCAG 2.2 AA text contrast.
- **REQ-G004-012:** Every primary workflow shall remain usable without overlap, clipped controls, hidden labels, or horizontal page scrolling from 320 pixels upward.

## Acceptance criteria

- Given any learner-facing route, when it opens in either appearance, then it is visibly part of the same Nordic notebook system and teaching content remains more prominent than decoration.
- Given a learner who has not chosen an appearance, when the device switches between light and dark preferences, then the application follows that preference without a reload.
- Given a learner who chooses Light or Dark, when the app is reopened in the same browser, then that explicit choice remains active regardless of the device preference.
- Given missing storage access or an invalid saved preference, when the app opens, then Automatic appearance is used and all learning workflows remain available.
- Given a keyboard-only learner, when they move through the shell and a primary workflow, then every interactive element has a visible focus state and the Appearance control is operable and labelled.
- Given a learner unfamiliar with computers, when a page presents several actions, then the primary next step is visually prominent and each action label describes its outcome in plain language.
- Given a 320-pixel viewport, when the learner opens the catalog, a topic, a lesson, a test, reports, or data settings, then navigation, Appearance, content, and actions remain readable without horizontal page scrolling.
- Given reduced motion or an inability to perceive color differences, when the learner uses the app, then meaning remains available through text, symbols, borders, or structure and decorative motion is absent or suppressed.

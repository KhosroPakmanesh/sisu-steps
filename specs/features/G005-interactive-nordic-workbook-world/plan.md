# G005 implementation plan

## Goal

Transform the complete Sisu Steps client into an interactive Nordic school-workbook world whose controls and pages feel like physical notebook objects while remaining calm, readable, friendly, and fully accessible to learners with little computer experience.

## Requirement slice

- `REQ-G005-001`–`REQ-G005-020`, `REQ-G005-022`, `REQ-G005-023`, and `REQ-G005-025`–`REQ-G005-034`; `REQ-G005-021` and `REQ-G005-024` are withdrawn.
- Extends the stable G004 notebook baseline and explicitly permits custom-looking controls while preserving G001 learning, content, routing, grading, and persistence behavior.

## Included

- A softly lit desk environment with notebook depth, binding, paper stacks, restrained parallax, and appearance-aware lighting.
- Binder-divider navigation, folded-corner back links, consistently cut-paper action controls, answer controls, ruler-only progress, teacher feedback stamps, sticky notes, and paper-based system states.
- An Appearance control presented as one compact, unframed side-view mechanical toggle with Day, Automatic, and Night icons, a metal mounting base, and three lever positions while retaining the existing `automatic`, `light`, and `dark` preference values.
- Route-specific physical scenes for the topic catalog, topic learning map, lessons, study, results, reports, and data management.
- Immediate page-turn, tab-slide, paper-lift, stamp, pencil-circle, token-snap, answer-line, and light-change motion with a static reduced-motion mode.
- Clearly labelled correction or eraser actions that affect only the current unsubmitted response.
- Stronger selected-tab, selected-card, ruled-input, and stamped-completion feedback.
- A custom confirmation sheet for destructive data actions with complete dialog semantics and deliberate confirmation.
- Pocket-notebook layouts for narrow viewports, shared design-system guidance, automated coverage, responsive visual checks, and changelog evidence.

## Non-goals

- Points, currency, lives, achievements, streak rewards, locked content, leaderboards, or other gameplay systems.
- Changes to Finnish content, grading, attempts, mistakes, reviews, report values, content versions, routes, or learning-action order. The only persistence extension is the private learner-note contract in `REQ-G001-102`–`106`.
- Sound, audio feedback, remote fonts, remote images, analytics, accounts, cloud synchronization, or other runtime network dependencies.
- Drag-only interactions or visual metaphors that replace visible labels, keyboard operation, or assistive-technology meaning.
- Animation delays before content or navigation becomes available.
- Binder-clip accordions, collapsible stationery tools, hidden tool drawers, or any new collapse/expand interaction.
- A Finnish-character quick-insert or pencil-case answer toolbar.

## Implementation steps

1. Add the G005 world, motion, object-control, scene, and system-state vocabulary to the client design system.
2. Turn the application shell into an appearance-aware desk and workbook frame with physical subject dividers and desk-light choices.
3. Restyle shared actions as one coherent cut-paper family and present fields, choices, word tokens, ruler-only progress, feedback, focus, notices, loading, errors, and file controls as understandable physical objects.
4. Give catalog, topic, lesson, study, results, reports, and data routes distinct but coherent notebook scenes.
5. Replace destructive browser confirmations with an accessible clipped confirmation sheet without changing consequences or service calls.
6. Add focused unit and browser coverage for labels, keyboard use, dialog cancellation and confirmation, overflow, and reduced motion.
7. Run the complete client quality gate and inspect representative routes at 320, 768, and 1440 pixels in Day and Night appearances.
8. Update design guidance, validation evidence, and the changelog.
9. Add stamped answer/completion feedback, safe response-edit actions, local topic/lesson sticky notes, and stronger existing tab/card/input reactions without adding collapse behavior.
10. Differentiate hover and focus movement by physical object: slide tabs and informational strips, pivot attached paper, preserve bound-cover offsets, keep nested reading surfaces calm, and suppress travel for disabled and reduced-motion states.
11. Derive local browser and saved-site icons from the visible paper **S** brand mark with scalable and compatibility formats.

## Risks

- Physical detail can create cognitive noise; required text and the next useful action must remain visually dominant.
- Custom-looking native controls can obscure state or expected operation; every object requires a visible label, strong focus, familiar keyboard behavior, and semantic HTML.
- Page depth and motion can cause discomfort or slow rendering; effects must use inexpensive CSS, avoid blocking navigation, and disappear under reduced motion.
- A custom confirmation flow can weaken safety or focus handling; the default focus must be safe, Escape must cancel, and only explicit confirmation may perform the action.
- Wide lesson and connected-map compositions can overflow narrow screens; they must become a simple single-column pocket notebook from 320 pixels upward.

## 2026-08-31 consistency remediation

- Repair internal mobile clipping and clipped focus indicators while preserving the fixed folder margins, binding inset, clip clearance, intrinsic action sizing and required Topic summary layout.
- Keep action size independent of semantic color; apply the shared cut-paper action family to draft-correction tools and retain native control semantics.
- Apply `REQ-G005-028`–`031`: shared instructional typography, a 0.75rem essential-label minimum, matching responsive answer slips, and no new reading-width cap.
- Consolidate equivalent text, spacing and state roles through shared tokens. Preserve intentional material differences and existing font families.
- Make reduced-motion interactions static and distinguish empty mistake/review sessions from real errors. Do not change routes, content, scoring, storage, or clearing behavior.
- Add targeted regression coverage, repeat Day/Night route and state checks, run the full client gates, and record native zoom, text spacing, forced-colors, assistive-technology and browser coverage accurately.

## Approved enlarged-text follow-up

- The learner approved adapting the previously preserved shell after the consistency fixes were committed in `b7bd9cc`. Implement `REQ-G005-032` and the corresponding exceptions in `REQ-G005-002`–`003`.
- Permit header wrapping and reduce decorative spacing only when available room relative to the requested text size is insufficient. Preserve the ordinary 320/768/1440-pixel layouts, reading width policy, color palette, content, routes and learner state.
- Cover 150%/200% root text enlargement, default geometry restoration, keyboard operation and internal content bounds. Keep native browser zoom and manual screen-reader/touch verification separate.

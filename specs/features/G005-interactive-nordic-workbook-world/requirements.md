# G005 requirements

## World and shell requirements

- **REQ-G005-001:** Every learner-facing route shall appear within one coherent interactive Nordic workbook world while keeping teaching content and the next useful action more prominent than decoration.
- **REQ-G005-002:** The shell shall suggest a softly lit school desk, bound workbook, layered page stack, and restrained depth without introducing interactive-looking decoration or runtime asset downloads.
- **REQ-G005-003:** The Appearance control shall present only Automatic, Day, and Night as visible desk-light scene labels, retain an accessible group name, and preserve the existing automatic-device, explicit-light, explicit-dark, and local-memory behavior.
- **REQ-G005-004:** Primary navigation shall resemble protruding subject dividers without numeric prefixes, share one continuous control row with the Appearance choices, and may use immediate page-turn or tab-slide motion that never delays route availability.
- **REQ-G005-005:** Every back-navigation link, including Reports and Data & backup, shall resemble the same folded page corner or attached bookmark while retaining an explicit visible destination label and native link behavior.

## Object-control requirements

- **REQ-G005-006:** Primary, secondary, review, compact, text, file, dialog, and destructive actions shall share one recognisable cut-paper construction. Hierarchy and state shall vary through readable ink, edge accents, internal marks, and explicit labels rather than a mixture of conventional buttons, stamps, cards, bookmarks, or slips, while native button/link semantics remain unchanged.
- **REQ-G005-007:** Radio choices shall place pencil-drawn circles on perforated answer slips, checkboxes shall resemble marked notebook boxes, text fields shall resemble true answer lines, and selects shall resemble tabbed card selectors rather than browser-form fields while retaining visible state, labels, keyboard use, touch targets, and assistive-technology semantics.
- **REQ-G005-008:** Word-order controls shall resemble physical vocabulary cutouts that lift and settle when activated; clicking and keyboard operation shall remain complete, and dragging shall never be required.
- **REQ-G005-009:** Backup and restore controls shall use the shared cut-paper action construction with archive-appropriate labels and accents while preserving accepted file types, action labels, status text, and deliberate restore behavior.
- **REQ-G005-010:** Test, lesson, and topic progress shall resemble printed rulers without a pencil marker, and completion, score, correct, incorrect, skipped, warning, and danger states shall retain explicit text or symbols in addition to physical styling and color.
- **REQ-G005-011:** Focus shall be strongly visible as a pencil or ink outline on every surface, and tooltips or margin notes shall contain only supplemental information that is also available through accessible text when needed.

## Page-scene requirements

- **REQ-G005-012:** The catalog shall present topics as distinct bound exercise-book covers with printed cover fields rather than dashboard cards; the topic route shall present an open fold-out study map whose group dividers and connected, punched index cards share one construction and whose completion marks never imply unavailable or locked content.
- **REQ-G005-013:** Lessons shall resemble a two-page teaching spread whose lesson navigation, focus contract, key points, worked examples, vocabulary, optional practice, annotations, tabs, and foldouts use recognisable school-paper objects and become a readable single-page sequence on narrow screens.
- **REQ-G005-014:** Study shall resemble an isolated exercise sheet whose pinned target note, perforated answer slips, ruled answer line, vocabulary cutouts, sentence-building strip and pocket, progress ruler, teacher feedback slip, and fold-out sentence explanation remain easy to operate; results shall resemble a returned paper with a score mark and plainly labelled next-action slips.
- **REQ-G005-015:** Reports shall resemble a Finnish school ledger whose totals, topic dividers, charts, mastery marks, and correction prompt belong to the ledger rather than generic dashboard cards, and data management shall resemble an archive drawer whose backup, restore, reset, history materials, and individual clearing rows read as labelled file materials.

## System-state and quality requirements

- **REQ-G005-016:** Loading shall resemble a pencil sketch in progress on a loose drafting sheet, notices shall resemble attached notes, errors shall resemble correction slips, and empty states shall remain plain-language sheets with an obvious next action; none shall fall back to a generic rounded web card.
- **REQ-G005-017:** Destructive confirmation shall use a modal loose-sheet dialog that repeats the specific consequence, defaults focus to a safe cancellation action, cancels on Escape, returns focus to the initiating control, and performs work only after explicit confirmation.
- **REQ-G005-018:** At reduced motion, route, paper, stamp, pencil, token, light, and parallax motion shall become immediate static states; at all preferences, navigation and content shall not wait for animation.
- **REQ-G005-019:** From 320 pixels upward, the world shall become a readable pocket-notebook composition without horizontal page scrolling, clipped labels, inaccessible controls, or loss of WCAG 2.2 AA contrast; it shall preserve semantic landmarks, local-only operation, practical touch targets, and existing learning and data behavior.

## Stationery-refinement requirements

- **REQ-G005-020:** Correct, incorrect, skipped, lesson-complete, and session-complete state changes shall receive a brief readable teacher-stamp response that never delays feedback and becomes static under reduced motion.
- **REQ-G005-022:** Before submission, each applicable answer type shall provide clearly labelled correction or eraser actions for clearing the current choice or typed draft and for undoing or clearing the current word-order draft. These actions shall not alter stored attempts, mistakes, scores, or history.
- **REQ-G005-023:** The private topic and lesson notes required by `REQ-G001-102`–`106` shall resemble attached sticky notes while retaining a visible label, native textarea, character count, save/removal wording, keyboard access, and status text.
- **REQ-G005-024:** Reports shall provide a native **Show studied tests only** checkbox presented as a paper-clipped filter label; checking it shall filter only the visible test ledger rows and shall not alter learner data or report calculations.
- **REQ-G005-025:** Active subject tabs, selected lesson tabs, and interactive topic or test cards shall move forward or lift briefly on active, selected, hover, or focus-within states without changing navigation order or requiring pointer hover.
- **REQ-G005-026:** Typed learner input shall remain visibly aligned to a ruled answer line and may receive restrained graphite feedback while non-empty without using handwriting for the learner's text.
- **REQ-G005-027:** The stationery refinement shall introduce no accordion, disclosure, collapsible panel, expandable tool tray, or other collapse/expand behavior.

## Withdrawn refinement requirements

- **REQ-G005-021 (withdrawn 2026-08-23):** The proposed Finnish-character pencil-case toolbar was removed from scope at the learner's request. Typed answers continue to use the native text field and keyboard.

## Acceptance criteria

- Given any learner-facing route, when it opens in Day or Night appearance, then it clearly belongs to the same physical workbook world and its required content remains easier to find than its decoration.
- Given the Appearance control, when a learner chooses Automatic, Day, or Night by pointer or keyboard, then the existing automatic, light, or dark preference behavior is applied and remembered with a visible selected label.
- Given the application header, when it appears at any supported width, then Topics, Reports, Data & backup, Automatic, Day, and Night remain in one continuous control row without visible numeric prefixes or redundant Appearance and Desk light headings.
- Given keyboard or assistive-technology use, when a learner operates navigation, actions, fields, choices, tokens, file restore, or a select, then native semantics, visible focus, labels, and state remain complete despite the custom appearance.
- Given any action button or action-link, when it appears in the shell content, a learning route, data management, results, or a confirmation sheet, then it uses the same cut-paper construction and remains distinguishable by its visible label, ink, edge accent, and state.
- Given repeated informational surfaces on the catalog, topic, lesson, study, reports, or data route, when they appear together, then they use the documented exercise-book, index-card, answer-slip, ledger, or archive family for that route instead of unrelated generic rounded cards or chips.
- Given route navigation, when a page changes, then content is immediately available and any visual page-turn effect is brief, non-blocking, and absent under reduced motion.
- Given a lesson at a wide viewport, when it opens, then it reads as an intentional two-page spread; at 320 pixels, the same content follows a clear single-column reading order without horizontal scrolling.
- Given a destructive data action, when it is selected, then a consequence-specific confirmation sheet opens with Cancel focused; Escape or Cancel closes it without work and returns focus, while the explicit confirm action alone performs the existing operation.
- Given a learner who cannot perceive color or metaphor, when any progress, answer, feedback, score, warning, or destructive state appears, then its meaning remains available through visible words, symbols, borders, or structure.
- Given reduced motion, when the learner navigates and interacts, then all content and state changes remain immediate and the desk, paper, stamp, pencil, and token animations are suppressed.
- Given the catalog, topic, lesson, study, results, reports, and data routes at 320, 768, and 1440 pixels, then each has its approved scene identity without overlap, clipping, or horizontal page scrolling.
- Given any G005 refinement, when the existing learning and persistence suites run, then routes, content, grading, sessions, report values, and all pre-existing learner-data behavior remain unchanged while note storage follows `REQ-G001-102`–`106`.
- Given answer feedback, lesson completion, or session completion, when the state changes, then a teacher stamp appears immediately with the complete text feedback still present and no animation under reduced motion.
- Given an unsubmitted answer, when the learner uses its correction or eraser action, then only the current choice, typed draft, or word-order draft changes and persisted learner history is untouched.
- Given a topic or lesson note, when it is displayed, edited, saved, removed, or reports a failure, then its native field, scope, character limit, explicit action, draft, and status remain understandable without recognizing the sticky-note metaphor.
- Given Reports, when **Show studied tests only** is checked, then only tests with completed attempts remain in the visible ledger and the underlying report values and learner data do not change.
- Given any stationery-refinement screen, when it is used at a supported width, then no stationery tool or teaching section opens or closes through a disclosure interaction.

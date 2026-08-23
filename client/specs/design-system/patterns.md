# UI patterns

## Deliberate local action

Use a clearly labelled action for backup download, restore, answer reveal, lesson completion, and progress clearing.

- State what will happen.
- Do not imply cloud synchronization or remote storage.
- Preserve a cancel path for destructive confirmation.
- Announce success or failure accessibly.

## Destructive confirmation

- Name the test, topic, or complete learner dataset affected.
- State which attempts, sessions, mistakes, lessons, corrections, and mastery records will be removed.
- State that bundled lessons and exercises remain available.
- State when the action cannot be undone without a backup.
- Present the consequence on a modal loose sheet, focus the safe cancellation action first, let Escape cancel, and return focus to the action that opened it.

## Backup restore

- Treat selected JSON as untrusted input.
- Parse and validate the complete backup and installed content references before any state replacement.
- Preserve current learner state when validation fails.
- Reset the file input after success or failure so the same file can be selected again.

## Answer reveal and feedback

- Keep **Show answer** visible before submission and pair it with `Alt+A`.
- Explain that reveal records a skip, grants no score credit, and does not create or resolve a mistake.
- Use text plus an icon/symbol for correct, incorrect, and skipped states.
- Show the correct answer and first-principles explanation before continuing.

## Empty and error states

- State what is missing or failed.
- Preserve learner input when possible.
- Offer the next useful recovery action.
- Never expose stack traces, browser internals, backup contents, or learner answers in user-facing errors.

## Topic catalog and learning map

- Keep home at catalog level: one compact summary per installed topic pack plus one prominent continue-learning action.
- Render each catalog topic as a bound exercise-book cover with a spine, page edge, and printed cover fields. Render the continue recommendation as a clipped assignment slip and the catalog totals as one printed record strip. Give the assignment and topic covers one warm amber paper palette while preserving their distinct constructions, and let both lift by the same amount on hover or focus-within. Let the complete statistics record strip lift by a smaller amount on pointer hover, but keep the cursor and semantics informational so motion never implies a click action.
- Put an individual pack's objectives, Focused/Review sequence, lesson progress, and test actions on its topic route. Separate the folded return link clearly from the level/test eyebrow. Reuse the continue-learning assignment's warm taped and ruled-paper material for the topic progress summary while retaining its four values and compact 2×2 reading order. Let the informational summary lift on pointer hover without suggesting a click action, render its labels in high-contrast primary ink, and render its values in the same muted secondary ink as the continue-learning topic subtitle. Keep the goals sheet's established grid, tape, clipped silhouette, spacing, and typography while using the warm paper palette and a restrained hover lift. Place the topic sticky note after the complete lessons-and-tests map using only the note's normal adjacent margin, where it lifts on hover and focus-within without changing its native form behavior. Communicate the two learning groups through section headings instead of repeating classification badges on every test card.
- Build the topic route from one taped objective sheet, binder-divider group headings, and one family of connected punched index cards; let both informational group dividers lift on pointer hover without suggesting a click action, and vary accent and stamp state without reverting to generic cards.
- Do not render lesson teaching sections or multiple expanded test sequences on home.
- Name progress truthfully: count distinct attempted tests as **tests tried** unless a separate completion threshold is specified.
- When a saved session references installed content, prefer resuming it; otherwise recommend the first untried test in catalog and authored order.

## Appearance choice

- Offer **Day**, **Automatic**, and **Night**, in that left-to-right order, as a native labelled radio group presented through accessible sun, half-day/half-night, and moon icons around one compact side-view mechanical toggle. Show the metal mounting base and tilt the lever left for Day, keep it upright for Automatic, and tilt it right for Night. Do not enclose the switch in a colored panel or border, and keep it no taller than the navigation pack. Day maps to the existing explicit Light value and Night maps to the existing explicit Dark value.
- Retain **Appearance** as the radio group's accessible name, but do not show a redundant group heading. Keep the switch and unnumbered primary tabs in one continuous header row while using a clear gap to distinguish the navigation pack from the appearance switch.
- Let Automatic follow `prefers-color-scheme`, including changes made while the app is open.
- Store only explicit Light or Dark overrides; removing an override returns to Automatic.
- Treat missing, invalid, or unavailable browser storage as Automatic and never block learning because an appearance preference cannot be read or saved.
- Keep the chosen appearance independent of learner progress, IndexedDB, backup, restore, and clear-history behavior.

## Stationery controls

- Present primary navigation as unnumbered subject-divider tabs without changing link order, wording, destinations, or active-page semantics.
- Present every action as the same recognisable cut-paper piece. Primary, secondary, compact, text, review, file, dialog, disabled, and destructive variants keep one silhouette and physical behavior; vary only paper tint, ink, edge accent, internal marks, and explicit wording.
- Present answer radios as pencil-marked circles, text answers as ruled fields, and word-order buttons as movable vocabulary cards while preserving native form behavior.
- Put answer radios on perforated ruled slips, place selected word cards on a sentence-building strip, keep available word cards in a labelled paper pocket, and present keyboard shortcuts as margin annotations rather than computer keycaps.
- Present progress as printed ruler scales without a pencil marker and state changes as readable teacher stamps, always paired with visible text, symbols, or numbers.
- Present reports as ledgers and data actions as cut-paper archive labels without hiding values, local-storage scope, restore behavior, or clearing consequences.
- Use folded-corner back links on every secondary route. A back link does not become a generic action slip merely because it appears in a page heading.
- Use the physical metaphor only as a visual aid. Do not require object recognition to discover, understand, or operate a control.
- Use correction/eraser controls only for the current unsubmitted choice, typed answer, or word-order draft. Stored learner history continues to use explicit consequence-specific clearing controls.
- Present topic and lesson notes as always-visible sticky notes with a native textarea, character count, explicit save/removal wording, and visible status; never render saved text as HTML.
- Present the native **Show studied tests only** report checkbox on a paper-clipped filter label. Filtering changes visible ledger rows only.
- Do not introduce an accordion, disclosure, collapsible stationery tool, expandable tray, or other collapse/expand interaction.

## Interactive workbook world

- Place route content on the same desk-and-workbook stage, but give each route a distinct physical scene that reinforces its purpose.
- Use exercise-book covers for topics, an unbroken connected path for the topic map, a facing-page reference layout for lessons, a loose worksheet for study, a returned marked paper for results, a ledger for reports, and labelled folders for data.
- Use immediate page-turn, tab-slide, lift, settle, stamp, pencil-circle, answer-line, and light motion only as confirmation of a state change; never wait for animation before navigation, content, or input becomes available.
- At 800 pixels and below, collapse facing pages into semantic reading order. At 560 pixels and below, remove desk props and present the page as a pocket notebook.
- Treat the visual craft as atmosphere, not gamification: do not add locks, points, lives, currency, rewards, streak pressure, or leaderboards.

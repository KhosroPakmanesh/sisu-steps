# G003 validation

## Automated validation

- **VAL-G003-001** (`REQ-G003-001`, `002`, `007`): Dashboard component tests verify one summary per pack, compact progress, topic links, and absence of expanded test cards.
- **VAL-G003-002** (`REQ-G003-003`): Query and dashboard tests verify recent valid session resume, invalid-session fallback, and the first unattempted test recommendation.
- **VAL-G003-003** (`REQ-G003-004`, `005`): Topic-page tests verify authored test order, separate core/extended groups, stage and skill labels, lesson progress, and direct lesson/test links.
- **VAL-G003-004** (`REQ-G003-006`): Topic-page tests verify a recoverable unknown-topic state and home link.
- **VAL-G003-005** (`REQ-G003-008`): Existing learning, persistence, content, reports, and backup tests remain green without learner-state migration.
- **VAL-G003-006** (`REQ-G003-009`, `010`): Lint, typecheck, production build, and Playwright verify semantic navigation, lazy routing, and 320-pixel catalog/topic usability.

## Manual checks

- Open home at 320, 768, and 1440 pixels and confirm topic cards do not clip or create horizontal scrolling.
- Open a topic at each width and confirm core/extended headings, test actions, and objectives remain readable.
- Navigate home, a topic, Learn first, and a test using only the keyboard; confirm visible focus and logical order.
- Create or resume a saved session and confirm the home continue action names and opens the correct workflow.

## Execution evidence

### 2026-08-19 implementation

- `npm run check`: passed ESLint, Angular template accessibility lint, Stylelint, purposeful-module size, source reachability, architecture boundaries, repository-wide Prettier, production and test TypeScript checks, content validation, production build, and unit tests.
- Unit tests: 10 files and 68 tests passed, including compact multi-pack summaries, saved-session resume, authored next-test selection, topic-page ordering and actions, unknown-topic recovery, due-review prominence, and explicit orphan-lesson rejection.
- Content validation: one cataloged pack passed with fourteen tests, 200 scored exercises, thirteen lessons, 44 separate practice exercises, complete references, and globally unique IDs.
- Production build: passed with a 66.84 kB estimated initial transfer and separate lazy chunks for the dashboard and topic pages.
- `npm run test:e2e`: 18 Playwright runs passed across the configured mobile, tablet, and wide Chromium projects, including catalog-to-topic navigation, session recovery, lesson separation, complete primary-nav labels, and no 320-pixel horizontal overflow.
- Visual inspection: the ready home catalog and topic map were inspected at 1440 pixels, and the home header and complete topic map were inspected at 320 pixels. The mobile primary navigation was changed to a stacked layout so **Topics**, **Reports**, and **Data** remain fully visible.
- Persistence review: no IndexedDB schema, learner-state shape, content-pack version, exercise content, lesson content, grading, backup, or clearing contract changed.
- Deferred manual follow-up: a full assistive-technology walkthrough remains advisable; the affected controls use native links and progress elements and passed automated keyboard/accessibility lint and browser checks.

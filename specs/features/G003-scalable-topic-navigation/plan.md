# G003 implementation plan

## Goal

Separate catalog-level discovery from pack-level study navigation so additional topic packs do not make the landing page grow into multiple expanded curricula.

## Requirement slice

- `REQ-G003-001`–`REQ-G003-010`
- Refines the presentation location described by `REQ-G001-001`, `REQ-G001-002`, `REQ-G001-085`, and `REQ-G001-088` without changing content, scoring, or learner-data semantics.

## Included

- Compact topic cards and one continue-learning summary on home.
- A lazy `/topics/:topicId` route containing the existing ordered test map and pack objectives.
- Topic-aware back-navigation from lessons and study sessions.
- Focused unit and browser coverage for catalog-to-topic navigation.
- Documentation and changelog updates.

## Non-goals

- New Finnish lessons, tests, packs, or content schema fields.
- Changes to grading, attempts, mistakes, reviews, reports, backups, IndexedDB, or content-version alignment.
- Accounts, cloud synchronization, runtime content generation, or an in-app content browser/editor.
- Locking tests behind lesson completion or test-order progression.

## Implementation steps

1. Add typed topic-route metadata and lazy route composition.
2. Extract pure topic-summary and continue-learning queries.
3. Replace the expanded home map with catalog cards and a continue-learning action.
4. Move the ordered Focused/Review test map and objectives into a topic route page.
5. Point valid lesson and study exits back to their owning topic.
6. Update unit, end-to-end, architecture, design-system, and changelog evidence.

## Risks

- Existing bookmarks to lesson and study routes must remain valid.
- A saved session may reference content that is no longer installed; the continue query must ignore invalid session targets.
- "Tests completed" has no pass threshold in the product model, so the interface must truthfully say "tests tried" when counting distinct attempted tests.

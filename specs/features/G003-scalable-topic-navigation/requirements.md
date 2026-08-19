# G003 requirements

## Functional requirements

- **REQ-G003-001:** The home route shall present every installed topic pack once as a compact summary with its title, level, summary, objectives, test progress, lesson progress, overall topic average, and prominent optional review status.
- **REQ-G003-002:** The home route shall not render the full test sequence or lesson teaching content for any topic pack.
- **REQ-G003-003:** The home route shall provide one prominent continue-learning action that resumes the most recently updated valid saved session or, when no session exists, starts the first test that has not yet been attempted.
- **REQ-G003-004:** Selecting a topic pack shall open `/topics/:topicId`, where the pack's objectives and every authored test appear in order.
- **REQ-G003-005:** The topic route shall preserve separate, directly accessible **Learn first** and test actions, visible core and extended groups, stage and skill guidance, topic-scoped mistakes, and optional review actions.
- **REQ-G003-006:** An unknown topic ID shall produce a recoverable page-level error with a route back to the topic catalog.
- **REQ-G003-007:** Adding another valid catalog entry shall add one topic summary to home without expanding that pack's tests or lessons on home.
- **REQ-G003-008:** Existing lesson, study, mistake, review, report, content-version, and learner-persistence contracts shall remain unchanged.

## Quality requirements

- **REQ-G003-009:** Home and topic navigation shall use semantic landmarks and links, visible focus, non-color progress labels, and remain usable from 320 pixels upward.
- **REQ-G003-010:** Secondary routes shall remain lazy-loaded and route metadata and path construction shall remain centralized in typed configuration.

## Acceptance criteria

- Given one installed pack, when home opens, then one topic card and no test cards or lesson bodies are present.
- Given two installed packs, when home opens, then two topic cards are present and each opens only its own topic route.
- Given a saved test session, when home opens, then the continue-learning action resumes that session.
- Given no saved session and an unattempted test, when home opens, then the continue-learning action starts the first unattempted test in catalog and authored order.
- Given a valid topic ID, when its topic page opens, then all tests appear in authored order with separate lesson and study actions.
- Given an invalid topic ID, when its topic page opens, then a recoverable error and topic-catalog link are visible.

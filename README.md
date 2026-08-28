# Sisu Steps

A local-first interactive Finnish exercise book for one English-speaking learner. Topic packs are discovered from a static catalog and keep their own lessons, tests, progress, mistakes, reviews, reports, and content version. The first pack contains 200 Pre-A1–A1.3 grammar-foundation exercises on vowel harmony, KPT consonant gradation, and the nominative T-plural. The current implementation is an Angular browser client; the server area is reserved for a future explicitly specified .NET backend.

## What it includes

- Authored grammar packs may contain 200–1,000 scored exercises according to the topic's coverage needs; the current pack contains 200
- Separate **Focused tests** for every declared important grammar point, followed by visibly separate mixed **Reviews**
- Visible **Focused** and **Review** stages; focused tests teach one topic and only reviews combine previously learned patterns
- Separate **Learn first** preparation for every test; focused tests show only their topic-specific lesson while reviews may reuse earlier lessons
- Declared lesson targets, prerequisites, and English vocabulary lists with no hidden grammar in focused exercises
- Worked examples, common mistakes, and 44 optional unscored practice questions that never affect test history
- Multiple-choice, fill-in-the-blank, bidirectional translation, and word-order practice
- Immediate correction, per-option diagnostics, and an English explanation after every answer
- A **Show answer** control and `Alt+A` shortcut that reveal feedback and record the exercise as skipped rather than incorrect
- First-principles sentence feedback with the full meaning, sentence pattern, and a part-by-part explanation of each word's job and construction
- Learner-friendly typed-answer normalization with significant Finnish `ä` and `ö`
- Native IndexedDB storage for attempts, unfinished tests, unresolved mistakes, corrections, delayed mastery, and versioned lesson completion
- Mistake practice, prominent optional scheduled review, and first/latest/best/average plus skill-level reporting
- Versioned JSON backup/restore and test/topic/all-history clearing
- Static multi-topic catalog loading with globally unique content IDs and per-pack progress migration
- Core learning workflows require no backend, account, cloud database, or runtime AI call

## Repository structure

```text
sisu-steps/
  client/          Angular application, client tooling, and client technical guidance
  server/          Future backend workspace and server-owned guidance
  docs/            Repository-wide workflow guidance
  specs/           Product requirements, content policy, and shared product decisions
  .vscode/         Shared workspace tasks and launch configuration
```

Git metadata, repository-wide ignore rules, shared editor configuration, the changelog, and product contracts remain at the root.

## Start here

- [Client README](client/README.md) — install, run, validate, architecture, content tooling, and browser storage.
- [Server README](server/README.md) — current placeholder status and the approval path for future backend work.
- [Product constitution](specs/constitution.md) — product invariants and system boundaries.
- [Product feature index](specs/features/README.md) — active product requirements and client technical migration history.
- [Repository commit checklist](docs/commit-checklist.md) — cross-area handoff and commit review.

## Product guarantees

- Core study, scoring, history, and reporting work without a backend dependency.
- Learner progress remains locally owned unless an explicitly approved product requirement introduces another boundary.
- Authored content and mutable learner progress remain separate.
- Content, routes, persistence contracts, and cross-area APIs change only through explicit specifications and validation.
- A future server must have its own requirements, validation, privacy, storage, and operational guidance before implementation.

## Content ownership

Product-level content policy and pedagogy records live under root `specs/`. Pure-JSON pack folders, generic direct-source validation, browser-side runtime assembly, and unchanged static deployment are client-owned and documented in the client README.

## Product contract

The product constitution and active product requirements are in root `specs/`. The initial learner experience is tracked by `G001-local-finnish-exercise-book`, scalable topic navigation by `G003-scalable-topic-navigation`, and the completed Angular technical-governance migration by `client/specs/features/G002-technical-guidance-alignment/`.

## Grammar references

- [Uusi kielemme: Vowel Harmony](https://uusikielemme.fi/finnish-grammar/vowel-harmony-vokaaliharmonia-finnish-grammar)
- [Uusi kielemme: The T-Plural](https://uusikielemme.fi/finnish-grammar/finnish-cases/grammatical-cases/the-t-plural-t-monikko-plural-nominative)
- [Uusi kielemme: Beginner Finnish Topics A1](https://uusikielemme.fi/language-levels/beginner-finnish-topics-level-a1-a1-1-to-a1-3)

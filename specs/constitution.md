# Product constitution

## Mission

Create a calm, local-first interactive exercise book that helps one English-speaking learner practise Finnish and understand mistakes immediately.

## Product principles

1. **Pedagogy before scoring.** Every graded answer must include a useful correction or explanation. Sentence feedback must teach from first principles instead of assuming that the learner already knows grammatical terminology or how a displayed form was produced.
2. **Local ownership.** Exercise attempts and reports remain under the learner's control unless an explicitly approved product requirement introduces another boundary.
3. **Core independence.** Core study, scoring, history, and reporting must work without a backend, account, cloud database, or runtime AI call.
4. **Predictable study structure.** Topic packs contain named, ordered tests rather than randomly assembled ordinary sessions.
5. **Recoverability.** Learner data can be exported, restored, and deliberately cleared.
6. **Accessible simplicity.** The interface must be keyboard-usable, responsive, and understandable at a glance.
7. **One new decision at a time.** Focused teaching and practice introduce one grammatical decision or transformation. Previously taught grammar may support a natural example, but unrelated or undeclared grammar and vocabulary must not become hidden requirements.

## System boundaries

- Product requirements and shared data semantics belong under root `specs/`.
- Client technology, browser persistence, design-system, and client architecture rules belong under `client/specs/`.
- Server technology, API, storage, security, privacy, deployment, and operational rules belong under `server/specs/` when those decisions are approved.
- A future server may support explicitly specified capabilities, but it must not become mandatory for core learning workflows unless this constitution and the affected product requirements are explicitly amended.
- Any client/server data exchange requires a versioned contract, negative-case validation, privacy rules, and compatibility behavior before implementation.

## Content policy

- Each content pack declares its topic, CEFR range, learning objectives, ordered test groups, and version.
- Each grammatical-topic pack contains between 200 and 1,000 authored scored exercises, with the exact total chosen from the topic's pedagogical coverage needs rather than a fixed default.
- Each pack declares its important grammatical skills. Focused tests collectively cover every declared important skill before any Review appears.
- Every test is either Focused or Review. Focused tests introduce and assess one target at a time; Reviews follow the focused sequence, mix previously introduced skills, and do not introduce an undeclared grammatical requirement.
- Every new or materially revised pack receives a Finnish-teaching pedagogy assessment twice: once before bulk authoring to approve scope, prerequisites, progression, vocabulary load, and question count, and once after authoring to audit the finished lessons, exercises, explanations, and answer model.
- Each pack keeps a reviewable pedagogy record that states the assessment evidence, decisions, limitations, and final disposition.
- Each exercise has a stable ID, prompt, answer definition, explanation, and tags.
- Reusable lessons have stable IDs and versions and teach from first principles. Focused tests reference only lessons for their own target skill; review tests may reuse earlier lessons without duplicating their content.
- Lesson practice is authored separately from scored test exercises and never changes attempts, reports, or mistake status.
- Each sentence exercise explains the complete meaning, sentence pattern, and every displayed part, including its English meaning, grammatical job, base form, endings, and relevant sound or stem changes.
- Explanations introduce grammar terms in plain English before using them and do not rely on unstated prerequisite knowledge.
- Every lesson and test is labelled as focused or review. Focused material has one target skill, declares any previously taught prerequisites, and does not repeat prerequisite lessons on its preparation page. Reviews are the only material that may combine multiple previously introduced skills.
- Scored vocabulary is introduced in the current or a referenced prerequisite lesson. Any unfamiliar contextual word is translated where it appears and is never an unannounced grading requirement.
- Finnish diacritics remain significant during typed-answer grading.
- Content changes must not silently corrupt or reinterpret stored attempt history.

## Initial scope

The first release serves one local learner and includes optional reusable preparation lessons, grouped tests, immediate feedback, mistake practice, reports, session recovery, JSON backup/restore, and scoped history clearing.

Accounts, cloud synchronization, in-app content authoring, audio, speech recognition, pronunciation assessment, gamification, and runtime content generation are deferred.

## Related guidance

- `content-authoring.md` — content creation and pedagogy workflow.
- `content-assessments/` — recorded Finnish-teaching assessments.
- `features/README.md` — product feature index.
- `../client/specs/README.md` — current client technical contract.
- `../server/specs/README.md` — future server specification entrypoint.

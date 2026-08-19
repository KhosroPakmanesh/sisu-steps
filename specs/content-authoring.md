# Finnish grammar content authoring

This guide is the reviewable workflow for every new or materially revised Sisu Steps topic pack. The product constitution and G001 requirements remain authoritative when this guide and implementation differ.

## Required inputs

- Finnish grammatical topic or deliberately combined topic boundary
- Learner's starting level and expected ending level
- Any user-specified emphases, exclusions, terminology, or competency expectations
- Authoritative grammar and usage sources suitable for the stated level

## 1. Establish the coverage blueprint

Create a stable list of important skills and subpoints. For each point, record its prerequisite skills, likely beginner misconceptions, suitable vocabulary, and whether it belongs in focused teaching, guided combination, or review.

Choose the scored-question total between 200 and 1,000 from the number of distinct decisions, necessary response formats, retrieval spacing, common misconceptions, and transfer needs. Do not add paraphrased filler merely to increase the count.

Define the complete core sequence first. Core tests must collectively assess every important skill. Put only additional depth, cumulative retrieval, and transfer practice in the extended sequence.

## 2. Pre-authoring Finnish-teaching pedagogy assessment

Before bulk exercises are written, save an assessment record covering:

- whether the topic boundary is coherent for the learner's level;
- whether all important points and exceptions appropriate to that level are declared;
- whether prerequisites are taught, supplied, or explicitly excluded;
- whether each focused step asks for one new grammatical decision;
- whether vocabulary load is controlled and meanings are supplied when vocabulary is not the target;
- whether the sequence moves from noticing and recognition to controlled production, guided combination, retrieval, and transfer;
- whether predicted misconceptions receive instruction and diagnostic practice;
- whether the core/extended boundary and proposed question total are pedagogically justified;
- whether reading-only written exercises are described as grammar practice rather than proof of complete CEFR ability.

Record a disposition of **approved**, **approved with limitations**, or **revision required**. Do not begin bulk authoring while a high-impact issue remains unresolved.

## 3. Author lessons and exercises

Lessons teach from first principles, declare targets and prerequisites, introduce at most ten scored words when focused, contain worked examples and common mistakes, and provide two to five optional unscored practice items.

Scored exercises use fixed authored order and stable globally unique IDs. They declare required skills, controlled vocabulary, a target skill, misconception category, accepted answers, explanation, and a different mutual parallel exercise. Multiple-choice items explain every option. Sentence items explain the complete meaning, pattern, and construction of every part.

Core and extended tests remain immediately accessible. Lessons are prominent but optional. Reveals are recorded as skipped. Corrected work becomes mastered only through a different eligible parallel exercise in later review.

## 4. Technical validation

Regenerate every registered pack, validate the complete catalog, run automated tests, format changed files, and build the production app. A pack is not complete when universal schema checks, topic-specific guards, cross-pack ID checks, or the production build fail.

## 5. Final Finnish-teaching pedagogy assessment

Audit the finished pack rather than only its metadata:

- verify Finnish prompts, answers, translations, and formation explanations;
- identify common natural accepted alternatives and remove ambiguous grading;
- verify distractors are plausible, diagnostic, and unambiguously wrong;
- ensure explanations define terminology and expose every non-obvious construction step;
- verify focused exercises contain no hidden grammar or lexical recall burden;
- check recognition-to-production progression and cumulative cognitive load;
- distinguish purposeful retrieval from repetitive filler;
- confirm every important point has sufficient core evidence and extended work introduces nothing new;
- compare parallel exercises for same-skill, different-surface, comparable-difficulty mastery evidence;
- state limitations such as missing listening, speaking, pronunciation, dialect, or communicative assessment.

Record the final disposition. An unresolved high-impact finding requires revision and another assessment pass.

## Saved assessment record

Store each assessment at `specs/content-assessments/<pack-id>.md`. Include topic and level, sources, coverage decision, proposed and final counts, both assessment dispositions, findings and resolutions, limitations, technical validation evidence, and the final approval decision.

# Finnish grammar content authoring

This guide is the reviewable workflow for every new or materially revised Sisu Steps topic pack. The product constitution and G001 requirements remain authoritative when this guide and implementation differ.

## Required inputs

- Finnish grammatical topic or deliberately combined topic boundary
- Learner's starting level and expected ending level
- Any user-specified emphases, exclusions, terminology, or competency expectations
- Authoritative grammar and usage sources suitable for the stated level

## 1. Establish the coverage blueprint

Create a stable list of important skills and subpoints. For each point, record its prerequisite skills, likely beginner misconceptions, suitable vocabulary, and whether it belongs in focused teaching or review.

Give every non-review grammar topic its own focused test. Its **Learn first** preparation references only the lesson or lessons that teach that test's target skill. Declare earlier skills as prerequisites without adding their lessons to the preparation list. Only review material may combine multiple previously introduced topics.

Choose the scored-question total between 200 and 1,000 from the number of distinct decisions, necessary response formats, retrieval spacing, common misconceptions, and transfer needs. Do not add paraphrased filler merely to increase the count.

Define the complete Focused sequence first. Focused tests must collectively assess every important skill, one target at a time. Put cumulative retrieval, mixed practice, and transfer only in Reviews, and do not add a second Core/Extended classification.

## 2. Pre-authoring Finnish-teaching pedagogy assessment

Before bulk exercises are written, save an assessment record covering:

- whether the topic boundary is coherent for the learner's level;
- whether all important points and exceptions appropriate to that level are declared;
- whether prerequisites are taught, supplied, or explicitly excluded;
- whether each focused step asks for one new grammatical decision;
- whether vocabulary load is controlled and meanings are supplied when vocabulary is not the target;
- whether the sequence moves from noticing and recognition to controlled production, review retrieval, and transfer;
- whether predicted misconceptions receive instruction and diagnostic practice;
- whether the Focused/Review boundary and proposed question total are pedagogically justified;
- whether reading-only written exercises are described as grammar practice rather than proof of complete CEFR ability.

Record a disposition of **approved**, **approved with limitations**, or **revision required**. Do not begin bulk authoring while a high-impact issue remains unresolved.

## 3. Author lessons and exercises

Lessons teach from first principles, declare targets and prerequisites, introduce at most ten scored words when focused, contain worked examples and common mistakes, and provide two to five optional unscored practice items.

Keep each pack's authored implementation under `client/content/<pack-id>/`: pack metadata and ordered references in `pack.json`, one pure-JSON lesson per stable ID under `lessons/`, and one pure-JSON learning test per stable ID under `tests/`. Store every pedagogical value and semantic relationship explicitly there. `client/content/` is the sole source and is deployed unchanged; do not author content in JavaScript or create a generated content copy.

Scored exercises use fixed authored order and stable globally unique IDs. They declare required skills, controlled vocabulary, a target skill, misconception category, accepted answers, explanation, and a different mutual parallel exercise. Multiple-choice items explain every option. Sentence items explain the complete meaning, pattern, and construction of every part.

Whenever a prompt transforms one Finnish form into another, label both forms with their English meanings. Put the source meaning beside the source form and the target meaning beside the answer or supplied target form; do not attach a target meaning to the dictionary form. Explicitly supply every ending, stem frame, agreement choice, or other construction step that is not the assessed target. For example, a KPT-only question may ask `silta (“bridge”) → ____ (“of the bridge”)` only when the genitive `-n` is also visibly supplied, while a genitive-focused question may assess that ending directly.

Focused tests and Reviews remain immediately accessible in separate learning-map sections without repeated classification badges on every card. Focused tests reference only their topic-specific preparation lessons; prerequisite skills remain visible but their earlier lessons are not repeated. Lessons are prominent but optional. Reveals are recorded as skipped. Corrected work becomes mastered only through a different eligible parallel exercise in later review.

## 4. Technical validation

Assemble and validate every registered pack directly from its pack-owned JSON files, run automated tests, format changed files, and build the production app. A pack is not complete when source-structure checks, universal schema checks, pack-grouped topic-specific guards, cross-pack ID checks, direct deployment checks, or the production build fail.

## 5. Final Finnish-teaching pedagogy assessment

Audit the finished pack rather than only its metadata:

- verify Finnish prompts, answers, translations, and formation explanations;
- identify common natural accepted alternatives and remove ambiguous grading;
- verify distractors are plausible, diagnostic, and unambiguously wrong;
- ensure explanations define terminology and expose every non-obvious construction step;
- verify focused exercises contain no hidden grammar or lexical recall burden;
- check recognition-to-production progression and cumulative cognitive load;
- distinguish purposeful retrieval from repetitive filler;
- confirm every important point has sufficient Focused evidence and Reviews introduce nothing new;
- compare parallel exercises for same-skill, different-surface, comparable-difficulty mastery evidence;
- state limitations such as missing listening, speaking, pronunciation, dialect, or communicative assessment.

Record the final disposition. An unresolved high-impact finding requires revision and another assessment pass.

## Saved assessment record

Store each assessment at `specs/content-assessments/<pack-id>.md`. Include topic and level, sources, coverage decision, proposed and final counts, both assessment dispositions, findings and resolutions, limitations, technical validation evidence, and the final approval decision.

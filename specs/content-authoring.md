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

Choose a non-empty scored-question total, up to 1,000, from the number of distinct decisions, necessary response formats, retrieval spacing, common misconceptions, and transfer needs. Do not add paraphrased filler to reach a common pack size.

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

Lessons teach from first principles, declare targets and prerequisites, introduce at most ten scored vocabulary entries when focused, contain worked examples and common mistakes, and provide two to five optional unscored practice items.

### Vocabulary ownership and variety

Classify every learner-relevant Finnish lexical item used in lesson explanations, worked examples, common mistakes, optional practice, and scored exercises as one of:

- **New word:** first taught in the current lesson and expected to be recalled. Display it under **New words** and count it toward the focused lesson's ten-word ceiling.
- **Used again:** introduced by the transitive chain for a declared prerequisite skill. Display it with the same English meaning under **Used again**, but do not count it as new.
- **Supplied vocabulary:** used only as translated context and not assessed as lexical recall. Display its meaning where it appears and identify it under **Supplied in examples** when it occurs in lesson teaching.

Do not count a personal pronoun as vocabulary when that pronoun is itself the lesson's declared grammar target. Supporting nouns, verbs, adjectives, adverbs, fixed expressions, and other lexical material still require one of the three classifications.

Determine vocabulary ownership by the authored lexical item rather than treating every inflected surface form as a separate new word. When the current grammar derives a form, list the base word and show the encountered form where useful. When that derivation is not the target, supply the complete Finnish form.

Every vocabulary object must declare `type` as either `word` or `fixed-expression`. A `word` contains exactly one whitespace-free Finnish lexical word. Split transparent combinations into separate entries with their own stable meanings: for example, represent `Suomessa huomenna` as `Suomessa — in Finland` and `huomenna — tomorrow`. Use `fixed-expression` only for a genuine conventional or idiomatic unit learned as a whole, such as `hyvää huomenta — good morning`; it must contain more than one written word. Sentence fragments, convenient context bundles, and combinations created only to stay under the ten-item ceiling are not fixed expressions.

An exercise's `vocabulary` array lists only the individual words or genuine fixed expressions the learner must retrieve lexically. Omit visibly translated Finnish context and Finnish word-order tokens when the answer tests only grammar rather than recall of that context. Splitting vocabulary metadata never requires splitting a natural phrase inside a prompt, answer, explanation, or word-order token.

Do not remove useful vocabulary merely to satisfy the ceiling. First reclassify previously taught vocabulary, visibly supply non-assessed context, or redistribute genuinely new vocabulary. Replace a word only when it is incidental, has little retrieval value, and its removal does not reduce naturalness, semantic range, or question variety.

Repeated grammatical decisions are purposeful practice, but exercises must still vary meaningfully through context, grammatical person, polarity, response format, vocabulary combination, or production demand. Surface-only paraphrases are repetitive filler rather than meaningful variation.

Keep each pack's authored implementation under `client/content/<pack-id>/`: pack metadata and ordered references in `pack.json`, one pure-JSON lesson per stable ID under `lessons/`, and one pure-JSON learning test per stable ID under `tests/`. Store every pedagogical value and semantic relationship explicitly there. `client/content/` is the sole source and is deployed unchanged; do not author content in JavaScript or create a generated content copy.

Scored exercises use fixed authored order and stable globally unique IDs. They declare required skills, controlled vocabulary, a target skill, misconception category, accepted answers, explanation, and a different mutual parallel exercise. Multiple-choice items explain every option. Sentence items explain the complete meaning, pattern, and construction of every part. When a learner must construct or complete a Finnish sentence, put its complete intended English meaning in the prompt before submission; Finnish-to-English translation items are exempt because discovering that meaning is the task.

When material demonstrates how a verb is used, prefer a short, complete, level-appropriate sentence over a fragment or bare conjugated form. An isolated form remains appropriate when forming that morphology is explicitly the target. Write learner-facing instructions and explanations in direct, natural English rather than exposing internal authoring shorthand such as “new decision” or “non-target operation”. If a prompt or explanation calls a word, ending, stem, or context “supplied”, that information must be visibly present in the prompt.

Whenever a prompt transforms one Finnish form into another, label both forms with their English meanings. Put the source meaning beside the source form and the target meaning beside the answer or supplied target form; do not attach a target meaning to the dictionary form. Explicitly supply every ending, stem frame, agreement choice, or other construction step that is not the assessed target. For example, a KPT-only question may ask `silta (“bridge”) → ____ (“of the bridge”)` only when the genitive `-n` is also visibly supplied, while a genitive-focused question may assess that ending directly.

Focused tests and Reviews remain immediately accessible in separate learning-map sections without repeated classification badges on every card. Focused tests reference only their topic-specific preparation lessons; prerequisite skills remain visible but their earlier lessons are not repeated. Lessons are prominent but optional. Reveals are recorded as skipped. Corrected work becomes mastered only through a different eligible parallel exercise in later review.

## 4. Technical validation

Assemble and validate every registered pack directly from its pack-owned JSON files, run automated tests, format changed files, and build the production app. Runtime and standalone validation must reject known vocabulary used without classification in worked examples, supplied vocabulary whose Finnish form and English meaning are not visible in teaching, and repeated optional-practice labels. A pack is not complete when source-structure checks, universal schema checks, pack-grouped topic-specific guards, cross-pack ID checks, direct deployment checks, or the production build fail.

## 5. Final Finnish-teaching pedagogy assessment

Audit the finished pack rather than only its metadata:

- verify Finnish prompts, answers, translations, and formation explanations;
- identify common natural accepted alternatives and remove ambiguous grading;
- verify distractors are plausible, diagnostic, and unambiguously wrong;
- ensure explanations define terminology and expose every non-obvious construction step;
- verify focused exercises contain no hidden grammar or lexical recall burden;
- inventory vocabulary from the rendered lesson body and exercises rather than metadata alone, and verify that every learner-relevant item is correctly classified as new, used again through a declared prerequisite, or visibly supplied;
- check recognition-to-production progression and cumulative cognitive load;
- distinguish purposeful retrieval from repetitive filler by comparing context, person, polarity, response format, vocabulary combination, and production demand;
- confirm every important point has sufficient Focused evidence and Reviews introduce nothing new;
- compare parallel exercises for same-skill, different-surface, comparable-difficulty mastery evidence;
- state limitations such as missing listening, speaking, pronunciation, dialect, or communicative assessment.

Record the final disposition. An unresolved high-impact finding requires revision and another assessment pass.

## Saved assessment record

Store each assessment at `specs/content-assessments/<pack-id>.md`. Include topic and level, sources, coverage decision, proposed and final counts, both assessment dispositions, findings and resolutions, limitations, technical validation evidence, and the final approval decision.

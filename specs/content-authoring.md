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
- whether each planned lesson part follows the lesson section responsibilities, with vocabulary lists owned by the dedicated vocabulary area;
- whether the sequence moves from noticing and recognition to controlled production, review retrieval, and transfer;
- whether predicted misconceptions receive instruction and diagnostic practice;
- whether the Focused/Review boundary and proposed question total are pedagogically justified;
- whether reading-only written exercises are described as grammar practice rather than proof of complete CEFR ability.

Record a disposition of **approved**, **approved with limitations**, or **revision required**. Do not begin bulk authoring while a high-impact issue remains unresolved.

## 3. Author lessons and exercises

Lessons teach from first principles, declare targets and prerequisites, introduce at most ten scored vocabulary entries when focused, contain worked examples and common mistakes, and provide two to five optional unscored practice items.

### Lesson section responsibilities

Follow `REQ-G001-136` in every pack. Use these responsibilities even when grammar subsection titles differ by topic:

| Lesson part                   | Responsibility                                                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objectives                    | State what the learner will be able to do.                                                                                                           |
| Grammar sections (`sections`) | Explain meanings, patterns, formation rules, and relevant exceptions.                                                                                |
| Key points                    | Summarize the grammar explained in their owning section.                                                                                             |
| Lesson vocabulary             | Own the standalone lexical lists under **New words**, **Used again**, and **Supplied in examples**, rendered from the three vocabulary declarations. |
| Worked examples               | Demonstrate the taught grammar with full meanings and step-by-step construction.                                                                     |
| Common mistakes               | Explain predictable errors and their corrections.                                                                                                    |
| Optional practice             | Apply already taught material without affecting scored progress.                                                                                     |

Do not reproduce a vocabulary list in authored grammar paragraphs or key points, even under another heading or with supply annotations. Keep contextual translations beside the forms they explain. Grammatical paradigms and transformations, such as `minä → minulla` and `kissa → kissaa`, belong in grammar teaching; they are not duplicate lexical lists. Repeating a word in a meaningful example or exercise is appropriate. A repeated explanation must add a distinct learning purpose rather than restating another section.

Map worked examples to the lesson's target and its meaningful contrasts before writing them. A form lesson demonstrates the taught forms; a verb lesson explains verb choice; a word-order lesson explains placement; a short-answer lesson includes actual replies; an ending/omission lesson demonstrates every taught ending. Reusing a sentence is appropriate when its construction notes teach the current target. Copying a complete example set and its notes between different targets does not serve that purpose. For the ownership family, follow the concrete coverage contract in `REQ-G001-139`, including all six owners before additional noun variants.

Before authoring, assign each planned part its responsibility and identify any necessary contextual glosses or form tables. In the final assessment, inspect every rendered lesson, including the shared vocabulary area, for section-purpose consistency and duplicate lists. Record audited lesson counts, exceptions and their teaching purpose, corrections, and limitations. Automated matching catches obvious lists of declared Finnish-English entries; the rendered assessment remains responsible for semantic duplication and consistency.

### Vocabulary ownership and variety

Classify every learner-relevant Finnish lexical item used in lesson explanations, worked examples, common mistakes, optional practice, and scored exercises as one of:

- **New word:** first taught in the current lesson and expected to be recalled. Display it under **New words** and count it toward the focused lesson's ten-word ceiling.
- **Used again:** introduced by the transitive chain for a declared prerequisite skill. Display it with the same English meaning under **Used again**, but do not count it as new.
- **Supplied vocabulary:** used only as translated context and not assessed as lexical recall. Display its meaning where it appears and identify it under **Supplied in examples** when it occurs in lesson teaching.

Do not count a personal pronoun as vocabulary when that pronoun is itself the lesson's declared grammar target. Supporting nouns, verbs, adjectives, adverbs, fixed expressions, and other lexical material still require one of the three classifications.

Determine vocabulary ownership by the authored lexical item rather than treating every inflected surface form as a separate new word. When the current grammar derives a form, list the base word and show the encountered form where useful. When that derivation is not the target, supply the complete Finnish form.

Every vocabulary object must declare `type` as either `word` or `fixed-expression`. A `word` contains exactly one whitespace-free Finnish lexical word. Split transparent combinations into separate entries with their own stable meanings: for example, represent `Suomessa huomenna` as `Suomessa — in Finland` and `huomenna — tomorrow`. Use `fixed-expression` only for a genuine conventional or idiomatic unit learned as a whole, such as `hyvää huomenta — good morning`; it must contain more than one written word. Sentence fragments, convenient context bundles, and combinations created only to stay under the ten-item ceiling are not fixed expressions.

An exercise's `vocabulary` array lists only the individual words or genuine fixed expressions the learner must retrieve lexically. When a question supplies the noun’s basic Finnish form and meaning, deriving its assessed case or possessive ending tests grammar rather than lexical recall. Omit visibly translated Finnish context and Finnish word-order tokens when the answer tests only grammar rather than recall of that context. Splitting vocabulary metadata never requires splitting a natural phrase inside a prompt, answer, explanation, or word-order token.

Derive each question's expected word list independently before setting its `vocabulary` array:

1. Inventory the learner-visible Finnish in the prompt, choices, supplied tokens, and expected answer. Use the sentence explanation's parts to identify base words behind inflected forms, and split transparent combinations into lexical units.
2. Classify each unit as assessed grammar, context visibly supplied with its meaning or complete Finnish form, or supporting vocabulary the learner must recall. Include every recall item under its canonical lesson form. In Finnish-to-English translation, supporting content words in the Finnish sentence require entries even when the question does not print their English meaning.
3. Compare the expected list with the authored array in both directions: flag missing recall words and entries that the question never tests. Confirm every listed item is introduced by an available lesson and appears under **New words** or **Used again** in a lesson directly referenced by the owning test. A prerequisite lesson alone does not make the word visible in the current-question reference.

Review inflected and compound forms by hand because exact text matching cannot establish their lexical identity or whether a word is genuinely supplied.

Declare only assessed grammar base forms in each pack's `pack.json` `grammarBaseForms` array (use `[]` when there are none). The direct-source validator aligns each sentence explanation's Finnish words with its base forms and compares the resulting recall candidates with `vocabulary`. It checks the complete Finnish source for Finnish-to-English sentences, the complete Finnish answer for Finnish-production and word-order questions, and optional lesson practice. Do not add a supporting word to `grammarBaseForms` to silence a missing-word error; correct the question inventory or visibly supply the word instead. Non-sentence drills and semantic judgments about supplied forms still require the independent manual inventory above.

Under `REQ-G001-141`, keep declared grammatical elements out of all three lesson vocabulary categories and exercise lexical-recall arrays, including their inflected forms identified by aligned authored sentence parts. Teach their meanings and patterns in grammar sections and examples instead. This applies to grammar-only pronouns, demonstratives, interrogatives, verb forms, and taught answer elements; it does not make every pronoun or verb in every pack grammar-only. Supporting lexical material and supplied noun forms still require classification. Runtime and direct-source guards reject overlapping declarations rather than hiding them in the UI. Manually review non-sentence grammar forms and missing base declarations.

Do not remove useful vocabulary merely to satisfy the ceiling. First reclassify previously taught vocabulary, visibly supply non-assessed context, or redistribute genuinely new vocabulary. Replace a word only when it is incidental, has little retrieval value, and its removal does not reduce naturalness, semantic range, or question variety.

Repeated grammatical decisions are purposeful practice, but exercises must still vary meaningfully through context, grammatical person, polarity, response format, vocabulary combination, or production demand. Surface-only paraphrases are repetitive filler rather than meaningful variation.

Inventory response formats and their authored sequence before finalizing a pack. Choose formats that assess the lesson's own target, use the supported range across a pack, and mix recognition, completion, interpretation and production in cumulative Reviews. Interleave formats after guided recognition and separate mutual mastery partners so the second task requires retrieval. A narrow morphology target can justify fewer formats; record that exception rather than adding an unrelated sentence task. For the ownership family, apply the concrete coverage, Review-balance and spacing limits in `REQ-G001-143`.

Keep each pack's authored implementation under `client/content/<pack-id>/`: pack metadata and ordered references in `pack.json`, one pure-JSON lesson per stable ID under `lessons/`, and one pure-JSON learning test per stable ID under `tests/`. Store every pedagogical value and semantic relationship explicitly there. `client/content/` is the sole source and is deployed unchanged; do not author content in JavaScript or create a generated content copy.

Declare catalog grouping once in schema-2 `content/index.json`. Each group has a stable lowercase-kebab `id`, a learner-facing `title`, and a non-empty ordered `packs` array. Group IDs and pack IDs are unique, and every registered pack appears in exactly one group; presentation code consumes this authored structure without hard-coding pack IDs or group membership.

Scored exercises use fixed authored order and stable globally unique IDs. They declare required skills, controlled vocabulary, a target skill, misconception category, accepted answers, explanation, and a different mutual parallel exercise. Multiple-choice items explain every option. Sentence items explain the complete meaning, pattern, and construction of every part. When a learner must construct or complete a Finnish sentence, put its complete intended English meaning in the prompt before submission; Finnish-to-English translation items are exempt because discovering that meaning is the task.

For free-text answers, inventory common standard Finnish replies that express the requested meaning before finalizing `acceptedAnswers`. In yes/no short answers, a conjugated negative reply may stand alone or follow the separate answer particle `Ei`: accept both `Emme ole.` and `Ei, emme ole.` when either fits the prompt. An affirmative verb echo may stand alone or follow `Kyllä`: accept both `Olemme.` and `Kyllä, olemme.`. Apply the same check to scored and optional-practice text entry. Keep one clear model answer first for feedback, list natural alternatives explicitly, and check that the prompt does not require an exact quoted form. Multiple-choice options and word-order tokens define the available response for those interaction types; review them for clarity rather than adding text-entry variants to their answer lists.

Apply the same alternatives audit to English free-text translations. Put a natural, faithful model first and explicitly accept other idiomatic renderings supported by the Finnish sentence and visible context, including appropriate article or demonstrative choices. Do not turn a discourse relationship into an unnatural learner-facing gloss such as “previously identified book.” For Finnish `se` and `ne`, English `the`, `that`, or `those` may fit in different contexts; preserve the intended reference and keep any cue needed to choose among Finnish demonstratives visible outside the quoted English target. Do not accept an alternative merely because it is grammatical English if it changes the Finnish meaning or erases an assessed distinction.

For gender-neutral Finnish `hän` and its possessive forms, explicitly accept equivalent English `he`, `she`, and `he or she`, or `his`, `her`, and `his or her` answers (`REQ-G001-137`). Apply the alternatives to every permitted sentence frame, including articles and contractions. For example, `Hänellä on tyyny.` accepts “He has a pillow.”, “She has a pillow.”, and “He or she has a pillow.”; `hänen koiransa` accepts `his dog`, `her dog`, and `his or her dog`. Isolated `hän` questions also accept either individual pronoun and the combined form, without requiring an unspecified-gender answer to spell out both. Preserve one natural first model and existing valid alternatives. Keep Finnish plural `he` distinct from English singular `he` and preserve number and polarity.

Make the choice clear before submission: write `You may use “he” or “she”.` or `You may use “his” or “her”.` when a cue helps; avoid bare `Use he or she` / `Use his or her` and repeated `Owner: he or she` instructions. Audit all installed packs, including optional practice, for the same policy. Run the runtime and direct-source pronoun-alternative checks, submit each form through the actual grading function, and retain negative cases for wrong number, polarity, missing alternatives, and ambiguous prompts. Ordinary tests that submit only `acceptedAnswers[0]` do not prove alternative coverage. Update the affected pack version and record the scoped progress loss whenever the accepted-answer interpretation changes.

English translations of Finnish possession use simple `have` / `has`, `do not have` / `does not have` (with natural contractions), and `do` / `does` questions (`REQ-G001-138`). Do not author or accept `have got`, `has got`, `have/has not got`, `haven’t/hasn’t got`, or `Have/Has … got?` variants in scored or optional possession practice. This product boundary keeps the English construction consistent; apply the pronoun alternatives above only to the permitted frames. Inventory all installed packs for this pattern, retain existing models and article choices, and add runtime/direct-source negative cases plus actual grading checks that reject the excluded construction.

Write general explanations so they can stand alone when no authored diagnostic matches a typed answer. Add a specific diagnostic for a predictable learner error that merits a distinct correction, and verify it against that actual answer. Inspect the rendered feedback for both cases: a general explanation should appear once, and generic text should not be repeated or presented as if it diagnosed the learner's particular mistake.

### Prompt style across packs

Use the same compact question style in every pack, including optional practice: lead with one direct action, then give only the reference cue and supporting Finnish forms or meanings needed to answer. Keep each prompt at 40 words or fewer. A scene belongs in the prompt only when it changes the grammatical decision; remove decorative locations and task wrappers. Do not repeat the English target meaning or the instruction in a second `Target:` clause, append `Write the complete Finnish sentence: ____`, or expose authoring notes such as “The identity-sentence frame is supplied.” For a full-sentence text answer, say “Write … in Finnish”; for a form-recall item, show the short Finnish frame. Keep distinct reference, number, person, polarity, and bounded-location cues visible before the answer. The sentence translation and supplied-form rules below still apply. If a future target genuinely needs more than 40 words, revise the content contract and validation together instead of silently exempting one pack.

English `you` does not distinguish singular, plural, or polite address. Whenever a learner must produce a Finnish sentence from an English second-person meaning, visibly supply the intended form: show `sinä` or state that one person is addressed, show `te` or state that more than one person is addressed, and state explicitly when `te` addresses one person politely. Do not rely on hidden tags, a test title, or the configured answer to resolve the meaning after submission.

When material demonstrates how a verb is used, prefer a short, complete, level-appropriate sentence over a fragment or bare conjugated form. An isolated form remains appropriate when forming that morphology is explicitly the target. Write learner-facing instructions and explanations in direct, natural English rather than exposing internal authoring shorthand such as “new decision” or “non-target operation”. If a prompt or explanation calls a word, ending, stem, or context “supplied”, that information must be visibly present in the prompt.

Whenever a prompt transforms one Finnish form into another, label both forms with their English meanings. Put the source meaning beside the source form and the target meaning beside the answer or supplied target form; do not attach a target meaning to the dictionary form. Explicitly supply every ending, stem frame, agreement choice, or other construction step that is not the assessed target. For example, a KPT-only question may ask `silta (“bridge”) → ____ (“of the bridge”)` only when the genitive `-n` is also visibly supplied, while a genitive-focused question may assess that ending directly.

Focused tests and Reviews remain immediately accessible in separate learning-map sections without repeated classification badges on every card. Focused tests reference only their topic-specific preparation lessons; prerequisite skills remain visible but their earlier lessons are not repeated. Lessons are prominent but optional. Reveals are recorded as skipped. Corrected work becomes mastered only through a different eligible parallel exercise in later review.

## 4. Technical validation

Runtime and standalone validation must also reject authored grammar sections containing an obvious duplicate list of declared vocabulary, independent of the section heading. Keep contextual sentence translations and grammatical transformations valid; add negative and positive regression cases for both boundaries.

Assemble and validate every registered pack directly from its pack-owned JSON files, run automated tests, format changed files, and build the production app. Runtime and standalone validation must reject known vocabulary used without classification in worked examples, supplied vocabulary whose Finnish form and English meaning are not visible in teaching, and repeated optional-practice labels. A pack is not complete when source-structure checks, universal schema checks, pack-grouped topic-specific guards, cross-pack ID checks, direct deployment checks, or the production build fail.

## 5. Final Finnish-teaching pedagogy assessment

Audit the finished pack rather than only its metadata:

- verify Finnish prompts, answers, translations, and formation explanations;
- identify common natural accepted alternatives and remove ambiguous grading;
- check English translation models, context-supported alternatives, and visible reference cues without exposing internal reference labels in the translation;
- verify distractors are plausible, diagnostic, and unambiguously wrong;
- ensure explanations define terminology and expose every non-obvious construction step;
- submit a plausible typed error and an unrecognized error to confirm that specific diagnostics and general fallback feedback display accurately without duplication;
- verify focused exercises contain no hidden grammar or lexical recall burden;
- inventory vocabulary from the rendered lesson body and exercises rather than metadata alone, and verify that every learner-relevant item is correctly classified as new, used again through a declared prerequisite, or visibly supplied;
- audit every rendered lesson part against the section responsibilities, verify that the dedicated vocabulary area is the sole standalone lexical list, and justify contextual glosses, grammatical form tables, and any purposeful repetition;
- check recognition-to-production progression and cumulative cognitive load;
- distinguish purposeful retrieval from repetitive filler by comparing context, person, polarity, response format, vocabulary combination, and production demand;
- confirm every important point has sufficient Focused evidence and Reviews introduce nothing new;
- compare parallel exercises for same-skill, different-surface, comparable-difficulty mastery evidence;
- state limitations such as missing listening, speaking, pronunciation, dialect, or communicative assessment.

Record the final disposition. An unresolved high-impact finding requires revision and another assessment pass.

## Saved assessment record

Store each assessment at `specs/content-assessments/<pack-id>.md`. Include topic and level, sources, coverage decision, proposed and final counts, both assessment dispositions, findings and resolutions, limitations, technical validation evidence, and the final approval decision.

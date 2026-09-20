# G001 requirements

## Functional requirements

- **REQ-G001-001:** The system shall display every bundled topic pack with its title, learner-facing level range, objectives, and completion summary. Every rendered range shall be introduced by the visible label `Level:`.
- **REQ-G001-002:** The system shall display every ordinary test in its authored order and make every test immediately accessible.
- **REQ-G001-003:** Each grammatical-topic pack shall contain a non-empty authored scored set of no more than 1,000 exercises divided into named tests in authored order. Its exact total shall follow the topic's pedagogical coverage needs rather than a fixed minimum or common target.
- **REQ-G001-004:** The first grammar-foundation pack family shall cover Finnish vowel harmony, KPT consonant gradation, and the nominative T-plural as level `0 - A1.3` written grammar foundations.
- **REQ-G001-005:** The system shall support multiple-choice, fill-in-the-blank, English-to-Finnish translation, Finnish-to-English translation, and word-order exercises.
- **REQ-G001-006:** The system shall present one exercise at a time and show progress within the active session.
- **REQ-G001-007:** The system shall grade an answer immediately after the learner submits it.
- **REQ-G001-008:** The system shall lock the submitted answer and display whether it was correct, the correct answer, and an English explanation before continuing. After submission or answer reveal, the forward action shall replace **Check answer** and **Show answer** in their existing action-group position before the feedback and explanation, so the learner does not need to scroll past the explanation to continue.
- **REQ-G001-009:** The system shall allow an unfinished ordinary test to be resumed at its saved position.
- **REQ-G001-010:** The system shall allow any ordinary test to be attempted repeatedly without overwriting earlier completed attempts.
- **REQ-G001-011:** The system shall offer a practice-mistakes session containing exercises the learner has answered incorrectly.
- **REQ-G001-012:** A mistake shall remain available for practice until the learner later answers that exercise correctly.

## Grading requirements

- **REQ-G001-013:** Typed-answer grading shall ignore letter case, leading and trailing whitespace, repeated internal whitespace, and terminal `.`, `!`, or `?` punctuation.
- **REQ-G001-014:** Typed-answer grading shall preserve distinctions between Finnish characters including `a`/`ä` and `o`/`ö`.
- **REQ-G001-015:** An exercise shall be considered correct when its normalized answer matches any configured accepted answer.
- **REQ-G001-016:** Choice and word-order exercises shall be graded against their configured correct option or accepted sequence.

## Data requirements

- **REQ-G001-017:** The system shall store completed attempts, submitted answers, mistake status, and unfinished-session state in native IndexedDB.
- **REQ-G001-018:** Bundled exercise content shall remain separate from mutable learner data.
- **REQ-G001-019:** Stored records shall include schema version, content-pack version, stable exercise IDs, and timestamps needed for migration and progress statistics.
- **REQ-G001-020:** The system shall export learner data as a versioned JSON backup without exporting executable content.
- **REQ-G001-021:** The system shall validate a selected backup before importing it and shall not replace existing data when validation fails.
- **REQ-G001-022:** The system shall ask for confirmation before clearing one test's history, one topic's history, or all learner history.
- **REQ-G001-023:** Clearing learner history shall not remove bundled exercises.

## Progress-statistics requirements

- **REQ-G001-024:** Stats shall display the latest, best, and average percentage for each attempted test.
- **REQ-G001-025:** Stats shall display completed-attempt and unresolved-mistake counts by test and topic.
- **REQ-G001-026:** A completed session shall display its score, correct count, incorrect count, and links to retry the test or practise mistakes.

## Quality requirements

- **REQ-G001-027:** The core study and progress-statistics experience shall function without a backend, account, cloud service, or runtime AI call.
- **REQ-G001-028:** Interactive controls shall be keyboard operable and expose visible focus states and accessible names.
- **REQ-G001-029:** The interface shall remain usable at viewport widths from 320 pixels upward.
- **REQ-G001-030:** If content or IndexedDB initialization fails, the system shall show a recoverable error message rather than silently discarding learner data.
- **REQ-G001-031:** Every exercise that asks the learner to understand or produce a sentence shall display the complete English meaning and the sentence's basic word-order pattern after submission.
- **REQ-G001-032:** Sentence feedback shall identify each Finnish part, its English meaning, its grammatical job in that sentence, and how the displayed form is built from its base form.
- **REQ-G001-033:** A formation explanation shall name every relevant ending, vowel-harmony choice, KPT change, agreement change, or fixed uninflected form needed to derive the displayed answer.
- **REQ-G001-034:** Sentence feedback shall define grammatical terms in plain English and shall not depend on prerequisite knowledge that is not explained in the same feedback.
- **REQ-G001-035:** Before submitting an answer, the learner shall be able to reveal the answer with a visible, native keyboard-operable **Show answer** button without first entering or choosing a response. Scored study and optional lesson practice shall not expose a shortcut badge, shortcut metadata, or an `Alt+A` answer-reveal binding.
- **REQ-G001-036:** Revealing an answer shall lock the exercise and display the same correct answer and explanation that follow a submitted response.
- **REQ-G001-037:** A revealed answer shall be stored and displayed as skipped, shall count as zero correct when calculating the percentage over all exercises, and shall not be included in the incorrect count.
- **REQ-G001-038:** Skipping an exercise shall neither create a new unresolved mistake nor resolve an existing unresolved mistake.
- **REQ-G001-039:** Completed-session feedback shall distinguish correct, incorrect, and skipped exercise counts.
- **REQ-G001-040:** Every ordinary test shall display a **Learn first** action separately from its **Start test**, **Resume**, or **Try again** action.
- **REQ-G001-041:** Selecting the ordinary test action shall open the test directly, and lesson completion shall never lock or otherwise gate a test.
- **REQ-G001-042:** The bundled content pack shall define versioned reusable lessons and shall associate each test with an ordered list of lesson IDs without duplicating a lesson on the same preparation page.
- **REQ-G001-043:** Each lesson shall teach from first principles with a title, purpose, learning objectives, plain-English sections, worked Finnish examples with English meanings and construction notes, and common mistakes to avoid.
- **REQ-G001-044:** Each lesson shall provide between two and five optional unscored practice exercises that are separate from the pack's scored test exercises.
- **REQ-G001-045:** Lesson practice shall use the supported test interaction patterns, immediate grading, correct-answer feedback, English explanation, and answer reveal without requiring a response. After grading or answer reveal, its forward action shall replace **Check answer** and **Show answer** in their existing action-group position before the feedback and explanation.
- **REQ-G001-046:** Lesson-practice responses and reveals shall be temporary and shall not create or change test attempts, percentages, progress statistics, unfinished test sessions, or unresolved mistakes.
- **REQ-G001-047:** The learner shall be able to finish a lesson without completing its optional practice, and **Finish lesson** shall record that lesson as completed.
- **REQ-G001-048:** Lesson completion shall be stored in IndexedDB with the stable lesson ID, lesson version, and completion timestamp and shall be included in learner backup and restore.
- **REQ-G001-049:** A completed lesson shall remain available for rereading and optional practice and shall be visibly marked wherever a review test reuses it.
- **REQ-G001-050:** Every test shall reference at least one valid lesson, and the app shall show a recoverable error for malformed lesson content or references.
- **REQ-G001-051:** Clearing topic or all learner history shall remove lesson completions; clearing one test shall retain completions because lessons can be shared by multiple tests.
- **REQ-G001-052:** Lesson reading and practice controls shall be keyboard operable and usable from a 320-pixel viewport upward.
- **REQ-G001-053:** Every lesson and ordinary test shall declare and visibly display one of two learning stages: **Focused** or **Review**.
- **REQ-G001-054:** A focused lesson or test shall introduce and assess one target grammatical skill; any supporting grammar shall be limited to declared previously taught prerequisites and shall not require an additional new decision.
- **REQ-G001-055:** A focused test shall reference only preparation lessons whose target skill matches that test's target skill; earlier supporting skills shall remain declared prerequisites without adding their lessons to that test's **Learn first** list.
- **REQ-G001-056:** Review material is the only material that may combine multiple target skills, and it may combine a skill only after that skill has been introduced by an earlier Focused lesson and covered by the Focused test sequence.
- **REQ-G001-057:** Each lesson shall declare the Finnish vocabulary it introduces with a plain-English meaning.
- **REQ-G001-058:** Every scored or lesson-practice exercise shall declare its required grammatical skills, and those skills shall be contained in the targets and prerequisites of its containing test or lesson.
- **REQ-G001-059:** Every scored word shall be introduced by the current focused lesson or by the transitive lesson chain for a declared prerequisite skill; an unfamiliar contextual word may be supplied with an English meaning but shall not itself determine whether the answer is correct.
- **REQ-G001-060:** Focused exercises shall not use irregular stems, undeclared inflection, or unrelated spelling transformations unless the complete non-target form is supplied directly in the prompt.
- **REQ-G001-061:** When the installed content-pack version differs from the version associated with local learner data, the system shall clear incompatible attempts, sessions, mistakes, and lesson completions once and store the installed version before study continues.
- **REQ-G001-062:** Every grammar-foundation successor pack shall store the learner-facing level range `0 - A1.3` and shall not present its results as proof of overall CEFR proficiency.
- **REQ-G001-063:** Focused production exercises shall supply the Finnish base word and its English meaning whenever recalling that word is not the assessed target.
- **REQ-G001-064:** A multiple-choice exercise shall define an explanation for every authored option, and feedback shall display the explanation associated with the learner's selected option.
- **REQ-G001-065:** Every scored exercise shall declare a target skill, a misconception category for an incorrect response, and a stable parallel-exercise ID when delayed mastery is supported.
- **REQ-G001-066:** The system shall classify submitted incorrect answers using authored exact-answer misconceptions before falling back to the exercise's general misconception category.
- **REQ-G001-067:** Answering an unresolved exercise correctly shall mark that exercise corrected and shall not by itself mark the associated skill as mastered.
- **REQ-G001-068:** A corrected exercise shall become mastered only after the learner correctly answers its different, pre-authored parallel exercise in an eligible later review session.
- **REQ-G001-069:** The system shall offer fixed authored review sessions after a correction becomes eligible, initially after one day and subsequently after three and seven days when mastery has not been demonstrated.
- **REQ-G001-070:** A due review shall be displayed prominently on the topic catalog but shall remain optional and shall never lock lessons, tests, Stats, or mistake practice.
- **REQ-G001-071:** Review sessions shall be unscored, shall preserve first-attempt test results, and shall store independent, skipped, corrected, and mastered outcomes separately.
- **REQ-G001-072:** Skipping a parallel exercise in review shall not grant mastery and shall leave the review available.
- **REQ-G001-073:** The system shall persist correction, review eligibility, review attempts, and mastery records in native IndexedDB and include them in validated JSON backup and restore.
- **REQ-G001-074:** Stats shall distinguish first-attempt accuracy, latest, best, average, independently correct, skipped, corrected, and mastered counts.
- **REQ-G001-075 (withdrawn 2026-08-26):** Skill and misconception aggregation was removed from Reports at the learner's request. Authored skill and misconception metadata remains available to teaching, validation, feedback, correction, and review workflows.
- **REQ-G001-076:** The KPT teaching sequence shall separately introduce double consonants, common single-consonant changes, special `k` changes, consonant clusters, and mixed recognition before focused noun, verb, or plural production.
- **REQ-G001-077:** Each difficult KPT lesson shall contain four or five optional unscored practice exercises, at least two worked contrasts, and no more than ten newly introduced scored vocabulary items.
- **REQ-G001-078:** When a materially revised pack is installed, learner data from an incompatible earlier content version shall be cleared once and the installed version shall be stored before study continues.
- **REQ-G001-079:** A focused lesson shall introduce no more than ten scored vocabulary items and shall reuse its core words across response formats before adding further lexical load.
- **REQ-G001-080:** Each grammatical-topic pack shall declare a non-empty, duplicate-free list of the important grammatical skills that its Focused tests are responsible for covering.
- **REQ-G001-081:** Every ordinary test shall use its **Focused** or **Review** stage as its only learning-group classification and shall not declare a separate Core or Extended set.
- **REQ-G001-082:** All Focused tests shall appear before the first Review in authored order, and neither group shall lock or hide the other.
- **REQ-G001-083:** The scored exercises in the Focused-test sequence shall collectively require every important grammatical skill declared by the pack.
- **REQ-G001-084:** Reviews shall reinforce, mix, or deepen skills already covered by the Focused sequence and shall not introduce a new required grammatical skill.
- **REQ-G001-085:** Each topic page shall present **Focused tests** and **Reviews** as visibly separate sections and shall not repeat either classification as a badge on every test card.
- **REQ-G001-086:** The bundled content directory shall contain a versioned catalog that lists every installed topic-pack ID and same-named folder in authored order; each folder shall expose a manifest with ordered lesson and learning-test references.
- **REQ-G001-087:** Application initialization shall validate the catalog and manifests, load every referenced lesson and learning test, assemble each listed pack in memory, require catalog, folder, manifest, and fragment IDs to match, and reject duplicate pack, lesson, or scored-exercise IDs across the installed collection.
- **REQ-G001-088:** The catalog, topic, lesson, and study routes shall identify the owning topic and test where applicable, display every installed topic pack, and keep every lesson and test directly accessible through its topic page.
- **REQ-G001-089:** Mistake practice, scheduled review, Stats, test history, and topic clearing shall be selectable and isolated by topic pack.
- **REQ-G001-090:** Learner data shall store installed content versions by topic-pack ID rather than using one global content-pack version.
- **REQ-G001-091:** Installing a new topic pack shall preserve all compatible existing progress; changing one installed pack's version shall clear only records belonging to that pack and shall preserve unrelated topic progress.
- **REQ-G001-092 (superseded by `REQ-G001-121`):** Backup validation originally accepted the current per-pack version map, migrated a compatible legacy single-pack version, and rejected unknown topic, lesson, exercise, correction, session, or attempt references without replacing existing data. The current contract rejects the legacy format.
- **REQ-G001-093:** Test and lesson IDs shall be unique within their pack, and lesson and scored-exercise IDs shall be globally unique across all installed packs.
- **REQ-G001-094:** The generic content validator shall validate every catalog entry and every pack, then apply clearly separated topic-specific checks only to the pack they target.
- **REQ-G001-095:** The content-validation workflow shall assemble and validate every registered pack directly from its same-named, pack-owned JSON folder; the client build shall deploy that content tree unchanged without a generated runtime copy.
- **REQ-G001-096:** A reusable `finnish-grammar-content-creator` skill shall guide future topic authoring by reading the repository contract, creating a source-grounded coverage map, selecting 200–1,000 questions from pedagogical need, producing separate Focused tests for individual topics, and producing the established lesson, diagnostic, explanation, mixed Review, and mastery structure.
- **REQ-G001-097:** Before bulk question authoring, the content workflow shall perform and record a Finnish-teaching pedagogy assessment of topic boundaries, prerequisite assumptions, cognitive focus, vocabulary load, recognition-to-production progression, likely misconceptions, Focused coverage, Review scope, and proposed question count.
- **REQ-G001-098:** After authoring, the content workflow shall perform and record a second Finnish-teaching pedagogy assessment of Finnish correctness, natural accepted alternatives, distractor quality, explanation clarity, sentence construction notes, lexical control, progression, purposeful repetition, transfer, and delayed-mastery pair quality.
- **REQ-G001-099:** A pack shall not receive final authoring approval when either pedagogy assessment identifies an unresolved high-impact gap; the assessment record shall state approval, approval with explicit limitations, or revision required.
- **REQ-G001-100:** Content research and authoring may use verified sources during development, but the shipped application shall remain static and shall make no runtime AI, network research, or content-generation call.
- **REQ-G001-101:** A focused preparation route with one lesson shall present that lesson in a centered reading hierarchy without redundant lesson navigation or aggregate progress. A multi-lesson review shall provide a persistent lesson navigator below the application header on wide viewports and a compact labelled lesson selector before the reader at 800 pixels and below.
- **REQ-G001-102:** Each topic and each lesson shall provide one visibly labelled private note field with an explicit save action; saving an empty field shall explicitly remove the saved note.
- **REQ-G001-103:** Learner notes shall be plain text of at most 1,000 characters and shall be stored in native IndexedDB as at most one timestamped record for each topic scope or lesson scope without a backend, account, or network request.
- **REQ-G001-104:** A failed note save or removal shall leave the learner's current draft visible and shall show a recoverable error message.
- **REQ-G001-105:** Learner notes shall be included in versioned JSON backup and restore. Restore shall atomically reject malformed notes, over-limit text, duplicate note scopes, unknown topics, or lessons that do not belong to the recorded topic.
- **REQ-G001-106:** Clearing one test shall preserve learner notes; clearing one topic shall remove its topic and lesson notes; clearing all learner history shall remove every note. Compatible pack updates shall preserve notes whose topic and optional lesson still exist and discard only notes whose owner is no longer installed.
- **REQ-G001-107:** Whenever an exercise prompt shows one Finnish form changing into another, it shall label both the source form and the target form with their English meanings. Every ending, stem frame, or other transformation that is not the assessed target shall be supplied explicitly rather than left for the learner to infer.

## Acceptance criteria

- Given a fresh browser profile, when the app loads, then all installed topic packs are visible with no login, and selecting the first pack reveals all authored tests in order.
- Given a typed response differing only in allowed normalization, when it is submitted, then it is marked correct.
- Given a response that substitutes `a` for `ä`, when it is submitted, then it is marked incorrect unless explicitly listed as an accepted answer.
- Given an incorrect response, when feedback appears, then the correct answer and English explanation are visible immediately.
- Given a saved unfinished test, when the learner returns, then the test can resume without duplicating submitted answers.
- Given multiple attempts, when Stats opens, then latest, best, and average values match the stored attempts.
- Given an unresolved mistake, when it is answered correctly in later practice, then it no longer appears as unresolved.
- Given an invalid backup, when import is attempted, then existing records remain unchanged and the learner sees an error.
- Given confirmed topic-history clearing, when clearing completes, then that topic's learner records are removed while its bundled tests remain available.
- Given a sentence exercise, when feedback appears, then the learner can see the full translation, the sentence pattern, and a part-by-part explanation covering meaning, role, base form, and formation without needing prior grammar knowledge.
- Given a Finnish sentence construction or completion exercise, when the prompt appears, then the complete intended English meaning is visible before the learner responds; Finnish-to-English translation exercises continue to assess that meaning instead of revealing it.
- Given an unanswered exercise, when the learner activates **Show answer**, then the correct answer and explanation appear and the exercise is recorded as skipped; pressing `Alt+A` shall not reveal the answer or change learner progress.
- Given an ordinary exercise that is skipped, when learner progress is saved, then the exercise is not added to mistake practice.
- Given an unresolved mistake that is skipped during mistake practice, when learner progress is saved, then the mistake remains unresolved.
- Given a completed session containing skipped exercises, when results appear, then correct, incorrect, and skipped counts are shown separately and the percentage uses the full exercise count.
- Given any test card, when it is displayed, then separate **Learn first** and direct test actions are available and neither is locked.
- Given a focused test with declared prerequisite skills, when **Learn first** opens, then only preparation lessons targeting that test's skill appear and earlier prerequisite lessons are not repeated.
- Given a lesson, when it opens, then first-principles teaching, worked examples, common mistakes, and two to five separate practice exercises are available.
- Given an optional practice response or answer reveal, when feedback appears, then no learner score, attempt, test session, progress statistic, or mistake status changes.
- Given unfinished optional practice, when **Finish lesson** is selected, then the lesson is stored as completed and remains available to reread.
- Given a lesson reused by review tests, when it is completed from one route, then every referencing review test displays that lesson as completed.
- Given a lesson completion, when learner data is exported and restored, then the lesson ID, version, and completion timestamp are preserved.
- Given a topic or all-history clear, when it completes, then lesson completions are removed; given a single-test clear, they are retained.
- Given a test or lesson card, when it is displayed, then its learning stage, target skills, and prerequisite skills are understandable before the learner starts.
- Given a focused exercise, when its metadata is validated, then it declares exactly one target skill and no required skill outside its declared prerequisites.
- Given an exercise containing Finnish vocabulary, when the content pack is validated, then the vocabulary is declared by its focused lesson, by the transitive lesson chain for a declared prerequisite skill, or supplied as translated non-graded context.
- Given a review test, when it is displayed, then the learner is explicitly told that previously introduced patterns will be combined; given any focused test, then it declares exactly one target and does not display combination guidance.
- Given learner data associated with an older content-pack version, when the revised pack first loads, then incompatible progress is cleared once and subsequent loads of the same version preserve new progress.
- Given a focused grammar-production question, when vocabulary is not the target, then the Finnish base word and its English meaning are visible in the prompt.
- Given an incorrect multiple-choice answer, when feedback appears, then the learner sees why the selected option is wrong as well as the correct construction.
- Given an exact authored typed misconception, when the answer is submitted, then its specific diagnostic explanation and category are stored; otherwise the general category is stored.
- Given an unresolved exercise that is later answered correctly, when progress is displayed, then it is marked corrected but not mastered.
- Given a corrected exercise whose review is due, when its different parallel exercise is answered correctly in review, then the original is marked mastered.
- Given a due review, when the topic catalog is displayed, then a prominent review action is available and every ordinary test remains directly accessible.
- Given a review answer is revealed, when progress is stored, then no mastery is granted and the review remains available.
- Given completed work, when Stats opens, then first-attempt, independent, skipped, corrected, and mastered test summaries reflect stored learner records.
- Given a focused lesson, when its content is validated, then it introduces at most ten scored Finnish words and its associated test supplies English meanings where vocabulary is not the target.
- Given a valid grammatical-topic pack, when its content is validated, then it contains scored exercises, contains no more than 1,000, and is supported by a recorded pedagogical count rationale rather than a universal minimum.
- Given a declared important grammatical skill, when the pack is validated, then at least one Focused scored exercise requires that skill.
- Given a test after the first Review, when the pack is validated, then that test is also a Review.
- Given a topic learning map, when tests are displayed, then they appear under separate **Focused tests** and **Reviews** headings without per-card stage or set badges, and every test remains directly accessible.
- Given two cataloged topic packs, when the app loads, then both appear in catalog order and their tests use topic-aware lesson and study links.
- Given progress in multiple packs, when one pack version changes, then only that pack's attempts, sessions, mistakes, corrections, mastery, and lesson completions are cleared.
- Given a new pack added to the catalog, when the app initializes, then existing progress is preserved and the new pack version is recorded.
- Given mistake or review records in multiple packs, when one topic action is opened, then only that topic's exercises appear.
- Given a legacy single-pack backup, when restore is attempted, then the current contract rejects it without replacing existing learner data under `REQ-G001-121`.
- Given a future topic and level, when the content-creator skill is used, then a saved pre-authoring pedagogy assessment approves the blueprint before bulk exercises are written.
- Given a completed future pack, when final validation runs, then a saved final pedagogy assessment records its disposition and blocks approval for unresolved high-impact findings.
- Given a focused test with one preparation lesson, when **Learn first** opens, then the test title is the page heading and the lesson reader is centered without a one-item navigator or aggregate progress bar.
- Given a review with multiple preparation lessons, when **Learn first** opens at a wide viewport, then the lesson navigator remains visible below the sticky application header; at 800 pixels and below, then a labelled selector appears immediately before the reader instead of the complete navigation list.
- Given a topic or lesson, when the learner writes and saves a private note, then reopening the same scope in the same browser shows that note without any network dependency.
- Given a note draft whose save fails, when the error is reported, then the draft remains visible and can be retried.
- Given a backup containing valid notes, when it is restored, then every note returns to its topic or lesson; given an invalid, duplicate, over-limit, or unknown note reference, then restore fails without replacing existing learner data.
- Given saved notes, when one test is cleared, then all notes remain; when one topic is cleared, then only notes belonging to that topic are removed; when all learner history is cleared, then no notes remain.
- Given a compatible topic-pack update, when a noted topic or lesson still exists, then its note remains available; when its owner is removed from the installed catalog, then the orphaned note is discarded.
- Given an exercise that transforms one Finnish form into another, when the question is displayed, then the learner sees the English meaning of both forms and every non-target ending or stem frame needed to produce the answer.

## Single foundations review

- **REQ-G001-108:** The vowel-harmony/KPT/T-plural pack shall retain its thirteen Focused tests followed by exactly one ordinary Review named **Foundations review**, with stable test ID `foundations-review`. It shall contain 33 scored exercises covering all thirteen declared important skills with two or three primary-target exercises per skill. The retired `guided-review` test shall not remain in the catalog or its learning-map actions.
- **REQ-G001-109:** The cumulative review shall interleave previously taught skills in a fixed authored order, declare only the skills actually needed by each exercise, avoid duplicate question-and-answer tasks, and retain same-skill mutual mastery pairs with different surface answers and comparable response demands. Its optional preparation shall reference the thirteen existing lessons once each without copying or changing their teaching content.
- **REQ-G001-110:** Installing pack version `6.0.0` shall use the existing per-pack version reset under `REQ-G001-061` and `REQ-G001-078`, without migrating the former review attempts or sessions. The learner explicitly approved losing this pack's progress on 2026-08-31. Other packs remain untouched and still-owned notes retain the existing policy under `REQ-G001-106`.

Acceptance: the topic shows fourteen tests, with one 33-question review; its single preparation route exposes thirteen lessons; the complete pack retains 200 scored exercises and 44 unscored practice items; every review skill was taught and assessed earlier; save/resume, scoring, progress statistics, and delayed mastery continue through the existing workflows.

## Complete sentence-construction prompts

- **REQ-G001-111:** Every exercise that asks the learner to construct or complete a Finnish sentence shall display the complete intended English meaning in its prompt before submission. Finnish-to-English translation exercises are exempt because producing that English meaning is the assessed task.

Acceptance: given a Finnish sentence construction or completion exercise, when the prompt appears, then its complete intended English meaning is visible before the learner responds; given a Finnish-to-English translation exercise, the learner is still asked to supply that meaning.

## Personal pronouns and present-tense olla packs

- **REQ-G001-112:** The installed catalog shall divide personal pronouns and present-tense `olla` into the independently versioned `personal-pronouns-affirmative-olla`, `negative-olla-statements`, and `olla-questions-short-answers` topic packs, each with the stored learner-facing level range `0 - A1.3`. Together they shall preserve exactly fifteen single-target Focused tests of 24 questions, 520 scored exercises, fifteen lessons, and 60 optional practice exercises without duplicating a stable content ID.
- **REQ-G001-113:** `personal-pronouns-affirmative-olla` shall contain seven Focused tests and two Reviews with 242 scored exercises; `negative-olla-statements` shall contain three Focused tests and one Review with 100; and `olla-questions-short-answers` shall contain five Focused tests and two Reviews with 178. Review exercises from the former combined scope shall belong only to the pack that owns their target skill.
- **REQ-G001-114:** The three packs shall teach the standard Finnish personal pronouns `minä`, `sinä`, `hän`, `me`, `te`, and `he`; affirmative and negative present-tense `olla`; affirmative and negative yes/no questions; and short answers. They shall exclude spoken or informal forms from prompts, options, accepted answers, examples, and lesson guidance. Typed diagnostics may name an entered spoken form only to redirect the learner to standard Finnish.
- **REQ-G001-115:** Every Focused lesson in the three packs shall retain exactly four optional unscored practice exercises. Each pack shall use all five supported response types, maintain suitable six-person and construction coverage for its boundary, preserve complete English meanings before Finnish construction, avoid duplicate normalized tasks, and pair every scored exercise mutually with a comparable same-skill exercise that has a different surface answer. Plural and polite-singular `te` shall retain second-person plural agreement, while capital `Te` remains an optional writing convention rather than a separate grammar target.

Acceptance: given a fresh browser profile, all four installed topic packs appear without a network request; the three `olla` learning maps contain 9, 4, and 7 tests respectively; all 520 scored and 60 optional exercises remain reachable once in fixed authored order; every Review follows its pack's complete Focused sequence and contains only skills owned by that pack; spoken accepted answers, cross-boundary construction tags, duplicate tasks, invalid mastery pairs, and unjustified topology changes fail content validation.

## Vowel-harmony, KPT, and T-plural successor packs

- **REQ-G001-116:** The installed catalog shall replace the combined `vowel-harmony-kpt-tplural` topic with the independently versioned `vowel-harmony-location-endings`, `kpt-singular-forms`, and `t-plural-agreement` packs. All three shall store level `0 - A1.3`, use standard written Finnish only, and preserve every existing stable lesson, test, practice, and scored-exercise ID exactly once in the successor family.
- **REQ-G001-117:** `vowel-harmony-location-endings` shall contain four Focused tests followed by two Reviews and 110 scored exercises; `kpt-singular-forms` shall contain eight Focused tests followed by three Reviews and 260 scored exercises; and `t-plural-agreement` shall contain six Focused tests followed by two Reviews and 200 scored exercises. The family shall therefore contain 25 tests and 570 scored exercises, with the unequal totals justified by each pack's distinct decisions and transfer burden.
- **REQ-G001-118:** The successor family shall add Focused coverage for neutral-vowel harmony, inessive location sentences, strong and weak KPT grades, T-plural recognition, and KPT T-plural recognition. Every Focused test shall own one matching lesson; each pack shall use all five supported response types, reject normalized duplicate tasks, and retain mutual same-skill different-answer mastery pairs.
- **REQ-G001-119:** Existing `foundations-review` exercises shall be partitioned by their actual target skill across the successor Reviews without duplication. Its former runtime migration requirement is retired by `REQ-G001-121`; learner data referencing the retired pack is reset instead of remapped.
- **REQ-G001-120:** Successor exercises shall remain within controlled written grammar. KPT-only production shall visibly supply non-target endings and person frames; ending-focused work shall visibly supply non-target stems; Finnish sentence construction shall show its complete intended English meaning before response; and Reviews shall introduce no plural case, object rule, verb type, spoken form, or other grammar absent from their Focused sequence.

Acceptance: a fresh profile shows six installed packs, and the three successor learning maps contain 6, 11, and 8 tests with 110, 260, and 200 scored exercises. The retired combined pack and cross-topic Review are absent. Existing content IDs occur once, newly authored IDs are globally unique, all five interaction types remain usable, and a seeded 6.1.0 learner state resets completely under `REQ-G001-121`.

## Breaking learner-data compatibility policy

- **REQ-G001-121:** Superseding the compatibility clauses of `REQ-G001-092` and `REQ-G001-119`, the client shall not include legacy state aliases, fallback readers, transitional formats, or one-off progress migrations. Persisted state with an obsolete shape or a content-version entry for a pack that is no longer installed shall reset to the complete current empty state and be saved once. Backup restore shall require the complete current format and exact installed pack/version set, rejecting anything else before current learner data is replaced.

Acceptance: current-format learner state and backups continue unchanged. A seeded state containing a removed pack loses all attempts, sessions, mistakes, corrections, mastery, lesson completions, and notes and is replaced by the empty current state. A legacy single-pack backup, a backup with incomplete current fields, or a backup with a different pack/version set is rejected atomically. No legacy-specific runtime mapping remains.

## Visible vocabulary ownership

- **REQ-G001-122:** Every lesson shall separately declare and display vocabulary first introduced in that lesson, vocabulary reused through its transitive declared prerequisite chain, and unfamiliar vocabulary supplied in lesson teaching without lexical assessment. A personal pronoun that is itself the lesson's declared grammar target is not counted as vocabulary; supporting nouns, verbs, adjectives, adverbs, fixed expressions, and other lexical material remain subject to classification. Every entry shall declare whether it is a `word` or `fixed-expression`; a `word` shall contain one whitespace-free Finnish lexical word, while a multiword entry shall be permitted only for a genuine conventional or idiomatic expression learned as one semantic unit. Transparent combinations such as `Suomessa huomenna` shall be declared as independently meaningful component words rather than one vocabulary item. Reused entries shall match an earlier introduced Finnish item, English meaning, and type; categories shall be duplicate-free, and the ten-item Focused ceiling shall apply only to newly introduced scored vocabulary entries. Vocabulary classification shall not justify removing useful lexical variety or adding surface-only duplicate questions.

Acceptance: given a lesson that uses an earlier word such as `koulussa`, `Suomessa`, or `myöhässä`, when preparation is displayed, then the word and English meaning appear under **Used again** rather than being hidden or counted as new. Given `Suomessa huomenna`, the lesson declares `Suomessa — in Finland` and `huomenna — tomorrow`; given a genuine expression such as `hyvää huomenta — good morning`, the lesson may declare one `fixed-expression`. Given an unfamiliar word used only in visibly translated context or supplied Finnish word-order tokens, it appears under **Supplied in examples**, is omitted from lexical-recall exercise metadata, and does not satisfy scored-exercise vocabulary validation. Given a lesson whose grammar target is personal pronouns, those target pronouns are not required in the vocabulary categories. Given an invalid or missing type, a spaced `word`, a one-word `fixed-expression`, an item listed in more than one category, a known worked-example word omitted from every category, a supplied item whose Finnish form and English meaning are not visible in teaching, a reused meaning or type that differs from its introduction, or a reused item outside the declared prerequisite chain, content validation rejects the pack.

## Visible second-person meaning

- **REQ-G001-123:** Every sentence exercise that asks the learner to construct or complete Finnish from an English meaning containing number-neutral `you` shall visibly identify the intended second-person form before submission. A `sinä` sentence shall show `sinä` or state that one person is addressed. A plural `te` sentence shall show `te` or state that more than one person is addressed. A polite-singular `te` sentence shall state that one person is addressed politely. Hidden tags, the containing test title, and a single configured answer shall not substitute for learner-visible disambiguation. Finnish-to-English translation remains exempt because the Finnish source identifies the assessed form.

Acceptance: given an English-to-Finnish sentence prompt such as “You are at work,” “You are not here,” or “Are you ready?”, when the accepted Finnish answer requires `sinä` agreement or `te` agreement, then the prompt visibly supplies the subject or addressing meaning needed to select that form. Given an otherwise valid prompt that leaves English `you` unqualified while accepting only one Finnish person form, runtime and standalone content validation reject it.

## Demonstrative-pronoun pack family

- **REQ-G001-124:** The installed catalog shall add independently versioned `singular-demonstrative-pronouns`, `plural-demonstrative-pronouns`, `negative-demonstrative-statements`, `demonstrative-questions`, and `inessive-demonstrative-forms` packs at stored level `0 - A1.3`. The five packs shall contain 24 single-target Focused tests followed by five pack-owned Reviews, 24 matching first-principles lessons, 96 optional lesson-practice exercises, and exactly 632 scored exercises in fixed authored order.
- **REQ-G001-125:** `singular-demonstrative-pronouns` shall contain five Focused tests, one Review, and 120 scored exercises; `plural-demonstrative-pronouns` shall contain six Focused tests, one Review, and 144; `negative-demonstrative-statements` shall contain three Focused tests, one Review, and 88; `demonstrative-questions` shall contain six Focused tests, one Review, and 160; and `inessive-demonstrative-forms` shall contain four Focused tests, one Review, and 120. Every lesson shall contain exactly four optional unscored practice exercises.
- **REQ-G001-126:** The family shall teach the standard-written singular demonstratives `tämä`, `tuo`, and `se`; their plural counterparts `nämä`, `nuo`, and `ne`; independent and noun-modifying nominative use; nominative number agreement; standard-written `hän`/`he` versus `se`/`ne`; singular and plural negative `olla` statements; affirmative and negative singular and plural `olla` questions; the bounded classification questions `Mikä tämä on?` and `Mitä nämä ovat?`; and the inessive forms `tässä`, `tuossa`, `siinä`, `näissä`, `noissa`, and `niissä`, both independently and before matching nouns.
- **REQ-G001-127:** Every pack shall be self-contained. A Focused exercise shall assess only its declared demonstrative, polarity, question, or inessive decision; every supporting demonstrative, noun form, `olla` form, ending, or English meaning that is not the target shall be taught earlier in that pack or visibly supplied. Initial form-recall lessons shall visibly supply the surrounding sentence frame, while later reference and syntax lessons own those new decisions. Reviews and every Review exercise shall follow the complete Focused sequence and target and require only skills covered by that pack's Focused tests.
- **REQ-G001-128:** The family shall exclude general demonstrative declension, demonstrative partitive and object uses, genitive, elative, illative and external-location forms, general `mikä`/`mitä`/`mitkä` selection, related Finnish demonstrative adverbs and adjectives as production targets, advanced textual reference, and colloquial `se`/`ne` reference to people. Every pack shall use all five supported response types, avoid a repeated same-skill Finnish sentence within one response type even when scene wording differs, retain mutual same-skill different-answer mastery pairs, use natural English glosses and translations, keep complete English meanings visible before Finnish sentence production, and give each multiple-choice distractor diagnostic feedback for its actual error. Independent inessive tasks shall identify the bounded container or area before the response and Finnish-to-English tasks shall accept a natural `here` or `there` alternative where appropriate. Each pack shall receive separate recorded pre-authoring and final pedagogy dispositions.

- **REQ-G001-129:** Scored study, scheduled review, and mistake-practice sessions shall be completable by keyboard alone without changing their visible controls. Each newly opened exercise shall focus its first answer control. Enter shall check a valid typed or selected answer, while Enter on a word-order token shall retain the token's native add-or-remove action and Enter on the visible **Check answer** button shall check the assembled sentence. After submitted or revealed feedback appears, focus shall move to **Continue** or **See result**, and Enter shall advance once. Completed results shall focus their first action. Repeated Enter keydown events and Enter received while an operation is already running shall not duplicate submission or advancement. No other custom shortcut shall be introduced.

Acceptance: given any supported scored response type, when a learner uses only native keyboard navigation and contextual Enter actions, then the learner can answer, read feedback, advance through the session, and reach the result without focus being lost or an operation being recorded twice. **Show answer** remains a visible native button without shortcut metadata or a custom reveal binding.

- **REQ-G001-130:** Every scored Study, scheduled-review, and mistake-practice exercise that declares vocabulary shall provide a visibly labelled **Cheat mode** action. The referenced Finnish words or fixed expressions and their lesson-authored English meanings shall remain hidden by default, shall include only the current exercise's deduplicated vocabulary declarations, and shall appear in a keyboard-accessible modal reference without changing scoring, answers, attempts, mistakes, mastery, session progress, or other learner data. Closing shall return focus to the action, Escape shall close the reference, and every newly opened exercise shall start with Cheat mode closed. Exercises without vocabulary declarations shall omit the action. The reference shall remain usable without clipping or horizontal overflow at 320, 768, and 1440 pixels.

Acceptance: given any Study mode and an exercise with declared vocabulary, when the learner opens Cheat mode, then only that exercise's Finnish vocabulary and English meanings appear and learner progress is unchanged. When the learner closes it, focus returns to **Cheat mode**; when the learner advances, the next exercise starts with the reference closed. Given an exercise with no declared vocabulary, no empty Cheat mode action is shown.

- **REQ-G001-131:** Every modal dialog shall reuse the same responsive loose-sheet visual system established by destructive confirmation, including its ruled paper, typography, border, and depth, while omitting clip decoration. Each modal shall provide one compact icon-only × close button at its top-right with a purpose-specific accessible name, practical touch target, visible focus, and a precisely centered mark; textual close and cancellation buttons shall be omitted. The ×, Escape, and a pointer activation on the backdrop shall close the modal and restore focus to its initiating control. For a destructive confirmation, each of those dismissal paths shall resolve as cancellation and only the explicit consequence-labelled destructive action shall execute the operation. Activation inside the sheet but outside a control shall not dismiss it. These behaviors and the required content shall remain unclipped and free of horizontal overflow at 320, 768, and 1440 pixels.

Acceptance: given any modal, when it opens, then its compact top-right × receives focus, its mark is centered, and no clip decoration appears. When the learner activates ×, Escape, or the backdrop, then the modal closes and focus returns to its opener. Given destructive confirmation, none of those dismissal paths changes learner data; only the labelled destructive action confirms. Given a pointer activation inside the sheet, the modal remains open. Cheat mode vocabulary cards use the same Finnish-word, English-meaning, paper, border, shape, spacing, and motion treatment as lesson vocabulary cards.

Acceptance: a fresh profile shows eleven local-only topic packs. The five new learning maps contain 6, 7, 4, 7, and 5 tests respectively, with 120, 144, 88, 160, and 120 scored exercises. Every Focused target owns one matching preparation lesson, every Review appears last and introduces no new skill, all 632 scored exercises and 96 practice exercises have globally unique IDs, and direct-source validation rejects count, topology, register, scope, prompt-information, malformed-English, repeated-feedback, scene-only duplicate-task, Review-exercise target, question-frame, inessive-context, or mastery-pair violations.

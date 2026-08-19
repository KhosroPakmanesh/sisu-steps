# G001 requirements

## Functional requirements

- **REQ-G001-001:** The system shall display every bundled topic pack with its title, CEFR range, objectives, and completion summary.
- **REQ-G001-002:** The system shall display every ordinary test in its authored order and make every test immediately accessible.
- **REQ-G001-003:** Each grammatical-topic pack shall contain between 200 and 1,000 authored scored exercises divided into named tests in authored order, with the exact total chosen according to the topic's pedagogical coverage needs.
- **REQ-G001-004:** The first topic pack shall cover Finnish vowel harmony, KPT consonant gradation, and the nominative T-plural as Pre-A1 through A1.3 grammar foundations.
- **REQ-G001-005:** The system shall support multiple-choice, fill-in-the-blank, English-to-Finnish translation, Finnish-to-English translation, and word-order exercises.
- **REQ-G001-006:** The system shall present one exercise at a time and show progress within the active session.
- **REQ-G001-007:** The system shall grade an answer immediately after the learner submits it.
- **REQ-G001-008:** The system shall lock the submitted answer and display whether it was correct, the correct answer, and an English explanation before continuing.
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
- **REQ-G001-019:** Stored records shall include schema version, content-pack version, stable exercise IDs, and timestamps needed for migration and reporting.
- **REQ-G001-020:** The system shall export learner data as a versioned JSON backup without exporting executable content.
- **REQ-G001-021:** The system shall validate a selected backup before importing it and shall not replace existing data when validation fails.
- **REQ-G001-022:** The system shall ask for confirmation before clearing one test's history, one topic's history, or all learner history.
- **REQ-G001-023:** Clearing learner history shall not remove bundled exercises.

## Reporting requirements

- **REQ-G001-024:** The system shall report the latest, best, and average percentage for each attempted test.
- **REQ-G001-025:** The system shall report completed-attempt and unresolved-mistake counts by test and topic.
- **REQ-G001-026:** A completed session shall display its score, correct count, incorrect count, and links to retry the test or practise mistakes.

## Quality requirements

- **REQ-G001-027:** The core study and reporting experience shall function without a backend, account, cloud service, or runtime AI call.
- **REQ-G001-028:** Interactive controls shall be keyboard operable and expose visible focus states and accessible names.
- **REQ-G001-029:** The interface shall remain usable at viewport widths from 320 pixels upward.
- **REQ-G001-030:** If content or IndexedDB initialization fails, the system shall show a recoverable error message rather than silently discarding learner data.
- **REQ-G001-031:** Every exercise that asks the learner to understand or produce a sentence shall display the complete English meaning and the sentence's basic word-order pattern after submission.
- **REQ-G001-032:** Sentence feedback shall identify each Finnish part, its English meaning, its grammatical job in that sentence, and how the displayed form is built from its base form.
- **REQ-G001-033:** A formation explanation shall name every relevant ending, vowel-harmony choice, KPT change, agreement change, or fixed uninflected form needed to derive the displayed answer.
- **REQ-G001-034:** Sentence feedback shall define grammatical terms in plain English and shall not depend on prerequisite knowledge that is not explained in the same feedback.
- **REQ-G001-035:** Before submitting an answer, the learner shall be able to reveal the answer with a visible **Show answer** control or the `Alt+A` keyboard shortcut without first entering or choosing a response.
- **REQ-G001-036:** Revealing an answer shall lock the exercise and display the same correct answer and explanation that follow a submitted response.
- **REQ-G001-037:** A revealed answer shall be stored and reported as skipped, shall count as zero correct when calculating the percentage over all exercises, and shall not be included in the incorrect count.
- **REQ-G001-038:** Skipping an exercise shall neither create a new unresolved mistake nor resolve an existing unresolved mistake.
- **REQ-G001-039:** Completed-session feedback shall distinguish correct, incorrect, and skipped exercise counts.
- **REQ-G001-040:** Every ordinary test shall display a **Learn first** action separately from its **Start test**, **Resume**, or **Try again** action.
- **REQ-G001-041:** Selecting the ordinary test action shall open the test directly, and lesson completion shall never lock or otherwise gate a test.
- **REQ-G001-042:** The bundled content pack shall define versioned reusable lessons and shall associate each test with an ordered list of lesson IDs without duplicating a lesson on the same preparation page.
- **REQ-G001-043:** Each lesson shall teach from first principles with a title, purpose, learning objectives, plain-English sections, worked Finnish examples with English meanings and construction notes, and common mistakes to avoid.
- **REQ-G001-044:** Each lesson shall provide between two and five optional unscored practice exercises that are separate from the pack's scored test exercises.
- **REQ-G001-045:** Lesson practice shall use the supported test interaction patterns, immediate grading, correct-answer feedback, English explanation, and answer reveal without requiring a response.
- **REQ-G001-046:** Lesson-practice responses and reveals shall be temporary and shall not create or change test attempts, percentages, reports, unfinished test sessions, or unresolved mistakes.
- **REQ-G001-047:** The learner shall be able to finish a lesson without completing its optional practice, and **Finish lesson** shall record that lesson as completed.
- **REQ-G001-048:** Lesson completion shall be stored in IndexedDB with the stable lesson ID, lesson version, and completion timestamp and shall be included in learner backup and restore.
- **REQ-G001-049:** A completed lesson shall be visibly marked for every test that reuses it and shall remain available for rereading and optional practice.
- **REQ-G001-050:** Every test shall reference at least one valid lesson, and the app shall show a recoverable error for malformed lesson content or references.
- **REQ-G001-051:** Clearing topic or all learner history shall remove lesson completions; clearing one test shall retain completions because lessons can be shared by multiple tests.
- **REQ-G001-052:** Lesson reading and practice controls shall be keyboard operable and usable from a 320-pixel viewport upward.
- **REQ-G001-053:** Every lesson and ordinary test shall declare and visibly display one of three learning stages: **Focused**, **Guided combination**, or **Review**.
- **REQ-G001-054:** A focused lesson or test shall introduce and assess one target grammatical skill; any supporting grammar shall be limited to declared previously taught prerequisites and shall not require an additional new decision.
- **REQ-G001-055:** A guided-combination lesson or test shall declare every target and prerequisite skill that the learner must combine, and its interface shall state that the material combines learned patterns.
- **REQ-G001-056:** A review test may combine multiple skills only when each skill is introduced by one of its referenced lessons.
- **REQ-G001-057:** Each lesson shall declare the Finnish vocabulary it introduces with a plain-English meaning.
- **REQ-G001-058:** Every scored or lesson-practice exercise shall declare its required grammatical skills, and those skills shall be contained in the targets and prerequisites of its containing test or lesson.
- **REQ-G001-059:** Every scored word shall be introduced by the current lesson set or a declared prerequisite lesson; an unfamiliar contextual word may be supplied with an English meaning but shall not itself determine whether the answer is correct.
- **REQ-G001-060:** Focused exercises shall not use irregular stems, undeclared inflection, or unrelated spelling transformations unless the complete non-target form is supplied directly in the prompt.
- **REQ-G001-061:** When the installed content-pack version differs from the version associated with local learner data, the system shall clear incompatible attempts, sessions, mistakes, and lesson completions once and store the installed version before study continues.
- **REQ-G001-062:** The first topic pack shall describe its level as Pre-A1–A1.3 Finnish grammar foundations and shall not present its results as proof of overall CEFR proficiency.
- **REQ-G001-063:** Focused production exercises shall supply the Finnish base word and its English meaning whenever recalling that word is not the assessed target.
- **REQ-G001-064:** A multiple-choice exercise shall define an explanation for every authored option, and feedback shall display the explanation associated with the learner's selected option.
- **REQ-G001-065:** Every scored exercise shall declare a target skill, a misconception category for an incorrect response, and a stable parallel-exercise ID when delayed mastery is supported.
- **REQ-G001-066:** The system shall classify submitted incorrect answers using authored exact-answer misconceptions before falling back to the exercise's general misconception category.
- **REQ-G001-067:** Answering an unresolved exercise correctly shall mark that exercise corrected and shall not by itself mark the associated skill as mastered.
- **REQ-G001-068:** A corrected exercise shall become mastered only after the learner correctly answers its different, pre-authored parallel exercise in an eligible later review session.
- **REQ-G001-069:** The system shall offer fixed authored review sessions after a correction becomes eligible, initially after one day and subsequently after three and seven days when mastery has not been demonstrated.
- **REQ-G001-070:** A due review shall be displayed prominently on the dashboard but shall remain optional and shall never lock lessons, tests, reports, or mistake practice.
- **REQ-G001-071:** Review sessions shall be unscored, shall preserve first-attempt test results, and shall store independent, skipped, corrected, and mastered outcomes separately.
- **REQ-G001-072:** Skipping a parallel exercise in review shall not grant mastery and shall leave the review available.
- **REQ-G001-073:** The system shall persist correction, review eligibility, review attempts, and mastery records in native IndexedDB and include them in validated JSON backup and restore.
- **REQ-G001-074:** Reports shall distinguish first-attempt accuracy, latest, best, average, independently correct, skipped, corrected, and mastered counts.
- **REQ-G001-075:** Reports shall aggregate performance by declared target skill and misconception category.
- **REQ-G001-076:** The KPT teaching sequence shall separately introduce double consonants, common single-consonant changes, special `k` changes, consonant clusters, and mixed recognition before guided noun, verb, or plural production.
- **REQ-G001-077:** Each difficult KPT lesson shall contain four or five optional unscored practice exercises, at least two worked contrasts, and no more than ten newly introduced scored vocabulary items.
- **REQ-G001-078:** When a materially revised pack is installed, learner data from an incompatible earlier content version shall be cleared once and the installed version shall be stored before study continues.
- **REQ-G001-079:** A focused lesson shall introduce no more than ten scored vocabulary items and shall reuse its core words across response formats before adding further lexical load.
- **REQ-G001-080:** Each grammatical-topic pack shall declare a non-empty, duplicate-free list of the important grammatical skills that its core tests are responsible for covering.
- **REQ-G001-081:** Every ordinary test shall declare whether it belongs to the **Core** set or the **Extended** set.
- **REQ-G001-082:** All core tests shall appear before the first extended test in authored order, and the authored boundary shall not lock or hide either set.
- **REQ-G001-083:** The scored exercises in the core-test sequence shall collectively require every important grammatical skill declared by the pack.
- **REQ-G001-084:** Extended tests shall reinforce, combine, or deepen skills already covered by the core sequence and shall not introduce a new required grammatical skill.
- **REQ-G001-085:** Each topic page shall present core and extended tests as visibly distinct groups and shall describe extended tests as optional additional depth after the core sequence.
- **REQ-G001-086:** The bundled content directory shall contain a versioned catalog that lists every installed topic-pack ID and JSON filename in authored order.
- **REQ-G001-087:** Application initialization shall validate the catalog, load every listed pack, require catalog IDs to match pack IDs, and reject duplicate pack, lesson, or scored-exercise IDs across the installed collection.
- **REQ-G001-088:** The catalog, topic, lesson, and study routes shall identify the owning topic and test where applicable, display every installed topic pack, and keep every lesson and test directly accessible through its topic page.
- **REQ-G001-089:** Mistake practice, scheduled review, reports, test history, and topic clearing shall be selectable and isolated by topic pack.
- **REQ-G001-090:** Learner data shall store installed content versions by topic-pack ID rather than using one global content-pack version.
- **REQ-G001-091:** Installing a new topic pack shall preserve all compatible existing progress; changing one installed pack's version shall clear only records belonging to that pack and shall preserve unrelated topic progress.
- **REQ-G001-092:** Backup validation shall accept the current per-pack version map, migrate a compatible legacy single-pack version, and reject unknown topic, lesson, exercise, correction, session, or attempt references without replacing existing data.
- **REQ-G001-093:** Test and lesson IDs shall be unique within their pack, and lesson and scored-exercise IDs shall be globally unique across all installed packs.
- **REQ-G001-094:** The generic content validator shall validate every catalog entry and every pack, then apply clearly separated topic-specific checks only to the pack they target.
- **REQ-G001-095:** The content-generation workflow shall run every registered deterministic pack generator before validating the complete catalog.
- **REQ-G001-096:** A reusable `finnish-grammar-content-creator` skill shall guide future topic authoring by reading the repository contract, creating a source-grounded coverage map, selecting 200–1,000 questions from pedagogical need, and producing the established lesson, core-test, extended-test, diagnostic, explanation, review, and mastery structure.
- **REQ-G001-097:** Before bulk question authoring, the content workflow shall perform and record a Finnish-teaching pedagogy assessment of topic boundaries, prerequisite assumptions, cognitive focus, vocabulary load, recognition-to-production progression, likely misconceptions, core coverage, extended scope, and proposed question count.
- **REQ-G001-098:** After authoring, the content workflow shall perform and record a second Finnish-teaching pedagogy assessment of Finnish correctness, natural accepted alternatives, distractor quality, explanation clarity, sentence construction notes, lexical control, progression, purposeful repetition, transfer, and delayed-mastery pair quality.
- **REQ-G001-099:** A pack shall not receive final authoring approval when either pedagogy assessment identifies an unresolved high-impact gap; the assessment record shall state approval, approval with explicit limitations, or revision required.
- **REQ-G001-100:** Content research and authoring may use verified sources during development, but the shipped application shall remain static and shall make no runtime AI, network research, or content-generation call.

## Acceptance criteria

- Given a fresh browser profile, when the app loads, then all installed topic packs are visible with no login, and selecting the first pack reveals all authored tests in order.
- Given a typed response differing only in allowed normalization, when it is submitted, then it is marked correct.
- Given a response that substitutes `a` for `ä`, when it is submitted, then it is marked incorrect unless explicitly listed as an accepted answer.
- Given an incorrect response, when feedback appears, then the correct answer and English explanation are visible immediately.
- Given a saved unfinished test, when the learner returns, then the test can resume without duplicating submitted answers.
- Given multiple attempts, when reports open, then latest, best, and average values match the stored attempts.
- Given an unresolved mistake, when it is answered correctly in later practice, then it no longer appears as unresolved.
- Given an invalid backup, when import is attempted, then existing records remain unchanged and the learner sees an error.
- Given confirmed topic-history clearing, when clearing completes, then that topic's learner records are removed while its bundled tests remain available.
- Given a sentence exercise, when feedback appears, then the learner can see the full translation, the sentence pattern, and a part-by-part explanation covering meaning, role, base form, and formation without needing prior grammar knowledge.
- Given an unanswered exercise, when the learner activates **Show answer** or presses `Alt+A`, then the correct answer and explanation appear and the exercise is recorded as skipped.
- Given an ordinary exercise that is skipped, when learner progress is saved, then the exercise is not added to mistake practice.
- Given an unresolved mistake that is skipped during mistake practice, when learner progress is saved, then the mistake remains unresolved.
- Given a completed session containing skipped exercises, when results appear, then correct, incorrect, and skipped counts are shown separately and the percentage uses the full exercise count.
- Given any test card, when it is displayed, then separate **Learn first** and direct test actions are available and neither is locked.
- Given a test that references overlapping concepts, when **Learn first** opens, then each referenced lesson appears once in authored order.
- Given a lesson, when it opens, then first-principles teaching, worked examples, common mistakes, and two to five separate practice exercises are available.
- Given an optional practice response or answer reveal, when feedback appears, then no learner score, attempt, test session, report, or mistake status changes.
- Given unfinished optional practice, when **Finish lesson** is selected, then the lesson is stored as completed and remains available to reread.
- Given a lesson reused by multiple tests, when it is completed from one test, then every referencing test displays that lesson as completed.
- Given a lesson completion, when learner data is exported and restored, then the lesson ID, version, and completion timestamp are preserved.
- Given a topic or all-history clear, when it completes, then lesson completions are removed; given a single-test clear, they are retained.
- Given a test or lesson card, when it is displayed, then its learning stage, target skills, and prerequisite skills are understandable before the learner starts.
- Given a focused exercise, when its metadata is validated, then it declares exactly one target skill and no required skill outside its declared prerequisites.
- Given an exercise containing Finnish vocabulary, when the content pack is validated, then the vocabulary is declared by one of the lessons referenced for that test or supplied as translated non-graded context.
- Given a guided-combination or review test, when it is displayed, then the learner is explicitly told that previously introduced patterns will be combined.
- Given learner data associated with an older content-pack version, when the revised pack first loads, then incompatible progress is cleared once and subsequent loads of the same version preserve new progress.
- Given a focused grammar-production question, when vocabulary is not the target, then the Finnish base word and its English meaning are visible in the prompt.
- Given an incorrect multiple-choice answer, when feedback appears, then the learner sees why the selected option is wrong as well as the correct construction.
- Given an exact authored typed misconception, when the answer is submitted, then its specific diagnostic explanation and category are stored; otherwise the general category is stored.
- Given an unresolved exercise that is later answered correctly, when progress is displayed, then it is marked corrected but not mastered.
- Given a corrected exercise whose review is due, when its different parallel exercise is answered correctly in review, then the original is marked mastered.
- Given a due review, when the dashboard is displayed, then a prominent review action is available and every ordinary test remains directly accessible.
- Given a review answer is revealed, when progress is stored, then no mastery is granted and the review remains available.
- Given completed work, when reports open, then first-attempt, independent, skipped, corrected, mastered, skill, and misconception summaries reflect stored learner records.
- Given a focused lesson, when its content is validated, then it introduces at most ten scored Finnish words and its associated test supplies English meanings where vocabulary is not the target.
- Given a valid grammatical-topic pack, when its content is validated, then it contains at least 200 and at most 1,000 scored exercises.
- Given a declared important grammatical skill, when the pack is validated, then at least one core scored exercise requires that skill.
- Given a test after the first extended test, when the pack is validated, then that test is also extended.
- Given an extended test, when it is displayed, then it appears under an **Extended tests** heading and remains directly accessible.
- Given two cataloged topic packs, when the app loads, then both appear in catalog order and their tests use topic-aware lesson and study links.
- Given progress in two packs, when one pack version changes, then only that pack's attempts, sessions, mistakes, corrections, mastery, and lesson completions are cleared.
- Given a new pack added to the catalog, when the app initializes, then existing progress is preserved and the new pack version is recorded.
- Given mistake or review records in two packs, when one topic action is opened, then only that topic's exercises appear.
- Given a legacy single-pack backup whose version matches the installed first pack, when it is restored, then it is migrated to the per-pack version map without losing compatible progress.
- Given a future topic and level, when the content-creator skill is used, then a saved pre-authoring pedagogy assessment approves the blueprint before bulk exercises are written.
- Given a completed future pack, when final validation runs, then a saved final pedagogy assessment records its disposition and blocks approval for unresolved high-impact findings.

# G002 technical guidance alignment validation

## Automated checks

- **VAL-G002-001:** Run `npm --prefix client run lint`; verify Angular TypeScript and templates pass recommended and accessibility rules and the 150-line function/component trigger. Covers REQ-G002-011 through REQ-G002-017 and REQ-G002-024.
- **VAL-G002-002:** Run `npm --prefix client run lint:css`; verify every design-system and feature stylesheet passes Stylelint. Covers REQ-G002-022 and REQ-G002-023.
- **VAL-G002-003:** Run `npm --prefix client run lint:modules`, `npm --prefix client run lint:dead-code`, and `npm --prefix client run lint:architecture`. Covers REQ-G002-005 through REQ-G002-017 and REQ-G002-029 through REQ-G002-030.
- **VAL-G002-004:** Run `npm --prefix client run format:check`. Covers REQ-G002-028.
- **VAL-G002-005:** Run `npm --prefix client run typecheck` and `npm --prefix client run test:typecheck`; verify production and test environments pass independently with unused-symbol checks. Covers REQ-G002-026 through REQ-G002-028.
- **VAL-G002-006:** Run `npm --prefix client run test`; verify moved unit and component coverage passes from `client/tests/unit`. Covers REQ-G002-018 through REQ-G002-020 and REQ-G002-026.
- **VAL-G002-007:** Run `npm --prefix client run content:validate`; verify the catalog, the version-4.1.0 topic pack, 200 scored exercises, and cross-pack IDs are unchanged. Covers REQ-G002-018 and REQ-G002-020.
- **VAL-G002-008:** Run `npm --prefix client run build`; verify all lazy routes compile under strict Angular template checks. Covers REQ-G002-010, REQ-G002-021, and REQ-G002-024.
- **VAL-G002-009:** Run `npm --prefix client run check` as the aggregate non-browser gate. Covers REQ-G002-031.
- **VAL-G002-010:** Run `npm --prefix client run test:e2e`; verify critical browser workflows and narrow/desktop viewports. Covers REQ-G002-019, REQ-G002-023 through REQ-G002-025, and REQ-G002-032.

## Structural checks

- **VAL-G002-011:** Confirm `client/src` contains only the entrypoint plus app, design-system, feature, and shared owners and contains no unit-test file. Covers REQ-G002-005 through REQ-G002-008 and REQ-G002-026.
- **VAL-G002-012:** Confirm route pages read as composition, services own complete mutations, policies/queries/validators remain pure, and browser APIs occur only in adapters. Covers REQ-G002-011 through REQ-G002-016.
- **VAL-G002-013:** Confirm every test path mirrors the production owner and every test file uses explicit Vitest imports. Covers REQ-G002-026.
- **VAL-G002-014:** Compare database constants, persisted models, backup models, grading logic, review intervals, public paths, and `client/public/content` hashes against the baseline. Covers REQ-G002-010 and REQ-G002-018 through REQ-G002-021.
- **VAL-G002-015:** Verify every prototype Markdown file has a disposition in `client/docs/guidance-adoption.md` and every current Markdown link resolves. Covers REQ-G002-001 through REQ-G002-004.
- **VAL-G002-016:** Confirm no empty client source/test directory, stale old import path, vague production folder, unreachable compatibility module, or exact duplicate file remains. Covers REQ-G002-016, REQ-G002-029, REQ-G002-034, and REQ-G002-035.
- **VAL-G002-021:** Confirm `.git`, `.gitignore`, shared `.vscode`, the changelog, product guidance, and product specs remain at the root; the Angular workspace and client technical guidance are under `client/`; root tasks target the client package; ignore rules cover client and future .NET/Visual Studio output; and `server/` contains only server-owned placeholder guidance with no executable backend code. Covers REQ-G002-028 and REQ-G002-035.

## Manual checks

- **VAL-G002-017:** Review dashboard, lesson preparation, optional practice, test/review/mistake runner, results, reports, and data settings at 320, 768, and 1440 pixels. Covers REQ-G002-023 and REQ-G002-024.
- **VAL-G002-018:** Navigate the primary workflows with a keyboard, including `Alt+A`, visible focus, lesson navigation, answer controls, restore input, and destructive confirmations. Covers REQ-G002-024 and REQ-G002-025.
- **VAL-G002-019:** Export, invalid-import, clear-test, clear-topic, and clear-all boundaries shall remain explicit and shall preserve or safely reject learner data as specified. Covers REQ-G002-018, REQ-G002-019, and REQ-G002-025.
- **VAL-G002-020:** Review the final baseline comparison for hidden product, persistence, content, route, accessibility, and external-boundary changes. Covers REQ-G002-018 through REQ-G002-025 and REQ-G002-034.

## Completion evidence

### Documentation ownership split (2026-08-19)

- Root guidance now contains only product and cross-repository rules; Angular/browser architecture, design-system guidance, review records, and G002 live under `client/`.
- `server/` contains four Markdown-only ownership and specification entrypoints and no executable backend code or inferred API/storage/authentication decisions.
- `npm --prefix client run check` passed the expanded repository formatter, client lint/architecture/reachability checks, production/test typechecks, content validation, production build, and 68 unit tests across 10 files.
- A structural audit found no client architecture/design-system/G002 paths remaining under root `docs/` or `specs/`, and all 38 local Markdown links resolved.
- The generated Chromium `client/debug.log` was removed, and repository ignore rules now exclude generated `*.log` files.

### Repository layout update (2026-08-19)

- `npm --prefix client run check`: passed linting, architecture and reachability checks, repository-wide formatting, production/test typechecks, content validation, production build, and 68 unit tests across 10 files from the relocated client workspace.
- `npm --prefix client run test:e2e`: all 18 Chromium scenarios completed successfully across the configured mobile, tablet, and wide projects. On Windows, the runner did not exit after the local Angular server teardown and was manually interrupted; all spawned Node processes were confirmed stopped afterward.
- Structural verification confirmed Git metadata and product guidance at the root, the complete Angular workspace and client technical guidance under `client/`, and documentation-only server guidance with no executable backend code.
- Ignore probes confirmed client dependency/build/test output, future .NET build output, Visual Studio state, and private VS Code files are excluded while shared VS Code configuration remains trackable.
- A local-link scan verified all repository Markdown targets across 29 files.

Completed 2026-08-18 in the isolated refactor copy before synchronization.

- `npm run check`: passed ESLint/template accessibility, Stylelint, module-size, reachability, architecture, format, production/test typechecks, content validation, production build, and unit tests.
- Unit tests: 8 files and 57 tests passed under Angular's Vitest builder.
- `npm run test:e2e`: 15 Playwright checks passed with Chromium 151 at 320×800, 768×1024, and 1440×900.
- Browser coverage: catalog/routes, optional lesson practice isolation, keyboard `Alt+A`, IndexedDB unfinished-session recovery after reload, responsive reports/no overflow, and non-destructive inspection of backup/clearing controls.
- Content validation: 1 cataloged pack, version 4.1.0, 14 tests, 200 scored exercises, 13 lessons, and 44 optional practice exercises.
- Baseline hashes: catalog `4212CE9E2102E89220ABBDF099AF6D49C01822F491F54CF1F5AB12B4B9CF3A04`; topic pack `D95E50F02E85EBE296049C7575F7FB96DE5DE48458BEFD702DC6E617470FB3FA`. Both content files and all four generator/validator scripts match the retained baseline exactly.
- Largest production TypeScript module: `study.page.ts`, 211 physical lines. Largest stylesheet: `lesson.page.css`, 354 physical lines. No module/function/stylesheet exception is required.
- Guidance inventory: all 55 project-owned prototype Markdown files are represented in `client/docs/guidance-adoption.md`; automated inventory reported zero missing dispositions and zero broken local Markdown links.
- Compatibility review: public route patterns, IndexedDB database/version/store/key, learner/backup shapes, content schemas, and automatic same-origin network boundary are unchanged. The shell Mistakes link was corrected to include the current topic ID.
- Toolchain used: Angular CLI 21.2.21, Angular core 21.2.20, TypeScript 5.9.3, Vitest 4.1.10, Playwright 1.62.1, angular-eslint 21.4.0, ESLint 9.39.5, Stylelint 17.14.1, and Prettier 3.9.6.
- Manual review guide: `client/docs/manual-refactor-review-guide.md`. No validation exception or deferred implementation item remains for G002.

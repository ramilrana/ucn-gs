# Current State

Canonical snapshot of where the project stands. Update in place; do not append session diaries. Last updated: 2026-10-29.

## Objective

Build the UCN (University of Camarines Norte) Graduate School Accreditation Website as a static frontend for one GS program.

Existing stack (from `package.json`): React 19, TypeScript 5.8, Vite 7, Ant Design 5, React Router 7, ESLint 9. Node >= 20; CI uses Node 22. Under the design, Ant Design is replaced by Tailwind CSS v4.

## Phase

**Implementation in progress on branch `feat/accreditation-site` (started 2026-10-29).** Task progress is in the Plan and progress section.

- Plan: `docs/superpowers/plans/2026-10-29-ucn-gs-accreditation-site.md`
  - 29 tasks in 8 phases
  - reviewer checkpoints A (after Task 12), B (after Task 25) and C (Task 28)
  - Task 29 is blocked on UCN materials

- Spec: `docs/superpowers/specs/2026-10-29-ucn-gs-accreditation-site-design.md`
- Reference inventory: `docs/reference-inventory.md`

## Approved decisions

- Workflow: Plan Mode on Opus, execution on Sonnet via `opusplan`, `effortLevel: high` (`.claude/settings.json`).
- Read-only `ucn-opus-reviewer` subagent runs sequentially at checkpoints A, B and C; see `CLAUDE.md`.
- `CURRENT_STATE.md` is the single state snapshot. The approved spec and plan are the source of truth.
- Design decisions D1–D9, approved section by section on 2026-10-29. Full text is in spec §3:
  - **D1:** the reference is used for structure only; no PUP content.
  - **D2:** Tailwind v4 replaces Ant Design.
  - **D3:** mixed hosting (local files plus Drive/YouTube).
  - **D4:** one program.
  - **D5:** published/pending items; pending is hidden in production.
  - **D6:** UCN's own server, with per-route `index.html` and `.htaccess`.
  - **D7:** refactor in place, typed TS content.
  - **D8:** no slideshow autoplay.
  - **D9:** no gold text or state indicators on white.

## Reference and content status

- **Reference:** https://sites.google.com/view/pupgs-mapsych/, inspected 2026-10-29. It is **PUP Graduate School's MA Psychology site**, used for structure only.
- **Verified UCN content:** none. Everything in `src/data/` is Research Office placeholder content.
- **UCN assets available:** `../ucn_logo.png` (full seal with wordmark, about 1 MB, outside the repo) is the only one. It is the single logo under the design.
- **Missing:** all accreditation content. The full list is in spec §13.
- **Open questions** (spec §14):
  - program name
  - area list
  - number and titles of recommendations
  - Apache or Nginx, domain and base path, HTTPS
  - download permissions
  - Filipino text

## Architecture overview (existing code, before refactor)

The repo is still a Research Office photo and video gallery:
- **Routes:** `/`, `/gallery`, `/videos`, `/about`, `*`
- **Shell:** Ant Design `Layout` in `src/app/App.tsx`
- **Content:** typed data in `src/data/`

The target architecture is in spec §6.

## Plan and progress

- Done: workflow setup; repo and reference inspection; brainstorming Q&A; design sections 1–5 approved; spec written and approved.
- Implementation plan: approved 2026-10-29.
- Tasks 1–12 complete and task-reviewed (per-task Sonnet reviewer, fix rounds where needed). Commits 7f10675..2c006d0. First-load JS 109.04 kB gzip (budget 120 kB).
- **Checkpoint A (Tasks 3–12), 2026-10-30.** Reviewer: `ucn-opus-reviewer` definition run as a general-purpose Opus agent (the project agent is not registered in this session).
  - Review 1: "Verdict: PASS WITH ISSUES". One High (ActionLink sent local file URLs through the router: double base prefix under `/gs/`), one Medium (no route error boundary for failed lazy chunks), four Lows.
  - Fixes `f8c44ab..2aa8639`: all six addressed; the soft-404-for-pending-area-files Low is accepted and documented in `docs/deployment.md`.
  - Re-review: "Verdict: PASS WITH ISSUES. Every earlier finding is addressed, and no Critical, High or Medium finding is open." Its two new Lows are fixed in `f76d38e`.
  - **Checkpoint A cleared.** Deferred Minor items stay in the ledger; those with deadlines: gate `youtubePosterUrl` with `isYouTubeId` (Task 16); case-sensitive local-file check before the first local file (Task 18+); pages look up data by `entry.slug`/`entry.number` (Tasks 19–25); replace the HomePage placeholder (Task 25).
- Execution ledger with every ruling and deferred minor finding: `.superpowers/sdd/2026-10-29-ucn-gs-accreditation-site/progress.md` (git-ignored via `.git/info/exclude`).
- Rulings that deviate from plan text: `engines.node` is `>=22.22.2` (jsdom 30 floor); `safeHref` also rejects `\` and control chars; the a11y agent omits upstream `npx` commands; `useRouteEntry` lives in `src/app/useRouteEntry.ts`; Task 18 must export sample-free `contentAreas`/`contentRecommendations` for the routes test.
- `ucn-opus-reviewer` and `accessibility-auditor` were not registered in this session (it started in the parent folder). Checkpoints must run them as registered agents after restarting Claude Code in `ucn-gs`, or as general-purpose Opus agents using the agent file verbatim.
- Version facts verified for the plan (2026-10-29):
  - `vite-imagetools@12` needs Vite 8, so the plan pins `^10.0.1`, which supports Vite 7.
  - Vitest 5 needs Node ≥22.12, so `engines.node` becomes `>=22.12.0`.
  - The local machine runs Node 26.3.0.
- Plan deltas from the spec are listed in the plan under "Spec deltas". One example: the `testing-accessibility-auditor` agent from agency-agents is installed read-only for checkpoint C.

## Recent changes (2026-10-29)

- Added `docs/reference-inventory.md` and the design spec.
- Updated this file.
- Earlier: workflow config (`5606edc`, `2c3c6b2`, `ea12c28`) on `chore/claude-model-routing`, pushed, not merged to `main`, no PR.

## Verification status

Baseline on `feat/accreditation-site` before refactor (2026-10-29, Task 1):

| Check | Result |
|---|---|
| `npm ci` | Pass (after moving aside files locked by two stale `npm run dev` Vite servers; npm warns esbuild postinstall is not approved, build unaffected) |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Pass, with warning: `antd` chunk 719.20 kB (gzip 225.99 kB) |
| `npm run audit:prod` | Pass, 0 vulnerabilities |
| Unit/E2E tests | None before Task 3 |
| Reviewer | Config smoke test only (PASS). No code review has run yet. |

Latest (checkpoint A re-review, reviewer-run at `2aa8639`, 2026-10-30): lint, typecheck, `npm test` (189/189), build, check:dist, audit:prod (0 vulnerabilities) all pass; first-load JS 109.12 kB gzip; CSP meta follows `<meta charset>`. `/gs/` and `/ucn-assets/` subpath builds passed check:dist in Task 5. Checkpoints B and C have not run yet.

## Known issues and blockers

- **Content blocker:** no verified UCN accreditation content yet.
- **Existing-code defects, removed by the planned refactor (spec §6):**
  - duplicate `staff-002` in `src/data/staff.ts`
  - `/public/SchoolLogo.png` paths in `AppHeader.tsx:32` and `media.ts:167`
  - "Research Office" title in `index.html`
  - `package.json` name

## Next actions

1. Continue with Task 13 (Phase 4, media components), then Tasks 14–25 and checkpoint B. Follow the CLAUDE.md workflow.
2. Collect the answers to the spec §14 open questions and the UCN materials (spec §13).
3. Merge or open a PR for `chore/claude-model-routing` so the workflow config reaches `main`.
4. Two stale `npm run dev` Vite servers (started 10:25 and 15:47) still run from this folder. Stop them yourself; the session was not permitted to.

# Current State

Canonical snapshot of where the project stands. Update in place; do not append session diaries. Last updated: 2026-10-29.

## Objective

Build the UCN (University of Camarines Norte) Graduate School Accreditation Website as a static frontend for one GS program.

Existing stack (from `package.json`): React 19, TypeScript 5.8, Vite 7, Ant Design 5, React Router 7, ESLint 9. Node >= 20; CI uses Node 22. Under the design, Ant Design is replaced by Tailwind CSS v4.

## Phase

**Implementation plan written and self-reviewed (2026-10-29). Awaiting the user's approval before execution.**

- Plan: `docs/superpowers/plans/2026-10-29-ucn-gs-accreditation-site.md`
  - 29 tasks in 8 phases
  - reviewer checkpoints A (after Task 12), B (after Task 25) and C (Task 28)
  - Task 29 is blocked on UCN materials

- Spec: `docs/superpowers/specs/2026-10-29-ucn-gs-accreditation-site-design.md`
- Reference inventory: `docs/reference-inventory.md`

No implementation plan exists. No implementation has started.

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
- Implementation plan: written and awaiting approval. No task has started; every checkbox in it is unchecked.
- Version facts verified for the plan (2026-10-29):
  - `vite-imagetools@12` needs Vite 8, so the plan pins `^10.0.1`, which supports Vite 7.
  - Vitest 5 needs Node ≥22.12, so `engines.node` becomes `>=22.12.0`.
  - The local machine runs Node 26.3.0.
- Plan deltas from the spec are listed in the plan under "Spec deltas". One example: the `testing-accessibility-auditor` agent from agency-agents is installed read-only for checkpoint C.

## Recent changes (2026-10-29)

- Added `docs/reference-inventory.md` and the design spec.
- Updated this file.
- Earlier: workflow config (`5606edc`, `2c3c6b2`, `ea12c28`) on `chore/claude-model-routing`, pushed, not merged to `main`, no PR.

## Verification status (2026-10-29, on the existing code, before this session)

| Check | Result |
|---|---|
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Pass, with warning: `antd` chunk 719 kB |
| `npm run audit:prod` | Pass, 0 vulnerabilities |
| Unit/E2E tests | None exist |
| Reviewer | Config smoke test only (PASS). No code review has run. |
| Browser/visual check | Not run |

No checks were run this session (documentation only).

## Known issues and blockers

- **Content blocker:** no verified UCN accreditation content yet.
- **Existing-code defects, removed by the planned refactor (spec §6):**
  - duplicate `staff-002` in `src/data/staff.ts`
  - `/public/SchoolLogo.png` paths in `AppHeader.tsx:32` and `media.ts:167`
  - "Research Office" title in `index.html`
  - `package.json` name

## Next actions

1. The user reviews and approves the plan. Then execute it from Task 1 in the main session (CLAUDE.md workflow), one task at a time, ticking checkboxes only after verification.
3. Collect the answers to the spec §14 open questions and the UCN materials (spec §13).
4. Merge or open a PR for `chore/claude-model-routing` so the workflow config reaches `main`.

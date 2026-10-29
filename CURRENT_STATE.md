# Current State

Canonical snapshot of where the project stands. Update in place; do not append session diaries. Last updated: 2026-10-29.

## Objective

Build the UCN (University of Camarines Norte) Graduate School Accreditation Website as a static frontend.

Existing stack (from `package.json`): React 19, TypeScript 5.8, Vite 7, Ant Design 5, React Router 7, ESLint 9. Deployed config exists for Vercel (`vercel.json`) and Netlify-style hosts (`public/_headers`, `public/_redirects`). Node >= 20; CI uses Node 22.

## Phase

**Setup complete. Next: brainstorming.** No design spec or implementation plan exists yet.

## Approved decisions

- Workflow: Plan Mode on Opus, execution on Sonnet via `opusplan`, `effortLevel: high` (`.claude/settings.json`).
- Read-only `ucn-opus-reviewer` subagent (Opus, high effort) runs sequentially at three checkpoints; see `CLAUDE.md`.
- `CURRENT_STATE.md` is the single state snapshot; the approved plan (once written) is the source of truth for tasks.

Not yet decided: whether to keep the existing stack and code, site structure, design direction, and content.

## Reference and content status

- Reference website: not provided yet.
- Verified content: none. Every value in `src/data/site.ts`, `staff.ts`, and `media.ts` is placeholder content for a "Research Office" media site (example.edu emails, `+00` phone).
- Assets in repo: `public/SchoolLogo.png`, `public/favicon.svg`, placeholder SVGs in `public/media/images` and `public/media/posters`, `public/media/videos/sample.mp4`.
- Asset outside repo: `../ucn_logo.png` (about 1 MB, in the parent `gsweb` folder; not committed).
- Missing: accreditation content (programs, accreditation levels/status, documents, faculty, contact details), real photos, and the reference site.

## Architecture overview

The existing code is a Research Office photo/video gallery, not yet the accreditation site.

- Routes (`src/app/routes.tsx`, lazy-loaded): `/`, `/gallery`, `/videos`, `/about`, `*` (404).
- Shell: `src/app/App.tsx` (AntD `Layout`, `AppHeader`, `AppFooter`, `Suspense` skeleton), `src/app/AppProviders.tsx`.
- Shared components: `src/components/` (header, footer, `PageBanner`, `SectionHeading`, `ContactBand`, `ErrorBoundary`, `OnDark`).
- Features: `src/features/{home,gallery,about}` with their own components; gallery has `categories.ts` and `useMediaFilter`.
- Content: typed data modules in `src/data/` with types in `src/types/`. Design tokens in `src/styles/tokens.ts`, global CSS in `src/styles/global.css`.
- Utilities: `src/utils/safeUrl.ts`, `src/utils/fallbackImage.ts`.

## Plan and progress

- Design spec: not written.
- Implementation plan: not written.
- Done: Claude Code workflow setup (model routing, reviewer, continuity docs).
- Current task: none in progress.

## Recent changes (2026-10-29)

- `.claude/settings.json`: `opusplan` routing and high effort.
- `.claude/agents/ucn-opus-reviewer.md`: read-only Opus reviewer.
- `CLAUDE.md`: plan/execute/review workflow and continuity rules.
- `CURRENT_STATE.md`: this file.

All are committed (`5606edc`, `2c3c6b2`) on branch `chore/claude-model-routing` and pushed; that branch is not merged to `main` and has no PR.

## Verification status (2026-10-29, on the existing code)

| Check | Result |
|---|---|
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Pass, with warning: `antd` chunk 719 kB (> 500 kB limit) |
| `npm run audit:prod` | Pass, 0 vulnerabilities |
| Unit/E2E tests | None exist |
| Reviewer | Only a config smoke test (verdict PASS on `.claude/settings.json`). No code review has been run. |
| Browser/visual check | Not run |

## Known issues and blockers

- Blocker for content work: no reference website or verified accreditation content yet.
- `src/data/staff.ts`: `staff-002` is duplicated (likely duplicate React keys). Found by reading, not confirmed at runtime.
- `src/components/AppHeader.tsx:32` and `src/data/media.ts:167` use `/public/SchoolLogo.png`; Vite serves `public/` at the root, so the path should probably be `/SchoolLogo.png`. Not confirmed at runtime.
- `index.html` title and description still say "Research Office"; `package.json` name is `research-office-site`.
- Large `antd` bundle chunk (see build warning).

## Next actions

1. Brainstorm in Plan Mode: site purpose and audience, page structure, reference website, content inventory, and whether to repurpose or replace the Research Office code.
2. Write and approve the design spec, then the implementation plan; link both here.
3. Merge or open a PR for `chore/claude-model-routing` so the workflow config is on `main`.

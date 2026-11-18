# Current State

Canonical snapshot of where the project stands. Update in place; do not append session diaries. Last updated: 2026-11-18.

## Objective

Build the UCN (University of Camarines Norte) Graduate School Accreditation Website as a static frontend for one GS program.

Stack after the refactor: React 19, TypeScript 5.8, Vite 7, React Router 7, Tailwind CSS v4, Vitest 5, ESLint 9. Node `>=22.22.2`; CI uses Node 22.

## Phase

**Tasks 1–28 complete and merged to `main`; checkpoints A, B and C cleared (2026-10-30). The 2026-11-18 answers require structural changes (per-area recommendations, inline PDFs, Nginx) before Task 29 (UCN content entry), which is still blocked on UCN materials.**

- **PR #1** https://github.com/ramilrana/ucn-gs/pull/1 (`feat/accreditation-site` → `main`, including the `chore/claude-model-routing` commits and the spec/plan docs) was **merged 2026-11-04** as merge commit `cfc0ea4` after CI `build` passed. No GitHub review was requested. Local `main` is fast-forwarded to `cfc0ea4`. Task 29 work branches from `main`.
- Plan: `docs/superpowers/plans/2026-10-29-ucn-gs-accreditation-site.md` (29 tasks in 8 phases).
- Spec: `docs/superpowers/specs/2026-10-29-ucn-gs-accreditation-site-design.md`.
- Editor guide: `docs/content-guide.md`. Deployment guide: `docs/deployment.md`.

## Approved decisions

- Workflow: Plan Mode on Opus, execution via `opusplan`, `effortLevel: high` (`.claude/settings.json`). In practice this session's controller ran on Opus 5.5 and every implementer and task reviewer was dispatched explicitly on Sonnet (re-reviews of small fixes on Haiku).
- Read-only `ucn-opus-reviewer` subagent at checkpoints A, B and C; see `CLAUDE.md`. In this session it was not registered (the session started in the parent folder), so each checkpoint ran its definition file verbatim as a general-purpose Opus agent. Same for `accessibility-auditor`.
- `CURRENT_STATE.md` is the single state snapshot. The approved spec and plan are the source of truth.
- Design decisions D1–D9 (spec §3): D1 reference for structure only, no PUP content; D2 Tailwind v4 replaces Ant Design; D3 mixed hosting (local plus Drive/YouTube); D4 one program; D5 published/pending, pending hidden in production; D6 UCN's own server with per-route `index.html` and `.htaccess`; D7 refactor in place, typed TS content; D8 no slideshow autoplay; D9 no gold text or state indicators on white.
- **R19 (2026-10-30, checkpoint B): local files are never framed.** Reason: spec §7 ("Local PDFs open in a titled iframe") conflicts with the exact §8 CSP (no `frame-src 'self'`; `frame-ancestors 'none'` on every response) and Chrome disables its PDF viewer in sandboxed frames. Local PDFs show an Open / Download card; local video shows an Open link; `embedUrl` returns null for local sources; Drive and YouTube embeds are unchanged. Consistent with D3. Alternative, not taken without user approval because it loosens §8: add `frame-src 'self'`, set `frame-ancestors 'self'` on PDF responses, drop `sandbox` on same-origin frames.
- **User answers to spec §14 (2026-11-18).** These change approved decisions; the spec and plan are not yet updated (see Next actions 1):
  - **Program (refines D4):** Master in Public Administration (MPA), AACCUP Level IV **Phase 2** accreditation, year 2026. The site is the Graduate School's site but covers only this accreditation.
  - **Areas (5, in order):** Research; Performance of Graduates; Community Service; International Linkages & Consortia; Planning Process. Each area has its own AVP.
  - **Recommendations are per area (changes spec §4 routes and the `Recommendation` type):** Research 2, Performance of Graduates 1, Community Service 5, International Linkages & Consortia 5, Planning Process 1 (14 total). The Compliance Report index groups them under area headings, numbered within each area, and each recommendation keeps its own page. Titles still to come.
  - **PDF display is chosen per document (partly reverses R19):** some local PDFs display inline, some use the Open / Download card, some go on Google Drive. Inline local PDFs need the R19 alternative: `frame-src 'self'`, `frame-ancestors 'self'` on PDF responses, no `sandbox` on same-origin frames. Reason: user's answer.
  - **Server (changes D6):** Nginx on a local UCN server. The Apache `.htaccess` template must be replaced or joined by an Nginx config that sends the same headers. Domain, base path and HTTPS are still open.
  - **Language:** English only; no `lang="fil"` needed.
- Other rulings that differ from plan text (full list with reasons and costs in the ledger): `engines.node >=22.22.2` (jsdom 30 floor); `safeHref` also rejects `\` and control characters; the accessibility-auditor agent omits the upstream `npx` commands; ActionLink treats root-relative paths with a file extension as file links (R14); published evidence groups with no visible content are hidden in production, including `blocks: []` (R13); the inline-author-style 200% root font case at desktop width is accepted (R23); logo alt text kept as planned despite the redundant link name (R22).

## Reference and content status

- **Reference:** https://sites.google.com/view/pupgs-mapsych/ (PUP GS MA Psychology), used for structure only.
- **Verified UCN content:** "University of Camarines Norte", "LEVEL IV AACCUP ACCREDITATION", and the logo (`src/assets/brand/ucn-logo.png`). Everything else is `pending`; `/content-status` (dev and preview only) lists every pending item.
- **Missing materials (spec §13):** leadership photos, accreditation slides 1–2, second gallery, GS video, Dean and Program Chair messages and photos; about photo, mission, vision, goals, objectives, history; compliance overview and the recommendations with documents and evidence; the area list, narrative reports, galleries, evidence and AVPs; certificate PDF and image; additional files; people (names, positions, ranks, departments, photos); FAQs, address, map query, contact details.
- **Open questions (spec §14):** answered 2026-11-18 (see Approved decisions) except: recommendation titles; Nginx server's domain or IP, base path and HTTPS; which PDFs are inline, card or Drive (decided per document as materials arrive).

## Architecture overview

Spec §6. Typed content in `src/content/` (areas and recommendations as one file each, globbed) drives a route manifest, which drives the data router (lazy pages), navigation, breadcrumbs and the post-build per-route HTML copies. Layout in `src/components/layout/`, primitives in `src/components/ui/`, media (the only place with iframes) in `src/components/media/`, evidence rendering in `src/components/content/`, page views in `src/features/<family>/`, thin route pages in `src/pages/`. Security headers come from one source, `config/csp.mjs`, used by the Vite meta tag, `deploy/htaccess.template` and `scripts/check-dist.mjs`. Dev-only samples (`src/dev/`) never reach production (check:dist rules 5 and 7).

## Plan and progress

- Tasks 1–28: complete. Each task had a Sonnet implementer and an independent task review (spec + quality), with fix rounds until no Important finding remained.
- **Checkpoint A (Tasks 3–12):** review 1 "Verdict: PASS WITH ISSUES" (1 High, 1 Medium, 4 Low) → fixes `f8c44ab..2aa8639`, `f76d38e` → re-review "Verdict: PASS WITH ISSUES. Every earlier finding is addressed, and no Critical, High or Medium finding is open." Cleared.
- **Checkpoint B (Tasks 13–25):** review 1 "Verdict: PASS WITH ISSUES. There is one High finding." (local-file framing) → fixes `f6cf9c2..f3731ef` under R19 → re-review "Verdict: PASS WITH ISSUES. All six findings are fixed and no Critical, High or Medium findings remain." Cleared.
- **Task 27 accessibility audit:** rendered audit (playwright-cli, 14 routes × 320/375/768/1280px, keyboard, reduced motion): 0 Critical, 0 High, 1 Medium, 8 Low. Accessibility-auditor (Opus): 0 Critical, 0 High, 3 Medium, 15 Low, verdict "DOES NOT CONFORM" (SC 2.4.4 link purpose, SC 2.4.2 error-page title). All Mediums and both Level A failures fixed (`b7051d8..f9d0d13`); post-fix keyboard pass 11/11. Accessibility verdict for the tested scope is now **NOT DETERMINED**: no screen reader, touch, forced-colors, 400% zoom or real-content testing has been done.
- **Checkpoint C (whole branch vs `main`):** review "Verdict: PASS WITH ISSUES" (no Critical/High; 1 Medium: VideoEmbed link names) → fixes `e8b78e8..0e3f863` → re-review **"Verdict: PASS"**. Cleared.
- Execution ledger (every ruling, deferred minor finding and review result): `.superpowers/sdd/2026-10-29-ucn-gs-accreditation-site/progress.md`, git-ignored via `.git/info/exclude`. Kept until Task 29 is done.

## Verification status

Latest, reviewer-run at `0e3f863` (checkpoint C re-review, 2026-10-30):

| Check | Result |
|---|---|
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm test` | Pass, 40 files / 396 tests (first run; earlier runs on this machine sometimes need one re-run because of OneDrive file-open errors) |
| `npm run build` | Pass; first-load JS 110.24 kB gzip (budget 120 kB) |
| `npm run check:dist` | Pass |
| `npm run audit:prod` | Pass, 0 vulnerabilities |
| `npm run check:links` | Pass, 0 targets (no real content yet); run at `3421376` |
| `npm run build:preview` + `check:dist` | Fails as designed (dev samples present), run at `3421376` |
| `/gs/` subpath build + `check:dist` | Pass (asset URLs and `ErrorDocument 404 /gs/404.html` carry the base), run at `3421376` |
| GitHub Actions CI on PR #1 (Ubuntu, Node 22) | Pass (`build` job, push and pull_request runs), checked 2026-11-04 |
| Browser checks | CSP: 0 site violations on a preview build (meta CSP only, not the Apache headers). Accessibility and responsive passes as above. |

## Known issues and blockers

- **Content blocker:** no UCN accreditation materials yet (Task 29).
- **Needs the real server (Task 29):** run the post-deploy `curl -I` header checks in `docs/deployment.md`; open one local PDF in Chrome, Firefox and Safari under the real headers; re-check `check:links` "not-public" against a real unshared Drive file (Google may answer some with 200).
- **Environment:** the repo is in OneDrive, which causes intermittent vitest worker failures (`ERR_MODULE_NOT_FOUND`, `lstat`) on this machine. CI on Ubuntu is unaffected.
- **Deferred minor items** (cosmetic, test-quality or plan-mandated; none affects security, conformance or deployment) are listed in the ledger and were triaged at checkpoint C as acceptable to leave.

## Next actions

1. **Plan (Plan Mode) the structural changes from the 2026-11-18 answers**, then update the spec and plan and implement on a branch from `main` with a review checkpoint: (a) per-area recommendations: `Recommendation.areaSlug`, numbering within area, routes such as `/compliance-report/<area-slug>/recommendation-<n>`, grouped index, nav, breadcrumbs, pager, per-route HTML, `/content-status`; (b) the five area stubs with slugs and AVP slots; (c) site/program text: MPA, Level IV Phase 2, 2026; (d) per-document inline local PDFs under a scoped CSP change (R19 alternative) in `config/csp.mjs`, `check:dist` and tests; (e) Nginx config equivalent to `deploy/htaccess.template` (headers, per-route `index.html`, 404, caching) and an updated `docs/deployment.md`.
2. Supply the spec §13 materials (and the 14 recommendation titles), then run Task 29 batch by batch (`docs/content-guide.md`; plan Task 29 steps). Each batch: add files/data with UCN's exact wording, flip to `published` only when verified, `npm test` + `npm run check:links`, render at 375/1280px, standard checks, update this file, commit `content: <batch>`.
3. Before the first deploy: confirm the Nginx server's domain or IP, base path and HTTPS; then follow the updated `docs/deployment.md`, including the post-deploy checks.
4. Optional: move the repo out of OneDrive (for example `C:/dev/ucn-gs`); consider adding `eslint-plugin-jsx-a11y` (new dependency, needs approval); run a screen-reader pass once real content exists; delete the merged `feat/accreditation-site`, `docs/accreditation-design-spec` and `chore/claude-model-routing` branches if no longer wanted.

## How to resume in a new conversation

- Start Claude Code with `ucn-gs` as the working folder (not the parent `gsweb`), so `.claude/agents/ucn-opus-reviewer.md` and `accessibility-auditor.md` load as real subagents.
- Read only `CLAUDE.md` and this file first. Open the plan's Task 29 section and `docs/content-guide.md` only when entering content; open the spec only for the section a task needs. Do not reread the whole plan or spec.
- The execution ledger (`.superpowers/sdd/2026-10-29-ucn-gs-accreditation-site/progress.md`) is detail for audits only; consult it only when a ruling or deferred finding is in question.

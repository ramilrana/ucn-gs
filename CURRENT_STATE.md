# Current State

Canonical snapshot of where the project stands. Update in place; do not append session diaries. Last updated: 2026-11-19.

## Objective

Build the UCN (University of Camarines Norte) Graduate School Accreditation Website as a static frontend for one GS program.

Stack after the refactor: React 19, TypeScript 5.8, Vite 7, React Router 7, Tailwind CSS v4, Vitest 5, ESLint 9. Node `>=22.22.2`; CI uses Node 22.

## Phase

**Tasks 1–28 complete and merged to `main`; checkpoints A, B and C cleared (2026-10-30). The structural changes from the 2026-11-18 answers (per-area recommendations, inline PDFs, Nginx, program name) are merged to `main` via **PR #2** https://github.com/ramilrana/ucn-gs/pull/2 (merge commit `233a038`, 2026-11-18, after CI `build` and `nginx-smoke` passed on `1651130`; no GitHub review requested). Task 29 (UCN content entry) is still blocked on UCN materials.**

- **PR #1** https://github.com/ramilrana/ucn-gs/pull/1 (`feat/accreditation-site` → `main`, including the `chore/claude-model-routing` commits and the spec/plan docs) was **merged 2026-11-04** as merge commit `cfc0ea4` after CI `build` passed. No GitHub review was requested. Local `main` is fast-forwarded to `cfc0ea4`. Task 29 work branches from `main`.
- Plan: `docs/superpowers/plans/2026-10-29-ucn-gs-accreditation-site.md` (29 tasks in 8 phases). Structure-change plan: `docs/superpowers/plans/2026-11-18-structure-changes.md` (8 tasks).
- Spec: `docs/superpowers/specs/2026-10-29-ucn-gs-accreditation-site-design.md`.
- Editor guide: `docs/content-guide.md`. Deployment guide: `docs/deployment.md`.

## Approved decisions

- Workflow: Plan Mode on Opus, execution via `opusplan`, `effortLevel: high` (`.claude/settings.json`). In practice this session's controller ran on Opus 5.5 and every implementer and task reviewer was dispatched explicitly on Sonnet (re-reviews of small fixes on Haiku).
- Read-only `ucn-opus-reviewer` subagent at checkpoints A, B and C; see `CLAUDE.md`. In this session it was not registered (the session started in the parent folder), so each checkpoint ran its definition file verbatim as a general-purpose Opus agent. Same for `accessibility-auditor`.
- `CURRENT_STATE.md` is the single state snapshot. The approved spec and plan are the source of truth.
- Design decisions D1–D9 (spec §3): D1 reference for structure only, no PUP content; D2 Tailwind v4 replaces Ant Design; D3 mixed hosting (local plus Drive/YouTube); D4 one program (now the MPA, AACCUP Level IV Phase 2, 2026); D5 published/pending, pending hidden in production; D6 UCN's own server with per-route `index.html` (now Nginx, generated config; Apache files removed); D7 refactor in place, typed TS content; D8 no slideshow autoplay; D9 no gold text or state indicators on white.
- **R19 (2026-10-30, checkpoint B): local files are never framed. Partly reversed 2026-11-18 (implemented): local PDFs with `inline: true` now frame, under the scoped CSP change below; other local files stay cards.** Reason: spec §7 ("Local PDFs open in a titled iframe") conflicts with the exact §8 CSP (no `frame-src 'self'`; `frame-ancestors 'none'` on every response) and Chrome disables its PDF viewer in sandboxed frames. Local PDFs show an Open / Download card; local video shows an Open link; `embedUrl` returns null for local sources; Drive and YouTube embeds are unchanged. Consistent with D3. Alternative, not taken without user approval because it loosens §8: add `frame-src 'self'`, set `frame-ancestors 'self'` on PDF responses, drop `sandbox` on same-origin frames.
- **User answers to spec §14 (2026-11-18).** These changed approved decisions; the spec, deployment guide and content guide now describe them and the branch implements them. Reason for each change: the user's answer.
  - **Program (refines D4):** Master in Public Administration (MPA), AACCUP Level IV **Phase 2** accreditation, year 2026. The site is the Graduate School's site but covers only this accreditation. 2026-11-19 (user's request): the hero program line reads just "Master in Public Administration".
  - **Home banner (2026-11-19, user's choice of four previewed options):** aerial campus photo (`src/assets/home/campus-aerial.webp`, 1280×360, decorative) under a maroon tint that is solid behind the text and fades to the photo on the right at `lg`, fully tinted below. Title on two lines, "University of Camarines Norte" in gold (on maroon, allowed by D9) and "Graduate School" in white. Leadership slideshow moved to its own maroon band below. Branch `feat/home-banner`.
  - **Areas (5, in order):** Research; Performance of Graduates; Community Service; International Linkages & Consortia; Planning Process. Each area has its own AVP.
  - **Recommendations are per area (changes spec §4 routes and the `Recommendation` type):** Research 2, Performance of Graduates 1, Community Service 5, International Linkages & Consortia 5, Planning Process 1 (14 total). The Compliance Report index groups them under area headings, numbered within each area, and each recommendation keeps its own page. Titles still to come.
  - **PDF display is chosen per document (partly reverses R19):** some local PDFs display inline, some use the Open / Download card, some go on Google Drive. Implemented as the R19 alternative: `frame-src 'self'`, `frame-ancestors 'self'` on PDF responses only, no `sandbox` on the opted-in frame; `check:dist` rejects active content under `dist/files/`.
  - **Server (changes D6):** Nginx on a local UCN server. Implemented: the build generates `dist-nginx/` instead of `.htaccess`. Domain, base path and HTTPS are still open.
  - **Language:** English only; no `lang="fil"` needed.
- Other rulings that differ from plan text (full list with reasons and costs in the ledger): `engines.node >=22.22.2` (jsdom 30 floor); `safeHref` also rejects `\` and control characters; the accessibility-auditor agent omits the upstream `npx` commands; ActionLink treats root-relative paths with a file extension as file links (R14); published evidence groups with no visible content are hidden in production, including `blocks: []` (R13); the inline-author-style 200% root font case at desktop width is accepted (R23); logo alt text kept as planned despite the redundant link name (R22).

## Reference and content status

- **Reference:** https://sites.google.com/view/pupgs-mapsych/ (PUP GS MA Psychology), used for structure only.
- **Verified UCN content:** "University of Camarines Norte", "LEVEL IV AACCUP ACCREDITATION", and the logo (`src/assets/brand/ucn-logo.png`). Everything else is `pending`; `/content-status` (dev and preview only) lists every pending item.
- **Missing materials (spec §13):** leadership photos, accreditation slides 1–2, second gallery, GS video, Dean and Program Chair messages and photos; about photo, mission, vision, goals, objectives, history; compliance overview and the 14 recommendation titles, documents and evidence; area narrative reports, galleries, evidence and AVPs; certificate PDF and image; additional files; people (names, positions, ranks, departments, photos); FAQs, address, map query, contact details.
- **Open questions (spec §14):** answered 2026-11-18 (see Approved decisions) except: recommendation titles; Nginx server's domain or IP, base path and HTTPS; which PDFs are inline, card or Drive (decided per document as materials arrive).

## Architecture overview

Spec §6. Typed content in `src/content/` (areas and recommendations as one file each, globbed) drives a route manifest, which drives the data router (lazy pages), navigation, breadcrumbs and the post-build per-route HTML copies. Layout in `src/components/layout/`, primitives in `src/components/ui/`, media (the only place with iframes) in `src/components/media/`, evidence rendering in `src/components/content/`, page views in `src/features/<family>/`, thin route pages in `src/pages/`. Security headers come from one source, `config/csp.mjs`, used by the Vite meta tag, `scripts/nginx-config.mjs` and `scripts/check-dist.mjs`. Deploy: `scripts/write-route-pages.mjs` renders `deploy/nginx.conf.template` into `dist-nginx/` (`ucn-gs.conf`, `security-headers.conf`, `pdf-headers.conf`; env `UCN_DOCROOT`, `UCN_NGINX_INCLUDE_DIR`) for the admin to include in the server block. Recommendations live in `src/content/recommendations/<area-slug>/rec-NN.ts` and route to `/compliance-report/<area-slug>/recommendation-<n>`. Dev-only samples (`src/dev/`) never reach production (check:dist rules 5 and 7).

## Plan and progress

- Tasks 1–28: complete. Each task had a Sonnet implementer and an independent task review (spec + quality), with fix rounds until no Important finding remained.
- **Checkpoint A (Tasks 3–12):** review 1 "Verdict: PASS WITH ISSUES" (1 High, 1 Medium, 4 Low) → fixes `f8c44ab..2aa8639`, `f76d38e` → re-review "Verdict: PASS WITH ISSUES. Every earlier finding is addressed, and no Critical, High or Medium finding is open." Cleared.
- **Checkpoint B (Tasks 13–25):** review 1 "Verdict: PASS WITH ISSUES. There is one High finding." (local-file framing) → fixes `f6cf9c2..f3731ef` under R19 → re-review "Verdict: PASS WITH ISSUES. All six findings are fixed and no Critical, High or Medium findings remain." Cleared.
- **Task 27 accessibility audit:** rendered audit (playwright-cli, 14 routes × 320/375/768/1280px, keyboard, reduced motion): 0 Critical, 0 High, 1 Medium, 8 Low. Accessibility-auditor (Opus): 0 Critical, 0 High, 3 Medium, 15 Low, verdict "DOES NOT CONFORM" (SC 2.4.4 link purpose, SC 2.4.2 error-page title). All Mediums and both Level A failures fixed (`b7051d8..f9d0d13`); post-fix keyboard pass 11/11. Accessibility verdict for the tested scope is now **NOT DETERMINED**: no screen reader, touch, forced-colors, 400% zoom or real-content testing has been done.
- **Checkpoint C (whole branch vs `main`):** review "Verdict: PASS WITH ISSUES" (no Critical/High; 1 Medium: VideoEmbed link names) → fixes `e8b78e8..0e3f863` → re-review **"Verdict: PASS"**. Cleared.
- **Structure changes (2026-11-18, branch `feat/structure-2026-11`):** Task 1 content model and validation (`1d01408`); Tasks 2–4 routes, views, nav, pager (`18cf184`); Task 5 five area and 14 recommendation stubs plus the published program name (`d44dc7d`); Task 6 inline local PDFs (`9314f03`, `ff875cc`); Task 7 Nginx config and CI smoke job (`acd5557`, `8b00e30`) with fixes (`96c6b10`, `6b9a1f0`); Task 8 docs. Each code task had an independent review; Task 7 needed two fix rounds. Ledger: `.superpowers/sdd/2026-11-18-structure-changes/progress.md` (git-ignored).
- **Checkpoint D (whole `feat/structure-2026-11` branch vs `main`):** reviewer returned "Verdict: PASS WITH ISSUES" (no Critical or High). Mediums: the production audit (fixed by the final fix wave) and browser verification of an inline PDF (deferred; see the gate under Known issues). **Accessibility audit (code-level):** 0 Critical, 0 High, 1 Medium (focus lost when re-selecting the same area anchor; fixed by the final fix wave), a few Low (scroll margin, repeated link names, anchor names; fixed). Conformance remains NOT DETERMINED. Final fix wave commits follow `67fe829` on the branch; no re-review has run on them.
- Execution ledger (every ruling, deferred minor finding and review result): `.superpowers/sdd/2026-10-29-ucn-gs-accreditation-site/progress.md`, git-ignored via `.git/info/exclude`. Kept until Task 29 is done.

## Verification status

Last reviewer-run set: `0e3f863` (checkpoint C re-review, 2026-10-30): lint, typecheck, test (396), build, `check:dist`, `audit:prod` (0 vulnerabilities) all pass; GitHub Actions on PR #1 passed 2026-11-04.

Structure changes, implementer-run at `6b9a1f0` (2026-11-18), not re-run by a reviewer:

| Check | Result |
|---|---|
| `npm run lint`, `npm run typecheck` | Pass |
| `npm test` | Pass, 41 files / 439 tests |
| `npm run build` + `npm run check:dist` | Pass (base `/`); `VITE_BASE_PATH=/gs/` build + `check:dist` also passed at `acd5557` |
| `npm run build:preview` | Builds; `check:dist` fails on it as designed |
| Dev server `/files/dev-sample.pdf` | 200, `application/pdf` |
| `scripts/nginx-smoke.sh` on real Nginx | Not run locally (Docker daemon unavailable). **CI job `nginx-smoke` passed** at `6b9a1f0` (run 44238768431, 2026-11-18) |
| GitHub Actions `build` job at `6b9a1f0` | lint, typecheck, test, build, `check:dist` passed; `npm audit --omit=dev --audit-level=high` failed on GHSA-fc5q-39xc-vjpf (picomatch <=4.0.7 ReDoS, no patched version), reached in production only through `@tailwindcss/vite` and vite. Fixed by the final fix wave below |
| `check:links` | Not re-run on this branch |

Final fix wave (after checkpoint D), run locally at the fix commits: `npm run lint`, `typecheck`, `npm test` (41 files / 444 tests), `npm run build`, `npm run check:dist` pass; `npm run audit:prod` reports 0 vulnerabilities; `bash -n scripts/nginx-smoke.sh` ok. Re-review of the fix wave: F1–F3 and F5–F7 addressed; F4 fixed afterwards: the hidden area name now follows the visible link text, e.g. "Recommendation 1: … (Research)".

Browser check at `5454270` (controller, `vite preview` of `build:preview` in the Claude desktop browser pane, 2026-11-18): grouped Compliance index renders; area anchors in the nav focus the area h2 on first and repeated selection; at 375px a recommendation page has no horizontal scroll and the breadcrumb, H1 and cross-area pager are correct; the sample inline PDF frames are unsandboxed, load `/files/dev-sample.pdf` as `application/pdf` same-origin, and the console shows no CSP violations. PDF rendering itself was not visible (that pane has no PDF viewer), and `vite preview` sends no server headers. Chrome, Firefox and Safari under real Nginx headers: not done.

The docs commit changes no code and ran no checks.

## Known issues and blockers

- **Content blocker:** no UCN accreditation materials yet (Task 29).
- **Dev-tree audit advisory:** GHSA-fc5q-39xc-vjpf (picomatch <=4.0.7 ReDoS, no patched version). Decision (final fix wave): the build-only plugins `tailwindcss` and `@tailwindcss/vite` moved to `devDependencies`, so `npm run audit:prod` reports 0 vulnerabilities. The advisory remains in the dev tree and is tracked by the informational CI step "Audit (all deps, informational)"; bump the toolchain once a patched picomatch exists.
- **Gate before real content sets `inline: true`:** verify an inline local PDF renders in Chrome, Firefox and Safari under the real Nginx headers (no CSP violations). Not yet done in any browser.
- **Nginx on a real server:** CI `nginx-smoke` passed against `nginx:1.27-alpine` with a preview build. The UCN server itself is untested.
- **Needs the real server (Task 29):** run the post-deploy `curl -I` header checks in `docs/deployment.md`; open one inline PDF in Chrome, Firefox and Safari under the real headers; re-check `check:links` "not-public" against a real unshared Drive file (Google may answer some with 200).
- **Environment:** the repo is in OneDrive, which causes intermittent vitest worker failures (`ERR_MODULE_NOT_FOUND`, `lstat`) on this machine. CI on Ubuntu is unaffected.
- **Branch minors, deferred:** server-level `add_header` (HSTS) is dropped by per-location `add_header` (documented); `.well-known/` is blocked by the dotfile rule (documented); smoke script exits silently if curl cannot connect.
- **Deferred for later:** soft-404 for pending routes (19 URLs return 200 with the 404 view; options: a route-manifest JSON, or `noindex` on NotFound); `check:dist` Rule 8 should become an allow-list of extensions; add a `/gs/` matrix entry to `nginx-smoke` before any subpath deploy.
- **Pending stubs:** pending area and recommendation titles are in the production JS bundle (the manifest hides them from pages); pending routes get an HTML copy that shows the 404 view with HTTP 200. Accepted under D5.
- **Deferred minor items** (cosmetic, test-quality or plan-mandated; none affects security, conformance or deployment) are listed in the ledger and were triaged at checkpoint C as acceptable to leave.

## Next actions

1. Supply the spec §13 materials (and the 14 recommendation titles), then run Task 29 batch by batch (`docs/content-guide.md`; plan Task 29 steps). Each batch: add files/data with UCN's exact wording, flip to `published` only when verified, `npm test` + `npm run check:links`, render at 375/1280px, standard checks, update this file, commit `content: <batch>`. Name inline PDFs with simple file names (content guide 5.2.1).
2. Before the first deploy: confirm the Nginx server's domain or IP, base path and HTTPS; build with `UCN_DOCROOT` and `UCN_NGINX_INCLUDE_DIR` set to the server's paths; follow `docs/deployment.md`, including the post-deploy checks.
3. Optional: move the repo out of OneDrive (for example `C:/dev/ucn-gs`); consider adding `eslint-plugin-jsx-a11y` (new dependency, needs approval); run a screen-reader pass once real content exists. (All merged branches were deleted 2026-11-18; `main` is the only branch.)

## How to resume in a new conversation

- Start Claude Code with `ucn-gs` as the working folder (not the parent `gsweb`), so `.claude/agents/ucn-opus-reviewer.md` and `accessibility-auditor.md` load as real subagents.
- Read only `CLAUDE.md` and this file first. Open the plan's Task 29 section and `docs/content-guide.md` only when entering content; open the spec only for the section a task needs. Do not reread the whole plan or spec.
- The execution ledger (`.superpowers/sdd/2026-10-29-ucn-gs-accreditation-site/progress.md`) is detail for audits only; consult it only when a ruling or deferred finding is in question.

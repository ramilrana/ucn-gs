# UCN Graduate School Accreditation Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Research Office gallery into the UCN Graduate School accreditation website described in the approved spec. It must be static, data-driven, accessible and safe, and every route must work on UCN's own server.

**Architecture:** Refactor in place (spec D7):
- **Stack:** keep Vite 7, React 19, React Router 7, TypeScript and the existing CI. Replace Ant Design with Tailwind CSS v4.
- **Content:** lives in typed modules under `src/content/`. A route manifest built from that content drives the router, navigation, breadcrumbs and the post-build script that writes one `index.html` per route.
- **Pending content:** each item is `published` or `pending`. Pending items show in dev and preview builds and are hidden in production.

**Tech Stack:**
- **Already installed:** Vite 7.3, React 19.3, React Router DOM 7.18, TypeScript 5.8, ESLint 9.
- **To add:**

| Kind | Packages |
|---|---|
| Runtime | Tailwind CSS 4.3, `@tailwindcss/vite` 4.3, `lucide-react` 1.x |
| Dev | `vite-imagetools` 10.x, Vitest 5, Testing Library, jsdom 30, `@types/node` 22 |

**Spec:** `docs/superpowers/specs/2026-10-29-ucn-gs-accreditation-site-design.md`. Read it alongside this plan. Section references such as "spec §7" point into it.

**Project rules:** `CLAUDE.md` (plan, execute, review workflow) and `CURRENT_STATE.md` (update at each checkpoint and at the end of each session).

## Global Constraints

- **Content:** no PUP content of any kind (spec D1). Never invent names, statements, dates, results, documents or descriptions of people or events. The only verified UCN facts so far are listed below; everything else is `pending` until the user supplies it.
  - the name "University of Camarines Norte"
  - the heading wording **LEVEL IV AACCUP ACCREDITATION** (from the master prompt)
  - `ucn_logo.png`
- **Logo:** `ucn_logo.png` is the only institutional mark. No other logos.
- **Dependencies:** none beyond those listed under Tech Stack. Major versions are not changed: Vite stays 7.x, which is why `vite-imagetools` is held at `^10.0.1`, the last line that supports Vite 7. No state library, no CMS, no backend.
- **Node:** Vitest 5 requires Node `^22.12.0 || ^24.0.0 || >=26.0.0`. `package.json` `engines.node` becomes `>=22.12.0`. CI keeps Node 22.
- **Colors:** no hex values in components. All colors come from the Tailwind `@theme` tokens in `src/styles/global.css`. Gold is never used as text, focus ring or state indicator on white or paper (D9).
- **HTML and embeds:** no `dangerouslySetInnerHTML`. `<iframe>` appears only in `src/components/media/`. Iframe URLs are built only by `src/lib/resourceUrls.ts`, from IDs.
- **Frame hosts:** exactly `drive.google.com`, `docs.google.com`, `www.youtube-nocookie.com`, `www.google.com`.
- **Links:** `https:` URLs, root-relative paths, `mailto:` and `tel:` only. Everything else is rejected.
- **CSP header:** the exact string from spec §8.
- **Accessibility:** WCAG 2.2 AA practices. No slideshow autoplay (D8). Reduced motion is respected. Targets are at least 24px, and 44px in navigation. No horizontal overflow at 320px.
- **Performance:** first-load JavaScript at most 120 kB gzipped.
- **Naming:**
  - components in `PascalCase.tsx` with one exported component per file
  - hooks and functions in `camelCase.ts`
  - tests next to the code as `*.test.ts(x)`
  - content files: `src/content/areas/<slug>.ts` and `src/content/recommendations/rec-NN.ts`, each with a default export
- **TypeScript:** existing strict settings, including `noUncheckedIndexedAccess`. No `any`; the existing ESLint rule already bans it. Use discriminated unions for content variants.
- **Error handling:** components never throw on bad content data. An invalid URL renders as plain text with no link. Content mistakes are caught by tests in `src/content/content.test.ts`.

## Review Focus

The most likely real-world failures that no ordinary feature test covers. Each one has a pinning test in the task named.

1. **Drive file not shared publicly.** The embed frame shows a Google sign-in page. The *Open in new tab* link must still be shown, and `check:links` must report the file as `not-public`. Pinned in **Task 26** (`classifyResponse` tests).
2. **Site hosted under a subpath such as `/gs/`.** Asset URLs, local file URLs, router links, the per-route HTML copies and `ErrorDocument 404` must all carry the base path. Pinned in **Task 5** (`checkDist` with base `/gs/`, `normalizeBase`) and **Task 7** (`localFileUrl` with base `/gs/`).
3. **Direct visit or refresh with a trailing slash.** Apache's `DirectorySlash` redirects `/accreditation-areas` to `/accreditation-areas/`, and the app must still render that page, not the 404. Pinned in **Task 9** (router trailing-slash test).
4. **Production build with everything pending.** No empty dropdown, empty section or blank page may appear. Navigation keeps index links, pages show the "materials being prepared" note, and Home is not an empty shell. Pinned in **Task 11** (nav model with zero visible areas) and **Task 25** (Home with every slot pending in production mode).
5. **Heavy evidence pages.** Seven or more PDFs or 70+ photos on a page must not mount seven Drive players. Evidence previews mount only on demand, and nothing overflows at 320px. Pinned in **Task 15** (no iframe before *Preview*) and **Task 27** (320px rendered check).

## Spec deltas (decided while planning)

None of these changes an approved decision. Each fills a gap or adapts to a verified constraint.

| Delta | Reason |
|---|---|
| `Area` and `Recommendation` gain `status: Status`. | D5 says every item has a status. Needed so a pending area is hidden in production. |
| `ImageAsset` gains `srcSet?: string`. A helper `toImageAsset()` maps vite-imagetools `Picture` output. | Spec §7 requires responsive `srcset`. |
| `Area.gallery` is a `Slot<ImageAsset[]>` instead of a bare `ImageAsset[]`. | Gives the gallery a pending label, the same as the other single items. |
| `EvidenceGroup` takes a `headingLevel` prop (2 on area pages, 3 on recommendation pages), and the `DocumentViewer` title is bold text, not a heading. | Keeps headings in order on both templates (spec §9). |
| Config modules are `.mjs` files with sibling `.d.mts` declarations. | Node scripts and `vite.config.ts` share them, and `tsc` still type-checks every caller. |
| New types: `Slot<T>`, `Faq`, `ResourceGroup`, `LeaderMessage`, `SiteContent`. | Spec §4 and §13 need slots for single items such as the Dean's message and the certificate. |
| Fonts are committed `.woff2` files in `public/fonts/`, copied from the `@fontsource-variable` npm tarballs (not installed as dependencies). | Matches spec §5 ("self-hosted .woff2 … preloaded") without a runtime dependency. |
| The meta-tag CSP omits `frame-ancestors` (as the spec says) and also `upgrade-insecure-requests`. | `vite preview` runs over `http://localhost`. The server header keeps both directives. |
| `safeHref` also allows `mailto:` and `tel:`. | Footer contact details (spec §4). |
| Dev-only sample data in `src/dev/` ("Sample area", "Sample 1/2/3") is included only when pending content is shown. A dist check proves it never reaches production. | The master prompt allows "Sample 1, Sample 2, Sample 3" during implementation. Without samples, the page templates can't be checked in a browser before UCN materials arrive. |
| `scripts/write-route-pages.mjs` reads the base path from `dist/index.html` instead of from environment variables. | One source of truth, and it avoids Windows/POSIX differences in setting environment variables. |
| Preview builds use `vite build --mode preview-content` with a committed `.env.preview-content`. | `VAR=x cmd` syntax fails in Windows npm scripts. |
| One agency-agents agent, `testing-accessibility-auditor`, is installed read-only for checkpoint C (Task 2). The others are skipped. | Code review, security and frontend development are already covered by `ucn-opus-reviewer`, `VibeSec-Skill` and the main session. A dedicated WCAG pass is the only gap. |

## File structure (end state)

```
.claude/agents/accessibility-auditor.md     Task 2  (read-only, from agency-agents, MIT)
.env.preview-content                        Task 5  VITE_CONTENT_PREVIEW=true
.github/workflows/ci.yml                    Tasks 3, 5 (add npm test, check:dist)
config/base.mjs                             Task 5  normalizeBase()
config/csp.mjs                              Task 5  CSP_HEADER, CSP_META, SECURITY_HEADERS
deploy/htaccess.template                    Task 5
deploy/assets.htaccess                      Task 5  long-cache for hashed assets
docs/deployment.md                          Task 5 (Apache, Nginx, HTTPS/HSTS, rollback, limits)
docs/content-guide.md                       Task 28 (how editors add content)
index.html                                  Tasks 4, 5
public/fonts/*.woff2, public/fonts/OFL-*.txt   Task 4
public/favicon-32.png, public/apple-touch-icon.png   Task 4
scripts/make-icons.mjs                      Task 4  one-off, sharp
scripts/route-paths.mjs                     Task 5  listRoutePaths()
scripts/write-route-pages.mjs               Task 5
scripts/check-dist.mjs (+ .test.ts)         Task 5
scripts/links.live.test.ts, vitest.links.config.ts   Task 26
src/main.tsx                                Task 4, 9
src/app/router.tsx, src/app/RootLayout.tsx  Task 9
src/assets/brand/ucn-logo.png               Task 1
src/components/ErrorBoundary.tsx            Task 4 (rewritten without AntD)
src/components/layout/*                     Tasks 11, 12
src/components/media/*                      Tasks 13–16
src/components/content/*                    Tasks 10, 17
src/components/ui/*                         Task 10
src/content/*.ts, areas/, recommendations/, static-routes.json, content.test.ts, routes.ts   Tasks 5, 8, 9
src/dev/samples.ts, src/dev/sample.pdf      Task 18
src/features/<family>/*                     Tasks 18–25
src/lib/safeUrl.ts, resourceUrls.ts, published.ts, images.ts, useDocumentTitle.ts, linkTargets.ts
src/pages/*Page.tsx                         Task 9 (stubs) → Tasks 19–25
src/styles/global.css (+ tokens.test.ts)    Task 4
src/test/setup.ts                           Task 3
src/types/content.ts                        Task 6
tsconfig.test.json                          Task 3
```

Deleted in Task 4:
- `src/app/App.tsx`, `src/app/AppProviders.tsx`, `src/app/routes.tsx`
- `src/components/{AppHeader,AppFooter,ContactBand,OnDark,PageBanner,SectionHeading}.tsx`
- `src/data/`, `src/features/{home,gallery,about}/`, `src/pages/*` (the old pages)
- `src/types/{media,staff}.ts`, `src/styles/tokens.ts`, `src/utils/`
- `public/media/`, `public/SchoolLogo.png`, `public/favicon.svg`

Deleted in Task 5: `vercel.json`, `public/_headers`, `public/_redirects`.

`src/utils/safeUrl.ts` and `fallbackImage.ts` move to `src/lib/`.

## Standard verification set

Referred to below as **"the standard checks"**:

```bash
npm run lint && npm run typecheck && npm test && npm run build && npm run check:dist && npm run audit:prod
```

Before Task 5, `check:dist` doesn't exist yet, so leave it out. Before Task 3, `npm test` doesn't exist yet.

Expected result:
- every command exits 0
- `npm test` reports 0 failed
- `audit:prod` reports `found 0 vulnerabilities`, or every finding is recorded with a reason in `CURRENT_STATE.md`

A task is complete only when its own steps pass **and** the standard checks pass. Never tick a checkbox for a step that wasn't run.

## Review checkpoints (CLAUDE.md workflow)

| Checkpoint | After | Scope passed to `ucn-opus-reviewer` |
|---|---|---|
| **A**: foundation | Task 12 | Tasks 3–12 diff (`git diff <task-3-base>..HEAD`); acceptance: Global Constraints and Tasks 3–12 completion criteria |
| **B**: page families and components | Task 25 | Tasks 13–25 diff; acceptance: spec §4, §6, §7 and Tasks 13–25 criteria; open findings from A |
| **C**: final | Task 28 | Whole branch vs `main`; acceptance: spec §8–§11, Global Constraints, Review Focus; open findings from A and B; reviewer runs the standard checks |

**Procedure at each checkpoint:**
1. Invoke the reviewer with the checkpoint name, the acceptance criteria, the diff range, and the open findings.
2. Copy its verdict line verbatim into `CURRENT_STATE.md`.
3. Fix every Critical and High finding. Fix Medium findings unless deferral is justified in `CURRENT_STATE.md`.
4. Rerun the standard checks.
5. If any Critical or High finding was open, re-invoke the reviewer on the same checkpoint.
6. Move on only when the verdict is `PASS` or `PASS WITH ISSUES` with no open Critical or High findings.
7. At checkpoint C, also run the `accessibility-auditor` agent (Task 27) and resolve its findings the same way.
8. Never report a review that did not run.

---

## Phase 0: Audit and setup

### Task 1: Branch, baseline, and logo intake

**Files:**
- Create: `src/assets/brand/ucn-logo.png` (byte copy of `../ucn_logo.png`)
- Modify: `CURRENT_STATE.md`

**Interfaces:**
- Produces: the logo at `src/assets/brand/ucn-logo.png` (used in Tasks 4 and 11)
- Produces: branch `feat/accreditation-site`

- [ ] **Step 1:** Confirm a clean tree. Run `git status --short`; expected: empty output. If it isn't empty, stop and ask the user. Do not stash or discard their work.
- [ ] **Step 2:** Run `git switch -c feat/accreditation-site docs/accreditation-design-spec`. Expected: `Switched to a new branch`.
- [ ] **Step 3:** Run the baseline: `npm ci && npm run lint && npm run typecheck && npm run build && npm run audit:prod`. Record each pass/fail result and the antd chunk warning under "Verification status" in `CURRENT_STATE.md`.
- [ ] **Step 4:** Copy the logo: `cp ../ucn_logo.png src/assets/brand/ucn-logo.png`. Verify with `cmp ../ucn_logo.png src/assets/brand/ucn-logo.png`; expected: no output.
- [ ] **Step 5:** Commit.

```bash
git add src/assets/brand/ucn-logo.png CURRENT_STATE.md
git commit -m "chore: add UCN logo asset and record baseline checks"
```

### Task 2: Read-only accessibility auditor agent

**Files:**
- Create: `.claude/agents/accessibility-auditor.md`

**Interfaces:**
- Produces: subagent `accessibility-auditor`, used at checkpoint C (Task 27)

- [ ] **Step 1:** Read the whole upstream file: `gh api repos/msitarzewski/agency-agents/contents/testing/testing-accessibility-auditor.md --jq .content | base64 -d`. Confirm it contains no install commands, no network calls, and no instructions to edit files. If it does, stop and report.
- [ ] **Step 2:** Write `.claude/agents/accessibility-auditor.md`:
  - **Frontmatter:** `name: accessibility-auditor`, a one-line `description`, `tools: Read, Grep, Glob, Bash`, `model: opus`.
  - **Body:** the upstream body, then the same "Hard rules" block as `.claude/agents/ucn-opus-reviewer.md` (no file changes; Bash for inspection only).
  - **Footer:** `Source: msitarzewski/agency-agents testing/testing-accessibility-auditor.md (MIT)`.
- [ ] **Step 3:** Smoke test. Invoke the agent with "List the files you would inspect for a WCAG audit of this repo. Do not modify anything." Expected: a list, and `git status --short` still empty apart from the new agent file.
- [ ] **Step 4:** Commit with `chore: add read-only accessibility auditor agent (agency-agents, MIT)`.

## Phase 1: Tooling and design foundation

### Task 3: Test harness, lint guards, and `safeHref`

**Files:**
- Modify: `package.json`
  - add the `test` script: `"vitest run"`
  - set `engines.node` to `>=22.12.0`
  - add dev dependencies: `vitest@^5.0.5 jsdom@^30.1.3 @testing-library/react@^16.3.3 @testing-library/dom@^10.4.2 @testing-library/user-event@^14.6.8 @types/node@^22`
- Modify: `vite.config.ts`. Add `/// <reference types="vitest/config" />` and this `test` block: `{ environment: 'jsdom', setupFiles: ['src/test/setup.ts'], include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts', 'config/**/*.test.ts'], exclude: ['**/*.live.test.ts', '**/node_modules/**'] }`
- Modify: `tsconfig.json` (add a reference to `./tsconfig.test.json`), `tsconfig.app.json` (add `"exclude": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test"]`)
- Create: `tsconfig.test.json`. It copies the app compiler options and sets `"types": ["vite/client", "node"]`. Include `src/**/*.test.ts`, `src/**/*.test.tsx`, `src/test`, `scripts/**/*.test.ts`, `config/**/*.test.ts`.
- Modify: `eslint.config.js`
- Move: `src/utils/safeUrl.ts` → `src/lib/safeUrl.ts` (rewritten)
- Create: `src/test/setup.ts`, `src/lib/safeUrl.test.ts`
- Modify: `.github/workflows/ci.yml` (add `- run: npm test` after typecheck)

**Interfaces:**
- Produces: `safeHref(url: string): string | null` in `src/lib/safeUrl.ts`
  - Returns root-relative paths (`/x`, but not `//x`) unchanged.
  - Returns `https:` URLs normalized through `new URL(...).toString()`.
  - Returns `mailto:` and `tel:` URLs unchanged.
  - Returns `null` for everything else, and for input that fails to parse.
- Produces: the test setup. `src/test/setup.ts` provides:
  - `afterEach(cleanup)`
  - a polyfill for `HTMLDialogElement.prototype.showModal` and `close` (sets and clears `open`, then dispatches `close`)
  - `navigator.pdfViewerEnabled = true`, overridable per test
  - a `window.matchMedia` stub that returns `matches: false`

- [ ] **Step 1:** Install the dev dependencies listed above with `npm install -D …`. Verify with `npm ls vitest jsdom`; expected: the versions resolve with no `UNMET PEER`.
- [ ] **Step 2: Write the failing test** `src/lib/safeUrl.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { safeHref } from './safeUrl';

describe('safeHref', () => {
  it.each([
    ['/files/a.pdf', '/files/a.pdf'],
    ['https://example.org/x?y=1', 'https://example.org/x?y=1'],
    ['mailto:gs@example.org', 'mailto:gs@example.org'],
    ['tel:+63541234567', 'tel:+63541234567'],
  ])('allows %s', (input, out) => expect(safeHref(input)).toBe(out));

  it.each(['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,x', 'http://example.org',
    '//evil.example', 'ftp://x', '', 'not a url'])('rejects %j', (input) => expect(safeHref(input)).toBeNull());
});
```

- [ ] **Step 3:** Run `npx vitest run src/lib/safeUrl.test.ts`. Expected: FAIL, because the module isn't found.
- [ ] **Step 4:** Implement `safeHref` in `src/lib/safeUrl.ts` and delete `src/utils/safeUrl.ts`. Update the old imports so the tree still compiles; they are removed for good in Task 4.
- [ ] **Step 5:** Add the ESLint guards to `eslint.config.js`:
  - `'no-restricted-syntax': ['error', { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: 'Render plain text; HTML rendering is banned.' }, { selector: "JSXOpeningElement[name.name='iframe']", message: 'Iframes live only in src/components/media.' }]`
  - an override for `src/components/media/**` that keeps only the first selector
- [ ] **Step 6:** Run `npm test && npm run lint && npm run typecheck`. Expected: PASS, with 12 tests passed.
- [ ] **Step 7:** Commit with `chore: add vitest harness, lint guards, and safeHref`.

### Task 4: Replace Ant Design with Tailwind, tokens, fonts, favicon, and a minimal shell

**Files:**
- Modify: `package.json`
  - remove `antd` and `@ant-design/icons`
  - add `tailwindcss@^4.3.3`, `@tailwindcss/vite@^4.3.3`, `lucide-react@^1.64.0`
  - add dev dependency `vite-imagetools@^10.0.1`
  - set `name` to `ucn-gs-accreditation-site`
- Modify: `vite.config.ts`. Add the `tailwindcss()` and `imagetools()` plugins and remove `manualChunks`.
- Rewrite: `src/styles/global.css`, `src/components/ErrorBoundary.tsx`, `src/main.tsx`, `index.html`, `src/vite-env.d.ts`
- Create: `src/styles/tokens.test.ts`, `src/lib/fallbackImage.ts` (moved), `scripts/make-icons.mjs`, `public/fonts/…`, `public/favicon-32.png`, `public/apple-touch-icon.png`
- Delete: every file listed under "Deleted in Task 4" above

**Interfaces:**
- Produces: these Tailwind theme tokens.

| Token | Value |
|---|---|
| `--color-maroon-800` | sampled from the logo |
| `--color-maroon-900` | sampled from the logo |
| `--color-gold-500` | sampled from the logo |
| `--color-paper` | `#f7f5f4` |
| `--color-line` | `#e6dedc` |
| `--color-ink` | `#2a1a1d` |
| `--color-ink-muted` | chosen to pass the contrast test |
| `--font-serif` | `"Source Serif 4 Variable", Georgia, serif` |
| `--font-sans` | `"Public Sans Variable", system-ui, sans-serif` |

  They are used as Tailwind classes, such as `bg-maroon-800`, `text-ink` and `font-serif`.
- Produces: a module declaration in `src/vite-env.d.ts` for `'*as=picture'`, typed as `{ sources: Record<string, string>; img: { src: string; w: number; h: number } }`. Use `Picture` from `vite-imagetools` if it's exported; otherwise declare a local `interface Picture` with that shape.
- Produces: `FALLBACK_IMAGE` (unchanged) at `src/lib/fallbackImage.ts`.

- [ ] **Step 1:** Run `npm uninstall antd @ant-design/icons`, then `npm install tailwindcss@^4.3.3 @tailwindcss/vite@^4.3.3 lucide-react@^1.64.0`, then `npm install -D vite-imagetools@^10.0.1`. Verify with `npm ls vite-imagetools vite`; expected: `vite@7.x`, and no peer error.
- [ ] **Step 2:** Sample the colors. In a scratch script, use `sharp` from `node_modules` to read pixel RGB values of `src/assets/brand/ucn-logo.png` in the outer pentagon band (maroon) and the left gold bar. Record the hex values in the commit message body.
- [ ] **Step 3: Write the failing test** `src/styles/tokens.test.ts` (add `// @vitest-environment node`). It reads `global.css`, extracts `--color-*: #hex;` from the `@theme` block, and computes WCAG relative-luminance contrast:

```ts
it.each([
  ['white', 'maroon-800', 7], ['ink', 'white', 7], ['ink', 'paper', 7],
  ['maroon-800', 'white', 4.5], ['maroon-800', 'paper', 4.5],
  ['gold-500', 'maroon-800', 4.5], ['gold-500', 'maroon-900', 4.5],
  ['ink-muted', 'white', 4.5], ['ink-muted', 'paper', 4.5],
])('%s on %s ≥ %d:1', (fg, bg, min) => expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(min));
it('gold-500 on white stays below 3:1 so the D9 rule is meaningful', () =>
  expect(contrast(token('gold-500'), '#ffffff')).toBeLessThan(3));
```

  `token('white')` returns `#ffffff`. Implement `contrast` and `token` inside the test file.
- [ ] **Step 4:** Run `npx vitest run src/styles/tokens.test.ts`. Expected: FAIL, because there are no tokens yet.
- [ ] **Step 5:** Write `src/styles/global.css`:
  - `@import "tailwindcss";`
  - the `@theme` tokens. If a sampled value fails a pair, darken maroon or lighten gold in 2% steps until the test passes, and note the adjustment in the commit body.
  - `@font-face` for both fonts using `url('/fonts/<file>.woff2')`, `font-display: swap`, weight range `200 900` for Source Serif 4 and `100 900` for Public Sans
  - base layer:
    - `html { font-family: var(--font-sans); color: var(--color-ink); background: #fff; }`
    - headings use `var(--font-serif)`
    - `:focus-visible { outline: 2px solid var(--color-maroon-800); outline-offset: 2px; }`
    - `.on-maroon :focus-visible { outline-color: var(--color-gold-500); }`
    - under `@media (prefers-reduced-motion: reduce)`, set `transition-duration: 0s !important; animation: none !important`
    - an `.sr-only` utility is provided by Tailwind
- [ ] **Step 6:** Add the fonts. Run `npm pack @fontsource-variable/source-serif-4@5.3.1 @fontsource-variable/public-sans@5.3.0` in the scratchpad and extract both tarballs. Copy `files/source-serif-4-latin-wght-normal.woff2`, `files/public-sans-latin-wght-normal.woff2` and each package's `LICENSE` (OFL) into `public/fonts/`, naming the licenses `OFL-source-serif-4.txt` and `OFL-public-sans.txt`. Don't add them to `package.json`.
- [ ] **Step 7:** Write `scripts/make-icons.mjs`. It uses `sharp` to write `public/favicon-32.png` (32×32) and `public/apple-touch-icon.png` (180×180) from the logo, with `fit: 'contain'` on a white background. Run `node scripts/make-icons.mjs` and confirm both files exist.
- [ ] **Step 8:** Rewrite `index.html`:
  - `<title>UCN Graduate School Accreditation</title>`
  - `<meta name="description" content="Accreditation documents and evidence of the University of Camarines Norte Graduate School.">`
  - a `theme-color` matching maroon-800
  - icon links to the two PNGs
  - two `<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/…">`
  - `<noscript><p>This site needs JavaScript to display accreditation documents.</p></noscript>`
- [ ] **Step 9:** Delete the Research Office files listed above. Rewrite `ErrorBoundary` with Tailwind markup: an `<main>` with `<h1>Something went wrong</h1>` and a reload `<button>`. Make `src/main.tsx` render `<StrictMode><ErrorBoundary><p>Placeholder shell</p></ErrorBoundary></StrictMode>` temporarily; Task 9 replaces it with the router.
- [ ] **Step 10:** Run the standard checks (without `check:dist`). Expected: PASS, and the build output no longer shows the 500 kB chunk warning.
- [ ] **Step 11:** Commit with `refactor: replace Ant Design with Tailwind v4 tokens, self-hosted fonts, and logo favicon`.

### Task 5: Base path, single-source CSP, server files, route pages, and the dist check

**Files:**
- Create: `config/base.mjs`, `config/csp.mjs`, `config/config.test.ts`, and the declarations `config/base.d.mts`, `config/csp.d.mts`, `scripts/route-paths.d.mts`, `scripts/check-dist.d.mts`
- Create: `deploy/htaccess.template`, `deploy/assets.htaccess`
- Create: `scripts/route-paths.mjs`, `scripts/write-route-pages.mjs`, `scripts/check-dist.mjs`, `scripts/check-dist.test.ts`
- Create: `src/content/static-routes.json`, `src/content/areas/.gitkeep`, `src/content/recommendations/.gitkeep`
- Create: `.env.preview-content`
- Create: `docs/deployment.md`
- Modify: `vite.config.ts` (`base` from `normalizeBase(loadEnv(mode, cwd, '').VITE_BASE_PATH)`; the CSP meta plugin imports `CSP_META`)
- Modify: `package.json` scripts:
  - `"build": "tsc -b && vite build && node scripts/write-route-pages.mjs"`
  - `"build:preview": "tsc -b && vite build --mode preview-content && node scripts/write-route-pages.mjs"`
  - `"check:dist": "node scripts/check-dist.mjs"`
- Modify: `.gitignore` (`!.env.preview-content`), `.github/workflows/ci.yml` (add `- run: npm run check:dist` after build)
- Delete: `vercel.json`, `public/_headers`, `public/_redirects`

**Interfaces:**
- Produces: `normalizeBase(input?: string): string`. It returns `/` for empty or undefined input, and otherwise a value with exactly one leading and one trailing slash.
- Produces, in `config/csp.mjs`:
  - `CSP_HEADER: string`, the exact spec §8 string with directives joined by `; `
  - `CSP_META: string`, the same string without `frame-ancestors` and `upgrade-insecure-requests`
  - `FRAME_HOSTS: readonly string[]`, the four hosts
  - `SECURITY_HEADERS: Record<string, string>`. It contains `Content-Security-Policy` (`CSP_HEADER`) plus the existing `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `Cross-Origin-Opener-Policy` values from today's `vercel.json`. No HSTS, which is documented as conditional.
- Produces: `src/content/static-routes.json`. It is an array of `{ "path": string, "title": string, "kind": RouteKind }` in this order:

| path | title | kind |
|---|---|---|
| `/` | Home | `home` |
| `/accreditation-areas` | Accreditation Areas | `areas-index` |
| `/compliance-report` | Compliance Report | `compliance-index` |
| `/avp` | Audio Visual Presentations | `avp` |
| `/certificate-of-authenticity` | Certificate of Authenticity | `certificate` |
| `/additional-files` | Additional Files for the Accreditors | `additional-files` |
| `/about` | About the Graduate School | `about` |
| `/about/people` | Faculty, Staff and Student Assistants | `about-people` |
| `/about/faculty-by-department` | Faculty by Department | `about-faculty` |
| `/about/faqs-and-location` | FAQs and Location | `about-faqs` |

  `/content-status` is **not** in this file; it is dev-only (Task 9).
- Produces: `listRoutePaths(contentDir: string): string[]` in `scripts/route-paths.mjs`. It returns:
  - the static paths
  - `/accreditation-areas/<basename>` for each `areas/*.ts` file
  - `/compliance-report/recommendation-<n>` for each `recommendations/rec-NN.ts` file, where `n` is the number without leading zeros

  Files named `*.test.ts` and `.gitkeep` are ignored.
- Produces: `checkDist(distDir: string): string[]` in `scripts/check-dist.mjs` (exported; a CLI wrapper exits 1 when the list isn't empty). It returns one error message per failed rule. The base is read from the first `<script type="module" src="…">` in `dist/index.html`: the part of `src` before `assets/`. For example, `/gs/assets/index-a.js` gives the base `/gs/`. Rules:
  1. `dist/index.html` and `dist/404.html` exist.
  2. Every `listRoutePaths('src/content')` path except `/` has `dist/<path>/index.html`.
  3. `dist/.htaccess` contains `ErrorDocument 404 <base>404.html` and `CSP_HEADER`. `dist/assets/.htaccess` exists.
  4. Every `src=` and `href=` in `dist/index.html` that starts with `/` starts with `<base>`.
  5. No file under `dist/` contains the string `DEV-SAMPLE`. The `/content-status` route is excluded at runtime (Task 9), so its path string legitimately remains in the bundle.
  6. The gzip size of the entry script plus every `<link rel="modulepreload">` in `dist/index.html` is ≤ 122,880 bytes.
- Produces: `scripts/write-route-pages.mjs`. It reads the base the same way, copies `dist/index.html` to `dist/<path>/index.html` for each route path and to `dist/404.html`, and writes `dist/.htaccess` from the template with `__BASE__` and `__CSP__` (and the other headers) replaced. It also copies `deploy/assets.htaccess` to `dist/assets/.htaccess`.
- `deploy/htaccess.template` contains:
  - `Options -Indexes`
  - `DirectorySlash On`
  - `ErrorDocument 404 __BASE__404.html`
  - `<IfModule mod_headers.c>` with one `Header always set` line per security header
  - `Cache-Control: no-cache` for `*.html`
- `deploy/assets.htaccess` contains `Header set Cache-Control "public, max-age=31536000, immutable"`.

- [ ] **Step 1: Write the failing tests** `config/config.test.ts` (node environment):

```ts
it.each([[undefined, '/'], ['', '/'], ['gs', '/gs/'], ['/gs', '/gs/'], ['/gs/', '/gs/'], ['//a//', '/a/']])(
  'normalizeBase(%j) → %s', (i, o) => expect(normalizeBase(i)).toBe(o));
it('CSP header is the spec string', () => expect(CSP_HEADER).toBe(
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://i.ytimg.com; frame-src https://drive.google.com https://docs.google.com https://www.youtube-nocookie.com https://www.google.com; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests"));
it('meta CSP drops header-only directives', () => {
  expect(CSP_META).not.toMatch(/frame-ancestors|upgrade-insecure-requests/);
  expect(CSP_META).toContain("frame-src https://drive.google.com");
});
```

- [ ] **Step 2: Write the failing tests** `scripts/check-dist.test.ts`. Build temporary dist fixtures under `os.tmpdir()`:
  - `it('passes a complete dist built for base /gs/')`: a fixture with `<script type="module" src="/gs/assets/index-a.js">`, every route folder, both `.htaccess` files and a small entry chunk → `[]`.
  - `it('flags a root-absolute asset URL when base is /gs/')`: add `<link href="/fonts/x.woff2">` → one error mentioning `/fonts/x.woff2`.
  - `it('flags a missing route copy')`: remove `about/people/index.html` → an error mentioning `/about/people`.
  - `it('flags DEV-SAMPLE leakage')`: put `DEV-SAMPLE` in a chunk → an error.
  - `it('flags first-load JS over 120 kB gzip')`: a 400 kB random-content chunk → an error.
  - `it('listRoutePaths maps rec-03.ts to /compliance-report/recommendation-3 and ignores .gitkeep')`.
- [ ] **Step 3:** Run `npx vitest run config scripts`. Expected: FAIL, because the modules don't exist.
- [ ] **Step 4:** Implement `config/base.mjs`, `config/csp.mjs`, `scripts/route-paths.mjs`, `scripts/check-dist.mjs`, `scripts/write-route-pages.mjs` and the templates, and wire `vite.config.ts`. Write the matching `.d.mts` declaration for each `.mjs` module so `tsc -b` checks every caller.
- [ ] **Step 5:** Run `npx vitest run config scripts`. Expected: PASS.
- [ ] **Step 6:** Write `docs/deployment.md`:
  - Apache: requires `mod_headers`; upload `dist/` including the dotfiles
  - the Nginx equivalent: `try_files $uri $uri/index.html =404; error_page 404 <base>404.html;`, the same headers via `add_header … always;`, and an immutable cache for `/assets/`
  - HTTPS and HSTS (`Strict-Transport-Security: max-age=63072000; includeSubDomains`), only once HTTPS is confirmed
  - building for a subpath (`VITE_BASE_PATH=/gs/` in `.env.production.local`)
  - deploy access, MFA and branch protection
  - rollback: keep the previous `dist/` as `dist-previous/`
  - a "Limits" paragraph: a static frontend can't prevent DDoS or server-level defacement
- [ ] **Step 7:** Delete `vercel.json`, `public/_headers` and `public/_redirects`. Run the standard checks, then `npm run build:preview` and `npm run check:dist`. Expected: everything passes, and `dist/about/people/index.html` and `dist/.htaccess` exist.
- [ ] **Step 8:** Run the subpath check. Create `.env.production.local` (git-ignored) with `VITE_BASE_PATH=/gs/`, run `npm run build && npm run check:dist`, and expect PASS. Delete the file afterwards.
- [ ] **Step 9:** Commit with `build: add base-path support, single-source CSP, Apache config, per-route pages, and dist checks`.

## Phase 2: Content model and routing

### Task 6: Content types and published filtering

**Files:**
- Create: `src/types/content.ts`, `src/lib/published.ts`, `src/lib/published.test.ts`

**Interfaces:**
- Produces: `src/types/content.ts`, exactly as below. These are the spec §6 types plus the planning deltas.

```ts
export type Status = 'published' | 'pending';
export type ResourceFormat = 'pdf' | 'image' | 'video' | 'folder' | 'doc' | 'link';
export type ResourceSource =
  | { kind: 'local'; path: `/files/${string}` }
  | { kind: 'drive'; fileId: string }
  | { kind: 'drive-folder'; folderId: string }
  | { kind: 'youtube'; videoId: string }
  | { kind: 'external'; url: string };
interface ResourceBase { id: string; title: string; description?: string; format: ResourceFormat; downloadable?: boolean }
export type Resource = ResourceBase &
  ({ status: 'published'; source: ResourceSource } | { status: 'pending'; source?: ResourceSource });
export interface ImageAsset { src: string; srcSet?: string; width: number; height: number; alt: string; caption?: string }
export type Slot<T> = { label: string } & ({ status: 'published'; value: T } | { status: 'pending'; value?: T });
export type EvidenceBlock =
  | { type: 'text'; paragraphs: string[]; lang?: string }
  | { type: 'document'; resource: Resource; embed?: boolean }
  | { type: 'resources'; items: Resource[] }
  | { type: 'gallery'; images: ImageAsset[] }
  | { type: 'video'; resource: Resource };
export interface EvidenceGroup { id: string; title: string; status: Status; blocks: EvidenceBlock[] }
export interface Area {
  slug: string; order: number; title: string; status: Status; summary?: string[];
  gallery: Slot<ImageAsset[]>; narrativeReport: Resource; groups: EvidenceGroup[];
  additionalFiles: Resource[]; avp?: Resource & { avpTitle?: string };
}
export interface Recommendation {
  number: number; title: string; status: Status; statement?: string[];
  document: Resource; evidence: EvidenceGroup[]; additionalFiles: Resource[];
}
export type PersonRole = 'official' | 'faculty' | 'staff' | 'student-assistant';
export interface Person {
  id: string; name: string; postNominals?: string; position: string; rank?: string;
  department?: string; role: PersonRole; photo?: ImageAsset; status: Status;
}
export interface Faq { id: string; question: string; answer: string[]; status: Status }
export interface ResourceGroup { id: string; title: string; status: Status; items: Resource[] }
export interface LeaderMessage { name: string; position: string; photo?: ImageAsset; paragraphs: string[] }
export interface SiteContent {
  universityName: string; schoolName: string; programName: Slot<string>;
  areasLabel: string; contentUpdated: string; // ISO date
  contact: Slot<{ address: string; email?: string; phone?: string; hours?: string }>;
  mapQuery: Slot<string>;
}
```

- Produces, in `src/lib/published.ts`:
  - `showPending(): boolean`, which returns `import.meta.env.DEV || import.meta.env.VITE_CONTENT_PREVIEW === 'true'` and is read at call time so tests can use `vi.stubEnv`
  - `isVisible(item: { status: Status }): boolean`
  - `visible<T extends { status: Status }>(items: readonly T[]): T[]`
  - `slotValue<T>(slot: Slot<T>): T | undefined`, which returns the value only when the slot is published
  - `isSlotVisible(slot: Slot<unknown>): boolean`, the same as `isVisible`
- Add `VITE_CONTENT_PREVIEW?: string` to `ImportMetaEnv` in `src/vite-env.d.ts`.

- [ ] **Step 1: Write the failing test** `src/lib/published.test.ts`:

```ts
afterEach(() => vi.unstubAllEnvs());
const items = [{ status: 'published' as const, id: 'a' }, { status: 'pending' as const, id: 'b' }];
it('production hides pending', () => { vi.stubEnv('DEV', false); vi.stubEnv('VITE_CONTENT_PREVIEW', '');
  expect(visible(items).map((i) => i.id)).toEqual(['a']); expect(showPending()).toBe(false); });
it('preview shows pending', () => { vi.stubEnv('DEV', false); vi.stubEnv('VITE_CONTENT_PREVIEW', 'true');
  expect(visible(items)).toHaveLength(2); });
it('dev shows pending', () => { vi.stubEnv('DEV', true); expect(isVisible(items[1]!)).toBe(true); });
it('slotValue never returns a pending value', () =>
  expect(slotValue({ label: 'x', status: 'pending', value: 'draft' })).toBeUndefined());
```

- [ ] **Step 2:** Run `npx vitest run src/lib/published.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `src/types/content.ts` and `src/lib/published.ts`.
- [ ] **Step 4:** Run the test again. Expected: PASS. Then run `npm run typecheck`; expected: PASS.
- [ ] **Step 5:** Commit with `feat: add typed content model and published/pending filtering`.

### Task 7: Resource URL builders and the image helper

**Files:**
- Create: `src/lib/resourceUrls.ts`, `src/lib/resourceUrls.test.ts`, `src/lib/images.ts`, `src/lib/images.test.ts`

**Interfaces:**
- Consumes: `ResourceSource`, `ImageAsset` (Task 6), `safeHref` (Task 3). The test imports `FRAME_HOSTS` from `../../config/csp.mjs` (Task 5).
- Produces, in `src/lib/resourceUrls.ts`:
  - `isDriveId(id: string): boolean`, which matches `/^[A-Za-z0-9_-]{20,}$/`
  - `isYouTubeId(id: string): boolean`, which matches `/^[A-Za-z0-9_-]{11}$/`
  - `localFileUrl(path: string, base: string = import.meta.env.BASE_URL): string`, which joins base and path with exactly one slash
  - `embedUrl(source: ResourceSource): string | null`:
    - drive → `https://drive.google.com/file/d/{id}/preview`
    - youtube → `https://www.youtube-nocookie.com/embed/{id}`
    - local → `localFileUrl(path)`
    - drive-folder and external → `null`
    - an invalid ID → `null`
  - `viewUrl(source: ResourceSource): string | null`:
    - drive → `https://drive.google.com/file/d/{id}/view`
    - drive-folder → `https://drive.google.com/drive/folders/{id}`
    - youtube → `https://www.youtube.com/watch?v={id}`
    - local → `localFileUrl`
    - external → `safeHref(url)`
  - `downloadUrl(source: ResourceSource): string | null`:
    - local → `localFileUrl`
    - drive → `https://drive.google.com/uc?export=download&id={id}`
    - anything else → `null`
  - `youtubePosterUrl(id: string): string`, which returns `https://i.ytimg.com/vi/{id}/hqdefault.jpg`
  - `mapEmbedUrl(query: string): string`, which returns `https://www.google.com/maps?q={encodeURIComponent(query)}&output=embed`
  - `mapLinkUrl(query: string): string`, which returns `https://www.google.com/maps/search/?api=1&query={encodeURIComponent(query)}`
  - `hostLabel(source: ResourceSource): 'This site' | 'Google Drive' | 'YouTube' | string`, where an external URL gives its hostname
- Produces, in `src/lib/images.ts`:
  - `toImageAsset(picture: Picture, alt: string, caption?: string): ImageAsset`. It sets `src` to `img.src`, `width` to `img.w`, `height` to `img.h`, and `srcSet` to the first value in `sources`.
  - `PHOTO_QUERY`, a documented convention for editors: `?w=480;960;1600&format=webp&as=picture`

- [ ] **Step 1: Write the failing tests:**
  - `it('every embed URL uses an allowed frame host')`: for the drive, youtube and local fixtures, `new URL(embedUrl(s)!, 'https://x').hostname` is in `FRAME_HOSTS`, or the URL is root-relative.
  - `it('rejects malformed IDs')`: `embedUrl({ kind: 'drive', fileId: '../../x' })` and `embedUrl({ kind: 'youtube', videoId: 'abc' })` are `null`.
  - `it('never embeds external or folder sources')`.
  - `it('localFileUrl respects base /gs/')`: `localFileUrl('/files/a.pdf', '/gs/')` is `'/gs/files/a.pdf'`, and with `'/'` it is `'/files/a.pdf'`. (Review Focus #2)
  - `it('viewUrl of an external javascript: URL is null')`.
  - `it('mapEmbedUrl encodes the query')`: `mapEmbedUrl('A & B')` contains `q=A%20%26%20B&output=embed`.
  - `it('toImageAsset maps picture output')`, using a literal `Picture` fixture.
- [ ] **Step 2:** Run `npx vitest run src/lib/resourceUrls.test.ts src/lib/images.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement both modules.
- [ ] **Step 4:** Run the tests again. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: add ID-based embed/view/download URL builders and image helper`.

### Task 8: Content modules and the content validation test

**Files:**
- Create: `src/content/site.ts`, `home.ts`, `about.ts`, `people.ts`, `faqs.ts`, `documents.ts`, `compliance.ts`, `index.ts`, `content.test.ts`

**Interfaces:**
- Consumes: the types (Task 6), `listRoutePaths` (Task 5)
- Produces, in `src/content/index.ts`:
  - `site: SiteContent`
  - `home: HomeContent`
  - `about: AboutContent`
  - `people: Person[]`
  - `faqs: Faq[]`
  - `certificate: CertificateContent`
  - `additionalFiles: ResourceGroup[]`
  - `compliance: { overview: Slot<string[]> }`
  - `areas: Area[]`, from `import.meta.glob('./areas/*.ts', { eager: true, import: 'default' })`, sorted by `order`
  - `recommendations: Recommendation[]`, from the glob `./recommendations/rec-*.ts`, sorted by `number`

  Samples are merged in Task 18.
- The new content interfaces are declared in `src/types/content.ts`:

```ts
export interface HomeContent {
  leadershipSlides: Slot<ImageAsset[]>; accreditationSlide1: Slot<ImageAsset>;
  accreditationHeading: string; accreditationSlide2: Slot<ImageAsset>;
  gallery: Slot<ImageAsset[]>; video: Resource;
  deanMessage: Slot<LeaderMessage>; programChairMessage: Slot<LeaderMessage>;
}
export interface AboutContent {
  photo: Slot<ImageAsset>; mission: Slot<string[]>; vision: Slot<string[]>;
  goals: Slot<string[]>; objectives: Slot<string[]>; history: Slot<string[]>;
}
export interface CertificateContent { pdf: Resource; image: Slot<ImageAsset> }
```

- **Initial values.** Use only verified facts.
  - `site.universityName = 'University of Camarines Norte'`, `schoolName = 'Graduate School'`, `areasLabel = 'Accreditation Areas'`, and `contentUpdated` set to the commit date.
  - `home.accreditationHeading = 'LEVEL IV AACCUP ACCREDITATION'`.
  - Everything else is a `pending` slot or resource. Each gets a descriptive `label` taken from spec §13, for example `label: "Dean's photograph and message"`.
  - `people`, `faqs`, `areas` and `recommendations` start as empty arrays (no area or recommendation files).
- Produces: `src/content/content.test.ts` (node environment, with Vite plugins active through the shared config). Its rules apply to every resource, image and person reachable from `index.ts` exports:
  1. `id` values are unique across all resources, evidence groups, people, FAQs and resource groups.
  2. A local `source.path` exists at `public${path}`.
  3. A `drive` or `youtube` ID passes `isDriveId` or `isYouTubeId`.
  4. An `external` URL passes `safeHref` and starts with `https:`, and doesn't start with `https://www.google.com/url`.
  5. A published `Resource` has a `source`.
  6. Every published `Person` has a non-empty `name` and `position`.
  7. A published image in `home.accreditationSlide1/2`, a gallery, or a person photo has non-empty `alt`.
  8. An area file's basename equals its `slug`, and a recommendation file `rec-NN` has `number === NN`.
  9. Area slugs match `/^[a-z0-9]+(-[a-z0-9]+)*$/`.

- [ ] **Step 1: Write the failing test** `src/content/content.test.ts`. It contains one `it` per rule above, run over the real content. Rule 8 enumerates the globbed module keys. Also add `it('rejects a bad fixture')` cases that call the same exported rule functions (`checkResources`, `checkPeople`, `checkFilenames` in `src/content/validate.ts`) with a broken fixture for each rule, and assert that each one returns a message.
- [ ] **Step 2:** Run `npx vitest run src/content`. Expected: FAIL, because the modules don't exist.
- [ ] **Step 3:** Implement `src/content/validate.ts` (pure functions that return `string[]`), then the content modules with the initial values above.
- [ ] **Step 4:** Run the test again. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: add content modules with pending slots and content validation tests`.

### Task 9: Route manifest, router, root layout, and page stubs

**Files:**
- Create: `src/content/routes.ts`, `src/content/routes.test.ts`, `src/app/router.tsx`, `src/app/RootLayout.tsx`, `src/app/router.test.tsx`, `src/lib/useDocumentTitle.ts`
- Create the stub pages in `src/pages/`: `HomePage`, `AreasIndexPage`, `AreaPage`, `ComplianceIndexPage`, `RecommendationPage`, `AvpPage`, `CertificatePage`, `AdditionalFilesPage`, `AboutPage`, `PeoplePage`, `FacultyByDepartmentPage`, `FaqsLocationPage`, `ContentStatusPage`, `NotFoundPage`. Each has a default export that renders `<h1 id="page-title" tabIndex={-1}>{entry.title}</h1>` for now. The exceptions:
  - `HomePage` renders `` `${site.universityName} Graduate School` ``
  - `NotFoundPage` renders `Page not found`
  - the `/content-status` entry's title is `Content status`
- Modify: `src/main.tsx` (render `<RouterProvider router={createAppRouter()} />` inside `ErrorBoundary`)

**Interfaces:**
- Produces, in `src/content/routes.ts`:
  - `type RouteKind = 'home' | 'areas-index' | 'area' | 'compliance-index' | 'recommendation' | 'avp' | 'certificate' | 'additional-files' | 'about' | 'about-people' | 'about-faculty' | 'about-faqs' | 'content-status'`
  - `interface RouteEntry { path: string; title: string; kind: RouteKind; parentPath?: string; slug?: string; number?: number; devOnly?: boolean }`
  - `buildRouteManifest(input: { areas: readonly Area[]; recommendations: readonly Recommendation[]; includePending: boolean }): RouteEntry[]`. Its output, in order:
    1. the static routes
    2. one area entry per visible area: title is the area title, `parentPath: '/accreditation-areas'`
    3. one recommendation entry per visible recommendation: title `Recommendation {n}`, `parentPath: '/compliance-report'`
    4. `/content-status` (`devOnly: true`) when `includePending` is true

    The About children have `parentPath: '/about'`. The Certificate and Additional Files entries have no parent.
  - `routeManifest: RouteEntry[]`, which is `buildRouteManifest({ areas, recommendations, includePending: showPending() })`
- Produces, in `src/app/router.tsx`:
  - `buildRouteObjects(manifest: RouteEntry[]): RouteObject[]`. It returns one root route with `Component: RootLayout` and children, one per entry. Each child has `path` (relative, without the leading slash) and `handle: { entry }`, and loads its page through `lazy: () => import(...)` using a `kind → page` map. A final `*` child renders `NotFoundPage`.
  - `createAppRouter(): Router`, which calls `createBrowserRouter(buildRouteObjects(routeManifest), { basename })`, where `basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'`
- Produces: `useRouteEntry(): RouteEntry | undefined`, which reads the deepest match's `handle.entry`, and `useDocumentTitle(title: string): void`, which sets `` `${title} · UCN Graduate School` ``, or just `UCN Graduate School Accreditation` on Home.
- `RootLayout` renders `<Outlet/>` inside `<main id="main">` with `<ScrollRestoration/>` and a `Suspense` fallback. Header and footer are added in Tasks 11 and 12. After navigation (not on first load), when `location.pathname` changes, it focuses `#page-title`.
- Pages look up their data with `useParams()`. An unknown slug or number renders `NotFoundPage`.

- [ ] **Step 1: Write the failing tests:**
  - `routes.test.ts`:
    - `it('production manifest without content has exactly the 10 static routes')`
    - `it('pending area is excluded unless includePending')`
    - `it('adds /content-status only when includePending')`
    - `it('content-file routes match the server route list')`: the non-`devOnly` paths of `buildRouteManifest({ areas, recommendations, includePending: true })` (real content, no samples), sorted, equal `listRoutePaths('src/content')`, sorted.
  - `router.test.tsx`, using `createMemoryRouter(buildRouteObjects(manifest), { initialEntries: [path] })` with a fixture manifest that includes one area `research` and recommendation 1:
    - `it.each(allPaths)('renders the h1 for %s')`: each path renders `findByRole('heading', { level: 1, name })`. `name` is `entry.title`, except on `/`, where it is "University of Camarines Norte Graduate School".
    - `it('renders the page with a trailing slash')`: `/accreditation-areas/research/` shows the Research h1. (Review Focus #3)
    - `it('unknown path renders the 404 page')`: `/nope` shows `heading 'Page not found'`.
    - `it('unknown area slug renders the 404 page')`.
    - `it('sets document.title')`.
    - `it('moves focus to the h1 after client navigation')`: click a `Link` and expect `document.activeElement` to be `#page-title`.
- [ ] **Step 2:** Run `npx vitest run src/content/routes.test.ts src/app`. Expected: FAIL.
- [ ] **Step 3:** Implement the manifest, router, layout, hooks and stubs.
- [ ] **Step 4:** Run the tests again (expected: PASS), then the standard checks (expected: PASS). Then run `npm run dev` and confirm `/`, `/about/people` and `/content-status` render their h1 without console errors.
- [ ] **Step 5:** Commit with `feat: add content-driven route manifest, data router, and page stubs`.

## Phase 3: Shared layout and UI (ends with checkpoint A)

### Task 10: UI primitives

**Files:**
- Create in `src/components/ui/`: `ActionLink.tsx`, `Badge.tsx`, `SectionHeading.tsx`, `Disclosure.tsx`
- Create in `src/components/content/`: `PendingNotice.tsx`, `Prose.tsx`
- Create the tests next to each

**Interfaces:**
- Produces:
  - `<ActionLink href: string; children; variant?: 'link' | 'primary' | 'secondary'; download?: boolean; newTab?: boolean />`
    - Resolves `href` with `safeHref`. If that returns `null`, it renders `<span>{children}</span>`.
    - A root-relative `href` without `download` renders a React Router `<Link>`.
    - Anything else renders `<a>`. External links (`https:`) default to `newTab: true`.
    - `newTab` adds `target="_blank" rel="noopener noreferrer"`, an `ExternalLink` icon from lucide (`aria-hidden`) and `<span className="sr-only"> (opens in new tab)</span>`.
    - It never re-prefixes the base path, because callers pass `localFileUrl()` output.
  - `<Badge format: ResourceFormat />`, which shows the text `PDF`, `Video`, `Folder`, `Doc`, `Link` or `Image`. Text, not color only.
  - `<SectionHeading level: 2 | 3; id?: string; children />`, which adds a gold rule under the heading on maroon backgrounds only.
  - `<Disclosure summary: ReactNode; children; defaultOpen?: boolean />`, a native `<details>`/`<summary>` with a 44px summary target and a chevron that rotates (no rotation when reduced motion is set).
  - `<PendingNotice label: string />`. It renders `null` when `showPending()` is false. Otherwise it shows a dashed `line`-bordered box: "Pending: {label}" with `role="note"`.
  - `<Prose paragraphs: readonly string[]; lang?: string />`, which renders `<p>` elements at `max-w-[70ch]`.

- [ ] **Step 1: Write the failing tests:**
  - `it('external link opens in new tab with rel and sr text')`
  - `it('javascript: href renders plain text, no anchor')`: `queryByRole('link')` is null
  - `it('internal path renders a router link')`, inside a `MemoryRouter`
  - `it('download link has download attribute and no target')`
  - `it('PendingNotice renders nothing in production')`: `vi.stubEnv('DEV', false)`
  - `it('PendingNotice shows the label in dev')`
  - `it('Prose sets lang')`
  - `it('Disclosure toggles open with Enter on summary')`, using user-event
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the components with Tailwind classes, using tokens only.
- [ ] **Step 4:** Run the tests again (expected: PASS) and `npm run lint` (expected: PASS).
- [ ] **Step 5:** Commit with `feat: add ActionLink, Badge, SectionHeading, Disclosure, PendingNotice, Prose`.

### Task 11: Header, navigation, and skip link

**Files:**
- Create in `src/components/layout/`: `SiteHeader.tsx`, `DesktopNav.tsx`, `MobileNav.tsx`, `SkipLink.tsx`, `navModel.ts`, `navModel.test.ts`, `SiteHeader.test.tsx`
- Modify: `src/app/RootLayout.tsx` (render `<SkipLink/>` and `<SiteHeader/>` before `<main>`)

**Interfaces:**
- Consumes: `RouteEntry`, `routeManifest`, `site` (Task 8), the logo `?w=64;128&format=webp&as=picture` via `toImageAsset`
- Produces:
  - `interface NavItem { label: string; path: string; children?: { label: string; path: string }[] }`
  - `buildNavModel(manifest: readonly RouteEntry[], areasLabel: string): NavItem[]`. Its output, in order:

| Item | Children |
|---|---|
| Home | none |
| `{areasLabel}` | area entries |
| Compliance Report | recommendation entries |
| AVP | none |
| Documents | Certificate of Authenticity, Additional Files |
| About | About the Graduate School, Faculty, Staff and Student Assistants, Faculty by Department, FAQs and Location |

    A group with no children keeps its own link, and `children` is omitted (Review Focus #4). The Documents parent's `path` is `/certificate-of-authenticity`.
  - `isActive(item: NavItem, pathname: string): boolean`. It is true when the pathname equals `item.path`, or any child's path, or starts with `item.path + '/'` (the Home path `/` must match exactly).
- **Behavior:**
  - **Header:** a white bar with the logo (`height` 48px, width from the aspect ratio, `alt="University of Camarines Norte seal"`), plus text in two lines: "University of Camarines Norte" (serif) and "Graduate School". The block links to `/`.
  - **Desktop nav (≥1024px):** each item with children is a link plus a separate 44px chevron `<button aria-expanded aria-controls>`. Each dropdown is a `<ul>` of links.
    - Esc closes the dropdown and returns focus to the button.
    - Clicking outside closes it, and so does focus leaving the item.
    - Opening one dropdown closes the others.
    - The active item has `aria-current="page"` (exact match) or `aria-current="true"` (an ancestor), plus a 3px maroon underline.
  - **Mobile nav (<1024px):** a "Menu" button opens a `<dialog>` (via `showModal()`) with a close button, and each group is a `Disclosure`. Choosing a link closes the dialog.
  - **Skip link:** `<a href="#main">Skip to main content</a>`, visible on focus.

- [ ] **Step 1: Write the failing tests:**
  - `navModel.test.ts`:
    - `it('builds the six top-level items in order')`
    - `it('omits children for a group with zero visible areas but keeps the index link')`
    - `it('lists recommendations in number order')`
    - `it('isActive matches descendants but Home only exactly')`
  - `SiteHeader.test.tsx`, in a memory router at `/compliance-report/recommendation-1`, with a fixture manifest:
    - `it('marks Compliance Report as current ancestor')`
    - `it('dropdown button toggles aria-expanded and Esc returns focus')`
    - `it('opening one dropdown closes the other')`
    - `it('mobile menu opens a dialog and closes on link click')`
    - `it('skip link targets #main')`
    - `it('logo has alt text and links home')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the header and navigation.
- [ ] **Step 4:** Run the tests again (expected: PASS), then the standard checks (expected: PASS).
- [ ] **Step 5:** Commit with `feat: add site header with accessible desktop dropdowns, mobile dialog nav, and skip link`.

### Task 12: Page header, breadcrumbs, pager, footer, and page shell, then design pass and checkpoint A

**Files:**
- Create in `src/components/layout/`: `PageHeader.tsx`, `Breadcrumbs.tsx`, `crumbs.ts`, `Pager.tsx`, `SiteFooter.tsx`, `PageShell.tsx`, `layout.test.tsx`. Non-component helpers live in `.ts` files so that `react-refresh/only-export-components` holds.
- Modify: `src/app/RootLayout.tsx` (add the footer), and every stub page (use `PageShell`)

**Interfaces:**
- Produces:
  - `buildCrumbs(entry: RouteEntry, manifest: readonly RouteEntry[]): { label: string; path?: string }[]` in `crumbs.ts`. It returns Home, then each ancestor by `parentPath`, then the current entry with no path.
  - `<Breadcrumbs/>`, using `useRouteEntry()`. It renders `nav aria-label="Breadcrumb"` with an `<ol>`, and the last item has `aria-current="page"`. It renders nothing on Home.
  - `<PageHeader title: string; intro?: string[] />`. It renders a white band: breadcrumbs, then `h1#page-title` (serif, `tabIndex={-1}`), then a 64×3px gold rule (decorative, `aria-hidden`), then `Prose`. It calls `useDocumentTitle(title)`.
  - `<PageShell title; intro?; hasContent: boolean; children />`. It renders `PageHeader`, then either `children` or, when `hasContent` is false, `<p>Materials for this page are being prepared.</p>`.
  - `<Pager items: readonly { title: string; path: string }[]; currentPath: string />`. It renders previous/next links labeled "Previous: {title}" and "Next: {title}", inside `nav aria-label="Pager"`, and nothing when there's only one item.
  - `<SiteFooter/>`, in a `bg-maroon-900` block with the `on-maroon` class:
    - the logo and names
    - the contact details from `slotValue(site.contact)`, rendered only when published
    - the main links from `buildNavModel`
    - "Content last updated {formatted site.contentUpdated}" using `toLocaleDateString('en-PH', { dateStyle: 'long' })`
    - "© {year} University of Camarines Norte"

- [ ] **Step 1: Write the failing tests** `layout.test.tsx`:
  - `it('crumbs for a recommendation are Home › Compliance Report › Recommendation 1')`
  - `it('no breadcrumbs on Home')`
  - `it('PageShell shows the preparing note when hasContent is false')`
  - `it('Pager on the first item has only Next')`
  - `it('footer hides pending contact')`: `vi.stubEnv('DEV', false)`
  - `it('footer formats contentUpdated')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the components and wire every stub page through `PageShell`.
- [ ] **Step 4:** Run the tests again (expected: PASS), then the standard checks (expected: PASS).
- [ ] **Step 5: Design refinement.**
  1. Load the `design-taste-frontend` skill and read its rules, and look through `awesome-design` for institutional or editorial references.
  2. With `npm run dev` running, use the `playwright-cli` skill to screenshot `/`, `/compliance-report` and `/about/people` at 375, 768 and 1280px.
  3. Adjust spacing, type scale and header and footer proportions **within spec §5**: no new colors, fonts or effects.
  4. Record every change in the commit body.
  5. Rerun `npm test` (expected: PASS, including the token contrast test).
- [ ] **Step 6:** Commit with `feat: add page header, breadcrumbs, pager, footer, and page shell`.
- [ ] **Step 7: Checkpoint A.** Run the checkpoint procedure with scope "Tasks 3–12". Update `CURRENT_STATE.md` with the quoted verdict and the open findings. Commit fixes as `fix: address checkpoint A finding <n>`.

## Phase 4: Media and content components

### Task 13: Slideshow

**Files:**
- Create: `src/components/media/Slideshow.tsx`, `src/components/media/Slideshow.test.tsx`

**Interfaces:**
- Consumes: `ImageAsset`, `FALLBACK_IMAGE`
- Produces: `<Slideshow label: string; slides: readonly ImageAsset[] />`
  - **Container:** `<section aria-roledescription="carousel" aria-label={label}>`.
  - **Slides:** each is `<div role="group" aria-roledescription="slide" aria-label="{i} of {n}">` containing an `<img>` with `alt`, `srcSet`, `sizes="(min-width: 1024px) 960px, 100vw"`, `width` and `height`. The first image loads eagerly and the rest lazily. On error, `src` falls back to `FALLBACK_IMAGE`.
  - **Visibility:** only the current slide is visible. The others carry the `hidden` attribute.
  - **Controls:** "Previous slide" and "Next slide" buttons that wrap around, and dot buttons labeled "Show slide {i}" with `aria-current` on the current one.
  - **Keyboard and touch:** ArrowLeft and ArrowRight move between slides while focus is inside the carousel. A horizontal swipe of more than 40px (pointer events) does the same.
  - **Announcements:** an `aria-live="polite"` region announces "Slide {i} of {n}".
  - **Edge cases:** no autoplay. A caption is shown when present. With 0 slides it renders `null`. With 1 slide the controls are hidden.

- [ ] **Step 1: Write the failing tests:**
  - `it('shows only the first slide initially')`
  - `it('Next and ArrowRight advance and wrap')`
  - `it('Previous from first goes to last')`
  - `it('announces the slide position')`
  - `it('dot click jumps and sets aria-current')`
  - `it('single slide hides controls')`
  - `it('zero slides renders nothing')`
  - `it('broken image swaps to the fallback')`: fire `error` on the img and expect `src` to be `FALLBACK_IMAGE`
  - `it('has no autoplay timer')`: with fake timers, advance 60 s and the slide is unchanged
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the component.
- [ ] **Step 4:** Run the tests again. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: add accessible manual slideshow`.

### Task 14: Image gallery with a dialog viewer

**Files:**
- Create: `src/components/media/ImageGallery.tsx`, `src/components/media/ImageGallery.test.tsx`

**Interfaces:**
- Produces: `<ImageGallery label: string; images: readonly ImageAsset[] />`
  - **Grid:** a responsive grid (2, 3 and then 4 columns), with `aspect-[4/3] object-cover` thumbnails as buttons named "View image: {alt or caption or `Image {i}`}". The images load lazily.
  - **Viewer:** clicking a thumbnail opens a `<dialog aria-label={label}>` with the full image (`object-contain`), its caption, the position "{i} of {n}", Previous and Next buttons, and Close.
  - **Keyboard:** Esc closes the dialog (natively) and focus returns to the thumbnail that opened it. Arrow keys navigate inside the dialog.
  - **Overflow:** galleries with more than 24 images show the first 24 plus a "Show all {n} photos" button. This keeps the reference's 74-image pages light.

- [ ] **Step 1: Write the failing tests:**
  - `it('opens the dialog on the clicked image')`
  - `it('ArrowRight shows the next image')`
  - `it('close returns focus to the opener')`
  - `it('initially renders 24 of 30 thumbnails and expands')`
  - `it('empty images renders nothing')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the component.
- [ ] **Step 4:** Run the tests again. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: add image gallery with native dialog viewer`.

### Task 15: DocumentViewer

**Files:**
- Create: `src/components/media/DocumentViewer.tsx`, `src/components/media/DocumentViewer.test.tsx`

**Interfaces:**
- Consumes: `Resource`, `embedUrl`, `viewUrl`, `downloadUrl`, `ActionLink`, `PendingNotice`, `isVisible`
- Produces: `<DocumentViewer resource: Resource; mode: 'embedded' | 'on-demand' />`
  - **Not visible:** when `isVisible(resource)` is false, it renders `null`.
  - **Pending:** a pending resource without a `source` renders `<PendingNotice label={resource.title}/>`.
  - **Actions row:** always shown, with the title as bold text (not a heading, so the surrounding heading order holds), the `Badge`, `hostLabel`, *Open in new tab* (`viewUrl`), and *Download* when `resource.downloadable` and `downloadUrl` are both set.
  - **Frame:** `<iframe title="{title} (PDF)" src={embedUrl} loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation" referrerPolicy="strict-origin-when-cross-origin" allow="fullscreen" className="w-full h-[min(85vh,960px)] min-h-[480px]" />`.
  - **Mode:** `embedded` renders the frame immediately. `on-demand` renders a "Preview {title}" button (`aria-expanded`) that mounts the frame when pressed and unmounts it when pressed again.
  - **Fallback:** a local source with `navigator.pdfViewerEnabled === false` renders a fallback card ("Your browser can't show this PDF here.") with Open and Download links instead of the frame. A Drive source always uses the frame.
  - **No embed URL:** when `embedUrl` returns `null`, it renders the actions row only.

- [ ] **Step 1: Write the failing tests:**
  - `it('embedded drive PDF renders a sandboxed iframe with preview URL and title')`
  - `it('on-demand mode renders no iframe until Preview is pressed')`: `queryByTitle(/PDF/)` is null, then click and the frame is present (Review Focus #5)
  - `it('local PDF without inline viewer shows fallback card')`
  - `it('download link only when downloadable')`
  - `it('pending resource without source shows PendingNotice in dev, nothing in prod')`
  - `it('malformed drive id renders actions without iframe')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the component.
- [ ] **Step 4:** Run the tests again. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: add DocumentViewer with on-demand preview and PDF fallback`.

### Task 16: VideoEmbed and MapEmbed

**Files:**
- Create: `src/components/media/VideoEmbed.tsx`, `src/components/media/MapEmbed.tsx`, and a test for each

**Interfaces:**
- Produces: `<VideoEmbed resource: Resource; poster?: ImageAsset />`
  - **Not visible:** `null`. Pending without a source: `PendingNotice`.
  - **Before click:** a 16:9 poster button named "Play video: {title}". The poster is `poster` or, for YouTube, `youtubePosterUrl`; Drive videos without a poster get a plain maroon panel with a play icon.
  - **After click:** it mounts `<iframe title={title} src={embedUrl + (youtube ? '?autoplay=1' : '')} sandbox="allow-scripts allow-same-origin allow-popups allow-presentation" allow="fullscreen; encrypted-media; picture-in-picture; autoplay" referrerPolicy="strict-origin-when-cross-origin">`. Focus moves to the frame.
  - **External source** (for example Facebook): renders `ActionLink` with the label "Watch on {hostname}" and no frame.
  - **Always:** an *Open video in new tab* link from `viewUrl`.
- Produces: `<MapEmbed query: Slot<string>; address?: string />`
  - When published, it renders a `title="Map of {address or query}"` iframe from `mapEmbedUrl` (lazy, with the same sandbox and referrer policy) plus *Open in Google Maps* (`mapLinkUrl`).
  - When pending, it renders `PendingNotice`.

- [ ] **Step 1: Write the failing tests:**
  - `it('no iframe before play; youtube-nocookie iframe after')`
  - `it('facebook external renders a link, never an iframe')`
  - `it('map renders iframe and fallback link with encoded query')`
  - `it('pending map is hidden in production')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement both components.
- [ ] **Step 4:** Run the tests again. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: add click-to-load VideoEmbed and keyless MapEmbed`.

### Task 17: Resource rows, evidence groups, and the block renderer

**Files:**
- Create in `src/components/content/`: `ResourceRow.tsx`, `ResourceList.tsx`, `EvidenceGroup.tsx`, `BlockRenderer.tsx`, `visibility.ts`, `content-components.test.tsx`

**Interfaces:**
- Produces:
  - `<ResourceRow resource />` renders an `<li>` with the `Badge`, the title as the link text (`ActionLink` to `viewUrl`), the description, `hostLabel`, and an optional Download link. A pending resource without a source renders an inline pending label in dev and nothing in production.
  - `<ResourceList items: readonly Resource[]; label?: string />` renders a `<ul>` of the `visible(items)` rows, and `null` when the list is empty.
  - `<BlockRenderer block: EvidenceBlock />` switches on `block.type`:

| `type` | Renders |
|---|---|
| `text` | `Prose` |
| `document` | `DocumentViewer` (`mode: block.embed ? 'embedded' : 'on-demand'`) |
| `resources` | `ResourceList` |
| `gallery` | `ImageGallery` |
| `video` | `VideoEmbed` |

    Make the switch exhaustive with a `never` check.
  - `<EvidenceGroup group: EvidenceGroup; headingLevel: 2 | 3; index?: number />` renders `<section aria-labelledby>` with a heading at `headingLevel`: "Evidence {index}: {title}" when `index` is given, otherwise "{title}". Its blocks follow. It returns `null` when the group isn't visible. A visible group with no blocks shows `PendingNotice`.
  - `hasVisibleContent(groups: readonly EvidenceGroup[], extra: readonly Resource[]): boolean` in `src/components/content/visibility.ts`. It is true when any group is visible or any resource is visible.

- [ ] **Step 1: Write the failing tests:**
  - `it('renders each block type')`, with one fixture group containing all 5 block types
  - `it('numbers evidence when index given')`
  - `it('pending group hidden in production')`
  - `it('empty ResourceList renders nothing')`
  - `it('hasVisibleContent is false when everything is pending in prod')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the components.
- [ ] **Step 4:** Run the tests again. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: add resource rows, evidence groups, and block renderer`.

### Task 18: Dev samples and the content-status page

**Files:**
- Create: `src/dev/samples.ts`, `src/dev/sample.pdf` (a hand-written one-page PDF whose only text is "Sample document: not accreditation evidence"), `src/dev/svgPlaceholder.ts`
- Create: `src/features/content-status/collectPending.ts`, `collectPending.test.ts`, `ContentStatusView.tsx`
- Modify: `src/content/index.ts`, `src/pages/ContentStatusPage.tsx`

**Interfaces:**
- Produces, in `src/dev/samples.ts`:
  - `sampleAreas: Area[]`, one area with `slug: 'sample-area'`, `title: 'Sample area'`, `status: 'pending'`. It holds:
    - a 3-image gallery of SVG data-URI placeholders labeled "Sample image {i}"
    - a narrative report that is a local resource pointing at the sample PDF through `?url`
    - groups "Sample 1" (document), "Sample 2" (gallery and text) and "Sample 3" (resources and video, with a pending source)
  - `sampleRecommendations: Recommendation[]`, one recommendation with `number: 99`, `title: 'Sample recommendation'`, three evidence groups and a pending status
  - Every `id` starts with `DEV-SAMPLE-`.
  - The sample PDF is imported as `import samplePdf from './sample.pdf?url'` and wrapped by `devLocalSource(url: string): ResourceSource` in `src/dev/samples.ts`. That helper strips `import.meta.env.BASE_URL` from the start of the URL and returns `{ kind: 'local', path }` cast to the `/files/` template type. It is the only cast allowed, it is dev-only, and it carries a comment saying so.
  - The content test (Task 8) skips `DEV-SAMPLE-` ids.
  - Keep the module free of side effects so Rollup drops it: no top-level statements other than `const` declarations, and annotate any top-level call (for example `svgPlaceholder(...)`) with `/* @__PURE__ */`.
- In `src/content/index.ts`, `areas` and `recommendations` become:

```ts
const includeSamples = import.meta.env.DEV || import.meta.env.VITE_CONTENT_PREVIEW === 'true';
export const areas = includeSamples ? [...contentAreas, ...sampleAreas] : contentAreas;
```

  The same applies to `recommendations`. The condition must be written inline, as shown, so Rollup can constant-fold it and drop the samples from production builds.
- Produces: `collectPending(content: typeof import('../../content')): PendingEntry[]`, where `interface PendingEntry { page: string; path: string; label: string }`. It walks every slot, resource, group, person and FAQ whose status is `pending`, skipping `DEV-SAMPLE-` ids. It also adds the entries "Area list not supplied" when there are no real area files and "Recommendation list not supplied" when there are no real recommendation files.
- `ContentStatusView` renders a table (Page | Item | Link to page) and a total count. `ContentStatusPage` renders it only when `showPending()` is true, and `NotFoundPage` otherwise.

- [ ] **Step 1: Write the failing tests** `collectPending.test.ts`:
  - `it('lists every pending home slot by label')`: includes "Dean's photograph and message"
  - `it('reports missing area and recommendation lists')`
  - `it('excludes DEV-SAMPLE items')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the samples, `collectPending` and the view, and update the content test to skip `DEV-SAMPLE-` ids.
- [ ] **Step 4:** Run the standard checks. Expected: PASS. `check:dist` rule 5 proves no `DEV-SAMPLE` string reached production. If it fails, fix the side effects in `samples.ts`; do not weaken the rule. Then run `npm run build:preview` and `grep -rl DEV-SAMPLE dist | head -1`; expected: at least one match, which shows the preview build does include the samples. Rebuild with `npm run build` afterwards.
- [ ] **Step 5:** Commit with `feat: add dev-only samples and content-status checklist`.

## Phase 5: Page families (ends with checkpoint B)

Every page task follows the same pattern:
- The **route component** in `src/pages/` looks up its data and handles not-found.
- A **presentational view** in `src/features/<family>/` takes the data as props and is what the tests render.
- Each view uses `PageShell` with `hasContent` computed from visibility.

### Task 19: Accreditation Areas index and the area template

**Files:**
- Create in `src/features/areas/`: `AreasIndexView.tsx`, `AreaView.tsx`, `areas.test.tsx`
- Modify: `src/pages/AreasIndexPage.tsx`, `src/pages/AreaPage.tsx`

**Interfaces:**
- Consumes: `areas`, `routeManifest`, and the Phase 4 components
- Produces:
  - `<AreasIndexView areas: readonly Area[]; label: string />`. It renders an ordered list of cards (title, the first summary paragraph, a "View {title}" link) for the `visible(areas)` entries.
  - `<AreaView area: Area; siblings: readonly { title: string; path: string }[] />`, with sections in this order:
    1. the `Slideshow` of `slotValue(area.gallery)`, labeled "{title} photos", or a `PendingNotice` for the gallery label
    2. a "Narrative Report" `SectionHeading` with a prominent primary `ActionLink` "Open the {title} narrative report" and a `DocumentViewer` in `embedded` mode
    3. evidence groups, each an `EvidenceGroup` with `headingLevel={2}` and no index
    4. "Additional Files", a `ResourceList`
    5. "Audio Visual Presentation", a link to `/avp#{slug}` when `area.avp` is visible
    6. a `Pager` over the siblings

- [ ] **Step 1: Write the failing tests:**
  - `it('index lists only visible areas in order')`
  - `it('index with no visible areas shows the preparing note')`
  - `it('area page renders sections in order')`: compare the h2 text order with `['Narrative Report', <group titles…>, 'Additional Files']`
  - `it('narrative report is embedded, evidence documents are on-demand')`
  - `it('links to its AVP anchor')`
  - `it('renders the DEV sample area without errors')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the views and pages.
- [ ] **Step 4:** Run the tests again (expected: PASS) and the standard checks (expected: PASS).
- [ ] **Step 5:** Commit with `feat: add accreditation areas index and reusable area page`.

### Task 20: Compliance Report index and the recommendation template

**Files:**
- Create in `src/features/compliance/`: `ComplianceIndexView.tsx`, `RecommendationView.tsx`, `compliance.test.tsx`
- Modify: the two pages

**Interfaces:**
- Produces:
  - `<ComplianceIndexView overview: Slot<string[]>; recommendations: readonly Recommendation[] />`. It renders the overview `Prose` when published, then an ordered list "Recommendation {n}: {title}" linking to each page.
  - `<RecommendationView rec: Recommendation; siblings />`, with sections in this order:
    1. `statement` as `Prose`
    2. "Recommendation document", a `DocumentViewer` in `embedded` mode
    3. an "Evidence of Compliance" h2, then each visible evidence group with `headingLevel={3}`, numbered from 1 by visible position
    4. "Additional Files"
    5. a `Pager`

- [ ] **Step 1: Write the failing tests:**
  - `it('index lists recommendations as "Recommendation N: title"')`
  - `it('evidence is numbered by visible position')`: with a pending group in the middle in production, the numbers are 1 and 2
  - `it('recommendation document is embedded')`
  - `it('pager links neighbours')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the views and pages.
- [ ] **Step 4:** Run the tests again (expected: PASS) and the standard checks (expected: PASS).
- [ ] **Step 5:** Commit with `feat: add compliance report index and reusable recommendation page`.

### Task 21: AVP page

**Files:**
- Create: `src/features/avp/AvpView.tsx`, `src/features/avp/avp.test.tsx`
- Modify: `src/pages/AvpPage.tsx`

**Interfaces:**
- Produces: `<AvpView areas: readonly Area[] />`. Each visible area with a visible `avp` gets `<section id={slug}>` with an h2 of `avpTitle ?? title` and a small "Area: {area title}" label, then a `VideoEmbed`, then a "Go to {area title}" link. Visible areas with no AVP are left out. When there are no entries, `PageShell` shows the preparing note.
- When the page loads with a hash, it scrolls to and focuses that section's h2. Use the `useEffect` on `location.hash`.

- [ ] **Step 1: Write the failing tests:**
  - `it('one section per area with avp, using avpTitle when present')`
  - `it('section ids match area slugs')`
  - `it('no iframe until play')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the view and page.
- [ ] **Step 4:** Run the tests again. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: add AVP page with per-area anchors`.

### Task 22: Certificate of Authenticity and Additional Files

**Files:**
- Create in `src/features/documents/`: `CertificateView.tsx`, `AdditionalFilesView.tsx`, `documents.test.tsx`
- Modify: the two pages

**Interfaces:**
- Produces:
  - `<CertificateView certificate: CertificateContent />`. It shows the image (`object-contain`, max height 80vh, `alt` required, with a link "Open full-size image") above a `DocumentViewer` for the PDF in `embedded` mode.
  - `<AdditionalFilesView groups: readonly ResourceGroup[] />`. Each visible group with visible items gets an h2 and a `ResourceList`. When there is exactly one group, its h2 is left out.

- [ ] **Step 1: Write the failing tests:**
  - `it('certificate renders image and embedded PDF when published')`
  - `it('certificate with both pending shows the preparing note in prod')`
  - `it('single group omits its heading')`
  - `it('links use resource titles as text')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the views and pages.
- [ ] **Step 4:** Run the tests again. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: add certificate of authenticity and additional files pages`.

### Task 23: About overview, People, and Faculty by Department

**Files:**
- Create in `src/features/about/`: `AboutView.tsx`, `PeopleView.tsx`, `FacultyByDepartmentView.tsx`, `PersonCard.tsx`, `groupPeople.ts`, `about.test.tsx`
- Modify: the three pages

**Interfaces:**
- Produces:
  - `<AboutView about: AboutContent />`. It shows the photo, then the anchored sections `#mission-and-vision`, `#goals-and-objectives` and `#history`, each with an h2, and a short in-page list of links at the top. Pending slots show `PendingNotice` in dev and nothing in production.
  - `groupByRole(people: readonly Person[]): { role: PersonRole; label: string; people: Person[] }[]`. The order is official, faculty, staff, student-assistant, with the labels "Officials", "Faculty", "Staff" and "Student Assistants". Empty groups are left out, and the input order is kept within a group.
  - `groupByDepartment(people: readonly Person[]): { department: string; people: Person[] }[]`. It includes faculty only, sorts departments A–Z, sorts names A–Z within each with `localeCompare(…, 'en')`, and puts people without a department under "Department not specified".
  - `<PersonCard person />`. It shows the photo, or, when there's no photo, a neutral `line`-colored silhouette (`aria-hidden`; never a made-up photo). Then the name with post-nominals, the position, and the rank when present.
  - `PeopleView` and `FacultyByDepartmentView` render grouped grids of `PersonCard` from the `visible(people)` entries.

- [ ] **Step 1: Write the failing tests:**
  - `it('groupByRole orders and labels groups and drops empty ones')`
  - `it('groupByDepartment sorts and files unassigned faculty last')`
  - `it('PersonCard without photo renders no img')`
  - `it('about sections have stable anchors')`
  - `it('pending people are hidden in production')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the views, helpers and pages.
- [ ] **Step 4:** Run the tests again. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: add about overview, people directory, and faculty by department`.

### Task 24: FAQs and Location

**Files:**
- Create: `src/features/about/FaqsLocationView.tsx`, `src/features/about/faqs.test.tsx`
- Modify: `src/pages/FaqsLocationPage.tsx`

**Interfaces:**
- Produces: `<FaqsLocationView faqs: readonly Faq[]; site: SiteContent />`. It has two sections:
  - **"Frequently Asked Questions":** one `Disclosure` per visible FAQ, with the question as the summary and the answer as `Prose`.
  - **"Location":** the address from `slotValue(site.contact)` and `<MapEmbed query={site.mapQuery} address=… />`.

- [ ] **Step 1: Write the failing tests:**
  - `it('each FAQ is a details element, collapsed by default')`
  - `it('keyboard toggles an FAQ')`
  - `it('map section shows fallback link')`
  - `it('everything pending in prod shows the preparing note')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the view and page.
- [ ] **Step 4:** Run the tests again. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: add FAQs and location page`.

### Task 25: Home page, then integration and checkpoint B

**Files:**
- Create in `src/features/home/`: `HomeView.tsx`, `QuickAccess.tsx`, `LeaderMessageCard.tsx`, `home.test.tsx`
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Produces: `<HomeView home: HomeContent; about: AboutContent; site: SiteContent />`. Its sections follow spec §4, in this order:
  1. **Hero:** a maroon band with the `on-maroon` class. The h1 (`id="page-title" tabIndex={-1}`) reads "{universityName} Graduate School", with the program name below it when published. The leadership `Slideshow` (label "Graduate School leadership") sits inside.
  2. **`QuickAccess`:** a `nav aria-label="Principal accreditation resources"` with four links: Accreditation Areas (the `site.areasLabel` text), Compliance Report, Audio Visual Presentations, Certificate of Authenticity.
  3. Accreditation slide 1 (an `<img>` with alt).
  4. An h2 with the text `home.accreditationHeading`, verbatim.
  5. Accreditation slide 2.
  6. The second gallery (`ImageGallery`, label "Graduate School gallery").
  7. The video (`VideoEmbed`).
  8. A "Messages" h2 with the Dean's `LeaderMessageCard` and then the Program Chair's.
  9. "About the Graduate School": the about photo, then the Mission and Vision, Goals and Objectives, and History previews (the first paragraph of each, with links to the `/about#…` anchors).

  Each section renders only when its slot is visible; pending slots show `PendingNotice` in dev. When every slot is pending in production, the hero, quick access and heading still render, followed by `<p>Accreditation materials are being prepared.</p>`.
- `LeaderMessageCard` shows the photo, the name and position, then the paragraphs.

- [ ] **Step 1: Write the failing tests:**
  - `it('renders sections in the required order')`, with all slots published from fixtures: compare the ordered list of section h2 and landmark names
  - `it('heading text is exactly LEVEL IV AACCUP ACCREDITATION')`
  - `it('quick access has four links with descriptive names')`
  - `it('all-pending production home is not an empty shell')`: `vi.stubEnv('DEV', false)` with the real content; the h1, the quick access and the "being prepared" text are present (Review Focus #4)
  - `it('home sets the plain site title')`
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the view, components and page.
- [ ] **Step 4:** Run the tests again (expected: PASS) and the standard checks (expected: PASS).
- [ ] **Step 5: Integration pass.** With `npm run dev`, use `playwright-cli` to walk every manifest route (including `sample-area` and `recommendation-99`) at 375 and 1280px. Confirm:
  - the active navigation state on each page
  - breadcrumbs on each page
  - no console errors
  - no horizontal scroll: `document.documentElement.scrollWidth <= innerWidth`

  Fix any problem found and commit as `fix: integration <issue>`.
- [ ] **Step 6:** Commit with `feat: add home page in required section order`.
- [ ] **Step 7: Checkpoint B.** Run the checkpoint procedure with scope "Tasks 13–25", including the open findings from A. Update `CURRENT_STATE.md`.

## Phase 6: Hardening, audits, and final review (ends with checkpoint C)

### Task 26: Security pass and the live link checker

**Files:**
- Create: `src/lib/linkTargets.ts`, `src/lib/linkTargets.test.ts`, `scripts/links.live.test.ts`, `vitest.links.config.ts`
- Modify: `package.json` (`"check:links": "vitest run --config vitest.links.config.ts"`), `vite.config.ts` (exclude `**/*.live.test.ts` from the default `test.include`)

**Interfaces:**
- Produces:
  - `collectLinkTargets(content): { url: string; where: string; kind: 'drive' | 'drive-folder' | 'youtube' | 'external' }[]`. It collects published sources only, using `viewUrl` for each.
  - `classifyResponse(status: number, location: string | null): 'ok' | 'not-public' | 'redirect' | 'broken'`:
    - 200–299 → `ok`
    - 3xx with a `location` on `accounts.google.com` or `ServiceLogin` → `not-public`
    - other 3xx → `redirect` (reported, not a failure)
    - everything else → `broken`
- `scripts/links.live.test.ts` fetches each target with `redirect: 'manual'` and a 15 s timeout, and fails with a table of every `not-public` and `broken` target.

- [ ] **Step 1: Write the failing tests:**
  - `it('302 to accounts.google.com is not-public')` (Review Focus #1)
  - `it('404 is broken')`
  - `it('301 elsewhere is redirect')`
  - `it('pending resources are not collected')`
- [ ] **Step 2:** Run `npx vitest run src/lib/linkTargets.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement the module and the live test, then run `npm run check:links`. Expected: PASS with 0 targets until real content exists. Record "0 targets" in `CURRENT_STATE.md`.
- [ ] **Step 4: Security review.**
  1. Load `VibeSec-Skill` and audit `src/`, `config/`, `deploy/` and `scripts/` against its frontend and React rules.
  2. Confirm with grep that there is no `dangerouslySetInnerHTML`, that every `target="_blank"` carries `rel`, that no secrets or keys are present, and that every `<iframe>` lives in `src/components/media/`.
  3. Run `npm run build && npm run preview`. With `playwright-cli`, open `/accreditation-areas/sample-area` from a `build:preview` build, play the sample media, and read the console. Expected: **zero CSP violations**. If inline styles are blocked, record the cause and fix it without adding `'unsafe-inline'`; adding it needs a written justification in the spec deltas.
  4. Fix the findings, then run the standard checks.
- [ ] **Step 5:** Commit with `feat: add link checker; security hardening from audit`.

### Task 27: Accessibility, responsive, and visual audit

**Files:**
- Modify: whatever the findings require.

- [ ] **Step 1: Rendered checks.** Run `npm run build:preview && npm run preview`. With `playwright-cli`, visit every route at **320, 375, 768 and 1280px** and save the screenshots to the scratchpad. On each page assert:
  - `scrollWidth <= innerWidth` (Review Focus #5)
  - exactly one `h1`
  - no heading level skipped
  - every `img` has an `alt` attribute
  - every `iframe` has a `title`
- [ ] **Step 2: Keyboard pass** on `/`, `/compliance-report/recommendation-99` and `/about/faqs-and-location`:
  - Tab order follows visual order.
  - The skip link works.
  - Dropdowns: Esc closes them.
  - Mobile dialog: focus is trapped while open and restored on close.
  - Slideshow: arrow keys work.
  - Gallery dialog: Esc closes it.
  - FAQ: Enter and Space toggle it.
  - Focus is visible on every control (maroon on white, gold on maroon).
- [ ] **Step 3: Reduced motion.** Emulate `prefers-reduced-motion: reduce` and confirm there are no transitions.
- [ ] **Step 4: Audits.** Run the `design:accessibility-review` skill and the `accessibility-auditor` agent (Task 2) on the routes above, then the `impeccable` skill's audit on the screenshots. Log each finding with its severity in `CURRENT_STATE.md`.
- [ ] **Step 5:** Fix every Critical and High finding, plus the Medium ones unless deferral is justified. Rerun Steps 1–2 for the affected pages, then run the standard checks.
- [ ] **Step 6:** Commit with `fix: accessibility and responsive audit findings`.

### Task 28: Final verification, content guide, checkpoint C, and delivery report

**Files:**
- Create: `docs/content-guide.md`
- Modify: `CURRENT_STATE.md`

- [ ] **Step 1: Write `docs/content-guide.md`.** It explains how editors:
  - add an area (create `src/content/areas/<slug>.ts`; copy-paste template included) or a recommendation (`rec-NN.ts`)
  - add a local PDF (`public/files/...`) or a Drive file (sharing must be "Anyone with the link"; paste only the file ID)
  - add a photo (put it in `src/assets/...`, import it with `PHOTO_QUERY`, and wrap it in `toImageAsset`)
  - switch an item from `pending` to `published`
  - preview their changes (`npm run dev`, `/content-status`)
  - check their links (`npm run check:links`)
  - build (`npm run build`, and `VITE_BASE_PATH` for subpaths)
  - deploy (see `docs/deployment.md`)
- [ ] **Step 2:** Run the full verification:
  - the standard checks
  - `npm run build:preview && npm run check:dist`: expect a failure on rule 5 (samples present), which confirms the check works. Then rebuild with `npm run build && npm run check:dist`; expected: PASS.
  - the `/gs/` subpath build check from Task 5 Step 8
  - `npm run check:links`

  Record each command and its result in `CURRENT_STATE.md`.
- [ ] **Step 3: Checkpoint C.** Run the checkpoint procedure over the whole branch against `main`, with the open findings from A and B and the Task 27 audit log. Resolve the findings, and re-review if any Critical or High finding was open.
- [ ] **Step 4:** Update `CURRENT_STATE.md`: the phase, the quoted verdicts for A, B and C, the open findings, the missing materials (spec §13 and §14), and the next actions (Task 29).
- [ ] **Step 5:** Commit with `docs: add content guide and final verification record`. Then give the user the master prompt §13 delivery report: summary, architecture, tasks done and remaining, the commands run and their results, security and accessibility, missing materials, deployment, and next priorities. Do not push and do not open a PR unless the user asks.

## Phase 7: UCN content entry (blocked on materials)

### Task 29: Enter UCN materials (repeat for each batch)

**Blocked until:** the user supplies the materials and answers in spec §13 and §14:
- the program name
- the area list
- the recommendation list
- files, photos, names and messages
- server type and base path

For each batch:

- [ ] **Step 1:** Add the files (in `public/files/` or `src/assets/`) and the data, using the exact wording supplied. Flip each item to `published` only once its material is verified.
- [ ] **Step 2:** Run `npm test` (the content test catches bad paths, IDs, links and missing alt text) and `npm run check:links`. Expected: PASS, with 0 `not-public` or `broken` targets.
- [ ] **Step 3:** Render the affected pages at 375 and 1280px with `playwright-cli`, then run the standard checks.
- [ ] **Step 4:** Update the missing-materials list in `CURRENT_STATE.md`, then commit with `content: add <batch description>`.

---

## Missing or unconfirmed source materials

None of these is invented. All of them stay `pending` until supplied (spec §13 and §14):

- **Home:** leadership photos, accreditation slides 1 and 2, the second gallery, the Graduate School video, and the Dean's and Program Chair's photos and messages.
- **About:** the about photo, Mission, Vision, Goals, Objectives and History.
- **Compliance:** the overview text, and the number, titles, documents and evidence of the recommendations.
- **Areas:** the list, narrative reports, galleries, evidence and AVPs.
- **Documents:** the certificate PDF and image, and the additional files.
- **People:** names, positions, ranks, departments and photos, including student assistants.
- **FAQs and contact:** FAQ text, the address, the map query, and contact details.
- **Facts and deployment:** the program name and accreditation date; download permissions; Apache or Nginx; the domain and base path; whether HTTPS is available.
- **Verified so far:** only "University of Camarines Norte", "LEVEL IV AACCUP ACCREDITATION" and `ucn_logo.png`.

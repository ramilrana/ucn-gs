# Plan: structural changes from the 2026-11-18 §14 answers

## Context

The user answered the spec §14 open questions (recorded in `ucn-gs/CURRENT_STATE.md`, Approved decisions). Several answers break assumptions the built site rests on:

- Recommendations belong to areas (Research 2, Performance of Graduates 1, Community Service 5, International Linkages & Consortia 5, Planning Process 1). The build has one flat list `/compliance-report/recommendation-N`.
- Some local PDFs must show inline. R19 currently forbids framing local files.
- The server is Nginx on a local UCN server. The build ships Apache `.htaccess` only.
- The program is the MPA, AACCUP Level IV Phase 2, 2026. Today the slot is pending.

Goal: the site's structure matches these answers before Task 29 content entry. Content stays `pending` wherever UCN material is missing, so production still shows nothing unverified (D5).

Work in `ucn-gs/` on a new branch `feat/structure-2026-11` from `main`. The uncommitted `CURRENT_STATE.md` edit goes into the first commit. Before Task 1, copy this plan to `docs/superpowers/plans/2026-11-18-structure-changes.md`, the repo's source of truth for it.

## Fixed design choices

- **Recommendation files:** each lives at `src/content/recommendations/<area-slug>/rec-NN.ts`. The folder carries the area because `scripts/route-paths.mjs` reads only file names.
- **Recommendation routes:** `/compliance-report/<area-slug>/recommendation-<n>`, with `n` counted within the area.
  - Page title / H1: `<Area title>: Recommendation <n>`, e.g. "Community Service: Recommendation 3".
  - Breadcrumb: Home › Compliance Report › that title.
  - There is no `/compliance-report/<area-slug>` page. The index has an anchored section per area (`/compliance-report#<area-slug>`), reusing `src/lib/useFocusHashTarget.ts` as AVP does.
- **Compliance Report index:** groups recommendations under area headings, in area order. A group whose area or recommendations are all hidden is not shown.
- **Navigation:** the Compliance Report dropdown lists the areas that have recommendations, linking to `/compliance-report#<slug>`, instead of 14 recommendation links.
  - Recommendation pages mark the parent "Compliance Report" active (existing prefix logic in `navModel.ts`).
- **Pager:** previous/next runs across all recommendations in area-then-number order.
- **Validation (`src/content/validate.ts` + `content.test.ts`):**
  - `areaSlug` equals the folder name and names an existing area file.
  - `(areaSlug, number)` is unique, and numbers within an area run 1..k.
  - A `published` recommendation needs a `published` area.
- **Inline PDFs:** a new optional `inline?: boolean` on `Resource`.
  - Allowed only when the source is `local`, `format` is `pdf` and the path ends in `.pdf`; validation enforces this.
  - `embedUrl` returns the local URL only in that case. Drive and YouTube are unchanged; other local files stay as the Open / Download card.
- **Inline frame:** has no `sandbox`, because Chrome disables its PDF viewer inside sandboxed frames. It keeps the title, `loading="lazy"` and the Open in new tab / Download actions.
  - If `navigator.pdfViewerEnabled === false`, it falls back to the card, as spec §7 already says.
- **CSP:**
  - `frame-src` becomes `'self'` plus the four existing hosts.
  - PDF responses only get `frame-ancestors 'self'`; everything else keeps `'none'`, so site pages still refuse to be framed.
  - `check:dist` fails if any `.html/.htm/.svg/.xml/.js` sits under `dist/files/`, so a same-origin frame can only ever hold a PDF.
- **Nginx replaces Apache.**
  - The build stops writing `.htaccess` files.
  - It renders `deploy/nginx.conf.template` into `dist-nginx/ucn-gs.conf` (git-ignored, outside the web root), filling in:
    - the base path
    - the docroot (env `UCN_DOCROOT`, default `/var/www/ucn-gs/`)
    - the five security headers, via a generated `security-headers.conf` include so nested locations don't lose them (Nginx's `add_header` inheritance pitfall)
  - The config contains:
    - `try_files $uri $uri/index.html =404`
    - `error_page 404 <base>404.html`
    - `no-cache` on HTML
    - immutable cache on `<base>assets/`
    - a `\.pdf$` location with the PDF CSP
    - `deny all` on dotfiles
- **Program:** `site.programName` becomes published: "AACCUP Level IV Phase 2 Accreditation of the Master in Public Administration (MPA) Program, 2026". This is the user's wording plus the year. The hero already shows this slot (`HomeView.tsx:116`), so no type change is needed.
  - `accreditationHeading` stays exactly "LEVEL IV AACCUP ACCREDITATION".

## Tasks

Each task gets a Sonnet implementer, TDD where code changes, and a task review. Run `npm run lint`, `typecheck`, `test` and `build` after each.

1. **Types and loading.**
   - Add `areaSlug` to `Recommendation` and `inline?` to `ResourceBase` (`src/types/content.ts`).
   - Change the glob in `src/content/index.ts` and `content.test.ts` to `./recommendations/*/rec-*.ts`, and make the on-disk check recursive.
   - Sort by area order, then number.
   - Extend `checkFilenames` and add the new validation rules above.
2. **Routes.**
   - `src/content/routes.ts:71-79`: new path and title; `RouteEntry` carries `slug` (area) and `number`.
   - `scripts/route-paths.mjs:35-40`: walk the area subfolders.
   - Update `routes.test.ts` and `check-dist.test.ts` (`recommendations/research/rec-03.ts` → `/compliance-report/research/recommendation-3`).
3. **Pages and views.**
   - `RecommendationPage.tsx`: look up by `(slug, number)`; siblings are all recommendations.
   - `ComplianceIndexPage.tsx`: pass `areas`.
   - `ComplianceIndexView.tsx`: grouped sections with ids and `key=path`.
   - `RecommendationView.tsx`: title, labels and `currentPath` from the entry.
   - Update `collectPending.ts:55-62`.
   - Give the dev sample (`src/dev/samples.ts:107`) `areaSlug: 'sample-area'`, number 1.
   - Fix their tests: `compliance.test.tsx`, `RecommendationPage.test.tsx`, `collectPending.test.ts`, `samples.test.ts`, `router.test.tsx`.
4. **Navigation.**
   - `navModel.ts`: the Compliance children become area anchors.
   - Update `navModel.test.ts`, `SiteHeader.test.tsx` and `layout.test.tsx` (crumbs, pager).
   - `DesktopNav`/`MobileNav` need no structural change; confirm hash links close the menu and focus the target.
5. **Content stubs.**
   - Five pending area files, `order` 1–5:
     - `research`
     - `performance-of-graduates`
     - `community-service`
     - `international-linkages-and-consortia`
     - `planning-process`
   - Each uses the exact titles given, with a pending gallery, narrative report and AVP.
   - 14 pending recommendation files (2/1/5/5/1), titled `Recommendation n` until UCN supplies titles.
   - Publish `programName`.
   - Production still hides all of it except the program line. Check that `/content-status` lists every stub.
6. **Inline local PDFs.**
   - `config/csp.mjs` + `csp.d.mts`: `'self'` in `frame-src`, a new `CSP_HEADER_PDF`.
   - `src/lib/resourceUrls.ts` `embedUrl(resource)`.
   - `DocumentViewer.tsx`: `localInline` path with no sandbox, the actions row and the fallback card.
   - Opt in the dev sample PDF (`samples.ts:54`).
   - Update tests: `config.test.ts`, `resourceUrls.test.ts`, `DocumentViewer.test.tsx`. Add new cases:
     - an opted-in PDF frames with no sandbox
     - a non-PDF that sets `inline` fails validation
     - Drive frames keep their sandbox
7. **Nginx.**
   - Add `deploy/nginx.conf.template` and `deploy/security-headers.conf.template`; delete `deploy/htaccess.template` and `deploy/assets.htaccess`.
   - `scripts/write-route-pages.mjs`: render into `dist-nginx/` and stop writing `.htaccess`; add `dist-nginx/` to `.gitignore`.
   - `check-dist.mjs` Rule 3 and its tests check the generated config:
     - `error_page 404 <base>404.html`
     - the CSP
     - the PDF CSP
     - the immutable assets block
     - a dotfile deny
   - Add the new no-active-files-under-`dist/files/` rule.
   - CI (`.github/workflows/ci.yml`): new job that runs `nginx:1.27-alpine` in Docker on the built `dist/` with the generated config. It then runs:
     - `nginx -t`
     - `curl -I` on `/`, a deep route, a 404, an asset and the sample PDF (built by `build:preview`)
     - checks on the CSP, `frame-ancestors`, cache and status of each response
   - This is the first real-server header test the project has had.
8. **Docs.**
   - Spec:
     - §3: D4 refined; D6 now Nginx; R19 partly reversed, with reasons
     - §4: routes and nav
     - §7: inline local PDFs
     - §8: frame-src, the PDF frame-ancestors and the sandbox exception
     - §11: shipped files
     - §13/§14: answered
   - `docs/deployment.md`: rewrite as Nginx-only, including post-deploy checks and HSTS for Nginx.
   - `docs/content-guide.md`: recommendation file location and template with `areaSlug`, id convention `rec-<area>-NN-*`, the `inline` flag, no `.htaccess` upload.
   - `CURRENT_STATE.md`.
9. **Review checkpoint D (ucn-opus-reviewer, Opus, read-only)** on the branch diff against `main`.
   - Focus: CSP/frame safety, validation, routing/404, Nginx config, accessibility of the grouped index and nav.
   - Run the accessibility-auditor on `/compliance-report`, one recommendation page and the nav.
   - Fix all Critical/High (and Medium unless justified) findings, then re-review until PASS / PASS WITH ISSUES with no open Critical/High.
   - Then push and open a PR to `main`.

Tasks 1→2→3→4 are sequential (shared types and tests). Tasks 6 and 7 both touch `config/csp.mjs`, `check-dist` and `write-route-pages`, so they run in order after 5. Task 8 comes after the code tasks.

## Verification

- `npm run lint`, `typecheck`, `test`, `build`, `check:dist`, `audit:prod` all pass.
- `npm run build:preview` + `check:dist` still fails as designed (dev samples).
- `/gs/` subpath build + `check:dist` passes, and the generated Nginx config carries `/gs/`.
- CI on the PR passes, including the new Nginx container job.
- In the browser (preview build):
  - `/compliance-report` shows five area groups (pending, so visible only in preview).
  - A recommendation page shows the right breadcrumb and pager.
  - The nav dropdown anchors scroll and focus their sections.
  - The sample inline PDF renders in Chrome with no CSP violations in the console.
  - 375 px and 1280 px layouts are OK.
- Production build: no area or recommendation routes are visible while all are pending, the program line shows on Home, and `/content-status` is absent.
- Not coverable until deploy: headers on UCN's actual Nginx host, and Firefox/Safari inline PDF. These stay on the post-deploy checklist.

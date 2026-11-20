# UCN Graduate School Accreditation Website: Design Spec

- **Date:** 2026-10-29
- **Status:** approved. The design was approved section by section and the written spec was approved by the user (2026-10-29).
- **Inputs:** the user's master prompt; the existing repo (`ucn-gs`); the reference site inventory in [`docs/reference-inventory.md`](../../reference-inventory.md).
- **Next stage:** implementation plan (writing-plans), only after this spec is approved.

## 1. Intent

**What the user said:** build a professional, modern, responsive, frontend-only accreditation website for the University of Camarines Norte (UCN) Graduate School. It presents accreditation documents and evidence (PDFs, text, photos, videos, links) to accreditors in a credible, easy-to-navigate form. It uses maroon, white and gold from the UCN logo. Content must be accurate: no invented statements, people, results or evidence. Sections that recur (areas, recommendations) must be data-driven and easy to update by editing content files.

**Established during brainstorming:**
- The reference Google Site is **PUP Graduate School's MA Psychology site**. It is used for **structure only**. None of its content (names, messages, documents, photos, address) appears on the UCN site.
- The site covers **one** UCN Graduate School program. Its name has not been supplied yet.
- UCN content will be supplied by the user later. The site must look complete in production even while materials are still missing.

**Success criteria:**
- Every required page family exists and is reachable from the navigation.
- Area and recommendation pages come from one template each.
- Any supplied PDF, image or video can be added by editing one content file, without code changes.
- Production never shows broken, fake or placeholder content.
- WCAG 2.2 AA practices are followed, and lint, typecheck, tests, build and audit pass.

## 2. Goals and non-goals

**Goals:**
- the required pages
- a typed content model
- reusable layouts, media and evidence components
- an accessible slideshow, navigation and FAQs
- safe embeds
- security headers for UCN's own server
- routes that load on direct visits and refresh without server rewrites
- a missing-content checklist for editors

**Non-goals:**
- backend, database, auth, CMS or forms
- dark mode
- multi-program support
- search
- analytics
- internationalization beyond marking individual blocks with a `lang` attribute
- a committed end-to-end test suite
- any PUP content

## 3. Approved decisions

| # | Decision | Reason |
|---|---|---|
| D1 | Reference = structure only; all content from UCN materials. | The reference belongs to another university. |
| D2 | Tailwind CSS v4; remove `antd` and `@ant-design/icons`. | Master prompt requires Tailwind. Removes the 719 kB chunk and the stock look. |
| D3 | Mixed hosting: small files local in `/public`, large PDFs and videos on Google Drive or YouTube. | Accreditation scans can exceed repo and hosting limits. |
| D4 | One program: the Master in Public Administration (MPA), AACCUP Level IV Phase 2 accreditation, 2026. Shown in the home hero as "Master in Public Administration". `accreditationHeading` is "MPA LEVEL 4 PHASE 2 AACCUP ACCREDITATION". | User's answer. Changed 2026-11-18: named the program, level, phase and year — reason: user's answer to §14. Changed 2026-11-19: hero line shortened to "Master in Public Administration" — reason: user's request. Changed 2026-11-20: home heading renamed from "LEVEL IV AACCUP ACCREDITATION" to "MPA LEVEL 4 PHASE 2 AACCUP ACCREDITATION" — reason: user's request. |
| D5 | Each item has a `published` or `pending` status. Pending items show in dev and preview builds, are hidden in production, and are listed on a dev-only `/content-status` page. | Accreditors never see empty or fake slots. |
| D6 | Deploy to UCN's own local server running Nginx. Write a per-route `index.html` after build and generate the Nginx config from `deploy/nginx.conf.template`. Remove `vercel.json`, `public/_headers` and `public/_redirects`. | Configure only the platform in use. Routes work without rewrites. Changed 2026-11-18: Nginx, Apache files removed — reason: user's answer to §14. |
| D7 | Refactor in place (approach A). Content lives in typed TS modules plus a content validation test. | Preserves working CI, security setup and conventions. |
| D8 | No slideshow autoplay, except the Home leadership carousel. | Avoids distracting motion and the pause-control requirement. Changed 2026-11-20: the Home leadership carousel is full width and auto-advances every 6 s — reason: user's request. It meets WCAG 2.2.2 with a visible Pause/Play button, pauses on hover and while focus is inside, starts paused under reduced motion, and keeps its live region off while rotating. Area galleries still never autoplay. |
| D9 | Gold is never used as text, focus ring or state indicator on white. | Gold on white is about 2.1:1, below the 3:1 minimum. |
| R19 | Local PDFs may display inline only when the resource sets `inline: true` (rules in §7, headers in §8). Other local files show an Open / Download card and local video an Open link. | R19 (checkpoint B, 2026-10-30) said local files are never framed, because §8 forbade `frame-src 'self'`. Changed 2026-11-18: partly reversed — reason: user's answer to §14, PDF display is chosen per document. |

## 4. Sitemap, routes and navigation

| Route | Page |
|---|---|
| `/` | Home |
| `/accreditation-areas` | Areas index (count from data) |
| `/accreditation-areas/:slug` | Area page (one template) |
| `/compliance-report` | Compliance Report index: optional overview, then recommendations grouped under an anchored heading per area (`/compliance-report#<area-slug>`) |
| `/compliance-report/:areaSlug/recommendation-:n` | Recommendation page (one template); `n` counts within the area |
| `/avp` | All AVPs, one entry per area, anchors such as `/avp#research` |
| `/certificate-of-authenticity` | Certificate PDF and image |
| `/additional-files` | Additional Files for the Accreditors (grouped when the data provides groups) |
| `/about` | Mission and Vision (Vision first), Goals and Objectives (per-program objective lists), Program Description (per program; added 2026-11-19, user's request), History (with the list of Deans) (anchored sections) |
| `/about/people` | Faculty, Staff and Student Assistants |
| `/about/faculty-by-department` | Faculty grouped by department |
| `/about/faqs-and-location` | FAQs plus map |
| `/content-status` | Missing-content checklist (not built into production) |
| `*` | 404 |

**Home sections, in the required order:**
1. Leadership carousel (President, then Dean, then faculty), full viewport width, sliding, auto-advancing with Pause/Play (D8 exception, 2026-11-20)
2. Quick-access row: Areas, Compliance Report, AVP, Certificate
3. First accreditation slide
4. **MPA LEVEL 4 PHASE 2 AACCUP ACCREDITATION** (renamed 2026-11-20, user's request; was "LEVEL IV AACCUP ACCREDITATION")
5. Second accreditation slide
6. Second slideshow or gallery
7. Graduate School video, or a link to it
8. Messages, stacked full width: the President's, then the Dean's, then the Program Chair's photo and message (President added 2026-11-19, user's request). Until a real photo arrives, dev and preview show a scenery stand-in from `src/dev/placeholders/`; production shows a silhouette (check:dist rule 9).
9. About preview: photo with Mission and Vision, Goals and Objectives, History, linking to `/about`

**Header navigation:**
- **Desktop:** Home · Accreditation Areas ▾ · Compliance Report ▾ · AVP · Documents ▾ (Certificate of Authenticity, Additional Files) · About ▾
- **Dropdowns:** list the child pages. The parent label links to its index page. The Compliance Report dropdown lists the areas that have visible recommendations, each linking to `/compliance-report#<area-slug>`, not the individual recommendations.
- Recommendation pages mark Compliance Report as the active parent.
- **Mobile:** a native `<dialog>` panel with collapsible groups.
- **Active page:** `aria-current` plus a maroon underline.
- **Label:** "Accreditation Areas" lives in `content/site.ts`, so switching to "Accreditation Scope" is a one-line change.

**Wayfinding:**
- Breadcrumbs on every page except Home.
- Previous/next links on area and recommendation pages. Recommendation links run across all areas in area order, then number.
- Recommendation title and H1: "<Area title>: Recommendation <n>". Breadcrumb: Home › Compliance Report › that title. There is no page per area under `/compliance-report`.
- Footer: logo, address and contact (once supplied), main links, and a "Content last updated" date from the data.

## 5. Visual identity

**Character:** archival and editorial. Flat surfaces, 1px borders, 4–6px corner radius, almost no shadows, no gradients or glass effects, generous whitespace on a strict spacing scale.

**Logo:**
- `ucn_logo.png` (from the parent `gsweb` folder) is the only institutional mark. It moves to `src/assets/` and is resized at build time.
- The header shows the seal next to the text "University of Camarines Norte / Graduate School".
- `public/SchoolLogo.png` and `public/favicon.svg` are removed. The favicon is generated from `ucn_logo.png`.

**Color tokens** (Tailwind `@theme`; final hex values sampled from the logo and checked for contrast):

| Token | Approx. | Use |
|---|---|---|
| `maroon-800` | `#800000` | Brand, headings, links, primary buttons, focus ring and active marker on white |
| `maroon-900` | darker | Hover and pressed states, footer |
| `gold-500` | `#d4a537` | Rules, dividers, one highlight call to action, and focus ring and active marker on maroon only |
| `paper`, `line`, `ink` | `#f7f5f4`, `#e6dedc`, `#2a1a1d` | Section bands, borders, body text |

**Type:** self-hosted variable `.woff2` files under the SIL Open Font License (Latin subset, preloaded):
- Source Serif 4 for headings
- Public Sans for body text and the interface
- fluid type scale, prose limited to about 70 characters per line, tabular numerals in document lists

**Signature elements:**
- Page header: a white band with breadcrumbs, a serif `h1` and a short gold rule. Full maroon appears only in the Home hero area and the footer.
- Resource rows look like file entries: format badge, title, host, and the actions View, Open in new tab and Download.
- Recommendation evidence groups are numbered (Evidence 1, 2, …).

**Motion:** 150 ms state transitions only, all disabled when the system asks for reduced motion.

## 6. Architecture

```
src/
  app/        router.tsx (createBrowserRouter from content/routes.ts), RootLayout.tsx
  components/
    layout/   SiteHeader, DesktopNav, MobileNav, SiteFooter, Breadcrumbs, PageHeader, Pager, SkipLink
    media/    Slideshow, ImageGallery, DocumentViewer, VideoEmbed, MapEmbed
    content/  ResourceList, ResourceRow, EvidenceGroup, BlockRenderer, Prose, PendingNotice
    ui/       ActionLink, Badge, SectionHeading, Disclosure
  features/   home/ areas/ compliance/ avp/ about/ documents/ content-status/
  pages/      thin route components (HomePage, AreaPage, RecommendationPage, …)
  content/    site.ts, home.ts, areas/<slug>.ts, recommendations/rec-NN.ts, avp.ts,
              documents.ts, people.ts, faqs.ts, about.ts, routes.ts
  types/      content.ts
  lib/        safeUrl.ts, resourceUrls.ts, published.ts
  styles/     global.css (Tailwind v4 + @theme tokens)
```

**Content model (`types/content.ts`):**

```ts
type Status = 'published' | 'pending';

type ResourceSource =
  | { kind: 'local'; path: `/files/${string}` }
  | { kind: 'drive'; fileId: string }
  | { kind: 'drive-folder'; folderId: string }
  | { kind: 'youtube'; videoId: string }
  | { kind: 'external'; url: string };          // link only, never embedded

interface Resource {
  id: string; title: string; description?: string;
  format: 'pdf' | 'image' | 'video' | 'folder' | 'doc' | 'link';
  source: ResourceSource; status: Status; downloadable?: boolean;
}

interface ImageAsset { src: string; alt: string; width: number; height: number; caption?: string }
// src/width/height come from vite-imagetools imports; alt '' only for decorative images.

type EvidenceBlock =
  | { type: 'text'; paragraphs: string[]; lang?: string }
  | { type: 'document'; resource: Resource; embed?: boolean }
  | { type: 'resources'; items: Resource[] }
  | { type: 'gallery'; images: ImageAsset[] }
  | { type: 'video'; resource: Resource };

interface EvidenceGroup { id: string; title: string; status: Status; blocks: EvidenceBlock[] }

interface Area {
  slug: string; order: number; title: string; summary?: string[];
  gallery: ImageAsset[]; narrativeReport: Resource;
  groups: EvidenceGroup[]; additionalFiles: Resource[];
  avp?: Resource & { avpTitle?: string };
}

interface Recommendation {
  number: number; title: string; statement?: string[];
  document: Resource; evidence: EvidenceGroup[]; additionalFiles: Resource[];
}

interface Person {
  id: string; name: string; postNominals?: string; position: string; rank?: string;
  department?: string; role: 'official' | 'faculty' | 'staff' | 'student-assistant';
  photo?: ImageAsset; status: Status;
}
```

**Rules:**
- **Embed URLs** are built only in `lib/resourceUrls.ts`, from IDs and fixed templates. The data never holds iframe URLs.
- **AVPs** are stored on their area. `/avp` reads them from the areas, so nothing is stored twice.
- **`/about/people` and `/about/faculty-by-department`** group the same `people.ts` list two ways.
- **`content/routes.ts`** derives every route. The router, navigation, breadcrumbs, previous/next links and the post-build route script all read it.
- **`lib/published.ts`** filters pending items when `import.meta.env.PROD` is set and preview mode is off. Sections and pages with nothing published fall back to a short "materials being prepared" note.
- **State:** local component state only, no state library.

**What happens to the existing code:**
- **Reused or adapted:** `ErrorBoundary`, `safeUrl` (extended), `fallbackImage`, lazy routes, the CSP build plugin, CI. `ImageGrid` becomes `ImageGallery`, `VideoCard` becomes `VideoEmbed`, `StaffCard` and `StaffDirectory` become the people directory, and `LocationSection` becomes `MapEmbed`.
- **Removed:** Ant Design, `AppProviders`, `OnDark`, the gallery category filter, the Research Office data, placeholder SVGs and `sample.mp4`, `vercel.json`, `public/_headers`, `public/_redirects`.
- **Renamed:** `package.json` name changes from `research-office-site`. The `index.html` title and description are updated.

## 7. PDF, media and link handling

**DocumentViewer:**
- **Local PDFs** display inline only when the resource sets `inline: true`; otherwise they show the Open / Download card. Changed 2026-11-18 (partly reverses R19) — reason: user's answer to §14.
  - Validation allows `inline` only for `kind: 'local'`, `format: 'pdf'` and a path that starts with `/files/`, ends in `.pdf` and has every segment matching `^[A-Za-z0-9_~-][A-Za-z0-9._~ -]*$`. Names with parentheses, commas, `& + ' @ %` or non-ASCII letters must be renamed to display inline; otherwise they show the card.
  - The frame is a titled, lazy-loading `<iframe>` with no `sandbox` (Chrome disables its PDF viewer inside sandboxed frames), plus Open in new tab and, if `downloadable`, Download.
  - If `navigator.pdfViewerEnabled === false`, the card shows instead.
  - Other local files (not PDF, or not opted in) stay as the card; local video stays an Open link. Documents that should display without these rules go on Drive.
- **Drive PDFs** use `https://drive.google.com/file/d/{id}/preview`.
- **Size:** height `min(85vh, 960px)`, minimum 480px, full width.
- **Actions:** Open in new tab is always shown. Download is shown only when `downloadable` is set.
- **When documents load:** the main document on a page (recommendation PDF, narrative report) embeds and loads lazily. Evidence documents are collapsed rows whose viewer loads only when the user presses Preview.
- **Failures:** the viewer never claims a cross-origin frame loaded. Missing local files fail the content test. `npm run check:links` (manual, needs network) requests Drive and external URLs and reports anything that doesn't return 200, such as files not shared publicly.

**Images:**
- `vite-imagetools` imports produce responsive WebP `srcset` and real dimensions.
- Images below the fold load lazily.
- `ImageGallery` uses a native `<dialog>` viewer with previous/next buttons, Esc to close, and focus restored.
- Alt text and captions come only from supplied data. Never describe people or events beyond what is supplied.

**Slideshow:**
- WAI carousel pattern: region with `aria-roledescription="carousel"`, slides labeled "N of M".
- Previous/next buttons and dots, swipe, and arrow keys while focused.
- Polite live region announces slide changes. No autoplay.

**Video:**
- YouTube plays from `https://www.youtube-nocookie.com/embed/{id}`; Drive videos use `/preview`.
- Each video shows a poster first and loads the player on click.
- Every frame has a `title`.
- Facebook videos appear as external links only.

**Map:** keyless `https://www.google.com/maps?q={query}&output=embed` plus an Open in Google Maps link. No API keys.

**Links:**
- Link text is the resource title. Each link has a format badge.
- Internal links use the router's `Link`.
- External links use `target="_blank" rel="noopener noreferrer"` with an icon and screen-reader text saying it opens in a new tab.
- Google `google.com/url?q=` wrappers are removed when content is entered.

## 8. Frontend security

**Allowed embeds:** frames can only come from this site (`'self'`, used only for opted-in local PDFs), `drive.google.com`, `docs.google.com`, `www.youtube-nocookie.com` and `www.google.com`. Remote frames are built from IDs.

**Link validation:** links must be `https:` URLs. `javascript:`, `data:` and `http:` are rejected by `safeUrl` at render time and by the content test at build time.

**iframes:**
- `sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"` on Drive and YouTube frames. Exception: the frame for an opted-in local PDF has no `sandbox`, because Chrome disables its PDF viewer in sandboxed frames.
- `referrerpolicy="strict-origin-when-cross-origin"`
- a minimal `allow` list
- `loading="lazy"`

**No HTML rendering:** content is plain strings. An ESLint rule bans `dangerouslySetInnerHTML`.

**CSP** (server header; meta-tag fallback without `frame-ancestors`):

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://i.ytimg.com;
frame-src 'self' https://drive.google.com https://docs.google.com https://www.youtube-nocookie.com https://www.google.com;
media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none';
frame-ancestors 'none'; upgrade-insecure-requests
```

Changed 2026-11-18: `frame-src` gained `'self'`, and responses for `.pdf` files get `frame-ancestors 'self'` instead of `'none'` — reason: user's answer to §14 (inline local PDFs). Every other response, including all site pages, keeps `frame-ancestors 'none'`. The meta-tag fallback cannot carry `frame-ancestors`.

`check:dist` keeps a same-origin frame safe: it fails if any `.html`, `.htm`, `.svg`, `.xml`, `.xhtml`, `.js` or `.mjs` file sits under `dist/files/`, or a directory there is named `*.pdf`. A same-origin frame can then only hold a PDF.

`style-src` without `'unsafe-inline'` must be verified once the site is built. If something genuinely needs it, the reason is recorded.

**Other headers:**
- Kept from today's config: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation and payment disabled), `Cross-Origin-Opener-Policy: same-origin`.
- HSTS only if UCN serves the domain over HTTPS.

**Delivery:**
- The build generates Nginx includes in `dist-nginx/` (git-ignored, outside the web root): `ucn-gs.conf` (location blocks), `security-headers.conf` and `pdf-headers.conf`. The header values come from `config/csp.mjs`; no header text is typed in the template.
- Each location includes a headers file itself, because Nginx drops inherited `add_header` lines in any location that declares its own.
- The config sends `no-cache` on HTML, immutable caching under `<base>assets/`, the PDF headers on any `.pdf`, denies dotfiles, and sets `error_page 404 <base>404.html`.
- `docs/deployment.md` says how to install it. CI job `nginx-smoke` runs `scripts/nginx-smoke.sh` against real Nginx.

**Deployment doc:** covers HTTPS, restricted deploy access, multi-factor authentication, branch protection, and rollback by keeping the previous `dist/`. It states that a static frontend cannot prevent DDoS or server-level defacement.

**Dependencies:**

| Change | Packages |
|---|---|
| Removed | `antd`, `@ant-design/icons` |
| Added (runtime) | `lucide-react` |
| Added (dev, build-time) | `tailwindcss`, `@tailwindcss/vite` (nothing from them reaches `dist/`; see the 2026-11-18 note below) |
| Added (dev) | `vite-imagetools`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` |

Each package is checked for maintenance and compatibility before install. `npm audit --omit=dev` runs after every change, and findings are reported.

*Note, 2026-11-18:* `tailwindcss` and `@tailwindcss/vite` are build-time only, so they live in `devDependencies`. This keeps the Vite/picomatch ReDoS advisory (GHSA-fc5q-39xc-vjpf, no patched version yet) out of the production audit, which now reports 0 vulnerabilities. The advisory remains in the dev tree and is tracked by the informational CI step `npm audit --audit-level=high || true`; bump the toolchain once a patched picomatch is available.

## 9. Accessibility and performance

**Accessibility:**
- **Structure:** skip link, landmarks, one `h1` per page, no skipped heading levels.
- **Route changes:** focus moves to the `h1` and `document.title` updates from route metadata.
- **Navigation:** dropdowns are disclosure buttons (`aria-expanded`, Esc closes), not ARIA menus. The mobile panel is a native `<dialog>`.
- **FAQs:** native `<details>`/`<summary>`.
- **Focus ring:** 2px maroon with a white offset on light surfaces, gold on maroon surfaces.
- **Sizing and layout:** touch targets at least 24px (44px for navigation), no horizontal overflow at 320px.
- **Color alone:** state is never shown by color only.
- **Reduced motion** is respected.

**Performance:**
- Pages load per route, at most 120 kB gzipped JS on first load.
- Two preloaded font files.
- Iframes load on click, and images are responsive and lazy-loaded.
- Dimensions are declared to prevent layout shift.

## 10. Testing and verification

**Unit tests:** `safeUrl`, `resourceUrls`, the route manifest, `published` filtering.

**Content test:**
- unique IDs
- local files exist
- `https:` links only
- alt text present on informative images
- required fields present on published items
- Drive and YouTube ID format

**Component tests:**
- slideshow keyboard behavior and announcements
- navigation dropdowns and mobile dialog (open, Esc, focus return)
- DocumentViewer fallback
- a smoke test that renders every manifest route

**Scripts and CI:**
- `npm test` is added to CI next to lint, typecheck, build and audit.
- `npm run check:links` stays manual.

**Rendered checks:** `playwright-cli` at 375, 768 and 1280 px, including keyboard passes. Then a design audit with `impeccable` and an accessibility audit with `design:accessibility-review`.

**Reviews:** `ucn-opus-reviewer` at checkpoints A, B and C, per `CLAUDE.md`.

## 11. Build and deployment

**Build command:** `npm run build` runs `tsc -b`, then `vite build`, then `node scripts/write-route-pages.mjs`. The script writes `dist/<route>/index.html` for each manifest route and a `dist/404.html`.

**Base path:** `VITE_BASE_PATH` (default `/`) sets Vite's `base` and the router's `basename`, for hosting at the domain root or under a subpath.

**Shipped files:** `dist/` holds the site and no server config. The Nginx config is generated beside it into `dist-nginx/` (`ucn-gs.conf`, `security-headers.conf`, `pdf-headers.conf`), using env `UCN_DOCROOT` (default `/var/www/ucn-gs/`) and `UCN_NGINX_INCLUDE_DIR` (default `/etc/nginx/ucn-gs/`). Apache `.htaccess` files are no longer written. Changed 2026-11-18 — reason: user's answer to §14 (Nginx). Install steps are in `docs/deployment.md`.

## 12. Skills and agents for later phases

**Installed and planned:**
- `awesome-design` and `design-taste-frontend` (the prompt's "Taste") to refine the visual system
- `impeccable` for the visual and UX audit
- `react-test-pilot` for tests
- `VibeSec-Skill` for the security review
- `design:accessibility-review`
- `playwright-cli` for rendered checks
- `ucn-opus-reviewer` for checkpoint reviews

**Not installed:** Graphify. It will not be used.

**Agency agents:** the `msitarzewski/agency-agents` repo has not been inspected yet. The planning phase reviews it and adds an agent only if it fills a gap the existing tools don't cover (likely accessibility or QA).

## 13. Content inventory and mapping

**Reference to UCN mapping:**

| UCN page | Reference equivalent | UCN material status |
|---|---|---|
| Home | Home | Received 2026-11-19: President's, Dean's and Program Chair's messages; Vision, Mission, Goals, Objectives (7 programs), Program Descriptions (7 programs), History and Deans. Received 2026-11-20: 18 leadership slides (President, Dean, chairpersons, faculty). Missing: accreditation slides 1–2, second gallery, GS video, the three message photos, About photo |
| Additional Files | Additional Files for the Accreditors (9 links) | Missing: UCN file list |
| Certificate of Authenticity | placeholder | Missing: certificate PDF and image |
| Compliance Report and Recommendations | Rec 1–8 (3–5 evidence items each) | Known (2026-11-18): 14 recommendations by area — Research 2, Performance of Graduates 1, Community Service 5, International Linkages & Consortia 5, Planning Process 1. Missing: titles, documents, evidence |
| Accreditation Areas | 5 areas (Research, Teaching and Learning, Extension, International Linkages, Planning Process) | Known (2026-11-18): Research; Performance of Graduates; Community Service; International Linkages & Consortia; Planning Process, each with its own AVP. Missing: narrative reports, galleries, evidence |
| AVP | 5 Drive videos | Missing: UCN AVPs |
| About and People | Officials and Staff, Faculty | Missing: names, positions, departments, photos, student assistants |
| FAQs and Location | Location only (no FAQs) | Missing: FAQ text, campus address and map query, contact details |

**Assets available locally:** only `ucn_logo.png`.

## 14. Open questions

Answered by the user on 2026-11-18 (the decisions above carry the changes):
1. Program and year: MPA, AACCUP Level IV Phase 2, 2026 (D4).
2. Area list: five, in the order given in §13.
3. Recommendations: 14, counted per area as in §13 (§4 routes).
4. Server: Nginx on a local UCN server (D6). HSTS still depends on HTTPS.
5. PDF display: chosen per document: inline local, Open / Download card, or Drive (§7).
6. Language: English only; no `lang="fil"`.

Still open:
- The 14 recommendation titles.
- The Nginx server's domain or IP, the base path and whether HTTPS is available.
- Per document: inline, card or Drive, and download permission (default: view-only for Drive, downloadable for local files).

## 15. Risks

**Drive sharing:** Drive files can stop showing if sharing changes. Mitigations are the visible Open in new tab link and `check:links`.

**Content arriving late:** the site relies on the user supplying everything. The pending/published model keeps production clean in the meantime.

**Route pages are shells:** per-route `index.html` files contain the app shell, not pre-rendered text, so search engines see little without JavaScript. This is acceptable for an accreditation site; real prerendering is out of scope.

**Browser PDF support** varies. The fallback card handles it.

**Third-party CSP:** if Google or YouTube change their embed hosts, frames break until the CSP is updated. A rendered check is needed after any change to allowed hosts.

# UCN Graduate School Accreditation Website: Design Spec

- **Date:** 2026-10-29
- **Status:** design approved in conversation, section by section (2026-10-29). Awaiting the user's review of this written spec.
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
| D4 | One program. | User's answer. |
| D5 | Each item has a `published` or `pending` status. Pending items show in dev and preview builds, are hidden in production, and are listed on a dev-only `/content-status` page. | Accreditors never see empty or fake slots. |
| D6 | Deploy to UCN's own server (Apache or Nginx, still to be confirmed). Write a per-route `index.html` after build; ship Apache `.htaccess` and document Nginx. Remove `vercel.json`, `public/_headers` and `public/_redirects`. | Configure only the platform in use. Routes work without rewrites. |
| D7 | Refactor in place (approach A). Content lives in typed TS modules plus a content validation test. | Preserves working CI, security setup and conventions. |
| D8 | No slideshow autoplay. | Avoids distracting motion and the pause-control requirement. |
| D9 | Gold is never used as text, focus ring or state indicator on white. | Gold on white is about 2.1:1, below the 3:1 minimum. |

## 4. Sitemap, routes and navigation

| Route | Page |
|---|---|
| `/` | Home |
| `/accreditation-areas` | Areas index (count from data) |
| `/accreditation-areas/:slug` | Area page (one template) |
| `/compliance-report` | Compliance Report index: optional overview, list of Recommendations 1–N |
| `/compliance-report/recommendation-:n` | Recommendation page (one template) |
| `/avp` | All AVPs, one entry per area, anchors such as `/avp#research` |
| `/certificate-of-authenticity` | Certificate PDF and image |
| `/additional-files` | Additional Files for the Accreditors (grouped when the data provides groups) |
| `/about` | Mission and Vision, Goals and Objectives, History (anchored sections) |
| `/about/people` | Faculty, Staff and Student Assistants |
| `/about/faculty-by-department` | Faculty grouped by department |
| `/about/faqs-and-location` | FAQs plus map |
| `/content-status` | Missing-content checklist (not built into production) |
| `*` | 404 |

**Home sections, in the required order:**
1. Leadership slideshow (President, then Dean, then faculty)
2. Quick-access row: Areas, Compliance Report, AVP, Certificate
3. First accreditation slide
4. **LEVEL IV AACCUP ACCREDITATION** (wording preserved)
5. Second accreditation slide
6. Second slideshow or gallery
7. Graduate School video, or a link to it
8. Dean's photo and message, then the Program Chair's photo and message
9. About preview: photo with Mission and Vision, Goals and Objectives, History, linking to `/about`

**Header navigation:**
- **Desktop:** Home · Accreditation Areas ▾ · Compliance Report ▾ · AVP · Documents ▾ (Certificate of Authenticity, Additional Files) · About ▾
- **Dropdowns:** list the child pages. The parent label links to its index page.
- **Mobile:** a native `<dialog>` panel with collapsible groups.
- **Active page:** `aria-current` plus a maroon underline.
- **Label:** "Accreditation Areas" lives in `content/site.ts`, so switching to "Accreditation Scope" is a one-line change.

**Wayfinding:**
- Breadcrumbs on every page except Home.
- Previous/next links on area and recommendation pages.
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
- **Local PDFs** open in a titled `<iframe>` using the browser's viewer. If `navigator.pdfViewerEnabled === false`, a fallback card shows Open PDF and Download.
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

**Allowed embeds:** frames can only come from `drive.google.com`, `docs.google.com`, `www.youtube-nocookie.com` and `www.google.com`, built from IDs.

**Link validation:** links must be `https:` URLs. `javascript:`, `data:` and `http:` are rejected by `safeUrl` at render time and by the content test at build time.

**iframes:**
- `sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"`
- `referrerpolicy="strict-origin-when-cross-origin"`
- a minimal `allow` list
- `loading="lazy"`

**No HTML rendering:** content is plain strings. An ESLint rule bans `dangerouslySetInnerHTML`.

**CSP** (server header; meta-tag fallback without `frame-ancestors`):

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://i.ytimg.com;
frame-src https://drive.google.com https://docs.google.com https://www.youtube-nocookie.com https://www.google.com;
media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none';
frame-ancestors 'none'; upgrade-insecure-requests
```

`style-src` without `'unsafe-inline'` must be verified once the site is built. If something genuinely needs it, the reason is recorded.

**Other headers:**
- Kept from today's config: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation and payment disabled), `Cross-Origin-Opener-Policy: same-origin`.
- HSTS only if UCN serves the domain over HTTPS.

**Delivery:**
- `public/.htaccess` (mod_headers, long caching for hashed `/assets/*`, `ErrorDocument 404`).
- The Nginx equivalent goes in `docs/deployment.md`.

**Deployment doc:** covers HTTPS, restricted deploy access, multi-factor authentication, branch protection, and rollback by keeping the previous `dist/`. It states that a static frontend cannot prevent DDoS or server-level defacement.

**Dependencies:**

| Change | Packages |
|---|---|
| Removed | `antd`, `@ant-design/icons` |
| Added (runtime) | `tailwindcss`, `@tailwindcss/vite`, `lucide-react` |
| Added (dev) | `vite-imagetools`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` |

Each package is checked for maintenance and compatibility before install. `npm audit --omit=dev` runs after every change, and findings are reported.

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

**Shipped files:** `dist/` includes `.htaccess`. Nginx users apply the config in `docs/deployment.md`.

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
| Home | Home | Missing: leadership photos, accreditation slides 1–2, second gallery, GS video, Dean's and Program Chair's photos and messages, Mission and Vision, Goals and Objectives, History |
| Additional Files | Additional Files for the Accreditors (9 links) | Missing: UCN file list |
| Certificate of Authenticity | placeholder | Missing: certificate PDF and image |
| Compliance Report and Recommendations | Rec 1–8 (3–5 evidence items each) | Missing: number and titles of UCN recommendations, documents, evidence |
| Accreditation Areas | 5 areas (Research, Teaching and Learning, Extension, International Linkages, Planning Process) | Missing: UCN area list, narrative reports, galleries, evidence |
| AVP | 5 Drive videos | Missing: UCN AVPs |
| About and People | Officials and Staff, Faculty | Missing: names, positions, departments, photos, student assistants |
| FAQs and Location | Location only (no FAQs) | Missing: FAQ text, campus address and map query, contact details |

**Assets available locally:** only `ucn_logo.png`.

## 14. Open questions

1. Program name, plus the accreditation year or date to show.
2. The UCN area list (names, order, count). The reference's five are not assumed.
3. The number of recommendations and their titles. Eight is not assumed.
4. Apache or Nginx; domain and base path; whether HTTPS is available (HSTS depends on it).
5. Download permission for each document. The default is view-only for Drive and downloadable for local files.
6. Whether Filipino-language text will appear (it would be marked `lang="fil"`).

## 15. Risks

**Drive sharing:** Drive files can stop showing if sharing changes. Mitigations are the visible Open in new tab link and `check:links`.

**Content arriving late:** the site relies on the user supplying everything. The pending/published model keeps production clean in the meantime.

**Route pages are shells:** per-route `index.html` files contain the app shell, not pre-rendered text, so search engines see little without JavaScript. This is acceptable for an accreditation site; real prerendering is out of scope.

**Browser PDF support** varies. The fallback card handles it.

**Third-party CSP:** if Google or YouTube change their embed hosts, frames break until the CSP is updated. A rendered check is needed after any change to allowed hosts.

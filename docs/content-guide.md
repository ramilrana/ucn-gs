# Content guide

How to add and change content on the UCN Graduate School accreditation site. You do not need to know React. You edit small text files, run a few commands, and the site checks your work.

Two rules come before everything else:

- **Never invent content.** Use UCN's exact wording for names, titles, statements and dates. If the material has not arrived, leave the item `pending`.
- **Flip an item to `published` only when its material is verified.** A published item is public text on a public site.

## 1. Where content lives

All content is in `src/content/`. You only edit these files; the page code is not touched.

| What | File |
|---|---|
| University and school name, program name, contact details, map | `src/content/site.ts` |
| Home page leadership slides, President, Dean and Program Chair messages | `src/content/home.ts` (accreditation slideshow photos: `src/content/accreditation.ts`) |
| About page: photo, vision, mission, goals, objectives and program descriptions (one entry per program), history, list of Deans | `src/content/about.ts` |
| Officials, faculty, staff, student assistants | `src/content/people.ts` |
| FAQs | `src/content/faqs.ts` |
| Compliance Report overview | `src/content/compliance.ts` |
| Certificate of Authenticity | `src/content/documents.ts` |
| One accreditation area | `src/content/areas/<slug>.ts` (one file per area) |
| One recommendation | `src/content/recommendations/<area-slug>/rec-NN.ts` (one file per recommendation, in its area's folder) |

The five areas (Research; Teaching and Learning; Community Service; International Linkages & Consortia; Planning Process) and their 14 recommendations already exist as `pending` stubs: 2, 1, 5, 5 and 1 recommendations, in that order. Fill the stubs in place. The site finds files in these folders by itself, so you do not register anything.

## 2. Status: pending and published

Every item has a `status`:

- `'pending'`: the material is not ready. The item is **hidden on the live site**. In preview (section 8) it shows as a "materials being prepared" placeholder.
- `'published'`: the item is public.

To publish an item, change `status: 'pending'` to `status: 'published'` and fill in the real value or source (the next sections show how). A `published` item without a source, or with an empty `alt`, fails the content test.

A pending area, group or person hides everything inside it, even items inside it marked `published`.

### Slots and their labels

Single items (a photo, the mission statement, the contact details) are **slots**. A slot has a `label`:

```ts
mission: { status: 'pending', label: 'Mission' },
```

The label is public text. It appears on the page as the heading or prefix for that item (for example "Mission" and "Vision" on the About page). Editing a label changes what visitors read. Change it only to correct the wording.

To publish a slot, set `status: 'published'` and add a `value`:

```ts
mission: { status: 'published', label: 'Mission', value: ['First paragraph.', 'Second paragraph.'] },
```

Text values are lists of paragraphs, one string per paragraph.

## 3. Add an area

1. Copy the area template (section 3.1) into a new file `src/content/areas/<slug>.ts`.
2. Pick the slug: lowercase letters and digits, words joined with hyphens (`area-3-faculty`). It becomes the web address, `/accreditation-areas/<slug>`.
3. Set `slug` inside the file to exactly the file name without `.ts`. The content test fails if they differ.
4. Set `order` (areas are listed by this number, lowest first) and `title` (UCN's exact area title).
5. Add the narrative report, gallery and evidence groups as the materials become ready (sections 5, 6 and 7).
6. Keep `status: 'pending'` until everything in the area is verified, then change it to `'published'`.

The five area files exist already, so normally you fill one in rather than add one. Fill in a stub by replacing its pending slots, as in sections 5 to 7, and keep its `slug` and file name.

The site build creates an HTML copy for every area and recommendation file it finds, pending or not. A pending file's address shows the site's "not found" page (HTTP 200, not 404), which tells anyone who guesses the address that the slug exists. The stubs are already in place; do not add further files until their material is ready.

### 3.1 Area template

Copy this whole block. Every `REPLACE` marks something you must change. The file type-checks as it stands.

```ts
import type { Area } from '../../types/content';

// File name must be the slug: this file is src/content/areas/REPLACE-slug.ts
const area: Area = {
  slug: 'REPLACE-slug',
  order: 1,
  title: 'REPLACE: area title exactly as UCN words it',
  status: 'pending',
  // summary: ['REPLACE: optional introductory paragraph, one string per paragraph'],
  gallery: { status: 'pending', label: 'REPLACE: gallery label' },
  narrativeReport: {
    id: 'REPLACE-slug-narrative-report',
    title: 'REPLACE: narrative report title',
    format: 'pdf',
    status: 'pending',
  },
  groups: [],
  additionalFiles: [],
  // avp: { id: 'REPLACE-slug-avp', title: 'REPLACE', avpTitle: 'REPLACE', format: 'video', status: 'pending' },
};

export default area;
```

`id` values must be unique across the whole site (the content test checks). Start every id with `area-<slug>-`. In the template above, `REPLACE-slug-narrative-report` becomes `area-<slug>-narrative`, as in the stubs.

## 4. Fill in or add a recommendation

The 14 recommendation stubs exist, each titled "Recommendation n" until UCN supplies the real title. Open the file, replace the title and document, and publish when verified. To add one more, follow the same rules:

1. Put the file in the folder of its area: `src/content/recommendations/<area-slug>/rec-NN.ts`, for example `src/content/recommendations/community-service/rec-03.ts`. `<area-slug>` is the area file's name without `.ts`.
2. Numbers count **within the area** and run 1, 2, 3 … without gaps. `rec-03.ts` contains `number: 3` and is the third of its area. The page address is `/compliance-report/<area-slug>/recommendation-<n>`, and its title is "<Area title>: Recommendation <n>".
3. Set `areaSlug` to the folder name. It must match an existing area file; the content test fails otherwise.
4. Fill in `title`, the main `document`, and `evidence` groups (sections 5 to 7).
5. A `published` recommendation needs its area to be `published` too, or the content test fails.

### 4.1 Recommendation template

```ts
import type { Recommendation } from '../../../types/content';

// This file is src/content/recommendations/REPLACE-area-slug/rec-01.ts
const recommendation: Recommendation = {
  areaSlug: 'REPLACE-area-slug',
  number: 1,
  title: 'REPLACE: recommendation title exactly as UCN words it',
  status: 'pending',
  // statement: ['REPLACE: optional statement of the recommendation, one string per paragraph'],
  document: {
    id: 'rec-REPLACE-area-slug-01-document',
    title: 'REPLACE: document title',
    format: 'pdf',
    status: 'pending',
  },
  evidence: [],
  additionalFiles: [],
};

export default recommendation;
```

Id convention: recommendation resources start with `rec-<area-slug>-NN-` (`rec-research-01-document`); area resources start with `area-<slug>-` (`area-research-narrative`, `area-research-avp`). Ids must be unique across the whole site.

## 5. Add documents and files

Every file on the site is a **resource**: a title, a format and a source.

```ts
{
  id: 'area-3-faculty-narrative-report',   // unique across the whole site
  title: 'Narrative Report',
  format: 'pdf',                            // 'pdf' | 'image' | 'video' | 'folder' | 'doc' | 'link'
  status: 'published',
  source: { /* one of the sources below */ },
}
```

Set `downloadable: true` to add a download button for a Drive or local file. You can add a `description` line.

### 5.1 A file on Google Drive (shown inline)

Use Drive for any document that should display on the page.

1. In Google Drive, open **Share** on the file and set General access to **Anyone with the link** (Viewer).
2. Copy the file's link. It looks like `https://drive.google.com/file/d/<FILE_ID>/view?usp=sharing`.
3. Paste **only the file ID** (the part between `/d/` and `/view`), not the whole link:

```ts
source: { kind: 'drive', fileId: 'PASTE-THE-FILE-ID-HERE' },
```

For a Drive folder use `{ kind: 'drive-folder', folderId: '…' }`, which gives an "open folder" link. The site builds the viewer address itself from the ID. IDs are at least 20 characters of letters, digits, `-` and `_`; anything else fails the content test.

A Drive file that is not shared as "Anyone with the link" shows visitors a Google sign-in page inside the frame. The page still offers an "Open in new tab" link, but fix the sharing (section 9).

### 5.2 A file on this site

1. Put the file under `public/files/`, for example `public/files/area-3/narrative-report.pdf`. Use simple lowercase names without spaces (spaces are allowed for the Open / Download card but make awkward addresses).
2. Point to it with a path that starts with `/files/`:

```ts
source: { kind: 'local', path: '/files/area-3/narrative-report.pdf' },
```

A local file appears as an "Open file / Download" card unless you opt it in to display inline (5.2.1). If a document should display inside the page and does not meet the inline rules, put it on Google Drive (5.1).

**Allowed file types.** `npm run check:dist` fails if any `.html`, `.htm`, `.svg`, `.xml`, `.xhtml`, `.js` or `.mjs` file is under `public/files/`, or a folder there is named `*.pdf`. Convert such material to PDF, or host it elsewhere.

### 5.2.1 Showing a local PDF inline

Add `inline: true` to the resource:

```ts
{
  id: 'rec-research-01-document',
  title: '…',
  format: 'pdf',
  status: 'published',
  inline: true,
  source: { kind: 'local', path: '/files/research/rec-01.pdf' },
},
```

The content test rejects `inline: true` unless all of these hold:
- the source is `kind: 'local'` and `format` is `'pdf'`;
- the path starts with `/files/` and ends in `.pdf`;
- every folder and file name in the path starts with a letter, digit, `_`, `~` or `-`, and continues with letters, digits, `.`, `_`, `~`, `-` or spaces only.

Rename files with parentheses, commas, `& + ' @ %` or non-ASCII letters (accents, for example) before using `inline: true`. Without the flag they still work, as the Open / Download card.

A browser with no built-in PDF viewer also falls back to the card, and Open in new tab is always there. Inline frames for local PDFs have no sandbox, and the server allows them only for `.pdf` files (see deployment.md). Pick per document: inline local, card, or Drive.

**File names are case-sensitive on the server.** `Report.pdf` and `report.pdf` are different files on the live server, even though Windows and macOS treat them as the same. The content test checks the exact case against `public/files/`, so a mismatch fails the test.

### 5.3 A YouTube video

Paste only the 11-character video ID (the part after `v=`):

```ts
source: { kind: 'youtube', videoId: 'PASTE-THE-VIDEO-ID' },
```

### 5.4 Another website

```ts
source: { kind: 'external', url: 'https://example.org/page' },
```

Only `https://` addresses are accepted. Do not use a `https://www.google.com/url?...` redirect; paste the real address.

## 6. Add photos

1. Put the photo in `src/assets/`, in a folder of your own such as `src/assets/areas/area-3/photo-1.jpg`. (Photos in `src/assets/` are resized into small, medium and large WebP versions at build time.)
2. Import it at the top of the content file. End the import path with the image query `?w=480;960;1600&format=webp&as=picture`. This text is the constant `PHOTO_QUERY` in `src/lib/images.ts`. An `import` line cannot use a variable, so paste the text itself:

```ts
import photo1 from '../../assets/areas/area-3/photo-1.jpg?w=480;960;1600&format=webp&as=picture';
import { toImageAsset } from '../../lib/images';
```

3. Wrap it with `toImageAsset(photo, alt, caption?)`:

```ts
toImageAsset(photo1, 'Faculty members reviewing documents at a table', 'Optional caption')
```

**Alt text is required.** The second argument describes the photo for people who cannot see it. Describe what is in the picture, and do not invent names. A published image with empty alt text fails the content test.

Where photos go:

- Area gallery: `gallery: { status: 'published', label: '…', value: [toImageAsset(photo1, '…'), toImageAsset(photo2, '…')] }`
- Photo inside an evidence group: a `{ type: 'gallery', images: [toImageAsset(photo1, '…')] }` block (section 7).
- Home page, About page and people: the matching slot or `photo` field in `home.ts`, `about.ts` or `people.ts`.
- Leader messages: add `photo: toImageAsset(photo, 'Portrait of …')` inside the message's `value` in `home.ts`. Until then, dev and preview show a scenery stand-in (from `src/dev/placeholders/`, never on the live site) and `/content-status` lists the photo as still needed.

Use JPEG or PNG sources. Keep each file under a few MB; the build makes the web sizes.

## 7. Evidence groups

An area has `groups`; a recommendation has `evidence`. Each is a list of **evidence groups**, a titled section made of blocks:

```ts
{
  id: 'area-3-faculty-group-1',
  title: 'REPLACE: group title as UCN words it',
  status: 'published',
  blocks: [
    // Text, one string per paragraph
    { type: 'text', paragraphs: ['REPLACE: verified text'] },
    // One document. embed: true shows it inline when it is on Drive; false shows a Preview button
    { type: 'document', embed: false, resource: { id: 'area-3-faculty-doc-1', title: '…', format: 'pdf', status: 'published', source: { kind: 'drive', fileId: '…' } } },
    // A list of files
    { type: 'resources', items: [ /* resources, as in section 5 */ ] },
    // Photos
    { type: 'gallery', images: [ /* toImageAsset(...) entries */ ] },
    // A video
    { type: 'video', resource: { id: 'area-3-faculty-video-1', title: '…', format: 'video', status: 'published', source: { kind: 'youtube', videoId: '…' } } },
  ],
},
```

Documents with many files do not slow the page: previews load only when a visitor presses **Preview**.

## 8. Preview your changes

- `npm run dev` starts the site on your computer (open the address it prints, usually `http://localhost:5173`). It shows **pending items** as placeholders, plus stand-in leader photos. (The built-in "Sample area" was removed from the menus and pages on 2026-11-23; `src/dev/samples.ts` is now used only by tests.) The checklist page **`/content-status`** lists everything still pending. It exists only in dev and preview, never in production. Saving a file refreshes the page.
- `npm run build:preview` makes a preview build with the same pending view, for checking a built copy. `npm run preview` serves it. **Never deploy a preview build.**
- Production (`npm run build`) **hides all pending items** and the stand-in photos. When nothing is published yet the site shows "materials being prepared" notes, not empty pages.

## 9. Check your work

Run these before every release:

```bash
npm test               # content rules, and everything else
npm run check:links    # fetches every published Drive, YouTube and external link
```

`npm test` fails with a clear message when an id is duplicated, a local file is missing (or has the wrong letter case), a Drive or YouTube ID is malformed, a published item has no source, a published photo has no alt text, a file name does not match its slug or number, or a slug is not lowercase with hyphens.

`npm run check:links` needs internet access and takes a moment. It reports each link as ok, redirect, **not-public** (a Drive file that is not shared as "Anyone with the link") or broken, and fails on the last two. With nothing published yet it correctly reports **0 targets**.

Google may answer some private Drive files with a normal 200 response instead of a sign-in redirect, so the check can miss them. Once real content exists, test at least one file that you know is **not** shared and confirm that `check:links` flags it. Also open a few Drive links in a private browser window, where you are not signed in to Google.

## 10. Build and deploy

```bash
npm run build          # type-checks, builds into dist/, writes the per-page copies
npm run check:dist     # fails if dist/ is not safe to deploy
```

If the site will live under a subpath such as `https://example.edu.ph/gs/`, create a file named `.env.production.local` in the project folder containing exactly:

```
VITE_BASE_PATH=/gs/
```

Then run the two commands above. Delete the file when you build for the domain root again.

**Do not set `VITE_BASE_PATH` on the command line in Git Bash** (`VITE_BASE_PATH=/gs/ npm run build`). Git Bash rewrites `/gs/` into a Windows path and the build breaks silently. Use `.env.production.local`.

Copy the contents of `dist/` to the server's web folder. The Nginx config the build generates in `dist-nginx/` is installed once by the server admin and again whenever the base path or server paths change. There are no `.htaccess` files to upload. Server paths, post-deploy checks, rollback and security notes are in [deployment.md](./deployment.md).

## Quick checklist for publishing an item

1. The material is UCN's own and the wording is exact.
2. Files are on Drive ("Anyone with the link", ID only) or in `public/files/` (exact letter case; PDFs with `inline: true` have simple file names).
3. Photos are in `src/assets/` with real alt text.
4. `status` is `'published'` on the item and on every group and area containing it.
5. `npm run dev` shows it correctly, and `/content-status` no longer lists it.
6. `npm test` and `npm run check:links` pass.
7. `npm run build && npm run check:dist` pass, then deploy.

# Deployment

The site is a static build served by Nginx on a local UCN server. `npm run build` writes the site to `dist/` and an Nginx config to `dist-nginx/`; there is no server-side code. Apache is not supported: the build no longer writes `.htaccess` files. The one exception is the client-review copy on UCN's cPanel host, with a hand-made `.htaccess` (see Client-review copy on cPanel).

## Build

```bash
npm ci
npm run build        # tsc -b, vite build, then scripts/write-route-pages.mjs
npm run check:dist   # fails if dist/ or dist-nginx/ is not deployable
```

`write-route-pages.mjs` copies `dist/index.html` into one folder per route (for example `dist/about/people/index.html`) and to `dist/404.html`. It then writes the Nginx files into `dist-nginx/` (git-ignored, next to `dist/`, never inside the web root):

- `ucn-gs.conf`: the `location` blocks for the site.
- `security-headers.conf`: the five security headers for pages and assets.
- `pdf-headers.conf`: the same five headers, with `frame-ancestors 'self'` so local PDFs can display in the site's own frames.

`npm run build:preview` builds with sample and pending content visible (`.env.preview-content`). Use it to review pages. **Never deploy a preview build.** `check:dist` fails on one by design.

## Building for a subpath

To serve the site from `https://<host>/gs/` instead of the domain root, create `.env.production.local` (it is git-ignored) containing:

```
VITE_BASE_PATH=/gs/
```

Then build as above. The base goes into asset URLs, the per-route pages, `error_page` and every `location` in `ucn-gs.conf`, and into the router. `check:dist` reads the base from `dist/index.html` and confirms that every root-absolute URL, the `error_page` line and the assets location carry it. Delete `.env.production.local` when you build for the root again.

## Generate the config for the server's paths

The generated config contains two absolute paths: where `dist/` will live on the server (the docroot) and where the three `.conf` files will live. Set them at build time:

| Env var | Default | Meaning |
|---|---|---|
| `UCN_DOCROOT` | `/var/www/ucn-gs/` | Folder that receives the contents of `dist/` |
| `UCN_NGINX_INCLUDE_DIR` | `/etc/nginx/ucn-gs/` | Folder that receives `dist-nginx/*.conf` |

Both must be absolute and end in `/`. Whitespace, quotes, `;`, `{`, `}`, `$`, backticks and backslashes are rejected.

```bash
UCN_DOCROOT=/srv/ucn-gs/ UCN_NGINX_INCLUDE_DIR=/etc/nginx/ucn-gs/ npm run build
npm run check:dist
```

On Windows in Git Bash, prefix the command with `MSYS_NO_PATHCONV=1`. Git Bash otherwise rewrites `/srv/...` into `C:/Program Files/Git/...` and the build stops with an error about the path.

## Install on the server

1. Copy the contents of `dist/` to the docroot.
2. Copy `dist-nginx/ucn-gs.conf`, `security-headers.conf` and `pdf-headers.conf` to the include folder. Keep the three together: the config includes the other two by absolute path.
3. The server admin adds one line inside the site's `server { }` block:

   ```nginx
   server {
       listen 80;
       server_name <host>;

       include /etc/nginx/ucn-gs/ucn-gs.conf;
   }
   ```

4. Test and reload:

   ```
   nginx -t
   nginx -s reload      # or: systemctl reload nginx
   ```

What `ucn-gs.conf` does:
- `try_files $uri $uri/index.html =404`: a known route serves its own `index.html`; anything else is a 404.
- `error_page 404 <base>404.html`: unknown URLs get the app's 404 page with a 404 status.
- `Cache-Control: no-cache` on pages, so a new deploy shows at once. `<base>assets/` gets `public, max-age=31536000, immutable` (hashed names).
- Any URL ending in `.pdf` (any case) gets `pdf-headers.conf` and `no-cache`. These are the only responses a site page may frame.
- `deny all` for dotfiles and dot folders (`.htaccess`, `.git`, ...).
- `autoindex off`. Every location includes a headers file itself, because Nginx drops inherited `add_header` lines in any location that declares its own.

The Content-Security-Policy lives in one place, `config/csp.mjs`; the `<meta>` fallback in `index.html` and the generated header files both come from it. Do not hand-edit the generated files; change the source and rebuild.

### Notes for the server admin

- **A subpath base without a trailing slash.** If the base is `/gs/`, add this to the `server { }` block so `/gs` reaches the site:

  ```nginx
  location = /gs { return 301 /gs/; }
  ```

- **`.well-known/`.** The dotfile rule blocks `<base>.well-known/` (for example certificate validation). If it is needed, add this before the `include` line:

  ```nginx
  location ^~ /gs/.well-known/ { ... }
  ```

  Use the real base in the path (`/.well-known/` for a root deployment).
- **Server-level headers are dropped.** A header set with `add_header` at `server` level (HSTS, for example) does not reach responses from these locations, because each location has its own `add_header`. Put such a header in your own small include and add it to the locations that need it, or add a line to the generated header files after each build. See HTTPS and HSTS below.

## Post-deploy verification

Run these against the real host after every deploy. Replace `<host>` with the domain or IP and `<base>` with the site folder (`/` for a root deployment, `/gs/` for a subpath). Use `http://` until HTTPS exists.

1. Pages: the home page, a deep route and an unknown URL.

   ```
   curl -I https://<host><base>
   curl -I https://<host><base>about/
   curl -I https://<host><base>no-such-page
   ```

   The first two return 200, the third 404. All three must include `Content-Security-Policy` with `frame-ancestors 'none'`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `Cross-Origin-Opener-Policy`, plus `Cache-Control: no-cache`.

2. A hashed asset (any file name from `dist/assets/`):

   ```
   curl -I https://<host><base>assets/<file>
   ```

   It must return `Cache-Control: public, max-age=31536000, immutable` and the same five security headers.

3. A local PDF (any file under `dist/files/`):

   ```
   curl -I https://<host><base>files/<file>.pdf
   ```

   It must return 200, `Content-Type: application/pdf`, `Cache-Control: no-cache` and a Content-Security-Policy with `frame-ancestors 'self'`. Pages and assets must never show `'self'` there.

4. A dotfile and a missing PDF:

   ```
   curl -I https://<host><base>.htaccess
   curl -I https://<host><base>files/no-such-file.pdf
   ```

   The first is 403 or 404. The second is 404 with `frame-ancestors 'none'`.

5. If any header is missing, check that the include line is inside the `server { }` block, that all three `.conf` files are in the include folder, and that the paths in `ucn-gs.conf` match the server. Run `nginx -t`.

6. Open one inline PDF page in Chrome, Firefox and Safari on the real host. Inline PDF display has not been verified in any browser on the real host yet. A browser without a PDF viewer shows the Open / Download card.

CI runs the same checks against a real Nginx (job `nginx-smoke`, `scripts/nginx-smoke.sh`, a Docker `nginx:1.27-alpine`). It uses a preview build, so it does not replace the post-deploy checks.

## Client-review copy on cPanel

UCN reviews the site at https://ucn.edu.ph/mpa-aaccup/ before the Nginx server exists (user's request, 2026-11-24). That host is UCN's main WordPress site (Apache behind Cloudflare), and this copy is a **preview build**: pending pages and menu items show with "Pending: …" notes, so UCN can see what is still to come. This is an exception to spec D5 for the review copy only; the real production build still hides pending items. Do not use these steps for the real deployment.

### Build and zip (PowerShell, from the repo root)

1. Build the preview for the subfolder:

   ```powershell
   Set-Content .env.preview-content.local "VITE_BASE_PATH=/mpa-aaccup/" -Encoding ascii
   npm run build:preview
   Remove-Item .env.preview-content.local
   ```

2. Delete the files the preview build adds but the site does not use: `dist/dev-placeholders/` and `dist/files/dev-sample.pdf`. Only delete them while all three leader messages have photos (the placeholders are the fallback for a missing one).
3. `npm run check:dist` then reports exactly two errors, both expected for a preview build: `DEV-SAMPLE` in the content-status chunk and the dormant placeholder-photo code. Any other error is real.
4. Zip with `tar.exe`, naming the top-level entries so the paths have no `./` prefix. Windows PowerShell's `Compress-Archive` writes backslashes into the paths, which unpack as flat files on Linux.

   ```powershell
   tar.exe -a -c -f ucn-gs-mpa-aaccup-review.zip -C dist @(Get-ChildItem dist -Force | ForEach-Object Name)
   ```

### Upload

1. cPanel File Manager → `public_html/mpa-aaccup`. Turn on Settings → Show Hidden Files.
2. Delete everything in the folder **except `.htaccess`**.
3. Upload the zip, choose Extract and check that the target path ends in `/mpa-aaccup` (the first upload went into a new `ucn-gs-dist/` subfolder, so WordPress answered `/mpa-aaccup/` with its own 404). Delete the zip. `index.html` must sit directly in `mpa-aaccup`.

### The `.htaccess`

Kept on the server between uploads. If it is lost, or `config/csp.mjs` changes, recreate it in `public_html/mpa-aaccup` with the header values taken from `config/csp.mjs` (`CSP_HEADER`, `CSP_HEADER_PDF`, `SECURITY_HEADERS`):

```apache
Options -Indexes
# Every page is a folder with its own index.html. The server redirects /about/people to /about/people/
# and serves that index.html; the site accepts the trailing slash.
DirectoryIndex index.html

# Keep the main site's WordPress rewrite rules out of this folder, so unknown URLs get this site's 404 page.
<IfModule mod_rewrite.c>
  RewriteEngine On
</IfModule>

ErrorDocument 404 /mpa-aaccup/404.html

<IfModule mod_headers.c>
  # The main UCN site sends its own Content-Security-Policy, which would block the Google Drive, YouTube and
  # map frames. Remove it here so only this site's policy applies.
  Header unset Content-Security-Policy
  Header always unset Content-Security-Policy
  Header always set Content-Security-Policy "<CSP_HEADER>"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
  Header always set Cross-Origin-Opener-Policy "same-origin"

  # Local PDFs may be shown in the site's own frames
  <FilesMatch "\.(?i:pdf)$">
    Header always set Content-Security-Policy "<CSP_HEADER_PDF>"
  </FilesMatch>

  <FilesMatch "\.(html|pdf)$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
```

If the site shows a 500 error, delete the `Options -Indexes` line. Do not add `DirectorySlash Off` or a rewrite rule for the pages: the folder redirect is enough.

### Check after each upload

```powershell
curl.exe -s -I https://ucn.edu.ph/mpa-aaccup/
curl.exe -s -o NUL -w "%{http_code}" https://ucn.edu.ph/mpa-aaccup/no-such-page
```

The page must send exactly **one** `Content-Security-Policy` header, ours (with `frame-src` listing the Google hosts). If a second, shorter one appears, the server's policy is back and the Drive, YouTube and map frames are blocked. The unknown URL must return 404 with this site's 404 page, not WordPress's. The copy is public; cPanel's Directory Privacy can put a password on the folder.

## Documents and inline viewing

Local PDFs under `public/files/` display inline only when the content file sets `inline: true` (see `docs/content-guide.md`). Other local files open as an Open / Download card. A document that should display on the page without those rules can go on Google Drive (spec D3). Files under `dist/files/` must not be `.html`, `.svg`, `.xml` or `.js`: `check:dist` fails on them, because a same-origin frame must only ever hold a PDF.

## HTTPS and HSTS

`upgrade-insecure-requests` is part of the CSP header. Serve the site over HTTPS if the server can. Domain, base path and HTTPS are not decided yet.

Add HSTS **only after HTTPS is confirmed to work on the whole domain**, because browsers remember it. Once it does, add this to `security-headers.conf` and `pdf-headers.conf` after each build (the build overwrites both files, so keep it in a script or a second include that every location line pulls in):

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
```

It is deliberately not generated. Do not add `preload` unless UCN IT decides to submit the domain to the preload list.

## Deploy access, MFA and branch protection

- Restrict write access to the web folder and the Nginx include folder to the people who deploy. Use SSH keys or SFTP with unique accounts, not shared passwords.
- Turn on multi-factor authentication for the Git hosting account and the Google account that owns the Drive files, and for the server account if it supports it.
- Protect `main`: require a pull request, passing CI (`lint`, `typecheck`, `test`, `build`, `check:dist`, `audit`, `nginx-smoke`) and no force pushes.
- Deploy from a clean CI or local build of `main`, never from a working tree with uncommitted changes.

## Rollback

Dotfiles are not part of the site any more, so a plain copy is enough. Before each deploy, keep the previous build next to the live folder:

1. Copy the live docroot to `dist-previous/` (outside the web root, or in a path that is not served). Keep the previous `.conf` files too.
2. Copy the new `dist/` into the docroot and the new `dist-nginx/*.conf` into the include folder. Run `nginx -t`, then reload.
3. Copy the files from `dist-previous/assets/` into the new live `assets/` folder **without overwriting** existing files (for example `cp -n dist-previous/assets/* <live>/assets/`). Open tabs can then still load the old hashed chunks. On the next release, copy `dist/` fresh and do not copy these older files again, which removes them. Tabs that still request files that are gone show the "Something went wrong" page with a reload button.
4. If something is wrong, put `dist-previous/` and the previous `.conf` files back and reload Nginx.

Because assets have hashed names and HTML is `no-cache`, a swap takes effect immediately.

## Limits

A static frontend cannot prevent DDoS attacks or server-level defacement. Those depend on UCN's hosting: network protection, patching, account security and monitoring. This site reduces what an attacker can do through the page itself (strict CSP, restricted embeds, no HTML rendering, validated links), but it does not replace server hardening.

Add area and recommendation content files only when they are ready to publish, or leave the existing stubs pending. A pending file still gets an HTML copy in the build (HTTP 200 showing the in-app 404 page) and so reveals its slug in the URL space.

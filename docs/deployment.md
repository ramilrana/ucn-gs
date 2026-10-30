# Deployment

The site is a static build. `npm run build` writes everything to `dist/`; there is no server-side code.

## Build

```bash
npm ci
npm run build        # tsc -b, vite build, then scripts/write-route-pages.mjs
npm run check:dist   # fails if dist/ is not deployable
```

`write-route-pages.mjs` copies `dist/index.html` into one folder per route (for example `dist/about/people/index.html`) and to `dist/404.html`. It also writes `dist/.htaccess` and `dist/assets/.htaccess`. The server then answers every known URL with a real file, and unknown URLs with the app's 404 page and a 404 status.

`npm run build:preview` builds with sample and pending content visible (`.env.preview-content`). Use it to review pages. **Never deploy a preview build.**

## Building for a subpath

To serve the site from `https://example.edu.ph/gs/` instead of the domain root, create `.env.production.local` (it is git-ignored) containing:

```
VITE_BASE_PATH=/gs/
```

Then run `npm run build && npm run check:dist`. The base is applied to asset URLs, the per-route pages, `ErrorDocument 404` and the router. Upload the contents of `dist/` into the `gs/` folder on the server. `check:dist` reads the base from `dist/index.html` and confirms that every root-absolute URL carries it. Delete `.env.production.local` when you build for the root again.

## Apache

Requirements:
- `mod_headers` enabled.
- `AllowOverride` that permits `.htaccess` to set `Options`, `ErrorDocument` and `Header` (`AllowOverride Options FileInfo Indexes`, or `All`) for the site folder.

Upload the whole `dist/` folder **including the dotfiles** `dist/.htaccess` and `dist/assets/.htaccess`. Many FTP clients hide dotfiles by default; turn on "show hidden files".

What the generated `.htaccess` does:
- `Options -Indexes`: no directory listings.
- `DirectorySlash On`: `/accreditation-areas` redirects to `/accreditation-areas/`. The app handles the trailing slash.
- `ErrorDocument 404 <base>404.html`.
- Security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`) with `Header always set`.
- `Cache-Control: no-cache` for `*.html`, so a new deploy shows immediately.
- `assets/.htaccess`: `Cache-Control: public, max-age=31536000, immutable` for the hashed files.

The Content-Security-Policy lives in one place, `config/csp.mjs`. The `<meta>` fallback in `index.html` and the server header are both generated from it.

## Nginx

Equivalent server block (replace `/gs/` with `/` for a root deployment):

```nginx
location /gs/ {
    alias /var/www/gs/;
    try_files $uri $uri/index.html =404;
    error_page 404 /gs/404.html;

    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://i.ytimg.com; frame-src https://drive.google.com https://docs.google.com https://www.youtube-nocookie.com https://www.google.com; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
}

location /gs/assets/ {
    alias /var/www/gs/assets/;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    # Repeat the five security headers from the block above here (see the note below).
}
```

HTML files should be revalidated on every visit: add `add_header Cache-Control "no-cache" always;` to the `/gs/` location, which the `/gs/assets/` location overrides for hashed files.

Nginx drops inherited `add_header` lines in any location that declares its own, so repeat the security headers wherever you add `Cache-Control`. Keep the CSP string identical to `config/csp.mjs` (`CSP_HEADER`).

## HTTPS and HSTS

`upgrade-insecure-requests` is part of the CSP header. Serve the site over HTTPS. Add HSTS **only after HTTPS is confirmed to work on the whole domain**, because browsers remember it:

```
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains"
```

It is deliberately not in the generated `.htaccess`. Do not add `preload` unless UCN IT decides to submit the domain to the preload list.

## Deploy access, MFA and branch protection

- Restrict write access to the web folder (SFTP or hosting account) to the people who deploy. Use SSH keys or SFTP with unique accounts, not shared passwords.
- Turn on multi-factor authentication for the hosting account, the Git hosting account and the Google account that owns the Drive files.
- Protect `main`: require a pull request, passing CI (`lint`, `typecheck`, `test`, `build`, `check:dist`, `audit`) and no force pushes.
- Deploy from a clean CI or local build of `main`, never from a working tree with uncommitted changes.

## Rollback

Before each deploy, keep the previous build next to the live folder:

1. Rename or copy the live folder to `dist-previous/` (outside the web root, or in a path that is not served).
2. Upload the new `dist/`, including dotfiles.
3. If something is wrong, swap `dist-previous/` back into place.

Keep one previous version at least. Because assets have hashed names and HTML is `no-cache`, a swap takes effect immediately.

When you upload a new release, leave the previous release's `assets/` files in place for one more release (delete them on the release after that). Tabs that are already open still load old page chunks by their old hashed names; if those files are gone, the visitor sees the "Something went wrong" page with a reload button instead.

## Limits

A static frontend cannot prevent DDoS attacks or server-level defacement. Those depend on UCN's hosting: network protection, patching, account security and monitoring. This site reduces what an attacker can do through the page itself (strict CSP, restricted embeds, no HTML rendering, validated links), but it does not replace server hardening.

Add area and recommendation content files only when they are ready to publish. A pending file still gets an HTML copy in the build (HTTP 200 showing the in-app 404 page) and so reveals its slug in the URL space.

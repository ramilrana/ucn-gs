#!/usr/bin/env bash
# Real-server test of the generated Nginx config: starts nginx in Docker on the built dist/ and dist-nginx/,
# then checks status codes and headers with curl. Exits non-zero on the first failure.
#
# Build first with the paths Nginx will see inside the container:
#   UCN_DOCROOT=/usr/share/nginx/html/ UCN_NGINX_INCLUDE_DIR=/etc/nginx/ucn-gs/ npm run build:preview
# (build:preview, not build, because the sample PDF only exists in the preview build).
# Run: bash scripts/nginx-smoke.sh   (npm run smoke:nginx)
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
IMAGE="${NGINX_IMAGE:-nginx:1.27-alpine}"
PORT="${SMOKE_PORT:-8080}"
NAME="ucn-gs-smoke-$$"
export MSYS_NO_PATHCONV=1 # Git Bash on Windows must not rewrite the container paths below

[ -f dist/index.html ] || { echo "FAIL: dist/index.html not found; build first" >&2; exit 1; }
[ -f dist-nginx/ucn-gs.conf ] || { echo "FAIL: dist-nginx/ucn-gs.conf not found; build first" >&2; exit 1; }

# Base path, read from the first module script ("/gs/assets/index-x.js" gives "/gs/", "/assets/..." gives "/").
BASE="$(sed -n 's|.*<script[^>]*type="module"[^>]*src="\([^"]*\)/assets/[^"]*".*|\1|p' dist/index.html | head -1)/"
case "$BASE" in
  /*/) ;;
  *) echo "FAIL: cannot read the base path from dist/index.html (got '$BASE')" >&2; exit 1 ;;
esac

# Expected headers come from config/csp.mjs, the same source the build uses.
EXPECTED_CSP="$(node -e "import('./config/csp.mjs').then((m) => console.log(m.CSP_HEADER))")"
EXPECTED_CSP_PDF="$(node -e "import('./config/csp.mjs').then((m) => console.log(m.CSP_HEADER_PDF))")"

JS_FILE="$(cd dist/assets && find . -maxdepth 1 -name '*.js' | head -1 | sed 's|^\./||')"
PDF_FILE="$(cd dist/assets && find . -maxdepth 1 -iname 'sample*.pdf' | head -1 | sed 's|^\./||')"
[ -n "$JS_FILE" ] || { echo "FAIL: no .js file in dist/assets" >&2; exit 1; }
[ -n "$PDF_FILE" ] || { echo "FAIL: no sample*.pdf in dist/assets; build with npm run build:preview" >&2; exit 1; }

WORK="$(mktemp -d)"
cleanup() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

# Minimal wrapper: the generated file holds location blocks only, so it goes inside a server block.
cat > "$WORK/default.conf" <<'CONF'
server {
    listen 8080;
    server_name _;
    include /etc/nginx/ucn-gs/ucn-gs.conf;
}
CONF

docker run -d --name "$NAME" -p "127.0.0.1:${PORT}:8080" \
  -v "$PWD/dist:/usr/share/nginx/html:ro" \
  -v "$PWD/dist-nginx:/etc/nginx/ucn-gs:ro" \
  -v "$WORK/default.conf:/etc/nginx/conf.d/default.conf:ro" \
  "$IMAGE" >/dev/null

HEADERS=""
STATUS=""
URL=""

fail() {
  echo "FAIL: $*" >&2
  echo "--- response headers ---" >&2
  printf '%s\n' "$HEADERS" >&2
  echo "--- nginx log ---" >&2
  docker logs "$NAME" >&2 || true
  exit 1
}

echo "check: nginx -t"
docker exec "$NAME" nginx -t 2>"$WORK/nginx-t.txt" || { cat "$WORK/nginx-t.txt" >&2; fail "nginx -t"; }
cat "$WORK/nginx-t.txt"

# Wait for the server to answer.
for _ in $(seq 1 50); do
  curl -s -o /dev/null "http://127.0.0.1:${PORT}/" && break
  sleep 0.2
done

# get PATH: GET without following redirects; keeps the status code and the header block.
get() {
  URL="$1"
  HEADERS="$(curl -s -D - -o /dev/null "http://127.0.0.1:${PORT}$1" | tr -d '\r')"
  STATUS="$(printf '%s\n' "$HEADERS" | head -1 | awk '{print $2}')"
}
status_is() { [ "$STATUS" = "$1" ] || fail "$URL: expected status $1, got $STATUS"; }
status_in() {
  for s in "$@"; do
    [ "$STATUS" = "$s" ] && return 0
  done
  fail "$URL: expected status $*, got $STATUS"
}
# header_value NAME: value of the first header with that name (case-insensitive).
header_value() {
  printf '%s\n' "$HEADERS" | awk -v n="$(printf '%s' "$1" | tr 'A-Z' 'a-z')" 'index($0, ":") > 0 { name = tolower(substr($0, 1, index($0, ":") - 1)); if (name == n) { v = substr($0, index($0, ":") + 1); sub(/^ +/, "", v); print v; exit } }'
}
header_equals() { [ "$(header_value "$1")" = "$2" ] || fail "$URL: header $1 expected '$2', got '$(header_value "$1")'"; }
header_contains() {
  case "$(header_value "$1")" in
    *"$2"*) ;;
    *) fail "$URL: header $1 expected to contain '$2', got '$(header_value "$1")'" ;;
  esac
}
header_lacks() {
  case "$(header_value "$1")" in
    *"$2"*) fail "$URL: header $1 must not contain '$2', got '$(header_value "$1")'" ;;
  esac
}
all_security_headers() {
  header_equals Content-Security-Policy "$1"
  header_equals X-Content-Type-Options nosniff
  header_equals Referrer-Policy strict-origin-when-cross-origin
  header_equals Permissions-Policy 'camera=(), microphone=(), geolocation=(), payment=()'
  header_equals Cross-Origin-Opener-Policy same-origin
}

echo "check: ${BASE} -> 200, all security headers, frame-ancestors 'none', no-cache"
get "${BASE}"; status_is 200
all_security_headers "$EXPECTED_CSP"
header_contains Content-Security-Policy "frame-ancestors 'none'"
header_equals Cache-Control no-cache
header_contains Content-Type text/html

echo "check: ${BASE}about/ -> 200 with the headers (deep route)"
get "${BASE}about/"; status_is 200
all_security_headers "$EXPECTED_CSP"
header_equals Cache-Control no-cache

echo "check: ${BASE}about (no trailing slash) -> 200, or 301 then 200"
get "${BASE}about"; status_in 200 301
all_security_headers "$EXPECTED_CSP"
if [ "$STATUS" = 301 ]; then
  LOCATION="$(header_value Location)"
  get "${LOCATION#http://127.0.0.1:${PORT}}"; status_is 200
fi

echo "check: ${BASE}no-such-page -> 404 page with the headers"
get "${BASE}no-such-page"; status_is 404
all_security_headers "$EXPECTED_CSP"
header_contains Content-Type text/html

echo "check: ${BASE}assets/${JS_FILE} -> 200, immutable cache, headers"
get "${BASE}assets/${JS_FILE}"; status_is 200
all_security_headers "$EXPECTED_CSP"
header_equals Cache-Control "public, max-age=31536000, immutable"
header_contains Content-Type javascript

echo "check: ${BASE}assets/${PDF_FILE} -> 200 application/pdf, PDF CSP with frame-ancestors 'self'"
get "${BASE}assets/${PDF_FILE}"; status_is 200
header_contains Content-Type application/pdf
all_security_headers "$EXPECTED_CSP_PDF"
header_contains Content-Security-Policy "frame-ancestors 'self'"
header_equals Cache-Control no-cache

echo "check: ${BASE}404.html?x=.pdf -> a query string ending in .pdf must NOT get frame-ancestors 'self'"
get "${BASE}404.html?x=.pdf"; status_is 200
header_contains Content-Security-Policy "frame-ancestors 'none'"
header_lacks Content-Security-Policy "frame-ancestors 'self'"

echo "check: ${BASE}about/?x=.pdf -> the page keeps frame-ancestors 'none'"
get "${BASE}about/?x=.pdf"; status_is 200
header_contains Content-Security-Policy "frame-ancestors 'none'"

echo "check: ${BASE}no-such-file.pdf -> 404"
get "${BASE}no-such-file.pdf"; status_is 404

for dot in ".htaccess" "assets/.htaccess" ".git/config" "about/.hidden.pdf"; do
  echo "check: ${BASE}${dot} -> 403 or 404"
  get "${BASE}${dot}"; status_in 403 404
done

echo "check: ${BASE}assets/ -> no directory listing"
get "${BASE}assets/"; status_in 403 404

echo "PASS: all nginx smoke checks passed (base ${BASE})"

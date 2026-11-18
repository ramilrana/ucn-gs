// Renders the Nginx files from deploy/nginx.conf.template and config/csp.mjs. Used by write-route-pages.mjs.
import { CSP_HEADER_PDF, SECURITY_HEADERS } from '../config/csp.mjs';

export const DEFAULT_DOCROOT = '/var/www/ucn-gs/';
export const DEFAULT_INCLUDE_DIR = '/etc/nginx/ucn-gs/';

/**
 * A directory option goes straight into the config, so it must be an absolute path ending in "/" with
 * nothing Nginx would treat as syntax.
 *
 * @param {string} name option name for the error message, for example UCN_DOCROOT
 * @param {string} value
 * @returns {string} value
 */
export function validateDirOption(name, value) {
  if (!value.startsWith('/') || !value.endsWith('/') || /[\s"'`;{}$\\]/.test(value)) {
    throw new Error(`${name} must be an absolute path ending in "/" with no whitespace, quotes, ";", "{", "}", "$" or backslash (got "${value}").`);
  }
  return value;
}

/** @param {string} text */
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @param {Record<string, string>} headers
 * @returns {string} one `add_header` line per header
 */
function headerLines(headers) {
  let out = '';
  for (const [name, value] of Object.entries(headers)) {
    if (/["\\$\r\n]/.test(value)) {
      throw new Error(`Header ${name} has a value with a quote, backslash, "$" or newline, which cannot go in an Nginx string.`);
    }
    out += `add_header ${name} "${value}" always;\n`;
  }
  return out;
}

/**
 * @param {{ template: string, base: string, docroot?: string, includeDir?: string, headers?: Record<string, string> }} options
 *   template is LF text; base is a normalized base path ("/" or "/gs/"); headers defaults to SECURITY_HEADERS
 * @returns {{ 'ucn-gs.conf': string, 'security-headers.conf': string, 'pdf-headers.conf': string }}
 */
export function renderNginxFiles({ template, base, docroot = DEFAULT_DOCROOT, includeDir = DEFAULT_INCLUDE_DIR, headers = SECURITY_HEADERS }) {
  const values = {
    __BASE__: base,
    __BASE_RE__: escapeRegex(base),
    __DOCROOT__: validateDirOption('UCN_DOCROOT', docroot),
    __INCLUDE_DIR__: validateDirOption('UCN_NGINX_INCLUDE_DIR', includeDir),
  };
  const conf = template.replace(/__[A-Z][A-Z0-9_]*__/g, (placeholder) => values[/** @type {keyof typeof values} */ (placeholder)] ?? placeholder);
  const leftover = conf.match(/__[A-Z][A-Z0-9_]*__/);
  if (leftover) {
    throw new Error(`Unreplaced placeholder ${leftover[0]} in deploy/nginx.conf.template.`);
  }
  const pdfHeaders = { ...headers, 'Content-Security-Policy': CSP_HEADER_PDF };
  return {
    'ucn-gs.conf': conf,
    'security-headers.conf': headerLines(headers),
    'pdf-headers.conf': headerLines(pdfHeaders),
  };
}

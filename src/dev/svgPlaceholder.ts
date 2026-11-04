/**
 * A labelled grey placeholder image as an SVG data URI (the CSP img-src allows `data:`).
 * The hex values below are neutral greys inside generated image data, not component colors,
 * so the "no hex in components" rule does not apply to them.
 */
export function svgPlaceholder(label: string, width: number, height: number): string {
  const escaped = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="#d4d4d4"/>` +
    `<path d="M0 0L${width} ${height}M${width} 0L0 ${height}" stroke="#a3a3a3" stroke-width="4"/>` +
    `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${Math.round(height / 10)}" fill="#262626">${escaped}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

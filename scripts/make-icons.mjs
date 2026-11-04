// Generates the favicon and Apple touch icon from the UCN logo.
// Run: node scripts/make-icons.mjs
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const source = fileURLToPath(new URL('src/assets/brand/ucn-logo.png', root));
const targets = [
  { file: 'public/favicon-32.png', size: 32 },
  { file: 'public/apple-touch-icon.png', size: 180 },
];

for (const { file, size } of targets) {
  await sharp(source)
    .resize(size, size, { fit: 'contain', background: '#ffffff' })
    .flatten({ background: '#ffffff' })
    .png({ compressionLevel: 9 })
    .toFile(fileURLToPath(new URL(file, root)));
  console.log(`wrote ${file} (${size}x${size})`);
}

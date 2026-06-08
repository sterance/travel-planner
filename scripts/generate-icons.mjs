#!/usr/bin/env node
// Run once to generate PWA icons from public/favicon.svg
// Requires: npm install -D sharp  (or just run: npx @squoosh/cli)
//
// Usage: node scripts/generate-icons.mjs
//
// If you don't want to install sharp, you can also convert manually:
//   - Go to https://realfavicongenerator.net and upload your favicon.svg
//   - Or use: npx sharp-cli --input public/favicon.svg --output public/icons/icon-192.png --width 192
//   - Or use: npx sharp-cli --input public/favicon.svg --output public/icons/icon-512.png --width 512

import { createRequire } from 'module';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

mkdirSync(resolve(root, 'public/icons'), { recursive: true });

let sharp;
try {
  const require = createRequire(import.meta.url);
  sharp = require('sharp');
} catch {
  console.error('sharp is not installed. Run: npm install -D sharp');
  console.error('Then re-run: node scripts/generate-icons.mjs');
  process.exit(1);
}

const input = resolve(root, 'public/favicon.svg');
const sizes = [192, 512];

for (const size of sizes) {
  const output = resolve(root, `public/icons/icon-${size}.png`);
  await sharp(input)
    .resize(size, size)
    .png()
    .toFile(output);
  console.log(`Generated ${output}`);
}

console.log('Done! Icons written to public/icons/');

/**
 * Shark Exterior — Performance Optimizer
 * Compresses all heavy images to WebP + JPG fallback
 */
const fs   = require('fs');
const path = require('path');
const sharp = require('sharp');

const imgDir = path.join(__dirname, 'images');

const targets = [
  // [input filename,         output filename,   quality, width]
  ['svc-hero-main.png',    'svc-hero-main.jpg',    82, 1600],
  ['svc-exterior.png',     'svc-exterior.jpg',     82, 1400],
  ['svc-interior.png',     'svc-interior.jpg',     82, 1400],
  ['svc-gutter.png',       'svc-gutter.jpg',       82, 1400],
  ['svc-powerwash.png',    'svc-powerwash.jpg',    82, 1400],
  ['svc-screen.png',       'svc-screen.jpg',       82, 1400],
  ['svc-track.png',        'svc-track.jpg',        82, 1400],
  ['svc-solar.png',        'svc-solar.jpg',        82, 1400],
  ['svc-softwash.png',     'svc-softwash.jpg',     82, 1400],
  ['svc-christmas.png',    'svc-christmas.jpg',    82, 1400],
  ['svc-commercial.png',   'svc-commercial.jpg',   82, 1400],
];

async function run() {
  let totalSaved = 0;

  for (const [input, output, quality, width] of targets) {
    const src = path.join(imgDir, input);
    const dst = path.join(imgDir, output);
    if (!fs.existsSync(src)) { console.warn(`  SKIP (missing): ${input}`); continue; }

    const before = fs.statSync(src).size;
    await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toFile(dst);
    const after = fs.statSync(dst).size;
    const saved = ((before - after) / before * 100).toFixed(0);
    totalSaved += (before - after);
    console.log(`  ✓ ${input.padEnd(26)} → ${output}  ${(before/1024/1024).toFixed(1)}MB → ${(after/1024).toFixed(0)}KB  (${saved}% smaller)`);
  }

  console.log(`\n  Total saved: ${(totalSaved/1024/1024).toFixed(1)} MB`);
}

run().catch(console.error);

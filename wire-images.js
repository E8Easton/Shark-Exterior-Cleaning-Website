const fs = require('fs');
const path = require('path');

const dir = __dirname;
const imgDir = path.join(dir, 'images');

// ── 1. Rename uploaded files to clean names ───────────────
const renames = [
  ['christmas_light_installation (1).png', 'svc-christmas.png'],
  ['commercial_cleaning (1).png',          'svc-commercial.png'],
  ['exterior_window_cleaning (2).png',     'svc-exterior.png'],
  ['gutter_cleaning (1).png',              'svc-gutter.png'],
  ['interior_window_cleaning (3).png',     'svc-interior.png'],
  ['main_hero (1).png',                    'svc-hero-main.png'],
  ['power_washing (2).png',               'svc-powerwash.png'],
  ['screen_cleaning (1).png',             'svc-screen.png'],
  ['soft_wash (1).png',                   'svc-softwash.png'],
  ['solar_panel_cleaning (1).png',        'svc-solar.png'],
  ['track_detailing (1).png',             'svc-track.png'],
];

for (const [from, to] of renames) {
  const src = path.join(imgDir, from);
  const dst = path.join(imgDir, to);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dst);
    console.log(`  renamed: ${from}  →  ${to}`);
  } else {
    console.warn(`  MISSING: ${from}`);
  }
}

// ── 2. Helper ─────────────────────────────────────────────
function patch(file, replacements) {
  const fp = path.join(dir, file);
  let html = fs.readFileSync(fp, 'utf8');
  for (const [from, to] of replacements) {
    html = html.replaceAll(from, to);
  }
  fs.writeFileSync(fp, html, 'utf8');
  console.log(`✓ ${file}`);
}

// ── 3. Update all HTML files ──────────────────────────────

// index.html — hero background + about section
patch('index.html', [
  // Main hero
  ['src="images/new-service-2.jpg" alt="Professional window cleaning service"',
   'src="images/svc-hero-main.png" alt="Professional window cleaning service"'],
  // About / Why Us image — use exterior shot as the team-in-action image
  ['src="images/new-service-4.jpg" alt="Professional window cleaning team"',
   'src="images/svc-exterior.png" alt="Shark Exterior team in action"'],
  // Also swap the hero-bg.png fallback used in the christmas light card on homepage
  ['src="images/hero-bg.png" alt="Christmas Light Installation"',
   'src="images/svc-christmas.png" alt="Christmas Light Installation"'],
]);

// service-exterior.html
patch('service-exterior.html', [
  ['src="images/svc-exterior.jpg"', 'src="images/svc-exterior.png"'],
  ['src="images/new-service-2.jpg" alt="Exterior window cleaning"',
   'src="images/svc-exterior.png" alt="Exterior window cleaning"'],
]);

// service-interior.html
patch('service-interior.html', [
  ['src="images/svc-interior.jpg"', 'src="images/svc-interior.png"'],
  ['src="images/new-service-4.jpg" alt="Interior window cleaning"',
   'src="images/svc-interior.png" alt="Interior window cleaning"'],
]);

// service-gutter.html
patch('service-gutter.html', [
  ['src="images/svc-gutter.jpg"', 'src="images/svc-gutter.png"'],
  ['src="images/service-gutter.jpg"', 'src="images/svc-gutter.png"'],
]);

// service-powerwash.html
patch('service-powerwash.html', [
  ['src="images/svc-powerwash.jpg"', 'src="images/svc-powerwash.png"'],
  ['src="images/service-powerwash.jpg"', 'src="images/svc-powerwash.png"'],
]);

// service-screen.html
patch('service-screen.html', [
  ['src="images/svc-screen.jpg"', 'src="images/svc-screen.png"'],
  ['src="images/new-service-4.jpg" alt="Screen cleaning services"',
   'src="images/svc-screen.png" alt="Screen cleaning services"'],
]);

// service-track.html
patch('service-track.html', [
  ['src="images/svc-track.jpg"', 'src="images/svc-track.png"'],
  ['src="images/new-service-2.jpg" alt="Window track detailing"',
   'src="images/svc-track.png" alt="Window track detailing"'],
]);

// service-solar.html
patch('service-solar.html', [
  ['src="images/svc-solar.jpg"', 'src="images/svc-solar.png"'],
  ['src="images/new-service-1.jpg" alt="Solar panel cleaning"',
   'src="images/svc-solar.png" alt="Solar panel cleaning"'],
]);

// service-softwash.html
patch('service-softwash.html', [
  ['src="images/svc-softwash.jpg"', 'src="images/svc-softwash.png"'],
  ['src="images/new-service-1.jpg" alt="Soft washing services"',
   'src="images/svc-softwash.png" alt="Soft washing services"'],
]);

// service-christmas.html
patch('service-christmas.html', [
  ['src="images/svc-christmas.jpg"', 'src="images/svc-christmas.png"'],
  ['src="images/hero-bg.png" alt="Christmas light installation"',
   'src="images/svc-christmas.png" alt="Christmas light installation"'],
  ['src="images/hero-bg.png" alt="Step 1 — Design Consultation"',
   'src="images/svc-christmas.png" alt="Step 1 — Design Consultation"'],
]);

// service-commercial.html
patch('service-commercial.html', [
  ['src="images/svc-commercial.jpg"', 'src="images/svc-commercial.png"'],
  ['src="images/new-service-2.jpg" alt="Commercial window cleaning"',
   'src="images/svc-commercial.png" alt="Commercial window cleaning"'],
  ['src="images/new-service-2.jpg" alt="Step 1 — Property Walkthrough"',
   'src="images/svc-commercial.png" alt="Step 1 — Property Walkthrough"'],
]);

console.log('\nDone — all images renamed and wired up.');

const fs = require('fs');
const path = require('path');

const dir = __dirname;

// ── Helper ────────────────────────────────────────────────
function patch(file, replacements) {
  const fp = path.join(dir, file);
  let html = fs.readFileSync(fp, 'utf8');
  for (const [from, to] of replacements) {
    html = html.replaceAll(from, to);
  }
  fs.writeFileSync(fp, html, 'utf8');
  console.log(`✓ ${file}`);
}

// ── index.html ────────────────────────────────────────────
// Hero background → two Shark Exterior techs on modern home at sunset
// Why-us image   → water-fed pole on modern home (daytime)
patch('index.html', [
  ['src="images/new-service-2.jpg" alt="Professional window cleaning service"',
   'src="images/svc-hero-main.jpg" alt="Professional window cleaning service"'],
  ['src="images/new-service-4.jpg" alt="Professional window cleaning team"',
   'src="images/about-team.jpg" alt="Shark Exterior team in action"'],
]);

// ── service-exterior.html ─────────────────────────────────
// Hero: water-fed pole, water pouring down exterior
patch('service-exterior.html', [
  ['src="images/new-service-2.jpg" alt="Exterior window cleaning"',
   'src="images/svc-exterior.jpg" alt="Exterior window cleaning"'],
]);

// ── service-interior.html ─────────────────────────────────
// Hero: man cleaning interior windows on small ladder in living room
patch('service-interior.html', [
  ['src="images/new-service-4.jpg" alt="Interior window cleaning"',
   'src="images/svc-interior.jpg" alt="Interior window cleaning"'],
]);

// ── service-gutter.html ───────────────────────────────────
// Hero: young man cleaning gutters from a ladder
patch('service-gutter.html', [
  ['src="images/service-gutter.jpg" alt="Gutter cleaning service"',
   'src="images/svc-gutter.jpg" alt="Gutter cleaning service"'],
  // also update the step image that used the old gutter photo
  ['src="images/service-gutter.jpg" alt="Step 1 — Clear Debris"',
   'src="images/svc-gutter.jpg" alt="Step 1 — Clear Debris"'],
]);

// ── service-powerwash.html ────────────────────────────────
// Hero: man pressure washing concrete patio
patch('service-powerwash.html', [
  ['src="images/service-powerwash.jpg" alt="Powerwashing service"',
   'src="images/svc-powerwash.jpg" alt="Pressure washing service"'],
  ['src="images/service-powerwash.jpg" alt="Step 1 — Pre-Treat"',
   'src="images/svc-powerwash.jpg" alt="Step 1 — Pre-Treat"'],
]);

// ── service-screen.html ───────────────────────────────────
// Hero: man with squeegee + spray bottle on large modern glass panels
patch('service-screen.html', [
  ['src="images/new-service-4.jpg" alt="Screen cleaning services"',
   'src="images/svc-screen.jpg" alt="Screen cleaning services"'],
]);

// ── service-track.html ────────────────────────────────────
// Hero: person cleaning window track / frame with brush and cloth
patch('service-track.html', [
  ['src="images/new-service-2.jpg" alt="Window track detailing"',
   'src="images/svc-track.jpg" alt="Window track detailing"'],
  ['src="images/new-service-2.jpg" alt="Step 1 — Loosen &amp; Vacuum"',
   'src="images/svc-track.jpg" alt="Step 1 — Loosen & Vacuum"'],
]);

// ── service-solar.html ────────────────────────────────────
// Hero: man cleaning solar panels on roof with water-fed pole
patch('service-solar.html', [
  ['src="images/new-service-1.jpg" alt="Solar panel cleaning"',
   'src="images/svc-solar.jpg" alt="Solar panel cleaning"'],
]);

// ── service-softwash.html ─────────────────────────────────
// Hero: man with backpack chemical sprayer washing house siding
patch('service-softwash.html', [
  ['src="images/new-service-1.jpg" alt="Soft washing services"',
   'src="images/svc-softwash.jpg" alt="Soft washing services"'],
]);

// ── service-christmas.html ────────────────────────────────
// Hero: man installing Christmas lights on home in winter snow
patch('service-christmas.html', [
  ['src="images/hero-bg.png" alt="Christmas light installation"',
   'src="images/svc-christmas.jpg" alt="Christmas light installation"'],
  // step image that also used hero-bg
  ['src="images/hero-bg.png" alt="Step 1 — Design Consultation"',
   'src="images/svc-christmas.jpg" alt="Step 1 — Design Consultation"'],
]);

// ── service-commercial.html ───────────────────────────────
// Hero: commercial window cleaner rappelling skyscraper
patch('service-commercial.html', [
  ['src="images/new-service-2.jpg" alt="Commercial window cleaning"',
   'src="images/svc-commercial.jpg" alt="Commercial window cleaning"'],
  ['src="images/new-service-2.jpg" alt="Step 1 — Property Walkthrough"',
   'src="images/svc-commercial.jpg" alt="Step 1 — Property Walkthrough"'],
]);

console.log('\nAll image references updated.');
console.log('\nSave your images into the /images folder with these exact filenames:');
console.log('  svc-hero-main.jpg  → Two Shark Exterior techs on modern glass home at sunset (MAIN HERO)');
console.log('  about-team.jpg     → Man with water-fed pole, modern home daytime (ABOUT section)');
console.log('  svc-exterior.jpg   → Water-fed pole, water pouring down exterior');
console.log('  svc-interior.jpg   → Man cleaning interior windows on small ladder in living room');
console.log('  svc-gutter.jpg     → Young man cleaning gutters from a ladder');
console.log('  svc-powerwash.jpg  → Man pressure washing concrete patio');
console.log('  svc-screen.jpg     → Man with squeegee + spray bottle on large glass panels');
console.log('  svc-track.jpg      → Person cleaning window track / frame with brush');
console.log('  svc-solar.jpg      → Man cleaning solar panels on roof');
console.log('  svc-softwash.jpg   → Man with backpack sprayer washing house siding');
console.log('  svc-christmas.jpg  → Man installing Christmas lights in winter snow');
console.log('  svc-commercial.jpg → Commercial window cleaner rappelling skyscraper');

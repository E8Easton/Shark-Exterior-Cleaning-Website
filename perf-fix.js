/**
 * Shark Exterior — Performance Fix Script
 * Applies all HTML + CSS performance improvements
 */
const fs   = require('fs');
const path = require('path');

const dir = __dirname;

// ── helpers ───────────────────────────────────────────────
function patch(file, fn) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  content = fn(content);
  fs.writeFileSync(fp, content, 'utf8');
  console.log(`✓ ${file}`);
}

function patchAll(files, fn) {
  for (const f of files) patch(f, fn);
}

// ── file lists ────────────────────────────────────────────
const allHtml = [
  'index.html',
  'service-exterior.html', 'service-interior.html',
  'service-gutter.html',   'service-powerwash.html',
  'service-screen.html',   'service-track.html',
  'service-solar.html',    'service-softwash.html',
  'service-christmas.html','service-commercial.html',
  'quote.html',
];
const serviceHtml = allHtml.filter(f => f.startsWith('service-'));

// ── 1. PNG → JPG references (svc-* images) ───────────────
console.log('\n── 1. PNG → JPG image references');
patchAll(allHtml, html =>
  html.replace(/images\/(svc-[\w-]+)\.png/g, 'images/$1.jpg')
);

// ── 2. Add defer to script.js ─────────────────────────────
console.log('\n── 2. Defer script.js');
patchAll(allHtml, html =>
  html.replace(/<script src="script\.js"><\/script>/g,
               '<script src="script.js" defer></script>')
);

// ── 3. Optimize Google Fonts — add display=swap ───────────
console.log('\n── 3. Google Fonts display=swap');
patchAll(allHtml, html =>
  html.replace(
    /https:\/\/fonts\.googleapis\.com\/css2\?([^"]+)(?<!&display=swap)"/g,
    'https://fonts.googleapis.com/css2?$1&display=swap"'
  )
);

// ── 4. Preload hero image on index.html ───────────────────
console.log('\n── 4. Preload hero image (index.html)');
patch('index.html', html =>
  html.replace(
    '<link rel="stylesheet" href="styles.css">',
    '<link rel="preload" href="images/new-service-2.jpg" as="image">\n  <link rel="stylesheet" href="styles.css">'
  )
);

// ── 5. Preload hero on each service page ──────────────────
console.log('\n── 5. Preload hero images (service pages)');
const heroMap = {
  'service-exterior.html':  'svc-exterior.jpg',
  'service-interior.html':  'svc-interior.jpg',
  'service-gutter.html':    'svc-gutter.jpg',
  'service-powerwash.html': 'svc-powerwash.jpg',
  'service-screen.html':    'svc-screen.jpg',
  'service-track.html':     'svc-track.jpg',
  'service-solar.html':     'svc-solar.jpg',
  'service-softwash.html':  'svc-softwash.jpg',
  'service-christmas.html': 'svc-christmas.jpg',
  'service-commercial.html':'svc-commercial.jpg',
};
for (const [file, img] of Object.entries(heroMap)) {
  patch(file, html =>
    html.replace(
      '<link rel="stylesheet" href="styles.css">',
      `<link rel="preload" href="images/${img}" as="image">\n  <link rel="stylesheet" href="styles.css">`
    )
  );
}

// ── 6. Add loading="lazy" to all non-hero images ──────────
console.log('\n── 6. Lazy loading on below-fold images');
patchAll(allHtml, html => {
  // Already has loading= attribute — skip those
  // Add lazy to every <img> that doesn't have loading= yet
  return html.replace(/<img(?![^>]*loading=)([^>]*?)>/g, '<img$1 loading="lazy">');
});

// ── 7. Add fetchpriority=high to hero images ─────────────
console.log('\n── 7. fetchpriority=high on hero images');
// index hero
patch('index.html', html =>
  html.replace(
    'src="images/new-service-2.jpg" alt="Professional window cleaning service" loading="eager"',
    'src="images/new-service-2.jpg" alt="Professional window cleaning service" loading="eager" fetchpriority="high"'
  )
);
// service page heroes
for (const [file, img] of Object.entries(heroMap)) {
  patch(file, html =>
    html.replace(
      new RegExp(`src="images/${img}" alt="([^"]*)" loading="lazy"`),
      `src="images/${img}" alt="$1" loading="eager" fetchpriority="high"`
    )
  );
}

console.log('\n── All HTML fixes applied.\n');

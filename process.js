/* ==========================================================
   SHARK EXTERIOR — Service page process sections
   Scroll-linked scenes for the power washing driveway, the
   gutter run, the solar panel and the holiday light string.
   ========================================================== */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v) => Math.min(1, Math.max(0, v));

  // Calls fn(progress) on scroll/resize, throttled to one run per frame
  function onScrollFrame(fn) {
    let ticking = false;
    const run = () => { ticking = false; fn(); };
    const kick = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    run();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSlab();
    initGutter();
    initSolar();
    initLights();
  });

  /* ---------- Power washing: the surface cleaner crosses the driveway ---------- */
  function initSlab() {
    document.querySelectorAll('[data-slab]').forEach((root) => {
      const slab = root.querySelector('.sx-slab');
      const steps = [...root.querySelectorAll('.sx-slab-step')];
      onScrollFrame(() => {
        const r = slab.getBoundingClientRect();
        const vh = window.innerHeight;
        // Starts as the driveway comes up the screen, finishes as it passes 25% from the top
        const p = reduceMotion ? 1 : clamp((vh * 0.8 - r.top) / (vh * 0.55));
        root.style.setProperty('--p', p.toFixed(4));
        root.classList.toggle('is-done', p >= 0.99);
        steps.forEach((st, i) => st.classList.toggle('is-lit', p > 0 && p >= i / steps.length));
      });
    });
  }

  /* ---------- Gutters: water runs along the gutter and washes the leaves out ---------- */
  function initGutter() {
    document.querySelectorAll('[data-gut]').forEach((root) => {
      const run = root.querySelector('.sx-gut-run');
      const list = root.querySelector('.sx-trough-list');
      const steps = [...root.querySelectorAll('.sx-trough-step')];
      const leaves = [...root.querySelectorAll('.sx-gut-leaf')].map((el) => [el, parseFloat(el.style.getPropertyValue('--x')) / 100]);
      const pinned = () => window.matchMedia('(max-width: 900px)').matches;
      onScrollFrame(() => {
        const vh = window.innerHeight;
        let p;
        if (reduceMotion) p = 1;
        else if (pinned()) {
          // Phones: the gutter is pinned, the water keeps pace with the steps scrolling under it
          const lr = list.getBoundingClientRect();
          p = clamp((vh * 0.62 - lr.top) / lr.height);
        } else {
          const r = run.getBoundingClientRect();
          // Starts as the gutter rises into view, finishes as it nears the top
          p = clamp((vh * 0.9 - r.top) / (vh * 0.75));
        }
        root.style.setProperty('--p', p.toFixed(4));
        root.classList.toggle('is-full', p >= 0.99);
        leaves.forEach(([el, x]) => el.classList.toggle('is-washed', p > x + 0.01));
        steps.forEach((st, i) => {
          let lit;
          if (reduceMotion) lit = true;
          else if (pinned()) lit = st.getBoundingClientRect().top + 40 <= vh * 0.62;
          else lit = p >= (i + 0.5) / steps.length;
          st.classList.toggle('is-lit', lit);
        });
      });
    });
  }

  /* ---------- Solar: each step scrolling past cleans the pinned panel a bit more ---------- */
  function initSolar() {
    document.querySelectorAll('[data-solar]').forEach((root) => {
      const steps = [...root.querySelectorAll('.sx-solar-step')];
      const out = root.querySelector('[data-solar-out]');
      const stage = root.querySelector('.sx-solar-stage');
      onScrollFrame(() => {
        const vh = window.innerHeight;
        // Phones: the panel is pinned at the top, so read steps just below it
        const line = window.matchMedia('(max-width: 900px)').matches ? stage.getBoundingClientRect().bottom + 30 : vh * 0.6;
        let active = 0;
        const t = steps.map((st, i) => {
          const r = st.getBoundingClientRect();
          // How far this step's text has travelled past the reading line (0-1)
          const v = reduceMotion ? 1 : clamp((line - r.top) / (r.height * 0.8));
          if (v > 0) active = i;
          root.style.setProperty(`--s${i + 1}`, v.toFixed(4));
          return v;
        });
        steps.forEach((st, i) => st.classList.toggle('is-active', reduceMotion || i === active));
        if (out) out.textContent = `${Math.round(70 + t[1] * 12 + t[2] * 8 + t[3] * 10)}%`;
      });
    });
  }

  /* ---------- Holiday lights: power runs down the string, bulbs switch on in turn ---------- */
  function initLights() {
    document.querySelectorAll('[data-xsteps]').forEach((root) => {
      const rail = root.querySelector('[data-xrail]');
      const steps = [...root.querySelectorAll('.sx-xstep')];
      const bulbs = steps.map((st) => st.querySelector('.sx-xbulb'));
      const vertical = () => window.matchMedia('(max-width: 900px)').matches;
      onScrollFrame(() => {
        const vh = window.innerHeight;
        const r = root.getBoundingClientRect();
        let tip;
        if (vertical()) {
          tip = vh * 0.6;
          const f = reduceMotion ? 1 : clamp((tip - r.top) / r.height);
          if (rail) rail.style.transform = `scaleY(${f})`;
          root.style.setProperty('--p', f.toFixed(4));
        } else {
          const p = reduceMotion ? 1 : clamp((vh * 0.85 - r.top) / (vh * 0.45));
          root.style.setProperty('--p', p.toFixed(4));
          tip = p > 0 ? r.left + r.width * p : -Infinity;
        }
        bulbs.forEach((b, i) => {
          const br = b.getBoundingClientRect();
          const at = vertical() ? br.top + br.height / 2 : br.left + br.width / 2;
          steps[i].classList.toggle('is-lit', reduceMotion || at <= tip);
        });
      });
    });
  }
})();

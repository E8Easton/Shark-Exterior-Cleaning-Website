/* ==========================================================
   SHARK EXTERIOR — Theme interactions
   Header, drawer, reveal-on-scroll, reviews carousel,
   process stepper and the floating contact form.
   ========================================================== */

(function () {
  // Tells the inline safety net in <head> that the theme script loaded.
  window.__sxReady = true;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initDrawer();
    initDropdown();
    initReveal();
    initCarousels();
    initStepper();
    initTeamGallery();
    initBlogFilter();
    initJourney();
    initWind();
    initLive();
    initPins();
    initChat();
    initPageTransitions();
    initHashLanding();
    initCallTracking();
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  });

  /* ---------- Smooth scrolling ----------
     Evens out mouse-wheel / trackpad scrolling so every section moves at the
     same pace. Touch screens keep their native scrolling. */
  function initSmoothScroll() {
    if (reduceMotion || typeof window.Lenis !== 'function' || window.__sxLenis) return;
    // One steady feel on every page: a slightly quicker glide, same everywhere
    const lenis = new window.Lenis({
      lerp: 0.13,
      wheelMultiplier: 1.15,
      smoothWheel: true,
      syncTouch: false,
      prevent: (node) => !!(node.closest && node.closest('.sx-drawer, .sx-chat-panel, .wizard-overlay, [data-lenis-prevent]')),
    });
    window.__sxLenis = lenis;
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  /* ---------- Header: solid background once scrolled ---------- */
  function initHeader() {
    const nav = document.querySelector('.sx-nav');
    if (!nav) return;
    const update = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', update, { passive: true });
    update();

    const here = location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('.sx-nav-link[href], .sx-nav-menu a').forEach((a) => {
      if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
    });
  }

  /* ---------- Mobile / tablet drawer ---------- */
  function initDrawer() {
    const btn = document.querySelector('.sx-burger');
    const drawer = document.querySelector('.sx-drawer');
    if (!btn || !drawer) return;

    const setOpen = (open) => {
      btn.classList.toggle('active', open);
      drawer.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('sx-lock', open);
      if (window.__sxLenis) open ? window.__sxLenis.stop() : window.__sxLenis.start();
    };

    btn.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));
    drawer.addEventListener('click', (e) => { if (e.target === drawer) setOpen(false); });
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 1240) setOpen(false); });
  }

  /* ---------- Services dropdown: click / keyboard support ---------- */
  function initDropdown() {
    const drops = [...document.querySelectorAll('.sx-nav-drop')];
    const close = (drop) => {
      drop.classList.remove('is-open');
      drop.querySelector('.sx-nav-drop-btn')?.setAttribute('aria-expanded', 'false');
    };
    drops.forEach((drop) => {
      const btn = drop.querySelector('.sx-nav-drop-btn');
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = !drop.classList.contains('is-open');
        drops.forEach((d) => { if (d !== drop) close(d); });
        drop.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
      });
      // Only one menu at a time: hovering a menu closes the others, leaving it closes it
      drop.addEventListener('mouseenter', () => drops.forEach((d) => { if (d !== drop) close(d); }));
      drop.addEventListener('mouseleave', () => close(drop));
      drop.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { close(drop); btn.focus(); }
      });
    });
    document.addEventListener('click', () => drops.forEach(close));
  }

  /* ---------- Reveal on scroll (plays once) ---------- */
  function initReveal() {
    const items = document.querySelectorAll('.sx-r');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('is-in');
          io.unobserve(el);
          // After the entrance finishes, drop the stagger delay so hovers feel instant
          const d = parseInt(el.style.getPropertyValue('--d'), 10) || 0;
          const slow = el.classList.contains('sx-ptile--icon') || el.classList.contains('sx-wstep');
          setTimeout(() => el.classList.add('sx-settled'), slow ? 1900 + d * 1.6 : 1100 + d);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Pinned scroll scenes: section holds still while its steps play out ---------- */
  function initPins() {
    const pins = document.querySelectorAll('[data-pin]');
    if (!pins.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pins.forEach((pin) => {
        pin.classList.add('is-all', 'is-done');
        pin.querySelectorAll('[data-step]').forEach((el) => el.classList.add('is-on', 'is-clean'));
      });
      return;
    }
    const scenes = Array.from(pins).map((pin) => ({
      pin,
      type: pin.dataset.pin,
      cards: pin.querySelectorAll('.sx-pin-card, [data-step]:not(.sx-pin-track li)'),
      leaves: pin.querySelectorAll('.sx-trough-leaves i'),
      pct: pin.querySelector('.sx-solar-pct'),
      bldgs: pin.querySelectorAll('.sx-bldg'),
      caps: pin.querySelectorAll('.sx-city-cap'),
      dots: pin.querySelectorAll('.sx-pin-track li'),
      track: pin.querySelector('.sx-pin-track'),
      scene: pin.querySelector('.sx-sweep-scene'),
      sticky: pin.querySelector('.sx-pin-sticky'),
      last: -1,
    }));
    let ticking = false;
    function update() {
      ticking = false;
      const vh = window.innerHeight;
      scenes.forEach((s) => {
        const r = s.pin.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return;
        const span = Math.max(1, r.height - vh);
        // Safety net: if the browser won't hold the section on screen, unpin it
        // and show every step so the page never scrolls through empty space.
        if (!s.off && s.sticky && r.top < -vh * 0.5 && r.bottom > vh * 1.2 && s.sticky.getBoundingClientRect().top < -60) {
          s.off = true;
          s.pin.classList.add('sx-pin-off', 'is-all', 'is-done', 'has-on');
          s.pin.dataset.cur = String(s.cards.length - 1);
          s.pin.style.setProperty('--p', '1');
          s.pin.querySelectorAll('[data-step], .sx-bldg').forEach((el) => el.classList.add('is-on', 'is-clean'));
          s.pin.querySelectorAll('.sx-pin-card, .sx-pin-track li, .sx-bldg, .sx-city-cap, .sx-solar-step').forEach((el) => el.classList.remove('is-cur'));
          s.pin.querySelectorAll('.sx-trough-leaves i').forEach((el) => el.classList.add('is-gone'));
          if (s.track) s.track.style.setProperty('--fill', 1);
          if (s.pct) s.pct.textContent = '100%';
          window.dispatchEvent(new Event('resize'));
        }
        if (s.off) return;
        const p = Math.min(1, Math.max(0, -r.top / span));
        s.pin.style.setProperty('--p', p.toFixed(4));
        if (s.type === 'steps') {
          const n = s.cards.length;
          const cur = p < 0.04 ? -1 : Math.min(n - 1, Math.floor((p - 0.04) / 0.19));
          const all = p >= 0.82;
          if (cur === s.last && all === s.pin.classList.contains('is-all')) return;
          s.last = cur;
          s.pin.classList.toggle('is-all', all);
          s.pin.classList.toggle('has-on', cur >= 0);
          s.cards.forEach((c, i) => { c.classList.toggle('is-on', i <= cur); c.classList.toggle('is-cur', i === cur && !all); });
          s.dots.forEach((d, i) => { d.classList.toggle('is-on', i <= cur); d.classList.toggle('is-cur', i === cur && !all); });
          if (s.track) s.track.style.setProperty('--fill', cur < 0 ? 0 : all ? 1 : cur / (n - 1));
        } else if (s.type === 'flow') {
          const pinned = window.matchMedia('(min-width: 1001px)').matches;
          const reach = pinned ? p * 1.18 : 1;
          s.cards.forEach((c, i) => c.classList.toggle('is-on', !pinned || reach >= 0.1 + i * 0.24));
          s.leaves.forEach((l) => l.classList.toggle('is-gone', reach >= (parseFloat(l.style.getPropertyValue('--x')) || 0) / 100));
          s.pin.classList.toggle('is-done', !pinned || reach >= 0.98);
        } else if (s.type === 'solar') {
          const n = s.cards.length;
          const cur = Math.min(n - 1, Math.floor(p * n));
          if (s.pin.dataset.cur !== String(cur)) {
            s.pin.dataset.cur = cur;
            s.cards.forEach((c, i) => { c.classList.toggle('is-on', i < cur); c.classList.toggle('is-cur', i === cur); });
          }
          const pct = Math.round(62 + Math.min(1, Math.max(0, (p - 0.25) * 4)) * 14 + Math.min(1, Math.max(0, (p - 0.5) * 4)) * 12 + Math.min(1, Math.max(0, (p - 0.75) * 4)) * 12);
          if (s.pct && s.pct.textContent !== pct + '%') s.pct.textContent = pct + '%';
          s.pin.classList.toggle('is-done', p >= 0.97);
        } else if (s.type === 'city') {
          const n = s.bldgs.length;
          const f = p * n;
          const cur = Math.min(n - 1, Math.floor(f));
          s.bldgs.forEach((b, i) => {
            const local = Math.min(1, Math.max(0, f - i));
            b.classList.toggle('is-on', i <= cur);
            b.classList.toggle('is-cur', i === cur && p < 0.98);
            b.classList.toggle('is-clean', i < cur || p >= 0.98);
            b.style.setProperty('--wash', (i === cur ? Math.min(100, local * 125) : 0).toFixed(1) + '%');
          });
          s.caps.forEach((c, i) => c.classList.toggle('is-cur', i === cur));
        } else if (s.type === 'sweep') {
          const w = s.scene.getBoundingClientRect();
          const wx = w.left + (p * 1.16 - 0.08) * w.width;
          s.cards.forEach((c) => {
            const b = c.getBoundingClientRect();
            c.classList.toggle('is-clean', wx >= b.left + b.width * 0.55);
          });
          s.pin.classList.toggle('is-done', p >= 0.97);
        }
      });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---------- Sections that animate once they are actually on screen ---------- */
  function initLive() {
    const els = document.querySelectorAll('.sx-book--meter, [data-live]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-live')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-live');
        io.unobserve(e.target);
      });
    }, { threshold: 0.35 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Process timeline: line fills and steps light up as you scroll ---------- */
  function initJourney() {
    document.querySelectorAll('[data-journey]').forEach((root) => {
      const line = root.querySelector('.sx-journey-line');
      const fill = root.querySelector('[data-journey-fill]');
      const steps = [...root.querySelectorAll('.sx-journey-step')];
      const nodes = steps.map((st) => st.querySelector('.sx-journey-node'));
      const vertical = () => window.matchMedia('(max-width: 900px)').matches;
      // Bubbles that float up out of each number once the water reaches it
      nodes.forEach((n) => {
        const fizz = document.createElement('span');
        fizz.className = 'sx-journey-fizz';
        fizz.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < 9; i++) {
          const b = document.createElement('i');
          b.style.setProperty('--x', `${Math.round(Math.random() * 70 - 35)}px`);
          b.style.setProperty('--s', `${(8 + Math.random() * 10).toFixed(1)}px`);
          b.style.setProperty('--t', `${(1.6 + Math.random() * 1.4).toFixed(2)}s`);
          b.style.setProperty('--dl', `${(i * 0.24).toFixed(2)}s`);
          fizz.appendChild(b);
        }
        n.appendChild(fizz);
      });
      let ticking = false;
      const update = () => {
        ticking = false;
        const r = root.getBoundingClientRect();
        const lr = line.getBoundingClientRect();
        const vh = window.innerHeight;
        let tip;
        if (vertical()) {
          // Phones: the water's edge sits 60% down the screen
          tip = vh * 0.6;
          const amount = reduceMotion ? 1 : Math.min(1, Math.max(0, (tip - lr.top) / lr.height));
          fill.style.transform = `scaleY(${amount})`;
          tip = reduceMotion ? Infinity : tip;
        } else {
          // Wide screens: runs left to right while the timeline crosses the screen
          const p = reduceMotion ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.5)));
          fill.style.transform = `scaleX(${p})`;
          tip = p > 0 ? lr.left + lr.width * p : -Infinity;
        }
        // A number lights up only once the filled line has actually reached it
        nodes.forEach((n, i) => {
          const nr = n.getBoundingClientRect();
          const centre = vertical() ? nr.top + nr.height / 2 : nr.left + nr.width / 2;
          steps[i].classList.toggle('is-lit', centre <= tip + 1);
        });
      };
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();
    });
  }

  /* ---------- Winding process path: draws itself as you scroll ----------
     The line's tip follows a fixed spot on screen (60% down), and a step
     lights up the moment its node reaches that spot, so the line and the
     steps stay in sync on every screen size. */
  function initWind() {
    document.querySelectorAll('[data-wind]').forEach((root) => {
      const draw = root.querySelector('[data-wind-draw]');
      const track = root.querySelector('.sx-wind-track');
      const rail = root.querySelector('[data-wind-rail]');
      const steps = [...root.querySelectorAll('.sx-wind-step')];
      const nodes = steps.map((st) => st.querySelector('.sx-wind-node'));
      // Sample the path once: how far along it (0-1) each height (0-100) is reached
      const samples = [];
      if (track && track.getTotalLength) {
        const len = track.getTotalLength();
        for (let i = 0; i <= 240; i++) {
          const pt = track.getPointAtLength((len * i) / 240);
          samples.push([pt.y, i / 240]);
        }
      }
      const lengthAtY = (y) => {
        if (!samples.length) return y / 100;
        for (let i = 0; i < samples.length; i++) if (samples[i][0] >= y) return samples[i][1];
        return 1;
      };
      let ticking = false;
      const update = () => {
        ticking = false;
        const r = root.getBoundingClientRect();
        const tip = window.innerHeight * 0.6;
        const y = reduceMotion ? 100 : Math.min(100, Math.max(0, ((tip - r.top) / r.height) * 100));
        if (draw) draw.style.strokeDashoffset = String(1 - (y >= 100 ? 1 : lengthAtY(y)));
        if (rail) {
          const rr = rail.parentElement.getBoundingClientRect();
          const f = reduceMotion ? 1 : Math.min(1, Math.max(0, (tip - rr.top) / rr.height));
          rail.style.transform = `scaleY(${f})`;
        }
        nodes.forEach((n, i) => {
          const nr = n.getBoundingClientRect();
          steps[i].classList.toggle('is-lit', reduceMotion || nr.top + nr.height / 2 <= tip);
        });
      };
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();
    });
  }

  /* ---------- Blog: filter guides by topic ---------- */
  function initBlogFilter() {
    const bar = document.querySelector('.sx-blog-filter');
    if (!bar) return;
    const cards = [...document.querySelectorAll('.blog-grid .blog-card[data-cat]')];
    bar.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-filter]');
      if (!chip) return;
      const f = chip.dataset.filter;
      bar.querySelectorAll('[data-filter]').forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      cards.forEach((card) => {
        const show = f === 'all' || card.dataset.cat === f;
        card.hidden = !show;
        if (show) { card.classList.add('revealed'); card.classList.remove('sx-filter-in'); void card.offsetWidth; card.classList.add('sx-filter-in'); }
      });
    });
  }

  /* ---------- Team photos: dots + slow crossfade when a member has several photos ---------- */
  function initTeamGallery() {
    document.querySelectorAll('[data-member-gallery]').forEach((box) => {
      const imgs = [...box.querySelectorAll('img')];
      if (imgs.length < 2) return;
      const dots = document.createElement('div');
      dots.className = 'sx-member-thumbs';
      let cur = 0;
      let timer = null;
      const show = (i) => {
        cur = (i + imgs.length) % imgs.length;
        imgs.forEach((img, j) => img.classList.toggle('is-active', j === cur));
        [...dots.children].forEach((d, j) => d.setAttribute('aria-current', j === cur ? 'true' : 'false'));
      };
      imgs.forEach((img, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Show photo ${i + 1}`);
        b.addEventListener('click', () => { show(i); stop(); });
        dots.appendChild(b);
      });
      box.appendChild(dots);
      const start = () => { if (!reduceMotion && !timer) timer = setInterval(() => show(cur + 1), 3200); };
      const stop = () => { clearInterval(timer); timer = null; };
      box.addEventListener('mouseenter', () => { show(cur + 1); start(); });
      box.addEventListener('mouseleave', stop);
      show(0);
    });
  }

  /* ---------- Reviews carousel: arrows + gentle autoplay ---------- */
  function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach((root) => {
      const track = root.querySelector('[data-track]');
      if (!track) return;
      const step = () => {
        const card = track.firstElementChild;
        if (!card) return track.clientWidth;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return card.getBoundingClientRect().width + gap;
      };
      const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      const next = () => track.scrollBy({ left: atEnd() ? -track.scrollWidth : step(), behavior: 'smooth' });
      const prev = () => track.scrollBy({ left: track.scrollLeft <= 4 ? track.scrollWidth : -step(), behavior: 'smooth' });

      root.querySelector('[data-next]')?.addEventListener('click', () => { next(); restart(); });
      root.querySelector('[data-prev]')?.addEventListener('click', () => { prev(); restart(); });

      let timer = null;
      const start = () => { if (!reduceMotion) timer = setInterval(next, 6000); };
      const stop = () => { clearInterval(timer); timer = null; };
      const restart = () => { stop(); start(); };
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      track.addEventListener('touchstart', stop, { passive: true });
      start();
    });
  }

  /* ---------- 4-step process stepper ---------- */
  function initStepper() {
    document.querySelectorAll('[data-stepper]').forEach((root) => {
      const slides = Array.from(root.querySelectorAll('.sx-step'));
      // Fetch and decode every step photo up front so switching steps never
      // shows an empty frame (works for any photos added later too).
      slides.forEach((slide) => slide.querySelectorAll('img').forEach((img) => {
        img.loading = 'eager';
        const pre = new Image();
        pre.src = img.currentSrc || img.src;
        if (pre.decode) pre.decode().catch(() => {});
      }));
      const dots = Array.from(root.querySelectorAll('.sx-dot'));
      const fill = root.querySelector('[data-fill]');
      if (!slides.length) return;
      let current = 0;
      let timer = null;

      let show = (i) => {
        current = (i + slides.length) % slides.length;
        slides.forEach((s, n) => {
          const on = n === current;
          s.hidden = !on;
          s.classList.toggle('is-active', on);
        });
        dots.forEach((d, n) => {
          d.classList.toggle('is-active', n === current);
          d.classList.toggle('is-done', n < current);
          d.setAttribute('aria-selected', String(n === current));
        });
        if (fill) fill.style.width = (current / (slides.length - 1)) * 100 + '%';
      };

      // Autoplay: moves to the next step every few seconds while on screen.
      // A click pauses it; after a short idle it picks back up on its own.
      const STEP_MS = 5500;
      const IDLE_MS = 8000;
      let visible = false;
      let resumeTimer = null;
      const start = () => {
        if (timer || !visible) return;
        root.classList.add('is-playing');
        timer = setInterval(() => show(current + 1), STEP_MS);
      };
      const stop = () => { clearInterval(timer); timer = null; root.classList.remove('is-playing'); };
      const restartBar = () => { root.classList.remove('is-ticking'); void root.offsetWidth; if (timer) root.classList.add('is-ticking'); };
      const origShow = show;
      show = (i) => { origShow(i); restartBar(); };

      dots.forEach((d) => d.addEventListener('click', () => {
        stop();
        clearTimeout(resumeTimer);
        show(Number(d.dataset.go));
        resumeTimer = setTimeout(() => { start(); restartBar(); }, IDLE_MS);
      }));

      // Only run the autoplay while the stepper is on screen
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            visible = e.isIntersecting;
            if (visible) { start(); restartBar(); } else { stop(); clearTimeout(resumeTimer); }
          });
        }, { threshold: 0.3 }).observe(root);
      } else {
        visible = true;
        start();
      }
      show(0);
    });
  }

  /* ---------- Section links: land exactly on the section, below the header ---------- */
  function sxHeaderOffset() {
    const nav = document.querySelector('.sx-nav-inner, .qp-brand');
    return nav ? nav.getBoundingClientRect().bottom + 16 : 90;
  }
  function sxScrollToHash(hash, immediate) {
    let el = null;
    try { el = document.querySelector(decodeURIComponent(hash)); } catch (err) { return false; }
    if (!el) return false;
    const y = el.getBoundingClientRect().top + window.scrollY - sxHeaderOffset();
    if (window.__sxLenis) window.__sxLenis.scrollTo(y, { immediate: !!immediate, duration: 1.1 });
    else window.scrollTo({ top: y, behavior: immediate ? 'instant' : 'smooth' });
    return true;
  }
  window.sxScrollToHash = sxScrollToHash;
  function initHashLanding() {
    if (!location.hash || location.hash.length < 2) return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const land = () => { window.__sxLenis?.resize?.(); sxScrollToHash(location.hash, true); };
    // Once now, again after images/fonts settle so the section is exactly in place
    requestAnimationFrame(land);
    window.addEventListener('load', () => { land(); setTimeout(land, 350); }, { once: true });
  }

  /* ---------- Page transitions ----------
     Drops the navy curtain before leaving for another page on this site. */
  function initPageTransitions() {
    if (reduceMotion) return;
    const root = document.documentElement;
    window.addEventListener('pageshow', () => root.classList.remove('sx-leaving'));
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.getAttribute('href'), location.href);
      if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
      const samePage = (a, b) => a.replace(/\/index\.html$/, '/') === b.replace(/\/index\.html$/, '/');
      if (samePage(url.pathname, location.pathname)) {
        // Same page (e.g. "/" and "/index.html#reviews"): glide to the section, no reload
        if (url.hash && sxScrollToHash(url.hash)) {
          e.preventDefault();
          history.pushState(null, '', url.hash);
        }
        return;
      }
      e.preventDefault();
      root.classList.add('sx-leaving');
      setTimeout(() => { location.href = url.href; }, 300);
    });
  }

  /* ---------- Click-to-call tracking ---------- */
  function initCallTracking() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href^="tel:"]');
      if (!a || typeof window.sxTrack !== 'function') return;
      const where = a.closest('.sx-nav, .sx-drawer, .sx-hero, .sx-final, .sx-footer, .qp-brand, .sx-side-cta, .sx-chat')?.className.split(' ')[0] || 'page';
      window.sxTrack('click_to_call', { link_location: where, page: location.pathname });
    }, true);
  }

  /* ---------- Floating contact form ---------- */
  function initChat() {
    const chat = document.getElementById('sx-chat');
    if (!chat) return;
    const btn = document.getElementById('sx-chat-btn');
    const form = document.getElementById('sx-chat-form');
    const done = document.getElementById('sx-chat-done');
    const err = document.getElementById('sx-chat-error');

    const setOpen = (open) => {
      chat.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) setTimeout(() => form && !form.hidden && form.querySelector('input')?.focus(), 250);
    };
    btn.addEventListener('click', () => setOpen(!chat.classList.contains('open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && chat.classList.contains('open')) { setOpen(false); btn.focus(); } });

    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const contact = form.contact.value.trim();
      const message = form.message.value.trim();
      if (!name || !contact || !message) {
        err.textContent = 'Please fill in your name, a phone number or email, and a short message.';
        return;
      }
      err.textContent = '';
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      const finish = (ok) => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        if (ok) {
          form.hidden = true;
          done.hidden = false;
          if (typeof window.sxTrack === 'function') window.sxTrack('generate_lead', { form_name: 'contact_bubble', page: location.pathname });
        } else {
          err.textContent = "Your message didn't send. Please call or text us at (402) 309-0128.";
        }
      };

      const cfg = window.LEAF_NOTIFY || (typeof LEAF_NOTIFY !== 'undefined' ? LEAF_NOTIFY : null);
      if (!cfg || typeof loadEmailJS !== 'function') return finish(false);

      const isEmail = /@/.test(contact);
      const payload = {
        to_email: cfg.owner_email,
        reply_to: isEmail ? contact : cfg.owner_email,
        customer_name: name,
        customer_email: isEmail ? contact : '',
        customer_phone: isEmail ? '' : contact,
        submitted_at: new Date().toLocaleString(),
        services: 'Website message',
        special_notes: message,
        lead_source: typeof window.sxAttribution === 'function' ? window.sxAttribution() : '',
        message: `Website message from ${name} (${contact}):\n\n${message}\n\nPage: ${location.href}\nSource: ${typeof window.sxAttribution === 'function' ? window.sxAttribution() : 'unknown'}`,
      };
      loadEmailJS(() => {
        emailjs.send(cfg.service_id, cfg.template_id, payload)
          .then(() => finish(true))
          .catch(() => finish(false));
      });
    });
  }
})();

/* ==========================================================
   SHARK EXTERIOR — Theme interactions
   Header, drawer, reveal-on-scroll, reviews carousel,
   process stepper and the floating contact form.
   ========================================================== */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initDrawer();
    initDropdown();
    initReveal();
    initCarousels();
    initStepper();
    initChat();
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  });

  /* ---------- Header: solid background once scrolled ---------- */
  function initHeader() {
    const nav = document.querySelector('.sx-nav');
    if (!nav) return;
    const update = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', update, { passive: true });
    update();

    const here = location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('.sx-nav-link[href]').forEach((a) => {
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
    };

    btn.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));
    drawer.addEventListener('click', (e) => { if (e.target === drawer) setOpen(false); });
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 1100) setOpen(false); });
  }

  /* ---------- Services dropdown: click / keyboard support ---------- */
  function initDropdown() {
    document.querySelectorAll('.sx-nav-drop').forEach((drop) => {
      const btn = drop.querySelector('.sx-nav-drop-btn');
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = !drop.classList.contains('is-open');
        drop.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('click', () => {
        drop.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      });
      drop.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { drop.classList.remove('is-open'); btn.focus(); }
      });
    });
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
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    items.forEach((el) => io.observe(el));
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
      const dots = Array.from(root.querySelectorAll('.sx-dot'));
      const fill = root.querySelector('[data-fill]');
      if (!slides.length) return;
      let current = 0;
      let timer = null;

      const show = (i) => {
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

      const start = () => { if (!reduceMotion && !timer) timer = setInterval(() => show(current + 1), 5000); };
      const stop = () => { clearInterval(timer); timer = null; };

      dots.forEach((d) => d.addEventListener('click', () => { show(Number(d.dataset.go)); stop(); start(); }));
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);

      // Only run the autoplay while the stepper is on screen
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          entries.forEach((e) => (e.isIntersecting ? start() : stop()));
        }, { threshold: 0.3 }).observe(root);
      } else {
        start();
      }
      show(0);
    });
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
        message: `Website message from ${name} (${contact}):\n\n${message}\n\nPage: ${location.href}`,
      };
      loadEmailJS(() => {
        emailjs.send(cfg.service_id, cfg.template_id, payload)
          .then(() => finish(true))
          .catch(() => finish(false));
      });
    });
  }
})();

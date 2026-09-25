/* ==========================================================
   SHARK EXTERIORS — Interactions & Animations
   ========================================================== */

/* ----------------------------------------------------------
   NOTIFICATION CONFIG — Fill these in after EmailJS setup
   (see setup instructions at the bottom of this file)
   ---------------------------------------------------------- */
const LEAF_NOTIFY = {
  public_key:   'l9uOWTh2tT3gqUag8',
  service_id:   'service_umf782h',
  template_id:  'template_cry5s9x',
  owner_email:  'dirtyleafcleaning@gmail.com',

  // SMS gateway — fill in your carrier:
  //    Verizon  → 4023090128@vtext.com
  //    AT&T     → 4023090128@txt.att.net
  //    T-Mobile → 4023090128@tmomail.net
  //    Sprint   → 4023090128@messaging.sprintpcs.com
  sms_gateway:  '4023090128@vtext.com',
};

/* ----------------------------------------------------------
   PRICING SETTINGS — edit these numbers to change what the quote
   form shows. Keep the membership numbers in sync with the plan
   cards on the homepage / service pages.
   ---------------------------------------------------------- */
const SHARK_PRICING = {
  // Bundle discount on the whole visit, by how many services are booked together.
  // Bundle savings can be combined with membership savings.
  bundleTiers: [
    { services: 2, percent: 10 },
    { services: 3, percent: 15 },
    { services: 4, percent: 20 },
  ],
  // Example per-cleaning price used to show the yearly breakdown on plan cards.
  examplePrice: 300,
  // Prepaid memberships: number of cleanings per year and dollars off each one.
  plans: {
    monthly:   { name: 'Monthly',    visits: 12, offEach: 150 },
    quarterly: { name: 'Quarterly',  visits: 4,  offEach: 100 },
    triannual: { name: 'Tri-Annual', visits: 3,  offEach: 75 },
    biannual:  { name: 'Bi-Annual',  visits: 2,  offEach: 50 },
  },
};

/* ----------------------------------------------------------
   ANALYTICS HELPERS — Google Analytics 4 (tag is in each page <head>)
   ---------------------------------------------------------- */
function sxTrack(name, params) {
  try { if (typeof gtag === 'function') gtag('event', name, params || {}); } catch (e) { /* never break the page */ }
  // Same event as a plain dataLayer entry so Google Tag Manager triggers
  // (Custom Event: generate_lead, click_to_call, quote_step) can use it.
  try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: 'sx_' + name }, params || {})); } catch (e) { /* ignore */ }
}

// Remember where a visitor came from (ad campaign tags) so it reaches the quote email.
const SX_ATTRIB_KEY = 'sx_attribution';
(function captureAttribution() {
  try {
    const params = new URLSearchParams(location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    const found = {};
    keys.forEach(k => { const v = params.get(k); if (v) found[k] = v.slice(0, 150); });
    if (Object.keys(found).length) {
      found.landing_page = location.pathname;
      found.captured_at = new Date().toISOString();
      localStorage.setItem(SX_ATTRIB_KEY, JSON.stringify(found));
    } else if (!localStorage.getItem(SX_ATTRIB_KEY) && document.referrer && !document.referrer.includes(location.hostname)) {
      localStorage.setItem(SX_ATTRIB_KEY, JSON.stringify({ referrer: document.referrer.slice(0, 150), landing_page: location.pathname, captured_at: new Date().toISOString() }));
    }
  } catch (e) { /* storage blocked — attribution is optional */ }
})();

function sxAttribution() {
  try {
    const a = JSON.parse(localStorage.getItem(SX_ATTRIB_KEY) || 'null');
    if (!a) return 'Direct / unknown';
    if (a.utm_source || a.gclid || a.fbclid) {
      return [a.utm_source && `source=${a.utm_source}`, a.utm_medium && `medium=${a.utm_medium}`, a.utm_campaign && `campaign=${a.utm_campaign}`,
              a.utm_term && `term=${a.utm_term}`, a.utm_content && `content=${a.utm_content}`, a.gclid && 'Google Ads click', a.fbclid && 'Facebook/Instagram click',
              `landing=${a.landing_page}`].filter(Boolean).join(', ');
    }
    return `Referral from ${a.referrer} (landing=${a.landing_page})`;
  } catch (e) { return 'Direct / unknown'; }
}

function planSavings(id) {
  const p = SHARK_PRICING.plans[id];
  return p ? p.visits * p.offEach : 0;
}

function bundlePercent(serviceCount) {
  return SHARK_PRICING.bundleTiers.reduce((pct, t) => (serviceCount >= t.services ? t.percent : pct), 0);
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initHeroParticles();
  // initHeroParallax(); // disabled — keeps hero image still
  initSmoothScroll();
  initReviewsCarousel();
  initCounterAnimation();
  initQuoteWizard();
  initPageWizard();
  initFAQ();
  enhanceShareReview();
  initFaqPopIn();
});


/* ---------------------------------------------------
   NAVBAR — Glassmorphism on scroll
   --------------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const threshold = 60;

  function handleScroll() {
    if (window.scrollY > threshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // initial check
}


/* ---------------------------------------------------
   MOBILE MENU — Hamburger toggle
   --------------------------------------------------- */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;

  const body = document.body;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      body.style.overflow = '';
    });
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      body.style.overflow = '';
    }
  });
}


/* ---------------------------------------------------
   SCROLL REVEAL — Intersection Observer
   --------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children'
  );

  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Don't unobserve — allows re-animation if wanted
          // observer.unobserve(entry.target);
        }
      });
    },
    {
      // Fire as soon as any part is on screen so very tall blocks
      // (like long blog articles) never stay hidden.
      threshold: 0,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  revealElements.forEach(el => observer.observe(el));
}


/* ---------------------------------------------------
   HERO — Floating Particles
   --------------------------------------------------- */
function initHeroParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  const particleCount = 25;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    // Randomize properties
    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 12;
    const opacity = Math.random() * 0.5 + 0.2;

    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
      opacity: ${opacity};
    `;

    container.appendChild(particle);
  }
}


/* ---------------------------------------------------
   HERO — Parallax on scroll
   --------------------------------------------------- */
function initHeroParallax() {
  const heroBg = document.querySelector('.hero-bg img');
  if (!heroBg) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroHeight = document.querySelector('.hero').offsetHeight;

    if (scrolled < heroHeight) {
      const parallaxY = scrolled * 0.35;
      heroBg.style.transform = `scale(1.05) translateY(${parallaxY}px)`;
    }
  }, { passive: true });
}


/* ---------------------------------------------------
   SMOOTH SCROLL — Anchor links
   --------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const navbarH = document.querySelector('.sx-nav, .navbar')?.offsetHeight || 80;
      if (window.__sxLenis) {
        window.__sxLenis.scrollTo(targetEl, { offset: -(navbarH + 20) });
        return;
      }
      const targetY = targetEl.getBoundingClientRect().top + window.scrollY - navbarH - 20;

      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    });
  });
}


/* ---------------------------------------------------
   REVIEWS CAROUSEL (Mobile)
   --------------------------------------------------- */
function initReviewsCarousel() {
  const prevBtn = document.getElementById('reviews-prev');
  const nextBtn = document.getElementById('reviews-next');
  const grid = document.querySelector('.reviews-grid');

  if (!prevBtn || !nextBtn || !grid) return;

  const cards = grid.querySelectorAll('.review-card');
  let currentIndex = 0;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function updateCarousel() {
    if (!isMobile()) {
      // Show all on desktop
      cards.forEach(card => {
        card.style.display = '';
        card.style.opacity = '';
        card.style.transform = '';
      });
      return;
    }

    cards.forEach((card, idx) => {
      if (idx === currentIndex) {
        card.style.display = '';
        card.style.opacity = '1';
        card.style.transform = 'translateX(0)';
      } else {
        card.style.display = 'none';
      }
    });
  }

  function advance() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
  }

  let autoTimer = setInterval(advance, 5000);

  function resetTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(advance, 5000);
  }

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
    resetTimer();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
    resetTimer();
  });

  window.addEventListener('resize', updateCarousel);
  updateCarousel();
}


/* ---------------------------------------------------
   FAQ ACCORDION
   --------------------------------------------------- */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item.active').forEach(el => el.classList.remove('active'));
      if (!isOpen) item.classList.add('active');
    });
  });
}


/* ---------------------------------------------------
   COUNTER ANIMATION — Process step numbers
   --------------------------------------------------- */
function initCounterAnimation() {
  const steps = document.querySelectorAll('.process-step-number');
  if (!steps.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'));
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  steps.forEach(step => observer.observe(step));
}

function animateCounter(el, target) {
  let current = 0;
  const duration = 600;
  const stepTime = duration / target;

  const timer = setInterval(() => {
    current++;
    el.textContent = current;
    if (current >= target) {
      clearInterval(timer);
    }
  }, stepTime);
}


/* ---------------------------------------------------
   QUOTE WIZARD — Multi-step quote modal (6 steps)
   --------------------------------------------------- */
const wizardState = {
  currentStep: 1,
  totalSteps: 6,
  preselectedService: null,
  preselectedPlan: null,
  addOns: [],           // add-on service IDs selected in step 4
};

// Services that memberships apply to (window-cleaning side)
const WINDOW_SERVICES = ['exterior-windows', 'interior-windows', 'screen-cleaning', 'track-detailing'];

// Add-on service map: primary service → related add-on service IDs
const SVC_ADDONS = {
  'exterior-windows':   ['interior-windows', 'screen-cleaning', 'track-detailing', 'gutters'],
  'interior-windows':   ['exterior-windows', 'screen-cleaning', 'track-detailing'],
  'track-detailing':    ['exterior-windows', 'interior-windows', 'screen-cleaning'],
  'gutters':            ['exterior-windows', 'soft-washing', 'pressure-washing'],
  'screen-cleaning':    ['exterior-windows', 'interior-windows', 'track-detailing'],
  'pressure-washing':   ['soft-washing', 'exterior-windows', 'gutters'],
  'solar-panel':        ['exterior-windows', 'gutters', 'soft-washing'],
  'soft-washing':       ['exterior-windows', 'pressure-washing', 'gutters'],
  'christmas-lights':   ['exterior-windows', 'gutters'],
  'commercial-cleaning':['exterior-windows', 'pressure-washing', 'soft-washing'],
};

// Short label shown on each add-on card. The first add-on in a list is
// always shown as the featured "Most Popular" pick.
const ADDON_TAGS = {
  'interior-windows': 'Inside & out',
  'screen-cleaning':  'Pairs perfectly',
  'track-detailing':  'Quick add',
  'exterior-windows': 'Clear views',
  'gutters':          'Recommended',
  'soft-washing':     'Curb appeal',
  'pressure-washing': 'Curb appeal',
  'solar-panel':      'Great pairing',
};

// Image + display name map for all services
const SVC_INFO = {
  'exterior-windows':   { img: 'images/svc-exterior.jpg',   name: 'Exterior Window Cleaning',        desc: 'Streak-free glass on every exterior pane' },
  'interior-windows':   { img: 'images/svc-interior.jpg',   name: 'Interior Window Cleaning',        desc: 'Crystal-clear inside views, safely done' },
  'track-detailing':    { img: 'images/svc-track.jpg',      name: 'Track Detailing',                 desc: 'Deep-cleaned tracks, sills & frames' },
  'gutters':            { img: 'images/svc-gutter.jpg',     name: 'Gutter Cleaning',                 desc: 'Free-flowing gutters, no clogs or damage' },
  'screen-cleaning':    { img: 'images/svc-screen.jpg',     name: 'Screen Cleaning',                 desc: 'Dust & grime removed from every screen' },
  'pressure-washing':   { img: 'images/svc-powerwash.jpg',  name: 'Pressure Washing',                desc: 'Driveways, patios & walkways like new' },
  'solar-panel':        { img: 'images/svc-solar.jpg',      name: 'Solar Panel Cleaning',            desc: 'Max energy output — panels cleaned right' },
  'soft-washing':       { img: 'images/svc-softwash.jpg',   name: 'Soft Washing',                   desc: 'Gentle low-pressure clean for siding & roofs' },
  'christmas-lights':   { img: 'images/svc-christmas.jpg',  name: 'House Lighting Installation',    desc: 'Pro install, takedown & storage included' },
  'commercial-cleaning':{ img: 'images/svc-commercial.jpg', name: 'Commercial Cleaning',            desc: 'High-rise, storefront & office specialists' },
};

function initQuoteWizard() {
  const overlay = document.getElementById('wizard-overlay');
  const closeBtn = document.getElementById('wizard-close');
  const nextBtn = document.getElementById('wizard-next');
  const backBtn = document.getElementById('wizard-back');

  if (!overlay) return;

  // Location cards — single select
  overlay.querySelectorAll('.location-card').forEach(card => {
    card.addEventListener('click', () => {
      overlay.querySelectorAll('.location-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const rb = card.querySelector('input[type="radio"]');
      if (rb) rb.checked = true;
      // Apply location theme
      const loc = card.dataset.location;
      document.body.classList.remove('theme-kearney', 'theme-lincoln');
      if (loc) document.body.classList.add(`theme-${loc}`);
    });
  });

  // Property type cards — single select
  overlay.querySelectorAll('.property-card').forEach(card => {
    card.addEventListener('click', () => {
      overlay.querySelectorAll('.property-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const rb = card.querySelector('input[type="radio"]');
      if (rb) rb.checked = true;
    });
  });

  // Service cards — single select with deselect toggle
  overlay.querySelectorAll('.service-radio-card').forEach(card => {
    card.addEventListener('click', e => {
      e.preventDefault();
      const alreadySelected = card.classList.contains('selected');
      overlay.querySelectorAll('.service-radio-card').forEach(c => {
        c.classList.remove('selected');
        const r = c.querySelector('input[type="radio"]');
        if (r) r.checked = false;
      });
      if (!alreadySelected) {
        card.classList.add('selected');
        const rb = card.querySelector('input[type="radio"]');
        if (rb) rb.checked = true;
      }
    });
  });

  // Plan cards — single select
  overlay.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('click', () => {
      overlay.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const rb = card.querySelector('input[type="radio"]');
      if (rb) rb.checked = true;
    });
  });

  // Close handlers
  closeBtn.addEventListener('click', closeQuoteWizard);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeQuoteWizard();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeQuoteWizard();
    }
  });

  // Navigation
  nextBtn.addEventListener('click', handleNext);
  backBtn.addEventListener('click', handleBack);
}

function openQuoteWizard(serviceId = null, planName = null) {
  const overlay = document.getElementById('wizard-overlay');
  if (!overlay) return;

  // Reset state
  wizardState.currentStep = 1;
  wizardState.preselectedService = serviceId;
  wizardState.preselectedPlan = planName;
  wizardState.addOns = [];
  if (typeof updateSavingsChip === 'function') setTimeout(updateSavingsChip, 0);

  // Clear all radio/checkbox card selections
  overlay.querySelectorAll('.location-card, .property-card, .plan-card').forEach(card => {
    card.classList.remove('selected');
    const rb = card.querySelector('input[type="radio"]');
    if (rb) rb.checked = false;
  });
  overlay.querySelectorAll('.service-radio-card').forEach(card => {
    card.classList.remove('selected');
    const cb = card.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = false;
  });

  // Clear form fields and errors
  overlay.querySelectorAll('.wizard-error').forEach(el => el.textContent = '');
  overlay.querySelectorAll('.wizard-form input, .wizard-form textarea').forEach(el => el.value = '');
  overlay.querySelectorAll('.wizard-form select').forEach(el => el.selectedIndex = 0);
  overlay.querySelectorAll('.wizard-consents input[type="checkbox"]').forEach(cb => cb.checked = false);

  // Pre-select service if specified
  if (serviceId) {
    const card = overlay.querySelector(`.service-radio-card[data-service="${serviceId}"]`);
    if (card) {
      card.classList.add('selected');
      const cb = card.querySelector('input[type="checkbox"]');
      if (cb) cb.checked = true;
    }
  }

  // Pre-select plan if specified
  if (planName) {
    const planKey = planName.toLowerCase().replace('-', '');
    const card = overlay.querySelector(`.plan-card[data-plan="${planKey}"]`);
    if (card) {
      card.classList.add('selected');
      const rb = card.querySelector('input[type="radio"]');
      if (rb) rb.checked = true;
    }
  }

  // Show overlay
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderStep(1);
}

function closeQuoteWizard() {
  const overlay = document.getElementById('wizard-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function handleNext() {
  const { currentStep, totalSteps } = wizardState;
  if (!validateStep(currentStep)) return;

  if (currentStep === totalSteps) {
    buildConfirmationSummary();
    submitQuoteNotification(); // send email + SMS to owner
    renderStep(7); // confirmation
  } else if (currentStep === 4 && offerBundlePopup(() => renderStep(5))) {
    // Bundle pop-up is open; it continues to the plan step when closed
  } else {
    renderStep(currentStep + 1);
  }
}

function handleBack() {
  const { currentStep } = wizardState;

  // On step 4: if a service is already selected (grid in selected state),
  // Back should reset the grid so the user can re-pick — not leave the step.
  if (currentStep === 4 && document.querySelector('#svc-img-grid.service-selected')) {
    resetServiceGrid();
    window.scrollTo({ top: document.getElementById('wizard-step-4')?.offsetTop - 80 || 0, behavior: 'smooth' });
    return;
  }

  if (currentStep > 1) {
    renderStep(currentStep - 1);
  }
}

function renderStep(step) {
  const overlay = document.getElementById('wizard-overlay');

  // Hide all steps 1-7
  for (let i = 1; i <= 7; i++) {
    const el = document.getElementById(`wizard-step-${i}`);
    if (el) el.hidden = true;
  }

  // Show target step
  const target = document.getElementById(`wizard-step-${step}`);
  if (target) target.hidden = false;

  const prevStep = wizardState.currentStep;
  wizardState.currentStep = step;
  // Quote page: slimmer header from the service step on, so each step fits on screen
  if (wizardState.pageMode) {
    document.body.classList.toggle('qp-compact', step >= 4);
    for (let i = 1; i <= 7; i++) document.body.classList.toggle(`qp-at-${i}`, i === step);
  }
  setTimeout(updateSavingsChip, 0);
  if (step !== prevStep || step === 1) sxTrack('quote_step', { step_number: step, form_mode: wizardState.pageMode ? 'page' : 'modal' });

  // When navigating back to step 4, reset service grid so user can re-pick
  if (step === 4 && prevStep > 4) {
    resetServiceGrid();
  }

  // When entering step 4, auto-select if a service was passed via URL param
  if (step === 4 && wizardState.preselectedService) {
    const preCard = document.querySelector(`#svc-img-grid [data-service="${wizardState.preselectedService}"]`);
    if (preCard && !preCard.classList.contains('selected')) {
      // Small delay so the step is fully visible before the animation runs
      setTimeout(() => triggerServiceSelect(preCard), 120);
    }
    // Only auto-trigger once
    wizardState.preselectedService = null;
  }

  // When entering step 5, inject selected services summary above the plan cards
  if (step === 5) {
    injectPlanServiceSummary();
    preparePlanStep();
  }

  // When entering step 3, pre-select property type passed in the URL
  if (step === 3 && wizardState.preselectedProperty) {
    const card = document.querySelector(`.property-card[data-property="${wizardState.preselectedProperty}"]`);
    if (card && !document.querySelector('.property-card.selected')) card.click();
    wizardState.preselectedProperty = null;
  }

  // When entering step 6 (address), auto-fill city from location selection
  if (step === 6) {
    const locationCard = document.querySelector('.location-card.selected');
    if (locationCard) {
      const cityField = document.getElementById('prop-city');
      if (cityField) {
        cityField.value = locationCard.dataset.location === 'kearney' ? 'Kearney' : 'Lincoln';
      }
    }
  }

  // Update step label
  const label = document.getElementById('wizard-step-label');
  if (label) {
    label.textContent = step <= 6 ? `Step ${step} of 6` : 'Quote Submitted';
  }

  // Update step dots — works in both modal and full-page mode
  const dotRoot = overlay || document;
  dotRoot.querySelectorAll('.step-dot').forEach(dot => {
    const dotStep = parseInt(dot.dataset.step);
    dot.classList.remove('active', 'done');
    if (dotStep < step) dot.classList.add('done');
    if (dotStep === step) dot.classList.add('active');
  });

  // Update connectors
  dotRoot.querySelectorAll('.step-connector').forEach((conn, idx) => {
    conn.classList.toggle('done', step > idx + 1);
  });

  // Back button
  const backBtn = document.getElementById('wizard-back');
  if (backBtn) backBtn.style.display = step === 1 ? 'none' : '';

  // Footer & Next button
  const nextBtn = document.getElementById('wizard-next');
  const wizardFooter = document.getElementById('wizard-footer');
  const isPageMode = wizardState.pageMode;

  if (step === 7) {
    if (wizardFooter) wizardFooter.style.display = 'none';
    // Page mode: hide the whole nav bar on confirmation
    const qpNav = document.getElementById('qp-nav');
    if (qpNav) qpNav.style.display = 'none';
  } else {
    if (wizardFooter) wizardFooter.style.display = '';
    const qpNav = document.getElementById('qp-nav');
    if (qpNav) qpNav.style.display = '';
    const isLastStep = step === wizardState.totalSteps;
    if (!isPageMode) {
      const arrowSvg = '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:var(--leaf-navy);stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>';
      if (nextBtn) nextBtn.innerHTML = (isLastStep ? 'Get My Quote ' : 'Next Step ') + arrowSvg;
    } else {
      if (nextBtn) nextBtn.textContent = isLastStep ? 'Get My Quote →' : 'Next →';
    }
  }

  // Scroll to top
  if (overlay) {
    const modal = overlay.querySelector('.wizard-modal');
    if (modal) modal.scrollTop = 0;
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function validateStep(step) {
  clearErrors();

  if (step === 1) {
    if (!document.querySelector('.location-card.selected')) {
      showError('step1-error', 'Please select your location to continue.');
      return false;
    }
    return true;
  }

  if (step === 2) {
    const firstName = document.getElementById('contact-first');
    const lastName = document.getElementById('contact-last');
    const phone = document.getElementById('contact-phone');
    const email = document.getElementById('contact-email');
    if (!firstName.value.trim() || !lastName.value.trim()) {
      showError('step2-error', 'Please enter your first and last name.');
      firstName.focus();
      return false;
    }
    if (!email.value.trim() || !isValidEmail(email.value)) {
      showError('step2-error', 'Please enter a valid email address.');
      email.focus();
      return false;
    }
    if (!phone.value.trim()) {
      showError('step2-error', 'Please enter your phone number.');
      phone.focus();
      return false;
    }
    const consentSupport  = document.getElementById('consent-support');
    const consentMarketing = document.getElementById('consent-marketing');
    const consentTerms    = document.getElementById('consent-terms');
    if (!consentSupport?.checked || !consentMarketing?.checked || !consentTerms?.checked) {
      showError('step2-error', 'Please agree to all consent boxes to continue.');
      return false;
    }
    return true;
  }

  if (step === 3) {
    if (!document.querySelector('.property-card.selected')) {
      showError('step3-error', 'Please select your property type to continue.');
      return false;
    }
    return true;
  }

  if (step === 4) {
    if (!document.querySelector('.service-radio-card.selected')) {
      showError('step4-error', 'Please select a service to continue.');
      return false;
    }
    return true;
  }

  if (step === 5) {
    if (!document.querySelector('.plan-card.selected')) {
      showError('step5-error', 'Please choose a plan to continue.');
      return false;
    }
    return true;
  }

  if (step === 6) {
    const street = document.getElementById('prop-street');
    const city = document.getElementById('prop-city');
    const zip = document.getElementById('prop-zip');

    if (!street.value.trim()) {
      showError('step6-error', 'Please enter your street address.');
      street.focus();
      return false;
    }
    if (!city.value.trim()) {
      showError('step6-error', 'Please enter your city.');
      city.focus();
      return false;
    }
    if (!zip.value.trim()) {
      showError('step6-error', 'Please enter your zip code.');
      zip.focus();
      return false;
    }
    return true;
  }

  return true;
}

function showError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.wizard-error').forEach(el => el.textContent = '');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildConfirmationSummary() {
  const summaryEl = document.getElementById('wizard-summary');
  if (!summaryEl) return;

  const locationCard = document.querySelector('.location-card.selected');
  const location = locationCard ? (locationCard.dataset.location === 'kearney' ? 'Kearney, NE' : 'Lincoln, NE') : '';

  const propertyCard = document.querySelector('.property-card.selected');
  const property = propertyCard ? propertyCard.dataset.property : '';

  const selectedSvcCard = document.querySelector('.service-radio-card.selected');
  const primarySvcName = selectedSvcCard
    ? (selectedSvcCard.querySelector('.qp-img-svc-name') || selectedSvcCard.querySelector('.qp-svc-name') || selectedSvcCard.querySelector('.service-radio-name'))?.textContent.trim() || (SVC_INFO[selectedSvcCard.dataset.service]?.name ?? selectedSvcCard.dataset.service)
    : null;
  const addOnNames = (wizardState.addOns || []).map(id => SVC_INFO[id]?.name ?? id);
  const services = primarySvcName ? [primarySvcName, ...addOnNames] : addOnNames;

  const planCard = document.querySelector('.plan-card.selected');
  const plan = planCard ? planCard.dataset.plan : '';

  const firstName = document.getElementById('contact-first')?.value || '';
  const lastName = document.getElementById('contact-last')?.value || '';
  const phone = document.getElementById('contact-phone')?.value || '';
  const email = document.getElementById('contact-email')?.value || '';
  const street = document.getElementById('prop-street')?.value || '';
  const city = document.getElementById('prop-city')?.value || '';
  const zip = document.getElementById('prop-zip')?.value || '';

  const capitalize = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const planLabels = Object.fromEntries(Object.entries(SHARK_PRICING.plans).map(([id, p]) => [id, `${p.name} membership — ${p.visits} cleanings a year, $${p.offEach} off each`]));
  const oneTime = document.getElementById('wizard-step-5')?.classList.contains('qp-plan--onetime');
  planLabels.custom = oneTime ? 'One-time cleaning' : 'Custom / one-time quote';
  const bundlePct = bundlePercent(services.length);

  const ico = {
    pin: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>',
    home: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
    spark: '<path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.6h7.6z"/>',
    tag: '<path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>',
    cal: '<path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10z"/>',
    user: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
  };
  const row = (icon, label, value) => value ? `
    <div class="qp-done-row"><span class="qp-done-ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ico[icon]}</svg></span>
      <div><small>${label}</small><div>${value}</div></div></div>` : '';
  const address = [street, [city, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');

  summaryEl.innerHTML =
    row('pin', 'Location', esc(location)) +
    row('home', 'Property', esc(capitalize(property))) +
    row('spark', 'Services', services.map(n => `<span class="qp-done-chip">${esc(n)}</span>`).join('')) +
    row('tag', 'Bundle savings', bundlePct ? `<b class="qp-done-save">${bundlePct}% off</b> your whole visit (${services.length} services)` : '') +
    row('cal', 'Plan', plan ? esc(planLabels[plan] || capitalize(plan)) : '') +
    row('pin', 'Address', esc(address)) +
    row('user', 'Contact', [firstName + ' ' + lastName, phone, email].filter(v => v.trim()).map(esc).join(' · '));

  // Phones: keep the summary folded so "what happens next" fits on screen
  const card = summaryEl.closest('details');
  if (card) card.open = !window.matchMedia('(max-width: 800px)').matches;

  // Personal touch in the heading, and a pre-filled email subject
  const title = document.getElementById('qp-done-title');
  if (title) title.innerHTML = firstName ? `You&rsquo;re all set, ${esc(firstName)}!` : 'You&rsquo;re All Set!';
  const mail = document.getElementById('qp-done-email');
  if (mail) mail.href = 'mailto:dirtysharkexterior@gmail.com?subject=' + encodeURIComponent(`Quote request — ${firstName} ${lastName}`.trim());
}


/* ==========================================================
   QUOTE PAGE — Standalone page-mode wizard
   ========================================================== */

function initPageWizard() {
  // Only runs on quote.html (body.qp, no #wizard-overlay)
  if (!document.body.classList.contains('qp')) return;

  // Mark wizard state as page mode so renderStep skips modal logic
  wizardState.pageMode = true;

  // Wire up next/back buttons (same IDs as modal wizard)
  const nextBtn = document.getElementById('wizard-next');
  const backBtn = document.getElementById('wizard-back');
  if (nextBtn) nextBtn.addEventListener('click', handleNext);
  if (backBtn) backBtn.addEventListener('click', handleBack);

  // Wire up radio-style cards (location, property, plan)
  ['.location-card', '.property-card', '.plan-card'].forEach(sel => {
    document.querySelectorAll(sel).forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll(sel).forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const rb = card.querySelector('input[type="radio"]');
        if (rb) rb.checked = true;

        // Apply location theme when location is chosen
        if (sel === '.location-card') {
          const loc = card.dataset.location;
          document.body.classList.remove('theme-kearney', 'theme-lincoln');
          if (loc) document.body.classList.add(`theme-${loc}`);
        }
      });
    });
  });

  // Wire up image service cards (Step 4) — new animated selection
  document.querySelectorAll('#svc-img-grid .service-radio-card').forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('selected')) return; // already selected
      triggerServiceSelect(card);
    });
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !card.classList.contains('selected')) {
        e.preventDefault();
        triggerServiceSelect(card);
      }
    });
  });

  // Read URL params and pre-select service / plan
  const params = new URLSearchParams(window.location.search);
  const preService = params.get('service');
  const prePlan    = params.get('plan');
  const preProperty = params.get('property');
  if (preProperty) wizardState.preselectedProperty = preProperty.toLowerCase();

  if (preService) wizardState.preselectedService = preService;
  if (prePlan)    wizardState.preselectedPlan    = prePlan.toLowerCase();

  // Start at step 1
  renderStep(1);

  // Pre-select the city when arriving from a Lincoln or Kearney page
  const preLocation = (params.get('location') || '').toLowerCase();
  const locCard = preLocation && document.querySelector(`.location-card[data-location="${preLocation}"]`);
  if (locCard) locCard.click();
}


/* ==========================================================
   SERVICE SELECTION — Step 4 animation + add-ons
   ========================================================== */

/**
 * Animate a service card to "selected" state:
 * fade out all others, keep the winner centered, show add-ons.
 */
function triggerServiceSelect(card) {
  const grid = document.getElementById('svc-img-grid');
  if (!grid || grid.dataset.busy) return;
  grid.dataset.busy = '1';

  const allCards = Array.from(grid.querySelectorAll('.qp-img-svc-card'));
  const others = allCards.filter(c => c !== card);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Phase 1 — the other cards gently fade and shrink away
  others.forEach(c => c.classList.add('svc-fade-out'));

  setTimeout(() => {
    // Phase 2 — FLIP: remember where the chosen card is, collapse the grid,
    // then glide the card from its old spot into its new centred position.
    const first = card.getBoundingClientRect();
    others.forEach(c => { c.style.display = 'none'; });
    card.classList.add('selected');
    grid.classList.add('service-selected');
    const last = card.getBoundingClientRect();

    if (!reduce) {
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      const sx = first.width / last.width;
      const sy = first.height / last.height;
      card.style.transition = 'none';
      card.style.transformOrigin = 'top left';
      card.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
      card.getBoundingClientRect(); // commit the starting position
      requestAnimationFrame(() => {
        card.style.transition = 'transform .6s cubic-bezier(.22, 1, .36, 1)';
        card.style.transform = '';
      });
      setTimeout(() => { card.style.transition = ''; card.style.transformOrigin = ''; }, 650);
    }

    // "Change service" pill on the selected card
    if (!card.querySelector('.qp-svc-change-btn')) {
      const changeBtn = document.createElement('button');
      changeBtn.type = 'button';
      changeBtn.className = 'qp-svc-change-btn';
      changeBtn.textContent = '✕ Change';
      changeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetServiceGrid();
        sxScrollTo(document.getElementById('wizard-step-4'), -80);
      });
      card.appendChild(changeBtn);
    }

    showAddOns(card.dataset.service);
    document.getElementById('wizard-step-4')?.classList.add('is-picked');
    const panel = document.getElementById('addons-panel');
    if (panel && !panel.hidden) {
      panel.classList.remove('qp-panel-in');
      void panel.offsetWidth;
      panel.classList.add('qp-panel-in');
    }
    delete grid.dataset.busy;

    // Everything now fits on one screen, so just make sure we're at the top
    setTimeout(() => sxScrollTo(document.body, 0), 150);
  }, reduce ? 0 : 340);
}

/** Smooth scroll that plays nicely with the site's Lenis smooth scrolling. */
function sxScrollTo(el, offset) {
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY + (offset || 0);
  if (window.__sxLenis) window.__sxLenis.scrollTo(y, { duration: 1.1 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

/**
 * Reset Step 4 grid back to showing all cards (e.g. user hits "Change").
 */
function resetServiceGrid() {
  const grid = document.getElementById('svc-img-grid');
  if (!grid) return;
  delete grid.dataset.busy;

  grid.querySelectorAll('.qp-img-svc-card').forEach((c, i) => {
    c.style.display = '';
    c.style.transform = '';
    c.classList.remove('selected', 'svc-fade-out');
    const btn = c.querySelector('.qp-svc-change-btn');
    if (btn) btn.remove();
    // Cards float back in one after another
    c.classList.remove('svc-return');
    void c.offsetWidth;
    c.style.setProperty('--i', i);
    c.classList.add('svc-return');
  });
  grid.classList.remove('service-selected');
  document.getElementById('wizard-step-4')?.classList.remove('is-picked');

  // Hide add-ons panel and clear state
  const addonsPanel = document.getElementById('addons-panel');
  if (addonsPanel) addonsPanel.hidden = true;
  wizardState.addOns = [];
  if (typeof updateSavingsChip === 'function') setTimeout(updateSavingsChip, 0);
}

/**
 * Build and show the add-ons panel for the given primary service.
 */
function showAddOns(serviceId) {
  const panel = document.getElementById('addons-panel');
  const gridEl = document.getElementById('addons-grid');
  if (!panel || !gridEl) return;

  const relatedIds = (SVC_ADDONS[serviceId] || []).filter(id => SVC_INFO[id]);
  if (relatedIds.length === 0) {
    panel.hidden = true;
    return;
  }

  gridEl.innerHTML = '';
  const checkSvg = `<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
  const plusSvg = `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`;
  const cards = [];

  const tiers = SHARK_PRICING.bundleTiers;
  const maxPct = tiers[tiers.length - 1].percent;

  // Savings ladder — one rung per service count, lights up as services are added
  const meter = document.createElement('div');
  meter.className = 'qp-ladder';
  const rungs = [{ services: 1, percent: 0 }, ...tiers];
  meter.innerHTML = `
    <div class="qp-ladder-rungs">
      ${rungs.map(t => `<div class="qp-ladder-rung" data-n="${t.services}"><b>${t.percent ? t.percent + '%' : '—'}</b><small>${t.services} service${t.services > 1 ? 's' : ''}</small></div>`).join('')}
    </div>
    <p class="qp-ladder-msg" aria-live="polite"></p>`;
  gridEl.appendChild(meter);

  const list = document.createElement('div');
  list.className = 'qp-addon-list';
  gridEl.appendChild(list);

  // One tap adds every suggested service to the same visit
  const bundle = document.createElement('button');
  bundle.type = 'button';
  bundle.className = 'qp-addon-bundle qp-combo';
  bundle.innerHTML = `
    <span class="qp-combo-thumbs" aria-hidden="true">${[serviceId, ...relatedIds].filter(id => SVC_INFO[id]).map(id => `<i style="background-image:url('${SVC_INFO[id].img}')"></i>`).join('')}</span>
    <span class="qp-combo-text"><strong>The full clean</strong><small>All ${1 + relatedIds.length} services &middot; save ${bundlePercent(1 + relatedIds.length)}% on the whole visit</small></span>
    <span class="qp-combo-btn">Add all</span>`;

  const syncBundle = () => {
    const all = relatedIds.every(id => wizardState.addOns.includes(id));
    bundle.classList.toggle('selected', all);
    bundle.querySelector('.qp-combo-btn').textContent = all ? 'Added ✓' : 'Add all';

    const count = 1 + wizardState.addOns.length;
    const pct = bundlePercent(count);
    const next = tiers.find(t => t.services > count);
    meter.querySelectorAll('.qp-ladder-rung').forEach(r => {
      const n = Number(r.dataset.n);
      r.classList.toggle('is-reached', n <= count);
      r.classList.toggle('is-current', n === Math.min(count, rungs[rungs.length - 1].services));
    });
    meter.querySelector('.qp-ladder-msg').innerHTML = next
      ? (pct ? `You're saving <b>${pct}%</b> on the whole visit. ` : '') + `Add ${next.services - count} more to save <b>${next.percent}%</b>.`
      : `Best deal unlocked: <b>${pct}% off</b> your whole visit.`;
    meter.classList.toggle('is-max', pct === maxPct);
    cards.forEach(([cid, c]) => {
      const on = wizardState.addOns.includes(cid);
      const gain = bundlePercent(count + 1);
      c.querySelector('[data-addon-hint]').textContent = on
        ? 'Added to your visit'
        : (gain > pct ? `Add it & save ${gain}% on everything` : 'Add to the same visit');
      c.querySelector('.qp-addon-toggle').innerHTML = on ? `${checkSvg}<span>Added</span>` : `${plusSvg}<span>Add</span>`;
    });
    updateSavingsChip();
    meter.classList.toggle('is-bump', true);
    setTimeout(() => meter.classList.remove('is-bump'), 450);
  };

  const setAddon = (id, card, on) => {
    const idx = wizardState.addOns.indexOf(id);
    if (on && idx === -1) wizardState.addOns.push(id);
    if (!on && idx !== -1) wizardState.addOns.splice(idx, 1);
    card.classList.toggle('selected', on);
    card.setAttribute('aria-pressed', String(on));
    if (on) { card.classList.remove('is-pop'); void card.offsetWidth; card.classList.add('is-pop'); }
  };

  relatedIds.forEach((id, i) => {
    const info = SVC_INFO[id];
    const isActive = wizardState.addOns.includes(id);
    const card = document.createElement('div');
    card.className = 'qp-addon-card qp-addon-row' + (isActive ? ' selected' : '');
    card.dataset.addon = id;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', String(isActive));
    card.innerHTML = `
      <span class="qp-addon-thumb" style="background-image:url('${info.img}')"></span>
      <span class="qp-addon-content">
        <span class="qp-addon-name">${info.name}${i === 0 ? ' <em>Popular</em>' : ''}</span>
        <span class="qp-addon-hint" data-addon-hint></span>
      </span>
      <span class="qp-addon-toggle"></span>`;

    const toggle = () => { setAddon(id, card, !wizardState.addOns.includes(id)); syncBundle(); };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    cards.push([id, card]);
    list.appendChild(card);
  });
  if (relatedIds.length > 1) list.appendChild(bundle);

  bundle.addEventListener('click', () => {
    const all = relatedIds.every(id => wizardState.addOns.includes(id));
    cards.forEach(([id, card]) => setAddon(id, card, !all));
    syncBundle();
  });
  syncBundle();

  panel.hidden = false;
}

/**
 * "Add one more service & save" pop-up, shown once when leaving the
 * services step if another bundle tier is within reach.
 * Returns true when the pop-up was opened (it calls onDone to continue).
 */
let bundlePopupShown = false;
function offerBundlePopup(onDone) {
  if (bundlePopupShown) return false;
  const mainSvc = document.querySelector('.service-radio-card.selected')?.dataset.service;
  if (!mainSvc) return false;
  const tiers = SHARK_PRICING.bundleTiers;
  const count = 1 + wizardState.addOns.length;
  const next = tiers.find(t => t.services > count);
  const options = (SVC_ADDONS[mainSvc] || []).filter(id => SVC_INFO[id] && !wizardState.addOns.includes(id));
  if (!next || !options.length) return false;
  bundlePopupShown = true;

  const picked = new Set();
  const pop = document.createElement('div');
  pop.className = 'qp-bundle-pop';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-modal', 'true');
  pop.setAttribute('aria-labelledby', 'qp-bundle-pop-title');
  pop.innerHTML = `
    <div class="qp-bundle-pop-card">
      <button type="button" class="qp-bundle-pop-x" aria-label="Close">&times;</button>
      <span class="qp-bundle-pop-badge">${next.percent}% off</span>
      <h3 id="qp-bundle-pop-title">Add ${next.services - count === 1 ? 'one more service' : `${next.services - count} more services`}, save ${next.percent}%</h3>
      <p class="qp-bundle-pop-sub">We're already coming out &mdash; add to the same visit and save on the <b>whole visit</b>.</p>
      <div class="qp-bundle-pop-list">
        ${options.map(id => `
          <button type="button" class="qp-bundle-pop-opt" data-id="${id}" aria-pressed="false">
            <span class="qp-bundle-pop-thumb" style="background-image:url('${SVC_INFO[id].img}')"></span>
            <span class="qp-bundle-pop-text"><b>${SVC_INFO[id].name}</b><small>${SVC_INFO[id].desc || ''}</small></span>
            <span class="qp-bundle-pop-add">Add</span>
          </button>`).join('')}
      </div>
      <p class="qp-bundle-pop-status" aria-live="polite"></p>
      <div class="qp-bundle-pop-actions">
        <button type="button" class="qp-bundle-pop-skip">No thanks</button>
        <button type="button" class="qp-bundle-pop-go" disabled>Add &amp; continue &rarr;</button>
      </div>
    </div>`;
  document.body.appendChild(pop);
  requestAnimationFrame(() => pop.classList.add('is-open'));

  const status = pop.querySelector('.qp-bundle-pop-status');
  const go = pop.querySelector('.qp-bundle-pop-go');
  const refresh = () => {
    const pct = bundlePercent(count + picked.size);
    go.disabled = picked.size === 0;
    status.innerHTML = picked.size ? `You'll save <b>${pct}%</b> on your whole visit` : '';
  };
  const close = (cont) => {
    pop.classList.remove('is-open');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => pop.remove(), 300);
    if (cont) onDone();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(false); };
  document.addEventListener('keydown', onKey);

  pop.querySelectorAll('.qp-bundle-pop-opt').forEach(opt => opt.addEventListener('click', () => {
    const id = opt.dataset.id;
    if (picked.has(id)) picked.delete(id); else picked.add(id);
    const on = picked.has(id);
    opt.classList.toggle('selected', on);
    opt.setAttribute('aria-pressed', String(on));
    opt.querySelector('.qp-bundle-pop-add').textContent = on ? 'Added ✓' : 'Add';
    refresh();
  }));
  pop.querySelector('.qp-bundle-pop-x').addEventListener('click', () => close(false));
  pop.addEventListener('click', (e) => { if (e.target === pop) close(false); });
  pop.querySelector('.qp-bundle-pop-skip').addEventListener('click', () => {
    sxTrack('bundle_popup', { action: 'skip' });
    close(true);
  });
  go.addEventListener('click', () => {
    picked.forEach(id => { if (!wizardState.addOns.includes(id)) wizardState.addOns.push(id); });
    sxTrack('bundle_popup', { action: 'add', added: picked.size });
    showAddOns(mainSvc); // keep the add-on panel in sync if they come back
    close(true);
  });
  setTimeout(() => pop.querySelector('.qp-bundle-pop-opt')?.focus(), 350);
  return true;
}

/**
 * Small "you're saving X%" chip beside Back / Next so the bundle
 * discount stays visible while moving through the form.
 */
function updateSavingsChip() {
  const chip = document.getElementById('qp-savings-chip');
  if (!chip) return;
  const hasService = !!document.querySelector('#svc-img-grid.service-selected');
  const panel = document.getElementById('addons-panel');
  if (!hasService || !panel || panel.hidden || wizardState.currentStep < 4 || wizardState.currentStep > 6) {
    chip.hidden = true;
    return;
  }
  const count = 1 + wizardState.addOns.length;
  const pct = bundlePercent(count);
  const next = SHARK_PRICING.bundleTiers.find(t => t.services > count);
  chip.hidden = false;
  chip.classList.toggle('is-saving', pct > 0);
  chip.innerHTML = pct > 0
    ? `<b>${pct}% off</b> your whole visit`
    : `Add ${next.services - count} more service → <b>${next.percent}% off</b>`;
}

/**
 * Show the plans that fit the chosen property type and pre-select a plan
 * passed in the URL (e.g. quote.html?plan=quarterly).
 */
function preparePlanStep() {
  const property = document.querySelector('.property-card.selected')?.dataset.property || 'residential';
  const cards = document.querySelectorAll('#wizard-step-5 .plan-card');
  cards.forEach(card => {
    const fits = (card.dataset.for || '').split(' ').includes(property);
    card.hidden = !fits;
    if (!fits && card.classList.contains('selected')) {
      card.classList.remove('selected');
      const rb = card.querySelector('input'); if (rb) rb.checked = false;
    }
  });

  // Fill in the yearly breakdown on each plan card from SHARK_PRICING
  cards.forEach(card => {
    const plan = SHARK_PRICING.plans[card.dataset.plan];
    const box = card.querySelector('[data-example]');
    if (!plan || !box) return;
    const ex = SHARK_PRICING.examplePrice;
    const regular = plan.visits * ex;
    const fmt = n => '$' + n.toLocaleString('en-US');
    box.innerHTML = `<span>${plan.visits} cleanings at ${fmt(ex)}</span><s>${fmt(regular)}</s><b>${fmt(regular - planSavings(card.dataset.plan))}</b><small>Example — your price depends on your home</small>`;
  });

  // Memberships are for window cleaning (and commercial). A home booking only
  // non-window services (pressure washing, gutters, lights...) gets a one-time quote.
  const step5 = document.getElementById('wizard-step-5');
  const mainSvc = document.querySelector('.service-radio-card.selected')?.dataset.service;
  const picked = [mainSvc, ...wizardState.addOns];
  const oneTimeOnly = property === 'residential' && !!mainSvc && !picked.some(id => WINDOW_SERVICES.includes(id));
  const title = step5.querySelector('.qp-title');
  const sub = step5.querySelector('.qp-subtitle');
  const customCard = step5.querySelector('.plan-card[data-plan="custom"]');
  const customLabel = customCard?.querySelector('.qp-plan-custom-label');
  const customPill = customCard?.querySelector('.qp-plan-custom-pill');
  [title, sub, customLabel, customPill].forEach(el => { if (el && el.dataset.orig == null) el.dataset.orig = el.innerHTML; });
  step5.classList.toggle('qp-plan--onetime', oneTimeOnly);
  if (oneTimeOnly) {
    const svcName = SVC_INFO[mainSvc]?.name || 'This service';
    const lights = mainSvc === 'christmas-lights';
    cards.forEach(card => { if (card.dataset.plan !== 'custom') { card.hidden = true; card.classList.remove('selected'); const rb = card.querySelector('input'); if (rb) rb.checked = false; } });
    title.textContent = lights ? 'Your Holiday Lighting Quote' : 'One-Time Cleaning';
    sub.innerHTML = lights
      ? 'We design, install, take down and store your lights &mdash; every display is quoted per project.'
      : `${svcName} is booked one visit at a time &mdash; no membership needed. Add window cleaning to your visit to unlock our memberships.`;
    customLabel.textContent = lights ? 'Holiday lighting — install, takedown & storage' : `${svcName} — single visit`;
    customPill.textContent = lights ? 'Project quote' : 'One-time quote';
    if (!customCard.classList.contains('selected')) customCard.click();
    wizardState.preselectedPlan = null;
  } else {
    [title, sub, customLabel, customPill].forEach(el => { if (el) el.innerHTML = el.dataset.orig; });
  }

  const customDesc = document.querySelector('#wizard-step-5 [data-custom-desc]');
  if (customDesc) {
    customDesc.textContent = property === 'commercial'
      ? 'Need bi-annual visits, a one-time clean or a schedule built around your business? We\'ll put together a custom quote.'
      : 'Want monthly service, a one-time clean or something built around your home? We\'ll put together a custom quote.';
  }

  if (!wizardState.preselectedPlan && !document.querySelector('#wizard-step-5 .plan-card.selected:not([hidden])')) {
    wizardState.preselectedPlan = 'quarterly';
  }
  if (wizardState.preselectedPlan) {
    const wanted = wizardState.preselectedPlan.replace('-', '');
    const match = Array.from(cards).find(c => !c.hidden && c.dataset.plan === wanted)
      || (wanted === 'onetime' || wanted === 'monthly' || wanted === 'biannual'
        ? Array.from(cards).find(c => !c.hidden && c.dataset.plan === 'custom') : null);
    if (match) match.click();
    wizardState.preselectedPlan = null;
  }
}

/**
 * Inject (or update) the selected-services pill above the plan grid on Step 5.
 */
function injectPlanServiceSummary() {
  const step5 = document.getElementById('wizard-step-5');
  if (!step5) return;

  const svcCard = document.querySelector('.service-radio-card.selected');
  if (!svcCard) return;

  const primaryName = (svcCard.querySelector('.qp-img-svc-name') || svcCard.querySelector('.qp-svc-name'))?.textContent.trim()
    || SVC_INFO[svcCard.dataset.service]?.name
    || svcCard.dataset.service;

  const addOnNames = (wizardState.addOns || []).map(id => SVC_INFO[id]?.name ?? id);
  const allLines = [primaryName, ...addOnNames];

  // Remove existing summary if any
  const existing = step5.querySelector('.qp-plan-svc-summary');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.className = 'qp-plan-svc-summary';
  div.innerHTML = `<strong>Your selection:</strong> ${allLines.join(' + ')}`;
  step5.insertBefore(div, step5.querySelector('.qp-plan-grid'));
}

/* ==========================================================
   SHARE REVIEW SECTION — Enhance with stars + headline
   ========================================================== */

function enhanceShareReview() {
  document.querySelectorAll('.share-review-wrap').forEach(wrap => {
    // Inject star row at the top
    const starsRow = document.createElement('div');
    starsRow.className = 'share-review-stars';
    const starSVG = `<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    starsRow.innerHTML = starSVG.repeat(5);
    wrap.insertBefore(starsRow, wrap.firstChild);

    // Inject headline
    const headline = document.createElement('p');
    headline.className = 'share-review-headline';
    headline.textContent = 'Loving the results?';
    wrap.insertBefore(headline, wrap.querySelector('p:not(.share-review-headline)'));

    // Remove emoji from button text (leaves clean label)
    const btn = wrap.querySelector('.share-review-btn');
    if (btn) {
      btn.textContent = btn.textContent.replace(/⭐\s*/g, '').trim();
    }
  });
}

/* ---------------------------------------------------
   FAQ — pop-in on scroll (blue/orange numbers via CSS)
   --------------------------------------------------- */
function initFaqPopIn() {
  const items = document.querySelectorAll('.faq-list--open .faq-item');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

  items.forEach((item) => observer.observe(item));
}


/* ==========================================================
   ADMIN TEST MODE — type "leafcleaning18" anywhere
   ========================================================== */

function initAdminTestMode() {
  // Tiny trigger button in bottom-left (only on quote page)
  const triggerBtn = document.getElementById('admin-trigger');
  if (triggerBtn) {
    triggerBtn.addEventListener('click', promptAdminCode);
  }

  // Also activate by typing the passphrase anywhere on page
  let keyBuffer = '';
  document.addEventListener('keydown', e => {
    // Don't capture while typing in inputs
    if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
    keyBuffer += e.key.toLowerCase();
    if (keyBuffer.includes('leafcleaning18')) {
      keyBuffer = '';
      activateTestMode();
    }
    if (keyBuffer.length > 30) keyBuffer = keyBuffer.slice(-30);
  });
}

function promptAdminCode() {
  const code = window.prompt('Enter admin code:');
  if (code && code.toLowerCase() === 'leafcleaning18') {
    activateTestMode();
  } else if (code !== null) {
    alert('Incorrect code.');
  }
}

function activateTestMode() {
  if (document.getElementById('admin-test-banner')) return; // already active

  // Show banner
  const banner = document.createElement('div');
  banner.id = 'admin-test-banner';
  banner.className = 'admin-test-banner';
  banner.textContent = '🧪 TEST MODE ACTIVE';
  document.body.appendChild(banner);

  // Fill all wizard fields with fake test data
  const fill = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  fill('contact-first', 'Test');
  fill('contact-last',  'User');
  fill('contact-email', 'test@leafcleaning.com');
  fill('contact-phone', '(402) 555-0000');
  fill('contact-heard', 'google');
  fill('contact-promo', 'TEST2025');
  fill('prop-street',   '123 Test Street');
  fill('prop-city',     'Kearney');
  fill('prop-zip',      '68847');
  fill('prop-notes',    'This is a test submission — please ignore.');

  // Check all consent boxes
  ['consent-sms-alerts','consent-sms-promo','consent-marketing','consent-privacy']
    .forEach(id => { const el = document.getElementById(id); if (el) el.checked = true; });

  // Select location: Kearney
  const locationCard = document.querySelector('[data-location="kearney"]');
  if (locationCard) {
    document.querySelectorAll('.location-card').forEach(c => c.classList.remove('selected'));
    locationCard.classList.add('selected');
    const rb = locationCard.querySelector('input');
    if (rb) rb.checked = true;
  }

  // Select property: residential
  const propCard = document.querySelector('[data-property="residential"]');
  if (propCard) {
    document.querySelectorAll('.property-card').forEach(c => c.classList.remove('selected'));
    propCard.classList.add('selected');
    const rb = propCard.querySelector('input');
    if (rb) rb.checked = true;
  }

  // Select service: exterior-windows
  const svcCard = document.querySelector('[data-service="exterior-windows"]');
  if (svcCard) {
    svcCard.classList.add('selected');
    const cb = svcCard.querySelector('input');
    if (cb) cb.checked = true;
  }

  // Select plan: quarterly
  const planCard = document.querySelector('[data-plan="quarterly"]');
  if (planCard) {
    document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
    planCard.classList.add('selected');
    const rb = planCard.querySelector('input');
    if (rb) rb.checked = true;
  }

  // Add floating "Submit Test" button
  const submitBtn = document.createElement('button');
  submitBtn.textContent = '🧪 Submit Test Booking';
  submitBtn.style.cssText = [
    'position:fixed', 'bottom:60px', 'right:20px',
    'background:#f59e0b', 'color:#1a1a1a', 'border:none',
    'padding:12px 22px', 'border-radius:999px', 'font-weight:800',
    'font-size:0.9rem', 'cursor:pointer', 'z-index:99999',
    'box-shadow:0 4px 20px rgba(0,0,0,0.25)', 'font-family:sans-serif',
  ].join(';');
  submitBtn.onclick = () => {
    buildConfirmationSummary();
    submitQuoteNotification();
    renderStep(7);
    submitBtn.remove();
  };
  document.body.appendChild(submitBtn);

  console.info('[Shark Admin] Test mode active — fields pre-filled, click the yellow button to submit.');
}


/* ==========================================================
   QUOTE NOTIFICATIONS — Email + SMS via EmailJS
   ========================================================== */

function loadEmailJS(callback) {
  if (window.emailjs) {
    callback();
    return;
  }
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  s.onload = () => {
    emailjs.init(LEAF_NOTIFY.public_key);
    callback();
  };
  s.onerror = () => console.warn('[Shark] Failed to load EmailJS SDK');
  document.head.appendChild(s);
}

function collectQuoteData() {
  const locationCard = document.querySelector('.location-card.selected');
  const location = locationCard
    ? (locationCard.dataset.location === 'kearney' ? 'Kearney, NE' : 'Lincoln, NE')
    : 'Not specified';

  const propertyCard = document.querySelector('.property-card.selected');
  const property = propertyCard
    ? (propertyCard.dataset.property === 'residential' ? 'Residential' : 'Commercial')
    : 'Not specified';

  const svcCard = document.querySelector('.service-radio-card.selected');
  const primarySvc = svcCard
    ? (svcCard.querySelector('.qp-img-svc-name') || svcCard.querySelector('.qp-svc-name') || svcCard.querySelector('.service-radio-name'))?.textContent.trim() || (SVC_INFO[svcCard.dataset.service]?.name ?? svcCard.dataset.service)
    : null;
  const addOnNames = (wizardState.addOns || []).map(id => SVC_INFO[id]?.name ?? id);
  const allServices = [primarySvc, ...addOnNames].filter(Boolean);
  const services = allServices.length ? allServices.join(', ') : 'Not specified';
  const addonsLine = addOnNames.length ? addOnNames.join(', ') : 'None';
  const bundlePct = bundlePercent(allServices.length);
  const bundleLine = bundlePct ? `${bundlePct}% off whole visit (${allServices.length} services bundled)` : 'None';

  const planCard = document.querySelector('.plan-card.selected');
  const planMap = Object.fromEntries(Object.entries(SHARK_PRICING.plans).map(([id, p]) =>
    [id, `${p.name} membership — ${p.visits} cleanings/yr, $${p.offEach} off each (saves $${planSavings(id)}/yr)`]));
  planMap.custom = 'Custom / One-Time Quote';
  planMap['one-time'] = 'One-Time Visit';
  let plan = planCard ? (planMap[planCard.dataset.plan] || planCard.dataset.plan) : 'Not specified';
  if (planCard && SHARK_PRICING.plans[planCard.dataset.plan]) plan += ' — paid upfront';

  const firstName  = document.getElementById('contact-first')?.value.trim()  || '';
  const lastName   = document.getElementById('contact-last')?.value.trim()   || '';
  const phone      = document.getElementById('contact-phone')?.value.trim()  || '';
  const email      = document.getElementById('contact-email')?.value.trim()  || '';
  const street     = document.getElementById('prop-street')?.value.trim()    || '';
  const city       = document.getElementById('prop-city')?.value.trim()      || '';
  const zip        = document.getElementById('prop-zip')?.value.trim()       || '';
  const notes      = document.getElementById('prop-notes')?.value.trim()     || 'None';

  const now = new Date();
  const submittedAt = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown';
  const addressFull = [street, city ? `${city}, NE` : '', zip].filter(Boolean).join(' ');

  const message = [
    `=== NEW QUOTE REQUEST ===`,
    `Submitted: ${submittedAt}`,
    ``,
    `--- CONTACT ---`,
    `Name:    ${fullName}`,
    `Email:   ${email || 'Not provided'}`,
    `Phone:   ${phone || 'Not provided'}`,
    ``,
    `--- JOB DETAILS ---`,
    `Location:  ${location}`,
    `Property:  ${property}`,
    `Service:   ${services}`,
    `Add-ons:   ${addonsLine}`,
    `Bundle:    ${bundleLine}`,
    `Plan:      ${plan}`,
    `Source:    ${sxAttribution()}`,
    ``,
    `--- ADDRESS ---`,
    `${addressFull || 'Not provided'}`,
    ``,
    `--- NOTES ---`,
    `${notes}`,
  ].join('\n');

  return {
    // Contact
    customer_name:    fullName,
    first_name:       firstName,
    customer_email:   email,
    customer_phone:   phone,
    // Job details
    location,
    property_type:    property,
    services:         services,
    addons:           addonsLine,
    bundle:           bundleLine,
    plan:             plan,
    lead_source:      sxAttribution(),
    // Address
    street_address:   street,
    city_state_zip:   `${city}, NE ${zip}`,
    special_notes:    notes,
    // Full formatted message (use {{message}} in EmailJS template)
    message,
    // Meta
    subject:          '🌿 New Quote Request',
    submitted_at:     submittedAt,
    to_email:         LEAF_NOTIFY.owner_email,
    reply_to:         email,
  };
}

function submitQuoteNotification() {
  // Skip if EmailJS hasn't been configured yet
  if (!LEAF_NOTIFY.public_key || LEAF_NOTIFY.public_key === 'YOUR_EMAILJS_PUBLIC_KEY') {
    console.info('[Shark] EmailJS not configured — skipping notification');
    return;
  }

  const data = collectQuoteData();

  loadEmailJS(() => {
    // ── Owner email (single send — all data in {{message}}) ──
    emailjs.send(LEAF_NOTIFY.service_id, LEAF_NOTIFY.template_id, data)
      .then(() => {
        console.info('[Shark] Owner email sent ✓');
        sxTrack('generate_lead', {
          form_name: 'quote_form',
          location: data.location,
          property_type: data.property_type,
          service: data.services,
          plan: data.plan.split(' —')[0],
          bundle: data.bundle,
        });
      })
      .catch(err => console.warn('[Shark] Owner email failed:', err));
  });
}

/* ==========================================================
   EMAILJS SETUP INSTRUCTIONS
   ===========================================================

   STEP 1 — Create your free EmailJS account
   → Go to https://www.emailjs.com and sign up (free = 200 emails/month)

   STEP 2 — Connect your Gmail
   → Dashboard → Email Services → Add New Service → Gmail
   → Sign in with your Gmail → copy the Service ID it gives you
   → Paste it as: service_id: 'service_xxxxxxx'

   STEP 3 — Create your email template
   → Dashboard → Email Templates → Create New Template
   → Set "To Email": {{to_email}}
   → Set "Reply To": {{reply_to}}
   → Set "Subject":  🌿 New Quote Request — {{customer_name}}
   → Paste this into the Body (HTML or text):

   ─────────────────────────────────────────
   NEW QUOTE REQUEST — Shark Exterior
   Submitted: {{submitted_at}}

   CUSTOMER
   Name:    {{customer_name}}
   Email:   {{customer_email}}
   Phone:   {{customer_phone}}
   Heard:   {{heard_from}}
   Promo:   {{promo_code}}

   JOB DETAILS
   Location:  {{location}}
   Property:  {{property_type}}
   Services:  {{services}}
   Plan:      {{plan}}

   ADDRESS
   {{street_address}}
   {{city_state_zip}}

   NOTES
   {{special_notes}}

   CONSENTS
   SMS Alerts:  {{consent_sms}}
   Promo SMS:   {{consent_promo}}
   ─────────────────────────────────────────

   → Save → copy the Template ID
   → Paste as: template_id: 'template_xxxxxxx'

   STEP 4 — Get your Public Key
   → Dashboard → Account → API Keys → Public Key
   → Paste as: public_key: 'xxxxxxxxxxxxxxx'

   STEP 5 — Set your email & SMS gateway
   → Set owner_email to your Gmail address
   → Find your phone carrier's SMS email gateway:
       Verizon:  YOUR_NUMBER@vtext.com
       AT&T:     YOUR_NUMBER@txt.att.net
       T-Mobile: YOUR_NUMBER@tmomail.net
       Sprint:   YOUR_NUMBER@messaging.sprintpcs.com
   → Paste as: sms_gateway: '4023090128@vtext.com'

   STEP 6 — Gmail auto-label (one-time, 2 minutes)
   → In Gmail → Settings (gear) → See all settings
   → Filters and Blocked Addresses → Create a new filter
   → In "Subject" box type:  New Quote Request — Shark Exterior
   → Click "Create filter"
   → Check "Apply the label" → New label → name it "Shark Quotes"
   → Check "Also apply filter to matching conversations"
   → Click "Create filter"
   → Every new booking email will auto-land in that label!

   ========================================================== */

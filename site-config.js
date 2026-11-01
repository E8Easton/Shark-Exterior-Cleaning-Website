/* ==========================================================
   SHARK EXTERIORS — Live company facts from the Admin Hub
   ----------------------------------------------------------
   The CRM's Admin Hub is the one place the phone number, membership
   savings, bundle savings, guarantees, Terms and Privacy Policy are
   written. This file reads them on every page load and updates the page,
   so a change there shows up here without editing the website.

   The HTML keeps today's values (BAKED below) so the site still works,
   and search engines still see real numbers, if the CRM can't be reached.
   Nothing on the page changes unless the Admin Hub value is different.
   ========================================================== */
(function () {
  'use strict';

  var ENDPOINT = 'https://bpvvzipsnbrxyarnncnx.supabase.co/rest/v1/rpc/public_rulebook';
  // Publishable key: safe in the browser, it can only call public functions like this one.
  var KEY = 'sb_publishable_94BBzgMEvRCDHyyg9ayHcA_xUXHVBEL';
  var CACHE = 'sx_rulebook_v1';

  // What the static pages were written with.
  var BAKED = {
    phone: '(402) 309-0128',
    email: 'dirtysharkexterior@gmail.com',
    plans: { monthly: { visits: 12, offEach: 150 }, quarterly: { visits: 4, offEach: 100 }, biannual: { visits: 2, offEach: 50 } },
    bundleTiers: [{ services: 2, percent: 10 }, { services: 3, percent: 15 }, { services: 4, percent: 20 }],
    guarantees: { rainDays: 7, redoHours: 48 },
  };

  var live = null;
  try { live = JSON.parse(localStorage.getItem(CACHE) || 'null'); } catch (e) { /* storage blocked */ }
  // script.js merges this into SHARK_PRICING as it starts, so the quote form uses the latest numbers.
  window.SX_LIVE = live && live.facts ? live : null;

  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function num(v, d) { return typeof v === 'number' && isFinite(v) && v >= 0 ? v : d; }

  function factsOf(data) {
    var f = (data && data.facts) || {};
    var b = f.business || {};
    var plans = {};
    ['monthly', 'quarterly', 'biannual'].forEach(function (k) {
      var p = (f.plans || {})[k] || {};
      plans[k] = { visits: num(p.visits, BAKED.plans[k].visits), offEach: num(p.offEach, BAKED.plans[k].offEach) };
    });
    var tiers = Array.isArray(f.bundleTiers) && f.bundleTiers.length ? f.bundleTiers : BAKED.bundleTiers;
    return {
      phone: b.phone || BAKED.phone,
      email: b.email || BAKED.email,
      hours: b.hours || '',
      plans: plans,
      bundleTiers: tiers,
      examplePrice: num(f.examplePrice, 300),
      rainDays: num((f.guarantees || {}).rainDays, BAKED.guarantees.rainDays),
      redoHours: num((f.guarantees || {}).redoHours, BAKED.guarantees.redoHours),
      noticeHours: num((f.booking || {}).noticeHours, 24),
      lateFee: num((f.booking || {}).lateFee, 50),
      termMonths: num((f.membership || {}).termMonths, 12),
      cancelNoticeDays: num((f.membership || {}).cancelNoticeDays, 30),
    };
  }

  // ---- Swap baked text for live text, only where it differs -------------------------------
  function eachText(root, fn) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName;
        return p === 'SCRIPT' || p === 'STYLE' || p === 'NOSCRIPT' ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      },
    });
    var list = [];
    while (walker.nextNode()) list.push(walker.currentNode);
    list.forEach(fn);
  }

  function swapEverywhere(pairs) {
    if (!pairs.length) return;
    eachText(document.body, function (n) {
      var t = n.nodeValue, next = t;
      pairs.forEach(function (p) { next = next.replace(p[0], p[1]); });
      if (next !== t) n.nodeValue = next;
    });
  }

  function applyContact(f) {
    var pairs = [];
    if (f.phone !== BAKED.phone) {
      var oldDigits = digits(BAKED.phone), newDigits = digits(f.phone);
      pairs.push([new RegExp(BAKED.phone.replace(/[()]/g, '\\$&'), 'g'), f.phone]);
      document.querySelectorAll('a[href^="tel:"], a[href^="sms:"]').forEach(function (a) {
        var href = a.getAttribute('href');
        if (digits(href).slice(-10) === oldDigits) a.setAttribute('href', href.replace(/[\d+\-().\s]+/, (href.indexOf('+1') >= 0 ? '+1' : '') + newDigits));
      });
    }
    if (f.email !== BAKED.email) {
      pairs.push([new RegExp(BAKED.email.replace(/\./g, '\\.'), 'g'), f.email]);
      document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
        a.setAttribute('href', a.getAttribute('href').replace(BAKED.email, f.email));
      });
    }
    swapEverywhere(pairs);
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) {
      var t = s.textContent, next = t;
      if (f.phone !== BAKED.phone) next = next.split('+1-402-309-0128').join('+1-' + digits(f.phone).replace(/^1?(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3'));
      pairs.forEach(function (p) { next = next.replace(p[0], p[1]); });
      if (next !== t) s.textContent = next;
    });
  }

  var PLAN_BY_LABEL = { monthly: 'monthly', quarterly: 'quarterly', 'bi-annual': 'biannual', biannual: 'biannual' };

  function planKeyOf(el) {
    var card = el.closest('[data-plan]');
    if (card) return card.getAttribute('data-plan');
    card = el.closest('.sx-plan');
    var label = card && card.querySelector('.sx-plan-label');
    return label ? PLAN_BY_LABEL[label.textContent.trim().toLowerCase()] : null;
  }

  function applyPlans(f) {
    document.querySelectorAll('.sx-plan-off b, .qp-plan-off b, .plan-card-savings').forEach(function (el) {
      var key = planKeyOf(el), plan = key && f.plans[key];
      if (!plan || plan.offEach === BAKED.plans[key].offEach) return;
      var first = el.firstChild;
      if (first && first.nodeType === 3) first.nodeValue = first.nodeValue.replace(/\$\d[\d,]*/, '$' + plan.offEach);
    });
    document.querySelectorAll('.sx-plan-per').forEach(function (el) {
      var key = planKeyOf(el), plan = key && f.plans[key];
      if (plan && plan.visits !== BAKED.plans[key].visits) el.textContent = el.textContent.replace(/\d+/, plan.visits);
    });
    var offs = ['monthly', 'quarterly', 'biannual'].map(function (k) { return f.plans[k].offEach; });
    var bakedOffs = [50, 150], lo = Math.min.apply(null, offs), hi = Math.max.apply(null, offs);
    var pcts = f.bundleTiers.map(function (t) { return t.percent; });
    var pairs = [];
    if (lo !== bakedOffs[0] || hi !== bakedOffs[1]) pairs.push([/\$50 to \$150/g, '$' + lo + ' to $' + hi]);
    if (pcts[0] !== 10 || pcts[pcts.length - 1] !== 20) pairs.push([/10% to 20%/g, pcts[0] + '% to ' + pcts[pcts.length - 1] + '%']);
    if (f.rainDays !== BAKED.guarantees.rainDays) {
      pairs.push([/7-Day Rain/g, f.rainDays + '-Day Rain']);
      pairs.push([/within 7 days/g, 'within ' + f.rainDays + ' days']);
    }
    if (f.redoHours !== BAKED.guarantees.redoHours) pairs.push([/within 48 hours/g, 'within ' + f.redoHours + ' hours']);
    swapEverywhere(pairs);
  }

  // Door-to-door pay ladder on the careers page: <span data-sx-pay="tier1_rate">18</span>
  function applyPay(pay) {
    if (!pay) return;
    document.querySelectorAll('[data-sx-pay]').forEach(function (el) {
      var v = pay[el.getAttribute('data-sx-pay')];
      if (typeof v === 'number' && isFinite(v)) el.textContent = String(v);
    });
  }

  // Plain numbers anywhere on a page: <span data-sx-fact="bundle_4">20</span>
  function applyFactSpans(f) {
    var t = tokens(f);
    document.querySelectorAll('[data-sx-fact]').forEach(function (el) {
      var v = t[el.getAttribute('data-sx-fact')];
      if (v != null && v.indexOf('[') !== 0 && el.textContent !== v) el.textContent = v;
    });
  }

  // ---- Terms & Privacy, written in the Admin Hub ---------------------------------------------
  function tokens(f) {
    var tier = function (n) {
      var hit = f.bundleTiers.filter(function (t) { return t.services <= n; }).pop();
      return String(hit ? hit.percent : 0);
    };
    return {
      phone: '[' + f.phone + '](tel:' + digits(f.phone) + ')',
      email: '[' + f.email + '](mailto:' + f.email + ')',
      hours: f.hours, company: 'Shark Exterior',
      monthly_off: String(f.plans.monthly.offEach), quarterly_off: String(f.plans.quarterly.offEach), biannual_off: String(f.plans.biannual.offEach),
      bundle_2: tier(2), bundle_3: tier(3), bundle_4: tier(4),
      rain_days: String(f.rainDays), redo_hours: String(f.redoHours),
      notice_hours: String(f.noticeHours), late_fee: String(f.lateFee),
      term_months: String(f.termMonths), cancel_notice_days: String(f.cancelNoticeDays),
    };
  }

  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, text, href) {
        var safe = /^(https?:|tel:|mailto:|sms:|#|[a-z0-9-]+\.html)/i.test(href) ? href : '#';
        var ext = /^https?:/i.test(safe) ? ' target="_blank" rel="noopener"' : '';
        return '<a href="' + safe + '"' + ext + '>' + text + '</a>';
      });
  }

  function slug(s) { return s.toLowerCase().replace(/&amp;|&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-')[0]; }

  function renderPolicy(article, toc, md) {
    // Keep the section ids other pages link to (terms.html#memberships).
    var known = {};
    article.querySelectorAll('h2[id]').forEach(function (h) { known[h.textContent.replace(/^\d+\.\s*/, '').trim().toLowerCase()] = h.id; });
    var html = [], list = [], heads = [], n = 0;
    var flush = function () { if (list.length) { html.push('<ul>' + list.join('') + '</ul>'); list = []; } };
    md.split('\n').forEach(function (raw) {
      var line = raw.trim();
      if (!line) { flush(); return; }
      if (line.indexOf('### ') === 0) { flush(); html.push('<h3>' + inline(line.slice(4)) + '</h3>'); }
      else if (line.indexOf('## ') === 0) {
        flush(); n += 1;
        var text = line.slice(3).trim();
        var id = known[text.toLowerCase()] || slug(text) || 's' + n;
        heads.push({ id: id, text: text });
        html.push('<h2 id="' + esc(id) + '">' + n + '. ' + inline(text) + '</h2>');
      } else if (line.indexOf('- ') === 0) list.push('<li>' + inline(line.slice(2)) + '</li>');
      else { flush(); html.push('<p>' + inline(line) + '</p>'); }
    });
    flush();
    var probe = document.createElement('div');
    probe.innerHTML = html.join('\n');
    var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };
    if (norm(probe.textContent) === norm(article.textContent)) return false; // already matches
    article.innerHTML = probe.innerHTML;
    if (toc) {
      var label = toc.querySelector('strong');
      toc.innerHTML = (label ? label.outerHTML : '<strong>On this page</strong>') +
        heads.map(function (h) { return '<a href="#' + esc(h.id) + '">' + esc(h.text.replace(/\s*\(.*\)$/, '')) + '</a>'; }).join('');
    }
    return true;
  }

  function applyPolicies(data, f) {
    var article = document.querySelector('.sx-legal-body');
    if (!article || !data || !Array.isArray(data.policies)) return;
    var page = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
    var policy = data.policies.filter(function (p) { return p.key === page; })[0];
    if (!policy || !policy.body) return;
    var t = tokens(f);
    var md = policy.body.replace(/\{\{\s*([a-z_0-9]+)\s*\}\}/g, function (m, k) { return t[k] != null ? t[k] : m; });
    renderPolicy(article, document.querySelector('.sx-legal-toc'), md);
    var stamp = document.querySelector('.sx-legal-updated');
    if (stamp && policy.updated_at) {
      stamp.textContent = 'Last updated ' + new Date(policy.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' });
    }
  }

  function applyAll(data) {
    if (!data || !data.facts) return;
    var f = factsOf(data);
    try { applyContact(f); } catch (e) { /* never break the page */ }
    try { applyPlans(f); } catch (e) { /* ignore */ }
    try { applyPay(data.pay); } catch (e) { /* ignore */ }
    try { applyFactSpans(f); } catch (e) { /* ignore */ }
    try { applyPolicies(data, f); } catch (e) { /* ignore */ }
    if (typeof window.sxUseLivePricing === 'function') window.sxUseLivePricing(data);
  }

  var applied = false;
  function run(data) {
    if (applied || !data || !data.ok) return;
    applied = true;
    applyAll(data);
  }

  // The page is updated once, from the freshest copy we can get: the CRM if it answers within
  // a few seconds, otherwise the copy this browser saw last time.
  function start() {
    var fallback = setTimeout(function () { run(window.SX_LIVE); }, 4000);
    if (!window.fetch) { clearTimeout(fallback); run(window.SX_LIVE); return; }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: KEY },
      body: JSON.stringify({ p_company: 'shark' }),
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        clearTimeout(fallback);
        if (!data || !data.ok) { run(window.SX_LIVE); return; }
        try { localStorage.setItem(CACHE, JSON.stringify(data)); } catch (e) { /* ignore */ }
        run(data);
      })
      .catch(function () { clearTimeout(fallback); run(window.SX_LIVE); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

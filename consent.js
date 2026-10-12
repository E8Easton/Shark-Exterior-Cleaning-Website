/* ==========================================================
   COOKIE CONSENT
   Google Tag Manager, Google Analytics and Google Maps embeds
   stay off until the visitor says yes. The loader itself lives
   in each page's <head> as window.sxLoadTracking(); this file
   draws the banner, stores the choice and adds a "Cookie
   Settings" link to the footer so the choice can be changed.
   ========================================================== */
(function () {
  'use strict';
  var KEY = 'sx_consent';
  var read = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var write = function (v) { try { localStorage.setItem(KEY, v); localStorage.setItem(KEY + '_at', new Date().toISOString()); } catch (e) { /* private mode */ } };

  /* ---------- Google Maps: click to load until consent ---------- */
  function loadMap(f) {
    if (f.getAttribute('src')) return;
    f.setAttribute('src', f.getAttribute('data-consent-src'));
    var ph = f.parentNode.querySelector('.sx-map-ph');
    if (ph) ph.remove();
  }
  function initMaps() {
    var granted = read() === 'granted';
    document.querySelectorAll('iframe[data-consent-src]').forEach(function (f) {
      if (granted) return loadMap(f);
      if (f.parentNode.querySelector('.sx-map-ph')) return;
      if (getComputedStyle(f.parentNode).position === 'static') f.parentNode.style.position = 'relative';
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sx-map-ph';
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"/></svg>'
        + '<b>Show map</b><span>Loads Google Maps</span>';
      b.setAttribute('aria-label', 'Show map (' + (f.getAttribute('title') || 'Google Maps') + ')');
      b.addEventListener('click', function () { loadMap(f); });
      f.parentNode.appendChild(b);
    });
  }

  /* ---------- banner ---------- */
  var banner;
  function close() { if (banner) { banner.classList.remove('is-open'); setTimeout(function () { banner && banner.remove(); banner = null; }, 300); } }
  function decide(v) {
    var was = read();
    write(v);
    close();
    if (v === 'granted') {
      if (typeof window.sxLoadTracking === 'function') window.sxLoadTracking();
      initMaps();
    } else if (was === 'granted') {
      // Turning tracking off: clear Google's cookies and reload so nothing keeps running.
      document.cookie.split(';').forEach(function (c) {
        var n = c.split('=')[0].trim();
        if (/^(_ga|_gid|_gat|_gcl)/.test(n)) {
          ['', '; domain=' + location.hostname, '; domain=.' + location.hostname.replace(/^www\./, '')].forEach(function (d) {
            document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
          });
        }
      });
      location.reload();
    }
  }
  function open() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'sx-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie choices');
    banner.innerHTML =
      '<p><strong>Can we use cookies?</strong> We use Google Analytics to see how people use our site so we can make it better. '
      + 'Nothing is tracked unless you say yes. <a href="privacy.html#cookies">Privacy Policy</a></p>'
      + '<div class="sx-consent-btns"><button type="button" data-v="denied">Decline</button><button type="button" data-v="granted">Accept</button></div>';
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]');
      if (b) decide(b.getAttribute('data-v'));
    });
    document.body.appendChild(banner);
    requestAnimationFrame(function () { banner.classList.add('is-open'); });
  }

  /* ---------- footer "Cookie Settings" link ---------- */
  function addSettingsLink() {
    document.querySelectorAll('footer a[href="privacy.html"], footer a[href="/privacy"]').forEach(function (a) {
      if (a.parentNode.querySelector('.sx-cookie-link')) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sx-cookie-link';
      b.textContent = 'Cookie Settings';
      b.addEventListener('click', open);
      a.insertAdjacentElement('afterend', b);
    });
  }

  /* ---------- styles (kept here so every page gets them) ---------- */
  var css = ''
    + '.sx-consent{position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:1003;width:min(440px,calc(100vw - 32px));padding:18px 20px;border-radius:18px;background:#fff;color:#04143C;'
    + 'box-shadow:0 24px 60px -20px rgba(4,20,60,.55),0 0 0 1px rgba(4,20,60,.08);font-family:Lexend,system-ui,sans-serif;opacity:0;transform:translateY(16px);transition:opacity .3s,transform .3s}'
    + '.sx-consent.is-open{opacity:1;transform:none}'
    + '.sx-consent p{margin:0 0 14px;font-size:.95rem;line-height:1.5;color:#3A4A66}.sx-consent strong{color:#04143C}'
    + '.sx-consent a{color:#0463EE;font-weight:600;text-decoration:underline;text-underline-offset:3px}'
    + '.sx-consent-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px}'
    + '.sx-consent-btns button{min-height:48px;border-radius:12px;font:700 1rem Lexend,system-ui,sans-serif;cursor:pointer;border:2px solid #0463EE;transition:background-color .2s,color .2s}'
    + '.sx-consent-btns [data-v=denied]{background:#fff;color:#0463EE}.sx-consent-btns [data-v=denied]:hover{background:#E7F0FF}'
    + '.sx-consent-btns [data-v=granted]{background:#0463EE;color:#fff}.sx-consent-btns [data-v=granted]:hover{background:#0352C7;border-color:#0352C7}'
    + '.sx-consent-btns button:focus-visible,.sx-cookie-link:focus-visible,.sx-map-ph:focus-visible{outline:3px solid #04143C;outline-offset:2px}'
    + '@media(max-width:760px){body:has(.sx-mbar) .sx-consent{bottom:calc(96px + env(safe-area-inset-bottom,0px))}}'
    + '.sx-cookie-link{background:none;border:0;padding:0;margin:0;font:inherit;color:inherit;cursor:pointer;text-decoration:none;opacity:inherit}'
    + '.sx-cookie-link:hover{text-decoration:underline}'
    + '.sx-map-ph{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:0;border-radius:inherit;cursor:pointer;'
    + 'background:linear-gradient(160deg,#EAF3FF,#D6E7FF);color:#04143C;font-family:Lexend,system-ui,sans-serif}'
    + '.sx-map-ph svg{width:34px;height:34px;fill:#0463EE}.sx-map-ph b{font-size:1.05rem}.sx-map-ph span{font-size:.82rem;color:#3A4A66}.sx-map-ph:hover{background:#DCEAFF}';

  function init() {
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
    initMaps();
    addSettingsLink();
    if (!read()) setTimeout(open, 600);
  }
  window.sxCookieSettings = open;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

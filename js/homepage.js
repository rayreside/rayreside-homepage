/* rayreside.com — classic homepage edition. Small progressive enhancements; the page works without any of this. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ── Theme: Day / Night / Auto ──
  var KEY = 'rr-theme', mq = window.matchMedia('(prefers-color-scheme: dark)');
  function get() { try { return localStorage.getItem(KEY) || 'auto'; } catch (e) { return 'auto'; } }
  function apply(t) {
    var dark = t === 'dark' || (t === 'auto' && mq.matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    $$('[data-theme-set]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-theme-set') === t ? 'true' : 'false'); });
  }
  $$('[data-theme-set]').forEach(function (b) {
    b.addEventListener('click', function () { var t = b.getAttribute('data-theme-set'); try { localStorage.setItem(KEY, t); } catch (e) {} apply(t); });
  });
  if (mq.addEventListener) mq.addEventListener('change', function () { if (get() === 'auto') apply('auto'); });
  apply(get());
  $('.seg').hidden = false;

  // ── Marquee pause button ──
  var mq2 = $('.marquee'), tog = $('.marquee-toggle');
  tog.hidden = false;
  tog.addEventListener('click', function () {
    var p = !mq2.classList.contains('is-paused');
    mq2.classList.toggle('is-paused', p); tog.setAttribute('aria-pressed', p ? 'true' : 'false'); tog.firstChild.textContent = p ? 'Play' : 'Pause';
  });

  // ── Nav: highlight the section you're reading ──
  var navLinks = $$('.nav a'), sections = navLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a, i) { if (sections[i] === en.target) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { if (s) io.observe(s); });
  }

  // ── Your-visit counter (honest: counts this browser's visits only) ──
  try {
    var n = (+localStorage.getItem('rr-visits') || 0) + 1; localStorage.setItem('rr-visits', n);
    var s = String(n); while (s.length < 5) s = '0' + s;
    var well = $('.counter-well');
    s.split('').forEach(function (d) { var sp = document.createElement('span'); sp.textContent = d; sp.setAttribute('aria-hidden', 'true'); well.appendChild(sp); });
    well.setAttribute('aria-label', String(n));
    $('.visitor-box').hidden = false;
  } catch (e) {}

  // ── Gallery → image viewer ──
  var cards = $$('[data-art]'), back = $('.dialog-backdrop'), dlg = $('.dialog', back), vImg = $('[data-viewer-img]'), vCap = $('[data-viewer-cap]'),
      vPos = $('[data-viewer-pos]'), vIg = $('[data-ig]', back), vTitle = $('#dlg-t'), cur = 0, opener = null;
  function show(i) {
    cur = (i + cards.length) % cards.length;
    var c = cards[cur], thumb = $('img', c);
    vImg.onerror = function () { vImg.onerror = null; vImg.src = thumb.currentSrc || thumb.src; };
    vImg.src = c.getAttribute('href'); vImg.alt = thumb.alt;
    vCap.textContent = c.getAttribute('data-title'); vTitle.textContent = c.getAttribute('data-title') + ' — Image Viewer';
    vPos.textContent = (cur + 1) + ' of ' + cards.length; vIg.href = c.getAttribute('data-ig');
  }
  function open(i) { opener = document.activeElement; show(i); back.hidden = false; document.body.style.overflow = 'hidden'; dlg.focus(); }
  function close() { back.hidden = true; document.body.style.overflow = ''; if (opener && opener.focus) opener.focus(); }
  cards.forEach(function (c, i) { c.addEventListener('click', function (e) { e.preventDefault(); open(i); }); });
  $$('[data-step]', back).forEach(function (b) { b.addEventListener('click', function () { show(cur + (+b.getAttribute('data-step'))); }); });
  $('.dialog-close', back).addEventListener('click', close);
  back.addEventListener('click', function (e) { if (e.target === back) close(); });
  document.addEventListener('keydown', function (e) {
    if (back.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(cur + 1);
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'Tab') {                      // keep focus inside the viewer
      var f = $$('button, a[href]', dlg), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();

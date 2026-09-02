/* =========================================================
   Everlight — site behaviour
   Vanilla JS, no dependencies.
   ========================================================= */
(function () {
  'use strict';

  /* ---- Where the contact form should post ----------------
     Leave empty and the form opens the visitor's mail client
     with everything pre-filled. To collect enquiries online,
     paste a form endpoint below (Formspree, Basin, Netlify…).
     e.g. 'https://formspree.io/f/abcdwxyz'
  --------------------------------------------------------- */
  var FORM_ENDPOINT = '';
  var STUDIO_EMAIL  = 'hello@everlight.studio';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Footer year ---------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Header state ---------------- */
  var header = $('#header');
  function onScroll() {
    header.classList.toggle('is-stuck', window.scrollY > 60);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- Mobile navigation ---------------- */
  var navToggle = $('#navToggle');
  var nav = $('#nav');

  function setNav(open) {
    document.body.classList.toggle('nav-open', open);
    document.body.classList.toggle('is-locked', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  navToggle.addEventListener('click', function () {
    setNav(!document.body.classList.contains('nav-open'));
  });

  $$('a', nav).forEach(function (a) {
    a.addEventListener('click', function () { setNav(false); });
  });

  /* ---------------- Scroll-spy ---------------- */
  var navLinks = $$('.nav a[href^="#"]');
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealObserver = null;
  if ('IntersectionObserver' in window && !reduceMotion) {
    revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    $$('.reveal, .tile').forEach(function (el) { revealObserver.observe(el); });
  } else {
    $$('.reveal, .tile').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- Masonry sizing ---------------- */
  var grid  = $('#grid');
  var tiles = $$('.tile', grid);
  var empty = $('#gridEmpty');

  function layoutGrid() {
    var cs   = getComputedStyle(grid);
    var row  = parseFloat(cs.gridAutoRows) || 8;
    var gap  = parseFloat(cs.rowGap) || 0;

    tiles.forEach(function (tile) {
      if (tile.classList.contains('is-hidden')) return;
      var width = tile.getBoundingClientRect().width;
      if (!width) return;
      var ratio = parseFloat(tile.dataset.h) / parseFloat(tile.dataset.w);
      var span  = Math.round((width * ratio + gap) / (row + gap));
      tile.style.gridRowEnd = 'span ' + Math.max(1, span);
    });
  }

  layoutGrid();
  window.addEventListener('load', layoutGrid);
  window.addEventListener('resize', debounce(layoutGrid, 120));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutGrid);

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  /* ---------------- Filtering ---------------- */
  var filters = $$('.filter');
  var visible = tiles.slice();

  function applyFilter(cat) {
    tiles.forEach(function (tile) {
      var show = cat === 'all' || tile.dataset.cat === cat;
      tile.classList.toggle('is-hidden', !show);
      if (show && !tile.classList.contains('is-in')) {
        if (revealObserver) revealObserver.observe(tile);
        else tile.classList.add('is-in');
      }
    });

    visible = tiles.filter(function (t) { return !t.classList.contains('is-hidden'); });
    if (empty) empty.hidden = visible.length > 0;
    layoutGrid();
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      applyFilter(btn.dataset.filter);
    });
  });

  /* ---------------- Lightbox ---------------- */
  var lb        = $('#lightbox');
  var lbImg     = $('#lbImg');
  var lbCaption = $('#lbCaption');
  var lbCount   = $('#lbCount');
  var lbClose   = $('#lbClose');
  var lbPrev    = $('#lbPrev');
  var lbNext    = $('#lbNext');
  var lbIndex   = 0;
  var lastFocus = null;

  function show(i) {
    if (!visible.length) return;
    lbIndex = (i + visible.length) % visible.length;

    var tile = visible[lbIndex];
    var src  = tile.dataset.src;
    var cap  = tile.dataset.caption;

    lbImg.classList.remove('is-ready');
    lbImg.alt = cap;
    lbImg.src = src;
    if (lbImg.complete) lbImg.classList.add('is-ready');

    lbCaption.textContent = cap;
    lbCount.textContent = (lbIndex + 1) + ' / ' + visible.length;

    var multiple = visible.length > 1;
    lbPrev.hidden = !multiple;
    lbNext.hidden = !multiple;

    // Warm the neighbours so paging feels instant
    [lbIndex + 1, lbIndex - 1].forEach(function (n) {
      var neighbour = visible[(n + visible.length) % visible.length];
      if (neighbour && neighbour !== tile) new Image().src = neighbour.dataset.src;
    });
  }

  lbImg.addEventListener('load', function () { lbImg.classList.add('is-ready'); });

  function openLightbox(tile) {
    lastFocus = document.activeElement;
    lb.hidden = false;
    void lb.offsetWidth;           // force a reflow so the fade runs
    lb.classList.add('is-open');
    document.body.classList.add('is-locked');
    show(visible.indexOf(tile));
    lbClose.focus();
  }

  function closeLightbox() {
    lb.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    window.setTimeout(function () {
      lb.hidden = true;
      lbImg.removeAttribute('src');
    }, reduceMotion ? 0 : 350);
    if (lastFocus) lastFocus.focus();
  }

  tiles.forEach(function (tile) {
    $('.tile-btn', tile).addEventListener('click', function () { openLightbox(tile); });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', function () { show(lbIndex - 1); });
  lbNext.addEventListener('click', function () { show(lbIndex + 1); });

  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('lb-stage')) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape')     { closeLightbox(); }
    if (e.key === 'ArrowRight') { show(lbIndex + 1); }
    if (e.key === 'ArrowLeft')  { show(lbIndex - 1); }
    if (e.key === 'Tab') {
      // Keep focus inside the viewer
      var focusable = [lbClose, lbPrev, lbNext].filter(function (b) { return !b.hidden; });
      var pos = focusable.indexOf(document.activeElement);
      var next = e.shiftKey ? pos - 1 : pos + 1;
      if (pos === -1 || next < 0 || next >= focusable.length) {
        e.preventDefault();
        focusable[e.shiftKey ? focusable.length - 1 : 0].focus();
      }
    }
  });

  // Swipe on touch devices
  var touchX = null;
  lb.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });

  /* ---------------- Contact form ---------------- */
  var form   = $('#contactForm');
  var status = $('#formStatus');

  var RULES = {
    name:    function (v) { return v.trim().length >= 2 || 'Please tell us who you are.'; },
    email:   function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'That email address does not look right.'; },
    message: function (v) { return v.trim().length >= 10 || 'A sentence or two is plenty.'; }
  };

  function validateField(field) {
    var rule = RULES[field.name];
    if (!rule) return true;

    var result = rule(field.value);
    var wrap   = field.closest('.field');
    var slot   = $('.error[data-for="' + field.name + '"]');
    var ok     = result === true;

    wrap.classList.toggle('has-error', !ok);
    field.setAttribute('aria-invalid', String(!ok));
    if (slot) slot.textContent = ok ? '' : result;
    return ok;
  }

  $$('input, textarea', form).forEach(function (field) {
    field.addEventListener('blur', function () {
      if (field.value) validateField(field);
    });
    field.addEventListener('input', function () {
      if (field.closest('.field').classList.contains('has-error')) validateField(field);
    });
  });

  function setStatus(text, kind) {
    status.textContent = text;
    status.classList.toggle('is-ok', kind === 'ok');
    status.classList.toggle('is-bad', kind === 'bad');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var fields = $$('[required]', form);
    var firstBad = null;

    fields.forEach(function (field) {
      if (!validateField(field) && !firstBad) firstBad = field;
    });

    if (firstBad) {
      setStatus('Just a couple of things to fix above.', 'bad');
      firstBad.focus();
      return;
    }

    var data = new FormData(form);
    var button = $('button[type="submit"]', form);

    if (FORM_ENDPOINT) {
      button.disabled = true;
      setStatus('Sending…');

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          setStatus('Thank you — your enquiry is with us. We reply to everything personally, usually within two working days.', 'ok');
        })
        .catch(function () {
          setStatus('Something went wrong sending that. Please email ' + STUDIO_EMAIL + ' instead.', 'bad');
        })
        .then(function () { button.disabled = false; });

      return;
    }

    // No endpoint configured — hand it to the visitor's mail client instead.
    var body = [
      'Names: '      + data.get('name'),
      'Email: '      + data.get('email'),
      'Date: '       + (data.get('date') || 'Not set'),
      'Venue: '      + (data.get('venue') || 'Not set'),
      'Collection: ' + data.get('collection'),
      '',
      data.get('message')
    ].join('\n');

    window.location.href = 'mailto:' + STUDIO_EMAIL +
      '?subject=' + encodeURIComponent('Wedding enquiry — ' + data.get('name')) +
      '&body=' + encodeURIComponent(body);

    setStatus('Opening your email app with the enquiry ready to send.', 'ok');
  });

})();

(function () {
  'use strict';

  /* ── Configuration (can be overridden via window.SLIDE_VIEWER_CONFIG) ── */
  var cfg             = window.SLIDE_VIEWER_CONFIG || {};
  var SLIDE_BASE      = cfg.SLIDE_BASE      || '/slides/';
  var SLIDE_PREFIX    = cfg.SLIDE_PREFIX    || 'slide';
  var SLIDE_EXTENSION = cfg.SLIDE_EXTENSION || '.png';
  var LOOP_SLIDES     = cfg.LOOP_SLIDES     !== undefined ? cfg.LOOP_SLIDES : false;
  var LS_DECK         = 'sv_deck';
  var LS_SLIDE        = 'sv_slide';

  /* ── State ─────────────────────────────────────────────────────────── */
  var currentDeck  = null;
  var currentSlide = 1;
  var totalSlides  = null;   // null = not yet known

  /* ── DOM refs ───────────────────────────────────────────────────────── */
  var inputScreen = document.getElementById('sv-input');
  var deckInput   = document.getElementById('sv-deck-input');
  var deckBtn     = document.getElementById('sv-deck-btn');
  var viewer      = document.getElementById('sv-viewer');
  var slideImg    = document.getElementById('sv-slide-img');
  var errorMsg    = document.getElementById('sv-error');
  var prevBtn     = document.getElementById('sv-prev');
  var nextBtn     = document.getElementById('sv-next');
  var counter     = document.getElementById('sv-counter');
  var fsBtn       = document.getElementById('sv-fullscreen');
  var fsContainer = document.getElementById('sv-container');
  var controls    = document.getElementById('sv-controls');
  var changeDeckBtn = document.getElementById('sv-change-deck');
  var exitBtn       = document.getElementById('sv-exit');

  /* ── Helpers ────────────────────────────────────────────────────────── */
  function slidePath(deck, n) {
    return SLIDE_BASE + deck + '/' + SLIDE_PREFIX + n + SLIDE_EXTENSION;
  }

  function canLoad(url) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload  = function () { resolve(true);  };
      img.onerror = function () { resolve(false); };
      img.src = url;
    });
  }

  /* ── Slide counting: exponential search then binary search ──────────── */
  async function countSlides(deck) {
    if (!(await canLoad(slidePath(deck, 1)))) return 0;

    // Find upper bound
    var hi = 1;
    while (await canLoad(slidePath(deck, hi))) {
      hi *= 2;
      if (hi > 512) return 512;
    }

    // Binary search between hi/2 and hi
    var lo = hi >>> 1;
    while (lo < hi - 1) {
      var mid = (lo + hi) >>> 1;
      if (await canLoad(slidePath(deck, mid))) lo = mid;
      else hi = mid;
    }
    return lo;
  }

  /* ── UI updates ─────────────────────────────────────────────────────── */
  function updateCounter() {
    counter.textContent = totalSlides !== null
      ? 'Slide ' + currentSlide + ' / ' + totalSlides
      : 'Slide ' + currentSlide + ' / …';
  }

  function updateButtons() {
    prevBtn.disabled = !LOOP_SLIDES && currentSlide <= 1;
    nextBtn.disabled = !LOOP_SLIDES && totalSlides !== null && currentSlide >= totalSlides;
  }

  /* ── Navigation ─────────────────────────────────────────────────────── */
  function goTo(n) {
    if (totalSlides !== null) {
      if (LOOP_SLIDES) n = ((n - 1 + totalSlides) % totalSlides) + 1;
      else             n = Math.max(1, Math.min(n, totalSlides));
    } else {
      n = Math.max(1, n);
    }
    currentSlide = n;
    slideImg.src = slidePath(currentDeck, currentSlide);
    updateCounter();
    updateButtons();
    try { localStorage.setItem(LS_SLIDE, String(currentSlide)); } catch (e) {}
  }

  function next() { goTo(currentSlide + 1); }
  function prev() { goTo(currentSlide - 1); }

  /* ── Load deck ──────────────────────────────────────────────────────── */
  async function loadDeck(name, startSlide) {
    startSlide   = Math.max(1, parseInt(startSlide, 10) || 1);
    currentDeck  = name;
    totalSlides  = null;
    currentSlide = startSlide;

    inputScreen.style.display = 'none';
    viewer.style.display      = 'flex';
    errorMsg.style.display    = 'none';
    slideImg.style.display    = 'none';
    slideImg.src              = '';
    updateCounter();
    updateButtons();

    // Verify slide 1 exists before committing to this deck
    var firstOk = await canLoad(slidePath(name, 1));
    if (!firstOk) {
      errorMsg.style.display = 'block';
      return;
    }

    // Show requested slide immediately
    slideImg.style.display = 'block';
    slideImg.src = slidePath(name, startSlide);
    try { localStorage.setItem(LS_DECK,  name);               } catch (e) {}
    try { localStorage.setItem(LS_SLIDE, String(startSlide)); } catch (e) {}
    updateCounter();
    updateButtons();

    // Count all slides in the background, then update UI
    var count = await countSlides(name);
    totalSlides = count;
    if (currentSlide > totalSlides) {
      currentSlide = totalSlides;
      slideImg.src = slidePath(name, currentSlide);
    }
    updateCounter();
    updateButtons();
    try { localStorage.setItem(LS_SLIDE, String(currentSlide)); } catch (e) {}
  }

  /* ── Fullscreen ─────────────────────────────────────────────────────── */
  function toggleFullscreen() {
    var inFs = document.fullscreenElement
            || document.webkitFullscreenElement
            || document.mozFullScreenElement;
    if (!inFs) {
      (fsContainer.requestFullscreen
        || fsContainer.webkitRequestFullscreen
        || fsContainer.mozRequestFullScreen
      ).call(fsContainer);
    } else {
      (document.exitFullscreen
        || document.webkitExitFullscreen
        || document.mozCancelFullScreen
      ).call(document);
    }
  }

  function onFsChange() {
    var inFs = document.fullscreenElement
            || document.webkitFullscreenElement
            || document.mozFullScreenElement;
    fsBtn.innerHTML = inFs
      ? '<i class="bi bi-fullscreen-exit"></i>'
      : '<i class="bi bi-fullscreen"></i>';
  }
  document.addEventListener('fullscreenchange',       onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);
  document.addEventListener('mozfullscreenchange',    onFsChange);

  /* ── Keyboard ───────────────────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (viewer.style.display === 'none') return;
    switch (e.key) {
      case 'ArrowRight': case ' ':         case 'PageDown': e.preventDefault(); next(); break;
      case 'ArrowLeft':  case 'Backspace': case 'PageUp':   e.preventDefault(); prev(); break;
    }
  });

  /* ── Controls auto-hide ─────────────────────────────────────────────── */
  var fadeTimer;
  function showControls() {
    controls.classList.remove('sv-controls-hidden');
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(function () {
      controls.classList.add('sv-controls-hidden');
    }, 3000);
  }
  document.addEventListener('mousemove', showControls);
  document.addEventListener('keydown',   showControls);
  controls.addEventListener('mouseenter', function () {
    clearTimeout(fadeTimer);
    controls.classList.remove('sv-controls-hidden');
  });

  /* ── Button wiring ──────────────────────────────────────────────────── */
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  fsBtn.addEventListener('click',   toggleFullscreen);

  exitBtn.addEventListener('click', function () {
    try { localStorage.removeItem(LS_DECK); localStorage.removeItem(LS_SLIDE); } catch (e) {}
    window.location.href = SLIDE_VIEWER_CONFIG.HOME_URL || '/';
  });

  changeDeckBtn.addEventListener('click', function () {
    viewer.style.display      = 'none';
    inputScreen.style.display = 'flex';
    deckInput.value           = currentDeck || '';
    deckInput.focus();
  });

  deckBtn.addEventListener('click', function () {
    var name = deckInput.value.trim();
    if (name) loadDeck(name, 1);
  });

  deckInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var name = deckInput.value.trim();
      if (name) loadDeck(name, 1);
    }
  });

  /* ── Init ───────────────────────────────────────────────────────────── */
  (function init() {
    var params = new URLSearchParams(window.location.search);
    var deck   = params.get('deck');
    var slideN = parseInt(params.get('slide'), 10) || null;

    if (!deck) {
      try {
        deck   = localStorage.getItem(LS_DECK)  || null;
        slideN = parseInt(localStorage.getItem(LS_SLIDE), 10) || 1;
      } catch (e) {}
    }

    if (deck) {
      loadDeck(deck, slideN || 1);
    } else {
      inputScreen.style.display = 'flex';
      viewer.style.display      = 'none';
    }
  }());

}());

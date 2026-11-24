(function () {
  'use strict';

  var deck = document.getElementById('deck');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var total = slides.length;
  var counter = document.getElementById('counter');
  var bar = document.getElementById('progress-bar');
  var controls = document.getElementById('controls');
  var current = 0;
  var idleTimer = null;

  /* Skalierung auf die Fensterfläche (16:9 bleibt erhalten) */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    document.documentElement.style.setProperty('--s', s);
  }

  function indexFromHash() {
    var m = /^#(\d+)$/.exec(window.location.hash);
    if (!m) return 0;
    var n = parseInt(m[1], 10) - 1;
    return n >= 0 && n < total ? n : 0;
  }

  /* Folie anzeigen. Animationen starten beim Aktivieren neu. */
  function go(i, opts) {
    if (i < 0 || i >= total) return;
    current = i;
    slides.forEach(function (el, k) {
      el.classList.toggle('is-active', k === i);
      el.setAttribute('aria-hidden', k === i ? 'false' : 'true');
    });
    counter.textContent = (i + 1) + ' / ' + total;
    bar.style.width = ((i + 1) / total * 100) + '%';
    document.getElementById('prev').disabled = i === 0;
    document.getElementById('next').disabled = i === total - 1;
    if (!opts || !opts.silent) {
      history.replaceState(null, '', '#' + (i + 1));
    }
  }

  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  function toggleFullscreen() {
    var doc = document;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      var el = doc.documentElement;
      var req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) req.call(el);
    } else {
      var exit = doc.exitFullscreen || doc.webkitExitFullscreen;
      if (exit) exit.call(doc);
    }
  }

  /* Tastatur: Leertaste, Pfeile, Bild auf/ab, Pos1/Ende, F */
  document.addEventListener('keydown', function (e) {
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    var k = e.key;
    if (k === ' ' || k === 'Spacebar') {
      e.preventDefault();
      if (e.shiftKey) prev(); else next();
    } else if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === 'Enter') {
      e.preventDefault(); next();
    } else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') {
      e.preventDefault(); prev();
    } else if (k === 'Home') {
      e.preventDefault(); go(0);
    } else if (k === 'End') {
      e.preventDefault(); go(total - 1);
    } else if (k === 'f' || k === 'F') {
      toggleFullscreen();
    }
  });

  /* Maus: Klick auf die Folie blättert weiter, Klick links zurück */
  deck.addEventListener('click', function (e) {
    var rect = deck.getBoundingClientRect();
    if (e.clientX < rect.left + rect.width * 0.25) prev(); else next();
  });

  /* Wischen auf Touch-Geräten */
  var touchX = null;
  deck.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  deck.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
    touchX = null;
  });

  document.getElementById('prev').addEventListener('click', function (e) { e.stopPropagation(); prev(); });
  document.getElementById('next').addEventListener('click', function (e) { e.stopPropagation(); next(); });
  document.getElementById('fs').addEventListener('click', function (e) { e.stopPropagation(); toggleFullscreen(); });
  controls.addEventListener('click', function (e) { e.stopPropagation(); });

  /* Steuerleiste blendet sich bei Inaktivität aus */
  function wake() {
    document.body.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { document.body.classList.add('idle'); }, 2500);
  }
  ['mousemove', 'keydown', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, wake, { passive: true });
  });
  wake();

  function onFsChange() {
    document.body.classList.toggle('is-fullscreen', !!(document.fullscreenElement || document.webkitFullscreenElement));
    fit();
  }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', function () { go(indexFromHash(), { silent: true }); });

  fit();
  go(indexFromHash(), { silent: true });
})();

/* ========== CARRUSEL DE ALIADOS ==========
   Scroll-snap CSS + autoplay lento vía JS. Solo avanza si el contenido
   es más ancho que la pista (pensado para crecer con más logos).
   Pausa al interactuar (hover, foco, touch) y respeta prefers-reduced-motion.
   ==================================================== */
(function () {
  'use strict';

  var track = document.getElementById('aliadosTrack');
  if (!track) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  var STEP_MS = 3200;    // pausa entre avances
  var intervalId = null;
  var interacting = false;

  function scrollable() {
    return track.scrollWidth > track.clientWidth + 8;
  }

  function advance() {
    if (interacting || !scrollable()) return;
    var card = track.querySelector('.aliado-card');
    var step = card ? card.offsetWidth + 24 : track.clientWidth * 0.6;
    var max = track.scrollWidth - track.clientWidth - 4;
    if (track.scrollLeft >= max) {
      track.scrollTo({ left: 0, behavior: 'smooth' }); // vuelve al inicio
    } else {
      track.scrollBy({ left: step, behavior: 'smooth' });
    }
  }

  function start() {
    if (intervalId || interacting) return;
    intervalId = setInterval(advance, STEP_MS);
  }

  function stop() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }

  ['mouseenter', 'focusin', 'touchstart'].forEach(function (evt) {
    track.addEventListener(evt, function () {
      interacting = true;
      stop();
    }, { passive: true });
  });

  ['mouseleave', 'focusout', 'touchend'].forEach(function (evt) {
    track.addEventListener(evt, function () {
      interacting = false;
      start();
    }, { passive: true });
  });

  start();
})();

/* ========== ENEÁGONO DECISIONAL · HERO ==========
   Cicla las 9 fases del método (F0–F8) con line-art sutil en canvas.
   · Sin dependencias externas
   · Respeta prefers-reduced-motion (fase estática, sin ciclo)
   · Pausa cuando la pestaña o el canvas salen de vista
   ==================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('eneagonoCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var TEAL = '#3FC1B4';
  var ORANGE = '#E8943E';
  var MUTED = 'rgba(0, 109, 109, 0.35)';

  var W = 320;
  var H = 190;

  // Nombres oficiales de las fases (se conservan en los 3 idiomas)
  var PHASES = [
    { code: 'F0', name: 'Postura' },
    { code: 'F1', name: 'Entorno' },
    { code: 'F2', name: 'Decisión' },
    { code: 'F3', name: 'Actores' },
    { code: 'F4', name: 'Articular' },
    { code: 'F5', name: 'Señales' },
    { code: 'F6', name: 'Memoria' },
    { code: 'F7', name: 'Comité' },
    { code: 'F8', name: 'Órdenes' }
  ];

  var PHASE_MS = 2800;   // duración por fase
  var FADE_MS = 600;     // transición suave entre fases

  // ---------- utilidades de dibujo ----------
  function stroke(color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 1.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function circle(x, y, r, color, width) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    stroke(color || TEAL, width);
    ctx.stroke();
  }

  function dot(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color || TEAL;
    ctx.fill();
  }

  function line(x1, y1, x2, y2, color, width) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    stroke(color || TEAL, width);
    ctx.stroke();
  }

  function polyline(points, color, width) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    stroke(color || TEAL, width);
    ctx.stroke();
  }

  // figura humana mínima (line-art): cabeza + cuerpo
  function figure(x, y, s, color) {
    circle(x, y - 7 * s, 3 * s, color || TEAL, 1.3);
    line(x, y - 4 * s, x, y + 6 * s, color || TEAL, 1.3);
    line(x - 4 * s, y + 1 * s, x + 4 * s, y + 1 * s, color || TEAL, 1.3);
    line(x, y + 6 * s, x - 3 * s, y + 12 * s, color || TEAL, 1.3);
    line(x, y + 6 * s, x + 3 * s, y + 12 * s, color || TEAL, 1.3);
  }

  // documento (rect con líneas de texto)
  function drawDocument(x, y, w, h, color) {
    ctx.strokeRect(x, y, w, h);
    stroke(color || TEAL, 1.2);
    ctx.strokeRect(x, y, w, h);
    for (var i = 0; i < 3; i++) {
      line(x + 4, y + 6 + i * 6, x + w - 4, y + 6 + i * 6, color || MUTED, 1);
    }
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function ease(t) { return t * t * (3 - 2 * t); }

  // ---------- dibujos por fase (t: progreso local 0→1) ----------
  var DRAW = {
    // F0 · Postura: serie de tiempo cuya curva se vuelve flecha y acierta un blanco futuro
    f0: function (t) {
      // ejes
      line(20, 150, 20, 30, MUTED, 1);
      line(20, 150, 300, 150, MUTED, 1);
      // blanco en el futuro (derecha)
      circle(268, 60, 16, ORANGE, 1.3);
      circle(268, 60, 9, ORANGE, 1.1);
      dot(268, 60, 2.2, ORANGE);
      // curva de la serie
      var pts = [];
      var n = 40;
      var reveal = Math.floor(lerp(4, n, clamp01(t / 0.72)));
      for (var i = 0; i <= reveal && i <= n; i++) {
        var x = lerp(24, 268, i / n);
        var y = 118 - i / n * 46 + Math.sin(i * 0.55) * 10 * (1 - i / n);
        pts.push([x, y]);
      }
      if (pts.length > 1) polyline(pts, TEAL, 1.6);
      // la curva se vuelve flecha que acierta el blanco
      if (t > 0.72) {
        var at = ease(clamp01((t - 0.72) / 0.28));
        var sx = 268, sy = 118 - 46 + Math.sin(n * 0.55) * 0;
        var ex = lerp(sx, 268, at), ey = lerp(sy, 60, at);
        line(sx, sy, ex, ey, ORANGE, 1.6);
        if (at > 0.9) {
          var ang = Math.atan2(60 - sy, 268 - sx);
          var hx = ex, hy = ey;
          line(hx, hy, hx - 7 * Math.cos(ang - 0.45), hy - 7 * Math.sin(ang - 0.45), ORANGE, 1.6);
          line(hx, hy, hx - 7 * Math.cos(ang + 0.45), hy - 7 * Math.sin(ang + 0.45), ORANGE, 1.6);
        }
      }
      // marcas de tiempo
      for (var m = 0; m < 4; m++) line(50 + m * 60, 150, 50 + m * 60, 154, MUTED, 1);
    },

    // F1 · Entorno: factores PESTEL+C convergen y un agente IA los convierte en reporte
    f1: function (t) {
      // 7 glifos: política, económico, social, tecnológico, ambiental, legal, criminal
      var cx = 160, cy = 80;
      var glyphs = [
        function (x, y) { // política: frontón con columnas
          line(x - 7, y - 4, x, y - 9, TEAL); line(x, y - 9, x + 7, y - 4, TEAL);
          line(x - 8, y - 2, x + 8, y - 2, TEAL, 1);
          line(x - 5, y, x - 5, y + 8, TEAL, 1); line(x, y, x, y + 8, TEAL, 1); line(x + 5, y, x + 5, y + 8, TEAL, 1);
        },
        function (x, y) { // económico: moneda
          circle(x, y, 7, TEAL, 1.2);
          ctx.fillStyle = TEAL; ctx.font = '9px Inter, sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('$', x, y + 3);
        },
        function (x, y) { // social: dos personas
          circle(x - 4, y - 3, 2.6, TEAL, 1.1); circle(x + 4, y - 3, 2.6, TEAL, 1.1);
          line(x - 4, y, x - 4, y + 8, TEAL, 1.1); line(x + 4, y, x + 4, y + 8, TEAL, 1.1);
        },
        function (x, y) { // tecnológico: chip
          ctx.strokeRect(x - 5, y - 5, 10, 10); stroke(TEAL, 1.1);
          for (var p = -3; p <= 3; p += 3) {
            line(x + p, y - 8, x + p, y - 5, TEAL, 1); line(x + p, y + 5, x + p, y + 8, TEAL, 1);
          }
        },
        function (x, y) { // ambiental: hoja
          ctx.beginPath();
          ctx.moveTo(x, y + 8);
          ctx.quadraticCurveTo(x - 8, y, x, y - 8);
          ctx.quadraticCurveTo(x + 8, y, x, y + 8);
          stroke(TEAL, 1.1); ctx.stroke();
          line(x, y - 6, x, y + 8, TEAL, 1);
        },
        function (x, y) { // legal: balanza
          line(x, y - 8, x, y + 6, TEAL, 1.1);
          line(x - 8, y - 5, x + 8, y - 5, TEAL, 1.1);
          line(x - 8, y - 5, x - 11, y + 2, TEAL, 1); line(x - 8, y - 5, x - 5, y + 2, TEAL, 1);
          line(x - 11, y + 2, x - 5, y + 2, TEAL, 1);
          line(x + 8, y - 5, x + 5, y + 2, TEAL, 1); line(x + 8, y - 5, x + 11, y + 2, TEAL, 1);
          line(x + 5, y + 2, x + 11, y + 2, TEAL, 1);
        },
        function (x, y) { // criminal: máscara
          ctx.beginPath();
          ctx.moveTo(x - 7, y - 4);
          ctx.quadraticCurveTo(x, y - 10, x + 7, y - 4);
          ctx.quadraticCurveTo(x + 6, y + 6, x, y + 8);
          ctx.quadraticCurveTo(x - 6, y + 6, x - 7, y - 4);
          stroke(TEAL, 1.1); ctx.stroke();
          dot(x - 3, y - 1, 1.2, TEAL); dot(x + 3, y - 1, 1.2, TEAL);
        }
      ];
      var spread = 1 - ease(clamp01(t / 0.55)) * 0.72; // convergen hacia el centro
      for (var i = 0; i < glyphs.length; i++) {
        var ang = -Math.PI / 2 + i * (Math.PI * 2 / glyphs.length);
        var gx = cx + Math.cos(ang) * 92 * spread;
        var gy = cy + Math.sin(ang) * 58 * spread;
        glyphs[i](gx, gy);
      }
      // agente IA central que convierte el entorno en reporte
      if (t > 0.4) {
        var ai = ease(clamp01((t - 0.4) / 0.3));
        circle(cx, cy, 6 + ai * 2, ORANGE, 1.4);
        // destellos
        for (var s = 0; s < 4; s++) {
          var sa = s * Math.PI / 2 + 0.5;
          line(cx + Math.cos(sa) * 11, cy + Math.sin(sa) * 11, cx + Math.cos(sa) * (13 + ai * 3), cy + Math.sin(sa) * (13 + ai * 3), ORANGE, 1.2);
        }
      }
      // reporte resultante
      if (t > 0.66) {
        var rp = ease(clamp01((t - 0.66) / 0.34));
        ctx.save();
        ctx.globalAlpha = rp;
        ctx.translate(160, 140 - (1 - rp) * 10);
        drawDocument(-26, -16, 52, 32, ORANGE);
        ctx.restore();
      }
    },

    // F2 · Decisión: directivo al frente de su equipo caminando hacia el futuro
    f2: function (t) {
      // horizonte con flecha
      line(24, 132, 292, 132, MUTED, 1);
      line(292, 132, 284, 127, MUTED, 1);
      line(292, 132, 284, 137, MUTED, 1);
      // sol/horizonte futuro
      circle(276, 132, 14 + Math.sin(t * Math.PI) * 3, ORANGE, 1.2);
      // equipo caminando: directivo al frente (derecha), equipo detrás
      var step = Math.sin(t * Math.PI * 4) * 2.4;
      figure(238, 104 + step * 0.4, 1.25, ORANGE);            // directivo
      figure(198, 106 - step * 0.4, 1.0, TEAL);               // equipo
      figure(166, 106 + step * 0.4, 1.0, TEAL);
      figure(134, 106 - step * 0.4, 0.95, TEAL);
      // banderín del directivo
      line(238, 88, 238, 72, ORANGE, 1.2);
      ctx.beginPath();
      ctx.moveTo(238, 72); ctx.lineTo(252, 76); ctx.lineTo(238, 81);
      ctx.closePath();
      stroke(ORANGE, 1.2); ctx.stroke();
      // líneas de movimiento
      for (var i = 0; i < 3; i++) {
        line(70 + i * 16, 96 + i * 10, 88 + i * 16, 96 + i * 10, MUTED, 1.2);
      }
    },

    // F3 · Actores: lupa enfocando siluetas-actores y temas
    f3: function (t) {
      // siluetas fuera de foco
      var blurred = [
        [52, 60], [74, 122], [258, 52], [276, 122], [160, 34]
      ];
      for (var i = 0; i < blurred.length; i++) {
        circle(blurred[i][0], blurred[i][1], 4, MUTED, 1);
      }
      // red de actores dentro de la lupa
      var nodes = [[136, 66], [180, 58], [200, 92], [158, 108], [118, 94]];
      var edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 3], [0, 3]];
      var lx = 160 + Math.sin(t * Math.PI * 2) * 8;
      var ly = 84 + Math.cos(t * Math.PI * 2) * 5;
      for (var e = 0; e < edges.length; e++) {
        line(nodes[edges[e][0]][0] + (lx - 160), nodes[edges[e][0]][1] + (ly - 84),
             nodes[edges[e][1]][0] + (lx - 160), nodes[edges[e][1]][1] + (ly - 84),
             'rgba(63, 193, 180, 0.55)', 1);
      }
      for (var n = 0; n < nodes.length; n++) {
        dot(nodes[n][0] + (lx - 160), nodes[n][1] + (ly - 84), 2.6, TEAL);
      }
      // aro de la lupa + mango
      circle(lx, ly, 46, ORANGE, 1.6);
      line(lx + 33, ly + 33, lx + 56, ly + 56, ORANGE, 2.4);
      // temas: pequeñas etiquetas
      ctx.fillStyle = MUTED;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('temas', lx, ly + 64);
    },

    // F4 · Articular: piezas de rompecabezas que se articulan
    f4: function (t) {
      // pieza de rompecabezas: cuadrado con una pestaña y un hueco
      function piece(x, y, s, tabTop, tabRight, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        // lado superior
        if (tabTop) {
          ctx.lineTo(s * 0.32, 0);
          ctx.arc(s * 0.5, 0, s * 0.18, Math.PI, 0, false);
          ctx.lineTo(s, 0);
        } else {
          ctx.lineTo(s * 0.32, 0);
          ctx.arc(s * 0.5, 0, s * 0.18, Math.PI, 0, true);
          ctx.lineTo(s, 0);
        }
        ctx.lineTo(s, s * 0.32);
        // lado derecho
        if (tabRight) {
          ctx.lineTo(s, s * 0.5 - s * 0.18);
          ctx.arc(s, s * 0.5, s * 0.18, -Math.PI / 2, Math.PI / 2, false);
        } else {
          ctx.lineTo(s, s * 0.5 - s * 0.18);
          ctx.arc(s, s * 0.5, s * 0.18, -Math.PI / 2, Math.PI / 2, true);
        }
        ctx.lineTo(s, s);
        ctx.lineTo(0, s);
        ctx.closePath();
        stroke(color, 1.5);
        ctx.stroke();
        ctx.restore();
      }
      var p = ease(clamp01(t / 0.8));
      var s = 42;
      var gx = 118, gy = 52; // posición final de la cuadrícula 2x2
      var offs = [
        [-70 * (1 - p), -44 * (1 - p), true, false, TEAL],
        [70 * (1 - p), -50 * (1 - p), false, true, TEAL],
        [-64 * (1 - p), 52 * (1 - p), true, true, ORANGE],
        [66 * (1 - p), 46 * (1 - p), false, false, ORANGE]
      ];
      for (var i = 0; i < 4; i++) {
        var px = gx + (i % 2) * s + offs[i][0];
        var py = gy + Math.floor(i / 2) * s + offs[i][1];
        piece(px, py, s, offs[i][2], offs[i][3], offs[i][4]);
      }
      // "clic" de articulación completada
      if (p > 0.9) {
        circle(gx + s, gy + s, 34 + (p - 0.9) * 30, 'rgba(232, 148, 62, 0.4)', 1);
      }
    },

    // F5 · Señales: ondas / señales débiles que se amplifican
    f5: function (t) {
      // fuente débil
      var ax = 60, ay = 120;
      dot(ax, ay, 2.4, ORANGE);
      // ondas que se amplifican (crecen y se desvanecen)
      for (var i = 0; i < 4; i++) {
        var ph = clamp01(t * 1.4 - i * 0.22);
        if (ph <= 0) continue;
        var r = 8 + ph * 46;
        ctx.beginPath();
        ctx.arc(ax, ay, r, -0.9, 0.9);
        stroke('rgba(63, 193, 180, ' + (0.55 * (1 - ph)) + ')', 1.3);
        ctx.stroke();
      }
      // onda amplificada hacia la derecha (amplitud creciente)
      var amp = 6 + t * 26;
      var pts = [];
      for (var x = 120; x <= 292; x += 6) {
        var k = (x - 120) / 172;
        pts.push([x, 92 + Math.sin(k * Math.PI * 3 + t * Math.PI * 2) * amp * k]);
      }
      polyline(pts, TEAL, 1.6);
      // señal detectada
      if (t > 0.7) {
        var bl = clamp01((t - 0.7) / 0.3);
        circle(292, 92, 5 + bl * 5, ORANGE, 1.3);
        dot(292, 92, 2, ORANGE);
      }
      ctx.fillStyle = MUTED;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('señal débil', 40, 148);
      ctx.fillText('señal amplificada', 210, 148);
    },

    // F6 · Memoria: archivos que se consultan
    f6: function (t) {
      // pila de archivos
      drawDocument(52, 74, 60, 44, MUTED);
      drawDocument(58, 64, 60, 44, MUTED);
      drawDocument(64, 54, 60, 44, TEAL);
      // cilindro de base de datos
      ctx.beginPath();
      ctx.ellipse(226, 60, 26, 9, 0, 0, Math.PI * 2);
      stroke(TEAL, 1.3); ctx.stroke();
      line(200, 60, 200, 116, TEAL, 1.3);
      line(252, 60, 252, 116, TEAL, 1.3);
      ctx.beginPath();
      ctx.ellipse(226, 116, 26, 9, 0, 0, Math.PI);
      stroke(TEAL, 1.3); ctx.stroke();
      line(200, 88, 252, 88, MUTED, 1);
      // consulta: línea de búsqueda que recorre los archivos
      var qx = 40 + (t * 220) % 240;
      line(qx, 36, qx + 26, 36, ORANGE, 1.4);
      dot(qx + 30, 36, 2.4, ORANGE);
      // respuesta
      if (t > 0.6) {
        var rp = clamp01((t - 0.6) / 0.4);
        ctx.save();
        ctx.globalAlpha = rp;
        drawDocument(120, 130, 80, 34, ORANGE);
        ctx.restore();
      }
    },

    // F7 · Comité: mesa deliberante
    f7: function (t) {
      var cx = 160, cy = 92;
      // figuras alrededor de la mesa
      var seats = [
        [cx - 72, cy - 30, 1.0], [cx, cy - 48, 1.05], [cx + 72, cy - 30, 1.0],
        [cx - 72, cy + 34, 1.0], [cx + 72, cy + 34, 1.0]
      ];
      for (var i = 0; i < seats.length; i++) {
        figure(seats[i][0], seats[i][1], seats[i][2], TEAL);
      }
      // mesa
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 66, 26, 0, 0, Math.PI * 2);
      stroke(ORANGE, 1.5); ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 40, 14, 0, 0, Math.PI * 2);
      stroke('rgba(232, 148, 62, 0.5)', 1.1); ctx.stroke();
      // deliberación: puntos de diálogo animados
      for (var d = 0; d < 3; d++) {
        var ph = clamp01(t * 1.6 - d * 0.3);
        var bx = cx - 20 + d * 22;
        var by = cy - 62 - ph * 10;
        ctx.globalAlpha = 1 - ph * 0.7;
        dot(bx, by, 2, ORANGE);
        dot(bx + 5, by, 2, ORANGE);
        ctx.globalAlpha = 1;
      }
      // documento sobre la mesa
      drawDocument(cx - 14, cy - 6, 28, 18, TEAL);
    },

    // F8 · Órdenes: briefing sellado y ejecutado
    f8: function (t) {
      // briefing
      drawDocument(70, 48, 84, 104, TEAL);
      // sello
      var sx = 154, sy = 152;
      circle(sx, sy, 16, ORANGE, 1.5);
      circle(sx, sy, 11, ORANGE, 1.1);
      // estrella del sello
      ctx.beginPath();
      for (var i = 0; i < 5; i++) {
        var a1 = -Math.PI / 2 + i * (Math.PI * 4 / 5);
        var px = sx + Math.cos(a1) * 6, py = sy + Math.sin(a1) * 6;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      stroke(ORANGE, 1); ctx.stroke();
      // check de ejecutado
      if (t > 0.35) {
        var cp = ease(clamp01((t - 0.35) / 0.3));
        polyline([[88, 92], [96, 100], [112, 80]], TEAL, 2);
        if (cp > 0.5) {
          polyline([[88, 116], [96, 124], [112, 104]], TEAL, 2);
        }
      }
      // ejecución: flecha de salida
      if (t > 0.65) {
        var ep = ease(clamp01((t - 0.65) / 0.35));
        var ex = lerp(190, 272, ep), ey = lerp(96, 96, ep);
        line(190, 96, ex, ey, ORANGE, 1.8);
        line(ex, ey, ex - 8, ey - 5, ORANGE, 1.8);
        line(ex, ey, ex - 8, ey + 5, ORANGE, 1.8);
        if (ep > 0.9) dot(284, 96, 3.2, ORANGE);
      }
    }
  };

  var ORDER = ['f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];

  // ---------- etiqueta y puntos de progreso ----------
  var codeEl = document.getElementById('eneagonoCode');
  var nameEl = document.getElementById('eneagonoName');
  var dotsEl = document.getElementById('eneagonoDots');

  var dotEls = [];
  if (dotsEl) {
    PHASES.forEach(function (p, i) {
      var d = document.createElement('span');
      d.className = 'eneagono-dot';
      dotsEl.appendChild(d);
      dotEls.push(d);
    });
  }

  function setPhaseUI(idx) {
    if (codeEl) codeEl.textContent = PHASES[idx].code;
    if (nameEl) nameEl.textContent = PHASES[idx].name;
    for (var i = 0; i < dotEls.length; i++) {
      dotEls[i].classList.toggle('active', i === idx);
    }
  }

  // ---------- ciclo de animación ----------
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  var startTime = null;
  var currentIdx = -1;

  function renderPhase(idx, localT, alpha) {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = alpha;
    DRAW[ORDER[idx]](localT);
    ctx.restore();
  }

  function frame(now) {
    if (startTime === null) startTime = now;
    var elapsed = now - startTime;
    var cycle = PHASES.length * PHASE_MS;
    var pos = elapsed % cycle;
    var idx = Math.floor(pos / PHASE_MS);
    var local = (pos - idx * PHASE_MS) / PHASE_MS; // 0→1 dentro de la fase

    if (idx !== currentIdx) {
      currentIdx = idx;
      setPhaseUI(idx);
    }

    // transición suave: fade-out al final y fade-in al inicio
    var alpha = 1;
    var localMs = local * PHASE_MS;
    if (localMs < FADE_MS) {
      alpha = localMs / FADE_MS;
      var prev = (idx + PHASES.length - 1) % PHASES.length;
      renderPhase(prev, 1, 1 - alpha);
    } else if (localMs > PHASE_MS - FADE_MS) {
      alpha = (PHASE_MS - localMs) / FADE_MS;
    }
    renderPhase(idx, local, Math.max(alpha, 0.001));

    animId = requestAnimationFrame(frame);
  }

  function renderStatic() {
    setPhaseUI(0);
    renderPhase(0, 1, 1);
  }

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animId = null;
  var inViewport = true;
  var running = false;

  function start() {
    if (reduced || running) return;
    running = true;
    animId = requestAnimationFrame(frame);
  }

  function stop() {
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    running = false;
  }

  if (reduced) {
    renderStatic();
  } else {
    // Pausa cuando el canvas sale del viewport o la pestaña se oculta
    new IntersectionObserver(function (entries) {
      inViewport = entries[0].isIntersecting;
      if (inViewport && !document.hidden) start(); else stop();
    }, { threshold: 0.1 }).observe(canvas);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (inViewport) start();
    });

    start();
  }
})();

/* ========== ENEÁGONO DECISIONAL · SECCIÓN MÉTODO (INTERACTIVO) ==========
   Las nueve fases nacen del grafo de nueve lados: el vértice activo
   dispara una semilla hacia el centro y la escena de la fase crece
   desde ahí. El camino recorrido queda encendido — el ciclo va a
   algún lado: del dato a la decisión.

   Controles pensados para explicar el método a clientes:
   · Ciclo automático con reproducción/pausa
   · Flechas anterior/siguiente y puntos cliqueables
   · Clic directo sobre un vértice del grafo
   · Teclas ← → cuando el escenario tiene el foco
   · Panel con el nombre oficial y una explicación breve por fase (3 idiomas)
   · Respeta prefers-reduced-motion (cambio de fase estático)
   · Pausa cuando la pestaña o el canvas salen de vista
   ==================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('metodoCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var TEAL = '#3FC1B4';
  var ORANGE = '#E8943E';
  var MUTED = 'rgba(0, 109, 109, 0.35)';

  // lienzo interno fijo; el CSS lo escala
  var W = 960;
  var H = 540;
  var CX = 480;
  var CY = 268;
  var R = 216;                 // radio del eneágono
  var N = 9;                   // lados / fases

  // Fases con nombres oficiales y explicación breve en los 3 idiomas.
  // `short` es la etiqueta compacta que va junto a cada vértice del grafo.
  var PHASES = [
    {
      code: 'F0', short: 'Postura',
      es: { name: 'Postura Estratégica', desc: 'El decisor describe su compromiso de liderazgo.' },
      en: { name: 'Strategic Posture', desc: 'The decision-maker describes their leadership commitment.' },
      fr: { name: 'Posture Stratégique', desc: 'Le décideur décrit son engagement de leadership.' }
    },
    {
      code: 'F1', short: 'Entorno',
      es: { name: 'Análisis del Entorno', desc: 'Cruza datos espaciotemporales y no estructurados para detectar tendencias con rigor estadístico.' },
      en: { name: 'Environment Analysis', desc: 'Crosses spatio-temporal and unstructured data to detect trends with statistical rigor.' },
      fr: { name: 'Analyse de l\u2019Environnement', desc: 'Croise des données spatio-temporelles et non structurées pour détecter les tendances avec rigueur statistique.' }
    },
    {
      code: 'F2', short: 'Asunto',
      es: { name: 'Asunto Decisional', desc: 'Define la gestión a realizar, los impactos esperados y el alcance espacio-temporal.' },
      en: { name: 'Decision Issue', desc: 'Defines the action to be taken, the expected impacts and the spatio-temporal scope.' },
      fr: { name: 'Objet Décisionnel', desc: 'Définit l\u2019action à mener, les impacts attendus et la portée spatio-temporelle.' }
    },
    {
      code: 'F3', short: 'Actores',
      es: { name: 'Enfocar Actores y Temas', desc: 'El grafo actor-tema revela quién es el nodo clave de la decisión.' },
      en: { name: 'Focus Actors and Issues', desc: 'The actor-issue graph reveals who is the key node of the decision.' },
      fr: { name: 'Focaliser Acteurs et Sujets', desc: 'Le graphe acteur-sujet révèle qui est le nœud clé de la décision.' }
    },
    {
      code: 'F4', short: 'Recolección',
      es: { name: 'Recolección de información', desc: 'Recolecta información sobre los temas y actores focalizados, relevante para la toma de decisiones gerenciales.' },
      en: { name: 'Information Collection', desc: 'Collects information on the focused issues and actors that is relevant for managerial decision-making.' },
      fr: { name: 'Collecte d\u2019Information', desc: 'Collecte des informations sur les sujets et acteurs focalisés, pertinentes pour la prise de décision managériale.' }
    },
    {
      code: 'F5', short: 'Señales',
      es: { name: 'Señales Predictivas', desc: 'Las predicciones de los modelos matemáticos que podrían convertirse en señales débiles.' },
      en: { name: 'Predictive Signals', desc: 'Predictions from the mathematical models that could become weak signals.' },
      fr: { name: 'Signaux Prédictifs', desc: 'Les prédictions des modèles mathématiques qui pourraient devenir des signaux faibles.' }
    },
    {
      code: 'F6', short: 'Memoria',
      es: { name: 'Memoria a largo plazo', desc: 'Guarda la trazabilidad de todo el Eneágono y compara eventos pasados similares y sus resultados para asesorar la decisión presente.' },
      en: { name: 'Long-term Memory', desc: 'Keeps traceability of the entire Enneagon and compares similar past events and their results to advise the present decision.' },
      fr: { name: 'Mémoire à long terme', desc: 'Conserve la traçabilité de tout l\u2019Ennéagone et compare des événements passés similaires et leurs résultats pour éclairer la décision présente.' }
    },
    {
      code: 'F7', short: 'Sentido',
      es: { name: 'Creación de sentido', desc: 'Con el método Puzzle —confirmación, contradicción, consecuencia— se interpretan los fragmentos de información que probablemente son señales débiles anticipativas.' },
      en: { name: 'Sense-making', desc: 'Through the Puzzle method —confirmation, contradiction, consequence— fragments of information that are likely anticipatory weak signals are interpreted.' },
      fr: { name: 'Création de sens', desc: 'Grâce à la méthode Puzzle —confirmation, contradiction, conséquence— les fragments d\u2019information qui constituent probablement des signaux faibles anticipatifs sont interprétés.' }
    },
    {
      code: 'F8', short: 'Acción',
      es: { name: 'Difusión y Acción', desc: 'Se comunican las señales débiles, las decisiones sobre ellas y los indicadores predictivos de medición con distribuciones de probabilidad.' },
      en: { name: 'Dissemination and Action', desc: 'Weak signals, the decisions on them and predictive measurement indicators are communicated with probability distributions.' },
      fr: { name: 'Diffusion et Action', desc: 'Les signaux faibles, les décisions qui les concernent et les indicateurs prédictifs de mesure sont communiqués avec des distributions de probabilité.' }
    }
  ];

  var PHASE_MS = 4200;   // duración por fase en el ciclo automático
  var BIRTH = 0.30;      // fracción de la fase dedicada al nacimiento

  function vertex(i) {
    var a = -Math.PI / 2 + i * (Math.PI * 2 / N);
    return [CX + Math.cos(a) * R, CY + Math.sin(a) * R];
  }

  function currentLang() {
    var l = document.documentElement.lang;
    return (l === 'en' || l === 'fr') ? l : 'es';
  }

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

  function figure(x, y, s, color) {
    circle(x, y - 7 * s, 3 * s, color || TEAL, 1.3);
    line(x, y - 4 * s, x, y + 6 * s, color || TEAL, 1.3);
    line(x - 4 * s, y + 1 * s, x + 4 * s, y + 1 * s, color || TEAL, 1.3);
    line(x, y + 6 * s, x - 3 * s, y + 12 * s, color || TEAL, 1.3);
    line(x, y + 6 * s, x + 3 * s, y + 12 * s, color || TEAL, 1.3);
  }

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
      line(20, 150, 20, 30, MUTED, 1);
      line(20, 150, 300, 150, MUTED, 1);
      circle(268, 60, 16, ORANGE, 1.3);
      circle(268, 60, 9, ORANGE, 1.1);
      dot(268, 60, 2.2, ORANGE);
      var pts = [];
      var n = 40;
      var reveal = Math.floor(lerp(4, n, clamp01(t / 0.72)));
      for (var i = 0; i <= reveal && i <= n; i++) {
        var x = lerp(24, 268, i / n);
        var y = 118 - i / n * 46 + Math.sin(i * 0.55) * 10 * (1 - i / n);
        pts.push([x, y]);
      }
      if (pts.length > 1) polyline(pts, TEAL, 1.6);
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
      for (var m = 0; m < 4; m++) line(50 + m * 60, 150, 50 + m * 60, 154, MUTED, 1);
    },

    // F1 · Entorno: factores PESTEL+C convergen y un agente IA los convierte en reporte
    f1: function (t) {
      var cx = 160, cy = 80;
      var glyphs = [
        function (x, y) {
          line(x - 7, y - 4, x, y - 9, TEAL); line(x, y - 9, x + 7, y - 4, TEAL);
          line(x - 8, y - 2, x + 8, y - 2, TEAL, 1);
          line(x - 5, y, x - 5, y + 8, TEAL, 1); line(x, y, x, y + 8, TEAL, 1); line(x + 5, y, x + 5, y + 8, TEAL, 1);
        },
        function (x, y) {
          circle(x, y, 7, TEAL, 1.2);
          ctx.fillStyle = TEAL; ctx.font = '16px Inter, sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('$', x, y + 5);
        },
        function (x, y) {
          circle(x - 4, y - 3, 2.6, TEAL, 1.1); circle(x + 4, y - 3, 2.6, TEAL, 1.1);
          line(x - 4, y, x - 4, y + 8, TEAL, 1.1); line(x + 4, y, x + 4, y + 8, TEAL, 1.1);
        },
        function (x, y) {
          ctx.strokeRect(x - 5, y - 5, 10, 10); stroke(TEAL, 1.1);
          for (var p = -3; p <= 3; p += 3) {
            line(x + p, y - 8, x + p, y - 5, TEAL, 1); line(x + p, y + 5, x + p, y + 8, TEAL, 1);
          }
        },
        function (x, y) {
          ctx.beginPath();
          ctx.moveTo(x, y + 8);
          ctx.quadraticCurveTo(x - 8, y, x, y - 8);
          ctx.quadraticCurveTo(x + 8, y, x, y + 8);
          stroke(TEAL, 1.1); ctx.stroke();
          line(x, y - 6, x, y + 8, TEAL, 1);
        },
        function (x, y) {
          line(x, y - 8, x, y + 6, TEAL, 1.1);
          line(x - 8, y - 5, x + 8, y - 5, TEAL, 1.1);
          line(x - 8, y - 5, x - 11, y + 2, TEAL, 1); line(x - 8, y - 5, x - 5, y + 2, TEAL, 1);
          line(x - 11, y + 2, x - 5, y + 2, TEAL, 1);
          line(x + 8, y - 5, x + 5, y + 2, TEAL, 1); line(x + 8, y - 5, x + 11, y + 2, TEAL, 1);
          line(x + 5, y + 2, x + 11, y + 2, TEAL, 1);
        },
        function (x, y) {
          ctx.beginPath();
          ctx.moveTo(x - 7, y - 4);
          ctx.quadraticCurveTo(x, y - 10, x + 7, y - 4);
          ctx.quadraticCurveTo(x + 6, y + 6, x, y + 8);
          ctx.quadraticCurveTo(x - 6, y + 6, x - 7, y - 4);
          stroke(TEAL, 1.1); ctx.stroke();
          dot(x - 3, y - 1, 1.2, TEAL); dot(x + 3, y - 1, 1.2, TEAL);
        }
      ];
      var spread = 1 - ease(clamp01(t / 0.55)) * 0.72;
      for (var i = 0; i < glyphs.length; i++) {
        var ang = -Math.PI / 2 + i * (Math.PI * 2 / glyphs.length);
        var gx = cx + Math.cos(ang) * 92 * spread;
        var gy = cy + Math.sin(ang) * 58 * spread;
        glyphs[i](gx, gy);
      }
      if (t > 0.4) {
        var ai = ease(clamp01((t - 0.4) / 0.3));
        circle(cx, cy, 6 + ai * 2, ORANGE, 1.4);
        for (var s = 0; s < 4; s++) {
          var sa = s * Math.PI / 2 + 0.5;
          line(cx + Math.cos(sa) * 11, cy + Math.sin(sa) * 11, cx + Math.cos(sa) * (13 + ai * 3), cy + Math.sin(sa) * (13 + ai * 3), ORANGE, 1.2);
        }
      }
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
      line(24, 132, 292, 132, MUTED, 1);
      line(292, 132, 284, 127, MUTED, 1);
      line(292, 132, 284, 137, MUTED, 1);
      circle(276, 132, 14 + Math.sin(t * Math.PI) * 3, ORANGE, 1.2);
      var step = Math.sin(t * Math.PI * 4) * 2.4;
      figure(238, 104 + step * 0.4, 1.25, ORANGE);
      figure(198, 106 - step * 0.4, 1.0, TEAL);
      figure(166, 106 + step * 0.4, 1.0, TEAL);
      figure(134, 106 - step * 0.4, 0.95, TEAL);
      line(238, 88, 238, 72, ORANGE, 1.2);
      ctx.beginPath();
      ctx.moveTo(238, 72); ctx.lineTo(252, 76); ctx.lineTo(238, 81);
      ctx.closePath();
      stroke(ORANGE, 1.2); ctx.stroke();
      for (var i = 0; i < 3; i++) {
        line(70 + i * 16, 96 + i * 10, 88 + i * 16, 96 + i * 10, MUTED, 1.2);
      }
    },

    // F3 · Actores: lupa enfocando siluetas-actores y temas
    f3: function (t) {
      var blurred = [[52, 60], [74, 122], [258, 52], [276, 122], [160, 34]];
      for (var i = 0; i < blurred.length; i++) {
        circle(blurred[i][0], blurred[i][1], 4, MUTED, 1);
      }
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
      circle(lx, ly, 46, ORANGE, 1.6);
      line(lx + 33, ly + 33, lx + 56, ly + 56, ORANGE, 2.4);
      ctx.fillStyle = MUTED;
      ctx.font = '15px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('temas', lx, ly + 66);
    },

    // F4 · Articular: piezas de rompecabezas que se articulan
    f4: function (t) {
      function piece(x, y, s, tabTop, tabRight, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.moveTo(0, 0);
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
      var gx = 118, gy = 52;
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
      if (p > 0.9) {
        circle(gx + s, gy + s, 34 + (p - 0.9) * 30, 'rgba(232, 148, 62, 0.4)', 1);
      }
    },

    // F5 · Señales: ondas / señales débiles que se amplifican
    f5: function (t) {
      var ax = 60, ay = 120;
      dot(ax, ay, 2.4, ORANGE);
      for (var i = 0; i < 4; i++) {
        var ph = clamp01(t * 1.4 - i * 0.22);
        if (ph <= 0) continue;
        var r = 8 + ph * 46;
        ctx.beginPath();
        ctx.arc(ax, ay, r, -0.9, 0.9);
        stroke('rgba(63, 193, 180, ' + (0.55 * (1 - ph)) + ')', 1.3);
        ctx.stroke();
      }
      var amp = 6 + t * 26;
      var pts = [];
      for (var x = 120; x <= 292; x += 6) {
        var k = (x - 120) / 172;
        pts.push([x, 92 + Math.sin(k * Math.PI * 3 + t * Math.PI * 2) * amp * k]);
      }
      polyline(pts, TEAL, 1.6);
      if (t > 0.7) {
        var bl = clamp01((t - 0.7) / 0.3);
        circle(292, 92, 5 + bl * 5, ORANGE, 1.3);
        dot(292, 92, 2, ORANGE);
      }
      ctx.fillStyle = MUTED;
      ctx.font = '15px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('señal débil', 40, 150);
      ctx.fillText('señal amplificada', 200, 150);
    },

    // F6 · Memoria: archivos que se consultan
    f6: function (t) {
      drawDocument(52, 74, 60, 44, MUTED);
      drawDocument(58, 64, 60, 44, MUTED);
      drawDocument(64, 54, 60, 44, TEAL);
      ctx.beginPath();
      ctx.ellipse(226, 60, 26, 9, 0, 0, Math.PI * 2);
      stroke(TEAL, 1.3); ctx.stroke();
      line(200, 60, 200, 116, TEAL, 1.3);
      line(252, 60, 252, 116, TEAL, 1.3);
      ctx.beginPath();
      ctx.ellipse(226, 116, 26, 9, 0, 0, Math.PI);
      stroke(TEAL, 1.3); ctx.stroke();
      line(200, 88, 252, 88, MUTED, 1);
      var qx = 40 + (t * 220) % 240;
      line(qx, 36, qx + 26, 36, ORANGE, 1.4);
      dot(qx + 30, 36, 2.4, ORANGE);
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
      var seats = [
        [cx - 72, cy - 30, 1.0], [cx, cy - 48, 1.05], [cx + 72, cy - 30, 1.0],
        [cx - 72, cy + 34, 1.0], [cx + 72, cy + 34, 1.0]
      ];
      for (var i = 0; i < seats.length; i++) {
        figure(seats[i][0], seats[i][1], seats[i][2], TEAL);
      }
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 66, 26, 0, 0, Math.PI * 2);
      stroke(ORANGE, 1.5); ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 40, 14, 0, 0, Math.PI * 2);
      stroke('rgba(232, 148, 62, 0.5)', 1.1); ctx.stroke();
      for (var d = 0; d < 3; d++) {
        var ph = clamp01(t * 1.6 - d * 0.3);
        var bx = cx - 20 + d * 22;
        var by = cy - 62 - ph * 10;
        ctx.globalAlpha = 1 - ph * 0.7;
        dot(bx, by, 2, ORANGE);
        dot(bx + 5, by, 2, ORANGE);
        ctx.globalAlpha = 1;
      }
      drawDocument(cx - 14, cy - 6, 28, 18, TEAL);
    },

    // F8 · Órdenes: briefing sellado y ejecutado
    f8: function (t) {
      drawDocument(70, 48, 84, 104, TEAL);
      var sx = 154, sy = 152;
      circle(sx, sy, 16, ORANGE, 1.5);
      circle(sx, sy, 11, ORANGE, 1.1);
      ctx.beginPath();
      for (var i = 0; i < 5; i++) {
        var a1 = -Math.PI / 2 + i * (Math.PI * 4 / 5);
        var px = sx + Math.cos(a1) * 6, py = sy + Math.sin(a1) * 6;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      stroke(ORANGE, 1); ctx.stroke();
      if (t > 0.35) {
        var cp = ease(clamp01((t - 0.35) / 0.3));
        polyline([[88, 92], [96, 100], [112, 80]], TEAL, 2);
        if (cp > 0.5) {
          polyline([[88, 116], [96, 124], [112, 104]], TEAL, 2);
        }
      }
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

  // ---------- referencias de UI ----------
  var codeEl = document.getElementById('metodoCode');
  var nameEl = document.getElementById('metodoName');
  var descEl = document.getElementById('metodoDesc');
  var dotsEl = document.getElementById('metodoDots');
  var prevBtn = document.getElementById('metodoPrev');
  var nextBtn = document.getElementById('metodoNext');
  var playBtn = document.getElementById('metodoPlay');

  var dotEls = [];
  if (dotsEl) {
    PHASES.forEach(function (p, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'metodo-dot';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', p.code + ' ' + p.es.name);
      d.addEventListener('click', function () {
        pause();
        goTo(i);
      });
      dotsEl.appendChild(d);
      dotEls.push(d);
    });
  }

  function setPhaseUI(idx) {
    var lang = currentLang();
    var p = PHASES[idx];
    if (codeEl) codeEl.textContent = p.code;
    if (nameEl) nameEl.textContent = p[lang].name;
    if (descEl) descEl.textContent = p[lang].desc;
    for (var i = 0; i < dotEls.length; i++) {
      dotEls[i].classList.toggle('active', i === idx);
      dotEls[i].setAttribute('aria-selected', i === idx ? 'true' : 'false');
    }
  }

  // El panel reacciona también al cambio de idioma del sitio
  var lastLang = currentLang();
  if (window.MutationObserver) {
    new MutationObserver(function () {
      var l = currentLang();
      if (l !== lastLang) {
        lastLang = l;
        setPhaseUI(idx);
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  // ---------- grafo de nueve lados ----------
  // Aristas cruzadas del método: memoria que alimenta la acción (F6→F8),
  // comité que puede refocalizar actores o articulación (F7→F3, F7→F4) y
  // cierre del ciclo que lo reinicia (F8→F0).
  var CHORDS = [
    { from: 6, to: 8 },
    { from: 7, to: 3 },
    { from: 7, to: 4 },
    { from: 8, to: 0 }
  ];

  function drawChord(from, to, active) {
    var a = vertex(from);
    var b = vertex(to);
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var len = Math.sqrt(dx * dx + dy * dy);
    var ux = dx / len, uy = dy / len;
    // recortada para no tapar los vértices
    var x1 = a[0] + ux * 16, y1 = a[1] + uy * 16;
    var x2 = b[0] - ux * 20, y2 = b[1] - uy * 20;
    var col = active ? 'rgba(232, 148, 62, 0.85)' : 'rgba(63, 193, 180, 0.22)';
    var halo = active ? 'rgba(232, 148, 62, 0.16)' : null;
    var wMain = active ? 1.8 : 1.1;
    if (halo) line(x1, y1, x2, y2, halo, 5);
    line(x1, y1, x2, y2, col, wMain);
    // punta de flecha en el destino (dirección de la arista)
    var ang = Math.atan2(uy, ux);
    var ah = active ? 8 : 6;
    line(x2, y2, x2 - ah * Math.cos(ang - 0.42), y2 - ah * Math.sin(ang - 0.42), col, wMain);
    line(x2, y2, x2 - ah * Math.cos(ang + 0.42), y2 - ah * Math.sin(ang + 0.42), col, wMain);
  }

  function drawEdge(k, progress, colorOverride, alphaOverride) {
    var a = vertex(k);
    var b = vertex((k + 1) % N);
    var ex = lerp(a[0], b[0], progress);
    var ey = lerp(a[1], b[1], progress);
    var col = colorOverride || TEAL;
    var al = alphaOverride == null ? 1 : alphaOverride;
    line(a[0], a[1], ex, ey, 'rgba(63, 193, 180, ' + (0.18 * al) + ')', 6);
    line(a[0], a[1], ex, ey, col === ORANGE ? 'rgba(232, 148, 62, ' + (0.9 * al) + ')' : 'rgba(63, 193, 180, ' + (0.85 * al) + ')', 2.2);
  }

  function drawGraph(i, local) {
    // aristas cruzadas detrás del perímetro; se encienden cuando su
    // fase origen está activa (memoria → acción, comité → refocalizar)
    for (var c = 0; c < CHORDS.length; c++) {
      drawChord(CHORDS[c].from, CHORDS[c].to, CHORDS[c].from === i);
    }
    for (var k = 0; k < N - 1; k++) {
      if (k < i) drawEdge(k, 1);
    }
    if (i < N - 1) {
      drawEdge(i, ease(clamp01(local / BIRTH)), ORANGE);
    }
    if (i === N - 1 && local > 1 - 0.12) {
      var fl = 1 - (1 - local) / 0.12;
      for (var g = 0; g < N - 1; g++) {
        drawEdge(g, 1, ORANGE, fl * 0.85);
      }
    }
    for (var v = 0; v < N; v++) {
      var p = vertex(v);
      var active = v === i;
      var la = -Math.PI / 2 + v * (Math.PI * 2 / N);
      var tx = p[0] + Math.cos(la) * 22;
      var ty = p[1] + Math.sin(la) * 22 + 4;
      // los textos van al doble porque el lienzo se encoge a la mitad
      ctx.font = (active ? '700 26px' : '600 22px') + ' Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = active ? ORANGE : 'rgba(0, 109, 109, 0.55)';
      ctx.fillText(PHASES[v].code, tx, ty);

      if (active) {
        var pulse = 1 + Math.sin(local * Math.PI * 3) * 0.15;
        circle(p[0], p[1], 10 * pulse, ORANGE, 2);
        circle(p[0], p[1], 17 * pulse, 'rgba(232, 148, 62, 0.35)', 1.2);
        dot(p[0], p[1], 3.4, ORANGE);
      } else {
        var passed = v < i;
        circle(p[0], p[1], passed ? 7 : 5.5, passed ? TEAL : MUTED, passed ? 1.8 : 1.3);
        if (passed) dot(p[0], p[1], 1.8, TEAL);
      }
    }
  }

  // ---------- nacimiento de la escena desde el vértice ----------
  function drawScene(i, local, baseAlpha) {
    var p = vertex(i);
    var birth = clamp01(local / BIRTH);
    var travel = ease(clamp01(birth / 0.55));
    var appear = ease(clamp01((birth - 0.35) / 0.65));
    if (appear <= 0) return;

    if (travel < 1) {
      var sx = lerp(p[0], CX, travel);
      var sy = lerp(p[1], CY, travel);
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(sx, sy);
      stroke('rgba(232, 148, 62, ' + (0.75 * (1 - travel)) + ')', 1.6);
      ctx.stroke();
      dot(sx, sy, 3.2, ORANGE);
      circle(sx, sy, 6 + travel * 6, 'rgba(232, 148, 62, ' + (0.5 * (1 - travel)) + ')', 1);
    }

    var scale = lerp(0.55, 1, appear);
    var alpha = baseAlpha * appear;
    circle(CX, CY, 150 * scale, 'rgba(63, 193, 180, ' + (0.10 * appear) + ')', 1);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(CX, CY);
    ctx.scale(scale, scale);
    ctx.translate(-160, -95);
    DRAW[ORDER[i]](clamp01((local - BIRTH) / (1 - BIRTH)));
    ctx.restore();
  }

  // ---------- ciclo de animación con control manual ----------
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var S = 0.5;  // el eneágono se dibuja al 50%
  canvas.width = W * S * dpr;
  canvas.height = H * S * dpr;
  ctx.scale(S * dpr, S * dpr);

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animId = null;
  var inViewport = true;
  var running = false;

  var idx = 0;
  var phaseStart = null;
  var lastNow = 0;
  var auto = !reduced;

  function render(i, local) {
    ctx.clearRect(0, 0, W, H);
    drawGraph(i, local);
    var out = local > 0.9 ? (1 - local) / 0.1 : 1;
    drawScene(i, local, Math.max(out, 0.001));
  }

  function goTo(i) {
    idx = ((i % N) + N) % N;
    phaseStart = lastNow;
    setPhaseUI(idx);
    if (reduced) renderStatic(idx);
  }

  function frame(now) {
    lastNow = now;
    if (phaseStart === null) phaseStart = now;
    var local = (now - phaseStart) / PHASE_MS;

    if (auto) {
      if (local >= 1) {
        goTo(idx + 1);
        local = 0;
      }
      render(idx, clamp01(local));
    } else {
      // modo manual: la escena queda completa y visible, sin desvanecer
      render(idx, clamp01(Math.min(local, 0.985)));
    }

    animId = requestAnimationFrame(frame);
  }

  function renderStatic(i) {
    setPhaseUI(i);
    ctx.clearRect(0, 0, W, H);
    for (var c = 0; c < CHORDS.length; c++) {
      drawChord(CHORDS[c].from, CHORDS[c].to, CHORDS[c].from === i);
    }
    for (var k = 0; k < N - 1; k++) drawEdge(k, 1);
    for (var v = 0; v < N; v++) {
      var p = vertex(v);
      circle(p[0], p[1], 5.5, v === i ? ORANGE : MUTED, v === i ? 1.8 : 1.3);
    }
    ctx.save();
    ctx.translate(CX, CY);
    ctx.translate(-160, -95);
    DRAW[ORDER[i]](1);
    ctx.restore();
  }

  function updatePlayBtn() {
    if (!playBtn) return;
    playBtn.textContent = auto ? '❚❚' : '▶';
    playBtn.classList.toggle('is-playing', auto);
    var lang = currentLang();
    var labels = {
      es: auto ? 'Pausar el ciclo automático' : 'Reproducir el ciclo automático',
      en: auto ? 'Pause the automatic cycle' : 'Play the automatic cycle',
      fr: auto ? 'Mettre le cycle en pause' : 'Lancer le cycle automatique'
    };
    playBtn.setAttribute('aria-label', labels[lang]);
  }

  function pause() {
    auto = false;
    updatePlayBtn();
  }

  function play() {
    auto = true;
    phaseStart = lastNow; // renace la fase actual al reanudar
    updatePlayBtn();
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { pause(); goTo(idx - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { pause(); goTo(idx + 1); });
  if (playBtn) playBtn.addEventListener('click', function () { if (auto) pause(); else play(); });

  // Clic sobre un vértice del grafo: salta a esa fase
  canvas.addEventListener('click', function (ev) {
    var rect = canvas.getBoundingClientRect();
    var x = (ev.clientX - rect.left) * (W / rect.width);
    var y = (ev.clientY - rect.top) * (H / rect.height);
    var best = -1;
    var bestD = 48; // radio de captura en coordenadas internas
    for (var v = 0; v < N; v++) {
      var p = vertex(v);
      var d = Math.sqrt((x - p[0]) * (x - p[0]) + (y - p[1]) * (y - p[1]));
      if (d < bestD) { bestD = d; best = v; }
    }
    if (best >= 0) {
      pause();
      goTo(best);
    }
  });

  // Teclas ← → con el escenario enfocado
  var stage = canvas.closest('.metodo-stage');
  if (stage) {
    stage.setAttribute('tabindex', '0');
    stage.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); pause(); goTo(idx - 1); }
      else if (ev.key === 'ArrowRight') { ev.preventDefault(); pause(); goTo(idx + 1); }
      else if (ev.key === ' ' && ev.target === stage) { ev.preventDefault(); if (auto) pause(); else play(); }
    });
  }

  function start() {
    if (running) return;
    running = true;
    animId = requestAnimationFrame(frame);
  }

  function stop() {
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    running = false;
  }

  updatePlayBtn();

  if (reduced) {
    renderStatic(0);
  } else {
    new IntersectionObserver(function (entries) {
      inViewport = entries[0].isIntersecting;
      if (inViewport && !document.hidden) start(); else stop();
    }, { threshold: 0.1 }).observe(canvas);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (inViewport) start();
    });

    setPhaseUI(0);
    start();
  }
})();

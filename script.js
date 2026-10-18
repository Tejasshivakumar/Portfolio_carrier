(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------------- theme ---------------- */
  function isDark() {
    var t = root.dataset.theme;
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  var themeBtn = document.getElementById('theme');
  themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    lab.retheme();
  });
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', function () { lab.retheme(); });
  }
  function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

  /* ---------------- crack-to-graph lab ---------------- */
  var lab = (function () {
    var canvas = document.getElementById('lab');
    var ctx = canvas.getContext('2d');
    var statsEl = document.getElementById('stats');
    var W = 0, H = 0, dpr = 1;
    var texture = null;
    var nodes = [];   // {x, y} normalised 0..1
    var edges = [];   // {a, b, w, jit: [..]}
    var preds = [];   // {a, b}
    var predT = 1;    // 0..1 draw-in progress
    var view = 'graph';
    var drawing = null; // array of px points while dragging
    var colors = {};

    function readColors() {
      colors = {
        ink: cssVar('--ink'), coral: cssVar('--coral'), violet: cssVar('--violet'),
        teal: cssVar('--teal'), paper: cssVar('--paper'),
        concrete: isDark() ? '#2B2E34' : '#C7CACF',
        crack: isDark() ? '#0B0C0E' : '#2A2D33'
      };
    }

    function makeTexture() {
      var t = document.createElement('canvas');
      t.width = Math.max(1, Math.round(W * dpr));
      t.height = Math.max(1, Math.round(H * dpr));
      var c = t.getContext('2d');
      c.fillStyle = colors.concrete;
      c.fillRect(0, 0, t.width, t.height);
      var n = Math.round(t.width * t.height / 90);
      var dark = isDark();
      var seed = 7;
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      for (var i = 0; i < n; i++) {
        var x = rnd() * t.width, y = rnd() * t.height;
        var s = rnd();
        var light = s > 0.5;
        var a = 0.05 + rnd() * 0.12;
        c.fillStyle = light ? (dark ? 'rgba(255,255,255,' + a + ')' : 'rgba(255,255,255,' + (a + .1) + ')')
                            : 'rgba(0,0,0,' + a + ')';
        var r = (rnd() < 0.03 ? 2.5 + rnd() * 3 : 0.6 + rnd() * 1.2) * dpr;
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      }
      texture = t;
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      makeTexture();
      draw();
    }

    function px(n) { return { x: n.x * W, y: n.y * H }; }
    function scale() { return W / 560; }

    function degree() {
      var d = new Array(nodes.length).fill(0);
      edges.forEach(function (e) { d[e.a]++; d[e.b]++; });
      return d;
    }

    function nearestNode(p, maxDist) {
      var best = -1, bd = maxDist;
      nodes.forEach(function (n, i) {
        var q = px(n), d = Math.hypot(q.x - p.x, q.y - p.y);
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    }

    function addNode(p) { nodes.push({ x: p.x / W, y: p.y / H }); return nodes.length - 1; }
    function addEdge(a, b, w) {
      if (a === b) return;
      for (var i = 0; i < edges.length; i++) {
        var e = edges[i];
        if ((e.a === a && e.b === b) || (e.a === b && e.b === a)) return;
      }
      var jit = [];
      for (var k = 0; k < 4; k++) jit.push((Math.random() - 0.5));
      edges.push({ a: a, b: b, w: w, jit: jit });
    }

    function resample(points, step) {
      var out = [points[0]];
      var acc = 0;
      for (var i = 1; i < points.length; i++) {
        var p = points[i - 1], q = points[i];
        var d = Math.hypot(q.x - p.x, q.y - p.y);
        acc += d;
        if (acc >= step) { out.push(q); acc = 0; }
      }
      var last = points[points.length - 1];
      var tail = out[out.length - 1];
      if (Math.hypot(last.x - tail.x, last.y - tail.y) > step * 0.4) out.push(last);
      else out[out.length - 1] = last;
      return out;
    }

    function addStroke(points) {
      if (points.length < 2) return;
      var step = Math.max(16, W * 0.045);
      var snap = Math.max(14, W * 0.035);
      var pts = resample(points, step);
      if (pts.length < 2) return;
      var w = (1.6 + Math.random() * 2.2);
      var prev = null;
      pts.forEach(function (p, i) {
        var idx = -1;
        if (i === 0 || i === pts.length - 1) idx = nearestNode(p, snap);
        if (idx === -1) idx = addNode(p);
        if (prev !== null) addEdge(prev, idx, w * (0.75 + Math.random() * 0.5));
        prev = idx;
      });
      preds = [];
      updateStats();
      draw();
    }

    function hopsWithin(src, maxHops) {
      var adj = nodes.map(function () { return []; });
      edges.forEach(function (e) { adj[e.a].push(e.b); adj[e.b].push(e.a); });
      var seen = {}; seen[src] = 0;
      var q = [src];
      while (q.length) {
        var u = q.shift();
        if (seen[u] >= maxHops) continue;
        adj[u].forEach(function (v) { if (!(v in seen)) { seen[v] = seen[u] + 1; q.push(v); } });
      }
      return { seen: seen, adj: adj };
    }

    function predict() {
      preds = [];
      var deg = degree();
      var R = W * 0.32;
      var used = {};
      nodes.forEach(function (n, i) {
        if (deg[i] !== 1) return;
        var h = hopsWithin(i, 5);
        var nb = h.adj[i][0];
        var p = px(n), pn = px(nodes[nb]);
        var dx = p.x - pn.x, dy = p.y - pn.y, dl = Math.hypot(dx, dy) || 1;
        dx /= dl; dy /= dl;
        var best = -1, bs = 0.3;
        nodes.forEach(function (m, j) {
          if (j === i || (j in h.seen)) return;
          var q = px(m), vx = q.x - p.x, vy = q.y - p.y, d = Math.hypot(vx, vy);
          if (d > R || d < 1) return;
          var cos = (vx * dx + vy * dy) / d;
          var s = cos * (1 - d / R) + (deg[j] === 1 ? 0.15 : 0);
          if (s > bs) { bs = s; best = j; }
        });
        if (best !== -1) {
          var key = Math.min(i, best) + '-' + Math.max(i, best);
          if (!used[key]) { used[key] = true; preds.push({ a: i, b: best }); }
        }
      });
      predT = 0;
      var start = null;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { predT = 1; draw(); updateStats(); return; }
      function tick(ts) {
        if (start === null) start = ts;
        predT = Math.min(1, (ts - start) / 650);
        draw();
        if (predT < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      updateStats();
    }

    function drawCrack(alpha) {
      var s = scale();
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      edges.forEach(function (e) {
        var a = px(nodes[e.a]), b = px(nodes[e.b]);
        var mx = b.x - a.x, my = b.y - a.y, len = Math.hypot(mx, my) || 1;
        var nx = -my / len, ny = mx / len;
        var amp = Math.min(6, len * 0.12) * s;
        // light lip
        ctx.strokeStyle = isDark() ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.45)';
        ctx.lineWidth = (e.w + 2.2) * s;
        path(a, mx, my, nx, ny, amp, e.jit, 0.8);
        ctx.stroke();
        ctx.strokeStyle = colors.crack;
        ctx.lineWidth = e.w * s;
        path(a, mx, my, nx, ny, amp, e.jit, 0);
        ctx.stroke();
      });
      ctx.restore();
    }
    function path(a, mx, my, nx, ny, amp, jit, off) {
      ctx.beginPath();
      ctx.moveTo(a.x + nx * off, a.y + ny * off);
      for (var k = 1; k <= 4; k++) {
        var t = k / 5;
        ctx.lineTo(a.x + mx * t + nx * (jit[k - 1] * amp + off), a.y + my * t + ny * (jit[k - 1] * amp + off));
      }
      ctx.lineTo(a.x + mx + nx * off, a.y + my + ny * off);
    }

    function drawGraph() {
      var s = scale();
      var deg = degree();
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = colors.ink;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 2 * s;
      edges.forEach(function (e) {
        var a = px(nodes[e.a]), b = px(nodes[e.b]);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      ctx.globalAlpha = 1;
      // predictions
      if (preds.length) {
        ctx.strokeStyle = colors.teal;
        ctx.lineWidth = 3 * s;
        ctx.setLineDash([7 * s, 6 * s]);
        preds.forEach(function (p) {
          var a = px(nodes[p.a]), b = px(nodes[p.b]);
          ctx.beginPath(); ctx.moveTo(a.x, a.y);
          ctx.lineTo(a.x + (b.x - a.x) * predT, a.y + (b.y - a.y) * predT);
          ctx.stroke();
        });
        ctx.setLineDash([]);
      }
      nodes.forEach(function (n, i) {
        var p = px(n), d = deg[i];
        ctx.beginPath();
        if (d >= 3) {
          var r = 7 * s;
          ctx.fillStyle = colors.violet;
          roundRect(p.x - r, p.y - r, r * 2, r * 2, 3 * s);
          ctx.fill();
          ctx.lineWidth = 2 * s; ctx.strokeStyle = colors.paper; ctx.stroke();
        } else if (d === 1 || d === 0) {
          ctx.arc(p.x, p.y, 6.5 * s, 0, Math.PI * 2);
          ctx.fillStyle = colors.coral; ctx.fill();
          ctx.lineWidth = 2 * s; ctx.strokeStyle = colors.paper; ctx.stroke();
        } else {
          ctx.arc(p.x, p.y, 3.4 * s, 0, Math.PI * 2);
          ctx.fillStyle = colors.ink; ctx.fill();
        }
      });
      ctx.restore();
    }
    function roundRect(x, y, w, h, r) {
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }

    function draw() {
      if (!W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (texture) ctx.drawImage(texture, 0, 0, W, H);
      drawCrack(view === 'graph' ? 0.35 : 1);
      if (view === 'graph') drawGraph();
      if (drawing && drawing.length > 1) {
        ctx.save();
        ctx.strokeStyle = colors.crack; ctx.lineWidth = 3 * scale(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(drawing[0].x, drawing[0].y);
        drawing.forEach(function (p) { ctx.lineTo(p.x, p.y); });
        ctx.stroke(); ctx.restore();
      }
      if (!nodes.length && !drawing) {
        ctx.save();
        ctx.fillStyle = colors.ink; ctx.globalAlpha = .6;
        ctx.font = '700 ' + Math.round(18 * Math.max(.8, scale())) + 'px "Overpass", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Drag here to draw a crack', W / 2, H / 2);
        ctx.restore();
      }
    }

    function updateStats() {
      var deg = degree();
      var ends = deg.filter(function (d) { return d <= 1; }).length;
      var jct = deg.filter(function (d) { return d >= 3; }).length;
      if (!nodes.length) { statsEl.textContent = 'Empty surface. Drag to draw a crack.'; return; }
      statsEl.textContent = nodes.length + ' nodes, ' + edges.length + ' edges, ' + ends + ' endpoints, ' + jct +
        (jct === 1 ? ' junction' : ' junctions') + (preds.length ? ', ' + preds.length + ' predicted ' + (preds.length === 1 ? 'link' : 'links') : '');
    }

    function local(ev) {
      var r = canvas.getBoundingClientRect();
      return { x: ev.clientX - r.left, y: ev.clientY - r.top };
    }
    canvas.addEventListener('pointerdown', function (ev) {
      ev.preventDefault();
      canvas.setPointerCapture(ev.pointerId);
      drawing = [local(ev)];
      draw();
    });
    canvas.addEventListener('pointermove', function (ev) {
      if (!drawing) return;
      var p = local(ev), l = drawing[drawing.length - 1];
      if (Math.hypot(p.x - l.x, p.y - l.y) > 3) { drawing.push(p); draw(); }
    });
    function end() {
      if (!drawing) return;
      var pts = drawing; drawing = null;
      if (pts.length > 1) addStroke(pts); else draw();
    }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);

    document.getElementById('predict').addEventListener('click', predict);
    document.getElementById('clear').addEventListener('click', function () {
      nodes = []; edges = []; preds = []; updateStats(); draw();
    });
    var segBtns = document.querySelectorAll('.seg-btn');
    segBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        view = b.dataset.view;
        segBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        draw();
      });
    });

    function seed() {
      // A main transverse crack with a branch, plus a separate fragment the predictor can join.
      var strokes = [
        [[.06, .58], [.16, .55], [.27, .58], [.37, .52], [.46, .50], [.55, .53]],
        [[.37, .52], [.40, .40], [.45, .30], [.47, .19]],
        [[.37, .52], [.33, .65], [.30, .78], [.25, .90]],
        [[.68, .54], [.77, .50], [.86, .55], [.95, .50]],
        [[.86, .55], [.88, .68], [.84, .80]]
      ];
      strokes.forEach(function (s) {
        addStroke(s.map(function (p) { return { x: p[0] * W, y: p[1] * H }; }));
      });
    }

    readColors();
    resize();
    seed();
    if (window.ResizeObserver) new ResizeObserver(function () { resize(); }).observe(canvas);
    else window.addEventListener('resize', resize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);

    return {
      retheme: function () { readColors(); makeTexture(); draw(); }
    };
  })();

  /* ---------------- project tabs ---------------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    if (tab.id === 'tab-topo') growBars();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = null;
      if (k === 'ArrowDown' || k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (k === 'ArrowUp' || k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (k === 'Home') n = tabs[0];
      if (k === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); select(n, true); }
    });
  });

  /* ---------------- code toggle ---------------- */
  var codeTabs = document.querySelectorAll('.code-tab');
  codeTabs.forEach(function (b) {
    b.addEventListener('click', function () {
      codeTabs.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      document.querySelectorAll('.code-body').forEach(function (pre) { pre.hidden = pre.dataset.lang !== b.dataset.lang; });
    });
  });

  /* ---------------- bar chart ---------------- */
  var results = [
    { m: 'MLP', v: 0.341, cls: 'base' },
    { m: 'GCN', v: 0.342 },
    { m: 'GAT', v: 0.429 },
    { m: 'GraphSAGE', v: 0.489 },
    { m: 'GINE', v: 0.501, cls: 'best' }
  ];
  var bars = document.getElementById('bars');
  results.forEach(function (r) {
    var row = document.createElement('div');
    row.className = 'bar' + (r.cls ? ' ' + r.cls : '');
    row.innerHTML = '<span class="bar-name"></span><span class="bar-track"><span class="bar-fill"></span></span><span class="bar-val"></span>';
    row.querySelector('.bar-name').textContent = r.m;
    row.querySelector('.bar-val').textContent = r.v.toFixed(3);
    row.querySelector('.bar-fill').dataset.w = (r.v / 0.6 * 100).toFixed(1) + '%';
    bars.appendChild(row);
  });
  var grown = false;
  function growBars() {
    if (grown) return;
    grown = true;
    requestAnimationFrame(function () {
      bars.querySelectorAll('.bar-fill').forEach(function (f) { f.style.width = f.dataset.w; });
    });
  }

  /* ---------------- confusion matrix ---------------- */
  var cells = document.querySelectorAll('.mx-cell');
  var tip = document.getElementById('mx-tip');
  cells.forEach(function (c) {
    c.setAttribute('aria-pressed', 'false');
    c.addEventListener('click', function () {
      cells.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
      tip.textContent = c.dataset.tip;
    });
  });

  /* ---------------- copy email ---------------- */
  var copyBtn = document.getElementById('copy');
  var mail = document.getElementById('mail');
  copyBtn.addEventListener('click', function () {
    var text = mail.textContent.trim();
    function done() {
      copyBtn.textContent = 'Copied';
      setTimeout(function () { copyBtn.textContent = 'Copy email'; }, 1800);
    }
    function fallback() {
      var r = document.createRange(); r.selectNodeContents(mail);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      copyBtn.textContent = 'Selected, press Ctrl+C';
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
  });
})();

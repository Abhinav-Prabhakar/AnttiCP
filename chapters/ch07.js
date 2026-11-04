/* Chapter 07 — Graph Algorithms */
(() => {
  const $ = CP.$;
  const $$ = CP.$$;
  const reduceMotion = CP.reduceMotion;

  /* ========================================================================
     Hero — a dot travelling along the shortest path
     ======================================================================== */
  (() => {
    const path = document.querySelector('.ch07-hero__live');
    const dot = document.querySelector('.ch07-hero__traveller');
    if (!path || !dot) return;
    if (reduceMotion) { dot.style.display = 'none'; return; }
    const total = path.getTotalLength();
    let start = null;
    const duration = 9000;
    function tick(ts) {
      if (!start) start = ts;
      const t = ((ts - start) % duration) / duration;
      const p = path.getPointAtLength(total * t);
      dot.setAttribute('cx', p.x.toFixed(2));
      dot.setAttribute('cy', p.y.toFixed(2));
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ========================================================================
     7.1.2 — three representations of the same graph
     ======================================================================== */
  (() => {
    const rep = $('#ch07-rep');
    if (!rep) return;
    const list = $('#ch07-rep-list');
    const matrix = $('#ch07-rep-matrix');
    const edgesOut = $('#ch07-rep-edges');
    const buttons = $$('[data-rep-mode]', rep);
    if (!list || !matrix || !edgesOut) return;

    const EDGES = [[1, 2, 5], [2, 3, 7], [2, 4, 6], [3, 4, 5], [4, 1, 2]];
    const weight = {};
    EDGES.forEach(([a, b, w]) => { weight[a + '-' + b] = w; });
    const adj = { 1: [], 2: [], 3: [], 4: [] };
    EDGES.forEach(([a, b, w]) => adj[a].push([b, w]));

    function render(weighted) {
      list.textContent = [1, 2, 3, 4].map((a) =>
        'adj[' + a + ']  →  ' + adj[a].map(([b, w]) => weighted ? '(' + b + ', ' + w + ')' : String(b)).join(', ')
      ).join('\n');

      edgesOut.textContent = EDGES.map(([a, b, w]) =>
        weighted ? '(' + a + ', ' + b + ', ' + w + ')' : '(' + a + ', ' + b + ')'
      ).join('\n');

      let html = '<span class="ch07-matrix__corner"></span>';
      for (let j = 1; j <= 4; j++) html += '<span class="ch07-matrix__head">' + j + '</span>';
      for (let i = 1; i <= 4; i++) {
        html += '<span class="ch07-matrix__head">' + i + '</span>';
        for (let j = 1; j <= 4; j++) {
          const w = weight[i + '-' + j] || 0;
          const value = weighted ? w : (w ? 1 : 0);
          if (value) {
            html += '<span class="ch07-matrix__cell is-edge" tabindex="0" data-tip="adj[' + i + '][' + j + '] = ' + value + '">' + value + '</span>';
          } else {
            html += '<span class="ch07-matrix__cell">0</span>';
          }
        }
      }
      matrix.innerHTML = html;
      rep.classList.toggle('is-unweighted', !weighted);
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const weighted = btn.dataset.repMode === 'weighted';
        buttons.forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        render(weighted);
      });
    });

    render(true);
  })();

  /* ========================================================================
     7.2 — traversal and shortest-path simulator
     ======================================================================== */
  (() => {
    const sim = $('#ch07-sim');
    if (!sim) return;
    const svg = $('#ch07-sim-svg');
    const msgEl = $('#ch07-sim-msg');
    const countEl = $('#ch07-sim-count');
    const sourceEl = $('#ch07-sim-source');
    const frontierEl = $('#ch07-sim-frontier');
    const frontierLabel = $('#ch07-sim-frontier-label');
    const badgeLegend = $('#ch07-sim-badge-legend');
    const playBtn = $('#ch07-sim-play');
    const stepBtn = $('#ch07-sim-step');
    const resetBtn = $('#ch07-sim-reset');
    const jump = $('#ch07-open-dijkstra');
    if (!svg || !msgEl) return;

    const NODES = [
      { id: 1, x: 105, y: 95 },
      { id: 2, x: 300, y: 65 },
      { id: 3, x: 255, y: 265 },
      { id: 4, x: 490, y: 105 },
      { id: 5, x: 445, y: 300 },
      { id: 6, x: 670, y: 205 },
      { id: 7, x: 120, y: 355 }
    ];
    const EDGES = [
      { a: 1, b: 2, w: 4 },
      { a: 1, b: 3, w: 2 },
      { a: 2, b: 3, w: 1 },
      { a: 2, b: 4, w: 5 },
      { a: 3, b: 4, w: 8 },
      { a: 3, b: 5, w: 10 },
      { a: 3, b: 7, w: 6 },
      { a: 4, b: 5, w: 2 },
      { a: 4, b: 6, w: 6 },
      { a: 5, b: 6, w: 3 },
      { a: 5, b: 7, w: 7 }
    ];
    const byId = {};
    NODES.forEach((n) => { byId[n.id] = n; });
    const keyOf = (a, b) => Math.min(a, b) + '-' + Math.max(a, b);
    const adj = {};
    NODES.forEach((n) => { adj[n.id] = []; });
    EDGES.forEach((e) => {
      const key = keyOf(e.a, e.b);
      adj[e.a].push({ to: e.b, w: e.w, key });
      adj[e.b].push({ to: e.a, w: e.w, key });
    });
    Object.values(adj).forEach((a) => a.sort((p, q) => p.to - q.to));

    /* --- draw the graph once --- */
    const parts = ['<g class="ch07-sim__edges">'];
    EDGES.forEach((e) => {
      const A = byId[e.a];
      const B = byId[e.b];
      const key = keyOf(e.a, e.b);
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const len = Math.hypot(dx, dy) || 1;
      const mx = (A.x + B.x) / 2 - (dy / len) * 14;
      const my = (A.y + B.y) / 2 + (dx / len) * 14;
      parts.push('<line class="ch07-sim__edge" data-edge="' + key + '" x1="' + A.x + '" y1="' + A.y + '" x2="' + B.x + '" y2="' + B.y + '"/>');
      parts.push('<line class="ch07-sim__hit" x1="' + A.x + '" y1="' + A.y + '" x2="' + B.x + '" y2="' + B.y + '" tabindex="0" data-tip="Edge ' + e.a + '–' + e.b + ' · weight ' + e.w + '"/>');
      parts.push('<text class="ch07-sim__w" x="' + mx.toFixed(1) + '" y="' + my.toFixed(1) + '">' + e.w + '</text>');
    });
    parts.push('</g>');
    NODES.forEach((n) => {
      const deg = adj[n.id].length;
      const nbrs = adj[n.id].map((e) => e.to).join(', ');
      parts.push(
        '<g class="ch07-sim__node" data-node="' + n.id + '" tabindex="0" role="button" aria-label="Node ' + n.id + ', make it the source" data-tip="Node ' + n.id + ' · degree ' + deg + ' · neighbours ' + nbrs + '">' +
          '<circle class="ch07-sim__halo" cx="' + n.x + '" cy="' + n.y + '" r="27"/>' +
          '<circle class="ch07-sim__disc" cx="' + n.x + '" cy="' + n.y + '" r="18"/>' +
          '<text x="' + n.x + '" y="' + n.y + '">' + n.id + '</text>' +
          '<text class="ch07-sim__badge" x="' + (n.x + 26) + '" y="' + (n.y - 23) + '"></text>' +
        '</g>'
      );
    });
    svg.innerHTML = parts.join('');

    const edgeEls = {};
    $$('.ch07-sim__edge', svg).forEach((el) => { edgeEls[el.dataset.edge] = el; });
    const nodeEls = {};
    $$('.ch07-sim__node', svg).forEach((el) => {
      nodeEls[+el.dataset.node] = {
        g: el,
        badge: el.querySelector('.ch07-sim__badge')
      };
    });

    let mode = 'bfs';
    let source = 1;
    let steps = [];
    let index = 0;
    let timer = null;

    function base(extra) {
      return Object.assign({
        msg: '',
        node: -1,
        active: [],
        tree: [],
        vis: [],
        processed: [],
        dist: {},
        order: {},
        queue: '',
        label: ''
      }, extra);
    }

    function bfsSteps(src) {
      const dist = {};
      const vis = new Set([src]);
      const queue = [src];
      const tree = new Set();
      dist[src] = 0;
      const out = [base({
        msg: 'Source ' + src + ' at distance 0. The queue starts with it.',
        node: src,
        queue: String(src),
        label: 'queue · FIFO',
        vis: [...vis],
        dist: { ...dist }
      })];
      while (queue.length) {
        const u = queue.shift();
        const active = [];
        const found = [];
        adj[u].forEach((e) => {
          active.push(e.key);
          if (!vis.has(e.to)) {
            vis.add(e.to);
            dist[e.to] = dist[u] + 1;
            tree.add(e.key);
            queue.push(e.to);
            found.push(e.to);
          }
        });
        out.push(base({
          msg: found.length
            ? 'Settle ' + u + '. Discover ' + found.join(', ') + ' at distance ' + dist[found[0]] + '.'
            : 'Settle ' + u + '. No unvisited neighbours remain.',
          node: u,
          active,
          tree: [...tree],
          vis: [...vis],
          dist: { ...dist },
          queue: queue.join('  ') || 'empty',
          label: 'queue · FIFO'
        }));
      }
      out.push(base({
        msg: 'BFS complete. Each distance is the fewest edges from node ' + src + '.',
        vis: [...vis],
        tree: [...tree],
        dist: { ...dist },
        queue: 'empty',
        label: 'queue · FIFO'
      }));
      return out;
    }

    function dfsSteps(src) {
      const vis = new Set();
      const onStack = new Set([src]);
      const order = new Map();
      const parent = {};
      const tree = new Set();
      const stack = [src];
      const out = [base({
        msg: 'Push ' + src + ' on the stack.',
        node: src,
        queue: String(src),
        label: 'stack · top first',
        vis: []
      })];

      while (stack.length) {
        const u = stack.pop();
        onStack.delete(u);
        if (vis.has(u)) continue;
        vis.add(u);
        order.set(u, order.size + 1);
        if (parent[u] != null) tree.add(keyOf(u, parent[u]));
        const pushed = [];
        const candidates = adj[u].filter((e) => !vis.has(e.to) && !onStack.has(e.to));
        candidates.sort((a, b) => b.to - a.to);
        candidates.forEach((e) => {
          parent[e.to] = u;
          stack.push(e.to);
          onStack.add(e.to);
          pushed.push(e.to);
        });
        out.push(base({
          msg: pushed.length
            ? 'Visit ' + u + ' (number ' + order.get(u) + '). Push ' + pushed.join(', ') + '.'
            : 'Visit ' + u + ' (number ' + order.get(u) + '). Nothing new to push; backtrack.',
          node: u,
          active: adj[u].map((e) => e.key),
          tree: [...tree],
          vis: [...vis],
          order: Object.fromEntries(order),
          queue: [...stack].reverse().join('  ') || 'empty',
          label: 'stack · top first'
        }));
      }
      out.push(base({
        msg: 'DFS complete. The badges give the order in which nodes were first visited.',
        vis: [...vis],
        tree: [...tree],
        order: Object.fromEntries(order),
        queue: 'empty',
        label: 'stack · top first'
      }));
      return out;
    }

    function dijkstraSteps(src) {
      const dist = {};
      const processed = new Set();
      const parent = {};
      let pq = [{ d: 0, n: src }];
      NODES.forEach((n) => { dist[n.id] = Infinity; });
      dist[src] = 0;
      const out = [base({
        msg: 'Distance to ' + src + ' is 0; every other node is ∞.',
        node: src,
        dist: { ...dist },
        queue: '(0, ' + src + ')',
        label: 'priority queue · (distance, node)'
      })];

      while (pq.length) {
        pq.sort((a, b) => a.d - b.d || a.n - b.n);
        const cur = pq.shift();
        if (processed.has(cur.n)) continue;
        const u = cur.n;
        processed.add(u);
        const relaxed = [];
        const active = [];
        adj[u].forEach((e) => {
          active.push(e.key);
          const candidate = dist[u] + e.w;
          if (candidate < dist[e.to]) {
            dist[e.to] = candidate;
            parent[e.to] = u;
            pq.push({ d: candidate, n: e.to });
            relaxed.push(e.to + ' (' + candidate + ')');
          }
        });
        const treeNow = [];
        processed.forEach((v) => {
          if (parent[v] != null) treeNow.push(keyOf(v, parent[v]));
        });
        out.push(base({
          msg: 'Settle ' + u + ' at distance ' + dist[u] + '. ' +
            (relaxed.length ? 'Relax ' + relaxed.join(', ') + '.' : 'No distance improves.'),
          node: u,
          active,
          tree: treeNow,
          processed: [...processed],
          dist: { ...dist },
          queue: pq.sort((a, b) => a.d - b.d || a.n - b.n).map((x) => '(' + x.d + ', ' + x.n + ')').join('  ') || 'empty',
          label: 'priority queue · (distance, node)'
        }));
      }
      const finalTree = [];
      processed.forEach((v) => {
        if (parent[v] != null) finalTree.push(keyOf(v, parent[v]));
      });
      out.push(base({
        msg: 'Dijkstra complete. Labels are final shortest distances from node ' + src + '.',
        processed: [...processed],
        tree: finalTree,
        dist: { ...dist },
        queue: 'empty',
        label: 'priority queue · (distance, node)'
      }));
      return out;
    }

    function rebuild() {
      stop();
      steps = mode === 'bfs' ? bfsSteps(source) : mode === 'dfs' ? dfsSteps(source) : dijkstraSteps(source);
      index = 0;
      if (sourceEl) sourceEl.textContent = String(source);
      render();
    }

    function render() {
      const st = steps[index] || steps[0];
      if (!st) return;

      Object.entries(edgeEls).forEach(([key, el]) => {
        el.classList.toggle('is-tree', st.tree.indexOf(key) !== -1);
        el.classList.toggle('is-active', st.active.indexOf(key) !== -1);
      });

      NODES.forEach((n) => {
        const refs = nodeEls[n.id];
        if (!refs) return;
        const visited = st.vis.indexOf(n.id) !== -1;
        const settled = st.processed.indexOf(n.id) !== -1;
        refs.g.classList.toggle('is-visited', visited || (mode === 'dijkstra' && isFinite(st.dist[n.id]) && !settled));
        refs.g.classList.toggle('is-settled', settled);
        refs.g.classList.toggle('is-active', st.node === n.id);

        let text = '';
        let inf = false;
        if (mode === 'bfs') {
          if (visited) text = String(st.dist[n.id]);
        } else if (mode === 'dfs') {
          if (st.order[n.id]) text = String(st.order[n.id]);
        } else {
          if (isFinite(st.dist[n.id])) text = String(st.dist[n.id]);
          else { text = '∞'; inf = true; }
        }
        refs.badge.textContent = text;
        refs.badge.classList.toggle('is-on', text !== '');
        refs.badge.classList.toggle('is-inf', inf);
      });

      msgEl.textContent = st.msg;
      if (countEl) countEl.textContent = 'step ' + index + ' / ' + (steps.length - 1);
      if (frontierEl) frontierEl.textContent = st.queue || 'empty';
      if (frontierLabel) frontierLabel.textContent = st.label;
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      if (playBtn) {
        const label = playBtn.querySelector('span');
        const use = playBtn.querySelector('use');
        if (label) label.textContent = 'Play';
        if (use) use.setAttribute('href', '#i-play');
      }
    }

    function stepOnce() {
      if (index < steps.length - 1) {
        index++;
        render();
      }
    }

    function play() {
      if (timer) { stop(); return; }
      if (index >= steps.length - 1) { index = 0; render(); }
      const label = playBtn && playBtn.querySelector('span');
      const use = playBtn && playBtn.querySelector('use');
      if (label) label.textContent = 'Pause';
      if (use) use.setAttribute('href', '#i-pause');
      timer = setInterval(() => {
        if (index >= steps.length - 1) { stop(); return; }
        stepOnce();
        if (index >= steps.length - 1) stop();
      }, reduceMotion ? 260 : 900);
    }

    function setMode(next, opts = {}) {
      mode = next;
      $$('[data-sim-mode]', sim).forEach((b) => {
        const on = b.dataset.simMode === next;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      if (badgeLegend) {
        const label = next === 'dfs' ? 'visit order' : 'distance label';
        badgeLegend.innerHTML = '<i class="ch07-key ch07-key--badge"></i>' + label;
      }
      if (opts.source) source = opts.source;
      rebuild();
      if (opts.step) { index = Math.min(1, steps.length - 1); render(); }
    }

    $$('[data-sim-mode]', sim).forEach((btn) => {
      btn.addEventListener('click', () => setMode(btn.dataset.simMode));
    });
    if (stepBtn) stepBtn.addEventListener('click', () => { stop(); stepOnce(); });
    if (playBtn) playBtn.addEventListener('click', play);
    if (resetBtn) resetBtn.addEventListener('click', () => { stop(); index = 0; render(); });

    svg.addEventListener('click', (e) => {
      const g = e.target.closest('[data-node]');
      if (!g) return;
      const id = +g.dataset.node;
      if (!id) return;
      stop();
      source = id;
      rebuild();
    });
    svg.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const g = e.target.closest('[data-node]');
      if (!g) return;
      e.preventDefault();
      const id = +g.dataset.node;
      if (!id) return;
      stop();
      source = id;
      rebuild();
    });

    if (jump) {
      jump.addEventListener('click', () => {
        setMode('dijkstra', { step: true });
        sim.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    }

    if (badgeLegend) badgeLegend.innerHTML = '<i class="ch07-key ch07-key--badge"></i>distance label';
    rebuild();
  })();

  /* ========================================================================
     7.3.3 — Floyd–Warshall matrices
     ======================================================================== */
  (() => {
    const INF = Infinity;
    const START = [
      [0, 5, INF, 9, 1],
      [5, 0, 2, INF, INF],
      [INF, 2, 0, 7, INF],
      [9, INF, 7, 0, 2],
      [1, INF, INF, 2, 0]
    ];
    const K2 = [
      [0, 5, 7, 9, 1],
      [5, 0, 2, 14, 6],
      [7, 2, 0, 7, 8],
      [9, 14, 7, 0, 2],
      [1, 6, 8, 2, 0]
    ];
    const FINAL = [
      [0, 5, 7, 3, 1],
      [5, 0, 2, 8, 6],
      [7, 2, 0, 7, 8],
      [3, 8, 7, 0, 2],
      [1, 6, 8, 2, 0]
    ];
    const stages = [
      { id: 'ch07-fw-0', m: START, changed: [] },
      { id: 'ch07-fw-2', m: K2, changed: ['0-2', '1-3', '1-4', '2-0', '2-4', '3-1', '4-1', '4-2'] },
      { id: 'ch07-fw-5', m: FINAL, changed: ['0-3', '1-3', '3-0', '3-1'] }
    ];
    stages.forEach((stage) => {
      const root = document.getElementById(stage.id);
      if (!root) return;
      let html = '<span class="ch07-fw__cell is-head"></span>';
      for (let j = 0; j < 5; j++) html += '<span class="ch07-fw__cell is-head">' + (j + 1) + '</span>';
      for (let i = 0; i < 5; i++) {
        html += '<span class="ch07-fw__cell is-head">' + (i + 1) + '</span>';
        for (let j = 0; j < 5; j++) {
          const value = stage.m[i][j];
          let cls = 'ch07-fw__cell';
          if (i === j) cls += ' is-diag';
          if (value === INF) cls += ' is-inf';
          if (stage.changed.indexOf(i + '-' + j) !== -1) cls += ' is-changed';
          html += '<span class="' + cls + '">' + (value === INF ? '∞' : value) + '</span>';
        }
      }
      root.innerHTML = html;
    });
  })();

  /* ========================================================================
     7.6 — spanning-tree toggle
     ======================================================================== */
  const MST_NODES = {
    1: [100, 90],
    2: [280, 70],
    3: [460, 100],
    4: [540, 270],
    5: [310, 300],
    6: [120, 250]
  };
  const MST_EDGES = [
    { a: 5, b: 6, w: 2, lx: 215, ly: 268 },
    { a: 1, b: 2, w: 3, lx: 190, ly: 74 },
    { a: 3, b: 6, w: 3, lx: 276, ly: 166 },
    { a: 1, b: 5, w: 5, lx: 188, ly: 196 },
    { a: 2, b: 3, w: 5, lx: 370, ly: 79 },
    { a: 2, b: 5, w: 6, lx: 326, ly: 176 },
    { a: 4, b: 6, w: 7, lx: 330, ly: 254 },
    { a: 3, b: 4, w: 9, lx: 500, ly: 179 }
  ];
  const mstKey = (a, b) => Math.min(a, b) + '-' + Math.max(a, b);
  const MST_TREES = {
    any: ['1-2', '2-3', '3-4', '3-6', '5-6'],
    min: ['1-2', '1-5', '3-6', '4-6', '5-6'],
    max: ['1-5', '2-3', '2-5', '3-4', '4-6']
  };

  function drawMst(svg, onSet, rejectSet) {
    if (!svg) return;
    const parts = ['<g class="ch07-edges">'];
    MST_EDGES.forEach((e) => {
      const A = MST_NODES[e.a];
      const B = MST_NODES[e.b];
      const key = mstKey(e.a, e.b);
      let cls = 'ch07-mst__edge';
      if (onSet && onSet.indexOf(key) !== -1) cls += ' is-tree';
      if (rejectSet && rejectSet.indexOf(key) !== -1) cls += ' is-rejected';
      parts.push('<line class="' + cls + '" data-edge="' + key + '" x1="' + A[0] + '" y1="' + A[1] + '" x2="' + B[0] + '" y2="' + B[1] + '"/>');
      parts.push('<text class="ch07-mst__w" tabindex="0" data-tip="Edge ' + e.a + '–' + e.b + ' · weight ' + e.w + '" x="' + e.lx + '" y="' + e.ly + '">' + e.w + '</text>');
    });
    parts.push('</g>');
    Object.entries(MST_NODES).forEach(([id, p]) => {
      const deg = MST_EDGES.filter((e) => e.a == id || e.b == id).length;
      parts.push(
        '<g class="ch07-mst__node" tabindex="0" data-tip="Node ' + id + ' · degree ' + deg + '">' +
          '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="18"/>' +
          '<text x="' + p[0] + '" y="' + p[1] + '">' + id + '</text>' +
        '</g>'
      );
    });
    svg.innerHTML = parts.join('');
  }

  (() => {
    const root = $('#ch07-mst');
    const svg = $('#ch07-mst-svg');
    const weightEl = $('#ch07-mst-weight');
    if (!root || !svg) return;
    const buttons = $$('[data-mst-mode]', root);
    const weights = { any: 22, min: 20, max: 32 };
    function choose(kind) {
      buttons.forEach((b) => {
        const on = b.dataset.mstMode === kind;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      drawMst(svg, MST_TREES[kind], []);
      if (weightEl) weightEl.textContent = String(weights[kind]);
    }
    buttons.forEach((btn) => btn.addEventListener('click', () => choose(btn.dataset.mstMode)));
    choose('min');
  })();

  /* ========================================================================
     7.6.1 — Kruskal builder
     ======================================================================== */
  (() => {
    const root = $('#ch07-kruskal');
    if (!root) return;
    const svg = $('#ch07-kr-svg');
    const listEl = $('#ch07-kr-list');
    const setsEl = $('#ch07-kr-sets');
    const totalEl = $('#ch07-kr-total');
    const statusEl = $('#ch07-kr-status');
    const nextBtn = $('#ch07-kr-next');
    const resetBtn = $('#ch07-kr-reset');
    if (!svg || !listEl || !setsEl) return;

    const edges = MST_EDGES; // already sorted by weight
    let link = {};
    let size = {};
    let cursor = 0;
    let total = 0;
    let accepted = [];
    let rejected = [];
    let done = false;

    const find = (x) => {
      while (link[x] !== x) x = link[x];
      return x;
    };

    function reset() {
      link = {};
      size = {};
      for (let i = 1; i <= 6; i++) { link[i] = i; size[i] = 1; }
      cursor = 0;
      total = 0;
      accepted = [];
      rejected = [];
      done = false;
      if (nextBtn) nextBtn.disabled = false;
      drawMst(svg, accepted, rejected);
      renderSets();
      if (totalEl) totalEl.textContent = '0';
      if (statusEl) statusEl.textContent = 'Sorted edges ready. Press Next edge.';
      renderList();
    }

    function renderSets(freshKey) {
      const groups = {};
      for (let i = 1; i <= 6; i++) {
        const r = find(i);
        if (!groups[r]) groups[r] = [];
        groups[r].push(i);
      }
      setsEl.innerHTML = Object.keys(groups)
        .map(Number)
        .sort((a, b) => a - b)
        .map((r) => {
          const members = groups[r].sort((a, b) => a - b);
          const freshEdge = edges.find((e) => mstKey(e.a, e.b) === freshKey);
          const fresh = freshEdge && (members.indexOf(freshEdge.a) !== -1 || members.indexOf(freshEdge.b) !== -1);
          return '<span class="ch07-set' + (fresh ? ' is-fresh' : '') + '" tabindex="0" data-tip="Representative ' + r + ' · set {' + members.join(', ') + '}"><b>' + r + '</b> {' + members.join(' ') + '}</span>';
        })
        .join('');
    }

    function renderList() {
      listEl.innerHTML = edges.map((e, i) => {
        const key = mstKey(e.a, e.b);
        let cls = 'ch07-kr-row';
        let mark = String(i + 1);
        let state = '—';
        if (accepted.indexOf(key) !== -1) { cls += ' is-accepted'; mark = '✓'; state = 'in tree'; }
        else if (rejected.indexOf(key) !== -1) { cls += ' is-rejected'; mark = '·'; state = 'skip'; }
        else if (i === cursor && !done) { cls += ' is-current'; }
        return '<div class="' + cls + '">' +
          '<span class="ch07-kr-row__mark">' + mark + '</span>' +
          '<span class="ch07-kr-row__edge">' + e.a + '–' + e.b + '</span>' +
          '<span class="ch07-kr-row__w">' + e.w + '</span>' +
          '<span class="ch07-kr-row__state">' + state + '</span>' +
        '</div>';
      }).join('');
    }

    function next() {
      if (done || cursor >= edges.length) return;
      const e = edges[cursor];
      const key = mstKey(e.a, e.b);
      const a = find(e.a);
      const b = find(e.b);
      let message;
      if (a !== b) {
        let big = a;
        let small = b;
        if (size[big] < size[small]) { big = b; small = a; }
        size[big] += size[small];
        link[small] = big;
        accepted.push(key);
        total += e.w;
        message = 'Edge ' + e.a + '–' + e.b + ' (' + e.w + ') joins two components — added.';
      } else {
        rejected.push(key);
        message = 'Edge ' + e.a + '–' + e.b + ' (' + e.w + ') would close a cycle — skipped.';
      }
      cursor++;
      if (accepted.length === 5) {
        done = true;
        message += ' The tree is complete: five edges, weight ' + total + '.';
        if (nextBtn) nextBtn.disabled = true;
      } else if (cursor >= edges.length) {
        done = true;
        message += ' No edges remain.';
        if (nextBtn) nextBtn.disabled = true;
      }
      drawMst(svg, accepted, rejected);
      renderList();
      renderSets(key);
      if (totalEl) totalEl.textContent = String(total);
      if (statusEl) statusEl.textContent = message;
    }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (resetBtn) resetBtn.addEventListener('click', reset);
    reset();
  })();

  /* ========================================================================
     Code cards
     ======================================================================== */
  const traversalCard = $('#ch07-code');
  if (traversalCard) {
    CP.mountCodeCard(traversalCard, {
      storageKey: 'gtcp-lang-ch07-traversal',
      order: ['cpp-dfs', 'cpp-bfs', 'py-dfs'],
      initial: 'cpp-dfs',
      langs: {
        'cpp-dfs': {
          label: 'C++ DFS',
          file: 'dfs.cpp',
          type: 'O(n + m)',
          note: 'Recursive depth-first search over adjacency lists.',
          keywords: ['if', 'for', 'return', 'void', 'auto', 'bool', 'true', 'false'],
          types: ['vector', 'int', 'bool'],
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'vector<int> adj[100005];',
            'bool visited[100005];',
            '',
            'void dfs(int s) {',
            '    if (visited[s]) return;',
            '    visited[s] = true;',
            '    // process node s',
            '    for (auto u : adj[s]) {',
            '        dfs(u);',
            '    }',
            '}'
          ]
        },
        'cpp-bfs': {
          label: 'C++ BFS',
          file: 'bfs.cpp',
          type: 'O(n + m)',
          note: 'A FIFO queue visits nodes in increasing distance.',
          keywords: ['while', 'if', 'continue', 'int', 'auto', 'bool', 'true', 'false'],
          types: ['queue', 'vector', 'int', 'bool'],
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'queue<int> q;',
            'bool visited[100005];',
            'int distance_[100005];',
            '',
            'void bfs(int x) {',
            '    visited[x] = true;',
            '    distance_[x] = 0;',
            '    q.push(x);',
            '    while (!q.empty()) {',
            '        int s = q.front(); q.pop();',
            '        // process node s',
            '        for (auto u : adj[s]) {',
            '            if (visited[u]) continue;',
            '            visited[u] = true;',
            '            distance_[u] = distance_[s] + 1;',
            '            q.push(u);',
            '        }',
            '    }',
            '}'
          ]
        },
        'py-dfs': {
          label: 'Python',
          file: 'dfs.py',
          type: 'O(n + m)',
          note: 'The same recursion, with a list of neighbours per node.',
          keywords: ['def', 'if', 'for', 'in', 'return', 'True', 'False'],
          types: ['list', 'bool'],
          code: [
            'adj = [[] for _ in range(n)]',
            'visited = [False] * n',
            '',
            'def dfs(s):',
            '    if visited[s]:',
            '        return',
            '    visited[s] = True',
            '    for u in adj[s]:',
            '        dfs(u)'
          ]
        }
      }
    });
  }

  const kruskalCard = $('#ch07-code-kruskal');
  if (kruskalCard) {
    CP.mountCodeCard(kruskalCard, {
      storageKey: 'gtcp-lang-ch07-kruskal',
      order: ['cpp', 'python'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++',
          file: 'kruskal.cpp',
          type: 'O(m log m)',
          note: 'Sort the edges, then join components with union-find.',
          keywords: ['struct', 'for', 'if', 'while', 'return', 'void', 'bool', 'int', 'auto', 'const'],
          types: ['vector', 'int', 'bool'],
          pre: true,
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'struct Edge { int a, b, w; };',
            'vector<Edge> edges;',
            'int link_[100005], sz[100005];',
            '',
            'int find(int x) {',
            '    while (x != link_[x]) x = link_[x];',
            '    return x;',
            '}',
            '',
            'bool same(int a, int b) {',
            '    return find(a) == find(b);',
            '}',
            '',
            'void unite(int a, int b) {',
            '    a = find(a); b = find(b);',
            '    if (sz[a] < sz[b]) swap(a, b);',
            '    sz[a] += sz[b];',
            '    link_[b] = a;',
            '}',
            '',
            'int kruskal(int n) {',
            '    for (int i = 1; i <= n; i++) {',
            '        link_[i] = i;',
            '        sz[i] = 1;',
            '    }',
            '    sort(edges.begin(), edges.end(),',
            '         [](const Edge& x, const Edge& y) {',
            '             return x.w < y.w;',
            '         });',
            '    int total = 0;',
            '    for (auto& e : edges) {',
            '        if (!same(e.a, e.b)) {',
            '            unite(e.a, e.b);',
            '            total += e.w;',
            '        }',
            '    }',
            '    return total;',
            '}'
          ]
        },
        python: {
          label: 'Python',
          file: 'kruskal.py',
          type: 'O(m log m)',
          note: 'Union by size, then the same greedy sweep.',
          keywords: ['class', 'def', 'for', 'if', 'while', 'return', 'lambda', 'in'],
          types: ['list', 'int'],
          code: [
            'class DSU:',
            '    def __init__(self, n):',
            '        self.link = list(range(n))',
            '        self.size = [1] * n',
            '',
            '    def find(self, x):',
            '        while x != self.link[x]:',
            '            x = self.link[x]',
            '        return x',
            '',
            '    def unite(self, a, b):',
            '        a, b = self.find(a), self.find(b)',
            '        if self.size[a] < self.size[b]:',
            '            a, b = b, a',
            '        self.size[a] += self.size[b]',
            '        self.link[b] = a',
            '',
            'def kruskal(n, edges):',
            '    dsu = DSU(n + 1)',
            '    edges.sort(key=lambda e: e[2])',
            '    total = 0',
            '    for a, b, w in edges:',
            '        if dsu.find(a) != dsu.find(b):',
            '            dsu.unite(a, b)',
            '            total += w',
            '    return total'
          ]
        }
      }
    });
  }
})();

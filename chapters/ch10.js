/* Chapter 10 — Tree Algorithms */
(() => {
  'use strict';

  const $ = CP.$;
  const $$ = CP.$$;
  const NS = 'http://www.w3.org/2000/svg';

  /* ------------------------------------------------------------------
     One example tree, shared by the interactive figures.
     Root 1, edges 1-2, 1-3, 1-4, 2-5, 2-6, 6-8, 4-7.
     ------------------------------------------------------------------ */
  const POS = {
    1: [280, 50],
    2: [140, 140],
    3: [280, 140],
    4: [420, 140],
    5: [80, 230],
    6: [200, 230],
    7: [420, 230],
    8: [200, 320]
  };
  const EDGES = [[1, 2], [1, 3], [1, 4], [2, 5], [2, 6], [6, 8], [4, 7]];
  const CHILDREN = { 1: [2, 3, 4], 2: [5, 6], 3: [], 4: [7], 5: [], 6: [8], 7: [], 8: [] };
  const PARENT = { 1: 0, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 7: 4, 8: 6 };
  const NODES = [1, 2, 3, 4, 5, 6, 7, 8];

  const depth = {};
  const size = {};
  const tin = {};
  const tout = {};
  const order = [];
  let clock = 0;

  (function walk(v, d) {
    depth[v] = d;
    tin[v] = ++clock;
    order.push(v);
    size[v] = 1;
    CHILDREN[v].forEach((u) => {
      walk(u, d + 1);
      size[v] += size[u];
    });
    tout[v] = clock;
  })(1, 1);

  const LOG = 3; // jumps 1, 2, 4
  const up = Array.from({ length: LOG }, () => Array(9).fill(0));
  for (const v of NODES) up[0][v] = PARENT[v];
  for (let k = 1; k < LOG; k++) {
    for (const v of NODES) up[k][v] = up[k - 1][up[k - 1][v]];
  }

  function ancestor(x, k) {
    for (let b = 0; b < LOG; b++) {
      if (k & (1 << b)) x = up[b][x];
    }
    return x;
  }

  function pathNodes(a, b) {
    const above = [];
    let x = a;
    while (x) { above.push(x); x = PARENT[x]; }
    const fromB = [];
    x = b;
    while (x && above.indexOf(x) === -1) {
      fromB.push(x);
      x = PARENT[x];
    }
    const cut = above.indexOf(x);
    return above.slice(0, cut + 1).concat(fromB.reverse());
  }

  function edgeKey(a, b) {
    return a < b ? `${a}-${b}` : `${b}-${a}`;
  }

  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(NS, tag);
    for (const key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  };

  function drawTree(svg, opts = {}) {
    if (!svg) return;
    svg.innerHTML = '';
    const gEdges = svgEl('g', { class: 'ch10-edges' });
    EDGES.forEach(([a, b]) => {
      const A = POS[a];
      const B = POS[b];
      const line = svgEl('line', {
        class: 'ch10-tree-edge',
        x1: A[0], y1: A[1], x2: B[0], y2: B[1],
        'data-edge': `${a}-${b}`
      });
      gEdges.appendChild(line);
    });
    const gNodes = svgEl('g', { class: 'ch10-nodes' });
    gNodes.setAttribute('aria-hidden', 'false');
    NODES.forEach((id) => {
      const [x, y] = POS[id];
      const g = svgEl('g', {
        class: 'ch10-node',
        transform: `translate(${x} ${y})`,
        tabindex: '0',
        'data-node': id
      });
      g.setAttribute('role', opts.onSelect ? 'button' : 'img');
      g.setAttribute('aria-label', `Node ${id}, depth ${depth[id]}, subtree size ${size[id]}`);
      g.setAttribute('data-tip', `node ${id} · depth ${depth[id]} · subtree ${size[id]}`);
      g.appendChild(svgEl('circle', { class: 'ch10-halo', r: 27 }));
      g.appendChild(svgEl('circle', { r: 19 }));
      const label = svgEl('text', { y: 1 });
      label.textContent = id;
      g.appendChild(label);
      if (opts.onSelect) {
        g.addEventListener('click', () => opts.onSelect(id));
        g.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            opts.onSelect(id);
          }
        });
      }
      gNodes.appendChild(g);
    });
    svg.appendChild(gEdges);
    svg.appendChild(gNodes);
  }

  function nodeEl(svg, id) {
    return svg.querySelector(`.ch10-node[data-node="${id}"]`);
  }

  function setEdge(svg, a, b, cls) {
    const line = svg.querySelector(`[data-edge="${edgeKey(a, b)}"]`);
    if (line) line.classList.add(cls);
  }

  function clearEdges(svg, classes) {
    svg.querySelectorAll('.ch10-tree-edge').forEach((line) => {
      classes.forEach((c) => line.classList.remove(c));
    });
  }

  /* ------------------------------------------------------------------
     10.1 — subtree inspector
     ------------------------------------------------------------------ */
  (() => {
    const svg = $('#ch10Inspector');
    if (!svg) return;
    const readout = {
      node: $('#ch10SelNode'),
      sub: $('#ch10SelSub'),
      parent: $('#ch10SelParent'),
      children: $('#ch10SelChildren'),
      depth: $('#ch10SelDepth'),
      range: $('#ch10SelRange')
    };
    drawTree(svg, { onSelect: select });
    const gB = svgEl('g', { class: 'ch10-bracket-group' });
    const bracket = svgEl('path', { class: 'ch10-bracket' });
    const bracketLabel = svgEl('text', { class: 'ch10-bracket__label', y: 386 });
    gB.appendChild(bracket);
    gB.appendChild(bracketLabel);
    svg.appendChild(gB);

    function select(id) {
      const lo = tin[id];
      const hi = tout[id];
      svg.querySelectorAll('.ch10-node').forEach((g) => {
        const v = Number(g.dataset.node);
        g.classList.toggle('is-selected', v === id);
        g.classList.toggle('is-subtree', v !== id && tin[v] >= lo && tin[v] <= hi);
      });
      svg.querySelectorAll('.ch10-tree-edge').forEach((line) => {
        const [a, b] = line.dataset.edge.split('-').map(Number);
        line.classList.toggle('is-on', tin[a] >= lo && tin[a] <= hi && tin[b] >= lo && tin[b] <= hi);
      });

      const inside = order.slice(lo - 1, hi);
      const xs = inside.map((v) => POS[v][0]);
      const xmin = Math.min(...xs);
      const xmax = Math.max(...xs);
      const y = 360;
      const path = xmax - xmin > 6
        ? `M${xmin - 9} ${y - 14} V${y} H${xmax + 9} V${y - 14}`
        : `M${xmin - 9} ${y - 14} V${y} H${xmax + 9} V${y - 14}`;
      bracket.setAttribute('d', path);
      bracketLabel.textContent = `subtree ${id} · ${size[id]} ${size[id] === 1 ? 'node' : 'nodes'}`;
      bracketLabel.setAttribute('x', Math.min(456, Math.max(104, (xmin + xmax) / 2)));

      readout.node.textContent = id;
      readout.sub.textContent = `subtree ${size[id]}`;
      readout.parent.textContent = PARENT[id] || '—';
      readout.children.textContent = CHILDREN[id].length ? CHILDREN[id].join(', ') : '—';
      readout.depth.textContent = depth[id];
      readout.range.textContent = `${tin[id]}–${tout[id]}`;
    }

    select(2);
  })();

  /* ------------------------------------------------------------------
     10.1.2 — diameter toggle
     ------------------------------------------------------------------ */
  (() => {
    const fig = $('#ch10Diam');
    if (!fig) return;
    const note = $('#ch10DiamNote');
    const buttons = $$('[data-diam-mode]', fig);
    const copy = {
      dp: 'The path 6 → 2 → 1 → 4 → 7 has length 4, and node 1 is its highest point.',
      sweep: 'First sweep from a = 3 reaches b = 5. The second from b reaches c = 7. The distance b–c is 4.'
    };
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.diamMode;
        fig.classList.toggle('is-sweep', mode === 'sweep');
        buttons.forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        if (note) note.textContent = copy[mode];
      });
    });
  })();

  /* ------------------------------------------------------------------
     10.2.1 — binary lifting stepper
     ------------------------------------------------------------------ */
  (() => {
    const lab = $('#ch10Lift');
    const svg = $('#ch10LiftTree');
    if (!lab || !svg) return;

    const expr = $('#ch10LiftExpr');
    const result = $('#ch10LiftResult');
    const jumpWrap = $('#ch10LiftJumps');
    const note = $('#ch10LiftNote');
    const selectEl = $('#ch10LiftNode');
    const stepBtn = $('#ch10LiftStep');
    const resetBtn = $('#ch10LiftReset');
    const kButtons = $$('.ch10-kbtn', lab);

    const state = { x: 8, k: 3, jumps: [], applied: 0 };

    drawTree(svg, { onSelect: (id) => setNode(id) });

    function buildJumps() {
      const powers = [];
      for (let b = LOG - 1; b >= 0; b--) {
        if (state.k & (1 << b)) powers.push(b);
      }
      let cur = state.x;
      state.jumps = powers.map((p) => {
        const from = cur;
        const to = up[p][from];
        cur = to;
        return { p, from, to };
      });
    }

    function markPath() {
      for (const j of state.jumps.slice(0, state.applied)) {
        let x = j.from;
        while (x && x !== j.to) {
          setEdge(svg, x, PARENT[x], 'is-on');
          x = PARENT[x];
        }
      }
    }

    function render() {
      expr.textContent = `ancestor(${state.x}, ${state.k})`;
      const done = state.applied >= state.jumps.length;
      const current = state.applied === 0
        ? state.x
        : state.jumps[state.applied - 1].to;

      svg.querySelectorAll('.ch10-node').forEach((g) => {
        const v = Number(g.dataset.node);
        g.classList.toggle('is-current', v === current);
        g.classList.toggle('is-subtree', v === state.x && v !== current);
      });
      clearEdges(svg, ['is-on']);
      markPath();

      svg.querySelectorAll('.ch10-table td').forEach((td) => td.classList.remove('is-active', 'is-done'));
      state.jumps.forEach((j, i) => {
        const cell = svgTableCell(j.p, j.from);
        if (!cell) return;
        if (i === state.applied - 1) cell.classList.add('is-active');
        else if (i < state.applied) cell.classList.add('is-done');
      });

      jumpWrap.innerHTML = state.jumps.map((j, i) => {
        const cls = i < state.applied ? 'is-done' : i === state.applied ? 'is-next' : '';
        const to = j.to === 0 ? '0' : j.to;
        return `<span class="ch10-jump ${cls}">2<sup>${j.p}</sup> ${j.from}→${to}</span>`;
      }).join('');

      if (done) {
        const value = state.jumps.length ? state.jumps[state.jumps.length - 1].to : state.x;
        result.textContent = `= ${value}`;
        stepBtn.disabled = true;
        stepBtn.innerHTML = '<svg class="icon"><use href="#i-check"/></svg><span>Done</span>';
        note.innerHTML = value === 0
          ? `ancestor(${state.x}, ${state.k}) = 0: the jump goes above the root, so no such ancestor exists.`
          : `ancestor(${state.x}, ${state.k}) = ${value}. The jumps follow the binary digits of ${state.k}.`;
      } else {
        result.textContent = '= ?';
        stepBtn.disabled = false;
        stepBtn.innerHTML = '<svg class="icon"><use href="#i-step"/></svg><span>Next jump</span>';
        note.innerHTML = `${state.k} = ${state.jumps.map((j) => `2<sup>${j.p}</sup>`).join(' + ')}. ${state.jumps.length} ${state.jumps.length === 1 ? 'jump' : 'jumps'} in total.`;
      }

      kButtons.forEach((b) => {
        b.classList.toggle('is-active', Number(b.dataset.k) === state.k);
      });
      if (selectEl) selectEl.value = String(state.x);
    }

    function svgTableCell(p, x) {
      return lab.querySelector(`td[data-up="${p}-${x}"]`);
    }

    function setNode(id) {
      state.x = id;
      state.applied = 0;
      buildJumps();
      render();
    }

    function setK(k) {
      state.k = k;
      state.applied = 0;
      buildJumps();
      render();
    }

    kButtons.forEach((b) => b.addEventListener('click', () => setK(Number(b.dataset.k))));
    if (selectEl) selectEl.addEventListener('change', () => setNode(Number(selectEl.value)));
    stepBtn.addEventListener('click', () => {
      if (state.applied < state.jumps.length) {
        state.applied++;
        render();
      }
    });
    resetBtn.addEventListener('click', () => {
      state.applied = 0;
      render();
    });

    buildJumps();
    render();
  })();

  /* ------------------------------------------------------------------
     10.2.2 — DFS array
     ------------------------------------------------------------------ */
  (() => {
    const lab = $('#ch10DfsArray');
    const svg = $('#ch10ArrayTree');
    const arrayEl = $('#ch10Array');
    if (!lab || !svg || !arrayEl) return;

    const rangeEl = $('#ch10ArrayRange');
    const sumEl = $('#ch10ArraySum');
    const VAL = { 1: 2, 2: 3, 3: 4, 4: 4, 5: 5, 6: 3, 7: 3, 8: 1 };

    drawTree(svg, { onSelect: select });

    const rows = [
      { label: 'id', values: order.slice(), buttons: true },
      { label: 'size', values: order.map((id) => size[id]) },
      { label: 'value', values: order.map((id) => VAL[id]) }
    ];

    arrayEl.innerHTML = rows.map((row) => {
      const cells = row.values.map((value, i) => {
        const node = order[i];
        if (row.buttons) {
          return `<button type="button" class="ch10-cell" data-node="${node}" aria-label="Node ${node}, DFS position ${i + 1}">${value}</button>`;
        }
        return `<span class="ch10-cell" data-node="${node}">${value}</span>`;
      }).join('');
      return `<div class="ch10-array__row"><span class="ch10-array__label">${row.label}</span>${cells}</div>`;
    }).join('');

    arrayEl.addEventListener('click', (e) => {
      const cell = e.target.closest('[data-node]');
      if (cell) select(Number(cell.dataset.node));
    });

    function select(id) {
      const lo = tin[id];
      const hi = tout[id];
      arrayEl.querySelectorAll('.ch10-cell').forEach((cell) => {
        const v = Number(cell.dataset.node);
        cell.classList.toggle('is-in', tin[v] >= lo && tin[v] <= hi);
      });
      svg.querySelectorAll('.ch10-node').forEach((g) => {
        const v = Number(g.dataset.node);
        g.classList.toggle('is-selected', v === id);
        g.classList.toggle('is-subtree', v !== id && tin[v] >= lo && tin[v] <= hi);
      });
      svg.querySelectorAll('.ch10-tree-edge').forEach((line) => {
        const [a, b] = line.dataset.edge.split('-').map(Number);
        line.classList.toggle('is-on', tin[a] >= lo && tin[a] <= hi && tin[b] >= lo && tin[b] <= hi);
      });

      let sum = 0;
      for (let p = lo; p <= hi; p++) sum += VAL[order[p - 1]];
      rangeEl.textContent = `subtree ${id} · positions ${lo}–${hi}`;
      sumEl.innerHTML = `sum of values in the interval = <b>${sum}</b>`;
    }

    select(2);
  })();

  /* ------------------------------------------------------------------
     10.2.3 — LCA pointer walk
     ------------------------------------------------------------------ */
  (() => {
    const lab = $('#ch10Lca');
    const svg = $('#ch10LcaTree');
    if (!lab || !svg) return;

    const aSel = $('#ch10LcaA');
    const bSel = $('#ch10LcaB');
    const prevBtn = $('#ch10LcaPrev');
    const nextBtn = $('#ch10LcaNext');
    const resetBtn = $('#ch10LcaReset');
    const kicker = $('#ch10LcaKicker');
    const textEl = $('#ch10LcaText');
    const resultEl = $('#ch10LcaResult');
    const distEl = $('#ch10LcaDist');
    const note = $('#ch10LcaNote');

    const state = { a: 5, b: 8, steps: [], i: 0 };

    drawTree(svg);
    const ptrLayer = svgEl('g', { class: 'ch10-ptr-labels' });
    svg.appendChild(ptrLayer);

    function buildSteps(a, b) {
      const steps = [];
      let A = a;
      let B = b;
      steps.push({
        A, B, type: 'start',
        text: `a = ${a} at depth ${depth[a]}, b = ${b} at depth ${depth[b]}.`
      });
      if (a === b) {
        steps.push({
          A, B, type: 'answer', lca: a,
          text: `Both pointers already point to node ${a}.`
        });
        return steps;
      }
      if (depth[A] > depth[B]) {
        const diff = depth[A] - depth[B];
        A = ancestor(A, diff);
        steps.push({
          A, B, type: 'lift',
          text: `Lift a by ${diff} ${diff === 1 ? 'level' : 'levels'} to node ${A}. Both pointers are now at depth ${depth[A]}.`
        });
      } else if (depth[B] > depth[A]) {
        const diff = depth[B] - depth[A];
        B = ancestor(B, diff);
        steps.push({
          A, B, type: 'lift',
          text: `Lift b by ${diff} ${diff === 1 ? 'level' : 'levels'} to node ${B}. Both pointers are now at depth ${depth[B]}.`
        });
      }
      if (A === B) {
        steps.push({
          A, B, type: 'answer', lca: A,
          text: `Both pointers meet at node ${A}. That is the lowest common ancestor.`
        });
        return steps;
      }
      const maxPow = Math.max(0, Math.floor(Math.log2(Math.max(1, depth[A] - 1))));
      for (let p = maxPow; p >= 0; p--) {
        const ua = up[p][A];
        const ub = up[p][B];
        if (ua !== ub) {
          steps.push({
            A, B, type: 'move',
            text: `Jump 2<sup>${p}</sup>: ${A} → ${ua} and ${B} → ${ub}. The ancestors differ, so move both pointers.`
          });
          A = ua;
          B = ub;
        } else {
          steps.push({
            A, B, type: 'skip',
            text: `Jump 2<sup>${p}</sup>: both would reach node ${ua}. They do not differ, so skip this jump.`
          });
        }
      }
      const c = PARENT[A] || 0;
      steps.push({
        A, B, type: 'answer', lca: c,
        text: `The next node up is ${c} for both. That is the lowest common ancestor.`
      });
      return steps;
    }

    function clearMarks() {
      svg.querySelectorAll('.ch10-node').forEach((g) => {
        g.classList.remove('is-a', 'is-b', 'is-lca', 'is-on-a', 'is-on-b');
      });
      clearEdges(svg, ['is-a', 'is-b', 'is-lca', 'is-faded']);
    }

    function markHalf(start, lca, cls, nodeCls) {
      let x = start;
      while (x && x !== lca) {
        setEdge(svg, x, PARENT[x], cls);
        const g = nodeEl(svg, x);
        if (g) g.classList.add(nodeCls);
        x = PARENT[x];
      }
    }

    function renderPointers(step) {
      ptrLayer.innerHTML = '';
      const A = step.A;
      const B = step.B;
      const aNode = nodeEl(svg, A);
      const bNode = nodeEl(svg, B);
      if (aNode) aNode.classList.add('is-a');
      if (bNode) bNode.classList.add('is-b');
      if (A === B) {
        const [x, y] = POS[A];
        const label = svgEl('text', {
          class: 'ch10-pointer-label',
          x, y: y - 31
        });
        label.textContent = 'a b';
        ptrLayer.appendChild(label);
      } else {
        const [xa, ya] = POS[A];
        const [xb, yb] = POS[B];
        const la = svgEl('text', { class: 'ch10-pointer-label', x: xa, y: ya - 31 });
        la.textContent = 'a';
        const lb = svgEl('text', { class: 'ch10-pointer-label is-b', x: xb, y: yb - 31 });
        lb.textContent = 'b';
        ptrLayer.appendChild(la);
        ptrLayer.appendChild(lb);
      }
    }

    function render() {
      const step = state.steps[state.i];
      clearMarks();
      renderPointers(step);

      if (step.lca != null) {
        const lca = step.lca;
        const lcaNode = nodeEl(svg, lca);
        if (lcaNode) lcaNode.classList.add('is-lca');
        const pa = pathNodes(state.a, lca);
        const pb = pathNodes(state.b, lca);
        svg.querySelectorAll('.ch10-tree-edge').forEach((line) => line.classList.add('is-faded'));
        markHalf(state.a, lca, 'is-a', 'is-on-a');
        markHalf(state.b, lca, 'is-b', 'is-on-b');
        pa.forEach((v) => { const g = nodeEl(svg, v); if (g) g.classList.add('is-on-a'); });
        pb.forEach((v) => { const g = nodeEl(svg, v); if (g) g.classList.add('is-on-b'); });
        resultEl.textContent = `LCA = ${lca}`;
        distEl.textContent = `distance ${depth[state.a] + depth[state.b] - 2 * depth[lca]}`;
        note.textContent = 'The path splits at the LCA: solid on a’s side, dashed on b’s side.';
      } else {
        resultEl.textContent = 'LCA = —';
        distEl.textContent = 'distance —';
        const hints = {
          start: 'Start by equalising the depths. Then lift both pointers while their ancestors differ.',
          lift: 'The pointers are level. Now compare the ancestors at powers of two.',
          skip: 'A jump that makes the ancestors equal is too far; try a shorter one.',
          move: 'The ancestors differ, so the LCA is above both pointers. Move them up together.'
        };
        note.textContent = hints[step.type] || '';
      }

      kicker.textContent = `Step ${state.i + 1} / ${state.steps.length}`;
      textEl.innerHTML = step.text;
      prevBtn.disabled = state.i === 0;
      nextBtn.disabled = state.i === state.steps.length - 1;
      nextBtn.innerHTML = state.i === state.steps.length - 1
        ? '<svg class="icon"><use href="#i-check"/></svg><span>Done</span>'
        : '<span>Step</span><svg class="icon"><use href="#i-arrow"/></svg>';
    }

    function reset() {
      state.steps = buildSteps(state.a, state.b);
      state.i = 0;
      render();
    }

    [aSel, bSel].forEach((sel) => {
      if (!sel) return;
      sel.addEventListener('change', () => {
        state.a = Number(aSel.value);
        state.b = Number(bSel.value);
        reset();
      });
    });
    prevBtn.addEventListener('click', () => {
      if (state.i > 0) { state.i--; render(); }
    });
    nextBtn.addEventListener('click', () => {
      if (state.i < state.steps.length - 1) { state.i++; render(); }
    });
    resetBtn.addEventListener('click', reset);

    reset();
  })();

  /* ------------------------------------------------------------------
     10.3.1 — centroid decomposition build-up
     ------------------------------------------------------------------ */
  (() => {
    const fig = $('#ch10Centroid');
    if (!fig) return;
    const stepBtn = $('#ch10CentroidStep');
    const resetBtn = $('#ch10CentroidReset');
    const levelEl = $('#ch10CentroidLevel');
    const textEl = $('#ch10CentroidText');
    const listEl = $('#ch10CentroidList');
    const noteEl = $('#ch10CentroidNote');
    const nodeLevel = { 5: 0, 2: 1, 4: 1, 6: 1, 1: 2, 3: 2, 7: 2, 8: 2 };

    const copy = [
      {
        text: 'Node 5 is the only centroid: removing it leaves components of 2, 2 and 3 nodes.',
        list: [['component', '{1, 2} · {3, 4} · {6, 7, 8}'], ['largest', '3 ≤ ⌊8/2⌋']],
        note: 'Process every path through 5, remove it, and repeat inside each component.'
      },
      {
        text: 'Remove 5. The components are {1, 2}, {3, 4} and {6, 7, 8}; their centroids are 2, 4 and 6.',
        list: [['centroids', '2 · 4 · 6'], ['sizes', '2 · 2 · 3']],
        note: 'Each centroid is removed, and its own components are queued for the next level.'
      },
      {
        text: 'The remaining components are singletons. A one-node tree is its own centroid, so the recursion stops.',
        list: [['centroids', '1 · 3 · 7 · 8'], ['sizes', '1 · 1 · 1 · 1']],
        note: 'Three levels for eight nodes: ⌈log₂ 8⌉ = 3.'
      }
    ];

    let level = 0;

    function render() {
      fig.querySelectorAll('[data-cent]').forEach((g) => {
        const l = Number(g.dataset.level);
        g.classList.toggle('is-live', l === level);
        g.classList.toggle('is-removed', l < level);
      });
      fig.querySelectorAll('[data-ring]').forEach((ring) => {
        ring.classList.toggle('is-on', Number(ring.dataset.ring) === level);
      });
      fig.querySelectorAll('.ch10-cent-components ellipse').forEach((ellipse) => {
        ellipse.classList.toggle('is-on', level === 1);
      });
      fig.querySelectorAll('.ch10-static-edges path[data-ce]').forEach((path) => {
        const [a, b] = path.dataset.ce.split('-').map(Number);
        const cut = level > 0 && (nodeLevel[a] < level || nodeLevel[b] < level);
        path.classList.toggle('is-cut', cut);
      });

      levelEl.textContent = level;
      textEl.textContent = copy[level].text;
      listEl.innerHTML = copy[level].list
        .map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`)
        .join('');
      noteEl.textContent = copy[level].note;
      stepBtn.disabled = level >= 2;
      stepBtn.innerHTML = level >= 2
        ? '<span>Done</span><svg class="icon"><use href="#i-check"/></svg>'
        : '<span>Decompose</span><svg class="icon"><use href="#i-arrow"/></svg>';
    }

    stepBtn.addEventListener('click', () => {
      if (level < 2) { level++; render(); }
    });
    resetBtn.addEventListener('click', () => {
      level = 0;
      render();
    });

    render();
  })();

  /* ------------------------------------------------------------------
     10.3.2 — heavy-light chain pieces
     ------------------------------------------------------------------ */
  (() => {
    const lab = $('#ch10Hld');
    const svg = $('#ch10HldSvg');
    const overlay = $('#ch10HldOverlay');
    if (!lab || !svg || !overlay) return;
    const countEl = $('#ch10HldCount');
    const segsEl = $('#ch10HldSegs');
    const noteEl = $('#ch10HldNote');
    const buttons = $$('[data-hld-pair]', lab);

    const paths = {
      '78': {
        a: 7, b: 8,
        segs: [
          { nodes: [7, 4], chain: 'P3' },
          { nodes: [1, 2, 6, 8], chain: 'P1' }
        ],
        note: 'The light edge 4–1 joins the two heavy subpaths. The decomposition stores each side in its own segment tree.'
      },
      '53': {
        a: 5, b: 3,
        segs: [
          { nodes: [5], chain: 'P4' },
          { nodes: [2, 1], chain: 'P1' },
          { nodes: [3], chain: 'P2' }
        ],
        note: 'Three heavy subpaths. The light edges 5–2 and 1–3 connect the singleton chains to the main path.'
      },
      '83': {
        a: 8, b: 3,
        segs: [
          { nodes: [8, 6, 2, 1], chain: 'P1' },
          { nodes: [3], chain: 'P2' }
        ],
        note: 'Two heavy subpaths. A query on 8–3 costs two chain queries, each logarithmic.'
      }
    };

    function polyline(nodes) {
      return nodes.map((v, i) => `${i ? 'L' : 'M'}${POS[v][0]} ${POS[v][1]}`).join(' ');
    }

    function draw(key) {
      const data = paths[key];
      overlay.innerHTML = '';

      const full = pathNodes(data.a, data.b);
      const fullPath = svgEl('path', { class: 'ch10-hld__full', d: polyline(full) });
      overlay.appendChild(fullPath);

      data.segs.forEach((seg, i) => {
        if (seg.nodes.length === 1) {
          const [x, y] = POS[seg.nodes[0]];
          overlay.appendChild(svgEl('circle', {
            class: 'ch10-hld__seg ch10-hld__seg--x is-c',
            cx: x, cy: y, r: 25
          }));
          return;
        }
        const d = polyline(seg.nodes);
        overlay.appendChild(svgEl('path', { class: 'ch10-hld__halo', d }));
        const cls = i === 0 ? 'ch10-hld__seg' : i === 1 ? 'ch10-hld__seg is-b' : 'ch10-hld__seg is-c';
        overlay.appendChild(svgEl('path', { class: cls, d }));
      });

      countEl.textContent = data.segs.length;
      segsEl.innerHTML = data.segs
        .map((s) => `<li><span>${s.nodes.join(' – ')}</span><em>${s.chain}</em></li>`)
        .join('');
      noteEl.textContent = data.note;

      buttons.forEach((b) => {
        const on = b.dataset.hldPair === key;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
    }

    buttons.forEach((b) => b.addEventListener('click', () => draw(b.dataset.hldPair)));
    draw('78');
  })();

  /* ------------------------------------------------------------------
     Code cards
     ------------------------------------------------------------------ */
  const cppKeyword = ['using', 'namespace', 'void', 'for', 'auto', 'if', 'continue', 'return', 'while', 'const', 'struct'];
  const cppType = ['int', 'long', 'long long', 'vector', 'bool', 'char', 'string'];

  const cards = $$('[data-code-card]');

  if (cards[0]) {
    CP.mountCodeCard(cards[0], {
      storageKey: 'gtcp-lang-ch10-dfs',
      order: ['cpp', 'python'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++', file: 'subtree.cpp', type: 'O(n)', pre: true,
          note: 'One DFS computes the size of every subtree. sz[s] starts at 1 for the node itself.',
          keywords: cppKeyword,
          types: cppType,
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'const int N = 200005;',
            'vector<int> adj[N];',
            'int sz[N];',
            '',
            'void dfs(int s, int e) {',
            '    sz[s] = 1;',
            '    for (auto u : adj[s]) {',
            '        if (u == e) continue;',
            '        dfs(u, s);',
            '        sz[s] += sz[u];',
            '    }',
            '}',
            '',
            'int main() {',
            '    int n;',
            '    cin >> n;',
            '    for (int i = 0; i < n - 1; i++) {',
            '        int a, b;',
            '        cin >> a >> b;',
            '        adj[a].push_back(b);',
            '        adj[b].push_back(a);',
            '    }',
            '    dfs(1, 0);',
            '    for (int i = 1; i <= n; i++)',
            '        cout << sz[i] << " ";',
            '    cout << "\\n";',
            '}'
          ]
        },
        python: {
          label: 'Python', file: 'subtree.py', type: 'O(n)',
          note: 'The same post-order accumulation. The recursion limit is raised for deep trees.',
          keywords: ['import', 'def', 'for', 'in', 'if', 'continue', 'return', 'print', 'range', 'map'],
          types: ['int', 'list'],
          code: [
            'import sys',
            'sys.setrecursionlimit(300000)',
            'input = sys.stdin.readline',
            '',
            'n = int(input())',
            'adj = [[] for _ in range(n + 1)]',
            'for _ in range(n - 1):',
            '    a, b = map(int, input().split())',
            '    adj[a].append(b)',
            '    adj[b].append(a)',
            '',
            'sz = [0] * (n + 1)',
            '',
            'def dfs(s, e):',
            '    sz[s] = 1',
            '    for u in adj[s]:',
            '        if u == e:',
            '            continue',
            '        dfs(u, s)',
            '        sz[s] += sz[u]',
            '',
            'dfs(1, 0)',
            'print(*sz[1:])'
          ]
        }
      }
    });
  }

  if (cards[1]) {
    CP.mountCodeCard(cards[1], {
      storageKey: 'gtcp-lang-ch10-lift',
      order: ['cpp', 'python'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++', file: 'lifting.cpp', type: 'O(n log n) build · O(log k) query', pre: true,
          note: 'up[k][x] is the 2^k-th ancestor of x. Row 0 is the parent; each later row doubles the jump.',
          keywords: cppKeyword,
          types: cppType,
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'const int N = 200005;',
            'const int LOG = 18; // powers 2^0..2^17 cover < 2^18',
            'vector<int> adj[N];',
            'int up[LOG][N], dep[N];',
            '',
            'void dfs(int s, int e) {',
            '    up[0][s] = e;',
            '    for (int k = 1; k < LOG; k++)',
            '        up[k][s] = up[k - 1][up[k - 1][s]];',
            '    for (int u : adj[s]) {',
            '        if (u == e) continue;',
            '        dep[u] = dep[s] + 1;',
            '        dfs(u, s);',
            '    }',
            '}',
            '',
            'int ancestor(int x, int k) {',
            '    for (int b = 0; b < LOG; b++)',
            '        if (k & (1 << b)) x = up[b][x];',
            '    return x;',
            '}',
            '',
            'int main() {',
            '    int n;',
            '    cin >> n;',
            '    for (int i = 0; i < n - 1; i++) {',
            '        int a, b;',
            '        cin >> a >> b;',
            '        adj[a].push_back(b);',
            '        adj[b].push_back(a);',
            '    }',
            '    dfs(1, 0);',
            '    int q;',
            '    cin >> q;',
            '    while (q--) {',
            '        int x, k;',
            '        cin >> x >> k;',
            '        cout << ancestor(x, k) << "\\n";',
            '    }',
            '}'
          ]
        },
        python: {
          label: 'Python', file: 'lifting.py', type: 'O(n log n) build · O(log k) query',
          note: 'The same table built during the DFS. Row 0 is the parent.',
          keywords: ['import', 'def', 'for', 'in', 'if', 'continue', 'return', 'while', 'print', 'range', 'map', 'max'],
          types: ['int', 'list'],
          code: [
            'import sys',
            'sys.setrecursionlimit(400000)',
            'input = sys.stdin.readline',
            '',
            'n = int(input())',
            'adj = [[] for _ in range(n + 1)]',
            'for _ in range(n - 1):',
            '    a, b = map(int, input().split())',
            '    adj[a].append(b)',
            '    adj[b].append(a)',
            '',
            'LOG = max(1, n.bit_length())',
            'up = [[0] * (n + 1) for _ in range(LOG)]',
            'dep = [0] * (n + 1)',
            '',
            'def dfs(s, e):',
            '    up[0][s] = e',
            '    for k in range(1, LOG):',
            '        up[k][s] = up[k - 1][up[k - 1][s]]',
            '    for u in adj[s]:',
            '        if u == e:',
            '            continue',
            '        dep[u] = dep[s] + 1',
            '        dfs(u, s)',
            '',
            'dfs(1, 0)',
            '',
            'def ancestor(x, k):',
            '    b = 0',
            '    while k:',
            '        if k & 1:',
            '            x = up[b][x]',
            '        k >>= 1',
            '        b += 1',
            '    return x',
            '',
            'q = int(input())',
            'for _ in range(q):',
            '    x, k = map(int, input().split())',
            '    print(ancestor(x, k))'
          ]
        }
      }
    });
  }
})();

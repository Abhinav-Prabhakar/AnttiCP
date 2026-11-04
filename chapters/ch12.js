/* Chapter 12 — Advanced Graph Algorithms */
(() => {
  const { $, $$, fmt, reduceMotion, mountCodeCard } = window.CP;

  // SVG elements do not expose the HTML `hidden` property, so toggle the
  // attribute itself; the UA stylesheet still honours it on <g> elements.
  const setHidden = (el, on) => { if (el) el.toggleAttribute('hidden', on); };

  /* ============================================================
     Kosaraju stepper
     ============================================================ */
  (() => {
    const root = $('#ch12Kosaraju');
    const svg = $('#ch12KosSvg');
    if (!root || !svg) return;

    const nodes = [1, 2, 3, 4, 5, 6, 7];
    const edges = [[1, 2], [2, 1], [2, 3], [3, 6], [6, 7], [7, 3], [3, 4], [4, 5], [7, 5]];
    const g = new Map(nodes.map((n) => [n, []]));
    const rg = new Map(nodes.map((n) => [n, []]));
    edges.forEach(([a, b]) => { g.get(a).push(b); rg.get(b).push(a); });
    g.forEach((list) => list.sort((a, b) => a - b));
    rg.forEach((list) => list.sort((a, b) => a - b));

    const seen = {}, disc = {}, fin = {}, order = [];
    let clock = 0;
    function dfs1(u) {
      seen[u] = true;
      disc[u] = ++clock;
      for (const v of g.get(u)) if (!seen[v]) dfs1(v);
      fin[u] = ++clock;
      order.push(u);
    }
    for (const s of nodes) if (!seen[s]) dfs1(s);

    const comp = {};
    const groups = [];
    for (const s of [...order].reverse()) {
      if (comp[s]) continue;
      const members = [];
      const stack = [s];
      comp[s] = true;
      while (stack.length) {
        const u = stack.pop();
        members.push(u);
        for (const v of rg.get(u)) if (!comp[v]) { comp[v] = true; stack.push(v); }
      }
      groups.push(members);
    }
    groups.sort((a, b) => Math.min(...a) - Math.min(...b));
    const letters = ['A', 'B', 'C', 'D'];
    const groupOf = {};
    groups.forEach((members, i) => members.forEach((n) => { groupOf[n] = letters[i]; }));

    const nodeEls = new Map();
    $$('.ch12-knode', svg).forEach((el) => nodeEls.set(Number(el.dataset.node), el));

    const stepEl = $('#ch12KStep');
    const capEl = $('#ch12KCap');
    const outEl = $('#ch12KOut');
    const dots = $$('#ch12KDots span');
    const prevBtn = $('#ch12KPrev');
    const nextBtn = $('#ch12KNext');
    const resetBtn = $('#ch12KReset');
    const forward = $('#ch12KForward');
    const reverse = $('#ch12KReverse');

    const times = nodes.map((n) => `${n}: ${disc[n]}/${fin[n]}`).join(' · ');
    const reversedOrder = [...order].reverse();
    const compText = groups.map((m, i) => `${letters[i]} = {${m.join(', ')}}`).join(' · ');

    const steps = [
      {
        cap: 'Start with the graph. No node has been visited yet.',
        out: [
          ['graph', `${nodes.length} nodes · ${edges.length} edges`],
          ['question', 'which nodes can reach which?']
        ]
      },
      {
        cap: 'The first depth-first search records when each node is discovered and when it finishes. The finishing times are written above each node.',
        out: [
          ['finish times', times],
          ['finish order', `[${order.join(', ')}]`]
        ]
      },
      {
        cap: 'The list is read in reverse. The node that finished last is the first one the second pass will consider.',
        out: [
          ['reverse order', `[${reversedOrder.join(', ')}]`],
          ['first', `node ${reversedOrder[0]} starts a component`]
        ]
      },
      {
        cap: 'Every edge is reversed. A flood fill on the reversed graph can only move inside one strongly connected component.',
        out: [
          ['edges', 'all reversed'],
          ['why', 'components cannot leak to other parts']
        ]
      },
      {
        cap: 'A flood fill from each unassigned node, in reverse finishing order, yields one component at a time.',
        out: [
          ['components', compText],
          ['time', 'O(n + m) · two passes']
        ]
      }
    ];

    let step = 0;

    function render() {
      const s = steps[step];
      stepEl.textContent = `Step ${step + 1} / ${steps.length}`;
      capEl.textContent = s.cap;
      outEl.innerHTML = s.out
        .map(([k, v]) => `<div class="ch12-orow"><span class="ch12-okey">${k}</span><span class="ch12-oval">${v}</span></div>`)
        .join('');
      dots.forEach((d, i) => d.classList.toggle('is-on', i <= step));
      prevBtn.disabled = step === 0;
      nextBtn.disabled = step === steps.length - 1;
      nextBtn.innerHTML = step === steps.length - 1
        ? 'Complete'
        : (step === 0 ? 'Begin' : 'Next step') + ' <svg class="icon"><use href="#i-arrow"/></svg>';

      svg.classList.toggle('show-times', step === 1 || step === 2);
      svg.classList.toggle('show-comps', step === 4);
      setHidden(forward, step >= 3);
      setHidden(reverse, step < 3);

      nodeEls.forEach((el, n) => {
        el.classList.remove('is-a', 'is-b', 'is-c', 'is-d');
        const t = $('.ch12-kt', el);
        if (t) t.textContent = step >= 1 ? `${disc[n]}/${fin[n]}` : '';
        if (step === 4) el.classList.add(`is-${groupOf[n].toLowerCase()}`);
      });
    }

    prevBtn.addEventListener('click', () => { if (step > 0) { step -= 1; render(); } });
    nextBtn.addEventListener('click', () => { if (step < steps.length - 1) { step += 1; render(); } });
    resetBtn.addEventListener('click', () => { step = 0; render(); });
    render();
  })();

  /* ============================================================
     2SAT toggle
     ============================================================ */
  (() => {
    const root = $('#ch12TwoSat');
    if (!root) return;
    const l1 = $('#ch12TwoL1');
    const l2 = $('#ch12TwoL2');
    const tag = $('#ch12TwoTag');
    const text = $('#ch12TwoText');
    const assign = $('#ch12TwoAssign');
    const buttons = $$('[data-2sat]', root);
    if (!l1 || !l2 || !tag || !text) return;

    const copy = {
      l1: {
        tag: 'satisfiable',
        text: 'The literals of every variable lie in different components, so an assignment exists.',
        assign: true
      },
      l2: {
        tag: 'unsatisfiable',
        text: 'Every literal lies in one component, so x1 and ¬x1 must both be true. No assignment exists.',
        assign: false
      }
    };

    function setMode(mode) {
      const ok = mode === 'l1';
      setHidden(l1, !ok);
      setHidden(l2, ok);
      buttons.forEach((b) => {
        const on = b.dataset['2sat'] === mode;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      const c = copy[mode];
      tag.textContent = c.tag;
      tag.classList.toggle('ch12-verdict--bad', !ok);
      text.textContent = c.text;
      setHidden(assign, !c.assign);
    }

    buttons.forEach((b) => b.addEventListener('click', () => setMode(b.dataset['2sat'])));
    setMode('l1');
  })();

  /* ============================================================
     Ford–Fulkerson stepper
     ============================================================ */
  (() => {
    const root = $('#ch12Flow');
    const svg = $('#ch12FlowSvg');
    if (!root || !svg) return;

    const edges = [
      { u: 1, v: 2, cap: 4, x1: 99, y1: 169, x2: 221, y2: 103 },
      { u: 1, v: 3, cap: 4, x1: 99, y1: 191, x2: 221, y2: 257 },
      { u: 2, v: 3, cap: 1, x1: 240, y1: 114, x2: 240, y2: 246 },
      { u: 2, v: 4, cap: 3, x1: 258, y1: 95, x2: 412, y2: 95 },
      { u: 3, v: 4, cap: 2, x1: 252, y1: 250, x2: 413, y2: 111 },
      { u: 3, v: 5, cap: 2, x1: 258, y1: 265, x2: 412, y2: 265 },
      { u: 4, v: 6, cap: 5, x1: 447, y1: 105, x2: 564, y2: 168 },
      { u: 5, v: 6, cap: 5, x1: 447, y1: 255, x2: 564, y2: 192 }
    ];
    const s = 1, t = 6;

    function compute() {
      const f = edges.map(() => 0);
      const rounds = [];
      while (true) {
        const prev = new Map();
        prev.set(s, null);
        const q = [s];
        let found = false;
        while (q.length && !found) {
          const u = q.shift();
          for (let i = 0; i < edges.length; i++) {
            const e = edges[i];
            let v = null, dir = 0, res = 0;
            if (e.u === u && e.cap - f[i] > 0) { v = e.v; dir = 1; res = e.cap - f[i]; }
            else if (e.v === u && f[i] > 0) { v = e.u; dir = -1; res = f[i]; }
            if (v === null || prev.has(v)) continue;
            prev.set(v, { u, edge: i, dir });
            if (v === t) { found = true; break; }
            q.push(v);
          }
        }
        if (!found) break;
        let add = Infinity;
        const path = [];
        let cur = t;
        while (cur !== s) {
          const p = prev.get(cur);
          const e = edges[p.edge];
          add = Math.min(add, p.dir === 1 ? e.cap - f[p.edge] : f[p.edge]);
          path.push({ edge: p.edge, dir: p.dir });
          cur = p.u;
        }
        const nodesPath = [s];
        cur = s;
        for (let i = path.length - 1; i >= 0; i--) {
          const e = edges[path[i].edge];
          cur = path[i].dir === 1 ? e.v : e.u;
          nodesPath.push(cur);
        }
        path.forEach((p) => { f[p.edge] += p.dir * add; });
        rounds.push({
          add,
          path,
          nodes: nodesPath,
          flows: f.slice(),
          total: f.filter((_, i) => edges[i].u === s).reduce((a, b) => a + b, 0)
        });
        if (rounds.length > 40) break;
      }

      // Total flow is the net flow leaving the source.
      const total = rounds.length ? rounds[rounds.length - 1].total : 0;

      // Reachable set in the final residual graph.
      const reach = new Set([s]);
      const q = [s];
      while (q.length) {
        const u = q.shift();
        edges.forEach((e, i) => {
          if (e.u === u && e.cap - f[i] > 0 && !reach.has(e.v)) { reach.add(e.v); q.push(e.v); }
          if (e.v === u && f[i] > 0 && !reach.has(e.u)) { reach.add(e.u); q.push(e.u); }
        });
      }
      const cut = [];
      edges.forEach((e, i) => {
        if (reach.has(e.u) && !reach.has(e.v)) cut.push(i);
      });
      const cutValue = cut.reduce((a, i) => a + edges[i].cap, 0);
      return { rounds, total, reach, cut, cutValue };
    }

    const result = compute();
    const maxStep = result.rounds.length + 1;

    const edgeEls = new Map();
    $$('#ch12FlowEdges path', svg).forEach((p) => edgeEls.set(Number(p.dataset.edge), p));
    const labelEls = new Map();
    $$('#ch12FlowLabels text', svg).forEach((p) => labelEls.set(Number(p.dataset.flabel), p));
    const nodeEls = $$('.ch12-flow-nodes > g', svg);

    const valueEl = $('#ch12FlowValue');
    const capEl = $('#ch12FlowCap');
    const pathEl = $('#ch12FlowPath');
    const roundEl = $('#ch12FlowRound');
    const addEl = $('#ch12FlowAdd');
    const dots = $$('#ch12FlowDots span');
    const prevBtn = $('#ch12FlowPrev');
    const nextBtn = $('#ch12FlowNext');
    const resetBtn = $('#ch12FlowReset');
    const viewButtons = $$('[data-flow-view]', root);
    const residualGroup = $('#ch12FlowResidual');

    // Build the reverse (residual) arcs once.
    const NS = 'http://www.w3.org/2000/svg';
    const resArcs = [];
    edges.forEach((e, i) => {
      const dx = e.x2 - e.x1, dy = e.y2 - e.y1;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (-dy / len) * 15, ny = (dx / len) * 15;
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', `M${e.x2 + nx} ${e.y2 + ny} L${e.x1 + nx} ${e.y1 + ny}`);
      path.setAttribute('class', 'ch12-res-path');
      path.dataset.edge = i;
      const label = document.createElementNS(NS, 'text');
      label.setAttribute('x', (e.x1 + e.x2) / 2 + nx * 1.8);
      label.setAttribute('y', (e.y1 + e.y2) / 2 + ny * 1.8 + 3);
      label.setAttribute('class', 'ch12-res-label');
      label.dataset.edge = i;
      residualGroup.appendChild(path);
      residualGroup.appendChild(label);
      resArcs.push({ path, label });
    });

    let step = 0;
    let view = 'flow';

    function currentFlows() {
      if (step === 0) return edges.map(() => 0);
      if (step <= result.rounds.length) return result.rounds[step - 1].flows;
      return result.rounds.length ? result.rounds[result.rounds.length - 1].flows : edges.map(() => 0);
    }

    function currentPath() {
      if (step >= 1 && step <= result.rounds.length) return result.rounds[step - 1];
      return null;
    }

    function render() {
      const f = currentFlows();
      const path = currentPath();
      const final = step === result.rounds.length + 1;
      const flowTotal = step === 0 ? 0 : (result.rounds[Math.min(step, result.rounds.length) - 1] || { total: 0 }).total;
      valueEl.textContent = final ? String(result.total) : String(flowTotal);

      edgeEls.forEach((el, i) => {
        const fv = f[i];
        el.classList.toggle('is-flow', fv > 0 && !final);
        el.classList.toggle('is-hot', !!path && path.path.some((p) => p.edge === i));
        el.classList.toggle('is-cut', final && result.cut.includes(i));
      });
      labelEls.forEach((el, i) => {
        el.textContent = view === 'flow' ? `${f[i]}/${edges[i].cap}` : String(edges[i].cap - f[i]);
        el.classList.toggle('is-hot', !!path && path.path.some((p) => p.edge === i));
        el.classList.toggle('is-cut', final && result.cut.includes(i));
      });
      nodeEls.forEach((el) => {
        const n = Number($('text', el).textContent);
        el.classList.toggle('is-inA', final && result.reach.has(n));
      });
      resArcs.forEach(({ path: p, label }, i) => {
        p.classList.toggle('is-used', f[i] > 0);
        label.textContent = String(f[i]);
        label.classList.toggle('is-used', f[i] > 0);
      });

      dots.forEach((d, i) => d.classList.toggle('is-on', i <= step));
      prevBtn.disabled = step === 0;
      nextBtn.disabled = final;
      nextBtn.innerHTML = final
        ? 'Maximum flow'
        : (step === 0 ? 'Augment' : 'Next round') + ' <svg class="icon"><use href="#i-arrow"/></svg>';
      roundEl.textContent = `${Math.min(step, result.rounds.length)} / ${result.rounds.length}`;
      addEl.textContent = path ? `+${path.add}` : (final ? `cut ${result.cutValue}` : '—');

      if (step === 0) {
        capEl.textContent = 'The empty flow. Every edge is at capacity zero.';
        pathEl.innerHTML = '<span class="ch12-flow__pathlabel">augmenting path</span><span class="ch12-flow__pathval">—</span>';
      } else if (final) {
        const cutNames = result.cut.map((i) => `${edges[i].u}→${edges[i].v}`).join(', ');
        capEl.textContent = `No augmenting path remains. The reachable set is {${[...result.reach].sort((a, b) => a - b).join(', ')}}; the cut ${cutNames} has capacity ${result.cutValue}.`;
        pathEl.innerHTML = `<span class="ch12-flow__pathlabel">minimum cut</span><span class="ch12-flow__pathval">${cutNames} · ${result.cutValue}</span>`;
      } else {
        const r = result.rounds[step - 1];
        capEl.textContent = `Round ${step}: push ${r.add} unit${r.add === 1 ? '' : 's'} along the highlighted residual path.`;
        pathEl.innerHTML = `<span class="ch12-flow__pathlabel">augmenting path</span><span class="ch12-flow__pathval">${r.nodes.join(' → ')} · +${r.add}</span>`;
      }
    }

    function setView(v) {
      view = v;
      viewButtons.forEach((b) => {
        const on = b.dataset.flowView === v;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      setHidden(residualGroup, v !== 'residual');
      render();
    }

    prevBtn.addEventListener('click', () => { if (step > 0) { step -= 1; render(); } });
    nextBtn.addEventListener('click', () => { if (step < maxStep) { step += 1; render(); } });
    resetBtn.addEventListener('click', () => { step = 0; render(); });
    viewButtons.forEach((b) => b.addEventListener('click', () => setView(b.dataset.flowView)));
    setView('flow');
  })();

  /* ============================================================
     DFS tree toggle
     ============================================================ */
  (() => {
    const root = $('#ch12Dfs');
    const svg = $('#ch12DfsSvg');
    if (!root || !svg) return;
    const capEl = $('#ch12DfsCap');
    const factsEl = $('#ch12DfsFacts');
    const ruleEl = $('#ch12DfsRule');
    const rings = $('.ch12-cut-rings', svg);
    const buttons = $$('[data-dfs-mode]', root);
    const cutNodes = [1, 2, 3];
    const bridgeEdges = ['25', '37'];

    const modes = {
      low: {
        cap: 'Every node stores the smallest discovery time reachable from its subtree. Back edges pull that value upward.',
        facts: [
          ['tree edges', '7'],
          ['back edges', '3 · 4→1, 8→2, 6→1'],
          ['root low', '1']
        ],
        rule: 'A tree edge <i>a</i> → <i>b</i> is a bridge when low(<i>b</i>) &gt; disc(<i>a</i>).'
      },
      cuts: {
        cap: 'The same low values, read as cuts. Red tree edges are bridges; dashed rings mark articulation points.',
        facts: [
          ['bridges', '2 · 2–5, 3–7'],
          ['articulation', '3 · 1, 2, 3'],
          ['root children', '2 · so 1 is a cut point']
        ],
        rule: 'For a non-root <i>x</i>, a child <i>b</i> with low(<i>b</i>) ≥ disc(<i>x</i>) makes <i>x</i> an articulation point.'
      }
    };

    function setMode(mode) {
      const m = modes[mode];
      root.classList.toggle('is-cuts', mode === 'cuts');
      capEl.textContent = m.cap;
      ruleEl.innerHTML = m.rule;
      factsEl.innerHTML = m.facts
        .map(([k, v]) => `<div class="ch12-dfs__fact"><span>${k}</span><strong>${v}</strong></div>`)
        .join('');
      buttons.forEach((b) => {
        const on = b.dataset.dfsMode === mode;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      $$('.ch12-tree-edges path', svg).forEach((p) => {
        p.classList.toggle('is-bridge', mode === 'cuts' && bridgeEdges.includes(p.dataset.tree));
      });
      $$('.ch12-dnode', svg).forEach((el) => {
        el.classList.toggle('is-cut', mode === 'cuts' && cutNodes.includes(Number(el.dataset.node)));
      });
      setHidden(rings, mode !== 'cuts');
    }

    buttons.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.dfsMode)));
    setMode('low');
  })();

  /* ============================================================
     Knight's tour grid
     ============================================================ */
  (() => {
    const grid = $('#ch12Knight');
    if (!grid) return;
    const tour = [
      [1, 20, 9, 14, 3],
      [10, 15, 2, 19, 24],
      [21, 8, 23, 4, 13],
      [16, 11, 6, 25, 18],
      [7, 22, 17, 12, 5]
    ];
    tour.forEach((row) => row.forEach((value) => {
      const cell = document.createElement('span');
      cell.className = 'ch12-knight__cell';
      cell.textContent = value;
      cell.setAttribute('aria-label', `Square ${value}`);
      if (value === 1) cell.classList.add('is-start');
      if (value === 25) cell.classList.add('is-end');
      grid.appendChild(cell);
    }));
  })();

  /* ============================================================
     Eulerian-subgraph subsets
     ============================================================ */
  (() => {
    const root = $('#ch12Subset');
    if (!root) return;
    for (let mask = 0; mask < 8; mask++) {
      const bits = [0, 1, 2].map((b) => (mask >> b) & 1);
      const names = bits.map((v, i) => v ? `b${i + 1}` : null).filter(Boolean);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'ch12-subset__cell';
      cell.setAttribute('aria-label', names.length ? `Subset ${names.join(', ')}` : 'Empty subset');
      cell.setAttribute('data-tip', names.length ? `back edges {${names.join(', ')}} · tree edges forced` : 'no back edges · tree edges forced');
      cell.innerHTML = bits.map((v) => `<i class="${v ? 'is-on' : ''}"></i>`).join('')
        + `<b>${bits.join('')}</b>`;
      root.appendChild(cell);
    }
  })();

  /* ============================================================
     Code cards
     ============================================================ */
  const sccCard = $('[data-code-card]');
  if (sccCard) {
    mountCodeCard(sccCard, {
      storageKey: 'gtcp-lang-ch12',
      order: ['cpp', 'python'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++',
          file: 'kosaraju.cpp',
          type: 'O(n + m)',
          note: 'Two depth-first searches: one for the finishing order, one on the reversed graph.',
          pre: true,
          keywords: ['for', 'while', 'if', 'else', 'return', 'break', 'continue', 'using', 'namespace'],
          types: ['int', 'bool', 'void', 'vector', 'string', 'long long'],
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'int n, m;',
            'vector<int> g[100005], rg[100005], order;',
            'bool seen[100005];',
            'int comp[100005];',
            '',
            'void dfs1(int s) {',
            '  seen[s] = true;',
            '  for (int v : g[s]) if (!seen[v]) dfs1(v);',
            '  order.push_back(s);',
            '}',
            'void dfs2(int s, int c) {',
            '  comp[s] = c;',
            '  for (int v : rg[s]) if (!comp[v]) dfs2(v, c);',
            '}',
            'int main() {',
            '  cin >> n >> m;',
            '  for (int i = 0; i < m; i++) {',
            '    int a, b; cin >> a >> b;',
            '    g[a].push_back(b);',
            '    rg[b].push_back(a);',
            '  }',
            '  for (int s = 1; s <= n; s++)',
            '    if (!seen[s]) dfs1(s);',
            '  reverse(order.begin(), order.end());',
            '  int c = 0;',
            '  for (int s : order)',
            '    if (!comp[s]) dfs2(s, ++c);',
            '  cout << c << "\\n";',
            '}'
          ]
        },
        python: {
          label: 'Python',
          file: 'kosaraju.py',
          type: 'O(n + m)',
          note: 'The same two passes. The recursion limit must be raised for deep graphs.',
          keywords: ['for', 'in', 'if', 'not', 'def', 'return', 'import', 'range', 'reversed', 'print'],
          types: ['list', 'bool', 'int'],
          code: [
            'import sys',
            'sys.setrecursionlimit(300000)',
            '',
            'def main():',
            '    data = sys.stdin.buffer.read().split()',
            '    n, m = map(int, data[:2])',
            '    g = [[] for _ in range(n + 1)]',
            '    rg = [[] for _ in range(n + 1)]',
            '    for i in range(m):',
            '        a, b = map(int, data[2 + 2*i:4 + 2*i])',
            '        g[a].append(b)',
            '        rg[b].append(a)',
            '',
            '    seen = [False] * (n + 1)',
            '    order = []',
            '    def dfs1(s):',
            '        seen[s] = True',
            '        for v in g[s]:',
            '            if not seen[v]:',
            '                dfs1(v)',
            '        order.append(s)',
            '',
            '    for s in range(1, n + 1):',
            '        if not seen[s]:',
            '            dfs1(s)',
            '',
            '    comp = [0] * (n + 1)',
            '    def dfs2(s, c):',
            '        comp[s] = c',
            '        for v in rg[s]:',
            '            if comp[v] == 0:',
            '                dfs2(v, c)',
            '',
            '    c = 0',
            '    for s in reversed(order):',
            '        if comp[s] == 0:',
            '            c += 1',
            '            dfs2(s, c)',
            '    print(c)',
            '',
            'main()'
          ]
        }
      }
    });
  }

  const flowCard = $$('[data-code-card]')[1];
  if (flowCard) {
    mountCodeCard(flowCard, {
      storageKey: 'gtcp-lang-ch12-flow',
      order: ['cpp', 'python'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++',
          file: 'edmonds-karp.cpp',
          type: 'O(m² n)',
          note: 'A capacity matrix keeps the residual graph implicit. BFS finds the shortest augmenting path.',
          pre: true,
          keywords: ['for', 'while', 'if', 'return', 'break', 'using', 'namespace', 'queue', 'fill'],
          types: ['int', 'bool', 'long long', 'vector'],
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'const int N = 505;',
            'int cap[N][N], parent[N], n;',
            '',
            'bool bfs(int s, int t) {',
            '  fill(parent, parent + n + 1, -1);',
            '  parent[s] = s;',
            '  queue<int> q; q.push(s);',
            '  while (!q.empty()) {',
            '    int u = q.front(); q.pop();',
            '    for (int v = 1; v <= n; v++) {',
            '      if (parent[v] == -1 && cap[u][v] > 0) {',
            '        parent[v] = u;',
            '        if (v == t) return true;',
            '        q.push(v);',
            '      }',
            '    }',
            '  }',
            '  return false;',
            '}',
            'int main() {',
            '  int m; cin >> n >> m;',
            '  for (int i = 0; i < m; i++) {',
            '    int a, b, c; cin >> a >> b >> c;',
            '    cap[a][b] += c;',
            '  }',
            '  int s = 1, t = n, flow = 0;',
            '  while (bfs(s, t)) {',
            '    int add = 1e9;',
            '    for (int v = t; v != s; v = parent[v])',
            '      add = min(add, cap[parent[v]][v]);',
            '    for (int v = t; v != s; v = parent[v]) {',
            '      cap[parent[v]][v] -= add;',
            '      cap[v][parent[v]] += add;',
            '    }',
            '    flow += add;',
            '  }',
            '  cout << flow << "\\n";',
            '}'
          ]
        },
        python: {
          label: 'Python',
          file: 'edmonds-karp.py',
          type: 'O(m² n)',
          note: 'Breadth-first search on the residual matrix; the reverse capacity is added directly.',
          keywords: ['for', 'in', 'if', 'while', 'break', 'def', 'return', 'import', 'not'],
          types: ['list', 'int'],
          code: [
            'from collections import deque',
            'import sys',
            '',
            'def main():',
            '    data = list(map(int, sys.stdin.buffer.read().split()))',
            '    n, m = data[0], data[1]',
            '    cap = [[0] * (n + 1) for _ in range(n + 1)]',
            '    p = 2',
            '    for _ in range(m):',
            '        a, b, c = data[p:p + 3]',
            '        p += 3',
            '        cap[a][b] += c',
            '',
            '    s, t = 1, n',
            '    flow = 0',
            '    while True:',
            '        parent = [-1] * (n + 1)',
            '        parent[s] = s',
            '        q = deque([s])',
            '        while q and parent[t] == -1:',
            '            u = q.popleft()',
            '            for v in range(1, n + 1):',
            '                if parent[v] == -1 and cap[u][v] > 0:',
            '                    parent[v] = u',
            '                    q.append(v)',
            '        if parent[t] == -1:',
            '            break',
            '        add = 10**9',
            '        v = t',
            '        while v != s:',
            '            add = min(add, cap[parent[v]][v])',
            '            v = parent[v]',
            '        v = t',
            '        while v != s:',
            '            u = parent[v]',
            '            cap[u][v] -= add',
            '            cap[v][u] += add',
            '            v = u',
            '        flow += add',
            '    print(flow)',
            '',
            'main()'
          ]
        }
      }
    });
  }
})();

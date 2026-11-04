/* Chapter 15 — Additional Topics */
(() => {
  const { $, $$, clamp, reduceMotion } = CP;
  const NS = 'http://www.w3.org/2000/svg';

  const svgEl = (tag, attrs = {}, parent = null) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (parent) parent.appendChild(el);
    return el;
  };

  /* ======================================================================
     Hero — thirty-two values in four blocks, one query
     ====================================================================== */
  (() => {
    const svg = $('.ch15-hero-map svg');
    const group = $('#ch15HeroBlocks');
    if (!svg || !group) return;
    const values = [
      5, 8, 6, 3, 4, 7, 2, 6,
      7, 1, 7, 5, 6, 2, 3, 2,
      4, 6, 8, 3, 5, 2, 7, 1,
      6, 3, 4, 8, 2, 5, 3, 7
    ];
    const B = 8;
    const x0 = 50, cw = 22, gap = 4, bgap = 18;
    const blockW = B * (cw + gap) - gap;
    const y = 118, h = 44;
    const ql = 5, qr = 21;

    for (let b = 0; b < 4; b++) {
      const bx = x0 + b * (blockW + bgap);
      svgEl('rect', { x: bx - 6, y: y - 8, width: blockW + 12, height: h + 26, rx: 2, class: 'ch15-hero-blockbed' }, group);
      let min = Infinity;
      for (let i = 0; i < B; i++) {
        const idx = b * B + i;
        const v = values[idx];
        min = Math.min(min, v);
        const cx = bx + i * (cw + gap);
        let cls = 'ch15-hero-cell';
        if (idx >= 8 && idx <= 15) cls += ' ch15-hero-cell--whole';
        else if (idx >= ql && idx <= qr) cls += ' ch15-hero-cell--edge';
        svgEl('rect', { x: cx, y, width: cw, height: h, rx: 1, class: cls }, group);
        const t = svgEl('text', { x: cx + cw / 2, y: y + h / 2 + 1, class: 'ch15-hero-cellval' }, group);
        t.textContent = v;
      }
      const minT = svgEl('text', {
        x: bx + blockW / 2, y: y + h + 22,
        class: 'ch15-hero-min' + (b === 1 ? ' ch15-hero-min--on' : '')
      }, group);
      minT.textContent = 'min ' + min;
    }

    const startX = x0 + ql * (cw + gap) + cw / 2;
    const endX = x0 + 2 * (blockW + bgap) + (qr - 16) * (cw + gap) + cw / 2;
    const bracket = $('#ch15HeroBracket');
    if (bracket) {
      bracket.setAttribute('d', `M${startX} 96 L${startX} 86 L${endX} 86 L${endX} 96`);
      if (!reduceMotion) {
        const len = bracket.getTotalLength();
        bracket.style.strokeDasharray = len;
        bracket.style.strokeDashoffset = len;
      }
    }
    const q = $('#ch15HeroQuery');
    if (q) {
      q.setAttribute('x', (startX + endX) / 2);
      q.textContent = 'query [' + ql + ', ' + qr + ']';
    }
  })();

  /* ======================================================================
     Letter grid
     ====================================================================== */
  (() => {
    const grid = $('#ch15LetterGrid');
    if (!grid) return;
    const rows = [
      ['A', 'C', 'E', 'A', 'B'],
      ['F', 'D', 'E', 'A', 'C'],
      ['C', 'F', 'D', 'A', 'A'],
      ['B', 'E', 'A', 'C', 'F'],
      ['A', 'C', 'F', 'B', 'E']
    ];
    const size = 54, ox = 75, oy = 62;
    rows.forEach((row, r) => {
      row.forEach((ch, c) => {
        const x = ox + c * size, y = oy + r * size;
        const isD = ch === 'D';
        const g = svgEl('g', {}, grid);
        if (isD) {
          g.setAttribute('tabindex', '0');
          g.setAttribute('data-tip', 'Letter D · Manhattan distance 2 from the other D');
          g.setAttribute('aria-label', 'Letter D');
        }
        svgEl('rect', { x, y, width: size, height: size, class: isD ? 'is-letter-bg' : '' }, g);
        const t = svgEl('text', {
          x: x + size / 2, y: y + size / 2 + 1,
          class: isD ? 'is-letter' : ''
        }, g);
        t.textContent = ch;
      });
    });
    const path = document.querySelector('.ch15-letter-path');
    if (path) path.setAttribute('d', 'M156 170 L156 197 L183 197');
    const dots = $$('.ch15-letter-dot');
    if (dots[0]) { dots[0].setAttribute('cx', 156); dots[0].setAttribute('cy', 170); }
    if (dots[1]) { dots[1].setAttribute('cx', 183); dots[1].setAttribute('cy', 197); }
  })();

  /* ======================================================================
     Square-root block query stepper
     ====================================================================== */
  (() => {
    const grid = $('[data-lab-grid]');
    if (!grid) return;
    const values = [5, 8, 6, 3, 4, 7, 2, 6, 7, 1, 7, 5, 6, 2, 3, 2];
    const B = 4;
    const cellEls = [];
    const blockEls = [];
    const minEls = [];
    const mins = [];

    function minOf(b) {
      let m = Infinity;
      for (let i = b * B; i < b * B + B; i++) m = Math.min(m, values[i]);
      return m;
    }

    for (let b = 0; b < 4; b++) {
      mins[b] = minOf(b);
      const block = document.createElement('div');
      block.className = 'ch15-block';
      const label = document.createElement('span');
      label.className = 'ch15-block__label';
      label.textContent = `block ${b} · [${b * B}–${b * B + B - 1}]`;
      const cells = document.createElement('div');
      cells.className = 'ch15-cells';
      for (let i = 0; i < B; i++) {
        const idx = b * B + i;
        const cell = document.createElement('span');
        cell.className = 'ch15-cell';
        cell.textContent = values[idx];
        cell.setAttribute('aria-label', `a[${idx}] = ${values[idx]}`);
        cellEls[idx] = cell;
        cells.appendChild(cell);
      }
      const min = document.createElement('div');
      min.className = 'ch15-block__min';
      min.innerHTML = `<span>min</span><b>${mins[b]}</b>`;
      block.append(label, cells, min);
      blockEls[b] = block;
      minEls[b] = min.querySelector('b');
      grid.appendChild(block);
    }

    const countEl = $('[data-lab-count]');
    const wholeEl = $('[data-lab-blocks]');
    const answerEl = $('[data-lab-answer]');
    const naiveEl = $('[data-lab-naive]');
    const log = $('[data-lab-log]');
    const stepBtn = $('[data-lab-step]');
    const resetBtn = $('[data-lab-reset]');
    const updateBtn = $('[data-lab-update]');

    let range = [2, 13];
    let sequence = [];
    let cursor = 0;
    let whole = 0;
    let best = Infinity;
    let updated = false;

    function inRange(i) { return i >= range[0] && i <= range[1]; }

    function makeSequence() {
      const [l, r] = range;
      const bl = Math.floor(l / B);
      const br = Math.floor(r / B);
      const out = [];
      if (bl === br) {
        if (l === bl * B && r === bl * B + B - 1) out.push({ type: 'block', b: bl });
        else for (let i = l; i <= r; i++) out.push({ type: 'cell', idx: i });
        return out;
      }
      if (l === bl * B) out.push({ type: 'block', b: bl });
      else for (let i = l; i < (bl + 1) * B; i++) out.push({ type: 'cell', idx: i });
      for (let b = bl + 1; b < br; b++) out.push({ type: 'block', b });
      if (r === (br + 1) * B - 1) out.push({ type: 'block', b: br });
      else for (let i = br * B; i <= r; i++) out.push({ type: 'cell', idx: i });
      return out;
    }

    function paintBase() {
      cellEls.forEach((cell, i) => {
        cell.classList.remove('is-scanned', 'is-current', 'is-covered');
        cell.classList.toggle('is-out', !inRange(i));
      });
      blockEls.forEach((block, b) => {
        block.classList.remove('is-active');
        block.classList.toggle('is-updated', updated && b === 2);
      });
    }

    function updateStats() {
      if (countEl) countEl.textContent = String(cursor);
      if (wholeEl) wholeEl.textContent = String(whole);
      if (answerEl) answerEl.textContent = best === Infinity ? '—' : String(best);
      if (naiveEl) naiveEl.textContent = `${range[1] - range[0] + 1} cells the naive way`;
    }

    function reset() {
      cursor = 0;
      whole = 0;
      best = Infinity;
      sequence = makeSequence();
      paintBase();
      updateStats();
      if (stepBtn) stepBtn.querySelector('span').textContent = 'Step';
      if (log) {
        log.textContent = sequence.length && sequence.every((s) => s.type === 'block')
          ? 'Both ends fall on block boundaries, so Step reads whole-block minima directly.'
          : 'Choose a range and press Step. The first partial block is scanned value by value.';
      }
    }

    function step() {
      if (cursor >= sequence.length) { reset(); return; }
      const action = sequence[cursor];
      cellEls.forEach((cell) => cell.classList.remove('is-current'));

      if (action.type === 'cell') {
        const v = values[action.idx];
        best = Math.min(best, v);
        const cell = cellEls[action.idx];
        cell.classList.remove('is-out');
        cell.classList.add('is-scanned', 'is-current');
        if (log) log.innerHTML = `Read <b>a[${action.idx}] = ${v}</b>. Running minimum: <b>${best}</b>.`;
      } else {
        whole += 1;
        const b = action.b;
        blockEls[b].classList.add('is-active');
        for (let i = b * B; i < b * B + B; i++) {
          cellEls[i].classList.remove('is-out');
          cellEls[i].classList.add('is-covered');
        }
        best = Math.min(best, mins[b]);
        if (log) log.innerHTML = `Block <b>${b}</b> covers [${b * B}, ${b * B + B - 1}]; its stored minimum is <b>${mins[b]}</b>. One inspection replaces four reads.`;
      }

      cursor += 1;
      updateStats();
      if (cursor >= sequence.length && log) {
        const naive = range[1] - range[0] + 1;
        log.innerHTML = `Minimum <b>${best}</b> after <b>${cursor}</b> inspections — the naive scan would read <b>${naive}</b> cells.`;
        if (stepBtn) stepBtn.querySelector('span').textContent = 'Restart';
      }
    }

    if (stepBtn) stepBtn.addEventListener('click', step);
    if (resetBtn) resetBtn.addEventListener('click', reset);

    $$('[data-range]').forEach((btn) => {
      btn.addEventListener('click', () => {
        range = btn.dataset.range.split(',').map(Number);
        $$('[data-range]').forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        reset();
      });
    });

    if (updateBtn) {
      updateBtn.addEventListener('click', () => {
        values[10] = 0;
        mins[2] = 0;
        updated = true;
        cellEls[10].textContent = '0';
        cellEls[10].setAttribute('aria-label', 'a[10] = 0');
        minEls[2].textContent = '0';
        blockEls[2].classList.add('is-updated');
        reset();
        if (log) log.innerHTML = '<b>a[10]</b> is now 0. Block 2’s stored minimum is 0; only block 2 needed rescanning.';
        updateBtn.disabled = true;
        updateBtn.innerHTML = 'a[10] = 0 <span>block 2 rebuilt</span><svg class="icon"><use href="#i-arrow"/></svg>';
      });
    }

    reset();
  })();

  /* ======================================================================
     Black squares grid
     ====================================================================== */
  (() => {
    const grid = $('#ch15BlackGrid');
    if (!grid) return;
    const black = [1, 1];
    const x = [3, 2];
    const path = [[2, 1], [3, 1]];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = document.createElement('span');
        cell.className = 'ch15-turn__cell';
        if (r === black[0] && c === black[1]) {
          cell.classList.add('is-black');
          cell.setAttribute('data-tip', 'A black square');
        } else if (r === x[0] && c === x[1]) {
          cell.classList.add('is-x');
          cell.textContent = 'X';
          cell.setAttribute('data-tip', 'The chosen square · distance 3');
        } else if (path.some(([pr, pc]) => pr === r && pc === c)) {
          cell.classList.add('is-path');
        }
        grid.appendChild(cell);
      }
    }
  })();

  /* ======================================================================
     Parameter tuning bars
     ====================================================================== */
  (() => {
    const wrap = $('#ch15Tune');
    if (!wrap) return;
    const data = [
      [200, 5.74], [500, 2.41], [1000, 1.32], [2000, 1.02],
      [5000, 1.28], [10000, 2.13], [20000, 3.97]
    ];
    const max = 5.74;
    data.forEach(([k, t]) => {
      const row = document.createElement('div');
      row.className = 'ch15-tune__row' + (k === 2000 ? ' is-best' : '');
      row.innerHTML = `<span class="ch15-tune__k">k = ${k}</span>
        <span class="ch15-tune__track"><span class="ch15-tune__fill" style="--w:${(t / max) * 100}%"></span></span>
        <span class="ch15-tune__v">${t.toFixed(2)} s</span>`;
      wrap.appendChild(row);
    });
  })();

  /* ======================================================================
     Partitions
     ====================================================================== */
  (() => {
    const wrap = $('#ch15Sticks');
    if (!wrap) return;
    const rows = [
      [[7], '1 distinct'],
      [[3, 4], '2 distinct'],
      [[1, 3, 3], '2 distinct'],
      [[1, 2, 4], '3 distinct']
    ];
    rows.forEach(([parts, count]) => {
      const row = document.createElement('div');
      row.className = 'ch15-stick';
      const segs = parts.map((p) => `<span class="ch15-stick__seg" style="flex:${p}">${p}</span>`).join('');
      row.innerHTML = `<span class="ch15-stick__label">7 = ${parts.join(' + ')}</span>
        <span class="ch15-stick__bar">${segs}</span>
        <span class="ch15-stick__count">${count}</span>`;
      wrap.appendChild(row);
    });
  })();

  /* ======================================================================
     Mo's algorithm — two ranges
     ====================================================================== */
  (() => {
    const svg = $('#ch15MoRows');
    if (!svg) return;
    const values = [4, 2, 5, 4, 2, 4, 3, 3, 4, 4];
    const x0 = 40, cw = 56, gap = 8, step = cw + gap;
    const rows = [
      { y: 62, from: 1, to: 4, cls: 'first', label: 'range [1, 4]' },
      { y: 162, from: 2, to: 6, cls: 'second', label: 'range [2, 6]' }
    ];
    rows.forEach((row) => {
      const label = svgEl('text', {
        x: x0, y: row.y - 12, class: 'ch15-mo-label'
      }, svg);
      label.textContent = row.label;
      for (let i = 0; i < 10; i++) {
        const x = x0 + i * step;
        const on = i >= row.from && i <= row.to;
        svgEl('rect', {
          x, y: row.y, width: cw, height: 44, rx: 1,
          class: 'ch15-mo-cell' + (on ? ' ch15-mo-cell--' + row.cls : ''),
          'data-tip': `a[${i}] = ${values[i]}`
        }, svg);
        const t = svgEl('text', {
          x: x + cw / 2, y: row.y + 27,
          class: 'ch15-mo-value' + (on ? ' is-on' : '')
        }, svg);
        t.textContent = values[i];
      }
    });
    function moveArrow(from, to, y, label) {
      svgEl('line', { x1: from, y1: y, x2: to - 4, y2: y, class: 'ch15-mo-arrow' }, svg);
      svgEl('path', {
        d: `M${to - 9} ${y - 3} L${to - 4} ${y} L${to - 9} ${y + 3}`,
        class: 'ch15-mo-arrowhead'
      }, svg);
      const t = svgEl('text', { x: (from + to) / 2, y: y - 6, class: 'ch15-mo-move-label' }, svg);
      t.textContent = label;
    }
    moveArrow(x0 + 1 * step + cw / 2, x0 + 2 * step + cw / 2, 128, 'left +1');
    moveArrow(x0 + 4 * step + cw / 2, x0 + 6 * step + cw / 2, 128, 'right +2');

    const note = svgEl('text', { x: x0, y: 244, class: 'ch15-mo-note' }, svg);
    note.textContent = '3 moves: left +1, right +2 — three O(1) updates';
  })();

  /* ======================================================================
     Two-dimensional segment tree matrix
     ====================================================================== */
  (() => {
    const group = $('#ch15Matrix');
    if (!group) return;
    const n = 6;
    const x0 = 160, y0 = 64, side = 40;
    const values = [
      [3, 1, 4, 2, 7, 5],
      [9, 2, 6, 5, 3, 8],
      [5, 8, 3, 9, 1, 4],
      [2, 6, 7, 4, 8, 3],
      [7, 4, 1, 8, 6, 2],
      [8, 3, 9, 6, 4, 7]
    ];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const selected = c >= 2 && c <= 4 && r >= 1 && r <= 3;
        const x = x0 + c * side;
        const y = y0 + r * side;
        svgEl('rect', {
          x, y, width: side - 2, height: side - 2, rx: 1,
          class: 'ch15-2d-cell' + (selected ? ' is-sel' : '')
        }, group);
        const t = svgEl('text', {
          x: x + (side - 2) / 2, y: y + side / 2 - 1,
          class: 'ch15-2d-cellval' + (selected ? ' is-on' : '')
        }, group);
        t.textContent = values[r][c];
      }
    }
    for (let c = 0; c < n; c++) {
      const t = svgEl('text', {
        x: x0 + c * side + (side - 2) / 2, y: y0 - 8,
        class: 'ch15-2d-index'
      }, group);
      t.textContent = c;
    }
    for (let r = 0; r < n; r++) {
      const t = svgEl('text', {
        x: x0 - 10, y: y0 + r * side + side / 2 - 1,
        class: 'ch15-2d-index'
      }, group);
      t.textContent = r;
    }
  })();

  /* ======================================================================
     Lazy segment tree
     ====================================================================== */
  (() => {
    const svg = $('#ch15LazySvg');
    if (!svg) return;
    const nodes = [
      { id: 'root', range: '[0,7]', x: 450, y: 48, parent: null },
      { id: 'n03', range: '[0,3]', x: 240, y: 135, parent: 'root' },
      { id: 'n47', range: '[4,7]', x: 660, y: 135, parent: 'root' },
      { id: 'n01', range: '[0,1]', x: 130, y: 222, parent: 'n03' },
      { id: 'n23', range: '[2,3]', x: 350, y: 222, parent: 'n03' },
      { id: 'n45', range: '[4,5]', x: 550, y: 222, parent: 'n47' },
      { id: 'n67', range: '[6,7]', x: 770, y: 222, parent: 'n47' },
      { id: 'l0', range: '[0]', x: 80, y: 318, parent: 'n01' },
      { id: 'l1', range: '[1]', x: 180, y: 318, parent: 'n01' },
      { id: 'l2', range: '[2]', x: 300, y: 318, parent: 'n23' },
      { id: 'l3', range: '[3]', x: 400, y: 318, parent: 'n23' },
      { id: 'l4', range: '[4]', x: 500, y: 318, parent: 'n45' },
      { id: 'l5', range: '[5]', x: 600, y: 318, parent: 'n45' },
      { id: 'l6', range: '[6]', x: 700, y: 318, parent: 'n67' },
      { id: 'l7', range: '[7]', x: 800, y: 318, parent: 'n67' }
    ];
    const base = {
      root: [39, 0], n03: [22, 0], n47: [17, 0],
      n01: [13, 0], n23: [9, 0], n45: [9, 0], n67: [8, 0],
      l0: [5, 0], l1: [8, 0], l2: [6, 0], l3: [3, 0],
      l4: [2, 0], l5: [7, 0], l6: [2, 0], l7: [6, 0]
    };
    const states = {
      before: {
        values: base,
        covered: [],
        visited: [],
        pushed: [],
        note: 'Each node shows <b>s / z</b>: the sum of its range and its pending lazy update. No tags are active yet.',
        answer: ''
      },
      update: {
        values: Object.assign({}, base, {
          root: [47, 0], n47: [25, 0], n45: [13, 2], n67: [12, 2]
        }),
        covered: ['n45', 'n67'],
        visited: ['root', 'n47', 'n45', 'n67'],
        pushed: [],
        note: 'Adding 2 to [4,7] covers [4,5] and [6,7] completely: their <b>z</b> becomes 2 and their sums grow. The leaves are untouched.',
        answer: 'root 47'
      },
      query: {
        values: Object.assign({}, base, {
          root: [47, 0], n47: [25, 0], n45: [13, 0], n67: [12, 0],
          l4: [4, 0], l5: [9, 0], l6: [4, 0], l7: [8, 0]
        }),
        covered: [],
        visited: ['root', 'n03', 'n23', 'l3', 'n47', 'n45', 'n67', 'l6'],
        pushed: ['n45', 'n67'],
        note: 'The query [3,6] passes through [4,5] and [6,7], so their tags are pushed into the leaves first. The visited nodes give 3 + 13 + 4.',
        answer: 'answer 20'
      }
    };
    let mode = 'before';
    let previous = null;

    function render() {
      const state = states[mode];
      svg.innerHTML = '';
      const byId = {};
      nodes.forEach((n) => { byId[n.id] = n; });
      nodes.forEach((n) => {
        if (!n.parent) return;
        const p = byId[n.parent];
        svgEl('line', { x1: p.x, y1: p.y, x2: n.x, y2: n.y, class: 'ch15-lazy-edge' }, svg);
      });
      if (mode === 'query') {
        svgEl('rect', { x: 478, y: 190, width: 344, height: 172, rx: 3, class: 'ch15-lazy-push' }, svg);
      }
      nodes.forEach((n) => {
        const [s, z] = state.values[n.id];
        const g = svgEl('g', {
          class: 'ch15-lazy-node' +
            (state.covered.includes(n.id) ? ' is-covered' : '') +
            (state.pushed.includes(n.id) ? ' is-pushed' : '') +
            (state.visited.includes(n.id) ? ' is-visited' : '') +
            (previous && previous[n.id] && (previous[n.id][0] !== s || previous[n.id][1] !== z) ? ' is-changed' : ''),
          transform: `translate(${n.x} ${n.y})`,
          tabindex: '0',
          'data-tip': `${n.range} · sum ${s} · lazy ${z}`,
          'aria-label': `Range ${n.range}, sum ${s}, lazy tag ${z}`
        }, svg);
        svgEl('circle', { r: 26 }, g);
        const st = svgEl('text', { y: -2, class: 's' }, g);
        st.textContent = s;
        const zt = svgEl('text', { y: 13, class: 'z' }, g);
        zt.textContent = 'z ' + z;
      });
      const note = $('[data-lazy-note]');
      if (note) note.innerHTML = state.note;
      const answer = $('[data-lazy-answer]');
      if (answer) answer.textContent = state.answer;
      previous = {};
      Object.entries(state.values).forEach(([id, pair]) => { previous[id] = pair; });
    }

    $$('[data-lazy-state]').forEach((btn) => {
      btn.addEventListener('click', () => {
        mode = btn.dataset.lazyState;
        $$('[data-lazy-state]').forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        render();
      });
    });
    render();
  })();

  /* ======================================================================
     Treap — split and merge
     ====================================================================== */
  (() => {
    const svg = $('#ch15TreapSvg');
    if (!svg) return;
    const ribbonWrap = $('[data-treap-ribbons]');
    const log = $('[data-treap-log]');
    const splitBtn = $('[data-treap-split]');
    const mergeBtn = $('[data-treap-merge]');
    const resetBtn = $('[data-treap-reset]');
    const data = [['S', 9], ['A', 3], ['N', 6], ['D', 1], ['W', 8], ['I', 9], ['C', 4], ['H', 5]];

    function node(v, w) {
      return { v, w, left: null, right: null, size: 1 };
    }
    function size(t) { return t ? t.size : 0; }
    function upd(t) { t.size = 1 + size(t.left) + size(t.right); }
    function merge(a, b, path) {
      if (!a) return b;
      if (!b) return a;
      if (a.w < b.w) {
        if (path) path.push(a.v);
        a.right = merge(a.right, b, path);
        upd(a);
        return a;
      }
      if (path) path.push(b.v);
      b.left = merge(a, b.left, path);
      upd(b);
      return b;
    }
    function split(t, k, path) {
      if (!t) return [null, null];
      if (path) path.push(t.v);
      if (size(t.left) < k) {
        const [a, b] = split(t.right, k - size(t.left) - 1, path);
        t.right = a;
        upd(t);
        return [t, b];
      }
      const [a, b] = split(t.left, k, path);
      t.left = b;
      upd(t);
      return [a, t];
    }
    function build() {
      let root = null;
      data.forEach(([v, w]) => { root = merge(root, node(v, w)); });
      return root;
    }
    function collect(t, depth, out) {
      if (!t) return;
      collect(t.left, depth + 1, out);
      out.push({ node: t, depth });
      collect(t.right, depth + 1, out);
    }

    let mode = 'initial';
    let roots = [build()];
    let path = new Set();

    function render() {
      svg.innerHTML = '';
      const items = [];
      const offsets = [];
      let total = 0;
      roots.forEach((root) => {
        const list = [];
        collect(root, 0, list);
        offsets.push(total);
        total += list.length;
        items.push({ list, root });
      });
      const step = total > 1 ? 680 / (total - 1) : 0;
      const positioned = [];
      items.forEach((item, ri) => {
        item.list.forEach((entry, i) => {
          entry.x = 70 + (offsets[ri] + i) * step;
          entry.y = 52 + entry.depth * 72;
          positioned.push(entry);
        });
      });
      items.forEach((item) => {
        const set = new Set(item.list.map((e) => e.node));
        item.list.forEach((entry) => {
          if (entry.node.left && set.has(entry.node.left)) {
            const child = positioned.find((p) => p.node === entry.node.left);
            svgEl('line', { x1: entry.x, y1: entry.y, x2: child.x, y2: child.y, class: 'ch15-treap-edge' }, svg);
          }
          if (entry.node.right && set.has(entry.node.right)) {
            const child = positioned.find((p) => p.node === entry.node.right);
            svgEl('line', { x1: entry.x, y1: entry.y, x2: child.x, y2: child.y, class: 'ch15-treap-edge' }, svg);
          }
        });
      });
      positioned.forEach((entry, i) => {
        const n = entry.node;
        const g = svgEl('g', {
          class: 'ch15-treap-node' + (path.has(n.v) ? ' is-path' : ''),
          transform: `translate(${entry.x} ${entry.y})`,
          tabindex: '0',
          'data-tip': `value ${n.v} · weight ${n.w} · subtree ${n.size}`,
          'aria-label': `Value ${n.v}, weight ${n.w}, subtree size ${n.size}`,
          style: `animation-delay:${Math.min(i * 25, 180)}ms`
        }, svg);
        svgEl('circle', { r: 22 }, g);
        const v = svgEl('text', { y: -2, class: 'v' }, g);
        v.textContent = n.v;
        const w = svgEl('text', { y: 11, class: 'w' }, g);
        w.textContent = n.w;
      });

      if (ribbonWrap) {
        ribbonWrap.innerHTML = '';
        const labels = mode === 'split' ? ['left treap · 5', 'right treap · 3'] : [mode === 'merged' ? 'array · 8' : 'array · 8'];
        roots.forEach((root, ri) => {
          const list = [];
          collect(root, 0, list);
          const div = document.createElement('div');
          div.className = 'ch15-ribbon';
          const cells = list.map((e) => `<span class="${path.has(e.node.v) ? 'is-path' : ''}">${e.node.v}</span>`).join('');
          div.innerHTML = `<div class="ch15-ribbon__label"><span>${labels[ri] || ''}</span><span>inorder</span></div><div class="ch15-ribbon__cells">${cells}</div>`;
          ribbonWrap.appendChild(div);
        });
      }
      if (log) {
        if (mode === 'initial') log.textContent = 'The array reads S A N D W I C H. Press Split at 5 to cut it after W.';
        else if (mode === 'split') log.textContent = 'Split visits D, C, W, I. D keeps its left subtree and joins the left treap; C joins the right; W and I are the final cut.';
        else log.textContent = 'Merge compares D (1) with C (4): D wins. A (3) then C (4) follow, and H (5) takes S as its right child. The array is I C H S A N D W.';
      }
      if (splitBtn) splitBtn.disabled = mode !== 'initial';
      if (mergeBtn) mergeBtn.disabled = mode !== 'split';
    }

    if (splitBtn) {
      splitBtn.addEventListener('click', () => {
        mode = 'split';
        path = new Set();
        const [l, r] = split(build(), 5, []);
        const p = [];
        // run again to record the visited path in the same order
        split(build(), 5, p);
        path = new Set(p);
        roots = [l, r];
        render();
      });
    }
    if (mergeBtn) {
      mergeBtn.addEventListener('click', () => {
        const [l, r] = split(build(), 5);
        const p = [];
        const merged = merge(r, l, p);
        mode = 'merged';
        path = new Set(p);
        roots = [merged];
        render();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        mode = 'initial';
        path = new Set();
        roots = [build()];
        render();
      });
    }
    render();
  })();

  /* ======================================================================
     Convex hull trick
     ====================================================================== */
  (() => {
    const svg = $('#ch15ChtSvg');
    const range = $('#ch15ChtRange');
    if (!svg || !range) return;
    const L = 64, R = 722, T = 30, B = 344;
    const sx = (x) => L + (x / 12) * (R - L);
    const sy = (y) => B - (y / 10) * (B - T);
    const lines = [
      { id: 1, a: 1, b: 2 },
      { id: 2, a: 1 / 3, b: 4 },
      { id: 3, a: 1 / 6, b: 5 },
      { id: 4, a: -1 / 4, b: 7 }
    ];
    const names = { 1: 'f₁', 2: 'f₂', 3: 'f₃', 4: 'f₄' };
    const subs = { 1: '₁', 2: '₂', 3: '₃', 4: '₄' };

    const grid = svgEl('g', { class: 'ch15-cht-grid' }, svg);
    for (let x = 0; x <= 12; x += 2) {
      svgEl('line', { x1: sx(x), y1: T, x2: sx(x), y2: B }, grid);
      const t = svgEl('text', { x: sx(x), y: B + 18, class: 'ch15-cht-tick' }, svg);
      t.textContent = x;
    }
    for (let y = 0; y <= 10; y += 2) {
      svgEl('line', { x1: L, y1: sy(y), x2: R, y2: sy(y) }, grid);
      const t = svgEl('text', { x: L - 8, y: sy(y) + 3, class: 'ch15-cht-tick ch15-cht-tick--y' }, svg);
      t.textContent = y;
    }
    svgEl('line', { x1: L, y1: B, x2: R, y2: B, class: 'ch15-cht-axis' }, svg);
    svgEl('line', { x1: L, y1: T, x2: L, y2: B, class: 'ch15-cht-axis' }, svg);
    const xLabel = svgEl('text', { x: R, y: B + 34, class: 'ch15-cht-tick' }, svg);
    xLabel.textContent = 'x';
    const yLabel = svgEl('text', { x: L - 8, y: T - 10, class: 'ch15-cht-tick ch15-cht-tick--y' }, svg);
    yLabel.textContent = 'f(x)';

    const defs = svgEl('defs', {}, svg);
    const clip = svgEl('clipPath', { id: 'ch15ChtClip' }, defs);
    svgEl('rect', { x: L, y: T, width: R - L, height: B - T }, clip);

    const lineGroup = svgEl('g', { 'clip-path': 'url(#ch15ChtClip)' }, svg);
    lines.forEach((line) => {
      const p = svgEl('path', {
        d: `M${sx(0)} ${sy(line.b)} L${sx(12)} ${sy(line.a * 12 + line.b)}`,
        class: 'ch15-cht-line',
        'data-id': line.id
      }, lineGroup);
      p.dataset.id = line.id;
    });
    const envelope = svgEl('path', {
      d: `M${sx(0)} ${sy(2)} L${sx(3)} ${sy(5)} L${sx(36 / 7)} ${sy(36 / 7 / 3 + 4)} L${sx(12)} ${sy(4)}`,
      class: 'ch15-cht-envelope'
    }, svg);

    const labelGroup = svgEl('g', {}, svg);
    lines.forEach((line) => {
      const lx = 0.55;
      const t = svgEl('text', {
        x: sx(lx) + 4, y: sy(line.a * lx + line.b) - 4,
        class: 'ch15-cht-line-label',
        'data-label': line.id
      }, labelGroup);
      t.textContent = names[line.id];
      t.dataset.label = line.id;
    });

    const marker = svgEl('line', { x1: sx(4), y1: T, x2: sx(4), y2: B, class: 'ch15-cht-marker' }, svg);
    const dotGroup = svgEl('g', {}, svg);
    const dots = {};
    lines.forEach((line) => {
      dots[line.id] = svgEl('circle', {
        cx: sx(4), cy: sy(line.a * 4 + line.b), r: 3.5,
        class: 'ch15-cht-dot'
      }, dotGroup);
    });

    const outX = $('[data-cht-x]');
    const outFn = $('[data-cht-fn]');
    const outVal = $('[data-cht-val]');
    const outExact = $('[data-cht-exact]');
    const segs = $$('[data-cht-seg]');

    function update() {
      const x = Number(range.value);
      const values = lines.map((l) => ({ ...l, value: l.a * x + l.b }));
      let best = values[0];
      values.forEach((v) => { if (v.value <= best.value) best = v; });
      if (outX) outX.textContent = x.toFixed(1);
      if (outFn) outFn.textContent = names[best.id];
      if (outVal) outVal.textContent = `${names[best.id]}(${x.toFixed(1)}) = ${best.value.toFixed(2)}`;
      if (outExact) {
        if (Math.abs(x - 4) < 0.001) outExact.textContent = '16/3';
        else if (Math.abs(x - 3) < 0.001) outExact.textContent = 'f₁ = f₂ = 5';
        else outExact.textContent = '';
      }
      range.setAttribute('aria-valuetext', `x = ${x.toFixed(1)}, minimum ${best.value.toFixed(2)} from ${names[best.id]}`);
      $$('.ch15-cht-line').forEach((p) => {
        p.classList.toggle('is-active', Number(p.dataset.id) === best.id);
      });
      $$('.ch15-cht-line-label').forEach((p) => {
        p.classList.toggle('is-active', Number(p.dataset.label) === best.id);
      });
      Object.entries(dots).forEach(([id, dot]) => {
        const line = values.find((v) => String(v.id) === id);
        dot.setAttribute('cx', sx(x));
        dot.setAttribute('cy', sy(clamp(line.value, 0, 10)));
        dot.classList.toggle('is-active', line.id === best.id);
      });
      marker.setAttribute('x1', sx(x));
      marker.setAttribute('x2', sx(x));
      const owner = x < 3 ? '1' : (x < 36 / 7 ? '2' : '4');
      segs.forEach((seg) => seg.classList.toggle('is-active', seg.dataset.chtSeg === owner));
    }
    range.addEventListener('input', update);
    update();
  })();

  /* ======================================================================
     Meet in the middle
     ====================================================================== */
  (() => {
    const svg = $('#ch15MitmSvg');
    if (!svg) return;
    const A = [0, 2, 4, 6];
    const B = [0, 5, 9, 14];
    const rows = { left: {}, right: {} };
    const xL = 70, xR = 550, w = 140, h = 32, rowH = 46, y0 = 80;

    const hA = svgEl('text', { x: 140, y: 44, class: 'ch15-mitm-heading', 'text-anchor': 'middle' }, svg);
    hA.textContent = 'A = {2, 4}';
    const hB = svgEl('text', { x: 620, y: 44, class: 'ch15-mitm-heading', 'text-anchor': 'middle' }, svg);
    hB.textContent = 'B = {5, 9}';

    function makeRows(values, side, x) {
      values.forEach((v, i) => {
        const y = y0 + i * rowH;
        const g = svgEl('g', { class: 'ch15-mitm-row', 'data-side': side, 'data-val': v }, svg);
        svgEl('rect', { x, y, width: w, height: h, rx: 2 }, g);
        const t = svgEl('text', { x: x + w / 2, y: y + h / 2 + 1 }, g);
        t.textContent = v;
        rows[side][v] = { g, cy: y + h / 2 };
      });
    }
    makeRows(A, 'left', xL);
    makeRows(B, 'right', xR);

    const targetBox = svgEl('rect', { x: 342, y: 126, width: 76, height: 50, rx: 2, fill: 'var(--c-171717)' }, svg);
    const targetText = svgEl('text', { x: 380, y: 154, class: 'ch15-mitm-target', fill: 'var(--c-ffffff)' }, svg);
    targetText.textContent = '15';
    const targetLabel = svgEl('text', { x: 380, y: 114, class: 'ch15-mitm-target-label' }, svg);
    targetLabel.textContent = 'target';
    const leftLink = svgEl('path', { class: 'ch15-mitm-link', d: '' }, svg);
    const rightLink = svgEl('path', { class: 'ch15-mitm-link', d: '' }, svg);
    const sumText = svgEl('text', { x: 380, y: 282, class: 'ch15-mitm-sum' }, svg);
    sumText.textContent = '6 + 9 = 15';

    function pairFor(target) {
      for (const a of A) {
        for (const b of B) {
          if (a + b === target) return [a, b];
        }
      }
      return null;
    }

    function select(target) {
      const pair = pairFor(target);
      $$('.ch15-mitm-row').forEach((g) => g.classList.remove('is-on'));
      leftLink.classList.remove('is-on');
      rightLink.classList.remove('is-on');
      targetText.textContent = target;
      const note = $('[data-mitm-note]');
      $$('[data-target]').forEach((b) => {
        const on = Number(b.dataset.target) === target;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      if (pair) {
        const [a, b] = pair;
        rows.left[a].g.classList.add('is-on');
        rows.right[b].g.classList.add('is-on');
        leftLink.setAttribute('d', `M${xL + w} ${rows.left[a].cy} C 260 ${rows.left[a].cy}, 300 150, 338 150`);
        rightLink.setAttribute('d', `M${xR} ${rows.right[b].cy} C 480 ${rows.right[b].cy}, 440 150, 422 150`);
        leftLink.classList.add('is-on');
        rightLink.classList.add('is-on');
        sumText.textContent = `${a} + ${b} = ${target}`;
        if (note) note.innerHTML = `${a} from <i>S</i><sub>A</sub> and ${b} from <i>S</i><sub>B</sub> give ${target}. Only the two half-lists were enumerated.`;
      } else {
        sumText.textContent = 'no pair';
        if (note) note.innerHTML = `No value in <i>S</i><sub>A</sub> plus a value in <i>S</i><sub>B</sub> equals ${target} — so no subset of {2, 4, 5, 9} has this sum.`;
      }
    }

    $$('[data-target]').forEach((btn) => {
      btn.addEventListener('click', () => select(Number(btn.dataset.target)));
    });
    select(15);
  })();

  /* ======================================================================
     Subset lattice
     ====================================================================== */
  (() => {
    const svg = $('#ch15LatticeSvg');
    if (!svg) return;
    const value = [3, 1, 4, 5, 5, 1, 3, 3];
    const nodes = [
      { mask: 0, x: 360, y: 52 },
      { mask: 1, x: 180, y: 142 },
      { mask: 2, x: 360, y: 142 },
      { mask: 4, x: 540, y: 142 },
      { mask: 3, x: 180, y: 236 },
      { mask: 5, x: 360, y: 236 },
      { mask: 6, x: 540, y: 236 },
      { mask: 7, x: 360, y: 330 }
    ];
    const byMask = {};
    nodes.forEach((n) => { byMask[n.mask] = n; });
    const edgeGroup = svgEl('g', {}, svg);
    const edges = [];
    nodes.forEach((n) => {
      for (let bit = 0; bit < 3; bit++) {
        if (!(n.mask & (1 << bit))) continue;
        const from = byMask[n.mask ^ (1 << bit)];
        if (!from) continue;
        const e = svgEl('line', {
          x1: from.x, y1: from.y, x2: n.x, y2: n.y,
          class: 'ch15-lat-edge'
        }, edgeGroup);
        edges.push({ el: e, a: from.mask, b: n.mask });
      }
    });

    function labelOf(mask) {
      if (mask === 0) return '∅';
      const bits = [];
      for (let i = 0; i < 3; i++) if (mask & (1 << i)) bits.push(i);
      return bits.join(',');
    }
    function sumOf(mask) {
      let total = 0;
      for (let sub = mask; ; sub = (sub - 1) & mask) {
        total += value[sub];
        if (sub === 0) break;
      }
      return total;
    }
    const nodeEls = [];
    nodes.forEach((n) => {
      const g = svgEl('g', {
        class: 'ch15-lat-node',
        transform: `translate(${n.x} ${n.y})`,
        tabindex: '0',
        role: 'button',
        'data-mask': n.mask,
        'aria-label': `Subsets of {${labelOf(n.mask)}}, sum ${sumOf(n.mask)}`
      }, svg);
      svgEl('circle', { r: 34 }, g);
      const lab = svgEl('text', { class: 'lab', y: 1 }, g);
      lab.textContent = labelOf(n.mask);
      const val = svgEl('text', { class: 'val', y: 48 }, g);
      val.textContent = value[n.mask];
      nodeEls.push({ g, mask: n.mask });
    });

    function select(mask) {
      nodeEls.forEach(({ g, mask: m }) => {
        const contrib = (m & ~mask) === 0;
        g.classList.toggle('is-contrib', contrib);
        g.classList.toggle('is-sel', m === mask);
      });
      edges.forEach((e) => {
        const on = (e.a & ~mask) === 0 && (e.b & ~mask) === 0;
        e.el.classList.toggle('is-on', on);
      });
      const title = $('[data-lattice-title]');
      const sum = $('[data-lattice-sum]');
      const note = $('[data-lattice-note]');
      if (title) title.textContent = mask === 0 ? 'sum(∅)' : `sum({${labelOf(mask).replace(/,/g, ', ')}})`;
      const parts = [];
      for (let sub = mask; ; sub = (sub - 1) & mask) {
        parts.push(value[sub]);
        if (sub === 0) break;
      }
      parts.sort((a, b) => a - b);
      const total = sumOf(mask);
      if (sum) sum.textContent = parts.join(' + ') + ' = ' + total;
      if (note) {
        note.textContent = mask === 7
          ? 'The full set uses all eight values. The recurrence adds the value of each subset exactly once.'
          : `The highlighted ${parts.length} nodes are exactly the subsets of {${labelOf(mask).replace(/,/g, ', ')}}. Their values add up to ${total}.`;
      }
    }

    nodeEls.forEach(({ g, mask }) => {
      const act = () => select(mask);
      g.addEventListener('click', act);
      g.addEventListener('focus', act);
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          act();
        }
      });
    });
    select(5);
  })();

  /* ======================================================================
     Code cards
     ====================================================================== */
  const baseKeywords = ['for', 'while', 'if', 'else', 'return', 'int', 'long', 'void', 'struct', 'const', 'new', 'NULL'],
    baseTypes = ['int', 'long long', 'node', 'bool', 'long'];

  CP.mountCodeCard($('#cardTopDown'), {
    storageKey: 'gtcp-lang-ch15',
    order: ['cpp', 'python'],
    initial: 'cpp',
    langs: {
      cpp: {
        label: 'C++',
        file: 'sum.cpp',
        type: 'O(log n)',
        note: 'The top-down range sum. Call with k = 1 and the range [0, n − 1].',
        keywords: baseKeywords,
        types: baseTypes,
        code: [
          'int sum(int a, int b, int k, int x, int y) {',
          '    if (b < x || a > y) return 0;',
          '    if (a <= x && y <= b) return tree[k];',
          '    int d = (x + y) / 2;',
          '    return sum(a, b, 2*k, x, d)',
          '         + sum(a, b, 2*k+1, d+1, y);',
          '}',
          '',
          '// call: sum(a, b, 1, 0, n-1)'
        ]
      },
      python: {
        label: 'Python',
        file: 'sum.py',
        type: 'O(log n)',
        note: 'The same descent, with the range passed explicitly.',
        keywords: ['def', 'if', 'or', 'and', 'return', 'not', 'in'],
        types: ['int'],
        code: [
          'def sum_range(a, b, k, x, y):',
          '    if b < x or a > y:',
          '        return 0',
          '    if a <= x and y <= b:',
          '        return tree[k]',
          '    d = (x + y) // 2',
          '    return (sum_range(a, b, 2*k, x, d)',
          '            + sum_range(a, b, 2*k+1, d+1, y))',
          '',
          '# call: sum_range(a, b, 1, 0, n-1)'
        ]
      }
    }
  });

  CP.mountCodeCard($('#cardLazy'), {
    storageKey: 'gtcp-lang-ch15',
    order: ['cpp'],
    initial: 'cpp',
    langs: {
      cpp: {
        label: 'C++',
        file: 'lazy.cpp',
        type: 'O(log n)',
        note: 'Range addition and range sum. Push before descending; recompute on the way back.',
        keywords: baseKeywords.concat(['long long']),
        types: baseTypes,
        code: [
          'const int N = 1e5;',
          'long long tree[4*N], lazy[4*N];',
          '',
          'void push(int k, int x, int y) {',
          '    if (lazy[k] == 0 || x == y) return;',
          '    int d = (x + y) / 2;',
          '    tree[2*k]   += lazy[k] * (d - x + 1);',
          '    tree[2*k+1] += lazy[k] * (y - d);',
          '    lazy[2*k]   += lazy[k];',
          '    lazy[2*k+1] += lazy[k];',
          '    lazy[k] = 0;',
          '}',
          '',
          'void add(int a, int b, long long u,',
          '         int k, int x, int y) {',
          '    if (b < x || a > y) return;',
          '    if (a <= x && y <= b) {',
          '        tree[k] += u * (y - x + 1);',
          '        lazy[k] += u;',
          '        return;',
          '    }',
          '    push(k, x, y);',
          '    int d = (x + y) / 2;',
          '    add(a, b, u, 2*k, x, d);',
          '    add(a, b, u, 2*k+1, d+1, y);',
          '    tree[k] = tree[2*k] + tree[2*k+1];',
          '}',
          '',
          'long long sum(int a, int b, int k,',
          '              int x, int y) {',
          '    if (b < x || a > y) return 0;',
          '    if (a <= x && y <= b) return tree[k];',
          '    push(k, x, y);',
          '    int d = (x + y) / 2;',
          '    return sum(a, b, 2*k, x, d)',
          '         + sum(a, b, 2*k+1, d+1, y);',
          '}'
        ]
      }
    }
  });

  CP.mountCodeCard($('#cardTreap'), {
    storageKey: 'gtcp-lang-ch15',
    order: ['cpp'],
    initial: 'cpp',
    langs: {
      cpp: {
        label: 'C++',
        file: 'treap.cpp',
        type: 'O(log n) expected',
        note: 'Size makes the split point local. Random weights keep the expected height logarithmic.',
        keywords: baseKeywords,
        types: ['node', 'int'],
        code: [
          'struct node {',
          '    node *left, *right;',
          '    int weight, size, value;',
          '    node(int v) {',
          '        left = right = NULL;',
          '        weight = rand();',
          '        size = 1;',
          '        value = v;',
          '    }',
          '};',
          '',
          'int size(node *treap) {',
          '    if (treap == NULL) return 0;',
          '    return treap->size;',
          '}',
          '',
          'void split(node *treap, node *&left,',
          '           node *&right, int k) {',
          '    if (treap == NULL) {',
          '        left = right = NULL;',
          '    } else {',
          '        if (size(treap->left) < k) {',
          '            split(treap->right, treap->right,',
          '                  right, k - size(treap->left) - 1);',
          '            left = treap;',
          '        } else {',
          '            split(treap->left, left,',
          '                  treap->left, k);',
          '            right = treap;',
          '        }',
          '        treap->size = size(treap->left)',
          '                    + size(treap->right) + 1;',
          '    }',
          '}',
          '',
          'void merge(node *&treap,',
          '           node *left, node *right) {',
          '    if (left == NULL) treap = right;',
          '    else if (right == NULL) treap = left;',
          '    else {',
          '        if (left->weight < right->weight) {',
          '            merge(left->right,',
          '                  left->right, right);',
          '            treap = left;',
          '        } else {',
          '            merge(right->left,',
          '                  left, right->left);',
          '            treap = right;',
          '        }',
          '        treap->size = size(treap->left)',
          '                    + size(treap->right) + 1;',
          '    }',
          '}',
          '',
          '// build [1,2,3,4], split at 2, swap:',
          'node *treap = NULL;',
          'merge(treap, treap, new node(1));',
          'merge(treap, treap, new node(2));',
          'merge(treap, treap, new node(3));',
          'merge(treap, treap, new node(4));',
          'node *left, *right;',
          'split(treap, left, right, 2);',
          'merge(treap, right, left);'
        ]
      }
    }
  });

  CP.mountCodeCard($('#cardSubsets'), {
    storageKey: 'gtcp-lang-ch15',
    order: ['cpp', 'python'],
    initial: 'cpp',
    langs: {
      cpp: {
        label: 'C++',
        file: 'subsets.cpp',
        type: 'O(2ⁿ n)',
        note: 'The array sum is reused in place, so the second loop is the entire DP.',
        keywords: baseKeywords,
        types: ['int'],
        code: [
          'int sum[1<<N];',
          '',
          'for (int s = 0; s < (1<<n); s++) {',
          '    sum[s] = value[s];',
          '}',
          'for (int k = 0; k < n; k++) {',
          '    for (int s = 0; s < (1<<n); s++) {',
          '        if (s & (1<<k)) {',
          '            sum[s] += sum[s^(1<<k)];',
          '        }',
          '    }',
          '}'
        ]
      },
      python: {
        label: 'Python',
        file: 'subsets.py',
        type: 'O(2ⁿ n)',
        note: 'The same in-place update. value is the list of subset values.',
        keywords: ['for', 'if', 'in', 'range'],
        types: ['int', 'list'],
        code: [
          'size = 1 << n',
          'sums = value[:]',
          '',
          'for k in range(n):',
          '    for s in range(size):',
          '        if s & (1 << k):',
          '            sums[s] += sums[s ^ (1 << k)]'
        ]
      }
    }
  });
})();

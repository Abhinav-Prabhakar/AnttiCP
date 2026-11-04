/* Chapter 09 — Range Queries */
(() => {
  /* ---------- code cards ---------- */
  CP.mountCodeCard(document.querySelector('[data-code-card="fenwick"]'), {
    storageKey: 'gtcp-lang-ch09-fenwick',
    order: ['cpp', 'python'],
    initial: 'cpp',
    langs: {
      cpp: {
        label: 'C++', file: 'fenwick.cpp', type: 'O(log n) query · O(log n) update', pre: true,
        note: 'A one-indexed Fenwick tree. sum(k) returns sumq(1, k); add(k, x) changes one array value.',
        keywords: ['while', 'return', 'if', 'int', 'void', 'using', 'namespace', 'for', 'const'],
        types: ['int', 'long long', 'vector', 'bool'],
        code: [
          '#include <bits/stdc++.h>',
          'using namespace std;',
          '',
          'const int N = 1e5 + 5;',
          'int n, tree[N];',
          '',
          'int sum(int k) {',
          '    int s = 0;',
          '    while (k >= 1) {',
          '        s += tree[k];',
          '        k -= k & -k;',
          '    }',
          '    return s;',
          '}',
          '',
          'void add(int k, int x) {',
          '    while (k <= n) {',
          '        tree[k] += x;',
          '        k += k & -k;',
          '    }',
          '}'
        ]
      },
      python: {
        label: 'Python', file: 'fenwick.py', type: 'O(log n) query · O(log n) update',
        note: 'The same two loops. The list is one-indexed, with tree[0] left unused.',
        keywords: ['while', 'return', 'if', 'def', 'for', 'in', 'not', 'and', 'or'],
        types: ['int', 'list'],
        code: [
          'tree = [0] * (n + 1)',
          '',
          'def prefix(k):',
          '    s = 0',
          '    while k >= 1:',
          '        s += tree[k]',
          '        k -= k & -k',
          '    return s',
          '',
          'def add(k, x):',
          '    while k <= n:',
          '        tree[k] += x',
          '        k += k & -k'
        ]
      }
    }
  });

  CP.mountCodeCard(document.querySelector('[data-code-card="segment"]'), {
    storageKey: 'gtcp-lang-ch09-segment',
    order: ['cpp', 'python'],
    initial: 'cpp',
    langs: {
      cpp: {
        label: 'C++', file: 'segment.cpp', type: 'O(log n) query · O(log n) update', pre: true,
        note: 'A bottom-up sum segment tree. The leaves are tree[n] … tree[2n − 1].',
        keywords: ['while', 'return', 'if', 'int', 'void', 'for', 'using', 'namespace'],
        types: ['int', 'long long', 'vector', 'bool'],
        code: [
          '#include <bits/stdc++.h>',
          'using namespace std;',
          '',
          'const int N = 1 << 18;',
          'int n, tree[2 * N];',
          '',
          'int sum(int a, int b) {',
          '    a += n; b += n;',
          '    int s = 0;',
          '    while (a <= b) {',
          '        if (a % 2 == 1) s += tree[a++];',
          '        if (b % 2 == 0) s += tree[b--];',
          '        a /= 2; b /= 2;',
          '    }',
          '    return s;',
          '}',
          '',
          'void add(int k, int x) {',
          '    k += n;',
          '    tree[k] += x;',
          '    for (k /= 2; k >= 1; k /= 2)',
          '        tree[k] = tree[2 * k] + tree[2 * k + 1];',
          '}'
        ]
      },
      python: {
        label: 'Python', file: 'segment.py', type: 'O(log n) query · O(log n) update',
        note: 'The same bottom-up tree. Replace + with min, max, gcd, or a bit operation.',
        keywords: ['while', 'return', 'if', 'def', 'for', 'in'],
        types: ['int', 'list'],
        code: [
          'tree = [0] * (2 * n)',
          '',
          'def query(a, b):',
          '    a += n; b += n',
          '    s = 0',
          '    while a <= b:',
          '        if a % 2 == 1:',
          '            s += tree[a]; a += 1',
          '        if b % 2 == 0:',
          '            s += tree[b]; b -= 1',
          '        a //= 2; b //= 2',
          '    return s',
          '',
          'def add(k, x):',
          '    k += n',
          '    tree[k] += x',
          '    k //= 2',
          '    while k >= 1:',
          '        tree[k] = tree[2 * k] + tree[2 * k + 1]',
          '        k //= 2'
        ]
      }
    }
  });

  /* ---------- prefix sum lab ---------- */
  (() => {
    const root = $('[data-ch09-prefix]');
    if (!root) return;
    const values = [1, 3, 4, 8, 6, 1, 4, 2];
    const prefix = [];
    values.reduce((acc, v, i) => {
      const next = acc + v;
      prefix[i] = next;
      return next;
    }, 0);

    const cells = $('#ch09PrefixCells');
    const sums = $('#ch09PrefixSums');
    const formula = $('#ch09PrefixFormula');
    const valuesEl = $('#ch09PrefixValues');
    if (!cells || !sums) return;

    cells.innerHTML = values.map((v, i) => `
      <button class="ch09-cell" type="button" data-i="${i}" aria-label="Array index ${i}, value ${v}" aria-pressed="false">
        <span class="ch09-cell__v">${v}</span>
        <span class="ch09-cell__i">${i}</span>
      </button>`).join('');

    sums.innerHTML = prefix.map((v, i) => `
      <span class="ch09-prefixcell" data-i="${i}" data-tip="sumq(0, ${i}) = ${v}">
        <b>${v}</b><i>${i}</i>
      </span>`).join('');

    const cellEls = $$('.ch09-cell', cells);
    const sumEls = $$('.ch09-prefixcell', sums);
    const presets = $$('[data-range]', root);
    let a = 3, b = 6;
    let phase = 0;
    let dragging = false;
    let anchor = 0;
    let moved = false;
    let suppressClickUntil = 0;

    function render() {
      if (a > b) { const t = a; a = b; b = t; }
      cellEls.forEach((el, i) => {
        const inRange = i >= a && i <= b;
        el.classList.toggle('is-in', inRange);
        el.classList.toggle('is-a', i === a);
        el.classList.toggle('is-b', i === b);
        el.setAttribute('aria-pressed', String(inRange));
      });
      sumEls.forEach((el, i) => {
        const tag = i === b ? 'b' : (a > 0 && i === a - 1 ? 'a − 1' : '');
        el.classList.toggle('is-b', i === b);
        el.classList.toggle('is-a', a > 0 && i === a - 1);
        if (tag) el.dataset.tag = tag; else delete el.dataset.tag;
      });

      const pb = prefix[b];
      const pa = a > 0 ? prefix[a - 1] : 0;
      if (formula) {
        formula.textContent = a > 0
          ? `sumq(${a}, ${b}) = sumq(0, ${b}) − sumq(0, ${a - 1}) = ${pb} − ${pa} = ${pb - pa}`
          : `sumq(0, ${b}) = sumq(0, ${b}) − 0 = ${pb}`;
      }
      if (valuesEl) valuesEl.textContent = `array: ${values.slice(a, b + 1).join(' + ')} = ${pb - pa}`;
      cells.setAttribute('aria-label', `Array with the range ${a} to ${b} selected`);
    }

    function setPresetActive(which) {
      presets.forEach((p) => p.classList.toggle('is-active', p === which));
    }

    presets.forEach((p) => {
      p.addEventListener('click', () => {
        const parts = p.dataset.range.split(',').map(Number);
        a = parts[0]; b = parts[1];
        phase = 0;
        setPresetActive(p);
        render();
      });
    });

    cells.addEventListener('click', (e) => {
      const btn = e.target.closest('.ch09-cell');
      if (!btn) return;
      if (performance.now() < suppressClickUntil) return;
      const i = Number(btn.dataset.i);
      if (phase === 0) {
        a = i; b = i; phase = 1;
      } else {
        b = i; phase = 0;
      }
      setPresetActive(null);
      render();
    });

    cellEls.forEach((el) => {
      el.addEventListener('pointerenter', () => {
        if (!dragging) return;
        const i = Number(el.dataset.i);
        a = anchor;
        b = i;
        moved = true;
        setPresetActive(null);
        render();
      });
    });

    cells.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const btn = e.target.closest('.ch09-cell');
      if (!btn) return;
      anchor = Number(btn.dataset.i);
      dragging = true;
      moved = false;
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      if (moved) {
        phase = 0;
        suppressClickUntil = performance.now() + 260;
      }
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    render();
    setPresetActive(presets[0]);
  })();

  /* ---------- sparse table ---------- */
  (() => {
    const root = $('[data-ch09-sparse]');
    if (!root) return;
    const values = [1, 3, 4, 8, 6, 1, 4, 2];
    const levels = [values.slice()];
    for (let size = 2; size <= values.length; size *= 2) {
      const prev = levels[levels.length - 1];
      const half = size / 2;
      const next = [];
      for (let i = 0; i + size <= values.length; i++) next.push(Math.min(prev[i], prev[i + half]));
      levels.push(next);
    }

    const array = $('#ch09SparseArray');
    const windows = $('#ch09SparseWindows');
    const levelsEl = $('#ch09SparseLevels');
    const formula = $('#ch09SparseFormula');
    const kEl = $('#ch09SparseK');
    const presets = $$('[data-query]', root);
    if (!array || !windows || !levelsEl) return;

    array.innerHTML = values.map((v, i) => `
      <span class="ch09-sparse__cell" data-i="${i}" data-tip="array[${i}] = ${v}">
        <b>${v}</b><i>${i}</i>
      </span>`).join('');

    levelsEl.innerHTML = levels.map((vals, li) => {
      const size = 1 << li;
      let row = '';
      for (let i = 0; i < values.length; i++) {
        if (i < vals.length) {
          row += `<span class="ch09-sparse__lcell" data-level="${li}" data-start="${i}" data-tip="minq(${i}, ${i + size - 1}) = ${vals[i]}">${vals[i]}</span>`;
        } else {
          row += '<span class="ch09-sparse__lcell is-empty">·</span>';
        }
      }
      return `<div class="ch09-sparse__level">
        <span>size ${size}</span>
        <div class="ch09-sparse__levelcells">${row}</div>
      </div>`;
    }).join('');

    function render(a, b) {
      const length = b - a + 1;
      const k = 1 << Math.floor(Math.log2(length));
      const li = Math.log2(k);
      const right = b - k + 1;
      const leftVal = levels[li][a];
      const rightVal = levels[li][right];

      $$('.ch09-sparse__cell', array).forEach((el, i) => {
        el.classList.toggle('is-range', i >= a && i <= b);
      });

      windows.innerHTML = '';
      const addWindow = (start, val, second) => {
        const w = document.createElement('span');
        w.className = `ch09-sparse__window${second ? ' ch09-sparse__window--b' : ''}`;
        w.style.gridColumn = `${start + 1} / ${start + k + 1}`;
        w.style.gridRow = second ? '2' : '1';
        w.textContent = `k = ${k} · min ${val}`;
        windows.appendChild(w);
      };
      addWindow(a, leftVal, false);
      if (right !== a) addWindow(right, rightVal, true);

      $$('.ch09-sparse__lcell', levelsEl).forEach((el) => {
        el.classList.toggle('is-active', Number(el.dataset.level) === li && (Number(el.dataset.start) === a || Number(el.dataset.start) === right));
      });

      if (formula) {
        formula.textContent = right === a
          ? `minq(${a}, ${b}) = ${leftVal}`
          : `minq(${a}, ${b}) = min( minq(${a}, ${a + k - 1}), minq(${right}, ${b}) ) = min(${leftVal}, ${rightVal}) = ${Math.min(leftVal, rightVal)}`;
      }
      if (kEl) kEl.textContent = `length ${length} → k = ${k} · ${right === a ? 'the two windows coincide' : `windows [${a}, ${a + k - 1}] and [${right}, ${b}]`}`;
      array.setAttribute('aria-label', `Array with the range ${a} to ${b} highlighted; the two windows are ${a} to ${a + k - 1} and ${right} to ${b}`);
    }

    presets.forEach((p) => {
      p.addEventListener('click', () => {
        const parts = p.dataset.query.split(',').map(Number);
        presets.forEach((q) => q.classList.toggle('is-active', q === p));
        render(parts[0], parts[1]);
      });
    });

    render(1, 6);
    if (presets[0]) presets[0].classList.add('is-active');
  })();

  /* ---------- Fenwick tree ---------- */
  (() => {
    const root = $('[data-ch09-fenwick]');
    if (!root) return;
    const values = [1, 3, 4, 8, 6, 1, 4, 2];
    const tree = [1, 4, 4, 16, 6, 7, 4, 29];

    const array = $('#ch09FenwickArray');
    const rows = $('#ch09FenwickRows');
    const formula = $('#ch09FenwickFormula');
    const note = $('#ch09FenwickNote');
    const modes = $$('[data-fenwick-mode]', root);
    if (!array || !rows) return;

    array.innerHTML = '<span class="ch09-fenwick__alabel">array</span>' + values.map((v, i) => `
      <span class="ch09-fenwick__acell" data-i="${i}"><b>${v}</b><i>${i + 1}</i></span>`).join('');

    rows.innerHTML = tree.map((v, idx) => {
      const k = idx + 1;
      const p = k & -k;
      const start = k - p + 1;
      return `<div class="ch09-fenrow" data-k="${k}" data-tip="tree[${k}] = sumq(${start}, ${k}) = ${v}">
        <span class="ch09-fenrow__k">${k}</span>
        <span class="ch09-fenrow__bar" style="grid-column:${start + 1} / span ${p}">${v}</span>
      </div>`;
    }).join('');

    const rowEls = $$('.ch09-fenrow', rows);
    const arrayEls = $$('.ch09-fenwick__acell', array);

    function queryPath(k) {
      const path = [];
      while (k >= 1) {
        path.push(k);
        k -= k & -k;
      }
      return path;
    }
    function updatePath(k) {
      const path = [];
      while (k <= values.length) {
        path.push(k);
        k += k & -k;
      }
      return path;
    }

    function render(mode) {
      modes.forEach((m) => {
        const on = m.dataset.fenwickMode === mode;
        m.classList.toggle('is-active', on);
        m.setAttribute('aria-pressed', String(on));
      });

      const query = mode === 'query';
      const path = query ? queryPath(7) : updatePath(3);
      rowEls.forEach((el) => el.classList.toggle('is-active', path.includes(Number(el.dataset.k))));
      arrayEls.forEach((el) => {
        const i = Number(el.dataset.i) + 1;
        el.classList.toggle('is-on', query ? i <= 7 : i === 3);
        el.classList.toggle('is-target', !query && i === 3);
      });

      if (query) {
        if (formula) formula.textContent = 'sumq(1, 7) = tree[7] + tree[6] + tree[4] = 4 + 7 + 16 = 27';
        if (note) note.textContent = 'Path: 7 → 6 → 4 → 0. Each step clears the lowest set bit.';
      } else {
        if (formula) formula.textContent = 'add(3, +3): tree[3], tree[4], tree[8] each gain 3 → 7, 19, 32';
        if (note) note.textContent = 'Path: 3 → 4 → 8 → 16. Each step adds the lowest set bit.';
      }
    }

    modes.forEach((m) => m.addEventListener('click', () => render(m.dataset.fenwickMode)));
    render('query');
  })();

  /* ---------- segment tree ---------- */
  (() => {
    const root = $('[data-ch09-seg]');
    if (!root) return;
    const svg = $('#ch09SegTree');
    const formula = $('#ch09SegFormula');
    const note = $('#ch09SegNote');
    const presets = $$('[data-range]', root);
    const modes = $$('[data-seg-mode]', root);
    if (!svg) return;

    const values = [5, 8, 6, 3, 2, 7, 2, 6];
    const tree = [0, 39, 22, 17, 13, 9, 9, 8, 5, 8, 6, 3, 2, 7, 2, 6];
    const pos = {
      1: [360, 48], 2: [180, 125], 3: [540, 125],
      4: [90, 205], 5: [270, 205], 6: [450, 205], 7: [630, 205],
      8: [45, 285], 9: [135, 285], 10: [225, 285], 11: [315, 285],
      12: [405, 285], 13: [495, 285], 14: [585, 285], 15: [675, 285]
    };
    const edges = [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7], [4, 8], [4, 9], [5, 10], [5, 11], [6, 12], [6, 13], [7, 14], [7, 15]];

    function rangeOf(k) {
      const level = Math.floor(Math.log2(k));
      const first = 1 << level;
      const offset = k - first;
      const size = values.length >> level;
      return [offset * size, offset * size + size - 1];
    }

    function canonical(a, b) {
      let l = a + values.length;
      let r = b + values.length;
      const out = [];
      while (l <= r) {
        if (l % 2 === 1) out.push(l++);
        if (r % 2 === 0) out.push(r--);
        l = Math.floor(l / 2);
        r = Math.floor(r / 2);
      }
      return out;
    }

    function render(mode, a, b) {
      modes.forEach((m) => {
        const on = m.dataset.segMode === mode;
        m.classList.toggle('is-active', on);
        m.setAttribute('aria-pressed', String(on));
      });
      presets.forEach((p) => {
        const on = mode === 'query' && p.dataset.range === `${a},${b}`;
        p.classList.toggle('is-active', on);
      });

      const active = mode === 'query' ? canonical(a, b) : [];
      const path = mode === 'update' ? [13, 6, 3, 1] : [];
      const updated = mode === 'update' ? { 1: 42, 3: 20, 6: 12, 13: 5 } : {};

      let out = '';
      edges.forEach(([p, c]) => {
        out += `<line class="ch09-seg__edge" x1="${pos[p][0]}" y1="${pos[p][1]}" x2="${pos[c][0]}" y2="${pos[c][1]}"/>`;
      });
      for (let k = 1; k <= 15; k++) {
        const [r0, r1] = rangeOf(k);
        const value = Object.prototype.hasOwnProperty.call(updated, k) ? updated[k] : tree[k];
        const isActive = active.includes(k);
        const isPath = path.includes(k);
        const cls = `ch09-seg__node${isActive ? ' is-active' : ''}${isPath ? ' is-path' : ''}${mode === 'update' && k === 13 ? ' is-active' : ''}`;
        out += `<g class="${cls}" data-node="${k}" tabindex="0" transform="translate(${pos[k][0]} ${pos[k][1]})" data-tip="node ${k} · range [${r0}, ${r1}] · value ${value}">
          <circle r="23"></circle>
          <text class="ch09-seg__value" y="1">${value}</text>
          <text class="ch09-seg__range" y="16">[${r0},${r1}]</text>
        </g>`;
      }
      svg.innerHTML = out;

      if (mode === 'query') {
        const vals = active.map((k) => tree[k]);
        const sum = vals.reduce((acc, v) => acc + v, 0);
        if (formula) {
          formula.textContent = active.length === 1
            ? `sumq(${a}, ${b}) = tree[${active[0]}] = ${vals[0]}`
            : `sumq(${a}, ${b}) = ${active.map((k) => `tree[${k}]`).join(' + ')} = ${vals.join(' + ')} = ${sum}`;
        }
        if (note) note.textContent = `${active.length} canonical node${active.length === 1 ? '' : 's'} · the range is covered without visiting the leaves.`;
        svg.setAttribute('aria-label', `Segment tree with the query range ${a} to ${b} highlighted; the answer is ${sum}`);
      } else {
        if (formula) formula.textContent = 'tree[13] 2 → 5 · tree[6] 9 → 12 · tree[3] 17 → 20 · tree[1] 39 → 42';
        if (note) note.textContent = 'Update index 5 by +3: the leaf changes, then every ancestor is recomputed on the way to the root.';
        svg.setAttribute('aria-label', 'Segment tree with the update path from leaf 13 to the root highlighted');
      }
    }

    let mode = 'query';
    let current = [2, 7];

    presets.forEach((p) => {
      p.addEventListener('click', () => {
        const parts = p.dataset.range.split(',').map(Number);
        current = parts;
        mode = 'query';
        render(mode, current[0], current[1]);
      });
    });
    modes.forEach((m) => {
      m.addEventListener('click', () => {
        mode = m.dataset.segMode;
        render(mode, current[0], current[1]);
      });
    });

    render(mode, current[0], current[1]);
  })();

  /* ---------- difference array ---------- */
  (() => {
    const root = $('[data-ch09-diff]');
    if (!root) return;
    const original = [3, 3, 1, 1, 1, 5, 2, 2];
    const originalAfter = [3, 6, 4, 4, 4, 5, 2, 2];
    const diff = [3, 0, -2, 0, 0, 4, -3, 0];
    const diffAfter = [3, 3, -2, 0, 0, 1, -3, 0];
    const originalEl = $('#ch09DiffOriginal');
    const diffEl = $('#ch09DiffArray');
    const note = $('#ch09DiffNote');
    const count = $('#ch09DiffCount');
    const toggle = $('[data-diff-toggle]');
    if (!originalEl || !diffEl || !toggle) return;

    const fmt = (v) => (v < 0 ? `−${Math.abs(v)}` : String(v));
    let applied = false;

    function render() {
      const ov = applied ? originalAfter : original;
      const dv = applied ? diffAfter : diff;

      originalEl.innerHTML = ov.map((v, i) => {
        const range = applied && i >= 1 && i <= 4;
        return `<span class="ch09-diffcell${range ? ' is-range' : ''}" data-i="${i}" data-tip="original[${i}] = ${fmt(v)}">${fmt(v)}</span>`;
      }).join('');

      diffEl.innerHTML = dv.map((v, i) => {
        const changed = applied && (i === 1 || i === 5);
        return `<span class="ch09-diffcell${changed ? ' is-changed' : ''}" data-i="${i}" data-tip="difference[${i}] = ${fmt(v)}">${fmt(v)}</span>`;
      }).join('');

      if (note) {
        note.textContent = applied
          ? 'Adding 3 to [1, 4] changes only difference[1] and difference[5]. The four original values follow by prefix sums.'
          : 'Before any range update. The difference array is the original array’s step-by-step change.';
      }
      if (count) count.textContent = applied ? '2 difference cells changed' : '0 difference cells changed';

      toggle.setAttribute('aria-pressed', String(applied));
      const label = toggle.querySelector('span');
      if (label) label.textContent = applied ? 'Reset the update' : 'Apply +3 to [1, 4]';
      const use = toggle.querySelector('use');
      if (use) use.setAttribute('href', applied ? '#i-reset' : '#i-play');
    }

    toggle.addEventListener('click', () => {
      applied = !applied;
      render();
    });

    render();
  })();
})();

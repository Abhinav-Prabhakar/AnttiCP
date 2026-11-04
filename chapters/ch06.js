/* Chapter 06 — Dynamic Programming */
(() => {
  const { $, $$, clamp, reduceMotion, mountCodeCard, onVisible, countUp } = window.CP;

  /* ========================================================================
     Code cards
     ======================================================================== */
  const coinCard = $('[data-code-card="coins"]');
  if (coinCard) {
    mountCodeCard(coinCard, {
      storageKey: 'gtcp-lang-ch06-coins',
      order: ['cpp', 'python'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++', file: 'coins.cpp', type: 'O(nk) time · O(n) memory',
          note: 'Iterative table. The array first[] reconstructs one optimal set of coins.',
          pre: true,
          keywords: ['for', 'while', 'if', 'else', 'return', 'using', 'namespace', 'const', 'auto'],
          types: ['int', 'vector', 'bool'],
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'int main() {',
            '    vector<int> coins = {1, 3, 4};',
            '    int n = 12;',
            '    const int INF = 1000000000;',
            '    vector<int> value(n + 1, INF);',
            '    vector<int> first(n + 1, 0);',
            '    value[0] = 0;',
            '',
            '    for (int x = 1; x <= n; x++) {',
            '        for (int c : coins) {',
            '            if (x - c >= 0 && value[x - c] + 1 < value[x]) {',
            '                value[x] = value[x - c] + 1;',
            '                first[x] = c;',
            '            }',
            '        }',
            '    }',
            '',
            '    cout << value[n] << "\\n";',
            '    while (n > 0) {',
            '        cout << first[n] << " ";',
            '        n -= first[n];',
            '    }',
            '    cout << "\\n";',
            '}'
          ]
        },
        python: {
          label: 'Python', file: 'coins.py', type: 'O(nk) time · O(n) memory',
          note: 'The same table in Python. INF must be larger than any possible answer.',
          keywords: ['for', 'in', 'range', 'if', 'and', 'while', 'print', 'end'],
          types: ['float', 'int', 'list'],
          code: [
            'coins = [1, 3, 4]',
            'target = 12',
            'INF = float("inf")',
            '',
            'value = [INF] * (target + 1)',
            'first = [0] * (target + 1)',
            'value[0] = 0',
            '',
            'for x in range(1, target + 1):',
            '    for c in coins:',
            '        if x - c >= 0 and value[x - c] + 1 < value[x]:',
            '            value[x] = value[x - c] + 1',
            '            first[x] = c',
            '',
            'print(value[target])',
            'n = target',
            'while n > 0:',
            '    print(first[n], end=" ")',
            '    n -= first[n]',
            'print()'
          ]
        }
      }
    });
  }

  const lisCard = $('[data-code-card="lis"]');
  if (lisCard) {
    mountCodeCard(lisCard, {
      storageKey: 'gtcp-lang-ch06-lis',
      order: ['cpp', 'python'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++', file: 'lis.cpp', type: 'O(n²) time · O(n) memory',
          note: 'The two nested loops try every earlier position as the predecessor.',
          pre: true,
          keywords: ['for', 'if', 'return', 'using', 'namespace'],
          types: ['int', 'vector'],
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'int main() {',
            '    vector<int> array = {6, 2, 5, 1, 7, 4, 8, 3};',
            '    int n = array.size();',
            '    vector<int> length(n, 1);',
            '    int answer = 1;',
            '',
            '    for (int k = 0; k < n; k++) {',
            '        for (int i = 0; i < k; i++) {',
            '            if (array[i] < array[k]) {',
            '                length[k] = max(length[k], length[i] + 1);',
            '            }',
            '        }',
            '        answer = max(answer, length[k]);',
            '    }',
            '',
            '    cout << answer << "\\n";', 
            '}'
          ]
        },
        python: {
          label: 'Python', file: 'lis.py', type: 'O(n²) time · O(n) memory',
          note: 'length[k] is the best subsequence ending exactly at position k.',
          keywords: ['for', 'in', 'range', 'if', 'print'],
          types: ['int', 'list'],
          code: [
            'array = [6, 2, 5, 1, 7, 4, 8, 3]',
            'length = [1] * len(array)',
            '',
            'for k in range(len(array)):',
            '    for i in range(k):',
            '        if array[i] < array[k]:',
            '            length[k] = max(length[k], length[i] + 1)',
            '',
            'print(max(length))'
          ]
        }
      }
    });
  }

  /* ========================================================================
     Hero + tiling counters
     ======================================================================== */
  const heroFigure = $('.ch06-hero');
  if (heroFigure) {
    const num = $('[data-countup]', heroFigure);
    if (num) {
      onVisible(heroFigure, () => {
        const target = Number(num.dataset.countup) || 0;
        if (reduceMotion) { num.textContent = String(target); return; }
        countUp(num, target, 1000);
      }, { threshold: 0.35 });
    }
  }

  const tiling = $('.ch06-tiling');
  if (tiling) {
    const num = $('[data-countup]', tiling);
    if (num) {
      onVisible(tiling, () => {
        const target = Number(num.dataset.countup) || 0;
        if (reduceMotion) { num.textContent = String(target); return; }
        countUp(num, target, 1400);
      }, { threshold: 0.4 });
    }
  }

  /* ========================================================================
     Coin stepper
     ======================================================================== */
  const coinCells = $('#coinCells');
  if (coinCells) {
    const COINS = [1, 3, 4];
    const TARGET = 12;
    const value = new Array(TARGET + 1).fill(Infinity);
    const first = new Array(TARGET + 1).fill(0);
    value[0] = 0;
    for (let x = 1; x <= TARGET; x++) {
      let best = Infinity;
      let bestCoin = 0;
      for (const c of COINS) {
        if (x - c >= 0 && value[x - c] + 1 < best) {
          best = value[x - c] + 1;
          bestCoin = c;
        }
      }
      value[x] = best;
      first[x] = bestCoin;
    }

    const rec = $('#coinRec');
    const foot = $('#coinFoot');
    const count = $('#coinCount');
    const prevBtn = $('#coinPrev');
    const nextBtn = $('#coinNext');
    const resetBtn = $('#coinReset');
    let step = 0;

    const cells = [];
    for (let x = 0; x <= TARGET; x++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ch06-cell';
      b.dataset.x = String(x);
      b.innerHTML = `<span class="ch06-cell__x">${x}</span><span class="ch06-cell__v">·</span>`;
      b.addEventListener('click', () => setStep(x));
      coinCells.appendChild(b);
      cells.push(b);
    }

    function renderRecurrence() {
      if (!rec) return;
      if (step === 0) {
        rec.innerHTML = `
          <div class="ch06-rec__head">
            <span class="ch06-rec__kicker">Base case</span>
            <span class="ch06-rec__value">solve(0) = 0</span>
          </div>
          <p class="ch06-rec__note">An empty sum needs no coins. Every later cell builds on this one.</p>`;
        return;
      }
      const parts = COINS.map((c) => {
        const from = step - c;
        const feasible = from >= 0;
        const candidate = feasible ? value[from] + 1 : null;
        const used = feasible && c === first[step];
        return `<span class="ch06-rec__term${used ? ' is-used' : ''}${feasible ? '' : ' is-na'}">
          <b>solve(${from}) + 1</b>
          <em>${feasible ? `${value[from]} + 1 = ${candidate}` : 'below zero'}</em>
          <i>${used ? `chosen · coin ${c}` : `coin ${c}`}</i>
        </span>`;
      }).join('');
      rec.innerHTML = `
        <div class="ch06-rec__head">
          <span class="ch06-rec__kicker">Current sum</span>
          <span class="ch06-rec__value">solve(${step}) = ${value[step]}</span>
        </div>
        <div class="ch06-rec__terms">${parts}</div>
        <p class="ch06-rec__note">The smallest term wins: use coin ${first[step]}, then solve(${step - first[step]}) = ${value[step - first[step]]}.</p>`;
    }

    function render() {
      cells.forEach((cell, x) => {
        const deps = COINS.map((c) => step - c).filter((d) => d >= 0 && d < step);
        const chosen = step > 0 ? step - first[step] : -1;
        cell.classList.toggle('is-empty', x > step);
        cell.classList.toggle('is-active', x === step);
        cell.classList.toggle('is-dep', x < step && deps.includes(x) && x !== chosen);
        cell.classList.toggle('is-used', x === chosen);
        const v = cell.querySelector('.ch06-cell__v');
        if (v) v.textContent = x > step ? '·' : String(value[x]);
        cell.setAttribute('aria-pressed', x === step ? 'true' : 'false');
        cell.setAttribute('aria-label', x > step
          ? `solve(${x}), not computed yet`
          : `solve(${x}) = ${value[x]}${x === step ? ', current sum' : ''}`);
      });
      renderRecurrence();
      if (count) count.textContent = `sum ${step} / ${TARGET}`;
      if (prevBtn) prevBtn.disabled = step === 0;
      if (nextBtn) nextBtn.disabled = step === TARGET;
      if (foot) {
        if (step === 0) {
          foot.textContent = 'The base case: an empty sum needs no coins. Step forward to fill the table from left to right.';
        } else if (step === TARGET) {
          foot.textContent = `solve(12) = ${value[12]}. Walking first[] from 12 prints 4, 4, 4 — one optimal solution.`;
        } else {
          foot.textContent = 'Each cell reads only smaller sums, which is why a single left-to-right pass is enough.';
        }
      }
    }

    function setStep(next) {
      step = clamp(Number(next) || 0, 0, TARGET);
      render();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => setStep(step - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => setStep(step + 1));
    if (resetBtn) resetBtn.addEventListener('click', () => setStep(0));

    render();
  }

  /* ========================================================================
     Longest increasing subsequence
     ======================================================================== */
  const lisArray = $('#lisArray');
  if (lisArray) {
    const ARRAY = [6, 2, 5, 1, 7, 4, 8, 3];
    const n = ARRAY.length;
    const length = new Array(n).fill(1);
    const prev = new Array(n).fill(-1);

    for (let k = 0; k < n; k++) {
      for (let i = 0; i < k; i++) {
        if (ARRAY[i] < ARRAY[k] && length[i] + 1 > length[k]) {
          length[k] = length[i] + 1;
          prev[k] = i;
        }
      }
    }

    const readout = $('#lisReadout');
    const note = $('#lisNote');
    let active = 6;

    const cellEls = [];
    for (let k = 0; k < n; k++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ch06-lis__cell';
      b.dataset.k = String(k);
      b.innerHTML = `<span class="ch06-lis__val">${ARRAY[k]}</span><span class="ch06-lis__len">len ${length[k]}</span>`;
      b.addEventListener('click', () => {
        active = k;
        render();
      });
      lisArray.appendChild(b);
      cellEls.push(b);
    }

    function chainFor(k) {
      const out = [];
      let cur = k;
      while (cur !== -1) {
        out.unshift(cur);
        cur = prev[cur];
      }
      return out;
    }

    function render() {
      const chain = chainFor(active);
      cellEls.forEach((cell, k) => {
        cell.classList.toggle('is-chain', chain.includes(k) && k !== active);
        cell.classList.toggle('is-active', k === active);
        cell.setAttribute('aria-pressed', k === active ? 'true' : 'false');
        cell.setAttribute('aria-label', `Position ${k}, value ${ARRAY[k]}, length ${length[k]}`);
      });
      if (readout) readout.textContent = `length(${active}) = ${length[active]}`;
      if (note) note.textContent = `The chain ending at ${ARRAY[active]}: ${chain.map((i) => ARRAY[i]).join(' → ')}.`;
    }

    render();
  }

  /* ========================================================================
     Grid paths
     ======================================================================== */
  const pathGrid = $('#pathGrid');
  if (pathGrid) {
    const GRID = [
      [3, 7, 9, 2, 7],
      [9, 8, 3, 5, 5],
      [1, 7, 9, 8, 5],
      [3, 8, 6, 4, 10],
      [6, 3, 9, 7, 8]
    ];
    const SIZE = 5;
    const sums = Array.from({ length: SIZE + 1 }, () => new Array(SIZE + 1).fill(0));
    for (let y = 1; y <= SIZE; y++) {
      for (let x = 1; x <= SIZE; x++) {
        sums[y][x] = Math.max(sums[y][x - 1], sums[y - 1][x]) + GRID[y - 1][x - 1];
      }
    }

    const recEl = $('#gridRec');
    const noteEl = $('#gridNote');
    let active = { y: 5, x: 5 };
    const gridEls = [];

    for (let y = 1; y <= SIZE; y++) {
      for (let x = 1; x <= SIZE; x++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ch06-gcell';
        b.dataset.y = String(y);
        b.dataset.x = String(x);
        b.innerHTML = `<span class="ch06-gcell__sum">${sums[y][x]}</span><span class="ch06-gcell__val">${GRID[y - 1][x - 1]}</span>`;
        b.addEventListener('click', () => {
          active = { y, x };
          render();
        });
        b.addEventListener('focus', () => {
          active = { y, x };
          render();
        });
        pathGrid.appendChild(b);
        gridEls.push(b);
      }
    }

    function pathTo(y, x) {
      const out = [];
      let cy = y;
      let cx = x;
      while (cy >= 1 && cx >= 1) {
        out.unshift({ y: cy, x: cx });
        if (cy === 1) { cx -= 1; continue; }
        if (cx === 1) { cy -= 1; continue; }
        if (sums[cy][cx - 1] >= sums[cy - 1][cx]) cx -= 1;
        else cy -= 1;
      }
      return out;
    }

    function render() {
      const { y, x } = active;
      const path = pathTo(y, x);
      const pathKeys = new Set(path.map((p) => `${p.y}-${p.x}`));
      gridEls.forEach((cell) => {
        const cy = Number(cell.dataset.y);
        const cx = Number(cell.dataset.x);
        const isActive = cy === y && cx === x;
        cell.classList.toggle('is-path', pathKeys.has(`${cy}-${cx}`));
        cell.classList.toggle('is-active', isActive);
        cell.classList.toggle('is-up', !isActive && cy === y - 1 && cx === x);
        cell.classList.toggle('is-left', !isActive && cy === y && cx === x - 1);
        cell.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        cell.setAttribute('aria-label',
          `Row ${cy}, column ${cx}: value ${GRID[cy - 1][cx - 1]}, best sum ${sums[cy][cx]}`);
      });

      if (recEl) {
        const left = x > 1 ? sums[y][x - 1] : 0;
        const up = y > 1 ? sums[y - 1][x] : 0;
        const fromLeft = x > 1 && (y === 1 || sums[y][x - 1] >= sums[y - 1][x]);
        recEl.innerHTML = `sum(${y}, ${x}) = max(${left}, ${up}) + ${GRID[y - 1][x - 1]} = <b>${sums[y][x]}</b><br><span>${fromLeft ? 'from the left' : 'from above'} · path length ${path.length}</span>`;
      }
      if (noteEl) {
        if (y === SIZE && x === SIZE) {
          noteEl.textContent = 'The highlight is one optimal path. It sums to 67, the value in the bottom-right corner.';
        } else {
          noteEl.textContent = `Every path to (${y}, ${x}) ends through the square above or the square to the left. The larger of the two sums is kept.`;
        }
      }
    }

    render();
  }

  /* ========================================================================
     Knapsack table
     ======================================================================== */
  const knapTable = $('#knapTable');
  if (knapTable) {
    const WEIGHTS = [1, 3, 3, 5];
    const total = WEIGHTS.reduce((a, b) => a + b, 0);
    const n = WEIGHTS.length;
    const possible = Array.from({ length: n + 1 }, () => new Array(total + 1).fill(false));
    possible[0][0] = true;

    for (let k = 1; k <= n; k++) {
      const w = WEIGHTS[k - 1];
      for (let x = 0; x <= total; x++) {
        possible[k][x] = possible[k - 1][x] || (x - w >= 0 && possible[k - 1][x - w]);
      }
    }

    function witness(x) {
      const picked = [];
      let k = n;
      let rest = x;
      while (k > 0 && rest > 0) {
        if (possible[k - 1][rest]) {
          k -= 1;
        } else {
          picked.push(WEIGHTS[k - 1]);
          rest -= WEIGHTS[k - 1];
          k -= 1;
        }
      }
      return picked;
    }

    const table = document.createElement('table');
    table.className = 'ch06-ktable';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.innerHTML = '<th class="ch06-kth ch06-kth--corner" scope="col">k \\ x</th>';
    for (let x = 0; x <= total; x++) {
      const th = document.createElement('th');
      th.scope = 'col';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ch06-kth';
      btn.textContent = String(x);
      const picks = witness(x);
      btn.setAttribute('data-tip', possible[n][x]
        ? `sum ${x} = ${picks.length ? picks.join(' + ') : 'empty subset'}`
        : `sum ${x} cannot be formed from [1, 3, 3, 5]`);
      th.appendChild(btn);
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (let k = 0; k <= n; k++) {
      const tr = document.createElement('tr');
      const rowHead = document.createElement('th');
      rowHead.scope = 'row';
      rowHead.className = 'ch06-krow';
      rowHead.innerHTML = `k = ${k}`;
      tr.appendChild(rowHead);
      for (let x = 0; x <= total; x++) {
        const td = document.createElement('td');
        td.className = 'ch06-kcell' + (possible[k][x] ? ' is-on' : '');
        td.textContent = possible[k][x] ? '✓' : '·';
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    knapTable.appendChild(table);
  }

  /* ========================================================================
     Tiling row states
     ======================================================================== */
  const tilingRows = $('#tilingRows');
  if (tilingRows) {
    const rows = $$('.ch06-row', tilingRows);
    const bands = $$('.ch06-tiling__bands rect');
    let sticky = -1;
    let preview = -1;

    function paint() {
      const shown = preview >= 0 ? preview : sticky;
      bands.forEach((band, i) => band.classList.toggle('is-on', i === shown));
      rows.forEach((row, i) => row.classList.toggle('is-on', i === sticky));
    }

    rows.forEach((row, i) => {
      row.addEventListener('mouseenter', () => { preview = i; paint(); });
      row.addEventListener('mouseleave', () => { preview = -1; paint(); });
      row.addEventListener('focus', () => { preview = i; paint(); });
      row.addEventListener('blur', () => { preview = -1; paint(); });
      row.addEventListener('click', () => {
        sticky = sticky === i ? -1 : i;
        preview = -1;
        paint();
      });
    });
  }
})();

/* Chapter 08 — Algorithm Design Topics */
(() => {
  /* ---------- hero words ---------- */
  const heroFig = $('.ch08-herofig');
  const countEl = $('#ch08HeroCount');
  if (heroFig && countEl) {
    function bits(seed) {
      const out = [];
      let s = seed >>> 0;
      for (let i = 0; i < 32; i++) {
        s = (s * 1664525 + 1013904223) >>> 0;
        out.push((s >>> 16) & 1);
      }
      return out;
    }
    const a = bits(20240607);
    const b = bits(77003);
    const x = a.map((v, i) => v ^ b[i]);
    const diff = x.reduce((sum, v) => sum + v, 0);
    const rows = { a, b, x };
    $$('[data-ch08-word]').forEach((wrap) => {
      const key = wrap.dataset.ch08Word;
      const values = rows[key];
      if (!values) return;
      wrap.innerHTML = values.map((v, i) => {
        const cls = key === 'x' && v ? 'ch08-bit ch08-bit--on ch08-bit--diff' : v ? 'ch08-bit ch08-bit--on' : 'ch08-bit';
        return `<span class="${cls}" style="--i:${i}"></span>`;
      }).join('');
    });
    countEl.textContent = '0';
    CP.onVisible(heroFig, () => {
      if (CP.reduceMotion) { countEl.textContent = String(diff); return; }
      CP.countUp(countEl, diff, 900);
    }, { threshold: 0.3 });
  }

  /* ---------- code card ---------- */
  CP.mountCodeCard(document.querySelector('[data-code-card]'), {
    storageKey: 'gtcp-lang-ch08',
    order: ['cpp', 'python'],
    initial: 'cpp',
    langs: {
      cpp: {
        label: 'C++', file: 'mindist.cpp', type: 'O(n²) popcounts · 32 bits per word', pre: true,
        note: 'Reads n strings of equal length, packs each into an int, and compares every pair with xor + popcount.',
        keywords: ['using', 'namespace', 'for', 'if', 'else', 'return', 'while', 'int', 'min', 'const', 'auto'],
        types: ['int', 'vector', 'string', 'long long', 'char', 'bool'],
        code: [
          '#include <bits/stdc++.h>',
          'using namespace std;',
          '',
          'int main() {',
          '    int n, k;',
          '    cin >> n >> k;',
          '    vector<int> a(n);',
          '    for (int i = 0; i < n; i++) {',
          '        string s;',
          '        cin >> s;',
          '        a[i] = stoi(s, nullptr, 2);',
          '    }',
          '    int best = k;',
          '    for (int i = 0; i < n; i++)',
          '        for (int j = i + 1; j < n; j++)',
          '            best = min(best, __builtin_popcount(a[i] ^ a[j]));',
          '    cout << best << "\\n";',
          '}'
        ]
      },
      python: {
        label: 'Python', file: 'mindist.py', type: 'O(n²) xor · arbitrary-width ints',
        note: 'Python integers hold as many bits as needed; bit_count() is the popcount.',
        keywords: ['for', 'in', 'if', 'else', 'range', 'min', 'print', 'import', 'from', 'def', 'return', 'map'],
        types: ['int', 'str', 'list'],
        code: [
          'n, k = map(int, input().split())',
          'a = [int(input(), 2) for _ in range(n)]',
          '',
          'best = k',
          'for i in range(n):',
          '    for j in range(i + 1, n):',
          '        best = min(best, (a[i] ^ a[j]).bit_count())',
          '',
          'print(best)'
        ]
      }
    }
  });

  /* ---------- subgrid lab ---------- */
  (() => {
    const lab = $('[data-ch08-gridlab]');
    if (!lab) return;
    const rows = [
      [1, 0, 1, 1, 0, 1],
      [0, 1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1, 0],
      [1, 0, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 0],
      [1, 1, 1, 0, 0, 1]
    ];
    const n = rows.length;
    const pickA = $('#ch08RowA');
    const pickB = $('#ch08RowB');
    const grid = $('#ch08Grid');
    const andBits = $('#ch08AndBits');
    const sharedEl = $('#ch08SharedCount');
    const formula = $('#ch08GridFormula');
    const note = $('#ch08GridNote');
    if (!pickA || !pickB || !grid) return;

    for (let i = 0; i < n; i++) {
      pickA.insertAdjacentHTML('beforeend', `<option value="${i}">row ${i}</option>`);
      pickB.insertAdjacentHTML('beforeend', `<option value="${i}">row ${i}</option>`);
    }

    function pair() {
      let a = Number(pickA.value);
      let b = Number(pickB.value);
      if (a === b) { b = (b + 1) % n; }
      if (a > b) { const t = a; a = b; b = t; }
      pickA.value = String(a);
      pickB.value = String(b);
      return [a, b];
    }

    function render() {
      const [a, b] = pair();
      const common = [];
      for (let c = 0; c < n; c++) if (rows[a][c] === 1 && rows[b][c] === 1) common.push(c);
      const sharedSet = new Set(common);
      const k = common.length;

      let html = '<span class="ch08-grid__colhead"></span>';
      for (let c = 0; c < n; c++) {
        html += `<span class="ch08-grid__colhead${sharedSet.has(c) ? ' is-common' : ''}">${c}</span>`;
      }
      for (let r = 0; r < n; r++) {
        const selected = r === a || r === b;
        html += `<button class="ch08-grid__rowlabel${selected ? ' is-selected-row' : ''}" type="button" data-row="${r}" aria-label="Use row ${r} in the pair">${r}</button>`;
        for (let c = 0; c < n; c++) {
          const black = rows[r][c] === 1;
          const shared = sharedSet.has(c) && selected && black;
          const cls = [
            'ch08-grid__cell',
            black ? 'is-black' : 'is-white',
            selected && black ? 'is-row-black' : '',
            selected ? 'is-selected-row' : '',
            shared ? 'is-shared' : ''
          ].filter(Boolean).join(' ');
          html += `<span class="${cls}"></span>`;
        }
      }
      grid.innerHTML = html;

      andBits.innerHTML = '';
      for (let c = 0; c < n; c++) {
        const on = sharedSet.has(c);
        andBits.insertAdjacentHTML('beforeend', `<span class="ch08-andbit${on ? ' is-on' : ''}" data-tip="column ${c} · ${on ? 'black in both rows' : 'not shared'}">${on ? 1 : 0}</span>`);
      }

      sharedEl.textContent = String(k);
      formula.textContent = k >= 2 ? `${k} · ${k - 1} / 2 = ${(k * (k - 1)) / 2} subgrids` : `${k} shared columns · 0 subgrids`;
      note.textContent = k >= 2
        ? `Pick any two of the ${k} shared columns: together with rows ${a} and ${b} they form a black-cornered subgrid.`
        : 'A subgrid needs two black columns that are shared by both rows. This pair has fewer than two.';
      grid.setAttribute('aria-label', `Six by six grid with rows ${a} and ${b} highlighted. Shared black columns: ${common.length ? common.join(', ') : 'none'}.`);
    }

    pickA.addEventListener('change', render);
    pickB.addEventListener('change', render);
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-row]');
      if (!btn) return;
      const r = Number(btn.dataset.row);
      let a = Number(pickA.value);
      if (r === a) return;
      pickB.value = String(r);
      render();
    });
    render();
  })();

  /* ---------- potential bars ---------- */
  (() => {
    const wrap = $('#ch08PotentialBars');
    if (!wrap) return;
    const ops = [
      [1, 0], [1, 0], [1, 0], [1, 2],
      [1, 0], [1, 1], [1, 0], [1, 2]
    ];
    wrap.innerHTML = ops.map(([push, pop], i) => {
      return `<div class="ch08-pbar" style="--i:${i}">
        <span class="ch08-pbar__pop" style="height:${pop * 22}px"></span>
        <span class="ch08-pbar__push" style="height:${push * 22}px"></span>
        <em>${i + 1}</em>
      </div>`;
    }).join('');
  })();

  /* ---------- two pointers ---------- */
  (() => {
    const root = $('[data-ch08-tp]');
    if (!root) return;
    const values = [1, 3, 2, 5, 1, 1, 2, 3];
    const target = 8;
    const steps = [
      { L: 0, R: 2, note: 'Start with the window [0, 2]. Its sum is 1 + 3 + 2 = 6; adding the next value would exceed 8, so the right pointer stops.' },
      { L: 1, R: 2, note: 'The left pointer advances one step. The window is [1, 2], sum 5. The right pointer still cannot move: 5 + 5 > 8.' },
      { L: 2, R: 4, note: 'The left pointer advances again, then the right pointer sweeps two steps. The window [2, 4] holds 2 + 5 + 1 = 8.' }
    ];
    const marks = $('#ch08TpMarks');
    const cells = $('#ch08TpCells');
    const indexes = $('#ch08TpIndex');
    const windowEl = $('#ch08TpWindow');
    const sumEl = $('#ch08TpSum');
    const pointersEl = $('#ch08TpPointers');
    const movesEl = $('#ch08TpMoves');
    const noteEl = $('#ch08TpNote');
    const dots = $('#ch08TpDots');
    const prevBtn = $('[data-tp-prev]');
    const nextBtn = $('[data-tp-next]');
    const resetBtn = $('[data-tp-reset]');
    if (!marks || !cells || !nextBtn) return;

    marks.innerHTML = values.map(() => '<span class="ch08-tp__markcell"></span>').join('');
    cells.innerHTML = values.map((v) => `<span class="ch08-tp__cell">${v}</span>`).join('');
    indexes.innerHTML = values.map((_, i) => `<span class="ch08-tp__idx">${i}</span>`).join('');
    if (dots) dots.innerHTML = steps.map((_, i) => `<span data-dot="${i}"></span>`).join('');

    let current = 0;

    function render() {
      const s = steps[current];
      const sum = values.slice(s.L, s.R + 1).reduce((acc, v) => acc + v, 0);
      const marksEls = $$('.ch08-tp__markcell', marks);
      const cellEls = $$('.ch08-tp__cell', cells);
      marksEls.forEach((el) => { el.innerHTML = ''; });
      if (marksEls[s.L]) marksEls[s.L].insertAdjacentHTML('beforeend', '<span class="ch08-tp__mark">L</span>');
      if (marksEls[s.R]) marksEls[s.R].insertAdjacentHTML('beforeend', '<span class="ch08-tp__mark ch08-tp__mark--r">R</span>');
      cellEls.forEach((el, i) => {
        el.classList.toggle('is-in', i >= s.L && i <= s.R);
        el.classList.toggle('is-l', i === s.L);
        el.classList.toggle('is-r', i === s.R);
      });
      if (windowEl) windowEl.textContent = `[${s.L}, ${s.R}]`;
      if (sumEl) sumEl.textContent = String(sum);
      if (pointersEl) pointersEl.textContent = `${s.L} / ${s.R}`;
      if (movesEl) movesEl.textContent = String(s.L + s.R);
      if (noteEl) {
        noteEl.textContent = s.note;
        noteEl.classList.toggle('is-found', sum === target);
      }
      if (dots) $$('[data-dot]', dots).forEach((d, i) => d.classList.toggle('is-on', i <= current));
      if (prevBtn) prevBtn.disabled = current === 0;
      nextBtn.disabled = current === steps.length - 1;
      root.classList.toggle('is-complete', sum === target);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { if (current > 0) { current--; render(); } });
    nextBtn.addEventListener('click', () => { if (current < steps.length - 1) { current++; render(); } });
    if (resetBtn) resetBtn.addEventListener('click', () => { current = 0; render(); });
    render();
  })();

  /* ---------- nearest smaller stack ---------- */
  (() => {
    const root = $('[data-ch08-stack]');
    if (!root) return;
    const values = [1, 3, 4, 2, 5, 3, 4, 2];
    const nearest = ['–', 1, 3, 1, 2, 2, 3, 1];
    const popped = [[], [], [], [4, 3], [], [5], [], [4, 3]];
    const states = [];
    const stack = [];
    for (let i = 0; i < values.length; i++) {
      while (stack.length && values[stack[stack.length - 1]] >= values[i]) stack.pop();
      stack.push(i);
      states.push(stack.slice());
    }
    const cumulativePops = [];
    let totalPops = 0;
    popped.forEach((p) => { totalPops += p.length; cumulativePops.push(totalPops); });

    const array = $('#ch08StackArray');
    const chips = $('#ch08StackChips');
    const range = $('#ch08StackRange');
    const posEl = $('#ch08StackPos');
    const valueEl = $('#ch08StackValue');
    const noteEl = $('#ch08StackNote');
    const pushEl = $('#ch08PushCount');
    const popEl = $('#ch08PopCount');
    const pushBar = $('#ch08PushBar');
    const popBar = $('#ch08PopBar');
    const totalEl = $('#ch08StackTotal');
    if (!array || !chips || !range) return;

    array.innerHTML = values.map((v, i) => `
      <div class="ch08-stackcell" data-i="${i}">
        <span class="ch08-stackcell__value">${v}</span>
        <span class="ch08-stackcell__near">${nearest[i] === '–' ? '—' : nearest[i]}</span>
      </div>`).join('');

    function render(i) {
      const stackNow = states[i];
      $$('.ch08-stackcell', array).forEach((cell, idx) => {
        cell.classList.toggle('is-current', idx === i);
        cell.classList.toggle('is-done', idx < i);
        const tip = idx <= i ? `value ${values[idx]} · nearest smaller ${nearest[idx] === '–' ? 'none' : nearest[idx]}` : `value ${values[idx]} · not processed yet`;
        cell.setAttribute('data-tip', tip);
      });
      chips.innerHTML = stackNow.map((idx, j) => {
        const top = j === stackNow.length - 1;
        return `<span class="ch08-stackchip${top ? ' is-top' : ''}" data-tip="index ${idx} · value ${values[idx]}${top ? ' · top of stack' : ''}">${values[idx]}</span>`;
      }).join('') + '<span class="ch08-stackchip__toplabel">top</span>';
      if (posEl) posEl.textContent = String(i + 1);
      if (valueEl) valueEl.textContent = String(values[i]);
      if (noteEl) {
        const p = popped[i];
        const n = nearest[i];
        if (i === 0) noteEl.textContent = 'The stack is empty, so 1 has no nearest smaller element. Push it.';
        else if (p.length) noteEl.textContent = `${n} is the first smaller value. Remove ${p.join(' and ')} from the stack, then push ${values[i]}.`;
        else noteEl.textContent = `The top ${n} is already smaller than ${values[i]}. Report it, then push ${values[i]}.`;
      }
      if (pushEl) pushEl.textContent = String(i + 1);
      if (popEl) popEl.textContent = String(cumulativePops[i]);
      if (pushBar) pushBar.style.width = `${((i + 1) / 8) * 100}%`;
      if (popBar) popBar.style.width = `${(cumulativePops[i] / 8) * 100}%`;
      const ops = i + 1 + cumulativePops[i];
      if (totalEl) totalEl.textContent = `${ops} operation${ops === 1 ? '' : 's'} for ${i + 1} element${i ? 's' : ''}`;
    }

    range.addEventListener('input', () => render(Number(range.value)));
    render(0);
  })();

  /* ---------- sliding window ---------- */
  (() => {
    const root = $('[data-ch08-window]');
    if (!root) return;
    const values = [2, 1, 4, 5, 3, 4, 1, 2];
    const k = 4;
    const notes = [
      'Add 2, then 1: 1 removes 2 because it is smaller. Continue with 4 and 5; the deque holds [1, 4, 5] and the minimum is 1.',
      'Add 3. It removes 5 and 4 from the back; the deque is [1, 3] and the minimum is still 1.',
      'The window has moved past 1. Remove it from the front; the deque is [3, 4] and the minimum becomes 3.',
      'Add 1. It removes 4 and 3 from the back; the deque contains only 1. The minimum drops to 1.',
      'Add 2. It is larger than the front 1, so it joins the back. The deque is [1, 2] and the minimum is still 1.'
    ];
    const states = [];
    const dq = [];
    for (let i = 0; i < values.length; i++) {
      while (dq.length && values[dq[dq.length - 1]] >= values[i]) dq.pop();
      dq.push(i);
      if (dq[0] <= i - k) dq.shift();
      if (i >= k - 1) states.push({ start: i - k + 1, deque: dq.slice(), min: values[dq[0]] });
    }

    const array = $('#ch08WindowArray');
    const chips = $('#ch08DequeChips');
    const range = $('#ch08WindowRange');
    const posEl = $('#ch08WindowPos');
    const minEl = $('#ch08WindowMin');
    const noteEl = $('#ch08WindowNote');
    if (!array || !chips || !range) return;

    array.innerHTML = values.map((v, i) => `
      <div class="ch08-wincell">
        <span class="ch08-wincell__value">${v}</span>
        <span class="ch08-wincell__idx">${i}</span>
      </div>`).join('');

    function render(si) {
      const s = states[si];
      $$('.ch08-wincell', array).forEach((cell, i) => {
        const inWindow = i >= s.start && i < s.start + k;
        cell.classList.toggle('is-in', inWindow);
        cell.classList.toggle('is-min', inWindow && values[i] === s.min && s.deque.includes(i));
        cell.classList.remove('is-front');
        if (s.deque.length && i === s.deque[0]) cell.classList.add('is-front');
      });
      chips.innerHTML = s.deque.map((idx, j) => {
        const front = j === 0;
        return `<span class="ch08-deque__chip${front ? ' is-front' : ''}" data-tip="index ${idx} · value ${values[idx]}${front ? ' · front, current minimum' : ''}">
          <b>${values[idx]}</b><i>${idx}</i>${front ? '<em>front</em>' : ''}
        </span>`;
      }).join('');
      if (posEl) posEl.textContent = `window ${si + 1} / ${states.length}`;
      if (minEl) minEl.textContent = String(s.min);
      if (noteEl) noteEl.textContent = notes[si];
      range.setAttribute('aria-valuetext', `window ${si + 1} of ${states.length}, minimum ${s.min}`);
    }

    range.addEventListener('input', () => render(Number(range.value)));
    render(0);
  })();

  /* ---------- ternary search ---------- */
  (() => {
    const root = $('[data-ch08-ternary]');
    if (!root) return;
    const svg = $('#ch08TernaryChart');
    const rangeEl = $('#ch08TernRange');
    const abEl = $('#ch08TernAB');
    const valEl = $('#ch08TernValues');
    const stepEl = $('#ch08TernStep');
    const noteEl = $('#ch08TernNote');
    const nextBtn = $('[data-tern-next]');
    const runBtn = $('[data-tern-run]');
    const resetBtn = $('[data-tern-reset]');
    if (!svg) return;

    const MIN_X = 11;
    const f = (x) => (x - MIN_X) * (x - MIN_X) + 2;
    const W = 900, H = 350;
    const left = 62, right = 26, top = 28, bottom = 44;
    const plotW = W - left - right;
    const plotH = H - top - bottom;
    const xMin = 0, xMax = 20, yMin = 0, yMax = 125;
    const xScale = (x) => left + ((x - xMin) / (xMax - xMin)) * plotW;
    const yScale = (y) => top + plotH * (1 - (y - yMin) / (yMax - yMin));

    let L = 0, R = 20, step = 0, prev = null, timer = null, running = false;

    function fmt2(v) { return v.toFixed(2); }

    function draw() {
      const a = L + (R - L) / 3;
      const b = R - (R - L) / 3;
      const fa = f(a), fb = f(b);
      const done = R - L < 0.2;

      let grid = '';
      for (let v = 0; v <= 125; v += 25) {
        const y = yScale(v);
        grid += `<line x1="${left}" x2="${left + plotW}" y1="${y}" y2="${y}"/>`;
        grid += `<text x="${left - 10}" y="${y + 4}" text-anchor="end">${v}</text>`;
      }
      for (let x = 0; x <= 20; x += 4) {
        const px = xScale(x);
        grid += `<line class="ch08-tern__tick" x1="${px}" x2="${px}" y1="${top}" y2="${top + plotH}"/>`;
        grid += `<text x="${px}" y="${H - 16}" text-anchor="middle">${x}</text>`;
      }

      let curve = '';
      for (let x = 0; x <= 20.0001; x += 0.1) {
        curve += `${curve ? 'L' : 'M'}${xScale(x).toFixed(2)},${yScale(f(x)).toFixed(2)} `;
      }

      let rejected = '';
      if (prev) {
        if (prev.L < L) rejected += `<rect x="${xScale(prev.L)}" y="${top}" width="${xScale(L) - xScale(prev.L)}" height="${plotH}" fill="url(#ch08TernHatch)"/>`;
        if (prev.R > R) rejected += `<rect x="${xScale(R)}" y="${top}" width="${xScale(prev.R) - xScale(R)}" height="${plotH}" fill="url(#ch08TernHatch)"/>`;
      }

      const yA = yScale(fa), yB = yScale(fb);
      let labels = '';
      labels += `<line class="ch08-tern__guide" x1="${xScale(a)}" x2="${xScale(a)}" y1="${yA}" y2="${top + plotH}"/>`;
      labels += `<line class="ch08-tern__guide" x1="${xScale(b)}" x2="${xScale(b)}" y1="${yB}" y2="${top + plotH}"/>`;
      labels += `<circle class="ch08-tern__dot" cx="${xScale(a)}" cy="${yA}" r="4.5"/><text class="ch08-tern__point" x="${xScale(a)}" y="${yA - 12}" text-anchor="middle">a</text>`;
      labels += `<circle class="ch08-tern__dot" cx="${xScale(b)}" cy="${yB}" r="4.5"/><text class="ch08-tern__point" x="${xScale(b)}" y="${yB - 12}" text-anchor="middle">b</text>`;

      svg.innerHTML = `
        <defs>
          <pattern id="ch08TernHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--c-dcdcd5)" stroke-width="1"/>
          </pattern>
        </defs>
        <g class="ch08-tern__grid">${grid}</g>
        <rect class="ch08-tern__band" x="${xScale(L)}" y="${top}" width="${Math.max(0, xScale(R) - xScale(L))}" height="${plotH}"/>
        ${rejected}
        <path class="ch08-tern__curve" d="${curve}"/>
        <line class="ch08-tern__edge" x1="${xScale(L)}" x2="${xScale(L)}" y1="${top}" y2="${top + plotH}"/>
        <line class="ch08-tern__edge" x1="${xScale(R)}" x2="${xScale(R)}" y1="${top}" y2="${top + plotH}"/>
        <text class="ch08-tern__limit" x="${xScale(L)}" y="${top - 8}" text-anchor="middle">xL</text>
        <text class="ch08-tern__limit" x="${xScale(R)}" y="${top - 8}" text-anchor="middle">xR</text>
        ${labels}
        ${done ? `<line class="ch08-tern__answer" x1="${xScale(MIN_X)}" x2="${xScale(MIN_X)}" y1="${yScale(f(MIN_X))}" y2="${top + plotH}"/><text class="ch08-tern__answerlabel" x="${xScale(MIN_X) + 8}" y="${yScale(f(MIN_X)) - 10}">minimum ≈ ${MIN_X}</text>` : ''}
      `;
      svg.setAttribute('aria-label', `Ternary search on [${fmt2(L)}, ${fmt2(R)}]. a = ${fmt2(a)}, b = ${fmt2(b)}, f(a) = ${fmt2(fa)}, f(b) = ${fmt2(fb)}.`);

      if (rangeEl) rangeEl.textContent = `[${fmt2(L)}, ${fmt2(R)}]`;
      if (abEl) abEl.textContent = `${fmt2(a)} / ${fmt2(b)}`;
      if (valEl) valEl.textContent = `${fmt2(fa)} / ${fmt2(fb)}`;
      if (stepEl) stepEl.textContent = String(step);
      if (noteEl) {
        if (done) {
          noteEl.textContent = `The interval is narrower than 0.2. The minimum is near x ≈ ${fmt2((L + R) / 2)}; the exact bottom of this curve is at x = 11.`;
        } else if (Math.abs(fa - fb) < 1e-9) {
          noteEl.textContent = `f(a) = f(b), so the book's rule takes the else branch: keep [a, xR]. The right third cannot contain a strictly lower point.`;
        } else if (fa < fb) {
          noteEl.textContent = `f(a) < f(b), so the minimum cannot lie to the right of b. Keep [xL, b].`;
        } else {
          noteEl.textContent = `f(a) > f(b), so the minimum cannot lie to the left of a. Keep [a, xR].`;
        }
      }
      if (nextBtn) nextBtn.disabled = done;
      root.classList.toggle('is-done', done);
    }

    function narrow() {
      if (R - L < 0.2) {
        stopRun();
        return;
      }
      const a = L + (R - L) / 3;
      const b = R - (R - L) / 3;
      const fa = f(a), fb = f(b);
      prev = { L, R };
      if (fa < fb) R = b; else L = a;
      step++;
      draw();
      if (R - L < 0.2) stopRun();
    }

    function stopRun() {
      if (timer) clearInterval(timer);
      timer = null;
      running = false;
      if (runBtn) {
        runBtn.setAttribute('aria-pressed', 'false');
        const label = runBtn.querySelector('span');
        if (label) label.textContent = 'Run';
        const use = runBtn.querySelector('use');
        if (use) use.setAttribute('href', '#i-play');
      }
    }

    function startRun() {
      if (running) { stopRun(); return; }
      if (R - L < 0.2) return;
      if (CP.reduceMotion) {
        while (R - L >= 0.2) {
          const a = L + (R - L) / 3;
          const b = R - (R - L) / 3;
          const fa = f(a), fb = f(b);
          prev = { L, R };
          if (fa < fb) R = b; else L = a;
          step++;
        }
        draw();
        return;
      }
      running = true;
      if (runBtn) {
        runBtn.setAttribute('aria-pressed', 'true');
        const label = runBtn.querySelector('span');
        if (label) label.textContent = 'Pause';
        const use = runBtn.querySelector('use');
        if (use) use.setAttribute('href', '#i-pause');
      }
      timer = setInterval(narrow, 300);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { stopRun(); narrow(); });
    if (runBtn) runBtn.addEventListener('click', startRun);
    if (resetBtn) resetBtn.addEventListener('click', () => {
      stopRun();
      L = 0; R = 20; step = 0; prev = null;
      draw();
    });
    draw();
  })();
})();

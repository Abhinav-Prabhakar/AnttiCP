/* Chapter 14 — String Algorithms */
(() => {
  const $ = CP.$;
  const $$ = CP.$$;
  const reduceMotion = CP.reduceMotion;

  /* ======================================================================
     14.1 — substring vs subsequence
     ====================================================================== */
  (() => {
    const root = $('#anatomy');
    const tiles = $('#anatomyTiles');
    const readout = $('#anatomyReadout');
    if (!root || !tiles || !readout) return;
    const word = 'ENVELOPE';
    const sub = [1, 2, 3, 4, 5];
    const seq = [1, 3, 6];

    tiles.innerHTML = word.split('').map((ch, i) =>
      `<span class="ch14-letter" data-i="${i}">${ch}<span class="ch14-letter__i">${i}</span></span>`
    ).join('');

    const buttons = $$('[data-anatomy]', root);
    const defs = $$('.ch14-def', root);
    const cells = $$('.ch14-letter', tiles);

    function setMode(mode) {
      const active = mode === 'seq' ? seq : sub;
      cells.forEach((cell, i) => {
        const on = active.includes(i);
        cell.classList.toggle('is-on', on);
        cell.classList.toggle('is-skip', !on && mode === 'seq');
      });
      buttons.forEach((b) => {
        const on = b.dataset.anatomy === mode;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      defs.forEach((d) => d.classList.toggle('is-active', d.dataset.def === mode));
      readout.innerHTML = mode === 'seq'
        ? '<b>NEP</b> takes positions 1, 3, and 6 — the gaps are allowed.'
        : '<b>NVELO</b> occupies positions 1–5, with no gaps.';
    }

    buttons.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.anatomy)));
    setMode('sub');
  })();

  /* ======================================================================
     14.1.1 — trie search
     ====================================================================== */
  (() => {
    const svg = $('#trieSvg');
    const status = $('#trieStatus');
    if (!svg || !status) return;
    const words = {
      CANAL: {
        nodes: ['0', 'c', 'a', 'n', 'a2', 'l'],
        edges: ['0-c', 'c-a', 'a-n', 'n-a', 'a-l'],
        found: true,
        text: '<b>CANAL</b> follows C–A–N–A–L and ends on a double ring: the word is in the set.'
      },
      CANDY: {
        nodes: ['0', 'c', 'a', 'n', 'd', 'y'],
        edges: ['0-c', 'c-a', 'a-n', 'n-d', 'd-y'],
        found: true,
        text: '<b>CANDY</b> shares CAN with CANAL, then branches to D–Y. Shared prefixes share the chain.'
      },
      THE: {
        nodes: ['0', 't', 'h', 'e'],
        edges: ['0-t', 't-h', 'h-e'],
        found: true,
        text: '<b>THE</b> ends at the first E. That node is a word, and the tree continues towards THERE.'
      },
      THERE: {
        nodes: ['0', 't', 'h', 'e', 'r', 'e2'],
        edges: ['0-t', 't-h', 'h-e', 'e-r', 'r-e'],
        found: true,
        text: '<b>THERE</b> passes through THE and continues with R–E. Six nodes, one path.'
      },
      CAN: {
        nodes: ['0', 'c', 'a', 'n'],
        edges: ['0-c', 'c-a', 'a-n'],
        found: false,
        text: '<b>CAN</b> reaches a node, but the node is not marked — it is a prefix of CANAL and CANDY, not a word.'
      },
      CAR: {
        nodes: ['0', 'c', 'a'],
        edges: ['0-c', 'c-a'],
        found: false,
        text: '<b>CAR</b> leaves the tree after CA: there is no R edge. The trie says no in three steps.'
      }
    };

    const nodes = $$('.ch14-node', svg);
    const edges = $$('[data-edge]', svg);
    const buttons = $$('.ch14-word');

    function select(word) {
      const entry = words[word];
      if (!entry) return;
      nodes.forEach((n) => n.classList.remove('is-path', 'is-found'));
      edges.forEach((e) => e.classList.remove('is-path'));
      buttons.forEach((b) => {
        const on = b.dataset.word === word;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      entry.nodes.forEach((id) => {
        const node = nodes.find((n) => n.dataset.node === id);
        if (node) node.classList.add('is-path');
      });
      entry.edges.forEach((id) => {
        const edge = edges.find((e) => e.dataset.edge === id);
        if (edge) edge.classList.add('is-path');
      });
      if (entry.found) {
        const last = nodes.find((n) => n.dataset.node === entry.nodes[entry.nodes.length - 1]);
        if (last) last.classList.add('is-found');
      }
      status.innerHTML = entry.text;
    }

    buttons.forEach((b) => {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => select(b.dataset.word));
    });
    select('CANAL');
  })();

  /* ======================================================================
     14.1.2 — LCS and edit distance
     ====================================================================== */
  (() => {
    const root = $('#dpMatrix');
    const grid = $('#dpGrid');
    const note = $('#dpNote');
    if (!root || !grid || !note) return;

    const configs = {
      lcs: {
        x: 'TOUR',
        y: 'OPERA',
        build(x, y) {
          const n = x.length, m = y.length;
          const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
          for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
              dp[i][j] = x[i - 1] === y[j - 1]
                ? dp[i - 1][j - 1] + 1
                : Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
          }
          return dp;
        },
        note: 'The last cell holds the answer: <b>2</b> — the length of <b>OR</b>.'
      },
      edit: {
        x: 'LOVE',
        y: 'MOVIE',
        build(x, y) {
          const n = x.length, m = y.length;
          const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
          for (let i = 0; i <= n; i++) dp[i][0] = i;
          for (let j = 0; j <= m; j++) dp[0][j] = j;
          for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
              const cost = x[i - 1] === y[j - 1] ? 0 : 1;
              dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
              );
            }
          }
          return dp;
        },
        note: 'The last cell holds the answer: <b>2</b>. LOVE → MOVE (modify) → MOVIE (insert).'
      }
    };

    let mode = 'lcs';

    function render() {
      const cfg = configs[mode];
      const x = cfg.x, y = cfg.y;
      const dp = cfg.build(x, y);
      const n = x.length, m = y.length;

      const path = new Set();
      let i = n, j = m;
      path.add(`${i},${j}`);
      while (i > 0 || j > 0) {
        if (i > 0 && j > 0) {
          const stepCost = mode === 'lcs'
            ? (x[i - 1] === y[j - 1] ? 1 : 0)
            : (x[i - 1] === y[j - 1] ? 0 : 1);
          if (dp[i][j] === dp[i - 1][j - 1] + stepCost) {
            i--; j--;
            path.add(`${i},${j}`);
            continue;
          }
        }
        if (i > 0 && dp[i][j] === dp[i - 1][j] + (mode === 'lcs' ? 0 : 1)) {
          i--;
        } else if (j > 0) {
          j--;
        } else {
          break;
        }
        path.add(`${i},${j}`);
      }

      let html = '<table class="ch14-dp-table"><thead><tr><th>ε</th><th>ε</th>';
      for (const ch of y) html += `<th>${ch}</th>`;
      html += '</tr></thead><tbody>';
      for (let r = 0; r <= n; r++) {
        html += `<tr><th>${r === 0 ? 'ε' : x[r - 1]}</th>`;
        for (let c = 0; c <= m; c++) {
          const cls = [
            path.has(`${r},${c}`) ? 'is-path' : '',
            r === n && c === m ? 'is-answer' : ''
          ].filter(Boolean).join(' ');
          html += `<td class="${cls}">${dp[r][c]}</td>`;
        }
        html += '</tr>';
      }
      html += '</tbody></table>';
      grid.innerHTML = html;
      note.innerHTML = cfg.note;
      grid.setAttribute('aria-label', `${mode === 'lcs' ? 'LCS' : 'Edit distance'} table for ${x} and ${y}`);
    }

    $$('[data-dp]', root).forEach((b) => {
      b.addEventListener('click', () => {
        mode = b.dataset.dp;
        $$('[data-dp]', root).forEach((other) => {
          const on = other.dataset.dp === mode;
          other.classList.toggle('is-active', on);
          other.setAttribute('aria-pressed', String(on));
        });
        render();
      });
    });

    render();
  })();

  /* ======================================================================
     14.2.1 — rolling hash lab
     ====================================================================== */
  (() => {
    const root = $('#hashLab');
    if (!root) return;
    const str = 'ABACBAB';
    const A = 3, B = 97;
    const n = str.length;
    const h = new Array(n);
    const p = new Array(n);
    h[0] = str.charCodeAt(0);
    p[0] = 1;
    for (let i = 1; i < n; i++) {
      h[i] = (h[i - 1] * A + str.charCodeAt(i)) % B;
      p[i] = (p[i - 1] * A) % B;
    }

    const tiles = $('#hashString');
    const slider = $('#hashStart');
    const startVal = $('#hashStartVal');
    const windowEl = $('#hashWindow');
    const valueEl = $('#hashValue');
    const arrays = $('#hashArrays');
    const formula = $('#hashFormula');
    const note = $('#hashNote');
    if (!tiles || !slider || !windowEl || !valueEl || !arrays || !formula || !note) return;

    tiles.innerHTML = str.split('').map((ch, i) =>
      `<span class="ch14-hash-tile" data-i="${i}">${ch}<span class="ch14-hash-tile__i">${i}</span></span>`
    ).join('');
    const cellEls = $$('.ch14-hash-tile', tiles);

    let k = 3;
    let a = 1;

    function getHash(from, len) {
      const b = from + len - 1;
      if (from === 0) return h[b];
      return ((h[b] - h[from - 1] * p[len]) % B + B) % B;
    }

    function renderArrays(b, len) {
      const idx = ['', ...Array.from({ length: n }, (_, i) => i)];
      const hCells = h.map((v, i) => {
        let cls = 'ch14-hash-cell';
        if (i === b) cls += ' is-active';
        else if (len > 1 && i === a - 1 && a > 0) cls += ' is-mult';
        return `<span class="${cls}">${v}</span>`;
      });
      const pCells = p.map((v, i) => {
        const cls = 'ch14-hash-cell' + (i === len ? ' is-mult' : '');
        return `<span class="${cls}">${v}</span>`;
      });
      arrays.innerHTML =
        `<div class="ch14-hash-row"><span class="ch14-hash-row__label"></span>${idx.slice(1).map((v, i) => `<span class="ch14-hash-cell is-index">${i}</span>`).join('')}</div>` +
        `<div class="ch14-hash-row"><span class="ch14-hash-row__label">h</span>${hCells.join('')}</div>` +
        `<div class="ch14-hash-row"><span class="ch14-hash-row__label">p</span>${pCells.join('')}</div>`;
    }

    function render() {
      const b = a + k - 1;
      const value = getHash(a, k);
      const windowStr = str.slice(a, a + k);
      let raw = 0;
      let directLine = '';
      for (let i = 0; i < k; i++) {
        const power = Math.pow(A, k - 1 - i);
        const code = str.charCodeAt(a + i);
        raw += code * power;
        directLine += `${i ? ' + ' : ''}${code}·3<sup>${k - 1 - i}</sup>`;
      }

      cellEls.forEach((cell, i) => {
        cell.classList.toggle('is-window', i >= a && i < a + k);
        cell.classList.toggle('is-in', i < a || i >= a + k);
      });

      windowEl.textContent = windowStr;
      valueEl.textContent = value;
      if (startVal) startVal.textContent = a;
      slider.value = a;
      slider.max = n - k;

      renderArrays(b, k);

      const direct = `${directLine} = ${raw} ≡ ${raw % B} (mod ${B})`;
      if (a === 0) {
        formula.innerHTML =
          `<div>a = 0, so the substring hash is just <b>h[${b}] = ${h[b]}</b>.</div>` +
          `<div class="is-dim">direct: ${direct}</div>`;
        note.textContent = 'At the beginning of the string the subtraction disappears — the prefix hash is the substring hash.';
      } else {
        const sub = h[b] - h[a - 1] * p[k];
        formula.innerHTML =
          `<div>(h[${b}] − h[${a - 1}] · p[${k}]) mod ${B} = (${h[b]} − ${h[a - 1]} · ${p[k]}) mod ${B} = <b>${value}</b></div>` +
          `<div class="is-dim">direct: ${direct}</div>`;
        note.textContent = 'Two routes, one value: subtract the prefix and shift it into place, or build the window polynomial again.';
      }
      formula.setAttribute('aria-label', `Hash of the window ${windowStr} is ${value}`);
    }

    slider.addEventListener('input', () => {
      a = Number(slider.value);
      render();
    });

    $$('[data-k]', root).forEach((b) => {
      b.addEventListener('click', () => {
        k = Number(b.dataset.k);
        if (a > n - k) a = n - k;
        $$('[data-k]', root).forEach((other) => {
          const on = Number(other.dataset.k) === k;
          other.classList.toggle('is-active', on);
          other.setAttribute('aria-pressed', String(on));
        });
        render();
      });
    });

    render();
  })();

  /* ======================================================================
     14.2.2 — three small application visuals
     ====================================================================== */
  (() => {
    const strip = $('#matchStrip');
    if (strip) {
      const s = 'ABCABABCA';
      const occ = new Set([0, 1, 2, 5, 6, 7]);
      const pat = new Set([0, 1, 2]);
      strip.innerHTML = s.split('').map((ch, i) => {
        const cls = 'ch14-strip__cell' +
          (pat.has(i) ? ' is-pat' : '') +
          (occ.has(i) ? ' is-occ' : '');
        const tip = occ.has(i)
          ? `hash(ABC) = hash(s[${i > 2 ? 5 : 0}…${i > 2 ? 7 : 2}]) · occurrence`
          : `position ${i}`;
        return `<span class="${cls}" tabindex="0" data-tip="${tip}">${ch}<i>${i}</i></span>`;
      }).join('');
    }

    const distinct = $('#distinctBox');
    if (distinct) {
      const windows = ['ABA', 'BAB', 'ABA', 'BAB'];
      distinct.innerHTML = windows.map((w, i) =>
        `<span class="ch14-window-chip${i > 1 ? ' is-dup' : ''}">${w}</span>`
      ).join('') +
        '<span class="ch14-distinct__arrow">→</span>' +
        '<span class="ch14-window-chip is-set">ABA</span>' +
        '<span class="ch14-window-chip is-set">BAB</span>';
    }

    const rotations = $('#rotationList');
    if (rotations) {
      const rows = [
        ['ATLAS', 2], ['TLASA', 5], ['LASAT', 3], ['ASATL', 1], ['SATLA', 4]
      ];
      rotations.innerHTML = rows.map(([word, rank]) =>
        `<div class="ch14-rotation${rank === 1 ? ' is-min' : ''}"${rank === 1 ? ' tabindex="0" data-tip="The minimal rotation: ASATL"' : ''}>
          <span>${word}</span><span>${rank === 1 ? 'minimal' : '#' + rank}</span>
        </div>`
      ).join('');
    }
  })();

  /* ======================================================================
     14.2.3 — collision probabilities
     ====================================================================== */
  (() => {
    const root = $('#collLab');
    const chart = $('#collChart');
    const note = $('#collNote');
    if (!root || !chart || !note) return;

    const bLabels = ['10³', '10⁶', '10⁹', '10¹²', '10¹⁵', '10¹⁸'];
    const data = {
      1: [0, 0, 0, 0, 0, 0],
      2: [1, 0.63, 0, 0, 0, 0],
      3: [1, 1, 1, 0.39, 0, 0]
    };
    const notes = {
      1: 'Comparing a single pair is safe even for small B: the chance is 1/B, which rounds to 0.00 for every value in the table.',
      2: 'One string against a million others: B ≈ 10⁹ keeps the probability at 0.00, but B = 10⁶ already collides 63% of the time.',
      3: 'Every pair among a million strings: with B ≈ 10⁹ a collision is certain. This is the birthday paradox — and the reason to use two hashes.'
    };

    chart.innerHTML = bLabels.map((label, i) =>
      `<div class="ch14-bar" data-i="${i}">
         <span class="ch14-bar__val">0.00</span>
         <div class="ch14-bar__track"><span class="ch14-bar__fill is-zero"></span></div>
         <span class="ch14-bar__label">${label}</span>
       </div>`
    ).join('');

    const bars = $$('.ch14-bar', chart);
    let scenario = 3;

    function render() {
      const values = data[scenario];
      bars.forEach((bar, i) => {
        const v = values[i];
        const fill = $('.ch14-bar__fill', bar);
        const val = $('.ch14-bar__val', bar);
        const pct = Math.round(v * 100);
        fill.style.height = (v > 0 ? Math.max(pct, 3) : 1) + '%';
        fill.classList.toggle('is-zero', v === 0);
        val.textContent = v >= 1 ? '1.00' : v.toFixed(2);
        bar.setAttribute('tabindex', '0');
        bar.setAttribute('data-tip', `B = ${bLabels[i].replace('10', '10^')} · scenario ${scenario} · ${v >= 1 ? 'certain' : v === 0 ? 'negligible' : Math.round(v * 100) + '%'}`);
      });
      note.textContent = notes[scenario];
      chart.setAttribute('aria-label', `Collision probability, scenario ${scenario}, for B from 10^3 to 10^18: ${values.map((v) => v.toFixed(2)).join(', ')}`);
    }

    $$('[data-scenario]', root).forEach((b) => {
      b.addEventListener('click', () => {
        scenario = Number(b.dataset.scenario);
        $$('[data-scenario]', root).forEach((other) => {
          const on = Number(other.dataset.scenario) === scenario;
          other.classList.toggle('is-active', on);
          other.setAttribute('aria-pressed', String(on));
        });
        render();
      });
    });

    render();
  })();

  /* ======================================================================
     14.3 — Z-array figure
     ====================================================================== */
  (() => {
    const fig = $('#zFigure');
    if (!fig) return;
    const s = 'ABCABCABAB';
    const z = ['–', 0, 0, 5, 0, 0, 2, 0, 2, 0];
    let grid = '<div class="ch14-zgrid">';
    for (let i = 0; i < s.length; i++) grid += `<span class="ch14-zcell ch14-zcell--idx">${i}</span>`;
    for (const ch of s) grid += `<span class="ch14-zcell">${ch}</span>`;
    for (let i = 0; i < z.length; i++) {
      const cls = 'ch14-zcell ch14-zcell--val' + (z[i] !== 0 ? ' is-known' : '') + (i === 3 ? ' is-hot' : '');
      const tip = z[i] === '–'
        ? 'z[0] is left blank'
        : `z[${i}] = ${z[i]} · ${z[i] ? 's[' + i + '…] matches the prefix for ' + z[i] + ' characters' : 'no prefix match at this position'}`;
      grid += `<span class="${cls}" tabindex="0" data-tip="${tip}">${z[i]}</span>`;
    }
    grid += '</div>';
    fig.innerHTML = grid + '<div class="ch14-zbracket"><span style="grid-column:4 / 9">ABCAB = prefix · z[3] = 5</span></div>';
  })();

  /* ======================================================================
     14.3.1 — Z-algorithm stepper
     ====================================================================== */
  (() => {
    const root = $('#zLab');
    const svg = $('#zSvg');
    if (!root || !svg) return;
    const s = 'ABCABCABAB';
    const n = s.length;
    const steps = [
      {
        k: null, z: null, x: null, y: null, scenario: 0,
        note: 'Press next to compute <i>z</i>[1]. The box is empty, so the first step compares from scratch.'
      },
      {
        k: 1, z: 0, x: null, y: null, scenario: 1,
        note: '<i>s</i>[0] = A and <i>s</i>[1] = B differ immediately. <b><i>z</i>[1] = 0</b>; no box is created.'
      },
      {
        k: 2, z: 0, x: null, y: null, scenario: 1,
        note: 'There is still no box covering <i>k</i> = 2. Compare A with C: <b><i>z</i>[2] = 0</b>.'
      },
      {
        k: 3, z: 5, x: 3, y: 7, scenario: 1,
        note: 'Compare from scratch: <b>ABCAB</b> matches the prefix, then A meets C. <b><i>z</i>[3] = 5</b> and the box becomes <b>[3, 7]</b>.'
      },
      {
        k: 4, z: 0, x: 3, y: 7, copy: 1, scenario: 2,
        note: '<i>k</i> = 4 lies inside [3, 7]. Since 4 + <i>z</i>[1] = 4 ≤ 7, copy the value: <b><i>z</i>[4] = <i>z</i>[1] = 0</b>. No characters are compared.'
      },
      {
        k: 5, z: 0, x: 3, y: 7, copy: 2, scenario: 2,
        note: '5 + <i>z</i>[2] = 5 ≤ 7, so again the match stays inside the box: <b><i>z</i>[5] = 0</b>.'
      },
      {
        k: 6, z: 2, x: 3, y: 7, scenario: 3,
        note: '<i>k</i> + <i>z</i>[<i>k</i>−<i>x</i>] = 6 + <i>z</i>[3] = 11 &gt; 7. The match reaches past the box; start at <i>y</i>−<i>k</i>+1 = 2. Only AB matches, so <b><i>z</i>[6] = 2</b> and the box stays [3, 7].'
      },
      {
        k: 7, z: 0, x: 3, y: 7, copy: 4, scenario: 2,
        note: '7 + <i>z</i>[4] = 7 ≤ 7, so <b><i>z</i>[7] = 0</b> without touching a character.'
      },
      {
        k: 8, z: 2, x: 8, y: 9, scenario: 1,
        note: 'The box ends at 7, so position 8 is outside it. Compare from scratch: AB matches and the string ends. <b><i>z</i>[8] = 2</b>; the new box is <b>[8, 9]</b>.'
      },
      {
        k: 9, z: 0, x: 8, y: 9, copy: 1, scenario: 2,
        note: '9 + <i>z</i>[1] = 9 ≤ 9, so copy: <b><i>z</i>[9] = 0</b>. The array is complete.'
      }
    ];

    const state = { step: 0 };
    const title = $('#zTitle');
    const badge = $('#zBadge');
    const note = $('#zNote');
    const kEl = $('#zK');
    const valEl = $('#zVal');
    const boxEl = $('#zBox');
    const stepEl = $('#zStep');
    const prev = $('#zPrev');
    const next = $('#zNext');
    const reset = $('#zReset');

    const stageEl = svg.parentElement;

    // Geometry is derived from the live stage width so the diagram never
    // overflows on phones and always fills the panel on desktop.
    function metrics() {
      const w = Math.max(220, Math.round(stageEl && stageEl.clientWidth ? stageEl.clientWidth : 620));
      const narrow = w < 430;
      const gap = narrow ? 3 : 7;
      const padL = narrow ? 20 : 28;
      const avail = w - padL - (narrow ? 2 : 8);
      let cell = Math.floor((avail - gap * (n - 1)) / n);
      cell = Math.max(18, Math.min(58, cell));
      const step = cell + gap;
      const contentW = n * cell + (n - 1) * gap;
      const startX = padL + Math.max(0, (avail - contentW) / 2);
      const strY = 26;
      const zH = Math.max(20, Math.round(cell * 0.62));
      const zY = strY + cell + (narrow ? 28 : 34);
      const bracketY = zY + zH + 12;
      return { w, cell, gap, step, startX, strY, zH, zY, bracketY, h: bracketY + 30, narrow };
    }

    function render() {
      const st = steps[state.step];
      const m = metrics();
      const { w, cell, gap, step, startX, strY, zH, zY, bracketY, h } = m;
      const charFs = Math.max(11, Math.round(cell * 0.44));
      const idxFs = Math.max(8, Math.round(cell * 0.25));
      const valFs = Math.max(10, Math.round(cell * 0.36));
      const noteFs = Math.max(9, Math.round(cell * 0.24));
      const labelX = startX - Math.max(10, Math.round(cell * 0.3));
      const known = {};
      for (let i = 1; i <= (st.k || 0); i++) {
        const found = steps.find((item) => item.k === i);
        if (found) known[i] = found.z;
      }
      let stage = '';
      stage += `<text class="ch14-zsvg-idx" style="font-size:${idxFs}px" x="${labelX}" y="${strY + cell * 0.66}">s</text>`;
      stage += `<text class="ch14-zsvg-idx" style="font-size:${idxFs}px" x="${labelX}" y="${zY + zH * 0.66}">z</text>`;

      if (st.x !== null) {
        const bx = startX + st.x * step - 4;
        const bw = (st.y - st.x + 1) * step - gap + 8;
        stage += `<rect class="ch14-zsvg-box" x="${bx}" y="${strY - 6}" width="${bw}" height="${cell + 12}" rx="3"/>`;
      }

      for (let i = 0; i < n; i++) {
        const cx = startX + i * step;
        const classes = [];
        if (i === st.k) classes.push('is-current');
        if (st.z && st.k !== null && i >= st.k && i < st.k + st.z) classes.push('is-match');
        if (st.z && st.k !== null && i < st.z) classes.push('is-match');
        if (st.scenario === 3 && st.k !== null && i === st.k) classes.push('is-compare');
        stage += `<g class="${classes.join(' ')}">`;
        stage += `<rect class="ch14-zsvg-cell" x="${cx}" y="${strY}" width="${cell}" height="${cell}" rx="2"/>`;
        stage += `<text class="ch14-zsvg-char" style="font-size:${charFs}px" x="${cx + cell / 2}" y="${strY + cell * 0.68}">${s[i]}</text>`;
        stage += `<text class="ch14-zsvg-idx" style="font-size:${idxFs}px" x="${cx + cell / 2}" y="${strY - 8}">${i}</text>`;
        stage += '</g>';
      }

      for (let i = 0; i < n; i++) {
        const cx = startX + i * step;
        let value = '?';
        if (i === 0) value = '–';
        else if (known[i] !== undefined) value = known[i];
        const classes = [];
        if (i === st.k) classes.push('is-hot');
        if (st.copy !== undefined && (i === st.copy || i === st.k)) classes.push('is-copy');
        if (known[i] !== undefined) classes.push('is-known');
        stage += `<g class="${classes.join(' ')}">`;
        stage += `<rect class="ch14-zsvg-zcell" x="${cx}" y="${zY}" width="${cell}" height="${zH}" rx="2"/>`;
        stage += `<text class="ch14-zsvg-val" style="font-size:${valFs}px" x="${cx + cell / 2}" y="${zY + zH * 0.68}">${value}</text>`;
        stage += '</g>';
      }

      if (st.x !== null) {
        const x1 = startX + st.x * step;
        const x2 = startX + st.y * step + cell;
        stage += `<path class="ch14-zsvg-bracket" d="M${x1} ${bracketY}v6h${x2 - x1}v-6"/>`;
        stage += `<text class="ch14-zsvg-note" style="font-size:${noteFs}px" x="${(x1 + x2) / 2}" y="${bracketY + 20}">[${st.x}, ${st.y}]</text>`;
      } else {
        stage += `<text class="ch14-zsvg-note" style="font-size:${noteFs}px" x="${w / 2}" y="${bracketY + 20}">no box yet</text>`;
      }

      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.innerHTML = stage;
      svg.setAttribute('aria-label', st.k === null
        ? 'Empty Z-box; press next to begin.'
        : `Step ${state.step}: position ${st.k}, z value ${st.z}${st.x !== null ? `, box ${st.x} to ${st.y}` : ', no box'}.`);

      if (title) title.textContent = st.k === null ? 'Position 0' : `Position ${st.k}`;
      if (badge) {
        badge.textContent = st.scenario === 0 ? 'start' : `scenario ${st.scenario}`;
        badge.classList.toggle('is-scen2', st.scenario === 2);
      }
      if (note) note.innerHTML = st.note;
      if (kEl) kEl.textContent = st.k === null ? '–' : st.k;
      if (valEl) valEl.textContent = st.z === null ? '–' : st.z;
      if (boxEl) boxEl.textContent = st.x === null ? '–' : `[${st.x}, ${st.y}]`;
      if (stepEl) stepEl.textContent = `${state.step} / ${steps.length - 1}`;
      if (prev) prev.disabled = state.step === 0;
      if (next) next.disabled = state.step === steps.length - 1;
    }

    if (next) next.addEventListener('click', () => {
      state.step = Math.min(state.step + 1, steps.length - 1);
      render();
    });
    if (prev) prev.addEventListener('click', () => {
      state.step = Math.max(state.step - 1, 0);
      render();
    });
    if (reset) reset.addEventListener('click', () => {
      state.step = 0;
      render();
    });

    let raf = 0;
    if (stageEl && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(render);
      });
      ro.observe(stageEl);
    }

    render();
  })();

  /* ======================================================================
     14.3.2 — pattern matching and borders
     ====================================================================== */
  (() => {
    const pm = $('#pmatch');
    if (pm) {
      const s = 'ABC#ABCABABCA';
      const z = ['–', 0, 0, 0, 3, 0, 0, 2, 0, 3, 0, 0, 1];
      let html = '';
      for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        const isSep = ch === '#';
        const isPat = i < 3;
        const isMatch = z[i] === 3;
        const isZero = z[i] === 0;
        let cls = 'ch14-pm-cell';
        if (isSep) cls += ' is-sep';
        else if (isPat) cls += ' is-pat';
        if (isMatch) cls += ' is-match';
        else if (isZero) cls += ' is-zero';
        const tip = isSep
          ? 'Separator: a character that occurs in neither string'
          : `z[${i}] = ${z[i]}${isMatch ? ' · pattern match' : ''}`;
        html += `<span class="${cls}" tabindex="0" data-tip="${tip}">${ch}<i>${z[i]}</i></span>`;
      }
      pm.innerHTML = html;
    }

    const borders = $('#borders');
    if (borders) {
      const s = 'ABACABACABA';
      const z = ['–', 0, 1, 0, 7, 0, 1, 0, 3, 0, 1];
      let html = '<div class="ch14-borders">';
      for (let i = 0; i < s.length; i++) {
        const isBorder = i + (z[i] === '–' ? 0 : z[i]) === s.length && z[i] !== '–';
        html += `<span class="ch14-bd-cell${isBorder ? ' is-b1' : ''}" tabindex="0" data-tip="${z[i] === '–' ? 'The whole string' : `z[${i}] = ${z[i]}`}">${s[i]}</span>`;
      }
      html += '</div>';
      html += '<div class="ch14-borders__list">' +
        '<span class="ch14-border-chip">A<span>1</span></span>' +
        '<span class="ch14-border-chip">ABA<span>3</span></span>' +
        '<span class="ch14-border-chip">ABACABA<span>7</span></span>' +
        '</div>';
      borders.innerHTML = html;
    }
  })();

  /* ======================================================================
     14.4 — suffix array table
     ====================================================================== */
  const SA_STRING = 'ABAACBAB';
  const SA = [2, 6, 0, 3, 7, 1, 5, 4];

  (() => {
    const table = $('#saTable');
    if (!table) return;
    table.innerHTML = SA.map((pos, i) => {
      const suffix = SA_STRING.slice(pos);
      return `<div class="ch14-sa-row"${i === 0 ? ' data-tip="The smallest suffix: AACBAB"' : ''} tabindex="0">
        <span class="ch14-sa-row__i">${i}</span>
        <span class="ch14-sa-row__val">${pos}</span>
        <span class="ch14-sa-row__suffix">${suffix}</span>
      </div>`;
    }).join('');
  })();

  /* ======================================================================
     14.4.1 — prefix doubling builder
     ====================================================================== */
  (() => {
    const root = $('#saBuilder');
    const list = $('#saList');
    if (!root || !list) return;

    const labels = [
      [1, 2, 1, 1, 3, 2, 1, 2],
      [2, 5, 1, 3, 6, 5, 2, 4],
      [3, 6, 1, 4, 8, 7, 2, 5],
      [3, 6, 1, 4, 8, 7, 2, 5]
    ];
    const pairs = [
      null,
      [[1, 2], [2, 1], [1, 1], [1, 3], [3, 2], [2, 1], [1, 2], [2, 0]],
      [[2, 1], [5, 3], [1, 6], [3, 5], [6, 2], [5, 4], [2, 0], [4, 0]],
      [[3, 8], [6, 7], [1, 2], [4, 5], [8, 0], [7, 0], [2, 0], [5, 0]]
    ];
    const notes = [
      'Round 0 labels single characters: A = 1, B = 2, C = 3. Ties are still unresolved.',
      'Length 2. Each suffix gets a pair (left label, right label); the pairs are ranked into labels 1–6. Some ties remain.',
      'Length 4. All eight labels are unique — the order is now the suffix array.',
      'Length 8. The whole suffixes are compared; the labels and the order no longer change.'
    ];
    const titles = [
      'Round 0 · length 1',
      'Round 1 · length 2',
      'Round 2 · length 4',
      'Round 3 · length 8'
    ];

    const rowEls = [];
    for (let pos = 0; pos < 8; pos++) {
      const row = document.createElement('div');
      row.className = 'ch14-sa-row2';
      row.setAttribute('role', 'listitem');
      row.innerHTML = `<span class="ch14-sa-row2__pos">${pos}</span>
        <span class="ch14-sa-row2__suffix"></span>
        <span class="ch14-sa-row2__pair">–</span>
        <span class="ch14-sa-row2__label">1</span>`;
      list.appendChild(row);
      rowEls.push(row);
    }

    const title = $('#saRoundTitle');
    const note = $('#saNote');
    const orderEl = $('#saOrder');
    const roundBtns = $$('.ch14-round', root);
    let round = 0;

    function orderFor(r) {
      return Array.from({ length: 8 }, (_, i) => i)
        .sort((a, b) => labels[r][a] - labels[r][b] || a - b);
    }

    function render() {
      const order = orderFor(round);
      const head = Math.min(1 << round, 8);
      order.forEach((pos, index) => {
        const row = rowEls[pos];
        row.style.setProperty('--order', index);
        row.classList.toggle('is-first', index === 0);
        const suffix = SA_STRING.slice(pos);
        const headText = suffix.slice(0, head);
        const rest = suffix.slice(head);
        $('.ch14-sa-row2__suffix', row).innerHTML = `<b class="is-head">${headText}</b>${rest}`;
        const pair = pairs[round] ? `(${pairs[round][pos][0]}, ${pairs[round][pos][1]})` : '–';
        $('.ch14-sa-row2__pair', row).textContent = pair;
        $('.ch14-sa-row2__label', row).textContent = labels[round][pos];
        row.setAttribute('aria-label', `Suffix starting at ${pos}, ${suffix}, label ${labels[round][pos]}`);
      });
      if (title) title.textContent = titles[round];
      if (note) note.textContent = notes[round];
      if (orderEl) orderEl.textContent = 'order: ' + order.join(' ');
      roundBtns.forEach((b) => {
        const on = Number(b.dataset.round) === round;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
    }

    roundBtns.forEach((b) => {
      b.addEventListener('click', () => {
        round = Number(b.dataset.round);
        render();
      });
    });

    render();
  })();

  /* ======================================================================
     14.4.2 — searching with the suffix array
     ====================================================================== */
  (() => {
    const root = $('#saSearch');
    const grid = $('#saSearchGrid');
    if (!root || !grid) return;

    const steps = [
      {
        pattern: '', lo: 0, hi: 7,
        note: 'Every suffix is a candidate. Read the first character of the pattern.',
        title: 'Range [0, 7] · the whole array'
      },
      {
        pattern: 'B', lo: 4, hi: 6,
        note: 'After B: binary search narrows the candidates to indices 4–6 — the suffixes that begin with B.',
        title: 'Range [4, 6] · suffixes beginning with B'
      },
      {
        pattern: 'BA', lo: 5, hi: 6,
        note: 'After A: only indices 5 and 6 begin with BA. Their positions are 1 and 5.',
        title: 'Range [5, 6] · two occurrences'
      }
    ];

    grid.innerHTML = SA.map((pos, i) =>
      `<div class="ch14-search__cell" data-i="${i}">
        <b>${pos}</b><span>${SA_STRING.slice(pos)}</span>
      </div>`
    ).join('');

    const cells = $$('.ch14-search__cell', grid);
    const title = $('#saSearchTitle');
    const note = $('#saSearchNote');
    const result = $('#saSearchResult');
    const stepBtn = $('#saSearchStep');
    const resetBtn = $('#saSearchReset');
    let step = 0;

    function render() {
      const st = steps[step];
      cells.forEach((cell, i) => {
        const inside = i >= st.lo && i <= st.hi;
        cell.classList.toggle('is-in', inside);
        cell.classList.toggle('is-out', !inside);
        cell.classList.toggle('is-hit', step === 2 && inside);
      });
      if (title) title.textContent = st.title;
      if (note) note.textContent = st.note;
      if (result) {
        if (step === 0) {
          result.innerHTML = '<span>range <b>[0, 7]</b> · 8 candidates</span>';
        } else if (step === 1) {
          result.innerHTML = '<span>range <b>[4, 6]</b> · 3 candidates</span>';
        } else {
          result.innerHTML = '<span>range <b>[5, 6]</b></span>' +
            '<span class="ch14-search__hit">sa[5] = 1</span>' +
            '<span class="ch14-search__hit">sa[6] = 5</span>';
        }
      }
      if (stepBtn) {
        stepBtn.disabled = step === steps.length - 1;
        stepBtn.innerHTML = step === 0
          ? 'Read B <svg class="icon"><use href="#i-arrow"/></svg>'
          : step === 1
            ? 'Read A <svg class="icon"><use href="#i-arrow"/></svg>'
            : 'Done <svg class="icon"><use href="#i-check"/></svg>';
      }
    }

    if (stepBtn) stepBtn.addEventListener('click', () => {
      step = Math.min(step + 1, steps.length - 1);
      render();
    });
    if (resetBtn) resetBtn.addEventListener('click', () => {
      step = 0;
      render();
    });

    render();
  })();

  /* ======================================================================
     14.4.3 — LCP array
     ====================================================================== */
  (() => {
    const list = $('#lcpList');
    if (!list) return;
    const values = [1, 2, 1, 0, 1, 2, 0, null];
    list.innerHTML = SA.map((pos, i) => {
      const suffix = SA_STRING.slice(pos);
      const next = i < SA.length - 1 ? SA_STRING.slice(SA[i + 1]) : null;
      const value = values[i];
      const tip = value === null
        ? 'The last suffix has no LCP value'
        : `LCP(${suffix}, ${next}) = ${value}`;
      return `<div class="ch14-lcp__row" tabindex="0" data-tip="${tip}">
        <span class="ch14-lcp__suffix">${suffix}</span>
        <span class="ch14-lcp__bar"><span class="ch14-lcp__fill" style="--w:${value === null ? 0 : value * 50}%"></span></span>
        <span class="ch14-lcp__val">${value === null ? '–' : value}</span>
      </div>`;
    }).join('');

    CP.onVisible(list, () => list.classList.add('is-inview'), { threshold: 0.35 });

    const answer = $('#distinctAnswer');
    if (answer && !reduceMotion) {
      answer.textContent = '0';
      CP.onVisible(answer, () => CP.countUp(answer, 29, 1100), { threshold: 0.6 });
    }
  })();

  /* ======================================================================
     code cards
     ====================================================================== */
  (() => {
    const cards = $$('[data-code-card]');
    if (!cards.length) return;

    const hashCpp = {
      label: 'C++', file: 'hash.cpp', type: 'O(n) build · O(1) query', pre: true,
      note: 'Two arrays: prefix hashes h and powers p. The lambda returns the hash of s[a..b].',
      keywords: ['const', 'auto', 'for', 'return', 'if', 'using', 'namespace', 'int', 'long', 'long long', 'string', 'vector'],
      types: ['int', 'long long', 'string', 'vector', 'char'],
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        '',
        'const long long A = 911382323;',
        'const long long B = 972663749;',
        '',
        'int main() {',
        '    string s;',
        '    cin >> s;',
        '    int n = s.size();',
        '',
        '    vector<long long> h(n), p(n);',
        '    h[0] = s[0];',
        '    p[0] = 1;',
        '    for (int i = 1; i < n; i++) {',
        '        h[i] = (h[i - 1] * A + s[i]) % B;',
        '        p[i] = (p[i - 1] * A) % B;',
        '    }',
        '',
        '    auto get = [&](int a, int b) {',
        '        if (a == 0) return h[b];',
        '        return (h[b] - h[a - 1] * p[b - a + 1] % B + B) % B;',
        '    };',
        '',
        '    cout << get(0, n - 1) << "\\n";',
        '}'
      ]
    };
    const hashPy = {
      label: 'Python', file: 'hash.py', type: 'O(n) build · O(1) query',
      note: 'Python integers do not overflow, so the same scheme works without a fixed-width type.',
      keywords: ['for', 'in', 'range', 'def', 'return', 'if', 'print'],
      types: ['str', 'int', 'list'],
      code: [
        's = input()',
        'A, B = 911382323, 972663749',
        'n = len(s)',
        '',
        'h = [0] * n',
        'p = [1] * n',
        'h[0] = ord(s[0])',
        'for i in range(1, n):',
        '    h[i] = (h[i - 1] * A + ord(s[i])) % B',
        '    p[i] = p[i - 1] * A % B',
        '',
        'def get(a, b):',
        '    if a == 0:',
        '        return h[b]',
        '    return (h[b] - h[a - 1] * p[b - a + 1]) % B',
        '',
        'print(get(0, n - 1))'
      ]
    };

    const zCpp = {
      label: 'C++', file: 'z.cpp', type: 'O(n)', pre: true,
      note: 'Scenario 2 copies z[k − x]; the other two extend the box from y + 1.',
      keywords: ['vector', 'int', 'for', 'if', 'else', 'continue', 'while', 'return', 'string'],
      types: ['int', 'vector', 'string', 'bool'],
      code: [
        'vector<int> z_function(const string& s) {',
        '    int n = s.size();',
        '    vector<int> z(n);',
        '    int x = 0, y = 0;',
        '',
        '    for (int k = 1; k < n; k++) {',
        '        if (y < k) {',
        '            // scenario 1: no box covers k',
        '        } else if (k + z[k - x] <= y) {',
        '            z[k] = z[k - x];   // scenario 2',
        '            continue;',
        '        } else {',
        '            z[k] = y - k + 1;  // scenario 3',
        '        }',
        '',
        '        while (k + z[k] < n && s[z[k]] == s[k + z[k]]) {',
        '            z[k]++;',
        '        }',
        '        if (k + z[k] - 1 > y) {',
        '            x = k;',
        '            y = k + z[k] - 1;',
        '        }',
        '    }',
        '    return z;',
        '}'
      ]
    };
    const zPy = {
      label: 'Python', file: 'z.py', type: 'O(n)',
      note: 'The same three scenarios, written as one loop.',
      keywords: ['def', 'for', 'in', 'range', 'if', 'elif', 'else', 'while', 'return', 'continue'],
      types: ['list', 'int', 'str'],
      code: [
        'def z_function(s):',
        '    n = len(s)',
        '    z = [0] * n',
        '    x = y = 0',
        '',
        '    for k in range(1, n):',
        '        if y < k:',
        '            pass                  # scenario 1',
        '        elif k + z[k - x] <= y:',
        '            z[k] = z[k - x]       # scenario 2',
        '            continue',
        '        else:',
        '            z[k] = y - k + 1      # scenario 3',
        '',
        '        while k + z[k] < n and s[z[k]] == s[k + z[k]]:',
        '            z[k] += 1',
        '        if k + z[k] - 1 > y:',
        '            x, y = k, k + z[k] - 1',
        '',
        '    return z'
      ]
    };

    const configs = [
      { storageKey: 'gtcp-lang-ch14-hash', langs: { cpp: hashCpp, python: hashPy } },
      { storageKey: 'gtcp-lang-ch14-z', langs: { cpp: zCpp, python: zPy } }
    ];

    cards.forEach((card, i) => {
      const config = configs[Math.min(i, configs.length - 1)];
      CP.mountCodeCard(card, {
        storageKey: config.storageKey,
        order: ['cpp', 'python'],
        initial: 'cpp',
        langs: config.langs
      });
    });
  })();
})();

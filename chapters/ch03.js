/* Chapter 03 — Efficiency */
(() => {
  const { $, $$, fmt } = CP;
  const NS = 'http://www.w3.org/2000/svg';

  /* ==========================================================
     Growth lab — log–log chart + n slider
     ========================================================== */
  const lab = $('#growthLab');
  if (lab) {
    const svg = $('#ch03Chart');
    const range = $('#ch03Range');
    const nOut = $('#ch03N');
    const opsOut = $('#ch03Ops');
    const timeOut = $('#ch03Time');
    const verdictOut = $('#ch03Verdict');
    const pickOut = $('#ch03Pick');
    const picks = $$('.ch03-pick', lab);
    const presets = $$('.ch03-preset', lab);
    const mobileBars = $('#ch03MobileBars');

    if (svg && range && nOut && opsOut && timeOut && verdictOut && pickOut) {
      const W = 720;
      const H = 420;
      const PAD = { l: 56, r: 70, t: 26, b: 46 };
      const X0 = 1;
      const X1 = 9;
      const Y0 = 0;
      const Y1 = 15;
      const plotW = W - PAD.l - PAD.r;
      const plotH = H - PAD.t - PAD.b;

      const xPos = (lx) => PAD.l + ((lx - X0) / (X1 - X0)) * plotW;
      const yPos = (ly) => H - PAD.b - ((ly - Y0) / (Y1 - Y0)) * plotH;

      const classes = [
        { key: 'one', label: 'O(1)', log: () => 0, ops: () => 1 },
        { key: 'log', label: 'O(log n)', log: (n) => Math.log10(Math.max(1, Math.log2(n))), ops: (n) => Math.log2(n) },
        { key: 'sqrt', label: 'O(√n)', log: (n) => 0.5 * Math.log10(n), ops: (n) => Math.sqrt(n) },
        { key: 'n', label: 'O(n)', log: (n) => Math.log10(n), ops: (n) => n },
        { key: 'nlogn', label: 'O(n log n)', log: (n) => Math.log10(n) + Math.log10(Math.max(1, Math.log2(n))), ops: (n) => n * Math.log2(n) },
        { key: 'n2', label: 'O(n²)', log: (n) => 2 * Math.log10(n), ops: (n) => n * n },
        { key: 'n3', label: 'O(n³)', log: (n) => 3 * Math.log10(n), ops: (n) => n * n * n },
        { key: '2n', label: 'O(2ⁿ)', log: (n) => n * Math.log10(2), ops: (n) => Math.pow(2, n) }
      ];

      const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', ',': ',' };
      const sup = (n) => String(n).split('').map((c) => SUP[c] || c).join('');

      function sci(log10v) {
        const exp = Math.floor(log10v);
        const mant = Math.pow(10, log10v - exp);
        if (exp >= 1000) return '10' + sup(fmt(exp));
        return `${mant.toFixed(1)} × 10${sup(exp)}`;
      }

      function opsText(log10v, value) {
        if (log10v <= 0) return '1';
        if (log10v < 2) return value.toFixed(1);
        if (log10v < 13) return fmt(Math.round(value));
        return sci(log10v);
      }

      function timeText(log10v) {
        if (log10v > 22) return 'practically forever';
        const sLog = log10v - 8;
        if (sLog < -3) return 'less than a millisecond';
        if (sLog < 0) {
          const ms = Math.pow(10, sLog) * 1000;
          return `${ms < 1 ? ms.toFixed(2) : ms.toFixed(1)} ms`;
        }
        const s = Math.pow(10, sLog);
        if (s < 1) return `${s.toFixed(2)} s`;
        if (s < 60) return `${s.toFixed(s < 10 ? 2 : 1)} s`;
        if (s < 3600) return `${(s / 60).toFixed(1)} min`;
        if (s < 86400) return `${(s / 3600).toFixed(1)} hours`;
        if (s < 31557600) return `${(s / 86400).toFixed(1)} days`;
        const years = s / 31557600;
        if (years < 1e6) return `${fmt(Math.round(years))} years`;
        return `≈ 10${sup(Math.floor(Math.log10(years)))} years`;
      }

      function verdictText(log10v) {
        if (log10v <= 8) return 'Fits a one-second limit with room to spare.';
        if (log10v <= 9) return 'Close to a one-second limit.';
        if (log10v <= 10) return 'A few seconds — likely too slow.';
        return 'Far beyond a one-second limit.';
      }

      /* compact count for the small-screen bar ladder */
      function compactOps(log10v) {
        if (!isFinite(log10v)) return '—';
        if (log10v < 0) return '1';
        if (log10v >= 12) return '10¹²⁺';
        if (log10v < 1) return String(Math.max(1, Math.round(Math.pow(10, log10v))));
        const exp = Math.floor(log10v);
        const mant = Math.pow(10, log10v - exp);
        if (exp < 3) return fmt(Math.round(Math.pow(10, log10v)));
        return `${mant >= 9.95 ? '1' : mant.toFixed(1)} × 10${sup(exp)}`;
      }

      const el = (tag, attrs = {}, text) => {
        const node = document.createElementNS(NS, tag);
        Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
        if (text != null) node.textContent = text;
        return node;
      };

      const grid = el('g');
      const axis = el('g');
      const curves = el('g');
      const labels = el('g');
      const marker = el('g');
      svg.append(grid, axis, curves, labels, marker);

      // grid and axes
      for (let d = 1; d <= 9; d++) {
        grid.appendChild(el('line', { x1: xPos(d), y1: yPos(0), x2: xPos(d), y2: yPos(Y1), class: 'ch03-grid-line' }));
      }
      for (let v = 0; v <= 15; v += 3) {
        grid.appendChild(el('line', { x1: xPos(1), y1: yPos(v), x2: xPos(9), y2: yPos(v), class: 'ch03-grid-line' }));
      }
      axis.appendChild(el('line', { x1: xPos(1), y1: yPos(0), x2: xPos(9), y2: yPos(0), class: 'ch03-axis-line' }));
      axis.appendChild(el('line', { x1: xPos(1), y1: yPos(0), x2: xPos(1), y2: yPos(Y1), class: 'ch03-axis-line' }));

      [1, 3, 6, 9].forEach((d) => {
        axis.appendChild(el('text', {
          x: xPos(d), y: H - PAD.b + 17, 'text-anchor': 'middle', class: 'ch03-axis-label'
        }, d === 1 ? '10' : `10${sup(d)}`));
      });
      [0, 3, 6, 9, 12, 15].forEach((v) => {
        axis.appendChild(el('text', {
          x: PAD.l - 9, y: yPos(v), 'text-anchor': 'end', 'dominant-baseline': 'middle', class: 'ch03-axis-label'
        }, v === 0 ? '1' : `10${sup(v)}`));
      });
      axis.appendChild(el('text', { x: PAD.l, y: 13, class: 'ch03-axis-title' }, 'operations'));
      axis.appendChild(el('text', { x: W - PAD.r, y: H - 8, 'text-anchor': 'end', class: 'ch03-axis-title' }, 'input size n'));

      // one-second budget
      const budget = el('line', { x1: xPos(1), y1: yPos(8), x2: xPos(9), y2: yPos(8), class: 'ch03-budget' });
      const budgetLabel = el('text', {
        x: xPos(9) - 2, y: yPos(8) - 7, 'text-anchor': 'end', class: 'ch03-budget-label'
      }, '1 s budget · 10⁸ ops (est.)');
      axis.append(budget, budgetLabel);

      // curves
      const curveEls = {};
      const labelEls = {};
      const dotEls = {};

      classes.forEach((cls) => {
        let d = '';
        let prevLx = X0;
        let prevLy = cls.log(Math.pow(10, X0));
        for (let i = 0; i <= 260; i++) {
          const lx = X0 + ((X1 - X0) * i) / 260;
          const n = Math.pow(10, lx);
          const ly = cls.log(n);
          if (ly > Y1) {
            if (prevLy <= Y1) {
              const t = (Y1 - prevLy) / (ly - prevLy);
              const crossX = prevLx + (lx - prevLx) * t;
              d += `L${xPos(crossX).toFixed(2)} ${yPos(Y1).toFixed(2)}`;
            }
            break;
          }
          if (ly >= 0) {
            d += (d ? 'L' : 'M') + xPos(lx).toFixed(2) + ' ' + yPos(ly).toFixed(2);
          }
          prevLx = lx;
          prevLy = ly;
        }
        const path = el('path', { d, class: 'ch03-curve', 'data-curve': cls.key });
        curves.appendChild(path);
        curveEls[cls.key] = path;

        // label at the right edge, or where the curve leaves the chart
        let labelX;
        let labelY;
        const endLy = cls.log(1e9);
        if (endLy > Y1) {
          let lo = X0;
          let hi = X1;
          for (let i = 0; i < 40; i++) {
            const mid = (lo + hi) / 2;
            if (cls.log(Math.pow(10, mid)) > Y1) hi = mid;
            else lo = mid;
          }
          labelX = xPos(hi) + 7;
          labelY = yPos(Y1) + 14;
        } else {
          labelX = xPos(X1) + 7;
          labelY = Math.min(yPos(endLy), yPos(0) - 8);
        }
        const label = el('text', {
          x: labelX, y: labelY, 'dominant-baseline': 'middle', class: 'ch03-curve-label', 'data-label': cls.key
        }, cls.label);
        labels.appendChild(label);
        labelEls[cls.key] = label;

        // marker dot, positioned on update
        const dot = el('circle', { r: 2.4, class: 'ch03-marker-dot', 'data-dot': cls.key });
        marker.appendChild(dot);
        dotEls[cls.key] = dot;
      });

      const markerLine = el('line', { y1: yPos(Y1), y2: yPos(0), class: 'ch03-marker' });
      marker.insertBefore(markerLine, marker.firstChild);

      // small-screen alternative: one bar per class on a fixed log axis
      const mbarEls = {};
      if (mobileBars) {
        const cap = document.createElement('div');
        cap.className = 'ch03-mobilebars__cap';
        cap.innerHTML = '<span>operations · fixed log scale</span><span><i>10⁸</i> mark</span>';
        mobileBars.appendChild(cap);
        classes.forEach((cls) => {
          const row = document.createElement('div');
          row.className = 'ch03-mbar';
          row.dataset.key = cls.key;
          row.innerHTML = '<span class="ch03-mbar__sym"></span>'
            + '<span class="ch03-mbar__track"><span class="ch03-mbar__fill"></span></span>'
            + '<span class="ch03-mbar__val"></span>';
          row.querySelector('.ch03-mbar__sym').textContent = cls.label;
          mobileBars.appendChild(row);
          mbarEls[cls.key] = {
            row,
            fill: row.querySelector('.ch03-mbar__fill'),
            val: row.querySelector('.ch03-mbar__val')
          };
        });
      }

      let selected = 'n2';

      function setSelected(key) {
        if (!curveEls[key]) return;
        selected = key;
        picks.forEach((btn) => {
          const on = btn.dataset.class === key;
          btn.classList.toggle('is-active', on);
          btn.setAttribute('aria-pressed', String(on));
        });
        Object.entries(curveEls).forEach(([k, p]) => p.classList.toggle('ch03-curve--on', k === key));
        Object.entries(labelEls).forEach(([k, p]) => p.classList.toggle('ch03-curve-label--on', k === key));
        update();
      }

      function update() {
        const e = parseFloat(range.value);
        const n = Math.max(10, Math.round(Math.pow(10, e)));
        const lx = Math.log10(n);
        const nText = fmt(n);
        nOut.textContent = nText;
        range.setAttribute('aria-valuetext', 'n equals ' + nText);
        range.style.background = `linear-gradient(to right, var(--ink) 0%, var(--ink) ${((e - 1) / 8) * 100}%, var(--line) ${((e - 1) / 8) * 100}%, var(--line) 100%)`;

        presets.forEach((p) => p.classList.toggle('is-active', Math.abs(parseFloat(p.dataset.n) - e) < 0.005));

        markerLine.setAttribute('x1', xPos(lx));
        markerLine.setAttribute('x2', xPos(lx));

        classes.forEach((cls) => {
          const ly = cls.log(n);
          const dot = dotEls[cls.key];
          if (ly < 0 || ly > Y1 || !isFinite(ly)) {
            dot.setAttribute('opacity', '0');
            return;
          }
          dot.setAttribute('opacity', '1');
          dot.setAttribute('cx', xPos(lx));
          dot.setAttribute('cy', yPos(ly));
          const on = cls.key === selected;
          dot.setAttribute('r', on ? 4.2 : 2.3);
          dot.setAttribute('class', on
            ? (ly > 8 ? 'ch03-marker-dot ch03-marker-dot--on ch03-marker-dot--over' : 'ch03-marker-dot ch03-marker-dot--on')
            : 'ch03-marker-dot');
        });

        const cls = classes.find((c) => c.key === selected) || classes[5];
        const log10v = cls.log(n);
        const value = cls.ops(n);
        pickOut.textContent = cls.label;
        opsOut.textContent = opsText(log10v, value);
        const time = timeText(log10v);
        timeOut.textContent = /^(less than|practically)/.test(time) ? time : '≈ ' + time;
        verdictOut.textContent = verdictText(log10v);

        if (mobileBars) {
          classes.forEach((item) => {
            const ly = item.log(n);
            const target = mbarEls[item.key];
            const width = Math.max(2, Math.min(100, (Math.max(0, ly) / 12) * 100));
            target.fill.style.setProperty('--w', width.toFixed(2) + '%');
            target.val.textContent = compactOps(ly);
            target.row.classList.toggle('is-on', item.key === selected);
          });
        }
      }

      range.addEventListener('input', update);
      presets.forEach((p) => {
        p.addEventListener('click', () => {
          range.value = p.dataset.n;
          update();
        });
      });
      picks.forEach((btn) => btn.addEventListener('click', () => setSelected(btn.dataset.class)));

      setSelected('n2');
    }
  }

  /* ==========================================================
     q(n) chart — log / linear height toggle
     ========================================================== */
  const qwrap = $('.ch03-qwrap');
  if (qwrap) {
    const qButtons = $$('.ch03-qscale__btn', qwrap);
    const setScale = (scale) => {
      qwrap.dataset.scale = scale;
      qButtons.forEach((btn) => {
        const on = btn.dataset.qscale === scale;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', String(on));
      });
    };
    qButtons.forEach((btn) => btn.addEventListener('click', () => setScale(btn.dataset.qscale)));
  }

  /* ==========================================================
     Code card — three solutions to maximum subarray sum
     ========================================================== */
  const codeRoot = $('[data-code-card]');
  if (codeRoot) {
    CP.mountCodeCard(codeRoot, {
      storageKey: 'gtcp-sols-ch03',
      order: ['naive', 'quadratic', 'linear'],
      initial: 'naive',
      langs: {
        naive: {
          label: 'Naive · O(n³)',
          file: 'subarray_naive.cpp',
          type: 'O(n³)',
          note: 'Three nested loops: every subarray, summed from scratch.',
          keywords: ['for', 'int', 'cout'],
          types: ['int'],
          code: [
            'int best = 0;',
            'for (int a = 0; a < n; a++) {',
            '  for (int b = a; b < n; b++) {',
            '    int sum = 0;',
            '    for (int k = a; k <= b; k++) {',
            '      sum += array[k];',
            '    }',
            '    best = max(best, sum);',
            '  }',
            '}',
            'cout << best << "\\n";'
          ]
        },
        quadratic: {
          label: 'Running sum · O(n²)',
          file: 'subarray_running.cpp',
          type: 'O(n²)',
          note: 'The running sum removes the innermost loop.',
          keywords: ['for', 'int', 'cout'],
          types: ['int'],
          code: [
            'int best = 0;',
            'for (int a = 0; a < n; a++) {',
            '  int sum = 0;',
            '  for (int b = a; b < n; b++) {',
            '    sum += array[b];',
            '    best = max(best, sum);',
            '  }',
            '}',
            'cout << best << "\\n";'
          ]
        },
        linear: {
          label: 'One pass · O(n)',
          file: 'subarray_linear.cpp',
          type: 'O(n)',
          note: 'The best sum ending at each position is enough.',
          keywords: ['for', 'int', 'cout'],
          types: ['int'],
          code: [
            'int best = 0, sum = 0;',
            'for (int k = 0; k < n; k++) {',
            '  sum = max(array[k], sum + array[k]);',
            '  best = max(best, sum);',
            '}',
            'cout << best << "\\n";'
          ]
        }
      }
    });
  }
})();

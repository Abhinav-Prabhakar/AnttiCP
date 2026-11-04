/* Chapter 04 — Sorting and Searching */
(() => {
  'use strict';
  const { $, $$, clamp } = CP;

  /* ---------- sweep line ---------- */
  const sweepRoot = $('#ch04Sweep');
  if (sweepRoot) {
    const track = $('#ch04SweepTrack');
    const axis = $('#ch04SweepAxis');
    const eventsWrap = $('#ch04SweepEvents');
    const range = $('#ch04SweepRange');
    const countEl = $('#ch04SweepCount');
    const countLabel = $('#ch04SweepCountLabel');
    const readout = $('#ch04SweepReadout');

    const customers = [
      { id: 'A', start: 0, end: 5, row: 0 },
      { id: 'B', start: 2, end: 7, row: 1 },
      { id: 'C', start: 4, end: 9, row: 2 },
      { id: 'D', start: 8, end: 11, row: 3 }
    ];
    const events = [
      { t: 0, type: '+', id: 'A' },
      { t: 2, type: '+', id: 'B' },
      { t: 4, type: '+', id: 'C' },
      { t: 5, type: '-', id: 'A' },
      { t: 7, type: '-', id: 'B' },
      { t: 8, type: '+', id: 'D' },
      { t: 9, type: '-', id: 'C' },
      { t: 11, type: '-', id: 'D' }
    ];
    const span = 11;
    const bars = [];

    if (track) {
      track.removeAttribute('aria-hidden');
      customers.forEach((c) => {
        const bar = document.createElement('span');
        bar.className = 'ch04-sweep-bar';
        bar.style.setProperty('--s', (c.start / span) * 100 + '%');
        bar.style.setProperty('--w', ((c.end - c.start) / span) * 100 + '%');
        bar.style.setProperty('--row', c.row);
        bar.textContent = c.id;
        bar.tabIndex = 0;
        bar.setAttribute('data-tip', `${c.id}: arrives at ${c.start}, leaves at ${c.end}`);
        bar.setAttribute('aria-label', `Customer ${c.id} from ${c.start} to ${c.end}`);
        bars.push(bar);
        track.appendChild(bar);
      });
      const cursor = document.createElement('span');
      cursor.className = 'ch04-sweep-cursor';
      cursor.id = 'ch04SweepCursor';
      track.appendChild(cursor);
    }

    if (axis) {
      for (let i = 0; i <= span; i++) {
        const tick = document.createElement('span');
        tick.textContent = i;
        tick.style.left = (i / span) * 100 + '%';
        axis.appendChild(tick);
      }
    }

    if (eventsWrap) {
      events.forEach((e) => {
        const chip = document.createElement('span');
        chip.className = 'ch04-sweep-event';
        chip.textContent = `${e.type}${e.id} ${e.t}`;
        chip.dataset.time = e.t;
        eventsWrap.appendChild(chip);
      });
    }

    const fmtTime = (t) => {
      const rounded = Math.round(t * 100) / 100;
      return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0$/, '');
    };

    function update(t) {
      const time = clamp(Number(t) || 0, 0, span);
      const active = customers.filter((c) => c.start <= time && time < c.end);
      if (countEl) countEl.textContent = String(active.length);
      if (countLabel) countLabel.textContent = `inside at ${fmtTime(time)}`;
      bars.forEach((bar) => {
        bar.classList.toggle('is-active', active.some((c) => c.id === bar.textContent));
      });
      const cursor = $('#ch04SweepCursor');
      if (cursor) cursor.style.left = (time / span) * 100 + '%';
      $$('.ch04-sweep-event', eventsWrap).forEach((chip) => {
        const et = Number(chip.dataset.time);
        chip.classList.toggle('is-past', et <= time);
        chip.classList.toggle('is-now', Math.abs(et - time) < 0.13);
      });
      if (readout) {
        const ids = active.map((c) => c.id);
        const list = ids.length === 0
          ? 'no customers'
          : ids.length === 1
            ? ids[0]
            : ids.slice(0, -1).join(', ') + ' and ' + ids[ids.length - 1];
        readout.innerHTML = `At <b>${fmtTime(time)}</b>: ${list} ${active.length === 1 ? 'is' : 'are'} inside. The maximum is <b>3</b>.`;
      }
      if (range) range.setAttribute('aria-valuetext', `${fmtTime(time)}: ${active.length} customers inside`);
    }

    if (range) {
      range.addEventListener('input', () => update(range.value));
      update(range.value);
    } else {
      update(4.5);
    }
  }

  /* ---------- binary search stepper ---------- */
  const bsRoot = $('#ch04BS');
  if (bsRoot) {
    const array = [2, 5, 9, 14, 18, 21, 25, 28, 32, 36, 44, 50];
    const arrayEl = $('#ch04BSArray');
    const logEl = $('#ch04BSLog');
    const messageEl = $('#ch04BSMessage');
    const progressEl = $('#ch04BSProgress');
    const stepBtn = $('#ch04BSStep');
    const backBtn = $('#ch04BSBack');
    const resetBtn = $('#ch04BSReset');
    const targetButtons = $$('.ch04-bs-target', bsRoot);
    let target = 44;
    let frames = [];
    let index = 0;

    const cells = [];
    if (arrayEl) {
      array.forEach((value, i) => {
        const cell = document.createElement('div');
        cell.className = 'ch04-bs-cell';
        cell.setAttribute('role', 'listitem');
        cell.setAttribute('aria-label', `Index ${i}, value ${value}`);
        cell.innerHTML = `<span class="ch04-bs-val">${value}</span><span class="ch04-bs-idx">${i}</span><span class="ch04-bs-tag"></span>`;
        arrayEl.appendChild(cell);
        cells.push(cell);
      });
    }

    function buildFrames(x) {
      const out = [];
      let lo = 0;
      let hi = array.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const value = array[mid];
        const status = value === x ? 'found' : value < x ? 'right' : 'left';
        out.push({ lo, hi, mid, value, status });
        if (status === 'found') break;
        if (status === 'right') lo = mid + 1;
        else hi = mid - 1;
      }
      if (!out.length || out[out.length - 1].status !== 'found') {
        out.push({ lo, hi, mid: null, value: null, status: 'miss' });
      }
      return out;
    }

    function render() {
      const frame = frames[index];
      if (!frame) return;
      cells.forEach((cell, i) => {
        const out = i < frame.lo || i > frame.hi;
        const isMid = i === frame.mid;
        const isFound = isMid && frame.status === 'found';
        cell.classList.toggle('is-out', out);
        cell.classList.toggle('is-mid', isMid);
        cell.classList.toggle('is-found', isFound);
        const tag = cell.querySelector('.ch04-bs-tag');
        if (tag) {
          if (frame.status === 'miss') {
            tag.textContent = '';
          } else {
            const parts = [];
            if (i === frame.lo) parts.push('lo');
            if (i === frame.hi) parts.push('hi');
            if (isMid) parts.push(isFound ? 'found' : 'mid');
            tag.textContent = parts.join(' ');
          }
        }
      });

      const probes = frames.filter((f) => f.mid !== null).length;
      if (progressEl) {
        progressEl.textContent = frame.status === 'miss'
          ? `${probes} probes · not found`
          : `probe ${Math.min(index + 1, probes)} / ${probes}`;
      }

      if (messageEl) {
        if (frame.status === 'found') {
          messageEl.textContent = `a[${frame.mid}] = ${frame.value} = ${target}. Found at index ${frame.mid}.`;
        } else if (frame.status === 'miss') {
          messageEl.textContent = `lo = ${frame.lo} > hi = ${frame.hi}. ${target} is not in the array.`;
        } else {
          const side = frame.status === 'right' ? 'right' : 'left';
          const relation = frame.value < target ? '<' : '>';
          messageEl.textContent = `a[${frame.mid}] = ${frame.value} ${relation} ${target}. Search the ${side} half.`;
        }
      }

      if (logEl) {
        const rows = [];
        frames.slice(0, index + 1).forEach((f, i) => {
          if (f.mid === null) {
            rows.push(`<li class="${i === index ? 'is-current' : ''}"><span>${i + 1}</span><span>lo &gt; hi · ${target} not found</span></li>`);
          } else {
            const relation = f.status === 'found' ? '=' : f.status === 'right' ? '<' : '>';
            rows.push(`<li class="${i === index ? 'is-current' : ''}"><span>${i + 1}</span><span>a[${f.mid}] = ${f.value} ${relation} ${target} · range ${f.lo}–${f.hi}</span></li>`);
          }
        });
        logEl.innerHTML = rows.join('');
      }

      if (stepBtn) {
        stepBtn.disabled = index >= frames.length - 1;
        stepBtn.style.opacity = stepBtn.disabled ? '.45' : '';
      }
      if (backBtn) {
        backBtn.disabled = index === 0;
        backBtn.style.opacity = backBtn.disabled ? '.45' : '';
      }
    }

    function setTarget(next) {
      target = next;
      frames = buildFrames(target);
      index = 0;
      targetButtons.forEach((b) => {
        const on = Number(b.dataset.target) === target;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      render();
    }

    targetButtons.forEach((b) => {
      b.addEventListener('click', () => setTarget(Number(b.dataset.target)));
    });
    if (stepBtn) stepBtn.addEventListener('click', () => {
      if (index < frames.length - 1) {
        index++;
        render();
      }
    });
    if (backBtn) backBtn.addEventListener('click', () => {
      if (index > 0) {
        index--;
        render();
      }
    });
    if (resetBtn) resetBtn.addEventListener('click', () => {
      index = 0;
      render();
    });

    setTarget(44);
  }

  /* ---------- answer-space explorer ---------- */
  const answerRoot = $('#ch04Answer');
  if (answerRoot) {
    const line = $('#ch04AnswerLine');
    const probes = $('#ch04AnswerProbes');
    const readout = $('#ch04AnswerReadout');
    const p = [2, 3, 7];
    const jobs = 8;
    let active = null;
    const cells = [];

    if (line) {
      for (let x = 0; x <= 12; x++) {
        const cell = document.createElement('span');
        cell.className = 'ch04-answer-cell';
        cell.textContent = x;
        if (x >= 9) cell.classList.add('is-true');
        if (x === 9) {
          cell.classList.add('is-boundary');
          cell.tabIndex = 0;
          cell.setAttribute('data-tip', 'valid(9) is the first true value: 4 + 3 + 1 = 8 jobs.');
          cell.setAttribute('aria-label', 'Boundary at 9: first true value');
        }
        line.appendChild(cell);
        cells.push(cell);
      }
    }

    function check(x) {
      const counts = p.map((pi) => Math.floor(x / pi));
      const total = counts.reduce((a, b) => a + b, 0);
      return { counts, total, valid: total >= jobs };
    }

    function select(x) {
      active = x;
      const result = check(x);
      cells.forEach((cell, i) => cell.classList.toggle('is-active', i === x));
      $$('.ch04-answer-probe', probes).forEach((b) => b.classList.toggle('is-active', Number(b.dataset.x) === x));
      if (readout) {
        const countText = result.counts.join(' + ');
        readout.innerHTML = `valid(${x}) = <b>${result.valid}</b> · ${countText} = ${result.total} jobs; the target is ${jobs}. ${result.valid ? 'The predicate is true from 9 onward.' : 'Still false: at least 9 units are needed.'}`;
      }
    }

    if (probes) {
      [4, 8, 9, 12].forEach((x) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ch04-answer-probe';
        b.dataset.x = x;
        b.textContent = `x = ${x}`;
        b.addEventListener('click', () => select(x));
        probes.appendChild(b);
      });
    }

    select(9);
  }

  /* ---------- code card ---------- */
  const card = $('[data-code-card]');
  if (card) {
    CP.mountCodeCard(card, {
      storageKey: 'gtcp-lang-ch04',
      order: ['cpp', 'python'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++',
          file: 'binary_search.cpp',
          type: 'O(log n)',
          note: 'The active range is a…b. One comparison discards half of what remains.',
          keywords: ['while', 'if', 'else', 'break', 'return', 'int', 'bool'],
          types: ['int', 'long long', 'bool'],
          code: [
            'int a = 0, b = n-1;',
            'while (a <= b) {',
            '    int k = (a+b)/2;',
            '    if (array[k] == x) {',
            '        // x found at index k',
            '        break;',
            '    }',
            '    if (array[k] < x) a = k+1;',
            '    else b = k-1;',
            '}'
          ]
        },
        python: {
          label: 'Python',
          file: 'binary_search.py',
          type: 'O(log n)',
          note: 'The same halving, written with two indices and integer division.',
          keywords: ['while', 'if', 'else', 'break', 'in', 'and', 'or', 'not', 'return', 'def'],
          types: ['int', 'list', 'bool'],
          code: [
            'a = 0',
            'b = len(array) - 1',
            'while a <= b:',
            '    k = (a + b) // 2',
            '    if array[k] == x:',
            '        # x found at index k',
            '        break',
            '    if array[k] < x:',
            '        a = k + 1',
            '    else:',
            '        b = k - 1'
          ]
        }
      }
    });
  }
})();

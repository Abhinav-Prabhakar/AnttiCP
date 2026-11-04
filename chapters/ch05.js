/* Chapter 05 — Data Structures */
(() => {
  'use strict';
  const { $, $$, onVisible, reduceMotion } = CP;

  /* ==========================================================================
     Vector growth simulator
     ========================================================================== */
  const vectorRoot = $('#ch05Vector');
  if (vectorRoot) {
    const cellsEl = $('#ch05VecCells');
    const sizeEl = $('#ch05VecSize');
    const capEl = $('#ch05VecCap');
    const reallocEl = $('#ch05VecRealloc');
    const copiesEl = $('#ch05VecCopies');
    const footEl = $('#ch05VecFoot');
    const noteEl = $('#ch05VecNote');
    const pushBtn = $('#ch05VecPush');
    const popBtn = $('#ch05VecPop');
    const resetBtn = $('#ch05VecReset');

    const stream = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7];
    const state = {
      size: 0,
      cap: 1,
      reallocations: 0,
      copied: 0,
      cursor: 0,
      items: [],
      flashNew: -1,
      copyFlash: false
    };
    let copyTimer = null;

    function plural(n, word) {
      return `${n} ${word}${n === 1 ? '' : 's'}`;
    }

    function setNote(html, copy) {
      if (!noteEl) return;
      noteEl.innerHTML = html;
      noteEl.classList.toggle('is-copy', Boolean(copy));
    }

    function draw() {
      if (!cellsEl) return;
      cellsEl.style.setProperty('--cap', String(state.cap));
      cellsEl.innerHTML = '';
      for (let i = 0; i < state.cap; i++) {
        const cell = document.createElement('span');
        cell.className = 'ch05-vcell';
        if (i < state.size) {
          cell.textContent = String(state.items[i]);
          if (i === state.size - 1) cell.classList.add('is-last');
          if (i === state.flashNew) cell.classList.add('is-new');
          if (state.copyFlash) cell.classList.add('is-copied');
        } else {
          cell.classList.add('is-empty');
          cell.setAttribute('aria-hidden', 'true');
        }
        cellsEl.appendChild(cell);
      }

      if (sizeEl) sizeEl.textContent = String(state.size);
      if (capEl) capEl.textContent = String(state.cap);
      if (reallocEl) reallocEl.textContent = String(state.reallocations);
      if (copiesEl) copiesEl.textContent = String(state.copied);
      if (footEl) footEl.textContent = `capacity ${state.cap} · size ${state.size}`;

      if (pushBtn) {
        const exhausted = state.cursor >= stream.length;
        pushBtn.disabled = exhausted;
        pushBtn.style.opacity = exhausted ? '.45' : '';
        pushBtn.setAttribute('aria-label', exhausted ? 'All values pushed — reset to replay' : 'Append the next value');
      }

      state.flashNew = -1;
      state.copyFlash = false;

      if (copyTimer) clearTimeout(copyTimer);
      if (cellsEl.querySelector('.ch05-vcell.is-copied')) {
        copyTimer = setTimeout(() => {
          $$('.ch05-vcell.is-copied', cellsEl).forEach((cell) => cell.classList.remove('is-copied'));
        }, 650);
      }
    }

    function push() {
      if (state.cursor >= stream.length) {
        setNote('All 14 values have been pushed. <b>Reset</b> to replay the doubling.');
        return;
      }

      let copiedNow = 0;
      let oldCap = state.cap;
      if (state.size === state.cap) {
        state.cap *= 2;
        state.reallocations += 1;
        copiedNow = state.size;
        state.copied += copiedNow;
        state.copyFlash = true;
      }

      const value = stream[state.cursor++];
      state.items.push(value);
      state.size += 1;
      state.flashNew = state.size - 1;
      const last = state.cursor >= stream.length;

      if (copiedNow > 0) {
        setNote(
          `Full at ${oldCap} of ${oldCap}. Capacity doubles to <b>${state.cap}</b> and ${plural(copiedNow, 'element')} ${copiedNow === 1 ? 'is' : 'are'} copied. ` +
          `Cumulative copies: <b>${state.copied}</b>.` +
          (last ? ' That was the last value — reset to replay.' : ''),
          true
        );
      } else if (last) {
        setNote(`push_back(${value}) → size <b>${state.size}</b> of capacity ${state.cap}. All ${stream.length} values are in — reset to replay.`);
      } else {
        const left = state.cap - state.size;
        setNote(
          `push_back(${value}) → size <b>${state.size}</b> of capacity ${state.cap}. ` +
          (left === 0 ? 'The vector is full; the next push will grow it.' : `${plural(left, 'slot')} left before the next copy.`)
        );
      }
      draw();
    }

    function pop() {
      if (state.size === 0) {
        setNote('The vector is empty — <b>pop_back</b> has nothing to remove.');
        return;
      }
      const value = state.items.pop();
      state.size -= 1;
      setNote(`pop_back() removed <b>${value}</b> → size ${state.size}. Capacity stays ${state.cap}: a vector does not shrink.`);
      draw();
    }

    function reset() {
      state.size = 0;
      state.cap = 1;
      state.reallocations = 0;
      state.copied = 0;
      state.cursor = 0;
      state.items = [];
      state.flashNew = -1;
      state.copyFlash = false;
      setNote('An empty vector. Push a few values and watch the capacity double.');
      draw();
    }

    if (pushBtn) pushBtn.addEventListener('click', push);
    if (popBtn) popBtn.addEventListener('click', pop);
    if (resetBtn) resetBtn.addEventListener('click', reset);

    reset();
  }

  /* ==========================================================================
     Experiment chart
     ========================================================================== */
  const expRoot = $('#ch05Exp');
  if (expRoot) {
    const chart = $('#ch05ExpChart');
    const legend = $('#ch05ExpLegend');
    const note = $('#ch05ExpNote');
    const source = $('#ch05ExpSource');
    const yLabel = $('.ch05-exp-y', expRoot);
    const tabs = $$('.ch05-exp-tab', expRoot);

    const experiments = {
      unique: {
        title: 'Unique elements',
        source: 'Book · Table 5.1',
        groups: ['10⁶', '2·10⁶', '4·10⁶', '8·10⁶', '16·10⁶'],
        series: [
          { name: 'set', values: [0.65, 1.50, 3.38, 7.57, 17.35] },
          { name: 'unordered_set', values: [0.34, 0.76, 1.63, 3.45, 7.18] },
          { name: 'sorting', values: [0.11, 0.18, 0.33, 0.68, 1.38] }
        ],
        note: 'At <i>n</i> = 16·10⁶, <b>sorting takes 1.38 s</b> and <b>set takes 17.35 s</b>. Both are <i>O</i>(<i>n</i> log <i>n</i>); the tree does far more work per element than a tight sort over contiguous memory.'
      },
      freq: {
        title: 'Most frequent value',
        source: 'Book · Table 5.2',
        groups: ['10⁶', '2·10⁶', '4·10⁶', '8·10⁶', '16·10⁶'],
        series: [
          { name: 'map', values: [0.55, 1.14, 2.34, 4.68, 9.57] },
          { name: 'unordered_map', values: [0.23, 0.39, 0.73, 1.46, 2.83] },
          { name: 'array', values: [0.01, 0.02, 0.03, 0.06, 0.11] }
        ],
        note: 'At <i>n</i> = 16·10⁶, an <b>array takes 0.11 s</b> against <b>9.57 s for map</b> — almost a hundredfold. <b>unordered_map</b> sits in between at 2.83 s. The keys were small enough for an array to be possible; when they are not, the map is the price of generality.'
      },
      pq: {
        title: 'Priority queue',
        source: 'Book · Table 5.3',
        groups: ['10⁶', '2·10⁶', '4·10⁶', '8·10⁶', '16·10⁶'],
        series: [
          { name: 'multiset', values: [1.17, 2.77, 6.10, 13.96, 30.93] },
          { name: 'priority_queue', values: [0.19, 0.41, 1.05, 2.52, 5.95] }
        ],
        note: 'Repeatedly removing the smallest element: at <i>n</i> = 16·10⁶, <b>priority_queue takes 5.95 s</b> and <b>multiset takes 30.93 s</b>. Both are <i>O</i>(<i>n</i> log <i>n</i>), but the heap only maintains the top, not a full ordering.'
      }
    };

    let active = 'unique';

    if (note) note.setAttribute('aria-live', 'polite');

    function renderLegend(series) {
      if (!legend) return;
      legend.innerHTML = series
        .map((s, i) => `<span><i class="ch05-exp-swatch ch05-exp-swatch--${i + 1}"></i>${s.name}</span>`)
        .join('');
    }

    function render(key) {
      const data = experiments[key];
      if (!data || !chart) return;

      const max = Math.max(...data.series.flatMap((s) => s.values));
      chart.innerHTML = data.groups.map((group, gi) => {
        const rows = data.series.map((s, si) => {
          const value = s.values[gi];
          const pct = Math.max((value / max) * 100, 0.6);
          const tip = `${s.name} · n = ${group} · ${value.toFixed(2)} s`;
          return `
            <div class="ch05-exp-row" tabindex="0" data-tip="${tip}" aria-label="${tip}">
              <span class="ch05-exp-track"><i class="ch05-exp-bar ch05-exp-bar--${si + 1}" style="--w:${pct}%"></i></span>
              <b>${value.toFixed(2)}</b>
            </div>`;
        }).join('');
        return `
          <div class="ch05-exp-group" role="listitem">
            <span class="ch05-exp-n">${group}</span>
            <div class="ch05-exp-bars">${rows}</div>
          </div>`;
      }).join('');

      chart.setAttribute('role', 'list');
      chart.setAttribute('aria-label', `${data.title}: measured seconds for five input sizes, lower is better.`);
      if (yLabel) yLabel.textContent = `seconds · 0–${max.toFixed(2)} s · lower is better`;
      if (source) source.textContent = data.source;
      if (note) note.innerHTML = data.note;
      renderLegend(data.series);
    }

    function choose(key) {
      if (!experiments[key]) return;
      active = key;
      tabs.forEach((tab) => {
        const on = tab.dataset.exp === key;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
      });
      render(key);
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => choose(tab.dataset.exp));
    });
    if (tabs.length) {
      const tabWrap = tabs[0].parentElement;
      if (tabWrap) {
        tabWrap.addEventListener('keydown', (e) => {
          if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
          const current = tabs.indexOf(document.activeElement);
          if (current === -1) return;
          e.preventDefault();
          let next = current;
          if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
          if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
          if (e.key === 'Home') next = 0;
          if (e.key === 'End') next = tabs.length - 1;
          choose(tabs[next].dataset.exp);
          tabs[next].focus();
        });
      }
    }

    choose('unique');

    if (!reduceMotion) {
      onVisible(expRoot, () => expRoot.classList.add('is-in'), { threshold: 0.15 });
    } else {
      expRoot.classList.add('is-in');
    }
  }

  /* ==========================================================================
     Code card
     ========================================================================== */
  const card = $('[data-code-card]');
  if (card) {
    CP.mountCodeCard(card, {
      storageKey: 'gtcp-lang-ch05',
      order: ['cpp', 'python'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++',
          file: 'structures.cpp',
          type: 'O(log n) · O(1) average',
          note: 'set and map keep their keys ordered; priority_queue keeps only the largest. The three prints are 1, 3, and 5.',
          pre: true,
          keywords: ['using', 'namespace', 'int', 'return', 'if', 'else', 'for', 'while', 'true', 'false', 'auto', 'const'],
          types: ['set', 'map', 'priority_queue', 'string', 'vector', 'pair', 'bool'],
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'int main() {',
            '    set<int> s = {3, 2, 5};',
            '    s.insert(4);',
            '    cout << s.count(4) << "\\n";',
            '',
            '    map<string,int> m;',
            '    m["monkey"] = 4;',
            '    m["banana"] = 3;',
            '    cout << m["banana"] << "\\n";',
            '',
            '    priority_queue<int> pq;',
            '    pq.push(3);',
            '    pq.push(5);',
            '    pq.push(2);',
            '    cout << pq.top() << "\\n";',
            '    pq.pop();',
            '}'
          ]
        },
        python: {
          label: 'Python',
          file: 'structures.py',
          type: 'dict · set · heapq',
          note: 'Python’s dict is the map; heapq is a min-heap, so negate the values to keep the largest on top.',
          keywords: ['import', 'from', 'for', 'in', 'print', 'if', 'else', 'while', 'def', 'return', 'not', 'and', 'or', 'True', 'False', 'None'],
          types: ['set', 'dict', 'list', 'int', 'str', 'bool'],
          code: [
            's = {3, 2, 5}',
            's.add(4)',
            'print(4 in s)        # True',
            '',
            'm = {"monkey": 4, "banana": 3}',
            'print(m["banana"])   # 3',
            '',
            'import heapq',
            'pq = []',
            'for x in (3, 5, 2):',
            '    heapq.heappush(pq, -x)',
            'print(-pq[0])        # 5',
            'heapq.heappop(pq)'
          ]
        }
      }
    });
  }
})();

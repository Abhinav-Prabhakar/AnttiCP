/* Chapter 02 — Programming Techniques */
(() => {
  const { $, $$, clamp, reduceMotion } = window.CP;

  /* ==========================================================================
     Code cards
     ========================================================================== */

  const cppTypes = ['int', 'long', 'long long', 'string', 'vector', 'bool', 'char', 'double', 'unsigned', 'size_t', 'pair'];
  const cppKeys = ['using', 'namespace', 'return', 'if', 'else', 'for', 'while', 'void', 'true', 'false', 'continue', 'do', 'break', 'const', 'auto'];
  const pyKeys = ['import', 'from', 'def', 'if', 'else', 'elif', 'for', 'in', 'while', 'return', 'not', 'and', 'or', 'True', 'False', 'None', 'global', 'print', 'range', 'len'];
  const pyTypes = ['int', 'str', 'list', 'dict', 'bool', 'set', 'tuple'];

  const codeConfigs = {
    io: {
      storageKey: 'gtcp-lang-ch02-io',
      order: ['cpp', 'python'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++', file: 'template.cpp', type: 'C++11 · g++', pre: true,
          note: 'The contest template with fast input and output. Build it with g++ -std=c++11 -O2 -Wall template.cpp -o template.',
          keywords: cppKeys, types: cppTypes,
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'int main() {',
            '    ios::sync_with_stdio(0);',
            '    cin.tie(0);',
            '',
            '    int a, b;',
            '    string x;',
            '    cin >> a >> b >> x;',
            '    cout << a << " " << b << " " << x << "\\n";',
            '}'
          ]
        },
        python: {
          label: 'Python', file: 'template.py', type: 'Python 3 · arbitrary ints',
          note: 'Python has no compile step. Reading all tokens at once is the usual contest pattern.',
          keywords: pyKeys, types: pyTypes,
          code: [
            'import sys',
            '',
            'data = sys.stdin.read().split()',
            'a = int(data[0])',
            'b = int(data[1])',
            'x = data[2]',
            '',
            'print(a, b, x)'
          ]
        }
      }
    },
    subsets: {
      storageKey: 'gtcp-lang-ch02-subsets',
      order: ['cpp', 'python'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++', file: 'subsets.cpp', type: '2^n subsets', pre: true,
          note: 'The include branch pushes k and recurses; the exclude branch recurses after the vector is restored.',
          keywords: cppKeys, types: cppTypes,
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'int n;',
            'vector<int> subset;',
            '',
            'void search(int k) {',
            '    if (k == n + 1) {',
            '        // process subset',
            '    } else {',
            '        subset.push_back(k);',
            '        search(k + 1);',
            '        subset.pop_back();',
            '        search(k + 1);',
            '    }',
            '}',
            '',
            'int main() {',
            '    cin >> n;',
            '    search(1);',
            '}'
          ]
        },
        python: {
          label: 'Python', file: 'subsets.py', type: '2^n subsets',
          note: 'The same two calls. The list plays the role of the vector; append and pop are the push and pop.',
          keywords: pyKeys, types: pyTypes,
          code: [
            'n = int(input())',
            'subset = []',
            '',
            'def search(k):',
            '    if k == n + 1:',
            '        print(subset)',
            '    else:',
            '        subset.append(k)',
            '        search(k + 1)',
            '        subset.pop()',
            '        search(k + 1)',
            '',
            'search(1)'
          ]
        }
      }
    },
    queens: {
      storageKey: 'gtcp-lang-ch02-queens',
      order: ['cpp', 'python'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++', file: 'queens.cpp', type: 'exponential · n = 8 → 92', pre: true,
          note: 'One queen per row. The three arrays reject columns and both diagonal directions before the recursion goes deeper.',
          keywords: cppKeys, types: cppTypes,
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'int n, count = 0;',
            'vector<bool> col, diag1, diag2;',
            '',
            'void search(int y) {',
            '    if (y == n) {',
            '        count++;',
            '        return;',
            '    }',
            '    for (int x = 0; x < n; x++) {',
            '        if (col[x] || diag1[x + y] ||',
            '            diag2[x - y + n - 1]) continue;',
            '        col[x] = diag1[x + y] =',
            '            diag2[x - y + n - 1] = true;',
            '        search(y + 1);',
            '        col[x] = diag1[x + y] =',
            '            diag2[x - y + n - 1] = false;',
            '    }',
            '}',
            '',
            'int main() {',
            '    cin >> n;',
            '    col.assign(n, false);',
            '    diag1.assign(2 * n, false);',
            '    diag2.assign(2 * n, false);',
            '    search(0);',
            '    cout << count << "\\n";',
            '}'
          ]
        },
        python: {
          label: 'Python', file: 'queens.py', type: 'exponential · n = 8 → 92',
          note: 'The same three checks. The last print is 92 for n = 8.',
          keywords: pyKeys, types: pyTypes,
          code: [
            'n = int(input())',
            'count = 0',
            'col = [False] * n',
            'diag1 = [False] * (2 * n)',
            'diag2 = [False] * (2 * n)',
            '',
            'def search(y):',
            '    global count',
            '    if y == n:',
            '        count += 1',
            '        return',
            '    for x in range(n):',
            '        if col[x] or diag1[x + y] or diag2[x - y + n - 1]:',
            '            continue',
            '        col[x] = diag1[x + y] = diag2[x - y + n - 1] = True',
            '        search(y + 1)',
            '        col[x] = diag1[x + y] = diag2[x - y + n - 1] = False',
            '',
            'search(0)',
            'print(count)'
          ]
        }
      }
    }
  };

  $$('[data-code-card]').forEach((card, index) => {
    const key = card.dataset.card || ['io', 'subsets', 'queens'][index];
    if (key && codeConfigs[key]) window.CP.mountCodeCard(card, codeConfigs[key]);
  });

  /* ==========================================================================
     Hero traveller
     ========================================================================== */

  (() => {
    const path = document.getElementById('ch02HeroLive');
    const traveller = document.querySelector('.ch02-hero-traveller');
    if (!path || !traveller) return;
    if (reduceMotion) { traveller.style.display = 'none'; return; }
    const total = path.getTotalLength();
    const duration = 9000;
    let start = null;
    function tick(ts) {
      if (start === null) start = ts;
      const t = ((ts - start) % duration) / duration;
      const p = path.getPointAtLength(total * t);
      traveller.setAttribute('cx', p.x.toFixed(2));
      traveller.setAttribute('cy', p.y.toFixed(2));
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ==========================================================================
     Ruler + pruning bars
     ========================================================================== */

  const ruler = $('.ch02-ruler');
  if (ruler) window.CP.onVisible(ruler, (el) => el.classList.add('is-inview'), { threshold: 0.2 });

  const prune = $('.ch02-prune__viz');
  if (prune) window.CP.onVisible(prune, (el) => el.classList.add('is-inview'), { threshold: 0.3 });

  /* ==========================================================================
     Fibonacci: naive vs memoised
     ========================================================================== */

  (() => {
    const fib = $('.ch02-fib');
    if (!fib) return;
    const count = document.getElementById('ch02FibCount');
    const label = document.getElementById('ch02FibCountLabel');
    const memo = document.getElementById('ch02FibMemo');
    const note = document.getElementById('ch02FibNote');
    const values = [0, 1, 1, 2, 3, 5];
    const cells = memo ? $$('b', memo) : [];

    function setMode(mode) {
      const memoised = mode === 'memo';
      fib.classList.toggle('is-memo', memoised);
      $$('[data-fib-mode]').forEach((btn) => {
        const on = btn.dataset.fibMode === mode;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', String(on));
      });
      if (count) count.textContent = memoised ? '6' : '15';
      if (label) label.textContent = memoised ? 'states, computed once' : 'calls for fib(5)';
      cells.forEach((cell, i) => {
        cell.textContent = memoised ? values[i] : '?';
      });
      if (note) {
        note.textContent = memoised
          ? 'Each state is computed once and stored. The repeated branches would return from the table immediately.'
          : 'The same states are recomputed from scratch. Only the base cases stop a branch.';
      }
    }

    $$('[data-fib-mode]').forEach((btn) => {
      btn.addEventListener('click', () => setMode(btn.dataset.fibMode));
    });
    setMode('naive');
  })();

  /* ==========================================================================
     Subset recursion tree
     ========================================================================== */

  (() => {
    const tree = document.getElementById('ch02SubsetTree');
    if (!tree) return;

    const codes = ['111', '110', '101', '100', '011', '010', '001', '000'];
    const xs = [70, 290, 510, 730];
    const leafY = (i) => 45 + i * 40;

    const setOf = (code) => {
      const out = [];
      for (let i = 0; i < code.length; i++) if (code[i] === '1') out.push(i + 1);
      return out.length ? '{' + out.join(', ') + '}' : '{ }';
    };
    const leavesUnder = (prefix) => codes
      .map((code, i) => ({ code, i }))
      .filter(({ code }) => code.startsWith(prefix));
    const nodeY = (prefix) => {
      const leaves = leavesUnder(prefix);
      return leaves.reduce((sum, { i }) => sum + leafY(i), 0) / leaves.length;
    };
    const nodeLeaves = (prefix) => leavesUnder(prefix).map(({ code }) => code).join(' ');

    const prefixes = [''];
    for (let depth = 1; depth <= 3; depth++) {
      for (let n = 0; n < (1 << depth); n++) {
        prefixes.push(n.toString(2).padStart(depth, '0'));
      }
    }

    let edges = '';
    let nodes = '';
    let leaves = '';

    ['start', 'element 1', 'element 2', 'subset'].forEach((text, i) => {
      leaves += `<text class="ch02-subset__col" x="${xs[i]}" y="18" text-anchor="${i === 0 ? 'middle' : 'start'}">${text}</text>`;
    });

    function drawNode(prefix, depth) {
      const x = xs[depth];
      const y = nodeY(prefix);
      const leavesAttr = nodeLeaves(prefix);
      if (depth < 3) {
        ['1', '0'].forEach((bit) => {
          const child = prefix + bit;
          const cx = xs[depth + 1];
          const cy = nodeY(child);
          const c1 = x + 70;
          const c2 = cx - 70;
          edges += `<path class="ch02-subset__edge" data-leaves="${nodeLeaves(child)}" d="M${x} ${y} C${c1} ${y} ${c2} ${cy} ${cx} ${cy}"/>`;
        });
      }
      if (depth < 3) {
        nodes += `<circle class="ch02-subset__node" data-leaves="${leavesAttr}" cx="${x}" cy="${y}" r="${depth === 0 ? 5 : 3.6}"/>`;
      }
      if (depth < 3) {
        ['1', '0'].forEach((bit) => drawNode(prefix + bit, depth + 1));
      }
    }
    drawNode('', 0);

    codes.forEach((code, i) => {
      const y = leafY(i);
      leaves += `<g class="ch02-subset__leaf" data-bits="${code}" transform="translate(${xs[3]} ${y})" tabindex="0" role="button" aria-label="Subset ${setOf(code)}, binary ${code}, decimal ${parseInt(code, 2)}">`
        + '<rect class="ch02-subset__leaf-hit" x="-14" y="-15" width="184" height="30"/>'
        + '<circle class="ch02-subset__leaf-dot" r="3.2"/>'
        + `<text class="ch02-subset__leaf-bits" x="18" y="4">${code}</text>`
        + `<text class="ch02-subset__leaf-set" x="66" y="4">${setOf(code)}</text>`
        + `<text class="ch02-subset__leaf-dec" x="166" y="4" text-anchor="end">${parseInt(code, 2)}</text>`
        + '</g>';
    });

    tree.innerHTML = `<g class="ch02-subset__edges">${edges}</g><g class="ch02-subset__nodes">${nodes}</g><g class="ch02-subset__leaf-group">${leaves}</g>`;

    const setEl = document.getElementById('ch02SubsetSet');
    const bitsEl = document.getElementById('ch02SubsetBits');
    const decEl = document.getElementById('ch02SubsetDec');
    const pathEl = document.getElementById('ch02SubsetPath');
    let selected = '101';

    function apply(bits) {
      $$('.ch02-subset__edge, .ch02-subset__node', tree).forEach((el) => {
        const leaves = (el.dataset.leaves || '').split(' ');
        el.classList.toggle('is-on', leaves.includes(bits));
      });
      $$('.ch02-subset__leaf', tree).forEach((el) => {
        el.classList.toggle('is-on', el.dataset.bits === bits);
      });
      if (setEl) setEl.textContent = setOf(bits);
      if (bitsEl) bitsEl.textContent = 'binary ' + bits;
      if (decEl) decEl.textContent = 'decimal ' + parseInt(bits, 2);
      if (pathEl) {
        pathEl.textContent = '';
        bits.split('').forEach((bit, i) => {
          const chip = document.createElement('span');
          chip.className = 'ch02-path-chip ' + (bit === '1' ? 'is-inc' : 'is-skip');
          chip.textContent = (i + 1) + (bit === '1' ? ' include' : ' skip');
          pathEl.appendChild(chip);
        });
      }
    }

    $$('.ch02-subset__leaf', tree).forEach((leaf) => {
      const bits = leaf.dataset.bits;
      leaf.addEventListener('mouseenter', () => apply(bits));
      leaf.addEventListener('focus', () => apply(bits));
      leaf.addEventListener('mouseleave', () => apply(selected));
      leaf.addEventListener('blur', () => apply(selected));
      leaf.addEventListener('click', () => { selected = bits; apply(selected); });
      leaf.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        selected = bits;
        apply(selected);
      });
    });

    apply(selected);
  })();

  /* ==========================================================================
     Queens
     ========================================================================== */

  (() => {
    const root = document.getElementById('ch02Queens');
    const attackBtn = document.getElementById('ch02Attacks');
    const note = document.getElementById('ch02QueenNote');
    if (!root || !attackBtn || !note) return;

    const solutions = [
      { cols: [1, 3, 0, 2], label: 'Solution 1' },
      { cols: [2, 0, 3, 1], label: 'Solution 2' }
    ];
    const boards = [];
    let selected = 0;
    let lines = false;

    solutions.forEach((solution, index) => {
      const board = document.createElement('button');
      board.type = 'button';
      board.className = 'ch02-board';
      board.setAttribute('aria-pressed', 'false');
      board.setAttribute('aria-label', solution.label + ': queens at columns ' + solution.cols.join(', ') + ' by row');

      const label = document.createElement('span');
      label.className = 'ch02-board__label';
      label.innerHTML = `<span>${solution.label}</span><span>4 × 4</span>`;

      const grid = document.createElement('span');
      grid.className = 'ch02-board__grid';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const cell = document.createElement('span');
          cell.className = 'ch02-board__cell' + ((r + c) % 2 ? ' is-dark' : '');
          cell.dataset.r = String(r);
          cell.dataset.c = String(c);
          if (solution.cols[r] === c) {
            const queen = document.createElement('span');
            queen.className = 'ch02-queen';
            cell.appendChild(queen);
          }
          grid.appendChild(cell);
        }
      }

      board.appendChild(label);
      board.appendChild(grid);
      board.addEventListener('click', () => select(index));
      root.appendChild(board);
      boards.push(board);
    });

    function noteFor(index) {
      const coords = solutions[index].cols.map((c, r) => `(${r},${c})`).join(', ');
      return `Solution ${index + 1} places queens at ${coords}.`;
    }

    function paintLines() {
      boards.forEach((board, index) => {
        const lastRow = 3;
        const lastCol = solutions[index].cols[3];
        $$('.ch02-board__cell', board).forEach((cell) => {
          const r = Number(cell.dataset.r);
          const c = Number(cell.dataset.c);
          const on = lines && index === selected && (
            r === lastRow || c === lastCol ||
            (r - c) === (lastRow - lastCol) ||
            (r + c) === (lastRow + lastCol)
          );
          cell.classList.toggle('is-attacked', on);
        });
      });
    }

    function select(index) {
      selected = index;
      boards.forEach((board, i) => {
        board.classList.toggle('is-selected', i === index);
        board.setAttribute('aria-pressed', String(i === index));
      });
      paintLines();
      note.textContent = lines
        ? `The last queen, on row 3 in column ${solutions[index].cols[3]}, shares its row, column, and both diagonals with the highlighted squares.`
        : noteFor(index);
    }

    attackBtn.addEventListener('click', () => {
      lines = !lines;
      attackBtn.setAttribute('aria-pressed', String(lines));
      attackBtn.textContent = lines ? 'Hide the last queen’s lines' : 'Show the last queen’s lines';
      paintLines();
      note.textContent = lines
        ? `The last queen, on row 3 in column ${solutions[selected].cols[3]}, shares its row, column, and both diagonals with the highlighted squares.`
        : noteFor(selected);
    });

    select(0);

    const stats = $('.ch02-queens__stats');
    if (stats) {
      window.CP.onVisible(stats, () => {
        $$('[data-countup]', stats).forEach((el) => {
          const target = Number(el.dataset.countup);
          if (reduceMotion) el.textContent = target.toLocaleString('en-US');
          else window.CP.countUp(el, target, 1100);
        });
      }, { threshold: 0.35 });
    }
  })();

  /* ==========================================================================
     Bit operation lanes
     ========================================================================== */

  (() => {
    const root = document.getElementById('ch02OpRows');
    const eq = document.getElementById('ch02OpEq');
    const note = document.getElementById('ch02OpNote');
    if (!root) return;

    const x = [1, 0, 1, 1, 0];
    const y = [1, 1, 0, 1, 0];
    const ops = {
      and: {
        label: 'AND', symbol: '&', result: [1, 0, 0, 1, 0], dec: 18,
        note: 'AND keeps a one only where both rows have a one.'
      },
      or: {
        label: 'OR', symbol: '|', result: [1, 1, 1, 1, 0], dec: 30,
        note: 'OR keeps a one where at least one of the two rows has a one.'
      },
      xor: {
        label: 'XOR', symbol: '^', result: [0, 1, 1, 0, 0], dec: 12,
        note: 'XOR keeps a one where exactly one of the two rows has a one.'
      }
    };

    function row(label, bits, dec, result) {
      const rowEl = document.createElement('div');
      rowEl.className = 'ch02-oplab__row' + (result ? ' ch02-oplab__row--result' : '');
      const labelEl = document.createElement('span');
      labelEl.className = 'ch02-oplab__label';
      labelEl.textContent = label;
      const bitsEl = document.createElement('div');
      bitsEl.className = 'ch02-oplab__bits';
      bits.forEach((bit) => {
        const cell = document.createElement('span');
        cell.className = 'ch02-oplab__bit' + (bit ? ' is-one' : '') + (result ? ' is-result' : '');
        cell.textContent = String(bit);
        bitsEl.appendChild(cell);
      });
      const decEl = document.createElement('span');
      decEl.className = 'ch02-oplab__dec';
      decEl.textContent = String(dec);
      rowEl.appendChild(labelEl);
      rowEl.appendChild(bitsEl);
      rowEl.appendChild(decEl);
      return rowEl;
    }

    function render(key) {
      const op = ops[key];
      if (!op) return;
      root.textContent = '';
      root.appendChild(row('x = 22', x, 22, false));
      root.appendChild(row('y = 26', y, 26, false));
      root.appendChild(row(`x ${op.symbol} y`, op.result, op.dec, true));
      if (eq) eq.textContent = `22 ${op.symbol} 26 = ${op.dec}`;
      if (note) note.textContent = op.note;
      $$('[data-op]').forEach((btn) => {
        const on = btn.dataset.op === key;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', String(on));
      });
    }

    $$('[data-op]').forEach((btn) => {
      btn.addEventListener('click', () => render(btn.dataset.op));
    });
    render('and');
  })();

  /* ==========================================================================
     Bitmask toy
     ========================================================================== */

  (() => {
    const cells = document.getElementById('ch02BitsCells');
    const decEl = document.getElementById('ch02BitsDec');
    const binEl = document.getElementById('ch02BitsBin');
    const setEl = document.getElementById('ch02BitsSet');
    const popEl = document.getElementById('ch02BitsPop');
    const trace = document.getElementById('ch02BitsTrace');
    const note = document.getElementById('ch02BitsNote');
    if (!cells || !trace) return;

    let x = 0b00101101;
    const buttons = [];

    for (let i = 7; i >= 0; i--) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ch02-bitbtn';
      btn.dataset.bit = String(i);
      btn.innerHTML = `<span class="ch02-bitbtn__val">0</span><span class="ch02-bitbtn__idx">bit ${i}</span>`;
      btn.addEventListener('click', () => {
        x ^= (1 << i);
        x = x & 0xff;
        render();
      });
      cells.appendChild(btn);
      buttons.push(btn);
    }

    function setText(el, value) {
      if (el) el.textContent = value;
    }

    function render() {
      const binary = x.toString(2).padStart(8, '0');
      const set = [];
      for (let i = 0; i < 8; i++) if (x & (1 << i)) set.push(i);

      buttons.forEach((btn) => {
        const i = Number(btn.dataset.bit);
        const on = Boolean(x & (1 << i));
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-pressed', String(on));
        btn.setAttribute('aria-label', `Bit ${i}, currently ${on ? 1 : 0}. Toggle it.`);
        const valueEl = $('.ch02-bitbtn__val', btn);
        if (valueEl) valueEl.textContent = on ? '1' : '0';
      });

      setText(decEl, String(x));
      setText(binEl, binary.slice(0, 4) + ' ' + binary.slice(4));
      setText(setEl, set.length ? '{' + set.join(', ') + '}' : '{ }');
      setText(popEl, String(set.length));

      if (trace) {
        trace.textContent = '';
        for (let i = 0; i < 8; i++) {
          const value = x & (1 << i);
          const rowEl = document.createElement('div');
          rowEl.className = 'ch02-trace__row' + (value ? ' is-on' : '');
          rowEl.innerHTML = `<span>${i}</span><span>${1 << i}</span><span>${value}</span>`;
          trace.appendChild(rowEl);
        }
      }

      if (note) {
        note.innerHTML = set.length
          ? `Set bits ${set.join(', ')} print <b>${set.join(' ')}</b>.`
          : 'No bits are set. The loop prints nothing: the empty set.';
      }
    }

    const clear = document.getElementById('ch02BitsClear');
    const all = document.getElementById('ch02BitsAll');
    const next = document.getElementById('ch02BitsNext');
    if (clear) clear.addEventListener('click', () => { x = 0; render(); });
    if (all) all.addEventListener('click', () => { x = 255; render(); });
    if (next) next.addEventListener('click', () => { x = (x + 1) & 0xff; render(); });

    render();
  })();
})();

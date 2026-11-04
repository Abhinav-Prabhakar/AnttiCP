/* Chapter 11 — Mathematics */
(() => {
  const { $, $$, clamp, fmt, reduceMotion, mountCodeCard } = window.CP;

  /* ======================================================================
     Code cards
     ====================================================================== */

  const cppCommon = {
    keywords: ['int', 'long', 'for', 'while', 'if', 'else', 'return', 'struct', 'const', 'void', 'bool', 'true', 'false', 'using', 'namespace', 'std', 'vector', 'auto', 'break', 'continue'],
    types: ['int', 'long', 'long long', 'vector', 'Matrix', 'string', 'pair']
  };
  const pyCommon = {
    pre: true,
    keywords: ['def', 'return', 'while', 'if', 'else', 'elif', 'for', 'in', 'and', 'or', 'not', 'range', 'len', 'sum', 'True', 'False', 'None'],
    types: ['int', 'list', 'dict', 'str', 'bool']
  };

  const cards = $$('[data-code-card]');

  if (cards[0]) {
    mountCodeCard(cards[0], {
      storageKey: 'ch11-code-factors',
      order: ['cpp', 'py'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++',
          file: 'factors.cpp',
          type: 'O(√n) · trial division',
          note: 'Divide out each factor as many times as possible; whatever remains above 1 is prime.',
          keywords: cppCommon.keywords,
          types: cppCommon.types,
          code: [
            'vector<int> factors(int n) {',
            '    vector<int> f;',
            '    for (int x = 2; x * x <= n; x++) {',
            '        while (n % x == 0) {',
            '            f.push_back(x);',
            '            n /= x;',
            '        }',
            '    }',
            '    if (n > 1) f.push_back(n);',
            '    return f;',
            '}'
          ]
        },
        py: {
          label: 'Python',
          file: 'factors.py',
          type: 'O(√n) · trial division',
          note: 'The loop stops at √n; the remaining value, if any, is the final prime factor.',
          keywords: pyCommon.keywords,
          types: pyCommon.types,
          pre: pyCommon.pre,
          code: [
            'def factors(n):',
            '    f = []',
            '    x = 2',
            '    while x * x <= n:',
            '        while n % x == 0:',
            '            f.append(x)',
            '            n //= x',
            '        x += 1',
            '    if n > 1:',
            '        f.append(n)',
            '    return f'
          ]
        }
      }
    });
  }

  if (cards[1]) {
    mountCodeCard(cards[1], {
      storageKey: 'ch11-code-euclid',
      order: ['cpp', 'py'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++',
          file: 'euclid.cpp',
          type: 'O(log n) · recursion',
          note: 'The five-argument overload returns g = ax + by; x and y are written by reference.',
          keywords: cppCommon.keywords,
          types: cppCommon.types,
          code: [
            'int gcd(int a, int b) {',
            '    if (b == 0) return a;',
            '    return gcd(b, a % b);',
            '}',
            '',
            'int gcd(int a, int b, int &x, int &y) {',
            '    if (b == 0) { x = 1; y = 0; return a; }',
            '    int x1, y1;',
            '    int g = gcd(b, a % b, x1, y1);',
            '    x = y1;',
            '    y = x1 - (a / b) * y1;',
            '    return g;',
            '}'
          ]
        },
        py: {
          label: 'Python',
          file: 'euclid.py',
          type: 'O(log n) · recursion',
          note: 'extgcd returns (g, x, y) with a·x + b·y = g.',
          keywords: pyCommon.keywords,
          types: pyCommon.types,
          pre: pyCommon.pre,
          code: [
            'def gcd(a, b):',
            '    return a if b == 0 else gcd(b, a % b)',
            '',
            'def extgcd(a, b):',
            '    if b == 0:',
            '        return a, 1, 0',
            '    g, x1, y1 = extgcd(b, a % b)',
            '    return g, y1, x1 - (a // b) * y1'
          ]
        }
      }
    });
  }

  if (cards[2]) {
    mountCodeCard(cards[2], {
      storageKey: 'ch11-code-modpow',
      order: ['cpp', 'py'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++',
          file: 'modpow.cpp',
          type: 'O(log n) · recursive',
          note: 'Every reduction halves the exponent, so at most about 60 calls are needed for a 64-bit exponent.',
          keywords: cppCommon.keywords,
          types: cppCommon.types,
          code: [
            'long long modpow(long long x, long long n, long long m) {',
            '    if (n == 0) return 1 % m;',
            '    long long u = modpow(x, n / 2, m);',
            '    u = (u * u) % m;',
            '    if (n % 2 == 1) u = (u * x) % m;',
            '    return u;',
            '}'
          ]
        },
        py: {
          label: 'Python',
          file: 'modpow.py',
          type: 'O(log n) · recursive',
          note: 'Python integers do not overflow, but reducing after every product keeps the values small.',
          keywords: pyCommon.keywords,
          types: pyCommon.types,
          pre: pyCommon.pre,
          code: [
            'def modpow(x, n, m):',
            '    if n == 0:',
            '        return 1 % m',
            '    u = modpow(x, n // 2, m)',
            '    u = (u * u) % m',
            '    if n % 2:',
            '        u = (u * x) % m',
            '    return u'
          ]
        }
      }
    });
  }

  if (cards[3]) {
    mountCodeCard(cards[3], {
      storageKey: 'ch11-code-matrix',
      order: ['cpp', 'py'],
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++',
          file: 'matrix.cpp',
          type: 'O(k³ log n) · binary power',
          note: 'The identity starts the accumulator; squaring the base doubles the exponent at every bit.',
          keywords: cppCommon.keywords,
          types: cppCommon.types,
          code: [
            'struct Matrix { long long a[2][2]; };',
            '',
            'Matrix mul(Matrix A, Matrix B) {',
            '    Matrix C{};',
            '    for (int i = 0; i < 2; i++)',
            '        for (int j = 0; j < 2; j++)',
            '            for (int k = 0; k < 2; k++)',
            '                C.a[i][j] += A.a[i][k] * B.a[k][j];',
            '    return C;',
            '}',
            '',
            'Matrix power(Matrix A, long long n) {',
            '    Matrix R{};',
            '    R.a[0][0] = R.a[1][1] = 1;',
            '    while (n > 0) {',
            '        if (n & 1) R = mul(R, A);',
            '        A = mul(A, A);',
            '        n >>= 1;',
            '    }',
            '    return R;',
            '}'
          ]
        },
        py: {
          label: 'Python',
          file: 'matrix.py',
          type: 'O(k³ log n) · binary power',
          note: 'The same loop works for any k; only the dimensions inside mul change.',
          keywords: pyCommon.keywords,
          types: pyCommon.types,
          pre: pyCommon.pre,
          code: [
            'def mul(A, B):',
            '    return [[sum(A[i][k] * B[k][j] for k in range(2))',
            '             for j in range(2)] for i in range(2)]',
            '',
            'def power(A, n):',
            '    R = [[1, 0], [0, 1]]',
            '    while n:',
            '        if n & 1:',
            '            R = mul(R, A)',
            '        A = mul(A, A)',
            '        n >>= 1',
            '    return R'
          ]
        }
      }
    });
  }

  /* ======================================================================
     Shared helpers
     ====================================================================== */

  const isPrime = (n) => {
    if (n < 2) return false;
    if (n % 2 === 0) return n === 2;
    for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
    return true;
  };

  /* ======================================================================
     11.1.2 — Sieve
     ====================================================================== */

  const sieveGrid = $('#ch11SieveGrid');
  if (sieveGrid) {
    const sieveModes = $('#ch11SieveModes');
    const sieveNote = $('#ch11SieveNote');
    const primes = [];
    for (let n = 2; n <= 100; n++) if (isPrime(n)) primes.push(n);
    const cells = [];

    for (let n = 1; n <= 100; n++) {
      const cell = document.createElement('span');
      cell.className = 'ch11-cell';
      cell.setAttribute('role', 'gridcell');
      cell.textContent = String(n);
      cell.title = n === 1 ? '1 is neither prime nor composite' : isPrime(n) ? `${n} is prime` : `${n} is composite`;
      sieveGrid.appendChild(cell);
      cells.push(cell);
    }

    const modes = [
      { key: 'all', label: 'all' },
      { key: 2, label: '2' },
      { key: 3, label: '3' },
      { key: 5, label: '5' },
      { key: 7, label: '7' }
    ];

    let activeMode = 'all';

    function earlierComposite(n, p) {
      for (const q of primes) {
        if (q >= p) break;
        if (n % q === 0 && n !== q) return true;
      }
      return false;
    }

    function paint(mode) {
      activeMode = mode;
      cells.forEach((cell, i) => {
        const n = i + 1;
        let cls = 'ch11-cell';
        if (n === 1) cls += ' is-one';
        else if (isPrime(n)) cls += ' is-prime';
        else if (mode === 'all') cls += ' is-out';
        else if (n % Number(mode) === 0) cls += ' is-hit';
        else if (earlierComposite(n, Number(mode))) cls += ' is-out';
        else cls += ' is-dim';
        cell.className = cls;
      });

      if (sieveModes) {
        $$('.ch11-preset', sieveModes).forEach((b) => {
          const on = b.dataset.mode === String(mode);
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
      }

      if (sieveNote) {
        if (mode === 'all') {
          sieveNote.innerHTML = 'All composites are marked: the 25 primes up to 100 stand in black. 1 is neither prime nor composite.';
        } else {
          const p = Number(mode);
          const count = Math.floor(100 / p) - 1;
          sieveNote.innerHTML = `The multiples of ${p} are removed now — ${count} of them. Composites of earlier primes stay struck out; numbers with no smaller prime factor are dimmed until their turn.`;
        }
      }
    }

    if (sieveModes) {
      modes.forEach((m) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ch11-preset';
        b.dataset.mode = String(m.key);
        b.textContent = m.label;
        b.setAttribute('aria-pressed', 'false');
        b.setAttribute('aria-label', m.key === 'all' ? 'Show the completed sieve' : `Show multiples of ${m.key}`);
        b.addEventListener('click', () => paint(m.key));
        sieveModes.appendChild(b);
      });
    }

    paint('all');
  }

  /* ======================================================================
     11.1.3 — Euclid
     ====================================================================== */

  const euclidRows = $('#ch11EuclidRows');
  if (euclidRows) {
    const aInput = $('#ch11EuclidA');
    const bInput = $('#ch11EuclidB');
    const stepBtn = $('#ch11EuclidStep');
    const resetBtn = $('#ch11EuclidReset');
    const extBox = $('#ch11EuclidExt');
    const note = $('#ch11EuclidNote');
    const presets = $('#ch11EuclidPresets');

    let base = [30, 12];
    let steps = [];
    let shown = 0;
    let gcdValue = 1;
    let ext = { x: 1, y: 0 };

    function extGcd(a, b) {
      let oldR = a, r = b;
      let oldS = 1, s = 0;
      let oldT = 0, t = 1;
      while (r !== 0) {
        const q = Math.floor(oldR / r);
        [oldR, r] = [r, oldR - q * r];
        [oldS, s] = [s, oldS - q * s];
        [oldT, t] = [t, oldT - q * t];
      }
      return { g: oldR, x: oldS, y: oldT };
    }

    function signed(v) {
      return v < 0 ? `(−${Math.abs(v)})` : String(v);
    }

    function build() {
      const rawA = Number(aInput.value);
      const rawB = Number(bInput.value);
      const a = clamp(Number.isFinite(rawA) ? Math.floor(rawA) : 1, 1, 99999);
      const b = clamp(Number.isFinite(rawB) ? Math.floor(rawB) : 0, 0, 99999);
      aInput.value = String(a);
      bInput.value = String(b);

      steps = [{ a, b, kind: 'start' }];
      let x = a, y = b;
      while (y !== 0) {
        const q = Math.floor(x / y);
        const r = x % y;
        steps.push({ a: x, b: y, q, r, kind: r === 0 ? 'last' : 'step' });
        x = y;
        y = r;
      }
      gcdValue = x;
      ext = extGcd(a, b);
      shown = 0;
      if (note) note.innerHTML = `Each row replaces (<i>a</i>, <i>b</i>) by (<i>b</i>, <i>a</i> mod <i>b</i>). Press Step to divide.`;
      if (extBox) extBox.innerHTML = 'Reach remainder 0 to read <i>x</i> and <i>y</i>.';
      update();
    }

    function update() {
      euclidRows.innerHTML = '';
      steps.slice(0, shown + 1).forEach((s, i) => {
        const row = document.createElement('div');
        row.className = 'ch11-eqrow' + (i === steps.length - 1 ? ' is-final' : '');
        if (s.kind === 'start') {
          row.innerHTML = `<span>start · (${s.a}, ${s.b})</span><span>apply Euclid</span>`;
        } else {
          const tag = s.r === 0 ? `gcd = ${s.b}` : `remainder ${s.r}`;
          row.innerHTML = `<span>${s.a} = ${s.q} · ${s.b} + ${s.r}</span><span>${tag}</span>`;
        }
        euclidRows.appendChild(row);
      });

      const done = shown >= steps.length - 1;
      if (stepBtn) {
        stepBtn.disabled = done;
        stepBtn.querySelector('span').textContent = done ? 'Done' : 'Step';
      }

      if (done) {
        if (extBox) {
          extBox.innerHTML = `<span class="ch11-extbig">${steps[0].a} · ${signed(ext.x)} + ${steps[0].b} · ${signed(ext.y)} = ${ext.g}</span>` +
            `<span>gcd(${steps[0].a}, ${steps[0].b}) = <b>${gcdValue}</b></span><br>` +
            `<span>lcm = <b>${(steps[0].a * steps[0].b) / gcdValue}</b></span>`;
        }
        if (note) note.innerHTML = `Remainder 0. The last non-zero remainder is gcd(${steps[0].a}, ${steps[0].b}) = <b>${gcdValue}</b>.`;
      } else if (shown > 0) {
        const s = steps[shown];
        if (note) note.innerHTML = `Remainder ${s.r} is not zero, so continue with (${s.b}, ${s.r}).`;
      }
    }

    stepBtn && stepBtn.addEventListener('click', () => {
      if (shown < steps.length - 1) {
        shown++;
        update();
      }
    });
    resetBtn && resetBtn.addEventListener('click', build);
    [aInput, bInput].forEach((input) => input && input.addEventListener('change', build));

    const examples = [[30, 12], [84, 36], [1071, 462], [17, 5]];
    if (presets) {
      examples.forEach(([a, b]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ch11-preset' + (a === 30 ? ' is-active' : '');
        button.textContent = `${a} · ${b}`;
        button.addEventListener('click', () => {
          aInput.value = String(a);
          bInput.value = String(b);
          $$('.ch11-preset', presets).forEach((p) => p.classList.toggle('is-active', p === button));
          build();
        });
        presets.appendChild(button);
      });
    }

    build();
  }

  /* ======================================================================
     11.1.4 — Modular exponentiation
     ====================================================================== */

  const powLadder = $('#ch11PowLadder');
  if (powLadder) {
    const xInput = $('#ch11PowX');
    const nInput = $('#ch11PowN');
    const mInput = $('#ch11PowM');
    const stepBtn = $('#ch11PowStep');
    const resetBtn = $('#ch11PowReset');
    const result = $('#ch11PowResult');
    const note = $('#ch11PowNote');
    const presets = $('#ch11PowPresets');

    let chain = [];
    let values = [];
    let shown = 0;
    let params = { x: 7, n: 4, m: 10 };

    function build() {
      const rawX = Number(xInput.value);
      const rawN = Number(nInput.value);
      const rawM = Number(mInput.value);
      const x = clamp(Number.isFinite(rawX) ? Math.floor(rawX) : 7, 1, 99);
      const n = clamp(Number.isFinite(rawN) ? Math.floor(rawN) : 0, 0, 60);
      const m = clamp(Number.isFinite(rawM) ? Math.floor(rawM) : 2, 2, 9999);
      xInput.value = String(x);
      nInput.value = String(n);
      mInput.value = String(m);
      params = { x, n, m };

      chain = [];
      let k = n;
      while (true) {
        chain.push(k);
        if (k === 0) break;
        k = Math.floor(k / 2);
      }
      chain.reverse();

      values = [];
      chain.forEach((e, i) => {
        if (i === 0) {
          values.push(1 % m);
          return;
        }
        const sq = (values[i - 1] * values[i - 1]) % m;
        values.push(e % 2 === 1 ? (sq * x) % m : sq);
      });

      shown = 0;
      update();
    }

    function opText(k) {
      if (k === 0) return 'base case';
      if (k % 2 === 0) return `(<i>x</i><sup>${k / 2}</sup>)<sup>2</sup>`;
      return `(<i>x</i><sup>${Math.floor(k / 2)}</sup>)<sup>2</sup> · <i>x</i>`;
    }

    function update() {
      powLadder.innerHTML = '';
      chain.forEach((k, i) => {
        const row = document.createElement('div');
        const state = i < shown ? ' is-done' : i === shown ? ' is-current' : '';
        row.className = 'ch11-powrow' + state;
        const val = i <= shown ? String(values[i]) : '·';
        row.innerHTML = `<span class="ch11-powrow__n">n = ${k}</span>` +
          `<span class="ch11-powrow__op">${i === 0 ? '1 mod m' : opText(k)}</span>` +
          `<span class="ch11-powrow__val">${val}</span>`;
        powLadder.appendChild(row);
      });

      const done = shown >= chain.length - 1;
      if (stepBtn) {
        stepBtn.disabled = done;
        stepBtn.querySelector('span').textContent = done ? 'Done' : 'Step';
      }
      if (result) result.textContent = String(values[shown]);
      if (note) {
        if (done) {
          note.innerHTML = `${params.x}<sup>${params.n}</sup> mod ${params.m} = <b>${values[shown]}</b> using ${chain.length} levels, so ${chain.length - 1} squarings and at most ${chain.length - 1} extra multiplications.`;
        } else if (shown === 0) {
          note.innerHTML = `Start at <i>n</i> = 0, where the value is 1. The next level squares and, if odd, multiplies by <i>x</i>.`;
        } else {
          note.innerHTML = `Climb one level: ${chain[shown]} uses the value at ${chain[shown - 1]}. Every product is reduced modulo ${params.m}.`;
        }
      }
    }

    stepBtn && stepBtn.addEventListener('click', () => {
      if (shown < chain.length - 1) {
        shown++;
        update();
      }
    });
    resetBtn && resetBtn.addEventListener('click', build);
    [xInput, nInput, mInput].forEach((input) => input && input.addEventListener('change', build));

    const examples = [[7, 4, 10], [3, 13, 17], [2, 10, 1000], [5, 23, 97]];
    if (presets) {
      examples.forEach(([x, n, m], i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ch11-preset' + (i === 0 ? ' is-active' : '');
        button.innerHTML = `${x}<sup>${n}</sup> mod ${m}`;
        button.addEventListener('click', () => {
          xInput.value = String(x);
          nInput.value = String(n);
          mInput.value = String(m);
          $$('.ch11-preset', presets).forEach((p) => p.classList.toggle('is-active', p === button));
          build();
        });
        presets.appendChild(button);
      });
    }

    build();
  }

  /* ======================================================================
     11.2.1 — Pascal's triangle
     ====================================================================== */

  const pascalSvg = $('#ch11PascalSvg');
  if (pascalSvg) {
    const NS = 'http://www.w3.org/2000/svg';
    const expr = $('#ch11PascalExpr');
    const val = $('#ch11PascalVal');
    const parents = $('#ch11PascalParents');
    const fact = $('#ch11PascalFact');
    const meta = $('#ch11PascalMeta');
    const note = $('#ch11PascalNote');
    const ROWS = 10;
    const X0 = 380;
    const Y0 = 30;
    const DX = 52;
    const DY = 37;
    const R = 13.6;
    const values = [];
    const factors = [1];

    for (let i = 1; i <= ROWS; i++) factors[i] = factors[i - 1] * i;
    for (let n = 0; n <= ROWS; n++) {
      values[n] = [];
      for (let k = 0; k <= n; k++) {
        values[n][k] = k === 0 || k === n
          ? 1
          : values[n - 1][k - 1] + values[n - 1][k];
      }
    }

    const pos = (n, k) => ({
      x: X0 + (k - n / 2) * DX,
      y: Y0 + n * DY
    });

    const edgeLayer = document.createElementNS(NS, 'g');
    const nodeLayer = document.createElementNS(NS, 'g');
    pascalSvg.appendChild(edgeLayer);
    pascalSvg.appendChild(nodeLayer);

    const nodeMap = new Map();
    const edgeMap = new Map();

    for (let n = 0; n <= ROWS; n++) {
      for (let k = 0; k < n; k++) {
        const a = pos(n - 1, k);
        const b = pos(n, k);
        const edge = document.createElementNS(NS, 'line');
        edge.setAttribute('class', 'ch11-pedge');
        edge.setAttribute('x1', a.x);
        edge.setAttribute('y1', a.y);
        edge.setAttribute('x2', b.x);
        edge.setAttribute('y2', b.y);
        edgeLayer.appendChild(edge);
        edgeMap.set(`${n}-${k}-left`, edge);
      }
      for (let k = 1; k <= n; k++) {
        const a = pos(n - 1, k - 1);
        const b = pos(n, k);
        const edge = document.createElementNS(NS, 'line');
        edge.setAttribute('class', 'ch11-pedge');
        edge.setAttribute('x1', a.x);
        edge.setAttribute('y1', a.y);
        edge.setAttribute('x2', b.x);
        edge.setAttribute('y2', b.y);
        edgeLayer.appendChild(edge);
        edgeMap.set(`${n}-${k}-right`, edge);
      }
    }

    for (let n = 0; n <= ROWS; n++) {
      for (let k = 0; k <= n; k++) {
        const p = pos(n, k);
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'ch11-pnode');
        g.setAttribute('tabindex', '-1');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', `C(${n}, ${k}) equals ${values[n][k]}`);
        g.dataset.n = String(n);
        g.dataset.k = String(k);
        const circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('cx', p.x);
        circle.setAttribute('cy', p.y);
        circle.setAttribute('r', R);
        const text = document.createElementNS(NS, 'text');
        text.setAttribute('x', p.x);
        text.setAttribute('y', p.y);
        text.textContent = String(values[n][k]);
        g.appendChild(circle);
        g.appendChild(text);
        nodeLayer.appendChild(g);
        nodeMap.set(`${n}-${k}`, g);
      }
    }

    let active = { n: 5, k: 3 };

    function paint(n, k) {
      const key = `${n}-${k}`;
      if (!nodeMap.has(key)) return;
      active = { n, k };
      nodeMap.forEach((node, nodeKey) => {
        node.classList.toggle('is-active', nodeKey === key);
        node.classList.toggle('is-parent', nodeKey === `${n - 1}-${k - 1}` || nodeKey === `${n - 1}-${k}`);
        node.setAttribute('aria-pressed', String(nodeKey === key));
        node.setAttribute('tabindex', nodeKey === key ? '0' : '-1');
      });
      edgeMap.forEach((edge, edgeKey) => {
        const on = edgeKey === `${n}-${k}-left` || edgeKey === `${n}-${k}-right`;
        edge.classList.toggle('is-active', on);
      });

      const v = values[n][k];
      if (expr) expr.textContent = `C(${n}, ${k})`;
      if (val) val.textContent = String(v);

      if (parents) {
        if (n === 0) parents.textContent = 'the root · no parents';
        else if (k === 0 || k === n) parents.textContent = `rim value · parents C(${n - 1}, ${clamp(k, 0, n - 1)}) + 0`;
        else parents.textContent = `C(${n - 1}, ${k - 1}) + C(${n - 1}, ${k}) = ${values[n - 1][k - 1]} + ${values[n - 1][k]}`;
      }

      if (fact) {
        if (n === 0 || k === 0 || k === n) {
          fact.textContent = 'boundary value · defined as 1';
        } else {
          fact.textContent = `${n}! / (${k}! · ${n - k}!) = ${fmt(factors[n])} / ${fmt(factors[k] * factors[n - k])}`;
        }
      }

      if (meta) {
        meta.textContent = `Row ${n} · value ${k + 1} of ${n + 1}`;
      }

      if (note) {
        if (k === 0 || k === n) {
          note.innerHTML = `The rim of the triangle is always 1. Row ${n} sums to 2<sup>${n}</sup> = ${fmt(Math.pow(2, n))}.`;
        } else {
          const rowMax = Math.max(...values[n]);
          if (v === rowMax && n > 0) {
            note.innerHTML = `${v} is the largest coefficient in row ${n}. Its mirror C(${n}, ${n - k}) is the same value.`;
          } else {
            note.innerHTML = `Every interior value is the sum of the two above it. C(${n}, ${k}) = C(${n}, ${n - k}) = ${v}.`;
          }
        }
      }
    }

    function move(n, k, focus) {
      const nn = clamp(n, 0, ROWS);
      const kk = clamp(k, 0, nn);
      paint(nn, kk);
      if (focus) {
        const target = nodeMap.get(`${nn}-${kk}`);
        if (target) target.focus();
      }
    }

    nodeMap.forEach((node) => {
      const n = Number(node.dataset.n);
      const k = Number(node.dataset.k);
      node.addEventListener('pointerenter', () => paint(n, k));
      node.addEventListener('focus', () => paint(n, k));
      node.addEventListener('click', () => paint(n, k));
      node.addEventListener('keydown', (e) => {
        let nextN = n;
        let nextK = k;
        if (e.key === 'ArrowLeft') nextK--;
        else if (e.key === 'ArrowRight') nextK++;
        else if (e.key === 'ArrowUp') nextN--;
        else if (e.key === 'ArrowDown') nextN++;
        else if (e.key === 'Home') nextK = 0;
        else if (e.key === 'End') nextK = n;
        else return;
        e.preventDefault();
        move(nextN, nextK, true);
      });
    });

    paint(active.n, active.k);

    const pascalChart = $('.ch11-pascal__chart');
    const pascalHint = $('.ch11-pascal__hint');
    const pascalMq = window.matchMedia('(max-width: 640px)');
    function adaptPascal() {
      if (pascalHint) pascalHint.textContent = pascalMq.matches ? 'Swipe the triangle · tap a value' : 'Hover, or move with the arrow keys.';
      requestAnimationFrame(() => {
        if (!pascalChart) return;
        pascalChart.scrollLeft = pascalMq.matches
          ? (pascalChart.scrollWidth - pascalChart.clientWidth) / 2
          : 0;
      });
    }
    adaptPascal();
    if (pascalMq.addEventListener) pascalMq.addEventListener('change', adaptPascal);
  }

  /* ======================================================================
     11.3.2 — Fibonacci by matrix exponentiation
     ====================================================================== */

  const fibRows = $('#ch11FibRows');
  if (fibRows) {
    const nInput = $('#ch11FibN');
    const binary = $('#ch11FibBinary');
    const stepBtn = $('#ch11FibStep');
    const resetBtn = $('#ch11FibReset');
    const accBox = $('#ch11FibAcc');
    const result = $('#ch11FibResult');
    const note = $('#ch11FibNote');
    const presets = $('#ch11FibPresets');

    const mul = (A, B) => [
      [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
      [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]
    ];
    const mat = (M, extra = '') => `<span class="ch11-mat ch11-mat--inline ${extra}"><span>${M[0][0]}</span><span>${M[0][1]}</span><span>${M[1][0]}</span><span>${M[1][1]}</span></span>`;

    let n = 10;
    let bits = [];
    let bases = [];
    let acc = [[1, 0], [0, 1]];
    let shown = 0;

    function build() {
      const raw = Number(nInput.value);
      n = clamp(Number.isFinite(raw) ? Math.floor(raw) : 10, 0, 40);
      nInput.value = String(n);
      bits = n.toString(2).split('').reverse().map(Number);
      bases = [];
      let base = [[0, 1], [1, 1]];
      for (let i = 0; i < bits.length; i++) {
        bases.push(base.map((row) => row.slice()));
        base = mul(base, base);
      }
      acc = [[1, 0], [0, 1]];
      shown = 0;
      if (binary) binary.innerHTML = `${n} = ${n.toString(2)}<sub>2</sub>`;
      if (result) result.textContent = '—';
      update();
    }

    function update() {
      fibRows.innerHTML = '';
      bits.forEach((bit, i) => {
        const row = document.createElement('div');
        const state = i < shown ? ' is-done' : i === shown ? ' is-current' : ' is-pending';
        row.className = 'ch11-fibrow' + state;
        const bitCls = bit === 1 ? 'is-used' : 'is-skip';
        let accCell = '<span class="ch11-fibrow__same">·</span>';
        if (i < shown) {
          let running = [[1, 0], [0, 1]];
          for (let j = 0; j <= i; j++) if (bits[j] === 1) running = mul(running, bases[j]);
          accCell = bit === 1
            ? mat(running)
            : '<span class="ch11-fibrow__same">unchanged</span>';
        }
        row.innerHTML = `<span class="ch11-fibrow__bit ${bitCls}">bit ${i}<b>2<sup>${i}</sup> = ${Math.pow(2, i)}</b></span>` +
          mat(bases[i]) +
          `<span class="ch11-fibrow__op">${bit === 1 ? '×' : 'skip'}</span>` +
          `<span class="ch11-fibrow__result">${accCell}</span>`;
        fibRows.appendChild(row);
      });

      if (accBox) accBox.innerHTML = mat(acc);
      if (stepBtn) {
        stepBtn.disabled = shown >= bits.length;
        stepBtn.querySelector('span').textContent = shown >= bits.length ? 'Done' : 'Step';
      }
      if (result) result.textContent = shown === 0 ? '—' : String(acc[0][1]);

      if (note) {
        if (shown >= bits.length) {
          note.innerHTML = `All ${bits.length} bits processed. X<sup>${n}</sup> · [0, 1]<sup>T</sup> = [${acc[0][1]}, ${acc[1][1]}], so <i>f</i>(${n}) = <b>${acc[0][1]}</b>.`;
        } else if (shown === 0) {
          note.innerHTML = 'Square the base at every bit; multiply it into the accumulator when the bit is 1.';
        } else {
          const last = shown - 1;
          note.innerHTML = `Bit ${last} was ${bits[last] === 1 ? '1, so the accumulator changed' : '0, so the accumulator is unchanged'}. The base is now X<sup>${Math.pow(2, shown)}</sup>.`;
        }
      }
    }

    stepBtn && stepBtn.addEventListener('click', () => {
      if (shown >= bits.length) return;
      const i = shown;
      const base = bases[i];
      if (bits[i] === 1) acc = mul(acc, base);
      shown++;
      update();
    });
    resetBtn && resetBtn.addEventListener('click', build);
    nInput && nInput.addEventListener('change', build);

    [10, 20, 30, 40].forEach((value, i) => {
      if (!presets) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ch11-preset' + (i === 0 ? ' is-active' : '');
      button.textContent = `n = ${value}`;
      button.addEventListener('click', () => {
        nInput.value = String(value);
        $$('.ch11-preset', presets).forEach((p) => p.classList.toggle('is-active', p === button));
        build();
      });
      presets.appendChild(button);
    });

    build();
  }

  /* ======================================================================
     11.5.2 — Nim
     ====================================================================== */

  const nimHeaps = $('#ch11NimHeaps');
  if (nimHeaps) {
    const inputs = [$('#ch11NimA'), $('#ch11NimB'), $('#ch11NimC')];
    const playBtn = $('#ch11NimPlay');
    const resetBtn = $('#ch11NimReset');
    const sumOut = $('#ch11NimSum');
    const stateOut = $('#ch11NimState');
    const moveOut = $('#ch11NimMove');
    const note = $('#ch11NimNote');
    const presets = $('#ch11NimPresets');

    let heaps = [10, 12, 5];
    let base = [10, 12, 5];

    function readInputs() {
      heaps = inputs.map((input, i) => {
        const raw = Number(input.value);
        const v = clamp(Number.isFinite(raw) ? Math.floor(raw) : 0, 0, 15);
        input.value = String(v);
        return v;
      });
    }

    function bestMove() {
      const s = heaps.reduce((a, b) => a ^ b, 0);
      if (s === 0) return null;
      for (let i = 0; i < heaps.length; i++) {
        const target = heaps[i] ^ s;
        if (target < heaps[i]) return { i, from: heaps[i], to: target, amount: heaps[i] - target, sum: s };
      }
      return null;
    }

    function update() {
      const s = heaps.reduce((a, b) => a ^ b, 0);
      nimHeaps.innerHTML = '';
      heaps.forEach((count, i) => {
        const row = document.createElement('div');
        row.className = 'ch11-heap';
        const sticks = Array.from({ length: 15 }, (_, j) =>
          `<span class="ch11-stick${j >= count ? ' is-gone' : ''}"></span>`
        ).join('');
        row.innerHTML = `<span class="ch11-heap__label">heap ${i + 1}</span>` +
          `<div class="ch11-heap__sticks">${sticks}</div>` +
          `<span class="ch11-heap__count">${count}</span>`;
        nimHeaps.appendChild(row);
      });

      if (sumOut) sumOut.textContent = String(s);
      const move = bestMove();
      if (stateOut) {
        stateOut.textContent = s === 0 ? 'losing' : 'winning';
        stateOut.classList.toggle('is-loss', s === 0);
      }
      if (moveOut) {
        moveOut.textContent = move ? `${move.from} → ${move.to}` : 'none — losing';
        moveOut.classList.toggle('is-loss', !move);
      }
      if (note) {
        if (s === 0) {
          note.innerHTML = 'Every move from a zero-sum state leaves a non-zero sum, so the opponent can always restore zero.';
        } else if (move) {
          note.innerHTML = `Nim sum is ${s}. Change heap ${move.i + 1} from ${move.from} to ${move.from} ⊕ ${s} = ${move.to}, removing ${move.amount} ${move.amount === 1 ? 'stick' : 'sticks'}.`;
        }
      }
      inputs.forEach((input, i) => { if (input) input.value = String(heaps[i]); });
    }

    inputs.forEach((input) => input && input.addEventListener('change', () => {
      readInputs();
      update();
    }));

    playBtn && playBtn.addEventListener('click', () => {
      readInputs();
      const move = bestMove();
      if (move) {
        heaps[move.i] = move.to;
        update();
        if (note) note.innerHTML = `Removed ${move.amount} from heap ${move.i + 1}. The nim sum is now 0, so the position is losing for the opponent.`;
      } else {
        const i = heaps.findIndex((h) => h > 0);
        if (i !== -1) {
          heaps[i]--;
          update();
          if (note) note.innerHTML = `This position has nim sum 0, so there is no move to zero. Any move hands the opponent a winning position; one legal move is shown.`;
        }
      }
    });

    resetBtn && resetBtn.addEventListener('click', () => {
      heaps = base.slice();
      update();
    });

    [[10, 12, 5], [1, 2, 3], [3, 4, 5], [7, 8, 9]].forEach((values, i) => {
      if (!presets) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ch11-preset' + (i === 0 ? ' is-active' : '');
      button.textContent = values.join(' · ');
      button.addEventListener('click', () => {
        heaps = values.slice();
        base = values.slice();
        $$('.ch11-preset', presets).forEach((p) => p.classList.toggle('is-active', p === button));
        update();
      });
      presets.appendChild(button);
    });

    update();
  }

  /* ======================================================================
     11.4.2 — Two dice distribution
     ====================================================================== */

  const distChart = $('#ch11DistChart');
  if (distChart) {
    const counts = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1];
    const max = 6;
    const gcdInt = (a, b) => (b === 0 ? a : gcdInt(b, a % b));
    counts.forEach((count, i) => {
      const sum = i + 2;
      const g = gcdInt(count, 36);
      const reduced = g === 36 ? '1' : `${count / g}/${36 / g}`;
      const bar = document.createElement('span');
      bar.className = 'ch11-bar' + (count === max ? ' is-peak' : '');
      bar.style.setProperty('--h', `${(count / max) * 100}%`);
      bar.setAttribute('data-tip', `sum ${sum} · ${count}/36${g > 1 ? ` = ${reduced}` : ''}`);
      bar.setAttribute('role', 'img');
      bar.setAttribute('aria-label', `Sum ${sum}: probability ${count} out of 36`);
      distChart.appendChild(bar);
    });
  }
})();

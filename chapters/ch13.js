/* Chapter 13 — Geometry */
(() => {
  const { $, $$, mountCodeCard } = window.CP;

  /* ============================================================
     Shared drawing helpers
     ============================================================ */
  const NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    if (attrs) objEntries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (parent) parent.appendChild(node);
    return node;
  }
  function objEntries(o) { return Object.keys(o).map((k) => [k, o[k]]); }

  function drawGrid(group, box, step) {
    if (!group) return;
    const { left, right, top, bottom, ox, oy } = box;
    const startX = ox - Math.floor((ox - left) / step) * step;
    const startY = oy - Math.floor((oy - top) / step) * step;
    for (let x = startX; x <= right; x += step) {
      if (x < left) continue;
      el('line', { x1: x, y1: top, x2: x, y2: bottom }, group);
    }
    for (let y = startY; y <= bottom; y += step) {
      if (y < top) continue;
      el('line', { x1: left, y1: y, x2: right, y2: y }, group);
    }
  }

  /* ============================================================
     13.1.1 Rotation lab
     ============================================================ */
  (() => {
    const root = $('#ch13Rot');
    const svg = $('#ch13RotSvg');
    if (!root || !svg) return;

    drawGrid($('#ch13RotGrid'), { left: 40, right: 520, top: 24, bottom: 356, ox: 190, oy: 260 }, 36);

    const OX = 190, OY = 260, SCALE = 36;
    const range = $('#ch13RotRange');
    const angleEl = $('#ch13RotAngle');
    const capEl = $('#ch13RotCap');
    const arc = $('#ch13RotArc');
    const vec = $('#ch13RotVec');
    const tip = $('#ch13RotTip');
    const label = $('#ch13RotLabel');
    const c1 = $('#ch13RotC1');
    const arg1 = $('#ch13RotArg1');
    const vecX = 4, vecY = 2;
    const length = Math.hypot(vecX, vecY);
    const baseArg = Math.atan2(vecY, vecX);

    function fmt(n, d = 2) {
      const s = n.toFixed(d);
      return s === '-0.00' ? '0.00' : s;
    }
    function place(vx, vy) {
      return [OX + vx * SCALE, OY - vy * SCALE];
    }

    function update() {
      const deg = Number(range.value);
      const rad = (deg * Math.PI) / 180;
      const cos = Math.cos(rad), sin = Math.sin(rad);
      const rx = vecX * cos - vecY * sin;
      const ry = vecX * sin + vecY * cos;
      const [px, py] = place(rx, ry);

      vec.setAttribute('x2', px);
      vec.setAttribute('y2', py);
      tip.setAttribute('cx', px);
      tip.setAttribute('cy', py);
      label.setAttribute('x', px + 12);
      label.setAttribute('y', py - 8);

      const r = 58;
      const a0 = 0;
      const a1 = rad;
      const x0 = OX + r * Math.cos(a0), y0 = OY - r * Math.sin(a0);
      const x1 = OX + r * Math.cos(a1), y1 = OY - r * Math.sin(a1);
      arc.setAttribute('d', `M${x0} ${y0} A${r} ${r} 0 ${Math.abs(deg) > 180 ? 1 : 0} ${deg >= 0 ? 0 : 1} ${x1} ${y1}`);

      angleEl.textContent = `θ = ${fmt(deg, 1)}°`;
      c1.textContent = `(${fmt(rx)}, ${fmt(ry)})`;
      arg1.textContent = fmt(Math.atan2(ry, rx), 3);
      capEl.textContent = Math.abs(deg) < 0.05
        ? 'No rotation: the two drawings coincide. Multiplication by 1 + 0i is the identity.'
        : `Rotating (4, 2) by ${fmt(deg, 1)}° gives (${fmt(rx)}, ${fmt(ry)}). The length is unchanged at ${fmt(length, 3)}.`;
      range.setAttribute('aria-valuetext', `${fmt(deg, 1)} degrees`);
    }

    range.addEventListener('input', update);
    $$('.ch13-preset', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        range.value = btn.dataset.rot;
        update();
      });
    });
    update();
  })();

  /* ============================================================
     13.1.2 Orientation lab
     ============================================================ */
  (() => {
    const root = $('#ch13Orient');
    const svg = $('#ch13OrientSvg');
    if (!root || !svg) return;

    drawGrid($('#ch13OrientGrid'), { left: 34, right: 590, top: 18, bottom: 384, ox: 310, oy: 270 }, 46);

    const OX = 310, OY = 270, SCALE = 46;
    const start = { a: { x: -4, y: -2 }, b: { x: 4, y: -1 }, p: { x: -2, y: 3 } };
    const state = { a: { ...start.a }, b: { ...start.b }, p: { ...start.p } };
    const els = {
      a: $('#ch13OA'), b: $('#ch13OB'), p: $('#ch13OP'),
      al: $('#ch13OALabel'), bl: $('#ch13OBLabel'), pl: $('#ch13OPLabel')
    };
    const line = $('#ch13OLine');
    const tri = $('#ch13OTri');
    const guide = $('#ch13OGuide');
    const side = $('#ch13OSideLabel');
    const cap = $('#ch13OCap');
    const coordA = $('#ch13OCoordA');
    const coordB = $('#ch13OCoordB');
    const coordP = $('#ch13OCoordP');
    const crossEl = $('#ch13OCross');
    const distEl = $('#ch13ODist');
    let drag = null;

    const toScreen = (pt) => [OX + pt.x * SCALE, OY - pt.y * SCALE];
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    function update() {
      const A = toScreen(state.a), B = toScreen(state.b), P = toScreen(state.p);
      els.a.setAttribute('cx', A[0]); els.a.setAttribute('cy', A[1]);
      els.b.setAttribute('cx', B[0]); els.b.setAttribute('cy', B[1]);
      els.p.setAttribute('cx', P[0]); els.p.setAttribute('cy', P[1]);
      els.al.setAttribute('x', A[0]); els.al.setAttribute('y', A[1] + 30);
      els.bl.setAttribute('x', B[0]); els.bl.setAttribute('y', B[1] + 30);
      els.pl.setAttribute('x', P[0]); els.pl.setAttribute('y', P[1] - 18);
      line.setAttribute('x1', A[0]); line.setAttribute('y1', A[1]);
      line.setAttribute('x2', B[0]); line.setAttribute('y2', B[1]);
      tri.setAttribute('points', `${A[0]},${A[1]} ${B[0]},${B[1]} ${P[0]},${P[1]}`);
      guide.setAttribute('x1', P[0]); guide.setAttribute('y1', P[1]);
      guide.setAttribute('x2', P[0]); guide.setAttribute('y2', OY);

      const abx = state.b.x - state.a.x;
      const aby = state.b.y - state.a.y;
      const apx = state.p.x - state.a.x;
      const apy = state.p.y - state.a.y;
      const cross = abx * apy - aby * apx;
      const distance = Math.abs(cross) / Math.hypot(abx, aby);
      const sideText = cross > 0 ? 'left' : cross < 0 ? 'right' : 'on the line';

      coordA.textContent = `(${state.a.x}, ${state.a.y})`;
      coordB.textContent = `(${state.b.x}, ${state.b.y})`;
      coordP.textContent = `(${state.p.x}, ${state.p.y})`;
      crossEl.textContent = `${cross}`;
      distEl.textContent = Number.isFinite(distance) ? distance.toFixed(2) : '—';
      side.textContent = sideText;
      side.setAttribute('x', P[0] + 24);
      side.setAttribute('y', P[1] - 20);
      cap.textContent = cross > 0
        ? 'P is on the left of the directed line A → B, so the cross product is positive.'
        : cross < 0
          ? 'P is on the right of the directed line A → B, so the cross product is negative.'
          : 'P is exactly on the line through A and B, so the cross product is zero.';
      els.p.setAttribute('aria-valuetext', `P at ${state.p.x}, ${state.p.y}. ${sideText}.`);
    }

    function svgPoint(e) {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      return { x: clamp(Math.round((p.x - OX) / SCALE), -6, 6), y: clamp(Math.round((OY - p.y) / SCALE), -2, 5) };
    }

    function begin(e, key) {
      e.preventDefault();
      drag = key;
      els[key].classList.add('is-drag');
      els[key].setPointerCapture?.(e.pointerId);
      update();
    }

    Object.keys(els).forEach((key) => {
      if (key === 'al' || key === 'bl' || key === 'pl') return;
      const node = els[key];
      node.addEventListener('pointerdown', (e) => begin(e, key));
      node.addEventListener('keydown', (e) => {
        const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
        if (!moves[e.key]) return;
        e.preventDefault();
        state[key].x = clamp(state[key].x + moves[e.key][0], -6, 6);
        state[key].y = clamp(state[key].y + moves[e.key][1], -2, 5);
        update();
      });
    });

    svg.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const p = svgPoint(e);
      state[drag].x = p.x;
      state[drag].y = p.y;
      update();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => {
      svg.addEventListener(type, () => {
        if (!drag) return;
        els[drag].classList.remove('is-drag');
        drag = null;
      });
    });

    $('#ch13OReset')?.addEventListener('click', () => {
      state.a = { ...start.a };
      state.b = { ...start.b };
      state.p = { ...start.p };
      update();
    });

    update();
  })();

  /* ============================================================
     13.1.3 Polygon area
     ============================================================ */
  (() => {
    const root = $('#ch13Area');
    if (!root) return;
    const grid = $('#ch13AreaGrid');
    const dots = $('#ch13AreaDots');
    const formula = $('#ch13AreaFormula');
    const note = $('#ch13AreaNote');
    const legend = $('#ch13AreaLegend');
    const cap = $('#ch13AreaCap');

    const SX = 58, SY = 50, OX = 70, OY = 350;
    const px = (x) => OX + x * SX;
    const py = (y) => OY - y * SY;
    drawGrid(grid, { left: 40, right: 600, top: 30, bottom: 372, ox: OX, oy: OY }, 46);

    const interior = [[3, 4], [4, 4], [5, 2], [5, 3], [5, 4], [6, 3]];
    const boundary = [[2, 4], [4, 1], [4, 2], [4, 3], [5, 5], [6, 4], [7, 3]];
    const isInt = new Set(interior.map(([x, y]) => `${x},${y}`));
    const isBnd = new Set(boundary.map(([x, y]) => `${x},${y}`));

    for (let x = 0; x <= 8; x++) {
      for (let y = 0; y <= 6; y++) {
        const key = `${x},${y}`;
        let cls = 'dot-g';
        if (isInt.has(key)) cls = 'dot-i';
        else if (isBnd.has(key)) cls = 'dot-b';
        el('circle', { cx: px(x), cy: py(y), r: cls === 'dot-g' ? 1.6 : 3.6, class: cls }, dots);
      }
    }

    const buttons = $$('[data-area]', root);
    function choose(kind) {
      const pick = kind === 'pick';
      root.classList.toggle('is-pick', pick);
      buttons.forEach((b) => {
        const on = b.dataset.area === kind;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      if (pick) {
        cap.textContent = 'Pick counts lattice points instead of trapezoids. Interior points are solid; boundary points are rings.';
        formula.textContent = 'a + b/2 − 1 = 6 + 7/2 − 1 = 17/2';
        note.textContent = 'Six points are strictly inside; seven lie on the boundary, including the five vertices and two points on edges. The result is 8.5.';
        legend.innerHTML = '<span><i class="ch13-swatch ch13-swatch--dot"></i>interior point</span><span><i class="ch13-swatch ch13-swatch--ring"></i>boundary point</span>';
      } else {
        cap.textContent = 'Each edge contributes a signed trapezoid. The signs cancel the area outside the polygon.';
        formula.textContent = '½ |5 + 20 + 10 − 10 − 8| = 17/2';
        note.textContent = 'The sum is 17, so the area is 8.5. Walking the other way would negate every term, which is why the formula takes an absolute value.';
        legend.innerHTML = '<span><i class="ch13-swatch ch13-swatch--pos"></i>positive trapezoid</span><span><i class="ch13-swatch ch13-swatch--neg"></i>negative trapezoid</span>';
      }
    }
    buttons.forEach((b) => b.addEventListener('click', () => choose(b.dataset.area)));
    choose('shoelace');
  })();

  /* ============================================================
     13.1.4 Distance toggle
     ============================================================ */
  (() => {
    const root = $('#ch13Dist');
    if (!root) return;
    drawGrid($('#ch13DistGrid'), { left: 50, right: 585, top: 20, bottom: 292, ox: 70, oy: 292 }, 55);
    const cap = $('#ch13DistCap');
    const value = $('#ch13DistValue');
    const buttons = $$('[data-dist]', root);
    function choose(kind) {
      const man = kind === 'manhattan';
      root.classList.toggle('is-manhattan', man);
      buttons.forEach((b) => {
        const on = b.dataset.dist === kind;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      cap.textContent = man
        ? 'The Manhattan distance walks along the axes: |5−2| + |2−1| = 3 + 1 = 4.'
        : 'The Euclidean distance is the length of the difference vector: √((5−2)² + (2−1)²) = √10.';
      value.textContent = man ? 'Manhattan = 4' : '√10 ≈ 3.162';
    }
    buttons.forEach((b) => b.addEventListener('click', () => choose(b.dataset.dist)));
    choose('euclid');
  })();

  /* ============================================================
     13.2.2 Closest pair backdrop
     ============================================================ */
  const closestGrid = $('#ch13ClosestGrid');
  if (closestGrid) {
    drawGrid(closestGrid, { left: 48, right: 660, top: 52, bottom: 330, ox: 48, oy: 330 }, 50);
  }

  /* ============================================================
     13.2.1 Sweep line stepper
     ============================================================ */
  (() => {
    const root = $('#ch13Sweep');
    const svg = $('#ch13SweepSvg');
    if (!root || !svg) return;

    drawGrid($('#ch13SweepGrid'), { left: 80, right: 590, top: 44, bottom: 372, ox: 80, oy: 380 }, 48);

    const stepEl = $('#ch13SweepStep');
    const capEl = $('#ch13SweepCap');
    const eventEl = $('#ch13SweepEvent');
    const activeEl = $('#ch13SweepActive');
    const countEl = $('#ch13SweepCount');
    const line = $('#ch13SweepLine');
    const lineLabel = $('#ch13SweepLineLabel');
    const marks = $('#ch13SweepMarks');
    const hits = $('#ch13SweepHits');
    const dots = $$('#ch13SweepDots span');
    const prev = $('#ch13SweepPrev');
    const next = $('#ch13SweepNext');
    const reset = $('#ch13SweepReset');
    const segEls = new Map();
    $$('[data-seg]', svg).forEach((node) => segEls.set(node.dataset.seg, node));

    const Y = (y) => 380 - y * 40;
    const events = [
      { x: 1, type: 'begin', seg: 'H1', y: 2 },
      { x: 3, type: 'begin', seg: 'H2', y: 5 },
      { x: 4, type: 'begin', seg: 'H3', y: 7 },
      { x: 4, type: 'vertical', seg: 'V1', y1: 3, y2: 6, hit: 1, hits: [{ x: 4, y: 5 }] },
      { x: 6, type: 'end', seg: 'H1', y: 2 },
      { x: 8, type: 'vertical', seg: 'V2', y1: 4, y2: 8, hit: 2, hits: [{ x: 8, y: 5 }, { x: 8, y: 7 }] },
      { x: 9, type: 'end', seg: 'H2', y: 5 },
      { x: 9, type: 'end', seg: 'H3', y: 7 }
    ];
    const PX = (x) => 80 + x * 48;

    // Several events can share an x; label the axis once per coordinate.
    const labelledX = new Set();
    events.forEach((ev, i) => {
      const cx = PX(ev.x);
      el('circle', { cx, cy: 372, r: 3, 'data-mark': i }, marks);
      if (labelledX.has(ev.x)) return;
      labelledX.add(ev.x);
      el('text', {
        x: cx, y: 402,
        'text-anchor': 'middle',
        class: 'ch13-event-x'
      }, marks).textContent = ev.x;
    });
    hits.innerHTML = '';

    let step = 0;
    function replay(limit) {
      const active = new Set();
      let total = 0;
      for (let i = 0; i < limit; i++) {
        const ev = events[i];
        if (ev.type === 'begin') active.add(ev.y);
        else if (ev.type === 'end') active.delete(ev.y);
        else total += ev.hit;
      }
      return { active, total };
    }
    function render() {
      const state = replay(step);
      const active = state.active;
      const ev = step > 0 ? events[step - 1] : null;
      const x = ev ? ev.x : 0.4;
      line.setAttribute('x1', PX(x));
      line.setAttribute('x2', PX(x));
      lineLabel.setAttribute('x', PX(x) + 6);
      lineLabel.textContent = `x = ${x}`;

      segEls.forEach((node, name) => {
        node.classList.remove('is-active', 'is-done');
        if (name[0] === 'H') {
          const y = name === 'H1' ? 2 : name === 'H2' ? 5 : 7;
          if (active.has(y)) node.classList.add('is-active');
        } else {
          const ei = events.findIndex((e) => e.seg === name);
          if (step > ei + 1) node.classList.add('is-done');
        }
      });

      $$('[data-mark]', marks).forEach((node) => {
        node.classList.toggle('is-current', Number(node.dataset.mark) === step - 1);
      });

      hits.innerHTML = '';
      for (let i = 0; i < step; i++) {
        const e = events[i];
        if (e.type === 'vertical' && e.hits) {
          e.hits.forEach((h) => {
            el('circle', { cx: PX(h.x), cy: Y(h.y), r: 4 }, hits);
          });
        }
      }

      stepEl.textContent = step === 0 ? 'Start · event 0 / 8' : `Event ${step} / 8`;
      eventEl.textContent = ev ? `${ev.type} ${ev.seg}` : '—';
      activeEl.textContent = active.size ? [...active].sort((a, b) => a - b).join(', ') : '∅';
      countEl.textContent = state.total;
      dots.forEach((d, i) => d.classList.toggle('is-on', i < step));

      if (!ev) {
        capEl.textContent = 'Press begin. Events are processed from left to right; at each vertical segment the active heights are counted.';
      } else if (ev.type === 'begin') {
        capEl.textContent = `${ev.seg} begins at x = ${ev.x}. Its height ${ev.y} joins the active set.`;
      } else if (ev.type === 'end') {
        capEl.textContent = `${ev.seg} ends at x = ${ev.x}. Height ${ev.y} leaves the active set.`;
      } else {
        capEl.textContent = `${ev.seg} spans x = ${ev.x}, y = ${ev.y1}..${ev.y2}. The active heights are {${[...active].sort((a, b) => a - b).join(', ')}}; ${ev.hit} fall inside the span.`;
      }

      prev.disabled = step === 0;
      next.textContent = step === 0 ? 'Begin' : step === events.length ? 'Restart' : 'Next event';
      next.innerHTML += ' <svg class="icon"><use href="#i-arrow"/></svg>';
      if (step === 0) next.innerHTML = 'Begin <svg class="icon"><use href="#i-arrow"/></svg>';
    }

    next.addEventListener('click', () => {
      step = step === events.length ? 0 : step + 1;
      render();
    });
    prev.addEventListener('click', () => { if (step > 0) { step--; render(); } });
    reset.addEventListener('click', () => { step = 0; render(); });
    render();
  })();

  /* ============================================================
     13.2.3 Convex hull stepper
     ============================================================ */
  (() => {
    const root = $('#ch13Hull');
    const svg = $('#ch13HullSvg');
    if (!root || !svg) return;

    drawGrid($('#ch13HullGrid'), { left: 64, right: 590, top: 42, bottom: 374, ox: 80, oy: 360 }, 46);

    const pts = [
      { x: 1, y: 2, px: 80, py: 326 },
      { x: 2, y: 7, px: 138, py: 156 },
      { x: 3, y: 3, px: 196, py: 292 },
      { x: 4, y: 8, px: 254, py: 122 },
      { x: 5, y: 1, px: 312, py: 360 },
      { x: 6, y: 6, px: 370, py: 190 },
      { x: 7, y: 4, px: 428, py: 258 },
      { x: 8, y: 9, px: 486, py: 88 },
      { x: 9, y: 2, px: 544, py: 326 }
    ];
    const pointEls = new Map();
    $$('[data-p]', svg).forEach((node) => pointEls.set(Number(node.dataset.p), node));
    const chainEl = $('#ch13HullChain');
    const polyEl = $('#ch13HullPoly');
    const scanEl = $('#ch13HullScan');
    const stepEl = $('#ch13HullStep');
    const capEl = $('#ch13HullCap');
    const pointEl = $('#ch13HullPoint');
    const lenEl = $('#ch13HullLen');
    const removedEl = $('#ch13HullRemoved');
    const dots = $$('#ch13HullDots span');
    const prev = $('#ch13HullPrev');
    const next = $('#ch13HullNext');
    const reset = $('#ch13HullReset');

    const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    const states = [];
    let chain = [];
    let out = new Set();
    states.push({ chain: [], out: new Set(), current: null, caption: 'Sort by x, then by y. Andrew’s algorithm builds the upper hull first, from left to right.' });

    pts.forEach((p, i) => {
      chain = chain.concat([p]);
      const removed = [];
      while (chain.length >= 3 && cross(chain[chain.length - 3], chain[chain.length - 2], chain[chain.length - 1]) >= 0) {
        removed.push(chain.splice(chain.length - 2, 1)[0]);
      }
      removed.forEach((q) => out.add(q));
      const last = removed[removed.length - 1];
      const caption = last
        ? `Adding point ${i + 1} makes a left turn at point ${pts.indexOf(last) + 1}, so that point leaves the chain.`
        : `Add point ${i + 1}. The chain still turns right at every corner.`;
      states.push({ chain: chain.slice(), out: new Set(out), current: p, caption });
    });

    const hullIdx = [0, 4, 8, 7, 3, 1];
    states.push({
      chain: hullIdx.map((i) => pts[i]),
      out: new Set(),
      current: null,
      final: true,
      caption: 'The upper pass is complete. Mirroring it from the other side closes the lower hull: the remaining points are the convex hull.'
    });

    function pathOf(list, close = false) {
      if (!list.length) return '';
      const d = list.map((p, i) => `${i ? 'L' : 'M'}${p.px} ${p.py}`).join(' ');
      return close ? `${d} Z` : d;
    }

    function render() {
      const s = states[Math.min(step, states.length - 1)];
      chainEl.setAttribute('d', pathOf(s.chain, !!s.final));
      polyEl.setAttribute('d', s.final ? pathOf(s.chain, true) : '');
      root.classList.toggle('is-done', !!s.final);

      pointEls.forEach((node, i) => {
        node.classList.remove('is-chain', 'is-current', 'is-out');
        if (s.chain.some((p) => pts.indexOf(p) === i)) node.classList.add('is-chain');
        if (s.current && pts[i] === s.current) node.classList.add('is-current');
        if (s.out.has(pts[i])) node.classList.add('is-out');
      });

      scanEl.innerHTML = '';
      if (s.current) {
        el('circle', { cx: s.current.px, cy: s.current.py, r: 16 }, scanEl);
      }

      stepEl.textContent = `Step ${step} / ${states.length - 1}`;
      capEl.textContent = s.caption;
      pointEl.textContent = s.current ? `${s.current.x}, ${s.current.y}` : '—';
      lenEl.textContent = s.chain.length;
      removedEl.textContent = s.out.size;
      dots.forEach((d, i) => d.classList.toggle('is-on', i < step));

      prev.disabled = step === 0;
      next.textContent = step === states.length - 1 ? 'Restart' : step === 0 ? 'Start' : 'Next step';
      next.innerHTML += ' <svg class="icon"><use href="#i-arrow"/></svg>';
      if (step === states.length - 1) next.innerHTML = 'Restart <svg class="icon"><use href="#i-reset"/></svg>';
    }

    let step = 0;
    next.addEventListener('click', () => {
      step = step === states.length - 1 ? 0 : step + 1;
      render();
    });
    prev.addEventListener('click', () => { if (step > 0) { step--; render(); } });
    reset.addEventListener('click', () => { step = 0; render(); });
    render();
  })();

  /* ============================================================
     Code cards
     ============================================================ */
  const complexCard = $('#s1311 [data-code-card]');
  if (complexCard) {
    mountCodeCard(complexCard, {
      storageKey: 'ch13-code-complex',
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++',
          file: 'complex-geometry.cpp',
          note: 'The complex class gives points, vectors, lengths, angles and rotation in one type.',
          type: 'O(1)',
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'using C = long double;',
            'using P = complex<C>;',
            '#define X real()',
            '#define Y imag()',
            '',
            'int main() {',
            '    P v = {4, 2};',
            '    cout << abs(v) << "\\n";    // 4.47214',
            '    cout << arg(v) << "\\n";    // 0.463648',
            '',
            '    v *= polar(1.0, 0.5);      // rotate 1/2 rad',
            '    cout << arg(v) << "\\n";    // 0.963648',
            '',
            '    P a = {4, 2}, b = {1, 2};',
            '    C cross = (conj(a) * b).Y; // 6',
            '    cout << cross << "\\n";',
            '}'
          ]
        },
        python: {
          label: 'Python',
          file: 'complex_geometry.py',
          note: 'Python’s complex type uses the same arithmetic: conjugate, multiply, read the imaginary part.',
          type: 'O(1)',
          code: [
            'from cmath import phase, rect',
            '',
            'v = complex(4, 2)',
            'print(abs(v))          # 4.47213595499958',
            'print(phase(v))        # 0.4636476090008061',
            '',
            'v *= rect(1.0, 0.5)    # rotate 1/2 rad',
            'print(phase(v))        # 0.9636476090008061',
            '',
            'a, b = complex(4, 2), complex(1, 2)',
            'cross = (a.conjugate() * b).imag',
            'print(cross)           # 6.0'
          ]
        }
      }
    });
  }

  const areaCard = $('#s1313 [data-code-card]');
  if (areaCard) {
    mountCodeCard(areaCard, {
      storageKey: 'ch13-code-area',
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++',
          file: 'polygon-area.cpp',
          note: 'The shoelace sum gives twice the signed area. Absolute value, then divide by two.',
          type: 'O(n)',
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'using C = long long;',
            'using P = complex<C>;',
            '#define X real()',
            '#define Y imag()',
            '',
            'C twiceArea(const vector<P>& p) {',
            '    C s = 0;',
            '    int n = p.size();',
            '    for (int i = 0; i < n; ++i)',
            '        s += (conj(p[i]) * p[(i + 1) % n]).Y;',
            '    return abs(s);',
            '}',
            '',
            'int main() {',
            '    vector<P> p = {{4,1},{7,3},{5,5},{2,4},{4,3}};',
            '    cout << twiceArea(p) / 2.0 << "\\n"; // 8.5',
            '}'
          ]
        },
        python: {
          label: 'Python',
          file: 'polygon_area.py',
          note: 'With integer coordinates the cross terms stay exact; only the final division is real.',
          type: 'O(n)',
          code: [
            'def twice_area(points):',
            '    s = 0',
            '    for a, b in zip(points, points[1:] + points[:1]):',
            '        s += a[0] * b[1] - a[1] * b[0]',
            '    return abs(s)',
            '',
            'poly = [(4, 1), (7, 3), (5, 5), (2, 4), (4, 3)]',
            'print(twice_area(poly) / 2)  # 8.5'
          ]
        }
      }
    });
  }

  const hullCard = $('#s1323 [data-code-card]');
  if (hullCard) {
    mountCodeCard(hullCard, {
      storageKey: 'ch13-code-hull',
      initial: 'cpp',
      langs: {
        cpp: {
          label: 'C++',
          file: 'convex-hull.cpp',
          note: 'Sorting dominates. The cross-product test removes every non-right turn.',
          type: 'O(n log n)',
          code: [
            '#include <bits/stdc++.h>',
            'using namespace std;',
            '',
            'using C = long long;',
            'using P = complex<C>;',
            '#define X real()',
            '#define Y imag()',
            '',
            'C cross(P a, P b, P c) {',
            '    return (conj(b - a) * (c - a)).Y;',
            '}',
            '',
            'vector<P> convexHull(vector<P> p) {',
            '    sort(p.begin(), p.end(), [](P a, P b) {',
            '        return a.X != b.X ? a.X < b.X : a.Y < b.Y;',
            '    });',
            '    vector<P> h;',
            '    for (int pass = 0; pass < 2; ++pass) {',
            '        int start = h.size();',
            '        for (P q : p) {',
            '            while (h.size() >= start + 2 &&',
            '                   cross(h[h.size()-2], h.back(), q) <= 0)',
            '                h.pop_back();',
            '            h.push_back(q);',
            '        }',
            '        h.pop_back();',
            '        reverse(p.begin(), p.end());',
            '    }',
            '    return h; // counterclockwise',
            '}'
          ]
        },
        python: {
          label: 'Python',
          file: 'convex_hull.py',
          note: 'The same two passes; tuples sort by x and then by y without a custom comparator.',
          type: 'O(n log n)',
          code: [
            'def cross(o, a, b):',
            '    return ((a[0] - o[0]) * (b[1] - o[1])',
            '            - (a[1] - o[1]) * (b[0] - o[0]))',
            '',
            'def convex_hull(points):',
            '    p = sorted(points)',
            '    h = []',
            '    for _ in range(2):',
            '        start = len(h)',
            '        for q in p:',
            '            while (len(h) >= start + 2 and',
            '                   cross(h[-2], h[-1], q) <= 0):',
            '                h.pop()',
            '            h.append(q)',
            '        h.pop()',
            '        p.reverse()',
            '    return h'
          ]
        }
      }
    });
  }
})();

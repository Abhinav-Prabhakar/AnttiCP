/* ==========================================================================
   Guide to Competitive Programming — Chapter 01
   Interactive edition
   ========================================================================== */

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt = (n) => Number(n).toLocaleString('en-US');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- reveal ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
$$('[data-reveal]').forEach((el) => revealObserver.observe(el));

/* ---------- progress + topbar ---------- */
const progressFill = $('#progressFill');
const topbarPct = $('#topbarPct');
const topbar = $('#topbar');
let scrollTicking = false;
function updateScrollUI() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const pct = max > 0 ? clamp((window.scrollY / max) * 100, 0, 100) : 0;
  progressFill.style.width = pct + '%';
  topbarPct.textContent = Math.round(pct) + '%';
  topbar.classList.toggle('is-scrolled', window.scrollY > 8);
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(updateScrollUI); }
}, { passive: true });
updateScrollUI();

/* ---------- scrollspy ---------- */
const railItems = $$('.siderail__item');
const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    railItems.forEach((item) => item.classList.toggle('is-active', item.dataset.section === id));
  });
}, { rootMargin: '-18% 0px -68% 0px', threshold: 0 });
['s11', 's111', 's112', 's12', 's13', 's14'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) spy.observe(el);
});

/* ---------- tooltip ---------- */
const tooltip = $('#tooltip');
let tipTimer = null;
let tipCurrent = null;
function placeTooltip(el) {
  if (!el || !el.getBoundingClientRect) return;
  const r = el.getBoundingClientRect();
  const pad = 12;
  const halfW = Math.min((tooltip.offsetWidth || 180) / 2 + 8, window.innerWidth / 2);
  const x = clamp(r.left + r.width / 2, halfW, window.innerWidth - halfW);
  const below = r.top < 64;
  tooltip.style.left = x + 'px';
  tooltip.style.top = (below ? r.bottom + 8 : r.top - 8) + 'px';
  tooltip.style.transform = below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)';
}
function showTip(el) {
  const text = el.getAttribute('data-tip');
  if (!text) return;
  clearTimeout(tipTimer);
  tipCurrent = el;
  tooltip.textContent = text;
  tooltip.hidden = false;
  placeTooltip(el);
  requestAnimationFrame(() => tooltip.classList.add('is-on'));
}
function hideTip(el) {
  if (el && tipCurrent && el !== tipCurrent) return;
  tipCurrent = null;
  tooltip.classList.remove('is-on');
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => { if (!tipCurrent) tooltip.hidden = true; }, 140);
}
document.addEventListener('mouseover', (e) => {
  const el = e.target.closest('[data-tip]');
  if (el) showTip(el);
});
document.addEventListener('mouseout', (e) => {
  const el = e.target.closest('[data-tip]');
  if (el) hideTip(el);
});
document.addEventListener('focusin', (e) => {
  const el = e.target.closest('[data-tip]');
  if (el) showTip(el);
});
document.addEventListener('focusout', (e) => {
  const el = e.target.closest('[data-tip]');
  if (el) hideTip(el);
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-tip]')) hideTip();
});
window.addEventListener('scroll', () => { if (tipCurrent) placeTooltip(tipCurrent); }, { passive: true });

/* ---------- touch wording ---------- */
if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
  const touchHints = {
    '.bookmap__hint': 'Tap a chapter to preview',
    '.readout__hint': 'Tap the chart or a term'
  };
  Object.entries(touchHints).forEach(([sel, text]) => {
    const el = $(sel);
    if (el) el.textContent = text;
  });
}

/* ---------- contents drawer ---------- */
const drawer = $('#contentsDrawer');
const contentsBtn = $('#contentsBtn');
let lastFocus = null;
let closeTimer = null;
function openDrawer() {
  clearTimeout(closeTimer);
  lastFocus = document.activeElement;
  drawer.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    drawer.classList.add('is-open');
    const close = $('.drawer__close', drawer);
    if (close) close.focus({ preventScroll: true });
  });
}
function closeDrawer() {
  drawer.classList.remove('is-open');
  document.body.style.overflow = '';
  closeTimer = setTimeout(() => { drawer.hidden = true; }, 500);
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}
contentsBtn.addEventListener('click', openDrawer);
$('#endContents').addEventListener('click', openDrawer);
$$('[data-close-drawer]', drawer).forEach((el) => {
  el.addEventListener('click', (e) => {
    if (el.tagName === 'A') {
      const href = el.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        closeDrawer();
        const target = document.querySelector(href);
        setTimeout(() => {
          if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }, 360);
      } else {
        closeDrawer();
      }
    } else {
      closeDrawer();
    }
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
  if (e.key === 'Tab' && !drawer.hidden) {
    const focusables = $$('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', drawer)
      .filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* ---------- hero traveller ---------- */
(() => {
  const path = $('.hero-path--live');
  const traveller = $('.hero-traveller');
  if (!path || !traveller || reduceMotion) { if (traveller) traveller.style.display = 'none'; return; }
  const total = path.getTotalLength();
  let start = null;
  const duration = 8000;
  function tick(ts) {
    if (!start) start = ts;
    const t = ((ts - start) % duration) / duration;
    const p = path.getPointAtLength(total * t);
    traveller.setAttribute('cx', p.x);
    traveller.setAttribute('cy', p.y);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ---------- language bars ---------- */
const langChart = $('#langChart');
if (langChart) {
  const langObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      langChart.classList.add('is-inview');
      $$('[data-countup]', langChart).forEach((el) => animateCount(el, Number(el.dataset.countup), 1300));
      langObserver.disconnect();
    });
  }, { threshold: 0.35 });
  langObserver.observe(langChart);
}
function animateCount(el, target, duration) {
  if (reduceMotion) { el.textContent = target; return; }
  const t0 = performance.now();
  function step(now) {
    const t = clamp((now - t0) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

/* ---------- IOI dot clusters ---------- */
(() => {
  const svg = $('#ioiDots');
  if (!svg) return;
  const ns = 'http://www.w3.org/2000/svg';
  const cols = 10, rows = 8;
  const startX = 24, startY = 18, gapX = 28, gapY = 18;
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'ioi-cluster');
      g.setAttribute('transform', `translate(${startX + c * gapX} ${startY + r * gapY})`);
      g.style.setProperty('--i', i);
      const title = document.createElementNS(ns, 'title');
      title.textContent = 'One country · four students';
      g.appendChild(title);
      [[-3.4, -3.4], [3.4, -3.4], [-3.4, 3.4], [3.4, 3.4]].forEach(([x, y]) => {
        const circle = document.createElementNS(ns, 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 1.75);
        g.appendChild(circle);
      });
      svg.appendChild(g);
      i++;
    }
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { svg.classList.add('is-inview'); obs.disconnect(); }
    });
  }, { threshold: 0.3 });
  obs.observe(svg);
})();

/* ---------- ICPC funnel ---------- */
(() => {
  const svg = $('#icpcDots');
  if (!svg) return;
  const ns = 'http://www.w3.org/2000/svg';
  // dense left field
  const leftCols = 18, leftRows = 12;
  let idx = 0;
  for (let r = 0; r < leftRows; r++) {
    for (let c = 0; c < leftCols; c++) {
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', 12 + c * 9.2);
      dot.setAttribute('cy', 14 + r * 11.6);
      dot.setAttribute('r', 1.35);
      dot.setAttribute('class', 'icpc-dot');
      dot.style.setProperty('--i', idx++);
      svg.appendChild(dot);
    }
  }
  // guide funnel
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('class', 'icpc-funnel');
  path.setAttribute('d', 'M176 16 C 208 16, 216 48, 238 54 M176 154 C 208 154, 216 122, 238 116');
  svg.appendChild(path);
  // final slots: 133 dots (19 x 7)
  const finalCols = 19;
  for (let i = 0; i < 133; i++) {
    const c = i % finalCols;
    const r = Math.floor(i / finalCols);
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', 242 + c * 3.8);
    dot.setAttribute('cy', 68 + r * 5.4);
    dot.setAttribute('r', 1.35);
    dot.setAttribute('class', 'icpc-dot icpc-dot--final');
    dot.style.setProperty('--i', idx++);
    svg.appendChild(dot);
  }
  const label = document.createElementNS(ns, 'text');
  label.setAttribute('x', 242);
  label.setAttribute('y', 60);
  label.setAttribute('class', 'icpc-label');
  label.textContent = 'finals';
  svg.appendChild(label);
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { svg.classList.add('is-inview'); obs.disconnect(); }
    });
  }, { threshold: 0.3 });
  obs.observe(svg);
})();

/* ---------- freeze toggle ---------- */
(() => {
  const freeze = $('[data-freeze]');
  const btn = $('#freezeToggle');
  if (!freeze || !btn) return;
  btn.addEventListener('click', () => {
    const frozen = freeze.classList.toggle('is-frozen');
    btn.setAttribute('aria-pressed', String(frozen));
    $('#freezeLabel').textContent = frozen ? 'Hide final hour' : 'Show final hour';
    $('#freezeNote').textContent = frozen
      ? 'For the last hour the scoreboard is frozen and it is not possible to see the results of the last submissions.'
      : 'During the contest, competitors may view the results of other teams.';
  });
})();

/* ---------- tips: matrix ---------- */
(() => {
  const matrix = $('#matrix');
  if (!matrix) return;
  const quadrants = $$('.quadrant', matrix);
  const toggles = $$('[data-matrix-mode]');
  const note = $('#matrixNote');
  const copy = {
    tempting: 'Easy and nice feels productive. The hard problems stay unsolved.',
    effective: 'Hard and tedious problems are where the learning is.'
  };
  function setMode(mode) {
    quadrants.forEach((q) => {
      const on = q.dataset.quad === mode;
      q.classList.toggle('is-on', on);
      q.setAttribute('aria-pressed', String(on));
    });
    toggles.forEach((t) => t.classList.toggle('is-active', t.dataset.matrixMode === mode));
    note.textContent = copy[mode];
  }
  toggles.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.matrixMode)));
  quadrants.forEach((q) => {
    q.addEventListener('click', () => {
      if (q.dataset.quad === 'tempting' || q.dataset.quad === 'effective') setMode(q.dataset.quad);
    });
  });
  setMode('effective');
})();

/* ---------- tips: ratio in view ---------- */
(() => {
  const ratio = $('#ratio');
  if (!ratio) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { ratio.classList.add('is-inview'); obs.disconnect(); }
    });
  }, { threshold: 0.4 });
  obs.observe(ratio);
})();

/* ---------- tips: allocation slider ---------- */
(() => {
  const alloc = $('#alloc');
  const range = $('#thinkRange');
  if (!alloc || !range) return;
  const think = $('#allocThink');
  const code = $('#allocCode');
  const thinkVal = $('#thinkVal');
  const codeVal = $('#codeVal');
  const note = $('#allocNote');
  function update() {
    const v = Number(range.value);
    think.style.width = v + '%';
    code.style.width = (100 - v) + '%';
    thinkVal.textContent = v + '%';
    codeVal.textContent = (100 - v) + '%';
    range.setAttribute('aria-valuetext', v + '% thinking');
    const warning = v < 50;
    alloc.classList.toggle('is-warning', warning);
    alloc.classList.toggle('is-think-narrow', v < 18);
    alloc.classList.toggle('is-code-narrow', (100 - v) < 18);
    note.textContent = warning
      ? 'It is a bad idea to spend most of the contest time writing code and finding bugs, instead of thinking of how to solve problems.'
      : 'Think first. The code is the easy part.';
  }
  range.addEventListener('input', update);
  update();
})();

/* ---------- segment tree tooltips ---------- */
(() => {
  const tree = $('#segTree');
  if (!tree) return;
  $$('.seg-node', tree).forEach((node) => {
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'button');
    node.setAttribute('data-tip', 'Covers the range ' + node.dataset.range);
    node.setAttribute('aria-label', 'Segment tree node covering range ' + node.dataset.range);
    node.addEventListener('click', () => {
      node.focus({ preventScroll: true });
      showTip(node);
    });
  });
})();

/* ---------- book map ---------- */
const chapters = [
  { num: '02', title: 'Programming Techniques', desc: 'Reviews features of the C++ programming language, and then discusses recursive algorithms and bit manipulation.', tags: ['C++', 'recursion', 'bits'] },
  { num: '03', title: 'Efficiency', desc: 'Focuses on efficiency: how to create algorithms that can quickly process large data sets.', tags: ['complexity', 'time'] },
  { num: '04', title: 'Sorting and Searching', desc: 'Discusses sorting algorithms and binary search, focusing on their applications in algorithm design.', tags: ['sorting', 'binary search'] },
  { num: '05', title: 'Data Structures', desc: 'Goes through a selection of data structures of the C++ standard library, such as vectors, sets, and maps.', tags: ['vector', 'set', 'map'] },
  { num: '06', title: 'Dynamic Programming', desc: 'Introduces an algorithm design technique called dynamic programming, and presents examples of problems that can be solved using it.', tags: ['DP', 'states'] },
  { num: '07', title: 'Graph Algorithms', desc: 'Discusses elementary graph algorithms, such as finding shortest paths and minimum spanning trees.', tags: ['graphs', 'shortest paths'] },
  { num: '08', title: 'Algorithm Design Topics', desc: 'Deals with some advanced algorithm design topics, such as bit-parallelism and amortized analysis.', tags: ['bits', 'amortized'] },
  { num: '09', title: 'Range Queries', desc: 'Focuses on efficiently processing array range queries, such as calculating sums of values and determining minimum values.', tags: ['arrays', 'queries'] },
  { num: '10', title: 'Tree Algorithms', desc: 'Presents specialized algorithms for trees, including methods for processing tree queries.', tags: ['trees', 'queries'] },
  { num: '11', title: 'Mathematics', desc: 'Discusses mathematical topics that are relevant in competitive programming.', tags: ['number theory', 'combinatorics'] },
  { num: '12', title: 'Advanced Graph Algorithms', desc: 'Presents advanced graph techniques, such as strongly connected components and maximum flows.', tags: ['SCC', 'flow'] },
  { num: '13', title: 'Geometry', desc: 'Focuses on geometric algorithms and presents techniques using which geometric problems can be solved conveniently.', tags: ['geometry', 'points'] },
  { num: '14', title: 'String Algorithms', desc: 'Deals with string techniques, such as string hashing, the Z-algorithm, and using suffix arrays.', tags: ['strings', 'hashing'] },
  { num: '15', title: 'Advanced Topics', desc: 'Discusses a selection of more advanced topics, such as square root algorithms and dynamic programming optimization.', tags: ['sqrt', 'DP optimization'] }
];
(() => {
  const list = $('#bookmapList');
  const detail = $('#bookmapDetail');
  if (!list || !detail) return;
  const bmNum = $('#bmNum'), bmTitle = $('#bmTitle'), bmDesc = $('#bmDesc'), bmTags = $('#bmTags');
  let active = 0;
  let swapToken = 0;
  chapters.forEach((ch, i) => {
    const btn = document.createElement('button');
    btn.className = 'bm-row' + (i === 0 ? ' is-active' : '');
    btn.type = 'button';
    btn.innerHTML = `<span class="bm-row__num">${ch.num}</span><span class="bm-row__title">${ch.title}</span><svg class="icon bm-row__arrow"><use href="#i-arrow"/></svg>`;
    btn.addEventListener('mouseenter', () => setChapter(i));
    btn.addEventListener('focus', () => setChapter(i));
    btn.addEventListener('click', () => setChapter(i));
    list.appendChild(btn);
  });
  function setChapter(i) {
    if (i === active) return;
    active = i;
    const ch = chapters[i];
    $$('.bm-row', list).forEach((row, idx) => row.classList.toggle('is-active', idx === i));
    const token = ++swapToken;
    detail.classList.add('is-swapping');
    setTimeout(() => {
      if (token !== swapToken) return;
      bmNum.textContent = ch.num;
      bmTitle.textContent = ch.title;
      bmDesc.textContent = ch.desc;
      bmTags.innerHTML = ch.tags.map((t) => `<span class="chip">${t}</span>`).join('');
      detail.classList.remove('is-swapping');
    }, 140);
  }
  // populate default
  bmTags.innerHTML = chapters[0].tags.map((t) => `<span class="chip">${t}</span>`).join('');
})();

/* ---------- drawer book list ---------- */
(() => {
  const list = $('#drawerBook');
  if (!list) return;
  const rows = [{ num: '01', title: 'Introduction', current: true }].concat(chapters.map((c) => ({ num: c.num, title: c.title })));
  rows.forEach((r) => {
    const div = document.createElement('div');
    div.className = 'drawer__book-row' + (r.current ? ' is-current' : '');
    div.innerHTML = `<span>${r.num}</span><span>${r.title}</span>`;
    list.appendChild(div);
  });
})();

/* ---------- shelf ---------- */
const books = [
  { tag: 'Pioneering', title: 'Programming Challenges', authors: 'Steven S. Skiena · Miguel A. Revilla', year: '2003', desc: 'A pioneering book in the field, published in 2003. Intended for readers with no background in competitive programming.', short: 'Programming Challenges', w: 54, h: 286, dark: true },
  { tag: 'Modern', title: 'Competitive Programming 3', authors: 'Steven Halim · Felix Halim', year: '2013', desc: 'A more recent book on competitive programming. Intended for readers with no background in competitive programming.', short: 'Competitive Programming 3', w: 56, h: 300, dark: false },
  { tag: 'Advanced', title: 'Looking for a Challenge?', authors: 'Polish programming contests', year: '2014', desc: 'A collection of difficult problems from Polish programming contests. The most interesting feature is that it provides detailed analyses of how to solve the problems. Intended for experienced competitive programmers.', short: 'Looking for a Challenge?', w: 60, h: 278, dark: true },
  { tag: 'Comprehensive', title: 'Introduction to Algorithms', authors: 'Cormen · Leiserson · Rivest · Stein', year: '2009', desc: 'The most comprehensive general algorithms book, also called the CLRS. A good resource if you want to check all details concerning an algorithm and how to rigorously prove that it is correct.', short: 'Introduction to Algorithms', w: 58, h: 312, dark: false },
  { tag: 'Techniques', title: 'Algorithm Design', authors: 'Jon Kleinberg · Éva Tardos', year: '2005', desc: 'Focuses on algorithm design techniques, and thoroughly discusses the divide and conquer method, greedy algorithms, dynamic programming, and maximum flow algorithms.', short: 'Algorithm Design', w: 48, h: 292, dark: true },
  { tag: 'Practical', title: 'The Algorithm Design Manual', authors: 'Steven S. Skiena', year: '2008', desc: 'A more practical book which includes a large catalogue of computational problems and describes ways how to solve them.', short: 'The Algorithm Design Manual', w: 62, h: 304, dark: false }
];
(() => {
  const stage = $('#shelfBooks');
  const detail = $('#shelfDetail');
  if (!stage || !detail) return;
  const tagEl = $('#bookTag'), titleEl = $('#bookTitle'), authorsEl = $('#bookAuthors'), descEl = $('#bookDesc'), yearEl = $('#bookYear');
  let active = 0;
  let token = 0;
  books.forEach((b, i) => {
    const btn = document.createElement('button');
    btn.className = 'spine' + (b.dark ? ' spine--dark' : '') + (i === 0 ? ' is-active' : '');
    btn.type = 'button';
    btn.style.setProperty('--w', b.w + 'px');
    btn.style.setProperty('--h', b.h + 'px');
    btn.style.setProperty('--h-m', Math.round(b.h * .84) + 'px');
    btn.setAttribute('aria-label', b.title + ' by ' + b.authors);
    btn.innerHTML = `<span class="spine__index">0${i + 1}</span><span class="spine__title">${b.short}</span>`;
    btn.addEventListener('mouseenter', () => setBook(i));
    btn.addEventListener('focus', () => setBook(i));
    btn.addEventListener('click', () => setBook(i));
    stage.appendChild(btn);
  });
  function setBook(i) {
    if (i === active) return;
    active = i;
    const b = books[i];
    $$('.spine', stage).forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    const t = ++token;
    detail.classList.add('is-swapping');
    setTimeout(() => {
      if (t !== token) return;
      tagEl.textContent = b.tag;
      titleEl.textContent = b.title;
      authorsEl.textContent = b.authors;
      descEl.textContent = b.desc;
      yearEl.textContent = b.year;
      detail.classList.remove('is-swapping');
    }, 130);
  }
})();

/* ---------- code card ---------- */
const codeSnippets = {
  cpp: {
    label: 'C++', file: 'weird.cpp', type: 'int · 32-bit', pre: true,
    note: 'Straight from the problem statement. The type of n is the only thing we change.',
    keywords: ['using', 'namespace', 'while', 'true', 'if', 'break', 'else', 'return', 'const', 'auto', 'for', 'continue'],
    types: ['int', 'long', 'long long', 'char', 'bool', 'void', 'size_t', 'string'],
    code: [
      '#include <iostream>',
      'using namespace std;',
      '',
      'int main() {',
      '    int n;',
      '    cin >> n;',
      '',
      '    while (true) {',
      '        cout << n << " ";',
      '        if (n == 1) break;',
      '        if (n % 2 == 0) n /= 2;',
      '        else n = n * 3 + 1;',
      '    }',
      '    cout << "\\n";',
      '}'
    ]
  },
  python: {
    label: 'Python', file: 'weird.py', type: 'int · arbitrary precision',
    note: 'Python integers grow as needed, so this version never overflows.',
    keywords: ['while', 'if', 'break', 'else', 'elif', 'def', 'import', 'from', 'return', 'in', 'not', 'and', 'or', 'None', 'True', 'False'],
    types: ['int', 'str', 'float', 'list', 'dict'],
    code: [
      'n = int(input())',
      '',
      'while True:',
      '    print(n, end=" ")',
      '    if n == 1:',
      '        break',
      '    if n % 2 == 0:',
      '        n //= 2',
      '    else:',
      '        n = n * 3 + 1',
      '',
      'print()'
    ]
  },
  java: {
    label: 'Java', file: 'Weird.java', type: 'int · 32-bit',
    note: 'Java int is 32-bit. Changing it to long is the direct fix.',
    keywords: ['import', 'public', 'class', 'static', 'void', 'while', 'true', 'if', 'break', 'else', 'new', 'return', 'final'],
    types: ['int', 'long', 'String', 'Scanner', 'boolean', 'double', 'char'],
    code: [
      'import java.util.Scanner;',
      '',
      'public class Weird {',
      '    public static void main(String[] args) {',
      '        Scanner in = new Scanner(System.in);',
      '        int n = in.nextInt();',
      '',
      '        while (true) {',
      '            System.out.print(n + " ");',
      '            if (n == 1) break;',
      '            if (n % 2 == 0) n /= 2;',
      '            else n = n * 3 + 1;',
      '        }',
      '        System.out.println();',
      '    }',
      '}'
    ]
  },
  js: {
    label: 'JavaScript', file: 'weird.js', type: 'number · 53-bit',
    note: 'JavaScript numbers stay exact here, so this version does not overflow.',
    keywords: ['const', 'let', 'var', 'function', 'while', 'if', 'break', 'else', 'return', 'true', 'false', 'null', 'undefined', 'new'],
    types: ['Number', 'String', 'Boolean'],
    code: [
      'const fs = require("fs");',
      'let n = Number(fs.readFileSync(0, "utf8").trim());',
      '',
      'while (true) {',
      '  process.stdout.write(n + " ");',
      '  if (n === 1) break;',
      '  n = n % 2 === 0 ? n / 2 : n * 3 + 1;',
      '}',
      'console.log();'
    ]
  },
  rust: {
    label: 'Rust', file: 'weird.rs', type: 'i32 · 32-bit',
    note: 'Rust i32 overflows in debug builds; i64 is the equivalent fix.',
    keywords: ['use', 'fn', 'let', 'mut', 'loop', 'if', 'break', 'else', 'while', 'for', 'in', 'return', 'true', 'false'],
    types: ['i32', 'i64', 'u32', 'u64', 'String', 'bool', 'usize'],
    code: [
      'use std::io;',
      '',
      'fn main() {',
      '    let mut input = String::new();',
      '    io::stdin().read_line(&mut input).unwrap();',
      '    let mut n: i32 = input.trim().parse().unwrap();',
      '',
      '    loop {',
      '        print!("{} ", n);',
      '        if n == 1 { break; }',
      '        if n % 2 == 0 { n /= 2; }',
      '        else { n = n * 3 + 1; }',
      '    }',
      '    println!();',
      '}'
    ]
  }
};
const codeFixed = {
  label: 'C++', file: 'weird.cpp', type: 'long long · 64-bit', pre: true,
  note: 'The only change: n is a long long. The simulation now finishes for 138367.',
  keywords: codeSnippets.cpp.keywords,
  types: codeSnippets.cpp.types,
  code: [
    '#include <iostream>',
    'using namespace std;',
    '',
    'int main() {',
    '    long long n;',
    '    cin >> n;',
    '',
    '    while (true) {',
    '        cout << n << " ";',
    '        if (n == 1) break;',
    '        if (n % 2 == 0) n /= 2;',
    '        else n = n * 3 + 1;',
    '    }',
    '    cout << "\\n";',
    '}'
  ]
};

const escapeCode = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function highlightCode(line, cfg) {
  if (cfg.pre && /^\s*#/.test(line)) {
    const m = line.match(/^(\s*)(#\w+)(.*)$/);
    if (m) return `${m[1]}<span class="tok-pre">${escapeCode(m[2])}</span><span class="tok-str">${escapeCode(m[3])}</span>`;
  }
  const keys = new Set(cfg.keywords || []);
  const types = new Set(cfg.types || []);
  const re = /(\/\/[^\n]*|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g;
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(line))) {
    out += escapeCode(line.slice(last, m.index));
    if (m[1]) out += `<span class="tok-com">${escapeCode(m[1])}</span>`;
    else if (m[2]) out += `<span class="tok-str">${escapeCode(m[2])}</span>`;
    else if (m[3]) out += `<span class="tok-num">${escapeCode(m[3])}</span>`;
    else if (m[4]) {
      const word = m[4];
      const rest = line.slice(m.index + word.length);
      if (keys.has(word)) out += `<span class="tok-key">${word}</span>`;
      else if (types.has(word)) out += `<span class="tok-type">${word}</span>`;
      else if (/^\s*\(/.test(rest)) out += `<span class="tok-fn">${word}</span>`;
      else out += escapeCode(word);
    }
    last = m.index + m[0].length;
  }
  out += escapeCode(line.slice(last));
  return out;
}

let setCodeVariant = () => {};
(() => {
  const block = $('#codeBlock');
  const lines = $('#codeLines');
  const file = $('#codeFile');
  const note = $('#codeNote');
  const hint = $('#codeTypeNote');
  const tabs = $$('[data-code-lang]');
  if (!block || !lines) return;
  let active = 'cpp';
  let variant = 'int';
  try {
    const saved = localStorage.getItem('gtcp-code-lang');
    if (saved && codeSnippets[saved]) active = saved;
  } catch (err) {}

  function render() {
    const data = variant === 'fixed' ? codeFixed : codeSnippets[active];
    const lang = variant === 'fixed' ? 'cpp' : active;
    lines.innerHTML = data.code.map((line) => `<span class="code-line">${highlightCode(line, data)}</span>`).join('');
    if (file) file.textContent = data.file;
    if (note) note.textContent = data.note;
    if (hint) hint.textContent = data.type;
    block.setAttribute('aria-label', data.label + ' solution');
    tabs.forEach((tab) => {
      const on = tab.dataset.codeLang === lang;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    block.scrollTop = 0;
    block.scrollLeft = 0;
  }

  function choose(lang) {
    if (!codeSnippets[lang]) return;
    active = lang;
    variant = 'int';
    try { localStorage.setItem('gtcp-code-lang', lang); } catch (err) {}
    render();
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => choose(tab.dataset.codeLang)));
  const tablist = $('.code-tabs');
  if (tablist) {
    tablist.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
      const current = tabs.indexOf(document.activeElement);
      if (current === -1) return;
      e.preventDefault();
      let next = current;
      if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      choose(tabs[next].dataset.codeLang);
      tabs[next].focus();
    });
  }
  setCodeVariant = (next) => {
    if (next === 'fixed') {
      active = 'cpp';
      variant = 'fixed';
      try { localStorage.setItem('gtcp-code-lang', 'cpp'); } catch (err) {}
    } else {
      variant = 'int';
    }
    render();
  };
  render();
})();

/* ---------- copy code ---------- */
(() => {
  const btn = $('#copyCode');
  const code = $('#codeBlock');
  if (!btn || !code) return;
  btn.addEventListener('click', async () => {
    const text = code.innerText.replace(/\n{3,}/g, '\n\n').trim() + '\n';
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const use = btn.querySelector('use');
    const label = btn.querySelector('span');
    use.setAttribute('href', '#i-check');
    label.textContent = 'Copied';
    btn.classList.add('is-copied');
    setTimeout(() => {
      use.setAttribute('href', '#i-copy');
      label.textContent = 'Copy';
      btn.classList.remove('is-copied');
    }, 1800);
  });
})();

/* ---------- report ---------- */
const reportData = {
  int: [
    { test: 1, verdict: 'ACCEPTED', time: '0.06 / 1.00', status: 'pass' },
    { test: 2, verdict: 'ACCEPTED', time: '0.06 / 1.00', status: 'pass' },
    { test: 3, verdict: 'ACCEPTED', time: '0.07 / 1.00', status: 'pass' },
    { test: 4, verdict: 'ACCEPTED', time: '0.06 / 1.00', status: 'pass' },
    { test: 5, verdict: 'ACCEPTED', time: '0.06 / 1.00', status: 'pass' },
    { test: 6, verdict: 'TIME LIMIT EXCEEDED', time: '– / 1.00', status: 'warn', tip: 'First failing test · n = 138367' },
    { test: 7, verdict: 'TIME LIMIT EXCEEDED', time: '– / 1.00', status: 'warn', tip: 'No termination within 1.00 s' },
    { test: 8, verdict: 'WRONG ANSWER', time: '0.07 / 1.00', status: 'fail', tip: 'Incorrect output' },
    { test: 9, verdict: 'TIME LIMIT EXCEEDED', time: '– / 1.00', status: 'warn', tip: 'No termination within 1.00 s' },
    { test: 10, verdict: 'ACCEPTED', time: '0.06 / 1.00', status: 'pass' }
  ],
  long: [
    { test: 1, verdict: 'ACCEPTED', time: '0.05 / 1.00', status: 'pass' },
    { test: 2, verdict: 'ACCEPTED', time: '0.06 / 1.00', status: 'pass' },
    { test: 3, verdict: 'ACCEPTED', time: '0.07 / 1.00', status: 'pass' },
    { test: 4, verdict: 'ACCEPTED', time: '0.06 / 1.00', status: 'pass' },
    { test: 5, verdict: 'ACCEPTED', time: '0.06 / 1.00', status: 'pass' },
    { test: 6, verdict: 'ACCEPTED', time: '0.05 / 1.00', status: 'pass' },
    { test: 7, verdict: 'ACCEPTED', time: '0.06 / 1.00', status: 'pass' },
    { test: 8, verdict: 'ACCEPTED', time: '0.05 / 1.00', status: 'pass' },
    { test: 9, verdict: 'ACCEPTED', time: '0.07 / 1.00', status: 'pass' },
    { test: 10, verdict: 'ACCEPTED', time: '0.06 / 1.00', status: 'pass' }
  ]
};
const verdictClass = (s) => s === 'fail' ? 'verdict--fail' : s === 'warn' ? 'verdict--warn' : '';
function renderReport(mode) {
  const rows = $('#reportRows');
  if (!rows) return;
  rows.innerHTML = reportData[mode].map((r) => {
    const tip = r.tip ? ` data-tip="${r.tip}" tabindex="0"` : '';
    const first = r.test === 6 && mode === 'int' ? ' is-first-fail' : '';
    return `<tr class="${first}"${tip}><td>#${r.test}</td><td><span class="verdict ${verdictClass(r.status)}">${r.verdict}</span></td><td>${r.time}</td></tr>`;
  }).join('');
  const strip = $('#reportStrip');
  strip.innerHTML = reportData[mode].map((r) => `<span class="${r.status === 'pass' ? 'is-pass' : r.status === 'fail' ? 'is-fail' : 'is-warn'}" data-tip="Test #${r.test} · ${r.verdict}"></span>`).join('');
  const accepted = reportData[mode].filter((r) => r.status === 'pass').length;
  $('#reportAccepted').textContent = accepted + ' / 10';
  $('#reportIssues').textContent = mode === 'int' ? '3 TLE · 1 WA' : '—';
  $('#reportTitle').innerHTML = `10 test cases · <span>${mode === 'int' ? 'int' : 'long long'}</span>`;
  $('#reportVerdict').textContent = mode === 'int'
    ? 'This means that our code passed some of the test cases (ACCEPTED), was sometimes too slow (TIME LIMIT EXCEEDED), and also produced an incorrect output (WRONG ANSWER). This is quite surprising!'
    : 'Every test case is accepted. Changing the type of n to long long was enough to fix the overflow.';
}
let setReportMode = () => {};
(() => {
  const buttons = $$('[data-report-mode]');
  setReportMode = (mode) => {
    buttons.forEach((b) => {
      const on = b.dataset.reportMode === mode;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    renderReport(mode);
  };
  buttons.forEach((b) => b.addEventListener('click', () => setReportMode(b.dataset.reportMode)));
  renderReport('int');
  // fixed-run result strip
  const fixDots = $('#fixDots');
  if (fixDots) fixDots.innerHTML = reportData.long.map(() => '<span></span>').join('');
})();

/* ---------- gauge + apply fix ---------- */
let applyGaugeFix = () => {};
(() => {
  const gauge = $('#gauge');
  if (!gauge) return;
  applyGaugeFix = () => {
    gauge.classList.add('is-safe');
    $('#gaugeTag').classList.add('is-safe');
    $('#gaugeTag').textContent = 'fits in long long';
    $('#gaugeFoot').innerHTML = 'The same value, safely stored in a <code>long long</code>.';
    $('#gaugeWrap').textContent = 'no overflow';
  };
  $('#applyFix').addEventListener('click', () => {
    setCodeVariant('fixed');
    setReportMode('long');
    applyGaugeFix();
    document.querySelector('.fix')?.classList.add('is-applied');
    $('#applyFix').innerHTML = 'Fix applied <svg class="icon"><use href="#i-check"/></svg>';
    $('#applyFix').disabled = true;
    $('#applyFix').style.opacity = '.55';
    $('#applyFix').style.cursor = 'default';
  });
})();

/* ---------- report → lab link ---------- */
$('#reportLoad').addEventListener('click', () => {
  if (window.CollatzLab) window.CollatzLab.load(138367, 'int', true);
});

/* ==========================================================================
   Collatz lab
   ========================================================================== */

(() => {
  const chart = $('#collatzChart');
  if (!chart) return;
  const chartWrap = $('#chartWrap');
  const chartTip = $('#chartTip');
  const input = $('#labInput');
  const chain = $('#labChain');
  const chainWrap = $('.chain-wrap');
  function updateChainFade() {
    if (!chainWrap || !chain) return;
    const atEnd = chain.scrollLeft + chain.clientWidth >= chain.scrollWidth - 2;
    chainWrap.classList.toggle('at-end', atEnd);
  }
  if (chain) {
    chain.addEventListener('scroll', updateChainFade, { passive: true });
    window.addEventListener('resize', updateChainFade);
  }
  const INT_MAX = 2147483647;
  const INT_MIN = -2147483648;
  const WRAP = 4294967296;

  const state = {
    n: 3, mode: 'long', values: [3], truePeak: 3, overflowIndex: -1,
    cycleStart: -1, trueAtOverflow: null, current: 0, playing: false,
    timer: null, geom: null, hover: -1
  };

  function compute(n, mode) {
    const values = [n];
    const seen = new Map([[n, 0]]);
    let cur = n;
    let truePeak = n;
    let overflowIndex = -1;
    let cycleStart = -1;
    let trueAtOverflow = null;
    const maxSteps = mode === 'int' ? 700 : 6000;
    for (let step = 0; step < maxSteps; step++) {
      if (cur === 1) break;
      let next = (cur % 2 === 0) ? cur / 2 : cur * 3 + 1;
      if (next > truePeak) truePeak = next;
      if (mode === 'int' && (next > INT_MAX || next < INT_MIN)) {
        if (overflowIndex === -1) { overflowIndex = values.length; trueAtOverflow = next; }
        next = ((next + 2147483648) % WRAP) - 2147483648;
      }
      if (seen.has(next)) { cycleStart = seen.get(next); break; }
      seen.set(next, values.length);
      values.push(next);
      cur = next;
      if (next === 1) break;
    }
    return { values, truePeak, overflowIndex, cycleStart, trueAtOverflow };
  }

  function compact(v) {
    const a = Math.abs(v);
    if (a >= 1e9) return (v / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (a >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (a >= 1e3) return Math.round(v / 1e3) + 'k';
    return String(Math.round(v));
  }

  function pathFor(vals, offset = 0) {
    const g = state.geom;
    if (!g || !vals.length) return '';
    return vals.map((v, i) => `${i ? 'L' : 'M'}${g.xScale(offset + i)},${g.yScale(v)}`).join(' ');
  }

  function renderChart() {
    const W = 900, H = 330, left = 62, right = 24, top = 26, bottom = 38;
    const plotW = W - left - right;
    const plotH = H - top - bottom;
    const values = state.values;
    const steps = values.length - 1;
    let minY = Math.min(0, ...values);
    let maxY = Math.max(state.truePeak, ...values, 1);
    if (state.trueAtOverflow !== null) maxY = Math.max(maxY, state.trueAtOverflow);
    const span = (maxY - minY) || 1;
    const yMin = minY < 0 ? minY - span * 0.08 : 0;
    const yMax = maxY + span * 0.08;
    const xScale = (i) => left + (steps === 0 ? 0 : (i / steps) * plotW);
    const yScale = (v) => top + plotH * (1 - (v - yMin) / (yMax - yMin));
    state.geom = { W, H, left, right, top, bottom, plotW, plotH, xScale, yScale, steps, yMin, yMax };

    const showLimit = state.truePeak > INT_MAX;
    let svg = `<defs><linearGradient id="labAreaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0f0ea"/><stop offset="1" stop-color="#fbfbf8"/></linearGradient></defs>`;

    // horizontal grid + y labels
    let grid = '';
    let axis = '';
    for (let k = 0; k <= 4; k++) {
      const v = yMin + (yMax - yMin) * (k / 4);
      const y = yScale(v);
      grid += `<line x1="${left}" x2="${left + plotW}" y1="${y.toFixed(2)}" y2="${y.toFixed(2)}"/>`;
      axis += `<text x="${left - 10}" y="${(y + 3).toFixed(2)}" text-anchor="end">${compact(v)}</text>`;
    }
    // x ticks
    const tickCount = Math.min(5, steps + 1);
    const seenTicks = new Set();
    for (let k = 0; k < tickCount; k++) {
      const idx = tickCount === 1 ? 0 : Math.round((steps * k) / (tickCount - 1));
      if (seenTicks.has(idx)) continue;
      seenTicks.add(idx);
      const x = xScale(idx);
      axis += `<text x="${x.toFixed(2)}" y="${H - 12}" text-anchor="middle">${idx}</text>`;
    }
    axis += `<text x="${left - 10}" y="${top - 10}" text-anchor="end" fill="#b9b9b1">value</text>`;
    svg += `<g class="chart-grid">${grid}</g>`;
    svg += `<g class="chart-axis">${axis}</g>`;

    if (yMin < 0) {
      const zy = yScale(0);
      svg += `<line class="chart-zero" x1="${left}" x2="${left + plotW}" y1="${zy}" y2="${zy}"/>`;
    }

    if (showLimit) {
      const ly = yScale(INT_MAX);
      svg += `<line class="chart-limit" x1="${left}" x2="${left + plotW}" y1="${ly}" y2="${ly}"/>`;
      svg += `<text class="chart-limit-label" x="${left + plotW}" y="${ly - 6}" text-anchor="end">int limit</text>`;
    }
    const limitLegend = $('#limitLegend');
    if (limitLegend) limitLegend.hidden = !showLimit;

    // area (only when non-negative)
    if (values.every((v) => v >= 0)) {
      const pts = values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' L ');
      const area = `M ${xScale(0)},${yScale(0)} L ${pts} L ${xScale(values.length - 1)},${yScale(0)} Z`;
      svg += `<path class="chart-area" d="${area}"/>`;
    }

    svg += `<path class="chart-ghost" d="${pathFor(values)}"/>`;
    svg += `<path class="chart-path" id="activePath" d="${pathFor(values)}"/>`;

    // post-overflow segment, drawn over the active path
    if (state.overflowIndex > -1) {
      const post = pathFor(values.slice(state.overflowIndex), state.overflowIndex);
      svg += `<path class="chart-post" id="postPath" d="${post}"/>`;
    }

    // dots for short sequences, peak marker for long ones
    if (steps <= 28) {
      values.forEach((v, i) => {
        svg += `<circle class="chart-dot" cx="${xScale(i)}" cy="${yScale(v)}" r="2.6"/>`;
      });
    } else if (values.includes(state.truePeak)) {
      const pi = values.indexOf(state.truePeak);
      svg += `<circle class="chart-dot" cx="${xScale(pi)}" cy="${yScale(state.truePeak)}" r="3"/>`;
    }

    // overflow marker
    if (state.overflowIndex > -1 && state.trueAtOverflow !== null) {
      const oi = state.overflowIndex;
      const x = xScale(oi);
      const yPrev = yScale(values[oi - 1]);
      const yTrue = yScale(state.trueAtOverflow);
      const yWrap = yScale(values[oi]);
      svg += `<line class="chart-limit" x1="${x}" x2="${x}" y1="${yPrev}" y2="${yWrap}" style="stroke-dasharray:2 3"/>`;
      svg += `<circle cx="${x}" cy="${yTrue}" r="4" fill="#fff" stroke="#a6402e" stroke-width="1.2"/>`;
      svg += `<text class="chart-limit-label" x="${x + 7}" y="${Math.max(top + 12, yTrue - 8)}">overflow</text>`;
    }

    // playhead
    const cx = xScale(state.current);
    const cy = yScale(values[state.current]);
    const warn = state.mode === 'int' && state.overflowIndex > -1 && state.current >= state.overflowIndex;
    svg += `<circle class="chart-playhead${warn ? ' chart-playhead--warn' : ''}" id="playhead" cx="${cx}" cy="${cy}" r="4"/>`;

    // hover layer
    svg += `<line class="chart-hover-line" id="hoverLine" x1="${left}" x2="${left}" y1="${top}" y2="${top + plotH}" style="display:none"/>`;
    svg += `<circle class="chart-hover-dot" id="hoverDot" cx="${left}" cy="${top}" r="3.4" style="display:none"/>`;
    svg += `<rect class="chart-hover-layer" x="${left}" y="${top}" width="${plotW}" height="${plotH}" fill="transparent" style="cursor:crosshair"/>`;

    chart.innerHTML = svg;
    chart.setAttribute('aria-label', `Sequence for n = ${state.n}: ${values.length} terms, peak ${fmt(state.truePeak)}.`);
  }

  function updateProgress(scroll) {
    const values = state.values;
    const i = clamp(state.current, 0, values.length - 1);
    state.current = i;
    const active = document.getElementById('activePath');
    if (active) active.setAttribute('d', pathFor(values.slice(0, i + 1)));
    const playhead = document.getElementById('playhead');
    if (playhead && state.geom) {
      playhead.setAttribute('cx', state.geom.xScale(i));
      playhead.setAttribute('cy', state.geom.yScale(values[i]));
      playhead.classList.toggle('chart-playhead--warn', state.mode === 'int' && state.overflowIndex > -1 && i >= state.overflowIndex);
    }
    const indexEl = $('#labIndex');
    if (indexEl) indexEl.textContent = `term ${i + 1} / ${values.length}`;
    const valueEl = $('#labValue');
    if (valueEl) valueEl.textContent = fmt(values[i]);
    const opEl = $('#labOp');
    if (opEl) {
      let op = 'start';
      if (i > 0) {
        if (state.mode === 'int' && i === state.overflowIndex) op = 'overflow → wrapped';
        else op = values[i - 1] % 2 === 0 ? '÷ 2' : '× 3 + 1';
      }
      opEl.textContent = op;
    }
    const terms = $$('.term', chain);
    terms.forEach((t, idx) => t.classList.toggle('is-active', idx === i));
    if (scroll && terms[i]) {
      const target = terms[i].getBoundingClientRect().left - chain.getBoundingClientRect().left + chain.scrollLeft - chain.clientWidth / 2 + terms[i].clientWidth / 2;
      chain.scrollTo({ left: target, behavior: (reduceMotion || state.playing) ? 'auto' : 'smooth' });
    }
    requestAnimationFrame(updateChainFade);
  }

  function updateStats() {
    const terms = state.values.length;
    const termsEl = $('#labTerms');
    if (termsEl) termsEl.textContent = fmt(terms);
    const peakEl = $('#labPeak');
    if (peakEl) peakEl.textContent = fmt(state.truePeak);
    const peakTag = $('#labPeakTag');
    if (peakTag) peakTag.hidden = !(state.mode === 'int' && state.overflowIndex > -1);
    const statusEl = $('#labStatus');
    if (statusEl) {
      const last = state.values[state.values.length - 1];
      if (state.cycleStart > -1) statusEl.innerHTML = '<span class="status-dot is-warn"></span>cycle · never terminates';
      else if (last === 1) statusEl.innerHTML = '<span class="status-dot"></span>terminates at 1';
      else statusEl.innerHTML = '<span class="status-dot is-warn"></span>limit reached';
    }
    const foot = $('#labFoot');
    if (foot) {
      if (state.n === 3 && state.mode === 'long') foot.textContent = 'The example from the problem statement. Eight terms, seven steps.';
      else if (state.mode === 'int' && state.overflowIndex > -1) foot.textContent = 'Signed 32-bit simulation. The true value crosses 2,147,483,647 and wraps negative.';
      else if (state.n === 138367 && state.mode === 'long') foot.textContent = 'The same input with a 64-bit integer. The peak is 2,798,323,360 — beyond int, but safe here.';
      else foot.textContent = `${fmt(terms)} terms. Peak ${fmt(state.truePeak)}.`;
    }
  }

  function renderChain() {
    chain.innerHTML = '';
    state.values.forEach((v, i) => {
      if (i > 0) {
        const arrow = document.createElement('span');
        arrow.className = 'chain-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        chain.appendChild(arrow);
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'term';
      btn.dataset.i = i;
      btn.textContent = fmt(v);
      if (v < 0) btn.classList.add('is-negative');
      if (i === state.overflowIndex) btn.classList.add('is-overflow');
      btn.setAttribute('aria-label', `Term ${i + 1}: ${fmt(v)}`);
      btn.addEventListener('click', () => {
        stopPlay();
        state.current = i;
        updateProgress(false);
      });
      chain.appendChild(btn);
    });
    updateProgress(false);
  }

  function setPlayUI(playing) {
    state.playing = playing;
    const btn = $('#labPlay');
    if (!btn) return;
    const use = btn.querySelector('use');
    const label = btn.querySelector('span');
    if (use) use.setAttribute('href', playing ? '#i-pause' : '#i-play');
    if (label) label.textContent = playing ? 'Pause' : 'Run';
  }
  function stopPlay() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    setPlayUI(false);
  }
  function play() {
    if (state.playing) { stopPlay(); return; }
    if (state.values.length <= 1) return;
    if (state.current >= state.values.length - 1) { state.current = 0; updateProgress(true); }
    setPlayUI(true);
    state.timer = setInterval(() => {
      if (state.current >= state.values.length - 1) { stopPlay(); return; }
      state.current++;
      updateProgress(true);
      if (state.current >= state.values.length - 1) stopPlay();
    }, 175);
  }

  function setSequence(n, mode, opts = {}) {
    stopPlay();
    const safeN = clamp(Math.round(Number(n) || 1), 1, 1000000);
    state.n = safeN;
    state.mode = mode === 'int' ? 'int' : 'long';
    const res = compute(state.n, state.mode);
    state.values = res.values;
    state.truePeak = res.truePeak;
    state.overflowIndex = res.overflowIndex;
    state.cycleStart = res.cycleStart;
    state.trueAtOverflow = res.trueAtOverflow;
    state.current = state.values.length - 1;
    if (input) input.value = state.n;
    $$('.preset').forEach((p) => p.classList.toggle('is-active', Number(p.dataset.preset) === state.n));
    $$('[data-lab-mode]').forEach((b) => {
      const on = b.dataset.labMode === state.mode;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    renderChart();
    renderChain();
    updateStats();
    if (opts.atOverflow && state.overflowIndex > -1) state.current = state.overflowIndex;
    updateProgress(true);
    if (opts.scroll && $('#lab')) $('#lab').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  // controls
  const playBtn = $('#labPlay');
  const stepBtn = $('#labStep');
  const resetBtn = $('#labReset');
  if (playBtn) playBtn.addEventListener('click', play);
  if (stepBtn) stepBtn.addEventListener('click', () => {
    stopPlay();
    if (state.current >= state.values.length - 1) state.current = 0;
    else state.current++;
    updateProgress(true);
  });
  if (resetBtn) resetBtn.addEventListener('click', () => {
    stopPlay();
    state.current = 0;
    updateProgress(true);
  });
  $$('[data-lab-mode]').forEach((b) => b.addEventListener('click', () => setSequence(state.n, b.dataset.labMode)));
  $$('.preset').forEach((p) => p.addEventListener('click', () => setSequence(Number(p.dataset.preset), state.mode)));
  if (input) {
    let debounce = null;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const v = parseInt(input.value.replace(/[^0-9]/g, ''), 10);
        if (!Number.isFinite(v) || v < 1) return;
        setSequence(v, state.mode);
      }, 420);
    });
    input.addEventListener('change', () => {
      clearTimeout(debounce);
      const v = parseInt(input.value.replace(/[^0-9]/g, ''), 10);
      if (!Number.isFinite(v) || v < 1) { input.value = state.n; return; }
      setSequence(v, state.mode);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    });
  }
  const failingBtn = $('#labLoadFailing');
  if (failingBtn) failingBtn.addEventListener('click', () => setSequence(138367, 'int', { atOverflow: true }));

  // chart hover
  function pointerIndex(e) {
    const g = state.geom;
    if (!g) return -1;
    const rect = chart.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (g.W / rect.width);
    return clamp(Math.round(((x - g.left) / g.plotW) * g.steps), 0, state.values.length - 1);
  }
  function showHover(e) {
    const g = state.geom;
    if (!g) return;
    const i = pointerIndex(e);
    if (i < 0) return;
    state.hover = i;
    const x = g.xScale(i);
    const y = g.yScale(state.values[i]);
    const line = document.getElementById('hoverLine');
    const dot = document.getElementById('hoverDot');
    if (line) { line.setAttribute('x1', x); line.setAttribute('x2', x); line.style.display = ''; }
    if (dot) { dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.style.display = ''; }
    const wrapRect = chartWrap.getBoundingClientRect();
    const tx = clamp(e.clientX - wrapRect.left, 80, wrapRect.width - 80);
    const ty = clamp(e.clientY - wrapRect.top - 10, 44, wrapRect.height - 10);
    chartTip.style.left = tx + 'px';
    chartTip.style.top = ty + 'px';
    const extra = i === 0 ? ' · start' : (state.mode === 'int' && i === state.overflowIndex) ? ' · wrapped' : '';
    chartTip.innerHTML = `<b>${fmt(state.values[i])}</b> <span>· term ${i + 1}${extra}</span>`;
    chartTip.classList.add('is-on');
  }
  function hideHover() {
    state.hover = -1;
    chartTip.classList.remove('is-on');
    const line = document.getElementById('hoverLine');
    const dot = document.getElementById('hoverDot');
    if (line) line.style.display = 'none';
    if (dot) dot.style.display = 'none';
  }
  chart.addEventListener('pointermove', showHover);
  chart.addEventListener('pointerleave', hideHover);
  chart.addEventListener('pointerdown', (e) => {
    const i = pointerIndex(e);
    if (i < 0) return;
    stopPlay();
    state.current = i;
    updateProgress(false);
  });

  window.CollatzLab = {
    load: (n, mode, scroll) => setSequence(n, mode || state.mode, { atOverflow: true, scroll: !!scroll })
  };

  setSequence(3, 'long');
})();

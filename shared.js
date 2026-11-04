/* ==========================================================================
   Guide to Competitive Programming — shared behaviour
   Used by every chapter page. Chapter-specific code lives in chapters/*.js.
   ========================================================================== */

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt = (n) => Number(n).toLocaleString('en-US');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- theme ---------- */
const THEME_KEY = 'cp-theme';
const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
const themeBtn = $('#themeBtn');
let savedTheme = null;
try {
  const value = localStorage.getItem(THEME_KEY);
  if (value === 'light' || value === 'dark') savedTheme = value;
} catch (error) { /* storage can be unavailable */ }
let themeTimer = null;

function applyTheme(theme, animate) {
  const root = document.documentElement;
  if (animate && !reduceMotion) {
    root.classList.add('theme-transition');
    clearTimeout(themeTimer);
    themeTimer = setTimeout(() => root.classList.remove('theme-transition'), 520);
  }
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  if (themeBtn) {
    const next = theme === 'dark' ? 'light' : 'dark';
    themeBtn.setAttribute('aria-label', `Switch to ${next} mode`);
    themeBtn.title = `Switch to ${next} mode`;
    themeBtn.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}

applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light', false);

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    savedTheme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (error) { /* ignore */ }
    applyTheme(next, true);
  });
}

themeMedia.addEventListener('change', (event) => {
  if (!savedTheme) applyTheme(event.matches ? 'dark' : 'light', true);
});

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
  if (progressFill) progressFill.style.width = pct + '%';
  if (topbarPct) topbarPct.textContent = Math.round(pct) + '%';
  if (topbar) topbar.classList.toggle('is-scrolled', window.scrollY > 8);
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
railItems.forEach((item) => {
  const el = document.getElementById(item.dataset.section);
  if (el) spy.observe(el);
});

/* ---------- tooltip ---------- */
const tooltip = $('#tooltip');
let tipTimer = null;
let tipCurrent = null;
function placeTooltip(el) {
  if (!el || !el.getBoundingClientRect || !tooltip) return;
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
  if (!tooltip) return;
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
  if (!tooltip) return;
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

/* ---------- contents drawer ---------- */
const drawer = $('#contentsDrawer');
const contentsBtn = $('#contentsBtn');
const endContents = $('#endContents');
let lastFocus = null;
let closeTimer = null;
function openDrawer() {
  if (!drawer) return;
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
  if (!drawer) return;
  drawer.classList.remove('is-open');
  document.body.style.overflow = '';
  closeTimer = setTimeout(() => { drawer.hidden = true; }, 500);
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}
if (contentsBtn) contentsBtn.addEventListener('click', openDrawer);
if (endContents) endContents.addEventListener('click', openDrawer);
if (drawer) {
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
}
document.addEventListener('keydown', (e) => {
  if (!drawer) return;
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

/* ==========================================================================
   CP — small utilities shared with chapter scripts
   ========================================================================== */
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

/**
 * Mount a multi-language code card.
 *
 * Markup contract:
 *   [data-code-card]
 *     [data-code-tabs]      container that receives the tab buttons
 *     [data-code-file]      current file name
 *     [data-code-type]      type / memory note
 *     [data-code-note]      one-line description
 *     [data-code-block]     <pre> element (for aria-label)
 *     [data-code-lines]     <code> element that receives the lines
 *     [data-code-copy]      optional copy button
 *
 * Config:
 *   { langs: { key: {label, file, type, note, code: string[]|string, keywords, types, pre} },
 *     order: [key, ...], initial, storageKey, fixed: { ...same shape } }
 */
function mountCodeCard(root, config) {
  if (!root) return null;
  const lines = $('[data-code-lines]', root);
  const block = $('[data-code-block]', root);
  const file = $('[data-code-file]', root);
  const note = $('[data-code-note]', root);
  const type = $('[data-code-type]', root);
  const tabWrap = $('[data-code-tabs]', root);
  const copyBtn = $('[data-code-copy]', root);
  if (!lines) return null;

  const langs = config.langs || {};
  const order = config.order || Object.keys(langs);
  let active = config.initial || order[0];
  let fixed = false;
  try {
    const saved = config.storageKey && localStorage.getItem(config.storageKey);
    if (saved && langs[saved]) active = saved;
  } catch (err) {}

  const tabs = [];
  if (tabWrap) {
    tabWrap.innerHTML = order.map((key, i) => {
      const label = langs[key] ? langs[key].label : key;
      return `<button class="code-tab" type="button" role="tab" data-code-lang="${key}" aria-selected="false" tabindex="-1">${label}</button>`;
    }).join('');
    order.forEach((key) => tabs.push($(`[data-code-lang="${key}"]`, tabWrap)));
  }

  function asLines(code) {
    return Array.isArray(code) ? code : String(code).replace(/\n$/, '').split('\n');
  }

  function render() {
    const data = fixed && config.fixed ? config.fixed : langs[active];
    if (!data) return;
    lines.innerHTML = asLines(data.code)
      .map((line) => `<span class="code-line">${highlightCode(line, data)}</span>`)
      .join('');
    if (file) file.textContent = data.file || '';
    if (note) note.textContent = data.note || '';
    if (type) type.textContent = data.type || '';
    if (block) block.setAttribute('aria-label', (data.label || 'Code') + ' example');
    const current = fixed ? 'fixed' : active;
    tabs.forEach((tab) => {
      const on = tab.dataset.codeLang === current;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    if (block) { block.scrollTop = 0; block.scrollLeft = 0; }
  }

  function choose(key) {
    if (!langs[key]) return;
    active = key;
    fixed = false;
    try { if (config.storageKey) localStorage.setItem(config.storageKey, key); } catch (err) {}
    render();
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => choose(tab.dataset.codeLang)));
  if (tabWrap) {
    tabWrap.addEventListener('keydown', (e) => {
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

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = asLines((fixed && config.fixed ? config.fixed : langs[active]).code).join('\n') + '\n';
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
      const use = copyBtn.querySelector('use');
      const label = copyBtn.querySelector('span');
      if (use) use.setAttribute('href', '#i-check');
      if (label) label.textContent = 'Copied';
      copyBtn.classList.add('is-copied');
      setTimeout(() => {
        if (use) use.setAttribute('href', '#i-copy');
        if (label) label.textContent = 'Copy';
        copyBtn.classList.remove('is-copied');
      }, 1800);
    });
  }

  render();
  return {
    setLanguage: choose,
    setFixed() {
      if (!config.fixed) return;
      fixed = true;
      render();
    },
    reset() { fixed = false; render(); },
    element: root
  };
}

function countUp(el, target, duration = 1200) {
  if (!el) return;
  const start = performance.now();
  const from = 0;
  function tick(now) {
    const t = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (target - from) * eased).toLocaleString('en-US');
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function onVisible(el, cb, opts = {}) {
  if (!el) return null;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      cb(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: opts.threshold ?? 0.25 });
  io.observe(el);
  return io;
}

window.CP = {
  $, $$, clamp, fmt, reduceMotion,
  escapeCode, highlightCode,
  mountCodeCard, countUp, onVisible,
  showTip, hideTip
};

/* ==========================================================================
   Build the chapter pages from the shared shell + chapter body fragments.
   Usage: node build.mjs [--only=ch01,ch02]
   ========================================================================== */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const book = JSON.parse(readFileSync('book.json', 'utf8'));
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const only = onlyArg ? new Set(onlyArg.slice(7).split(',')) : null;

const strip = (html) => html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const iconSprite = readFileSync('chapters/_sprite.html', 'utf8').trim();

const SITE = 'https://abhinav-prabhakar.github.io/AnttiCP/';
const OG_IMAGES = {
  ch01: 'hero-ch01.jpg',
  ch02: 'hero-ch02.jpg',
  ch07: 'hero-ch07.jpg',
  ch13: 'hero-ch13.jpg',
};

function parseSections(body) {
  const out = [];
  const parts = body.split(/(?=<section\b)/);
  for (const part of parts) {
    const openMatch = part.match(/^<section\b[^>]*>/);
    if (!openMatch) continue;
    const open = openMatch[0];
    const cls = (open.match(/class="([^"]*)"/) || [])[1] || '';
    if (!/(^|\s)section(\s|$)/.test(cls)) continue;
    const id = (open.match(/id="([^"]+)"/) || [])[1];
    if (!id) continue;
    const num = (part.match(/<span class="section-num">([\s\S]*?)<\/span>/) || [])[1];
    const h2 = (part.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1];
    if (!h2) continue;
    out.push({ id, num: strip(num || ''), title: strip(h2) });
  }
  return out;
}

function chapterNav(currentIdx) {
  return book.chapters.map((c, i) => {
    const current = i === currentIdx;
    return `<a class="drawer__book-row${current ? ' is-current' : ''}" href="${c.file}"${current ? ' aria-current="page"' : ''}>
            <span>${c.num}</span><span>${escapeHtml(c.title)}</span>
          </a>`;
  }).join('\n          ');
}

function render(chapter, idx) {
  const bodyPath = chapter.body;
  if (!existsSync(bodyPath)) {
    throw new Error(`Missing body fragment: ${bodyPath}`);
  }
  const body = readFileSync(bodyPath, 'utf8').trim();
  const sections = parseSections(body);
  if (!sections.length) console.warn(`  ! ${chapter.slug}: no sections parsed`);

  const rail = sections.map((s) => `<a href="#${s.id}" class="siderail__item" data-section="${s.id}"><span class="siderail__num">${escapeHtml(s.num)}</span><span class="siderail__label">${escapeHtml(s.title)}</span></a>`).join('\n  ');
  const drawerSections = sections.map((s) => `<a href="#${s.id}" data-close-drawer><span>${escapeHtml(s.num)}</span>${escapeHtml(s.title)}</a>`).join('\n            ');

  const next = idx + 1 < book.chapters.length ? book.chapters[idx + 1] : book.chapters[0];
  const nextKicker = idx + 1 < book.chapters.length ? `Next · Chapter ${next.num}` : 'Start again';
  const nextTitle = next.title;
  const nextLead = idx + 1 < book.chapters.length ? next.lead : 'Return to the opening chapter and the book’s table of contents.';

  const pageUrl = chapter.file === 'index.html' ? SITE : SITE + chapter.file;
  const pageTitle = `Chapter ${chapter.num} — ${chapter.title}`;
  const ogImage = SITE + 'assets/readme/' + (OG_IMAGES[chapter.slug] || 'hero-ch01.jpg');
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Chapter',
    name: pageTitle,
    position: idx + 1,
    url: pageUrl,
    description: chapter.lead,
    isPartOf: {
      '@type': 'Book',
      name: book.title,
      author: { '@type': 'Person', name: book.author },
      bookEdition: 'Interactive web edition',
      url: SITE,
    },
  });

  const cssLink = chapter.css && existsSync(chapter.css)
    ? `\n<link rel="stylesheet" href="${chapter.css}">`
    : '';
  const jsScript = chapter.js && existsSync(chapter.js)
    ? `\n<script src="${chapter.js}"></script>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(pageTitle)} · Guide to Competitive Programming</title>
<meta name="description" content="${escapeHtml(chapter.lead)}">
<meta name="author" content="Antti Laaksonen; interactive edition by Abhinav Prabhakar">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" id="themeColor" content="#ffffff">
<link rel="canonical" href="${pageUrl}">
<meta property="og:site_name" content="Guide to Competitive Programming">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(pageTitle)}">
<meta property="og:description" content="${escapeHtml(chapter.lead)}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1440">
<meta property="og:image:height" content="1110">
<meta property="og:image:alt" content="${escapeHtml(pageTitle)} — an opening spread from the interactive edition">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(pageTitle)}">
<meta name="twitter:description" content="${escapeHtml(chapter.lead)}">
<meta name="twitter:image" content="${ogImage}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23171717'/%3E%3Ctext x='32' y='42' font-family='Georgia,serif' font-size='30' fill='white' text-anchor='middle'%3E${chapter.num}%3C/text%3E%3C/svg%3E">
<script type="application/ld+json">${schema}</script>
<script>
(function () {
  try {
    var saved = localStorage.getItem('cp-theme');
    var dark = saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    var meta = document.getElementById('themeColor');
    if (meta) meta.setAttribute('content', dark ? '#0e0e0d' : '#ffffff');
  } catch (error) {
    document.documentElement.dataset.theme = 'light';
  }
})();
</script>
<link rel="stylesheet" href="theme.css">
<link rel="stylesheet" href="styles.css">${cssLink}
<link rel="stylesheet" href="theme-base.css">
</head>
<body data-chapter="${chapter.num}">

<a class="skip-link" href="#top">Skip to content</a>

${iconSprite}

<div class="progress-rail" aria-hidden="true"><div class="progress-rail__fill" id="progressFill"></div></div>

<header class="topbar" id="topbar">
  <div class="topbar__inner">
    <a class="brand" href="index.html" aria-label="Guide to Competitive Programming — start of the book">
      <span class="brand__mark">CP</span>
      <span class="brand__text">Guide to Competitive Programming</span>
    </a>
    <div class="topbar__meta">
      <span class="topbar__chapter">Chapter ${chapter.num} <span>— ${escapeHtml(chapter.title)}</span></span>
      <span class="topbar__pct" id="topbarPct">0%</span>
      <button class="topbar__btn topbar__btn--theme" id="themeBtn" type="button" aria-label="Switch to dark mode">
        <svg class="icon icon--sun" aria-hidden="true"><use href="#i-sun"/></svg>
        <svg class="icon icon--moon" aria-hidden="true"><use href="#i-moon"/></svg>
      </button>
      <button class="topbar__btn" id="contentsBtn" aria-haspopup="dialog" aria-controls="contentsDrawer">
        <span>Contents</span>
        <svg class="icon"><use href="#i-menu"/></svg>
      </button>
    </div>
  </div>
</header>

<nav class="siderail" aria-label="Chapter sections">
  ${rail}
</nav>

<main id="top">

${body}

<!-- ============ end ============ -->
<section class="end" aria-labelledby="endTitle">
  <div class="wrap">
    <div class="end__mark" aria-hidden="true">∎</div>
    <span class="kicker">End of Chapter ${chapter.num}</span>
    <h2 id="endTitle">${escapeHtml(chapter.endTitle)}</h2>
    <p>${escapeHtml(chapter.endText)}</p>
    <a class="end__next end__next--link" href="${next.file}">
      <div class="end__next-copy">
        <span class="kicker">${nextKicker}</span>
        <h3>${escapeHtml(nextTitle)}</h3>
        <p>${escapeHtml(nextLead)}</p>
      </div>
      <span class="btn btn--on-dark">Continue <svg class="icon"><use href="#i-arrow"/></svg></span>
    </a>
    <div class="end__actions">
      <a class="btn btn--primary" href="#top"><svg class="icon"><use href="#i-arrow-up"/></svg>Back to the top</a>
      <button class="btn" id="endContents">Open contents</button>
    </div>
  </div>
</section>

</main>

<footer class="footer">
  <div class="wrap footer__inner">
    <span>Guide to Competitive Programming · Antti Laaksonen</span>
    <span>Chapter ${chapter.num} · ${escapeHtml(chapter.title)}</span>
    <span>An interactive edition</span>
  </div>
</footer>

<div class="drawer" id="contentsDrawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" hidden>
  <div class="drawer__scrim" data-close-drawer></div>
  <div class="drawer__panel">
    <div class="drawer__head">
      <span class="kicker" id="drawerTitle">Contents</span>
      <button class="drawer__close" data-close-drawer aria-label="Close contents"><svg class="icon"><use href="#i-close"/></svg></button>
    </div>
    <div class="drawer__body">
      <div class="drawer__col">
        <span class="kicker">Chapter ${chapter.num} · ${escapeHtml(chapter.title)}</span>
        <nav class="drawer__sections" aria-label="Chapter sections">
            ${drawerSections}
        </nav>
      </div>
      <div class="drawer__col drawer__col--muted">
        <span class="kicker">The book</span>
        <div class="drawer__book">
          ${chapterNav(idx)}
        </div>
        <p class="drawer__note">An interactive edition of all fifteen chapters, rebuilt for the web.</p>
      </div>
    </div>
  </div>
</div>

<div class="tooltip" id="tooltip" role="tooltip" hidden></div>

<script src="shared.js"></script>${jsScript}
</body>
</html>
`;
}

let built = 0;
book.chapters.forEach((chapter, idx) => {
  if (only && !only.has(chapter.slug)) return;
  const html = render(chapter, idx);
  writeFileSync(chapter.file, html);
  built += 1;
  const sections = parseSections(readFileSync(chapter.body, 'utf8'));
  console.log(`  ✓ ${chapter.file}  (${sections.length} sections)`);
});
console.log(`Built ${built} page${built === 1 ? '' : 's'}.`);

if (!only) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = book.chapters.map((c) => {
    const loc = c.file === 'index.html' ? SITE : SITE + c.file;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${c.file === 'index.html' ? '1.0' : '0.8'}</priority>\n  </url>`;
  }).join('\n');
  writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
  console.log('  ✓ sitemap.xml, robots.txt');
}

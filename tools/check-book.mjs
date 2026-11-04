/* Full-book QA across every chapter page.
   Usage: node tools/check-book.mjs [--shots]

   Verifies: every page loads, shell wiring, rail/drawer, next-chapter chain,
   console errors, failed requests, overflow at four widths.
*/
import { readFileSync, mkdirSync } from 'node:fs';

const PW = '/private/var/folders/pb/9pb5x5xx1lq39s682jpb00nr0000gn/T/opencode/qa/node_modules/playwright-core/index.mjs';
const { chromium } = await import(PW);
const book = JSON.parse(readFileSync('book.json', 'utf8'));
const base = 'http://localhost:8123/';
const shots = process.argv.includes('--shots');
if (shots) mkdirSync('.qa/book', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('requestfailed', (r) => errors.push('request failed: ' + r.url()));

let failures = 0;
const rows = [];

for (let i = 0; i < book.chapters.length; i++) {
  const ch = book.chapters[i];
  const next = book.chapters[i + 1] || book.chapters[0];
  const row = { slug: ch.slug, page: ch.file };
  const before = errors.length;

  const res = await page.goto(base + ch.file, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  row.status = res ? res.status() : 0;

  row.title = await page.title();
  row.sections = await page.locator('main section.section').count();
  row.rail = await page.locator('.siderail__item').count();
  row.drawer = await page.locator('.drawer__book-row').count();
  row.next = await page.locator('.end__next--link').getAttribute('href').catch(() => null);
  row.nextOk = row.next === next.file;
  row.currentMarked = await page.locator('.drawer__book-row.is-current').count();

  // scroll to trigger reveals
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 900) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(14);
  }
  await page.waitForTimeout(320);
  row.hiddenReveals = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity === '0').length);

  row.overflow = {};
  for (const w of [320, 393, 768, 1440]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(120);
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    row.overflow[w] = m.sw <= m.cw + 1;
  }

  row.errors = errors.slice(before);

  const bad = row.status !== 200 || row.sections < 1 || row.rail !== row.sections
    || row.drawer !== book.chapters.length || !row.nextOk || row.currentMarked !== 1
    || row.hiddenReveals > 0 || Object.values(row.overflow).some((v) => !v) || row.errors.length;
  if (bad) failures++;
  row.ok = !bad;
  rows.push(row);

  if (shots) {
    await page.setViewportSize({ width: 1440, height: 950 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(220);
    await page.screenshot({ path: `.qa/book/${ch.slug}-top.png` });
  }
}

for (const r of rows) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.slug}  ${String(r.sections).padStart(2)} sections  rail ${r.rail}  drawer ${r.drawer}  next ${r.next}${r.nextOk ? '' : ' ✗'}`);
  const issues = [];
  if (r.status !== 200) issues.push('status ' + r.status);
  if (r.rail !== r.sections) issues.push('rail mismatch');
  if (r.drawer !== book.chapters.length) issues.push('drawer count');
  if (!r.nextOk) issues.push('next link');
  if (r.currentMarked !== 1) issues.push('current chapter mark');
  if (r.hiddenReveals) issues.push(r.hiddenReveals + ' unrevealed');
  Object.entries(r.overflow).forEach(([w, ok]) => { if (!ok) issues.push('overflow@' + w); });
  if (r.errors.length) issues.push(r.errors.join(' | '));
  if (issues.length) console.log('   → ' + issues.join('; '));
}

await browser.close();
console.log(failures ? `\n${failures} chapter page(s) failed.` : `\nAll ${rows.length} chapter pages passed.`);
process.exit(failures ? 1 : 0);

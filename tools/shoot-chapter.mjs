/* Screenshot a chapter section by section.
   Usage: node tools/shoot-chapter.mjs ch14 [1440] [--max=6]
*/
import { readFileSync, mkdirSync } from 'node:fs';

const PW = '/private/var/folders/pb/9pb5x5xx1lq39s682jpb00nr0000gn/T/opencode/qa/node_modules/playwright-core/index.mjs';
const { chromium } = await import(PW);
const book = JSON.parse(readFileSync('book.json', 'utf8'));
const slug = process.argv[2];
const width = Number(process.argv[3] || 1440);
const maxArg = process.argv.find((a) => a.startsWith('--max='));
const max = maxArg ? Number(maxArg.slice(6)) : 99;
const entry = book.chapters.find((c) => c.slug === slug);
if (!entry) { console.error('unknown chapter', slug); process.exit(1); }

const out = `.qa/${slug}`;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 950 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(`http://localhost:8123/${entry.file}`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// Reveal everything so screenshots are not blank.
const h = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 800) {
  await page.evaluate((y) => scrollTo(0, y), y);
  await page.waitForTimeout(16);
}
await page.evaluate(() => scrollTo(0, 0));
await page.waitForTimeout(500);

const blocks = await page.locator('main section.section').count();
console.log(`${slug} · ${blocks} sections · height ${h}`);
for (let i = 0; i < Math.min(blocks, max); i++) {
  const el = page.locator('main section.section').nth(i);
  const id = await el.getAttribute('id');
  const title = await el.locator('h2').first().innerText().catch(() => '');
  const geo = await el.evaluate((node) => {
    const r = node.getBoundingClientRect();
    return { top: r.top + window.scrollY, height: r.height };
  });
  const clipH = Math.min(geo.height, 1400);
  await page.screenshot({
    path: `${out}/${String(i + 1).padStart(2, '0')}-${id}.png`,
    clip: { x: 0, y: Math.max(0, geo.top), width, height: clipH },
    fullPage: true,
  });
  console.log(`  ${i + 1}. ${id} ${title} (${Math.round(geo.height)}px)`);
}
if (errors.length) console.log('ERRORS', errors);
await browser.close();

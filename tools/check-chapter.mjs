/* Quick chapter QA. Usage: node tools/check-chapter.mjs ch02 [ch03 ...] */
import { mkdirSync } from 'node:fs';

const PW = '/private/var/folders/pb/9pb5x5xx1lq39s682jpb00nr0000gn/T/opencode/qa/node_modules/playwright-core/index.mjs';
const { chromium } = await import(PW);
const base = 'http://localhost:8123/';
const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error('Usage: node tools/check-chapter.mjs ch02 [ch03 ...]');
  process.exit(1);
}
mkdirSync('.qa', { recursive: true });

const browser = await chromium.launch();
let failures = 0;

for (const slug of slugs) {
  const chapter = (await import('node:fs')).readFileSync('book.json', 'utf8');
  const book = JSON.parse(chapter);
  const entry = book.chapters.find((c) => c.slug === slug);
  if (!entry) { console.error(`Unknown chapter ${slug}`); failures++; continue; }
  const url = base + entry.file;
  const report = { slug, url, checks: {}, errors: [] };

  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  page.on('pageerror', (e) => report.errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') report.errors.push(m.text()); });
  page.on('requestfailed', (r) => report.errors.push('request failed: ' + r.url()));
  const res = await page.goto(url, { waitUntil: 'networkidle' });
  report.checks.http = res && res.status() === 200;
  await page.evaluate(() => document.fonts.ready);

  const sections = await page.locator('main section.section').count();
  const rail = await page.locator('.siderail__item').count();
  report.checks.sections = sections > 0;
  report.checks.railMatches = sections === rail;
  report.counts = { sections, rail };

  // scroll through to trigger reveals
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(18);
  }
  await page.waitForTimeout(400);
  const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity === '0').length);
  report.checks.reveals = hidden === 0;
  report.counts.hiddenReveals = hidden;

  // code card
  const card = page.locator('[data-code-card]').first();
  if (await card.count()) {
    const tabs = await card.locator('.code-tab').count();
    report.checks.codeTabs = tabs >= 2;
    const initial = await card.locator('.code-tab.is-active').innerText().catch(() => '');
    if (tabs >= 2) {
      await card.locator('.code-tab').nth(1).click();
      await page.waitForTimeout(160);
      const active = await card.locator('.code-tab.is-active').innerText();
      report.checks.codeSwitch = active !== initial;
    }
    await card.screenshot({ path: `.qa/${slug}-code.png` }).catch(() => {});
  }

  // tooltips / details
  report.counts.tooltips = await page.locator('[data-tip]').count();
  report.counts.details = await page.locator('details').count();

  // overflow at widths
  report.overflow = {};
  for (const w of [320, 393, 768, 1440]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(180);
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    report.overflow[w] = m.sw <= m.cw + 1;
    if (w === 393 || w === 1440) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(220);
      await page.screenshot({ path: `.qa/${slug}-${w}-hero.png` });
    }
  }

  Object.entries(report.overflow).forEach(([w, ok]) => { if (!ok) report.checks['overflow' + w] = false; });
  if (report.errors.length) report.checks.console = false;
  const failed = Object.entries(report.checks).filter(([, v]) => v === false);
  if (failed.length) failures++;
  console.log(JSON.stringify(report, null, 2));
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} chapter(s) with failed checks.` : '\nAll checks passed.');
process.exit(failures ? 1 : 0);

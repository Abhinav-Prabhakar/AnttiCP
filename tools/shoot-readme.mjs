/* Capture README artwork from the built book, in light and dark.
   Usage: node tools/shoot-readme.mjs
   Writes JPEGs to assets/readme/; dark variants end in -dark.jpg.
*/
import { mkdirSync } from 'node:fs';

const PW = '/private/var/folders/pb/9pb5x5xx1lq39s682jpb00nr0000gn/T/opencode/qa/node_modules/playwright-core/index.mjs';
const { chromium } = await import(PW);
const base = 'http://localhost:8123/';
const out = 'assets/readme';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();

const shots = [
  { file: 'index.html', name: 'hero-ch01', top: 1110 },
  { file: 'ch02.html', name: 'hero-ch02', top: 1180 },
  { file: 'ch07.html', name: 'hero-ch07', top: 1110 },
  { file: 'ch12.html', name: 'hero-ch12', top: 1110 },
  { file: 'ch13.html', name: 'hero-ch13', top: 1110 },
  { file: 'ch06.html', name: 'dp-grid', sel: '#gridLab' },
  { file: 'ch12.html', name: 'kosaraju', sel: '#ch12Kosaraju', actions: [['#ch12KNext', 4]] },
  { file: 'ch12.html', name: 'max-flow', sel: '#ch12Flow', actions: [['#ch12FlowNext', 4]] },
  { file: 'ch13.html', name: 'orientation', sel: '#ch13Orient' },
  { file: 'ch13.html', name: 'polygon-area', sel: '#ch13Area' },
  { file: 'ch14.html', name: 'trie', sel: '#s1411 .ch14-split-trie' },
  { file: 'ch15.html', name: 'treap', sel: '.ch15-treap' },
  { file: 'ch15.html', name: 'sqrt-blocks', sel: '#s151 .ch15-lab' },
];

for (const theme of ['light', 'dark']) {
  const suffix = theme === 'dark' ? '-dark' : '';
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1 });
  await page.addInitScript((value) => localStorage.setItem('cp-theme', value), theme);

  for (const shot of shots) {
    await page.goto(base + shot.file, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    const path = `${out}/${shot.name}${suffix}.jpg`;
    if (shot.sel) {
      const el = page.locator(shot.sel).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      for (const [button, times] of shot.actions || []) {
        for (let i = 0; i < times; i++) {
          await page.locator(button).click();
          await page.waitForTimeout(450);
        }
      }
      await el.screenshot({ path, type: 'jpeg', quality: 88, animations: 'disabled' });
      console.log(`${shot.name}${suffix}.jpg  ${shot.file}  ${shot.sel}`);
    } else {
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(700);
      await page.screenshot({
        path,
        type: 'jpeg',
        quality: 88,
        clip: { x: 0, y: 0, width: 1440, height: shot.top },
        animations: 'disabled',
      });
      console.log(`${shot.name}${suffix}.jpg  ${shot.file}  top`);
    }
  }

  // Mobile frame of the Chapter 1 opening.
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/mobile-ch01${suffix}.jpg`, type: 'jpeg', quality: 88, animations: 'disabled' });
  console.log(`mobile-ch01${suffix}.jpg`);

  await page.close();
}

await browser.close();

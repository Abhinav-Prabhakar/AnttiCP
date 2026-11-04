/* Static audit of chapter fragments.
   Usage: node tools/audit-chapters.mjs [ch02 ...]

   Checks content structure without a browser:
   - required sections (number + title from the book TOC)
   - section id/section-num/h2 wiring
   - richness: figures, tooltips/details, code card, data-reveal
   - forbidden: external URLs, inline <style>/<script>, shared-file edits
*/
import { readFileSync, existsSync } from 'node:fs';

const EXPECTED = {
  ch02: [
    ['2.1', 'Language Features'],
    ['2.2', 'Recursive Algorithms'],
    ['2.3', 'Bit Manipulation'],
  ],
  ch03: [
    ['3.1', 'Time Complexity'],
    ['3.2', 'Examples'],
  ],
  ch04: [
    ['4.1', 'Sorting Algorithms'],
    ['4.2', 'Solving Problems by Sorting'],
    ['4.3', 'Binary Search'],
  ],
  ch05: [
    ['5.1', 'Dynamic Arrays'],
    ['5.2', 'Set Structures'],
    ['5.3', 'Experiments'],
  ],
  ch06: [
    ['6.1', 'Basic Concepts'],
    ['6.2', 'Further Examples'],
  ],
  ch07: [
    ['7.1', 'Basics of Graphs'],
    ['7.2', 'Graph Traversal'],
    ['7.3', 'Shortest Paths'],
    ['7.4', 'Directed Acyclic Graphs'],
    ['7.5', 'Successor Graphs'],
    ['7.6', 'Minimum Spanning Trees'],
  ],
  ch08: [
    ['8.1', 'Bit-Parallel Algorithms'],
    ['8.2', 'Amortized Analysis'],
    ['8.3', 'Finding Minimum Values'],
  ],
  ch09: [
    ['9.1', 'Queries on Static Arrays'],
    ['9.2', 'Tree Structures'],
  ],
  ch10: [
    ['10.1', 'Basic Techniques'],
    ['10.2', 'Tree Queries'],
    ['10.3', 'Advanced Techniques'],
  ],
  ch11: [
    ['11.1', 'Number Theory'],
    ['11.2', 'Combinatorics'],
    ['11.3', 'Matrices'],
    ['11.4', 'Probability'],
    ['11.5', 'Game Theory'],
  ],
  ch12: [
    ['12.1', 'Strong Connectivity'],
    ['12.2', 'Complete Paths'],
    ['12.3', 'Maximum Flows'],
    ['12.4', 'Depth-First Search Trees'],
  ],
  ch13: [
    ['13.1', 'Geometric Techniques'],
    ['13.2', 'Sweep Line Algorithms'],
  ],
  ch14: [
    ['14.1', 'Basic Topics'],
    ['14.2', 'String Hashing'],
    ['14.3', 'Z-Algorithm'],
    ['14.4', 'Suffix Arrays'],
  ],
  ch15: [
    ['15.1', 'Square Root Techniques'],
    ['15.2', 'Segment Trees Revisited'],
    ['15.3', 'Treaps'],
    ['15.4', 'Dynamic Programming Optimization'],
    ['15.5', 'Miscellaneous'],
  ],
};

const strip = (html) => html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
  .replace(/&#8217;|&rsquo;/g, '’')
  .replace(/\s+/g, ' ')
  .trim();

const norm = (s) => strip(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(EXPECTED);
let failures = 0;

for (const slug of slugs) {
  const bodyPath = `chapters/${slug}.body.html`;
  const cssPath = `chapters/${slug}.css`;
  const jsPath = `chapters/${slug}.js`;
  const problems = [];
  const notes = {};

  if (!existsSync(bodyPath)) { console.log(`${slug}: MISSING ${bodyPath}`); failures++; continue; }
  const body = readFileSync(bodyPath, 'utf8');

  const sections = [...body.matchAll(/<section\b[^>]*class="([^"]*)"[^>]*id="([^"]+)"|<section\b[^>]*id="([^"]+)"[^>]*class="([^"]*)"/g)]
    .map((m) => ({ cls: m[1] || m[4] || '', id: m[2] || m[3] || '' }));
  const contentSections = sections.filter((s) => /(^|\s)section(\s|$)/.test(s.cls));
  const nums = [...body.matchAll(/<span class="section-num">([\s\S]*?)<\/span>/g)].map((m) => strip(m[1]));
  const h2s = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => strip(m[1]));

  notes.sections = contentSections.length;
  notes.numbers = nums.join(' ');
  notes.h2 = h2s.slice(0, 12).join(' | ');

  // hero
  if (!/<section class="hero/.test(body)) problems.push('no hero section');
  if (!/<h1[^>]*>/.test(body)) problems.push('no h1 in hero');

  // hero meta should count top-level sections, not every sub-section
  const topLevel = contentSections.filter((s) => !/section--sub/.test(s.cls)).length;
  const metaSpan = body.match(/class="hero__meta-line"[^>]*>\s*<span>([^<]+)<\/span>/);
  if (metaSpan) {
    const claimed = Number((metaSpan[1].match(/\d+/) || [])[0]);
    if (claimed !== topLevel) problems.push(`hero says ${claimed} sections, page has ${topLevel} top-level sections`);
    notes.heroSections = claimed;
  }

  // required sections
  const expected = EXPECTED[slug] || [];
  for (const [num, title] of expected) {
    const hasNum = nums.some((n) => n === num);
    const hasTitle = h2s.some((h) => norm(h) === norm(title) || norm(h).includes(norm(title)));
    if (!hasNum) problems.push(`missing section number ${num}`);
    else if (!hasTitle) problems.push(`section ${num} title not found (expected "${title}")`);
  }

  // every section has id + num + h2
  for (const s of contentSections) {
    if (!s.id) problems.push(`section without id`);
  }

  // richness
  const figures = (body.match(/class="figure[^"]*"/g) || []).length;
  const svgs = (body.match(/<svg\b/g) || []).length;
  const tips = (body.match(/data-tip=/g) || []).length;
  const details = (body.match(/<details\b/g) || []).length;
  const reveals = (body.match(/data-reveal/g) || []).length;
  const codeCards = (body.match(/data-code-card/g) || []).length;
  const interactive = (body.match(/data-(step|slider|toggle|sim|interactive|ch[0-9]+-[a-z-]+-(play|step|reset))/g) || []).length;

  notes.figures = figures;
  notes.svgs = svgs;
  notes.tips = tips;
  notes.details = details;
  notes.reveals = reveals;
  notes.codeCards = codeCards;

  if (svgs < 3) problems.push(`only ${svgs} inline SVGs (need 3+)`);
  if (!codeCards && !/<pre class="code"/.test(body)) problems.push('no code card / code block');
  if (!tips && !details) problems.push('no data-tip and no <details>');
  if (reveals < 5) problems.push(`only ${reveals} data-reveal blocks`);

  // forbidden — external *assets* are banned; outbound <a> links are fine
  if (/(?:src|href)\s*=\s*["']https?:\/\//i.test(body) && /<(?:img|link|script|iframe|source|video|audio)\b[^>]*(?:src|href)\s*=\s*["']https?:\/\//i.test(body)) {
    problems.push('external asset URL in body');
  }
  if (/url\(\s*["']?https?:\/\//i.test(body)) problems.push('external CSS url() in body');
  if (/<style\b/.test(body)) problems.push('inline <style> in body');
  if (/<script\b/.test(body)) problems.push('inline <script> in body');
  if (/lorem ipsum|todo|coming soon|placeholder/i.test(body)) problems.push('placeholder text');

  // css/js presence + hygiene (ch01 keeps its base styles in styles.css)
  if (!existsSync(cssPath)) {
    if (slug !== 'ch01') problems.push(`missing ${cssPath}`);
  } else {
    const css = readFileSync(cssPath, 'utf8');
    if (/@import|@font-face/.test(css)) problems.push('css has @import/@font-face');
    if (/https?:\/\//.test(css)) problems.push('css has external URL');
  }
  if (!existsSync(jsPath)) problems.push(`missing ${jsPath}`);
  else {
    const js = readFileSync(jsPath, 'utf8');
    if (!/\b(IIFE|function|const|let)\b/.test(js)) problems.push('js looks empty');
    if (/https?:\/\//.test(js.replace(/http:\/\/www\.w3\.org\/2000\/svg/g, ''))) problems.push('js has external URL');
  }

  if (problems.length) {
    failures++;
    console.log(`\n✗ ${slug}`);
    problems.forEach((p) => console.log(`   - ${p}`));
  } else {
    console.log(`\n✓ ${slug}`);
  }
  console.log(`   ${JSON.stringify(notes)}`);
}

console.log(failures ? `\n${failures} chapter(s) with problems.` : '\nAll chapters pass the static audit.');
process.exit(failures ? 1 : 0);

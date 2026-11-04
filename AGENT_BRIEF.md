# Agent brief — chapter build

You are one of several agents building the interactive web edition of *Guide to
Competitive Programming*. You own a small, exclusive set of chapter files. Other
agents are working in parallel; do not touch their files or any shared file.

## Start here

1. Read `DESIGN.md` in full. It is the design contract.
2. Open `index.html` and `chapters/ch01.body.html`, `chapters/ch01.css` (if it
   exists), and `chapters/ch01.js` to see the level of finish expected.
3. Look at `styles.css` for the tokens (search `:root`) and shared components
   (`.section`, `.hero`, `.figure`, `.split2`, `.code-card`, `.chips`, `.note`).
4. Read `shared.js` for the `window.CP` helpers.

## Your output

For each chapter `NN` assigned to you, create or replace exactly:

```
chapters/chNN.body.html
chapters/chNN.css
chapters/chNN.js
```

Nothing else. Never edit `index.html`, `styles.css`, `shared.js`, `build.mjs`,
`book.json`, `chapters/_sprite.html`, `chapters/_template.body.html`,
`source/**`, `tools/**`, or another chapter's files. If a shared change seems
necessary, do not make it — work around it and report it in your final message.

The body fragment starts with `<section class="hero">` and ends after your last
`</section>`. No `<html>`, `<head>`, `<body>`, `<main>`, topbar, drawer, footer,
sprite, `<style>`, or `<script>` tags. The build adds all of that.

## Content sources

- `source/text/chNN.txt` — extracted book text, with `===== PDF PAGE n =====` markers.
- `source/pages/pNNN.png` — page renders for figures and tables.
- The book's section list for your chapter is in your task prompt.

Cover every section. Condense for the web; keep technical claims, examples and
complexities faithful. Do not invent facts, quotes or results. Rewrite prose so it
reads as a designed web chapter, not a PDF dump.

## Quality bar

Each chapter needs:

- a bespoke hero visual;
- at least three custom explanatory visuals (inline SVG/CSS, not decoration);
- at least one real interaction (stepper, slider, toggle, hover-to-inspect,
  small simulator) that changes what the reader learns;
- one piece of secondary data behind hover/tap/focus (`data-tip`, `<details>`);
- a code card (using `CP.mountCodeCard`) where the book has code;
- restrained motion (reveals, a draw, a count-up) and respect for reduced motion;
- responsive layouts at 320 / 393 / 768 / 1440 with no horizontal page overflow.

Chapter-specific classes must be prefixed `chNN-`. No external fonts, images,
scripts, CDNs or libraries. Use the existing design tokens and shared classes.

## Build and QA

```bash
node build.mjs --only=chNN          # build only your page(s)
node --check chapters/chNN.js       # syntax check
node tools/check-chapter.mjs chNN   # console errors, overflow, reveals, code card
```

`tools/check-chapter.mjs` writes screenshots to `.qa/`. Read them with the read
tool and fix what looks wrong. The local site is served at
`http://localhost:8123/`; do not start another server on that port.

If the build fails because a file is missing, create it. Do not run
`node build.mjs` without `--only` — other agents' fragments may not exist yet.

## Interaction with the shared shell

- The build generates the topbar, side rail, drawer, end card and footer.
- Section ids/numbers feed the rail: keep `.section-num` and the first `<h2>`.
- `data-reveal` on blocks for entrance animation.
- `data-tip="…"` + tabindex/focusable element for tooltips.
- `CP.mountCodeCard` handles language tabs, highlighting, copy and persistence.
- Use `CP.countUp`, `CP.onVisible`, `CP.$`, `CP.$$`, `CP.reduceMotion`.

## Final answer

Reply with, per chapter:

- sections covered (numbers + titles);
- the three strongest visuals and what each explains;
- the interaction(s) and how to use them;
- any place where the book content was ambiguous;
- confirmation that your three files are the only files you wrote.

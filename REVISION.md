# Fidelity revision — restore the author's sentences

This pass changes **wording only**. The structure, visuals, interactions and all
editorial additions stay exactly where they are.

The problem: many narrative paragraphs retell the book in a new voice. The reader
should hear Antti Laaksonen's voice: the plain, direct, instructional prose of the
original. Visual captions, lab instructions, pull quotes and other added copy are
ours and should remain as they are.

## What counts as narrative prose

Rewrite:

- ordinary `<p>` and `<p class="lead">` in a section's reading column;
- paragraphs inside `.split2` / `.ch*-prose` columns;
- paragraphs inside `<details>` when they retell book content.

Do **not** rewrite:

- `<p class="statement">` pull quotes;
- `figcaption` text, hero captions, kickers, chip labels, tooltips;
- lab/simulator copy, readouts, legends, table headers, captions;
- headings, section titles, code, or anything inside a code card;
- your own added framing sentences that introduce a diagram or connect two ideas
  (keep these verbatim).

If a paragraph is entirely your addition (no counterpart in the book), leave it.

## How to rewrite

1. Open `source/text/chNN.txt`. It is the extracted book text with
   `===== PDF PAGE n =====` markers and line breaks in the middle of sentences.
2. For each section, find the passage that the paragraph is based on.
3. Replace the paraphrase with the book's own sentences, **nearly word for word**,
   in the book's order. Shorten only where the web page needs it.
4. Allowed edits:
   - drop cross-references ("as we will see in Chapter 5") and PDF artefacts;
   - split one long book paragraph into two or three web paragraphs;
   - adapt punctuation and capitalisation to the page;
   - wrap formulas, variables and code in the existing `<i>`, `<code>`,
     `<sup>`, `<sub>` markup;
   - fix an obvious extraction error (ligatures such as `efﬁciency`).
5. Not allowed:
   - rephrasing for rhythm or style;
   - reordering the argument;
   - adding facts, examples or claims the book does not make;
   - deleting technical content to make room for a visual.
6. Keep all HTML structure and class names. Change text nodes and inline markup
   only. Do not touch `<section>` ids, `.section-num`, headings, CSS or JS.

## The test

Read a rewritten paragraph next to the source. A reader with both open should see
the same sentences, lightly edited. If most sentences could not be found in the
book with small changes, the paragraph is still a paraphrase.

Target: **at least 90% of narrative sentences are recognisably the book's**.
Change the remaining 10% only to join sentences, remove repetition, or fit the
page's visual sequence.

## Finish

```bash
node build.mjs --only=chNN[,chNN]
node --check chapters/chNN.js
node tools/check-chapter.mjs chNN
```

Do not run bare `node build.mjs`. Do not edit shared files or another agent's
chapters. Report which sections you revised and any paragraph you deliberately
left in our voice.

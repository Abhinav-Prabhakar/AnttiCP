# Compression pass — 15–20% fewer words, same human voice

The text is too long, but the redundancy is not the problem. Repetition, asides
and short human recaps are part of what makes the prose sound like Antti
Laaksonen rather than a summary. **Do not strip them out.**

This is a line-editing pass, not an outline pass.

## Target

Use `python3 tools/wordcount.py --compare chNN` (baseline is already saved).

- Aim for **16%** fewer words in each chapter.
- Hard range: **15–18%**. Never exceed **20%**.
- The whole book should land around 16%, inside the requested 15–20% band.

## What to cut

1. **Filler and throat-clearing.** "It is possible to", "we can see that",
   "note that", "in fact", "very", "quite", "really", "simply", "just",
   "basically", "what this means is".
2. **Overlong clauses.** Say the same thing with fewer words, in the same
   sentence shape and the same order.
3. **Repeated instructions.** A caption that repeats the paragraph above
   word for word; two readouts that state the same number; an added line that
   only announces the visual directly below it.
4. **Purely mechanical added copy.** Designer transitions that exist only to
   connect two blocks the reader can already see are connected.
5. **Sentences with no information, emphasis or voice.** This is rare. Most
   short sentences that look "useless" are doing rhythmic work; keep them.

## What must stay

- The author's repetitions, rhetorical doubling, asides and recaps. If a
  paragraph restates an idea to land it, that is voice, not waste.
- Every definition, theorem, formula, complexity, proof step, caveat and
  technical distinction.
- Every example that carries a different idea.
- Every reference to a figure, lab or control the reader needs.
- Sentence order and paragraph order. Do not merge sections, do not turn prose
  into bullets, do not replace the author's words with synonyms.
- All HTML structure, classes, ids, headings, code, formulas and inline markup.
- Functional UI text: buttons, tabs, legends, readouts, tooltips, labels.
  Compress prose, not controls.

## The test

Read the result aloud. It should sound like the same person talking, only
slightly more compact. If a cut removes a beat, a repetition that lands a point,
or a small aside that gives the page its character, put it back. A chapter at
15% that still sounds human is better than a chapter at 18% that sounds edited.

## Finish

```bash
python3 tools/wordcount.py --compare chNN
node build.mjs --only=chNN
node tools/check-chapter.mjs chNN
```

Only change your own chapter body files. Do not edit shared files, CSS, JS,
README, tools or another agent's chapters. Do not run git commands.

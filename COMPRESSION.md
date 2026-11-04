# Compression pass — 15–19% fewer words per chapter

The words are right; there are too many of them. This pass tightens the existing
text. It is not a rewrite.

## Target

Use `python3 tools/wordcount.py --compare chNN` (baseline is already saved).

- Aim for **17%** fewer words in each chapter.
- Hard range: **15–19%**. Never exceed **20%**.
- The whole book must land between 15% and 20% fewer words.

If a chapter is under 15%, find more redundancy. If it is over 19%, put back the
sentences that carry the most voice.

## What to cut, in order

1. **Duplicate statements.** Two paragraphs saying the same thing, a caption
   repeating the paragraph, a readout restating the heading.
2. **Redundant added copy.** Designer transitions that explain what the next
   visual obviously shows; closing lines that only summarise the section again;
   meta commentary about the page ("this section will…", "as you can see…").
3. **Over-explanation.** A sentence that unpacks a term the previous sentence
   already defined; a second example doing the same job as the first.
4. **Filler.** "It is possible to", "we can see that", "note that", "in fact",
   "very", "quite", "really", "simply", "just", "basically".
5. **Weak qualifiers and hedges** that do not change the technical claim.

Remove whole sentences before trimming inside sentences. When trimming inside a
sentence, delete words; do not replace the author's words with synonyms.

## What must stay

- Every definition, theorem, formula, complexity, proof step, caveat and
  technical distinction.
- Every example that carries a different idea.
- Every reference to a figure, lab or control the reader needs.
- The author's voice: plain, direct, instructional, short declarative sentences.
  Do not make it breezy, chatty, listy or dramatic.
- Sentence order and paragraph order. Do not merge sections or turn prose into
  bullets.
- All HTML structure, classes, ids, headings, code, formulas and inline markup.
- Functional UI text: buttons, tabs, legends, readouts, tooltips, labels.
  Compress prose, not controls.

## Test

Read the result aloud. It should sound like the same author saying the same
thing in fewer words, not like an editor summarising him. If a sentence only
exists to announce the next sentence, delete it. If deleting it loses a fact,
keep it.

## Finish

```bash
python3 tools/wordcount.py --compare chNN
node build.mjs --only=chNN
node tools/check-chapter.mjs chNN
```

Only change your own chapter body files. Do not edit shared files, CSS, JS,
README, tools or another agent's chapters. Do not run git commands.

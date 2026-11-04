#!/usr/bin/env python3
"""Measure how closely chapter prose follows the book source.

Usage: python3 tools/fidelity.py [ch02 ch03 ...]

For each narrative paragraph (p/lead, not inside a figure, caption, lab, card,
note, aside, or a statement), compute:
  - coverage: fraction of its 5-word shingles that occur in the source text
  - longest: longest run of consecutive words found verbatim in the source

Faithful paragraphs score high on both. Paraphrases score low.
"""
import re
import sys
import unicodedata
from html.parser import HTMLParser
from pathlib import Path

EXCLUDE_ANCESTORS = {
    "figure", "figcaption", "aside", "table", "pre", "code",
    "details", "summary",
}
EXCLUDE_CLASS_PARTS = (
    "statement", "caption", "cap", "hero", "lab", "card", "note",
    "tooltip", "legend", "readout", "kicker", "meta", "chip",
    "sim", "demo", "control", "status", "panel", "hint",
)


def normalise(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("’", "'").replace("‘", "'")
    text = text.replace("“", '"').replace("”", '"')
    text = text.replace("–", "-").replace("—", "-")
    text = re.sub(r"-\s*\n\s*", "", text)
    return re.sub(r"\s+", " ", text).strip().lower()


def words(text: str):
    return re.findall(r"[a-z0-9]+", normalise(text))


class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.current = None
        self.paragraphs = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        cls = attrs.get("class", "") or ""
        if tag == "p":
            self.current = {
                "text": [],
                "ancestors": [t for t, _ in self.stack],
                "classes": cls,
                "section": next((a for t, a in reversed(self.stack) if t == "section"), ""),
            }
        if tag not in ("br", "img", "hr", "meta", "link", "input", "use", "path", "circle", "rect", "line", "text", "tspan"):
            self.stack.append((tag, attrs.get("id", "")))

    def handle_endtag(self, tag):
        if tag == "p" and self.current is not None:
            self.paragraphs.append(self.current)
            self.current = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self.current is not None:
            self.current["text"].append(data)


def should_skip(p) -> bool:
    if any(a in EXCLUDE_ANCESTORS for a in p["ancestors"]):
        return True
    cls = p["classes"].lower()
    if any(part in cls for part in EXCLUDE_CLASS_PARTS):
        return True
    return False


def analyse(slug: str):
    body = Path(f"chapters/{slug}.body.html").read_text()
    source = normalise(Path(f"source/text/{slug}.txt").read_text())
    src_tokens = words(source)
    src_join = " " + " ".join(src_tokens) + " "
    src_shingles = set()
    for n in (5,):
        for i in range(len(src_tokens) - n + 1):
            src_shingles.add(" ".join(src_tokens[i:i + n]))

    parser = Collector()
    parser.feed(body)
    rows = []
    for p in parser.paragraphs:
        if should_skip(p):
            continue
        text = " ".join(p["text"]).strip()
        toks = words(text)
        if len(toks) < 8:
            continue
        shingles = [" ".join(toks[i:i + 5]) for i in range(len(toks) - 4)]
        hit = sum(1 for s in shingles if s in src_shingles)
        coverage = hit / len(shingles) if shingles else 1.0
        # longest verbatim run, binary search on length
        lo, hi = 0, len(toks)
        while lo < hi:
            mid = (lo + hi + 1) // 2
            found = any((" " + " ".join(toks[i:i + mid]) + " ") in src_join
                        for i in range(len(toks) - mid + 1))
            if found:
                lo = mid
            else:
                hi = mid - 1
        rows.append({
            "coverage": coverage,
            "longest": lo,
            "n": len(toks),
            "text": re.sub(r"\s+", " ", text),
            "section": p["section"],
            "classes": p["classes"],
        })
    return rows


def main():
    slugs = sys.argv[1:] or [f"ch{i:02d}" for i in range(2, 16)]
    for slug in slugs:
        if not Path(f"chapters/{slug}.body.html").exists():
            continue
        rows = analyse(slug)
        if not rows:
            print(f"{slug}: no narrative paragraphs")
            continue
        avg = sum(r["coverage"] for r in rows) / len(rows)
        weak = [r for r in rows if r["coverage"] < 0.45]
        print(f"\n{slug}: {len(rows)} narrative paragraphs, mean coverage {avg:.2f}, {len(weak)} below 0.45")
        for r in sorted(weak, key=lambda x: x["coverage"])[:12]:
            print(f"  {r['coverage']:.2f}  run={r['longest']:>3} words  {r['section']:<10} {r['text'][:110]}")


if __name__ == "__main__":
    main()

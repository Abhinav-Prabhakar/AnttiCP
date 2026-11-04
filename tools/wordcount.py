#!/usr/bin/env python3
"""Count compressible prose words in each chapter body.

Usage:
  python3 tools/wordcount.py                 # current counts
  python3 tools/wordcount.py --save          # write .compression-baseline.json
  python3 tools/wordcount.py --compare       # reduction against baseline
  python3 tools/wordcount.py ch02 ch03       # limit to chapters

Counts text in paragraphs, captions, list items, summaries, quotes and table
cells. Skips code, SVG labels, headings, and compact UI chrome.
"""
import json
import re
import sys
import unicodedata
from html.parser import HTMLParser
from pathlib import Path

SKIP_TAGS = {"svg", "code", "pre", "script", "style", "h1", "h2", "h3", "h4", "h5", "h6"}
SKIP_CLASS_PARTS = (
    "code-card", "chip", "kicker", "section-num", "readout", "legend",
    "status", "control", "btn", "tab", "tooltip", "statline", "toolbar",
    "siderail", "topbar", "drawer", "hero__meta", "pillar__num",
)
COUNT_TAGS = {"p", "figcaption", "li", "summary", "blockquote", "td", "th", "dt", "dd"}


class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.skip_depth = 0
        self.counting = 0
        self.words = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        cls = (attrs.get("class") or "").lower()
        skip = tag in SKIP_TAGS or any(part in cls for part in SKIP_CLASS_PARTS)
        if skip:
            self.skip_depth += 1
            self.stack.append((tag, True))
            return
        self.stack.append((tag, False))
        if tag in COUNT_TAGS:
            self.counting += 1
        # Void elements still need their stack entry removed.
        if tag in {"br", "img", "hr", "meta", "link", "input", "use", "path",
                   "circle", "rect", "line", "polygon", "polyline", "ellipse"}:
            self.handle_endtag(tag)

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                skipped = self.stack[i][1]
                if skipped:
                    self.skip_depth -= 1
                elif tag in COUNT_TAGS:
                    self.counting -= 1
                del self.stack[i:]
                return

    def handle_data(self, data):
        if self.skip_depth or not self.counting:
            return
        text = unicodedata.normalize("NFKC", data)
        self.words += len(re.findall(r"[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*", text))


def count(path):
    parser = Collector()
    parser.feed(Path(path).read_text())
    return parser.words


def chapters():
    return [f"ch{i:02d}" for i in range(1, 16)]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    slugs = args or chapters()
    baseline_path = Path(".compression-baseline.json")
    baseline = json.loads(baseline_path.read_text()) if baseline_path.exists() else {}
    rows = []
    for slug in slugs:
        path = Path(f"chapters/{slug}.body.html")
        if not path.exists():
            continue
        words = count(path)
        rows.append((slug, words))
        if "--save" in sys.argv:
            baseline[slug] = words
    if "--save" in sys.argv:
        baseline_path.write_text(json.dumps(baseline, indent=2) + "\n")
        print(f"saved {len(rows)} chapters to {baseline_path}")
        return
    total = sum(w for _, w in rows)
    print(f"{'chapter':<8} {'words':>7} {'baseline':>9} {'cut':>7}")
    for slug, words in rows:
        base = baseline.get(slug)
        if base and "--compare" in sys.argv:
            cut = 1 - words / base
            print(f"{slug:<8} {words:>7} {base:>9} {cut:>6.1%}")
        else:
            print(f"{slug:<8} {words:>7}")
    if "--compare" in sys.argv and baseline:
        base_total = sum(baseline.get(slug, w) for slug, w in rows)
        print(f"{'total':<8} {total:>7} {base_total:>9} {1 - total / base_total:>6.1%}")


if __name__ == "__main__":
    main()

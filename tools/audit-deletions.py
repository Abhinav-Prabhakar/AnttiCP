#!/usr/bin/env python3
"""Report baseline sentences that no longer exist in a chapter body.

Compares the pre-compression body at a git ref with the working tree and lists
sentences whose closest surviving sentence is only loosely similar. Heavily
rewritten sentences are expected; genuinely deleted rhetorical lines show up as
short sentences with no close match.

  python3 tools/audit-deletions.py 208c628 [ch07 ch08 ...]
"""
import re
import subprocess
import sys
from difflib import SequenceMatcher
from html.parser import HTMLParser
from pathlib import Path

SKIP_TAGS = {"svg", "code", "pre", "script", "style", "h1", "h2", "h3", "h4", "h5", "h6"}
SKIP_CLASS_PARTS = (
    "code-card", "chip", "kicker", "section-num", "readout", "legend",
    "status", "control", "btn", "tab", "tooltip", "statline", "toolbar",
    "siderail", "topbar", "drawer", "pillar__num",
)
COUNT_TAGS = {"p", "figcaption", "li", "summary", "blockquote", "td", "th", "dt", "dd"}


class TextBlocks(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.skip_depth = 0
        self.depth = 0
        self.blocks = []
        self.current = None
        self.current_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        cls = (attrs.get("class") or "").lower()
        skip = tag in SKIP_TAGS or any(part in cls for part in SKIP_CLASS_PARTS)
        if skip:
            self.stack.append((tag, True))
            self.skip_depth += 1
            return
        self.stack.append((tag, False))
        self.depth += 1
        if tag in COUNT_TAGS and self.skip_depth == 0:
            self.blocks.append("")
            self.current_depth = self.depth
        if tag in {"br", "img", "hr", "meta", "link", "input", "use", "path",
                   "circle", "rect", "line", "polygon", "polyline", "ellipse"}:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                skipped = self.stack[i][1]
                if skipped:
                    self.skip_depth -= 1
                else:
                    if self.current_depth and self.depth == self.current_depth:
                        self.current_depth = 0
                    self.depth -= 1
                del self.stack[i:]
                return

    def handle_data(self, data):
        if self.skip_depth or not self.blocks:
            return
        self.blocks[-1] += data


def blocks(text):
    parser = TextBlocks()
    parser.feed(text)
    out = []
    for block in parser.blocks:
        block = re.sub(r"\s+", " ", block).strip()
        if block:
            out.append(block)
    return out


def sentences(text):
    parts = re.split(r"(?<=[.!?])\s+", re.sub(r"\s+", " ", text).strip())
    return [p for p in parts if len(p.split()) >= 3]


def norm(text):
    text = text.lower()
    text = text.replace("\u2019", "'").replace("\u201c", '"').replace("\u201d", '"')
    text = text.replace("\u2014", " ").replace("\u2013", " ")
    text = re.sub(r"[^a-z0-9' ]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def main():
    ref = sys.argv[1] if len(sys.argv) > 1 else "208c628"
    wanted = sys.argv[2:]
    chapters = sorted(Path("chapters").glob("ch*.body.html"))
    for path in chapters:
        slug = path.name.split(".")[0]
        if wanted and slug not in wanted:
            continue
        old_html = subprocess.run(
            ["git", "show", f"{ref}:chapters/{path.name}"],
            capture_output=True, text=True,
        ).stdout
        new_html = path.read_text()
        old_sents = []
        for block in blocks(old_html):
            old_sents.extend(sentences(block))
        new_sents = []
        for block in blocks(new_html):
            new_sents.extend(sentences(block))
        new_norm = [norm(s) for s in new_sents]

        lost = []
        for sentence in old_sents:
            key = norm(sentence)
            if len(key.split()) < 4:
                continue
            best = 0.0
            for candidate in new_norm:
                if abs(len(candidate) - len(key)) > max(len(key) * 0.9, 40):
                    continue
                ratio = SequenceMatcher(None, key, candidate).ratio()
                if ratio > best:
                    best = ratio
                    if best > 0.91:
                        break
            if best < 0.55:
                lost.append((best, sentence))

        if lost:
            print(f"\n## {slug}: {len(lost)} baseline sentences have no close match")
            for ratio, sentence in lost:
                print(f"  [{ratio:.2f}] {sentence}")


if __name__ == "__main__":
    main()

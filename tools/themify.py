#!/usr/bin/env python3
"""Turn literal colours into theme tokens and generate theme.css.

Run once after adding or changing colours in the shared CSS, chapter CSS,
chapter body SVGs or chapter JS SVG templates.

  python3 tools/themify.py

Every literal colour becomes var(--c-...). theme.css defines the light value on
:root and a dark value under html[data-theme="dark"].
"""
import colorsys
import re
from pathlib import Path

CSS_FILES = [Path("styles.css")] + sorted(Path("chapters").glob("ch*.css"))
BODY_FILES = sorted(Path("chapters").glob("ch*.body.html"))
JS_FILES = sorted(Path("chapters").glob("ch*.js"))

HEX_RE = re.compile(r"#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b")
RGB_RE = re.compile(r"rgba?\([^)]*\)")
ATTR_RE = re.compile(r'((?:fill|stroke|stop-color|color)=")([^"]+)(")')
JS_COLOR_RE = re.compile(r"(['\"])(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))\1")

OVERRIDES = {
    "ffffff": "#1c1c19",
    "000000": "#e6e6e6",
    "171717": "#e9e9e4",
    "f8f8f5": "#161614",
    "fbfbf8": "#181816",
    "f4f4f0": "#181816",
    "f4f4ef": "#181816",
    "efeee7": "#20201c",
    "e6e2d6": "#26241f",
    "f5f5f0": "#1b1b18",
    "f8f8f4": "#1d1d1a",
    "fafaf7": "#1a1a17",
    "f7f7f3": "#151513",
    "f1f1ec": "#161614",
    "f0f0ea": "#151513",
    "ecece7": "#292926",
    "edede7": "#282825",
    "e9e9e2": "#242421",
    "e6e6e0": "#232320",
    "deded8": "#33332f",
    "cfcfc7": "#3c3c37",
    "a6a69e": "#96968e",
    "8f8f88": "#8f8f87",
    "77776f": "#b0b0a7",
    "3a3a36": "#d4d4cc",
    "2a2a2a": "#dcdcd7",
    "a6402e": "#e0836c",
    "eddfdb": "#3a2521",
    "fbf3f1": "#2b1c19",
    "0f766e": "#5fd3c8",
    "1d4ed8": "#8ab4ff",
    "2f6f4e": "#8bd5a8",
    "7a3e9d": "#c9a2ef",
    "9a5b2e": "#e0b07e",
    "b45309": "#f0c674",
}


def normalise(color: str) -> str:
    color = color.strip().lower()
    if color == "white":
        return "#ffffff"
    if color == "black":
        return "#000000"
    if color.startswith("#"):
        h = color[1:]
        if len(h) == 3:
            h = "".join(c * 2 for c in h)
        elif len(h) == 4:
            h = "".join(c * 2 for c in h)
        return "#" + h
    m = re.match(r"rgba?\(([^)]*)\)", color)
    if m:
        parts = [p.strip() for p in re.split(r"[,\s/]+", m.group(1)) if p.strip()]
        r, g, b = (int(float(x)) for x in parts[:3])
        a = float(parts[3]) if len(parts) > 3 else 1.0
        return f"rgba({r},{g},{b},{a:g})"
    return color


def slug(color: str) -> str:
    if color.startswith("#"):
        return "c-" + color[1:]
    m = re.match(r"rgba\((\d+),(\d+),(\d+),([\d.]+)\)", color)
    if m:
        r, g, b, a = m.groups()
        return f"c-r{r}-g{g}-b{b}-a{a.replace('.', '')}"
    return "c-" + re.sub(r"\W+", "-", color)


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def dark_value(color: str) -> str:
    color = normalise(color)
    key = color.lstrip("#") if color.startswith("#") else color
    if key in OVERRIDES:
        return OVERRIDES[key]
    if color.startswith("#"):
        h = color[1:]
        r, g, b = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
        alpha = 1.0
    else:
        m = re.match(r"rgba\((\d+),(\d+),(\d+),([\d.]+)\)", color)
        if not m:
            return color
        r, g, b = (int(m.group(i)) / 255 for i in (1, 2, 3))
        alpha = float(m.group(4))

    h, l, s = colorsys.rgb_to_hls(r, g, b)
    if s < 0.18:
        if l <= 0.36:
            l2 = 0.78 + (0.36 - l) * 0.35
        elif l >= 0.78:
            l2 = 0.10 + (1 - l) * 0.25
        else:
            l2 = 0.52 + (0.78 - l) * 0.55
        s2 = s
    else:
        l2 = clamp(1 - l, 0.28, 0.78)
        s2 = s * 0.92
    r2, g2, b2 = colorsys.hls_to_rgb(h, clamp(l2, 0, 1), s2)
    out = "#{:02x}{:02x}{:02x}".format(round(r2 * 255), round(g2 * 255), round(b2 * 255))
    if alpha < 1:
        return f"rgba({int(out[1:3], 16)},{int(out[3:5], 16)},{int(out[5:7], 16)},{alpha:g})"
    return out


def collect():
    found = {}

    def add(raw):
        if raw in {"none", "transparent", "currentColor", "inherit", "initial", "unset"}:
            return
        if raw.startswith("url(") or raw.startswith("var("):
            return
        if not (raw.startswith("#") or raw.startswith("rgb") or raw in {"white", "black"}):
            return
        key = normalise(raw)
        found.setdefault(key, raw.strip())

    for path in CSS_FILES:
        text = path.read_text()
        for m in HEX_RE.finditer(text):
            add(m.group(0))
        for m in RGB_RE.finditer(text):
            add(m.group(0))
    for path in BODY_FILES:
        text = path.read_text()
        for m in ATTR_RE.finditer(text):
            add(m.group(2))
    for path in JS_FILES:
        text = path.read_text()
        for m in JS_COLOR_RE.finditer(text):
            add(m.group(2))
    return found


def replace_css(text, colors):
    def sub(m):
        key = normalise(m.group(0))
        return f"var(--{slug(key)})" if key in colors else m.group(0)
    return HEX_RE.sub(sub, RGB_RE.sub(sub, text))


def replace_body(text, colors):
    def sub(m):
        key = normalise(m.group(2))
        return m.group(1) + (f"var(--{slug(key)})" if key in colors else m.group(2)) + m.group(3)
    return ATTR_RE.sub(sub, text)


def replace_js(text, colors):
    def sub(m):
        key = normalise(m.group(2))
        return m.group(1) + (f"var(--{slug(key)})" if key in colors else m.group(2)) + m.group(1)
    return JS_COLOR_RE.sub(sub, text)


def main():
    colors = collect()
    for path in CSS_FILES:
        path.write_text(replace_css(path.read_text(), colors))
    for path in BODY_FILES:
        path.write_text(replace_body(path.read_text(), colors))
    for path in JS_FILES:
        path.write_text(replace_js(path.read_text(), colors))

    lines = [
        "/* Generated by tools/themify.py. Do not hand-edit colour tokens. */",
        ":root {",
    ]
    for key in sorted(colors):
        lines.append(f"  --{slug(key)}: {colors[key]};")
    lines += ["}", "", 'html[data-theme="dark"] {', "  color-scheme: dark;"]
    for key in sorted(colors):
        lines.append(f"  --{slug(key)}: {dark_value(key)};")
    lines += ["}", ""]
    Path("theme.css").write_text("\n".join(lines))
    print(f"{len(colors)} colours tokenised across {len(CSS_FILES)} CSS files, "
          f"{len(BODY_FILES)} bodies and {len(JS_FILES)} scripts")


if __name__ == "__main__":
    main()

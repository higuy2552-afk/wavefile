#!/usr/bin/env python3
"""
Build the static dossier markup from content/source.txt and inject it into
public/index.html between the @LORE-START@ / @LORE-END@ markers.

Fidelity rule: every visible character of the user's original profile text is
preserved verbatim. Only the markdown bullet markers ("* ") are turned into
list structure, which is the layout freedom the user asked for.

Run:  python3 tools/build_lore.py
"""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
SOURCE = PROJECT / "content" / "source.txt"
TARGET = PROJECT / "public" / "index.html"
OPENING_TARGET = PROJECT / "public" / "js" / "opening-lines.js"

# 1-indexed source lines holding the three opening messages, in order.
OPENING_LINES = (3, 4, 5)

START = "<!--@LORE-START@-->"
END = "<!--@LORE-END@-->"

# Source line numbers (1-indexed, inclusive) that hold the profile document.
# 49  : ─── ⌈ 𝑴𝑨𝑺𝑻𝑬𝑹  𝑪𝑯𝑨𝑹𝑨𝑪𝑻𝑬𝑷  𝑭𝑰𝑳𝑬 ⌋ ───
# 50  : ☁︎ ... ── 𝑾𝑨𝑽𝑬 [ 𝑯𝑹𝑨𝑵𝑮 ] 𝑑. 𝑷𝑬𝑻𝑹𝑶𝑳𝑬 ── ☁︎ ...
# 51  : quote
# 52-96 : sections 01..06
# 98  : decorative pattern divider
DOC_START = 49
DOC_END = 98

SECTION_RE = re.compile(r"^(𝄎\s*\d+)\s*:\s*(.*)$")
BULLET_RE = re.compile(r"^(\s*)\*\s?(.*)$")
BRACKET_RE = re.compile(r"\[([^\]]+)\]")


def esc(text: str) -> str:
    return html.escape(text, quote=False)


def write_opening_lines(raw: list[str]) -> None:
    """Emit the three opening messages exactly as the user typed them."""
    lines = []
    for number in OPENING_LINES:
        text = raw[number - 1].strip()
        text = re.sub(r"^[-–—]\s*", "", text)
        lines.append(text)

    body = json.dumps(lines, ensure_ascii=False, indent=2)
    OPENING_TARGET.write_text(
        "/** Generated verbatim from content/source.txt by tools/build_lore.py — do not hand-edit. */\n"
        f"export const OPENING_LINES = {body};\n",
        encoding="utf-8",
    )
    print(f"wrote {len(lines)} opening lines -> {OPENING_TARGET.name}")


def parse_sections(lines: list[str]):
    """Group the document body into section dicts."""
    sections: list[dict] = []
    current = None

    for raw in lines:
        line = raw.rstrip("\n")
        if not line.strip():
            continue

        sec = SECTION_RE.match(line)
        if sec:
            current = {
                "num": sec.group(1),
                "title": sec.group(2),
                "items": [],
            }
            sections.append(current)
            continue

        bullet = BULLET_RE.match(line)
        if bullet and current is not None:
            indent = len(bullet.group(1))
            text = bullet.group(2).rstrip()
            level = 1 if indent >= 3 else 0
            if level == 0:
                current["items"].append({"text": text, "children": []})
            else:
                if not current["items"]:
                    current["items"].append({"text": "", "children": []})
                current["items"][-1]["children"].append(text)
            continue

        # Fallback: keep the raw line inside the current section, nothing lost.
        if current is not None:
            current["items"].append({"text": line.strip(), "children": []})

    return sections


def render_section(index: int, section: dict) -> str:
    slug = f"sec-{index:02d}"
    thai = BRACKET_RE.search(section["title"])
    nav_label = thai.group(1) if thai else section["title"]

    rows = []
    for item in section["items"]:
        text = item["text"]
        children = item["children"]
        sub = ""
        if children:
            inner = "".join(
                f'<li class="row__sub">{esc(child)}</li>' for child in children
            )
            sub = f'<ul class="row__subs">{inner}</ul>'
        if text:
            rows.append(
                '<li class="row">'
                f'<span class="row__mark" aria-hidden="true"></span>'
                f'<span class="row__text">{esc(text)}</span>'
                f"{sub}"
                "</li>"
            )
        elif sub:
            rows.append(f'<li class="row row--bare">{sub}</li>')

    body = f'<ul class="blk__list">{"".join(rows)}</ul>'

    return (
        f'<section class="blk" id="{slug}" data-num="{index:02d}" '
        f'data-nav="{esc(nav_label)}">'
        f'<span class="blk__ghost" aria-hidden="true">{index:02d}</span>'
        '<header class="blk__head">'
        '<h2 class="blk__title">'
        f'<span class="blk__tag">{esc(section["num"])}</span>'
        f'<span class="blk__sep" aria-hidden="true"> : </span>'
        f'<span class="blk__name">{esc(section["title"])}</span>'
        "</h2>"
        '<button class="blk__toggle" type="button" '
        'aria-expanded="true" '
        f'aria-controls="{slug}-body">'
        '<span class="blk__toggle-ico" aria-hidden="true"></span>'
        '<span class="blk__toggle-txt">ย่อ</span>'
        "</button>"
        "</header>"
        f'<div class="blk__body" id="{slug}-body">{body}</div>'
        "</section>"
    )


def main() -> None:
    raw = SOURCE.read_text(encoding="utf-8").split("\n")
    write_opening_lines(raw)
    doc = raw[DOC_START - 1 : DOC_END]

    header_line = doc[0].rstrip()
    sub_line = doc[1].rstrip()
    quote_line = doc[2].rstrip()

    body_lines = doc[3:]
    # The trailing decorative pattern line stays out of the numbered sections.
    divider = ""
    kept: list[str] = []
    for line in body_lines:
        if line.strip() and not line.lstrip().startswith(("*", "𝄎")) and not SECTION_RE.match(line):
            divider = line.strip()
        else:
            kept.append(line)

    sections = parse_sections(kept)

    parts = [
        '<article class="dossier" id="dossier">',
        '<header class="dossier__head">',
        '<div class="dossier__rule" aria-hidden="true"></div>',
        f'<p class="dossier__masthead">{esc(header_line)}</p>',
        f'<p class="dossier__subhead">{esc(sub_line)}</p>',
        f'<blockquote class="dossier__quote">{esc(quote_line)}</blockquote>',
        '<div class="dossier__rule" aria-hidden="true"></div>',
        "</header>",
    ]

    for i, section in enumerate(sections, start=1):
        parts.append(render_section(i, section))

    if divider:
        parts.append(
            '<div class="dossier__divider" aria-hidden="true">'
            f'<span class="dossier__divider-txt">{esc(divider)}</span>'
            "</div>"
        )

    parts.append("</article>")
    markup = "\n".join(parts)

    page = TARGET.read_text(encoding="utf-8")
    if START not in page or END not in page:
        raise SystemExit("Markers not found in public/index.html")

    pre, rest = page.split(START, 1)
    _, post = rest.split(END, 1)
    TARGET.write_text(f"{pre}{START}\n{markup}\n{END}{post}", encoding="utf-8")

    print(f"injected {len(sections)} sections, {len(markup)} chars of markup")


if __name__ == "__main__":
    main()

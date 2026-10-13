#!/usr/bin/env python3
"""Rebuild the transparent rose / eyes loops from the raw user GIFs.

The source GIFs are a bright subject on a black, slightly dithered background.
Two variants are produced for each:

  * glow  — luminance used directly as alpha. Looks right over dark scenes.
  * light — the same keying, then multiplied by a dilated silhouette mask so the
            residual GIF dithering cannot show up as a faint rectangle over the
            light "bio" theme. Mid-tones are lifted a little to keep the subject
            readable on a bright background.

Usage:  python3 tools/build_assets.py
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageSequence

PROJECT = Path(__file__).resolve().parent.parent
RAW = PROJECT.parent / "wave" / "assets" / "raw"
OUT = PROJECT / "public" / "assets"

ROSE_GIF = RAW / "gif1.gif"
EYES_GIF = RAW / "gif2.gif"

TARGET_W = 320
FRAME_MS = 90
LO, HI = 8.0, 255.0
GAMMA = 0.85


def load_frames(path: Path, max_frames: int) -> list[Image.Image]:
    im = Image.open(path)
    frames = [f.copy().convert("RGB") for f in ImageSequence.Iterator(im)]
    if len(frames) > max_frames:
        step = len(frames) / max_frames
        frames = [frames[int(i * step)] for i in range(max_frames)]
    return frames


def resize(frames: list[Image.Image], width: int) -> list[Image.Image]:
    if frames[0].width == width:
        return frames
    scale = width / frames[0].width
    size = (width, max(1, round(frames[0].height * scale)))
    return [f.resize(size, Image.LANCZOS) for f in frames]


def key_alpha(rgb: np.ndarray) -> np.ndarray:
    """Luminance-derived alpha for a bright-subject-on-black frame."""
    mx = rgb.max(axis=2).astype(np.float32)
    lum = np.clip((mx - LO) / (HI - LO), 0.0, 1.0) ** GAMMA
    return lum * 255.0


def silhouette(rgb: np.ndarray, threshold: float, dilate: int, erode: int, blur: float) -> np.ndarray:
    """Binary subject mask, cleaned of scattered dithering."""
    mx = rgb.max(axis=2).astype(np.float32)
    mask = Image.fromarray(((mx >= threshold) * 255).astype("uint8"), "L")
    mask = mask.filter(ImageFilter.MaxFilter(dilate))
    mask = mask.filter(ImageFilter.MinFilter(erode))
    mask = mask.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(mask, dtype=np.float32) / 255.0


def build(frames: list[Image.Image], *, threshold: float, dilate: int, erode: int,
          blur: float, lift: float) -> list[Image.Image]:
    out: list[Image.Image] = []
    for frame in frames:
        rgb = np.asarray(frame, dtype=np.float32)
        alpha = key_alpha(rgb)
        mask = silhouette(rgb, threshold, dilate, erode, blur)
        alpha = alpha * mask
        if lift != 1.0:
            alpha = np.clip(alpha / 255.0, 0.0, 1.0) ** lift * 255.0
        rgba = np.dstack([rgb, alpha]).clip(0, 255).astype("uint8")
        out.append(Image.fromarray(rgba, "RGBA"))
    return out


def union_bbox(frames: list[Image.Image], pad: int = 6) -> tuple[int, int, int, int]:
    """Tight crop shared by every frame so the loop never jitters."""
    x0, y0, x1, y1 = 10 ** 9, 10 ** 9, -1, -1
    for frame in frames:
        alpha = np.asarray(frame)[:, :, 3]
        ys, xs = np.nonzero(alpha > 12)
        if not len(xs):
            continue
        x0, y0 = min(x0, xs.min()), min(y0, ys.min())
        x1, y1 = max(x1, xs.max()), max(y1, ys.max())
    h, w = np.asarray(frames[0]).shape[:2]
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(w - 1, x1 + pad)
    y1 = min(h - 1, y1 + pad)
    return x0, y0, x1 + 1, y1 + 1


def save(frames: list[Image.Image], path: Path, quality: int) -> None:
    box = union_bbox(frames)
    cropped = [f.crop(box) for f in frames]
    cropped[0].save(
        path,
        save_all=True,
        append_images=cropped[1:],
        duration=FRAME_MS,
        loop=0,
        lossless=False,
        quality=quality,
        method=5,
    )
    print(f"  {path.name:18s} {cropped[0].size} {len(cropped)} frames  {path.stat().st_size / 1024:6.1f} KiB")


def main() -> int:
    for src in (ROSE_GIF, EYES_GIF):
        if not src.exists():
            print(f"missing raw source: {src}", file=sys.stderr)
            return 1
    OUT.mkdir(parents=True, exist_ok=True)

    print("rose:")
    rose = resize(load_frames(ROSE_GIF, 19), TARGET_W)
    glow = build(rose, threshold=20, dilate=3, erode=3, blur=1.6, lift=1.0)
    save(glow, OUT / "rose.webp", 84)
    light = build(rose, threshold=58, dilate=7, erode=5, blur=2.4, lift=0.82)
    save(light, OUT / "rose_light.webp", 86)

    print("eyes:")
    eyes = resize(load_frames(EYES_GIF, 24), TARGET_W)
    eglow = build(eyes, threshold=20, dilate=3, erode=3, blur=1.6, lift=1.0)
    save(eglow, OUT / "eyes.webp", 84)
    elight = build(eyes, threshold=52, dilate=7, erode=5, blur=2.4, lift=0.9)
    save(elight, OUT / "eyes_light.webp", 86)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

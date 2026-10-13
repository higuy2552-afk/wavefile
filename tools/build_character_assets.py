#!/usr/bin/env python3
"""Create dossier-ready WebP character captures from supplied JPGs.

The source art is retained as-is in characters/*.jpg. This derived layer gently
compresses blown highlights, adds a green-cinematic grade and a soft vignette so
white rooms/shirts do not overpower the original dossier palette.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'public' / 'assets' / 'characters'
OUT = ROOT / 'public' / 'assets' / 'captures'
OUT.mkdir(parents=True, exist_ok=True)

for src in sorted(SRC.glob('char-*.jpg')):
    im = Image.open(src).convert('RGB')
    arr = np.asarray(im).astype(np.float32) / 255.0
    lum = arr.max(axis=2)
    hi = np.clip((lum - 0.72) / 0.28, 0, 1)
    arr = arr * (1 - hi[..., None] * 0.22)
    arr[..., 1] *= 1.015
    arr[..., 2] *= 0.96
    arr = np.clip(arr, 0, 1)
    h, w = arr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    dx = (xx - w / 2) / (w / 2)
    dy = (yy - h / 2) / (h / 2)
    vignette = np.clip(1 - 0.16 * (dx * dx * 0.7 + dy * dy * 0.45), 0.72, 1)
    arr *= vignette[..., None]
    out = Image.fromarray((arr * 255).astype('uint8'), 'RGB')
    out = ImageEnhance.Contrast(out).enhance(1.06)
    out = ImageEnhance.Color(out).enhance(0.93)
    out.save(OUT / f'{src.stem}.webp', 'WEBP', quality=88, method=6)
    print(f'{src.name} -> {src.stem}.webp {out.size}')

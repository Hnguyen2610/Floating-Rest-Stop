#!/usr/bin/env python3
"""Regenerates public/assets/particles/sparkle.png — a small 4-point twinkle
star (warm-white core, soft off-white outer points), used by
src/utils/ParticleEffect.ts with NORMAL blend mode. The original version of
this script drew a flat solid white circle with ADD blend mode in the
particle config, which is nearly invisible against this game's light pastel
sky background — a plain circle gives the renderer nothing to shade, and
ADD-blending white onto an already-light background barely changes it."""
from PIL import Image, ImageDraw
import math

size = 32
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
cx, cy = size / 2, size / 2


def star_points(cx, cy, outer, inner):
    pts = []
    for i in range(8):
        r = outer if i % 2 == 0 else inner
        angle = math.pi / 4 * i - math.pi / 2
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    return pts


draw.polygon(star_points(cx, cy, 15, 4), fill=(255, 253, 245, 235))
draw.polygon(star_points(cx, cy, 7, 2), fill=(255, 255, 255, 255))
img.save('public/assets/particles/sparkle.png')
print('Created sparkle asset')

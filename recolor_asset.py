#!/usr/bin/env python3
import sys
from PIL import Image

def hex_to_rgb(hex):
    hex = hex.lstrip('#')
    return tuple(int(hex[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hsv(r, g, b):
    r, g, b = r/255.0, g/255.0, b/255.0
    mx = max(r, g, b)
    mn = min(r, g, b)
    df = mx - mn
    if mx == mn:
        h = 0
    elif mx == r:
        h = (60 * ((g - b) / df) + 360) % 360
    elif mx == g:
        h = (60 * ((b - r) / df) + 120) % 360
    elif mx == b:
        h = (60 * ((r - g) / df) + 240) % 360
    if mx == 0:
        s = 0
    else:
        s = df / mx
    v = mx
    return h, s, v

def hsv_to_rgb(h, s, v):
    h = float(h)
    s = float(s)
    v = float(v)
    h60 = h / 60.0
    h60f = h60 - int(h60)
    hi = int(h60) % 6
    f = h60f
    p = v * (1 - s)
    q = v * (1 - f * s)
    t = v * (1 - (1 - f) * s)
    if hi == 0:
        r, g, b = v, t, p
    elif hi == 1:
        r, g, b = q, v, p
    elif hi == 2:
        r, g, b = p, v, t
    elif hi == 3:
        r, g, b = p, q, v
    elif hi == 4:
        r, g, b = t, p, v
    elif hi == 5:
        r, g, b = v, p, q
    r, g, b = int(r * 255), int(g * 255), int(b * 255)
    return r, g, b

def recolor_image(input_path, output_path, target_hex):
    img = Image.open(input_path).convert('RGBA')
    target_rgb = hex_to_rgb(target_hex)
    target_h, target_s, target_v = rgb_to_hsv(*target_rgb)
    # We'll keep the original V (value) for shading, but set H and S to target
    # However, we want to keep the original shading (V) but change the hue and saturation to the target.
    # We'll set H and S to target, and keep V from original (but we might want to adjust V to match target's V?).
    # Let's keep the original V for now, but note that the target color might have a different V.
    # We'll adjust V to be the original V * (target_v / 0.5) ? Not sure.
    # Alternatively, we can shift the hue and keep the original S and V? But we want pastel, so we want high V and low S.
    # We'll set S to target_s (which is low for pastel) and V to original V (so shading remains).
    # But we also want to shift the hue to target_h.
    # We'll leave V as original.
    datas = img.getdata()
    newData = []
    for item in datas:
        # item is (R, G, B, A)
        if item[3] == 0:  # transparent
            newData.append(item)
        else:
            r, g, b, a = item
            # Skip if very dark (outline) - we assume outline has low V
            h, s, v = rgb_to_hsv(r, g, b)
            if v < 0.2:  # outline, keep as is
                newData.append(item)
            else:
                # Recolor: set H and S to target, keep V
                r_new, g_new, b_new = hsv_to_rgb(target_h, target_s, v)
                newData.append((r_new, g_new, b_new, a))
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Recolored {input_path} to {output_path} with target {target_hex}")

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: python recolor_asset.py <input> <output> <target_hex>")
        sys.exit(1)
    recolor_image(sys.argv[1], sys.argv[2], sys.argv[3])
"""Generate Side Clock extension icons using Pillow."""
from PIL import Image, ImageDraw, ImageFont
import os, math

OUT = os.path.dirname(__file__)
SIZES = [16, 48, 128]

BG      = (15, 17, 23)          # #0f1117
PANEL   = (26, 30, 46, 220)     # semi-transparent dark blue
ACCENT1 = (79, 195, 247)        # #4fc3f7
ACCENT2 = (179, 229, 252)       # #b3e5fc
WHITE   = (255, 255, 255)
GREY    = (160, 170, 200)


def rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
    draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
    for cx, cy in [(x0+radius, y0+radius), (x1-radius, y0+radius),
                   (x0+radius, y1-radius), (x1-radius, y1-radius)]:
        draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius], fill=fill)


def accent_gradient(img, draw, x0, y0, x1, y1, r):
    """Horizontal gradient line from ACCENT1 to ACCENT2."""
    w = x1 - x0
    for i in range(w):
        t = i / max(w - 1, 1)
        c = tuple(int(ACCENT1[k] + (ACCENT2[k] - ACCENT1[k]) * t) for k in range(3))
        draw.line([(x0 + i, y0), (x0 + i, y1)], fill=c)


def make_icon(size):
    scale = size
    img = Image.new('RGBA', (scale, scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    r = max(2, scale // 8)

    # Background
    rounded_rect(draw, [0, 0, scale - 1, scale - 1], r, BG)

    if size == 16:
        # Simplified: just accent bar + tiny clock dots
        bar_h = max(2, scale // 8)
        accent_gradient(img, draw, r, 0, scale - r, bar_h, r)
        # Clock circle
        cx, cy, cr = scale // 2, scale // 2 + bar_h, scale // 4
        draw.ellipse([cx-cr, cy-cr, cx+cr, cy+cr], outline=GREY, width=1)
        draw.line([cx, cy, cx, cy-cr+2], fill=WHITE, width=1)
        draw.line([cx, cy, cx+cr-2, cy], fill=WHITE, width=1)
    elif size == 48:
        pad = 4
        bar_h = max(3, scale // 14)
        panel_top = scale // 4
        panel_bot = scale - pad

        # Panel
        pr = max(2, scale // 16)
        rounded_rect(draw, [pad, panel_top, scale - pad - 1, panel_bot], pr, (30, 35, 55, 200))

        # Accent bar (top of panel)
        accent_gradient(img, draw, pad + pr, panel_top, scale - pad - pr, panel_top + bar_h, 0)

        # Clock face
        cx = scale // 2
        cy = panel_top + bar_h + (panel_bot - panel_top - bar_h) // 2
        cr = min(scale // 5, (panel_bot - panel_top - bar_h) // 2 - 2)
        draw.ellipse([cx-cr, cy-cr, cx+cr, cy+cr], outline=GREY, width=1)
        # Hour hand (pointing to 12)
        draw.line([cx, cy, cx, cy - int(cr * 0.6)], fill=WHITE, width=2)
        # Minute hand (pointing to 3, slightly longer... or let's do 12:00)
        draw.line([cx, cy, cx, cy - int(cr * 0.85)], fill=ACCENT1, width=1)
        # Center dot
        draw.ellipse([cx-1, cy-1, cx+1, cy+1], fill=WHITE)
    else:
        # 128px — full detail
        pad = 10
        bar_h = 5
        panel_top = 35
        panel_bot = scale - pad

        pr = 10
        rounded_rect(draw, [pad, panel_top, scale - pad - 1, panel_bot], pr, (30, 35, 60, 210))

        # Accent gradient bar
        accent_gradient(img, draw, pad + pr, panel_top, scale - pad - pr, panel_top + bar_h, 0)

        # Try to use a system font; fall back to default
        try:
            time_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 26)
            date_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 11)
        except Exception:
            time_font = ImageFont.load_default()
            date_font = time_font

        # Time text
        time_str = '12:00'
        bbox = draw.textbbox((0, 0), time_str, font=time_font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        tx = (scale - tw) // 2
        ty = panel_top + bar_h + 14
        draw.text((tx, ty), time_str, font=time_font, fill=WHITE)

        # Thin separator
        sep_y = ty + th + 10
        draw.line([pad + pr + 4, sep_y, scale - pad - pr - 4, sep_y],
                  fill=(255, 255, 255, 50), width=1)

        # Weather row
        try:
            wx = pad + pr + 8
            wy = sep_y + 7
            # Sun emoji approximation: circle + rays
            sc2 = 10
            scx, scy = wx + sc2, wy + sc2
            draw.ellipse([scx-5, scy-5, scx+5, scy+5], fill=ACCENT1)
            for angle in range(0, 360, 45):
                rad = math.radians(angle)
                x1b = int(scx + 8 * math.cos(rad))
                y1b = int(scy + 8 * math.sin(rad))
                x2b = int(scx + 11 * math.cos(rad))
                y2b = int(scy + 11 * math.sin(rad))
                draw.line([x1b, y1b, x2b, y2b], fill=ACCENT1, width=1)

            temp_str = '22 °C'
            draw.text((wx + sc2 * 2 + 6, wy + 3), temp_str,
                      font=date_font, fill=GREY)
        except Exception:
            pass

    # Convert RGBA to PNG and save
    out_path = os.path.join(OUT, f'icon{size}.png')
    img.save(out_path, 'PNG')
    print(f'  ✓ {out_path}')


if __name__ == '__main__':
    print('Generating icons...')
    for s in SIZES:
        make_icon(s)
    print('Done.')

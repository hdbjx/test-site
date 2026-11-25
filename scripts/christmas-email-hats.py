"""CHRISTMAS — bakes Santa/elf hats onto the square email headshots for the day-of email.

Run from the repo root:  python3 scripts/christmas-email-hats.py
Reads public/team/email/<name>.jpg and writes public/christmas/email/<name>.png
(round headshot with the hat on top, transparent background, 3x for retina; shown at 64x92).
Santa for owner/manager/tier3, elf for everyone else (matches the About page).
Email clients ignore CSS positioning, so the hat has to be part of the image.
"""
import re, pathlib
from PIL import Image, ImageDraw, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
team_src = (ROOT / "src/data/team.ts").read_text()
roles = {n.lower(): r for n, r in re.findall(r'\{ name: "([^"]+)", role: "([^"]+)"', team_src)}
SANTA_ROLES = {"owner", "manager", "tier3"}

S = 3                      # retina scale
W, H = 64 * S, 92 * S      # output canvas (photo circle at the bottom)
D = 64 * S                 # photo diameter
TOP = H - D                # circle top

santa = Image.open(ROOT / "public/christmas/santa-hat.webp").convert("RGBA")
elf = Image.open(ROOT / "public/christmas/elf-hat.webp").convert("RGBA")
HATS = {  # image, brim y as fraction of image height, width as fraction of photo
    "santa": (santa, 0.66, 0.72),
    "elf": (elf, 0.74, 0.68),
}
TILTS = [-9, 7, -4, 10, -11, 5]

mask = Image.new("L", (D * 4, D * 4), 0)
ImageDraw.Draw(mask).ellipse((0, 0, D * 4 - 1, D * 4 - 1), fill=255)
mask = mask.resize((D, D), Image.LANCZOS)

out_dir = ROOT / "public/christmas/email"
out_dir.mkdir(parents=True, exist_ok=True)
for i, photo in enumerate(sorted((ROOT / "public/team/email").glob("*.jpg"))):
    name = photo.stem
    kind = "santa" if roles.get(name) in SANTA_ROLES else "elf"
    img, brim, wfrac = HATS[kind]

    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    face = Image.open(photo).convert("RGB").resize((D, D), Image.LANCZOS)
    canvas.paste(face, (0, TOP), mask)

    hw = int(D * wfrac)
    hh = int(img.height * hw / img.width)
    hat = img.resize((hw, hh), Image.LANCZOS)
    if i % 2:
        hat = hat.transpose(Image.FLIP_LEFT_RIGHT)
    tilt = TILTS[i % len(TILTS)]
    # rotate around the brim so the brim stays put: pad so the brim is the image center first
    pad = Image.new("RGBA", (hw, int(2 * hh * brim)), (0, 0, 0, 0))
    pad.alpha_composite(hat, (0, 0))
    hat = pad.rotate(-tilt, resample=Image.BICUBIC, expand=True)
    # brim center lands on the top of the head (~13% down the photo), centered
    x = (W - hat.width) // 2
    y = int(TOP + D * 0.13 - hat.height / 2)
    shadow = Image.new("RGBA", hat.size, (0, 0, 0, 0))
    shadow.putalpha(hat.getchannel("A").point(lambda a: int(a * 0.35)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(3 * S / 3))
    canvas.alpha_composite(shadow, (max(0, x), max(0, y + 2 * S)))
    canvas.alpha_composite(hat, (max(0, x), max(0, y)))
    canvas.save(out_dir / f"{name}.png", optimize=True)
    print(name, kind)

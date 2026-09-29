"""Step 1: shrink the 3ds Max BMP textures to web-size JPGs in ./tex.

Then run `python server.py`, open http://127.0.0.1:8765/?mode=export in a
browser, and copy out/human.glb to public/site/human.glb.
"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "..", "..", "motiva-source-assets", "3ds Max", "3ds_max.fbm")
OUT = os.path.join(HERE, "tex")
KEEP = {"Std_Skin_Body": 1024, "Std_Skin_Head": 1024, "Std_Skin_Arm": 1024, "Std_Skin_Leg": 1024,
        "Std_Nails": 512, "Boxers": 1024, "Ga_Eye": 512, "Ga_Teeth": 256}

os.makedirs(OUT, exist_ok=True)
for base, size in KEEP.items():
    for kind in ("Diffuse", "Normal"):
        p = os.path.join(SRC, f"{base}_{kind}.bmp")
        if os.path.exists(p):
            im = Image.open(p).convert("RGB").resize((size, size), Image.LANCZOS)
            im.save(os.path.join(OUT, f"{base}_{kind}.jpg"), quality=86 if kind == "Diffuse" else 90, optimize=True)
            print("wrote", base, kind)

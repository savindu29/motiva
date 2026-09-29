# Patterns, snippets and checks

Each pattern names its class in `templates/concept.css` and where it's used in
`templates/page.tsx`. Copy the code, then change the content.

## Finding and measuring images

Measure PNG sizes without extra libraries:

```bash
python -c "
import struct,glob
for p in sorted(glob.glob('public/<product>/*.png')):
  d=open(p,'rb').read(24); w,h=struct.unpack('>II',d[16:24]); print(p,w,h,round(w/h,3))
"
```

For JPG or WebP, read the image with the Read tool and estimate the shape, or
extend the script.

The page looks up files on the server, so the user only drops files in:

```tsx
const SHOT_DIR = path.join(process.cwd(), "public", "<product>");
const SHOT_EXTS = [".png", ".jpg", ".jpeg", ".webp"];
function findShot(name: string) {
  for (const ext of SHOT_EXTS)
    if (fs.existsSync(path.join(SHOT_DIR, name + ext))) return `/<product>/${name}${ext}`;
  return null;
}
```

`Piece` renders one image whole, or an empty frame that names the file it's
waiting for.

## Pattern catalogue

| Need | Pattern | Classes |
|---|---|---|
| Full-app desktop hero | Browser window rising out of a pink-to-lilac gradient stage with a dot pattern | `.sp-stage`, `.sp-browser`, `.sp-browser-bar` |
| Dark-mode screenshot | Same stage as the hero; only the window chrome turns dark | `.sp-stage.is-darkapp` |
| Mixed UI crops | 12-column bento; each crop whole on a tinted panel (`is-rose`, `is-mist`, `is-lilac`, `is-night`); paired ratios | `.sp-bento`, `.sp-tile`, `.sp-panel` |
| A popup that belongs over a scene | Scene fills the panel; the popup floats tilted in a corner and straightens on hover | `.sp-panel.is-scene`, `.sp-float` |
| Step-by-step flow, no images | Dark band, numbered nodes on a dashed route, a plane flying between the first and last node, fact chips | `.sp-route` |
| Before/after of one view | Drag-to-compare slider (a range input over two stacked images) | `Compare.tsx`, `.sp-compare` |
| Several scenes of one kind | One stage (image whole on a blurred copy), a glass info card, thumbnail tabs with a progress bar, autoplay with pause on hover | `VenueShowcase.tsx`, `.sp-vs` |
| A single scene | Frame with the image covering it, a dark chip label, a soft shade at the foot | `.sp-venue-frame`, `.sp-venue-chip` |
| A two-part flow (button, then panel) | Light panel: the small piece top-right, a dashed arrow, the big piece below | `.sp-wallet`, `.sp-wallet-arrow` |
| Phone screens | Drawn phone mockups (bezel, Dynamic Island, buttons, status bar, glare, edge shading, floor shadow) fanned out with `rotateY` and `translateZ`; captions below; a scroll-snap row on phones | `.sp-phones`, `.sp-phone` |
| Closing CTA | Dark glow band, a pulsing kicker pill, a white H2 with a gradient word, primary and ghost buttons, a closing boarding pass | `.sp-thanks` |
| Real colours | Swatch grid with name and hex | `.sp-swatches` |

## Alignment maths

In a row of two tiles spanning `a` and `b` of 12 columns, where tile A has
ratio `rA`:

```
rB = rA × b / a        e.g. venue 1.48 at 8 cols → the 4-col partner is 0.74
```

After a screenshot, if the heights differ by `dh` on a tile of height `h`,
multiply that tile's ratio by `h_other / h`. Gaps make the first guess
slightly off, so this is expected.

Pairs used so far: 8+4 (scene plus tall list), 5+7 (square plus 4:3), 7+5
(3:2 plus near-square), 6+6 (3:2 plus 3:2), 5+7 (tall ticket plus composite
panel).

## Phone mockup rules

- `--w` is the phone width. Size everything else from it (padding,
  corner radius, island, status bar, font size).
- Screen: `display: flex; flex-direction: column`, with no fixed aspect-ratio.
  Status bar height `calc(var(--w) * 0.12)`. The image uses
  `width: 100%; height: auto`.
- Fan: outer phones `translateZ(-240px) rotateY(±32deg)`, inner phones
  `translateZ(-110px) rotateY(±18deg)`, the centre one `translateZ(40px)`.
  Small negative margins only (`-0.02 × --w`), or the phones hide each other.
- Put the most important screen in the middle.

## Screenshot checks

Desktop, one section, by offsetting a tall iframe (adjust `margin-top` until
the section is in view):

```bash
E="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"  # or Chrome
cat > shot.html <<'EOF'
<html><body style="margin:0;overflow:hidden"><iframe src="http://localhost:3000/concept"
 style="width:1440px;height:17000px;border:0;display:block;margin-top:-4000px"></iframe></body></html>
EOF
"$E" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,1300 \
  --virtual-time-budget=12000 --screenshot="$(cygpath -w $PWD/shot.png)" "file:///$(cygpath -m $PWD/shot.html)"
```

Phone: the same, with the iframe at `width:390px` and the window at
`600,2000`. Headless Chrome won't go narrower than about 500px itself.

Write these helper files to the scratchpad, not the project.

## Bugs already hit, and their fixes

- **Headings invisible on dark bands.** Global `h2` / `h3` colour. Fix: set
  `color: #fff` on the band's headings.
- **Spacing ignored.** `.sp p { margin: 0 }` outranks `.sp-meta { margin-top }`.
  Fix: a `:where()` reset.
- **Image never appears.** A scroll-driven clip animation kept it hidden.
  Fix: remove it.
- **Phone screens cropped at the sides and top.** A fixed screen ratio with
  `object-fit: cover`, and the island over the header. Fix: height from the
  image, plus a status bar.
- **`name.png.png` not found.** A double extension. Fix: rename the file.
- **Wrong content in a slot.** The filename didn't match the image. Fix: look
  at every image, then relabel.

# Motiva Physio

A concept website for a physiotherapy clinic in Colombo, and an agency-style
case study of it. Next.js App Router, React 19, three.js. Demo only: bookings
aren't sent anywhere, and the reviews and headline figures are samples.

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Routes

| Route      | What it is                                               |
|------------|----------------------------------------------------------|
| `/`        | Redirects to `/concept`                                  |
| `/concept` | The case study (`app/concept/`)                          |
| `/site`    | The clinic website (`app/site/`)                         |

## The site (`app/site/`)

- `page.tsx` puts the sections together. `data.ts` holds all the content:
  services, physios, body areas, packages, reviews and FAQs.
- `SiteProvider.tsx` shares the booking state, so any card can open the
  booking at the right step. `Booking.tsx` is the four-step booking.
- `PainMap.tsx` + `HumanBody.tsx`: the 3D body you turn and tap
  (`public/site/human.glb`).
- `xray.ts` + `Photo.tsx`: the X-ray renders in the pain map's area card
  (`public/site/body.glb`).
- `site.css` is scoped under `.mp`, so it can't leak into the case study.

Images are in `public/site/`: `hero.jpg`, `booking.jpg`, `team/`,
`packages/` and `blog/`. To swap one, replace the file, or change its path in
`data.ts`.

## The case study (`app/concept/`)

Its screenshots are in `public/motiva/`. Retake all of them from the running
site with:

```bash
node tools/capture/capture.mjs http://localhost:3000
```

## Tools

- `tools/capture/`: screenshots of `/site` for the case study (headless Edge).
- `tools/human-glb/`: rebuilds `public/site/human.glb` from the 3ds Max
  export. The source files (600 MB) and the original photos are kept outside
  the project in `../motiva-source-assets/`.

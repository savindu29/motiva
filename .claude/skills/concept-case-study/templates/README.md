# Templates

A complete, working case-study page (SkyPass Live) for Next.js App Router.

- `page.tsx`: the page. It loads Poppins (body) and Bricolage Grotesque
  (headings) itself, so the root layout needs no fonts and no Tailwind. Its content is SkyPass-specific: replace all of it
  with facts from the new product. Keep the structure, `SHOTS`, `findShot`,
  `Piece` and `Block`.
- `concept.css`: all styles, scoped under `.sp`. Rename the root class and
  the `sp-` prefix if the project already uses them.
- `Compare.tsx`: the before/after slider (client component).
- `VenueShowcase.tsx`: the tabbed scene showcase (client component).
  Rename it for the new product (for example `FeatureShowcase`).

Copy these into `app/<route>/`, point `SHOT_DIR` at `public/<product>/`, and
change `PROTOTYPE_URL`.

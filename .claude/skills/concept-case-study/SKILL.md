---
name: concept-case-study
description: Build an agency-style concept case-study page (like duck.design/case-study) for a product, from a website, prototype link, HTML file or app the user provides. Use when the user asks to "create a concept page / case study / concept paper" for a site or prototype, or asks to lay out screenshots for one. Covers reading the source, writing honest copy, the section structure, screenshot slots, sizing layouts around real image sizes, phone and browser mockups, and checking the result in a browser.
---

# Concept case-study page

You are turning a product (a website, a prototype, an HTML file) into a
polished, editorial case-study page, in the style of
https://duck.design/case-study/denti-ai/: a white page, one accent colour,
text in a single reading column, and imagery that breaks out wide.

Working templates live in `templates/`. The layout patterns and the reasons
behind them are in `references/patterns.md`. Read that file before you design
any image section.

## Workflow

Follow these steps in order. Don't skip the checks.

### 1. Read the source completely

- For a claude.ai artifact link, use the Artifact tool's `read` action, and read
  the saved file all the way through. For a public URL, use WebFetch. For a
  local HTML file, read it.
- Pull out real facts only: product name, flows and steps, screens, features,
  data (events, prices, plans), design tokens (colours, fonts), tech stack, and
  what's demo-only.
- For a reference case study the user names, fetch it and copy its section
  order and tone, not its content.

### 2. Check the project before writing code

- Read `AGENTS.md` and `CLAUDE.md`. Framework versions may differ from what you
  know. In Next.js 16+ projects, read the relevant guide in
  `node_modules/next/dist/docs/` first.
- Find where the page should go (for example `app/concept/page.tsx`) and
  whether `/` should redirect to it. Ask if unclear.
- Never delete or overwrite pages or components without a backup, unless the
  project is in git and clean. Before clearing anything, copy it to the
  scratchpad.

### 3. Write the page (structure)

Use this order. Drop a section if the product has nothing true to say for it.

1. Top bar: logo, plus an "Open prototype ↗" button (`target="_blank"`)
2. Title block: breadcrumb (Cases › Industry › Platform), the product name in
   the accent colour, a long H1 headline, and a meta row (Year, Industry,
   Platform, Market)
3. Hero: the full-app screenshot in a browser-window frame on a soft gradient
   stage
4. About the product: one large intro paragraph, then one normal paragraph
5. Problem: a heading, three big-word "stats", and a closing statement with an
   accent rule
6. Solution: a heading and three big accent-coloured numbers that are true
   facts about the product
7. What we did: four numbered services
8. Gallery: a bento of UI crops on tinted panels
9. The journey: the steps on a dark "route" band, then the final screens
10. Feature showcase(s): for example an interactive tabbed showcase or a
    before/after slider
11. Payment / trust, and the product's own key moment (for example the ticket)
12. Design system: swatches of the real colours, and dark mode in a browser
    frame
13. On your phone: phone mockups fanned out in 3D
14. What comes next: a numbered roadmap, plus a one-line note that it's a demo
    if it is one
15. Thank-you CTA band, then the footer

Each text section uses the `Block` component: a grey label on the left, the
heading and paragraphs on the right. On a screen under 960px it becomes one
column.

### 4. Screenshot slots

- Every image goes through a `SHOTS` map at the top of the page. It maps a key
  to a filename without the extension, and has a plain-English comment saying
  exactly what to capture and its rough shape.
- The page finds files in `public/<product>/` itself (`findShot` checks .png,
  .jpg, .jpeg and .webp with `fs.existsSync`), so the user only drops in
  correctly named files. An empty slot shows the filename it's waiting for.
- Give the user a table of every filename, its shape, and what to capture.
- Tell users how to capture phone screens: F12 in the browser, then the phone
  icon.

### 5. When the user adds screenshots

Always, before you design:

1. List the folder, and fix double extensions like `name.png.png`.
2. Measure every image's pixel size and ratio (see the snippet in
   `references/patterns.md`).
3. Look at every image. Filenames often don't match the content, so describe
   what's really in each one, and update the comments and labels to match.
4. Check each image for real personal data: names, emails, phone numbers. If
   there is any, tell the user and suggest retaking it with test data. Don't
   silently publish it.
5. Choose the layout from the real ratios (see "Sizing rules" below), not
   from the ratio you planned.

When the user says a slot isn't needed, remove the slot, its SHOTS entry and
its CSS. Don't leave empty frames behind.

### 6. Check it in a real browser

- Run `npx tsc --noEmit -p .` and `npx eslint app/<route>` after every change.
- Take screenshots with headless Edge or Chrome (commands in
  `references/patterns.md`) at 1440px desktop width and 390px phone width.
  Look at each changed section before saying it's done.
- Headless Chrome has a minimum window width of about 500px. For phone
  checks, put the page in a 390px-wide iframe.
- If a screenshot looks faded, you probably caught an entry animation halfway
  through. Retake it before calling it a bug.

## Rules

### Content

- Never invent statistics, customers, quotes or results. Use qualitative
  "big words" or true product facts ("6 venue types", "10:00 seat hold").
- Every claim must be checkable in the source. If something is demo-only, say
  so once, plainly.
- Plain words, short sentences. No marketing filler.
- Keep the prices, currency and locale of the source (for example LKR, incl.
  taxes).

### CSS and code

- Scope everything under one root class (for example `.sp`) in a
  route-specific CSS file. Don't touch the global styles.
- Write the reset with zero specificity:
  `:where(.sp) :is(h1, h2, h3, p, ul, dl, dd, figure) { margin: 0 }`.
  Otherwise the reset beats your spacing rules.
- Global heading colours leak in. On every dark band, set `color` explicitly
  on its `h2` and `h3`, or they come out dark on dark and unreadable.
- Server component by default. Use a small client component (`"use client"`)
  only for interaction: sliders, tabs, autoplay.
- Don't hide content behind scroll-driven animations
  (`animation-timeline: view()`). In some browsers they leave content
  invisible. Entry animations must end visible.
- Respect `prefers-reduced-motion`: turn off animations and autoplay.
- On phones: a 16px side gutter, no horizontal page scroll, and every grid
  falls back to one column. Horizontal rows of phones become a swipeable
  scroll-snap row.
- Use `<img>` with `loading="lazy"` for screenshots, not `next/image`, since
  the sizes vary. Add the eslint-disable comment for
  `@next/next/no-img-element`.
- The prototype link opens in a new tab. If it's a local HTML file, put it in
  `public/` and link `/<file>.html`.

### Sizing rules (the part people get wrong)

- **Never crop UI crops.** Show them whole (`max-width` / `max-height: 100%`)
  on a tinted panel with padding and a soft shadow.
- **Only full scenes may fill a frame** (`object-fit: cover`): 3D views,
  photos. Match the frame ratio to the image ratio so almost nothing is cut.
- **Make paired tiles line up.** In a 12-column row with tiles spanning `a`
  and `b` columns, if tile A's ratio is `rA`, set tile B's panel ratio to
  `rA × b / a`. Then measure the screenshot and nudge for the gap. Pair tall
  images with wide ones this way (for example 8+4, 7+5, 5+7, 6+6).
- **Two images of the same view with one change** (before and after a
  toggle) become a drag-to-compare slider.
- **Several scenes of the same kind** become a tabbed showcase: one big
  stage, with the image whole on a blurred copy of itself, a glass info card,
  and thumbnail tabs with an autoplay progress bar.
- **Phone screens** go in drawn phone mockups. The screen height comes from
  the image (`width: 100%; height: auto`), never a fixed ratio with `cover`,
  and a status bar sits above it so the Dynamic Island never covers the app
  header.
- **Full-app desktop screenshots** go in a browser-window frame rising out of
  a gradient stage. A dark-mode screenshot uses a dark window on the same
  light stage as the hero.

## Handing over

End by telling the user:

- what changed, section by section;
- which slots are still empty, with their filenames;
- any personal data found in their screenshots;
- anything you couldn't check.

Keep it short.

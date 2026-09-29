import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import fs from "node:fs";
import path from "node:path";
import { Compare } from "./Compare";
import { PainShowcase, type PainArea } from "./PainShowcase";
import "./concept.css";

/* the prototype's own typeface, for body and headings */
const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Motiva Physio — case study",
  description:
    "Motiva Physio: a physiotherapy clinic website for Colombo where you tap where it hurts, see every price up front and book a physio in four steps.",
};

/** The working site, built in this project at app/site/. */
const PROTOTYPE_URL = "/site";

/* ==========================================================================
   Screenshots

   HOW TO ADD ONE
   1. Take the screenshot described next to its name below.
   2. Rename the file to that name, e.g. "01-hero.png".
   3. Put it in  motiva/public/motiva/
   That's it: the page finds it on its own. .png, .jpg, .jpeg and .webp all
   work (e.g. "01-hero.jpg" is fine too). Until a file is there, the page
   shows an empty frame with the file name it's waiting for.

   UI crops are shown whole, never cropped, so their shape only needs to be
   roughly right. Capture at 1440 px wide or more (desktop) so it stays sharp.

   All of them can be retaken from the live site in one go, with the dev
   server running:  node tools/capture/capture.mjs
   ========================================================================== */
const SHOTS = {
  // --- Top of the page ------------------------------------------------------
  // About 16:10. Desktop, first screen: the nav bar, the headline with
  // Book Now, and the hero panel with its tags and "Next available" card.
  hero: "01-hero",

  // --- Gallery (four images under "What we did") ----------------------------
  // The services grid: six light, colour-coded tiles with prices (about 2:1).
  services: "02-services",
  // One physio card, hovered so its "Book" pill shows (tall, about 3:4).
  physioCard: "03-physio-card",
  // The physio filters and the card rail below them (about 12:5).
  team: "04-physios",
  // One package card: photo, what's included, price and Book Now (about 3:4).
  package: "05-package",

  // --- Pain map (four shown as a tabbed showcase) ---------------------------
  // The whole "Where does it hurt?" block, body on the left and the area card
  // on the right, with that area selected (about 3:2).
  painNeck: "06-painmap-neck",
  painBack: "07-painmap-lowback", // switch the body to Back first
  painShoulder: "08-painmap-shoulder",
  painKnee: "09-painmap-knee",

  // --- Details (two near-square images side by side) ------------------------
  // 10 and 11 are the same crop of the 3D body, Front then Back. They are
  // shown as a drag-to-compare slider, so keep the crop identical.
  bodyFront: "10-bodymap-front",
  bodyBack: "11-bodymap-back",
  // The pain map's X-ray render with the red pain glow (about 1.1:1).
  xray: "12-xray-render",

  // --- The journey (shown under the four booking steps) ---------------------
  // Step 3: the day strip and the morning and afternoon slots (about 3:2).
  bookSlots: "13-booking-time",
  // "You're booked in" with the MV- reference (about square).
  bookDone: "14-booking-done",

  // --- Trust (two images side by side) ------------------------------------
  // Step 4: the details form with the recap below it (tall, about 4:5).
  bookRecap: "15-booking-details",
  // The FAQ with one answer open (about 8:7).
  faq: "16-faq",

  // --- On your phone --------------------------------------------------------
  // Phone screens, about 1:2, shown in phone mockups fanned out in 3D.
  // Taken at 390 px wide (or: F12 in the browser, then the phone icon).
  mobile1: "17-mobile", // the hero with Book Now
  mobile2: "18-mobile", // the services cards
  mobile3: "19-mobile", // the pain map with an area selected (shown in the middle)
  mobile4: "20-mobile", // booking step 3, day and time
  mobile5: "21-mobile", // "You're booked in"
} satisfies Record<string, string>;

type ShotKey = keyof typeof SHOTS;

const SHOT_DIR = path.join(process.cwd(), "public", "motiva");
const SHOT_EXTS = [".png", ".jpg", ".jpeg", ".webp"];

/** The public URL of a screenshot if its file exists, otherwise null. */
function findShot(name: string) {
  for (const ext of SHOT_EXTS) {
    if (fs.existsSync(path.join(SHOT_DIR, name + ext))) {
      return `/motiva/${name}${ext}`;
    }
  }
  return null;
}

/** A UI crop shown whole (never cropped), for the gallery panels. */
function Piece({ id, label }: { id: ShotKey; label: string }) {
  const src = findShot(SHOTS[id]);
  if (!src) {
    return (
      <div className="mv-piece-empty" role="img" aria-label={`Screenshot to come: ${label}`}>
        <b>{label}</b>
        <code>public/motiva/{SHOTS[id]}.png</code>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="mv-piece" src={src} alt={label} loading="lazy" />;
}

/* --- content ------------------------------------------------------------- */

const META = [
  ["Year", "2026"],
  ["Industry", "Healthcare · Physiotherapy"],
  ["Platform", "Web · desktop & mobile"],
  ["Market", "Colombo, Sri Lanka · LKR"],
];

const PROBLEMS = [
  {
    big: "Guesswork",
    d: "People in pain rarely know whether they need sports rehab, back treatment or just an assessment, or how many visits it will take.",
  },
  {
    big: "No prices",
    d: "Clinic sites often list treatments without a price or a session length, so you can't compare or plan before you call.",
  },
  {
    big: "Phone tag",
    d: "Booking usually means ringing during opening hours, often while you're at work, and hoping your physio is free.",
  },
];

const SOLUTIONS = [
  { big: "11", unit: "body areas", d: "on a tap-to-explore map, front and back" },
  { big: "8", unit: "services", d: "each with a set session length and an LKR price" },
  { big: "4", unit: "steps", d: "from choosing a service to a booking reference" },
];

const SERVICES = [
  { t: "Product concept", d: "A clinic site built around where it hurts" },
  { t: "UI/UX design", d: "Services, physios, pain map, packages and booking" },
  { t: "3D body & X-ray", d: "A 3ds Max character and X-ray renders, live in three.js" },
  { t: "Next.js build", d: "The whole site as React components, desktop and mobile" },
];

const STAGES = [
  { big: "Assess", when: "Visit 1", d: "A 60-minute assessment to find the cause, with movement tests, a diagnosis and a written plan with a target date." },
  { big: "Treat", when: "Weeks 1–6", d: "Hands-on sessions to ease pain and restore movement: manual therapy, dry needling, taping and guided exercise." },
  { big: "Strengthen", when: "Weeks 6+", d: "A home programme, return to sport and a re-test, so the problem doesn't come back." },
];

const JOURNEY = [
  {
    no: "01",
    tag: "Service",
    t: "Choose what you need",
    d: "Eight services, each with its length and price. Start from a service card, a package or the pain map and it's picked for you.",
    facts: ["30–60 min", "Price in LKR", "Picked from the map"],
  },
  {
    no: "02",
    tag: "Physio",
    t: "Choose who you see",
    d: "Four physios by name and speciality, or ‘First available’ for the earliest slot with anyone.",
    facts: ["By speciality", "First available"],
  },
  {
    no: "03",
    tag: "Date & time",
    t: "Pick a day and time",
    d: "The next 14 days in a strip. Sundays are closed, Saturdays are mornings only, and taken times are struck through.",
    facts: ["14-day strip", "45-min slots", "Closed Sundays"],
  },
  {
    no: "04",
    tag: "Details",
    t: "Confirm and you're in",
    d: "Name, mobile and email, checked as you type, plus where it hurts. A recap shows the service, physio, time and the price to pay at the clinic.",
    facts: ["077 number check", "Recap", "MV- reference"],
  },
];

const AREAS: {
  key: ShotKey;
  name: string;
  view: string;
  sessions: string;
  weeks: string;
  treatments: [string, string, string];
}[] = [
  { key: "painNeck", name: "Neck", view: "Front & back", sessions: "4–6", weeks: "3–6 wks", treatments: ["Joint mobilisation", "Postural retraining", "Dry needling"] },
  { key: "painBack", name: "Lower back", view: "Back view", sessions: "4–8", weeks: "4–8 wks", treatments: ["Manual therapy", "Core and hip strengthening", "McKenzie-based exercises"] },
  { key: "painShoulder", name: "Shoulder", view: "Front view", sessions: "6–12", weeks: "6–20 wks", treatments: ["Range-of-motion work", "Rotator cuff strengthening", "Soft tissue release"] },
  { key: "painKnee", name: "Knee", view: "Front view", sessions: "8–20", weeks: "8–24 wks", treatments: ["Quad and hip strengthening", "Balance and landing drills", "Return-to-run plan"] },
];

const PHONES: { id: ShotKey; t: string; d: string; label: string }[] = [
  { id: "mobile1", t: "Start at the top", d: "Headline, Book Now, next free slot", label: "Phone: hero with Book Now" },
  { id: "mobile2", t: "Browse services", d: "Length and price on every card", label: "Phone: services cards" },
  { id: "mobile3", t: "Tap where it hurts", d: "Causes, treatment, recovery time", label: "Phone: pain map with an area selected" },
  { id: "mobile4", t: "Pick a time", d: "Day strip and open slots", label: "Phone: booking day and time" },
  { id: "mobile5", t: "You're booked in", d: "Reference and what to wear", label: "Phone: booking confirmed" },
];

const SWATCHES = [
  { n: "Purple", v: "#928AFD" },
  { n: "Deep purple", v: "#6E62F2" },
  { n: "Black", v: "#020617" },
  { n: "Cyan", v: "#CAE5FF" },
  { n: "Slate", v: "#F1F5F9" },
  { n: "Yellow", v: "#FDF1B8" },
  { n: "Green", v: "#E3EED8" },
  { n: "Pain red", v: "#EF4444" },
];

const NEXT = [
  { t: "Live calendars", d: "Each physio's real diary behind the time slots, with SMS confirmations and reminders." },
  { t: "Real reviews and results", d: "Verified patient reviews and outcome figures in place of the samples." },
  { t: "Progress tracking", d: "Pain and range of motion measured at each visit and shown to the patient as a chart." },
  { t: "Payments and insurance", d: "An optional deposit online, and itemised receipts sent straight to the insurer." },
];

/* --- page ------------------------------------------------------------------ */

/** The walking figure used across Motiva. */
function Figure({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="13" cy="4.5" r="2" />
      <path d="M4 21l4-6 3 2 2-5 5 3" />
      <path d="M8 11l3-3 4 2" />
    </svg>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="mv-logo-mark">
      <defs>
        <linearGradient id="mv-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B8B2FF" />
          <stop offset=".45" stopColor="#928AFD" />
          <stop offset="1" stopColor="#7467F4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="12" fill="url(#mv-grad)" />
      <g transform="translate(9 9) scale(.92)" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="4.5" r="2" />
        <path d="M4 21l4-6 3 2 2-5 5 3" />
        <path d="M8 11l3-3 4 2" />
      </g>
    </svg>
  );
}

/** A text block: grey label on the left, content on the right. */
function Block({
  label,
  title,
  children,
}: {
  label: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mv-block">
      <p className="mv-label">{label}</p>
      <div className="mv-block-body">
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export default function ConceptPage() {
  return (
    <div className={`mv ${dmSans.variable}`}>
      <nav className="mv-bar" aria-label="Case study">
        <a className="mv-logo" href="#top">
          <Logo />
          Motiva
        </a>
        <a className="mv-bar-link" href={PROTOTYPE_URL} target="_blank" rel="noreferrer">
          Open prototype ↗
        </a>
      </nav>

      <main id="top">
        {/* title */}
        <header className="mv-head mv-col">
          <p className="mv-crumbs">
            <span>Cases</span>
            <span>Healthcare</span>
            <span>Web Platform</span>
          </p>
          <p className="mv-name">Motiva Physio</p>
          <h1>
            Motiva Physio — A Clinic Website Where You Tap Where It Hurts, See
            the Price &amp; Book in Four Steps
          </h1>
          <dl className="mv-meta">
            {META.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="mv-bleed">
          <div className="mv-stage">
            <div className="mv-browser">
              <div className="mv-browser-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>motivaphysio.lk</span>
              </div>
              <Piece id="hero" label="Motiva Physio: the first screen with Book Now" />
            </div>
          </div>
        </div>

        {/* about */}
        <section className="mv-col">
          <Block label="About the product">
            <p className="mv-intro">
              Motiva Physio is a website concept for a physiotherapy clinic in
              Colombo 07. It starts from the question patients actually have,
              “where does it hurt?”, and answers it with likely causes, how
              it&apos;s treated, how long recovery takes and what it costs.
            </p>
            <p>
              The site is built in Next.js as one working page. It covers services with
              set lengths and prices, six physios you can filter by speciality,
              a tap-to-explore pain map of eleven body areas, a three-stage
              recovery plan, six treatment packages, FAQs and a four-step
              booking that ends with a reference number. Photography shows the people, and the pain map is a realistic 3D body built from a 3ds Max character. All
              prices are in LKR and paid at the clinic.
            </p>
          </Block>
        </section>

        {/* problem */}
        <section className="mv-col">
          <Block label="Problem" title="Booking care when you're already in pain">
            <p>
              People with a sore back or a bad knee want help quickly. What
              slows them down is not knowing what they need, what it costs or
              when they can be seen.
            </p>
          </Block>
          <ul className="mv-stats">
            {PROBLEMS.map((p) => (
              <li key={p.big}>
                <b>{p.big}</b>
                <p>{p.d}</p>
              </li>
            ))}
          </ul>
          <p className="mv-conclude">
            Patients need to understand their pain, see the price and book a
            physio in one sitting, without picking up the phone.
          </p>
        </section>

        {/* solution */}
        <section className="mv-col">
          <Block label="Solution" title="Start from where it hurts">
            <p>
              Tap a point on the body and the page explains the common causes,
              how Motiva treats them, the typical number of sessions and the
              service to book. One button carries that choice straight into the
              booking, where every step shows the price so far.
            </p>
          </Block>
          <ul className="mv-stats is-solution">
            {SOLUTIONS.map((s) => (
              <li key={s.unit}>
                <b>
                  {s.big} <small>{s.unit}</small>
                </b>
                <p>{s.d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* services */}
        <section className="mv-col">
          <Block label="What we did">
            <ul className="mv-services">
              {SERVICES.map((s, i) => (
                <li key={s.t}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <b>{s.t}</b>
                  <p>{s.d}</p>
                </li>
              ))}
            </ul>
          </Block>
        </section>

        {/* gallery */}
        <section className="mv-wide">
          <div className="mv-bento">
            <figure className="mv-tile is-services">
              <div className="mv-panel is-violet">
                <Piece id="services" label="Services as light, colour-coded tiles" />
              </div>
              <figcaption>
                <b>Every service has a price</b>
                Six service cards show the session length and the price in LKR,
                each on its own colour-coded tile. Tap one to book it.
              </figcaption>
            </figure>
            <figure className="mv-tile is-physio">
              <div className="mv-panel is-sky">
                <Piece id="physioCard" label="Physio card with Book" />
              </div>
              <figcaption>
                <b>Book the person</b>
                Name, speciality and years of experience, with Book on hover.
              </figcaption>
            </figure>
            <figure className="mv-tile is-team">
              <div className="mv-panel is-mist">
                <Piece id="team" label="Physio filters and card rail" />
              </div>
              <figcaption>
                <b>Filter by speciality</b>
                Sports, spine and posture, post-surgery or neuro, in a
                swipeable rail of six physios.
              </figcaption>
            </figure>
            <figure className="mv-tile is-package">
              <div className="mv-panel is-lilac">
                <Piece id="package" label="Treatment package card" />
              </div>
              <figcaption>
                <b>Packages with a clear total</b>
                Six packages from LKR 5,500 to LKR 52,000, each listing
                what&apos;s included.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* pain map */}
        <section className="mv-col">
          <Block label="Pain map" title="Tap the area, see what it could be">
            <p>
              A realistic 3D body you can drag to turn, with a glowing point on each of eleven areas. Each
              area lists the common causes, how Motiva treats them, the typical
              number of sessions, the usual recovery time and the service to
              book. It says plainly that it&apos;s a guide, not a diagnosis.
            </p>
          </Block>
        </section>
        <section className="mv-bleed" id="painmap">
          <div className="mv-ps-band">
            <PainShowcase
              areas={AREAS.map(
                (a): PainArea => ({
                  src: findShot(SHOTS[a.key]),
                  file: SHOTS[a.key],
                  name: a.name,
                  view: a.view,
                  sessions: a.sessions,
                  weeks: a.weeks,
                  treatments: a.treatments,
                }),
              )}
            />
            <p className="mv-ps-more">
              Also on the map: <b>Elbow</b>, <b>Wrist &amp; hand</b>,{" "}
              <b>Upper back</b>, <b>Hip</b>, <b>Hamstring</b>,{" "}
              <b>Calf &amp; Achilles</b> and <b>Ankle &amp; foot</b>.
            </p>
          </div>
        </section>

        {/* details */}
        <section className="mv-col">
          <Block label="Details" title="A 3D body, not a diagram">
            <p>
              The pain map&apos;s body is a rigged character from 3ds Max, cut from 600 MB
              of source files to a 2.7 MB model and lit in the brand&apos;s purple and
              cyan. Front and Back turn it round, and each area card adds an X-ray
              render drawn in the browser with three.js, with a pulsing red glow on
              the joint.
            </p>
          </Block>
        </section>
        <section className="mv-wide">
          <div className="mv-details">
            <figure className="mv-detail">
              <Compare
                before={{ src: findShot(SHOTS.bodyFront), alt: "Body map, front view", file: SHOTS.bodyFront }}
                after={{ src: findShot(SHOTS.bodyBack), alt: "Body map, back view", file: SHOTS.bodyBack }}
                beforeLabel="Front"
                afterLabel="Back"
              />
              <figcaption>
                <b>Front and back</b>
                Drag the handle to compare. The back adds the upper back, lower
                back and hamstrings.
              </figcaption>
            </figure>
            <figure className="mv-detail">
              <div className="mv-scene is-strip">
                <Piece id="xray" label="X-ray render with the pain glow" />
                <span className="mv-chip">3D X-ray</span>
              </div>
              <figcaption>
                <b>Pain you can see</b>
                Rendered once in the browser, then the heat, ripples and glow
                are animated over the still image.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* care plan */}
        <section className="mv-col">
          <Block label="Care plan" title="Three stages, re-measured at each step">
            <p>
              Every plan moves through the same three stages, so patients know
              what comes next and can see themselves getting better.
            </p>
          </Block>
          <ul className="mv-stats is-solution">
            {STAGES.map((s) => (
              <li key={s.big}>
                <b>
                  {s.big} <small>{s.when}</small>
                </b>
                <p>{s.d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* journey */}
        <section className="mv-col">
          <Block label="The journey" title="Four steps from pain to an appointment">
            <p>
              A stepper sits at the top of the booking and a summary line at
              the foot, so the service, physio, time and price are always in
              view. Picking a service anywhere on the page opens the booking at
              the next step.
            </p>
          </Block>
        </section>
        <section className="mv-wide">
          <ol className="mv-route">
            {JOURNEY.map((s) => (
              <li key={s.no}>
                <div className="mv-route-node" aria-hidden="true">
                  <span>{s.no}</span>
                </div>
                <p className="mv-route-tag">{s.tag}</p>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                <ul>
                  {s.facts.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <div className="mv-bento mv-finish">
            <figure className="mv-tile is-slots">
              <div className="mv-panel is-mist">
                <Piece id="bookSlots" label="Booking step 3: day and time" />
              </div>
              <figcaption>
                <b>03 · Date &amp; time</b>
                Morning and afternoon slots every 45 minutes, with taken times
                crossed out and the summary line below.
              </figcaption>
            </figure>
            <figure className="mv-tile is-done">
              <div className="mv-panel is-night">
                <Piece id="bookDone" label="Booking confirmed with the MV- reference" />
              </div>
              <figcaption>
                <b>You&apos;re booked in</b>
                The time, the physio and an MV- reference, with a reminder to
                arrive ten minutes early in loose clothing.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* trust */}
        <section className="mv-col">
          <Block label="Prices and trust" title="No surprises at the front desk">
            <p>
              Every service shows its length and price before you book, from
              LKR 4,500 for 30 minutes of dry needling to LKR 9,500 for a home
              visit. You pay at the clinic, receipts are itemised for insurance
              claims, and moving an appointment is free up to 12 hours before.
              Where a symptom needs urgent care rather than physio, the pain
              map says so, for example numbness around the groin with lower
              back pain.
            </p>
          </Block>
        </section>
        <section className="mv-wide">
          <div className="mv-bento">
            <figure className="mv-tile is-recap">
              <div className="mv-panel is-violet">
                <Piece id="bookRecap" label="Booking step 4: details and recap" />
              </div>
              <figcaption>
                <b>Checked as you type</b>
                A Sri Lankan mobile number, a real email and a recap with the
                price to pay at the clinic.
              </figcaption>
            </figure>
            <figure className="mv-tile is-faq">
              <div className="mv-panel is-sky">
                <Piece id="faq" label="Frequently asked questions" />
              </div>
              <figcaption>
                <b>Answers before the first visit</b>
                Referrals, what to wear, how many sessions, insurance and
                cancelling.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* design */}
        <section className="mv-col">
          <Block label="Design system" title="Calm colours, clear actions">
            <p>
              A white page with soft lilac-to-cyan washes. Purple marks every
              action, and near-black anchors buttons and the footer. Cyan,
              slate, yellow and green fill the quiet panels, and red is kept for
              pain and errors. Light, colour-coded tiles carry the services and key facts, and real photography shows the people. DM Sans throughout, with large rounded cards and
              pill buttons.
            </p>
            <ul className="mv-swatches">
              {SWATCHES.map((s) => (
                <li key={s.n}>
                  <span style={{ background: s.v }} />
                  <b>{s.n}</b>
                  <code>{s.v}</code>
                </li>
              ))}
            </ul>
          </Block>
        </section>

        {/* mobile */}
        <section className="mv-col">
          <Block label="On your phone" title="Find it, understand it, book it">
            <p>
              On a phone the nav folds into a menu, the cards stack, the physio
              rail swipes and the pain map sits above its area card. The day
              strip scrolls sideways, and the booking fits one hand from the
              first tap to the reference.
            </p>
          </Block>
        </section>
        <section className="mv-bleed" id="phones">
          <div className="mv-phones">
            <ol className="mv-phones-row">
              {PHONES.map((ph, i) => (
                <li key={ph.id} className="mv-phone-slot" style={{ "--i": i } as React.CSSProperties}>
                  <div className="mv-phone">
                    <span className="mv-phone-island" aria-hidden="true" />
                    <div className="mv-phone-screen">
                      <div className="mv-phone-status" aria-hidden="true">
                        <span>9:41</span>
                        <i />
                      </div>
                      <div className="mv-phone-app">
                        <Piece id={ph.id} label={ph.label} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <ol className="mv-phones-caps">
              {PHONES.map((ph, i) => (
                <li key={ph.id}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <b>{ph.t}</b>
                  {ph.d}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* next */}
        <section className="mv-col">
          <Block label="What comes next" title="From prototype to product">
            <ul className="mv-services">
              {NEXT.map((n, i) => (
                <li key={n.t}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <b>{n.t}</b>
                  <p>{n.d}</p>
                </li>
              ))}
            </ul>
            <p className="mv-note">
              The prototype is a demo. Bookings aren&apos;t sent anywhere, and the
              reviews and headline figures are samples.
            </p>
          </Block>
        </section>

        {/* thanks */}
        <section className="mv-thanks">
          <p className="mv-thanks-kicker">
            <span /> End of case study
          </p>
          <h2>
            Thank you for <em>watching!</em>
          </h2>
          <p className="mv-thanks-sub">Love it? Appreciate it!</p>
          <div className="mv-thanks-actions">
            <a className="is-primary" href={PROTOTYPE_URL} target="_blank" rel="noreferrer">
              Try the prototype
              <span aria-hidden="true">↗</span>
            </a>
            <a className="is-ghost" href="#top">
              Back to top
              <span aria-hidden="true">↑</span>
            </a>
          </div>
          <div className="mv-thanks-pass" aria-hidden="true">
            <div>
              <small>From</small>
              <b>PAIN</b>
              <small>Visit 1 · Assess</small>
            </div>
            <div className="mv-thanks-route">
              <i />
              <Figure />
              <i />
            </div>
            <div className="r">
              <small>To</small>
              <b>MOVING</b>
              <small>Weeks 6+ · Strengthen</small>
            </div>
            <div className="mv-thanks-stub">
              <small>Booking reference</small>
              <b>MV-THANKS</b>
            </div>
          </div>
        </section>
      </main>

      <footer className="mv-foot">
        <a className="mv-logo" href="#top">
          <Logo />
          Motiva
        </a>
        <p>Concept case study · 2026 · Prices in LKR, paid at the clinic</p>
      </footer>
    </div>
  );
}

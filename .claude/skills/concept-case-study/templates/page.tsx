import type { Metadata } from "next";
import { Bricolage_Grotesque, Poppins } from "next/font/google";
import fs from "node:fs";
import path from "node:path";
import { Compare } from "./Compare";
import { VenueShowcase, type Venue } from "./VenueShowcase";
import "./concept.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/* headings */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkyPass Live — case study",
  description:
    "SkyPass Live: book concerts, cricket and cinema in Sri Lanka the way you board a flight, with a 3D venue, a view from your seat and a ticket you tear at the gate.",
};

/** The prototype, served from public/skypass-live_8.html. */
const PROTOTYPE_URL = "/skypass-live_8.html";

/* ==========================================================================
   Screenshots

   HOW TO ADD ONE
   1. Take the screenshot described next to its name below.
   2. Rename the file to that name, e.g. "01-hero.png".
   3. Put it in  votex/public/skypass/
   That's it: the page finds it on its own. .png, .jpg, .jpeg and .webp all
   work (e.g. "01-hero.jpg" is fine too). Until a file is there, the page
   shows an empty frame with the file name it's waiting for.

   "Frame" is the shape the image is shown in. Take the screenshot at about
   that shape; anything extra is cropped from the bottom and sides. Capture
   at 1440 px wide or more (desktop) so it stays sharp.
   ========================================================================== */
const SHOTS = {
  // --- Top of the page ------------------------------------------------------
  // Frame 2:1, full width. Desktop, whole app: booking panel on the left and
  // the 3D venue on the right, with a section hovered so its fare card shows.
  hero: "01-hero",

  // --- Gallery (five images under "What we did") ----------------------------
  // These are shown whole, never cropped, on tinted panels, so any size works.
  // The 3D venue from above (about 3:2). It fills its panel edge to edge.
  gallery4: "05-gallery-card",
  // The boarding-pass fare card (about square). Floats over the venue.
  gallery5: "06-gallery-ticket",
  // Step 1 filters and section list (tall, about 2:3).
  gallery2: "03-gallery-sections",
  // The event picker list (about square).
  gallery1: "02-gallery-events",
  // Seat map with seats selected and the total (about 4:3).
  gallery3: "04-gallery-seatmap",

  // --- The journey (shown under the four steps) ---------------------------
  // Shown whole on tinted panels, like the gallery.
  // Payment step: contact details, methods, the 3D card and "Pay now".
  journeyPay: "07",
  // "Payment successful": the printed ticket with the stub and QR code.
  journeyTicket: "08",

  // --- The venues (four shown) --------------------------------------------
  // The 3D venue only. Shown in two rows: ground + cinema, arena + cricket.
  venueGround: "12-venue-ground", // about 3:2
  venueArena: "13-venue-arena", // about 3:2
  venueCinema: "14-venue-cinema", // about 10:9, nearly square
  venueCricket: "15-venue-cricket", // about 3:2

  // --- Details (two 3:2 images side by side) --------------------------------
  // 18 and 19 are the same view, before and after "Colour by price". They
  // are shown as a drag-to-compare slider, so keep the camera identical.
  fareCard: "18-detail-fare-card", // venue in class colours
  heatMap: "19-detail-price-colours", // same view, coloured by price
  // The seat camera: the view from a chosen seat, with the pin.
  seatView: "20-detail-seat-view",

  // --- Ticket ---------------------------------------------------------------
  // Shown whole, like the gallery.
  // The saved ticket opened from My tickets (tall, about 2:3).
  ticketFull: "22-my-tickets",
  // The "My tickets" button in the header, with its count (a thin strip).
  walletButton: "23-my-tickets",
  // The "My tickets" pop-up listing a saved booking (about 2:1).
  walletList: "24-my-tickets",

  // --- Design ---------------------------------------------------------------
  // Phone screens, about 1:2, shown in phone mockups fanned out in 3D.
  // Screenshot the app in the browser's phone view (F12, then the phone icon).
  mobile1: "25-mobile", // venue on top, filters below
  mobile2: "26-mobile", // fare card docked with Continue
  mobile3: "27-mobile", // seat view and Continue to pay (shown in the middle)
  mobile4: "28-mobile", // Approve on your phone (wallet)
  mobile5: "29-mobile", // the ticket after payment
  // The full app in dark mode (about 1.9:1), shown in a browser frame.
  dark: "30-dark-mode",
} satisfies Record<string, string>;

type ShotKey = keyof typeof SHOTS;

const SHOT_DIR = path.join(process.cwd(), "public", "skypass");
const SHOT_EXTS = [".png", ".jpg", ".jpeg", ".webp"];

/** The public URL of a screenshot if its file exists, otherwise null. */
function findShot(name: string) {
  for (const ext of SHOT_EXTS) {
    if (fs.existsSync(path.join(SHOT_DIR, name + ext))) {
      return `/skypass/${name}${ext}`;
    }
  }
  return null;
}

/** A UI crop shown whole (never cropped), for the gallery panels. */
function Piece({ id, label }: { id: ShotKey; label: string }) {
  const src = findShot(SHOTS[id]);
  if (!src) {
    return (
      <div className="sp-piece-empty" role="img" aria-label={`Screenshot to come: ${label}`}>
        <b>{label}</b>
        <code>public/skypass/{SHOTS[id]}.png</code>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="sp-piece" src={src} alt={label} loading="lazy" />;
}

/* --- content ------------------------------------------------------------- */

const META = [
  ["Year", "2026"],
  ["Industry", "Entertainment & ticketing"],
  ["Platform", "Web · desktop & mobile"],
  ["Market", "Sri Lanka · LKR"],
];

const PROBLEMS = [
  {
    big: "Flat plans",
    d: "Most ticket sites show coloured blocks. You can't tell how far you'll be from the stage or what the view is like until you're in your seat.",
  },
  {
    big: "Late fees",
    d: "Service fees and taxes often appear only at checkout, so the price you planned around isn't the price you pay.",
  },
  {
    big: "Lost seats",
    d: "Without a visible hold, seats can go while you type your card details, and a 3-D Secure step feels like leaving the site.",
  },
];

const SOLUTIONS = [
  { big: "6", unit: "venue types", d: "modelled in 3D, from open-air grounds to a cinema hall" },
  { big: "10:00", unit: "seat hold", d: "counting down beside the Pay button while you check out" },
  { big: "4", unit: "steps", d: "from picking a section to a ticket in your pocket" },
];

const SERVICES = [
  { t: "Product concept", d: "Airline-style booking model for live events" },
  { t: "UI/UX design", d: "Booking panel, seat map, checkout and ticket" },
  { t: "3D venue design", d: "Six interactive venues built in the browser" },
  { t: "Front-end prototype", d: "A working web app, desktop and mobile" },
];

const JOURNEY = [
  {
    no: "01",
    tag: "Section",
    t: "Find a section",
    d: "Pick a date, set how many tickets you need, a price cap and a class. Sections sit beside the 3D venue, sorted by lowest price, closest to stage or most seats.",
    facts: ["Date strip", "Price cap", "Fare card on hover"],
  },
  {
    no: "02",
    tag: "Seats",
    t: "Choose your seats",
    d: "The camera flies into the section and shows the view from your seat. ‘Best available’ finds seats side by side near the centre.",
    facts: ["Seat camera", "Best available", "5% fee shown"],
  },
  {
    no: "03",
    tag: "Payment",
    t: "Pay with confidence",
    d: "Card, mobile wallet or online banking. A 3D card fills in as you type and the booking summary stays in view.",
    facts: ["Seats held 10:00", "3-D Secure", "Wallet · Bank"],
  },
  {
    no: "04",
    tag: "Ticket",
    t: "Get your ticket",
    d: "A boarding-pass ticket prints out with your gate, seats, a SKY- reference and a QR code on the stub, saved to My tickets.",
    facts: ["QR stub", "Tear at the gate", "My tickets"],
  },
];

const VENUES: { key: ShotKey; type: string; where: string; tiers: [string, string, string] }[] = [
  { key: "venueGround", type: "Open-air ground", where: "Galle Face Green · Galle Fort Esplanade", tiers: ["VIP Floor", "Front Stand", "Rear Stand"] },
  { key: "venueArena", type: "Indoor arena", where: "Sugathadasa Indoor Stadium", tiers: ["Arena Floor", "Lower Tier", "Upper Tier"] },
  { key: "venueCinema", type: "Cinema hall", where: "Scope Cinemas · Liberty by Scope", tiers: ["Recliners", "Premium Rows", "Standard Rows"] },
  { key: "venueCricket", type: "Cricket ground", where: "R. Premadasa · Galle International", tiers: ["Pavilion", "Lower Stand", "Upper Stand"] },
];

const PHONES: { id: ShotKey; t: string; d: string; label: string }[] = [
  { id: "mobile1", t: "Pick a section", d: "Venue on top, filters below", label: "Phone: venue and filters" },
  { id: "mobile2", t: "Tap for the fare", d: "Fare card docks with Continue", label: "Phone: fare card with Continue" },
  { id: "mobile3", t: "See your view", d: "Seat camera and the total", label: "Phone: view from the seat" },
  { id: "mobile4", t: "Approve and pay", d: "Wallet request with a timer", label: "Phone: approve the wallet payment" },
  { id: "mobile5", t: "Keep the ticket", d: "Printed, saved, ready at the gate", label: "Phone: ticket after payment" },
];

const SWATCHES = [
  { n: "Brand", v: "#D9365A" },
  { n: "Ink", v: "#111318" },
  { n: "Night", v: "#16171B" },
  { n: "Mist", v: "#EEF0F3" },
  { n: "First", v: "#B7791F" },
  { n: "Business", v: "#4F63D2" },
  { n: "Economy", v: "#0C8F6A" },
];

const NEXT = [
  { t: "Live inventory", d: "Seat holds on the server so two people can never pay for the same seat." },
  { t: "Real payments", d: "A certified local gateway for cards, wallets and banking, with SMS receipts." },
  { t: "Organiser studio", d: "Venues upload a floor plan, set tiers and prices, and get a 3D model." },
  { t: "Gate scanning", d: "Scan the QR code, tear the stub and stamp the ticket ‘Admitted’ live." },
];

/* --- page ------------------------------------------------------------------ */

function Logo() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="sp-logo-mark">
      <rect x="2" y="8" width="36" height="24" rx="7" fill="#D9365A" />
      <path d="M27 8v24" stroke="#fff" strokeWidth="1.5" strokeDasharray="2 2.5" />
      <path d="M9.5 22.5l10-6 1.4 1-4.3 3.6 2.6 2.9-1.2.7-3.4-2-2.8 1.7z" fill="#fff" />
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
    <div className="sp-block">
      <p className="sp-label">{label}</p>
      <div className="sp-block-body">
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export default function ConceptPage() {
  return (
    <div className={`sp ${poppins.variable} ${bricolage.variable}`}>
      <nav className="sp-bar" aria-label="Case study">
        <a className="sp-logo" href="#top">
          <Logo />
          SkyPass
        </a>
        <a className="sp-bar-link" href={PROTOTYPE_URL} target="_blank" rel="noreferrer">
          Open prototype ↗
        </a>
      </nav>

      <main id="top">
        {/* title */}
        <header className="sp-head sp-col">
          <p className="sp-crumbs">
            <span>Cases</span>
            <span>Entertainment</span>
            <span>Web Platform</span>
          </p>
          <p className="sp-name">SkyPass</p>
          <h1>
            SkyPass Live — Book Live Events Like a Flight, with 3D Seat Previews
            &amp; Tear-Off Tickets
          </h1>
          <dl className="sp-meta">
            {META.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="sp-bleed">
          <div className="sp-stage">
            <div className="sp-browser">
              <div className="sp-browser-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>skypass.live</span>
              </div>
              <Piece id="hero" label="SkyPass Live: booking panel beside the 3D venue" />
            </div>
          </div>
        </div>

        {/* about */}
        <section className="sp-col">
          <Block label="About the product">
            <p className="sp-intro">
              SkyPass Live is a ticketing concept for concerts, cricket and
              cinema in Sri Lanka. It borrows the language people already trust
              from air travel (routes, gates, classes, a booking reference) and
              adds a 3D model of every venue, so you can see the view from your
              seat before you pay.
            </p>
            <p>
              The prototype covers the full journey for nine sample events at
              real venues across Colombo, Kandy and Galle. It includes a live
              3D venue, a seat map with a seat camera, a checkout with card,
              wallet and bank payment, and a printed ticket with a stub you
              tear at the gate. All prices are in LKR with taxes included.
            </p>
          </Block>
        </section>

        {/* problem */}
        <section className="sp-col">
          <Block label="Problem" title="Buying a seat you've never seen">
            <p>
              People don&apos;t mind paying for a good night out. What puts them
              off is not knowing what they&apos;re buying, and a checkout that
              feels risky.
            </p>
          </Block>
          <ul className="sp-stats">
            {PROBLEMS.map((p) => (
              <li key={p.big}>
                <b>{p.big}</b>
                <p>{p.d}</p>
              </li>
            ))}
          </ul>
          <p className="sp-conclude">
            Fans need to know what they&apos;re paying for, where they&apos;ll
            sit and that their seats are safe until the payment goes through.
          </p>
        </section>

        {/* solution */}
        <section className="sp-col">
          <Block label="Solution" title="A boarding pass for live events">
            <p>
              Every section in the 3D venue has a fare card that looks like a
              boarding pass: class, gate, distance to the stage, the view and
              seats left. One price is shown from the first card, and the seats
              are held while you pay.
            </p>
          </Block>
          <ul className="sp-stats is-solution">
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
        <section className="sp-col">
          <Block label="What we did">
            <ul className="sp-services">
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
        <section className="sp-wide">
          <div className="sp-bento">
            <figure className="sp-tile is-venue">
              <div className="sp-panel is-scene">
                <Piece id="gallery4" label="3D venue, open-air ground" />
                <div className="sp-float">
                  <Piece id="gallery5" label="Boarding-pass fare card" />
                </div>
              </div>
              <figcaption>
                <b>Hover a section, get a boarding pass</b>
                The fare card unfolds over the live venue with class, gate,
                distance, view and seats left.
              </figcaption>
            </figure>
            <figure className="sp-tile is-sections">
              <div className="sp-panel is-rose">
                <Piece id="gallery2" label="Filters and best sections" />
              </div>
              <figcaption>
                <b>Filter, then sort</b>
                Tickets, a price cap and class, sorted by price, distance or
                seats.
              </figcaption>
            </figure>
            <figure className="sp-tile is-events">
              <div className="sp-panel is-mist">
                <Piece id="gallery1" label="Event picker" />
              </div>
              <figcaption>
                <b>Every show, one search</b>
                Poster tiles, genre, status and a starting price in LKR.
              </figcaption>
            </figure>
            <figure className="sp-tile is-seats">
              <div className="sp-panel is-lilac">
                <Piece id="gallery3" label="Seat map and total" />
              </div>
              <figcaption>
                <b>Seats side by side, fee included</b>
                ‘Best available’ picks a row together and the total already
                shows the 5% service fee.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* journey */}
        <section className="sp-col">
          <Block label="The journey" title="Four steps from browsing to your ticket">
            <p>
              A progress bar sits at the top of every step, and the 3D venue
              stays on screen the whole way, so you always know where
              you&apos;ll be sitting.
            </p>
          </Block>
        </section>
        <section className="sp-wide">
          <ol className="sp-route">
            {JOURNEY.map((s) => (
              <li key={s.no}>
                <div className="sp-route-node" aria-hidden="true">
                  <span>{s.no}</span>
                </div>
                <p className="sp-route-tag">{s.tag}</p>
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
          <div className="sp-bento sp-finish">
            <figure className="sp-tile is-pay">
              <div className="sp-panel is-mist">
                <Piece id="journeyPay" label="Payment step with the 3D card" />
              </div>
              <figcaption>
                <b>03 · Pay</b>
                The card fills in as you type, the summary shows every seat and
                the 5% fee, and ‘seats held 7:04’ counts down beside Pay now.
              </figcaption>
            </figure>
            <figure className="sp-tile is-pass">
              <div className="sp-panel is-night">
                <Piece id="journeyTicket" label="Printed ticket after payment" />
              </div>
              <figcaption>
                <b>04 · Your ticket</b>
                Stage to Section 204, gate D, seats R1-7 and R1-8, with a QR
                stub to tear at the gate.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* venues */}
        <section className="sp-col">
          <Block label="3D venues" title="Six venue types, each built to feel like the real place">
            <p>
              Every venue type has its own shape, stage, lighting and names for
              its tiers. Drag to turn it, scroll to zoom and click a section to
              fly the camera there. The stage, screen or pitch is always the
              focus.
            </p>
          </Block>
        </section>
        <section className="sp-bleed" id="venues">
          <div className="sp-venues-stage">
            <VenueShowcase
              venues={VENUES.map(
                (v): Venue => ({
                  src: findShot(SHOTS[v.key]),
                  file: SHOTS[v.key],
                  type: v.type,
                  where: v.where,
                  tiers: v.tiers,
                }),
              )}
            />
          <p className="sp-venues-more">
            Also modelled: <b>Stadium</b> (Pallekele) and <b>Amphitheatre</b>{" "}
            (Nelum Pokuna Open-Air Theatre).
          </p>
          </div>
        </section>

        {/* details */}
        <section className="sp-col">
          <Block label="Details" title="Small moments that build confidence">
            <p>
              One switch recolours the whole venue by price, from blue for the
              cheapest sections to red for the most expensive, so you can see
              at a glance where the value is. In the seat step the camera moves
              to your row, and a pin shows exactly where you&apos;ll sit.
            </p>
          </Block>
        </section>
        <section className="sp-wide">
          <div className="sp-details">
            <figure className="sp-detail">
              <Compare
                before={{ src: findShot(SHOTS.fareCard), alt: "Venue in class colours" }}
                after={{ src: findShot(SHOTS.heatMap), alt: "Venue coloured by price" }}
                beforeLabel="Class colours"
                afterLabel="Colour by price"
              />
              <figcaption>
                <b>Colour by price</b>
                Drag the handle to compare. Blue is LKR 5,100, red is LKR 35,000.
              </figcaption>
            </figure>
            <figure className="sp-detail">
              <div className="sp-venue-frame">
                <Piece id="seatView" label="View from Section 203, Row 12, Seat 13" />
                <span className="sp-venue-chip">Seat camera</span>
              </div>
              <figcaption>
                <b>See the view from your seat</b>
                Section 203 · Row 12, Seat 13 · 42 m to the main stage, straight
                on and raised.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* payment */}
        <section className="sp-col">
          <Block label="Payment" title="A checkout that explains itself">
            <p>
              The summary lists every seat, the ticket price and the 5% service
              fee before you pay. ‘Seats held 9:42’ counts down beside the Pay
              button and turns red in the last minute. A card is confirmed with
              a 6-digit 3-D Secure code, a wallet with a request on your phone.
              If verification fails, the message says ‘No money was taken’.
            </p>
          </Block>
        </section>
        {/* ticket */}
        <section className="sp-col">
          <Block label="The ticket" title="A ticket worth keeping">
            <p>
              After payment the ticket prints out line by line. Drag the stub
              away and it tears off, the card shakes and an ‘ADMITTED’ stamp
              lands on it. Every booking is saved in My tickets, ready to show
              at the gate.
            </p>
          </Block>
        </section>
        <section className="sp-wide">
          <div className="sp-bento">
            <figure className="sp-tile is-ticket">
              <div className="sp-panel is-night">
                <div className="sp-print">
                  <Piece id="ticketFull" label="Saved ticket for Section 204" />
                </div>
              </div>
              <figcaption>
                <b>The ticket</b>
                Passenger, route from stage to section, gate, seats and a SKY-
                reference, with a barcode and QR code on the stub.
              </figcaption>
            </figure>
            <figure className="sp-tile is-wallet">
              <div className="sp-panel is-mist sp-wallet">
                <div className="sp-wallet-btn">
                  <Piece id="walletButton" label="My tickets button with a count" />
                </div>
                <span className="sp-wallet-arrow" aria-hidden="true" />
                <div className="sp-wallet-list">
                  <Piece id="walletList" label="My tickets list" />
                </div>
              </div>
              <figcaption>
                <b>Always one tap away</b>
                The My tickets button in the header counts your bookings. Open
                it to see each show, seats and reference, then tap View.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* design */}
        <section className="sp-col">
          <Block label="Design system" title="Evening colours, airline order">
            <p>
              One warm pink for actions, near-black cards that echo a night sky
              and one colour for each class. Poppins throughout, with large
              rounded shapes. Light and dark themes are both designed, and the
              3D sky, fog and stage lights change with them.
            </p>
            <ul className="sp-swatches">
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
        <section className="sp-bleed">
          <div className="sp-stage is-darkapp">
            <div className="sp-browser">
              <div className="sp-browser-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>skypass.live</span>
              </div>
              <Piece id="dark" label="SkyPass Live in dark mode, seat step" />
            </div>
          </div>
          <p className="sp-stage-cap">
            <b>Dark mode</b> The seat step at night: the panel, seat map and the
            whole 3D scene switch together.
          </p>
        </section>

        {/* mobile */}
        <section className="sp-col">
          <Block label="On your phone" title="The whole booking, one thumb">
            <p>
              On a phone the venue sits on top and the booking panel below. The
              fare card docks at the bottom with a Continue button, and every
              step, from the seat view to wallet approval, fits one hand.
            </p>
          </Block>
        </section>
        <section className="sp-bleed" id="phones">
          <div className="sp-phones">
            <ol className="sp-phones-row">
              {PHONES.map((ph, i) => (
                <li key={ph.id} className="sp-phone-slot" style={{ "--i": i } as React.CSSProperties}>
                  <div className="sp-phone">
                    <span className="sp-phone-island" aria-hidden="true" />
                    <div className="sp-phone-screen">
                      <div className="sp-phone-status" aria-hidden="true">
                        <span>9:41</span>
                        <i />
                      </div>
                      <div className="sp-phone-app">
                        <Piece id={ph.id} label={ph.label} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <ol className="sp-phones-caps">
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
        <section className="sp-col">
          <Block label="What comes next" title="From prototype to product">
            <ul className="sp-services">
              {NEXT.map((n, i) => (
                <li key={n.t}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <b>{n.t}</b>
                  <p>{n.d}</p>
                </li>
              ))}
            </ul>
            <p className="sp-note">
              The prototype is a demo. Its checkout doesn&apos;t charge anything
              or send data anywhere.
            </p>
          </Block>
        </section>

        {/* thanks */}
        <section className="sp-thanks">
          <p className="sp-thanks-kicker">
            <span /> End of case study
          </p>
          <h2>
            Thank you for <em>watching!</em>
          </h2>
          <p className="sp-thanks-sub">Love it? Appreciate it!</p>
          <div className="sp-thanks-actions">
            <a className="is-primary" href={PROTOTYPE_URL} target="_blank" rel="noreferrer">
              Try the prototype
              <span aria-hidden="true">↗</span>
            </a>
            <a className="is-ghost" href="#top">
              Back to top
              <span aria-hidden="true">↑</span>
            </a>
          </div>
          <div className="sp-thanks-pass" aria-hidden="true">
            <div>
              <small>From</small>
              <b>STG</b>
              <small>Main stage</small>
            </div>
            <div className="sp-thanks-route">
              <i />
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
              </svg>
              <i />
            </div>
            <div className="r">
              <small>To</small>
              <b>YOU</b>
              <small>Best seat in the house</small>
            </div>
            <div className="sp-thanks-stub">
              <small>Booking reference</small>
              <b>SKY-THANKS</b>
            </div>
          </div>
        </section>
      </main>

      <footer className="sp-foot">
        <a className="sp-logo" href="#top">
          <Logo />
          SkyPass
        </a>
        <p>Concept case study · 2026 · Prices in LKR, incl. taxes</p>
      </footer>
    </div>
  );
}

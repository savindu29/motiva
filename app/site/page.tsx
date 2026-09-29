import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import fs from "node:fs";
import path from "node:path";
import { Booking } from "./Booking";
import { Experts, Packages, Services } from "./Catalogue";
import { FAQ, STORIES } from "./data";
import { Effects } from "./Effects";
import { Footer } from "./Footer";
import { PainMap } from "./PainMap";
import { Photo } from "./Photo";
import { SiteProvider } from "./SiteProvider";
import { Hero, Nav } from "./Top";
import "./site.css";

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Motiva Physio — physiotherapy in Colombo",
  description:
    "Hands-on physiotherapy in Colombo for sports injuries, back and neck pain, and rehab after surgery. See prices, find where it hurts and book online.",
};

/** The hero photo, if one has been added as public/site/hero.(jpg|jpeg|png|webp). */
function heroImage() {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    if (fs.existsSync(path.join(process.cwd(), "public", "site", "hero" + ext))) return `/site/hero${ext}`;
  }
  return null;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="eyebrow">
      {children}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M7 7l10 10M17 9v8H9" />
      </svg>
    </span>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const d = (s: string) => ({ "--d": s }) as React.CSSProperties;

const STAGES = [
  { cls: "s1", t: "Assess", wk: "Visit 1", p: "A 60-minute assessment to find the cause and set a target date.", pills: ["Movement tests", "Diagnosis", "Written plan"] },
  { cls: "s2", t: "Treat", wk: "Weeks 1–6", p: "Hands-on sessions to ease pain and restore movement.", pills: ["Manual therapy", "Dry needling", "Taping", "Guided exercise"] },
  { cls: "s3", t: "Strengthen", wk: "Weeks 6+", p: "Build strength and confidence so the problem doesn't come back.", pills: ["Home programme", "Return to sport", "Re-test", "Discharge plan"] },
];

function Quote({ s }: { s: (typeof STORIES)[number] }) {
  return (
    <div className="q spot-b">
      <div className="stars" aria-label="5 stars">
        ★★★★★
      </div>
      <p>“{s.q}”</p>
      <div className="who">
        <i style={{ background: s.c }}>
          {s.n
            .split(" ")
            .map((x) => x[0])
            .join("")}
        </i>
        <div>
          <b>{s.n}</b>
          <span>{s.d}</span>
        </div>
      </div>
    </div>
  );
}

export default function MotivaSite() {
  const half = Math.ceil(STORIES.length / 2);
  const rows = [STORIES.slice(0, half), STORIES.slice(half)];

  return (
    <div className={`mp ${dmSans.variable}`} style={{ "--f": "var(--font-dm), 'Segoe UI', system-ui, sans-serif" } as React.CSSProperties}>
      <SiteProvider>
        <Effects />
        <Nav />

        <main id="home">
          <Hero image={heroImage()} />

          {/* services */}
          <section id="services">
            <div className="wrap">
              <div className="head rv">
                <Eyebrow>Our services</Eyebrow>
                <h2>
                  Specialised treatment for
                  <br />
                  every stage of recovery
                </h2>
                <p>Each service has a set session length and a clear price. Not sure which you need? Start with an assessment.</p>
              </div>
              <Services />
            </div>
          </section>

          {/* physios */}
          <section id="experts" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="head exp-head rv">
                <h2>
                  Dedicated{" "}
                  <span className="avs">
                    {["nad", "kav", "ama"].map((id) => (
                      <span key={id} style={{ background: `#e6e3ff url(/site/team/${id}.jpg) center 12% / 170% no-repeat` }} />
                    ))}
                  </span>{" "}
                  physios
                  <br />
                  driving your recovery
                </h2>
                <p>You see the same physiotherapist at every visit, so nothing gets lost between sessions.</p>
              </div>
              <Experts />
            </div>
          </section>

          {/* results */}
          <section className="bento-sec">
            <div className="wrap">
              <div className="head rv">
                <h2>
                  Physiotherapy with care,
                  <br />
                  measured by results
                </h2>
                <p>We treat the cause of your pain, not just the pain, and track your progress at every visit.</p>
              </div>
              <div className="bento">
                <div className="lite-tile c1 rv spot-b">
                  <span className="lt-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="3.5" />
                      <path d="M5 20a7 7 0 0 1 14 0" />
                    </svg>
                  </span>
                  <h3>Same physio, every visit</h3>
                  <p>You see the same physiotherapist each time, so nothing gets lost between sessions.</p>
                </div>
                <div className="stat c rv tilt spot-b" style={d(".08s")}>
                  <b data-count="12400" data-suf="+">12,400+</b>
                  <h3>Sessions completed</h3>
                  <p>One-to-one sessions with a qualified physiotherapist, measured every visit for pain, range and strength.</p>
                  <a className="btn" href="#experts">
                    Meet our team <ArrowRight />
                  </a>
                </div>
                <div className="lite-tile c2 hide-m rv spot-b">
                  <span className="lt-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3" />
                    </svg>
                  </span>
                  <h3>Itemised receipts</h3>
                  <p>Every receipt lists the diagnosis and session codes your insurer asks for.</p>
                </div>
                <div className="stat l rv tilt spot-b">
                  <b data-count="94" data-suf="%">94%</b>
                  <h3>Back to daily activity</h3>
                  <p>Patients who reach their discharge goal return to work, sport or daily routines without the pain they came in with.</p>
                  <a className="btn" href="#painmap">
                    Where does it hurt? <ArrowRight />
                  </a>
                </div>
                <div className="lite-tile c3 rv spot-b">
                  <span className="lt-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="16" rx="3" />
                      <path d="M3 10h18M8 3v4M16 3v4M8 15l2.5 2.5L16 13" />
                    </svg>
                  </span>
                  <h3>Book in four steps</h3>
                  <p>Pick a service, a physio and a time online. We confirm by SMS within an hour.</p>
                </div>
                <div className="stat y rv tilt spot-b" style={d(".16s")}>
                  <b data-count="15" data-suf="+">15+</b>
                  <h3>Years of rehab experience</h3>
                  <p>Our senior physios have treated athletes, office workers and stroke patients across Colombo since 2011.</p>
                  <a className="btn" href="#stories">
                    Patient stories <ArrowRight />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* pain map */}
          <section id="painmap">
            <div className="wrap">
              <div className="head rv">
                <Eyebrow>Where does it hurt?</Eyebrow>
                <h2>
                  Tap the area to see
                  <br />
                  what it could be
                </h2>
                <p>Common causes, how we treat them and typical recovery times. A guide, not a diagnosis.</p>
              </div>
              <PainMap />
            </div>
          </section>

          {/* recovery stages */}
          <section id="journey" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="head left rv">
                <Eyebrow>How treatment works</Eyebrow>
                <h2>Your recovery journey</h2>
                <p>Every plan moves through three stages. We re-measure at each step, so you can see yourself getting better.</p>
              </div>
              <div className="stairs">
                {STAGES.map((s, i) => (
                  <div key={s.t} className={`stair ${s.cls} rv tilt`} style={d(`${i * 0.12}s`)}>
                    <div className="top-row">
                      <h3>{s.t}</h3>
                      <span className="wk">{s.wk}</span>
                    </div>
                    <div style={{ display: "grid", gap: 16 }}>
                      <p>{s.p}</p>
                      <div className="pills">
                        {s.pills.map((p) => (
                          <span key={p}>{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* packages */}
          <section id="packages" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="head rv">
                <h2>Choose your treatment package</h2>
                <p>Pick a package that fits your goal. Receipts are itemised for insurance claims.</p>
              </div>
              <Packages />
            </div>
          </section>

          {/* booking */}
          <section id="book" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="head rv">
                <h2>Book your appointment today</h2>
                <p>Four quick steps. We&apos;ll confirm by SMS within an hour during opening times.</p>
              </div>
              <Booking />
            </div>
          </section>

          {/* reviews */}
          <section id="stories" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="head rv">
                <h2>What our patients are saying</h2>
                <p>Stories from people who came in with pain and left moving freely.</p>
              </div>
            </div>
            <div className="marq">
              {rows.map((row, r) => (
                <div key={r} className={r ? "mrow rev" : "mrow"}>
                  {[...row, ...row].map((s, i) => (
                    <Quote key={i} s={s} />
                  ))}
                </div>
              ))}
            </div>
            <p className="note sample">Sample reviews for this demo. Replace with the clinic&apos;s real reviews.</p>
          </section>

          {/* faq */}
          <section id="faq" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="head rv">
                <h2>Frequently asked questions</h2>
                <p>Everything you need to know before your first visit.</p>
              </div>
              <div className="faq rv">
                {FAQ.map((f, i) => (
                  <details key={f.q} open={i === 0} className="spot-b">
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* advice */}
          <section id="blog" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="head rv">
                <h2>Your guide to moving well</h2>
                <p>Practical advice from our physios on staying active and pain-free.</p>
              </div>
              <div className="blog rv">
                <a className="feat-post" href="#blog">
                  <Photo src="/site/blog/runner.jpg" label="Blog photo: runner stretching" className="tilt">
                    <span className="post-chip">Running</span>
                  </Photo>
                  <div className="meta">
                    <span>28 Sep 2026</span>
                    <span>6 min read</span>
                  </div>
                  <h3>How to raise your weekly running distance without getting injured</h3>
                  <p>The 10% rule, what to do when your knee starts aching, and the three strength exercises every runner should do.</p>
                  <span className="post-more">
                    Read the guide <ArrowRight />
                  </span>
                </a>
                <div className="posts">
                  {[
                    ["/site/blog/desk.jpg", "Photo: desk stretch", "Five stretches for a stiff neck at your desk", "Desk work", "4 min read"],
                    ["/site/blog/knee-brace.jpg", "Photo: knee brace", "The first two weeks after knee surgery", "After surgery", "5 min read"],
                    ["/site/blog/lifting.jpg", "Photo: lifting technique", "Lifting at home without hurting your back", "Back pain", "4 min read"],
                  ].map(([src, ph, t, cat, m]) => (
                    <a key={t} className="post spot-b" href="#blog">
                      <Photo src={src} label={ph} />
                      <div className="post-body">
                        <span className="post-cat">{cat}</span>
                        <h3>{t}</h3>
                        <p>{m}</p>
                      </div>
                      <span className="post-go" aria-hidden="true">
                        <ArrowRight />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </SiteProvider>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { hasFree, slotsFor } from "./data";
import { Photo } from "./Photo";
import { useSite } from "./SiteProvider";

export function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

export function Mark() {
  return (
    <span className="mk">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="13" cy="4.5" r="2" />
        <path d="M4 21l4-6 3 2 2-5 5 3" />
        <path d="M8 11l3-3 4 2" />
      </svg>
    </span>
  );
}

/** The gradient call-to-action pill with a round arrow. */
export function Cta({ href, children, small }: { href: string; children: React.ReactNode; small?: boolean }) {
  return (
    <a className={small ? "cta sm" : "cta"} href={href}>
      <span className="t">{children}</span>
      <span className="g">
        <Arrow />
      </span>
    </a>
  );
}

const LINKS: [string, string][] = [
  ["home", "Home"],
  ["services", "Services"],
  ["experts", "Physios"],
  ["painmap", "Where it hurts"],
  ["packages", "Packages"],
  ["faq", "FAQ"],
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    LINKS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <header className={scrolled ? "top scrolled" : "top"}>
      <div className="wrap">
        <div className="bar">
          <a className="logo" href="#home" aria-label="Motiva Physio home">
            <Mark />
            Motiva
          </a>
          <nav className="links" aria-label="Main">
            {LINKS.map(([id, t]) => (
              <a key={id} href={`#${id}`} className={active === id ? "on" : undefined}>
                {t}
              </a>
            ))}
          </nav>
          <Cta href="#book" small>
            Book Appointment
          </Cta>
          <button className="menu-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 8h16M4 16h10" />
            </svg>
          </button>
        </div>
        <nav className={open ? "mnav open" : "mnav"} aria-label="Mobile">
          {[...LINKS.slice(1), ["book", "Book appointment"]].map(([id, t]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              {t}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

/** Split text into words that animate in one after another. */
function words(text: string, start: number) {
  return text.split(" ").flatMap((w, i) => [
    <span key={`w${start + i}`} className="w" style={{ "--i": start + i } as React.CSSProperties}>
      {w}
    </span>,
    " ",
  ]);
}

/** "Today, 4:30 PM" for the first open slot in the next two weeks. */
function useNextSlot() {
  const { days } = useSite();
  const i = days.findIndex((d) => hasFree(d, null));
  if (i < 0) return "Today, 4:30 PM";
  const sl = Object.values(slotsFor(days[i], null)!).flat().find((x) => !x.off)!;
  const d = i === 0 ? "Today" : i === 1 ? "Tomorrow" : days[i].toLocaleDateString("en-GB", { weekday: "short" });
  const [h, m] = sl.t.split(":").map(Number);
  return `${d}, ${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** `image` is the hero photo in public/site/, once it has been added. */
export function Hero({ image }: { image?: string | null }) {
  const next = useNextSlot();
  return (
    <div className="hero">
      <div className="wrap hero-grid">
        <div className="hero-l">
          <svg className="waves" viewBox="0 0 600 560" preserveAspectRatio="none" aria-hidden="true">
            <g fill="none" stroke="#fff" strokeWidth="1.5" opacity=".9">
              <path d="M-20 380 C120 300 220 460 360 380 S560 300 640 360" />
              <path d="M-20 420 C120 340 240 500 380 420 S560 340 640 400" />
              <path d="M-20 460 C140 380 250 540 400 460 S560 380 640 440" />
            </g>
          </svg>
          <span className="blob a" />
          <span className="blob b" />
          <h1>
            {words("Move better, recover", 0)}
            <em className="w" style={{ "--i": 3 } as React.CSSProperties}>
              faster
            </em>{" "}
            {words("with expert physio", 4)}
          </h1>
          <p className="up" style={{ "--d": ".1s" } as React.CSSProperties}>
            Hands-on physiotherapy in Colombo for sports injuries, back and neck pain, and rehab after surgery, with a
            clear plan from your first visit.
          </p>
          <div className="hero-btns up" style={{ "--d": ".2s" } as React.CSSProperties}>
            <a className="btn" href="#services">
              Explore Services
            </a>
            <Cta href="#book">Book Now</Cta>
          </div>
          <div className="trustline up" style={{ "--d": ".3s" } as React.CSSProperties}>
            <span className="avs">
              <span style={{ background: "#B08968" }}>DR</span>
              <span style={{ background: "#928AFD" }}>SM</span>
              <span style={{ background: "#334155" }}>RP</span>
            </span>
            <span>
              <b data-count="5000" data-suf="+">
                5,000+
              </b>{" "}
              patients back to moving
            </span>
          </div>
        </div>
        <div className="hero-r up" style={{ "--d": ".15s" } as React.CSSProperties}>
          <Photo src={image} pos="center 30%" label="Hero photo: add public/site/hero.jpg (portrait, about 1200×1400)" />
          <div className="tagpin p1">
            <i className="ring" />
            <span>Pain Relief</span>
          </div>
          <div className="tagpin p2">
            <i className="ring" />
            <span>Better Mobility</span>
          </div>
          <div className="tagpin p3">
            <i className="ring" />
            <span>Your Recovery, Our Priority</span>
          </div>
          <div className="slot-card">
            <span className="i">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="3" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
            </span>
            <div>
              <small>
                Next available
                <i className="live" style={{ display: "inline-block" }} />
              </small>
              <b>{next}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

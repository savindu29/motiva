"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PACKAGES, PACK_FILTERS, SERVICES, TEAM, TEAM_FILTERS, fmt, type ServiceId } from "./data";
import { Photo } from "./Photo";
import { reducedMotion, scrollToBook, useSite } from "./SiteProvider";
import { Arrow } from "./Top";

/** Start a booking with this service already picked. */
function useBookService() {
  const { goStep } = useSite();
  return (svc: ServiceId) => {
    goStep(1, { svc }, true);
    scrollToBook();
  };
}

/* --- services ------------------------------------------------------------- */

/** Line icons for the service tiles. */
const SVC_ICON: Record<string, React.ReactNode> = {
  assess: <path d="M9 4h6v3H9zM7 5.5H5.5A1.5 1.5 0 0 0 4 7v12.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V7a1.5 1.5 0 0 0-1.5-1.5H17M8 13l2.5 2.5L16 10" />,
  sport: <path d="M14 3.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zM5 20l4-6 3 2 2-5 5 3M8 11l3-3 4 2" />,
  spine: <path d="M12 3v18M9 5.5h6M8.5 9h7M8 12.5h8M8.5 16h7M9 19.5h6" />,
  surgery: <path d="M4 9.5l5.5-5.5 10.5 10.5-5.5 5.5zM9 13l2 2M11.5 10.5l2 2M14 8l2 2" />,
  neuro: <path d="M12 5a3 3 0 0 0-5.6 1.5A3 3 0 0 0 4.5 12a3 3 0 0 0 2.5 5 3 3 0 0 0 5 1.5M12 5a3 3 0 0 1 5.6 1.5A3 3 0 0 1 19.5 12a3 3 0 0 1-2.5 5 3 3 0 0 1-5 1.5M12 5v13.5" />,
  needle: <path d="M4 20l5-5M8 12l4 4M10 10l8-8 4 4-8 8-4-4zM16 4l4 4" />,
};

export function Services() {
  const book = useBookService();
  return (
    <div className="svc">
      {SERVICES.filter((s) => !s.hidden).map((s, i) => (
        <button
          key={s.id}
          className={`sc lite t${i + 1} tilt${[0, 2, 3].includes(i) ? " tall" : ""} rv`}
          style={{ "--d": `${(i % 3) * 0.08}s` } as React.CSSProperties}
          aria-label={`Book ${s.name}`}
          onClick={() => book(s.id)}
        >
          <span className="sc-no" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="sc-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {SVC_ICON[s.id]}
            </svg>
          </span>
          <span className="arrow">
            <Arrow />
          </span>
          <div className="txt">
            <h3>{s.name}</h3>
            <p>{s.desc}</p>
            <span className="price">
              {s.min} min · {fmt(s.price)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

/* --- physios -------------------------------------------------------------- */

export function Experts() {
  const { bk, goStep, toast } = useSite();
  const [cat, setCat] = useState<string>("all");
  const rail = useRef<HTMLDivElement>(null);
  const [dots, setDots] = useState({ pages: 1, cur: 0 });

  const measure = useCallback(() => {
    const r = rail.current;
    if (!r) return;
    const vis = [...r.querySelectorAll<HTMLElement>(".doc:not(.gone)")];
    const per = Math.max(1, Math.round(r.clientWidth / (vis[0] ? vis[0].offsetWidth + 16 : 1)));
    const pages = Math.max(1, Math.ceil(vis.length / per));
    const cur = Math.min(Math.round(r.scrollLeft / Math.max(1, r.clientWidth)), pages - 1);
    setDots({ pages, cur });
  }, []);

  useEffect(() => {
    const r = rail.current!;
    let t: number | undefined;
    const onScroll = () => {
      window.clearTimeout(t);
      t = window.setTimeout(measure, 60);
    };
    measure();
    r.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      r.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useEffect(() => {
    rail.current?.scrollTo({ left: 0 });
    measure();
  }, [cat, measure]);

  const behavior = () => (reducedMotion() ? "auto" : "smooth") as ScrollBehavior;
  const prev = () => rail.current?.scrollBy({ left: -rail.current.clientWidth, behavior: behavior() });
  const next = () => {
    const r = rail.current!;
    if (r.scrollLeft + r.clientWidth >= r.scrollWidth - 4) r.scrollTo({ left: 0, behavior: behavior() });
    else r.scrollBy({ left: r.clientWidth, behavior: behavior() });
  };

  const pick = (id: string, bookable: boolean) => {
    const th = bookable ? id : "any";
    goStep(bk.svc ? 2 : 0, { th }, true);
    if (!bookable) toast("Booking with the first available physio");
    else if (!bk.svc) toast("Choose a service first");
    scrollToBook();
  };

  return (
    <>
      <div className="filters rv" role="group" aria-label="Filter physios">
        {TEAM_FILTERS.map(([k, l]) => (
          <button key={k} aria-pressed={k === cat} onClick={() => setCat(k)}>
            {l}
          </button>
        ))}
      </div>
      <div className="rail rv" ref={rail}>
        {TEAM.map((t) => (
          <button
            key={t.id}
            className={`doc tilt${cat !== "all" && t.cat !== cat ? " gone" : ""}`}
            aria-label={`Book with ${t.name}`}
            onClick={() => pick(t.id, t.bookable)}
          >
            <Photo label={`Portrait: ${t.name}`} src={t.photo} pos="center top" className={t.tint} />
            <div className="shade" style={{ background: t.shade }} />
            <span className="book">Book</span>
            <div className="who">
              <b>{t.name}</b>
              <span>
                {t.role} · {t.yrs} yrs
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className="rail-nav">
        <div className="dots">
          {Array.from({ length: dots.pages }, (_, i) => (
            <i key={i} className={i === dots.cur ? "on" : undefined} />
          ))}
        </div>
        <div className="navbtns">
          <button aria-label="Previous physios" onClick={prev}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </button>
          <button aria-label="Next physios" onClick={next}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

/* --- packages ------------------------------------------------------------- */

export function Packages() {
  const book = useBookService();
  const [cat, setCat] = useState<string>("all");
  const grid = useRef<HTMLDivElement>(null);

  const choose = (k: string) => {
    setCat(k);
    if (reducedMotion()) return;
    // fade the cards that stay in, once they've re-rendered
    requestAnimationFrame(() =>
      grid.current?.querySelectorAll(".pk:not(.gone)").forEach((c) =>
        c.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], {
          duration: 450,
          easing: "cubic-bezier(.2,.7,.2,1)",
        }),
      ),
    );
  };

  return (
    <>
      <div className="filters rv" role="group" aria-label="Filter packages">
        {PACK_FILTERS.map(([k, l]) => (
          <button key={k} aria-pressed={k === cat} onClick={() => choose(k)}>
            {l}
          </button>
        ))}
      </div>
      <div className="pk-grid" ref={grid}>
        {PACKAGES.map((p, i) => (
          <article
            key={p.name}
            className={`pk rv${cat !== "all" && p.cat !== cat ? " gone" : ""}`}
            style={{ "--d": `${(i % 3) * 0.08}s` } as React.CSSProperties}
          >
            <Photo label={`Photo: ${p.name.toLowerCase()}`} src={p.photo} className="tilt is-photo" />
            <h3>{p.name}</h3>
            <p>{p.desc}</p>
            <ul>
              {p.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <div className="foot">
              <div>
                <small>Price</small>
                <b>{fmt(p.price)}</b>
              </div>
              <button className="btn dark" onClick={() => book(p.svc)}>
                Book Now
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

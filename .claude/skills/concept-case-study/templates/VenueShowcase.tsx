"use client";

import { useEffect, useState } from "react";

export type Venue = {
  src: string | null;
  file: string;
  type: string;
  where: string;
  tiers: [string, string, string];
};

const TIER_COLOURS = ["var(--sp-first)", "var(--sp-business)", "var(--sp-economy)"];
const STEP_MS = 6000;

/**
 * One large stage showing the chosen venue, with tabs that switch it. The
 * stage cycles on its own and pauses while the pointer is over it.
 */
export function VenueShowcase({ venues }: { venues: Venue[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % venues.length), STEP_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, venues.length]);

  const v = venues[active];

  return (
    <div
      className={paused ? "sp-vs is-paused" : "sp-vs"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ "--step": `${STEP_MS}ms` } as React.CSSProperties}
    >
      <div className="sp-vs-stage">
        {venues.map((x, i) => (
          <div
            key={x.file}
            className={i === active ? "sp-vs-slide is-on" : "sp-vs-slide"}
            aria-hidden={i !== active}
          >
            {x.src ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="sp-vs-fill" src={x.src} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="sp-vs-img" src={x.src} alt={`${x.type} in 3D`} />
              </>
            ) : (
              <div className="sp-vs-empty">
                <code>public/skypass/{x.file}.png</code>
              </div>
            )}
          </div>
        ))}

        <div className="sp-vs-info" key={active}>
          <p className="sp-vs-count">
            {String(active + 1).padStart(2, "0")} / {String(venues.length).padStart(2, "0")}
          </p>
          <h3>{v.type}</h3>
          <p className="sp-vs-where">{v.where}</p>
          <ul>
            {v.tiers.map((t, i) => (
              <li key={t}>
                <i style={{ background: TIER_COLOURS[i] }} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="sp-vs-tabs" role="tablist" aria-label="Venue types">
        {venues.map((x, i) => (
          <button
            key={x.file}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={i === active ? "sp-vs-tab is-on" : "sp-vs-tab"}
            onClick={() => setActive(i)}
          >
            <span className="sp-vs-thumb">
              {x.src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={x.src} alt="" loading="lazy" />
              )}
            </span>
            <span className="sp-vs-tab-text">
              <b>{x.type}</b>
              <small>{x.where}</small>
            </span>
            <span className="sp-vs-bar" aria-hidden="true">
              <i />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

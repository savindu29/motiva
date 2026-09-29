"use client";

import { useEffect, useState } from "react";

export type PainArea = {
  src: string | null;
  file: string;
  name: string;
  view: string;
  sessions: string;
  weeks: string;
  treatments: [string, string, string];
};

const DOT_COLOURS = ["#928afd", "#5cc8ff", "#e3eed8"];
const STEP_MS = 6000;

/**
 * One large stage showing the pain map with an area selected, with tabs that
 * switch it. The stage cycles on its own and pauses while the pointer is over
 * it.
 */
export function PainShowcase({ areas }: { areas: PainArea[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % areas.length), STEP_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, areas.length]);

  const a = areas[active];

  return (
    <div
      className={paused ? "mv-ps is-paused" : "mv-ps"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ "--step": `${STEP_MS}ms` } as React.CSSProperties}
    >
      <div className="mv-ps-stage">
        {areas.map((x, i) => (
          <div
            key={x.file}
            className={i === active ? "mv-ps-slide is-on" : "mv-ps-slide"}
            aria-hidden={i !== active}
          >
            {x.src ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="mv-ps-fill" src={x.src} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="mv-ps-img" src={x.src} alt={`Pain map with ${x.name.toLowerCase()} selected`} />
              </>
            ) : (
              <div className="mv-ps-empty">
                <code>public/motiva/{x.file}.png</code>
              </div>
            )}
          </div>
        ))}

        <div className="mv-ps-info" key={active}>
          <p className="mv-ps-count">
            {String(active + 1).padStart(2, "0")} / {String(areas.length).padStart(2, "0")}
          </p>
          <h3>{a.name}</h3>
          <p className="mv-ps-where">
            {a.view} · {a.sessions} sessions · {a.weeks}
          </p>
          <ul>
            {a.treatments.map((t, i) => (
              <li key={t}>
                <i style={{ background: DOT_COLOURS[i] }} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mv-ps-tabs" role="tablist" aria-label="Body areas">
        {areas.map((x, i) => (
          <button
            key={x.file}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={i === active ? "mv-ps-tab is-on" : "mv-ps-tab"}
            onClick={() => setActive(i)}
          >
            <span className="mv-ps-thumb">
              {x.src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={x.src} alt="" loading="lazy" />
              )}
            </span>
            <span className="mv-ps-tab-text">
              <b>{x.name}</b>
              <small>
                {x.sessions} sessions · {x.weeks}
              </small>
            </span>
            <span className="mv-ps-bar" aria-hidden="true">
              <i />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

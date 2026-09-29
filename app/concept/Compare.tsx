"use client";

import { useState } from "react";

/**
 * Before / after slider: the `after` image is revealed over `before` up to
 * the handle. A transparent range input on top does the dragging, so it works
 * with mouse, touch and the arrow keys.
 */
export function Compare({
  before,
  after,
  beforeLabel,
  afterLabel,
}: {
  before: { src: string | null; alt: string; file: string };
  after: { src: string | null; alt: string; file: string };
  beforeLabel: string;
  afterLabel: string;
}) {
  const [pos, setPos] = useState(50);

  if (!before.src || !after.src) {
    return (
      <div className="mv-compare is-empty" role="img" aria-label="Screenshots to come">
        <span>
          Add <code>{before.file}.png</code> and <code>{after.file}.png</code>
        </span>
      </div>
    );
  }

  return (
    <div className="mv-compare" style={{ "--pos": `${pos}%` } as React.CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={before.src} alt={before.alt} loading="lazy" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="mv-compare-after" src={after.src} alt={after.alt} loading="lazy" />
      <span className="mv-compare-tag is-left">{beforeLabel}</span>
      <span className="mv-compare-tag is-right">{afterLabel}</span>
      <span className="mv-compare-handle" aria-hidden="true">
        <i>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </i>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Drag to compare ${beforeLabel.toLowerCase()} and ${afterLabel.toLowerCase()}`}
      />
    </div>
  );
}

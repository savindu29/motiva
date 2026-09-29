"use client";

import { useLayoutEffect, useRef } from "react";
import type { XrayKey } from "./data";
import { type Render, useXray } from "./xray";

function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 16l-5-5-8 8" />
    </svg>
  );
}

/** Place the pain markers over the image, matching object-fit: cover. */
function layout(w: HTMLDivElement, r: Render, pos: string) {
  const cw = w.clientWidth;
  const ch = w.clientHeight;
  if (!cw || !ch) return;
  const sc = Math.max(cw / r.w, ch / r.h);
  const dw = r.w * sc;
  const dh = r.h * sc;
  const pp = pos.split(" ");
  const pv = (v?: string) => (v === "center" || !v ? 0.5 : parseFloat(v) / 100);
  const ox = (cw - dw) * pv(pp[0]);
  const oy = (ch - dh) * pv(pp[1] || pp[0]);
  w.querySelectorAll<HTMLSpanElement>(".pain").forEach((d, i) => {
    const q = r.p[i];
    if (!q) return;
    d.style.left = ox + q.x * dw + "px";
    d.style.top = oy + q.y * dh + "px";
    d.style.setProperty("--s", Math.max(46, Math.min(q.r * 2 * dw * 1.1, Math.min(cw, ch) * 0.4)) + "px");
    d.style.opacity = String(Math.min(1, 0.55 + q.op * 0.45));
  });
}

/**
 * A photo slot. Shows its X-ray render once the renderer has drawn it, and a
 * labelled placeholder until then (or for good, when there's no render).
 */
export function Photo({
  label,
  src,
  xray,
  pos = "center",
  className = "",
  children,
}: {
  label: string;
  /** A real photo. Takes the place of the render and the placeholder. */
  src?: string | null;
  xray?: XrayKey;
  pos?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const r = useXray(xray);
  const wrap = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const w = wrap.current;
    if (!w || !r) return;
    layout(w, r, pos);
    const ro = new ResizeObserver(() => layout(w, r, pos));
    ro.observe(w);
    return () => ro.disconnect();
  }, [r, pos]);

  return (
    <div className={`photo ${r ? "has-xr " : ""}${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" style={{ objectPosition: pos }} />
      ) : r ? (
        <div className="xrw" ref={wrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="xr" src={r.u} alt={`3D illustration: ${xray} pain area`} style={{ objectPosition: pos }} />
          {r.p.map((_, i) => (
            <span key={i} className="pain" style={{ "--dl": `${i * 0.45}s` } as React.CSSProperties}>
              <i className="heat" />
              <i className="rip" />
              <i className="rip" />
              <i className="rip" />
              <i className="core" />
            </span>
          ))}
        </div>
      ) : (
        <div className="ph">
          <PhotoIcon />
          <span>{label}</span>
        </div>
      )}
      {children}
    </div>
  );
}

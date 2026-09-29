"use client";

import { useState } from "react";
import { AREAS, SERVICES, type AreaId } from "./data";
import { HumanBody, type Hotspot } from "./HumanBody";
import { Photo } from "./Photo";
import { scrollToBook, useSite } from "./SiteProvider";
import { Arrow } from "./Top";

type View = "front" | "back";

/** Where each area sits on the 3D body: [bone, blend-to bone, blend]. */
const PINS: Record<AreaId, { side: Hotspot["side"]; at: [string, string?, number?][] }> = {
  neck: { side: "both", at: [["NeckTwist01"]] },
  shoulder: { side: "front", at: [["R_Upperarm"], ["L_Upperarm"]] },
  elbow: { side: "front", at: [["R_Forearm"], ["L_Forearm"]] },
  wrist: { side: "front", at: [["R_Hand"], ["L_Hand"]] },
  upback: { side: "back", at: [["Spine02"]] },
  lowback: { side: "back", at: [["Waist"]] },
  hip: { side: "front", at: [["R_Thigh"], ["L_Thigh"]] },
  ham: { side: "back", at: [["R_Thigh", "R_Calf", 0.5], ["L_Thigh", "L_Calf", 0.5]] },
  knee: { side: "front", at: [["R_Calf"], ["L_Calf"]] },
  calf: { side: "back", at: [["R_Calf", "R_Foot", 0.35], ["L_Calf", "L_Foot", 0.35]] },
  ankle: { side: "front", at: [["R_Foot"], ["L_Foot"]] },
};

const HOTSPOTS: Hotspot[] = (Object.keys(PINS) as AreaId[]).flatMap((k) =>
  PINS[k].at.map(([bone, to, t], i) => ({
    id: k,
    bone,
    to,
    t,
    side: PINS[k].side,
    label: `${AREAS[k].name}${PINS[k].at.length > 1 ? (i === 0 ? " (right)" : " (left)") : ""}`,
  })),
);

/** The glassy 2D body the tap points sit on. */
function Body({ view }: { view: View }) {
  const limb = (pts: number[][], w: number) => (
    <polyline className="limb" strokeWidth={w} points={pts.map((p) => p.join(",")).join(" ")} />
  );
  return (
    <>
      <circle className="part" cx="100" cy="38" r="22" />
      {limb([[100, 58], [100, 80]], 16)}
      <path className="part" d="M62 88 Q100 78 138 88 Q146 92 144 104 L132 160 Q128 196 126 214 L74 214 Q72 196 68 160 L56 104 Q54 92 62 88Z" />
      <path className="part" d="M74 206 L126 206 Q132 222 128 236 L72 236 Q68 222 74 206Z" />
      {limb([[62, 98], [50, 168], [42, 236]], 17)}
      {limb([[138, 98], [150, 168], [158, 236]], 17)}
      {limb([[84, 230], [80, 320], [80, 404]], 22)}
      {limb([[116, 230], [120, 320], [120, 404]], 22)}
      <ellipse className="part" cx={view === "back" ? 78 : 76} cy="418" rx="15" ry="8" />
      <ellipse className="part" cx={view === "back" ? 122 : 124} cy="418" rx="15" ry="8" />
      {view === "back" && (
        <>
          <path className="spine" d="M100 84 V210" />
          <path className="spine" d="M78 110 Q86 128 82 144 M122 110 Q114 128 118 144" />
        </>
      )}
    </>
  );
}

/** Every tap point visible from this side. Paired areas get a left and right point. */
function spots(view: View) {
  const out: { k: AreaId; x: number; y: number; side: string }[] = [];
  for (const [k, a] of Object.entries(AREAS) as [AreaId, (typeof AREAS)[AreaId]][]) {
    if (a.view !== "both" && a.view !== view) continue;
    const xs = Array.isArray(a.x) ? a.x : [a.x];
    // the figure faces us, so its right side is on our left
    xs.forEach((x, i) => out.push({ k, x, y: a.y, side: xs.length > 1 ? (i === 0 ? "right" : "left") : "" }));
  }
  return out;
}

export function PainMap() {
  const { goStep } = useSite();
  const [view, setView] = useState<View>("front");
  const [area, setArea] = useState<AreaId>("knee");
  const [hint, setHint] = useState("Tap a point on the body, or drag to turn it");
  const [turnId, setTurnId] = useState(0);
  const face = (v: View) => {
    setView(v);
    setTurnId((n) => n + 1);
  };
  const a = AREAS[area];
  const svc = SERVICES.find((s) => s.id === a.svc)!;

  const select = (k: AreaId) => {
    setArea(k);
    const v = AREAS[k].view;
    if (v !== "both" && v !== view) face(v);
    setHint(`${AREAS[k].name} selected`);
  };

  return (
    <div className="map rv">
      <div className="map-stage">
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <linearGradient id="glass" x1="0" x2="1">
              <stop offset="0" stopColor="#B1ACEF" />
              <stop offset=".45" stopColor="#EEEDFF" />
              <stop offset="1" stopColor="#A7B8DE" />
            </linearGradient>
            <linearGradient id="glassF" x1="0" x2="1">
              <stop offset="0" stopColor="#BDB8F4" />
              <stop offset=".5" stopColor="#F4F3FF" />
              <stop offset="1" stopColor="#B4C4E6" />
            </linearGradient>
            <radialGradient id="redGlow">
              <stop offset="0" stopColor="#FF3B30" stopOpacity=".85" />
              <stop offset=".45" stopColor="#EF4444" stopOpacity=".35" />
              <stop offset="1" stopColor="#EF4444" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        <div className="seg" role="group" aria-label="Body view">
          <button aria-pressed={view === "front"} onClick={() => face("front")}>
            Front
          </button>
          <button aria-pressed={view === "back"} onClick={() => face("back")}>
            Back
          </button>
        </div>
        <div className="map-body">
          <HumanBody
            hotspots={HOTSPOTS}
            active={area}
            onSelect={(k) => select(k as AreaId)}
            facing={view}
            turnId={turnId}
            fallback={
                    <svg className="body-svg" viewBox="0 0 200 440" role="group" aria-label="Body map">
                      <Body view={view} />
                      {spots(view).map((s) => (
                        <g
                          key={`${s.k}-${s.x}`}
                          className={s.k === area ? "spot on" : "spot"}
                          tabIndex={0}
                          role="button"
                          aria-label={`${AREAS[s.k].name}${s.side ? ` (${s.side})` : ""}`}
                          onClick={() => select(s.k)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              select(s.k);
                            }
                          }}
                        >
                          <circle cx={s.x} cy={s.y} r="22" fill="transparent" />
                          <circle className="glow" cx={s.x} cy={s.y} r="24" />
                          <circle className="dot" cx={s.x} cy={s.y} r="7" />
                        </g>
                      ))}
                    </svg>
            }
          />
        </div>
        <p className="map-hint">{hint}</p>
      </div>

      <div className="area" aria-live="polite">
        <Photo key={area} label={`3D view: ${a.name}`} xray={a.xray} pos={a.pos} className="area-img" />
        <div className="area-top">
          <div style={{ display: "grid", gap: 10 }}>
            <span className="kicker">Selected area</span>
            <h3>{a.name}</h3>
          </div>
          <button
            className="cta sm"
            onClick={() => {
              goStep(1, { svc: a.svc, area }, true);
              scrollToBook();
            }}
          >
            <span className="t">Book for {a.name.toLowerCase()}</span>
            <span className="g">
              <Arrow />
            </span>
          </button>
        </div>
        <div className="chips" role="group" aria-label="All areas">
          {(Object.keys(AREAS) as AreaId[]).map((k) => (
            <button key={k} className="chip" aria-pressed={k === area} onClick={() => select(k)}>
              {AREAS[k].name}
            </button>
          ))}
        </div>
        <div className="cols">
          <div className="box pain spot-b">
            <h4>Common causes</h4>
            <ul>
              {a.conds.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="box spot-b">
            <h4>How we treat it</h4>
            <ul>
              {a.tx.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="stats3">
          <div className="st spot-b">
            <b>{a.sess}</b>
            <span>typical sessions</span>
          </div>
          <div className="st spot-b">
            <b>{a.wk}</b>
            <span>usual recovery</span>
          </div>
          <div className="st spot-b">
            <b style={{ fontSize: "clamp(17px,1.6vw,21px)", letterSpacing: "-.02em" }}>{svc.name}</b>
            <span>suggested service</span>
          </div>
        </div>
        {a.flag && <p className="flag">{a.flag}</p>}
      </div>
    </div>
  );
}

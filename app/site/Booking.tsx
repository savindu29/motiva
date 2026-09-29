"use client";

import { Fragment, useRef, useState } from "react";
import { AREAS, CLINIC, SERVICES, TEAM, fmt, hasFree, slotsFor, type AreaId } from "./data";
import { Photo } from "./Photo";
import { useSite } from "./SiteProvider";

const STEPS = ["Service", "Physio", "Date & time", "Details"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Physios who take bookings by name. */
const BOOKABLE = TEAM.filter((t) => t.bookable);

type Field = "name" | "phone" | "email";
/** `area` stays null until the visitor picks one, so the pain map's choice shows. */
const EMPTY_FORM: { name: string; phone: string; email: string; area: AreaId | "" | null; first: string; note: string } = {
  name: "",
  phone: "",
  email: "",
  area: null,
  first: "Yes, first visit",
  note: "",
};

const CHECKS: Record<Field, [(v: string) => boolean, string]> = {
  name: [(v) => v.length >= 2, "Enter your name so we know who to expect."],
  phone: [(v) => /^(\+94|0)?7\d{8}$/.test(v.replace(/[\s-]/g, "")), "Enter a Sri Lankan mobile number, e.g. 077 123 4567."],
  email: [(v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter an email address like name@example.com."],
};

export function Booking() {
  const { bk, days, update, goStep, reset, toast } = useSite();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [done, setDone] = useState<{ ref: string; msg: React.ReactNode } | null>(null);
  const inputs = { name: useRef<HTMLInputElement>(null), phone: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null) };

  const svc = SERVICES.find((s) => s.id === bk.svc);
  const thName = bk.th === "any" ? "the first available physio" : TEAM.find((t) => t.id === bk.th)?.name;
  const dateStr = (i: number) => days[i].toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  const canNext = [!!bk.svc, !!bk.th, bk.date != null && !!bk.time, true][bk.step];

  const next = () => {
    if (bk.step < 3) return goStep(bk.step + 1);
    // check the details, focusing the first field that's wrong
    const errs: Partial<Record<Field, string>> = {};
    (Object.keys(CHECKS) as Field[]).forEach((k) => {
      if (!CHECKS[k][0](form[k].trim())) errs[k] = CHECKS[k][1];
    });
    setErrors(errs);
    const bad = (Object.keys(CHECKS) as Field[]).find((k) => errs[k]);
    if (bad) return inputs[bad].current?.focus();
    const d = days[bk.date!];
    const ref = `MV-${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
    setDone({
      ref,
      msg: (
        <>
          {svc!.name} with {thName} on{" "}
          <b>
            {dateStr(bk.date!)} at {bk.time}
          </b>
          . Please arrive 10 minutes early and wear loose clothing.
        </>
      ),
    });
    goStep(4);
  };

  const again = () => {
    reset();
    setForm(EMPTY_FORM);
    setErrors({});
    setDone(null);
  };

  const summary = [
    svc && (
      <span key="s">
        <b>{svc.name}</b> · {fmt(svc.price)}
      </span>
    ),
    bk.th && <span key="t">{bk.th === "any" ? "First available" : thName}</span>,
    bk.date != null && bk.time && days.length > 0 && <span key="d">{`${dateStr(bk.date)}, ${bk.time}`}</span>,
  ].filter(Boolean);

  const field = (k: Field, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, full = false) => (
    <div className={`field${full ? " full" : ""}${errors[k] ? " bad" : ""}`}>
      <label htmlFor={`f-${k}`}>{label}</label>
      <input id={`f-${k}`} ref={inputs[k]} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} {...props} />
      <span className="err">{errors[k]}</span>
    </div>
  );

  const slots = bk.date != null && days.length ? slotsFor(days[bk.date], bk.th) : null;

  return (
    <div className="book rv">
      <div className="bmain spot-b">
        <div className="stepper">
          {STEPS.map((s, i) => (
            <Fragment key={s}>
              <div className={`s${i === bk.step ? " now" : ""}${i < bk.step ? " done" : ""}`}>
                <b>{i + 1}</b>
                <span>{s}</span>
              </div>
              {i < STEPS.length - 1 && <i className="ln" />}
            </Fragment>
          ))}
        </div>

        <div className="pane" hidden={bk.step !== 0}>
          <h3>What do you need help with?</h3>
          <div className="opts">
            {SERVICES.map((s) => (
              <button key={s.id} className="opt spot-b" aria-pressed={bk.svc === s.id} onClick={() => update({ svc: s.id })}>
                <b>{s.name}</b>
                <span>{s.desc}</span>
                <div className="orow">
                  <em>{s.min} min</em>
                  {fmt(s.price)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pane" hidden={bk.step !== 1}>
          <h3>Who would you like to see?</h3>
          <div className="opts">
            <button className="opt th spot-b" aria-pressed={bk.th === "any"} onClick={() => update({ th: "any", time: null })}>
              <span className="av">★</span>
              <b>First available</b>
              <span>Earliest slot with any physio</span>
            </button>
            {BOOKABLE.map((t) => (
              <button key={t.id} className="opt th spot-b" aria-pressed={bk.th === t.id} onClick={() => update({ th: t.id, time: null })}>
                <span className="av">{t.ini}</span>
                <b>{t.name}</b>
                <span>{t.role}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pane" hidden={bk.step !== 2}>
          <h3>Pick a day and time</h3>
          <div className="days">
            {days.map((d, i) => (
              <button
                key={i}
                className="day"
                aria-pressed={bk.date === i}
                disabled={d.getDay() === 0}
                aria-label={d.getDay() === 0 ? "Closed on Sunday" : undefined}
                onClick={() => update({ date: i, time: null })}
              >
                <small>{i === 0 ? "Today" : WEEKDAYS[d.getDay()]}</small>
                <b>{d.getDate()}</b>
                <span>{MONTHS[d.getMonth()]}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gap: 18 }}>
            {bk.date == null ? (
              <p className="note">Choose a day to see open times.</p>
            ) : !slots ? (
              <p className="note">We are closed on Sundays.</p>
            ) : !hasFree(days[bk.date], bk.th) ? (
              <p className="note">No times left on this day. Try the next one.</p>
            ) : (
              Object.entries(slots).map(([k, l]) => (
                <div key={k} className="sgroup">
                  <h4>{k}</h4>
                  <div className="slots">
                    {l.map((s) => (
                      <button
                        key={s.t}
                        className="slot"
                        disabled={s.off}
                        aria-label={s.off ? `${s.t} taken` : undefined}
                        aria-pressed={bk.time === s.t}
                        onClick={() => update({ time: s.t })}
                      >
                        {s.t}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pane" hidden={bk.step !== 3}>
          <h3>Your details</h3>
          <form className="form" noValidate onSubmit={(e) => e.preventDefault()}>
            {field("name", "Full name", { autoComplete: "name", placeholder: "e.g. Ishara Wijesinghe" })}
            {field("phone", "Mobile number", { autoComplete: "tel", inputMode: "tel", placeholder: "077 123 4567" })}
            {field("email", "Email", { type: "email", autoComplete: "email", placeholder: "you@example.com" }, true)}
            <div className="field">
              <label htmlFor="f-area">Where does it hurt?</label>
              <select id="f-area" value={form.area ?? bk.area ?? ""} onChange={(e) => setForm({ ...form, area: e.target.value as AreaId | "" })}>
                <option value="">Not sure / general</option>
                {(Object.keys(AREAS) as AreaId[]).map((k) => (
                  <option key={k} value={k}>
                    {AREAS[k].name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-first">First visit here?</label>
              <select id="f-first" value={form.first} onChange={(e) => setForm({ ...form, first: e.target.value })}>
                <option>Yes, first visit</option>
                <option>No, returning patient</option>
              </select>
            </div>
            <div className="field full">
              <label htmlFor="f-note">
                Anything we should know? <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="f-note"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="When it started, recent surgery, scans you have…"
              />
            </div>
          </form>
          {svc && bk.date != null && days.length > 0 && (
            <div className="recap">
              <div>
                <span>Service</span>
                <b>
                  {svc.name} ({svc.min} min)
                </b>
              </div>
              <div>
                <span>Physio</span>
                <b>{bk.th === "any" ? "First available" : thName}</b>
              </div>
              <div>
                <span>When</span>
                <b>
                  {dateStr(bk.date)} at {bk.time}
                </b>
              </div>
              <div>
                <span>Pay at clinic</span>
                <b>{fmt(svc.price)}</b>
              </div>
            </div>
          )}
        </div>

        <div className="pane" hidden={bk.step !== 4}>
          <div className="done">
            <div className="tick">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <h3>You&apos;re booked in</h3>
            <p className="muted" style={{ maxWidth: "44ch" }}>
              {done?.msg}
            </p>
            <span className="ref">Booking ref {done?.ref}</span>
            <p className="note">Demo booking only. Nothing was sent to the clinic.</p>
            <button className="btn soft" onClick={again}>
              Book another session
            </button>
          </div>
        </div>

        <div className="foot-bar" hidden={bk.step === 4}>
          <div className="summary">
            {summary.length
              ? summary.flatMap((s, i) => (i ? [<span key={`sep${i}`}> · </span>, s] : [s]))
              : "Nothing selected yet"}
          </div>
          <div className="btns">
            <button className="btn soft" style={{ visibility: bk.step === 0 ? "hidden" : "visible" }} onClick={() => goStep(bk.step - 1)}>
              Back
            </button>
            <button className="btn" id="nextBtn" disabled={!canNext} onClick={next}>
              {bk.step === 3 ? "Confirm booking" : "Continue"}
            </button>
          </div>
        </div>
      </div>

      <aside className="bside">
        <Photo src="/site/booking.jpg" pos="center 30%" label="Photo: friendly physio with a patient (portrait)" className="is-photo" />
        <div className="promo">
          <h3>Get 10% off your first assessment</h3>
          <div className="row">
            <div>
              <b>{CLINIC.address}</b>
              <span>{CLINIC.area}</span>
            </div>
            <div>
              <b>{CLINIC.hours}</b>
              <span>{CLINIC.sat}</span>
            </div>
            {[CLINIC.phone, CLINIC.email].map((v) => (
              <div key={v}>
                <b>{v}</b>
                <button
                  className="copy"
                  onClick={() => {
                    if (!navigator.clipboard) return toast(v);
                    navigator.clipboard.writeText(v).then(
                      () => toast(`Copied ${v}`),
                      () => toast(v),
                    );
                  }}
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

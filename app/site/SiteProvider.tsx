"use client";

import { createContext, useCallback, useContext, useRef, useState, useSyncExternalStore } from "react";
import { type AreaId, type ServiceId, hasFree, nextDays } from "./data";

export type Booking = {
  /** 0 service, 1 physio, 2 date & time, 3 details, 4 done */
  step: number;
  svc: ServiceId | null;
  /** A physio id, or "any" for the first available. */
  th: string | null;
  /** Index into `days`. */
  date: number | null;
  time: string | null;
  area: AreaId | null;
};

const EMPTY: Booking = { step: 0, svc: null, th: null, date: null, time: null, area: null };

type Ctx = {
  bk: Booking;
  /** The next 14 days. Empty until the page is running in the browser. */
  days: Date[];
  update: (patch: Partial<Booking>) => void;
  /** Merge `patch`, then go to step `n` (or the earliest step still missing). */
  goStep: (n: number, patch?: Partial<Booking>, fromOutside?: boolean) => void;
  reset: () => void;
  toast: (msg: string) => void;
};

const SiteContext = createContext<Ctx | null>(null);

/* The calendar depends on the visitor's clock, so the server renders none and
   the browser works it out once. */
const NO_DAYS: Date[] = [];
let clientDays: Date[] | null = null;
const getDays = () => (clientDays ??= nextDays());
const noSubscribe = () => () => {};

export function useSite() {
  const c = useContext(SiteContext);
  if (!c) throw new Error("useSite must be used inside <SiteProvider>");
  return c;
}

export function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Scroll the booking card into view. */
export function scrollToBook() {
  document.getElementById("book")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [bk, setBk] = useState<Booking>(EMPTY);
  const days = useSyncExternalStore(noSubscribe, getDays, () => NO_DAYS);
  const [msg, setMsg] = useState<{ text: string; show: boolean }>({ text: "", show: false });
  const timer = useRef<number | undefined>(undefined);

  const update = useCallback((patch: Partial<Booking>) => setBk((b) => ({ ...b, ...patch })), []);

  const goStep = useCallback(
    (n: number, patch: Partial<Booking> = {}, fromOutside = false) =>
      setBk((prev) => {
        const b = { ...prev, ...patch };
        if (fromOutside && prev.step === 4) Object.assign(b, { date: null, time: null });
        if (n >= 1 && !b.svc) n = 0;
        if (n >= 2 && !b.th) n = 1;
        if (n === 2 && b.date == null && days.length) {
          const i = days.findIndex((d) => hasFree(d, b.th));
          b.date = i < 0 ? null : i;
        }
        return { ...b, step: n };
      }),
    [days],
  );

  const reset = useCallback(() => setBk(EMPTY), []);

  const toast = useCallback((text: string) => {
    setMsg({ text, show: true });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg((m) => ({ ...m, show: false })), 2400);
  }, []);

  return (
    <SiteContext.Provider value={{ bk, days, update, goStep, reset, toast }}>
      {children}
      <div className={msg.show ? "toast show" : "toast"} role="status">
        {msg.text}
      </div>
    </SiteContext.Provider>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "./SiteProvider";

/** Count a number up from zero, keeping its suffix ("5,000+", "94%"). */
function countUp(el: HTMLElement) {
  const to = Number(el.dataset.count);
  const suf = el.dataset.suf || "";
  if (reducedMotion()) {
    el.textContent = to.toLocaleString("en-US") + suf;
    return;
  }
  const t0 = performance.now();
  const f = (n: number) => {
    const k = Math.min(1, (n - t0) / 1500);
    el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString("en-US") + suf;
    if (k < 1) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}

/**
 * Page-wide motion: scroll progress, back-to-top, reveal on scroll, counters,
 * click ripples, and (with a fine pointer) magnetic buttons, 3D tilt,
 * spotlight borders, hero parallax and a custom cursor. All of it is
 * decoration; the page works the same without it.
 */
export function Effects() {
  const bar = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLButtonElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const cur = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const RM = reducedMotion();
    const $$ = <T extends Element = HTMLElement>(s: string) => [...document.querySelectorAll<T & Element>(`.mp ${s}`)] as T[];
    const off: (() => void)[] = [];
    const on = <K extends keyof WindowEventMap>(t: Window | Document | HTMLElement, type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      t.addEventListener(type, fn as EventListener, opts);
      off.push(() => t.removeEventListener(type, fn as EventListener, opts));
    };

    // scroll progress and back to top
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      const k = h > 0 ? scrollY / h : 0;
      bar.current?.style.setProperty("--p", String(k));
      if (ring.current) ring.current.style.strokeDashoffset = String(150.8 * (1 - k));
      top.current?.classList.toggle("show", scrollY > 700);
    };
    on(window, "scroll", onScroll, { passive: true });
    onScroll();

    // reveal below-the-fold content, and count up the numbers in it
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.classList.add("in");
          el.classList.remove("pre");
          el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
          io.unobserve(el);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    if (!RM) {
      $$(".rv").forEach((el) => {
        if (el.getBoundingClientRect().top > innerHeight * 0.95) {
          el.classList.add("pre");
          io.observe(el);
        } else el.classList.add("in");
      });
      $$(".trustline [data-count]").forEach(countUp);
    }
    off.push(() => io.disconnect());

    // click ripple on gradient buttons
    on(document, "pointerdown", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>(".mp .cta, .mp #nextBtn, .mp .filters button");
      if (!b || RM) return;
      const r = b.getBoundingClientRect();
      const d = Math.max(r.width, r.height);
      const sp = document.createElement("span");
      sp.className = "ripple";
      sp.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      if (getComputedStyle(b).position === "static") b.style.position = "relative";
      b.style.overflow = "hidden";
      b.appendChild(sp);
      window.setTimeout(() => sp.remove(), 650);
    });

    // spotlight borders follow the pointer (delegated, so new cards work too)
    on(document, "pointermove", (e) => {
      const el = (e.target as HTMLElement).closest?.<HTMLElement>(".mp .spot-b");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    });

    const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
    if (!fine || RM) return () => off.forEach((f) => f());

    // magnetic buttons
    $$(".cta, .btn, .navbtns button, .arrow").forEach((b) => {
      b.classList.add("mag");
      on(b, "pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.transform = `translate(${x * 10}px,${y * 8}px)`;
      });
      on(b, "pointerleave", () => (b.style.transform = ""));
    });

    // 3D tilt with a glare
    $$(".tilt").forEach((el) => {
      const g = document.createElement("span");
      g.className = "glare";
      el.appendChild(g);
      off.push(() => g.remove());
      on(el, "pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.classList.add("hov");
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 7}deg) translateY(-4px)`;
        el.style.setProperty("--mx", x * 100 + "%");
        el.style.setProperty("--my", y * 100 + "%");
      });
      on(el, "pointerleave", () => {
        el.classList.remove("hov");
        el.style.transform = "";
      });
    });

    // hero parallax
    const hero = document.querySelector<HTMLElement>(".mp .hero");
    const layers: [HTMLElement | null, number][] = [
      [document.querySelector(".mp .blob.a"), 30],
      [document.querySelector(".mp .blob.b"), -24],
      ...$$(".tagpin").map((t, i): [HTMLElement, number] => [t, 14 + i * 6]),
      [document.querySelector(".mp .slot-card"), -12],
    ];
    if (hero) {
      on(hero, "pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach(([el, k]) => el && (el.style.translate = `${x * k}px ${y * k}px`));
      });
      on(hero, "pointerleave", () => layers.forEach(([el]) => el && (el.style.translate = "")));
    }

    // custom cursor: a dot, and a ring that eases after it
    const c = cur.current!;
    const d = dot.current!;
    let cx = innerWidth / 2;
    let cy = innerHeight / 2;
    let tx = cx;
    let ty = cy;
    on(
      window,
      "pointermove",
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
        d.style.transform = `translate(${tx}px,${ty}px)`;
        c.classList.add("on");
        d.classList.add("on");
        c.classList.toggle("big", !!(e.target as HTMLElement).closest?.("a,button,.sc,.doc,.spot,input,select,textarea,summary"));
      },
      { passive: true },
    );
    on(document, "pointerleave", () => {
      c.classList.remove("on");
      d.classList.remove("on");
    });
    let raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      c.style.transform = `translate(${cx}px,${cy}px)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    off.push(() => cancelAnimationFrame(raf));

    return () => off.forEach((f) => f());
  }, []);

  return (
    <>
      <div className="progress" ref={bar} aria-hidden="true" />
      <div className="cursor" ref={cur} aria-hidden="true" />
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
      <button
        className="totop"
        ref={top}
        aria-label="Back to top"
        onClick={() => scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" })}
      >
        <svg className="ring" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="24" stroke="#EEEDFF" />
          <circle ref={ring} cx="26" cy="26" r="24" stroke="#6E62F2" strokeDasharray="150.8" strokeDashoffset="150.8" strokeLinecap="round" />
        </svg>
        <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      </button>
    </>
  );
}

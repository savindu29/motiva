// Screenshots of /site for the /concept case study, saved to public/motiva/.
// Drives headless Edge over the DevTools protocol so it can click through the
// booking and the pain map. Needs the dev server running (default :3004).
//
//   node tools/capture/capture.mjs [http://localhost:3004]

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:3004";
const OUT = path.resolve(import.meta.dirname, "../../public/motiva");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 9444;
const PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), "motiva-capture-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.mkdirSync(OUT, { recursive: true });
const edge = spawn(EDGE, [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
  "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars", "--no-first-run", "about:blank",
]);

// --- tiny DevTools client -----------------------------------------------------
let ws, seq = 0;
const waiting = new Map();
const events = [];
async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) {
        ws = new WebSocket(page.webSocketDebuggerUrl);
        await new Promise((r) => ws.addEventListener("open", r, { once: true }));
        ws.addEventListener("message", (m) => {
          const msg = JSON.parse(m.data);
          if (msg.id && waiting.has(msg.id)) {
            const { res, rej } = waiting.get(msg.id);
            waiting.delete(msg.id);
            if (msg.error) rej(new Error(msg.error.message));
            else res(msg.result);
          } else if (msg.method) events.push(msg.method);
        });
        return;
      }
    } catch {}
    await sleep(200);
  }
  throw new Error("Edge didn't start");
}
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = ++seq;
    waiting.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
async function evaluate(expression) {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || expression);
  return r.result.value;
}

// --- page helpers ----------------------------------------------------------------
const HIDE = `nextjs-portal,.totop,.progress,.cursor,.cursor-dot,.toast{display:none!important}`;
async function open(width, height, scale, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  events.length = 0;
  await send("Page.navigate", { url: `${BASE}/site` });
  for (let i = 0; i < 100 && !events.includes("Page.loadEventFired"); i++) await sleep(100);
  await evaluate(`(() => { const s = document.createElement("style"); s.textContent = ${JSON.stringify(HIDE)}; document.head.append(s); })()`);
  await sleep(2500);
}
/** Document-space rect of an element (or the union of several). */
const rect = (sel) =>
  evaluate(`(() => {
    const els = [...document.querySelectorAll(${JSON.stringify(sel)})].filter((e) => e.offsetParent);
    if (!els.length) throw new Error("no element: ${sel}");
    const rs = els.map((e) => e.getBoundingClientRect());
    const x = Math.min(...rs.map((r) => r.left)), y = Math.min(...rs.map((r) => r.top));
    const r = Math.max(...rs.map((r) => r.right)), b = Math.max(...rs.map((r) => r.bottom));
    return { x: x + scrollX, y: y + scrollY, width: r - x, height: b - y };
  })()`);
const scrollTo = (sel, offset = 0) =>
  evaluate(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); scrollTo(0, e.getBoundingClientRect().top + scrollY - ${offset}); })()`);
const click = (sel, text) =>
  evaluate(`(() => {
    const els = [...document.querySelectorAll(${JSON.stringify(sel)})].filter((e) => e.offsetParent);
    const el = ${text ? `els.find((e) => e.textContent.includes(${JSON.stringify(text)}))` : "els[0]"};
    if (!el) throw new Error("nothing to click: ${sel} ${text || ""}");
    el.click();
    return true;
  })()`);
const type = (sel, value) =>
  evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(sel)});
    const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
async function shot(name, clip, pad = 0) {
  const c = { x: Math.max(0, clip.x - pad), y: Math.max(0, clip.y - pad), width: clip.width + pad * 2, height: clip.height + pad * 2, scale: 1 };
  const { data } = await send("Page.captureScreenshot", { format: "jpeg", quality: 88, clip: c, captureBeyondViewport: true });
  fs.writeFileSync(path.join(OUT, `${name}.jpg`), Buffer.from(data, "base64"));
  console.log("saved", name, Math.round(c.width), "x", Math.round(c.height));
}
async function waitFor(expr, ms = 20000) {
  for (let t = 0; t < ms; t += 250) {
    if (await evaluate(expr)) return true;
    await sleep(250);
  }
  console.warn("timed out waiting for", expr);
  return false;
}
const hideNav = (on) => evaluate(`document.querySelector(".mp .top").style.visibility = ${on ? '"hidden"' : '""'}`);

/** Walk the booking to step 3 (date & time). */
async function bookToTime() {
  await scrollTo(".bmain", 120);
  await click(".opt", "Sports injury rehab");
  await click("#nextBtn");
  await click(".opt.th", "Nadeesha Perera");
  await click("#nextBtn");
  await sleep(300);
  await click(".slot:not(:disabled)");
  await sleep(400);
}
async function bookToDetails() {
  await click("#nextBtn");
  await sleep(300);
  await type("#f-name", "Ishara Wijesinghe");
  await type("#f-phone", "077 123 4567");
  await type("#f-email", "you@example.com");
  await sleep(300);
}
async function bookConfirm() {
  await click("#nextBtn");
  await sleep(500);
}

// --- run -------------------------------------------------------------------------
try {
  await connect();
  await send("Page.enable");
  await send("Runtime.enable");

  /* desktop */
  await open(1440, 900, 1, false);
  await waitFor(`!!document.querySelector(".hero-r .photo img")?.complete`);
  await shot("01-hero", { x: 0, y: 0, width: 1440, height: 900 });
  await hideNav(true);

  await scrollTo("#services .svc", 200);
  await shot("02-services", await rect("#services .svc"), 24);

  await scrollTo("#experts .rail", 200);
  await sleep(800);
  const doc = await rect(".rail .doc:first-child");
  const vy = await evaluate("scrollY");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: doc.x + doc.width / 2, y: doc.y - vy + doc.height / 2 });
  await sleep(500);
  await shot("03-physio-card", doc);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
  await shot("04-physios", await rect("#experts .filters, #experts .rail, #experts .rail-nav"), 20);

  await scrollTo(".pk-grid", 200);
  await sleep(800);
  await shot("05-package", await rect(".pk-grid .pk:first-child"));

  // pain map: the 3D body renders only while on screen
  await scrollTo(".map", 60);
  await waitFor(`!!document.querySelector(".hb.is-ready")`);
  await waitFor(`!!document.querySelector(".area-img.has-xr")`, 30000);
  for (const [name, chip] of [["06-painmap-neck", "Neck"], ["07-painmap-lowback", "Lower back"], ["08-painmap-shoulder", "Shoulder"], ["09-painmap-knee", "Knee"]]) {
    await click(".chip", chip);
    await sleep(2600); // the body turns, the X-ray strip swaps
    await waitFor(`!!document.querySelector(".area-img.has-xr")`, 10000);
    await shot(name, await rect(".map"), 16);
  }
  // front / back of the same crop, near-square (the slider's frame is 1.1:1)
  const stage = await rect(".map-stage");
  const body = await rect(".map-body");
  const h = Math.round(stage.width / 1.1);
  const crop = { x: stage.x, y: Math.max(stage.y, body.y + body.height / 2 - h / 2), width: stage.width, height: h };
  await click(".seg button", "Front");
  await sleep(2600);
  await shot("10-bodymap-front", crop);
  await click(".seg button", "Back");
  await sleep(2800);
  await shot("11-bodymap-back", crop);
  await click(".seg button", "Front");
  // show the X-ray render at the detail frame's near-square shape, then restore it
  await evaluate(`(() => { const e = document.querySelector(".area-img"); e.style.height = Math.round(e.offsetWidth / 1.1) + "px"; })()`);
  await sleep(800);
  await shot("12-xray-render", await rect(".area-img"));
  await evaluate(`document.querySelector(".area-img").style.height = ""`);

  // booking
  await bookToTime();
  await shot("13-booking-time", await rect(".bmain"), 12);
  await bookToDetails();
  await shot("15-booking-details", await rect(".bmain"), 12);
  await bookConfirm();
  await shot("14-booking-done", await rect(".bmain"), 12);

  await scrollTo(".faq", 200);
  await shot("16-faq", await rect(".faq"), 20);

  /* phone */
  await open(390, 844, 2, true);
  const phone = async (name) => shot(name, { x: 0, y: await evaluate("scrollY"), width: 390, height: 780 });
  await waitFor(`!!document.querySelector(".hero-r .photo img")?.complete`);
  await phone("17-mobile");
  await scrollTo("#services .head", 90);
  await sleep(600);
  await phone("18-mobile");
  await scrollTo(".map-stage", 96);
  await waitFor(`!!document.querySelector(".hb.is-ready")`);
  await click(".chip", "Shoulder");
  await sleep(2600);
  await phone("19-mobile");
  await bookToTime();
  await scrollTo(".days", 190);
  await sleep(300);
  await phone("20-mobile");
  await bookToDetails();
  await bookConfirm();
  await scrollTo(".bmain", 104);
  await sleep(300);
  await phone("21-mobile");
} catch (e) {
  console.error("capture failed:", e.message);
  process.exitCode = 1;
} finally {
  ws?.close();
  edge.kill();
  await sleep(500);
  fs.rmSync(PROFILE, { recursive: true, force: true });
}

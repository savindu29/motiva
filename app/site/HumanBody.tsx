"use client";

/* A realistic 3D body (public/site/human.glb, made from the 3ds Max export)
   with glowing hotspots pinned to its bones. Drag to turn it. It only
   renders while it's on screen. */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { reducedMotion } from "./SiteProvider";

export type Hotspot = {
  id: string;
  /** Bone name without the "CC_Base_" prefix, e.g. "L_Calf". */
  bone: string;
  /** Blend towards a second bone, e.g. mid-thigh. */
  to?: string;
  t?: number;
  /** Which side of the body the point is on. */
  side: "front" | "back" | "both";
  label: string;
};

const MODEL_URL = "/site/human.glb";
let modelPromise: Promise<THREE.Group> | null = null;
const loadModel = () => (modelPromise ??= new GLTFLoader().loadAsync(MODEL_URL).then((g) => g.scene));

/** Relax the arms out of the T-pose. */
function relax(root: THREE.Object3D) {
  const bone = (n: string) => root.getObjectByName("CC_Base_" + n);
  const l = bone("L_Upperarm");
  const r = bone("R_Upperarm");
  if (l) l.rotateZ(-0.92);
  if (r) r.rotateZ(0.92);
}

export function HumanBody({
  hotspots = [],
  active,
  onSelect,
  facing = "front",
  turnId = 0,
  fallback,
  className = "",
}: {
  hotspots?: Hotspot[];
  active?: string;
  onSelect?: (id: string) => void;
  /** Turn to show the front or back. */
  facing?: "front" | "back";
  /** Change this to turn back to `facing` after the visitor has dragged. */
  turnId?: number;
  /** Shown instead when WebGL isn't available. */
  fallback?: React.ReactNode;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const canvasBox = useRef<HTMLDivElement>(null);
  const pins = useRef<(HTMLButtonElement | null)[]>([]);
  const target = useRef(0);
  const ang = useRef(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // keep the latest hotspots where the render loop can read them
  const live = useRef(hotspots);
  useEffect(() => {
    live.current = hotspots;
  });

  // turn the short way round to the chosen side
  useEffect(() => {
    const base = facing === "back" ? Math.PI : 0;
    const k = Math.round((ang.current - base) / (Math.PI * 2));
    target.current = base + k * Math.PI * 2;
  }, [facing, turnId]);

  useEffect(() => {
    const el = host.current!;
    const box = canvasBox.current!;
    let disposed = false;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      queueMicrotask(() => setFailed(true)); // no WebGL: show the fallback
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    box.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 50);

    // studio light: warm key, cool fill, and purple and cyan rims in the brand colours
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d4ff, 0.9));
    const key = new THREE.DirectionalLight(0xfff4ea, 1.6);
    key.position.set(1.5, 2.6, 2.4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xcae5ff, 0.6);
    fill.position.set(-2.5, 1.2, 1.5);
    scene.add(fill);
    const rimP = new THREE.DirectionalLight(0x928afd, 1.5);
    rimP.position.set(-2, 1.8, -2.5);
    scene.add(rimP);
    const rimC = new THREE.DirectionalLight(0x5cc8ff, 1.1);
    rimC.position.set(2.2, 1, -2);
    scene.add(rimC);

    // a soft contact shadow under the feet
    const sh = document.createElement("canvas");
    sh.width = sh.height = 128;
    const g = sh.getContext("2d")!;
    const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    rg.addColorStop(0, "rgba(46,38,120,.35)");
    rg.addColorStop(1, "rgba(46,38,120,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.002;
    scene.add(shadow);

    const turn = new THREE.Group();
    scene.add(turn);
    /** Every node by name (the arm and leg joints aren't skin bones in this rig). */
    let nodes: Record<string, THREE.Object3D> = {};
    let bones: THREE.Object3D[] = [];
    let angle = target.current;
    let vel = 0;
    let dragging = false;
    let lastX = 0;
    let visible = false;
    let raf = 0;
    const t0 = performance.now();
    const RM = reducedMotion();

    loadModel()
      .then((src) => {
        if (disposed) return;
        const body = cloneSkinned(src);
        body.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) m.frustumCulled = false;
          nodes[o.name.replace("CC_Base_", "")] ??= o;
          if ((o as THREE.Bone).isBone) bones.push(o);
        });
        // 3ds Max is Z-up; three.js is Y-up
        body.rotation.x = -Math.PI / 2;
        relax(body);
        body.updateMatrixWorld(true);
        // size it from the skeleton (a skinned mesh's box ignores the bones):
        // 1.8 m tall, standing on the floor, centred on the hips
        const p = new THREE.Vector3();
        const lo = new THREE.Vector3(Infinity, Infinity, Infinity);
        const hi = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        bones.forEach((bn) => {
          bn.getWorldPosition(p);
          lo.min(p);
          hi.max(p);
        });
        const s = 1.8 / ((hi.y - lo.y) * 1.07);
        body.scale.multiplyScalar(s);
        body.updateMatrixWorld(true);
        const hip = nodes.Pelvis.getWorldPosition(new THREE.Vector3());
        let floor = Infinity;
        bones.forEach((bn) => (floor = Math.min(floor, bn.getWorldPosition(p).y)));
        body.position.set(-hip.x, -floor + 0.01, -hip.z);
        turn.add(body);
        body.updateMatrixWorld(true);
        setReady(true);
      })
      .catch(() => setFailed(true));

    cam.position.set(0, 1.0, 4.3);
    cam.lookAt(0, 0.92, 0);
    const resize = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);

    const v = new THREE.Vector3();
    const v2 = new THREE.Vector3();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const hs = live.current;
      // ease towards the chosen side, or glide on after a drag
      if (!dragging) {
        angle += vel;
        vel *= 0.94;
        if (Math.abs(vel) < 0.0005) angle += (target.current - angle) * 0.06;
        else target.current = angle;
      }
      turn.rotation.y = angle;
      ang.current = angle;
      if (!RM) turn.position.y = Math.sin((now - t0) / 1400) * 0.008;
      renderer.render(scene, cam);

      // pin the hotspots to their bones
      const w = box.clientWidth;
      const h = box.clientHeight;
      const facingBack = Math.cos(angle) < 0;
      hs.forEach((p, i) => {
        const pin = pins.current[i];
        const bn = nodes[p.bone];
        if (!pin || !bn) return;
        bn.getWorldPosition(v);
        if (p.to && nodes[p.to]) v.lerp(nodes[p.to].getWorldPosition(v2), p.t ?? 0.5);
        v.project(cam);
        const show = p.side === "both" || (p.side === "back") === facingBack;
        pin.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`;
        pin.style.opacity = show ? "1" : "0";
        pin.style.pointerEvents = show ? "auto" : "none";
        pin.tabIndex = show ? 0 : -1;
      });
    };
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);

    // drag to turn
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest(".hb-pin")) return;
      dragging = true;
      lastX = e.clientX;
      vel = 0;
      box.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const d = (e.clientX - lastX) * 0.012;
      lastX = e.clientX;
      angle += d;
      vel = d;
      target.current = angle;
    };
    const up = () => (dragging = false);
    box.addEventListener("pointerdown", down);
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerup", up);
    box.addEventListener("pointercancel", up);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      box.removeEventListener("pointerdown", down);
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerup", up);
      box.removeEventListener("pointercancel", up);
      renderer.dispose();
      renderer.domElement.remove();
      nodes = {};
      bones = [];
    };
  }, []);

  return (
    <div ref={host} className={`hb ${ready ? "is-ready" : ""} ${failed ? "is-failed" : ""} ${className}`}>
      <div ref={canvasBox} className="hb-canvas" aria-hidden="true" />
      {!ready && !failed && <span className="hb-loading">Loading 3D body…</span>}
      {failed && fallback}
      {!failed && hotspots.map((p, i) => (
        <button
          key={p.id + i}
          ref={(b) => {
            pins.current[i] = b;
          }}
          type="button"
          className={`hb-pin${p.id === active ? " on" : ""}`}
          aria-label={p.label}
          aria-pressed={onSelect ? p.id === active : undefined}
          onClick={() => onSelect?.(p.id)}
        >
          <i />
        </button>
      ))}
    </div>
  );
}

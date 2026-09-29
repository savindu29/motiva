"use client";

/* X-ray 3D renders: one WebGL renderer draws a few still images, which the
   page then shows in place of photos. A rigged body (public/site/body.glb) is
   posed, a skeleton is built from code around its bones, and each view marks
   the painful joint. The pulsing glow over it is CSS (see Photo.tsx). */

import { useSyncExternalStore } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { XrayKey } from "./data";

export type Pain = { x: number; y: number; r: number; op: number };
export type Render = { u: string; p: Pain[]; w: number; h: number };

const W = 1000;
const H = 760;
const MODEL_URL = "/site/body.glb";

type Engine = { render: (name: XrayKey) => Render };

function createEngine(gltf: { scene: THREE.Group; animations: THREE.AnimationClip[] }): Engine {
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const UP = V3(0, 1, 0);
  const B: Record<string, THREE.Object3D> = {};

  function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d")!, w, h);
    return new THREE.CanvasTexture(c);
  }

  /* materials */
  const skin = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: { uA: { value: 1 } },
    vertexShader: `#include <common>
#include <skinning_pars_vertex>
varying vec3 vN; varying vec3 vV; varying vec3 vW;
void main(){
  #include <beginnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>
  vec4 w=modelMatrix*vec4(transformed,1.); vW=w.xyz; vN=normalize(mat3(modelMatrix)*objectNormal); vV=normalize(cameraPosition-w.xyz); gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform float uA; varying vec3 vN; varying vec3 vV; varying vec3 vW;
void main(){ vec3 n=normalize(vN); float ndv=clamp(dot(n,vV),0.,1.); float f=1.-ndv;
  vec3 L=normalize(vec3(-.4,.8,.6)); float sp=pow(max(dot(n,normalize(L+vV)),0.),50.);
  vec3 c=mix(vec3(.97,.98,1.),vec3(.52,.57,.66),smoothstep(.2,1.,f)); c+=vec3(1.)*sp*.5;
  float a=(.05+.62*pow(f,2.2)+sp*.35)*uA;
  gl_FragColor=vec4(c,clamp(a,0.,1.)); }`,
  });
  const HOT = { p: [V3(), V3(), V3(), V3()], r: [0, 0, 0, 0] };
  const boneMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uHot: { value: HOT.p }, uHotR: { value: HOT.r }, uTint: { value: new THREE.Color(0.9, 0.91, 0.93) }, uOp: { value: 1 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal); vV=normalize(cameraPosition-w.xyz); gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform vec3 uHot[4]; uniform float uHotR[4]; uniform vec3 uTint; uniform float uOp; varying vec3 vN; varying vec3 vV; varying vec3 vW;
void main(){ vec3 n=normalize(vN); float ndv=abs(dot(n,vV)); float f=pow(1.-ndv,1.5);
  float heat=0.; for(int i=0;i<4;i++){ float d=distance(vW,uHot[i]); heat+=exp(-d*d/max(uHotR[i],1e-6)); } heat=clamp(heat,0.,1.);
  vec3 L=normalize(vec3(-.35,.8,.55)); float dif=max(dot(n,L),0.); float amb=.55+.25*n.y; float sp=pow(max(dot(n,normalize(L+vV)),0.),30.);
  vec3 cold=uTint*(.74+dif*.24+amb*.06)+vec3(1.)*sp*.3; cold=mix(cold,uTint*.62,f*.5);
  vec3 hot=mix(vec3(.95,.28,.12),vec3(1.,.72,.45),dif*.6+sp)*(.75+dif*.3);
  vec3 c=mix(cold,hot,smoothstep(.08,.85,heat));
  gl_FragColor=vec4(c,(.9+heat*.1)*uOp); }`,
  });
  const discMat = boneMat.clone();
  discMat.uniforms = { uHot: { value: HOT.p }, uHotR: { value: HOT.r }, uTint: { value: new THREE.Color(0.72, 0.76, 0.84) }, uOp: { value: 0.9 } };

  const fiberTex = canvasTex(512, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#8E1E10");
    gr.addColorStop(0.5, "#E0582A");
    gr.addColorStop(1, "#8E1E10");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) {
      g.strokeStyle = `rgba(255,${(170 + Math.random() * 60) | 0},${(120 + Math.random() * 60) | 0},${0.12 + Math.random() * 0.22})`;
      g.lineWidth = 1 + Math.random() * 1.2;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + y) * 1.5);
      g.stroke();
    }
  });
  fiberTex.wrapS = fiberTex.wrapT = THREE.RepeatWrapping;
  fiberTex.encoding = THREE.sRGBEncoding;

  const R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
  R.setClearColor(0xffffff, 0);
  R.setPixelRatio(1);
  R.setSize(W, H, false);
  R.outputEncoding = THREE.sRGBEncoding;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(36, W / H, 0.02, 20);
  scene.add(new THREE.HemisphereLight(0xbfd6ff, 0x301008, 0.9));
  const d1 = new THREE.DirectionalLight(0xffffff, 1.4);
  d1.position.set(1, 2, -2);
  scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x9fc0ff, 0.8);
  d2.position.set(-1, 1, 2);
  scene.add(d2);
  const fx = new THREE.Group();
  scene.add(fx);

  /* the body */
  const model = gltf.scene;
  scene.add(model);
  model.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      if (/Joints/.test(m.name)) m.visible = false;
      m.material = skin;
      m.frustumCulled = false;
      m.renderOrder = 3;
    }
    if ((o as THREE.Bone).isBone) B[o.name.replace("mixamorig", "")] = o;
  });
  model.updateMatrixWorld(true);
  {
    const t = V3();
    const f = V3();
    B.HeadTop_End.getWorldPosition(t);
    B.LeftToe_End.getWorldPosition(f);
    model.scale.multiplyScalar(1.8 / (t.y - Math.min(0, f.y)));
    model.updateMatrixWorld(true);
    B.LeftToe_End.getWorldPosition(f);
    model.position.y -= f.y - 0.02;
  }
  const mixer = new THREE.AnimationMixer(model);
  mixer.clipAction(gltf.animations[0]).play();
  mixer.setTime(1.2);
  model.updateMatrixWorld(true);

  function clearFx() {
    while (fx.children.length) {
      const o = fx.children.pop() as THREE.Mesh;
      o.geometry?.dispose();
    }
  }
  const add = <T extends THREE.Object3D>(m: T, ro = 1) => {
    m.renderOrder = ro;
    fx.add(m);
    return m;
  };
  function wp(name: string, off?: THREE.Vector3) {
    const v = V3();
    B[name].getWorldPosition(v);
    if (off) v.add(off);
    return v;
  }
  function orient(m: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3) {
    const d = b.clone().sub(a);
    m.position.copy(a);
    m.quaternion.setFromUnitVectors(UP, d.clone().normalize());
  }

  /* anatomy helpers */
  function longBone(a: THREE.Vector3, b: THREE.Vector3, rEnd: number, rShaft: number, capA = 1.25, capB = 1.25, mat: THREE.Material = boneMat) {
    const L = a.distanceTo(b);
    const prof = [[0, 0.001], [rEnd * capA * 0.7, 0.004], [rEnd * capA, 0.03], [rEnd, 0.09], [rShaft * 1.1, 0.2], [rShaft, 0.35], [rShaft * 0.95, 0.55], [rShaft * 1.05, 0.75], [rEnd, 0.9], [rEnd * capB, 0.96], [rEnd * capB * 0.7, 0.995], [0.001, 1]].map((p) => new THREE.Vector2(p[0], p[1] * L));
    const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 24), mat);
    orient(m, a, b);
    return add(m);
  }
  function blob(p: THREE.Vector3, r: number, s: [number, number, number] = [1, 1, 1], mat: THREE.Material = boneMat) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), mat);
    m.position.copy(p);
    m.scale.set(...s);
    return add(m);
  }
  function tube(pts: THREE.Vector3[], r: number, mat: THREE.Material = boneMat, seg = 40) {
    return add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, 8, false), mat));
  }
  /** A spindle-shaped muscle along a curve. */
  function spindle(pts: THREE.Vector3[], rMax: number, mat: THREE.Material, flat = 1) {
    const c = new THREE.CatmullRomCurve3(pts);
    const N = 48;
    const M = 16;
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    const fr = c.computeFrenetFrames(N, false);
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const p = c.getPointAt(t);
      const r = rMax * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, t * 0.96 + 0.02))), 0.7);
      for (let j = 0; j <= M; j++) {
        const a = (j / M) * Math.PI * 2;
        const v = fr.normals[i].clone().multiplyScalar(Math.cos(a) * r).add(fr.binormals[i].clone().multiplyScalar(Math.sin(a) * r * flat));
        pos.push(p.x + v.x, p.y + v.y, p.z + v.z);
        uv.push(t, j / M);
      }
    }
    for (let i = 0; i < N; i++)
      for (let j = 0; j < M; j++) {
        const a = i * (M + 1) + j;
        const b = a + M + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return add(new THREE.Mesh(g, mat), 0);
  }
  const muscleMat = () => {
    const t = fiberTex.clone();
    t.needsUpdate = true;
    t.repeat.set(1, 3);
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, metalness: 0, emissive: 0x3a0a02, emissiveIntensity: 0.8 });
  };

  function vertebra(p: THREE.Vector3, tan: THREE.Vector3, s: number) {
    const q = new THREE.Quaternion().setFromUnitVectors(UP, tan);
    const bodyProf = [[0, 0], [0.95, 0], [1, 0.12], [0.92, 0.5], [1, 0.88], [0.95, 1], [0, 1]].map((v) => new THREE.Vector2(v[0] * 0.016 * s, (v[1] - 0.5) * 0.014 * s));
    const body = add(new THREE.Mesh(new THREE.LatheGeometry(bodyProf, 18), boneMat));
    body.position.copy(p);
    body.quaternion.copy(q);
    body.scale.set(1, 1, 0.8);
    const back = V3(0, 0, -1).applyQuaternion(q);
    // arch, spinous and transverse processes
    const sp = add(new THREE.Mesh(new THREE.ConeGeometry(0.005 * s, 0.03 * s, 6), boneMat));
    sp.position.copy(p).addScaledVector(back, 0.03 * s).add(V3(0, -0.008 * s, 0));
    sp.quaternion.copy(q);
    sp.rotateX(-Math.PI / 2 - 0.7);
    [-1, 1].forEach((k) => {
      const tr = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.0035 * s, 0.018 * s, 3, 6), boneMat));
      const side = V3(k, 0, 0).applyQuaternion(q);
      tr.position.copy(p).addScaledVector(back, 0.014 * s).addScaledVector(side, 0.019 * s);
      tr.quaternion.copy(q);
      tr.rotateZ(Math.PI / 2 + k * 0.25);
    });
    const arch = add(new THREE.Mesh(new THREE.TorusGeometry(0.009 * s, 0.0028 * s, 6, 14, Math.PI), boneMat));
    arch.position.copy(p).addScaledVector(back, 0.012 * s);
    arch.quaternion.copy(q);
    arch.rotateX(Math.PI / 2);
    arch.rotateZ(Math.PI);
  }
  function spine() {
    const pts = [wp("Hips", V3(0, -0.03, -0.05)), wp("Spine", V3(0, 0, -0.055)), wp("Spine1", V3(0, 0, -0.07)), wp("Spine2", V3(0, 0.02, -0.075)), wp("Neck", V3(0, 0, -0.035)), wp("Head", V3(0, -0.03, -0.015))];
    const c = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const N = 24;
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < N; i++) {
      const t = (i / (N - 1)) * 0.97 + 0.015;
      const p = c.getPointAt(t);
      const tan = c.getTangentAt(t);
      const s = i < 5 ? 1.35 - i * 0.03 : i < 17 ? 1.12 - (i - 5) * 0.02 : 0.8 - (i - 17) * 0.03;
      vertebra(p, tan, s);
      if (i < N - 1) {
        const q = c.getPointAt(t + (0.5 / (N - 1)) * 0.97);
        const d = add(new THREE.Mesh(new THREE.CylinderGeometry(0.013 * s, 0.013 * s, 0.004 * s, 16), discMat));
        d.position.copy(q);
        d.quaternion.setFromUnitVectors(UP, tan);
      }
      out.push(p);
    }
    // sacrum and coccyx
    const sac = add(new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.1, 5, 1), boneMat));
    sac.position.copy(pts[0]).add(V3(0, -0.06, 0));
    sac.rotation.set(Math.PI + 0.35, 0, 0);
    sac.scale.set(1, 1, 0.45);
    return { curve: c, pts: out };
  }
  function ribs() {
    const top = wp("Spine2", V3(0, 0.06, -0.075));
    const bot = wp("Spine1", V3(0, -0.06, -0.07));
    for (let i = 0; i < 11; i++) {
      const o = top.clone().lerp(bot, i / 10);
      const w = 0.07 + Math.sin(Math.min(1, (i + 1.5) / 9) * Math.PI * 0.55) * 0.075;
      const d = 0.1 + Math.sin(Math.min(1, (i + 1) / 8) * Math.PI * 0.5) * 0.05;
      [-1, 1].forEach((k) => {
        const pts: THREE.Vector3[] = [];
        for (let j = 0; j <= 12; j++) {
          const a = (j / 12) * Math.PI * (i > 8 ? 0.62 : 0.9);
          pts.push(o.clone().add(V3(k * Math.sin(a) * w, -a * 0.035 - (1 - Math.cos(a)) * 0.012, -0.005 + (1 - Math.cos(a)) * d * 0.95)));
        }
        tube(pts, 0.0042, boneMat, 24);
      });
    }
    // sternum
    longBone(wp("Spine1", V3(0, 0.03, 0.12)), wp("Spine2", V3(0, 0.05, 0.1)), 0.012, 0.009, 1, 1);
  }
  function pelvis() {
    const h = wp("Hips", V3(0, -0.02, -0.01));
    [-1, 1].forEach((k) => {
      const m = add(new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 16, 0, Math.PI * 1.1, 0, Math.PI * 0.5), boneMat));
      m.position.copy(h).add(V3(k * 0.075, 0.02, 0));
      m.rotation.set(-0.2, k > 0 ? -0.8 : Math.PI * 1.2 - 0.4, k * 0.35);
      m.scale.set(1, 1.1, 0.55);
      blob(h.clone().add(V3(k * 0.1, -0.075, 0.02)), 0.03); // acetabulum
      tube([h.clone().add(V3(k * 0.1, -0.09, 0.03)), h.clone().add(V3(k * 0.05, -0.13, 0.06)), h.clone().add(V3(0, -0.12, 0.07))], 0.012);
    });
  }
  function leg(S: "Left" | "Right", detail = false) {
    const hip = wp(S + "UpLeg");
    const knee = wp(S + "Leg");
    const ank = wp(S + "Foot");
    const toe = wp(S + "ToeBase");
    const k = S === "Left" ? 1 : -1;
    blob(hip.clone().add(V3(0, 0.005, 0)), 0.026); // femoral head
    longBone(hip.clone().add(V3(0, -0.02, 0)), knee.clone().add(V3(0, 0.028, 0)), 0.022, 0.013, 1.1, 1.25);
    // knee joint: condyles, patella, tibial plateau
    blob(knee.clone().add(V3(k * 0.012, 0.022, -0.004)), 0.02, [1, 1, 1.25]);
    blob(knee.clone().add(V3(-k * 0.012, 0.022, -0.004)), 0.02, [1, 1, 1.25]);
    blob(knee.clone().add(V3(0, 0.022, 0.04)), 0.016, [1, 1.25, 0.55]);
    const plat = add(new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.012, 24), boneMat));
    plat.position.copy(knee).add(V3(0, -0.004, 0));
    if (detail) {
      const men = add(new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.004, 8, 30), discMat));
      men.position.copy(knee).add(V3(0, 0.004, 0));
      men.rotation.x = Math.PI / 2;
      tube([knee.clone().add(V3(-k * 0.02, 0.045, 0.005)), knee.clone(), knee.clone().add(V3(k * 0.015, -0.03, -0.005))], 0.0035, discMat);
      tube([knee.clone().add(V3(0, 0.01, 0.05)), knee.clone().add(V3(0, -0.03, 0.035)), knee.clone().add(V3(0, -0.06, 0.025))], 0.004, discMat);
    }
    longBone(knee.clone().add(V3(0, -0.01, 0)), ank.clone().add(V3(0, 0.018, 0)), 0.024, 0.011, 1.1, 1.1); // tibia
    longBone(knee.clone().add(V3(k * 0.028, -0.03, -0.01)), ank.clone().add(V3(k * 0.03, 0, -0.008)), 0.007, 0.0045, 1, 1.2); // fibula
    // foot
    blob(ank.clone().add(V3(0, -0.005, -0.005)), 0.02, [1.1, 0.9, 1.3]);
    blob(ank.clone().add(V3(0, -0.03, -0.035)), 0.022, [0.9, 0.8, 1.2]);
    for (let i = 0; i < 5; i++) {
      const off = (i - 2) * 0.012 * k;
      longBone(ank.clone().add(V3(off * 0.5, -0.02, 0.01)), toe.clone().add(V3(off, -0.005, 0)), 0.006, 0.0035, 1, 1.2);
    }
  }
  function arm(S: "Left" | "Right") {
    const sh = wp(S + "Arm");
    const el = wp(S + "ForeArm");
    const wr = wp(S + "Hand");
    const k = S === "Left" ? 1 : -1;
    blob(sh, 0.024);
    longBone(sh, el.clone().add(V3(0, 0.01, 0)), 0.018, 0.01, 1.2, 1.3);
    longBone(el, wr, 0.009, 0.006, 1.3, 1.4);
    longBone(el.clone().add(V3(0, 0, 0.012)), wr.clone().add(V3(0, 0, 0.014)), 0.008, 0.005, 1.1, 1.5);
    // clavicle and scapula
    const nk = wp("Neck", V3(0, -0.03, 0.03));
    tube([nk.clone().add(V3(k * 0.02, 0, 0)), nk.clone().lerp(sh, 0.5).add(V3(0, 0.01, 0.02)), sh.clone().add(V3(-k * 0.02, 0.02, 0))], 0.006);
    const sc = new THREE.Shape();
    sc.moveTo(0, 0);
    sc.lineTo(-k * 0.09, -0.02);
    sc.lineTo(-k * 0.06, -0.16);
    sc.quadraticCurveTo(-k * 0.02, -0.08, 0, 0);
    const m = add(new THREE.Mesh(new THREE.ExtrudeGeometry(sc, { depth: 0.004, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.003, bevelSegments: 2 }), boneMat));
    m.position.copy(sh).add(V3(-k * 0.02, 0.01, -0.07));
    m.rotation.y = k * 0.3;
  }
  function skull() {
    const h = wp("Head", V3(0, 0.06, 0));
    blob(h, 0.085, [1, 1.1, 1.15]);
    blob(h.clone().add(V3(0, -0.08, 0.045)), 0.05, [1, 0.55, 0.9]);
  }

  /* pain markers: projected to the image, drawn by CSS */
  let pains: Pain[] = [];
  function glow(p: THREE.Vector3, s: number, op = 1) {
    const n = p.clone().project(cam);
    if (n.z > 1) return;
    const rt = V3(1, 0, 0).applyQuaternion(cam.quaternion).multiplyScalar(s / 2);
    const e = p.clone().add(rt).project(cam);
    pains.push({ x: (n.x + 1) / 2, y: (1 - n.y) / 2, r: Math.abs(e.x - n.x) / 2, op });
  }
  function hot(list: [THREE.Vector3, number][]) {
    for (let i = 0; i < 4; i++) {
      HOT.p[i].copy(list[i] ? list[i][0] : V3(99, 99, 99));
      HOT.r[i] = list[i] ? list[i][1] : 0;
    }
  }

  type View = { t: () => THREE.Vector3; az: number; el: number; dist: number; fov: number; build: () => void };
  const VIEWS: Record<XrayKey, View> = {
    spine: { t: () => wp("Spine1", V3(0, 0.02, 0)), az: Math.PI, el: 0.04, dist: 1.45, fov: 36, build() {
      skull(); ribs(); pelvis(); const s = spine(); arm("Left"); arm("Right");
      const n = s.pts[20], l = s.pts[2]; hot([[n, 0.0025], [l, 0.004]]); glow(n, 0.26); glow(l, 0.34);
    } },
    neck: { t: () => wp("Neck", V3(0, -0.02, 0)), az: Math.PI * 0.82, el: 0.1, dist: 0.8, fov: 36, build() {
      skull(); ribs(); const s = spine(); arm("Left"); arm("Right"); const n = s.pts[20]; hot([[n, 0.003]]); glow(n, 0.24);
    } },
    shoulder: { t: () => wp("LeftShoulder", V3(0.06, -0.06, 0)), az: Math.PI * 0.78, el: 0.1, dist: 0.82, fov: 36, build() {
      ribs(); spine(); arm("Left"); arm("Right");
      const mm = muscleMat(); const sh = wp("LeftArm"), el = wp("LeftForeArm"), nk = wp("Neck"), s2 = wp("Spine2"), s1 = wp("Spine1");
      const acr = sh.clone().add(V3(-0.015, 0.03, -0.01)), tub = sh.clone().lerp(el, 0.42);
      for (let i = 0; i < 5; i++) { const a = (i - 2) / 2; spindle([acr.clone().add(V3(-0.02 * Math.abs(a), 0, a * 0.045)), sh.clone().add(V3(0.035, -0.01 + Math.abs(a) * -0.004, a * 0.04)), sh.clone().lerp(tub, 0.6).add(V3(0.02, 0, a * 0.02)), tub], 0.017, mm, 0.75); }
      for (let i = 0; i < 4; i++) { const o = nk.clone().add(V3(0, -0.01 - i * 0.03, -0.045)); spindle([o, o.clone().lerp(acr, 0.5).add(V3(0, 0.02 - i * 0.01, -0.02)), acr.clone().add(V3(-0.01, -i * 0.008, -0.02))], 0.016, mm, 0.55); }
      for (let i = 0; i < 4; i++) { const o = s1.clone().lerp(s2, 0.4 + i * 0.18).add(V3(0.05, 0, -0.09)); spindle([o, o.clone().lerp(sh, 0.5).add(V3(0, -0.01, -0.03)), sh.clone().add(V3(-0.01, -0.01 - i * 0.006, -0.035))], 0.015, mm, 0.5); }
      hot([[sh, 0.003]]); glow(sh.clone().add(V3(0.01, 0, -0.05)), 0.2, 0.55);
    } },
    knee: { t: () => wp("LeftLeg", V3(0, 0.02, 0)), az: Math.PI / 2 + 0.12, el: 0.06, dist: 0.62, fov: 36, build() {
      leg("Left", true); leg("Right"); const k = wp("LeftLeg", V3(0, 0.01, 0.01)); hot([[k, 0.0018]]); glow(k, 0.24);
    } },
    ankle: { t: () => wp("LeftFoot", V3(0, -0.01, 0.04)), az: Math.PI / 2 + 0.3, el: 0.14, dist: 0.55, fov: 38, build() {
      leg("Left"); leg("Right"); const a = wp("LeftFoot", V3(0, -0.01, 0)); hot([[a, 0.0015]]); glow(a, 0.18);
    } },
    elbow: { t: () => wp("LeftForeArm", V3(0, -0.02, 0)), az: 0.75, el: 0.08, dist: 0.72, fov: 36, build() {
      arm("Left"); arm("Right"); ribs(); spine(); const e = wp("LeftForeArm"); hot([[e, 0.0018]]); glow(e, 0.18);
    } },
    ham: { t: () => wp("LeftUpLeg", V3(0, -0.2, 0)), az: Math.PI * 0.9, el: 0.05, dist: 1.0, fov: 36, build() {
      pelvis(); spine(); leg("Left"); leg("Right"); const mm = muscleMat(); const hp = wp("LeftUpLeg", V3(0, -0.04, -0.05)), kn = wp("LeftLeg", V3(0, 0.05, -0.04));
      for (let i = 0; i < 3; i++) { const o = (i - 1) * 0.03; spindle([hp.clone().add(V3(o * 0.5, 0, 0)), hp.clone().lerp(kn, 0.5).add(V3(o, 0, -0.035)), kn.clone().add(V3(o * 1.3, 0, 0))], 0.028, mm, 0.7); }
      const c = hp.clone().lerp(kn, 0.45).add(V3(0, 0, -0.06)); hot([[c, 0.003]]); glow(c, 0.22, 0.6);
    } },
    hip: { t: () => wp("Hips", V3(0, -0.04, 0)), az: 0.4, el: 0.08, dist: 1.0, fov: 36, build() {
      pelvis(); spine(); leg("Left"); leg("Right"); const h = wp("RightUpLeg"); hot([[h, 0.0025]]); glow(h, 0.24);
    } },
  };

  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const octx = out.getContext("2d")!;

  function render(name: XrayKey): Render {
    const v = VIEWS[name];
    clearFx();
    pains = [];
    mixer.setTime(1.2);
    model.updateMatrixWorld(true);
    const T = v.t();
    cam.fov = v.fov;
    cam.aspect = W / H;
    cam.position.set(T.x + Math.sin(v.az) * Math.cos(v.el) * v.dist, T.y + Math.sin(v.el) * v.dist, T.z + Math.cos(v.az) * Math.cos(v.el) * v.dist);
    cam.lookAt(T);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    v.build();
    R.render(scene, cam);
    // white studio background and a soft drop shadow
    const src = R.domElement;
    octx.globalCompositeOperation = "source-over";
    octx.globalAlpha = 1;
    octx.filter = "none";
    const bg = octx.createRadialGradient(W * 0.5, H * 0.42, 20, W * 0.5, H * 0.5, W * 0.75);
    bg.addColorStop(0, "#FFFFFF");
    bg.addColorStop(0.7, "#F4F6FA");
    bg.addColorStop(1, "#E9EDF3");
    octx.fillStyle = bg;
    octx.fillRect(0, 0, W, H);
    octx.globalAlpha = 0.22;
    octx.filter = "blur(16px) brightness(0)";
    octx.drawImage(src, 14, 20);
    octx.globalAlpha = 0.12;
    octx.filter = "blur(4px) brightness(0)";
    octx.drawImage(src, 4, 6);
    octx.globalAlpha = 1;
    octx.filter = "none";
    octx.drawImage(src, 0, 0);
    return { u: out.toDataURL("image/jpeg", 0.9), p: pains.slice(), w: W, h: H };
  }

  return { render };
}

/* --- store: renders each view once, in the background --------------------- */

const cache = new Map<XrayKey, Render>();
const listeners = new Set<() => void>();
let started = false;

/** The pain map's scenes, the default area (knee) first. */
const ORDER: XrayKey[] = ["knee", "neck", "spine", "shoulder", "hip", "ankle", "elbow", "ham"];

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  // wait for a quiet moment, but no longer than 1.5 s: the page's animations
  // can keep it from ever going idle
  const idle = (f: () => void) =>
    window.requestIdleCallback ? window.requestIdleCallback(f, { timeout: 1500 }) : window.setTimeout(f, 200);
  idle(() => {
    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        let engine: Engine;
        try {
          engine = createEngine(gltf);
        } catch {
          return; // no WebGL: the photo placeholders stay
        }
        const queue = [...ORDER];
        const next = () => {
          const k = queue.shift();
          if (!k) return;
          try {
            cache.set(k, engine.render(k));
            listeners.forEach((l) => l());
          } catch {
            /* skip this view */
          }
          window.setTimeout(next, 30);
        };
        next();
      },
      undefined,
      () => {},
    );
  });
}

function subscribe(l: () => void) {
  start();
  listeners.add(l);
  return () => listeners.delete(l);
}

/** The render for a scene, or null until it's ready. */
export function useXray(key: XrayKey | undefined) {
  return useSyncExternalStore(
    subscribe,
    () => (key ? cache.get(key) ?? null : null),
    () => null,
  );
}

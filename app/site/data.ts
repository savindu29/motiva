/* Content for the Motiva Physio site. All names, prices and reviews are demo
   content, carried over from the prototype. */

export const fmt = (n: number) => "LKR " + n.toLocaleString("en-US");

/** X-ray scenes the renderer knows how to draw (see xray.ts). */
export type XrayKey = "spine" | "neck" | "shoulder" | "knee" | "ankle" | "elbow" | "ham" | "hip";

export type ServiceId = "assess" | "sport" | "spine" | "surgery" | "neuro" | "needle" | "follow" | "home";

export type Service = {
  id: ServiceId;
  name: string;
  min: number;
  price: number;
  desc: string;
  /** Only offered inside the booking, not as a card. */
  hidden?: boolean;
};

export const SERVICES: Service[] = [
  { id: "assess", name: "Initial assessment", min: 60, price: 6500, desc: "Full movement assessment, diagnosis and a written plan with a target date." },
  { id: "sport", name: "Sports injury rehab", min: 60, price: 7500, desc: "Sprains, strains, ACL and ankle injuries, with a staged return-to-sport plan." },
  { id: "spine", name: "Back & neck pain", min: 45, price: 5200, desc: "Disc problems, sciatica, stiff necks and desk posture, treated hands-on." },
  { id: "surgery", name: "Post-surgery rehab", min: 60, price: 7000, desc: "Knee and hip replacement, ACL reconstruction and shoulder repair, following your surgeon's protocol." },
  { id: "neuro", name: "Neuro rehabilitation", min: 60, price: 7200, desc: "Balance, walking and arm function after a stroke, or with Parkinson's." },
  { id: "needle", name: "Dry needling", min: 30, price: 4500, desc: "Releases tight trigger points in muscles. Often added to a treatment session." },
  { id: "follow", name: "Follow-up session", min: 45, price: 4800, desc: "Continued treatment and progression of your home exercise programme.", hidden: true },
  { id: "home", name: "Home visit", min: 60, price: 9500, desc: "A full session in your home, for patients who can't travel.", hidden: true },
];

export type TeamCat = "sport" | "spine" | "surgery" | "neuro";

export type Physio = {
  id: string;
  name: string;
  role: string;
  ini: string;
  yrs: number;
  cat: TeamCat;
  shade: string;
  tint: string;
  /** Takes bookings by name. The others are booked as "first available". */
  bookable: boolean;
  /** Portrait in public/site/team/. Without one, the card shows a placeholder. */
  photo?: string;
};

export const TEAM: Physio[] = [
  { id: "nad", name: "Nadeesha Perera", role: "Sports physiotherapist", ini: "NP", yrs: 11, cat: "sport", shade: "linear-gradient(180deg,transparent,rgba(46,125,86,.85))", tint: "tint-g", bookable: true, photo: "/site/team/nad.jpg" },
  { id: "kav", name: "Kavindu Jayasinghe", role: "Spine & posture", ini: "KJ", yrs: 8, cat: "spine", shade: "linear-gradient(180deg,transparent,rgba(180,70,120,.85))", tint: "tint-p", bookable: true, photo: "/site/team/kav.jpg" },
  { id: "ama", name: "Amaya Fernando", role: "Neuro rehabilitation", ini: "AF", yrs: 14, cat: "neuro", shade: "linear-gradient(180deg,transparent,rgba(60,110,190,.85))", tint: "tint-b", bookable: true, photo: "/site/team/ama.jpg" },
  { id: "tha", name: "Tharindu Silva", role: "Post-surgical rehab", ini: "TS", yrs: 9, cat: "surgery", shade: "linear-gradient(180deg,transparent,rgba(110,98,242,.85))", tint: "", bookable: true, photo: "/site/team/tha.jpg" },
  { id: "ish", name: "Ishara Wickrama", role: "Sports & running injuries", ini: "IW", yrs: 6, cat: "sport", shade: "linear-gradient(180deg,transparent,rgba(46,125,86,.85))", tint: "tint-g", bookable: false },
  { id: "dil", name: "Dilshan Mendis", role: "Paediatric & neuro physio", ini: "DM", yrs: 10, cat: "neuro", shade: "linear-gradient(180deg,transparent,rgba(180,70,120,.85))", tint: "tint-p", bookable: false },
];

export const TEAM_FILTERS: [TeamCat | "all", string][] = [
  ["all", "All physios"],
  ["sport", "Sports"],
  ["spine", "Spine & posture"],
  ["surgery", "Post-surgery"],
  ["neuro", "Neuro"],
];

export type AreaId = "neck" | "shoulder" | "elbow" | "wrist" | "upback" | "lowback" | "hip" | "ham" | "knee" | "calf" | "ankle";

export type Area = {
  name: string;
  view: "front" | "back" | "both";
  /** One x for the midline, two for left and right. */
  x: number | [number, number];
  y: number;
  conds: string[];
  tx: string[];
  sess: string;
  wk: string;
  svc: ServiceId;
  flag?: string;
  xray: XrayKey;
  /** Where to focus the render inside the card's short image strip. */
  pos?: string;
};

export const AREAS: Record<AreaId, Area> = {
  neck: { name: "Neck", view: "both", x: 100, y: 70, conds: ["Stiff neck from desk work", "Whiplash after a car accident", "Pinched nerve (arm tingling)", "Tension headaches"], tx: ["Joint mobilisation", "Postural retraining", "Dry needling", "Desk set-up advice"], sess: "4–6", wk: "3–6 wks", svc: "spine", flag: "Seek urgent care for neck pain with fever, or weakness in both arms.", xray: "neck", pos: "center 40%" },
  shoulder: { name: "Shoulder", view: "front", x: [62, 138], y: 96, conds: ["Frozen shoulder", "Rotator cuff tear or tendinopathy", "Impingement when lifting overhead", "Dislocation recovery"], tx: ["Range-of-motion work", "Rotator cuff strengthening", "Soft tissue release", "Taping"], sess: "6–12", wk: "6–20 wks", svc: "sport", xray: "shoulder" },
  elbow: { name: "Elbow", view: "front", x: [50, 150], y: 168, conds: ["Tennis elbow", "Golfer's elbow", "Stiffness after a fracture"], tx: ["Tendon loading programme", "Dry needling", "Brace and grip advice"], sess: "4–8", wk: "4–10 wks", svc: "sport", xray: "elbow" },
  wrist: { name: "Wrist & hand", view: "front", x: [42, 158], y: 236, conds: ["Carpal tunnel symptoms", "Wrist sprain", "De Quervain's (thumb-side pain)", "Recovery after a cast"], tx: ["Nerve and tendon glides", "Splinting advice", "Grip strengthening"], sess: "4–6", wk: "3–8 wks", svc: "follow", xray: "elbow" },
  upback: { name: "Upper back", view: "back", x: 100, y: 128, conds: ["Posture pain between shoulder blades", "Stiff thoracic spine", "Rib joint pain"], tx: ["Thoracic mobilisation", "Scapular strengthening", "Breathing and posture drills"], sess: "3–6", wk: "2–6 wks", svc: "spine", xray: "spine", pos: "center 32%" },
  lowback: { name: "Lower back", view: "back", x: 100, y: 196, conds: ["Disc bulge", "Sciatica (pain down the leg)", "Muscle strain from lifting", "Pain from sitting all day"], tx: ["Manual therapy", "Core and hip strengthening", "McKenzie-based exercises", "Lifting technique"], sess: "4–8", wk: "4–8 wks", svc: "spine", flag: "Seek urgent care for numbness around the groin, or loss of bladder or bowel control.", xray: "spine", pos: "center 78%" },
  hip: { name: "Hip", view: "front", x: [82, 118], y: 224, conds: ["Hip arthritis", "Bursitis (outer hip pain)", "After a hip replacement", "Groin strain"], tx: ["Gait retraining", "Glute strengthening", "Joint mobilisation"], sess: "6–12", wk: "6–16 wks", svc: "surgery", xray: "hip" },
  ham: { name: "Hamstring", view: "back", x: [84, 116], y: 278, conds: ["Hamstring strain from sprinting", "Tendinopathy near the sit bone", "Tightness after sitting"], tx: ["Graded eccentric loading", "Sprint drills", "Soft tissue release"], sess: "4–8", wk: "3–10 wks", svc: "sport", xray: "ham" },
  knee: { name: "Knee", view: "front", x: [80, 120], y: 320, conds: ["ACL tear or reconstruction", "Runner's knee", "Meniscus injury", "Knee arthritis"], tx: ["Quad and hip strengthening", "Balance and landing drills", "Return-to-run plan", "Taping"], sess: "8–20", wk: "8–24 wks", svc: "sport", xray: "knee" },
  calf: { name: "Calf & Achilles", view: "back", x: [80, 120], y: 378, conds: ["Achilles tendinopathy", "Calf strain", "Shin splints"], tx: ["Heel-raise loading", "Running load plan", "Footwear advice"], sess: "4–8", wk: "4–12 wks", svc: "sport", xray: "ankle" },
  ankle: { name: "Ankle & foot", view: "front", x: [80, 120], y: 408, conds: ["Ankle sprain", "Plantar fasciitis (heel pain)", "Stiffness after a fracture"], tx: ["Balance training", "Strength and hop tests", "Taping advice"], sess: "3–6", wk: "3–8 wks", svc: "sport", xray: "ankle" },
};

export type PackCat = "sport" | "spine" | "surgery" | "wellness";

/** `photo` is in public/site/packages/. */
export const PACKAGES: { cat: PackCat; name: string; desc: string; items: string[]; price: number; svc: ServiceId; photo: string }[] = [
  { cat: "sport", name: "Sports Injury Recovery", desc: "Assessment and six sessions to get you back to training safely.", items: ["Movement and strength testing", "Taping and manual therapy", "Return-to-sport plan"], price: 44000, svc: "sport", photo: "/site/packages/sports-injury-recovery.jpg" },
  { cat: "spine", name: "Back & Neck Relief", desc: "Four sessions focused on easing pain and fixing posture.", items: ["Spinal assessment", "Hands-on treatment", "Desk and sleep advice"], price: 22500, svc: "spine", photo: "/site/packages/back-neck-relief.jpg" },
  { cat: "surgery", name: "Post-Surgery Rehab", desc: "Eight sessions following your surgeon's protocol after knee, hip or shoulder surgery.", items: ["Weekly progress report", "Swelling and range work", "Strength rebuilding"], price: 52000, svc: "surgery", photo: "/site/packages/post-surgery-rehab.jpg" },
  { cat: "wellness", name: "Desk Worker Check-Up", desc: "One session to spot problems before they turn into pain.", items: ["Posture and mobility screen", "Workstation advice", "Personal stretch routine"], price: 5500, svc: "assess", photo: "/site/packages/desk-worker-check-up.jpg" },
  { cat: "sport", name: "Runner's MOT", desc: "Gait analysis and a strength plan to cut your injury risk.", items: ["Video gait analysis", "Footwear advice", "8-week strength plan"], price: 9500, svc: "sport", photo: "/site/packages/runners-mot.jpg" },
  { cat: "wellness", name: "Senior Balance Programme", desc: "Four sessions to improve balance, walking and confidence.", items: ["Falls risk screening", "Balance training", "Home safety tips"], price: 19000, svc: "neuro", photo: "/site/packages/senior-balance-programme.jpg" },
];

export const PACK_FILTERS: [PackCat | "all", string][] = [
  ["all", "All packages"],
  ["sport", "Sports"],
  ["spine", "Back & neck"],
  ["surgery", "After surgery"],
  ["wellness", "Wellness"],
];

export const STORIES = [
  { q: "Six months after my ACL surgery I played a full match again. The week-by-week plan kept me patient when I wanted to rush back.", n: "Dilan R.", d: "Rugby player, ACL rehab", c: "#C68C63" },
  { q: "I had back pain for two years from sitting at a desk. After six sessions I can work a full day without thinking about it.", n: "Shehani M.", d: "Software engineer, lower back", c: "#5B93F5" },
  { q: "Amaya helped my father walk to the garden again after his stroke. The home visits made it possible for him.", n: "Ruwan P.", d: "Family member, neuro rehab", c: "#2A3140" },
  { q: "Clear explanations, no rushing, and exercises I could actually do at home. My shoulder moves normally again.", n: "Farah K.", d: "Teacher, frozen shoulder", c: "#F0442F" },
  { q: "Kavindu sorted out a neck problem I had for months. He explained everything and the desk tips really helped.", n: "Nimali S.", d: "Accountant, neck pain", c: "#14B8A6" },
  { q: "Booking online took two minutes and I was seen the next morning. Friendly team and a spotless clinic.", n: "Arjun T.", d: "Cricketer, ankle sprain", c: "#928AFD" },
  { q: "The home visits after my hip replacement were a lifesaver. I was walking without a frame in five weeks.", n: "Mala W.", d: "Retired, hip replacement", c: "#F59E0B" },
  { q: "Great mix of hands-on treatment and exercises. My tennis elbow is gone and I'm back on court.", n: "Kevin L.", d: "Tennis player, elbow", c: "#334155" },
];


export const FAQ = [
  { q: "Do I need a doctor's referral?", a: "No. You can book directly. If you have a referral letter, scans or surgery notes, bring them to your first visit." },
  { q: "What should I wear?", a: "Loose clothing that lets us see and move the painful area. Shorts for knee or hip problems, a vest top for shoulders and neck." },
  { q: "How many sessions will I need?", a: "Most back and neck pain improves in 4–8 sessions. Rehab after surgery can take 3–6 months. You'll get an estimate at your assessment." },
  { q: "Do you accept insurance?", a: "Most private health plans cover physiotherapy. We give you an itemised receipt with the diagnosis and session codes your insurer needs." },
  { q: "Can I cancel or move my appointment?", a: "Yes, free of charge up to 12 hours before. Later cancellations are charged at 50% of the session fee." },
];

export const CLINIC = {
  address: "18 Flower Terrace",
  area: "Colombo 07",
  phone: "+94 11 250 4400",
  email: "care@motivaphysio.lk",
  hours: "Mon–Fri 7:30–19:00",
  sat: "Sat 8:00–14:00",
};

/* --- booking calendar ----------------------------------------------------- */

export type Slot = { t: string; off: boolean };

/** The next 14 days, from today. */
export function nextDays(from = new Date()) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  return Array.from({ length: 14 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return x;
  });
}

/**
 * Open times for a day, or null when closed (Sundays). Saturdays are mornings
 * only. Which times are taken is a fixed pattern per day and physio, so the
 * demo looks lived-in without a server.
 */
export function slotsFor(date: Date, physio: string | null): Record<string, Slot[]> | null {
  const dow = date.getDay();
  if (dow === 0) return null;
  const am = ["07:30", "08:15", "09:00", "09:45", "10:30", "11:15"];
  const pm = ["13:30", "14:15", "15:00", "15:45", "16:30", "17:15", "18:00"];
  const seed = date.getDate() * 7 + (physio || "x").charCodeAt(0);
  const busy = (t: string) => (seed + t.charCodeAt(1) * 3 + t.charCodeAt(3) * 5) % 5 < 2;
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const past = (t: string) => isToday && +t.slice(0, 2) * 60 + +t.slice(3) <= now.getHours() * 60 + now.getMinutes() + 60;
  const f = (l: string[]) => l.map((t) => ({ t, off: busy(t) || past(t) }));
  return dow === 6 ? { Morning: f([...am, "12:00", "12:45"]) } : { Morning: f(am), Afternoon: f(pm) };
}

export function hasFree(date: Date, physio: string | null) {
  const s = slotsFor(date, physio);
  return !!s && Object.values(s).flat().some((x) => !x.off);
}

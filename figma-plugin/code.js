// Ghana EMS — Screen Generator v3 "instrument faceplate"
// Rerun-safe: clears its own previous output, reports via ZZ-DIAG.
// Fonts: Inter only (exotic families + letterSpacing crashed the v2 generator).

const C = {
  shell: '#14110F', panel: '#1C1815', panel2: '#241F1B', engrave: '#0D0B0A',
  brass: '#C9A961', legend: '#EFE7DC', legend2: '#A89C8C', legend3: '#7A6F62',
  amber: '#F5A524', cyan: '#7FD4F5', red: '#FF4D4D', redDeep: '#5A1714',
  green: '#4ADE80'
};

const ERRS = [];
const FONTS = {};
let MED = 'Medium';

async function loadFonts() {
  for (const s of ['Medium', 'Bold', 'Regular']) {
    try { await figma.loadFontAsync({ family: 'Inter', style: s }); FONTS[s] = true; } catch (e) {}
  }
  if (!FONTS.Medium && !FONTS.Bold && !FONTS.Regular) throw new Error('no font loadable');
  if (!FONTS.Medium) MED = FONTS.Bold ? 'Bold' : 'Regular';
}

function rgb(h, a = 1) {
  return { r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255, a };
}
function solid(h, a = 1) { return [{ type: 'SOLID', color: rgb(h), opacity: a }]; }
function glow(h, r, a) {
  return [{ type: 'DROP_SHADOW', color: rgb(h, a), offset: { x: 0, y: 0 }, radius: r, visible: true, blendMode: 'NORMAL' }];
}

function rect(p, x, y, w, h, o = {}) {
  try {
    const n = figma.createRectangle(); p.appendChild(n);
    n.x = x; n.y = y; n.resize(Math.max(w, 0.1), Math.max(h, 0.1));
    n.fills = o.fill ? solid(o.fill, o.alpha === undefined ? 1 : o.alpha) : [];
    if (o.stroke) { n.strokes = solid(o.stroke, o.sa === undefined ? 1 : o.sa); n.strokeWeight = o.sw || 1; }
    n.cornerRadius = o.r === undefined ? 2 : o.r;
    if (o.dash) n.dashPattern = o.dash;
    if (o.glow) n.effects = glow(o.glow, o.gr || 16, o.ga || 0.35);
    return n;
  } catch (e) { ERRS.push('rect:' + e.message); return null; }
}
function ellipse(p, x, y, w, h, o = {}) {
  try {
    const n = figma.createEllipse(); p.appendChild(n);
    n.x = x; n.y = y; n.resize(w, h);
    n.fills = o.fill ? solid(o.fill, o.alpha === undefined ? 1 : o.alpha) : [];
    if (o.stroke) { n.strokes = solid(o.stroke, o.sa === undefined ? 1 : o.sa); n.strokeWeight = o.sw || 1; }
    if (o.glow) n.effects = glow(o.glow, o.gr || 14, o.ga || 0.5);
    return n;
  } catch (e) { ERRS.push('ellipse:' + e.message); return null; }
}
function txt(p, s, x, y, size, color, o = {}) {
  try {
    const n = figma.createText(); p.appendChild(n);
    const want = o.b ? 'Bold' : MED;
    if (FONTS[want]) n.fontName = { family: 'Inter', style: want };
    else n.fontName = { family: 'Inter', style: MED };
    n.characters = s; n.x = x; n.y = y; n.fontSize = size;
    n.fills = solid(color, o.alpha === undefined ? 1 : o.alpha);
    return n;
  } catch (e) { ERRS.push('txt(' + String(s).slice(0, 14) + '):' + e.message); return null; }
}
function vec(p, data, x, y, w, h, color, sw, o = {}) {
  try {
    const n = figma.createVector(); p.appendChild(n);
    n.x = x; n.y = y; n.resize(Math.max(w, 0.1), Math.max(h, 0.1)); n.fills = [];
    n.strokes = solid(color, o.alpha === undefined ? 1 : o.alpha); n.strokeWeight = sw;
    if (o.dash) n.dashPattern = o.dash;
    n.vectorPaths = [{ windingRule: 'NONE', data }];
    return n;
  } catch (e) { ERRS.push('vec:' + e.message); return null; }
}

function scr(name, x, y, w, h) {
  const f = figma.createFrame(); f.name = name;
  figma.currentPage.appendChild(f);
  f.x = x; f.y = y; f.resize(w, h);
  f.fills = solid(C.shell);
  f.cornerRadius = 2; f.clipsContent = true;
  return f;
}
function bar(p, l, m, r) {
  rect(p, 0, 0, p.width, 34, { fill: C.panel, r: 0 });
  rect(p, 0, 34, p.width, 1, { fill: C.brass, alpha: 0.5, r: 0 });
  ellipse(p, 15, 14, 7, 7, { fill: C.green, glow: C.green, gr: 6, ga: 0.6 });
  txt(p, l, 31, 12, 9, C.legend, { b: true });
  txt(p, m, p.width / 2 - m.length * 2.9, 12, 9, C.legend2);
  txt(p, r, p.width - 52, 12, 9, C.legend2);
}
function engv(p, s, x, y, color) { txt(p, s, x, y, 9, color || C.legend3, { b: true }); }
function chip(p, s, x, y, color) {
  const w = s.length * 5.4 + 14;
  rect(p, x, y, w, 18, { stroke: color, sa: 0.6, r: 2 });
  txt(p, s, x + 7, y + 4, 8.5, color, { b: true });
  return w;
}
function btn(p, s, x, y, w, kind) {
  if (kind === 'go') {
    rect(p, x, y, w, 40, { fill: C.amber, r: 2, glow: C.amber, gr: 16, ga: 0.3 });
    txt(p, s, x + w / 2 - s.length * 3.1, y + 13, 11, '#1A1204', { b: true });
  } else if (kind === 'sign') {
    rect(p, x, y, w, 40, { fill: C.panel2, stroke: C.green, sa: 0.55, r: 2 });
    txt(p, s, x + w / 2 - s.length * 3.1, y + 13, 11, C.green, { b: true });
  } else if (kind === 'stop') {
    rect(p, x, y, w, 40, { fill: C.panel2, stroke: C.red, sa: 0.55, r: 2 });
    txt(p, s, x + w / 2 - s.length * 3.1, y + 13, 11, C.red, { b: true });
  } else if (kind === 'ghost') {
    txt(p, s, x + 4, y + 13, 11, C.legend3);
  } else {
    rect(p, x, y, w, 40, { fill: C.panel2, stroke: C.brass, sa: 0.5, r: 2 });
    txt(p, s, x + w / 2 - s.length * 3.1, y + 13, 11, C.legend, { b: true });
  }
}
/* the signature: physiological range rail */
function rail(p, x, y, w, safeL, safeW, markL, markColor) {
  rect(p, x, y + 8, w, 10, { fill: C.engrave, r: 0 });
  rect(p, x + w * safeL, y + 8, w * safeW, 10, { fill: C.green, alpha: 0.10, r: 0 });
  rect(p, x + w * safeL, y + 8, 1, 10, { fill: C.green, alpha: 0.35, r: 0 });
  rect(p, x + w * (safeL + safeW) - 1, y + 8, 1, 10, { fill: C.green, alpha: 0.35, r: 0 });
  for (let i = 1; i < 8; i++) rect(p, x + (w / 8) * i, y + 20, 1, 6, { fill: C.brass, alpha: 0.45, r: 0 });
  rect(p, x + w * markL, y + 2, 3, 22, { fill: markColor, r: 0, glow: markColor, gr: 8, ga: 0.6 });
}
function row(p, x, y, w, k, v, o = {}) {
  txt(p, k, x, y, 11, C.legend2);
  txt(p, v, x + w - v.length * (o.mono ? 6.4 : 5.8), y, 11, o.color || C.legend, { b: true });
  rect(p, x, y + 22, w, 1, { fill: C.brass, alpha: 0.18, r: 0 });
}
function card(p, x, y, w, rows, h) {
  rect(p, x, y, w, h || (rows.length * 23 + 16), { fill: C.panel, stroke: C.brass, sa: 0.5, r: 2 });
  rows.forEach((r, i) => row(p, x + 14, y + 10 + i * 23, w - 28, r[0], r[1], r[2] || {}));
}
function nav(p, items, active) {
  const y = p.height - 46;
  rect(p, 0, y, p.width, 46, { fill: C.panel, r: 0 });
  rect(p, 0, y, p.width, 1, { fill: C.brass, alpha: 0.5, r: 0 });
  const w = p.width / items.length;
  items.forEach((s, i) => {
    if (i === active) rect(p, i * w + 16, y, w - 32, 2, { fill: C.amber, r: 0 });
    txt(p, s.toUpperCase(), i * w + w / 2 - s.length * 2.5, y + 17, 8.5, i === active ? C.amber : C.legend3);
  });
}

/* ── 1. CREW · VITALS ─────────────────────────────────── */
function crewVitals(x, y) {
  const f = scr('Node B · Crew — Live Vitals', x, y, 544, 1120);
  bar(f, 'NODE-07 · REC', 'MESH 3 HOPS · LORA 11 KM', '14:22');

  // annunciator
  rect(f, 18, 50, 508, 116, { fill: C.redDeep, alpha: 0.45, stroke: C.red, r: 2 });
  rect(f, 34, 68, 9, 9, { fill: C.red, glow: C.red, gr: 10, ga: 0.8 });
  txt(f, 'CRITICAL — SpO2 82% · falling 4 min', 51, 64, 14, '#FF8080', { b: true });
  txt(f, 'Protocol 4.2 (signed v7 · NAS-MD +4) — escalate: O2 via BVM 15 L.', 34, 92, 11, C.legend);
  txt(f, 'Sepsis risk 0.81 · rhythm VT — shockable.', 34, 110, 11, C.legend);
  btn(f, 'Acknowledge', 34, 128, 108, 'sign');
  btn(f, 'Treat now', 150, 128, 92, 'go');
  btn(f, 'False alarm', 250, 128, 100, 'ghost');

  // hero readout on a range rail
  rect(f, 18, 180, 508, 152, { fill: C.panel, stroke: C.red, sa: 0.55, r: 2 });
  engv(f, 'SPO2 — WORST PARAMETER', 32, 194, C.legend2);
  txt(f, '▼ 4 /min', 452, 194, 10, C.legend2);
  txt(f, '82', 32, 208, 46, C.red, { b: true });
  txt(f, '%', 92, 236, 12, C.legend2);
  rail(f, 32, 254, 480, 0.62, 0.36, 0.57, C.red);
  txt(f, '50%', 32, 284, 9, C.legend2);
  txt(f, '100%', 480, 284, 9, C.legend2);
  txt(f, 'SHOCK <85', 32, 302, 8.5, C.legend3);
  txt(f, 'SAFE 95–100', 218, 302, 8.5, C.legend3);
  txt(f, 'SHOCK >100', 442, 302, 8.5, C.legend3);
  txt(f, '▼ 96 → 82 over 30 min · 4 min below shock floor', 32, 316, 10, C.legend2);

  // 2x2 faceplate grid
  const mini = [
    ['HEART RATE', '128', 'bpm ▲6', C.amber], ['NIBP', '88/54', 'mmHg ▼6', C.red],
    ['RESP RATE', '32', '/min ▲4', C.amber], ['GCS', '13', '▼2 in 20 min', C.amber]
  ];
  mini.forEach((m, i) => {
    const mx = 18 + (i % 2) * 258, my = 346 + Math.floor(i / 2) * 74;
    rect(f, mx, my, 250, 66, { fill: C.panel, stroke: m[3], sa: 0.5, r: 2 });
    txt(f, m[0], mx + 13, my + 11, 9, C.legend2);
    txt(f, m[2], mx + 250 - 13 - m[2].length * 5.2, my + 11, 9, C.legend3);
    txt(f, m[1], mx + 13, my + 28, 20, m[3], { b: true });
  });

  // live trace
  rect(f, 18, 496, 508, 116, { fill: C.engrave, stroke: C.brass, sa: 0.5, r: 2 });
  txt(f, 'LEAD II · 250 HZ · NODE A TAP', 30, 506, 9, C.legend3);
  txt(f, 'VT', 496, 506, 9, C.red, { b: true });
  let d = 'M 0 58'; const sp = [24, 78, 132, 186, 240, 294, 348, 402];
  for (const s of sp) d += ' L ' + (s - 7) + ' 58 L ' + s + ' 12 L ' + (s + 7) + ' 92 L ' + (s + 13) + ' 58';
  d += ' L 470 58';
  vec(f, d, 30, 520, 470, 84, C.cyan, 2.2, { dash: undefined });

  // record card
  card(f, 18, 626, 508, [
    ['Secondary', 'TEMP 38.9°C · EtCO2 29 · MAP 65 ▼'],
    ['Record', ''],
    ['Artefacts', '2 quarantined (motion) — excluded'],
    ['Lineage', '⚠ GAP 34 S @ 14:03 · SEQ 881→918']
  ], 108);
  chip(f, 'SIGNED · CHAINED · 2 PEERS', 32, 682, C.green);
  txt(f, 'Node A keeps recording if this tablet dies. Field vitals are the authority — the', 18, 748, 10.5, C.legend3);
  txt(f, 'hospital appends, never overwrites.', 18, 764, 10.5, C.legend3);

  engv(f, 'QUICK LOG — ONE TAP', 18, 792);
  btn(f, 'O2 15L NRB', 18, 808, 100, 'sign');
  btn(f, 'ASA 300mg', 126, 808, 100, 'plain');
  btn(f, 'IV bolus 250ml', 234, 808, 116, 'plain');
  btn(f, 'CPR mode', 358, 808, 96, 'stop');
  rect(f, 18, 858, 508, 32, { fill: C.panel, stroke: C.brass, sa: 0.5, r: 2 });
  txt(f, '14:11:37 · O2 15 L via NRB · SIGNED ✓', 32, 868, 10, C.green, { b: true });

  nav(f, ['Call', 'Vitals', 'Treat', 'Route', 'Handover', 'Node'], 1);
  return f;
}

/* ── 2. CREW · ROUTE ──────────────────────────────────── */
function crewRoute(x, y) {
  const f = scr('Node B · Crew — Route (C engine)', x, y, 544, 760);
  bar(f, 'NODE-07 · REC', 'MESH 3 HOPS · LORA 11 KM', '14:22');
  engv(f, 'DESTINATION · C-ENGINE', 18, 52);
  txt(f, 'Where to take this patient', 18, 68, 17, C.legend, { b: true });
  const R = [
    ['1', 'Korle Bu Teaching', '3.2 KM · 8 MIN · CATH ✓ CARDIO ✓ · 4 BEDS · QUEUE 2', '89', C.green, true],
    ['2', '37 Military', '5.8 KM · 12 MIN · CATH ✓ CARDIO ✓ · 2 BEDS · QUEUE 5', '74', C.legend, false],
    ['3', 'Ridge Hospital', '6.1 KM · 13 MIN · NO CARDIO TILL 18:00 · 6 BEDS', '51', C.legend, false],
    ['✗', 'Accra General', '2.4 KM · PACKET NOT ACCEPTED — EXCLUDED', '—', C.red, false]
  ];
  R.forEach((r, i) => {
    const yy = 104 + i * 78;
    const o = { fill: C.panel, r: 2 };
    if (r[4] === C.green) { o.stroke = C.green; o.sa = 1; o.fill = '#182019'; }
    else if (r[0] === '✗') { o.stroke = C.brass; o.sa = 0.4; o.dash = [5, 4]; o.alpha = 0.55; }
    else { o.stroke = C.brass; o.sa = 0.5; }
    rect(f, 18, yy, 508, 68, o);
    txt(f, r[0], 32, yy + 20, 19, r[0] === '✗' ? C.red : (r[4] === C.green ? C.green : C.legend3), { b: true });
    txt(f, r[1], 66, yy + 12, 13, C.legend, { b: true });
    txt(f, r[2], 66, yy + 38, 9, r[0] === '✗' ? C.red : C.legend2);
    txt(f, r[3], 462, yy + 14, 20, r[4], { b: true });
    txt(f, r[0] === '✗' ? 'GATED' : 'SCORE', 452, yy + 44, 8, C.legend3, { b: true });
  });
  rect(f, 18, 428, 508, 62, { fill: C.panel, stroke: C.brass, sa: 0.5, r: 2 });
  engv(f, 'HARD GATE', 32, 440, C.legend2);
  txt(f, 'No accepted packet, no destination — no matter how close.', 32, 458, 11, C.legend2);
  txt(f, 'Dispatch sees this list; overrides are signed.', 32, 475, 11, C.legend2);
  nav(f, ['Call', 'Vitals', 'Treat', 'Route', 'Handover', 'Node'], 3);
  return f;
}

/* ── 3. CREW · HANDOVER ───────────────────────────────── */
function crewHandover(x, y) {
  const f = scr('Node B · Crew — Handover QR', x, y, 544, 760);
  bar(f, 'NODE-07 · REC', 'MESH 3 HOPS · LORA 11 KM', '14:22');
  engv(f, 'HANDOVER', 18, 52);
  txt(f, 'INC-0421 → Korle Bu', 18, 68, 17, C.legend, { b: true });
  card(f, 18, 100, 508, [
    ['Payload', 'vitals · alerts · interventions · ETA'],
    ['Integrity', 'SHA-256 ✓ · NODE-07']
  ], 62);
  rect(f, 176, 180, 192, 192, { fill: C.legend, r: 2, glow: C.amber, gr: 26, ga: 0.12 });
  let seed = 42; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  for (let r = 0; r < 21; r++) for (let c = 0; c < 21; c++) {
    const finder = (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
    if (!finder && rnd() > 0.55) rect(f, 184 + c * 8.5, 188 + r * 8.5, 7.3, 7.3, { fill: C.shell, r: 0 });
  }
  [[0, 0], [0, 14], [14, 0]].forEach(([r, c]) => {
    rect(f, 184 + c * 8.5, 188 + r * 8.5, 59, 59, { fill: C.shell, r: 2 });
    rect(f, 192 + c * 8.5, 196 + r * 8.5, 43, 43, { fill: C.legend, r: 1 });
    rect(f, 200 + c * 8.5, 204 + r * 8.5, 27, 27, { fill: C.shell, r: 1 });
  });
  txt(f, 'ENCRYPTED · SINGLE-USE · EXPIRES 5:00', 152, 392, 10, C.amber, { b: true });
  txt(f, 'ED clinician scans — both sides write a signed audit row', 108, 416, 11.5, C.legend2);
  nav(f, ['Call', 'Vitals', 'Treat', 'Route', 'Handover', 'Node'], 4);
  return f;
}

/* ── 4. CREW · CPR ────────────────────────────────────── */
function crewCpr(x, y) {
  const f = scr('Node B · Crew — CPR Mode', x, y, 544, 700);
  rect(f, 0, 0, 544, 700, { fill: C.engrave, r: 0 });
  engv(f, 'EMERGENCY · PROTOCOL 7.1', 18, 22, C.red);
  txt(f, 'CARDIAC ARREST — CPR', 18, 38, 19, C.red, { b: true });
  txt(f, 'PULSE ABSENT 14:11:37 · ONSET LOGGED + SIGNED', 18, 64, 9, C.legend2);
  txt(f, '✕ exit CPR mode', 424, 38, 11, C.legend3);

  rect(f, 18, 92, 254, 96, { fill: C.panel, stroke: C.brass, sa: 0.5, r: 2 });
  engv(f, 'ELAPSED', 32, 104);
  txt(f, '02:47', 32, 122, 34, C.red, { b: true });

  rect(f, 284, 92, 242, 96, { fill: C.panel, stroke: C.green, sa: 0.55, r: 2 });
  engv(f, 'COMPRESSION RATE — TARGET', 298, 104, C.green);
  txt(f, '110', 298, 122, 32, C.green, { b: true });
  txt(f, '/min', 370, 142, 11, C.legend2);
  rail(f, 298, 158, 214, 0.33, 0.34, 0.5, C.green);
  txt(f, '80', 298, 178, 8.5, C.legend3);
  txt(f, '140', 484, 178, 8.5, C.legend3);

  const steps = [
    ['1', 'Compressions 100–120/min · 5–6 cm', 'NOW', C.green],
    ['2', 'AED on · analyse rhythm', 'NEXT', C.amber],
    ['3', 'Shock if VT/VF · 200 J biphasic', 'SHOCK', C.amber],
    ['4', 'Resume CPR 2 min · re-analyse', 'AT 02:00', C.brass],
    ['5', 'Adrenaline 1 mg IV every 3–5 min', 'AUTO-LOGGED', C.cyan]
  ];
  steps.forEach((s, i) => {
    const yy = 206 + i * 62;
    rect(f, 18, yy, 508, 52, { fill: i === 0 ? '#18201A' : C.panel, stroke: C.brass, sa: 0.5, r: 2 });
    rect(f, 18, yy, 3, 52, { fill: s[3], r: 0 });
    txt(f, s[0], 32, yy + 16, 13, s[3], { b: true });
    txt(f, s[1], 60, yy + 18, 12, C.legend);
    chip(f, s[2], 526 - s[2].length * 5.4 - 14, yy + 17, s[3]);
  });
  txt(f, 'Every step + timestamp writes to the signed record.', 18, 528, 10.5, C.legend3);
  txt(f, 'Cycle 1 analysis due at 02:00.', 18, 545, 10.5, C.legend3);
  return f;
}

/* ── 5. DISPATCH ─────────────────────────────────────── */
function dispatch(x, y) {
  const f = scr('Dispatch — Control Board', x, y, 1280, 660);
  bar(f, 'NAS ACCRA CONTROL', '41 UNITS · 27 FREE · 4 EN-ROUTE · MESH HEALTHY', '14:22');

  engv(f, 'INCIDENT QUEUE', 20, 52);
  const Q = [
    ['INC-0416', 'CRITICAL', C.red, 'NODE-07 · on scene 6 min', '▲ SpO2 82 · VT · sepsis 0.81'],
    ['INC-0421', 'PENDING', C.amber, 'RTC, 2 casualties — N1 Mile 7', '2 MIN AGO · UNASSIGNED'],
    ['INC-0420', 'PENDING', C.amber, 'OB labour — Madina', '6 MIN AGO · OB ESCALATION 2/3'],
    ['INC-0419', 'DISPATCHED', C.cyan, 'NODE-12 · ETA scene 4 min', ''],
    ['INC-0411', 'TRANSPORT', C.green, 'NODE-19 → Korle Bu · ETA 9 min', 'PACKET ACCEPTED ✓']
  ];
  Q.forEach((q, i) => {
    const yy = 70 + i * 86;
    rect(f, 20, yy, 292, 76, { fill: C.panel, stroke: C.brass, sa: 0.5, r: 2 });
    rect(f, 20, yy, 3, 76, { fill: q[2], r: 0 });
    txt(f, q[0], 34, yy + 12, 12, C.legend, { b: true });
    chip(f, q[1], 312 - q[1].length * 5.4 - 14, yy + 11, q[2]);
    txt(f, q[3], 34, yy + 36, 11, C.legend2);
    if (q[4]) txt(f, q[4], 34, yy + 56, 9, q[2] === C.green ? C.green : C.legend3);
  });

  engv(f, 'FLEET — LIVE · CACHED TILES', 328, 52);
  rect(f, 328, 70, 560, 250, { fill: C.engrave, stroke: C.brass, sa: 0.5, r: 2 });
  for (let i = 1; i < 14; i++) rect(f, 328 + i * 40, 70, 1, 250, { fill: C.brass, alpha: 0.08, r: 0 });
  for (let i = 1; i < 7; i++) rect(f, 328, 70 + i * 36, 560, 1, { fill: C.brass, alpha: 0.08, r: 0 });
  vec(f, 'M 0 190 C 120 172, 200 152, 320 142 S 470 112, 560 92', 328, 70, 560, 250, C.brass, 5, { alpha: 0.22 });
  vec(f, 'M 80 250 C 140 182, 240 122, 380 62', 328, 70, 560, 250, C.brass, 4, { alpha: 0.14 });
  txt(f, 'N1', 342, 296, 9, C.legend3);
  const pins = [[0.22, 0.62, C.green, 'NODE-04'], [0.46, 0.70, C.amber, 'NODE-07 SCENE'],
  [0.63, 0.38, C.cyan, 'NODE-12 ENRT'], [0.80, 0.52, C.red, 'NODE-19 TRNSP']];
  pins.forEach(([px, py, col, lab]) => {
    const cx = 328 + px * 560, cy = 70 + py * 250;
    ellipse(f, cx - 9, cy - 9, 18, 18, { stroke: col, sa: 0.5 });
    ellipse(f, cx - 4.5, cy - 4.5, 9, 9, { fill: col, glow: col, gr: 8, ga: 0.6 });
    txt(f, lab, cx - lab.length * 2.5, cy + 13, 8, C.legend2);
  });
  [[0.56, 0.50, 'KORLE BU ▣ 4'], [0.71, 0.76, '37 MIL ▣ 2']].forEach(([px, py, lab]) => {
    const cx = 328 + px * 560, cy = 70 + py * 250;
    rect(f, cx - 5, cy - 5, 10, 10, { stroke: C.legend, sa: 0.8, r: 0 });
    txt(f, lab, cx - lab.length * 2.6, cy + 13, 8, C.legend2);
  });
  txt(f, '● available  ● on scene  ● en route  ● transporting   ▣ receiving hospital', 340, 296, 8, C.legend2);
  txt(f, '▭ 2 km · offline tiles', 800, 296, 8, C.legend3);

  card(f, 328, 332, 560, [
    ['CRDT replica', 'IN SYNC'],
    ['Countersigning', '1,204 RECORDS TODAY'],
    ['Mesh partitions', '2 UNITS DARK >15 MIN']
  ], 85);

  engv(f, 'ROUTING — INC-0416 (SEPSIS / VT)', 912, 52);
  rect(f, 912, 70, 348, 210, { fill: C.panel, stroke: C.brass, sa: 0.5, r: 2 });
  ['#', 'HOSPITAL', 'DIST', 'CAPABILITY', 'BEDS', 'SCORE'].forEach((h, i) => {
    txt(f, h, 924 + [0, 22, 128, 168, 262, 300][i], 84, 8, C.legend3, { b: true });
  });
  const TR = [['1', 'Korle Bu', '3.2', 'ICU·CARDIO', '4', '89', C.green],
  ['2', '37 Military', '5.8', 'ICU·CARDIO', '2', '74', C.legend],
  ['3', 'Ridge', '6.1', 'NO CARDIO', '6', '51', C.amber],
  ['✗', 'Accra Gen', '2.4', 'NO PACKET', '—', '—', C.red]];
  TR.forEach((r, i) => {
    const ry = 104 + i * 42;
    txt(f, r[0], 924, ry, 11, r[6], { b: true });
    txt(f, r[1], 946, ry, 11, C.legend, { b: true });
    txt(f, r[2], 1046, ry, 10, C.legend2);
    chip(f, r[3], 1082, ry - 4, r[6]);
    txt(f, r[4], 1180, ry, 10, C.legend2);
    txt(f, r[5], 1216, ry - 2, 13, r[6], { b: true });
  });
  btn(f, 'Confirm crew choice', 912, 296, 158, 'go');
  btn(f, 'Override — signed', 1082, 296, 158, 'stop');
  txt(f, 'Crew sees this same ranking. An override lands in the incident record with', 912, 352, 10.5, C.legend3);
  txt(f, 'your identity attached.', 912, 369, 10.5, C.legend3);
  return f;
}

/* ── 6. HOSPITAL ED ───────────────────────────────────── */
function hospital(x, y) {
  const f = scr('Hospital ED — Receive / Patient Card', x, y, 544, 900);
  bar(f, 'KORLE BU ED', 'BEDS 4 · CARDIO ON · QUEUE 2', '14:22');
  txt(f, 'INC-0411', 18, 52, 17, C.legend, { b: true });
  txt(f, '✓ SIGNED · NODE-19 · HASH OK', 118, 58, 10, C.green, { b: true });
  card(f, 18, 86, 508, [
    ['Patient', '54 M · chest pain 40 min'],
    ['Impression', 'STEMI — AI 0.93'],
    ['Vitals now', 'HR 128 · SpO2 94 · 148/92 · RR 22'],
    ['Trend', 'SpO2 89→94 · HR 141→128'],
    ['Given', 'ASA 300 mg · GTN ×2 · O2 4 L'],
    ['Protocol', 'CARDIAC 2.1 V5 · 5/5 SIG'],
    ['ETA', '9 MIN · CREW 2']
  ], 177);
  btn(f, 'Accept — reserve Resus 2', 18, 278, 508, 'go');
  btn(f, 'Query crew', 18, 326, 246, 'plain');
  btn(f, 'Refuse — reason required', 276, 326, 250, 'stop');
  txt(f, 'Accepting publishes to the mesh and countersigns the record. A refusal needs', 18, 380, 10.5, C.legend3);
  txt(f, 'a reason — it becomes part of the incident.', 18, 397, 10.5, C.legend3);

  engv(f, 'ED QUEUE · 3 WAITING', 18, 428);
  const EQ = [
    ['INC-0417', 'CRITICAL', C.red, 'Trauma, 2 vehicles — 19 M · GCS 9', 'ARRIVING 4 MIN · BAY 1 RESERVED'],
    ['INC-0415', 'TRIAGE', C.amber, 'Sepsis, 61 F · lactate 4.2 — waiting 11 min', 'BED HELD · NO UNIT EN ROUTE'],
    ['INC-0413', 'TRANSPORT', C.legend2, 'Post-op, 44 M — from 37 Military', 'ETA 22 MIN · NO PACKET YET']
  ];
  EQ.forEach((q, i) => {
    const yy = 448 + i * 86;
    rect(f, 18, yy, 508, 76, { fill: C.panel, stroke: C.brass, sa: 0.5, r: 2 });
    rect(f, 18, yy, 3, 76, { fill: q[2], r: 0 });
    txt(f, q[0], 34, yy + 12, 12, C.legend, { b: true });
    chip(f, q[1], 526 - q[1].length * 5.4 - 14, yy + 11, q[2]);
    txt(f, q[3], 34, yy + 36, 11, C.legend2);
    txt(f, q[4], 34, yy + 56, 9, C.legend3);
  });
  txt(f, 'Queue order is arrival time, not severity — severity drives the clinical tag.', 18, 712, 10.5, C.legend3);
  nav(f, ['Receive', 'Patient'], 1);
  return f;
}

/* ── 7. ARCHITECTURE ──────────────────────────────────── */
function architecture(x, y) {
  const f = scr('System Architecture', x, y, 1240, 720);
  txt(f, 'Ghana EMS — Node Architecture', 40, 28, 22, C.legend, { b: true });
  txt(f, 'One node fleet, no cloud. Every arrow works with the internet down.', 40, 58, 12, C.legend2);

  rect(f, 40, 96, 470, 560, { fill: C.panel, stroke: C.amber, sw: 2, r: 2 });
  txt(f, 'AMBULANCE (one node set per vehicle)', 60, 116, 14, C.amber, { b: true });
  rect(f, 70, 148, 180, 58, { fill: C.panel2, stroke: C.cyan, sa: 0.5, r: 2 });
  txt(f, 'Patient Monitor', 88, 164, 12, C.legend, { b: true });
  txt(f, 'Mindray / Philips / generic', 80, 184, 10, C.legend2);

  rect(f, 70, 256, 410, 98, { fill: C.panel2, stroke: C.amber, sw: 2, r: 2 });
  txt(f, 'NODE A — Sensor Tap (sealed box)', 88, 272, 13, C.amber, { b: true });
  txt(f, 'Taps monitor · append-only vitals log · survives tablet loss', 88, 296, 11, C.legend);
  txt(f, 'On-device AI: rhythm · sepsis · trauma (<300 ms)', 88, 316, 11, C.legend);

  rect(f, 70, 404, 410, 220, { fill: C.panel2, stroke: C.cyan, sa: 0.6, sw: 2, r: 2 });
  txt(f, 'NODE B — Crew Tablet', 88, 420, 13, C.cyan, { b: true });
  rect(f, 88, 446, 185, 158, { fill: C.shell, stroke: C.green, sa: 0.6, r: 2 });
  txt(f, 'C — Routing', 130, 462, 12, C.green, { b: true });
  txt(f, 'doctor on shift · facilities', 100, 486, 10, C.legend);
  txt(f, 'beds · drive time', 118, 504, 10, C.legend);
  txt(f, 'GATE: packet accepted', 104, 528, 10, C.amber, { b: true });
  rect(f, 287, 446, 175, 158, { fill: C.shell, stroke: C.red, sa: 0.6, r: 2 });
  txt(f, 'D — Trust Layer', 316, 462, 12, C.red, { b: true });
  txt(f, 'signs every record', 312, 486, 10, C.legend);
  txt(f, 'hash chain + peers verify', 300, 504, 10, C.legend);
  txt(f, 'field vitals win', 322, 522, 10, C.legend);

  vec(f, 'M 0 0 L 0 50', 160, 206, 2, 50, C.cyan, 2);
  txt(f, 'vitals', 172, 224, 10, C.cyan);
  vec(f, 'M 0 0 L 0 50', 180, 354, 2, 50, C.cyan, 2);
  vec(f, 'M 0 50 L 0 0', 205, 354, 2, 50, C.cyan, 2);
  txt(f, 'Wi-Fi Direct', 216, 374, 10, C.legend2);

  ellipse(f, 545, 236, 190, 160, { fill: C.panel, stroke: C.green, sa: 0.7, dash: [7, 5], sw: 2 });
  txt(f, 'MESH', 610, 264, 15, C.green, { b: true });
  txt(f, 'LoRa 5–15 km', 585, 288, 10, C.legend);
  txt(f, 'Wi-Fi 802.11s', 585, 304, 10, C.legend);
  txt(f, 'LTE fallback', 592, 320, 10, C.legend);
  txt(f, 'store-and-forward', 578, 342, 9, C.legend2);
  vec(f, 'M 0 0 L 35 0', 510, 316, 35, 2, C.green, 2);

  rect(f, 800, 96, 400, 165, { fill: C.panel, stroke: C.cyan, sa: 0.6, sw: 2, r: 2 });
  txt(f, 'DISPATCH NODE (control room)', 820, 118, 14, C.cyan, { b: true });
  txt(f, 'Fleet map + incident board · backup replica (CRDT)', 820, 144, 11, C.legend);
  txt(f, 'Backup routing engine + logged overrides', 820, 164, 11, C.legend);
  txt(f, 'Countersigns ambulance records', 820, 184, 11, C.legend);
  txt(f, 'Thin client: any browser (React PWA)', 820, 212, 10, C.legend2);
  vec(f, 'M 0 25 L 65 -15', 735, 221, 65, 40, C.green, 2);
  vec(f, 'M 0 -15 L 65 25', 735, 231, 65, 40, C.green, 2);

  rect(f, 800, 356, 400, 165, { fill: C.panel, stroke: C.green, sa: 0.6, sw: 2, r: 2 });
  txt(f, 'HOSPITAL NODE (ED)', 820, 378, 14, C.green, { b: true });
  txt(f, 'Receives patient packet BEFORE arrival', 820, 404, 11, C.legend);
  txt(f, 'Publishes: beds · doctor on shift · queue', 820, 424, 11, C.legend);
  txt(f, 'Accept / Query / Refuse-with-reason · countersigns', 820, 444, 11, C.legend);
  txt(f, 'Thin client: QR scanner + browser kiosk', 820, 472, 10, C.legend2);
  vec(f, 'M 0 -15 L 65 25', 735, 406, 65, 40, C.green, 2);
  vec(f, 'M 0 25 L 65 -15', 735, 421, 65, 40, C.green, 2);

  rect(f, 800, 566, 400, 80, { fill: C.panel, stroke: C.amber, r: 2, dash: [6, 4] });
  txt(f, 'PEER AMBULANCES (same node set)', 820, 586, 13, C.amber, { b: true });
  txt(f, 'Countersign each other — a forgery contradicts peer copies.', 820, 610, 11, C.legend);
  vec(f, 'M 0 0 L 0 206', 640, 396, 2, 206, C.green, 2, { dash: [5, 4] });
  vec(f, 'M 0 0 L 160 0', 640, 606, 160, 2, C.green, 2, { dash: [5, 4] });

  vec(f, 'M 0 40 C 120 90, 220 40, 315 -20', 480, 516, 320, 100, C.amber, 2, { dash: [8, 6] });
  txt(f, 'handover QR — encrypted, single-use, direct', 496, 566, 10, C.amber);
  rect(f, 40, 676, 1160, 1, { fill: C.brass, alpha: 0.4, r: 0 });
  txt(f, 'EVERY RECORD: APPEND-ONLY · HASH-CHAINED · ED25519 SIGNED · COUNTERSIGNED BY DISPATCH + PEERS', 40, 690, 10, C.legend2);
  return f;
}

async function main() {
  await loadFonts();

  // Own page, own frames. Never touches the user's pages or layers.
  const PAGE = '90 — Generated (do not edit)';
  let page = figma.root.children.find(n => n.type === 'PAGE' && n.name === PAGE);
  if (!page) {
    page = figma.createPage();
    page.name = PAGE;
  }
  figma.currentPage = page;
  for (const n of [...page.children]) {
    if (['Node B ·', 'Dispatch —', 'Hospital ED —', 'System Architecture', 'ZZ-DIAG'].some(p => n.name.startsWith(p))) n.remove();
  }

  const screens = [
    ['vitals', () => crewVitals(0, 0)],
    ['route', () => crewRoute(584, 0)],
    ['handover', () => crewHandover(1168, 0)],
    ['cpr', () => crewCpr(1752, 0)],
    ['dispatch', () => dispatch(0, 1180)],
    ['hospital', () => hospital(0, 1900)],
    ['architecture', () => architecture(620, 1900)]
  ];
  const failed = [];
  for (const [name, fn] of screens) {
    try { fn(); } catch (e) { failed.push(name + ': ' + e.message); }
  }
  const counts = page.children
    .filter(n => n.name !== 'ZZ-DIAG')
    .map(n => n.name.split('—')[0].trim() + '=' + n.children.length)
    .join('  ');
  try {
    const df = figma.createFrame(); page.appendChild(df);
    df.name = 'ZZ-DIAG'; df.x = 1900; df.y = 1180; df.resize(2400, 400);
    df.fills = solid('#FFFFFF');
    const dt = figma.createText(); df.appendChild(dt);
    dt.fontName = { family: 'Inter', style: MED };
    dt.characters =
      'v3 GENERATOR REPORT\n' +
      'fonts: ' + Object.keys(FONTS).join(', ') + '\n' +
      (failed.length ? 'SCREEN FAILURES: ' + failed.join(' | ') + '\n' : 'no screen failures\n') +
      (ERRS.length ? 'NODE ERRORS (' + ERRS.length + '): ' + ERRS.slice(0, 10).join(' | ') + '\n' : 'no node errors\n') +
      'children per frame: ' + counts;
    dt.x = 16; dt.y = 16; dt.fontSize = 20;
    dt.fills = solid('#000000');
    figma.viewport.scrollAndZoomIntoView([df]);
  } catch (e) { ERRS.push('diag:' + e.message); }
  figma.notify(failed.length || ERRS.length ? 'Problems — see ZZ-DIAG' : 'Ghana EMS v3: 7 frames generated', { error: failed.length > 0, timeout: 10000 });
  figma.closePlugin();
}
main().catch(e => { figma.notify('Fatal: ' + e.message, { error: true }); figma.closePlugin(); });

// Ghana EMS — Screen Generator v2 (clinical instrument design language)
// Rerun-safe: removes previously generated frames before drawing.

const C = {
  ink: '#0A101E', ink2: '#0E1626', panel: '#111B30', panel2: '#16223C',
  hair: '#94B2FF', txt: '#EAF0FA', dim: '#8A97B0', faint: '#5A6A85',
  phos: '#34F5A5', cyan: '#5CC8FF', amber: '#FFB224', red: '#FF5A5A',
  redDeep: '#C73333', violet: '#B79CFF', teal: '#4FD8C4', gold: '#F0B429'
};

const FONTS = {};
let FIRST_FONT = null;
async function loadFonts() {
  // v1 used plain Inter and worked; the exotic fonts + letterSpacing broke v2.
  // Load the pretty faces, but only USE them if a real text node accepts them.
  const want = [
    ['Inter', 'Medium'], ['Inter', 'Bold'], ['Inter', 'Regular'],
    ['Space Grotesk', 'Bold'], ['JetBrains Mono', 'Bold'], ['JetBrains Mono', 'Medium']
  ];
  for (const [fam, sty] of want) {
    try { await figma.loadFontAsync({ family: fam, style: sty }); FONTS[fam + '|' + sty] = true; }
    catch (e) { /* unavailable — fall back to Inter */ }
  }
  FIRST_FONT = { family: 'Inter', style: FONTS['Inter|Medium'] ? 'Medium' : 'Regular' };
}
function fname(kind, bold) {
  // Inter only. Safe everywhere, and the Figma font list is guaranteed present.
  return { family: 'Inter', style: bold ? (FONTS['Inter|Bold'] ? 'Bold' : 'Medium') : 'Medium' };
}

function rgb(h, a = 1) {
  return { r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255, a };
}
function solid(h, a = 1) { return [{ type: 'SOLID', color: rgb(h), opacity: a }]; }
function glow(h, radius, a) {
  return [{ type: 'DROP_SHADOW', color: rgb(h, a), offset: { x: 0, y: 0 }, radius, visible: true, blendMode: 'NORMAL' }];
}
const ERRS = [];
function rect(p, x, y, w, h, o = {}) {
  try {
    const n = figma.createRectangle(); p.appendChild(n);
    n.x = x; n.y = y; n.resize(w, h);
    n.fills = o.fill ? solid(o.fill, o.alpha === undefined ? 1 : o.alpha) : [];
    if (o.stroke) { n.strokes = solid(o.stroke, o.strokeAlpha === undefined ? 1 : o.strokeAlpha); n.strokeWeight = o.sw || 1; }
    if (o.r !== undefined) n.cornerRadius = o.r;
    if (o.dash) n.dashPattern = o.dash;
    if (o.glow) n.effects = glow(o.glow, o.glowR || 16, o.glowA || 0.35);
    if (o.opacity !== undefined) n.opacity = o.opacity;
    return n;
  } catch (e) { ERRS.push('rect(' + x + ',' + y + '): ' + e.message); return null; }
}
function ellipse(p, x, y, w, h, o = {}) {
  try {
    const n = figma.createEllipse(); p.appendChild(n);
    n.x = x; n.y = y; n.resize(w, h);
    n.fills = o.fill ? solid(o.fill, o.alpha === undefined ? 1 : o.alpha) : [];
    if (o.stroke) { n.strokes = solid(o.stroke, o.strokeAlpha === undefined ? 1 : o.strokeAlpha); n.strokeWeight = o.sw || 1; }
    if (o.dash) n.dashPattern = o.dash;
    if (o.glow) n.effects = glow(o.glow, o.glowR || 16, o.glowA || 0.35);
    return n;
  } catch (e) { ERRS.push('ellipse: ' + e.message); return null; }
}
function txt(p, s, x, y, size, color, o = {}) {
  try {
    const n = figma.createText(); p.appendChild(n);
    let fn = fname(o.f || 'body', !!o.b);
    try { n.fontName = fn; }
    catch (e) {
      try { n.fontName = { family: 'Inter', style: 'Medium' }; }
      catch (e2) { n.fontName = FIRST_FONT; }
    }
    n.characters = s; n.x = x; n.y = y; n.fontSize = size;
    n.fills = solid(color, o.alpha === undefined ? 1 : o.alpha);
    return n;
  } catch (e) { ERRS.push('txt("' + String(s).slice(0, 20) + '"): ' + e.message); return null; }
}
function vec(p, data, x, y, w, h, color, sw, o = {}) {
  try {
    const n = figma.createVector(); p.appendChild(n);
    n.x = x; n.y = y; n.resize(w, h); n.fills = [];
    n.strokes = solid(color, o.alpha === undefined ? 1 : o.alpha); n.strokeWeight = sw;
    if (o.dash) n.dashPattern = o.dash;
    if (o.glow) n.effects = glow(color, o.glowR || 14, o.glowA || 0.5);
    n.vectorPaths = [{ windingRule: 'NONE', data }];
    return n;
  } catch (e) { ERRS.push('vec: ' + e.message); return null; }
}
function scr(name, x, y, w, h) {
  const f = figma.createFrame(); f.name = name;
  figma.currentPage.appendChild(f);
  f.x = x; f.y = y; f.resize(w, h);
  f.fills = solid(C.ink2);
  f.cornerRadius = 22; f.clipsContent = true;
  return f;
}
function statusbar(p, left, mid, right) {
  rect(p, 0, 0, p.width, 36, { fill: C.panel, r: 0 });
  rect(p, 0, 36, p.width, 1, { fill: C.hair, alpha: 0.14, r: 0 });
  ellipse(p, 16, 15, 7, 7, { fill: C.phos, glow: true, glowR: 6, glowA: 0.5 });
  txt(p, left, 32, 12, 10, C.txt, { f: 'mono', b: true, ls: 6 });
  txt(p, mid, p.width / 2 - mid.length * 3.1, 12, 10, C.dim, { f: 'mono', ls: 6 });
  txt(p, right, p.width - 58, 12, 10, C.dim, { f: 'mono', ls: 6 });
}
function pill(p, s, x, y, color) {
  const w = s.length * 6.6 + 18;
  rect(p, x, y, w, 20, { stroke: color, strokeAlpha: 0.5, r: 10 });
  txt(p, s, x + 9, y + 5, 9, color, { f: 'mono', ls: 6 });
  return w;
}
function btn(p, s, x, y, w, kind) {
  if (kind === 'phos') { rect(p, x, y, w, 34, { fill: C.phos, r: 10, glow: true, glowR: 14, glowA: 0.3 }); txt(p, s, x + w / 2 - s.length * 3.4, y + 11, 11, '#04140C', { b: true }); }
  else if (kind === 'primary') { rect(p, x, y, w, 34, { fill: C.cyan, r: 10, glow: true, glowR: 14, glowA: 0.3 }); txt(p, s, x + w / 2 - s.length * 3.4, y + 11, 11, '#04121F', { b: true }); }
  else if (kind === 'ok') { rect(p, x, y, w, 34, { fill: C.panel2, stroke: C.phos, strokeAlpha: 0.5, r: 10 }); txt(p, s, x + w / 2 - s.length * 3.4, y + 11, 11, C.phos, { b: true }); }
  else if (kind === 'danger') { rect(p, x, y, w, 34, { fill: C.panel2, stroke: C.red, strokeAlpha: 0.5, r: 10 }); txt(p, s, x + w / 2 - s.length * 3.4, y + 11, 11, C.red, { b: true }); }
  else { rect(p, x, y, w, 34, { fill: C.panel2, stroke: C.hair, strokeAlpha: 0.24, r: 10 }); txt(p, s, x + w / 2 - s.length * 3.4, y + 11, 11, C.txt, { b: true }); }
}
function cardRow(p, x, y, w, k, v, o = {}) {
  txt(p, k, x, y, 11.5, C.dim);
  txt(p, v, x + w - v.length * (o.mono ? 7 : 6.4), y, o.size || 11.5, o.color || C.txt, { b: true, f: o.mono ? 'mono' : 'body' });
}
function eyebrow(p, s, x, y) { txt(p, s, x, y, 9.5, C.faint, { f: 'mono', ls: 14 }); }
function navbar(p, items, active) {
  const y = p.height - 46;
  rect(p, 0, y, p.width, 46, { fill: '#141E36', alpha: 0.85, r: 0 });
  rect(p, 0, y, p.width, 1, { fill: C.hair, alpha: 0.14, r: 0 });
  const w = p.width / items.length;
  items.forEach((s, i) => {
    if (i === active) rect(p, i * w + 14, y, w - 28, 2, { fill: C.phos, r: 0 });
    txt(p, s, i * w + w / 2 - s.length * 3.3, y + 18, 9, i === active ? C.phos : C.faint, { f: 'mono', ls: 6 });
  });
}
function vitalTile(p, x, y, k, v, s, state) {
  const col = state === 'bad' ? C.red : state === 'warn' ? C.amber : null;
  rect(p, x, y, 108, 70, { fill: C.panel, stroke: col || C.hair, strokeAlpha: col ? 0.5 : 0.14, r: 14 });
  txt(p, k, x + 12, y + 9, 9, C.faint, { f: 'mono', ls: 10 });
  txt(p, v, x + 12, y + 24, 21, col || C.txt, { f: 'mono', b: true });
  txt(p, s, x + 12, y + 52, 9, C.faint, { f: 'mono' });
}

// ============ 1. PARAMEDIC — LIVE VITALS ============
function paramedicVitals(x, y) {
  const f = scr('Node B · Paramedic — Live Vitals', x, y, 540, 780);
  statusbar(f, 'NODE-07', 'MESH 3 HOPS · LORA 11 KM', '14:22');
  // glass alert
  rect(f, 18, 52, 504, 128, { fill: C.redDeep, alpha: 0.28, stroke: C.red, strokeAlpha: 0.45, r: 16, glow: true, glowR: 24, glowA: 0.2 });
  ellipse(f, 34, 70, 8, 8, { fill: C.red, glow: true, glowR: 8, glowA: 0.8 });
  txt(f, 'CRITICAL — SpO2 82% · falling 4 min', 52, 65, 14.5, '#FF8585', { f: 'disp', b: true });
  txt(f, 'Protocol 4.2 (signed v7 · NAS-MD +4) — escalate: O2 via BVM 15 L.', 34, 94, 11.5, '#D8DEE9');
  txt(f, 'Sepsis risk 0.81 · rhythm VT — shockable.', 34, 112, 11.5, '#D8DEE9', { f: 'mono' });
  btn(f, 'Acknowledge', 34, 134, 104, 'ok');
  btn(f, 'Treat now', 146, 134, 88, 'primary');
  btn(f, 'False alarm', 242, 134, 92, 'plain');
  // hero vital + rail
  rect(f, 18, 196, 246, 130, { fill: C.panel, stroke: C.red, strokeAlpha: 0.4, r: 18 });
  rect(f, 18, 196, 246, 130, { fill: C.redDeep, alpha: 0.12, r: 18 });
  txt(f, 'SPO2 — WORST PARAMETER', 34, 212, 9, '#FF9B9B', { f: 'mono', ls: 12 });
  txt(f, '82', 34, 228, 62, '#FF6B6B', { f: 'mono', b: true });
  txt(f, '%', 128, 292, 13, '#FF9B9B', { f: 'mono' });
  txt(f, '▼ 96 → 82 over 30 min', 34, 306, 10.5, C.dim, { f: 'mono' });
  const rail = [
    ['HR', '128', 'bpm ▲', 'warn'], ['NIBP', '88/54', 'mmHg ▼', 'bad'],
    ['RR', '32', '/min ▲', 'warn'], ['GCS', '13', '▼ 2 in 20m', 'warn']
  ];
  rail.forEach((v, i) => vitalTile(f, 278 + (i % 2) * 122, 196 + Math.floor(i / 2) * 78, ...v));
  // ECG
  rect(f, 18, 348, 504, 130, { fill: '#05090F', stroke: C.hair, strokeAlpha: 0.14, r: 16 });
  txt(f, 'LEAD II · 250 HZ · NODE A TAP · VT', 30, 360, 9, C.faint, { f: 'mono', ls: 10 });
  let d = 'M 0 62'; const spikes = [30, 90, 150, 210, 270, 330, 390, 450];
  for (const s of spikes) d += ` L ${s - 8} 62 L ${s} 12 L ${s + 8} 100 L ${s + 14} 62`;
  d += ' L 480 62';
  vec(f, d, 30, 376, 480, 100, C.phos, 2.4, { glow: true, glowR: 12, glowA: 0.55 });
  // secondary + record
  rect(f, 18, 492, 504, 100, { fill: C.panel, stroke: C.hair, strokeAlpha: 0.14, r: 16 });
  cardRow(f, 34, 506, 472, 'Secondary', 'TEMP 38.9 · EtCO2 29 · MAP 65 ▼', { mono: true, size: 10.5 });
  cardRow(f, 34, 528, 472, 'Artefacts', '2 quarantined (motion) — excluded', { size: 10.5, color: C.dim });
  cardRow(f, 34, 550, 472, 'Lineage', '⚠ TELEMETRY GAP 34S @ 14:03 — SEQ 881→918', { mono: true, size: 9.5, color: C.amber });
  pill(f, 'SIGNED · CHAINED · 2 PEERS', 34, 568, C.phos);
  // quick log chips
  eyebrow(f, 'QUICK LOG — ONE TAP', 18, 608);
  btn(f, 'O2 15L NRB', 18, 624, 96, 'ok');
  btn(f, 'ASA 300mg', 122, 624, 96, 'plain');
  btn(f, 'IV bolus 250ml', 226, 624, 110, 'plain');
  btn(f, '⚡ CPR mode', 344, 624, 100, 'danger');
  rect(f, 18, 668, 504, 30, { fill: C.panel, stroke: C.hair, strokeAlpha: 0.14, r: 10 });
  txt(f, '14:11:37 · O2 15 L via NRB · SIGNED ✓', 32, 677, 10, C.phos, { f: 'mono' });
  txt(f, 'Node A keeps recording if this tablet dies. Field vitals are the authority.', 18, 712, 10.5, C.faint);
  navbar(f, ['Call', 'Vitals', 'Log', 'Route', 'Handover', 'Node'], 1);
  return f;
}

// ============ 2b. PARAMEDIC — CPR OVERLAY ============
function cprOverlay(x, y) {
  const f = scr('Node B · Paramedic — CPR Overlay', x, y, 540, 780);
  rect(f, 0, 0, 540, 780, { fill: '#05090F', alpha: 0.94, r: 0 });
  eyebrow(f, 'EMERGENCY', 22, 24);
  txt(f, 'CARDIAC ARREST — CPR', 22, 40, 20, C.red, { f: 'disp', b: true });
  txt(f, 'PULSE ABSENT 14:11:37 · ONSET LOGGED + SIGNED', 22, 68, 9.5, C.dim, { f: 'mono', ls: 8 });
  btn(f, '✕ Close', 440, 36, 80, 'danger');
  txt(f, '02:47', 22, 104, 46, C.red, { f: 'mono', b: true });
  ellipse(f, 190, 116, 26, 26, { fill: C.red, glow: true, glowR: 18, glowA: 0.6 });
  txt(f, '110/MIN', 178, 152, 9, C.dim, { f: 'mono', ls: 10 });
  const steps = [
    ['1', 'Compressions 100–120/min · depth 5–6 cm', 'NOW', C.phos],
    ['2', 'AED on · analyse rhythm', 'NEXT', C.amber],
    ['3', 'Shock if VT/VF · 200 J biphasic', 'SHOCK', C.red],
    ['4', 'Resume CPR 2 min · re-analyse', '', C.amber],
    ['5', 'Adrenaline 1 mg IV every 3–5 min', 'AUTO-LOGGED', C.cyan]
  ];
  steps.forEach((s, i) => {
    const yy = 190 + i * 62;
    rect(f, 22, yy, 496, 52, { fill: C.panel, stroke: C.hair, strokeAlpha: 0.14, r: 12 });
    txt(f, s[0], 38, yy + 16, 14, s[3], { f: 'mono', b: true });
    txt(f, s[1], 66, yy + 18, 12, C.txt);
    if (s[2]) pill(f, s[2], 430, yy + 16, s[3]);
  });
  txt(f, 'Every step + timestamp writes to the signed record.', 22, 524, 10.5, C.faint);
  txt(f, 'Cycle 1 analysis due at 02:00.', 22, 541, 10.5, C.faint);
  return f;
}

// ============ 2. PARAMEDIC — ROUTE ============
function paramedicRoute(x, y) {
  const f = scr('Node B · Paramedic — Route (C engine)', x, y, 540, 780);
  statusbar(f, 'NODE-07', 'MESH 3 HOPS · LORA 11 KM', '14:22');
  eyebrow(f, 'DESTINATION · C-ENGINE', 18, 56);
  txt(f, 'Where to →', 18, 72, 18, C.txt, { f: 'disp', b: true });
  const R = [
    ['1', 'Korle Bu Teaching', '3.2 KM · 8 MIN · CATH ✓ CARDIO ✓ · 4 BEDS · QUEUE 2', '89', true, false],
    ['2', '37 Military', '5.8 KM · 12 MIN · CATH ✓ CARDIO ✓ · 2 BEDS · QUEUE 5', '74', false, false],
    ['3', 'Ridge Hospital', '6.1 KM · 13 MIN · NO CARDIO TILL 18:00 · 6 BEDS', '51', false, false],
    ['✗', 'Accra General', '2.4 KM · PACKET NOT ACCEPTED — EXCLUDED', '—', false, true]
  ];
  R.forEach((r, i) => {
    const yy = 112 + i * 86;
    const o = { fill: C.panel, r: 16 };
    if (r[3] === '89') { o.stroke = C.phos; o.strokeAlpha = 1; o.glow = true; o.glowR = 16; o.glowA = 0.15; }
    else if (r[5]) { o.stroke = C.hair; o.strokeAlpha = 0.14; o.dash = [6, 4]; o.opacity = 0.55; }
    else { o.stroke = C.hair; o.strokeAlpha = 0.14; }
    rect(f, 18, yy, 504, 76, o);
    txt(f, r[0], 34, yy + 24, 21, r[3] === '89' ? C.phos : r[5] ? C.red : C.faint, { f: 'disp', b: true });
    txt(f, r[1], 70, yy + 14, 14, C.txt, { f: 'disp', b: true });
    txt(f, r[2], 70, yy + 42, 9.5, r[5] ? C.red : C.dim, { f: 'mono', ls: 2 });
    txt(f, r[3], 468, yy + 18, 21, r[3] === '89' ? C.phos : r[5] ? C.red : C.txt, { f: 'mono', b: true });
    txt(f, r[5] ? 'GATED' : 'SCORE', 466, yy + 48, 8, C.faint, { f: 'mono', ls: 10 });
  });
  rect(f, 18, 470, 504, 60, { stroke: C.red, strokeAlpha: 0.4, r: 14, dash: [6, 4] });
  rect(f, 18, 470, 504, 60, { fill: C.red, alpha: 0.06, r: 14 });
  txt(f, 'HARD GATE', 34, 482, 9.5, C.red, { f: 'mono', ls: 14 });
  txt(f, 'No accepted packet, no destination — no matter how close.', 34, 500, 11, C.dim);
  txt(f, 'Dispatch sees this list; overrides are signed.', 34, 516, 11, C.dim);
  navbar(f, ['Call', 'Vitals', 'Log', 'Route', 'Handover', 'Node'], 3);
  return f;
}

// ============ 3. PARAMEDIC — HANDOVER ============
function paramedicHandover(x, y) {
  const f = scr('Node B · Paramedic — Handover QR', x, y, 540, 780);
  statusbar(f, 'NODE-07', 'MESH 3 HOPS · LORA 11 KM', '14:22');
  eyebrow(f, 'HANDOVER', 18, 56);
  txt(f, 'INC-0421 → Korle Bu', 18, 72, 18, C.txt, { f: 'disp', b: true });
  rect(f, 18, 108, 504, 62, { fill: C.panel, stroke: C.hair, strokeAlpha: 0.14, r: 16 });
  cardRow(f, 34, 122, 472, 'Payload', 'vitals · alerts · interventions · ETA', { size: 10.5 });
  cardRow(f, 34, 146, 472, 'Integrity', 'SHA-256 ✓ · NODE-07', { mono: true, size: 10.5, color: C.phos });
  // QR
  rect(f, 172, 196, 196, 196, { fill: '#FFFFFF', r: 18, glow: true, glowR: 30, glowA: 0.12 });
  let seed = 42;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  for (let r = 0; r < 21; r++) for (let c = 0; c < 21; c++) {
    const finder = (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
    if (!finder && rnd() > 0.55) rect(f, 180 + c * 8.6, 204 + r * 8.6, 7.4, 7.4, { fill: C.ink, r: 0 });
  }
  [[0, 0], [0, 14], [14, 0]].forEach(([r, c]) => {
    rect(f, 180 + c * 8.6, 204 + r * 8.6, 60, 60, { fill: C.ink, r: 2 });
    rect(f, 189 + c * 8.6, 213 + r * 8.6, 42, 42, { fill: '#FFFFFF', r: 1 });
    rect(f, 197 + c * 8.6, 221 + r * 8.6, 26, 26, { fill: C.ink, r: 1 });
  });
  txt(f, 'ENCRYPTED · SINGLE-USE · EXPIRES 5:00', 152, 414, 10, C.amber, { f: 'mono', ls: 8 });
  txt(f, 'ED clinician scans — both sides write', 152, 442, 11.5, C.dim);
  txt(f, 'a signed audit row.', 214, 460, 11.5, C.dim);
  navbar(f, ['Call', 'Vitals', 'Log', 'Route', 'Handover', 'Node'], 4);
  return f;
}

// ============ 4. DISPATCH ============
function dispatchBoard(x, y) {
  const f = scr('Dispatch — Control Board', x, y, 1240, 660);
  statusbar(f, 'NAS ACCRA CONTROL', '41 UNITS · 27 FREE · 4 EN-ROUTE · MESH HEALTHY', '14:22');
  // --- queue pane
  eyebrow(f, 'INCIDENT QUEUE', 20, 56);
  const Q = [
    ['INC-0416', 'critical', C.red, 'NODE-07 · on scene 6 min', '▲ SpO2 82 · VT · sepsis 0.81'],
    ['INC-0421', 'pending', C.amber, 'RTC, 2 casualties — N1 Mile 7', '2 MIN AGO · UNASSIGNED'],
    ['INC-0420', 'pending', C.amber, 'OB labour — Madina', '6 MIN AGO · UNASSIGNED'],
    ['INC-0419', 'dispatched', C.cyan, 'NODE-12 · ETA scene 4 min', ''],
    ['INC-0411', 'transport', C.phos, 'NODE-19 → Korle Bu · ETA 9 min', 'PACKET ACCEPTED ✓']
  ];
  Q.forEach((q, i) => {
    const yy = 78 + i * 92;
    rect(f, 20, yy, 300, 82, { fill: C.panel, stroke: C.hair, strokeAlpha: 0.14, r: 12 });
    rect(f, 20, yy, 3, 82, { fill: q[2], r: 0 });
    txt(f, q[0], 36, yy + 12, 12, C.txt, { f: 'mono', b: true });
    pill(f, q[1].toUpperCase(), 232, yy + 10, q[2]);
    txt(f, q[3], 36, yy + 38, 10.5, C.dim);
    if (q[4]) txt(f, q[4], 36, yy + 58, 9, q[2], { f: 'mono' });
  });
  // --- map pane
  eyebrow(f, 'FLEET — LIVE (CACHED TILES)', 340, 56);
  rect(f, 340, 78, 520, 250, { fill: '#070D18', stroke: C.hair, strokeAlpha: 0.14, r: 16 });
  for (let i = 1; i < 13; i++) rect(f, 340 + i * 40, 78, 1, 250, { fill: C.hair, alpha: 0.07, r: 0 });
  for (let i = 1; i < 6; i++) rect(f, 340, 78 + i * 42, 520, 1, { fill: C.hair, alpha: 0.07, r: 0 });
  vec(f, 'M 0 190 C 120 170, 200 150, 320 140 S 450 110, 520 90', 340, 78, 520, 250, '#94B2FF', 5, { alpha: 0.18 });
  vec(f, 'M 80 250 C 140 180, 240 120, 380 60', 340, 78, 520, 250, '#94B2FF', 4, { alpha: 0.12 });
  const pins = [
    [0.22, 0.62, C.phos, 'NODE-04'], [0.46, 0.70, C.amber, 'NODE-07 ▸ SCENE'],
    [0.63, 0.38, C.cyan, 'NODE-12 ▸ ENRT'], [0.80, 0.52, C.red, 'NODE-19 ▸ TRNSP']
  ];
  pins.forEach(([px, py, col, lab]) => {
    const cx = 340 + px * 520, cy = 78 + py * 250;
    ellipse(f, cx - 9, cy - 9, 18, 18, { stroke: col, strokeAlpha: 0.5 });
    ellipse(f, cx - 4.5, cy - 4.5, 9, 9, { fill: col, glow: true, glowR: 8, glowA: 0.6 });
    txt(f, lab, cx - lab.length * 3, cy + 12, 8.5, C.dim, { f: 'mono' });
  });
  [[0.56, 0.50, 'KORLE BU ▣ 4'], [0.71, 0.76, '37 MIL ▣ 2']].forEach(([px, py, lab]) => {
    const cx = 340 + px * 520, cy = 78 + py * 250;
    rect(f, cx - 5, cy - 5, 10, 10, { fill: '#FFFFFF', r: 3 });
    txt(f, lab, cx - lab.length * 3, cy + 12, 8.5, C.dim, { f: 'mono' });
  });
  rect(f, 340, 344, 520, 74, { fill: C.panel, stroke: C.hair, strokeAlpha: 0.14, r: 16 });
  cardRow(f, 356, 358, 488, 'CRDT replica', 'IN SYNC', { mono: true, size: 10.5, color: C.phos });
  cardRow(f, 356, 380, 488, 'Countersigning', '1,204 RECORDS TODAY', { mono: true, size: 10.5 });
  cardRow(f, 356, 402, 488, 'Mesh partitions', '2 UNITS DARK >15 MIN', { mono: true, size: 10.5 });
  // --- routing pane
  eyebrow(f, 'ROUTING — INC-0416 (SEPSIS / VT)', 880, 56);
  rect(f, 880, 78, 340, 210, { fill: C.panel, stroke: C.hair, strokeAlpha: 0.14, r: 16 });
  const TR = [
    ['1', 'Korle Bu', '3.2', 'ICU·CARDIO', '4', '89', C.phos],
    ['2', '37 Military', '5.8', 'ICU·CARDIO', '2', '74', C.txt],
    ['3', 'Ridge', '6.1', 'NO CARDIO', '6', '51', C.amber],
    ['✗', 'Accra Gen', '2.4', 'NO PACKET', '—', '—', C.red]
  ];
  TR.forEach((r, i) => {
    const ry = 96 + i * 46;
    rect(f, 892, ry - 8, 316, 1, { fill: C.hair, alpha: 0.14, r: 0 });
    txt(f, r[0], 892, ry, 11, r[6], { f: 'mono', b: true });
    txt(f, r[1], 916, ry, 11.5, C.txt, { b: true });
    txt(f, r[2], 1000, ry, 10, C.dim, { f: 'mono' });
    pill(f, r[3], 1046, ry - 4, r[6]);
    txt(f, r[4], 1150, ry, 10, C.dim, { f: 'mono' });
    txt(f, r[5], 1184, ry - 2, 13, r[6], { f: 'mono', b: true });
  });
  btn(f, 'Confirm crew choice', 880, 306, 150, 'primary');
  btn(f, 'Override — signed', 1042, 306, 150, 'danger');
  txt(f, 'Crew sees this same ranking. An override lands in the', 880, 354, 10.5, C.faint);
  txt(f, 'incident record with your identity attached.', 880, 371, 10.5, C.faint);
  txt(f, 'Dispatch holds a full CRDT replica of every record and countersigns', 880, 396, 10.5, C.faint);
  txt(f, 'them — the backup survives any vehicle loss.', 880, 413, 10.5, C.faint);
  return f;
}

// ============ 5. HOSPITAL ============
function hospitalCard(x, y) {
  const f = scr('Hospital ED — Receive / Patient Card', x, y, 540, 780);
  statusbar(f, 'KORLE BU ED', 'BEDS 4 · CARDIO ON · QUEUE 2', '14:22');
  txt(f, 'INC-0411', 18, 56, 17, C.txt, { f: 'disp', b: true });
  txt(f, '✓ SIGNED · NODE-19 · HASH OK', 118, 62, 10, C.phos, { f: 'mono', ls: 6 });
  rect(f, 18, 92, 504, 190, { fill: C.panel, stroke: C.hair, strokeAlpha: 0.14, r: 16 });
  const rows = [
    ['Patient', '54 M · chest pain 40 min', {}],
    ['Impression', 'STEMI — AI 0.93', { color: C.red }],
    ['Vitals now', 'HR 128 · SpO2 94 · 148/92 · RR 22', { mono: true, size: 10.5 }],
    ['Trend', 'SpO2 89→94 · HR 141→128', { mono: true, size: 10.5 }],
    ['Given', 'ASA 300 mg · GTN ×2 · O2 4 L', {}],
    ['Protocol', 'CARDIAC 2.1 V5 · 5/5 SIG', { mono: true, size: 10.5 }],
    ['ETA', '9 MIN · CREW 2', { mono: true, color: C.cyan }]
  ];
  rows.forEach((r, i) => cardRow(f, 34, 108 + i * 24, 472, r[0], r[1], r[2]));
  btn(f, 'Accept — reserve Resus 2', 18, 300, 504, 'phos');
  f.children[f.children.length - 1];
  btn(f, 'Query crew', 18, 344, 246, 'plain');
  btn(f, 'Refuse — reason required', 276, 344, 246, 'danger');
  txt(f, 'Accepting publishes to the mesh and countersigns the record.', 18, 396, 10.5, C.faint);
  txt(f, 'A refusal needs a reason — it becomes part of the incident.', 18, 413, 10.5, C.faint);
  // accepted state
  rect(f, 18, 448, 504, 96, { fill: C.panel, stroke: C.phos, strokeAlpha: 0.4, r: 18 });
  rect(f, 18, 448, 504, 96, { fill: C.phos, alpha: 0.07, r: 18 });
  txt(f, '✓ Bed reserved — Resus 2', 150, 468, 16, C.phos, { f: 'disp', b: true });
  txt(f, 'INC-0411 · CARDIO PAGED · DR. OSEI NOTIFIED', 118, 496, 9.5, C.dim, { f: 'mono', ls: 8 });
  navbar(f, ['Receive', 'Patient'], 1);
  return f;
}

// ============ 6. ARCHITECTURE ============
function architecture(x, y) {
  const f = scr('System Architecture', x, y, 1240, 720);
  txt(f, 'Ghana EMS — Node Architecture', 40, 30, 23, C.txt, { f: 'disp', b: true });
  txt(f, 'One node fleet, no cloud. Every arrow works with the internet down.', 40, 62, 12.5, C.dim);
  // ambulance
  rect(f, 40, 100, 470, 560, { fill: C.panel, stroke: C.gold, r: 14, sw: 2 });
  txt(f, 'AMBULANCE (one node set per vehicle)', 60, 122, 14, C.gold, { f: 'disp', b: true });
  rect(f, 70, 155, 180, 60, { fill: C.panel2, stroke: C.cyan, strokeAlpha: 0.5, r: 8 });
  txt(f, 'Patient Monitor', 88, 172, 12, C.txt, { b: true });
  txt(f, 'Mindray / Philips / generic', 80, 192, 10, C.dim);
  rect(f, 70, 265, 410, 100, { fill: C.panel2, stroke: C.gold, r: 8, sw: 2 });
  txt(f, 'NODE A — Sensor Tap (sealed box)', 88, 282, 13, C.gold, { f: 'disp', b: true });
  txt(f, 'Taps monitor · append-only vitals log · survives tablet loss', 88, 306, 11, C.txt);
  txt(f, 'On-device AI: rhythm · sepsis · trauma (<300 ms)', 88, 326, 11, C.txt);
  rect(f, 70, 415, 410, 220, { fill: C.panel2, stroke: C.cyan, strokeAlpha: 0.6, r: 8, sw: 2 });
  txt(f, 'NODE B — Crew Tablet', 88, 432, 13, C.cyan, { f: 'disp', b: true });
  rect(f, 88, 458, 185, 160, { fill: '#141E36', stroke: C.phos, strokeAlpha: 0.6, r: 6 });
  txt(f, 'C — Routing', 130, 474, 12, C.phos, { f: 'disp', b: true });
  txt(f, 'doctor on shift · facilities', 100, 498, 10, C.txt);
  txt(f, 'beds · drive time', 118, 516, 10, C.txt);
  txt(f, 'GATE: packet accepted', 104, 540, 10, C.red, { b: true });
  rect(f, 287, 458, 175, 160, { fill: '#141E36', stroke: C.red, strokeAlpha: 0.6, r: 6 });
  txt(f, 'D — Trust Layer', 316, 474, 12, C.red, { f: 'disp', b: true });
  txt(f, 'signs every record', 312, 498, 10, C.txt);
  txt(f, 'hash chain + peers verify', 300, 516, 10, C.txt);
  txt(f, 'field vitals win', 322, 534, 10, C.txt);
  vec(f, 'M 0 0 L 0 50', 160, 215, 2, 50, C.cyan, 2);
  txt(f, 'vitals', 172, 234, 10, C.cyan);
  vec(f, 'M 0 0 L 0 50', 180, 365, 2, 50, C.cyan, 2);
  vec(f, 'M 0 50 L 0 0', 205, 365, 2, 50, C.cyan, 2);
  txt(f, 'Wi-Fi Direct', 216, 384, 10, C.dim);
  // mesh
  ellipse(f, 545, 240, 190, 160, { fill: '#14202E', stroke: C.phos, strokeAlpha: 0.7, dash: [7, 5], sw: 2 });
  txt(f, 'MESH', 610, 268, 15, C.phos, { f: 'disp', b: true });
  txt(f, 'LoRa 5–15 km', 585, 292, 10, C.txt, { f: 'mono' });
  txt(f, 'Wi-Fi 802.11s', 585, 308, 10, C.txt, { f: 'mono' });
  txt(f, 'LTE fallback', 592, 324, 10, C.txt, { f: 'mono' });
  txt(f, 'store-and-forward', 578, 346, 9, C.dim, { f: 'mono' });
  vec(f, 'M 0 0 L 35 0', 510, 320, 35, 2, C.phos, 2);
  // dispatch
  rect(f, 800, 100, 400, 165, { fill: C.panel, stroke: C.cyan, strokeAlpha: 0.6, r: 12, sw: 2 });
  txt(f, 'DISPATCH NODE (control room)', 820, 122, 14, C.cyan, { f: 'disp', b: true });
  txt(f, 'Fleet map + incident board · backup replica (CRDT)', 820, 148, 11, C.txt);
  txt(f, 'Backup routing engine + logged overrides', 820, 168, 11, C.txt);
  txt(f, 'Countersigns ambulance records', 820, 188, 11, C.txt);
  txt(f, 'Thin client: any browser (React PWA)', 820, 216, 10, C.dim);
  vec(f, 'M 0 25 L 65 -15', 735, 225, 65, 40, C.phos, 2);
  vec(f, 'M 0 -15 L 65 25', 735, 235, 65, 40, C.phos, 2);
  // hospital
  rect(f, 800, 360, 400, 165, { fill: C.panel, stroke: C.phos, strokeAlpha: 0.6, r: 12, sw: 2 });
  txt(f, 'HOSPITAL NODE (ED)', 820, 382, 14, C.phos, { f: 'disp', b: true });
  txt(f, 'Receives patient packet BEFORE arrival', 820, 408, 11, C.txt);
  txt(f, 'Publishes: beds · doctor on shift · queue', 820, 428, 11, C.txt);
  txt(f, 'Accept / Query / Refuse-with-reason · countersigns', 820, 448, 11, C.txt);
  txt(f, 'Thin client: QR scanner + browser kiosk', 820, 476, 10, C.dim);
  vec(f, 'M 0 -15 L 65 25', 735, 410, 65, 40, C.phos, 2);
  vec(f, 'M 0 25 L 65 -15', 735, 425, 65, 40, C.phos, 2);
  // peers
  rect(f, 800, 570, 400, 80, { fill: C.panel, stroke: C.gold, r: 12, dash: [6, 4] });
  txt(f, 'PEER AMBULANCES (same node set)', 820, 590, 13, C.gold, { f: 'disp', b: true });
  txt(f, 'Countersign each other — a forgery contradicts peer copies.', 820, 614, 11, C.txt);
  vec(f, 'M 0 0 L 0 210', 640, 400, 2, 210, C.phos, 2, { dash: [5, 4] });
  vec(f, 'M 0 0 L 160 0', 640, 610, 160, 2, C.phos, 2, { dash: [5, 4] });
  // handover
  vec(f, 'M 0 40 C 120 90, 220 40, 315 -20', 480, 520, 320, 100, C.red, 2, { dash: [8, 6] });
  txt(f, 'handover QR — encrypted, single-use, direct', 500, 570, 10, C.red);
  rect(f, 40, 680, 1160, 1, { fill: C.hair, alpha: 0.2, r: 0 });
  txt(f, 'EVERY RECORD: APPEND-ONLY · HASH-CHAINED · ED25519 SIGNED · COUNTERSIGNED BY DISPATCH + PEERS', 40, 694, 10.5, C.dim, { f: 'mono', ls: 4 });
  return f;
}

async function main() {
  await loadFonts();
  // clean previous generation
  const NAMES = ['Node B ·', 'Dispatch —', 'Hospital ED —', 'System Architecture', 'Variation', 'ZZ-DIAG'];
  for (const n of [...figma.currentPage.children]) {
    if (NAMES.some(p => n.name.startsWith(p))) n.remove();
  }
  const screens = [
    ['vitals', () => paramedicVitals(0, 0)],
    ['route', () => paramedicRoute(580, 0)],
    ['handover', () => paramedicHandover(1160, 0)],
    ['cpr', () => cprOverlay(1740, 0)],
    ['dispatch', () => dispatchBoard(0, 840)],
    ['hospital', () => hospitalCard(1300, 840)],
    ['architecture', () => architecture(0, 1680)]
  ];
  const failed = [];
  for (const [name, fn] of screens) {
    try { fn(); } catch (e) { failed.push(name + ': ' + e.message + ' @ ' + (e.stack || '').split('\n')[1]); }
  }
  const summary = figma.currentPage.children
    .filter(n => NAMES.some(p => n.name.startsWith(p)))
    .map(n => n.name.split('—')[0].trim() + '=' + ('children' in n ? n.children.length : '?'))
    .join('  ');
  let diagFrame = null;
  try {
    diagFrame = figma.createFrame();
    figma.currentPage.appendChild(diagFrame);
    diagFrame.name = 'ZZ-DIAG';
    diagFrame.x = 2400; diagFrame.y = 0;
    diagFrame.resize(2400, 500);
    diagFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    const dt = figma.createText();
    diagFrame.appendChild(dt);
    dt.fontName = FIRST_FONT;
    dt.characters =
      'FONTS: ' + Object.keys(FONTS).join(', ') + '\n' +
      (failed.length ? 'FAILED SCREENS: ' + failed.join(' || ') + '\n' : 'NO SCREEN-LEVEL FAILURES\n') +
      (ERRS.length ? 'NODE ERRORS (' + ERRS.length + '):\n' + ERRS.slice(0, 12).join('\n') : 'NO NODE ERRORS') + '\n' +
      summary;
    dt.x = 16; dt.y = 16; dt.fontSize = 22;
    dt.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  } catch (e) {
    ERRS.push('diag creation failed: ' + e.message);
  }
  if (diagFrame) {
    try { figma.viewport.scrollAndZoomIntoView([diagFrame]); } catch (e) {}
  } else {
    figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
  }
  if (failed.length || ERRS.length) figma.notify('Problems: ' + failed.length + ' screens, ' + ERRS.length + ' nodes — see ZZ-DIAG frame', { error: true, timeout: 12000 });
  figma.closePlugin();
}
main().catch(e => { figma.notify('Error: ' + e.message, { error: true }); figma.closePlugin(); });

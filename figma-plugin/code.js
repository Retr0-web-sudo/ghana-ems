// Ghana EMS — Screen Generator
// Run once: Plugins > Development > Import plugin from manifest
// Generates all thin-client screens + architecture frame as native, editable Figma layers.

const C = {
  bg: '#0D1117', panel: '#161B22', panel2: '#1F2733', line: '#30363D',
  txt: '#E6EDF3', dim: '#9DA7B3', blue: '#8AB4F8', green: '#81C995',
  amber: '#F0B429', red: '#F28B82', purple: '#E6A5F0', teal: '#7EE0C2'
};

function rgb(h) {
  return { r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 };
}
function rect(p, x, y, w, h, fill, stroke, r = 8, sw = 1) {
  const n = figma.createRectangle(); p.appendChild(n);
  n.x = x; n.y = y; n.resize(w, h);
  n.fills = fill ? [{ type: 'SOLID', color: rgb(fill) }] : [];
  if (stroke) { n.strokes = [{ type: 'SOLID', color: rgb(stroke) }]; n.strokeWeight = sw; }
  n.cornerRadius = r; return n;
}
function txt(p, s, x, y, size, color, bold = false) {
  const n = figma.createText(); p.appendChild(n);
  n.fontName = { family: 'Inter', style: bold ? 'Bold' : 'Medium' };
  n.characters = s; n.x = x; n.y = y; n.fontSize = size;
  n.fills = [{ type: 'SOLID', color: rgb(color) }]; return n;
}
function line(p, x1, y1, x2, y2, color, dash = false) {
  const n = figma.createLine(); p.appendChild(n);
  n.x = x1; n.y = y1; n.resize(Math.max(Math.abs(x2 - x1), 0.1), Math.max(Math.abs(y2 - y1), 0.1));
  if (x2 < x1 || y2 < y1) { n.rotation = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; n.resize(Math.hypot(x2 - x1, y2 - y1), 0); }
  n.strokes = [{ type: 'SOLID', color: rgb(color) }]; n.strokeWeight = 2;
  if (dash) n.dashPattern = [8, 6]; return n;
}
function scr(name, x, y, w, h) {
  const f = figma.createFrame(); f.name = name;
  figma.currentPage.appendChild(f);
  f.x = x; f.y = y; f.resize(w, h);
  f.fills = [{ type: 'SOLID', color: rgb(C.bg) }];
  f.cornerRadius = 16; f.clipsContent = true; return f;
}
function statusbar(p, left, mid, right) {
  rect(p, 0, 0, p.width, 34, C.panel2, C.line, 0);
  rect(p, 14, 14, 8, 8, C.green, null, 4);
  txt(p, left, 30, 10, 11, C.txt, true);
  txt(p, mid, p.width / 2 - 90, 10, 11, C.dim);
  txt(p, right, p.width - 60, 10, 11, C.dim);
}
function pill(p, s, x, y, color) {
  const w = s.length * 6.4 + 16;
  rect(p, x, y, w, 20, null, color, 10);
  txt(p, s, x + 8, y + 4, 10, color);
  return w;
}
function vitalTile(p, x, y, k, v, sub, state) {
  const col = state === 'bad' ? C.red : state === 'warn' ? C.amber : C.line;
  rect(p, x, y, 112, 74, C.panel2, col);
  txt(p, k, x + 44 - k.length * 2.5, y + 8, 10, C.dim);
  txt(p, v, x + 56 - v.length * 7.5, y + 24, 24, state ? col : C.txt, true);
  txt(p, sub, x + 44 - sub.length * 2.2, y + 54, 10, C.dim);
}
function cardRow(p, x, y, w, k, v) {
  txt(p, k, x, y, 12, C.dim);
  txt(p, v, x + 170, y, 12, C.txt, true);
}

// ============ 1. PARAMEDIC — LIVE VITALS ============
function paramedicVitals(x, y) {
  const f = scr('Node B · Paramedic — Live Vitals', x, y, 520, 760);
  statusbar(f, 'NODE-07 LIVE', 'mesh: 3 hops · LoRa 11 km', '14:22');
  // alert banner
  rect(f, 16, 48, 488, 110, '#3D1414', C.red, 10);
  txt(f, '██ CRITICAL ██  SpO2 82% ↓ — sustained 4 min', 32, 64, 14, C.red, true);
  txt(f, 'Protocol 4.2 (signed v7, NAS-MD +4) · Escalate: O2 via BVM 15 L', 32, 90, 11, C.txt);
  txt(f, 'Sepsis model: 0.81 HIGH', 32, 108, 11, C.txt);
  rect(f, 32, 126, 100, 24, C.panel2, C.green, 6); txt(f, 'Acknowledge', 42, 132, 10, C.green);
  rect(f, 140, 126, 80, 24, C.blue, C.blue, 6); txt(f, 'Treat now', 154, 132, 10, '#0D1117', true);
  rect(f, 228, 126, 84, 24, C.panel2, C.line, 6); txt(f, 'False alarm', 240, 132, 10, C.txt);
  // vitals grid
  const V = [
    ['HR', '128', 'bpm ↑', 'warn'], ['SpO2', '82', '% ↓', 'bad'], ['BP', '88/54', 'mmHg ↓', 'bad'], ['RR', '32', '/min ↑', 'warn'],
    ['Temp', '38.9', '°C', null], ['GCS', '13', '↓', 'warn'], ['Rhythm', 'VT', 'shockable ⚠', 'bad'], ['EtCO2', '29', 'mmHg', null]
  ];
  V.forEach((v, i) => vitalTile(f, 16 + (i % 4) * 124, 172 + Math.floor(i / 4) * 84, ...v));
  // ECG
  rect(f, 16, 344, 488, 96, '#0A0E14', C.line);
  txt(f, 'II · 250 Hz · from Node A (monitor tap)', 26, 354, 9, C.dim);
  const ecg = figma.createVector(); f.appendChild(ecg);
  ecg.x = 24; ecg.y = 368; ecg.resize(472, 64); ecg.fills = [];
  ecg.strokes = [{ type: 'SOLID', color: rgb(C.green) }]; ecg.strokeWeight = 1.6;
  let d = 'M 0 40'; const spikes = [22, 82, 142, 202, 262, 322, 382, 442];
  let px = 0;
  for (const s of spikes) { d += ` L ${s - 8} 40 L ${s} 8 L ${s + 8} 56 L ${s + 16} 40`; px = s + 16; }
  d += ' L 472 40';
  ecg.vectorPaths = [{ windingRule: 'NONE', data: d }];
  // trend + record
  rect(f, 16, 452, 488, 64, C.panel2, C.line, 10);
  txt(f, '30-min trend', 30, 466, 11, C.dim);
  txt(f, 'SpO2 96→82 ↓ · HR 88→128 ↑ · MAP 71→65 ↓', 30, 486, 11, C.txt);
  txt(f, 'Record', 380, 466, 11, C.dim);
  pill(f, 'signed · chained · 2 peers countersigned', 268, 488, C.green);
  txt(f, 'Node A records even if this tablet reboots. Field vitals are authoritative;', 16, 532, 11, C.dim);
  txt(f, 'quarantined artefacts excluded.', 16, 550, 11, C.dim);
  navbar(f, ['Call', 'Vitals', 'Log', 'Route', 'Handover', 'Node'], 1);
  return f;
}

// ============ 2. PARAMEDIC — ROUTE ============
function paramedicRoute(x, y) {
  const f = scr('Node B · Paramedic — Route (C engine)', x, y, 520, 760);
  statusbar(f, 'NODE-07 LIVE', 'mesh: 3 hops · LoRa 11 km', '14:22');
  txt(f, 'Destination — C Engine Ranking', 16, 52, 16, C.txt, true);
  pill(f, 'live', 330, 52, C.green);
  const R = [
    ['1', 'Korle Bu Teaching', '3.2 km · 8 min · cath ✓ · cardiologist ✓ · 4 beds · queue 2', '89', C.green, false],
    ['2', '37 Military', '5.8 km · 12 min · cath ✓ · cardiologist ✓ · 2 beds · queue 5', '74', C.txt, false],
    ['3', 'Ridge Hospital', '6.1 km · 13 min · cath ✓ · no cardio till 18:00 · 6 beds', '51', C.txt, false],
    ['✗', 'Accra General', '2.4 km · GATED OUT: has not accepted patient packet', '—', C.red, true]
  ];
  R.forEach((r, i) => {
    const yy = 90 + i * 84;
    rect(f, 16, yy, 488, 74, C.panel2, i === 0 ? C.green : C.line, 10);
    if (r[5]) f.children[f.children.length - 1].opacity = 0.45;
    txt(f, r[0], 30, yy + 22, 20, r[4], true);
    txt(f, r[1], 64, yy + 14, 13, C.txt, true);
    txt(f, r[2], 64, yy + 38, 10, C.dim);
    txt(f, r[3], 460, yy + 22, 20, r[4], true);
  });
  rect(f, 16, 440, 488, 70, '#101720', C.line, 10);
  txt(f, 'HARD GATE', 30, 454, 11, C.red, true);
  txt(f, 'A hospital that has not acknowledged the packet is never returned', 30, 472, 11, C.txt);
  txt(f, 'as a destination. Dispatch sees this same list; overrides are signed.', 30, 489, 11, C.txt);
  navbar(f, ['Call', 'Vitals', 'Log', 'Route', 'Handover', 'Node'], 3);
  return f;
}

// ============ 3. PARAMEDIC — HANDOVER ============
function paramedicHandover(x, y) {
  const f = scr('Node B · Paramedic — Handover QR', x, y, 520, 760);
  statusbar(f, 'NODE-07 LIVE', 'mesh: 3 hops · LoRa 11 km', '14:22');
  txt(f, 'Handover — INC-0421 → Korle Bu', 16, 52, 16, C.txt, true);
  rect(f, 16, 86, 488, 64, C.panel2, C.line, 10);
  cardRow(f, 30, 98, 460, 'Payload', 'vitals · alerts · interventions · ETA');
  cardRow(f, 30, 122, 460, 'Integrity', 'SHA-256 ✓ · signed NODE-07');
  // QR
  rect(f, 165, 170, 190, 190, '#FFFFFF', null, 12);
  let seed = 42;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  for (let r = 0; r < 21; r++) for (let c = 0; c < 21; c++) {
    const finder = (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
    if (!finder && rnd() > 0.55) rect(f, 173 + c * 8.3, 178 + r * 8.3, 7, 7, '#000000', null, 0);
  }
  [[0, 0], [0, 14], [14, 0]].forEach(([r, c]) => {
    rect(f, 173 + c * 8.3, 178 + r * 8.3, 58, 58, '#000000', null, 2);
    rect(f, 181 + c * 8.3, 186 + r * 8.3, 42, 42, '#FFFFFF', null, 1);
    rect(f, 189 + c * 8.3, 194 + r * 8.3, 26, 26, '#000000', null, 1);
  });
  txt(f, 'Encrypted · single-use · expires 5:00', 140, 380, 11, C.amber);
  txt(f, 'Receiving clinician scans with Hospital ED app.', 120, 410, 12, C.dim);
  txt(f, 'Scan writes a signed audit row on both sides.', 128, 430, 12, C.dim);
  navbar(f, ['Call', 'Vitals', 'Log', 'Route', 'Handover', 'Node'], 4);
  return f;
}

function navbar(f, items, active) {
  const y = f.height - 48;
  rect(f, 0, y, f.width, 48, C.panel2, C.line, 0);
  const w = f.width / items.length;
  items.forEach((s, i) => {
    txt(f, s, i * w + w / 2 - s.length * 3, y + 18, 11, i === active ? C.blue : C.dim, i === active);
  });
}

// ============ 4. DISPATCH BOARD ============
function dispatchBoard(x, y) {
  const f = scr('Dispatch — Control Board', x, y, 1150, 780);
  statusbar(f, 'NAS ACCRA CONTROL', '41 units · 27 available · 4 en-route · mesh healthy', '14:22');
  // map
  rect(f, 24, 52, 1102, 250, '#0A0E14', C.line, 10);
  for (let i = 0; i <= 27; i++) line(f, 24 + i * 41, 52, 24 + i * 41, 302, '#161C26');
  for (let i = 0; i <= 6; i++) line(f, 24, 52 + i * 41, 1126, 52 + i * 41, '#161C26');
  const pins = [
    [240, 150, C.green, 'NODE-04'], [520, 210, C.amber, 'NODE-07 ▸ on scene'],
    [710, 110, C.blue, 'NODE-12 ▸ enroute'], [880, 180, C.red, 'NODE-19 ▸ transport']
  ];
  pins.forEach(([px, py, col, label]) => {
    rect(f, px, py, 12, 12, col, null, 6);
    txt(f, label, px - 20, py + 18, 10, C.dim);
  });
  [[620, 165, 'Korle Bu ▣'], [790, 240, '37 Mil ▣']].forEach(([px, py, label]) => {
    rect(f, px, py, 12, 12, '#FFFFFF', null, 2);
    txt(f, label, px - 16, py + 18, 10, C.dim);
  });
  txt(f, 'OSM cached tiles — no internet needed', 900, 284, 10, C.dim);
  // kanban
  const cols = [
    ['PENDING (6)', [['INC-0421 RTC, 2 casualties', 'N1 Mile 7 · 2 min', C.red], ['INC-0420 OB labour', 'Madina · 6 min', C.amber]]],
    ['DISPATCHED (4)', [['INC-0419 NODE-12', 'ETA scene 4 min', C.dim]]],
    ['ON SCENE (3)', [['INC-0416 NODE-07', 'CRITICAL: SpO2 82 · VT · sepsis 0.81', C.amber]]],
    ['TRANSPORT (3)', [['INC-0411 NODE-19 → Korle Bu', 'ETA 9 min · packet accepted ✓', C.dim]]]
  ];
  cols.forEach(([title, cards], i) => {
    const cx = 24 + i * 160;
    txt(f, title, cx, 322, 11, C.dim, true);
    cards.forEach(([t, s, col], j) => {
      rect(f, cx, 344 + j * 84, 148, 76, C.panel2, col === C.amber ? C.amber : C.line);
      txt(f, t, cx + 8, 352 + j * 84, 10, C.txt, true);
      txt(f, s, cx + 8, 372 + j * 84, 9, col);
    });
  });
  // routing panel
  rect(f, 688, 322, 438, 290, C.panel, C.line, 10);
  txt(f, 'Routing Output — INC-0416 (sepsis/VT)', 704, 338, 14, C.txt, true);
  const rows = [
    ['1', 'Korle Bu', '3.2 km', 'ICU + cardio', '4', '89', C.green],
    ['2', '37 Military', '5.8 km', 'ICU + cardio', '2', '74', C.txt],
    ['3', 'Ridge', '6.1 km', 'no cardio till 18:00', '6', '51', C.amber],
    ['✗', 'Accra Gen', '2.4 km', 'packet not accepted', '—', '—', C.red]
  ];
  rows.forEach((r, i) => {
    const ry = 372 + i * 44;
    line(f, 704, ry - 8, 1110, ry - 8, C.line);
    txt(f, r[0], 704, ry, 12, r[6], true);
    txt(f, r[1], 730, ry, 12, C.txt, true);
    txt(f, r[2], 840, ry, 11, C.dim);
    txt(f, r[3], 910, ry, 10, r[6]);
    txt(f, r[4], 1050, ry, 12, C.dim);
    txt(f, r[5], 1090, ry, 13, r[6], true);
  });
  rect(f, 704, 552, 130, 26, C.blue, C.blue, 6); txt(f, 'Confirm crew choice', 714, 559, 10, '#0D1117', true);
  rect(f, 844, 552, 150, 26, C.panel2, C.red, 6); txt(f, 'Override (logged + signed)', 854, 559, 10, C.red);
  txt(f, 'Dispatch holds a full CRDT replica of every record and countersigns them.', 688, 636, 11, C.dim);
  txt(f, 'Backup survives any vehicle loss.', 688, 654, 11, C.dim);
  return f;
}

// ============ 5. HOSPITAL — PATIENT CARD ============
function hospitalCard(x, y) {
  const f = scr('Hospital ED — Receive / Patient Card', x, y, 520, 760);
  statusbar(f, 'KORLE BU ED NODE', 'beds 4 · cardio on shift · queue 2', '14:22');
  txt(f, 'INC-0411', 16, 52, 18, C.txt, true);
  pill(f, 'SIGNED ✓ NODE-19', 120, 52, C.green);
  rect(f, 16, 86, 488, 240, C.panel2, C.line, 10);
  const rows = [
    ['Patient', '54 M · chest pain 40 min · STEMI'],
    ['Vitals now', 'HR 128 · SpO2 94 · BP 148/92 · RR 22'],
    ['Trend', 'SpO2 89→94 after O2 · HR 141→128'],
    ['AI alerts', 'STEMI pattern 0.93 · ack by crew 14:07'],
    ['Interventions', 'ASA 300 mg · GTN 0.4 mg ×2 · O2 4 L'],
    ['Protocol', 'cardiac 2.1 v5 · 5/5 signatures'],
    ['ETA', '9 min · crew of 2']
  ];
  rows.forEach((r, i) => cardRow(f, 30, 102 + i * 30, 460, r[0], r[1]));
  rect(f, 16, 342, 160, 32, C.blue, C.blue, 8); txt(f, 'Accept — reserve bed', 30, 352, 11, '#0D1117', true);
  rect(f, 188, 342, 100, 32, C.panel2, C.line, 8); txt(f, 'Query crew', 210, 352, 11, C.txt);
  rect(f, 300, 342, 180, 32, C.panel2, C.red, 8); txt(f, 'Refuse (reason required)', 316, 352, 11, C.red);
  rect(f, 16, 396, 488, 56, '#101720', C.line, 10);
  txt(f, 'Acceptance publishes to the mesh and countersigns the record.', 30, 410, 11, C.dim);
  txt(f, 'Refusals need a reason — it becomes part of the incident record.', 30, 428, 11, C.dim);
  // accepted state preview
  rect(f, 16, 480, 488, 130, C.panel2, C.green, 10);
  txt(f, '✓ Accepted — INC-0411', 30, 496, 14, C.green, true);
  cardRow(f, 30, 524, 460, 'Bed', 'Resus 2 reserved');
  cardRow(f, 30, 548, 460, 'Team', 'Cardio paged · Dr. Osei notified');
  cardRow(f, 30, 572, 460, 'Record', 'countersigned · audit row written');
  navbar(f, ['Receive', 'Patient'], 1);
  return f;
}

// ============ 6. ARCHITECTURE ============
function architecture(x, y) {
  const f = scr('System Architecture', x, y, 1240, 720);
  txt(f, 'Ghana EMS — Node Architecture', 40, 30, 24, C.txt, true);
  txt(f, 'One node fleet, no cloud. Every arrow works with the internet down.', 40, 62, 13, C.dim);
  // ambulance
  rect(f, 40, 100, 470, 560, C.panel, C.amber, 14, 2);
  txt(f, 'AMBULANCE (one node set per vehicle)', 60, 122, 15, C.amber, true);
  rect(f, 70, 155, 180, 60, C.panel2, C.blue);
  txt(f, 'Patient Monitor', 88, 172, 12, C.txt, true);
  txt(f, 'Mindray / Philips / generic', 80, 192, 10, C.dim);
  rect(f, 70, 265, 410, 100, C.panel2, C.amber, 8, 2);
  txt(f, 'NODE A — Sensor Tap (sealed box)', 88, 282, 13, C.amber, true);
  txt(f, 'Taps monitor · append-only vitals log · survives tablet loss', 88, 306, 11, C.txt);
  txt(f, 'On-device AI: rhythm · sepsis · trauma (<300 ms)', 88, 326, 11, C.txt);
  rect(f, 70, 415, 410, 220, C.panel2, C.blue, 8, 2);
  txt(f, 'NODE B — Crew Tablet', 88, 432, 13, C.blue, true);
  rect(f, 88, 458, 185, 160, '#16202C', C.green);
  txt(f, 'C — Routing', 130, 474, 12, C.green, true);
  txt(f, 'doctor on shift · facilities', 100, 498, 10, C.txt);
  txt(f, 'beds · drive time', 118, 516, 10, C.txt);
  txt(f, 'GATE: packet accepted', 104, 540, 10, C.red, true);
  rect(f, 287, 458, 175, 160, '#16202C', C.red);
  txt(f, 'D — Trust Layer', 316, 474, 12, C.red, true);
  txt(f, 'signs every record', 312, 498, 10, C.txt);
  txt(f, 'hash chain + peers verify', 300, 516, 10, C.txt);
  txt(f, 'field vitals win', 322, 534, 10, C.txt);
  line(f, 160, 215, 160, 265, C.blue);
  txt(f, 'vitals', 172, 234, 10, C.blue);
  line(f, 180, 365, 180, 415, C.blue);
  line(f, 205, 415, 205, 365, C.blue);
  txt(f, 'Wi-Fi Direct', 216, 384, 10, C.dim);
  // mesh
  const mesh = figma.createEllipse(); f.appendChild(mesh);
  mesh.x = 545; mesh.y = 240; mesh.resize(190, 160);
  mesh.fills = [{ type: 'SOLID', color: rgb('#14202E') }];
  mesh.strokes = [{ type: 'SOLID', color: rgb(C.green) }]; mesh.strokeWeight = 2; mesh.dashPattern = [7, 5];
  txt(f, 'MESH', 610, 268, 15, C.green, true);
  txt(f, 'LoRa 5–15 km', 585, 292, 10, C.txt);
  txt(f, 'Wi-Fi 802.11s', 585, 308, 10, C.txt);
  txt(f, 'LTE fallback', 592, 324, 10, C.txt);
  txt(f, 'store-and-forward', 578, 346, 9, C.dim);
  line(f, 510, 320, 545, 320, C.green);
  // dispatch
  rect(f, 800, 100, 400, 165, C.panel, C.blue, 12, 2);
  txt(f, 'DISPATCH NODE (control room)', 820, 122, 14, C.blue, true);
  txt(f, 'Fleet map + incident board · backup replica (CRDT)', 820, 148, 11, C.txt);
  txt(f, 'Backup routing engine + logged overrides', 820, 168, 11, C.txt);
  txt(f, 'Countersigns ambulance records', 820, 188, 11, C.txt);
  txt(f, 'Thin client: any browser (React PWA)', 820, 216, 10, C.dim);
  line(f, 735, 240, 800, 200, C.green);
  line(f, 800, 230, 735, 265, C.green);
  // hospital
  rect(f, 800, 360, 400, 165, C.panel, C.green, 12, 2);
  txt(f, 'HOSPITAL NODE (ED)', 820, 382, 14, C.green, true);
  txt(f, 'Receives patient packet BEFORE arrival', 820, 408, 11, C.txt);
  txt(f, 'Publishes: beds · doctor on shift · queue', 820, 428, 11, C.txt);
  txt(f, 'Accept / Query / Refuse-with-reason · countersigns', 820, 448, 11, C.txt);
  txt(f, 'Thin client: QR scanner + browser kiosk', 820, 476, 10, C.dim);
  line(f, 735, 400, 800, 420, C.green);
  line(f, 800, 450, 735, 430, C.green);
  // peers
  rect(f, 800, 570, 400, 80, C.panel, C.amber, 12);
  f.children[f.children.length - 1].dashPattern = [6, 4];
  txt(f, 'PEER AMBULANCES (same node set)', 820, 590, 13, C.amber, true);
  txt(f, 'Countersign each other — a forgery contradicts peer copies.', 820, 614, 11, C.txt);
  line(f, 640, 400, 640, 610, C.green, true);
  line(f, 640, 610, 800, 610, C.green, true);
  // handover QR direct
  const p = figma.createVector(); f.appendChild(p);
  p.x = 480; p.y = 520; p.resize(320, 100); p.fills = [];
  p.strokes = [{ type: 'SOLID', color: rgb(C.red) }]; p.strokeWeight = 2; p.dashPattern = [8, 6];
  p.vectorPaths = [{ windingRule: 'NONE', data: 'M 0 40 C 120 90, 220 40, 315 -20' }];
  txt(f, 'handover QR — encrypted, single-use, direct', 500, 570, 10, C.red);
  // legend
  rect(f, 40, 670, 1160, 1, C.line, null, 0);
  txt(f, 'Every record: append-only · hash-chained · Ed25519 signed · countersigned by dispatch + peers', 40, 686, 12, C.dim);
  return f;
}

async function main() {
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  paramedicVitals(0, 0);
  paramedicRoute(560, 0);
  paramedicHandover(1120, 0);
  dispatchBoard(0, 820);
  hospitalCard(1200, 820);
  architecture(0, 1660);

  figma.currentPage.selection = figma.currentPage.children;
  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
  figma.notify('Ghana EMS: 6 frames generated ✓');
  figma.closePlugin();
}
main().catch(e => { figma.notify('Error: ' + e.message, { error: true }); figma.closePlugin(); });

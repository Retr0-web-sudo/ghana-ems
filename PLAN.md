# Ghana EMS — Paramedic Aid System
## Master Plan v2 (Node Architecture)

**One-liner:** A fleet of edge nodes — one sealed sensor node tapped into each ambulance's monitor, one crew tablet per vehicle — recording signed, tamper-evident patient data, running on-device AI triage, and routing patients to the right hospital over a mesh that works with zero internet.

---

## 1. System Model (the four boxes)

| Box | Name | What it is | Hardware? |
|---|---|---|---|
| **A** | Sensor Node ("Tap") | Sealed box physically wired/BLE-paired to the patient monitor. Records vitals to its own append-only storage. Records even if the tablet dies. | Yes — Pi 5 class SBC, sealed, powered from ambulance |
| **B** | Crew Node | The tablet the crew touches. Hosts **C** and **D**. | Yes — rugged Android tablet |
| **C** | Routing Engine | Picks the hospital: doctor on shift, capability match, bed/queue depth, real drive time. Software on B (backup copy at dispatch). | Software |
| **D** | Trust Layer | Signing, protocol enforcement, arbitration (field vitals win). Software on B; output countersigned by dispatch + peer ambulances. | Software |
| — | Comms Node | Mesh radio: LoRa (5–15 km) + Wi-Fi Direct + LTE fallback. Store-and-forward. | Third box, or shared with A |

**Why A and B are separate:** the tablet gets touched, dropped, stolen, wiped. The sensor doesn't. The clinical record survives the crew's device.

**Dispatch Node** — PC in the control room: fleet map, incident board, backup data store, hospital status aggregator, backup routing engine.
**Hospital Node** — small box or browser kiosk in the ED: receives the handover, publishes bed/doctor status, countersigns records.

**Hard gate rule:** a hospital that has not acknowledged receiving the ambulance's data packet is *not returned by routing at all*. No accepted packet = not a destination.

---

## 2. Hospital Selection Criteria (Node C)

| # | Criterion | Type |
|---|---|---|
| a | Doctor on shift for the required specialty, in the arrival timeframe | Score |
| b | Capability match (surgery, cath lab, ICU, maternity, burns) | Filter |
| c | **Has accepted the ambulance's data packet** | **Hard gate** |
| d | ED bed count + current queue depth | Score |
| e | Real drive time from the ambulance's actual position (traffic, market days) | Score |

Score = weighted sum of a, d, e over hospitals passing b and c. Ranking + breakdown shown to crew; dispatch sees the same output and can override (override is logged and signed).

---

## 3. Trust Layer (Node D) — plain version

1. **Every record is stamped** with the node's key so later edits show.
2. **One derived key per patient case** — a stolen key compromises one case, not the fleet's history.
3. **Hash chain** — each entry fingerprints the one before it. Rewriting history breaks the chain.
4. **Peer countersigning** — nearby ambulances and dispatch sign summaries of each other's records. A forgery contradicts copies held elsewhere; the clash surfaces automatically at next mesh contact.
5. **Field vitals win.** The ambulance reading is first, pre-treatment, and the trend is what detects sepsis/shock/arrhythmia. Hospital values are a separate authority domain (ED assessment, diagnosis, outcome) — appended, never overwriting. Bad readings (probe off, motion artefact) are quarantined, not trusted and not deleted.
6. **Protocols are signed by a 3-of-5 council** (NAS Medical Director + ED consultant + paramedic training lead + paeds/OB reviewer + College of Physicians/MoH rep). Nodes refuse to load unsigned protocols. Emergency single-signed interim expires in 30 days.

**Blocker:** one named person at Ghana's National Ambulance Service (NAS) must agree to be lead signer. That memo goes out before any hardware order.

---

## 4. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Node A OS | Raspberry Pi OS Lite (64-bit) | Cheap, fanless, low power |
| Node A software | Rust or Go daemon, SQLite WAL, Ed25519 | Single binary, append-only log |
| Monitor interface | BLE GATT + RS-232/RJ45 serial per model | Mindray, Philips, generic Chinese monitors |
| Node B | Flutter (Android) | Offline-first, small APK, good BLE |
| AI on node | TFLite INT8 models: rhythm (shockable?), sepsis risk, trauma severity | <300 ms total on low-end hardware, no cloud |
| Dispatch | React + TypeScript PWA, Leaflet map (cached OSM tiles) | Runs in any browser, offline-capable |
| Hospital | Same PWA, receiver view + QR scanner | No install |
| Mesh | LoRa (SX1262 modules) + Wi-Fi Direct + LTE fallback, MQTT store-and-forward | Works with internet down |
| Sync | CRDT (Automerge) over mesh; dispatch is backup replica | Eventual consistency, no single point of failure |
| Handover | Encrypted QR (patient JSON + SHA-256), single-use, 5-min expiry | Offline phone-to-phone |

---

## 5. Phases

### Phase 0 — Spikes (Weeks 1–2) — de-risk before buying fleet hardware
- **S1. Monitor tap:** read live ECG + SpO₂ + NIBP from one Mindray and one generic monitor. Pass = <2 s latency, continuous stream.
- **S2. Mesh range:** LoRa point-to-point in Accra urban + one rural corridor. Pass = usable link at 5 km urban / 12 km rural.
- **S3. AI latency:** 3 quantized models run sequentially on target hardware. Pass = <300 ms total, <50 MB RAM.
- **S4. Power:** Node A + comms run 8 h from ambulance 12 V with safe shutdown. Pass = no corruption on hard power cut.

### Phase 1 — Data & Trust (Weeks 3–4)
- Shared SQLite schema (vitals, interventions, incidents, hospitals, protocols, signatures)
- D layer: per-case keys, hash chain, countersigning, protocol verification
- FleetView record format (the thing that survives inquiries)

### Phase 2 — Node A (Weeks 4–7)
- Monitor drivers (Mindray BLE, Philips IEEE 11073, generic serial)
- Quality gate (lead-off, probe displacement, motion artefact → quarantine)
- Local AI pipeline (30 s sliding window → 3 models → rule fusion → alerts)
- API for Node B over Wi-Fi Direct

### Phase 3 — Node B (Weeks 5–8)
- Flutter app: New Call → Live Vitals → Intervention Log → Route → Handover QR → Node Health
- Dose calculator from Ghana essential medicines formulary
- Protocol browser (signed protocols only)

### Phase 4 — Dispatch & Hospital (Weeks 6–9)
- Dispatch PWA: fleet map, incident Kanban, routing output panel, override logging
- Hospital receiver: QR scan → patient card → Accept/Query/Refuse-with-reason
- Bed/doctor status publisher (manual entry first, API later)

### Phase 5 — Mesh & Pilot (Weeks 9–12)
- Mesh agent: store-and-forward, CRDT sync, countersign exchange
- Bench test: 2 ambulances + dispatch + hospital, internet cut, full incident lifecycle
- Field pilot: 2 NAS vehicles, 1 dispatch room, 2 receiving hospitals, 30 days

---

## 6. Open Questions (answer before Phase 1)

1. Which monitor models are actually in NAS ambulances today? (decides S1 drivers)
2. Who at NAS signs the governance memo? (unblocks D)
3. Ghana NCA spectrum rules for our LoRa band — license needed?
4. Hospital bed/doctor roster: is there any existing data feed, or manual entry?
5. Power and mounting rules for equipment in NAS vehicles?
6. Language: English-only at pilot, or Twi UI strings from day one?

---

## 7. What Success Looks Like (pilot exit criteria)

- Full incident recorded end-to-end with **internet disabled** for the whole run
- Hospital received and accepted the packet before arrival in ≥90% of cases
- AI alert latency <5 s from monitor to tablet banner
- Zero record-gaps from tablet reboot/loss (Node A kept recording)
- One completed fatality-inquiry drill: export a signed incident package that answers *what happened, what was required, who approved the standard*

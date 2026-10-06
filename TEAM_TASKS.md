# Team Task Distribution — Ghana EMS

Five workstreams. Each task has an ID, owner role, phase, and definition of done.
Assign names to workstreams; one person can hold two streams on a small team.

---

## WS1 — Hardware & Firmware (Node A + Comms)

| ID | Task | Phase | Done when |
|---|---|---|---|
| HW-01 | Procure dev kits: 2× Pi 5, 2× LoRa SX1262 HATs, 12 V PSU, enclosures | 0 | Parts on bench |
| HW-02 | Spike S1: Mindray BLE driver — live ECG/SpO₂/NIBP stream | 0 | <2 s latency, 10 min continuous |
| HW-03 | Spike S1b: generic Chinese monitor serial driver | 0 | Same data via RS-232 |
| HW-04 | Spike S4: 12 V power + safe-shutdown circuit | 0 | No corruption on 20 hard cuts |
| HW-05 | Node A daemon: ingest → quality gate → append-only SQLite | 2 | Survives reboot mid-write |
| HW-06 | Node A API (Wi-Fi Direct, serves Node B) | 2 | Tablet connects, streams vitals |
| HW-07 | Sealed enclosure + vehicle mount | 5 | Passes vibration + heat test |

## WS2 — AI / ML

| ID | Task | Phase | Done when |
|---|---|---|---|
| AI-01 | Spike S3: benchmark 3 TFLite INT8 models on Pi 5 | 0 | <300 ms total, <50 MB RAM |
| AI-02 | Rhythm model (shockable / non-shockable) | 2 | Validated on test set, report written |
| AI-03 | Sepsis risk model (vitals + history) | 2 | Same |
| AI-04 | Trauma severity model | 2 | Same |
| AI-05 | Rule fusion engine + alert thresholds (clinical review required) | 2 | Alert fires <5 s from monitor |
| AI-06 | False-alarm feedback loop (field marks → retune) | 5 | Thresholds updated from pilot data |

## WS3 — Frontend (Node B tablet + Dispatch PWA + Hospital PWA)

| ID | Task | Phase | Done when |
|---|---|---|---|
| FE-01 | Paramedic app shell: New Call → Live Vitals → Log → Route → Handover → Node Health | 3 | All 6 screens navigable offline |
| FE-02 | Live vitals grid + ECG strip + alert banner | 3 | Renders Node A stream in real time |
| FE-03 | Intervention log + dose calculator (Ghana formulary) | 3 | Paeds dose per kg auto-computed |
| FE-04 | Hospital ranking screen with score breakdown | 3 | Matches routing engine output |
| FE-05 | Handover QR generator + scanner | 3–4 | Offline phone-to-phone transfer |
| FE-06 | Dispatch board: fleet map + incident Kanban + routing panel | 4 | Live updates over mesh |
| FE-07 | Hospital receiver: patient card + Accept/Query/Refuse | 4 | Accept writes back to mesh |

## WS4 — Backend / Mesh / Trust (Node D)

| ID | Task | Phase | Done when |
|---|---|---|---|
| BE-01 | Shared SQLite schema (all entities, both platforms) | 1 | Migrations run on Pi + Android + WASM |
| BE-02 | Trust layer: per-case keys, hash chain, Ed25519 signing | 1 | Tamper test: edited row detected |
| BE-03 | Protocol signing tool + 3-of-5 verification | 1 | Node refuses unsigned protocol |
| BE-04 | Spike S2: LoRa range test (Accra urban + rural) | 0 | 5 km urban / 12 km rural |
| BE-05 | Mesh agent: MQTT store-and-forward + CRDT sync | 5 | Records converge after 30 min partition |
| BE-06 | Peer countersigning exchange | 5 | Forgery contradicts peer copy |
| BE-07 | Routing engine (criteria a–e, hard gate c, override logging) | 4 | Ranked list + reasons, gate enforced |

## WS5 — Clinical & Governance

| ID | Task | Phase | Done when |
|---|---|---|---|
| CG-01 | Governance memo to NAS — named lead signer | 0–1 | Signature obtained |
| CG-02 | Protocol library v1: airway, cardiac, trauma, OB, paeds | 1 | Reviewed, signed 3-of-5 |
| CG-03 | Vitals reference ranges by age/condition | 1 | Clinician-approved |
| CG-04 | Ghana essential medicines formulary import | 1 | Doses verified by pharmacist |
| CG-05 | Hospital registry: GPS, capabilities, contacts | 1 | ≥10 receiving hospitals |
| CG-06 | Fatality-inquiry drill script + export format | 5 | Dry run completed |

---

## Dependency map (what blocks what)

```
CG-01 ──▶ CG-02 ──▶ BE-03 ──▶ FE-01
HW-02/03 ──▶ HW-05 ──▶ HW-06 ──▶ FE-02
AI-01 ──▶ AI-02/03/04 ──▶ AI-05 ──▶ FE-02 (alerts)
BE-01 ──▶ BE-02 ──▶ BE-06
BE-04 ──▶ BE-05 ──▶ FE-06
CG-04 ──▶ FE-03        CG-05 ──▶ BE-07 ──▶ FE-04/FE-06
All ──▶ Phase 5 bench test ──▶ pilot
```

## Weekly cadence suggestion

- **Mon:** workstream leads sync (30 min, blockers only)
- **Wed:** clinical review office hour (CG stream available)
- **Fri:** demo whatever runs — hardware on bench counts

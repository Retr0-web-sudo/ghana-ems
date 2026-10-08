# Ghana EMS — Paramedic Aid System

**v3 — "instrument faceplate"** — plan, architecture, and clickable prototypes for a node-based emergency medical system for Ghana's National Ambulance Service (NAS).

Not one app — a fleet of edge nodes:

| Node | What it is |
|---|---|
| **A — Sensor Tap** | Sealed box wired to the patient monitor. Append-only vitals recording that survives tablet loss. Runs on-device AI (rhythm / sepsis / trauma). |
| **B — Crew Node** | The tablet the crew touches. Hosts C + D. |
| **C — Routing Engine** | Picks the hospital: doctor on shift · facility match · beds/queue · real drive time. **Hard gate: no accepted packet = not a destination.** |
| **D — Trust Layer** | Signs every record (hash-chained, per-case keys, peer countersigned). Enforces 3-of-5 signed protocols. Field vitals win. |
| **Dispatch Node** | Fleet map, incident board, CRDT backup replica, routing backup. |
| **Hospital Node** | Receives patient packets pre-arrival, publishes bed/doctor status, countersigns handover. |

All linked by a **LoRa / Wi-Fi mesh with LTE fallback** — the whole system works with the internet down.

## The v3 design language — "instrument faceplate"

The brief: a paramedic in a moving ambulance at night, gloved hands, one thumb, glancing at the screen
for 2–5 seconds while doing something else. So the interface is built like a **medical instrument
faceplate**, not a web dashboard:

- **Casing** warm graphite `#14110F` (Bakelite), **sodium amber** `#F5A524` primary (Accra sodium
  street-lamp *and* real monitor annunciator amber), **cyan** `#7FD4F5` for live signal, red reserved
  for critical only, brass `#C9A961` hairlines. 2px corners — instruments don't have rounded ones.
- **Type** Archivo (display) + IBM Plex Sans / Mono (tabular figures). No Inter, no Space Grotesk.
- **Signature — the physiological range rail.** Every vital is a marker on a track spanning
  shock-floor → safe band → shock-ceiling, with numeric end-labels. You read *position within
  physiology*, not just a number. Same rail reused for CPR compression rate.
- **One loud thing**: the critical annunciator. Everything else stays quiet.
- Destractor actions ("False alarm") are rendered as the *quietest* control on screen.

## Repo contents

```
PLAN.md                  Master plan v2 (phases, stack, open questions, pilot exit criteria)
TEAM_TASKS.md            5 workstreams, 26 tasks with done-when criteria + dependency map
diagrams/
  architecture.svg       System interaction diagram
  incident-flow.svg      8-step incident lifecycle (who acts + what gets recorded)
prototypes/
  index.html             Clickable prototypes: Crew · Dispatch · Hospital ED (standalone, no build)
  v3-*.png               Screenshots of the v3 design
figma-plugin/            Figma plugin that generates all screens as native editable frames
tools/resume-figma.ps1   One-click: launches Figma and runs the generator
```

## Run the prototype

Open `prototypes/index.html` in any browser — no build, no server, no dependencies.
Screens: **Call → Vitals → Treat → Route → Handover → Node**, plus a CPR mode overlay
(live elapsed clock + compression-rate target rail + 110/min metronome).

## Get the designs into Figma

Import `figma-plugin/manifest.json` via **Plugins → Development → Import plugin from manifest**,
then run **Ghana EMS Screen Generator** (or **Ctrl+Alt+P** for "Run last plugin"). Double-clicking the
**Resume Ghana EMS** desktop shortcut does both for you.

The generator is **non-destructive**: it writes to its own page, `90 — Generated (do not edit)`, and
only ever deletes frames from that page. It will not touch hand-made pages or layers.

It also writes a white **ZZ-DIAG** frame listing loaded fonts, any node-level errors, and the child
count for every frame. If a frame comes out empty, that report says exactly why.

## Status

Simulation/design build. No real patient data. Clinical content is placeholder pending NAS protocol
council sign-off (see PLAN.md §3 — the governance memo is the first real-world task).

# Ghana EMS — Paramedic Aid System

**v1 Sim Build** — plan, architecture, and clickable prototypes for a node-based emergency medical system for Ghana's National Ambulance Service (NAS).

Not one app — a fleet of edge nodes:

| Node | What it is |
|---|---|
| **A — Sensor Tap** | Sealed box wired to the patient monitor. Append-only vitals recording that survives tablet loss. Runs on-device AI (rhythm / sepsis / trauma). |
| **B — Crew Tablet** | What the crew touches. Hosts C + D. |
| **C — Routing Engine** | Picks the hospital: doctor on shift · facility match · beds/queue · real drive time. **Hard gate: no accepted packet = not a destination.** |
| **D — Trust Layer** | Signs every record (hash-chained, per-case keys, peer countersigned). Enforces 3-of-5 signed protocols. Field vitals win. |
| **Dispatch Node** | Fleet map, incident board, CRDT backup replica, routing backup. |
| **Hospital Node** | Receives patient packets pre-arrival, publishes bed/doctor status, countersigns handover. |

All linked by a **LoRa / Wi-Fi mesh with LTE fallback** — the whole system works with the internet down.

## Repo contents

```
PLAN.md                  Master plan v2 (phases, stack, open questions, pilot exit criteria)
TEAM_TASKS.md            5 workstreams, 26 tasks with done-when criteria + dependency map
diagrams/
  architecture.svg       System interaction diagram
  incident-flow.svg      8-step incident lifecycle (who acts + what gets recorded)
prototypes/
  index.html             Clickable prototypes: Paramedic · Dispatch · Hospital (standalone, no build)
  shot-*.png             Screenshots of the three clients
figma-plugin/            Figma plugin that generates all screens as native editable frames
```

## Run the prototype

Open `prototypes/index.html` in any browser — no build, no server, no dependencies.
Click through: vitals alert → treat → route → handover QR, then switch tabs to Dispatch and Hospital.

## Get the designs into Figma

See `figma-plugin/README.md` — import the manifest as a dev plugin, run once, get 6 native frames.
(Alternative: Figma's `html.to.design` plugin on the served prototype.)

## Status

Simulation/design build. No real patient data. Clinical content is placeholder pending NAS protocol council sign-off (see PLAN.md §3 — the governance memo is the first real-world task).

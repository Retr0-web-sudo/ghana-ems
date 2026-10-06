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
  v2-*.png               Screenshots of the v2 design
figma-plugin/            Figma plugin that generates all screens as native editable frames
```

## Run the prototype

Open `prototypes/index.html` in any browser — no build, no server, no dependencies.
Click through: vitals alert → treat → route → handover QR, then switch tabs to Dispatch and Hospital.
On the Vitals screen: **CPR mode** opens the arrest overlay (live timer + 110/min metronome), the
one-tap quick-log chips write signed entries, and the lineage row flags a telemetry gap.

## Get the designs into Figma

Import `figma-plugin/manifest.json` via **Plugins → Development → Import plugin from manifest**,
then run **Ghana EMS Screen Generator** (or just press **Ctrl+Alt+P** for "Run last plugin").

It generates 7 native, editable frames and cleans up its previous output on every run, so you can
re-run it as often as you like. A white **ZZ-DIAG** frame also gets created listing loaded fonts,
any node-level errors, and the child count per screen — if a frame comes out empty, that frame
tells you exactly why.

> Note: the plugin is rerun-safe (it deletes frames matching its own naming before regenerating).
> The Figma AI agent may leave "Variation" frames behind if you trigger it by accident — rerunning
> the plugin clears those too.

## Status

Simulation/design build. No real patient data. Clinical content is placeholder pending NAS protocol
council sign-off (see PLAN.md §3 — the governance memo is the first real-world task).

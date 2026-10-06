# Figma Plugin — Ghana EMS Screen Generator

Generates all thin-client screens + the architecture diagram as **native, editable Figma frames** (no images, real layers).

## Install (one time, 30 seconds)

1. Open Figma (desktop app or browser)
2. Menu → **Plugins → Development → Import plugin from manifest…**
3. Select `figma-plugin/manifest.json` from this repo

## Run

1. Create a new Figma file (or open your project file)
2. Menu → **Plugins → Development → Ghana EMS Screen Generator**
3. Done — 6 frames appear on the canvas:

| Frame | Contents |
|---|---|
| Node B · Live Vitals | Alert banner, 8-tile vitals grid, ECG vector, trend/record card |
| Node B · Route | C-engine hospital ranking with hard-gated hospital |
| Node B · Handover QR | Encrypted QR + payload card |
| Dispatch — Control Board | Fleet map, 4-column incident Kanban, routing output table |
| Hospital ED — Patient Card | Signed packet view + Accept/Query/Refuse + accepted state |
| System Architecture | Full node topology (A/B/C/D, mesh, dispatch, hospital, peers) |

Everything is standard Figma layers — recolor, rearrange, prototype with Smart Animate, wire flows with Figma's built-in prototyping.

## Regenerating

Just run the plugin again. It appends a fresh set of frames (delete the old ones first if you want a clean canvas).

# Turkey Run — The Great Thanksgiving Escape

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/nonicon/turkey-run-escape/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/nonicon/turkey-run-escape/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

**Turkey Run — The Great Thanksgiving Escape.** Thanksgiving is coming,
the farmer is sharpening his carving knife, and the oven is already hot.
You are the turkey. Run 1,500 metres through the farmyard, the barn and
the kitchen, dodge fences, hay bales, flying carving knives and a roaring
oven, grab corn for points — and reach freedom before the farmer catches
you. This time in full 3D: a low-poly farm at autumn dusk, built with
Three.js.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no
network requests: the game is plain static files under `game/`, with
Three.js vendored as `game/vendor/three.min.js`.

## How to play

- **Arrow keys / A D** — steer
- **Space / W / Up** — jump
- **S / Down** — duck under beams and flying knives
- **Click / Shift** — dash (buys distance from the farmer)
- **P** — pause, **M** — sound on/off, **R** — restart

The farmer chases you from behind: every stumble lets him close in, and
when he gets too close he sprints — dash away or be caught. Jump the
fences, hay bales, pumpkins, crates, ovens and rolling pins; duck the barn
beams and the carving knives. Corn is worth 50 points, a golden feather
150. Three lives, 1,500 metres, zero mercy. Reach the finish and the
turkey escapes.

## What is inside

- `game/index.html` — the page shell, canvas and HUD overlays
- `game/style.css` — autumn-dusk styling for the HUD and menus
- `game/src/config.js` — every tuning number in one place
- `game/src/random.js` — seeded random generator, so screenshot seeds are stable
- `game/src/textures.js` — procedural canvas textures: grass, dirt path, wood, hay, sky
- `game/src/turkey.js` — the turkey mesh, built from primitives, and its run cycle
- `game/src/farmer.js` — the farmer mesh and his chase animation
- `game/src/obstacles.js` — hazard and collectible meshes: oven, knife, fence, corn …
- `game/src/world.js` — scene, lights, fog, scrolling farm, physics, farmer AI
- `game/src/hud.js` — HUD, title screen, pause and end screens
- `game/src/audio.js` — synthesized WebAudio effects and music, no audio files
- `game/src/input.js` — keyboard and mouse input
- `game/src/shots.js` — deterministic screenshot scenes with an autopilot
- `game/src/main.js` — game loop, screens, and shot mode
- `main.ts` — the make.fun hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`

The farm has three stages — the farmyard (0–500 m), the barn (500–1,000 m)
and the kitchen (1,000–1,500 m) — each with its own hazards and palette.
Screenshots are real renders of the game, staged deterministically with
`shots.json` (see `game/src/shots.js`).

## Hand-in

`main.ts` (Node 22+, standard library only) copies `game/` and
`screenshots/` to `/output` and writes `/output/dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Run it twice: both runs must write identical bytes.

---

<sub>Entered on [make.fun](https://make.fun/?ref=nonicon&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>

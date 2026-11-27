// Turkey Run 3D — The Great Thanksgiving Escape, a turkey-run-game-01 entry.
// (Node 22+, standard library only.) The game is the static files under
// game/: a Three.js turkey runner that opens in desktop Chrome and plays
// with no network request. This program hands it in: it copies game/ and
// screenshots/ from beside this file into /output and writes
// /output/dossier.json, the summary the judge reads, using the vendored
// make.fun library.
//
// Play it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The game first: every static file the browser needs, nothing else.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });

// Then the screenshots: four real renders of the 3D game in a browser.
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The dossier: the scorer's own caps, so the entry it describes is one the
// gate accepts — at most 4 screenshots of 256 KiB each, at most 993 files
// and 48 MiB under game/, and no game path over 1,000 bytes. The text of
// the game's own sources is capped at 160 KiB; the vendored three.js build
// is listed as vendored, never shown as source.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

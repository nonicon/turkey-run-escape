// Game entry point: the loop, the screens, and the wiring between input,
// world, sound and the HUD. In shot mode (?shot=start|play|kitchen|end&
// seed=N) it stages one deterministic scene and draws it once, so a
// screenshot is a real frame of the game.
import { STEP_SECONDS } from './config.js';
import { World, EVENT_HIT, EVENT_COLLECT, EVENT_FEATHER, EVENT_CAUGHT, EVENT_ESCAPED, EVENT_SPOTTED } from './world.js';
import { Hud, SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER, SCREEN_PAUSED } from './hud.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const world = new World(20261127, canvas);
const hud = new Hud();
const sound = new SoundBank();
const input = new Input(canvas);

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') ?? 20261127) || 20261127;

let screen = SCREEN_TITLE;
let best = 0;
try {
  best = Number(window.localStorage.getItem('turkey-run-best') ?? 0) || 0;
} catch {
  best = 0;
}

// A handle for automated checks: the live world and screen, read-only.
window.__game = { world, get screen() { return screen; } };

function saveBest() {
  if (world.score <= best) return;
  best = world.score;
  try {
    window.localStorage.setItem('turkey-run-best', String(best));
  } catch {
    // Storage may be unavailable on a hosted page; the best score is a bonus.
  }
}

function startRun() {
  // Every live run gets a fresh farm; shot mode keeps its query seed.
  if (!shotName) world.seed = (Math.random() * 2147483647) | 0;
  world.reset();
  screen = SCREEN_PLAY;
  hud.showPlay();
  hud.showBanner('RUN! THE FARMER IS COMING!', 2.2);
  sound.unlock();
  sound.click();
}

function endRun() {
  saveBest();
  screen = SCREEN_OVER;
  hud.showEnd(world, best);
}

function readControls() {
  return {
    steer: input.steerDirection(),
    jump: input.jumpPressed(),
    duck: input.duckHeld(),
    dash: input.dashPressed(),
  };
}

function handleSounds(events) {
  if (world.jumpHappened) {
    sound.jump();
    world.jumpHappened = false;
  }
  if (world.dashHappened) {
    sound.dash();
    world.dashHappened = false;
  }
  if (events & EVENT_COLLECT) sound.collect();
  if (events & EVENT_FEATHER) sound.feather();
  if (events & EVENT_HIT) {
    sound.hit();
    sound.squawk();
  }
  if (events & EVENT_SPOTTED) sound.alarm();
  if (events & EVENT_ESCAPED) sound.win();
  if (events & EVENT_CAUGHT) sound.lose();
}

function update(dt) {
  if (screen === SCREEN_TITLE) {
    // The title scene idles: the world strolls so the backdrop feels alive.
    world.step(dt, { steer: 0, jump: false, duck: false, dash: false });
    if (world.over || world.time > 14) world.reset();
    if (input.jumpPressed() || input.pressed.has('Enter') || input.consumeClick()) {
      startRun();
    }
  } else if (screen === SCREEN_PLAY) {
    const events = world.step(dt, readControls());
    handleSounds(events);
    if (world.farmer.state === 'sprint' && world.farmer.gap < 2) {
      hud.showBanner('HE IS RIGHT BEHIND YOU — DASH!', 1.2);
    }
    if (world.over) endRun();
    if (input.pressed.has('KeyP') || input.pressed.has('Escape')) {
      screen = SCREEN_PAUSED;
      hud.showPaused();
    }
  } else if (screen === SCREEN_PAUSED) {
    if (input.pressed.has('KeyP') || input.pressed.has('Escape') || input.jumpPressed()) {
      screen = SCREEN_PLAY;
      hud.hidePaused();
    }
  } else if (screen === SCREEN_OVER) {
    if (input.pressed.has('KeyR') || input.pressed.has('Enter') || input.jumpPressed()) {
      startRun();
    }
  }
  if (input.pressed.has('KeyM')) {
    sound.unlock();
    sound.toggleMute();
  }
  sound.updateMusic(screen === SCREEN_PLAY);
  hud.updateBanner(dt);
  input.endFrame();
}

function draw() {
  world.render();
  if (screen === SCREEN_PLAY || screen === SCREEN_PAUSED) hud.update(world);
}

// Shot mode: stage the scene once and draw it, then stop. The frame is the
// screenshot. The world is seeded from the query so every shot is stable.
if (shotName) {
  world.seed = seed;
  const staged = stageShot(shotName, world);
  screen = staged.screen;
  best = staged.best;
  sound.muted = true;
  if (screen === SCREEN_TITLE) hud.showTitle(best);
  else if (screen === SCREEN_OVER) hud.showEnd(world, best);
  else hud.showPlay();
  document.getElementById('loading').remove();
  // Keep re-rendering the frozen frame until the shot is taken: the
  // software renderer presents slowly, and a single draw can be missed by
  // the screenshot. The world does not step, so the frame stays identical.
  draw();
  let presented = 0;
  function presentShot() {
    draw();
    presented += 1;
    if (presented === 4) {
      document.title = `Turkey Run — shot ${shotName}`;
      window.__shotReady = true;
    }
    window.requestAnimationFrame(presentShot);
  }
  window.requestAnimationFrame(presentShot);
} else {
  hud.showTitle(best);
  let last = performance.now();
  let accumulator = 0;
  function frame(now) {
    const elapsed = Math.min(0.1, (now - last) / 1000);
    last = now;
    accumulator += elapsed;
    while (accumulator >= STEP_SECONDS) {
      update(STEP_SECONDS);
      accumulator -= STEP_SECONDS;
    }
    draw();
    requestAnimationFrame(frame);
  }
  document.getElementById('loading').remove();
  requestAnimationFrame(frame);
}

// The HUD and the menu screens of Turkey Run 3D, drawn as DOM overlays on
// top of the WebGL canvas: crisp text at any size, and readable screenshots.
import { GOAL_DISTANCE_M, STAGES } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';
export const SCREEN_PAUSED = 'paused';

export class Hud {
  constructor() {
    this.hud = document.getElementById('hud');
    this.score = document.getElementById('hud-score');
    this.distance = document.getElementById('hud-distance');
    this.stage = document.getElementById('hud-stage');
    this.lives = document.getElementById('hud-lives');
    this.dash = document.getElementById('hud-dash');
    this.banner = document.getElementById('banner');
    this.title = document.getElementById('title-screen');
    this.end = document.getElementById('end-screen');
    this.paused = document.getElementById('paused-screen');
    this.endTitle = document.getElementById('end-title');
    this.endText = document.getElementById('end-text');
    this.endScore = document.getElementById('end-score');
    this.endBest = document.getElementById('end-best');
    this.titleBest = document.getElementById('title-best');
    this.bannerTimer = 0;
  }

  showBanner(text, seconds) {
    this.banner.textContent = text;
    this.banner.classList.remove('hidden');
    this.bannerTimer = seconds || 1.6;
  }

  updateBanner(dt) {
    if (this.bannerTimer <= 0) return;
    this.bannerTimer -= dt;
    if (this.bannerTimer <= 0) this.banner.classList.add('hidden');
  }

  /** Refresh the running HUD from the world state. */
  update(world) {
    const stageName = STAGES[world.stage].name;
    this.score.textContent = `SCORE ${Math.floor(world.score)}`;
    this.distance.textContent = `${Math.floor(world.distanceM)} m / ${GOAL_DISTANCE_M} m`;
    this.stage.textContent = stageName;
    this.lives.textContent = '♥'.repeat(Math.max(0, world.lives)) + '♡'.repeat(Math.max(0, 3 - world.lives));
    const dashReady = world.turkey.dashCooldown <= 0;
    this.dash.textContent = dashReady ? 'DASH READY — CLICK OR SHIFT' : 'DASH …';
    this.dash.classList.toggle('ready', dashReady);
  }

  showTitle(best) {
    this.title.classList.remove('hidden');
    this.end.classList.add('hidden');
    this.paused.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.titleBest.textContent = best > 0 ? `BEST SCORE: ${Math.floor(best)}` : 'A THANKSGIVING ESCAPE IN 3D';
  }

  showPlay() {
    this.title.classList.add('hidden');
    this.end.classList.add('hidden');
    this.paused.classList.add('hidden');
    this.hud.classList.remove('hidden');
  }

  showPaused() {
    this.paused.classList.remove('hidden');
  }

  hidePaused() {
    this.paused.classList.add('hidden');
  }

  showEnd(world, best) {
    this.hud.classList.add('hidden');
    this.title.classList.add('hidden');
    this.paused.classList.add('hidden');
    this.end.classList.remove('hidden');
    if (world.escaped) {
      this.endTitle.textContent = 'ESCAPED!';
      this.endText.textContent = 'The turkey outran the farmer, dodged the oven and the carving knife, and is free for another year. Thanksgiving is cancelled — for the turkey, anyway.';
    } else {
      this.endTitle.textContent = 'CAUGHT!';
      this.endText.textContent = 'The farmer finally got his hands on the turkey. The oven was already warm… but every great escape deserves another try.';
    }
    this.endScore.textContent = `SCORE ${Math.floor(world.score)}  •  ${Math.floor(world.distanceM)} m`;
    this.endBest.textContent = `BEST SCORE: ${Math.floor(best)}`;
  }
}

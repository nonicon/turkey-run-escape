// Screenshot scenes behind ?shot=start|play|kitchen|end&seed=N. Each scene
// plays the real rules forward from a fresh world for a fixed number of
// steps, steered by a simple autopilot (jump the jumpable, duck under the
// high, steer to the open lane, dash when the farmer sprints), so every
// frame is what a real game looks like and the same seed gives the same
// frame.
import { STEP_SECONDS } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './hud.js';

const START_SECONDS = 5;
const PLAY_SECONDS = 22;
const END_LIMIT_SECONDS = 600;
const SAMPLE = 1 / 30;
const HORIZON_PLAY = 1.5;
const HORIZON_END = 0.4;

/** The nearest obstacle in the turkey's own lane within `horizon` seconds. */
function nextThreat(world, horizon) {
  const speed = Math.max(world.speed, 1);
  let threat = null;
  let threatTime = Infinity;
  for (const obstacle of world.obstacles) {
    // A threat is any obstacle the turkey's body would overlap on contact.
    if (Math.abs(obstacle.x - world.turkey.x) > obstacle.def.width / 2 + 0.4) continue;
    const gap = -obstacle.z;
    if (gap < -1 || gap > speed * horizon + 6) continue;
    const time = Math.max(0, gap / speed);
    if (time < threatTime) {
      threatTime = time;
      threat = obstacle;
    }
  }
  return { threat, threatTime };
}

/** Pick the lane with the least trouble ahead, from the three run lanes. */
function safestLane(world) {
  const lanes = [-1.9, 0, 1.9];
  const speed = Math.max(world.speed, 1);
  let bestLane = world.turkey.x;
  let bestScore = -Infinity;
  for (const lane of lanes) {
    let score = -Math.abs(lane - world.turkey.x) * 0.6;
    for (const obstacle of world.obstacles) {
      const gap = -obstacle.z;
      if (gap < -1 || gap > speed * 1.6 + 6) continue;
      // A lane is blocked when the turkey's body would overlap the obstacle
      // there; a lane with only a hair of clearance is nearly as bad.
      const clearance = Math.abs(obstacle.x - lane) - (obstacle.def.width / 2 + 0.35);
      if (clearance < 0) score -= (1.6 - Math.min(1.6, gap / speed)) * 10 + 5;
      else if (clearance < 0.25) score -= 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestLane = lane;
    }
  }
  return bestLane;
}

/** Steer to the open lane, jump the jumpable, duck under the high. */
function autopilot(world, horizon) {
  const controls = { steer: 0, jump: false, duck: false, dash: false };
  const speed = Math.max(world.speed, 1);
  // When a hazard is about to arrive anywhere near the turkey, hold the
  // lane: crossing the track then would run the turkey into the hazard
  // mid-transit. Jump or duck instead, and steer again once it has passed.
  let nearestTime = Infinity;
  for (const obstacle of world.obstacles) {
    if (Math.abs(obstacle.x - world.turkey.x) > 2.2) continue;
    const gap = -obstacle.z;
    if (gap < -1) continue;
    nearestTime = Math.min(nearestTime, Math.max(0, gap / speed));
  }
  if (nearestTime >= 1.0) {
    const targetLane = safestLane(world);
    const dx = targetLane - world.turkey.x;
    if (dx > 0.1) controls.steer = 1;
    else if (dx < -0.1) controls.steer = -1;
  }
  const { threat, threatTime } = nextThreat(world, horizon);
  if (threat) {
    if (threat.def.clear === 'jump' && threatTime < 0.55 && threatTime > 0.1 && world.turkey.grounded) controls.jump = true;
    if (threat.def.clear === 'duck' && world.turkey.grounded) {
      // Jump clean over the high hazard when there is time; duck under it
      // when it is already too close to jump.
      if (threatTime < 0.5 && threatTime > 0.1) controls.jump = true;
      else if (threatTime < 0.7) controls.duck = true;
    }
  }
  // Corn is a bonus, never a reason to leave the safe lane: chasing it
  // across the track once steered the turkey straight into a hay bale, so
  // the autopilot holds its lane and takes only the corn that comes to it.
  if (world.farmer.gap < 2.6 && world.turkey.dashCooldown <= 0) controls.dash = true;
  return controls;
}

/**
 * Set `world` to the named scene (start, play, kitchen or end) and return
 * the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'end' && name !== 'kitchen') {
    // The title scene: a short autopilot run, so the turkey is mid-stride
    // with the farm behind it and the farmer in pursuit.
    for (let step = 0; step < START_SECONDS / SAMPLE; step += 1) {
      world.step(SAMPLE, autopilot(world, HORIZON_PLAY));
    }
    return { screen: SCREEN_TITLE, best: 0 };
  }
  const limit = name === 'end' ? END_LIMIT_SECONDS : PLAY_SECONDS;
  const horizon = name === 'end' ? HORIZON_END : HORIZON_PLAY;
  for (let step = 0; step < limit / SAMPLE; step += 1) {
    world.step(SAMPLE, autopilot(world, horizon));
    if (world.over) break;
  }
  // The kitchen scene runs until the turkey reaches the kitchen (past
  // 1,000 m), however long that takes, so the frame shows the ovens and
  // the carving knives.
  if (name === 'kitchen') {
    for (let step = 0; step < 9000 / SAMPLE && world.distanceM < 1060 && !world.over; step += 1) {
      world.step(SAMPLE, autopilot(world, HORIZON_PLAY));
    }
  }
  const over = world.over;
  // Freeze any shake or flash so the frame is identical every time.
  world.shake = 0;
  world.flash = 0;
  return { screen: over ? SCREEN_OVER : SCREEN_PLAY, best: world.score };
}

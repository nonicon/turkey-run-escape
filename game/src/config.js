// Tuning for Turkey Run 3D: The Great Thanksgiving Escape.
// Every number that shapes how the run feels lives here, so the rest of the
// game stays about rules, meshes and light. Units are metres; the turkey runs
// down -Z while the farm scrolls past it towards the camera.
export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;
export const STEP_SECONDS = 1 / 60;

export const LANE_HALF = 2.4;
export const TURKEY_Z = 0;
export const CAMERA_OFFSET = { x: 0, y: 4.6, z: 8.2 };
export const CAMERA_LOOK = { x: 0, y: 1.1, z: -8 };

export const GRAVITY = 26;
export const JUMP_SPEED = 11.5;
export const STEER_SPEED = 9;
export const DUCK_TIME = 0.45;
export const DASH_TIME = 0.35;
export const DASH_COOLDOWN = 2.4;
export const DASH_SPEED_BONUS = 7;

export const GOAL_DISTANCE_M = 1500;
export const BASE_SPEED = 11;
export const MAX_SPEED = 17;
export const STUMBLE_TIME = 0.9;
export const STUMBLE_SPEED_FACTOR = 0.7;
export const INVULNERABLE_TIME = 2.0;

export const START_LIVES = 3;
export const CORN_SCORE = 50;
export const FEATHER_SCORE = 150;
export const METER_SCORE = 2;

export const FARMER_START_GAP = 3.4;
export const FARMER_CATCH_GAP = 1.1;
export const FARMER_SEARCH_GAP = 5.2;
export const FARMER_SPRINT_GAP = 1.9;
export const FARMER_BASE_SPEED = 9.6;

// Distance bands (metres) where the run moves from the farmyard, through the
// barn, and into the kitchen. Each stage brings its own dangers and palette.
export const STAGES = [
  { name: 'THE FARMYARD', from: 0, to: 500, sky: 0xffb36b, fog: 0xf7c489, ground: 0x8a6b3f, grass: 0x7fae4e },
  { name: 'THE BARN', from: 500, to: 1000, sky: 0xe08a4e, fog: 0xe8a06a, ground: 0x7d5a34, grass: 0x5d8a44 },
  { name: 'THE KITCHEN', from: 1000, to: 1500, sky: 0xc65a3a, fog: 0xd98a5e, ground: 0x6e4f30, grass: 0x4c6b3a },
];

// Obstacle catalogue. `clear` tells the player how to beat it: jump over it
// or duck under it. `stage` limits where it can appear (0 farmyard, 1 barn,
// 2 kitchen). `height` is the top of the solid part in metres.
export const OBSTACLES = {
  fence: { width: 1.6, height: 1.1, depth: 0.4, clear: 'jump', stages: [0, 1], score: 10 },
  haybale: { width: 2.4, height: 1.5, depth: 1.4, clear: 'jump', stages: [0, 1], score: 15 },
  pumpkin: { width: 1.1, height: 0.8, depth: 1.0, clear: 'jump', stages: [0], score: 10 },
  crate: { width: 1.5, height: 1.2, depth: 1.2, clear: 'jump', stages: [1], score: 10 },
  pitchfork: { width: 0.5, height: 1.9, depth: 0.4, clear: 'jump', stages: [1], score: 20 },
  beam: { width: 2.6, height: 1.1, depth: 0.5, clear: 'duck', stages: [1], hang: true, score: 20 },
  oven: { width: 2.6, height: 2.2, depth: 1.6, clear: 'jump', stages: [2], score: 25 },
  pot: { width: 1.4, height: 0.9, depth: 1.2, clear: 'jump', stages: [2], score: 10 },
  knife: { width: 2.2, height: 0.5, depth: 0.3, clear: 'duck', stages: [2], fly: true, score: 25 },
  rollingPin: { width: 1.9, height: 0.6, depth: 0.5, clear: 'jump', stages: [2], score: 20 },
};

export const COLLECTIBLES = {
  corn: { radius: 0.35, score: CORN_SCORE },
  feather: { radius: 0.3, score: FEATHER_SCORE },
};

// How far ahead of the turkey obstacles and scenery may spawn, in metres.
export const SPAWN_AHEAD = 70;
export const DESPAWN_BEHIND = 12;

// Spacing between obstacle rows grows tighter as the run gets faster.
export const ROW_GAP_MIN = 20;
export const ROW_GAP_MAX = 30;

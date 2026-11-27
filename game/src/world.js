// The world of Turkey Run 3D: the dusk farm, the scrolling ground, the
// obstacles, the collectibles and the farmer who never stops chasing. One
// fixed step advances the run; the renderer draws whatever the step built.
import {
  STEP_SECONDS, LANE_HALF, CAMERA_OFFSET, CAMERA_LOOK, GRAVITY, JUMP_SPEED,
  STEER_SPEED, DUCK_TIME, DASH_TIME, DASH_COOLDOWN, DASH_SPEED_BONUS,
  GOAL_DISTANCE_M, BASE_SPEED, MAX_SPEED, STUMBLE_TIME, STUMBLE_SPEED_FACTOR,
  INVULNERABLE_TIME, START_LIVES, CORN_SCORE, FEATHER_SCORE, METER_SCORE,
  FARMER_START_GAP, FARMER_CATCH_GAP, FARMER_SEARCH_GAP, FARMER_SPRINT_GAP,
  FARMER_BASE_SPEED, STAGES, OBSTACLES, COLLECTIBLES, SPAWN_AHEAD,
  DESPAWN_BEHIND, ROW_GAP_MIN, ROW_GAP_MAX,
} from './config.js';
import { makeRandom, randomFloat, randomInt, randomPick } from './random.js';
import { makeGroundTexture, makePathTexture, makeWoodTexture, makeHayTexture, makeSkyTexture } from './textures.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { buildObstacle, buildCorn, buildFeather } from './obstacles.js';

export const EVENT_HIT = 1;
export const EVENT_COLLECT = 2;
export const EVENT_FEATHER = 4;
export const EVENT_CAUGHT = 8;
export const EVENT_ESCAPED = 16;
export const EVENT_SPOTTED = 32;

const OBSTACLE_TYPES_BY_STAGE = [
  ['fence', 'haybale', 'pumpkin'],
  ['fence', 'haybale', 'crate', 'pitchfork', 'beam'],
  ['oven', 'pot', 'knife', 'rollingPin'],
];

export class World {
  constructor(seed, canvas) {
    this.seed = seed;
    this.canvas = canvas;
    this.random = makeRandom(seed);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;

    this.scene = new THREE.Scene();
    this.scene.background = makeSkyTexture();
    this.scene.fog = new THREE.Fog(0xf7c489, 26, 78);
    this.camera = new THREE.PerspectiveCamera(58, 1280 / 720, 0.1, 220);
    this.camera.position.set(CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z);
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.textures = {
      ground: makeGroundTexture(this.random),
      path: makePathTexture(this.random),
      wood: makeWoodTexture(this.random),
      hay: makeHayTexture(this.random),
    };
    this.buildLights();
    this.buildGround();
    this.turkeyMesh = new Turkey();
    this.scene.add(this.turkeyMesh.group);
    this.farmerMesh = new Farmer();
    this.scene.add(this.farmerMesh.group);
    this.obstacles = [];
    this.collectibles = [];
    this.scenery = [];
    this.nextRowAt = 30;
    this.nextSceneryAt = 8;
    this.shake = 0;
    this.flash = 0;
    this.reset();
  }

  /** Size the renderer to the canvas as laid out, keeping the camera honest. */
  resize() {
    const width = this.canvas.clientWidth || 1280;
    const height = this.canvas.clientHeight || 720;
    // Resizing reallocates the drawing buffer, so skip it when nothing
    // changed: a stray resize event must not blank a finished frame.
    if (this.renderer.getSize(new THREE.Vector2()).x === width
      && this.renderer.getSize(new THREE.Vector2()).y === height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  buildLights() {
    this.sun = new THREE.DirectionalLight(0xffb36b, 1.15);
    this.sun.position.set(-14, 22, 10);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -18;
    this.sun.shadow.camera.right = 18;
    this.sun.shadow.camera.top = 24;
    this.sun.shadow.camera.bottom = -30;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 70;
    this.sun.shadow.bias = -0.0004;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
    this.hemi = new THREE.HemisphereLight(0x9a7ab8, 0x5d4a2e, 0.75);
    this.scene.add(this.hemi);
    this.fill = new THREE.DirectionalLight(0xffe0b0, 0.3);
    this.fill.position.set(10, 8, 14);
    this.scene.add(this.fill);
  }

  buildGround() {
    const groundMaterial = new THREE.MeshStandardMaterial({ map: this.textures.ground, roughness: 1 });
    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 220), groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.set(0, 0, -70);
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
    const pathMaterial = new THREE.MeshStandardMaterial({ map: this.textures.path, roughness: 1 });
    this.path = new THREE.Mesh(new THREE.PlaneGeometry(7, 220), pathMaterial);
    this.path.rotation.x = -Math.PI / 2;
    this.path.position.set(0, 0.02, -70);
    this.path.receiveShadow = true;
    this.scene.add(this.path);
    // A low horizon hill line, so the dusk sky has something to sit on.
    const hillMaterial = new THREE.MeshStandardMaterial({ color: 0x5d6b3a, roughness: 1 });
    [-1, 1].forEach((side) => {
      const hill = new THREE.Mesh(new THREE.SphereGeometry(30, 16, 10), hillMaterial);
      hill.scale.set(1.6, 0.16, 0.7);
      hill.position.set(side * 46, -1, -80);
      this.scene.add(hill);
    });
  }

  reset() {
    for (const obstacle of this.obstacles) this.scene.remove(obstacle.mesh);
    for (const item of this.collectibles) this.scene.remove(item.mesh);
    for (const prop of this.scenery) this.scene.remove(prop.mesh);
    this.obstacles = [];
    this.collectibles = [];
    this.scenery = [];
    this.random = makeRandom(this.seed);
    this.time = 0;
    this.distance = 0;
    this.distanceM = 0;
    this.score = 0;
    this.lives = START_LIVES;
    this.speed = BASE_SPEED;
    this.stage = 0;
    this.over = false;
    this.escaped = false;
    this.caught = false;
    this.turkey = { x: 0, y: 0, vy: 0, grounded: true, duckTimer: 0, dashTimer: 0, dashCooldown: 0 };
    this.farmer = { gap: FARMER_START_GAP, state: 'chase' };
    this.stumbleTimer = 0;
    this.invulnerableTimer = 0;
    this.nextRowAt = 34;
    this.nextSceneryAt = 6;
    this.shake = 0;
    this.flash = 0;
    this.hits = [];
    this.trace = [];
    this.jumpHappened = false;
    this.dashHappened = false;
    this.applyStage(0);
    this.turkeyMesh.group.position.set(0, 0, 0);
    this.turkeyMesh.group.visible = true;
    this.farmerMesh.group.position.set(0.6, 0, FARMER_START_GAP);
    this.farmerMesh.group.visible = true;
  }

  stageFor(distanceM) {
    if (distanceM >= STAGES[2].from) return 2;
    if (distanceM >= STAGES[1].from) return 1;
    return 0;
  }

  applyStage(stage) {
    this.stage = stage;
    const palette = STAGES[stage];
    this.scene.fog.color.setHex(palette.fog);
    this.sun.color.setHex(stage === 2 ? 0xff8a4e : 0xffb36b);
    this.ground.material.color.setHex(palette.ground);
  }

  currentSpeed() {
    const progress = Math.min(1, this.distanceM / GOAL_DISTANCE_M);
    let speed = BASE_SPEED + (MAX_SPEED - BASE_SPEED) * progress;
    if (this.stumbleTimer > 0) speed *= STUMBLE_SPEED_FACTOR;
    if (this.turkey.dashTimer > 0) speed += DASH_SPEED_BONUS;
    return speed;
  }

  spawnRow() {
    const stage = this.stage;
    const types = OBSTACLE_TYPES_BY_STAGE[stage];
    const count = this.random() < 0.45 ? 2 : 1;
    const lanes = [-1.9, 0, 1.9].sort(() => this.random() - 0.5);
    for (let i = 0; i < count; i += 1) {
      const type = randomPick(this.random, types);
      const def = OBSTACLES[type];
      const mesh = buildObstacle(type, this.textures);
      mesh.position.set(lanes[i], 0, -SPAWN_AHEAD);
      this.scene.add(mesh);
      this.obstacles.push({ type, def, mesh, x: lanes[i], z: -SPAWN_AHEAD, passed: false });
    }
    // A trail of corn sometimes follows a row, and a rare golden feather.
    if (this.random() < 0.55) {
      const cornLane = randomPick(this.random, [-1.7, 0, 1.7]);
      const cornCount = randomInt(this.random, 2, 4);
      for (let i = 0; i < cornCount; i += 1) {
        const mesh = buildCorn();
        mesh.position.set(cornLane, 0, -SPAWN_AHEAD - 2 - i * 2.2);
        this.scene.add(mesh);
        this.collectibles.push({ kind: 'corn', mesh, x: cornLane, z: -SPAWN_AHEAD - 2 - i * 2.2, taken: false });
      }
    } else if (this.random() < 0.12) {
      const featherLane = randomPick(this.random, [-1.7, 0, 1.7]);
      const mesh = buildFeather();
      mesh.position.set(featherLane, 0, -SPAWN_AHEAD - 3);
      this.scene.add(mesh);
      this.collectibles.push({ kind: 'feather', mesh, x: featherLane, z: -SPAWN_AHEAD - 3, taken: false });
    }
    this.nextRowAt = this.distance + randomFloat(this.random, ROW_GAP_MIN, ROW_GAP_MAX);
  }

  spawnScenery() {
    const side = this.random() < 0.5 ? -1 : 1;
    const kind = randomPick(this.random, ['tree', 'tree', 'bush', 'rock', 'fenceRun', 'pumpkinPatch']);
    const x = side * randomFloat(this.random, 5, 15);
    const mesh = this.buildScenery(kind);
    mesh.position.set(x, 0, -SPAWN_AHEAD - 6);
    this.scene.add(mesh);
    this.scenery.push({ mesh, z: -SPAWN_AHEAD - 6 });
    if (this.stage === 1 && this.random() < 0.2) {
      const barn = this.buildBarn();
      barn.position.set(-side * 11, 0, -SPAWN_AHEAD - 10);
      this.scene.add(barn);
      this.scenery.push({ mesh: barn, z: -SPAWN_AHEAD - 10 });
    }
    this.nextSceneryAt = this.distance + randomFloat(this.random, 4, 9);
  }

  buildScenery(kind) {
    const group = new THREE.Group();
    if (kind === 'tree') {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.8, 8), new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 1 }));
      trunk.position.y = 0.9;
      trunk.castShadow = true;
      group.add(trunk);
      const leaves = new THREE.MeshStandardMaterial({ color: this.random() < 0.5 ? 0xc25a1e : 0xd98a2e, roughness: 1 });
      for (let i = 0; i < 3; i += 1) {
        const blob = new THREE.Mesh(new THREE.SphereGeometry(1.1 - i * 0.22, 10, 8), leaves);
        blob.position.y = 2.2 + i * 0.8;
        blob.castShadow = true;
        group.add(blob);
      }
    } else if (kind === 'bush') {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), new THREE.MeshStandardMaterial({ color: 0x5d8a44, roughness: 1 }));
      bush.scale.y = 0.7;
      bush.position.y = 0.5;
      bush.castShadow = true;
      group.add(bush);
    } else if (kind === 'rock') {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), new THREE.MeshStandardMaterial({ color: 0x8a8078, roughness: 1 }));
      rock.position.y = 0.35;
      rock.rotation.set(this.random(), this.random() * 3, this.random());
      rock.castShadow = true;
      group.add(rock);
    } else if (kind === 'fenceRun') {
      const fence = buildObstacle('fence', this.textures);
      fence.position.y = 0;
      group.add(fence);
      const fence2 = buildObstacle('fence', this.textures);
      fence2.position.set(0, 0, -2);
      group.add(fence2);
    } else {
      for (let i = 0; i < 3; i += 1) {
        const pumpkin = buildObstacle('pumpkin', this.textures);
        pumpkin.position.set((i - 1) * 0.9, 0, (i % 2) * 0.6);
        group.add(pumpkin);
      }
    }
    return group;
  }

  buildBarn() {
    const group = new THREE.Group();
    const red = new THREE.MeshStandardMaterial({ color: 0xa83226, roughness: 0.9 });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(7, 4.5, 6), red);
    walls.position.y = 2.25;
    walls.castShadow = true;
    group.add(walls);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 6.2, 3, 1), new THREE.MeshStandardMaterial({ color: 0x5d3a22, roughness: 1 }));
    roof.rotation.x = Math.PI / 2;
    roof.rotation.z = Math.PI / 2;
    roof.scale.set(1, 1, 0.62);
    roof.position.y = 4.5;
    roof.castShadow = true;
    group.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3, 0.15), new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.9 }));
    door.position.set(0, 1.5, 3.05);
    group.add(door);
    return group;
  }

  /** Advance the run by one fixed step. Returns an event bitmask. */
  step(dt, controls) {
    let events = 0;
    if (this.over) return events;
    this.time += dt;
    // A short ring buffer of recent steps, for debugging and verification.
    this.trace.push({
      d: Math.floor(this.distance), x: Number(this.turkey.x.toFixed(2)), y: Number(this.turkey.y.toFixed(2)),
      steer: controls.steer || 0, jump: !!controls.jump, duck: !!controls.duck,
      gap: Number(this.farmer.gap.toFixed(2)),
    });
    if (this.trace.length > 400) this.trace.shift();
    const turkey = this.turkey;

    // Steering, jumping, ducking and dashing.
    const steer = controls.steer || 0;
    turkey.x = Math.max(-LANE_HALF, Math.min(LANE_HALF, turkey.x + steer * STEER_SPEED * dt));
    if (controls.jump && turkey.grounded && turkey.duckTimer <= 0) {
      turkey.vy = JUMP_SPEED;
      turkey.grounded = false;
      this.jumpHappened = true;
    }
    if (controls.duck && turkey.grounded) turkey.duckTimer = DUCK_TIME;
    if (controls.dash && turkey.dashCooldown <= 0 && turkey.dashTimer <= 0) {
      turkey.dashTimer = DASH_TIME;
      turkey.dashCooldown = DASH_COOLDOWN;
      this.dashHappened = true;
    }
    turkey.vy -= GRAVITY * dt;
    turkey.y += turkey.vy * dt;
    if (turkey.y <= 0) {
      turkey.y = 0;
      turkey.vy = 0;
      turkey.grounded = true;
    }
    if (turkey.duckTimer > 0) turkey.duckTimer -= dt;
    if (turkey.dashTimer > 0) turkey.dashTimer -= dt;
    if (turkey.dashCooldown > 0) turkey.dashCooldown -= dt;

    // Forward motion: distance, speed and the stage it belongs to.
    this.speed = this.currentSpeed();
    const advance = this.speed * dt;
    this.distance += advance;
    this.distanceM = this.distance;
    const stage = this.stageFor(this.distanceM);
    if (stage !== this.stage) this.applyStage(stage);

    // The farmer: he sprints when close, searches when far, and catches the
    // turkey when the gap closes. A stumble lets him lunge nearer.
    const farmer = this.farmer;
    let farmerSpeed = FARMER_BASE_SPEED;
    if (farmer.gap < FARMER_SPRINT_GAP) {
      farmerSpeed += 2.4;
      if (farmer.state !== 'sprint') {
        farmer.state = 'sprint';
        events |= EVENT_SPOTTED;
      }
    } else if (farmer.gap > FARMER_SEARCH_GAP) {
      farmerSpeed -= 1.6;
      farmer.state = 'search';
    } else {
      farmer.state = 'chase';
    }
    farmer.gap += (this.speed - farmerSpeed) * dt;
    farmer.gap = Math.max(0.4, Math.min(9, farmer.gap));
    if (farmer.gap <= FARMER_CATCH_GAP) {
      events |= this.hitTurkey('caught');
      farmer.gap = FARMER_START_GAP;
      if (this.over) events |= EVENT_CAUGHT;
    }

    if (this.stumbleTimer > 0) this.stumbleTimer -= dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 3);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 2.5);

    // Spawn rows and scenery ahead of the turkey.
    if (this.distance >= this.nextRowAt) this.spawnRow();
    if (this.distance >= this.nextSceneryAt) this.spawnScenery();

    // Scroll everything towards the camera and cull what passed it.
    const move = advance;
    for (const obstacle of this.obstacles) {
      obstacle.z += move;
      obstacle.mesh.position.z = obstacle.z;
      if (!obstacle.passed && obstacle.z > 1) {
        obstacle.passed = true;
        this.score += obstacle.def.score;
      }
    }
    for (const item of this.collectibles) {
      item.z += move;
      item.mesh.position.z = item.z;
      item.mesh.rotation.y += dt * 2;
    }
    for (const prop of this.scenery) {
      prop.z += move;
      prop.mesh.position.z = prop.z;
    }
    this.obstacles = this.obstacles.filter((obstacle) => {
      if (obstacle.z > DESPAWN_BEHIND) {
        this.scene.remove(obstacle.mesh);
        return false;
      }
      return true;
    });
    this.collectibles = this.collectibles.filter((item) => {
      if (item.z > DESPAWN_BEHIND || item.taken) {
        if (item.z > DESPAWN_BEHIND) this.scene.remove(item.mesh);
        return false;
      }
      return true;
    });
    this.scenery = this.scenery.filter((prop) => {
      if (prop.z > DESPAWN_BEHIND + 4) {
        this.scene.remove(prop.mesh);
        return false;
      }
      return true;
    });

    // Collisions with obstacles: jump the low, duck the high, pay for a hit.
    for (const obstacle of this.obstacles) {
      if (Math.abs(obstacle.z) > obstacle.def.depth / 2 + 0.55) continue;
      if (Math.abs(obstacle.x - turkey.x) > obstacle.def.width / 2 + 0.35) continue;
      const ducking = turkey.duckTimer > 0;
      const feet = turkey.y;
      let cleared = false;
      if (obstacle.def.clear === 'jump') {
        cleared = feet > obstacle.def.height - 0.25;
      } else {
        cleared = ducking || feet > obstacle.def.height + 0.35;
      }
      if (!cleared && this.invulnerableTimer <= 0) {
        this.lastHitType = obstacle.type;
        this.lastHitTrace = this.trace.slice(-90);
        this.lastHitDetail = {
          type: obstacle.type, x: Number(turkey.x.toFixed(2)), y: Number(turkey.y.toFixed(2)),
          grounded: turkey.grounded, duck: turkey.duckTimer > 0, z: Number(obstacle.z.toFixed(2)),
          ox: obstacle.x, speed: Number(this.speed.toFixed(1)),
        };
        events |= this.hitTurkey('obstacle');
        this.scene.remove(obstacle.mesh);
        obstacle.z = DESPAWN_BEHIND + 1;
      }
    }

    // Pickups: corn for points, a golden feather for a big bonus.
    const turkeyHeight = turkey.y + 0.9;
    for (const item of this.collectibles) {
      if (item.taken) continue;
      if (Math.abs(item.z) > 0.9) continue;
      if (Math.abs(item.x - turkey.x) > 0.8) continue;
      const itemY = item.kind === 'corn' ? 0.9 : 1.0;
      if (Math.abs(itemY - turkeyHeight) > 1.1) continue;
      item.taken = true;
      this.scene.remove(item.mesh);
      if (item.kind === 'corn') {
        this.score += CORN_SCORE;
        events |= EVENT_COLLECT;
      } else {
        this.score += FEATHER_SCORE;
        events |= EVENT_FEATHER;
      }
    }

    // Distance points, then the finish line: 1500 metres means escaped.
    this.score += METER_SCORE * advance;
    if (this.distanceM >= GOAL_DISTANCE_M && !this.over) {
      this.over = true;
      this.escaped = true;
      events |= EVENT_ESCAPED;
    }
    return events;
  }

  /** A hit costs a life, stumbles the turkey and lets the farmer close in. */
  hitTurkey(kind) {
    this.lives -= 1;
    this.stumbleTimer = STUMBLE_TIME;
    this.invulnerableTimer = INVULNERABLE_TIME;
    this.farmer.gap = Math.max(0.9, this.farmer.gap - 0.8);
    this.shake = 1;
    this.flash = 1;
    this.hits.push({ at: Math.floor(this.distanceM), kind, lives: this.lives, type: this.lastHitType || null, detail: this.lastHitDetail || null, trace: this.lastHitTrace || null });
    if (this.lives <= 0) {
      this.over = true;
      this.caught = kind === 'caught';
      return EVENT_HIT | EVENT_CAUGHT;
    }
    return EVENT_HIT;
  }

  /** Place the meshes where the simulation says they are, then draw. */
  render() {
    const turkey = this.turkey;
    const ducking = turkey.duckTimer > 0;
    const dashing = turkey.dashTimer > 0;
    const speedFactor = this.speed / BASE_SPEED;
    this.turkeyMesh.group.position.set(turkey.x, turkey.y, 0);
    // The turkey runs away from the camera, tail fan towards the viewer.
    this.turkeyMesh.group.rotation.y = Math.PI;
    this.turkeyMesh.group.visible = this.invulnerableTimer <= 0 || Math.floor(this.time * 12) % 2 === 0;
    this.turkeyMesh.animate(this.time, speedFactor, !turkey.grounded, ducking, dashing);
    const farmer = this.farmer;
    // The gap is the chase distance; the drawing keeps the farmer in the
    // lower corner of the frame, looming nearer as the gap closes.
    const farmerZ = Math.min(4.2, 2.0 + farmer.gap * 0.25);
    this.farmerMesh.group.position.set(
      turkey.x * 0.5 + 2.1,
      0,
      farmerZ,
    );
    this.farmerMesh.group.rotation.y = Math.PI;
    this.farmerMesh.group.rotation.y = 0;
    this.farmerMesh.animate(this.time, speedFactor, farmer.state === 'sprint');
    // Ground and path scroll with the distance run, so the farm rushes past.
    this.textures.ground.offset.y = (this.distance * 0.2) % 1;
    this.textures.path.offset.y = (this.distance * 0.2) % 1;
    // The sun follows the turkey so shadows stay crisp around the action.
    this.sun.position.set(turkey.x - 12, 22, 8);
    this.sun.target.position.set(turkey.x, 0, -12);
    const shakeX = this.shake > 0 ? (this.random() - 0.5) * this.shake * 0.35 : 0;
    const shakeY = this.shake > 0 ? (this.random() - 0.5) * this.shake * 0.25 : 0;
    this.camera.position.set(
      CAMERA_OFFSET.x + turkey.x * 0.45 + shakeX,
      CAMERA_OFFSET.y + shakeY,
      CAMERA_OFFSET.z,
    );
    this.camera.lookAt(turkey.x * 0.6, CAMERA_LOOK.y, CAMERA_LOOK.z);
    this.renderer.render(this.scene, this.camera);
  }
}

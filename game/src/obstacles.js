// Obstacle and collectible meshes for Turkey Run 3D. Each hazard is built
// from primitives with the same autumn palette as the farm, and each one
// reads clearly at a glance: jump the low ones, duck under the high ones.
import { OBSTACLES } from './config.js';

function standard(color, roughness) {
  return new THREE.MeshStandardMaterial({ color, roughness: roughness || 0.85, metalness: 0 });
}

function box(width, height, depth, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** A wooden fence panel the turkey must jump. */
export function buildFence(woodTexture) {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.9 });
  const topRail = box(1.7, 0.14, 0.12, wood);
  topRail.position.y = 1.0;
  const midRail = box(1.7, 0.14, 0.12, wood);
  midRail.position.y = 0.55;
  group.add(topRail, midRail);
  [-0.75, 0.75].forEach((x) => {
    const post = box(0.14, 1.15, 0.14, wood);
    post.position.set(x, 0.57, 0);
    group.add(post);
  });
  return group;
}

/** A round golden hay bale. */
export function buildHayBale(hayTexture) {
  const group = new THREE.Group();
  const hay = new THREE.MeshStandardMaterial({ map: hayTexture, roughness: 1 });
  const bale = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.1, 14), hay);
  bale.rotation.z = Math.PI / 2;
  bale.castShadow = true;
  bale.receiveShadow = true;
  group.add(bale);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.04, 8, 20), standard(0x8a6b3f));
  band.rotation.y = Math.PI / 2;
  group.add(band);
  group.position.y = 0.75;
  return group;
}

/** A fat orange pumpkin with a green stem. */
export function buildPumpkin() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), standard(0xe8821e, 0.6));
  body.scale.set(1, 0.8, 1);
  body.position.y = 0.42;
  body.castShadow = true;
  group.add(body);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.3, 8), standard(0x4c7a2e));
  stem.position.y = 0.9;
  stem.rotation.z = 0.2;
  group.add(stem);
  return group;
}

/** A wooden crate from the barn. */
export function buildCrate(woodTexture) {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.9 });
  const crate = box(1.5, 1.2, 1.2, wood);
  crate.position.y = 0.6;
  group.add(crate);
  const edge = box(1.56, 0.1, 1.26, standard(0x6b4423));
  edge.position.y = 1.16;
  group.add(edge);
  return group;
}

/** A pitchfork stuck upright in the ground, tines up. */
export function buildPitchfork() {
  const group = new THREE.Group();
  const wood = standard(0x8a6b3f);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.7, 8), wood);
  handle.position.y = 0.85;
  handle.castShadow = true;
  group.add(handle);
  const steel = standard(0xb8bec8, 0.35);
  for (let i = -1; i <= 1; i += 1) {
    const tine = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.5, 6), steel);
    tine.position.set(i * 0.16, 1.95, 0);
    group.add(tine);
  }
  const cross = box(0.5, 0.08, 0.08, steel);
  cross.position.y = 1.72;
  group.add(cross);
  return group;
}

/** A low barn beam hanging overhead: duck under it. */
export function buildBeam(woodTexture) {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.9 });
  const beam = box(2.8, 0.5, 0.5, wood);
  beam.position.y = 1.35;
  group.add(beam);
  [-1.2, 1.2].forEach((x) => {
    const post = box(0.18, 1.6, 0.18, wood);
    post.position.set(x, 0.8, 0);
    group.add(post);
  });
  return group;
}

/** A glowing kitchen oven, the turkey's worst nightmare. */
export function buildOven() {
  const group = new THREE.Group();
  const steel = standard(0x9aa2ae, 0.4);
  const body = box(2.6, 2.1, 1.5, steel);
  body.position.y = 1.05;
  group.add(body);
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0xff7a1e, roughness: 0.4, emissive: 0xff5a00, emissiveIntensity: 0.55,
  });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.2), doorMaterial);
  door.position.set(0, 1.0, 0.76);
  group.add(door);
  const top = box(2.7, 0.14, 1.6, standard(0x3a3f46, 0.5));
  top.position.y = 2.16;
  group.add(top);
  for (let i = -1; i <= 1; i += 1) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 10), standard(0x222222, 0.4));
    knob.rotation.x = Math.PI / 2;
    knob.position.set(i * 0.6, 1.95, 0.78);
    group.add(knob);
  }
  return group;
}

/** A cooking pot with a lid, sitting in the turkey's path. */
export function buildPot() {
  const group = new THREE.Group();
  const steel = standard(0x6a7078, 0.35);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.55, 0.8, 14), steel);
  pot.position.y = 0.4;
  pot.castShadow = true;
  group.add(pot);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), standard(0x3a3f46, 0.4));
  lid.position.y = 0.8;
  group.add(lid);
  const steam = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({
    color: 0xffffff, transparent: true, opacity: 0.35, roughness: 1,
  }));
  steam.position.y = 1.15;
  group.add(steam);
  return group;
}

/** A giant carving knife flying at head height: duck under it. */
export function buildKnife() {
  const group = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 0.06), standard(0xd8dde4, 0.25));
  blade.castShadow = true;
  group.add(blade);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 4), standard(0xd8dde4, 0.25));
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = 1.1;
  group.add(tip);
  const handle = box(0.55, 0.3, 0.09, standard(0x2a1a12, 0.7));
  handle.position.x = -1.1;
  group.add(handle);
  group.position.y = 1.25;
  return group;
}

/** A rolling pin tumbling along the kitchen floor. */
export function buildRollingPin() {
  const group = new THREE.Group();
  const wood = standard(0xd9b380, 0.7);
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.5, 12), wood);
  pin.rotation.z = Math.PI / 2;
  pin.position.y = 0.3;
  pin.castShadow = true;
  group.add(pin);
  [-0.85, 0.85].forEach((x) => {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 8), standard(0x8a6b3f));
    knob.rotation.z = Math.PI / 2;
    knob.position.set(x, 0.3, 0);
    group.add(knob);
  });
  return group;
}

/** Build the mesh for an obstacle of the given type. */
export function buildObstacle(type, textures) {
  switch (type) {
    case 'fence': return buildFence(textures.wood);
    case 'haybale': return buildHayBale(textures.hay);
    case 'pumpkin': return buildPumpkin();
    case 'crate': return buildCrate(textures.wood);
    case 'pitchfork': return buildPitchfork();
    case 'beam': return buildBeam(textures.wood);
    case 'oven': return buildOven();
    case 'pot': return buildPot();
    case 'knife': return buildKnife();
    case 'rollingPin': return buildRollingPin();
    default: return buildFence(textures.wood);
  }
}

/** A golden ear of corn, worth points and a little courage. */
export function buildCorn() {
  const group = new THREE.Group();
  const cob = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), standard(0xf2c230, 0.55));
  cob.scale.set(0.8, 1.4, 0.8);
  cob.position.y = 0.9;
  cob.castShadow = true;
  group.add(cob);
  const husk = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 8), standard(0x5d8a44, 0.8));
  husk.rotation.x = Math.PI;
  husk.position.y = 0.35;
  group.add(husk);
  return group;
}

/** A glowing golden feather, the rare prize of the run. */
export function buildFeather() {
  const group = new THREE.Group();
  const feather = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshStandardMaterial({
    color: 0xffd24a, roughness: 0.4, emissive: 0xa87800, emissiveIntensity: 0.5,
  }));
  feather.scale.set(0.6, 1.6, 0.25);
  feather.position.y = 1.0;
  feather.castShadow = true;
  group.add(feather);
  return group;
}

/** The solid height the turkey must clear, from the catalogue. */
export function obstacleHeight(type) {
  return OBSTACLES[type].height;
}

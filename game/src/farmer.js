// The farmer: a big low-poly pursuer in overalls and a straw hat, built
// from primitives. He runs behind the turkey, sprints when he gets close,
// and searches the field when the turkey pulls away.
export class Farmer {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'farmer';
    this.legLeft = null;
    this.legRight = null;
    this.armLeft = null;
    this.armRight = null;
    this.state = 'chase';
    this.build();
  }

  material(color, roughness) {
    return new THREE.MeshStandardMaterial({ color, roughness: roughness || 0.9, metalness: 0 });
  }

  build() {
    const skin = this.material(0xe8b88a, 0.7);
    const shirt = this.material(0xc0392b, 0.85);
    const denim = this.material(0x3a5a8a, 0.9);
    const straw = this.material(0xe8c25a, 0.9);
    const brown = this.material(0x6b4423, 0.9);

    // Legs in blue overalls.
    this.legLeft = this.makeLimb(denim, -0.22, 0.75, 0.34);
    this.legRight = this.makeLimb(denim, 0.22, 0.75, 0.34);
    this.group.add(this.legLeft);
    this.group.add(this.legRight);

    // Broad torso in a red checked shirt, with overall straps.
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.55), shirt);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.group.add(torso);
    [-0.25, 0.25].forEach((x) => {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.7, 0.06), denim);
      strap.position.set(x, 1.55, 0.3);
      this.group.add(strap);
    });
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), shirt);
    belly.scale.set(1.15, 0.9, 0.8);
    belly.position.set(0, 1.15, 0.18);
    this.group.add(belly);

    // Arms reaching forward, ready to grab.
    this.armLeft = this.makeLimb(shirt, -0.58, 1.55, 0.3);
    this.armRight = this.makeLimb(shirt, 0.58, 1.55, 0.3);
    this.armLeft.rotation.x = -1.1;
    this.armRight.rotation.x = -1.1;
    this.group.add(this.armLeft);
    this.group.add(this.armRight);

    // Head: round face, big moustache, straw hat.
    const head = new THREE.Group();
    head.position.y = 2.05;
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), skin);
    face.castShadow = true;
    head.add(face);
    const moustache = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.12), brown);
    moustache.position.set(0, -0.08, 0.3);
    head.add(moustache);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), skin);
    nose.position.set(0, 0.02, 0.34);
    head.add(nose);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1210, roughness: 0.3 });
    [-0.13, 0.13].forEach((x) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMaterial);
      eye.position.set(x, 0.1, 0.3);
      head.add(eye);
    });
    const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.26, 12), straw);
    hatTop.position.y = 0.32;
    hatTop.castShadow = true;
    head.add(hatTop);
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.05, 16), straw);
    hatBrim.position.y = 0.2;
    head.add(hatBrim);
    this.group.add(head);
  }

  makeLimb(material, x, y, length) {
    const limb = new THREE.Group();
    limb.position.set(x, y, 0);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, length * 2, 8), material);
    mesh.position.y = -length;
    mesh.castShadow = true;
    limb.add(mesh);
    return limb;
  }

  /** Run cycle: legs scissor hard, arms pump forward, body leans in. */
  animate(time, speedFactor, sprinting) {
    const phase = time * 10 * speedFactor;
    const swing = sprinting ? 0.95 : 0.65;
    this.legLeft.rotation.x = Math.sin(phase) * swing;
    this.legRight.rotation.x = Math.sin(phase + Math.PI) * swing;
    this.armLeft.rotation.x = -1.1 + Math.sin(phase + Math.PI) * 0.35;
    this.armRight.rotation.x = -1.1 + Math.sin(phase) * 0.35;
    this.group.rotation.x = sprinting ? 0.22 : 0.12;
    this.group.position.y = Math.abs(Math.sin(phase)) * 0.06;
  }
}

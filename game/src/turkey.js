// The turkey: a low-poly bird built from primitives, with a fanned tail,
// a wattle, and legs that run, so the hero reads as a turkey at a glance.
export class Turkey {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'turkey';
    this.legLeft = null;
    this.legRight = null;
    this.wingLeft = null;
    this.wingRight = null;
    this.tail = null;
    this.head = null;
    this.body = null;
    this.build();
  }

  material(color, roughness) {
    return new THREE.MeshStandardMaterial({ color, roughness: roughness || 0.85, metalness: 0 });
  }

  build() {
    const brown = this.material(0x8a5a2e);
    const darkBrown = this.material(0x6b4423);
    const cream = this.material(0xf2e3c2);
    const red = this.material(0xd23c2e, 0.6);
    const orange = this.material(0xe8821e, 0.5);
    const gold = this.material(0xd9a83c, 0.6);

    // Body: a plump egg shape, tilted slightly forward when running.
    this.body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 16), brown);
    this.body.scale.set(1, 1.15, 1.25);
    this.body.position.y = 0.95;
    this.body.castShadow = true;
    this.group.add(this.body);

    // Breast patch, so the front reads lighter than the back.
    const breast = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), cream);
    breast.scale.set(0.85, 1.0, 0.7);
    breast.position.set(0, 0.9, 0.32);
    this.group.add(breast);

    // Fanned tail: five feathers spread behind the body.
    this.tail = new THREE.Group();
    this.tail.position.set(0, 1.15, -0.55);
    for (let i = -2; i <= 2; i += 1) {
      const feather = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.9, 6), i % 2 === 0 ? darkBrown : gold);
      feather.position.set(i * 0.22, 0.3, -0.1 * Math.abs(i));
      feather.rotation.x = -0.5 - Math.abs(i) * 0.08;
      feather.rotation.z = -i * 0.28;
      feather.castShadow = true;
      this.tail.add(feather);
    }
    this.group.add(this.tail);

    // Head on a short neck, with beak, wattle and bright eyes.
    this.head = new THREE.Group();
    this.head.position.set(0, 1.62, 0.5);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), this.material(0xc98a5a, 0.7));
    skull.castShadow = true;
    this.head.add(skull);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.34, 8), orange);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, -0.02, 0.36);
    this.head.add(beak);
    const wattle = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), red);
    wattle.scale.set(0.7, 1.6, 0.7);
    wattle.position.set(0, -0.2, 0.24);
    this.head.add(wattle);
    const snood = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), red);
    snood.position.set(0, 0.16, 0.26);
    this.head.add(snood);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1210, roughness: 0.3 });
    [-0.14, 0.14].forEach((x) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMaterial);
      eye.position.set(x, 0.08, 0.22);
      this.head.add(eye);
    });
    this.group.add(this.head);

    // Wings, folded at the sides, flapping on a dash or a jump.
    this.wingLeft = this.makeWing(darkBrown, -1);
    this.wingRight = this.makeWing(darkBrown, 1);
    this.group.add(this.wingLeft);
    this.group.add(this.wingRight);

    // Long orange legs with three-toed feet.
    this.legLeft = this.makeLeg(orange, -0.2);
    this.legRight = this.makeLeg(orange, 0.2);
    this.group.add(this.legLeft);
    this.group.add(this.legRight);
  }

  makeWing(material, side) {
    const wing = new THREE.Group();
    wing.position.set(side * 0.5, 1.15, 0.05);
    const shape = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), material);
    shape.scale.set(0.35, 1.0, 1.1);
    shape.position.set(side * 0.08, -0.1, -0.05);
    shape.castShadow = true;
    wing.add(shape);
    return wing;
  }

  makeLeg(material, x) {
    const leg = new THREE.Group();
    leg.position.set(x, 0.55, 0);
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.55, 8), material);
    shin.position.y = -0.2;
    shin.castShadow = true;
    leg.add(shin);
    for (let toe = -1; toe <= 1; toe += 1) {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.26), material);
      foot.position.set(toe * 0.07, -0.48, 0.08);
      foot.rotation.y = toe * 0.4;
      leg.add(foot);
    }
    return leg;
  }

  /** Run cycle: legs scissor, body bobs, tail sways, head stays level. */
  animate(time, speedFactor, airborne, ducking, dashing) {
    const phase = time * 11 * speedFactor;
    const swing = airborne ? 0.55 : 0.75;
    this.legLeft.rotation.x = Math.sin(phase) * swing;
    this.legRight.rotation.x = Math.sin(phase + Math.PI) * swing;
    const flap = dashing || airborne ? 0.9 : 0.12;
    this.wingLeft.rotation.z = 0.25 + Math.sin(phase) * flap;
    this.wingRight.rotation.z = -0.25 - Math.sin(phase) * flap;
    this.tail.rotation.x = -0.12 + Math.sin(phase * 0.5) * 0.06;
    this.head.position.y = 1.62 + Math.abs(Math.sin(phase)) * 0.05;
    this.body.position.y = ducking ? 0.72 : 0.95 + Math.abs(Math.sin(phase)) * 0.05;
    this.body.scale.y = ducking ? 0.85 : 1.15;
    this.group.rotation.x = airborne ? -0.12 : 0.06;
  }
}

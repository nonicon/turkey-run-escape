// Procedural textures for Turkey Run 3D, painted on offscreen canvases at
// load time. The game ships no image files: every surface is generated here,
// so the entry stays fully offline and original.
function makeCanvas(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function speckle(context, random, size, colors, count, radius) {
  for (let i = 0; i < count; i += 1) {
    context.fillStyle = colors[Math.floor(random() * colors.length)];
    context.beginPath();
    context.arc(random() * size, random() * size, radius * (0.5 + random()), 0, Math.PI * 2);
    context.fill();
  }
}

/** Patchy autumn grass with dirt showing through, tiled along the run. */
export function makeGroundTexture(random) {
  const size = 256;
  const canvas = makeCanvas(size);
  const context = canvas.getContext('2d');
  context.fillStyle = '#7fae4e';
  context.fillRect(0, 0, size, size);
  speckle(context, random, size, ['#6b9a3e', '#93c25e', '#a8b45a', '#5d8a44'], 500, 1.8);
  speckle(context, random, size, ['#8a6b3f', '#7a5c33', '#9c7a48'], 150, 2.4);
  context.strokeStyle = 'rgba(60, 90, 40, 0.35)';
  context.lineWidth = 2;
  for (let i = 0; i < 40; i += 1) {
    const x = random() * size;
    const y = random() * size;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + (random() - 0.5) * 10, y - 4 - random() * 6);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 40);
  return texture;
}

/** A worn dirt path down the middle of the run, for the turkey to follow. */
export function makePathTexture(random) {
  const size = 256;
  const canvas = makeCanvas(size);
  const context = canvas.getContext('2d');
  context.fillStyle = '#a87c46';
  context.fillRect(0, 0, size, size);
  speckle(context, random, size, ['#96683a', '#bd8f56', '#7d5a34', '#c49a62'], 700, 2.6);
  context.strokeStyle = 'rgba(120, 84, 44, 0.5)';
  context.lineWidth = 3;
  for (let i = 0; i < 12; i += 1) {
    const y = random() * size;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(80, y + 8, 170, y - 8, size, y + 4);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 40);
  return texture;
}

/** Warm wooden planks for fences, crates and the barn. */
export function makeWoodTexture(random) {
  const size = 128;
  const canvas = makeCanvas(size);
  const context = canvas.getContext('2d');
  context.fillStyle = '#9a6b3d';
  context.fillRect(0, 0, size, size);
  for (let plank = 0; plank < 4; plank += 1) {
    const y = plank * 32;
    context.fillStyle = plank % 2 === 0 ? '#a57644' : '#8f6234';
    context.fillRect(0, y, size, 30);
    context.strokeStyle = 'rgba(60, 38, 16, 0.6)';
    context.lineWidth = 2;
    context.strokeRect(-2, y, size + 4, 30);
    context.strokeStyle = 'rgba(70, 46, 20, 0.4)';
    context.lineWidth = 1;
    for (let i = 0; i < 5; i += 1) {
      const grainY = y + 4 + random() * 22;
      context.beginPath();
      context.moveTo(0, grainY);
      context.bezierCurveTo(40, grainY + 2, 90, grainY - 2, size, grainY + 1);
      context.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** Golden straw for hay bales. */
export function makeHayTexture(random) {
  const size = 128;
  const canvas = makeCanvas(size);
  const context = canvas.getContext('2d');
  context.fillStyle = '#d9a83c';
  context.fillRect(0, 0, size, size);
  context.strokeStyle = 'rgba(160, 110, 20, 0.55)';
  context.lineWidth = 1.5;
  for (let i = 0; i < 220; i += 1) {
    const x = random() * size;
    const y = random() * size;
    const angle = random() * Math.PI;
    const length = 6 + random() * 10;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    context.stroke();
  }
  speckle(context, random, size, ['#e8c25a', '#c08f2a'], 120, 1.6);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** A soft dusk sky gradient, drawn once and used as the scene background. */
export function makeSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#7a5a9e');
  gradient.addColorStop(0.45, '#e07a4e');
  gradient.addColorStop(0.75, '#ffb36b');
  gradient.addColorStop(1, '#ffd98a');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 16, 512);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

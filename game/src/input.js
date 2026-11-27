// Keyboard and mouse input for Turkey Run 3D.
// Arrow keys or WASD steer, Space or ArrowUp jumps, ArrowDown or S ducks,
// Shift or a mouse click dashes. P pauses, M mutes, R restarts, Enter starts.
export class Input {
  constructor(canvas) {
    this.pressed = new Set();
    this.held = new Set();
    this.clicked = false;
    this.steer = 0;
    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      this.pressed.add(event.code);
      this.held.add(event.code);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
    });
    window.addEventListener('keyup', (event) => {
      this.held.delete(event.code);
    });
    window.addEventListener('blur', () => {
      this.held.clear();
    });
    canvas.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.clicked = true;
    });
  }

  /** -1 for left, +1 for right, 0 when neither or both are held. */
  steerDirection() {
    const left = this.held.has('ArrowLeft') || this.held.has('KeyA');
    const right = this.held.has('ArrowRight') || this.held.has('KeyD');
    if (left && !right) return -1;
    if (right && !left) return 1;
    return 0;
  }

  jumpPressed() {
    return this.pressed.has('Space') || this.pressed.has('ArrowUp') || this.pressed.has('KeyW');
  }

  duckHeld() {
    return this.held.has('ArrowDown') || this.held.has('KeyS');
  }

  dashPressed() {
    return this.pressed.has('ShiftLeft') || this.pressed.has('ShiftRight') || this.clicked;
  }

  /** True when the player clicked the canvas since the last frame. */
  consumeClick() {
    const wasClicked = this.clicked;
    this.clicked = false;
    return wasClicked;
  }

  /** Clear the edge-triggered presses at the end of each frame. */
  endFrame() {
    this.pressed.clear();
    this.clicked = false;
  }
}

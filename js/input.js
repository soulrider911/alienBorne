export class Input {
  constructor() {
    this.keys = {};
    this.justPressed = {};
    this.justReleased = {};
    window.addEventListener('keydown', e => {
      if (!this.keys[e.code]) this.justPressed[e.code] = true;
      this.keys[e.code] = true;
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      this.justReleased[e.code] = true;
    });
  }
  update() {
    this.justPressed = {};
    this.justReleased = {};
  }
  isDown(code) { return !!this.keys[code]; }
  wasPressed(code) { return !!this.justPressed[code]; }
}

import { GROUND_Y, CANVAS_WIDTH } from '../constants.js';

const CROSS_COLOR = '#00FF41';
const BOX_COLOR   = '#003300';
const GLOW_COLOR  = 'rgba(0,255,65,0.25)';

export class HealthDrop {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vy = 55; // falls slower than aliens
    this.alive = true;
    this.landed = false;
    this.width = 12;
    this.height = 12;
    this.bobPhase = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.y += this.vy * dt;
    this.bobPhase += 3 * dt;
    if (this.y + this.height >= GROUND_Y) {
      // Hit the ground without being collected — just disappear
      this.alive = false;
    }
  }

  draw(ctx) {
    const px = Math.floor(this.x);
    const py = Math.floor(this.y);

    // Subtle glow halo
    ctx.fillStyle = GLOW_COLOR;
    ctx.fillRect(px - 2, py - 2, this.width + 4, this.height + 4);

    // Box
    ctx.fillStyle = BOX_COLOR;
    ctx.fillRect(px, py, this.width, this.height);

    // Border
    ctx.fillStyle = CROSS_COLOR;
    ctx.fillRect(px,     py,     this.width, 1); // top
    ctx.fillRect(px,     py + this.height - 1, this.width, 1); // bottom
    ctx.fillRect(px,     py,     1, this.height); // left
    ctx.fillRect(px + this.width - 1, py, 1, this.height); // right

    // Cross (+) symbol
    ctx.fillStyle = CROSS_COLOR;
    ctx.fillRect(px + 5, py + 2, 2, 8); // vertical bar
    ctx.fillRect(px + 2, py + 5, 8, 2); // horizontal bar
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }
}

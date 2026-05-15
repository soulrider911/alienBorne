import { GROUND_Y, CANVAS_WIDTH, SCORE_ALIEN_KILL } from '../constants.js';
import { drawFallingAlien } from '../sprites.js';

export class FallingAlien {
  constructor(x, y, fallSpeed) {
    this.x = x;
    this.y = y;
    this.vy = fallSpeed;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.wobbleAmp = 10 + Math.random() * 15;
    this.wobbleSpeed = 2 + Math.random() * 2;
    this.animTimer = 0;
    this.animFrame = 0;
    this.alive = true;
    this.landed = false;
    this._processed = false;
    this.width = 16;
    this.height = 12;
    this.score = SCORE_ALIEN_KILL;
  }

  update(dt) {
    this.y += this.vy * dt;
    this.wobblePhase += this.wobbleSpeed * dt;
    this.x += Math.sin(this.wobblePhase) * this.wobbleAmp * dt;
    this.x = Math.max(4, Math.min(CANVAS_WIDTH - this.width - 4, this.x));
    this.animTimer += dt * 1000;
    if (this.animTimer > 150) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 4; }
    if (this.y + this.height >= GROUND_Y) {
      this.landed = true;
      this.alive = false;
    }
  }

  draw(ctx) {
    drawFallingAlien(ctx, Math.floor(this.x), Math.floor(this.y), this.animFrame);
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }
}

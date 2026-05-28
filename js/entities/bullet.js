import { BULLET_SPEED, CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants.js';
import { drawBullet } from '../sprites.js';

export class Bullet {
  constructor(x, y, angleDeg) {
    this.x = x;
    this.y = y;
    const rad = (angleDeg * Math.PI) / 180;
    this.vx = Math.sin(rad) * BULLET_SPEED;
    this.vy = -Math.cos(rad) * BULLET_SPEED;
    this.alive = true;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.y < -10 || this.x < -10 || this.x > CANVAS_WIDTH + 10) {
      this.alive = false;
    }
  }

  draw(ctx) {
    drawBullet(ctx, this.x, this.y);
  }

  getBounds() {
    return { x: this.x - 2, y: this.y - 2, w: 4, h: 4 };
  }
}

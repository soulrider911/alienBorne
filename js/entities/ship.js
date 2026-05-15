import { CANVAS_WIDTH, SHIP_UPPER_LANE_Y, SHIP_LOWER_LANE_Y, SCORE_SHIP_KILL } from '../constants.js';
import { drawUFO } from '../sprites.js';

export class AlienShip {
  constructor(lane, speed, dropInterval, hp = 1) {
    this.lane = lane;
    this.y = lane === 0 ? SHIP_UPPER_LANE_Y : SHIP_LOWER_LANE_Y;
    this.speed = speed;
    this.hp = hp;
    this.maxHp = hp;
    this.dropInterval = dropInterval;
    this.dropTimer = dropInterval * (0.3 + Math.random() * 0.7);
    this.animTimer = 0;
    this.animFrame = 0;
    this.alive = true;
    this.flashTimer = 0;
    this.width = 32;
    this.height = 10;

    if (lane === 0) {
      this.x = -this.width;
      this.vx = speed;
    } else {
      this.x = CANVAS_WIDTH + this.width;
      this.vx = -speed;
    }
  }

  update(dt) {
    this.x += this.vx * dt;
    this.animTimer += dt * 1000;
    if (this.animTimer > 400) { this.animTimer = 0; this.animFrame ^= 1; }
    if (this.flashTimer > 0) this.flashTimer -= dt * 1000;
    this.dropTimer -= dt * 1000;

    if (this.vx > 0 && this.x > CANVAS_WIDTH + this.width) this.alive = false;
    if (this.vx < 0 && this.x < -this.width) this.alive = false;
  }

  shouldDrop() {
    if (this.dropTimer <= 0) {
      this.dropTimer = this.dropInterval;
      return true;
    }
    return false;
  }

  hit() {
    this.hp--;
    this.flashTimer = 120;
    return this.hp <= 0;
  }

  draw(ctx) {
    ctx.save();
    if (this.flashTimer > 0) {
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(this.flashTimer * 0.1);
    }
    drawUFO(ctx, Math.floor(this.x), Math.floor(this.y), this.animFrame, this.vx < 0);

    if (this.maxHp > 1) {
      for (let i = 0; i < this.hp; i++) {
        ctx.fillStyle = '#00FF41';
        ctx.fillRect(Math.floor(this.x + 4 + i * 6), Math.floor(this.y - 4), 4, 2);
      }
    }
    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }

  get score() { return SCORE_SHIP_KILL * this.maxHp; }
}

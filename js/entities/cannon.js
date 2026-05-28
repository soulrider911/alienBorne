import { CANNON_X, CANNON_Y, CANNON_MAX_ANGLE, CANNON_ROTATION_SPEED, CANNON_FIRE_RATE } from '../constants.js';

export class Cannon {
  constructor() {
    this.x = CANNON_X;
    this.y = CANNON_Y;
    this.angle = 0;
    this.fireCooldown = 0;
    this.flashTimer = 0;
  }

  update(dt, input) {
    if (input.isDown('ArrowLeft'))  this.angle -= CANNON_ROTATION_SPEED * dt;
    if (input.isDown('ArrowRight')) this.angle += CANNON_ROTATION_SPEED * dt;
    this.angle = Math.max(-CANNON_MAX_ANGLE, Math.min(CANNON_MAX_ANGLE, this.angle));
    if (this.fireCooldown > 0) this.fireCooldown -= dt * 1000;
    if (this.flashTimer > 0) this.flashTimer -= dt * 1000;
  }

  canFire() { return this.fireCooldown <= 0; }

  fire() {
    this.fireCooldown = CANNON_FIRE_RATE;
    this.flashTimer = 80;
  }

  getBarrelTip() {
    // Barrel rotates from pivot at (x, y - 6), extends 18 pixels upward
    const rad = (this.angle * Math.PI) / 180;
    const barrelLength = 18;
    return {
      x: this.x + Math.sin(rad) * barrelLength,
      y: (this.y - 6) - Math.cos(rad) * barrelLength
    };
  }

  draw(ctx) {
    const rad = (this.angle * Math.PI) / 180;
    const px = this.x, py = this.y;
    const baseColor = this.flashTimer > 0 ? '#FFFFFF' : '#00FF41';

    // Tread body
    ctx.fillStyle = baseColor;
    ctx.fillRect(Math.floor(px - 14), Math.floor(py - 4), 28, 8);

    // Tread notches
    ctx.fillStyle = '#003300';
    for (let i = -12; i <= 10; i += 6) {
      ctx.fillRect(Math.floor(px + i), Math.floor(py - 5), 4, 2);
    }

    // Turret base
    ctx.fillStyle = baseColor;
    ctx.fillRect(Math.floor(px - 7), Math.floor(py - 10), 14, 8);

    // Barrel (rotated)
    ctx.save();
    ctx.translate(Math.floor(px), Math.floor(py - 6));
    ctx.rotate(rad);
    ctx.fillStyle = this.flashTimer > 0 ? '#FFFFFF' : '#00FFFF';
    ctx.fillRect(-2, -18, 4, 18);
    ctx.restore();
  }
}

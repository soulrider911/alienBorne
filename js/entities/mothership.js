import { CANVAS_WIDTH } from '../constants.js';
import { drawMothership } from '../sprites.js';

export class Mothership {
  constructor(wave) {
    // Moves slower than regular ships, always center lane
    this.y = 38;
    this.speed = Math.min(40 + wave * 4, 90);
    // HP scales with wave: 5 base + 1 per wave, capped at 15
    this.hp = Math.min(5 + wave, 15);
    this.maxHp = this.hp;
    this.dropInterval = 800;
    this.dropTimer = 1200;
    this.animTimer = 0;
    this.animFrame = 0;
    this.alive = true;
    this.isMothership = true;
    this.flashTimer = 0;
    this.width = 56;
    this.height = 18;

    // Always enters from left
    this.x = -this.width;
    this.vx = this.speed;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.animTimer += dt * 1000;
    if (this.animTimer > 300) { this.animTimer = 0; this.animFrame ^= 1; }
    if (this.flashTimer > 0) this.flashTimer -= dt * 1000;
    this.dropTimer -= dt * 1000;

    if (this.x > CANVAS_WIDTH + this.width) this.alive = false;
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
    this.flashTimer = 150;
    return this.hp <= 0;
  }

  draw(ctx) {
    ctx.save();
    const lowHp = this.hp / this.maxHp < 0.3;

    if (this.flashTimer > 0) {
      ctx.globalAlpha = 0.4 + 0.6 * Math.sin(this.flashTimer * 0.15);
    } else if (lowHp) {
      ctx.globalAlpha = 0.7 + 0.3 * Math.sin(Date.now() * 0.015);
    }

    drawMothership(ctx, Math.floor(this.x), Math.floor(this.y), this.animFrame, false);

    ctx.restore();

    // HP bar above ship
    const barW = this.width;
    const barX = Math.floor(this.x);
    const barY = Math.floor(this.y) - 6;
    const hpPct = this.hp / this.maxHp;

    ctx.fillStyle = '#330000';
    ctx.fillRect(barX, barY, barW, 3);

    const barColor = hpPct > 0.6 ? '#FF4400' : hpPct > 0.3 ? '#FFFF00' : '#FF2222';
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, Math.floor(barW * hpPct), 3);

    // Label
    ctx.font = "5px 'Press Start 2P', monospace";
    ctx.fillStyle = '#FFFF00';
    ctx.textAlign = 'center';
    ctx.fillText('MOTHERSHIP', barX + this.width / 2, barY - 2);
    ctx.textAlign = 'left';
  }

  getBounds() {
    return { x: this.x + 4, y: this.y, w: this.width - 8, h: this.height };
  }

  get score() { return 500 + this.maxHp * 100; }
}

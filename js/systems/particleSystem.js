import { PARTICLE_POOL_SIZE } from '../constants.js';

class Particle {
  constructor() { this.alive = false; }
  reset(x, y, vx, vy, color, size, life, gravity = 0) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.gravity = gravity;
    this.alive = true;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
  }
  draw(ctx) {
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
  }
}

export class ParticleSystem {
  constructor() {
    this.pool = Array.from({ length: PARTICLE_POOL_SIZE }, () => new Particle());
    this.active = [];
  }

  _spawn(x, y, vx, vy, color, size, life, gravity) {
    const p = this.pool.find(p => !p.alive);
    if (!p) return;
    p.reset(x, y, vx, vy, color, size, life, gravity);
    this.active.push(p);
  }

  emitExplosion(x, y, size = 'large', primaryColor = '#FF6B00') {
    const count = size === 'large' ? 24 : 12;
    const colors = [primaryColor, '#FFFFFF', '#FF6B00', '#FFFF00'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 180;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const pSize = size === 'large' ? (Math.random() < 0.5 ? 3 : 2) : 2;
      const life = 0.5 + Math.random() * 0.7;
      this._spawn(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, pSize, life, 60);
    }
  }

  emitHit(x, y) {
    const colors = ['#FFFFFF', '#00FFFF'];
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 80;
      this._spawn(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed,
        colors[i % 2], 2, 0.2, 0);
    }
  }

  update(dt) {
    this.active = this.active.filter(p => p.alive);
    for (const p of this.active) p.update(dt);
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.active) if (p.alive) p.draw(ctx);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

import { CANVAS_WIDTH, CANVAS_HEIGHT, PALETTE } from '../constants.js';
import { drawUFO } from '../sprites.js';

export class TitleScreen {
  constructor() {
    this.blinkTimer = 0;
    this.blinkOn = true;
    this.attractShips = [
      { x: -40, y: 60,  vx: 55,  animFrame: 0, animTimer: 0 },
      { x: -40, y: 95,  vx: 70,  animFrame: 0, animTimer: 0 },
      { x: 520,  y: 75,  vx: -60, animFrame: 0, animTimer: 0 },
    ];
    this.attractAliens = [];
    this.attractDropTimers = [2000, 2800, 1600];
    this.t = 0;
  }

  update(dt) {
    this.t += dt;
    this.blinkTimer += dt * 1000;
    if (this.blinkTimer > 500) { this.blinkTimer = 0; this.blinkOn = !this.blinkOn; }

    for (let i = 0; i < this.attractShips.length; i++) {
      const s = this.attractShips[i];
      s.x += s.vx * dt;
      s.animTimer += dt * 1000;
      if (s.animTimer > 400) { s.animTimer = 0; s.animFrame ^= 1; }

      this.attractDropTimers[i] -= dt * 1000;
      if (this.attractDropTimers[i] <= 0) {
        this.attractDropTimers[i] = 1800 + Math.random() * 1500;
        this.attractAliens.push({ x: s.x + 8, y: s.y + 10, vy: 60, animTimer: 0, frame: 0 });
      }

      if (s.vx > 0 && s.x > CANVAS_WIDTH + 40) s.x = -40;
      if (s.vx < 0 && s.x < -40) s.x = CANVAS_WIDTH + 40;
    }

    for (const a of this.attractAliens) {
      a.y += a.vy * dt;
      a.animTimer += dt * 1000;
      if (a.animTimer > 150) { a.animTimer = 0; a.frame = (a.frame + 1) % 4; }
    }
    this.attractAliens = this.attractAliens.filter(a => a.y < CANVAS_HEIGHT - 20);
  }

  draw(ctx) {
    ctx.textAlign = 'center';

    // Attract ships
    for (const s of this.attractShips) {
      drawUFO(ctx, Math.floor(s.x), Math.floor(s.y), s.animFrame, s.vx < 0);
    }

    // Attract falling aliens (simple pixel stand-ins)
    ctx.fillStyle = PALETTE.magenta;
    for (const a of this.attractAliens) {
      ctx.fillRect(Math.floor(a.x), Math.floor(a.y), 8, 8);
    }

    // Ground line
    ctx.fillStyle = PALETTE.darkGreen;
    ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 2);

    // Title glow passes
    const titleText = 'ALIENBORNE';
    ctx.font = "28px 'Press Start 2P', monospace";
    const glowPasses = [
      { color: 'rgba(0,255,255,0.08)', offset: 3 },
      { color: 'rgba(0,255,255,0.14)', offset: 1 },
    ];
    for (const g of glowPasses) {
      ctx.fillStyle = g.color;
      for (const dx of [-g.offset, 0, g.offset]) {
        for (const dy of [-g.offset, 0, g.offset]) {
          if (dx === 0 && dy === 0) continue;
          ctx.fillText(titleText, CANVAS_WIDTH / 2 + dx, 100 + dy);
        }
      }
    }
    ctx.fillStyle = PALETTE.cyan;
    ctx.fillText(titleText, CANVAS_WIDTH / 2, 100);

    // Subtitle
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.fillStyle = PALETTE.magenta;
    ctx.fillText('ALIEN INVASION', CANVAS_WIDTH / 2, 122);

    // Divider
    ctx.fillStyle = PALETTE.green;
    ctx.fillRect(80, 131, CANVAS_WIDTH - 160, 1);

    // Controls
    ctx.font = "6px 'Press Start 2P', monospace";
    ctx.fillStyle = PALETTE.white;
    ctx.fillText('ARROWS: AIM    SPACE: FIRE    M: MUSIC', CANVAS_WIDTH / 2, 150);

    // Press space (blinking)
    if (this.blinkOn) {
      ctx.font = "9px 'Press Start 2P', monospace";
      ctx.fillStyle = PALETTE.white;
      ctx.fillText('PRESS SPACE TO START', CANVAS_WIDTH / 2, 178);
    }

    // Hi-score
    const hi = localStorage.getItem('alienborne_hiscore') || '0';
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillStyle = PALETTE.yellow;
    ctx.fillText(`HI-SCORE: ${hi.toString().padStart(7, '0')}`, CANVAS_WIDTH / 2, 202);

    // Copyright
    ctx.font = "6px 'Press Start 2P', monospace";
    ctx.fillStyle = 'rgba(0,255,65,0.45)';
    ctx.fillText('© 1982 RETRO SYSTEMS INC', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 12);

    ctx.textAlign = 'left';
  }
}

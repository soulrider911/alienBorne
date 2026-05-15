import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, CANNON_X, CANNON_Y, NUM_COLUMNS, BASE_HEALTH, PALETTE, ALIEN_HEIGHT, COLUMN_WIDTH } from './constants.js';
import { Input } from './input.js';
import { AudioSystem } from './audio.js';
import { Cannon } from './entities/cannon.js';
import { Bullet } from './entities/bullet.js';
import { FallingAlien } from './entities/fallingAlien.js';
import { HealthDrop } from './entities/healthDrop.js';
import { WaveManager } from './systems/waveManager.js';
import { CollisionSystem } from './systems/collision.js';
import { ParticleSystem } from './systems/particleSystem.js';
import { CRTEffect } from './systems/crtEffect.js';
import { TitleScreen } from './screens/titleScreen.js';
import { GameOverScreen } from './screens/gameOverScreen.js';
import { drawLandedAlien } from './sprites.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.state = 'TITLE';
    this.lastTime = 0;

    // Game state
    this.score = 0;
    this.wave = 1;
    this.baseHealth = BASE_HEALTH;
    this.screenShakeMag = 0;
    this.waveClearAnim = false;
    this.waveClearTimer = 0;
    this.gameOverPending = false;

    // Entity arrays
    this.ships = [];
    this.fallingAliens = [];
    this.bullets = [];
    this.landedAliens = [];
    this.healthDrops = [];
    this.columnHeights = new Array(NUM_COLUMNS).fill(0);

    // Systems
    this.input = new Input();
    this.audio = new AudioSystem();
    this.cannon = new Cannon();
    this.waveManager = new WaveManager();
    this.collisionSystem = new CollisionSystem();
    this.particleSystem = new ParticleSystem();
    this.crtEffect = new CRTEffect();
    this.titleScreen = new TitleScreen();
    this.gameOverScreen = new GameOverScreen();

    // Starfield
    this.stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * (GROUND_Y - 20),
      brightness: 0.3 + Math.random() * 0.7,
      size: Math.random() < 0.15 ? 2 : 1,
    }));

    // Ground terrain (pre-generate pixel bumps)
    this.terrain = Array.from({ length: CANVAS_WIDTH }, () => Math.random() < 0.3 ? 1 : 0);
  }

  start() {
    requestAnimationFrame(t => this._tick(t));
  }

  _tick(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.ctx.imageSmoothingEnabled = false;

    // Resume audio on first interaction
    if (Object.keys(this.input.keys).some(k => this.input.keys[k])) {
      this.audio.resume();
    }

    switch (this.state) {
      case 'TITLE':    this._updateTitle(dt);    this._drawTitle();    break;
      case 'PLAYING':  this._updatePlaying(dt);  this._drawPlaying();  break;
      case 'GAME_OVER':this._updateGameOver(dt); this._drawGameOver(); break;
    }

    // Clear single-frame input state AFTER all update logic has read it
    this.input.update();

    requestAnimationFrame(t => this._tick(t));
  }

  // ─── TITLE ─────────────────────────────────────────────────────────────────

  _updateTitle(dt) {
    this.titleScreen.update(dt);
    if (this.input.wasPressed('Space')) {
      this._resetGame();
      this.state = 'PLAYING';
    }
    if (this.input.wasPressed('KeyM')) this.audio.toggleMusic();
  }

  _drawTitle() {
    const ctx = this.ctx;
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this._drawStars(ctx);
    this.titleScreen.draw(ctx);
    this.crtEffect.draw(ctx);
  }

  // ─── PLAYING ───────────────────────────────────────────────────────────────

  _updatePlaying(dt) {
    if (this.gameOverPending) return;

    this.cannon.update(dt, this.input);

    // Fire
    if ((this.input.isDown('Space') || this.input.wasPressed('Space')) && this.cannon.canFire()) {
      this.cannon.fire();
      this.bullets.push(new Bullet(this.cannon.x, this.cannon.y - 24, this.cannon.angle));
      this.audio.playShot();
    }

    // Update entities
    for (const b of this.bullets) b.update(dt);
    for (const s of this.ships) s.update(dt);
    for (const a of this.fallingAliens) a.update(dt);

    // Ship drops
    for (const ship of this.ships) {
      if (ship.alive && ship.shouldDrop()) {
        const dropX = ship.x + 8 + Math.random() * 16;
        const dropY = ship.y + 12;
        // Health drop chance: only when base health < 75%
        // Regular ships: 12% chance. Mothership: 35% chance.
        const healthChance = ship.isMothership ? 0.35 : 0.12;
        if (this.baseHealth < 75 && Math.random() < healthChance) {
          this.healthDrops.push(new HealthDrop(dropX, dropY));
        } else {
          this.fallingAliens.push(new FallingAlien(dropX, dropY, this.waveManager.getFallSpeed()));
          this.audio.playAlienDrop();
        }
      }
    }

    // Update health drops
    for (const h of this.healthDrops) h.update(dt);

    // Bullet vs health drop collision
    for (const bullet of this.bullets) {
      if (!bullet.alive) continue;
      const bb = bullet.getBounds();
      for (const h of this.healthDrops) {
        if (!h.alive) continue;
        if (bb.x < h.x + h.width && bb.x + bb.w > h.x && bb.y < h.y + h.height && bb.y + bb.h > h.y) {
          bullet.alive = false;
          h.alive = false;
          this.baseHealth = Math.min(100, this.baseHealth + 25);
          this.particleSystem.emitExplosion(h.x + 6, h.y + 6, 'small', '#00FF41');
          this.audio.playHit();
          break;
        }
      }
    }

    this.healthDrops = this.healthDrops.filter(h => h.alive);

    // Collisions
    this.collisionSystem.check(this);

    // Wave manager
    this.waveManager.update(dt, this);

    // Particles
    this.particleSystem.update(dt);

    // Screen shake decay
    if (this.screenShakeMag > 0.5) {
      this.screenShakeMag *= 0.82;
    } else {
      this.screenShakeMag = 0;
    }

    // Wave clear timer
    if (this.waveClearAnim) {
      this.waveClearTimer += dt * 1000;
    }

    // Music toggle
    if (this.input.wasPressed('KeyM')) this.audio.toggleMusic();

    // Prune dead entities (landed aliens are processed by collision before removal)
    this.bullets = this.bullets.filter(b => b.alive);
    this.ships = this.ships.filter(s => s.alive);
    this.fallingAliens = this.fallingAliens.filter(a => a.alive && !a.landed);
  }

  _drawPlaying() {
    const ctx = this.ctx;

    // Clear
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Screen shake transform
    let sx = 0, sy = 0;
    if (this.screenShakeMag > 0) {
      sx = (Math.random() - 0.5) * this.screenShakeMag;
      sy = (Math.random() - 0.5) * this.screenShakeMag;
    }
    ctx.save();
    ctx.translate(sx, sy);

    // Starfield
    this._drawStars(ctx);

    // Ground
    this._drawGround(ctx);

    // Landed alien pile
    for (const la of this.landedAliens) {
      const bob = Math.sin(la.animPhase + performance.now() * 0.002) * 0.5;
      drawLandedAlien(ctx, Math.floor(la.x), Math.floor(la.y + bob));
    }

    // Ships
    for (const s of this.ships) s.draw(ctx);

    // Falling aliens
    for (const a of this.fallingAliens) a.draw(ctx);

    // Bullets
    for (const b of this.bullets) b.draw(ctx);

    // Health drops
    for (const h of this.healthDrops) h.draw(ctx);

    // Cannon
    this.cannon.draw(ctx);

    // Particles
    this.particleSystem.draw(ctx);

    ctx.restore();

    // CRT (no shake)
    this.crtEffect.draw(ctx);

    // HUD (no shake)
    this._drawHUD(ctx);

    // Wave clear overlay
    if (this.waveClearAnim) {
      this._drawWaveClear(ctx);
    }
  }

  _drawStars(ctx) {
    for (const star of this.stars) {
      ctx.fillStyle = `rgba(255,255,255,${star.brightness})`;
      ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
    }
  }

  _drawGround(ctx) {
    // Ground fill
    ctx.fillStyle = '#001800';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Ground top edge
    ctx.fillStyle = PALETTE.green;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 1);

    // Pixel terrain bumps
    ctx.fillStyle = '#004400';
    for (let x = 0; x < CANVAS_WIDTH; x++) {
      if (this.terrain[x]) {
        ctx.fillRect(x, GROUND_Y + 1, 1, 2);
      }
    }
  }

  _drawHUD(ctx) {
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.imageSmoothingEnabled = false;

    // Score
    ctx.fillStyle = PALETTE.white;
    ctx.fillText(`SCORE:${this.score.toString().padStart(7, '0')}`, 6, 14);

    // Wave
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.cyan;
    ctx.fillText(`WAVE ${this.waveManager.wave.toString().padStart(2, '0')}`, CANVAS_WIDTH / 2, 14);
    ctx.textAlign = 'left';

    // Health bar
    const barW = 80;
    const barH = 8;
    const barX = CANVAS_WIDTH - barW - 6;
    const barY = 6;
    const healthPct = Math.max(0, this.baseHealth / 100);

    ctx.fillStyle = '#222';
    ctx.fillRect(barX, barY, barW, barH);

    const barColor = healthPct > 0.6 ? PALETTE.green : healthPct > 0.3 ? PALETTE.yellow : PALETTE.red;
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, Math.floor(barW * healthPct), barH);

    ctx.fillStyle = PALETTE.white;
    ctx.fillRect(barX, barY, barW, 1);
    ctx.fillRect(barX, barY + barH - 1, barW, 1);
    ctx.fillRect(barX, barY, 1, barH);
    ctx.fillRect(barX + barW - 1, barY, 1, barH);

    ctx.font = "6px 'Press Start 2P', monospace";
    ctx.fillStyle = PALETTE.white;
    ctx.fillText('BASE', barX, barY + barH + 9);
  }

  _drawWaveClear(ctx) {
    const alpha = Math.min(1, Math.sin((this.waveClearTimer / 3000) * Math.PI));
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.font = "16px 'Press Start 2P', monospace";
    ctx.fillStyle = PALETTE.yellow;
    ctx.fillText(`WAVE ${this.waveManager.wave} CLEAR!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.font = "9px 'Press Start 2P', monospace";
    ctx.fillStyle = PALETTE.cyan;
    ctx.fillText(`+${500 * (this.waveManager.wave + 1)} BONUS`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 4);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  // ─── GAME OVER ─────────────────────────────────────────────────────────────

  _updateGameOver(dt) {
    this.gameOverScreen.update(dt);
    if (this.gameOverScreen.canAcceptInput() && this.input.wasPressed('Space')) {
      this.state = 'TITLE';
    }
    if (this.input.wasPressed('KeyM')) this.audio.toggleMusic();
  }

  _drawGameOver() {
    // Draw the frozen playing field behind the overlay
    const ctx = this.ctx;
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this._drawStars(ctx);
    this._drawGround(ctx);
    for (const la of this.landedAliens) drawLandedAlien(ctx, la.x, la.y);
    this.crtEffect.draw(ctx);
    this.gameOverScreen.draw(ctx);
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────

  addScreenShake(mag) {
    this.screenShakeMag = Math.max(this.screenShakeMag, mag);
  }

  triggerGameOver() {
    if (this.gameOverPending) return;
    this.gameOverPending = true;
    this.audio.stopMusic();
    // Brief delay then transition
    setTimeout(() => {
      this.gameOverScreen.init(this.score);
      this.state = 'GAME_OVER';
    }, 800);
  }

  _resetGame() {
    this.score = 0;
    this.baseHealth = BASE_HEALTH;
    this.screenShakeMag = 0;
    this.waveClearAnim = false;
    this.waveClearTimer = 0;
    this.gameOverPending = false;
    this.ships = [];
    this.fallingAliens = [];
    this.bullets = [];
    this.landedAliens = [];
    this.healthDrops = [];
    this.columnHeights = new Array(NUM_COLUMNS).fill(0);
    this.cannon = new Cannon();
    this.waveManager = new WaveManager();
    this.particleSystem = new ParticleSystem();
    this.audio.stopMusic();
  }
}

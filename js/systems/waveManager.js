import { SCORE_WAVE_BONUS } from '../constants.js';
import { AlienShip } from '../entities/ship.js';
import { Mothership } from '../entities/mothership.js';

export class WaveManager {
  constructor() {
    this.wave = 1;
    // Three clear phases: spawning regular ships → mothership → wave clear pause
    this.phase = 'spawning'; // 'spawning' | 'mothership' | 'clearing'
    this.shipsSpawned = 0;
    this.spawnTimer = 2000;
    this.waveClearTimer = 0;
  }

  getParams(wave) {
    const t = Math.min((wave - 1) / 11, 1);
    const lerp = (a, b, t) => a + (b - a) * t;
    return {
      shipSpeed:      lerp(70,   250,  t),   // clearly faster each wave
      dropInterval:   lerp(2800, 600,  t),
      alienFallSpeed: lerp(80,   220,  t),
      maxActiveShips: Math.min(2 + Math.floor(wave / 2), 8),
      shipHp:         wave >= 10 ? 3 : wave >= 5 ? 2 : 1,
      spawnInterval:  lerp(2500, 1000, t),
      totalShips:     4 + wave,              // wave 1 = 5, wave 2 = 6, ...
    };
  }

  getFallSpeed() {
    return this.getParams(this.wave).alienFallSpeed;
  }

  update(dt, game) {
    const p = this.getParams(this.wave);
    const aliveRegular = game.ships.filter(s => s.alive && !s.isMothership).length;
    const mothershipAlive = game.ships.some(s => s.isMothership && s.alive);

    // ── Phase 1: spawn fixed number of regular ships ──────────────────────────
    if (this.phase === 'spawning') {
      this.spawnTimer -= dt * 1000;
      if (this.spawnTimer <= 0 && this.shipsSpawned < p.totalShips) {
        if (aliveRegular < p.maxActiveShips) {
          const lane = Math.floor(Math.random() * 2);
          game.ships.push(new AlienShip(lane, p.shipSpeed, p.dropInterval, p.shipHp));
          this.shipsSpawned++;
        }
        this.spawnTimer = p.spawnInterval * (0.7 + Math.random() * 0.6);
      }

      // All ships for this wave spawned and cleared → bring in mothership
      if (this.shipsSpawned >= p.totalShips && aliveRegular === 0) {
        this.phase = 'mothership';
        game.ships.push(new Mothership(this.wave));
      }
    }

    // ── Phase 2: wait for mothership to be destroyed or escape ────────────────
    else if (this.phase === 'mothership') {
      if (!mothershipAlive) {
        this.phase = 'clearing';
        this.waveClearTimer = 3000;
        game.waveClearAnim = true;
      }
    }

    // ── Phase 3: brief pause then advance wave ────────────────────────────────
    else if (this.phase === 'clearing') {
      this.waveClearTimer -= dt * 1000;
      if (this.waveClearTimer <= 0) {
        game.score += SCORE_WAVE_BONUS * this.wave;
        this.wave++;
        this.phase = 'spawning';
        this.shipsSpawned = 0;
        this.spawnTimer = 2000;
        game.waveClearAnim = false;
      }
    }
  }
}

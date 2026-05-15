import { SCORE_WAVE_BONUS } from '../constants.js';
import { AlienShip } from '../entities/ship.js';
import { Mothership } from '../entities/mothership.js';

export class WaveManager {
  constructor() {
    this.wave = 1;
    this.spawnTimer = 1500;
    this.waveClearCountdown = -1;
    this.waveClearing = false;
    this.waveClearDelay = 3000;
    this.killCount = 0;          // ships killed this wave
    this.mothershipSpawned = false;
    this.mothershipKilled = false;
    // Mothership appears after this many ship kills per wave
    this.mothershipThreshold = 4;
  }

  getParams(wave) {
    const t = Math.min((wave - 1) / 11, 1);
    const lerp = (a, b, t) => a + (b - a) * t;
    return {
      shipSpeed:      lerp(60,   220,  t),
      dropInterval:   lerp(3000, 700,  t),
      alienFallSpeed: lerp(80,   220,  t),
      maxActiveShips: Math.floor(lerp(3, 10, t)),
      shipHp:         wave >= 12 ? 3 : wave >= 5 ? 2 : 1,
      spawnInterval:  lerp(3000, 1200, t),
    };
  }

  recordKill(isMothership = false) {
    if (isMothership) {
      this.mothershipKilled = true;
    } else {
      this.killCount++;
    }
  }

  update(dt, game) {
    const p = this.getParams(this.wave);

    // Handle wave-clear countdown
    if (this.waveClearing) {
      this.waveClearCountdown -= dt * 1000;
      if (this.waveClearCountdown <= 0) {
        this.wave++;
        this.waveClearing = false;
        this.waveClearCountdown = -1;
        this.spawnTimer = 1500;
        this.killCount = 0;
        this.mothershipSpawned = false;
        this.mothershipKilled = false;
        game.score += SCORE_WAVE_BONUS * this.wave;
        game.waveClearAnim = false;
      }
      return;
    }

    const liveShips = game.ships.filter(s => s.alive).length;
    const liveFalling = game.fallingAliens.filter(a => a.alive).length;
    const mothershipAlive = game.ships.some(s => s.isMothership && s.alive);

    // Wave clear: field empty AND mothership has been dealt with (killed or never spawned yet
    // and kill threshold not yet reached — but normally we wait for it to die or exit)
    const mothershipDone = !this.mothershipSpawned || this.mothershipKilled ||
      (this.mothershipSpawned && !mothershipAlive);

    if (liveShips === 0 && liveFalling === 0 && mothershipDone) {
      if (this.spawnTimer <= 0) {
        this.waveClearing = true;
        this.waveClearCountdown = this.waveClearDelay;
        game.waveClearAnim = true;
        return;
      }
    }

    // Spawn mothership once kill threshold is reached
    if (!this.mothershipSpawned && this.killCount >= this.mothershipThreshold) {
      this.mothershipSpawned = true;
      game.ships.push(new Mothership(this.wave));
      // Pause regular spawns while mothership is alive
      this.spawnTimer = 8000;
      return;
    }

    // Don't spawn regular ships while mothership is on screen
    if (mothershipAlive) return;

    // Spawn regular ships
    this.spawnTimer -= dt * 1000;
    if (this.spawnTimer <= 0) {
      const currentShips = game.ships.filter(s => s.alive && !s.isMothership).length;
      if (currentShips < p.maxActiveShips) {
        const lane = Math.floor(Math.random() * 2);
        game.ships.push(new AlienShip(lane, p.shipSpeed, p.dropInterval, p.shipHp));
      }
      this.spawnTimer = p.spawnInterval * (0.7 + Math.random() * 0.6);
    }
  }

  getFallSpeed() {
    return this.getParams(this.wave).alienFallSpeed;
  }
}

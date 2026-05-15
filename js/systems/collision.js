import { COLUMN_WIDTH, ALIEN_HEIGHT, HEALTH_PER_LANDED, MAX_STACK_HEIGHT, NUM_COLUMNS, GROUND_Y } from '../constants.js';

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export class CollisionSystem {
  check(game) {
    const { bullets, ships, fallingAliens, particleSystem, audio } = game;

    // Bullets vs ships
    for (const bullet of bullets) {
      if (!bullet.alive) continue;
      const bb = bullet.getBounds();
      for (const ship of ships) {
        if (!ship.alive) continue;
        if (overlaps(bb, ship.getBounds())) {
          bullet.alive = false;
          const killed = ship.hit();
          if (killed) {
            ship.alive = false;
            game.score += ship.score;
            if (ship.isMothership) {
              // Mothership death: massive shake + chain-kill all remaining enemies
              game.addScreenShake(20);
              const cx = ship.x + ship.width / 2;
              const cy = ship.y + ship.height / 2;
              particleSystem.emitExplosion(cx, cy, 'large', '#FF4400');
              particleSystem.emitExplosion(cx - 16, cy + 4, 'large', '#FFFF00');
              particleSystem.emitExplosion(cx + 16, cy + 4, 'large', '#8B00FF');
              particleSystem.emitExplosion(cx, cy - 4, 'large', '#FFFFFF');
              audio.playExplosion(1.0);
              setTimeout(() => audio.playExplosion(0.8), 120);
              setTimeout(() => audio.playExplosion(0.6), 280);

              // Chain explosions: destroy all regular ships and falling aliens
              let chainDelay = 80;
              for (const s of ships) {
                if (!s.alive || s.isMothership) continue;
                s.alive = false;
                game.score += s.score;
                const scx = s.x + s.width / 2;
                const scy = s.y + s.height / 2;
                setTimeout(() => {
                  particleSystem.emitExplosion(scx, scy, 'large', '#00FF41');
                  audio.playExplosion(0.5);
                }, chainDelay);
                chainDelay += 120;
              }
              for (const a of fallingAliens) {
                if (!a.alive) continue;
                a.alive = false;
                game.score += a.score;
                const ax = a.x + 8;
                const ay = a.y + 6;
                setTimeout(() => {
                  particleSystem.emitExplosion(ax, ay, 'small', '#FF00FF');
                }, chainDelay);
                chainDelay += 60;
              }
            } else {
              game.addScreenShake(6);
              particleSystem.emitExplosion(ship.x + 16, ship.y + 5, 'large', '#00FF41');
              audio.playExplosion(0.7);
            }
          } else {
            particleSystem.emitHit(ship.x + 16, ship.y + 5);
            audio.playHit();
          }
          break;
        }
      }
    }

    // Bullets vs falling aliens
    for (const bullet of bullets) {
      if (!bullet.alive) continue;
      const bb = bullet.getBounds();
      for (const alien of fallingAliens) {
        if (!alien.alive) continue;
        if (overlaps(bb, alien.getBounds())) {
          bullet.alive = false;
          alien.alive = false;
          game.score += alien.score;
          particleSystem.emitExplosion(alien.x + 8, alien.y + 6, 'small', '#FF00FF');
          audio.playExplosion(0.4);
          break;
        }
      }
    }

    // Falling aliens landing
    for (const alien of fallingAliens) {
      if (alien.landed && !alien._processed) {
        alien._processed = true;
        const col = Math.max(0, Math.min(NUM_COLUMNS - 1, Math.floor(alien.x / COLUMN_WIDTH)));
        const row = game.columnHeights[col];
        game.columnHeights[col]++;
        game.landedAliens.push({
          x: col * COLUMN_WIDTH,
          y: GROUND_Y - (row + 1) * ALIEN_HEIGHT - 2,
          col, row,
          animPhase: Math.random() * Math.PI * 2,
        });
        game.baseHealth -= HEALTH_PER_LANDED;
        audio.playAlienLand();
        game.addScreenShake(2);

        if (game.baseHealth <= 0 || game.columnHeights[col] >= MAX_STACK_HEIGHT) {
          game.triggerGameOver();
        }
      }
    }
  }
}

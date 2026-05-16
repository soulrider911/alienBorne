import { CANVAS_WIDTH, CANVAS_HEIGHT, PALETTE } from '../constants.js';
import { fetchLeaderboard } from '../services/highscores.js';

export class LeaderboardScreen {
  constructor() {
    this.state = 'loading';
    this.entries = [];
    this.highlight = null;
    this.blinkTimer = 0;
    this.blinkOn = true;
  }

  init(cachedData, highlight) {
    this.highlight = highlight || null;
    this.blinkTimer = 0;
    this.blinkOn = true;
    if (cachedData) {
      this.state = 'ready';
      this.entries = cachedData;
    } else {
      this.state = 'loading';
      this.entries = [];
      fetchLeaderboard().then(data => {
        this.state = 'ready';
        this.entries = data;
      }).catch(() => {
        this.state = 'error';
      });
    }
  }

  update(dt) {
    this.blinkTimer += dt * 1000;
    if (this.blinkTimer > 600) { this.blinkTimer = 0; this.blinkOn = !this.blinkOn; }
  }

  canAcceptInput() { return this.state !== 'loading'; }

  draw(ctx) {
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = PALETTE.darkBg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';

    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.fillStyle = PALETTE.cyan;
    ctx.fillText('GLOBAL LEADERBOARD', CANVAS_WIDTH / 2, 38);

    ctx.strokeStyle = PALETTE.green;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 48);
    ctx.lineTo(420, 48);
    ctx.stroke();

    if (this.state === 'loading') {
      if (this.blinkOn) {
        ctx.font = "8px 'Press Start 2P', monospace";
        ctx.fillStyle = PALETTE.white;
        ctx.fillText('LOADING...', CANVAS_WIDTH / 2, 180);
      }
    } else if (this.state === 'error') {
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.fillStyle = PALETTE.red;
      ctx.fillText('CONNECTION ERROR', CANVAS_WIDTH / 2, 170);
      ctx.font = "6px 'Press Start 2P', monospace";
      ctx.fillStyle = '#888888';
      ctx.fillText('SCORES UNAVAILABLE', CANVAS_WIDTH / 2, 188);
    } else {
      if (this.entries.length === 0) {
        ctx.font = "8px 'Press Start 2P', monospace";
        ctx.fillStyle = '#888888';
        ctx.fillText('NO SCORES YET', CANVAS_WIDTH / 2, 180);
      } else {
        const rows = this.entries.slice(0, 10);
        for (let i = 0; i < rows.length; i++) {
          const entry = rows[i];
          const y = 70 + i * 18;
          const rowH = 18;
          const isHighlight = this.highlight &&
            entry.initials === this.highlight.initials &&
            entry.score === this.highlight.score;

          let color;
          if (isHighlight) {
            color = '#00FFFF';
          } else if (i === 0) {
            color = '#FFD700';
          } else if (i === 1) {
            color = '#C0C0C0';
          } else if (i === 2) {
            color = '#CD7F32';
          } else {
            color = PALETTE.white;
          }

          if (isHighlight) {
            ctx.fillStyle = '#00FFFF';
            ctx.fillRect(100, y - rowH + 4, 1, rowH);
          }

          const rank = String(i + 1).padStart(2, '0');
          ctx.font = "7px 'Press Start 2P', monospace";
          ctx.fillStyle = color;
          ctx.textAlign = 'right';
          ctx.fillText(rank, 110, y);

          ctx.font = "8px 'Press Start 2P', monospace";
          ctx.fillStyle = color;
          ctx.textAlign = 'left';
          ctx.fillText(entry.initials, 160, y);

          const scoreStr = String(entry.score).padStart(7, '0');
          ctx.font = "8px 'Press Start 2P', monospace";
          ctx.fillStyle = color;
          ctx.textAlign = 'right';
          ctx.fillText(scoreStr, 360, y);
        }
      }
    }

    if (this.canAcceptInput() && this.blinkOn) {
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.fillStyle = PALETTE.white;
      ctx.textAlign = 'center';
      ctx.fillText('PRESS SPACE TO PLAY AGAIN', CANVAS_WIDTH / 2, 340);
    }

    ctx.textAlign = 'left';
  }
}

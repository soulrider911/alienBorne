import { CANVAS_WIDTH, CANVAS_HEIGHT, PALETTE } from '../constants.js';

export class GameOverScreen {
  constructor() {
    this.inputDelay = 2000;
    this.blinkTimer = 0;
    this.blinkOn = true;
    this.isNewHiScore = false;
    this.finalScore = 0;
    this.hiScore = 0;
  }

  init(score) {
    this.inputDelay = 2000;
    this.blinkTimer = 0;
    this.finalScore = score;
    this.promptInitials = false;
    this.hiScore = parseInt(localStorage.getItem('alienborne_hiscore') || '0');
    if (score > this.hiScore) {
      this.hiScore = score;
      this.isNewHiScore = true;
      localStorage.setItem('alienborne_hiscore', String(score));
    } else {
      this.isNewHiScore = false;
    }
  }

  update(dt) {
    if (this.inputDelay > 0) this.inputDelay -= dt * 1000;
    this.blinkTimer += dt * 1000;
    if (this.blinkTimer > 600) { this.blinkTimer = 0; this.blinkOn = !this.blinkOn; }
  }

  canAcceptInput() { return this.inputDelay <= 0; }

  draw(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';

    // GAME OVER with red glow
    ctx.font = "28px 'Press Start 2P', monospace";
    ctx.fillStyle = 'rgba(255,34,34,0.28)';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2 + 3, CANVAS_HEIGHT / 2 - 60);
    ctx.fillStyle = PALETTE.red;
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

    // Score label + value
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.fillStyle = PALETTE.white;
    ctx.fillText('SCORE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 18);
    ctx.font = "16px 'Press Start 2P', monospace";
    ctx.fillStyle = PALETTE.cyan;
    ctx.fillText(this.finalScore.toString().padStart(7, '0'), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 4);

    // Hi-score
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillStyle = PALETTE.yellow;
    ctx.fillText(`HI-SCORE: ${this.hiScore.toString().padStart(7, '0')}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 26);

    // New hi-score flash
    if (this.isNewHiScore && this.blinkOn) {
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.fillStyle = PALETTE.yellow;
      ctx.fillText('** NEW HIGH SCORE! **', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 46);
    }

    // Continue prompt
    if (this.inputDelay <= 0 && this.blinkOn) {
      ctx.font = "9px 'Press Start 2P', monospace";
      ctx.fillStyle = PALETTE.white;
      const prompt = this.promptInitials ? 'SPACE: ENTER INITIALS' : 'SPACE: LEADERBOARD';
      ctx.fillText(prompt, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 72);
    }

    ctx.textAlign = 'left';
  }
}

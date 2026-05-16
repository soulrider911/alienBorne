import { CANVAS_WIDTH, CANVAS_HEIGHT, PALETTE } from '../constants.js';
import { submitScore } from '../services/highscores.js';

export class InitialsScreen {
  constructor() {
    this.slots = ['_', '_', '_'];
    this.cursor = 0;
    this.state = 'entering';
    this.score = 0;
    this.onDone = null;
    this.blinkTimer = 0;
    this.blinkOn = true;
  }

  init(score, onDone) {
    this.slots = ['_', '_', '_'];
    this.cursor = 0;
    this.state = 'entering';
    this.score = score;
    this.onDone = onDone;
    this.blinkTimer = 0;
    this.blinkOn = true;
  }

  update(dt, input) {
    this.blinkTimer += dt * 1000;
    if (this.blinkTimer > 500) { this.blinkTimer = 0; this.blinkOn = !this.blinkOn; }

    if (this.state !== 'entering') return;

    for (let code = 65; code <= 90; code++) {
      const key = 'Key' + String.fromCharCode(code);
      if (input.wasPressed(key)) {
        this.slots[this.cursor] = String.fromCharCode(code);
        if (this.cursor < 2) this.cursor++;
        return;
      }
    }

    for (let d = 0; d <= 9; d++) {
      const key = 'Digit' + d;
      if (input.wasPressed(key)) {
        this.slots[this.cursor] = String(d);
        if (this.cursor < 2) this.cursor++;
        return;
      }
    }

    if (input.wasPressed('Backspace')) {
      if (this.cursor > 0) {
        this.cursor--;
        this.slots[this.cursor] = '_';
      } else {
        this.slots[0] = '_';
      }
      return;
    }

    if (input.wasPressed('Escape')) {
      this.state = 'skipped';
      this.onDone(null, null);
      return;
    }

    if (input.wasPressed('Enter') && !this.slots.includes('_')) {
      this.state = 'submitting';
      const initials = this.slots.join('');
      submitScore(initials, this.score)
        .then(() => { this.state = 'done'; this.onDone(initials, null); })
        .catch(err => { this.state = 'done'; this.onDone(initials, err); });
    }
  }

  draw(ctx) {
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';

    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.fillStyle = PALETTE.cyan;
    ctx.fillText('ENTER INITIALS', CANVAS_WIDTH / 2, 90);

    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillStyle = PALETTE.white;
    ctx.fillText('SCORE: ' + this.score.toString().padStart(7, '0'), CANVAS_WIDTH / 2, 115);

    const boxW = 28;
    const boxH = 28;
    const gap = 12;
    const totalW = boxW * 3 + gap * 2;
    const startX = Math.floor(CANVAS_WIDTH / 2 - totalW / 2);
    const boxY = 155;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * (boxW + gap);
      const isEmpty = this.slots[i] === '_';
      const isActive = i === this.cursor;

      let borderColor;
      if (isActive) {
        borderColor = PALETTE.cyan;
      } else if (!isEmpty) {
        borderColor = PALETTE.white;
      } else {
        borderColor = '#444444';
      }

      ctx.fillStyle = borderColor;
      ctx.fillRect(x, boxY, boxW, 1);
      ctx.fillRect(x, boxY + boxH - 1, boxW, 1);
      ctx.fillRect(x, boxY, 1, boxH);
      ctx.fillRect(x + boxW - 1, boxY, 1, boxH);

      ctx.font = "14px 'Press Start 2P', monospace";
      if (isActive) {
        ctx.fillStyle = PALETTE.cyan;
      } else if (!isEmpty) {
        ctx.fillStyle = PALETTE.white;
      } else {
        ctx.fillStyle = '#444444';
      }
      ctx.fillText(this.slots[i], Math.floor(x + boxW / 2), Math.floor(boxY + boxH / 2) + 6);
    }

    if (this.blinkOn) {
      const cursorX = startX + this.cursor * (boxW + gap);
      ctx.fillStyle = PALETTE.cyan;
      ctx.fillRect(Math.floor(cursorX + boxW / 2 - 4), boxY + boxH + 4, 8, 2);
    }

    if (this.state === 'entering') {
      const allFilled = !this.slots.includes('_');
      ctx.font = "6px 'Press Start 2P', monospace";
      ctx.fillStyle = allFilled ? '#888888' : '#444444';
      ctx.fillText('ENTER: SUBMIT  ESC: SKIP', CANVAS_WIDTH / 2, 210);
    } else if (this.state === 'submitting') {
      if (this.blinkOn) {
        ctx.font = "8px 'Press Start 2P', monospace";
        ctx.fillStyle = PALETTE.cyan;
        ctx.fillText('SAVING...', CANVAS_WIDTH / 2, 210);
      }
    }

    ctx.textAlign = 'left';
  }
}

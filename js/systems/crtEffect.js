import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

export class CRTEffect {
  constructor() {
    this._vignetteGradient = null;
  }

  _getVignette(ctx) {
    if (this._vignetteGradient) return this._vignetteGradient;
    const g = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.25,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.75
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.65)');
    this._vignetteGradient = g;
    return g;
  }

  draw(ctx) {
    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    for (let y = 0; y < CANVAS_HEIGHT; y += 2) {
      ctx.fillRect(0, y, CANVAS_WIDTH, 1);
    }
    // Vignette
    ctx.fillStyle = this._getVignette(ctx);
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

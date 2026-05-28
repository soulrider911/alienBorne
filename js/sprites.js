const SCALE = 2;

export function drawSprite(ctx, grid, x, y, scale = SCALE) {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const color = grid[row][col];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x + col * scale), Math.floor(y + row * scale), scale, scale);
    }
  }
}

const C = '#00FFFF';
const G = '#00FF41';
const M = '#FF00FF';
const W = '#FFFFFF';
const O = null;

const UFO_FRAMES = [
  [
    [O,O,O,O,O,C,C,C,C,C,C,O,O,O,O,O],
    [O,O,O,C,C,C,C,C,C,C,C,C,C,O,O,O],
    [O,G,G,G,G,G,G,G,G,G,G,G,G,G,G,O],
    [G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G],
    [O,M,O,W,O,M,O,W,O,M,O,W,O,M,O,O],
  ],
  [
    [O,O,O,O,O,C,C,C,C,C,C,O,O,O,O,O],
    [O,O,O,C,C,C,C,C,C,C,C,C,C,O,O,O],
    [O,G,G,G,G,G,G,G,G,G,G,G,G,G,G,O],
    [G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G],
    [O,W,O,M,O,W,O,M,O,W,O,M,O,W,O,O],
  ],
];

const ALIEN_FRAMES = [
  [
    [O,O,M,M,M,M,O,O],
    [O,M,M,M,M,M,M,O],
    [M,W,M,M,M,M,W,M],
    [M,M,G,M,M,G,M,M],
    [O,M,M,M,M,M,M,O],
    [M,O,M,O,O,M,O,M],
  ],
  [
    [O,O,M,M,M,M,O,O],
    [O,M,M,M,M,M,M,O],
    [M,W,M,M,M,M,W,M],
    [M,M,G,M,M,G,M,M],
    [O,M,M,M,M,M,M,O],
    [O,M,O,M,M,O,M,O],
  ],
  [
    [O,O,M,M,M,M,O,O],
    [O,M,M,M,M,M,M,O],
    [M,W,M,M,M,M,W,M],
    [M,M,G,M,M,G,M,M],
    [O,M,M,M,M,M,M,O],
    [O,O,M,M,M,M,O,O],
  ],
  [
    [O,O,M,M,M,M,O,O],
    [O,M,M,M,M,M,M,O],
    [M,W,M,M,M,M,W,M],
    [M,M,G,M,M,G,M,M],
    [O,M,M,M,M,M,M,O],
    [O,M,O,M,M,O,M,O],
  ],
];

const LANDED_ALIEN = [
  [O,M,M,M,M,M,M,O],
  [M,W,M,M,M,M,W,M],
  [M,M,G,M,M,G,M,M],
  [M,M,M,M,M,M,M,M],
  [M,M,O,O,O,O,M,M],
];

export function drawUFO(ctx, x, y, frame = 0, flipped = false) {
  const grid = UFO_FRAMES[frame % 2];
  if (flipped) {
    ctx.save();
    ctx.scale(-1, 1);
    drawSprite(ctx, grid, -x - 32, y);
    ctx.restore();
  } else {
    drawSprite(ctx, grid, x, y);
  }
}

export function drawFallingAlien(ctx, x, y, frame = 0) {
  drawSprite(ctx, ALIEN_FRAMES[frame % 4], x, y);
}

export function drawLandedAlien(ctx, x, y) {
  drawSprite(ctx, LANDED_ALIEN, x, y);
}

export function drawBullet(ctx, x, y) {
  ctx.fillStyle = '#00FFFF';
  ctx.fillRect(Math.floor(x - 2), Math.floor(y - 2), 4, 4);
}

// Mothership: 28 cols × 9 rows, scale=2 → 56×18px
const V = '#8B00FF'; // violet dome
const Y = '#FFFF00'; // yellow accents
const R = '#FF4400'; // orange-red hull

const MOTHERSHIP_FRAMES = [
  [
    [O,O,O,O,O,O,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,O,O,O,O,O,O,O],
    [O,O,O,O,O,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,O,O,O,O,O,O],
    [O,O,O,O,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,O,O,O,O,O],
    [O,O,O,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,O,O,O,O],
    [O,O,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,O,O,O],
    [O,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,O,O],
    [O,O,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,O,O,O],
    [O,O,O,Y,R,Y,R,Y,R,Y,R,Y,R,Y,R,Y,R,Y,R,Y,R,Y,R,Y,O,O,O,O],
    [O,O,O,O,Y,O,W,O,Y,O,W,O,Y,O,W,O,Y,O,W,O,Y,O,W,O,O,O,O,O],
  ],
  [
    [O,O,O,O,O,O,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,O,O,O,O,O,O,O],
    [O,O,O,O,O,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,O,O,O,O,O,O],
    [O,O,O,O,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,V,O,O,O,O,O],
    [O,O,O,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,O,O,O,O],
    [O,O,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,O,O,O],
    [O,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,O,O],
    [O,O,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,O,O,O],
    [O,O,O,Y,R,Y,R,Y,R,Y,R,Y,R,Y,R,Y,R,Y,R,Y,R,Y,R,Y,O,O,O,O],
    [O,O,O,O,W,O,Y,O,W,O,Y,O,W,O,Y,O,W,O,Y,O,W,O,Y,O,O,O,O,O],
  ],
];

export function drawMothership(ctx, x, y, frame = 0, flipped = false) {
  const grid = MOTHERSHIP_FRAMES[frame % 2];
  if (flipped) {
    ctx.save();
    ctx.scale(-1, 1);
    drawSprite(ctx, grid, -x - 56, y);
    ctx.restore();
  } else {
    drawSprite(ctx, grid, x, y);
  }
}

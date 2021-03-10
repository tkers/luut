import { resizeCanvas } from "./canvas";
import {
  createTileSet,
  createAnimation,
  spr_tiles,
  spr_bat,
  spr_skeleton,
  spr_knight,
  spr_knight_flip,
  spr_slime,
  spr_coin,
} from "./sprites";
import { randomPositions } from "./rnd";
let ctx, drawTile, drawBat, drawSkeleton, drawKnight, drawSlime, drawCoin;
let keys = {};
let knightX, knightY, knightDir;
let entities = [];

const CELL_SIZE = 16;
const WIDTH = 20;
const HEIGHT = 20;
const SCALE = 2;

window.addEventListener("keydown", function (e) {
  keys[e.keyCode] = true;
});

window.addEventListener("keyup", function (e) {
  keys[e.keyCode] = false;
});

window.addEventListener("load", function () {
  start();
  update();
});

function start() {
  const canvas = document.getElementById("root");
  resizeCanvas(canvas, WIDTH * CELL_SIZE, HEIGHT * CELL_SIZE, SCALE);
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  drawTile = createTileSet(ctx, spr_tiles, CELL_SIZE);
  drawBat = createAnimation(ctx, spr_bat, CELL_SIZE);
  drawSkeleton = createAnimation(ctx, spr_skeleton, CELL_SIZE);
  drawKnight = [
    createAnimation(ctx, spr_knight, CELL_SIZE),
    createAnimation(ctx, spr_knight_flip, CELL_SIZE),
  ];
  drawSlime = createAnimation(ctx, spr_slime, CELL_SIZE);
  drawCoin = createAnimation(ctx, spr_coin, CELL_SIZE);

  const drawStairs = (x, y) => drawTile(8, 1, x, y);

  knightX = 2;
  knightY = 2;
  knightDir = 0;

  const rndPos = randomPositions(1, 1, WIDTH - 1, HEIGHT - 1).filter(
    ([x, y]) => x > 3 || y > 3
  );

  [drawStairs, drawCoin, drawCoin, drawBat, drawSkeleton, drawSlime].forEach(
    (spr) => {
      const [x, y] = rndPos.pop();
      entities.push({ spr, x, y });
    }
  );
}

const keyMap = {
  37: () => {
    if (knightX > 1) knightX--;
    knightDir = 1;
  },
  38: () => {
    if (knightY > 1) knightY--;
  },
  39: () => {
    if (knightX < WIDTH - 2) knightX++;
    knightDir = 0;
  },
  40: () => {
    if (knightY < HEIGHT - 2) knightY++;
  },
};

function update() {
  Object.entries(keyMap).forEach(([n, fn]) => {
    if (keys[n]) {
      keys[n] = false;
      fn();
    }
  });

  ctx.clearRect(0, 0, WIDTH * CELL_SIZE, HEIGHT * CELL_SIZE);

  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      // ctx.drawImage(spr_tiles, 1 * 16, 1 * 16, 16, 16, x * 16, y * 16, 16, 16);
      drawTile(1, 1, x, y);
    }
  }

  // ctx.drawImage(spr_tiles, 10, 10);

  // top wall
  drawTile(0, 0, 0, 0);
  for (let x = 1; x < WIDTH - 1; x++) {
    drawTile(1, 0, x, 0);
  }
  drawTile(2, 0, WIDTH - 1, 0);

  // bottom wall
  drawTile(0, 2, 0, HEIGHT - 1);
  for (let x = 1; x < WIDTH - 1; x++) {
    drawTile(1, 2, x, HEIGHT - 1);
  }
  drawTile(2, 2, WIDTH - 1, HEIGHT - 1);

  // left wall
  for (let y = 0; y < HEIGHT - 1; y++) {
    drawTile(0, 1, 0, y);
  }

  // right wall
  for (let y = 0; y < HEIGHT - 1; y++) {
    drawTile(2, 1, WIDTH - 1, y);
  }

  entities.forEach(({ spr, x, y }) => spr(x, y));

  drawKnight[knightDir](knightX, knightY);

  // ctx.restore();
  // // Draw background
  // for (let i = 0; i < worldWidth; i += bg_grid.width) {
  //   view.drawImage(ctx, bg_grid, i, 0);
  // }
  //
  // // Draw timer
  // ctx.fillStyle = "rgb(90,130,64)";
  // ctx.fillRect(0, 0, Math.max(0, view.width * (waveProgress / waveMax)), 5);
  //
  // // Draw tiles
  // tiles.forEach(({ img, x, y, ox, oy }) =>
  //   view.drawImage(ctx, img, ox * 20, oy * 20, 20, 20, x * 20, y * 20, 20, 20)
  // );
  //
  // // Draw sprites
  // spriteSystem(view, ctx, spriteFamily.getEntities());

  requestAnimationFrame(update);
}

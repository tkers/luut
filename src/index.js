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
import { randomPositions, randomElem } from "./rnd";
import { handleSwipe } from "./touch";
let ctx,
  drawStairs,
  drawTile,
  drawBat,
  drawSkeleton,
  drawKnight,
  drawSlime,
  drawCoin;
let keys = {};
let knightX, knightY, knightDir, knightDrawX, knightDrawY;
let entities;
let stairsX, stairsY;
let isDescending, fade;

const CELL_SIZE = 16;
const WIDTH = 12;
const HEIGHT = 8;
const SCALE = 3;

window.addEventListener("keydown", function (e) {
  keys[e.keyCode] = true;
});

window.addEventListener("keyup", function (e) {
  keys[e.keyCode] = false;
});

handleSwipe((keyCode) => {
  keys[keyCode] = true;
});

window.addEventListener("load", function () {
  init();
  start();
  update();
});

function init() {
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

  drawStairs = (x, y) => drawTile(8, 1, x, y);

  knightX = 2;
  knightY = 2;
  knightDir = 0;
}

function start() {
  isDescending = false;
  fade = 2;

  const rndPos = randomPositions(1, 1, WIDTH - 1, HEIGHT - 1).filter(
    ([x, y]) => Math.abs(x - knightX) > 1 || Math.abs(y - knightY) > 1
  );

  [stairsX, stairsY] = rndPos.pop();
  entities = [{ spr: drawStairs, x: stairsX, y: stairsY }];

  [drawCoin, drawCoin, drawBat, drawSkeleton, drawSlime].forEach((spr) => {
    const [x, y] = rndPos.pop();
    entities.push({ spr, x, y });
  });
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

const nextPosition = (x, y) => {
  const opts = [];
  if (x > 1) opts.push([x - 1, y]);
  if (y > 1) opts.push([x, y - 1]);
  if (x < WIDTH - 2) opts.push([x + 1, y]);
  if (y < HEIGHT - 2) opts.push([x, y + 1]);
  return randomElem(opts);
};

function update() {
  // descend

  if (isDescending) {
    if (fade < 1) fade += Math.min(1 - fade, 1 / 15);
    else start();
  } else {
    if (fade > 0) fade -= Math.min(fade, 1 / 15);
    if (knightX === stairsX && knightY === stairsY) isDescending = true;
  }

  // input

  if (!isDescending) {
    Object.entries(keyMap).forEach(([n, fn]) => {
      if (keys[n]) {
        keys[n] = false;
        fn();
        entities.slice(3).forEach((ent) => {
          const [x, y] = nextPosition(ent.x, ent.y);
          ent.x = x;
          ent.y = y;
        });
      }
    });
  }

  // draw

  ctx.clearRect(0, 0, WIDTH * CELL_SIZE, HEIGHT * CELL_SIZE);

  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      drawTile(1, 1, x, y);
    }
  }

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

  entities.forEach((ent) => {
    if (typeof ent.drawX === "undefined") ent.drawX = ent.x;
    if (typeof ent.drawY === "undefined") ent.drawY = ent.y;
    if (ent.drawX < ent.x) ent.drawX += Math.min(ent.x - ent.drawX, 1 / 5);
    if (ent.drawY < ent.y) ent.drawY += Math.min(ent.y - ent.drawY, 1 / 5);
    if (ent.drawX > ent.x) ent.drawX -= Math.min(ent.drawX - ent.x, 1 / 5);
    if (ent.drawY > ent.y) ent.drawY -= Math.min(ent.drawY - ent.y, 1 / 5);
    ent.spr(ent.drawX, ent.drawY);
  });

  if (typeof knightDrawX === "undefined") knightDrawX = knightX;
  if (typeof knightDrawY === "undefined") knightDrawY = knightY;
  if (knightDrawX < knightX)
    knightDrawX += Math.min(knightX - knightDrawX, 1 / 5);
  if (knightDrawY < knightY)
    knightDrawY += Math.min(knightY - knightDrawY, 1 / 5);
  if (knightDrawX > knightX)
    knightDrawX -= Math.min(knightDrawX - knightX, 1 / 5);
  if (knightDrawY > knightY)
    knightDrawY -= Math.min(knightDrawY - knightY, 1 / 5);
  drawKnight[knightDir](knightDrawX, knightDrawY);

  if (fade > 0) {
    ctx.fillStyle = `rgba(39, 29, 42, ${fade})`;
    ctx.fillRect(0, 0, WIDTH * CELL_SIZE, HEIGHT * CELL_SIZE);
  }

  requestAnimationFrame(update);
}

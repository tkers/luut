import { CELL_SIZE, WIDTH, HEIGHT, SCALE } from "./config";
import { setupCanvas } from "./canvas";
import { handleSwipe } from "./touch";

import { createTileSet, createAnimation } from "./gfx";
import { tweenPos } from "./tween";
import { randomPositions, randomElem } from "./rnd";

import {
  makeKnight,
  makeCoin,
  makeBat,
  makeSkeleton,
  makeSlime,
} from "./things";

import { spr_tiles } from "./sprites";

let ctx, drawStairs, drawTile;
let keys = {};
let entities;
let stairsX, stairsY;
let isDescending, fade;
let knight;

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
  ctx = setupCanvas("root", WIDTH * CELL_SIZE, HEIGHT * CELL_SIZE, SCALE);

  drawTile = createTileSet(spr_tiles, CELL_SIZE);

  drawStairs = (ctx, x, y) => drawTile(ctx, 8, 1, x, y);

  knight = makeKnight(2, 2);
}

function start() {
  isDescending = false;
  fade = 1.5;

  const rndPos = randomPositions(1, 1, WIDTH - 1, HEIGHT - 1).filter(
    ([x, y]) => Math.abs(x - knight.x) > 1 || Math.abs(y - knight.y) > 1
  );

  [stairsX, stairsY] = rndPos.pop();
  entities = [];
  [makeCoin, makeCoin, makeBat, makeSkeleton, makeSlime].forEach((make) => {
    const [x, y] = rndPos.pop();
    entities.push(make(x, y));
  });
}

const keyMap = {
  37: () => {
    if (knight.x > 1) knight.x--;
    knight.dir = 1;
  },
  38: () => {
    if (knight.y > 1) knight.y--;
  },
  39: () => {
    if (knight.x < WIDTH - 2) knight.x++;
    knight.dir = 0;
  },
  40: () => {
    if (knight.y < HEIGHT - 2) knight.y++;
  },
};

function update() {
  // input

  if (!isDescending) {
    Object.entries(keyMap).forEach(([n, fn]) => {
      if (keys[n]) {
        keys[n] = false;
        fn();
        entities
          .filter((e) => !!e.turn)
          .forEach((ent) => {
            const [x, y] = ent.turn(ent.x, ent.y);
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
      drawTile(ctx, 1, 1, x, y);
    }
  }

  // top wall
  drawTile(ctx, 0, 0, 0, 0);
  for (let x = 1; x < WIDTH - 1; x++) {
    drawTile(ctx, 1, 0, x, 0);
  }
  drawTile(ctx, 2, 0, WIDTH - 1, 0);

  // bottom wall
  drawTile(ctx, 0, 2, 0, HEIGHT - 1);
  for (let x = 1; x < WIDTH - 1; x++) {
    drawTile(ctx, 1, 2, x, HEIGHT - 1);
  }
  drawTile(ctx, 2, 2, WIDTH - 1, HEIGHT - 1);

  // left wall
  for (let y = 0; y < HEIGHT - 1; y++) {
    drawTile(ctx, 0, 1, 0, y);
  }

  // right wall
  for (let y = 0; y < HEIGHT - 1; y++) {
    drawTile(ctx, 2, 1, WIDTH - 1, y);
  }

  // stairs
  drawStairs(ctx, stairsX, stairsY);

  // monsters and items
  entities.forEach((ent) => {
    const [x, y] = tweenPos(ent);
    ent.draw(ctx, x, y);
  });

  // player
  const [knightDrawX, knightDrawY] = tweenPos(knight);
  knight.draw(ctx, knightDrawX, knightDrawY);

  // descend

  if (isDescending) {
    if (fade < 1) fade += Math.min(1 - fade, 1 / 12);
    else start();
  } else {
    if (fade > 0) fade -= Math.min(fade, 1 / 12);
    if (knight.x === stairsX && knight.y === stairsY) isDescending = true;
  }

  // descend fade-out
  if (fade > 0) {
    ctx.fillStyle = `rgba(39, 29, 42, ${fade})`;
    ctx.fillRect(0, 0, WIDTH * CELL_SIZE, HEIGHT * CELL_SIZE);
  }

  // loop!
  requestAnimationFrame(update);
}

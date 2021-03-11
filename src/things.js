import { WIDTH, HEIGHT, CELL_SIZE } from "./config";
import { randomElem } from "./rnd";

import { createTileSet, createAnimation } from "./gfx";
import {
  spr_tiles,
  spr_knight,
  spr_knight_flip,
  spr_coin,
  spr_bat,
  spr_skeleton,
  spr_slime,
} from "./sprites";

const drawTile = createTileSet(spr_tiles, CELL_SIZE);

const randomWalk = (x, y) => {
  const opts = [];
  if (x > 1) opts.push([x - 1, y]);
  if (y > 1) opts.push([x, y - 1]);
  if (x < WIDTH - 2) opts.push([x + 1, y]);
  if (y < HEIGHT - 2) opts.push([x, y + 1]);
  return randomElem(opts);
};

export const makeKnight = (x, y) => {
  const draw = [
    createAnimation(spr_knight, CELL_SIZE),
    createAnimation(spr_knight_flip, CELL_SIZE),
  ];
  const knight = {
    name: "Knight",
    x,
    y,
    dir: 0,
  };
  knight.draw = (...args) => draw[knight.dir](...args);
  return knight;
};

export const makeStairs = (x, y) => ({
  name: "Stairs",
  draw: (ctx, x, y) => drawTile(ctx, 8, 1, x, y),
  x,
  y,
});

export const makeCoin = (x, y) => ({
  name: "Coin",
  draw: createAnimation(spr_coin, CELL_SIZE),
  x,
  y,
});

export const makeBat = (x, y) => ({
  name: "Bat",
  draw: createAnimation(spr_bat, CELL_SIZE),
  turn: randomWalk,
  x,
  y,
});

export const makeSkeleton = (x, y) => ({
  name: "Skeleton",
  draw: createAnimation(spr_skeleton, CELL_SIZE),
  turn: randomWalk,
  x,
  y,
});

export const makeSlime = (x, y) => ({
  name: "Slime",
  draw: createAnimation(spr_slime, CELL_SIZE),
  turn: randomWalk,
  x,
  y,
});

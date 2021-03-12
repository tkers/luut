import { WIDTH, HEIGHT, CELL_SIZE } from "./config";
import { randomElem } from "./rnd";

import { createTileSet, createAnimation } from "./gfx";
import {
  spr_tiles,
  spr_knight,
  spr_knight_flip,
  spr_coin,
  spr_potion,
  spr_bat,
  spr_skeleton,
  spr_slime,
} from "./sprites";

const drawTile = createTileSet(spr_tiles, CELL_SIZE);

const getRandomMove = (me, isFreeAt) => {
  const opts = [
    [me.x - 1, me.y],
    [me.x, me.y - 1],
    [me.x + 1, me.y],
    [me.x, me.y + 1],
  ].filter(([x, y]) => isFreeAt(x, y));
  const nextPos = randomElem(opts);
  return nextPos && { type: "Move", x: nextPos[0], y: nextPos[1] };
};

const getTargetMove = (me, tgt, isFreeAt) => {
  const opts = [
    [me.x - 1, me.y],
    [me.x, me.y - 1],
    [me.x + 1, me.y],
    [me.x, me.y + 1],
    [me.x + (me.x > tgt.x ? -1 : 1), me.y],
    [me.x, me.y + (me.y > tgt.y ? -1 : 1)],
  ].filter(([x, y]) => isFreeAt(x, y));
  const nextPos = randomElem(opts);
  return nextPos && { type: "Move", x: nextPos[0], y: nextPos[1] };
};

const randomWalk = ({ me }) => [getRandomMove(me)];

const randomLazyWalk = ({ me, isFreeAt }) =>
  Math.random() > 0.5 ? [getRandomMove(me, isFreeAt)] : [];

const aggressiveWalk = ({ me, player, isFreeAt }) => [
  getTargetMove(me, player, isFreeAt),
];

const randomWalkAndSplice = ({ me, isFreeAt }) => {
  const actions = [];
  me.grow++;
  if (me.grow === 8) {
    actions.push({ type: "Spawn", make: makeSlime });
  }
  actions.push(getRandomMove(me, isFreeAt));
  return actions;
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
  sort: 10,
  x,
  y,
});

export const makeCoin = (x, y) => ({
  name: "Coin",
  draw: createAnimation(spr_coin, CELL_SIZE),
  sort: 5,
  x,
  y,
});

export const makePotion = (x, y) => ({
  name: "Potion",
  draw: createAnimation(spr_potion, CELL_SIZE),
  sort: 5,
  x,
  y,
});

export const makeBat = (x, y) => ({
  name: "Bat",
  draw: createAnimation(spr_bat, CELL_SIZE),
  turn: randomLazyWalk,
  x,
  y,
});

export const makeSkeleton = (x, y) => ({
  name: "Skeleton",
  draw: createAnimation(spr_skeleton, CELL_SIZE),
  turn: aggressiveWalk,
  x,
  y,
});

export const makeSlime = (x, y) => ({
  name: "Slime",
  draw: createAnimation(spr_slime, CELL_SIZE),
  turn: randomWalkAndSplice,
  grow: 0,
  x,
  y,
});

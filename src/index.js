import { CELL_SIZE, WIDTH, HEIGHT, SCALE } from "./config";
import { setupCanvas } from "./canvas";
import { handleSwipe } from "./touch";

import { createTileSet, createAnimation } from "./gfx";
import { tweenPos } from "./tween";
import { randomPositions, randomElem, shuffleArray } from "./rnd";

import { randomMap } from "./maps";
import { makeKnight, makeStairs, makeTorch } from "./things";
import { decideSpawns } from "./floors";

import { spr_tiles } from "./sprites";

let ctx, drawTile;
let keys = {};
let entities;
let isDescending, isDead, fade;
let knight;
let floor, coins, lives;
let floorPlan, tilePlan;
let hitFade = 0;
let hitX, hitY;

const hideExtraHud = () => {
  const elem = document.getElementById("extra-hud");
  elem.style.opacity = "0";
  elem.style.pointerEvents = "none";
};

const redrawStats = () => {
  document.getElementById("floor-hud").textContent = `${floor}`;
  document.getElementById("coins-hud").textContent = `${coins}`;
  document.getElementById("lives-hud").textContent = `${lives}`;
};

const incrementFloor = () => {
  floor++;
  redrawStats();
};

const incrementCoins = () => {
  coins++;
  redrawStats();
};

const incrementLives = () => {
  lives++;
  redrawStats();
};

const decrementLives = () => {
  lives--;
  redrawStats();
  hitFade = 1;
  hitX = knight.x;
  hitY = knight.y;
  if (lives <= 0) {
    isDead = true;
  }
};

const addEntity = (ent) => {
  entities.push(ent);
  entities.sort((a, b) => (b.sort || 0) - (a.sort || 0));
};
const getEntityAt = (x, y) => entities.find((e) => e.x === x && e.y === y);
const removeEntity = (ent) => {
  entities = entities.filter((e) => e !== ent);
};

const isWallAt = (x, y) =>
  x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT && floorPlan[y][x] === 1;

const isFloorAt = (x, y) =>
  x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT && floorPlan[y][x] === 0;

const isFreeAt = (x, y) => {
  if (isWallAt(x, y)) return false;
  const ent = getEntityAt(x, y);
  return !ent || ent.name !== "Stairs";
};

const WN = 1;
const FN = 2;
const WE = 4;
const FE = 8;
const WS = 16;
const FS = 32;
const WW = 64;
const FW = 128;
const getWallTile = (x, y) => {
  const n = isWallAt(x, y - 1) ? WN : 0;
  const nf = isFloorAt(x, y - 1) ? FN : 0;
  const e = isWallAt(x + 1, y) ? WE : 0;
  const ef = isFloorAt(x + 1, y) ? FE : 0;
  const s = isWallAt(x, y + 1) ? WS : 0;
  const sf = isFloorAt(x, y + 1) ? FS : 0;
  const w = isWallAt(x - 1, y) ? WW : 0;
  const wf = isFloorAt(x - 1, y) ? FW : 0;
  const shape = n + nf + e + ef + s + sf + w + wf;
  switch (shape) {
    case WE + WS:
      return [0, 0];
    case WE + FS + WW:
      return [1, 0];
    case WW + WS:
      return [2, 0];
    case WN + FE + WS:
    case WN + FE + WS + WW:
      return [0, 1];
    case WN + WS + FW:
    case WN + WE + WS + FW:
      return [2, 1];
    case WN + WE:
      return [0, 2];
    case FN + WE + WW:
    case FN + WE + WS + WW:
      return [1, 2];
    case WN + WW:
      return [2, 2];
    case FN + WE + WS + FW:
      return [3, 0];
    case FN + WW + WS + FE:
      return [4, 0];
    case WN + WE + FS + FW:
      return [3, 1];
    case WN + FE + FS + WW:
      return [4, 1];
    default:
      return [1, 0];
  }
};

const canHoldTorch = (tile) => {
  if (!tile) return false;
  const [tx, ty] = tile;
  return (
    (tx === 1 && ty === 0) || (tx === 3 && ty === 1) || (tx === 4 && ty === 1)
  );
};

const getTile = (x, y) => {
  if (isFloorAt(x, y)) return [1, 1];
  else if (isWallAt(x, y)) return getWallTile(x, y);
  return null;
};

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
}

function start() {
  knight = makeKnight(2, 2);
  isDead = false;

  floor = 0;
  coins = 0;
  lives = 5;

  startNextFloor();
}

function startNextFloor() {
  isDescending = false;
  fade = 1.5;
  entities = [];

  incrementFloor();

  floorPlan = randomMap(floor, knight.x, knight.y);
  tilePlan = [];
  const torchPositions = [];
  for (let y = 0; y < HEIGHT; y++) {
    tilePlan[y] = [];
    for (let x = 0; x < WIDTH; x++) {
      const t = getTile(x, y);
      tilePlan[y].push(t);
      if (canHoldTorch(t)) torchPositions.push([x, y]);
    }
  }

  shuffleArray(torchPositions);
  torchPositions
    .slice(0, (Math.random() * torchPositions.length) / 2.2)
    .forEach(([x, y]) => addEntity(makeTorch(x, y)));

  const rndPos = randomPositions(0, 0, WIDTH, HEIGHT)
    .filter(([x, y]) => isFloorAt(x, y))
    .filter(
      ([x, y]) => Math.abs(x - knight.x) > 1 || Math.abs(y - knight.y) > 1
    );

  const [stairsX, stairsY] = rndPos.pop();
  addEntity(makeStairs(stairsX, stairsY));

  const toSpawn = decideSpawns(floor, rndPos.length);
  toSpawn.forEach((make) => {
    const [x, y] = rndPos.pop();
    addEntity(make(x, y));
  });
}

const moveLeft = () => {
  if (!isWallAt(knight.x - 1, knight.y)) knight.x--;
  knight.dir = 1;
};

const moveUp = () => {
  if (!isWallAt(knight.x, knight.y - 1)) knight.y--;
};

const moveRight = () => {
  if (!isWallAt(knight.x + 1, knight.y)) knight.x++;
  knight.dir = 0;
};

const moveDown = () => {
  if (!isWallAt(knight.x, knight.y + 1)) knight.y++;
};

const keyMap = {
  // arrows
  37: moveLeft,
  38: moveUp,
  39: moveRight,
  40: moveDown,
  // vi
  72: moveLeft,
  74: moveDown,
  75: moveUp,
  76: moveRight,
};

function handleCollision(ent, beforeMove) {
  if (ent.name === "Stairs") {
    isDescending = true;
    hideExtraHud();
  }
  if (ent.name === "Coin") {
    incrementCoins();
    removeEntity(ent);
  }
  if (ent.name === "Potion") {
    incrementLives();
    removeEntity(ent);
  }
  if (ent.name === "Trap" && ent.isActive && !beforeMove) {
    decrementLives();
  }
  if (ent.name === "Slime" || ent.name === "Bat" || ent.name === "Skeleton") {
    decrementLives();
    removeEntity(ent);
  }
}

function update() {
  // input & movement

  if (!isDead && !isDescending) {
    Object.entries(keyMap).forEach(([keyCode, moveKnight]) => {
      if (keys[keyCode]) {
        keys[keyCode] = false;

        // First move player
        moveKnight();

        // Check for collisions
        const oldHit = getEntityAt(knight.x, knight.y);
        if (oldHit) handleCollision(oldHit, true);

        // Move the monsters next
        entities
          .filter((e) => !!e.turn && !e.isDead)
          .forEach((ent) => {
            const actions = ent.turn({
              me: ent,
              player: knight,
              floor,
              isFreeAt,
              getEntityAt,
            });
            actions.forEach((action) => {
              if (action.type === "Move") {
                ent.x = action.x;
                ent.y = action.y;
              }
              if (action.type === "Spawn") {
                addEntity(action.make(ent.x, ent.y));
              }
            });
            if (
              ent.name === "Bat" ||
              ent.name === "Skeleton" ||
              ent.name === "Slime"
            ) {
              const dest = getEntityAt(ent.x, ent.y);
              if (
                dest &&
                dest.name === "Trap" &&
                dest.isActive &&
                !ent.isDead
              ) {
                ent.isDead = true;
                ent.fade = 1;
              }
            }
          });

        // Check for new collisions
        const newHit = getEntityAt(knight.x, knight.y);
        if (newHit) handleCollision(newHit, false);
      }
    });
  }

  // restart
  if (isDead && fade > 1.5) {
    Object.entries(keyMap).forEach(([keyCode]) => {
      if (keys[keyCode]) {
        keys[keyCode] = false;
        start();
      }
    });
  }

  // draw dungeon

  ctx.clearRect(0, 0, WIDTH * CELL_SIZE, HEIGHT * CELL_SIZE);

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const t = tilePlan[y][x];
      if (t) drawTile(ctx, t[0], t[1], x, y);
    }
  }

  // monsters and items
  const toRemove = [];
  entities.forEach((ent) => {
    const [x, y] = tweenPos(ent);
    if (ent.isDead) {
      if (ent.fade > 0) ent.fade -= Math.min(ent.fade, 1 / 60);
      else toRemove.push(ent);
      ctx.globalAlpha = ent.fade;
    }
    ent.draw(ctx, x, y);
    ctx.globalAlpha = 1;
  });

  toRemove.forEach(removeEntity);

  // player
  const [knightDrawX, knightDrawY] = tweenPos(knight);
  knight.draw(ctx, knightDrawX, knightDrawY);
  if (hitFade > 0) {
    hitFade -= Math.min(hitFade, 1 / 36);

    ctx.fillStyle = `rgba(250, 0, 0, ${hitFade / 2})`;
    ctx.globalCompositeOperation = "overlay";

    ctx.beginPath();
    ctx.arc(
      (hitX + 0.5) * CELL_SIZE,
      (hitY + 0.5) * CELL_SIZE,
      CELL_SIZE * 0.6,
      0,
      2 * Math.PI
    );
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
  }

  // descend & gameover

  if (isDescending) {
    if (fade < 1) fade += Math.min(1 - fade, 1 / 12);
    else startNextFloor();
  } else if (isDead) {
    if (fade < 2) fade += Math.min(2 - fade, 2 / 60);
  } else {
    if (fade > 0) fade -= Math.min(fade, 1 / 12);
  }

  // fade-out
  if (fade > 0) {
    ctx.fillStyle = `rgba(39, 29, 42, ${fade})`;
    ctx.fillRect(0, 0, WIDTH * CELL_SIZE, HEIGHT * CELL_SIZE);

    if (isDead) {
      ctx.globalAlpha = fade > 1 ? fade - 1 : 0;
      drawTile(ctx, 17, 1, WIDTH / 2 - 0.5, HEIGHT / 2 - 0.5);
      ctx.globalAlpha = 1;
    }
  }

  // loop!
  requestAnimationFrame(update);
}

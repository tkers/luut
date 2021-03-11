import { CELL_SIZE, WIDTH, HEIGHT, SCALE } from "./config";
import { setupCanvas } from "./canvas";
import { handleSwipe } from "./touch";

import { createTileSet, createAnimation } from "./gfx";
import { tweenPos } from "./tween";
import { randomPositions, randomElem } from "./rnd";

import {
  makeKnight,
  makeStairs,
  makeCoin,
  makeBat,
  makeSkeleton,
  makeSlime,
} from "./things";

import { spr_tiles } from "./sprites";

let ctx, drawTile;
let keys = {};
let entities;
let isDescending, isDead, fade;
let knight;
let floor, coins, lives;

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

const decrementLives = () => {
  lives--;
  redrawStats();
  if (lives <= 0) {
    isDead = true;
  }
};

const getEntityAt = (x, y) => entities.find((e) => e.x === x && e.y === y);
const removeEntity = (ent) => {
  entities = entities.filter((e) => e !== ent);
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
  lives = 3;

  startNextFloor();
}

function startNextFloor() {
  isDescending = false;
  fade = 1.5;

  incrementFloor();

  const rndPos = randomPositions(1, 1, WIDTH - 1, HEIGHT - 1).filter(
    ([x, y]) => Math.abs(x - knight.x) > 1 || Math.abs(y - knight.y) > 1
  );

  entities = [];
  [makeStairs, makeCoin, makeCoin, makeBat, makeSkeleton, makeSlime].forEach(
    (make) => {
      const [x, y] = rndPos.pop();
      entities.push(make(x, y));
    }
  );
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

function handleCollision(ent) {
  if (ent.name === "Stairs") isDescending = true;
  if (ent.name === "Coin") {
    incrementCoins();
    removeEntity(ent);
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
        if (oldHit) handleCollision(oldHit);

        // Move the monsters next
        entities
          .filter((e) => !!e.turn)
          .forEach((ent) => {
            const actions = ent.turn({ me: ent, player: knight, floor });
            actions.forEach((action) => {
              if (action.type === "Move") {
                ent.x = action.x;
                ent.y = action.y;
              }
              if (action.type === "Spawn") {
                entities.push(action.make(ent.x, ent.y));
              }
            });
          });

        // Check for new collisions
        const newHit = getEntityAt(knight.x, knight.y);
        if (newHit) handleCollision(newHit);
      }
    });
  }

  // restart
  if (isDead && fade > 0.9) {
    Object.entries(keyMap).forEach(([keyCode]) => {
      if (keys[keyCode]) {
        keys[keyCode] = false;
        start();
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

  // monsters and items
  entities.forEach((ent) => {
    const [x, y] = tweenPos(ent);
    ent.draw(ctx, x, y);
  });

  // player
  const [knightDrawX, knightDrawY] = tweenPos(knight);
  knight.draw(ctx, knightDrawX, knightDrawY);

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

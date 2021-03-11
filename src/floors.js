import { randomElem, shuffleArray } from "./rnd";
import {
  makeCoin,
  makePotion,
  makeBat,
  makeSkeleton,
  makeSlime,
} from "./things";

const randomMonster = (floor) => {
  switch (floor) {
    case 1:
    case 2: // 100-0-0
      return makeBat;
    case 3:
    case 4: // 66-33-0
      return randomElem([makeBat, makeBat, makeSkeleton]);
    case 5:
    case 6: // 50-50-0
      return randomElem([makeBat, makeSkeleton]);
    case 7:
    case 8: // 40-50-10
      return randomElem([
        makeBat,
        makeBat,
        makeBat,
        makeBat,
        makeSkeleton,
        makeSkeleton,
        makeSkeleton,
        makeSkeleton,
        makeSkeleton,
        makeSlime,
      ]);
    case 9:
    case 10:
    case 11:
    case 12: // 30 - 40 - 30
      return randomElem([
        makeBat,
        makeBat,
        makeBat,
        makeSkeleton,
        makeSkeleton,
        makeSkeleton,
        makeSkeleton,
        makeSlime,
        makeSlime,
        makeSlime,
      ]);
    default:
      // 20 - 40 - 40
      return randomElem([
        makeBat,
        makeSkeleton,
        makeSkeleton,
        makeSlime,
        makeSlime,
      ]);
  }
};

export const decideSpawns = (floor, total) => {
  const toSpawn = [];

  for (let i = 0; i < floor / 5; i++) {
    toSpawn.push(makeCoin);
  }

  for (let i = 0; i < (floor - 1) / 2; i++) {
    toSpawn.push(randomMonster(floor));
  }

  shuffleArray(toSpawn);

  if (floor % 5 === 0) {
    toSpawn.unshift(makePotion);
  }

  return toSpawn.slice(0, total / 4);
};

import { randomElem, shuffleArray } from "./rnd";
import {
  makeCoin,
  makePotion,
  makeBat,
  makeSkeleton,
  makeSlime,
  makeTrap,
} from "./things";

const randomMonster = (floor) => {
  switch (floor) {
    case 1:
    case 2: // 100 : 0 : 0 : 0
      return makeBat;
    case 3:
    case 4:
    case 5: // 66 : 33 : 0 : 0
      return randomElem([makeBat, makeBat, makeSkeleton]);
    case 6:
    case 7:
    case 8:
    case 9: // 40 : 40 : 0 : 20
      return randomElem([
        makeBat,
        makeBat,
        makeSkeleton,
        makeSkeleton,
        makeTrap,
      ]);
    case 10:
    case 11:
    case 12:
    case 13:
    case 14: // 33 : 40 : 8 : 16
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
        makeTrap,
        makeTrap,
      ]);
    case 15:
    case 16:
    case 17:
    case 18:
    case 19: // 25 : 40 : 16 : 16
      return randomElem([
        makeBat,
        makeBat,
        makeBat,
        makeSkeleton,
        makeSkeleton,
        makeSkeleton,
        makeSkeleton,
        makeSkeleton,
        makeSlime,
        makeSlime,
        makeTrap,
        makeTrap,
      ]);
    default:
      // 20 : 40 : 30 : 10
      return randomElem([
        makeBat,
        makeBat,
        makeSkeleton,
        makeSkeleton,
        makeSkeleton,
        makeSkeleton,
        makeSlime,
        makeSlime,
        makeSlime,
        makeTrap,
      ]);
  }
};

export const decideSpawns = (floor, total) => {
  const toSpawn = [];
  for (let i = 0; i < floor / 5; i++) {
    toSpawn.push(makeCoin);
  }

  for (let i = 0; i < floor - 1; i++) {
    toSpawn.push(randomMonster(floor));
  }

  shuffleArray(toSpawn);

  if (floor % 5 === 0) {
    toSpawn.unshift(makePotion);
  }

  const amount = Math.min(floor < 4 ? floor : 3 + floor / 4, total / 4.5);
  return toSpawn.slice(0, amount);
};

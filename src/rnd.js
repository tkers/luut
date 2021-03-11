export function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

export const randomPositions = (minX, minY, maxX, maxY) => {
  const pos = [];
  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      pos.push([x, y]);
    }
  }
  shuffleArray(pos);
  return pos;
};

export const randomElem = (arr) => arr[Math.floor(Math.random() * arr.length)];

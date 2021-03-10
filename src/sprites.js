function loadSprite(src, onLoad) {
  const img = new Image();
  img.src = src;
  onLoad && img.addEventListener("load", () => onLoad(img), false);
  return img;
}

export const createTileSet = (ctx, spr, w, h = w) => (tx, ty, dx, dy) =>
  ctx.drawImage(spr, tx * w, ty * h, w, h, dx * w, dy * h, w, h);

export const createAnimation = (ctx, spr, w, h = w) => {
  const n = spr.width / w;
  let frame = 0;
  const step = () => {
    frame = (frame + 1) % n;
  };
  setInterval(step, 125);
  return (dx, dy, sx = 1) =>
    ctx.drawImage(spr, frame * w, 0, w, h, dx * w, dy * h, w, h);
};

export const spr_tiles = loadSprite("img/tiles.png");
export const spr_bat = loadSprite("img/bat.png");
export const spr_skeleton = loadSprite("img/skeleton.png");
export const spr_knight = loadSprite("img/knight.png");
export const spr_knight_flip = loadSprite("img/knight_flip.png");
export const spr_slime = loadSprite("img/slime.png");
export const spr_coin = loadSprite("img/coin.png");

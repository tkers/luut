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

export const spr_tiles = loadSprite("img/tileset.png");
export const spr_bat = loadSprite("img/Characters/Bat.png");
export const spr_skeleton = loadSprite("img/Characters/Skeleton_idle.png");
export const spr_knight = loadSprite("img/Characters/Knight_idle.png");
export const spr_knight_flip = loadSprite(
  "img/Characters/Knight_idle_flip.png"
);
export const spr_slime = loadSprite("img/Characters/Slime (green).png");
export const spr_coin = loadSprite("img/Objects and traps/Gold coin.png");
// export const spr_player = loadSprite("img/player.png");
// export const spr_friend = loadSprite("img/friend.png");

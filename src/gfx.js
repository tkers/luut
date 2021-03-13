export const loadImg = (src, onLoad) => {
  const img = new Image();
  img.src = src;
  onLoad && img.addEventListener("load", () => onLoad(img), false);
  return img;
};

export const createTileSet = (spr, w, h = w) => (ctx, tx, ty, dx, dy) =>
  ctx.drawImage(spr, tx * w, ty * h, w, h, dx * w, dy * h, w, h);

export const createAnimation = (spr, w, h = w) => {
  const n = spr.width / w;
  let frame = Math.floor(Math.random() * n);
  if (n > 0) {
    const step = () => {
      frame = (frame + 1) % n;
    };
    setInterval(step, 125);
  }
  return (ctx, dx, dy) =>
    ctx.drawImage(spr, frame * w, 0, w, h, dx * w, dy * h, w, h);
};

export const createToggleAnimation = (spr, w, h = w) => {
  const n = spr.width / w;
  let frame = 0;
  let isActive = false;
  if (n > 0) {
    const step = () => {
      if (isActive || frame > 0) {
        isActive = false;
        frame = (frame + 1) % n;
      }
    };
    setInterval(step, 125);
  }
  const draw = (ctx, dx, dy) =>
    ctx.drawImage(spr, frame * w, 0, w, h, dx * w, dy * h, w, h);
  const activate = () => {
    isActive = true;
  };
  return { draw, activate };
};

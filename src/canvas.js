const getPixelRatio = (ctx) => {
  const dpr = window.devicePixelRatio || 1;
  const bsr =
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio ||
    1;

  return dpr / bsr;
};

export const resizeCanvas = function (canvas, width, height, scale = 1) {
  const ctx = canvas.getContext("2d");
  const ratio = getPixelRatio(ctx);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width * scale}px`;
  canvas.style.height = `${height * scale}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return canvas;
};

export const setupCanvas = (id, width, height, scale) => {
  const elem = document.getElementById(id);
  resizeCanvas(elem, width, height, scale);
  const ctx = elem.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  return ctx;
};

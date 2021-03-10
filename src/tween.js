export const tweenPos = (ent, speed = 0.2) => {
  if (typeof ent.drawX === "undefined") ent.drawX = ent.x;
  if (typeof ent.drawY === "undefined") ent.drawY = ent.y;
  if (ent.drawX < ent.x) ent.drawX += Math.min(ent.x - ent.drawX, speed);
  if (ent.drawY < ent.y) ent.drawY += Math.min(ent.y - ent.drawY, speed);
  if (ent.drawX > ent.x) ent.drawX -= Math.min(ent.drawX - ent.x, speed);
  if (ent.drawY > ent.y) ent.drawY -= Math.min(ent.drawY - ent.y, speed);
  return [ent.drawX, ent.drawY];
};

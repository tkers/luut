export const handleSwipe = (cb) => {
  let xDown = null;
  let yDown = null;

  const handleTouchStart = (evt) => {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
  };

  const handleTouchMove = (evt) => {
    if (!xDown || !yDown) {
      return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      /*most significant*/
      if (xDiff > 0) {
        /* left swipe */
        cb(37);
      } else {
        /* right swipe */

        cb(39);
      }
    } else {
      if (yDiff > 0) {
        /* up swipe */
        cb(38);
      } else {
        /* down swipe */
        cb(40);
      }
    }
    /* reset values */
    xDown = null;
    yDown = null;
  };

  document.addEventListener("touchstart", handleTouchStart, false);
  document.addEventListener("touchmove", handleTouchMove, false);
};

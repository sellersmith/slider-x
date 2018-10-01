const prefix = 'pf'

const DomClasses = {
    wrapper: `${prefix}-slider-wrapper`,
    inner: `${prefix}-slider-inner`,
    slide: `${prefix}-slider-slide`,
    indicators: `${prefix}-slider-pagination`,
    indicatorItem: `${prefix}-slider-pagination-item`,
    controller: `${prefix}-slider-nav`,
    disabledCtrl: `${prefix}-slider-nav-disabled`,
    nextCtrl: `${prefix}-next-nav`,
    prevCtrl: `${prefix}-prev-nav`,
}

const getSlideMovementData = (direction, currIndex, toIndex, totalSilde) => {
  let nextIndex, nextSlideX, currSlideX

  if (direction === "next") {
    toIndex ? nextIndex = toIndex : nextIndex = currIndex === totalSilde - 1 ? 0 : currIndex + 1
    nextSlideX = '100%'
    currSlideX = '-100%'
  } else if (direction === "prev") {
    // toIndex = 0 is a falsy value
    (toIndex || toIndex === 0) ? nextIndex = toIndex : nextIndex = currIndex === 0 ? totalSilde - 1 : currIndex - 1
    nextSlideX = '-100%'
    currSlideX = '100%'
  }

  return { nextIndex, nextSlideX, currSlideX }
}

const calculateSpeed = (lastX, lastY, currX, currY, time) => {
  const deltaX = Math.abs(currX - lastX)
  const deltaY = Math.abs(currY - lastY)

  const distance = (deltaX ** 2 + deltaY ** 2) ** 0.5
  const speed = distance / time

  return speed
}

const setMouseSpeed = () => {

}

function calcDistance(x1, y1, x2, y2) {
  return ((x1-x2) ** 2 + (y1-y2) ** 2) ** 0.5
}




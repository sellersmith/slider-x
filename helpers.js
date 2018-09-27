const prefix = 'pf'

const DomClasses = {
    wrapper: `${prefix}-slide-wrapper`,
    inner: `${prefix}-slide-inner`,
    slide: `${prefix}-slide-item`,
    indicators: `${prefix}-slide-indicators`,
    indicatorItem: `${prefix}-slide-indicator-item`,
    controller: `${prefix}-slide-controller`,
    nextCtrl: `${prefix}-slide-controller-next`,
    prevCtrl: `${prefix}-slide-controller-prev`,
}

const getSlideMovementData = (direction, currIndex, toIndex, totalSilde) => {
  let nextIndex, nextSlidePos, currSlidePos

  if (direction === "next") {
    toIndex ? nextIndex = toIndex : nextIndex = currIndex === totalSilde - 1 ? 0 : currIndex + 1
    nextSlidePos = '100%'
    currSlidePos = '-100%'
  } else if (direction === "prev") {
    // toIndex = 0 is a falsy value
    (toIndex || toIndex === 0) ? nextIndex = toIndex : nextIndex = currIndex === 0 ? totalSilde - 1 : currIndex - 1
    nextSlidePos = '-100%'
    currSlidePos = '100%'
  }

  return { nextIndex, nextSlidePos, currSlidePos }
}
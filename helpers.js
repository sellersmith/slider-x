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
    turnOffMouseEvent: `${prefix}-slider-mouse-event-off`
}

const getSlideMovementData = (slider, direction, toIndex) => {
  let nextIndex, nextSlidePos, currSlidePos

  if (direction === "next") {
    toIndex ? nextIndex = toIndex : nextIndex = slider.opts.curr === slider.totalSlide - 1 ? 0 : slider.opts.curr + 1
    nextSlidePos = 100
    currSlidePos = -100
  } else if (direction === "prev") {
    // toIndex = 0 is a falsy value
    (toIndex || toIndex === 0) ? nextIndex = toIndex : nextIndex = slider.opts.curr === 0 ? slider.totalSlide - 1 : slider.opts.curr - 1
    nextSlidePos = -100
    currSlidePos = 100
  }

  return { nextIndex, nextSlidePos, currSlidePos }
}


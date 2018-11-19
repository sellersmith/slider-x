const prefix = 'pf'

const SliderClasses = {
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
  const { totalSlide, $slider } = slider
  const sliderWidth = $slider.width()
  const slideWidth = calculateSlideSize(slider)
  const { curr, slidesToShow, slidesToScroll, gutter } = slider.opts
  const slidesMove = toIndex !== undefined ? slidesToShow : slidesToScroll

  let nextIndex, nextSlidePos, currSlidePos, newCurr
  let nextSlidesReadyPos = [], nextSlidesNewPos = [], currSlidesNewPos = []

  if (direction === "next") {
    nextIndex = toIndex ? toIndex : (curr + slidesToShow) % totalSlide
    newCurr = toIndex ? toIndex : (curr + slidesToScroll) % totalSlide

    // Calculate next slides ready-position - where the next slides stay and be ready to move in
    for (let i = 0; i < slidesMove; i++) {
      nextSlidesReadyPos.push({ index: (nextIndex + i) % totalSlide, readyX: (sliderWidth + gutter * (i + 1) + slideWidth * i) })
      nextSlidesNewPos.push({ index: (nextIndex + i) % totalSlide, newX: ((sliderWidth + gutter * (i + 1) + slideWidth * i)) - ((slideWidth + gutter) * slidesMove) })
    }
 
    for (let i = 0; i < slidesToShow; i++) {
      const $slide = slider.$slider.children().eq((curr + i) % totalSlide)
      const slideX = $slide.position().left

      currSlidesNewPos.push({ index: (curr + i) % totalSlide, newX: slideX - ((slideWidth + gutter) * slidesMove) })
    }
  } else if (direction === "prev") {
    nextIndex = toIndex !== undefined ? toIndex : (totalSlide + (curr - slidesToScroll)) % totalSlide
    newCurr = toIndex !== undefined ? toIndex : nextIndex
    // Calculate next slides ready-position - where the next slides stay and be ready to move in
    for (let i = 0; i < slidesMove; i++) {
      nextSlidesReadyPos.push({ index: (nextIndex + i) % totalSlide, readyX: (0 - (gutter + slideWidth) * (slidesMove - i)) })
      nextSlidesNewPos.push({ index: (nextIndex + i) % totalSlide, newX: (gutter + slideWidth) * i })
    }

    for (let i = 0; i < slidesToShow; i++) {
      const $slide = slider.$slider.children().eq((curr + i) % totalSlide)
      const slideX = $slide.position().left

      currSlidesNewPos.push({ index: (curr + i) % totalSlide, newX: slideX + (gutter + slideWidth) * slidesMove })
    }
  }

  return { nextIndex, nextSlidePos, currSlidePos, nextSlidesReadyPos, currSlidesNewPos, nextSlidesNewPos, newCurr }
}

const calculateSlideSize = (slider) => {
  const { gutter, slidesToShow } = slider.opts
  const wrapperWidth = slider.$slider.width()

  const slideWidth = (wrapperWidth - gutter * (slidesToShow - 1)) / slidesToShow

  return slideWidth
}
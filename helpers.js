const prefix = 'pf'
const refinePos = (arr, size) => arr.map(obj => { return { ...obj, index: obj.index % size } })

// Export all these FOLLOWING stuff before publish

if (!Array.prototype.includes) {
  Array.prototype.includes = function(item) {
    return this.indexOf(item) !== -1
  }
}


export const SliderXClasses = {
  wrapper: `${prefix}-slider-wrapper`,
  inner: `${prefix}-slider-inner`,
  slide: `${prefix}-slider-slide`,
  indicators: `${prefix}-slider-pagination`,
  controller: `${prefix}-slider-nav`,
  disabledCtrl: `${prefix}-slider-nav-disabled`,
  nextCtrl: `${prefix}-next-nav`,
  prevCtrl: `${prefix}-prev-nav`,
  mouseEventOff: `${prefix}-slider-mouse-event-off`
}

// The logic is compicated! Stay tune before reading this func
export const getSlidingData = (slider, direction, toIndex) => {
  let { totalSlide, sliderWidth, $slides } = slider
  totalSlide *= 3
  const sliderOffsetLeft = slider.el.getBoundingClientRect().left

  const slideWidth = getSlideWidth(slider)
  const { curr, slidesToShow, slidesToScroll, gutter } = slider.opts

  // Created this array to check if the next index is in the curr-showing-slides or not
  const currIndexes = []
  for (let i = 0; i < slidesToShow; i++) { currIndexes.push((curr + i) % totalSlide) }

  let nextIndex
  let nextSlidesReadyPos = [], nextSlidesNewPos = [], currSlidesNewPos = []
  let slidesMove

  if (direction === "next") {
    // Calculate number of slides to move
    if (toIndex !== undefined) {
      if (currIndexes.includes(toIndex)) {
        slidesMove = currIndexes.indexOf(toIndex) - currIndexes.indexOf(curr)
      } else slidesMove = slidesToShow
    } else slidesMove = slidesToScroll

    nextIndex = toIndex !== undefined ? toIndex : (curr + slidesToScroll) % totalSlide

    // Calculate next slides ready-position - where the next slides stay and be ready to move in
    let firstX
    if (currIndexes.includes(nextIndex)) {
      ///// Pausing here
      firstX = $slides[nextIndex].getBoundingClientRect().left - sliderOffsetLeft
    } else firstX = sliderWidth + gutter

    for (let i = 0; i < slidesToShow; i++) {
      const readyX = firstX + (slideWidth + gutter) * i

      if (!currIndexes.includes((nextIndex + i) % totalSlide)) {
        nextSlidesReadyPos.push({ index: nextIndex + i, readyX })
      }

      nextSlidesNewPos.push({ index: nextIndex + i, newX: readyX - (gutter + slideWidth) * slidesMove })
    }
  } else if (direction === "prev") {
    // Calculate number of slides to move
    if (toIndex !== undefined) {
      const lastIndex = (toIndex + slidesToShow - 1) % totalSlide
      if (currIndexes.includes(lastIndex)) {
        slidesMove = currIndexes.indexOf((curr + slidesToShow - 1) % totalSlide) - currIndexes.indexOf(lastIndex)
      } else slidesMove = slidesToShow
    } else slidesMove = slidesToScroll

    nextIndex = toIndex !== undefined ? toIndex : (totalSlide + (curr - slidesToScroll)) % totalSlide

    // Calculate next slides ready-position - where the next slides stay and be ready to move in
    let firstX // left position of the last slide in next slides
    if (currIndexes.includes((nextIndex + slidesToShow - 1) % totalSlide)) {
      firstX = $slides[(nextIndex + slidesToShow - 1) % totalSlide].getBoundingClientRect().left - sliderOffsetLeft
    } else firstX = -(slideWidth + gutter)

    for (let i = 0; i < slidesToShow; i++) {
      const readyX = firstX - (slideWidth + gutter) * (slidesToShow - i - 1)

      if (!currIndexes.includes((nextIndex + i) % totalSlide)) {
        nextSlidesReadyPos.push({ index: nextIndex + i, readyX })
      }

      nextSlidesNewPos.push({ index: nextIndex + i, newX: readyX + (gutter + slideWidth) * slidesMove })
    }
  }

  // Calculate new position for curr-showing-slides
  for (let i = 0; i < slidesToShow; i++) {
    const slideX = $slides[(curr + i) % totalSlide].getBoundingClientRect().left - sliderOffsetLeft
    let newX
    if (direction === 'next') newX = slideX - (gutter + slideWidth) * slidesMove
    else if (direction === 'prev') newX = slideX + (gutter + slideWidth) * slidesMove

    if (slider.moveByDrag) {
      const currLeft = $slides[curr % totalSlide].getBoundingClientRect().left - sliderOffsetLeft
      if (direction === 'prev') newX = slideX + (sliderWidth - currLeft) + gutter
      else if (direction === 'next') newX = slideX - (sliderWidth + currLeft) - gutter
    }

    currSlidesNewPos.push({ index: curr + i, newX })
  }
  // debugger

  ////////////

  nextSlidesReadyPos = refinePos(nextSlidesReadyPos, totalSlide)
  nextSlidesNewPos = refinePos(nextSlidesNewPos, totalSlide)
  currSlidesNewPos = refinePos(currSlidesNewPos, totalSlide)

  // console.log(nextSlidesReadyPos, currSlidesNewPos, nextSlidesNewPos)

  return { nextIndex, nextSlidesReadyPos, currSlidesNewPos, nextSlidesNewPos }
}

export const getSlideWidth = slider => {
  const { gutter, slidesToShow } = slider.opts
  const wrapperWidth = slider.sliderWidth

  const slideWidth = (wrapperWidth - gutter * (slidesToShow - 1)) / slidesToShow
  return slideWidth
}

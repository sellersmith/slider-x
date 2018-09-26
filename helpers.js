const getSlideMovementData = (direction, curr, next, totalSilde) => {
  let nextIndex, nextSlidePos, currSlidePos

  if (direction === "next") {
    next ? nextIndex = next : nextIndex = curr === totalSilde - 1 ? 0 : curr + 1
    nextSlidePos = '100%'
    currSlidePos = '-100%'
  } else if (direction === "prev") {
    next ? nextIndex = next : nextIndex = curr === 0 ? totalSilde - 1 : curr - 1
    nextSlidePos = '-100%'
    currSlidePos = '100%'
  }

  return { nextIndex, nextSlidePos, currSlidePos }
}
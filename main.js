// import { PageFlySliderClasses, getPFSlideMovementData, calculatePFSlideSize } from './helpers'
// import DOMObserver from './observer'
// require('./draggable')
// let $ = window.jQuery

const { wrapper, inner, slide, indicators, controller, nextCtrl, prevCtrl, disabledCtrl, turnOffMouseEvent } = PageFlySliderClasses

class PageFlySliderController {
  // export class PageFlySliderController {
  constructor(ele, opts) {
    this.el = ele
    this.originalStyles = { wrapper: '', inner: [] }

    // Create an observer to observe any style's change of slider (this is for updating height)
    // NOTE: this doesn't work on IE < 11 
    this.observer = new DOMObserver()
    this.observer.observe(this.el, this.handleStyleChange.bind(this))

    this.$slider = null // The .inner div that wrap all slides
    this.$slides = this.el.children
    this.sliderHeight = this.el.offsetHeight
    this.sliderWidth = this.el.offsetWidth

    this.totalSlide = this.el.children.length
    this.opts = Object.create(opts || {}) // Each slider's opts is a specific instance of opts argument

    this.autoPlayTimeoutId = ''

    this.initialize()
  }

  initialize() {
    this.opts.curr = 0
    this.verifyOptions()

    // Setup DOM + set event handler
    this.el.addEventListener('click', this.handleClick.bind(this))

    this.setupSliderDOM()

    // Set up drag n drop event
    this.moveByDrag = false
    this.missingSlidesOnDrag = false // For dragging multiple slides

    this.$slider.addEventListener('es_dragmove', this.handleDragMove.bind(this))
    this.$slider.addEventListener('es_dragstop', this.handleDragStop.bind(this))

    this.setAutoPlay()

    // set a data to detect slider-x
    this.el.dataset.pfSliderXInited = true

    console.info("New PageFly Slider initialized!!!", this)
    return this
  }

  setupSliderDOM() {
    const { el, $slides } = this

    el.classList.add(wrapper)
    // Save original styles
    this.originalStyles.wrapper = el.getAttribute('style') ? el.getAttribute('style') : ''

    // Create an inner div to wrap all slide item
    const $inner = document.createElement('div')
    while ($slides.item(0)) {
      const $slide = $slides.item(0)
      // Save original styles
      const childStyles = $slide.getAttribute('style') ? $slide.getAttribute('style') : ''
      this.originalStyles.inner.push(childStyles)

      $inner.appendChild($slide)
    }

    // Save the inner DOM
    this.$slider = $inner
    this.$slides = $inner.children

    // Append controllers
    const $nextCtrl = document.createElement('a')
    $nextCtrl.dataset.action = 'next'
    const $prevCtrl = document.createElement('a')
    $prevCtrl.dataset.action = 'prev'

    // Append indicators
    const $indicators = document.createElement('ol')
    for (let i = 0; i < Math.ceil(this.totalSlide / this.opts.slidesToShow); i++) {
      const $indItem = document.createElement('li')
      $indItem.dataset.action = 'goto'
      $indItem.dataset.gotoSlide = i * this.opts.slidesToShow
      $indicators.appendChild($indItem)
    }

    el.appendChild($inner)
    el.appendChild($indicators)
    el.appendChild($prevCtrl)
    el.appendChild($nextCtrl)

    this.cloneSlide()
    
    this.updateSliderStyle()
    this.udpateActiveSlideStyle()

    // Wait for the background image load complete then update the Slider style
    // Remove string url("")
    // const sliderBackgroundImg = el.style.backgroundImage.slice(4, -1).replace(/"/g, "")

    // const waitForWidth = () => {
    //   this.sliderWidth = el.offsetWidth
    //   if (this.sliderWidth) {
    //     this.updateSliderStyle()
    //     this.udpateActiveSlideStyle()
    //   } else {
    //     setTimeout(waitForWidth, 100)
    //   }
    // }

    // if (!sliderBackgroundImg) {
    //   waitForWidth()
    // }
    // else {
    //   const tempImg = new Image()
    //   tempImg.src = sliderBackgroundImg
    //   tempImg.onload = () => {
    //     waitForWidth()
    //   }
    // }
  }

  cloneSlide() {
    const { totalSlide, $slides, $slider } = this

    for (let i = 0; i < totalSlide * 2; i++) {
      const $slide = $slides.item(i % totalSlide)
      const $cloneSlide = $slide.cloneNode(true)
      $cloneSlide.dataset.slideClone = true
      $slider.appendChild($cloneSlide)
    }
  }

  /* SETUP EVENT DELEGATION */
  handleResize(e) {
    const { curr, slidesToShow, gutter } = this.opts
    let { totalSlide, $slides, sliderWidth } = this
    totalSlide *= 3
    const newSlideWidth = calculatePFSlideSize(this)

    for (let i = 0; i < totalSlide; i++) {
      const $slide = $slides.item(i)
      $slide.style.width = `${newSlideWidth}px`
      $slide.style.transition = ''

      const newLeft = (i >= curr && i < curr + slidesToShow) ? (newSlideWidth + gutter) * (i - curr) : sliderWidth + gutter
      $slide.style.transform = `translate3d(${newLeft}px, 0, 0)`
    }
  }

  handleClick(e) {
    const { action } = e.target.dataset
    switch (action) {
      case 'next': this.next(); break
      case 'prev': this.prev(); break
      case 'goto':
        // DOMStringMap convert dataset from hyphen style to upperCase (goto-slide => gotoSlide)
        const index = parseInt(e.target.dataset.gotoSlide) || 0
        this.goto(index)
        break
      default: console.log('Slider clicked')
    }
  }

  handleStyleChange() {
    this.sliderWidth = this.el.offsetWidth
    this.handleResize()
  }

  handleDragMove(e) {
    const data = e.data
    if (Math.abs(data.moveX) < PageFlySliderController.constructor.MIN_DRAG_DISTANCE) return
    this.clearAutoPlay()

    const translateRange = data.moveX    // -30
    const { curr, slidesToShow, gutter, loop } = this.opts

    const nextIndex = (curr + slidesToShow) % (this.totalSlide * 3)
    let nextSlidesReadyPos = getPFSlideMovementData(this, 'next', nextIndex).nextSlidesReadyPos
    if (!loop) nextSlidesReadyPos = nextSlidesReadyPos.filter(obj => obj.index < this.totalSlide)

    const currSlidesPos = []
    const slideWidth = calculatePFSlideSize(this)
    for (let i = 0; i < slidesToShow; i++) {
      currSlidesPos.push({ index: (i + curr) % (this.totalSlide * 3), readyX: (slideWidth + gutter) * i })
    }
    // TODO: fix this dummy code
    // This is stupid because the getMovementData return the variable name nextIndex
    const prevIndex = (this.totalSlide * 3 + (curr - slidesToShow)) % (this.totalSlide * 3)
    let prevSlidesReadyPos = getPFSlideMovementData(this, 'prev', prevIndex).nextSlidesReadyPos
    if (!loop) prevSlidesReadyPos = prevSlidesReadyPos.filter(obj => obj.index < this.totalSlide)

    // Drag is forbidden in these below cases:
    if (curr === 0 && !this.opts.loop && translateRange > 0) return
    if (curr + slidesToShow >= this.totalSlide && !this.opts.loop && translateRange < 0) return


    // The key is: move all 3 slide! Genius!
    for (let slide of prevSlidesReadyPos) {
      const $slide = this.$slides.item(slide.index)
      this.translateSlide($slide, slide.readyX + translateRange)
    }
    for (let slide of currSlidesPos) {
      const $slide = this.$slides.item(slide.index)
      this.translateSlide($slide, slide.readyX + translateRange)
    }
    for (let slide of nextSlidesReadyPos) {
      const $slide = this.$slides.item(slide.index)
      this.translateSlide($slide, slide.readyX + translateRange)
    }
  }

  handleDragStop(e) {
    const data = e.data
    if (Math.abs(data.moveX) < PageFlySliderController.constructor.MIN_DRAG_DISTANCE) return
    // Turn off draggable until slides move completely
    this.moveByDrag = true

    const MIN_MOUSE_SPEED_TO_MOVE_SLIDE = 1
    const MIN_DISTANCE_RATIO_TO_MOVE_SLIDE = 0.3 // 30%

    const mouseSpeed = data.velocityX
    const distRatio = data.moveX / this.sliderWidth

    let direction = '', toIndex
    const { totalSlide } = this
    const { loop, curr, slidesToShow, duration } = this.opts
    let customDuration = Math.abs(distRatio) * duration

    // TODO: Make this block code shorter (Seem unneccessary ?)
    // debugger
    if (mouseSpeed > MIN_MOUSE_SPEED_TO_MOVE_SLIDE || Math.abs(distRatio) > MIN_DISTANCE_RATIO_TO_MOVE_SLIDE) { // Move slides to new position
      /**
       * The 2 following cases a special so we have to manually handle them
       * Drag slides with (loop = false) and the last slides are't enough for the window
       * So we left a blank at the last/first
       */
      if (!loop) {
        if (distRatio < 0 && curr + 2 * slidesToShow > totalSlide) {
          direction = 'prev'
          toIndex = totalSlide - slidesToShow
          this.missingSlidesOnDrag = true
          this.moveSlide(direction, toIndex, customDuration)
          return

        }
        else if (distRatio > 0 && curr - slidesToShow < 0) {
          direction = 'next'
          toIndex = 0
          this.missingSlidesOnDrag = true
          this.moveSlide(direction, toIndex, customDuration)
          return
        }
      }

      customDuration = duration - customDuration

      if (distRatio < 0) direction = 'next'
      else if (distRatio > 0) direction = 'prev'
    }
    else { // Revert slides to original position
      /**
       * This is a bit tricky
       * In case we have to move the slides to the original position, I change the curr slide index to reuse the 
       * next() n prev() functions
       */
      if (distRatio < 0) {
        this.opts.curr += slidesToShow
        direction = 'prev'
      }
      else if (distRatio > 0) {
        this.opts.curr = (totalSlide * 3 + (curr - slidesToShow))
        direction = 'next'
      }
      this.opts.curr %= (totalSlide * 3)
    }

    // Dummy: the moveSlide() need toIndex as the 2nd argument
    if (direction === 'next') toIndex = this.opts.curr + slidesToShow
    else toIndex = (totalSlide * 3 + (this.opts.curr - slidesToShow))
    toIndex %= (totalSlide * 3)
    // debugger

    this.moveSlide(direction, toIndex, customDuration)
  }

  /* LOGIC FUNCTION */
  verifyOptions() {
    const defOpts = this.constructor.defaultOptions

    for (let key in defOpts) {
      const value = defOpts[key]
      if (typeof this.opts[key] !== typeof value) {
        this.opts[key] = value
      }
    }

    // Set the slider height
    this.opts.height = this.sliderHeight || this.opts.height

    // Turn off autoPlay if loop is false
    if (!this.opts.loop) this.opts.autoPlay = false

    // No gutter if only one slide shown in a section
    if (this.opts.slidesToShow === 1) this.opts.gutter = 0

    // Set the style of slider nav n pagination to legal values
    const defPags = this.constructor.styleOptions.paginations
    const defNavs = this.constructor.styleOptions.navs

    if (defPags.indexOf(this.opts.paginationStyle) < 0) this.opts.paginationStyle = defPags[0]
    if (defNavs.indexOf(this.opts.navStyle) < 0) this.opts.navStyle = defNavs[0]
  }

  updateOptions(newOtps) {
    const { defaultOptions } = this.constructor

    const defPags = this.constructor.styleOptions.paginations
    const currPag = this.opts.paginationStyle

    const defNavs = this.constructor.styleOptions.navs
    const currNav = this.opts.navStyle

    for (let key in newOtps) {
      // The type of newOpts values must be legal
      // And update 'curr' key is forbidden
      if (typeof newOtps[key] === typeof defaultOptions[key] && key !== 'curr') {
        let newValue = newOtps[key]

        // Keep the current pagination n nav style if the new options is not valid
        if (key === 'paginationStyle' && defPags.indexOf(newOtps[key]) < 0) newValue = currPag
        if (key === 'navStyle' && defNavs.indexOf(newOtps[key]) < 0) newValue = currNav

        this.opts[key] = newValue
      }
    }

    // Turn off autoPlay if loop is false
    if (!this.opts.loop) this.opts.autoPlay = false

    // Set the style of slider nav n pagination to legal values
    // this.updateSliderStyle()

    // this.updateSliderCtrlStyle(this.opts.curr)
    // this.setAutoPlay()
    this.destroy()
    this.initialize()
  }

  setAutoPlay() {
    if (this.opts.autoPlay) {
      this.autoPlayTimeoutId = setTimeout(() => {
        this.moveSlide('next')
      }, (this.opts.autoPlayDelay))
    }
  }

  clearAutoPlay() {
    clearTimeout(this.autoPlayTimeoutId)
  }

  /* CONTROLLER FUNCTIONS */
  destroy() {
    const { el } = this
    this.clearAutoPlay()

    // Save all items, remove all classes, inline-style n reverse the original style
    const items = []
    this.$slides = this.$slider.children
    for (let i = 0; i < this.totalSlide; i++) {
      const $slide = this.$slides.item(i)
      $slide.classList.remove(slide)
      $slide.classList.remove('active')
      $slide.style = this.originalStyles.inner[i]
      items.push($slide)
    }

    // Remove class, event handler, dataset and all children
    el.classList.remove(wrapper)
    el.style = this.originalStyles.wrapper
    el.removeEventListener('click', this.handleClick)
    delete el.dataset['pfSliderXInited']

    while (el.firstChild) { el.removeChild(el.firstChild) }

    // Append the original item
    for (let item of items) { el.appendChild(item) }

    console.log('Removed slider-x !!')
  }

  moveSlide(direction, toIndex, customDuration) {
    this.clearAutoPlay()
    const { curr, slidesToShow, loop } = this.opts

    // Move slide is forbidden in the 1st n last slide if Slider movement is not loop
    // debugger
    if (!loop && !this.moveByDrag) {
      if (
        (direction === 'prev' && curr === 0)
        ||
        (direction === 'next' && curr + slidesToShow - 1 >= (this.totalSlide - 1))
        ||
        (direction === 'next' && toIndex + slidesToShow - 1 > (this.totalSlide - 1))
      ) {
        this.moveByDrag = false
        return
      }
    }

    // Turn off mouse event on moving
    this.el.classList.add(turnOffMouseEvent)

    const { nextIndex, nextSlidesReadyPos, currSlidesNewPos, nextSlidesNewPos } = getPFSlideMovementData(this, direction, toIndex)
    // console.log(nextSlidesReadyPos, currSlidesNewPos, nextSlidesNewPos)

    // if (this.opts.adaptiveHeight) {
    //   const nextHeight = $next.height()
    //   this.$slider.css({ height: `${nextHeight}px` })
    // }

    if (!this.moveByDrag) {
      // Only move the $next slide to the ready-position in case user does not drag
      for (let slide of nextSlidesReadyPos) {
        const $slide = this.$slides.item(slide.index)
        this.translateSlide($slide, slide.readyX)
      }
    }

    this.updateSliderCtrlStyle(nextIndex)

    // Move 2 slides contemporary
    let duration = customDuration ? customDuration : this.opts.duration

    setTimeout(() => {
      /**
       * Tricky: when move slides in a special case - drag but missing slides (loop = false)
       * The curr slides is out of window so just don't move them
       */
      if (!this.missingSlidesOnDrag) {
        for (let slide of currSlidesNewPos) {
          const $slide = this.$slides.item(slide.index)
          this.translateSlide($slide, slide.newX, duration)
        }
      }

      for (let slide of nextSlidesNewPos) {
        const $slide = this.$slides.item(slide.index)
        this.translateSlide($slide, slide.newX, duration)
      }

      // Do stuffs after slides moving complete
      setTimeout(() => {
        this.setAutoPlay()
        this.el.classList.remove(turnOffMouseEvent)
        this.moveByDrag = false
        this.missingSlidesOnDrag = false
      }, duration)
    }, 50)

    // Update curr index n reset the .active
    this.opts.curr = nextIndex
    this.udpateActiveSlideStyle()
  }

  translateSlide($slide, toX, duration) {
    const transition = duration ? `transform ${duration}ms linear` : ''
    $slide.style.transition = transition
    $slide.style.transform = `translate3d(${toX}px, 0, 0)`
  }

  next() {
    const { curr, loop, slidesToScroll, slidesToShow } = this.opts
    const { totalSlide } = this

    if (!loop) {
      if (curr + slidesToScroll + slidesToShow >= totalSlide) {
        this.goto(totalSlide - slidesToShow)
      } else this.moveSlide("next")
    }
    else this.moveSlide("next")
  }

  prev() {
    const { curr, loop, slidesToScroll } = this.opts

    if (!loop) {
      if (curr - slidesToScroll <= 0) {
        this.goto(0)
      } else this.moveSlide("prev")
    }
    else this.moveSlide("prev")
  }

  goto(index) {
    const { curr, loop, slidesToShow } = this.opts
    const { totalSlide } = this

    if (index > curr) {
      if (!loop) {
        if (index + slidesToShow > totalSlide) {
          this.moveSlide("next", totalSlide - slidesToShow)
          return
        }
      }
      this.moveSlide("next", index)
    } else if (index < curr) {
      this.moveSlide("prev", index)
    }
  }

  /* STYLE FUNCTIONS */
  updateSliderStyle() {
    const { $slider, $slides, el, opts } = this
    const $curr = $slides.item(this.opts.curr)
    const slideWidth = calculatePFSlideSize(this)

    const { adaptiveHeight, height } = opts
    if (!adaptiveHeight) {
      // Slider height = the highest child in case adaptiveHeight is off
      // for (let i = 0; i < $slides.length; i++) {
      //   if ($slides.eq(i).height() > sliderHeight) sliderHeight = $slides.eq(i).height()
      // }

      // Stretch all slide height to equal to the heightest slide
      for (let i = 0; i < $slides.length; i++) { $slides.item(i).style.cssText += `height: 100%; width: ${slideWidth}px;` }
      $slider.style.cssText = `height: 100%; transition: '';`
      el.style.transition = ''
    } else {
      for (let i = 0; i < $slides.length; i++) { $slides.item(i).style.height = '' }
      el.style.transition = `height ${opts.duration}ms ease-in-out`
      $slider.style.transition = `height ${opts.duration}ms ease-in-out`

      el.style.height = ''
      $slider.style.height = `${$curr.height()}px`
    }

    for (let i = 0; i < $slides.length; i++) { $slides.item(i).classList.add(slide) }
    const { gutter } = opts

    for (let i = 0; i < $slides.length; i++) {
      const slideX = i * (slideWidth + gutter)
      $slides.item(i).style.transform = `translate3d(${slideX}px, 0, 0)`
    }

    // $curr.css('transform', 'translate3d(0, 0, 0)')

    $slider.classList.add(inner)
    opts.draggable ? $slider.classList.add('jsn-es-draggable') : $slider.classList.remove('jsn-es-draggable')

    // Styling for navigators and indicators
    const { navStyle, paginationStyle } = opts

    el.querySelector('a[data-action="next"]').setAttribute('class', `${nextCtrl} ${controller} ${navStyle}`)
    el.querySelector('a[data-action="prev"]').setAttribute('class', `${prevCtrl} ${controller} ${navStyle}`)
    el.querySelector('ol').setAttribute('class', `${indicators} ${paginationStyle}`)

    // Toggle show/hide nav/pagination
    const navDisplay = navStyle === 'none' ? 'none' : 'flex'
    const paginationDisplay = paginationStyle === 'none' ? 'none' : 'block'

    el.querySelector('a.pf-slider-nav').style.display = navDisplay
    el.querySelector('ol.pf-slider-pagination').style.display = paginationDisplay
  }

  updateSliderCtrlStyle(index) {
    this.el.querySelector('a.pf-slider-nav').classList.remove(disabledCtrl)

    if (index === 0 && !this.opts.loop) {
      this.el.querySelector(`.${prevCtrl}`).classList.add(disabledCtrl)
    }
    else if (index === this.totalSlide - this.opts.slidesToShow && !this.opts.loop) {
      this.el.querySelector(`.${nextCtrl}`).classList.add(disabledCtrl)
    }
  }

  udpateActiveSlideStyle() {
    // Add class .active for current active slide n indicator
    const { curr, slidesToShow, loop } = this.opts

    const $currSlide = this.$slider.querySelector(`.${slide}.active`)
    $currSlide ? $currSlide.classList.remove('active') : null

    this.$slides.item(curr).classList.add('active')

    let activeSlide = Math.floor((curr % (this.totalSlide)) / slidesToShow) * slidesToShow

    if (!loop) {
      if (curr + slidesToShow === this.totalSlide) {
        activeSlide = Math.floor((this.totalSlide - 1) / slidesToShow) * slidesToShow
      }
    }

    const $currLi = this.el.querySelector('ol.pf-slider-pagination li.active')
    $currLi ? $currLi.classList.remove('active') : null

    this.el.querySelector(`li[data-goto-slide="${activeSlide}"]`).classList.add('active')

    this.updateSliderCtrlStyle(curr)
  }
}

// Class properties
PageFlySliderController.constructor.MIN_DRAG_DISTANCE = 5

PageFlySliderController.defaultOptions = {
  curr: 0,
  slidesToShow: 1,
  slidesToScroll: 1,
  gutter: 15,
  autoPlay: true,
  autoPlayDelay: 3000,
  duration: 450,
  loop: true,
  draggable: true,
  paginationStyle: 'pagination-style-1',
  navStyle: 'nav-style-1',
  adaptiveHeight: false,
  height: 400,
}

PageFlySliderController.styleOptions = {
  /**
   * The default style is the first array element
   * Add more style (class name) for pagination or nav to these below arrays
   * Remember to keep the 'none' in order to toggle show/hide pagination/nav option
   */
  paginations: ['pagination-style-1', 'pagination-style-2', 'pagination-style-3', 'none'],
  navs: ['nav-style-1', 'nav-style-2', 'nav-style-3', 'nav-style-4', 'nav-style-5', 'none']
}

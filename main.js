const { wrapper, inner, slide, indicators, indicatorItem, controller, nextCtrl, prevCtrl, disabledCtrl } = DomClasses

class SliderController {
  constructor(ele, opts) {
    this.el = ele
    this.originalStyles = { wrapper: '', inner: [] }

    this.$el = $(this.el) // The original element
    this.$slider = '' // The .inner div that wrap all slide
    this.$curr = ''

    this.totalSlide = this.$el.children().length
    this.opts = Object.assign({}, opts) // Each slider's opts is a specific instance of opts argument

    this.autoTimeoutId = ''

    // Setup DOM + set event handler
    this.initialize()
    this.$el.on('click', this.handleClick.bind(this))

    // Set up drag n drop event
    this.slideIsMoving = false
    this.moveByDrag = false

    this.sliderWidth = this.$el.width()

    this.$el.on('es_dragmove', this.handleDragMove.bind(this))
    this.$el.on('es_dragstop', this.handleDragStop.bind(this))

    console.log(this)
  }

  initialize() {
    this.verifyOptions()
    this.setupSliderDOM()
    this.setAutoPlay()
    return this
  }

  setupSliderDOM() {
    this.$el.addClass(wrapper).addClass('jsn-es-draggable')
    // Save original styles
    this.originalStyles.wrapper = this.$el.attr('style') ? this.$el.attr('style') : ''

    // Create an inner div to wrap all slide item
    const $inner = $(`<div></div>`)
    this.$el.children().each((i, child) => {
      // Save original styles
      const childStyles = $(child).attr('style') ? $(child).attr('style') : ''
      this.originalStyles.inner.push(childStyles)

      $inner.append(child)
    })

    // Save the inner DOM
    this.$slider = $inner

    // Append controllers
    const $nextCtrl = $(`<a data-action='next'></a>`)
    const $prevCtrl = $(`<a data-action='prev'></a>`)

    // Append indicators
    const $indicators = $('<ol>')
    for (let i = 0; i < this.totalSlide; i++) {
      const $indItem = $(`<li data-goto-slide=${i} data-action='goto'></li>`)
      $indicators.append($indItem)
    }

    this.$el.append($inner).append($indicators).append($prevCtrl).append($nextCtrl)

    // Add style for slider
    this.updateSliderStyle()
    this.udpateActiveSlideStyle()
  }

  /* SETUP EVENT DELEGATION */
  handleClick(e) {
    const action = e.target.dataset.action
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

  handleDragMove(e, data) {
    // Dragging .... (If e.buttons = 0 the mouse is just moving not dragging)
    if (e.buttons === 1 && !this.slideIsMoving) {
      this.clearAutoPlay()

      const translateRange = (data.moveX / this.sliderWidth) * 100    // -30
      const nextTranslateRange = 100 + translateRange                 // => 70
      const prevTranslateRange = -100 + translateRange                // => -130

      const $curr = this.$slider.children().eq(this.opts.curr)

      let { nextIndex } = this.getSlideMovementData('next', this.opts.curr)
      const $next = this.$slider.children().eq(nextIndex)

      // TODO: fix this dummy code
      // This is stupid because the getMovementData return the variable name nextIndex
      nextIndex = this.getSlideMovementData('prev', this.opts.curr).nextIndex
      const prevIndex = nextIndex
      const $prev = this.$slider.children().eq(prevIndex)

      // Move the next n prev slide to the right n left of the curr slide
      // this.translateSlide($next, 100)
      // this.translateSlide($prev, -100)

      // The key is: move all 3 slide! Genius!
      this.translateSlide($prev, prevTranslateRange)
      this.translateSlide($curr, translateRange)
      this.translateSlide($next, nextTranslateRange)
    }
  }

  handleDragStop(e, data) {
    // Turn off draggable until slides move completely
    this.moveByDrag = true

    const MIN_MOUSE_SPEED_TO_MOVE_SLIDE = 1
    const MIN_DISTANCE_RATIO_TO_MOVE_SLIDE = 0.3  // 30%

    const mouseSpeed = data.velocityX
    const distRatio = data.moveX / this.sliderWidth

    // TOTO: Make this block code shorter (Seem unneccessary ?)
    if (mouseSpeed > MIN_MOUSE_SPEED_TO_MOVE_SLIDE || Math.abs(distRatio) > MIN_DISTANCE_RATIO_TO_MOVE_SLIDE) {
      if (distRatio < 0) {
        this.next()
      }
      else if (distRatio > 0) {
        this.prev()
      }
    } else {
      /**
       * This is a bit tricky
       * In case we have to move the slides to the original position, I change the curr slide index to reuse the 
       * next() n prev() functions
       */
      if (distRatio < 0) {
        this.opts.curr += 1
        this.prev()
      }
      else if (distRatio > 0) {
        this.opts.curr -= 1
        this.next()
      }
    }
  }

  /* LOGIC FUNCTION */
  verifyOptions() {
    Object.entries(this.constructor.defaultOptions).forEach(([key, value]) => {
      if (typeof this.opts[key] !== typeof value) {
        this.opts[key] = value
      }
    })

    // Turn off autoPlay if loop is false
    if (!this.opts.loop) this.opts.autoPlay = false

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
    this.updateSliderStyle()

    this.updateSliderCtrlStyle(this.opts.curr)
    this.setAutoPlay()
  }

  setAutoPlay() {
    if (this.opts.autoPlay) {
      const delay = this.opts.autoPlayDelay

      this.clearAutoPlay()
      this.autoTimeoutId = setTimeout(() => {
        this.moveSlide('next')
        this.setAutoPlay()
      }, delay)
    }
  }

  clearAutoPlay() {
    clearTimeout(this.autoTimeoutId)
  }

  /* CONTROLLER FUNCTIONS */
  destroy() {
    // Save all items, remove all classes, inline-style n reverse the original style
    const items = []
    this.$slider.children().each((i, child) => {
      $(child).removeClass(slide).removeClass('active').attr('style', '').attr('style', this.originalStyles.inner[i])
      items.push($(child))
    })

    // Remove class, event handler, data-instance and all children
    // We currently don't change any style of the original element but I stll do .attr(...) for might-exist-problems in the future
    this.$el.removeClass(wrapper).attr('style', '').attr('style', this.originalStyles.wrapper)
    this.$el.off('click', this.handleClick)
    this.$el.data('slider', '')
    this.$el.empty()

    // Append the original item
    for (let item of items) {
      this.$el.append(item)
    }
  }

  getSlideMovementData(direction, currIndex, toIndex) {
    let nextIndex, nextSlidePos, currSlidePos

    if (direction === "next") {
      toIndex ? nextIndex = toIndex : nextIndex = currIndex === this.totalSlide - 1 ? 0 : currIndex + 1
      nextSlidePos = 100
      currSlidePos = -100
    } else if (direction === "prev") {
      // toIndex = 0 is a falsy value
      (toIndex || toIndex === 0) ? nextIndex = toIndex : nextIndex = currIndex === 0 ? this.totalSlide - 1 : currIndex - 1
      nextSlidePos = -100
      currSlidePos = 100
    }

    return { nextIndex, nextSlidePos, currSlidePos }
  }

  moveSlide(direction, toIndex) {
    if (this.slideIsMoving) return
    this.slideIsMoving = true

    const currIndex = this.opts.curr

    const { nextIndex, nextSlidePos, currSlidePos } = this.getSlideMovementData(direction, currIndex, toIndex)

    const $curr = this.$slider.children().eq(currIndex)
    const $next = this.$slider.children().eq(nextIndex)

    if (this.opts.adaptiveHeight) {
      const nextHeight = $next.height()
      this.$slider.css({ height: `${nextHeight}px` })
    }

    if (!this.moveByDrag) {
      // Only move the $next slide to the ready-position in case user does not drag
      this.translateSlide($next, nextSlidePos)
    }

    this.updateSliderCtrlStyle(nextIndex)

    // Move 2 slide contemporary
    const { duration } = this.opts
    setTimeout(() => {
      this.translateSlide($curr, currSlidePos, duration)
      this.translateSlide($next, 0, duration)
      // Do stuffs after slides moving complete
      setTimeout(() => {
        this.setAutoPlay()

        this.moveByDrag = false
        this.slideIsMoving = false
      }, duration)
    }, 20)

    // Update curr index n reset the .active
    this.opts.curr = nextIndex
    this.udpateActiveSlideStyle()
  }

  translateSlide($slide, toX, duration = 0) {
    if (duration) {
      $slide.css({ 'transition': `transform ${duration}ms ease-out` })
    } else {
      $slide.css({ 'transition': '' })
    }

    $slide.css('transform', `translate3d(${toX}%, 0, 0)`)
  }

  next() { this.moveSlide("next") }

  prev() { this.moveSlide("prev") }

  goto(index) {
    if (index > this.opts.curr) {
      this.moveSlide("next", index)
    } else if (index < this.opts.curr) {
      this.moveSlide("prev", index)
    }
  }

  /* STYLE FUNCTIONS */
  updateSliderStyle() {
    const $slides = this.$slider.children()
    const $curr = $slides.eq(this.opts.curr)
    let sliderHeight = $curr.height()

    const { adaptiveHeight, height } = this.opts
    if (!adaptiveHeight) {
      // Slider height = the highest child in case adaptiveHeight is off
      for (let i = 0; i < $slides.length; i++) {
        if ($slides.eq(i).height() > sliderHeight) sliderHeight = $slides.eq(i).height()
      }

      // This below line is to stretch all slide height to equal to the heightest slide
      $slides.css({ 'height': `${sliderHeight}px` })
    }

    this.$slider.addClass(inner).css({ height: `${sliderHeight}px` })
    $slides.addClass(slide)
    $curr.css('transform', 'translate3d(0, 0, 0)')

    const { navStyle } = this.opts
    const { paginationStyle } = this.opts

    this.$el.children('a[data-action="next"]').attr('class', '').attr('class', `${nextCtrl} ${controller} ${navStyle}`)
    this.$el.children('a[data-action="prev"]').attr('class', '').attr('class', `${prevCtrl} ${controller} ${navStyle}`)

    this.$el.children('ol').attr('class', '').attr('class', `${indicators} ${paginationStyle}`)

    // Toggle show/hide nav/pagination
    navStyle === 'none' ? this.$el.children('a').hide() : this.$el.children('a').show()
    paginationStyle === 'none' ? this.$el.children('ol').hide() : this.$el.children('ol').show()
  }

  updateSliderCtrlStyle(index) {
    this.$el.find('a').removeClass('pf-slider-nav-disabled')

    if (index === 0 && !this.opts.loop) {
      this.$el.find(`.${prevCtrl}`).addClass('pf-slider-nav-disabled')
    }
    else if (index === this.totalSlide - 1 && !this.opts.loop) {
      this.$el.find(`.${nextCtrl}`).addClass('pf-slider-nav-disabled')
    }
  }

  udpateActiveSlideStyle() {
    // Add class .active for current active slide n indicator
    const curr = this.opts.curr

    this.$slider.children(`.${slide}.active`).removeClass('active')
    this.$slider.children().eq(curr).addClass('active')

    this.$el.find('li.active').removeClass('active')
    this.$el.find('ol').children().eq(curr).addClass('active')

    this.updateSliderCtrlStyle(curr)
  }
}

// Class properties
SliderController.defaultOptions = {
  curr: 0,
  autoPlay: false,
  autoPlayDelay: 3000,
  duration: 450,
  loop: true,
  paginationStyle: 'pagination-style-1',
  navStyle: 'nav-style-1',
  adaptiveHeight: false,
  height: 350,
}

SliderController.styleOptions = {
  /**
   * The default style is the first array element
   * Add more style (class name) for pagination or nav to these below arrays
   * Remember to keep the 'none' in order to toggle show/hide pagination/nav option
   */
  paginations: ['pagination-style-1', 'pagination-style-2', 'pagination-style-3', 'none'],
  navs: ['nav-style-1', 'nav-style-2', 'nav-style-3', 'nav-style-4', 'nav-style-5', 'none']
}

  // Create jquery plugin
  ; (function ($) {
    $.fn.slider = function (opts, ...args) {
      return this.each((i, element) => {
        let instance = $(element).data('slider')
        if (!instance) {
          if (typeof opts === 'string') {
            throw new Error('This element was not initialized as a Slider yet')
          }
          instance = new SliderController(element, opts)
          $(element).data('slider', instance)
        } else {
          if (typeof opts === 'string') {
            instance[opts](...args)
          }
        }
      })
    }
  })(jQuery)

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
    this.moveLock = false

    // Setup DOM + set event handler
    this.initialize()
    this.$el.on('click', this.handleClick.bind(this))

    // Set up drag n drop event
    this.mouse = { firstX: 0, firstY: 0, lastX: 0, lastY: 0, currX: 0, currY: 0, timeStamp: 0, speed: 0 }
    this.sliderWidth = this.$el.width()

    this.$el.on('mousedown', this.handleMouseDown.bind(this))
    this.$el.on('mousemove', this.handleMouseMove.bind(this))
    this.$el.on('es_dragstop', this.handleMouseUp.bind(this))

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

  handleMouseDown(e) {
    this.mouse.firstX = e.pageX
    this.mouse.firstY = e.pageY
    this.mouse.lastX = e.pageX
    this.mouse.lastY = e.pageY
    this.mouse.timeStamp = Date.now()
  }

  setMouseSpeed(pageX, pageY) {
    const time = Date.now() - this.mouse.timeStamp
    this.mouse.timeStamp = Date.now()

    this.mouse.speed = calculateSpeed(this.mouse.lastX, this.mouse.lastY, pageX, pageY, time)
    this.mouse.lastX = pageX
    this.mouse.lastY = pageY
  }

  handleMouseMove(e) {
    // Dragging .... (If e.buttons = 0 the mouse is just moving not dragging)
    if (e.buttons === 1) {
      // this.setMouseSpeed(e.pageX, e.pageY)

      const translateRange = ((e.pageX - this.mouse.lastX) / this.sliderWidth) * 100       // -30
      const currTranslateRange = `${Number(translateRange).toString()}%`                   // => '-30%'
      const nextTranslateRange = `${Number(100 + translateRange).toString()}%`             // => '70%'
      const prevTranslateRange = `${Number(-100 + translateRange).toString()}%`            // => '-130%'

      const $curr = this.$slider.children().eq(this.opts.curr)

      let { nextIndex } = getSlideMovementData('next', this.opts.curr, undefined, this.totalSlide)
      const $next = this.$slider.children().eq(nextIndex)

      // TODO: fix this dummy code
      // This is stupid because the getMovementData return the variable name nextIndex
      nextIndex = getSlideMovementData('prev', this.opts.curr, undefined, this.totalSlide).nextIndex
      const prevIndex = nextIndex
      const $prev = this.$slider.children().eq(prevIndex)

      // Move the next n prev slide to the right n left of the curr slide
      this.translateSlide($next, '100%')
      this.translateSlide($prev, '-100%')

      // The key is: move all 3 slide! Genius!
      this.translateSlide($prev, prevTranslateRange)
      this.translateSlide($curr, currTranslateRange)
      this.translateSlide($next, nextTranslateRange)
    }
  }

  handleMouseUp(e, data) {
    console.log('dragEnd', data)
    // console.log(e.pageX, e.pageY)
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

  moveSlide(direction, toIndex) {
    const currIndex = this.opts.curr
    const { nextIndex, nextSlideX, currSlideX } = getSlideMovementData(direction, currIndex, toIndex, this.totalSlide)

    const $curr = this.$slider.children().eq(currIndex)
    const $next = this.$slider.children().eq(nextIndex)

    if (this.opts.adaptiveHeight) {
      const nextHeight = $next.height()
      this.$slider.css({ height: `${nextHeight}px` })
    }

    this.translateSlide($next, nextSlideX)

    const duration = this.opts.duration
    this.updateSliderCtrlStyle(nextIndex)

    setTimeout(() => {
      this.translateSlide($curr, currSlideX, duration)
      this.translateSlide($next, 0, duration)
      setTimeout(() => {
        this.setAutoPlay()
        this.moveLock = false
      }, duration)
    }, 20)

    this.opts.curr = nextIndex
    this.udpateActiveSlideStyle()
  }

  translateSlide($slide, slideX, duration = 0) {
    if (duration) {
      $slide.css({ 'transition': `transform ${duration}ms ease-in-out` })
    } else {
      $slide.css({ 'transition': '' })
    }

    $slide.css('transform', `translate3d(${slideX}, 0, 0)`)
  }

  next() {
    if (this.moveLock) return
    this.clearAutoPlay()
    this.moveLock = true
    this.moveSlide("next")
  }

  prev() {
    if (this.moveLock) return
    this.clearAutoPlay()
    this.moveLock = true
    this.moveSlide("prev")
  }

  goto(index) {
    this.clearAutoPlay()

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

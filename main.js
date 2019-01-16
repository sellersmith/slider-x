// import { SliderClasses, getSlideMovementData } from './helpers'
// require('./draggable')
// let $ = window.jQuery

const { wrapper, inner, slide, indicators, controller, nextCtrl, prevCtrl, disabledCtrl, turnOffMouseEvent } = SliderClasses

class PageFlySliderController {
  constructor(ele, opts) {
    this.el = ele
    this.originalStyles = { wrapper: '', inner: [] }

    // Create an observer to observe any style's change of slider (this is for updating height)
    // NOTE: this doesn't work on IE < 11 
    // this.styleObserver = new MutationObserver(this.handleStyleChange.bind(this))
    // this.styleObserver.observe(this.el, { attributes: true, attributeFilter: ['style', 'class'] })

    this.$el = $(this.el) // The original element
    this.$slider = null // The .inner div that wrap all slides
    this.sliderHeight = this.$el.height()
    this.sliderWidth = null

    this.totalSlide = this.$el.children().length
    this.opts = $.extend({}, opts) // Each slider's opts is a specific instance of opts argument

    this.autoPlayTimeoutId = ''

    this.initialize()
  }

  getWrapperWidthThenInit() {
    // Remove string url("")
    const { $el } = this
    const sliderBackgroundImg = $el.css('background-image').slice(4, -1).replace(/"/g, "")
    let wrapperWidth

    const tempImg = new Image()
    tempImg.src = sliderBackgroundImg
    tempImg.onload = () => {
      wrapperWidth = $el.width()
      this.sliderWidth = wrapperWidth
      this.initialize()
      console.log(9696, this.sliderWidth)
    }
  }

  initialize() {
    this.opts.curr = 0
    this.verifyOptions()

    // Setup DOM + set event handler
    this.$el.on('click', this.handleClick.bind(this))

    this.setupSliderDOM()

    // Set up drag n drop event
    this.moveByDrag = false
    this.missingSlidesOnDrag = false // For dragging multiple slides
    this.$slider.on('es_dragmove', this.handleDragMove.bind(this))
    this.$slider.on('es_dragstop', this.handleDragStop.bind(this))

    this.setAutoPlay()
    $(window).resize((e) => this.handleResize(e))

    // Set slider-instance data
    this.$el.data('pf-slider-x', this)
    this.$el.attr('data-slider-x-init', 'init-ed')

    console.info("New PageFly Slider initialized!!!", this)
    return this
  }

  setupSliderDOM() {
    const { $el } = this

    $el.addClass(wrapper)
    // Save original styles
    this.originalStyles.wrapper = $el.attr('style') ? $el.attr('style') : ''

    // Create an inner div to wrap all slide item
    const $inner = $(`<div></div>`)
    $el.children().each((i, child) => {
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
    $el.append($inner).append($indicators).append($prevCtrl).append($nextCtrl)

    this.cloneSlide()

    // Wait for the background image load complete then update the Slider style
    // Remove string url("")
    const sliderBackgroundImg = $el.css('background-image').slice(4, -1).replace(/"/g, "")
    if (!sliderBackgroundImg) {
      this.sliderWidth = $el.width()
      // Add style for slider
      this.updateSliderStyle()
      this.udpateActiveSlideStyle()
    }
    else {
      const tempImg = new Image()
      tempImg.src = sliderBackgroundImg
      tempImg.onload = () => {
        this.sliderWidth = $el.width()
        // Add style for slider
        this.updateSliderStyle()
        this.udpateActiveSlideStyle()
      }
    }

    // Save slider height
    // this.sliderHeight = this.
  }

  cloneSlide() {
    const { length } = this.$slider.children()

    for (let i = 0; i < length; i++) {
      const $slide = this.$slider.children().eq(i)
      $slide.clone().attr('data-slide-clone', true).appendTo(this.$slider)
    }
    for (let i = 0; i < length; i++) {
      const $slide = this.$slider.children().eq(i)
      $slide.clone().attr('data-slide-clone', true).appendTo(this.$slider)
    }
  }

  /* SETUP EVENT DELEGATION */
  handleResize(e) {
    const { curr, slidesToShow, gutter } = this.opts
    let { totalSlide } = this
    totalSlide *= 3

    const newSlideWidth = calculatePFSlideSize(this)
    const $slides = this.$slider.children()
    $slides.css({ width: `${newSlideWidth}px`, transition: '' })

    $slides.eq((curr + slidesToShow) % totalSlide).css({ transform: `translate3d(${this.$slider.width()}px, 0, 0)` })
    $slides.eq((totalSlide + (curr - 1)) % totalSlide).css({ transform: `translate3d(${- newSlideWidth - gutter}px, 0, 0)` })

    for (let i = curr; i < curr + slidesToShow; i++) {
      const $slide = $slides.eq(i % totalSlide)
      $slide.css({ transform: `translate3d(${(newSlideWidth + gutter) * (i - curr)}px, 0, 0)` })
    }

    this.sliderWidth = this.$el.width()
  }

  handleClick(e) {
    const action = e.target.getAttribute('data-action')
    switch (action) {
      case 'next': this.next(); break
      case 'prev': this.prev(); break
      case 'goto':
        // DOMStringMap convert dataset from hyphen style to upperCase (goto-slide => gotoSlide)
        const index = parseInt(e.target.getAttribute('data-goto-slide')) || 0
        this.goto(index)
        break
      default: console.log('Slider clicked')
    }
  }

  handleStyleChange(mutations) {
    // Currently: We can only detect the inline style change, if you append a class that have a height property 
    // the slider height will not update
    // We will update this bug asap

    mutations.forEach((mut) => {
      const height = $(mut.target).height()
      if (height !== this.opts.height) {
        this.updateOptions({ height })
      }
    })
  }

  handleDragMove(e, data) {
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
      const $slide = this.$slider.children().eq(slide.index)
      this.translateSlide($slide, slide.readyX + translateRange)
    }
    for (let slide of currSlidesPos) {
      const $slide = this.$slider.children().eq(slide.index)
      this.translateSlide($slide, slide.readyX + translateRange)
    }
    for (let slide of nextSlidesReadyPos) {
      const $slide = this.$slider.children().eq(slide.index)
      this.translateSlide($slide, slide.readyX + translateRange)
    }
  }

  handleDragStop(e, data) {
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
    this.clearAutoPlay()
    // Remove all cloned slides
    this.$slider.find('*[data-slide-clone=true]').remove()

    // Save all items, remove all classes, inline-style n reverse the original style
    const items = []
    this.$slider.children().each((i, child) => {
      $(child).removeClass(slide).removeClass('active').attr('style', '').attr('style', this.originalStyles.inner[i])
      items.push($(child))
    })

    // Remove class, event handler, data-instance and all children
    // We currently don't change any style of the original element but I stll do .attr(...) for might-exist-problems in the future
    this.$el.removeClass(wrapper).attr('style', '').attr('style', this.originalStyles.wrapper)
    this.$el.off('click')
    this.$el.attr('data-slider-x-init', null)
    this.$el.data('pf-slider-x', null)
    this.$el.data('pf-slider-initialized', null)
    this.$el.empty()

    // Append the original item
    for (let item of items) { this.$el.append(item) }

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
    this.$el.addClass(turnOffMouseEvent)

    const { nextIndex, nextSlidesReadyPos, currSlidesNewPos, nextSlidesNewPos } = getPFSlideMovementData(this, direction, toIndex)
    // console.log(nextSlidesReadyPos, currSlidesNewPos, nextSlidesNewPos)

    // if (this.opts.adaptiveHeight) {
    //   const nextHeight = $next.height()
    //   this.$slider.css({ height: `${nextHeight}px` })
    // }

    if (!this.moveByDrag) {
      // Only move the $next slide to the ready-position in case user does not drag
      for (let slide of nextSlidesReadyPos) {
        const $slide = this.$slider.children().eq(slide.index)
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
          const $slide = this.$slider.children().eq(slide.index)
          this.translateSlide($slide, slide.newX, duration)
        }
      }

      for (let slide of nextSlidesNewPos) {
        const $slide = this.$slider.children().eq(slide.index)
        this.translateSlide($slide, slide.newX, duration)
      }

      // Do stuffs after slides moving complete
      setTimeout(() => {
        this.setAutoPlay()
        this.$el.removeClass(turnOffMouseEvent)
        this.moveByDrag = false
        this.missingSlidesOnDrag = false
      }, duration)
    }, 50)

    // Update curr index n reset the .active
    this.opts.curr = nextIndex
    this.udpateActiveSlideStyle()
  }

  translateSlide($slide, toX, duration) {
    if (duration) {
      $slide.css({ 'transition': `transform ${duration}ms linear` })
    } else {
      $slide.css({ 'transition': '' })
    }

    $slide.css('transform', `translate3d(${toX}px, 0, 0)`)
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
    const slideWidth = calculatePFSlideSize(this)

    const { adaptiveHeight, height } = this.opts
    if (!adaptiveHeight) {
      // Slider height = the highest child in case adaptiveHeight is off
      // for (let i = 0; i < $slides.length; i++) {
      //   if ($slides.eq(i).height() > sliderHeight) sliderHeight = $slides.eq(i).height()
      // }

      // Stretch all slide height to equal to the heightest slide
      $slides.css({ 'height': '100%', width: `${slideWidth}px` })
      this.$slider.css({ 'height': '100%', 'transition': '' })
      this.$el.css({ 'transition': '' })
    } else {
      $slides.css({ 'height': '' })

      this.$el.css('transition', `height ${this.opts.duration}ms ease-in-out`)
      this.$slider.css('transition', `height ${this.opts.duration}ms ease-in-out`)

      this.$el.css('height', '')
      this.$slider.css('height', `${$curr.height()}px`)
    }

    $slides.addClass(slide)
    const { gutter } = this.opts

    for (let i = 0; i < $slides.length; i++) {
      const slideX = i * (slideWidth + gutter)
      $slides.eq(i).css({ transform: `translate3d(${slideX}px, 0, 0)` })
    }

    // $curr.css('transform', 'translate3d(0, 0, 0)')

    this.$slider.addClass(inner)
    this.opts.draggable ? this.$slider.addClass('jsn-es-draggable') : this.$slider.removeClass('jsn-es-draggable')

    // Styling for navigators and indicators
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
    this.$el.find('a').removeClass(disabledCtrl)

    if (index === 0 && !this.opts.loop) {
      this.$el.find(`.${prevCtrl}`).addClass(disabledCtrl)
    }
    else if (index === this.totalSlide - 1 && !this.opts.loop) {
      this.$el.find(`.${nextCtrl}`).addClass(disabledCtrl)
    }
  }

  udpateActiveSlideStyle() {
    // Add class .active for current active slide n indicator
    const curr = this.opts.curr

    this.$slider.children(`.${slide}.active`).removeClass('active')
    this.$slider.children().eq(curr).addClass('active')

    this.$el.find('li.active').removeClass('active')
    this.$el.find('ol').find(`li[data-goto-slide="${curr % this.totalSlide}"]`).addClass('active')

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

function init(jQuery) {
  $ = jQuery
  jQuery.fn.pageflySlider = function (opts, ...args) {
    return this.each((i, element) => {
      let instance = jQuery(element).data('pf-slider-x')
      if (!instance) {
        if (typeof opts === 'string') {
          throw new Error('This element was not initialized as a Slider yet')
        }
        instance = new PageFlySliderController(element, opts)
        jQuery(element).attr('data-slider-x-init', 'init-ed')
        jQuery(element).data('pf-slider-x', instance)
        jQuery(element).data('pf-slider-initialized', true)
      } else {
        if (typeof opts === 'string') {
          instance[opts](...args)
        }
      }
    })
  }
}

if (typeof jQuery !== 'undefined') {
  init(jQuery)
}

// export default init
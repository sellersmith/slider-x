import { SliderClasses, getSlideMovementData } from './helpers'
require('./draggable')
let $ = window.jQuery
const { wrapper, inner, slide, indicators, controller, nextCtrl, prevCtrl, disabledCtrl, turnOffMouseEvent } = SliderClasses

class SliderController {
  constructor(ele, opts) {
    this.el = ele
    this.originalStyles = { wrapper: '', inner: [] }

    // Create an observer to observe any style's change of slider (this is for updating height)
    // NOTE: this doesn't work on IE < 11 
    // this.styleObserver = new MutationObserver(this.handleStyleChange.bind(this))
    // this.styleObserver.observe(this.el, { attributes: true, attributeFilter: ['style', 'class'] })

    this.$el = $(this.el) // The original element
    this.$slider = '' // The .inner div that wrap all slide
    this.sliderHeight = this.$el.height()
    this.sliderWidth = this.$el.width()

    this.totalSlide = this.$el.children().length
    this.opts = $.extend({}, opts) // Each slider's opts is a specific instance of opts argument

    this.autoPlayTimeoutId = ''

    // Setup DOM + set event handler
    this.initialize()
    this.$el.on('mousedown', this.handleMouseDown.bind(this))

    // Set up drag n drop event
    this.moveByDrag = false

    this.$slider.on('es_dragmove', this.handleDragMove.bind(this))
    this.$slider.on('es_dragstop', this.handleDragStop.bind(this))

    console.log(this)
  }

  initialize() {
    this.verifyOptions()
    this.setupSliderDOM()
    this.setAutoPlay()
    return this
  }

  setupSliderDOM() {
    this.$el.addClass(wrapper)
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

    // Save slider height
    // this.sliderHeight = this.
  }

  /* SETUP EVENT DELEGATION */
  handleMouseDown(e) {
    // e.stopPropagation()
    // e.preventDefault()

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
    if (Math.abs(data.moveX) < SliderController.constructor.MIN_DRAG_DISTANCE) return
    this.clearAutoPlay()

    const translateRange = (data.moveX / this.sliderWidth) * 100    // -30
    const nextTranslateRange = 100 + translateRange                 // => 70
    const prevTranslateRange = -100 + translateRange                // => -130

    const { curr } = this.opts
    const $curr = this.$slider.children().eq(curr)

    let { nextIndex } = getSlideMovementData(this, 'next')
    const $next = this.$slider.children().eq(nextIndex)

    // TODO: fix this dummy code
    // This is stupid because the getMovementData return the variable name nextIndex
    nextIndex = getSlideMovementData(this, 'prev').nextIndex
    const prevIndex = nextIndex
    const $prev = this.$slider.children().eq(prevIndex)

    // Drag is forbidden in these below cases:
    if (curr === 0 && !this.opts.loop && translateRange > 0) return
    if (curr === this.totalSlide - 1 && !this.opts.loop && translateRange < 0) return

    // The key is: move all 3 slide! Genius!
    this.translateSlide($prev, prevTranslateRange)
    this.translateSlide($curr, translateRange)
    this.translateSlide($next, nextTranslateRange)
  }

  handleDragStop(e, data) {
    if (Math.abs(data.moveX) < SliderController.constructor.MIN_DRAG_DISTANCE) return
    // Turn off draggable until slides move completely
    this.moveByDrag = true

    const MIN_MOUSE_SPEED_TO_MOVE_SLIDE = 1
    const MIN_DISTANCE_RATIO_TO_MOVE_SLIDE = 0.3  // 30%

    const mouseSpeed = data.velocityX
    const distRatio = data.moveX / this.sliderWidth

    let direction = ''
    let duration

    // TOTO: Make this block code shorter (Seem unneccessary ?)
    if (mouseSpeed > MIN_MOUSE_SPEED_TO_MOVE_SLIDE || Math.abs(distRatio) > MIN_DISTANCE_RATIO_TO_MOVE_SLIDE) {
      duration = this.opts.duration - Math.abs(distRatio) * this.opts.duration

      if (distRatio < 0) direction = 'next'
      else if (distRatio > 0) direction = 'prev'
    } else {
      duration = Math.abs(distRatio) * this.opts.duration
      /**
       * This is a bit tricky
       * In case we have to move the slides to the original position, I change the curr slide index to reuse the 
       * next() n prev() functions
       */
      if (distRatio < 0) {
        this.opts.curr += 1
        direction = 'prev'
      }
      else if (distRatio > 0) {
        this.opts.curr -= 1
        direction = 'next'
      }
    }

    // Dummy: the moveSlide() need toIndex as the 2nd argument
    const toIndex = undefined

    this.moveSlide(direction, toIndex, duration)
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
    // Save all items, remove all classes, inline-style n reverse the original style
    const items = []
    this.$slider.children().each((i, child) => {
      $(child).removeClass(slide).removeClass('active').attr('style', '').attr('style', this.originalStyles.inner[i])
      items.push($(child))
    })

    // Remove class, event handler, data-instance and all children
    // We currently don't change any style of the original element but I stll do .attr(...) for might-exist-problems in the future
    this.$el.removeClass(wrapper).attr('style', '').attr('style', this.originalStyles.wrapper)
    this.$el.off('click', this.handleMouseDown)
    this.$el.data('pf-slider-x', null)
    this.$el.data('pf-slider-initialized', null)
    this.$el.empty()

    // Append the original item
    for (let item of items) {
      this.$el.append(item)
    }
  }

  moveSlide(direction, toIndex, customDuration) {
    this.clearAutoPlay()
    // Move slide if forbidden in the 1st n last slide if Slider movement is not loop
    const currIndex = this.opts.curr
    if (
      (direction === 'prev' && currIndex === 0 && !this.opts.loop)
      ||
      (direction === 'next' && currIndex === (this.totalSlide - 1) && !this.opts.loop)
    ) return

    this.$el.addClass(turnOffMouseEvent)

    const { nextIndex, nextSlidePos, currSlidePos } = getSlideMovementData(this, direction, toIndex)

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
    let duration = customDuration ? customDuration : this.opts.duration

    setTimeout(() => {
      this.translateSlide($curr, currSlidePos, duration)
      this.translateSlide($next, 0, duration)
      // Do stuffs after slides moving complete
      setTimeout(() => {
        this.setAutoPlay()
        this.$el.removeClass(turnOffMouseEvent)
        this.moveByDrag = false
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

    const { adaptiveHeight, height } = this.opts
    if (!adaptiveHeight) {
      // Slider height = the highest child in case adaptiveHeight is off
      // for (let i = 0; i < $slides.length; i++) {
      //   if ($slides.eq(i).height() > sliderHeight) sliderHeight = $slides.eq(i).height()
      // }

      // Stretch all slide height to equal to the heightest slide
      $slides.css({ 'height': '100%' })
      this.$slider.css({
        'height': '100%',
        'transition': ''
      })
      this.$el.css({
        'transition': ''
      })
    } else {
      $slides.css({ 'height': '' })

      this.$el.css('transition', `height ${this.opts.duration}ms ease-in-out`)
      this.$slider.css('transition', `height ${this.opts.duration}ms ease-in-out`)

      this.$el.css('height', '')
      this.$slider.css('height', `${$curr.height()}px`)
    }

    $slides.addClass(slide)
    $curr.css('transform', 'translate3d(0, 0, 0)')

    this.$slider.addClass(inner)
    this.opts.draggable ? this.$slider.addClass('jsn-es-draggable') : this.$slider.removeClass('jsn-es-draggable')

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
    this.$el.find('ol').children().eq(curr).addClass('active')

    this.updateSliderCtrlStyle(curr)
  }
}

// Class properties
SliderController.constructor.MIN_DRAG_DISTANCE = 5

SliderController.defaultOptions = {
  curr: 0,
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

SliderController.styleOptions = {
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
  jQuery.fn.slider = function (opts, ...args) {
    return this.each((i, element) => {
      let instance = jQuery(element).data('pf-slider-x')
      if (!instance) {
        if (typeof opts === 'string') {
          throw new Error('This element was not initialized as a Slider yet')
        }
        instance = new SliderController(element, opts)
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
export default init



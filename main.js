const { wrapper, inner, slide, indicators, indicatorItem, controller, nextCtrl, prevCtrl, disabledCtrl } = DomClasses

class SliderController {
  constructor(ele, opts) {
    this.el = ele
    this.originalStyles = {}

    this.$el = $(this.el) // The original element
    this.$slider = '' // The .inner div that wrap all slide

    this.totalSlide = this.$el.children().length
    this.opts = Object.assign({}, opts) // Each slider's opts is a specific instance of opts argument

    this.autoTimeoutId = ''
    this.moveLock = false

    // Update DOM + set event handler
    this.initialize()
    this.$el.on('click', this.handleClick.bind(this))
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

    // Create an inner div to wrap all slide item
    const $inner = $(`<div class=${inner}></div>`)
    this.$el.children().each((i, child) => {
      $(child).addClass(slide)
      if (i === this.opts.curr) {
        $(child).css('left', '0')
      }
      $inner.append(child)
    })

    // Save the inner DOM
    this.$slider = $inner

    // Append controllers
    const $nextCtrl = $(`<a class='${nextCtrl} ${controller} nav-style-1' data-action='next'></a>`)
    const $prevCtrl = $(`<a class='${prevCtrl} ${controller} nav-style-1' data-action='prev'></a>`)

    // Append indicators
    const $indicators = $(`<ol class='${indicators} pagination-style-1'></ol>`)
    for (let i = 0; i < this.totalSlide; i++) {
      const $indItem = $(`<li data-goto-slide=${i} data-action='goto'></li>`)
      $indicators.append($indItem)
    }

    this.$el.append($inner).append($indicators).append($prevCtrl).append($nextCtrl)

    // Set the .active class
    this.updateSliderDOM()
  }

  verifyOptions() {
    Object.entries(this.constructor.defaultOptions).forEach(([key, value]) => {
      if (typeof this.opts[key] !== typeof value) {
        this.opts[key] = value
      }
    })

    // Turn off autoPlay if loop is false
    if (!this.opts.loop) this.opts.autoPlay = false
  }

  updateOptions(newOtps) {
    const { defaultOptions } = this.constructor

    for (let key in newOtps) {
      // The type of newOpts values must be legal
      // And update 'curr' key is forbidden
      if (typeof newOtps[key] === typeof defaultOptions[key] && key !== 'curr') {
        this.opts[key] = newOtps[key]
      }
    }

    // Turn off autoPlay if loop is false
    if (!this.opts.loop) this.opts.autoPlay = false

    this.updateSliderCtrlDOM(this.opts.curr)
    this.setAutoPlay()
  }

  updateSliderCtrlDOM(index) {
    this.$el.find('a').removeClass('pf-slider-nav-disabled')

    if (index === 0 && !this.opts.loop) {
      this.$el.find(`.${prevCtrl}`).addClass('pf-slider-nav-disabled')
    }
    else if (index === this.totalSlide - 1 && !this.opts.loop) {
      this.$el.find(`.${nextCtrl}`).addClass('pf-slider-nav-disabled')
    }
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

  destroy() {
    // Save all items, remove all classes on them
    const items = []
    this.$slider.children().each((i, child) => {
      $(child).removeClass(slide)
      items.push($(child))
    })

    // Remove class, event handler, data-instance and all children
    this.$el.removeClass(wrapper)
    this.$el.off('click', this.handleClick)
    this.$el.data('slider', '')
    this.$el.empty()

    // Append the original item
    for (let item of items) {
      this.$el.append(item)
    }

    // !TODO!: remove all inline css (transition, left...)
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

  moveSlide(direction, toIndex) {
    let currIndex = this.opts.curr
    let { nextIndex, nextSlidePos, currSlidePos } = getSlideMovementData(direction, currIndex, toIndex, this.totalSlide)

    let $curr = this.$slider.children().eq(currIndex)
    let $next = this.$slider.children().eq(nextIndex)

    $next.css({ 'transition': '' })
    $next.css('left', nextSlidePos)
    // $next.css('transform', `translate3d(${nextSlidePos}px, 0, 0)`)

    const duration = this.opts.duration
    this.updateSliderCtrlDOM(nextIndex)

    setTimeout(() => {
      $curr.css({ 'transition': `left ${duration}ms ease-in-out`, 'left': currSlidePos })
      $next.css({ 'transition': `left ${duration}ms ease-in-out`, 'left': '0' })
      setTimeout(() => {
        this.setAutoPlay()
        this.moveLock = false
      }, duration)
    }, 20)

    this.opts.curr = nextIndex
    this.updateSliderDOM()
  }

  updateSliderDOM() {
    // Add class .active for current active slide n indicator
    const curr = this.opts.curr

    this.$slider.children(`.${slide}.active`).removeClass('active')
    this.$slider.children().eq(curr).addClass('active')

    this.$el.find('li.active').removeClass('active')
    this.$el.find('ol').children().eq(curr).addClass('active')

    this.updateSliderCtrlDOM(curr)
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
}

SliderController.defaultOptions = {
  curr: 0,
  autoPlay: false,
  autoPlayDelay: 3000,
  duration: 450,
  loop: true
}
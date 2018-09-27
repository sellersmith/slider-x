const { wrapper, inner, slide, indicators, indicatorItem, controller, nextCtrl, prevCtrl } = DomClasses

class SliderController {
  constructor(ele, opts) {
    this.el = ele
    this.$el = $(this.el)
    this.$slider = ''

    this.totalSlide = this.$el.children().length

    this.opts = opts
    this.defaultOpts = {
      autoPlay: false,
      autoPlayDelay: 3000,
      duration: 450
    }

    this.autoTimeoutId = ''
    this.active = false
    this.curr = 0
    this.duration = this.opts.duration || this.defaultOpts.duration

    // update DOM + set event handler
    this.initialize()
    this.$el.on('click', this.handleClick.bind(this))
  }

  initialize() {
    console.log("Init new PF Slider")

    this.updateSliderDOM()
    this.setAutoPlay()
    console.log(this)
    return this
  }

  updateSliderDOM() {
    this.$el.addClass(wrapper)

    // create an inner div to wrap all slide item
    const $inner = $(`<div class=${inner}></div>`)
    this.$el.children().each((i, child) => {
      $(child).addClass(slide)
      if (i === this.curr) {
        $(child).css('left', '0')
      }
      $inner.append(child)
    })

    // save the inner DOM
    this.$slider = $inner

    // append controllers
    const $nextCtrl = $(`<a class='${nextCtrl} ${controller}' data-action='next'>Next</a>`)
    const $prevCtrl = $(`<a class='${prevCtrl} ${controller}' data-action='prev'>Prev</a>`)

    // append indicators
    const $indicators = $(`<ol class='${indicators}'></ol>`)
    for (let i = 0; i < this.totalSlide; i++) {
      const $indItem = $(`<li data-goto-slide=${i}  data-action='goto'></li>`)
      $indicators.append($indItem)
    }

    this.$el.append($inner).append($indicators).append($prevCtrl).append($nextCtrl)
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

  setAutoPlay() {
    if (this.opts.autoPlay) {
      const delay = this.opts.autoPlayDelay || this.defaultOpts.autoPlayDelay

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
    let currIndex = this.curr
    let { nextIndex, nextSlidePos, currSlidePos } = getSlideMovementData(direction, currIndex, toIndex, this.totalSlide)

    let $curr = this.$slider.children().eq(currIndex)
    let $next = this.$slider.children().eq(nextIndex)

    $next.css({ 'transition': '' })
    $next.css('left', nextSlidePos)

    const duration = this.opts.duration || this.defaultOpts.duration

    setTimeout(() => {
      $curr.css({ 'transition': `left ${duration}ms ease-in-out`, 'left': currSlidePos })
      $next.css({ 'transition': `left ${duration}ms ease-in-out`, 'left': '0' })
      setTimeout(() => {
        this.setAutoPlay()
        this.active = false
      }, this.duration)
    }, 20)

    this.curr = nextIndex
  }

  next() {
    if (this.active) return
    this.clearAutoPlay()
    this.active = true
    this.moveSlide("next")
  }

  prev() {
    if (this.active) return
    this.clearAutoPlay()
    this.active = true
    this.moveSlide("prev")
  }

  goto(index) {
    this.clearAutoPlay()

    if (index > this.curr) {
      this.moveSlide("next", index)
    } else if (index < this.curr) {
      this.moveSlide("prev", index)
    }
  }
}
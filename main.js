class SliderController {
  constructor(ele, opts) {
    this.el = ele
    this.$el = $(this.el)
    this.totalChild = this.$el.children().length

    this.opts = opts
    this.defaultOpts = {
      autoPlay: false,
      autoPlayDelay: 3000,
      duration: 400
    }

    this.autoTimeoutId = ''
    this.active = false
    this.curr = 0
    this.duration = this.opts.duration || this.defaultOpts.duration
    this.initialize(this.el, this.opts)
  }

  autoPlay() {
    const delay = this.opts.autoPlayDelay || this.defaultOpts.autoPlayDelay

    this.autoTimeoutId = setTimeout(() => {
      this.moveSlide('next')
      clearTimeout(this.autoTimeoutId)
      this.autoPlay()
    }, delay)
  }

  clearAutoPlay() {
    clearTimeout(this.autoTimeoutId)
  }

  initialize() {
    console.log("Init new PF Slider")

    const currIndex = this.curr
    this.$el.addClass('slider')

    this.$el.children().each((i, child) => {
      $(child).addClass('slide')
      if (i === currIndex) {
        $(child).css('left', '0')
      }
    })

    $('<button>').text('Next').insertAfter(this.el).click(() => this.next.apply(this))
    $('<button>').text('Prev').insertAfter(this.el).click(() => this.prev.apply(this))


    // Set slide auto play
    if (this.opts.autoPlay) {
      this.autoPlay()
    }

    console.log(this)
    return this
  }

  next() {
    if (this.active) return
    this.active = true
    this.clearAutoPlay()

    // move slide then re-set the auto-play
    this.moveSlide("next", undefined, () => {
      setTimeout(() => {
        if(this.opts.autoPlay) this.autoPlay()
        this.active = false
      }, this.duration)
    })
  }

  prev() {
    if (this.active) return
    this.active = true
    this.clearAutoPlay()

    // move slide then re-set the auto-play
    this.moveSlide("prev", undefined, () => {
      setTimeout(() => {
        if(this.opts.autoPlay) this.autoPlay()
        this.active = false
      }, this.duration)
    })
  }

  moveSlide(direction, toIndex, callback) {
    let currIndex = this.curr
    let { nextIndex, nextSlidePos, currSlidePos } = getSlideMovementData(direction, currIndex, toIndex, this.totalChild)

    let $curr = this.$el.children().eq(currIndex)
    let $next = this.$el.children().eq(nextIndex)

    $next.css({'transition':  '' })
    $next.css('left', nextSlidePos)

    setTimeout(() => {
      $curr.css({'transition': `left ${this.duration}ms ease-in-out` , 'left':  currSlidePos})
      $next.css({'transition': `left ${this.duration}ms ease-in-out` , 'left':  '0'})
      callback && callback()
    }, 20)

    this.curr = nextIndex
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
class SliderController {
  constructor(ele, opts) {
    this.el = ele
    this.$el = $(this.el)
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
    this.initialize(this.el, this.opts)
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

    this.setAutoPlay()

    console.log(this)
    return this
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

  moveSlide(direction, toIndex) {
    let currIndex = this.curr
    let { nextIndex, nextSlidePos, currSlidePos } = getSlideMovementData(direction, currIndex, toIndex, this.totalSlide)

    let $curr = this.$el.children().eq(currIndex)
    let $next = this.$el.children().eq(nextIndex)

    $next.css({ 'transition': '' })
    $next.css('left', nextSlidePos)

    setTimeout(() => {
      $curr.css({ 'transition': `left ${this.duration}ms ease-in-out`, 'left': currSlidePos })
      $next.css({ 'transition': `left ${this.duration}ms ease-in-out`, 'left': '0' })
      setTimeout(() => {
        this.setAutoPlay()
        this.active = false
      }, this.duration)
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
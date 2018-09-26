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

    return this
  }

  next() {
    if (this.active) return
    this.active = true

    // clear auto play
    clearTimeout(this.autoTimeoutId)

    // move slide then re-set the auto-play
    this.moveSlide("next", () => {
      setTimeout(() => {
        if(this.opts.autoPlay) this.autoPlay()
        this.active = false
      }, this.duration)
    })
  }

  prev() {
    if (this.active) return
    this.active = true
    // clear auto play
    clearTimeout(this.autoTimeoutId)

    // move slide then re-set the auto-play
    this.moveSlide("prev", () => {
      this.moveSlide("next", () => {
        setTimeout(() => {
          if(this.opts.autoPlay) this.autoPlay()
          this.active = false
        }, this.duration)
      })
    })
  }

  moveSlide(direction, callback) {
    let currIndex = this.curr
    let nextIndex, nextSlidePos, currSlidePos

    // Find out currSlide n nextSlide
    if (direction === "next") {
      nextIndex = currIndex === (this.totalChild - 1) ? 0 : currIndex + 1
      nextSlidePos = '100%'
      currSlidePos = '-100%'
    } else if (direction === "prev") {
      nextIndex = currIndex === 0 ? (this.totalChild - 1) : currIndex - 1
      nextSlidePos = '-100%'
      currSlidePos = '100%'
    }

    let $curr = this.$el.children().eq(currIndex)
    let $next = this.$el.children().eq(nextIndex)

    $next.css({'transition':  '' })
    $next.css('left', nextSlidePos)

    setTimeout(() => {
      $curr.css({'transition': `left ${this.duration}ms linear` , 'left':  currSlidePos})
      $next.css({'transition': `left ${this.duration}ms linear` , 'left':  '0'})
      callback && callback()
    }, 20)

    this.curr = nextIndex
  }
}